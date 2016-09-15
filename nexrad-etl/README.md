# NEXRAD Data Processing and ETL

Looking into processing  [NEXRAD Level III Precipitation Data](http://www.ncdc.noaa.gov/data-access/radar-data/nexrad-products) into a more
usable format for multiple projects.

## Notes

* Running by pulling files from S3 individually takes too long to be practical,
will need to use Apache Spark with S3 as the dataset and a list of keys including
"KLOT"
* Need to generate the list of keys which include "KLOT" because the file structure
is "YEAR/MONTH/DAY/STATION/FILES"
