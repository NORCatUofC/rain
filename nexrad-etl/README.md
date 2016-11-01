# NEXRAD Data Processing and ETL

Looking into processing  [NEXRAD Level III Precipitation Data](http://www.ncdc.noaa.gov/data-access/radar-data/nexrad-products) into a more
usable format for multiple projects.

## Updates

* Initial round of about a decade of weather data over a grid of Chicago now
[on our Google Drive folder](https://drive.google.com/folderview?id=0B_QE7itsD1z8Qi1BY2RWU1FRaE0&usp=sharing).
Files are the `chi_grid_200k_precip` zip files, and the grid is `chicago_grid.geojson`
* See the current demo showing precipitation over the grid and time [here](https://norcatuofc.github.io/rain-viz/)

## Notes

* Currently using Apache Spark to read files directly from S3 as byte strings,
and pass those into MetPy `Level2File` objects.
* Because the binary format is specific, can't read individual files in chunks,
but most files are around 2MB and none are bigger than 10MB
* Example of one row of output (timestamp as index as epoch, columns are zip codes,
and data is preipitation rate in millimeters per hour) in [data/ex_output_one_row.csv](data/ex_output_one_row.csv)
