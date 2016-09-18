import os, zlib, re
import numpy as np
from numpy import ma
from io import BytesIO
from pyspark import SparkConf, SparkContext

spark_conf = SparkConf().setAppName('TestNexrad')
sc = SparkContext(conf=spark_conf)

from metpy.io.nexrad import Level2File
from pyproj import Geod

def process_nexrad(fn, f):
    sweep = 0
    try:
        az = np.array([ray[0].az_angle for ray in f.sweeps[sweep]])
    except:
        return np.array([])

    # Format for NEXRAD files changed (byte string and index), try for both formats
    try:
        ref_hdr = f.sweeps[sweep][0][4][b'REF'][0]
    except:
        ref_hdr = f.sweeps[sweep][0][1]['REF'][0]
    ref_range = np.arange(ref_hdr.num_gates) * ref_hdr.gate_width + ref_hdr.first_gate
    ref = np.array([ray[1]['REF'][1] for ray in f.sweeps[sweep]])

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
    timestamp_int = int(re.search(r'\d{8}_\d{6}',fn).group().replace('_',''))
    time_arr = np.ones([len(az),len(ref_range)])*timestamp_int
    # Reducing dimensionality into rows of timestamp, lat, lon, and data
    arr_rows = np.dstack((time_arr,lat,lon,data))
    return arr_rows.reshape(-1,4)

sc._jsc.hadoopConfiguration().set('fs.s3n.awsAccessKeyId', os.getenv('AWS_ACCESS_KEY_ID'))
sc._jsc.hadoopConfiguration().set('fs.s3n.awsSecretAccessKey',os.getenv('AWS_SECRET_ACCESS_KEY'))
s3nRdd = sc.binaryFiles('s3n://noaa-nexrad-level2/2006/07/09/KLOT/KLOT20060709_000601.gz')
# Passing tuples through so that filename can be preserved
s3bin_res = s3nRdd.map(lambda x: (x[0], zlib.decompress(x[1],15+32))
                      ).map(lambda x: (x[0],Level2File(BytesIO(x[1])))
                      ).map(lambda x: process_nexrad(x[0],x[1]))

print(s3bin_res.flatMap(lambda x: x).first())
