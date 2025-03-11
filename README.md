# Project of Data Visualization (COM-480)

| Student's name | SCIPER |
| -------------- | ------ |
| | |
| | |
| Jan Kokla | 367628 |
| Mahlia Merville-Hipeau | 345625 |

[Milestone 1](#milestone-1) • [Milestone 2](#milestone-2) • [Milestone 3](#milestone-3)

## Milestone 1 (21st March, 5pm)

**10% of the final grade**

This is a preliminary milestone to let you set up goals for your final project and assess the feasibility of your ideas.
Please, fill the following sections about your project.

*(max. 2000 characters per section)*

### Dataset

> Find a dataset (or multiple) that you will explore. Assess the quality of the data it contains and how much preprocessing / data-cleaning it will require before tackling visualization. We recommend using a standard dataset as this course is not about scraping nor data processing.

#### Dataset Overview  
For this project, we selected a dataset provided by the **Estonian Government**:  
[Estonian Real Estate Transactions](https://www.maaamet.ee/kinnisvara/htraru/FilterUI.aspx).  

This dataset contains information on property transactions in Estonia since **1996**.  

#### Selected Features  
We focus on the following key aspects:  
- 🏡 **Property prices**  
- 🏢 **Property types** 
- 🌍 **Land details**  
- 🌎 **Nationalities of transaction participants**  

#### Data Acquisition & Quality  
The dataset was not available in CSV format, so we performed **web scraping** to extract the data into an Excel file before converting it to CSV.  

✅ **Data quality:** The dataset is **well-structured** and already includes precomputed statistics, minimizing the need for extensive data cleaning. We usually have access to: min, max, median, average, std. 

#### Data Preprocessing  
To enhance visualization and analysis, we will:  
- Aggregate data at the **commune and canton levels**  
- Group transactions **by year**  

This approach will help reveal trends and patterns across different regions over time.   


### Problematic

> Frame the general topic of your visualization and the main axis that you want to develop.
> - What am I trying to show with my visualization?
> - Think of an overview for the project, your motivation, and the target audience.

#### 📌 Problem Statement  

Real estate prices, locations, and their evolution over time reveal **valuable insights** about a country's economy, wealth distribution, and urban development. We believe that **real estate data should be accessible** to the public, empowering citizens with knowledge to make informed decisions.  

#### 🎯 Objectives  
Our project has two key goals:  

1. **Make real estate data accessible to the Estonian population**  
   - We aim to **simplify** and **vulgarize** complex data, allowing citizens to understand trends and patterns in property transactions.  
   - By doing so, we hope to encourage **public awareness and engagement** in real estate policies.  

2. **Create meaningful visualizations for policymakers**  
   - Well-structured and insightful visualizations can **aid the Estonian government** in decision-making.  
   - Given Estonia's **small size**, a well-designed tool could have **a real impact** on housing policies and urban planning.  

#### 🌍 Broader Vision  
While our project focuses on **Estonia**, we believe that our **methodology** and **visualizations** could be adapted for **other governments worldwide**. Our approach highlights the importance of making **real estate data transparent and accessible** to all.  




### Exploratory Data Analysis

> Pre-processing of the data set you chose
> - Show some basic statistics and get insights about the data

### Related work

> - What others have already done with the data?
> - Why is your approach original?
> - What source of inspiration do you take? Visualizations that you found on other websites or magazines (might be unrelated to your data).
> - In case you are using a dataset that you have already explored in another context (ML or ADA course, semester project...), you are required to share the report of that work to outline the differences with the submission for this class. 

#### 📊 Existing Visualizations  
Currently, the **official Estonian real estate website** only provides **raw tabular data** without any visual representation. However, we found some real estate-related statistics and visualizations here:  
🔗 [Statistics Estonia – Housing Data](https://stat.ee/en/find-statistics/statistics-theme/economy/housing)  

#### 💡 Our Original Approach  
Our project stands out because it aims to:  
- **Directly benefit both the Estonian population and government** by making real estate trends easily understandable.  
- **Highlight relationships between key variables** (e.g., prices, locations, and buyer demographics), potentially revealing significant **correlations** that were previously unnoticed.  

#### 🎨 Sources of Inspiration  
We took inspiration from various **interactive and well-designed visualizations**, including:  
- **[John Brandt’s D3 Portfolio](https://johnbrandt.org/portfolio/d3/)** – For its innovative use of D3.js in data representation.  
- **[INSEE’s Interactive Map](https://www.insee.fr/fr/outil-interactif/7737357/map.html)** – A great example of **geospatial visualization** for demographic and economic data.  


## Milestone 2 (18th April, 5pm)

**10% of the final grade**


## Milestone 3 (30th May, 5pm)

**80% of the final grade**


## Late policy

- < 24h: 80% of the grade for the milestone
- < 48h: 70% of the grade for the milestone

