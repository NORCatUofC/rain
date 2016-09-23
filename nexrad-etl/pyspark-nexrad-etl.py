import os, zlib, re, time, csv
import numpy as np
from numpy import ma
from io import BytesIO
from datetime import datetime
from boto.s3.connection import S3Connection
from pyspark import SparkConf, SparkContext
from pyspark.sql import SQLContext
from pyspark.sql.types import *

spark_conf = SparkConf().setAppName('NexradETL')
sc = SparkContext(conf=spark_conf)
sqlContext = SQLContext(sc)

conn = S3Connection(os.getenv('AWS_ACCESS_KEY_ID'),os.getenv('AWS_SECRET_ACCESS_KEY'))
bucket = conn.get_bucket('noaa-nexrad-level2')

# Read KLOT keys manually
klot_keys = list()
with open('clean_klot_keys.csv','r') as kc:
    key_reader = csv.reader(kc, delimiter=',')
    for row in key_reader:
        klot_keys.append(row[0])
klot_keys = klot_keys[1:]
klot_keys = [bucket.get_key(k) for k in klot_keys]

def s3_map_func(key):
    yield (key.name, key.get_contents_as_string())

from metpy.io.nexrad import Level2File
from pyproj import Geod
import geojson

# From http://geospatialpython.com/2011/01/point-in-polygon.html
def point_in_poly(x,y,poly):
    n = len(poly)
    inside = False

    p1x,p1y = poly[0]
    for i in range(n+1):
        p2x,p2y = poly[i % n]
        if y > min(p1y,p2y):
            if y <= max(p1y,p2y):
                if x <= max(p1x,p2x):
                    if p1y != p2y:
                        xints = (y-p1y)*(p2x-p1x)/(p2y-p1y)+p1x
                    if p1x == p2x or x <= xints:
                        inside = not inside
        p1x,p1y = p2x,p2y

    return inside

# Spatial join seems unnecessary with small number of points,
# doing a mock instead that returns the name of the shape if contained
def spatial_join_mock(x,y,poly_list):
    for poly in poly_list:
        if point_in_poly(x,y,poly[1]):
            return poly[0]
    return ''

# Used to filter for bounding box
def in_bbox(x,y):
    in_box = ((y <= 42.0231311) and
              (y >= 41.644335) and
              (x <= -87.524044) and
              (x >= -87.940267))
    return in_box

def read_nexrad(fn, f):
  nex = f
  if fn.endswith('.gz'):
    nex = zlib.decompress(nex,15+32)
  try:
    nex = Level2File(BytesIO(nex))
  except:
    nex = 0
  return nex

def process_nexrad(fn, f):
    sweep = 0
    try:
        az = np.array([ray[0].az_angle for ray in f.sweeps[sweep]])
    except:
        return 0

    # Format for NEXRAD files changed (byte string and index), try for both formats
    if len(f.sweeps[sweep][0]) > 4:
        sweep_idx = 4
        ref_str = b'REF'
    else:
        sweep_idx = 1
        ref_str = 'REF'

    try:
        ref_hdr = f.sweeps[sweep][0][sweep_idx][ref_str][0]
        ref_range = np.arange(ref_hdr.num_gates) * ref_hdr.gate_width + ref_hdr.first_gate
        ref = np.array([ray[sweep_idx][ref_str][1] for ray in f.sweeps[sweep]])
    except:
        return 0

    data_hdr = f.sweeps[sweep][0][1]
    data = ma.array(ref)
    data[data==0] = ma.masked
    g = Geod(ellps='clrk66')
    try:
        center_lat = np.ones([len(az),len(ref_range)])*data_hdr.lat
        center_lon = np.ones([len(az),len(ref_range)])*data_hdr.lon
    except:
        # Pulled from values in PyArt if not available
        center_lat = np.ones([len(az),len(ref_range)])*41.60444
        center_lon = np.ones([len(az),len(ref_range)])*-88.08472
    az2D = np.ones_like(center_lat)*az[:,None]
    rng2D = np.ones_like(center_lat)*np.transpose(ref_range[:,None])*1000
    lon,lat,back = g.fwd(center_lon,center_lat,az2D,rng2D)
    # Create timestamp in epoch (without milliseconds) for datetime later
    ts = datetime.strptime(re.search(r'\d{8}_\d{6}',fn).group(), '%Y%m%d_%H%M%S')
    # Get epoch (without milliseconds), subtracting 5 hours to convert from GMT to CST
    time_epoch = time.mktime(ts.timetuple()) - (5 * 3600)

    ts_arr = np.ones([len(az),len(ref_range)])*time_epoch
    # Reducing dimensionality into rows of timestamp, lat, lon, and data
    arr_rows = np.dstack((ts_arr,lon,lat,data))
    arr_simp = arr_rows.reshape(-1,4)
    # Remove any nan values to reduce size
    return arr_simp[~np.isnan(arr_simp).any(1)]

# Loading zips into list of tuples with zip code and MultiPolygon
# chi_zips.geojson is in data/ folder, features are slightly simplified
with open('chi_zips.geojson','r') as cg:
    chi_zips = geojson.load(cg)

zip_tuples = list()
for feat in chi_zips['features']:
    shapes = feat['geometry']['coordinates'][0]
    poly_tuples = [(x[0],x[1]) for x in shapes]
    zip_code = feat['properties']['zip']
    zip_tuples.append((zip_code,poly_tuples))

# Convert precip in dBZ into mm/hr using Marshall-Palmer https://en.wikipedia.org/wiki/DBZ_(meteorology)
def precip_rate(dbz):
    return pow(pow(10, dbz/10)/200, 0.625)

# sc._jsc.hadoopConfiguration().set('fs.s3n.awsAccessKeyId', os.getenv('AWS_ACCESS_KEY_ID'))
# sc._jsc.hadoopConfiguration().set('fs.s3n.awsSecretAccessKey',os.getenv('AWS_SECRET_ACCESS_KEY'))
# s3nRdd = sc.binaryFiles('s3n://noaa-nexrad-level2/2006/07/09/KLOT/KLOT20060709_000601.gz')
klot_para = sc.parallelize(klot_keys)
s3nRdd = klot_para.flatMap(s3_map_func).repartition(200)

# Passing tuples through so that filename can be preserved
s3bin_res = s3nRdd.map(lambda x: (x[0],read_nexrad(x[0],x[1]))
                      ).filter(lambda x: isinstance(x[1],Level2File)
                      ).map(lambda x: process_nexrad(x[0],x[1])
                      ).filter(lambda x: isinstance(x, (np.ndarray, np.generic))
                      ).flatMap(lambda x: x
                      ).map(lambda x: (datetime.fromtimestamp(x[0]),float(x[1]),float(x[2]),float(x[3]))
                      ).filter(lambda x: in_bbox(x[1],x[2])
                      ).map(lambda x: (x[0],x[1],x[2],x[3],spatial_join_mock(x[1],x[2],zip_tuples))
                      ).filter(lambda x: x[4] != ''
                      ).map(lambda x: (x[0],x[1],x[2],precip_rate(x[3]),x[4]))

# Convert to tuple with native Python data types for DataFrame
nexrad_fields = [StructField('timestamp',TimestampType(),True),
                 StructField('lon',FloatType(),True),
                 StructField('lat',FloatType(),True),
                 StructField('precip',FloatType(),True),
                 StructField('zip',StringType(),True)]
nexrad_schema = StructType(nexrad_fields)

# Creating DataFrames https://spark.apache.org/docs/2.0.0-preview/sql-programming-guide.html#programmatically-specifying-the-schema
nexrad_df = sqlContext.createDataFrame(s3bin_res, nexrad_schema)
zip_nexrad_pivot = nexrad_df.groupby('timestamp').pivot('zip').mean('precip')
# Adding header because pivot makes unclear which shape is what
zip_nexrad_pivot.write.csv('s3n://nexrad-etl/test',header=True)
