
ogr2ogr -f "GeoJSON" geojson/districts_with_data_03272017.geo.json PG:"host=localhost port=5432 dbname=rural_ed user=postgres password=password" co_district_layer_03272017

geo2topo districts_with_data=geojson/districts_with_data_03272017.geo.json | toposimplify | topoquantize 1e6 -o geojson/districts_with_data_03272017.topo.json
