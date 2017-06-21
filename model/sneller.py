# -*- coding: utf-8 -*-
"""
Created on Tue Aug 09 17:11:46 2016

@author: Niek
"""

import matplotlib.pyplot as plt
import gdal, osr
from skimage.graph import route_through_array
import numpy as np
import time
from scipy import spatial as sp
from functools import partial
import progressbar
from time import sleep

raster = gdal.Open('D:\Work\Geodan\Dashboard_Tool\itci_dashboard\data\Cost.tif')
band = raster.GetRasterBand(1)
costSurfaceArray = band.ReadAsArray().astype(np.float)
(upper_left_x, x_size, x_rotation, upper_left_y, y_rotation, y_size) = raster.GetGeoTransform()
(y_index, x_index) = np.nonzero(costSurfaceArray > 0)
x_coords = x_index * x_size + upper_left_x + (x_size / 2) #add half the cell size
y_coords = y_index * y_size + upper_left_y + (y_size / 2) #to centre the point

(y_roadi, x_roadi) = np.nonzero(costSurfaceArray==1)
x_road = x_roadi * x_size + upper_left_x + (x_size / 2)
y_road = y_roadi * y_size + upper_left_y + (y_size / 2)

cell_coords = zip(y_coords,x_coords)
road_coords = zip(y_road,x_road)
road_indices = zip(y_roadi,x_roadi)
cell_index = zip(y_index,x_index)
distance_to_road = np.zeros( np.shape(costSurfaceArray))

#def proximity(Origin,Destination):
#    dist=lambda s,d: (s[0]-d[0])**2+(s[1]-d[1])**2 #a little function which calculates the distance between two coordinates
#    nearest_road = min(Destination, key=partial(dist, Origin)) #find the min value using the distance function with coord parameter
#    dist_to_road = np.sqrt((Origin-nearest_road[0])**2 + (Origin-nearest_road[1])**2)
#    return dist_to_road
cell_to_road_dist_loc = []

for i,c in enumerate(cell_coords):
    dist = sp.distance.cdist([c],road_coords[0:-1],'euclidean').min()
    loc = road_indices[np.argmin(sp.distance.cdist([c],road_coords[0:-1],'euclidean'))]
    cell_to_road_dist_loc.append([cell_index[i],dist,loc])

def roadDist(startLoc,endLoc):
   
    indices, cost = route_through_array(costSurfaceArray, startLoc, endLoc,geometric=True,fully_connected=True)
   
    indices = np.array(indices).T        
    sr = abs(indices[0][0:-2]-indices[0][1:-1])+abs(indices[1][0:-2]-indices[1][1:-1])
    sr[sr==2]=np.sqrt(x_size**2. + y_size**2.)
    sr[sr==1]=x_size
    #road_to_ext_dist_loc.append([c,sum(sr)])
    dist = sum(sr)
    
    return dist

road_to_ext_dist_loc = []    
for i,m in enumerate(road_indices):
    road_to_ext_dist_loc.append([m,roadDist(m,(512,609))]) 
   
totaldist = np.zeros( np.shape(costSurfaceArray))

for i,c in enumerate(cell_to_road_dist_loc):
    for idx, rd in enumerate(road_to_ext_dist_loc):
        if rd[0] == c[-1]:
            totaldist[c[0]] = rd[1]+c[1]
           
        else: continue

def makeTiff(fname,match,data,nbands):
    output_raster = gdal.GetDriverByName('GTiff').Create(fname,match.RasterXSize, match.RasterYSize, 1,gdal.GDT_Int16)  # Open the file
    output_raster.SetGeoTransform(match.GetGeoTransform())  # Specify its coordinates
    srs = osr.SpatialReference()                 # Establish its coordinate encoding
    srs.ImportFromEPSG(4326)                     # This one specifies WGS84 lat long.
                                                 
                                               
    output_raster.SetProjection( srs.ExportToWkt() )   # Exports the coordinate system 
    
                                                       # to the file
    output_raster.GetRasterBand(nbands).WriteArray(data)  # Writes my array to the raster
    
    output_raster.FlushCache()
    del output_raster
        
makeTiff("D:\\Work\\Geodan\\Dashboard_Tool\\itci_dashboard\\data\\transportdistINT.tif",raster,(totaldist/1000.).astype(int),1)           



#for y in y_index:
#    for x in x_index:
#        
#        startCoord = (x,y)
#        #print startCoord
#        t = time.time()
#        indices, weight = route_through_array(costSurfaceArray, (y,x), (1508,1793),geometric=True,fully_connected=True)
#        elapsed = time.time()-t
#        print elapsed
#        indices = np.array(indices).T        
#        sr = abs(indices[0][0:-2]-indices[0][1:-1])+abs(indices[1][0:-2]-indices[1][1:-1])
#        sr[sr==2]=np.sqrt(x_size**2. + y_size**2.)
#        sr[sr==1]=x_size
#        distances[y,x] = sum(sr)   
#        
