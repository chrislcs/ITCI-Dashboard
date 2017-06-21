raster2pgsql -r D:\Work\Geodan\Dashboard_Tool\itci_dashboard\data\maxYieldTorCoal4.tif -t 100x100 -s 4326 -I > D:\Work\Geodan\Dashboard_Tool\itci_dashboard\data\tc.sql
raster2pgsql -r D:\Work\Geodan\Dashboard_Tool\itci_dashboard\data\maxYieldTimber4.tif -t 100x100 -s 4326 -I > D:\Work\Geodan\Dashboard_Tool\itci_dashboard\data\tb.sql
raster2pgsql -r D:\Work\Geodan\Dashboard_Tool\itci_dashboard\data\maxYieldSPWood4.tif -t 100x100 -s 4326 -I > D:\Work\Geodan\Dashboard_Tool\itci_dashboard\data\sw.sql
raster2pgsql -r D:\Work\Geodan\Dashboard_Tool\itci_dashboard\data\maxYieldCassava4.tif -t 100x100 -s 4326 -I > D:\Work\Geodan\Dashboard_Tool\itci_dashboard\data\ca.sql
raster2pgsql -r D:\Work\Geodan\Dashboard_Tool\itci_dashboard\data\maxYieldPalmSugar4.tif -t 100x100 -s 4326 -I > D:\Work\Geodan\Dashboard_Tool\itci_dashboard\data\ps.sql
raster2pgsql -r D:\Work\Geodan\Dashboard_Tool\itci_dashboard\data\maxYieldPalmOil4.tif -t 100x100 -s 4326 -I > D:\Work\Geodan\Dashboard_Tool\itci_dashboard\data\po.sql

psql -d itci -f D:\Work\Geodan\Dashboard_Tool\itci_dashboard\data\tc.sql -U postgres -p 5433
psql -d itci -f D:\Work\Geodan\Dashboard_Tool\itci_dashboard\data\tb.sql -U postgres -p 5433
psql -d itci -f D:\Work\Geodan\Dashboard_Tool\itci_dashboard\data\sw.sql -U postgres -p 5433
psql -d itci -f D:\Work\Geodan\Dashboard_Tool\itci_dashboard\data\ca.sql -U postgres -p 5433
psql -d itci -f D:\Work\Geodan\Dashboard_Tool\itci_dashboard\data\ps.sql -U postgres -p 5433
psql -d itci -f D:\Work\Geodan\Dashboard_Tool\itci_dashboard\data\po.sql -U postgres -p 5433