# Sewer Overflows

Taking data from [istheresewageinthechicagoriver.com](http://istheresewageinthechicagoriver.com)
and the [Metropolitan Water Reclamation District](https://www.mwrd.org/irj/portal/anonymous/Home)
tracking combined sewer overflows.

The new CSO data has a higher level of detail, but has been merged with the older data (with blank values
for anything that can't be filled in) in [data/merged_cso_data.csv](data/merged_cso_data.csv)

## Data Cleanup Tasks

* The sewage in the Chicago River scraper stopped working after MWRD updated the
format of their site. We have a file [data/updated_format_cso_events.csv](data/updated_format_csv_events.csv)
of the updates since then that can be combined with previous data [data/cso_events.csv](data/cso_events.csv)
* The scraper can then be updated to make sure new data continues to be pulled on
the server repo: [chicago-river-sewage](https://github.com/open-city/chicago-river-sewage).
Scraping this page [MWRD CSO Synopsis Reports](http://www.mwrd.org/irj/portal/anonymous?NavigationTarget=navurl://1e604003f120f99abce577a4a1dd6bb5)

## Data Analysis Questions

* How much rain does it take for a CSO to occur?
* How much rain does it take for the locks to be opened?

## MWRD CSO Location Data

Using the [pyesridump](https://github.com/openaddresses/pyesridump) package to scrape
the ArcGIS server for MWRD used in the map on the [MWRD CSO map](https://www.mwrd.org/irj/portal/anonymous?NavigationTarget=navurl://eec9b2f677d42e0dea742ba5e2b45713)

Server from MWRD map located at http://utility.arcgis.com/usrsvcs/servers/2334828221d740208787b92f2d04ec1a/rest/services/CSO/CSO_Final/FeatureServer/0
