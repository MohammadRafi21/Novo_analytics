# Novoanalytics — AI Trade Intelligence Dashboard

A Django/Bootstrap 5 dashboard for cross-border aluminium trade analysis.
Built for Novoanalytics, Sydney AU.

---

## Quick Start

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Run migrations (optional — no models required)
```bash
python manage.py migrate
```

### 3. Start the server
```bash
python manage.py runserver
```

### 4. Open in browser
```
http://127.0.0.1:8000
```

---

## Features

| Tab | Description |
|-----|-------------|
| Overview | KPI cards, import mix, LME prices, AU trade partners |
| AU Imports | Product breakdown, H1/H2 comparison, extrusion opportunity |
| Price Analysis | LME history, YoY volatility, China vs India cost comparison |
| India Suppliers | Capacity ranking, risk vs price scatter, India export growth |
| AU Construction | Market segments, demand vs growth bubble, segment demand chart |
| AI Cost-Benefit | Platform saving model, cost comparison, saving distribution |
| Risk Analysis | Risk heatmap, category distribution, AI coverage radar |
| Data Tables | Browse all datasets, sort by column, export to CSV |

## Upload Your Own Data

- Click the **upload zone** in the left sidebar
- Supports **.xlsx**, **.xls**, **.csv** files
- First row must be column headers
- Data appears instantly in the Data Tables tab

## Data Sources

| Dataset | Type | Source |
|---------|------|--------|
| AU Aluminium Imports 2024 | **Real** | Australian Aluminium Council / ABS |
| LME Price History | **Real** | LME / World Bank / Statista |
| AU Trade Partners | **Real** | ABS International Trade Supplementary |
| Anti-Dumping Events | **Real** | AU Anti-Dumping Commission |
| India Suppliers | Estimated | Industry reports |
| Risk Indicators | Mixed | AU Anti-Dumping Commission + analysis |
| Construction Market | Estimated | Industry analysis |
| Price Comparison | Estimated | Market analysis |
| AI Cost-Benefit Model | Estimated | Project brief + analysis |

## Project Structure

```
novoanalytics/
├── manage.py
├── requirements.txt
├── README.md
├── novoanalytics/
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
└── dashboard/
    ├── views.py          ← All data & upload logic
    ├── urls.py
    ├── templates/
    │   └── dashboard/
    │       └── index.html
    └── static/
        └── dashboard/
            ├── css/style.css
            └── js/charts.js
```

## Tech Stack

- **Backend**: Django 4.2 (Python)
- **Frontend**: Bootstrap 5.3 + Bootstrap Icons
- **Charts**: Chart.js 4.4
- **Fonts**: DM Sans + Space Grotesk (Google Fonts)
- **File parsing**: openpyxl (Excel), csv (built-in)

## Customisation

To add a new default dataset, add an entry to the `DEFAULT_DATASETS` dict in `dashboard/views.py`.
Each entry needs: `label`, `source`, `type`, `headers`, `rows`, and optionally `chart`.
