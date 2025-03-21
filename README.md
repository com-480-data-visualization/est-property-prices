# 📊 Project of Data Visualization (COM-480)

| Student's name             | SCIPER |
| -------------------------- | ------ |
| Jan Kokla                  | 367628 |
| Mahlia Merville-Hipeau     | 345625 |
| Siim Markus Marvet         | 377510 |

[Milestone 1](#-milestone-1) • [Milestone 2](#milestone-2) • [Milestone 3](#milestone-3)

## 📝 Milestone 1

### 📂 Dataset

#### Dataset Overview  
For this project, we selected a dataset provided by the **Estonian Government**:  
[Estonian Real Estate Transactions](https://www.maaamet.ee/kinnisvara/htraru/FilterUI.aspx).  

This dataset contains information on property transactions in Estonia since **1996**. We decided to focus on the last 14 years, 
using data from **2010 to 2024** due to the higher data quality in that timeframe. 

#### Selected Features  
We focus on the following key aspects:  
- 🏡 **Property prices**  
- 🏢 **Property types**  
- 🌍 **Land details**  
- 🌎 **Nationalities of transaction participants**  

#### Data Acquisition
We used web scraping to gather the necessary data from the [Estonian Real Estate Transactions](https://www.maaamet.ee/kinnisvara/htraru/FilterUI.aspx) website of the 
Estonian Land Board. This yielded many Excel files that we in turn parsed for relevant data and converted into JSON for 
easier ingestion into our web-application.

#### Data Quality

✅ **Data quality:** The dataset is **well-structured** and already includes precomputed statistics, minimizing the need for extensive data cleaning. We usually have access to: min, max, median, average, and standard deviation.  
❌ **Missing data**: We are occasionally missing data for the smallest municipalities. When there were **5** or less transactions in a year the data is hidden to preserve privacy.  
🚫 **Governmental data**: For privacy reasons, we are only given aggregated data, slightly narrowing our opportunities of visualization.

#### Data Preprocessing  
The data is already split into two granularity levels: data by `county` and data by `municipality`. We will group the data by year to observe the trends over time.  

For the different graphs we plan to create, we will pre-process the data to ensure it is in the proper format for direct use.

### 🔍 Problematic

#### 📌 Problem Statement  

Real estate prices, locations, and their evolution over time reveal **valuable insights** about a country's economy, wealth distribution, and urban development. We believe that **real estate data should be accessible** to the public, empowering citizens to make informed decisions.  

#### 🎯 Objectives  
Our project has two key goals:  

1. **Make real estate data accessible to the Estonian population**  
   - We aim to **simplify** the complex data, allowing citizens to understand trends and patterns in property transactions.  
   - By doing so, we hope to encourage **public awareness and engagement** in real estate policies.  

2. **Create meaningful visualizations for policymakers**  
   - Well-structured and insightful visualizations can **aid the Estonian government** in decision-making.  
   - Given Estonia's **small size**, a well-designed tool could have **a real impact** on housing policies and urban planning.  

#### 🌍 Broader Vision  
While our project focuses on **Estonia**, we believe that our **methodology** and **visualizations** could be adapted for **other governments worldwide**. Our approach highlights the importance of making **real estate data transparent and accessible** to all.  

### 📊 Exploratory Data Analysis

You can find our initial data analysis [notebook](notebooks/initial_data_analysis.ipynb).

### 📚 Related Work

#### 👓 Existing Visualizations  
Currently, the **official Estonian real estate website** only provides **raw tabular data** without any visual representation. However, we found some real estate-related statistics and visualizations here:  
🔗 [Statistics Estonia – Housing Data](https://stat.ee/en/find-statistics/statistics-theme/economy/housing)

There are comparable visualizations for other countries, such as:

🔗 [European Union - Property Price Dashboard](https://ec.europa.eu/eurostat/cache/dashboard/prices/)

🔗 [Swiss Real Estate Prices](https://realadvisor.ch/en/property-prices/1352-agiez)


#### 💡 Our Original Approach  
Our project stands out because it aims to:  
- **Directly benefit both the Estonian population and government** by making real estate trends easily understandable.  
- **Highlight relationships between key variables** (e.g., prices, locations, and buyer demographics), potentially revealing significant **correlations** that were previously unnoticed.  

#### 🎨 Sources of Inspiration  
We took inspiration from various **interactive and well-designed visualizations**, including:  
- **[John Brandt’s D3 Portfolio](https://johnbrandt.org/portfolio/d3/)** – For its innovative use of D3.js in data representation.  
- **[Dashboard template](https://dribbble.com/shots/25124941-Locust-Dashboard-Earn-a-Stake-in-AI)** – Dashboard showing different types of graphs.  
- **[Line template](https://tympanus.net/codrops/2022/03/29/building-an-interactive-sparkline-graph-with-d3/)** – Interactive sparkline.
- **[Interactive Map](https://luissevillano.net/historical-evolution-of-the-unemployment-rate-in-spain/map/)** – Interaction with drag.
- **[Interactivity Between Charts](https://luissevillano.net/historical-evolution-of-the-unemployment-rate-in-spain/graphs/)** – Interaction with hover.
