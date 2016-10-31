# -*- coding: utf-8 -*-
"""
Created on Wed Aug 10 10:56:39 2016

@author: Niek
"""
import matplotlib.pyplot as plt
import glob
import netCDF4
import numpy as np
import gdal

fn = glob.glob("D:/Work/Geodan/Dashboard_Tool/itci_dashboard/data/soils/data/*.nc4")
latbounds = [-1.05,-0.45]
lonbounds = [116.25,116.75] # degrees east ? 
for url in fn: 
    nc = netCDF4.Dataset(url)
    ncv = nc.variables
    ncv.keys()
    
    # subset and subsample
    lats = ncv['lat'][:] 
    lons = ncv['lon'][:]
    
    # latitude lower and upper index
    latli = np.argmin( np.abs( lats - latbounds[0] ) )
    latui = np.argmin( np.abs( lats - latbounds[1] ) ) 
    
    # longitude lower and upper index
    lonli = np.argmin( np.abs( lons - lonbounds[0] ) )
    lonui = np.argmin( np.abs( lons - lonbounds[1] ) )     
        
    # read the 1st time step
    subset = ncv[ncv.keys()[2]][0,latli:latui , lonli:lonui ]
    
    plt.pcolormesh(subset);
    nc.close()
    
