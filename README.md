# Team Name
Team more than just cars
### Team Members
Gerald Heston
Rachael Urbano

### Final Proposal
1. Persona/Scenario
    1. Persona-- Concerned citizen, bike enthusiast, general human who enjoys good city planning with pedestrianized areas that aren't just car centric.
    2. Scenario--Where is the bicycle infrastructure? Where bicycle infrastructure exists are there less accidents? Where bicyclist deaths occur is there are correlation to a lack of bicycle infrastructure?
        Where are there concentrated bicyclists around the country/world? 
2. Requirements Document
    NHTSA has a database that allows users to capture accident information wherein users can narrow in on specifically fatalities. Still kind of early on, to be determined. 
    Gerald and I will have to comb through sources such as the collection created by Cars Destroyed Our Cities (https://www.instagram.com/cars.destroyed.our.cities/?hl=en); this contains locations that have both been overrun by car infrastructure and places that have successfully implemented pedestrianized areas and bicycle infrastructure.
3. Wireframes

# Final proposal (formatted)

## Persona/Scenario
Our typical target audience might include a wide breadth of user groups. This includes, general bike enthusiasts, city planners, data analysts, engineers, and potentially car brain people (and those with a gripe against _all_ cyclists from behind the wheel of their suburban carrying one passenger). With Rachael’s experience as a data analyst at local city governments, one might be able to see how toggling around this map might help with considerations as cities around the country the seek to pedestrianize areas. There is a growing need to utilize space in denser areas of populations. Whether it be putting in pocket parks, or slowly converting streets into bike lanes, good city planning is seeking to incorporate non-automobile related infrastructure. In some instances such as nearby Reno, the city has seen growth the last decade and the building has incorporated cyclist infrastructure with it. We are in agreement that as a country, we are a bit far off from being like Amsterdam, but people are realizing the need for change, and the benefits to everyone when there is infrastructure available. The untold benefits of a healthier society seem to not be important enough to people so instead we must plead a case. 

Specific examples of how this tool might help these decisions to transform our cities is: assessing intersections that have had a higher accident and death ratio. Yes, that is right, there exists data that we wish to display to highlight where these occurrences are. The hypothesis is that the bicyclist related incidents are likely going to fall outside of areas that incorporate bicycle infrastructure, and we do not mean just paint on the pavement. Projects supported by spatial data like this (where are accidents occurring) often help cities secure needed funding from things like Department of Transportation or Community Development Block Grants or CDBG funding which is determined by certain eligibilities with the Department of Housing and Urban Development. 

So, the idea is to develop a simple enough interface where the general bike enthusiast or person just curious about where these deaths are occurring, can just toggle on the layers that are relevant and zoom around. To what level they seek to gain information would vary. Sometimes people just stumble upon things or it can be a source of inspiration. But when it goes beyond this, it can be a tool. Here in Los Angeles there are bike coalitions and groups that get together regularly, promote events (such as CicLaVia where 7 miles of streets is shut down and devoted to a path for the day, this occurs 3-4x a year), they show up to public meetings regarding metro public transit, and local governance meetings as a voice to be heard. So having specific areas to bring to the attention of local governments could prove useful. 

The more advanced user such as the city data analyst (or engineer in the planning department that looks over roads), may want to apply some spatial analysis tools such as proximity to a dedicated bike path or infrastructure, or look at a city as a whole and calculate the rate of change in the occurrences of bicyclist accidents or deaths. Engineers may want to assess the area to see if Bott’s dot’s can be used to block off a turning section for bikes. Whether driven by curiosity or project need a user should be able to retrieve the data they are seeking for a given area with ease. The final product will make proper use of a relevant filter, perhaps a widget would allow the data to be downloaded in csv format at the click of a button, basic geoprocessing functions (closest bike feature, clip features), and a few standard map operators such as: zoom, pan, basemap options. In this instance, with applying a filter and perhaps the clip function, a user can capture the geospatial data of accidents and fatalities in a given area and have the ability to export this data for further use.

## Requirements

Main layer being the point layer of accidents and deaths. The symbology we need to decide on so it isn’t so grim and also respectful. Maybe semi transparent hollow x for an accident, and a white bike with a black outline representing a death. A white bike typically symbolizes the location or severe injury of a cyclist typically by motor vehicle. This will be acquired from the NHTSA (National Highway Traffic Safety Administration), using FARS tables which contain latitude and longitude coordinates.

FARS Data Download [https://www.nhtsa.gov/file-downloads?p=nhtsa/downloads/FARS/]

image link

### Basemap tilesets: 
1. OpenStreetMap basic—basic streets 
2. OpenStreetMap night mode—streets night 
3. Imagery with labels—satellite view

### Additional Layers
1. Commuter stats—census based layer symbolized based on number of commuters that do not rely on a car as their main mode of transport; polygon layer the color scale needs to be perfected as something that looks good against all three basemap layers; maybe having a bivariate symbology such as a pie chart (only visible at a certain extent) as a proportional symbol for the percent of commuters of a certain type in a given area—CS a. Are there larger populations of riders where there is infrastructure? b. Where are the riders at in general 
2. Roads—considering street maps will not contain any vector data that would be applicable to any analysis if needed (TBD); probably color based and the more important main streets being thicker in size—Rd 
3. Speed Limit (if possible)—might be interesting to see if stroads are where a lot of occurrences that involve bicycles are taking place; this might be hard but I’d like to try to use actual speed limit markers but wow again not sure if we can get this—SL 
4. 
5. Bike lanes and infrastructure – separated multi-use paths, painted lanes, etc.; need to determine which of the following; BL
* [https://www.cyclosm.org/#map=11/33.9277/-118.2843/cyclosm] 
* [https://www.opencyclemap.org/]

## Interaction Section—widgets 
1. Filter Widget—this will filter the layer of choice 
* Cyclist Incidents layer: accidents vs deaths 
* Commuter Stats layer: look at certain commuter stats and identify where populations exist that are non-automobile based 
* Polygon boundary layer: area of interests for users 

2. Search Widget 
*  Search for addresses/intersections 

3. Time Slider Widget 
* Time slider (is there data for different years? Can we show before/after stats where new bike infrastructure was added?) 

4. Download Widget 
* Download data as a csv or tiff? 

5. Comment widget 
* Add a way for users to comment – maybe just a point or polygon with a text box “This intersection needs a separated bike turn lane”

## Wireframe
link to images?

## Potential info in little sections 
* [http://www.pedbikesafe.org/PEDSAFE/guide_background.cfm] 
* [https://cdc.gov/transportationsafety/bicycle/index.html] 
* [https://sanantonioreport.org/avenue-b-and-alamo-street-bike-lanes-offer-glimpse-of-possibilities/] 
* [https://www.wired.com/story/how-to-start-a-bike-bus/]
* [https://www.pedbikeinfo.org/]
