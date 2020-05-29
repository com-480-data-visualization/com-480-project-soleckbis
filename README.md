# Project of Data Visualization (COM-480)

| Student's name | SCIPER |
| -------------- | ------ |
|Lucas Eckes|248753|
|Anton Soldatenkov|314433|
|Frédéric Bischoff |263786|

[Milestone 1](#milestone-1-friday-3rd-april-5pm) • [Milestone 2](#milestone-2-friday-1st-may-5pm) • [Milestone 3](#milestone-3-thursday-28th-may-5pm)

## Milestone 1 (Friday 3rd April, 5pm)

**10% of the final grade**
### 1. Dataset
In this project we will work on a korean dataset about COVID-19, these data are published by the KDCC (Korea Center for Disease Control & Prevention) and are actualised every few days on kaggle (https://www.kaggle.com/kimjihoo/coronavirusdataset#PatientInfo.csv). This dataset is particularly exhaustive and contains much more precise information than equivalent dataset published by European countries. For each person infected we have for example his age, his precise localisation, the number of contact persons he has and even a follow-up of his medical state. 

The dataset contains not only the list of persons infected but also the number of persons supposed to be healthy who circulated a given day in each city. As we know that a person can be contaminant before developing any symptom, these data are important in order to see if the spread of the virus is linked to the floating population.

In top of that, some additional data are brought like weather information (temperature, wind, rain, humidity) for each city and some details about the cities themselves (distribution of the elderly population, presence of schools …). 

The data are already clean, so the pre-processing part consists in joining the five main tables together according the representation we want to obtain:
- “Patient_info.csv” for sick people and “Patient_route.csv” for the medical follow up
- “Floating.csv” for floating population,
-“Weather.csv” and “Region.csv” for the descriptive facts about the cities.

For example, in order to observe the impact of the circulation of the population on the spread of the disease, we need to join the table of sick persons with the one of floating population. Or for visualizing a potential impact of meteorological parameters on the propagation, we have to join the count of sick people per day with weather data. 

### 2. Problematic

Coronavirus is the hot topic of the moment and mobilizes the skills of data-scientists like never before, and thus not only for describing the spread of the virus, but also for modelling future and even for helping researchers to develop drugs.

On our scale, by exploiting the diversity of the Korean dataset, we want to provide some visualizations allowing to observe the impact of parameters that have been less analysed so far. Indeed, we would like to provide some representations that shows to what extend the displacement of the population has an impact on the disease propagation, does it propagate faster if an important number of people are circulating? If these persons have an important number of contacts? 

In the same fashion, some important characteristics of a city may also play an important role in the propagation, like the proportion of persons in the elderly or the number of schools? How do these parameters increase or not the spread?

The hypothesis that the weather may have an impact and in particularly the wind is sometimes mentioned. We would like to take benefit of this project, to see if according to the Korean datasetn temperature, humidity or wind may favour contaminations. 


### 3. Exploratory data analysis

The dataset (corona.csv) was cleaned. It contains most of the useful data from [the Kaggle's korean dataset](https://www.kaggle.com/kimjihoo/coronavirusdataset#TimeProvince.csv). It includes several features. The localisation can play a big part on the risk somebody has in contracting the virus or not. Since it is a contagious disease, living in an area with a high concentration of contaminated people will induce a higher risk of having the disease. There are 24 different cities in the dataset having different concentration of contaminated people.

![cities](graph/cities.png)

The city of Jongno-gu has clearly a higher concentration of contaminated people. It is not really surprising because Jongno-gu is a very touristic and animated city in the center of Seoul.<br/>

Another important parameter is the floating population. This corresponds to the number of people walking in the city during the day which was collected from users' smartphones. A city with a high traffic may propagate the disease faster than a city with less traffic.

![float](graph/float_cities.png)

Gangnam-gu is the city with the highest trafic. Again without surprise, Gangnam-gu is the trendy city at the heart of Seoul where it is popular to go out.<br/>

But among cities, there is difference in population's age or sex. And these parameters are of particular interest too. Indeed, coronavirus seems to be more fatal for eldery population. Here, we display the frequency of population groups for two different cities.

![age](graph/age_city.png)

The city of Gwanak-gu has a higher proportion of young people compared to the city of Dobong-gu. Gwanak-gu includes the Seoul National University which makes the city particularly young. On the other hand, Dobong-gu is more of a residential and montainous city. Another interesting fact is that women are in average older than men in Korea. Is the gender important when dealing with coronavirus ? The count of shools or the proportion of eldery people are included as well in the dataset for the same reasons.<br/>

Other types of features are considered, notably the weather of the cities. The temperature or wind have perhaps a link for the propagation of the disease. 

![wind_speed](graph/wind_speed.png)

Here it seems that there is a positive trend concerning the speed of the wind and the propagation of the coronavirus. But it needs some further analysis to conclude any type of correlation.


### 4. Related Work

Since the beginning of the spread of the virus in China in December, a countless number of visualizations have been done on this and similar datasets to observe the number of persons infected all around the world, the number of deaths, or for predicting future cases and the impact of different measures taken by governments. 

What new do we want to offer? We are going to analyze population localisation and movement, as well as weather conditions which seems to be a new and interesting way to go. Our visualisations will be inspired by the John Hopkins University Coronavirus Research Center data (https://coronavirus.jhu.edu/map.html) to give first a general overview of the pandemic. Then, for describing how the virus spreads in a city we will rely on an article by Gevorg Yeghikyan in Towards Data Science (https://towardsdatascience.com/modelling-the-coronavirus-epidemic-spreading-in-a-city-with-python-babd14d82fa2). Sources representing the effect of temperature are much rarer but this link https://www.accuweather.com/en/weather-blogs/weathermatrix/deep-dive-coronavirus-vs-population-and-temperatures/701036 offers a few plots that will help us defining our own graphs. Different small and nice plots about coronavirus are proposed on https://informationisbeautiful.net/visualizations/covid-19-coronavirus-infographic-datapack/, they are another potential source of ideas for realizing some nice and informative visualizations.

## Milestone 2 (Friday 1st May, 5pm)

**10% of the final grade**




## Milestone 3 (Thursday 28th May, 5pm)

To run our webiste clone the repository and do following command from a terminal:
`python -m http.server` and then open in your browser `localhost:8000`.
We also hosted our website [here](http://antonsold.github.io).

Description of the files:

-*Video.mp4*: 2 min movie explaining the project also on https://www.youtube.com/watch?v=4lu_XrFsB2M

-*Process_book.pdf*: document explaining in details our realization

-*index.html* is the main html page

-*css* folder: contains a .css style for the background (*background.css*), another .css for the style of the plots (*plot.css*), and an uploaded file for the style of the buttons (*bootsrap.css*)

-*fonts* folder: contains files for different fonts

-*data* folder: a part of the original dataset and other .csv files used to distplay data

-*json* folder: topojsons for the maps

-*lib* folder: commonly used lib like d3.js but also one called spearson.js for calculating the correlations

-*PNG* folder: a few icons for the first part

-*js* folder: all javascript files for the plots, *concentration.js* and *circle.js* for part 1, *density.js* for part 2 and *weather_1.js* and *weather_2.js* for part 3

-*graph* folder: few images for milestone 1


**80% of the final grade**

