# ITCI-Dashboard

The ITCI-Dashboard serves as a decision support dashboard for planning agroforestry systems, in this case specifically for ITCI, East-Kalimantan, Indonesia.

Users can specify polygons for which they then specify combinations of crops. Based on a bio-physical module, fed by spatial and non-spatial data, estimated crop yields per hectare are calculated. At this moment these calculations were performed in advance and the resulting crop-yield raster is served to the dashboard from a geodatabase. Hence on the basis of this raster input the dashboard visualizes expected yields for each polygon. In the recipes tab, the user can specify the percentage of the polygon used by each crop within the recipe as well as the starting year of plantation. 

In short: [Precalculated maximum crop yield per ha in database in raster format] * [Dashboard specified polygon with recipe of crops and starting years optionally accounted for prices of oil and labor] = [Grapsh of estimated total yield in terms of biomass, monetary, co2 footprint and labor oportunities].

# To do:
  - Incorporating transportation cost and co2 emission. 
  - Selecting different recipe on polygon by selection menu/drop down menu instead of typing.
  - Reusing of user specified polygons between scenarios.
  - Add graphs and calculations of biomass, labor and co2 footprint
  - Improve processing speed.
  - Improve graphs: Labels, layout?,....
  - Server based running of bio-physical module?
  - Visualization of background rasters (climate, soils, hydrology,...).
  - Adding column in recipe table: Area per crop.

# Bugs:
  - Clicking the piechart and consequently adding a scenario will result in a bugged biomass per recipe chart and profit chart
  - 
