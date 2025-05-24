# 🇪🇪 Estonia - Property Prices
You can find our marvelous website [here](https://suvariik.eu/).

### Resources for Milestone 3
[Video presentation](https://github.com/user-attachments/assets/da3531f9-d823-4503-84ce-15d61acb3707) • [Process book](/docs/process_book.pdf)


## 💡 The project

In this project, we aim to show the **property prices** evolution across **time and space** in Estonia. We believe that the trends provide **critical insights** into the country's economy, wealth distribution, and urban development. Our goal is to present these insights through **intuitive and visually compelling dashboards** that make complex data easy to understand.

### The objectives

Our project has three key goals:  

- Make real estate data accessible to the Estonian population and empower citizens  

- Create meaningful visualizations for policymakers 

- Our methodology and visualisations could be envisoned for any other country, giving it a broad dimension
 

### The data

We selected a dataset provided by the **Estonian Government**: [Estonian Real Estate Transactions](https://www.maaamet.ee/kinnisvara/htraru/FilterUI.aspx).  
We refer you to [Milestone 1](/docs/milestone_1.md) and [Milestone 2](/docs/milestone_2.md) for more information about data quality and preprocessing. 

## ⚙️ The technical setup
### Running the app locally
The website requires Node.js to run. Instructions for installing Node on your specific operating system can be found here: [https://nodejs.org/en/download](https://nodejs.org/en/download)

Clone the repository
```bash
git clone https://github.com/com-480-data-visualization/est-property-prices.git
```

Navigate to the app directory and install Node dependencies
```bash
cd app/
npm install
```

Launch the web server with:
```bash
node app.js
```

The website should become available at http://localhost:3000

### The website structure
The website is built using two main pages.
- the **Landing Page**: serves as the entry point for users to explore national temporal and spatial trends in real estate prices.
- the **County-specific dashboards**: provide a more granular view of real estate data, offering multiple visualizations and statistics.

We refer you to [Milestone 2](/docs/milestone_2.md) for more information about each visualisation.  



### The repository

The repository is built as follows:
```
├─── app   
        ├─── public                                      
                ├─── data                 JSON data files
                ├─── js                   Visualizations and scripts
                ├─── views                Handlebars templates
        ├─── app.js                       Main application entry point                
├─── docs                                 Previous milestones
├─── notebooks                            Data analysis notebooks
```



## Previous milestones

[Milestone 1](/docs/milestone_1.md) • [Milestone 2](/docs/milestone_2.md)

## 🤝 Authors

| Student's name             | SCIPER |
| -------------------------- | ------ |
| Jan Kokla                  | 367628 |
| Mahlia Merville-Hipeau     | 345625 |
| Siim Markus Marvet         | 377510 |




