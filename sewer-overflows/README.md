# Sewer Overflows

Taking data from [istheresewageinthechicagoriver.com](http://istheresewageinthechicagoriver.com)
and the [Metropolitan Water Reclamation District](https://www.mwrd.org/irj/portal/anonymous/Home)
tracking combined sewer overflows.

## Data Cleanup Tasks

* The sewage in the Chicago River scraper stopped working after MWRD updated the
format of their site. We have a file [data/updated_format_cso_events.csv](data/updated_format_csv_events.csv)
of the updates since then that can be combined with previous data [data/cso_events.csv](data/cso_events.csv)
* The scraper can then be updated to make sure new data continues to be pulled on
the server repo: [chicago-river-sewage](https://github.com/open-city/chicago-river-sewage)

## Data Analysis Questions

* How much rain does it take for a CSO to occur?
* How much rain does it take for the locks to be opened?
