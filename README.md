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

Since the beginning of the spread of the virus in China in December, a countless number of visualizations have been realized to observe the number of persons infected all around the world, the number of deaths, or for predicting future cases. By exploiting the diversity of the Korean dataset, we want to provide some more original representations based on the displacement of the population or weather data. We would like to provide some visualization in order to see easily if the displacement of persons increases the propagation of the virus in incomings days or even if some meteorological parameters (wind or humidity) are favourable to the spread.

### 3. Exploratory data analysis

The dataset (corona.csv) was cleaned and contain most of the useful datas from [the korean dataset from kaggle] (https://www.kaggle.com/kimjihoo/coronavirusdataset#TimeProvince.csv). It contains several features : 
- date : The date at which a person may have contracted the virus (2 to 12 days prior to hospitalisation) ranging from the 8th January to the 30th March 2020.
- city : 24 different localisations in Korea.
- province : 6 different provinces where the cities are.
- latitude : Latitude of the population.
- longitude : Longitude of the population.
- sex : The sex (female or male).
- age : Age group interval of ten years.
- contaminated : 0 -> The group don't have coronavirus.
1 -> The group have the coronavirus. The following cases are computed using 
- group_number : The number of people in that group (sex, age, contaminated) walking in the city (city) during day (date) (using the floating population data).
- total_number : Total number of people walking in the city (city) during day (date).
- proportion_case : Total of contaminated people walking in the city (city) during day (date)/ total_number.
- elementary_school_count : The count of elementary school in the city.
- kindergarten_count : The count of Kindergarten.
- university_count : The count of University.
- nursing_home_count : The count of Nursing.
- code : The postal code.
- avg_temp : The average temperature in the city during the day.
- min_temp : The minimum temperature.
- max_temp : The maximum temperature.
- precipitation : The precipitation.
- max_wind_speed : The maximum speed.
- most_wind_direction : The direction of the wind.
- avg_relative_humidity : The average relative humidity.


### 4. Related Work

## Milestone 2 (Friday 1st May, 5pm)

**10% of the final grade**




## Milestone 3 (Thursday 28th May, 5pm)

**80% of the final grade**

