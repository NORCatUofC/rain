# NEXRAD Data Processing and ETL

Looking into processing  [NEXRAD Level III Precipitation Data](http://www.ncdc.noaa.gov/data-access/radar-data/nexrad-products) into a more
usable format for multiple projects.

Very basic demo of about a month of data aggregated to zip codes being animated
by precipitation over time: [CARTO Viz](https://pjsier.carto.com/viz/97e178e4-90ab-11e6-b70c-0e3ff518bd15/embed_map)

## Notes

* Currently using Apache Spark to read files directly from S3 as byte strings,
and pass those into MetPy `Level2File` objects.
* Because the binary format is specific, can't read individual files in chunks,
but most files are around 2MB and none are bigger than 10MB
* Example of one row of output (timestamp as index as epoch, columns are zip codes,
and data is preipitation rate in millimeters per hour) in [data/ex_output_one_row.csv](data/ex_output_one_row.csv)
