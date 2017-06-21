# -*- coding: utf-8 -*-



"""
Created on Mon May 23 11:21:15 2016

@author: Niek
"""
import netCDF4 as nc
import matplotlib.pyplot as plt
import scipy as sc
from scipy import interpolate, ndimage
import numpy as np
from osgeo import gdal 
from gdalconst import *
import sys
from osgeo import gdal, gdalconst
import osr
import pandas as pd
from faodata import faodownload
#databases = faodownload.get_databases()
# this allows GDAL to throw Python Exceptions
gdal.UseExceptions()
itcidem = ("D:\\Work\\Geodan\\Dashboard_Tool\\itci_dashboard\\data\\DEM.tif")
itcislope = ("D:\\Work\\Geodan\\Dashboard_Tool\\itci_dashboard\\data\\ITCI_Slope.tif")
itcirad = ("D:\\Work\\Geodan\\Dashboard_Tool\\itci_dashboard\\data\\ITCI_Radiation.tif")
itciTmean = ('D:\Study\Borneo\Climate_data\Clipped\itci_tmean.tif')
itciTmin = ('D:\Study\Borneo\Climate_data\Clipped\itci_tmin_wgs.tif')
itciTmax = ('D:\Study\Borneo\Climate_data\Clipped\itci_tmax_wgs.tif')
itciPrec = ('D:\Study\Borneo\Climate_data\Clipped\itci_prec_wgs.tif')

rasters = {'dem':itcidem,'slope':itcislope,'rad':itcirad,'tmean':itciTmean,'tmin':itciTmin,'tmax':itciTmax, 'prec':itciPrec}
for key, fname in rasters.iteritems():
    # Source
    
    src_filename = fname
    src = gdal.Open(src_filename, gdalconst.GA_ReadOnly)
    src_proj = src.GetProjection()
    src_geotrans = src.GetGeoTransform()
    
    # We want a section of source that matches this:
    match_filename = itcidem
    match_ds = gdal.Open(match_filename, gdalconst.GA_ReadOnly)
    match_proj = match_ds.GetProjection()
    match_geotrans = match_ds.GetGeoTransform()
    wide = match_ds.RasterXSize
    high = match_ds.RasterYSize
    if key == "dem": 
        ras = gdal.Open(itcidem)  
        nbands = ras.RasterCount
        locals()[key] = []
        for band in np.arange(1,nbands+1,1):
            locals()[key].append(ras.GetRasterBand(band).ReadAsArray())
    else: 
    # Output / destination
        dst_filename ="D:\\Work\\Geodan\\Dashboard_Tool\\itci_dashboard\\data\\"+np.str(key)+".tif"
        dst = gdal.GetDriverByName('GTiff').Create(dst_filename, wide, high, src.RasterCount, gdalconst.GDT_Float32)
        dst.SetGeoTransform( match_geotrans )
        dst.SetProjection( match_proj)
        
        # Do the work
        gdal.ReprojectImage(src, dst, src_proj, match_proj, gdalconst.GRA_Bilinear)
        del dst # Flush
    
    ras = gdal.Open(dst_filename)  
    nbands = ras.RasterCount
    locals()[key] = []
    for band in np.arange(1,nbands+1,1):
        locals()[key].append(ras.GetRasterBand(band).ReadAsArray())

cropsyr = {'oil palm':[0.,0.,3.0,4.25,5.5,6.0,7.25,8.2,8.6,9.5,10.5,11.0,12.5,13.5,12.5,10.,9.,0.,0.,0.],
            'cassava':[80.,80.,80.,80.,80.,80.,80.,80.,80.,80.,80.,80.,80.,80.,80.,80.,80.,80.,80.,80.],
            'sugar palm ethanol':[0.,0.,0.,0.,0.,0.,0.,10.,9.,8.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.],
            'torwood':[5.5,5.5,5.5,5.5,5.5,5.5,5.5,5.5,5.5,5.5,5.5,5.5,5.5,5.5,5.5,5.5,5.5,5.5,5.5,5.5],
            'timber':[0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,400.],
            'sugar palm wood':[0.,0.,0.,0.,0.,0.,0.,0.,0.,0.,150.,0.,0.,0.,0.,0.,0.,0.,0.,0.,],
            'animal feed': [5.5,5.5,5.5,5.5,5.5,5.5,5.5,5.5,5.5,5.5,5.5,5.5,5.5,5.5,5.5,5.5,5.5,5.5,5.5,5.5],
            'forest byproducts':[0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5,0.5],
            } #optimal yield in metric tonnes per ha per year 1 to 20 after planting.
cropsval = {'palm oil':150.,
            'tapioca':87.5,
            'sugar palm ethanol':200.,
            'torwood':100.,
            'timber':400,
            'sugar palm wood':200.,
            'animal feed': 50.,
            'forest byproducts':80.,
            } #crop value EUR per metric tonne including conversion rate of raw material.

###Loading the data:
days = [31.,28.,31.,30.,31.,30.,31.,31.,30.,31.,30.,31.]
RH_mean = [75.,72.,70.,71.,73.,70.,74.,72.,72.,74.,76.,75.]
gflux = nc.Dataset("D:/Work/Geodan/GIS_Tools/groundheatflux.nc").variables["gflux"][:][:,1,0]*3.6 
rad[0] = (rad[0]/(30.4374*24.))*0.0036
dem[0] = dem[0].astype(float)
######################
def makeTiff(fname,match,data,nbands):
    output_raster = gdal.GetDriverByName('GTiff').Create(fname,match.RasterXSize, match.RasterYSize, 1 ,gdal.GDT_Float32)  # Open the file
    output_raster.SetGeoTransform(match.GetGeoTransform())  # Specify its coordinates
    srs = osr.SpatialReference()                 # Establish its coordinate encoding
    srs.ImportFromEPSG(4326)                     # This one specifies WGS84 lat long.
                                                 
                                               
    output_raster.SetProjection( srs.ExportToWkt() )   # Exports the coordinate system 
    
    for band in [1]:                                                   # to the file
        output_raster.GetRasterBand(band).WriteArray(data[band-1])  # Writes my array to the raster
    
    output_raster.FlushCache()
    del output_raster
    
######################
def coefficient(x,y):
    x_1 = x[0]
    x_2 = x[1]
    x_3 = x[2]
    y_1 = y[0]
    y_2 = y[1]
    y_3 = y[2]

    a = y_1/((x_1-x_2)*(x_1-x_3)) + y_2/((x_2-x_1)*(x_2-x_3)) + y_3/((x_3-x_1)*(x_3-x_2))

    b = (-y_1*(x_2+x_3)/((x_1-x_2)*(x_1-x_3))
         -y_2*(x_1+x_3)/((x_2-x_1)*(x_2-x_3))
         -y_3*(x_1+x_2)/((x_3-x_1)*(x_3-x_2)))

    c = (y_1*x_2*x_3/((x_1-x_2)*(x_1-x_3))
        +y_2*x_1*x_3/((x_2-x_1)*(x_2-x_3))
        +y_3*x_1*x_2/((x_3-x_1)*(x_3-x_2)))

    return a,b,c
######################
def Runoff(P,Scenario, SoilClass, Slope):
    if Scenario == 1 and SoilClass == 1:
        CN = 64.
    elif Scenario == 1 and SoilClass == 2:
        CN = 75.
    elif Scenario == 1 and SoilClass == 3:
        CN = 82.
    elif Scenario == 1 and SoilClass == 4:
        CN = 85.
    elif Scenario == 2 and SoilClass == 1:
        CN = 30.
    elif Scenario == 2 and SoilClass == 2:
        CN = 55.
    elif Scenario == 2 and SoilClass == 3:
        CN = 70.
    elif Scenario == 2 and SoilClass == 4:
        CN = 77.
    elif Scenario == 3 and SoilClass == 1:
        CN = 39.
    elif Scenario == 3 and SoilClass == 2:
        CN = 61.
    elif Scenario == 3 and SoilClass == 3:
        CN = 74.
    elif Scenario == 3 and SoilClass == 4:
        CN = 80.
    else:
        print "not a valid scenario, please choose from: Agricultural = 1, Forest = 2, Pasture = 3. Soil class A = 1, B = 2, C = 3, D = 4"
    S = (1000./CN)-10.
    I = 0.2*S
    Q = (((P-I)**2.)/((P-I)+S))*(1.-(Slope/90.))
    return Q
def e0(T):
    e0 = 0.611*np.exp((17.27*T)/(T+237.3))
    return e0
 ######################   
def ET0(Rn,G,u2, Tmin,Tmax,Tmean,RH_mean, elevation):
    D = (4098.*e0(Tmean))/((Tmean+237.3)**2.) # slope vapour pressure curve [kPa °C-1]
    P =  101.3*(((273.16+26.5)-0.0065*(elevation))/ (273.16+26.5))**(9.807/(0.0065*287.))   #atmospheric pressure at elevation z [kPa]
    lmd = 2.501-(2.361 * 10**-3.)*Tmean 
    gamma = 0.00163*(P/lmd) # psychrometric constant [kPa °C-1].
    es = ((e0(Tmax)+e0(Tmin))/2)
    ea = es*(RH_mean/100.)
    ET0 = (0.408*D*(Rn-G)+gamma*(900/(Tmean+273.))*u2*(es-ea))/(D+gamma*(1+0.34*u2))
    return ET0
######################
def CropMod(P,ET0,Kc,Tmin,Tmax,Topt,Tact,Altmax,dem,Slopemax,slope,Yield):
    a,b,c = coefficient([Tmin,Topt,Tmax],[0.,1.,0.])
    corT = ((a*Tact**2.) + b*Tact + c)
    corA = 1.-((1./(Altmax))*dem)
    corS = 1.-(1./(Slopemax)*slope)
    runoff = (1./90.)*slope
    wbal = ((1.05-runoff)*P)-(Kc*(ET0*30.4375))
    corW = wbal
    corW[wbal<0.] = 1.-(abs(wbal[wbal<0.])/(ET0[wbal<0.]*30.4374))
    corW[wbal>=0.]= 1.
    corY = Yield*corW*corT*corA*corS
    corY[corY<0] = 0.
    return corY
######################
rad[0][rad<0] = rad[0][rad[0]>0].mean() 
dem[0][dem[0]==dem[0].min()] = np.nan

KcPalmOil = [.9,.9,.9,1.,1.,1.,1.,1.1,1.2,1.2,1.2,1.]
KcCassava = [.9,.9,.9,1.,1.,1.,1.,1.1,1.2,1.2,1.2,1.]
KcPalmSug = [.9,.9,.9,1.,1.,1.,1.,1.1,1.2,1.2,1.2,1.]
KcTorWood = [1.,1.,1.,1.,1.,1.,1.,1.,1.,1.,1.,1.]
KcTimber = [1.,1.,1.,1.,1.,1.,1.,1.,1.,1.,1.,1.]

slope[0][slope[0]<0.]=np.nan

annualYieldPalmOil = []
annualYieldCassava = []
annualYieldPalmSugar = []
annualYieldTimber = []
annualYieldTorCoal = []
annualYieldSPWood = []
budget = []

for year in np.arange(0,1,1):
    POmonthYield = []
    CSmonthYield = []
    PSmonthYield = []
    PWmonthYield = []
    TBmonthYield = []
    TCmonthYield = []

    for month in np.arange(0,12):
        tmean[month][tmean[month]== tmean[month].min()] = np.nan
        #tmean[month] = sc.ndimage.zoom(tmean[month], len(dem[0])/float(len(tmean[month])), order=0)
        #tmean[month] = tmean[month][0:len(dem[0]),0:len(dem[0][0])]
        
        tmin[month][tmin[month]== tmin[month].min()] = np.nan
        #tmin[month] = sc.ndimage.zoom(tmin[month], len(dem[0])/float(len(tmin[month])), order=0)
        #tmin[month] = tmin[month][0:len(dem[0]),0:len(dem[0][0])]
        
        tmax[month][tmax[month]== tmax[month].min()] = np.nan
        #tmax[month] = sc.ndimage.zoom(tmax[month], len(dem[0])/float(len(tmax[month])), order=0)
        #tmax[month] = tmax[month][0:len(dem[0]),0:len(dem[0][0])]
        
        prec[month][prec[month]== prec[month].min()] = np.nan
        #prec[month] = sc.ndimage.zoom(prec[month], len(dem[0])/float(len(prec[month])), order=0)
        #prec[month] = prec[month][0:len(dem[0]),0:len(dem[0][0])]
        
        ET = ET0(rad[0],gflux[month],2.,tmin[month]/10.,tmax[month]/10.,tmean[month]/10.,RH_mean[month],dem[0])
        POmonthYield.append(0.9*CropMod(prec[month],ET,KcPalmOil[month],18.,38.,27.,tmean[month]/10.,1500.,dem[0],25.,slope[0],0.25*np.max(cropsyr['oil palm'])/12.))
        CSmonthYield.append(0.9*CropMod(prec[month],ET,KcCassava[month],16.,38.,27.,tmean[month]/10.,1800.,dem[0],20.,slope[0],(1./5.5)*np.max(cropsyr['cassava'])/12.))  ##http://www.cassavabiz.org/postharvest/starch03.htm for conversion ratio cassava-starch
        PSmonthYield.append(0.9*CropMod(prec[month],ET,KcPalmSug[month],16.,35.,28.,tmean[month]/10.,1400.,dem[0],35.,slope[0],np.max(cropsyr['sugar palm ethanol'])/12.))
        PWmonthYield.append(0.9*CropMod(prec[month],ET,KcPalmSug[month],16.,35.,28.,tmean[month]/10.,1400.,dem[0],35.,slope[0],np.max(cropsyr['sugar palm wood'])/12.))
        TBmonthYield.append(0.9*CropMod(prec[month],ET,KcTimber[month],16.,35.,25.,tmean[month]/10.,1800.,dem[0],20.,slope[0],np.max(cropsyr['timber'])/12.))
        TCmonthYield.append(0.9*CropMod(prec[month],ET,KcTorWood[month],18.,35.,28.,tmean[month]/10.,1500.,dem[0],20.,slope[0],np.max(cropsyr['torwood'])/12.))
        ### 0.9ha is the approximate area of each pixel
    
    annualYieldPalmOil.append(np.sum(POmonthYield, axis=0))    ###tonnes per pixel (appr. 0.9ha)
    annualYieldCassava.append(np.sum(CSmonthYield, axis=0))
    annualYieldPalmSugar.append(np.sum(PSmonthYield, axis=0))
    annualYieldSPWood.append(np.sum(PWmonthYield, axis=0))
    annualYieldTimber.append(np.sum(TBmonthYield, axis=0))
    annualYieldTorCoal.append(np.sum(TCmonthYield, axis=0))
    
makeTiff("D:\\Work\\Geodan\\Dashboard_Tool\\itci_dashboard\\data\\maxYieldPalmOil4.tif",ras,annualYieldPalmOil,len(annualYieldPalmOil))
makeTiff("D:\\Work\\Geodan\\Dashboard_Tool\\itci_dashboard\\data\\maxYieldCassava4.tif",ras,annualYieldCassava,len(annualYieldCassava))
makeTiff("D:\\Work\\Geodan\\Dashboard_Tool\\itci_dashboard\\data\\maxYieldPalmSugar4.tif",ras,annualYieldPalmSugar,len(annualYieldPalmSugar))
makeTiff("D:\\Work\\Geodan\\Dashboard_Tool\\itci_dashboard\\data\\maxYieldSPWood4.tif",ras,annualYieldSPWood,len(annualYieldSPWood))
makeTiff("D:\\Work\\Geodan\\Dashboard_Tool\\itci_dashboard\\data\\maxYieldTimber4.tif",ras,annualYieldTimber,len(annualYieldTimber))
makeTiff("D:\\Work\\Geodan\\Dashboard_Tool\\itci_dashboard\\data\\maxYieldTorCoal4.tif",ras,annualYieldTorCoal,len(annualYieldTorCoal))        
#

