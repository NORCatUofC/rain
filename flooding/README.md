# Basement Flooding

Looking at data for 311 calls around basement flooding. Data is not immediately
available on the Open Data Portal, but WBEZ FOIAed records from 2009 to 2015 for
a story in their Heat of the Moment series: [The Gross Gatherings](http://www.heatofthemoment.org/features/flood/)

The Center for Neighborhood Technology report referenced in the article has
additional information about how basement flooding disproportionately affects Chatham,
along with other neighborhoods in Chicago: [CNT RainReady Chatham](http://www.cnt.org/sites/default/files/publications/CNT_RainReady%20Community%20-%20Chatham.pdf)

## FEMA Data

Data from FEMA about disaster incidents, housing assistance for owners and renters,
public assistance applications, and registration intake for individuals in the housing
program for Cook County, Illinois flood and severe storm events are in the `fema_data`
directory. Further information about the data can be found here [FEMA Data Feeds](https://www.fema.gov/data-feeds)

The data other than the Disaster Declarations doesn't initially come with the
`incidentType` field, but this was added for ease of use, and to remove snow, tornado,
and other types of events.

## Data Tasks

* Data aggregated to the zip code level exists through the Carto map for the article
[Basement Flooding 311 Table Zip Codes](https://shannonheffernan.carto.com/tables/table_zip_codes/public)
* Submitted a FOIA request for records of all calls to 311 concerning flooding from
2000 (or earliest available date) through August 2016. Will update with information
if it's received.
* A [Community Development Block Grant Disaster Recovery Action Plan](http://www.cityofchicago.org/content/dam/city/depts/obm/supp_info/CDBG/Jan2015_HUD_Approved_Substantial_Amendment.pdf) refers to the appropriation of federal funds for disaster relief, particularly
around flooding in Chicago. It mentions that the three data sources primarily used
are 311 calls, FEMA requests for individual assistance, and output from the a
hydraulic sewer model.
* Hydraulic sewer model seems to be referring to models developed as part of the
[Tunnel and Reservoir Plan](http://vtchl.illinois.edu/tunnel-and-reservoir-plan/)
in partnership with the University of Illinois. Could also refer to EFDC mentioned
in [this paper](https://www.researchgate.net/publication/286890406_Integrated_urban_hydrologic_and_hydraulic_modelling_in_Chicago_Illinois). Worth looking into more

## Data Analysis Questions

* From the zip code map and information in the article, the South Side, and Chatham
in particular, are disproportionately affected by flooding. What are other highly
affected areas, and what are common threads between them?
* How have recent weather patterns impacted 311 calls for basement flooding?
* Are basement flooding events related to MWRD activities, including combined
sewer overflows?
* Is there a certain threshold of rain that leads to basement flooding, or is it
more related to structural or environmental factors?
* What are the current sewer models taking into consideration, and how are they
relating CSOs and rainfall?
