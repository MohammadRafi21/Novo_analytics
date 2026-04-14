# NOVO — AI-Driven Cross-Border Trade Intelligence Platform
### MBIS5015 Capstone Project | Group 5 | Australian Institute of Higher Education

## What this project does
A Django web application that helps Australian construction firms source aluminium
more cost-effectively from India instead of China. Features real ML clustering,
Claude AI integration, and 12 interactive analysis modules.

## Tech stack
- **Backend:** Django 4.2, Python 3.11
- **ML:** scikit-learn (k-means, PCA, StandardScaler), pandas, numpy
- **Frontend:** Bootstrap 5.3, Chart.js 4.4
- **AI:** Claude claude-sonnet-4-6 via Anthropic API
- **Deployment:** Railway / Render / PythonAnywhere

## Quick start (local)
```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
# Open http://127.0.0.1:8000
```

## Deploy to Railway
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

## Deploy to Render
Connect your GitHub repo at render.com
Start command: gunicorn novoanalytics.wsgi:application

## AI Advisor tab
Enter your Claude API key (from console.anthropic.com) in the AI Advisor tab.
The key is never stored server-side — used only for the current session.

## K-Means Clustering
Real scikit-learn k-means on 20 suppliers (6 features) and 10 construction
segments (6 features). Adjust k with the slider, switch between supplier and
segment mode, view elbow chart, PCA scatter, radar chart, and cluster cards.

## Dashboard tabs
1. Overview — KPI cards, import mix, LME trend, trade partners
2. AU Imports — product breakdown, H1/H2, opportunity sizing
3. Price Analysis — LME history, YoY volatility, China vs India comparison
4. K-Means Clustering — real ML, elbow, PCA scatter, cluster cards
5. India Suppliers — capacity bar, risk scatter, export growth
6. AU Construction — segment mix, bubble chart, demand+growth
7. AI Cost-Benefit — with/without AI comparison, saving donut
8. Risk Analysis — heatmap, category donut, AI coverage radar
9. Opportunity Scores — country score cards, trend lines, divergence
10. India Profit Calculator — 6 sliders, profit zone chart, waterfall
11. AI Trade Advisor — Claude AI chat + dataset analyser
12. Data Tables — sortable, CSV export, file upload

## Team
Group 5: Karuna Chapagain, Janak Chapagain, Nishan Bhujel, G M Rafi, Asmita Kunwar
Client: Sangeeta Aditya — NovoAnalytics, Sydney AU
