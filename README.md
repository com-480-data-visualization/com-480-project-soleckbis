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
### 3. Exploratory data analysis
### 4. Related Work

## Milestone 2 (Friday 1st May, 5pm)

**10% of the final grade**




## Milestone 3 (Thursday 28th May, 5pm)

**80% of the final grade**

