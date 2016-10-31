# -*- coding: utf-8 -*-
"""
Created on Wed Feb 24 16:00:10 2016

@author: Niek
"""
# import modules
import gdal, ogr, os, sys
import flask as fl
import psycopg2
import psycopg2.extras
import os
import urlparse
import json
import numpy as np
#app = fl.Flask(__name__)

#urlparse.uses_netloc.append("postgres")
#url = urlparse.urlparse(os.environ["postgres://vulsadlzgzmtdq:_5AHr1HSPr9MZDTM5xSfWOhS9Z@ec2-54-83-202-218.compute-1.amazonaws.com:5432/d2tck4db2jpqep"])

#def connectToDB():
#    try:
#        return psycopg2.connect(database=url.path[1:],user=url.username,password=url.password,host=url.hostname,port=url.port)
#    except:
#        print("can't connect to DB")
        
def connectToDB():
    try: 
        conn = psycopg2.connect(database='itci',user='postgres',password='geodan123',host='localhost',port=5433)
        conn.set_session(autocommit=False) #if you want your updates to take effect without being in a transaction and requiring a commit, for a beginner, I would set this to True
        return conn
    except:
        print "I am unable to connect to the database"
        return None

def get_raster(raster_id,conn):
    conn = connectToDB()
    query= "SELECT ST_AsText(rast) from raster_table where id={}".format(raster_id)
    cur = conn.cursor().execute(query)
    res = cur.fetchall()
    cur.close()
    conn.close()
    return res[0][0]
    
def get_polygon(name,conn):
    conn = connectToDB()
    cur = conn.cursor()
    cur.execute("SELECT geometry(geom) FROM " +name+ ";")
    shapes = cur.fetchall()
    cur.close()
    conn.close()
    return shapes

def pol_sumstat(rast, geojson):
    conn = connectToDB()
    cur = conn.cursor()
    query = 'WITH Raster AS (SELECT rast FROM itci.public.'+rast+'), Polygon AS(SELECT ST_SetSRID(ST_GeomFromGeoJSON('+geojson+'), 4326) geom) SELECT ST_SummaryStats(ST_Union(ST_Clip(rast, geom))) FROM Raster, Polygon;'
    cur.execute(query)    
    records = cur.fetchall()
    cur.close()
    conn.close()
    return records
    
conn = connectToDB()   
geojson ='\'{"type":"Polygon","coordinates":[[[116.44174438267015,-0.8522329752314921],[116.44174438267015,-0.8213372230167352],[116.46706298618579,-0.8213372230167352],[116.46706298618579,-0.8522329752314921],[116.44174438267015,-0.8522329752314921]]]}\''
table = pol_sumstat('cassava',geojson)
table = table[0][0].replace('(','')
table = table.replace(')','')
table = table.split(',')
#table = [float(i) for i in table]
#table[0] = int(table[0])
colnames = ['count','sum','mean','stdev','min','max']

data = {}
for i, name in enumerate(colnames): 
    data[colnames[i]]=table[i]

#conn.commit()
geojson ='\'{"type":"Polygon","coordinates":[[[116.38174438267015,-0.8522329752314921],[116.38174438267015,-0.8213372230167352],[116.42706298618579,-0.8213372230167352],[116.42706298618579,-0.8522329752314921],[116.38174438267015,-0.8522329752314921]]]}\''
rast = 'cassava'
#
#@app.route('/')
def retrieveData(rast,geojson):
    conn = connectToDB()   
                 
    
    table = pol_sumstat(rast,geojson)
    table = table[0][0].replace('(','')
    table = table.replace(')','')
    table = table.split(',')
    table = [float(i) for i in table]
    table[0] = int(table[0])
    colnames = ['count','sum','mean','stdev','min','max']
 
datacassava = retrieveData(rast,geojson)   
#
#    return fl.jsonify(colnames,table)
#
#if __name__ == '__main__':
#    app.run()
#    x = retrieveData()
#    print x
##


curs = conn.cursor()

####PRECIPITATION RASTERS::::

# Use a virtual memory file, which is named like this
vsipath = '/vsimem/from_postgis'
# Download raster data into Python as GeoTIFF, and make a virtual file for GDAL
curs.execute("SELECT ST_AsGDALRaster(rast, 'GTiff') FROM transportdist_wgs;")
gdal.FileFromMemBuffer(vsipath, bytes(curs.fetchone()[0]))
prec = {}
for month in xrange(1,13,1):
# Read first band of raster with GDAL
    ds = gdal.Open(vsipath)
    band = ds.GetRasterBand(month)
    raster = band.ReadAsArray()
    raster[raster<0] = np.nan
    prec[month] = raster
    
    
# Close and clean up virtual memory file
ds = band = None
gdal.Unlink(vsipath)


