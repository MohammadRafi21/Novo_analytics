import json, os, csv as csv_mod
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.conf import settings

try:
    import openpyxl
    OPENPYXL_AVAILABLE = True
except ImportError:
    OPENPYXL_AVAILABLE = False

# ── Opportunity scoring data ─────────────────────────────────────────────────
# Scores per country per year across 6 dimensions (0-10 each)
# Dimensions: price_competitiveness, supply_reliability, trade_policy,
#             logistics_ease, market_growth, ai_platform_fit
OPPORTUNITY_DATA = {
    "India": {
        "flag": "🇮🇳", "color": "#ff9933",
        "years": {
            2019: {"price_competitiveness":7.2,"supply_reliability":6.0,"trade_policy":7.5,"logistics_ease":5.5,"market_growth":6.8,"ai_platform_fit":6.0},
            2020: {"price_competitiveness":7.5,"supply_reliability":6.2,"trade_policy":7.8,"logistics_ease":5.8,"market_growth":6.5,"ai_platform_fit":6.5},
            2021: {"price_competitiveness":7.8,"supply_reliability":6.5,"trade_policy":8.0,"logistics_ease":6.2,"market_growth":7.2,"ai_platform_fit":7.0},
            2022: {"price_competitiveness":8.2,"supply_reliability":7.0,"trade_policy":8.5,"logistics_ease":6.5,"market_growth":7.8,"ai_platform_fit":7.5},
            2023: {"price_competitiveness":8.8,"supply_reliability":7.5,"trade_policy":9.0,"logistics_ease":7.0,"market_growth":8.5,"ai_platform_fit":8.5},
            2024: {"price_competitiveness":9.2,"supply_reliability":8.0,"trade_policy":9.2,"logistics_ease":7.5,"market_growth":9.0,"ai_platform_fit":9.0},
        }
    },
    "China": {
        "flag": "🇨🇳", "color": "#de2910",
        "years": {
            2019: {"price_competitiveness":9.0,"supply_reliability":9.2,"trade_policy":6.0,"logistics_ease":8.5,"market_growth":5.0,"ai_platform_fit":5.0},
            2020: {"price_competitiveness":9.0,"supply_reliability":9.0,"trade_policy":5.5,"logistics_ease":8.2,"market_growth":4.8,"ai_platform_fit":4.5},
            2021: {"price_competitiveness":8.5,"supply_reliability":8.8,"trade_policy":5.0,"logistics_ease":8.0,"market_growth":4.5,"ai_platform_fit":4.0},
            2022: {"price_competitiveness":8.0,"supply_reliability":8.5,"trade_policy":4.0,"logistics_ease":7.5,"market_growth":4.0,"ai_platform_fit":3.5},
            2023: {"price_competitiveness":7.0,"supply_reliability":8.0,"trade_policy":2.5,"logistics_ease":7.0,"market_growth":3.5,"ai_platform_fit":3.0},
            2024: {"price_competitiveness":6.5,"supply_reliability":7.5,"trade_policy":2.0,"logistics_ease":6.8,"market_growth":3.0,"ai_platform_fit":2.5},
        }
    },
    "Thailand": {
        "flag": "🇹🇭", "color": "#0033a0",
        "years": {
            2019: {"price_competitiveness":7.0,"supply_reliability":7.0,"trade_policy":7.0,"logistics_ease":7.2,"market_growth":5.5,"ai_platform_fit":5.5},
            2020: {"price_competitiveness":7.0,"supply_reliability":6.8,"trade_policy":7.2,"logistics_ease":7.0,"market_growth":5.0,"ai_platform_fit":5.5},
            2021: {"price_competitiveness":7.2,"supply_reliability":7.0,"trade_policy":7.3,"logistics_ease":7.2,"market_growth":5.5,"ai_platform_fit":6.0},
            2022: {"price_competitiveness":7.0,"supply_reliability":7.0,"trade_policy":7.0,"logistics_ease":7.0,"market_growth":5.5,"ai_platform_fit":6.0},
            2023: {"price_competitiveness":7.2,"supply_reliability":7.2,"trade_policy":7.5,"logistics_ease":7.3,"market_growth":6.0,"ai_platform_fit":6.5},
            2024: {"price_competitiveness":7.5,"supply_reliability":7.5,"trade_policy":7.8,"logistics_ease":7.5,"market_growth":6.5,"ai_platform_fit":7.0},
        }
    },
    "South Korea": {
        "flag": "🇰🇷", "color": "#003478",
        "years": {
            2019: {"price_competitiveness":6.5,"supply_reliability":8.5,"trade_policy":7.5,"logistics_ease":8.0,"market_growth":5.0,"ai_platform_fit":6.5},
            2020: {"price_competitiveness":6.5,"supply_reliability":8.5,"trade_policy":7.5,"logistics_ease":8.0,"market_growth":5.0,"ai_platform_fit":6.5},
            2021: {"price_competitiveness":6.3,"supply_reliability":8.5,"trade_policy":7.5,"logistics_ease":8.0,"market_growth":5.2,"ai_platform_fit":6.5},
            2022: {"price_competitiveness":6.0,"supply_reliability":8.2,"trade_policy":7.5,"logistics_ease":7.8,"market_growth":5.0,"ai_platform_fit":6.5},
            2023: {"price_competitiveness":6.0,"supply_reliability":8.0,"trade_policy":7.5,"logistics_ease":7.8,"market_growth":5.0,"ai_platform_fit":6.5},
            2024: {"price_competitiveness":6.0,"supply_reliability":8.0,"trade_policy":7.5,"logistics_ease":7.8,"market_growth":5.0,"ai_platform_fit":6.5},
        }
    },
    "Malaysia": {
        "flag": "🇲🇾", "color": "#cc0001",
        "years": {
            2019: {"price_competitiveness":7.0,"supply_reliability":6.5,"trade_policy":7.5,"logistics_ease":7.5,"market_growth":5.5,"ai_platform_fit":5.5},
            2020: {"price_competitiveness":7.0,"supply_reliability":6.5,"trade_policy":7.5,"logistics_ease":7.3,"market_growth":5.0,"ai_platform_fit":5.5},
            2021: {"price_competitiveness":7.2,"supply_reliability":6.8,"trade_policy":7.8,"logistics_ease":7.5,"market_growth":5.5,"ai_platform_fit":6.0},
            2022: {"price_competitiveness":7.3,"supply_reliability":7.0,"trade_policy":7.8,"logistics_ease":7.5,"market_growth":5.8,"ai_platform_fit":6.2},
            2023: {"price_competitiveness":7.5,"supply_reliability":7.2,"trade_policy":8.0,"logistics_ease":7.5,"market_growth":6.0,"ai_platform_fit":6.5},
            2024: {"price_competitiveness":7.5,"supply_reliability":7.5,"trade_policy":8.0,"logistics_ease":7.8,"market_growth":6.2,"ai_platform_fit":6.8},
        }
    },
    "Vietnam": {
        "flag": "🇻🇳", "color": "#da251d",
        "years": {
            2019: {"price_competitiveness":7.5,"supply_reliability":5.5,"trade_policy":7.0,"logistics_ease":6.0,"market_growth":6.5,"ai_platform_fit":5.0},
            2020: {"price_competitiveness":7.8,"supply_reliability":5.8,"trade_policy":7.2,"logistics_ease":6.2,"market_growth":6.8,"ai_platform_fit":5.5},
            2021: {"price_competitiveness":8.0,"supply_reliability":6.0,"trade_policy":7.5,"logistics_ease":6.5,"market_growth":7.2,"ai_platform_fit":6.0},
            2022: {"price_competitiveness":8.0,"supply_reliability":6.2,"trade_policy":7.5,"logistics_ease":6.5,"market_growth":7.0,"ai_platform_fit":6.0},
            2023: {"price_competitiveness":8.2,"supply_reliability":6.5,"trade_policy":7.8,"logistics_ease":6.8,"market_growth":7.5,"ai_platform_fit":6.5},
            2024: {"price_competitiveness":8.3,"supply_reliability":6.8,"trade_policy":8.0,"logistics_ease":7.0,"market_growth":7.8,"ai_platform_fit":7.0},
        }
    },
}

DIMENSION_WEIGHTS = {
    "price_competitiveness": 0.28,
    "supply_reliability":    0.20,
    "trade_policy":          0.22,
    "logistics_ease":        0.12,
    "market_growth":         0.10,
    "ai_platform_fit":       0.08,
}

def compute_score(dims):
    return round(sum(dims[d] * DIMENSION_WEIGHTS[d] for d in DIMENSION_WEIGHTS), 2)


# ── India profit data ────────────────────────────────────────────────────────
INDIA_PRICE_DATA = {
    "quarters": ["Q1'22","Q2'22","Q3'22","Q4'22","Q1'23","Q2'23","Q3'23","Q4'23","Q1'24","Q2'24","Q3'24","Q4'24"],
    "china_fob":  [2.55,2.60,2.65,2.70,2.72,2.78,2.80,2.85,2.88,2.92,2.95,3.00],
    "india_fob":  [2.10,2.12,2.15,2.18,2.20,2.22,2.25,2.28,2.30,2.33,2.35,2.38],
    "freight_china": [0.28,0.28,0.30,0.30,0.31,0.31,0.32,0.32,0.33,0.33,0.34,0.34],
    "freight_india": [0.22,0.22,0.23,0.23,0.24,0.24,0.25,0.25,0.25,0.26,0.26,0.26],
    "aud_usd":    [0.72,0.70,0.68,0.67,0.68,0.66,0.65,0.64,0.65,0.66,0.65,0.63],
    "antidumping_china": [0.00,0.00,0.00,0.00,0.00,0.00,0.15,0.18,0.20,0.20,0.22,0.25],
}


DEFAULT_DATASETS = {
    "au_imports": {
        "label": "AU Aluminium Imports 2024", "source": "Australian Aluminium Council / ABS", "type": "real",
        "headers": ["Product", "H1 Weight (t)", "H2 Weight (t)", "Total Weight (t)", "Total Value (AUD)"],
        "rows": [
            ["Sheet & Plate", "100,289", "100,883", "201,172", "A$1,015,931,763"],
            ["Extrusions", "46,211", "45,268", "91,480", "A$544,860,652"],
            ["Unwrought Alloys", "25,167", "24,193", "49,360", "A$190,948,799"],
            ["Alumina", "76,000 kt", "102,000 kt", "178,000 kt", "A$130,597,375"],
            ["Foil", "7,757", "8,691", "16,448", "A$123,217,244"],
            ["Wire", "1,552", "1,538", "3,090", "A$19,134,043"],
            ["Unwrought (unalloyed)", "119", "340", "459", "A$2,325,156"],
            ["Scrap", "759", "738", "1,497", "A$3,021,176"],
        ],
        "chart": {"type":"doughnut","labels":["Sheet & Plate","Extrusions","Unwrought Alloys","Alumina","Foil","Other"],"data":[201172,91480,49360,178000,16448,26533],"colors":["#0d6efd","#0dcaf0","#6f42c1","#198754","#fd7e14","#adb5bd"]}
    },
    "lme_prices": {
        "label": "LME Aluminium Price History", "source": "LME / World Bank / Statista", "type": "real",
        "headers": ["Year","LME Avg (USD/t)","AUD/USD Rate","AUD/t (est)","YoY Change","Key Event"],
        "rows": [
            ["2019","$1,794","0.695","$2,581","—","Trade war uncertainty"],
            ["2020","$1,704","0.691","$2,466","-5.0%","COVID-19 demand crash"],
            ["2021","$2,472","0.752","$3,288","+45.1%","Post-COVID surge, China energy crisis"],
            ["2022","$2,710","0.694","$3,905","+9.6%","Russia-Ukraine war (peak $4,074/t Mar 2022)"],
            ["2023","$2,250","0.660","$3,409","-17.0%","Post-crisis correction"],
            ["2024","$2,419","0.650","$3,722","+7.5%","Recovery phase, tight inventories"],
        ],
        "chart": {"type":"line","labels":["2019","2020","2021","2022","2023","2024"],"datasets":[{"label":"LME USD/t","data":[1794,1704,2472,2710,2250,2419],"color":"#0d6efd"},{"label":"AUD/t (est)","data":[2581,2466,3288,3905,3409,3722],"color":"#fd7e14"}]}
    },
    "au_partners": {
        "label": "AU Trade Partners (Total Goods)", "source": "ABS International Trade Supplementary", "type": "real",
        "headers": ["Country","FY18-19 (AUD B)","FY20-21 (AUD B)","FY22-23 (AUD B)","FY23-24 (AUD B)"],
        "rows": [["China","81.6","88.7","113.7","112.6"],["USA","27.8","28.5","49.7","42.4"],["Japan","22.8","19.2","32.4","34.3"],["South Korea","25.8","26.3","35.4","37.9"],["India (est)","8.2","9.1","16.3","18.5"],["Thailand (est)","10.1","9.8","14.2","15.6"]],
        "chart": {"type":"bar","labels":["FY18-19","FY20-21","FY22-23","FY23-24"],"datasets":[{"label":"China","data":[81.6,88.7,113.7,112.6],"color":"#0d6efd"},{"label":"USA","data":[27.8,28.5,49.7,42.4],"color":"#dc3545"},{"label":"Japan","data":[22.8,19.2,32.4,34.3],"color":"#198754"},{"label":"S Korea","data":[25.8,26.3,35.4,37.9],"color":"#fd7e14"},{"label":"India","data":[8.2,9.1,16.3,18.5],"color":"#6f42c1"}]}
    },
    "india_suppliers": {
        "label": "India Supplier Intelligence", "source": "Ministry of Commerce / Industry Reports (Estimated)", "type": "estimated",
        "headers": ["Supplier","State","Capacity (MT)","Price USD/kg","Score (1-10)","Risk","Recommended"],
        "rows": [["Hindalco Industries","Maharashtra","2,500,000","$2.10","9.2","Low","✓ Yes"],["Vedanta Aluminium","Odisha","1,900,000","$1.95","8.5","Low","✓ Yes"],["NALCO","Odisha","460,000","$1.85","8.8","Low","✓ Yes"],["BALCO","Chhattisgarh","245,000","$2.00","8.0","Low","✓ Yes"],["Century Aluminium","Gujarat","120,000","$2.05","7.8","Medium","✓ Yes"],["Rajhans Metals","Gujarat","45,000","$1.90","7.2","Medium","~ Conditional"],["GreenTech Aluminium","Tamil Nadu","12,000","$1.75","7.5","Low","✓ Yes"],["Aluplex India","Maharashtra","28,000","$1.88","6.9","Medium","~ Conditional"]],
        "chart": {"type":"bar","labels":["Hindalco","Vedanta","NALCO","BALCO","Century","Rajhans","GreenTech","Aluplex"],"data":[2500,1900,460,245,120,45,12,28],"colors":["#0d6efd","#0d6efd","#0dcaf0","#0dcaf0","#6f42c1","#adb5bd","#198754","#adb5bd"]}
    },
    "risk_indicators": {
        "label": "Trade Risk Indicators", "source": "AU Anti-Dumping Commission + Analysis", "type": "mixed",
        "headers": ["Risk Factor","Category","Impact","Probability","Status","AI Response"],
        "rows": [["US tariffs on aluminium","Geopolitical","High","High","Active (25%)","Re-routing AI"],["China anti-dumping","Trade Policy","High","Medium","ADN 2023/051 Active","Real-time alerts"],["AUD/USD volatility","Currency","Medium","High","High volatility","Hedging engine"],["Shipping cost spikes","Logistics","High","High","Post-COVID volatile","Freight cost AI"],["Port congestion AU","Logistics","High","Medium","Seasonal peaks","Delay modelling"],["Supplier quality defaults","Supply Chain","High","Medium","Ongoing risk","Quality risk scoring"],["Compliance/doc errors","Regulatory","Medium","High","Common SME issue","AI validator"],["China-AU tensions","Geopolitical","High","Medium","Fragile-improving","Diversification alerts"]],
        "chart": {"type":"radar","labels":["Geopolitical","Logistics","Currency","Trade Policy","Regulatory","Supply Chain"],"datasets":[{"label":"Risk Severity","data":[4,4,3,4,3,3],"color":"#dc3545"},{"label":"AI Coverage","data":[2,4,4,3,5,4],"color":"#0d6efd"}]}
    },
    "construction_market": {
        "label": "AU Construction Market Segments", "source": "Industry Analysis (Estimated)", "type": "estimated",
        "headers": ["Segment","Demand (MT)","Market Share %","Growth Rate %","Key States","AI Opportunity"],
        "rows": [["Residential High-Rise","85,000","24.3%","6.2%","NSW, VIC, QLD","Bulk purchasing, price alerts"],["Commercial Office","62,000","17.8%","3.5%","NSW, VIC","Supplier risk scoring"],["Infrastructure","58,000","16.6%","8.1%","All states","Predictive logistics, timeline AI"],["Industrial Facilities","44,000","12.6%","4.8%","WA, QLD","Automated customs"],["Residential Mid-Rise","38,000","10.9%","9.3%","All states","Group buying, dynamic pricing"],["Retail & Hospitality","27,000","7.7%","2.1%","NSW, VIC, QLD","Fast-track sourcing"],["Education & Health","22,000","6.3%","5.5%","All states","Low-cost sourcing"],["Renovation & Fitout","13,000","3.7%","7.8%","All states","Aggregated demand"]],
        "chart": {"type":"doughnut","labels":["Residential High-Rise","Commercial Office","Infrastructure","Industrial","Mid-Rise","Other"],"data":[85000,62000,58000,44000,38000,62000],"colors":["#0d6efd","#0dcaf0","#198754","#fd7e14","#6f42c1","#adb5bd"]}
    },
    "price_comparison": {
        "label": "China vs India Price Comparison", "source": "Market Analysis (Estimated)", "type": "estimated",
        "headers": ["Quarter","China FOB (USD/kg)","India FOB (USD/kg)","Total Cost China (AUD/kg)","Total Cost India (AUD/kg)","India Saving %"],
        "rows": [["Q1 2022","2.55","2.10","3.87","3.20","17.3%"],["Q2 2022","2.60","2.12","3.95","3.23","18.2%"],["Q3 2022","2.65","2.15","4.02","3.27","18.7%"],["Q4 2022","2.70","2.18","4.10","3.31","19.3%"],["Q1 2023","2.72","2.20","4.13","3.34","19.1%"],["Q2 2023","2.78","2.22","4.22","3.37","20.1%"],["Q3 2023","2.80","2.25","4.25","3.42","19.5%"],["Q4 2023","2.85","2.28","4.33","3.46","20.1%"],["Q1 2024","2.88","2.30","4.37","3.49","20.1%"],["Q2 2024","2.92","2.33","4.43","3.54","20.1%"],["Q3 2024","2.95","2.35","4.48","3.57","20.3%"],["Q4 2024","3.00","2.38","4.55","3.61","20.7%"]],
        "chart": {"type":"line","labels":["Q1'22","Q2'22","Q3'22","Q4'22","Q1'23","Q2'23","Q3'23","Q4'23","Q1'24","Q2'24","Q3'24","Q4'24"],"datasets":[{"label":"China Total Cost (AUD/kg)","data":[3.87,3.95,4.02,4.10,4.13,4.22,4.25,4.33,4.37,4.43,4.48,4.55],"color":"#dc3545"},{"label":"India Total Cost (AUD/kg)","data":[3.20,3.23,3.27,3.31,3.34,3.37,3.42,3.46,3.49,3.54,3.57,3.61],"color":"#198754"}]}
    },
    "ai_cost_benefit": {
        "label": "AI Platform Cost-Benefit Model", "source": "Project Brief + Analysis", "type": "estimated",
        "headers": ["Cost Category","Without AI (AUD)","With AI (AUD)","Saving (AUD)","Saving %","Notes"],
        "rows": [["Procurement (per 100MT)","$420,000","$388,000","$32,000","7.6%","5-8% reduction per brief"],["Freight & Logistics","$35,000","$28,000","$7,000","20.0%","Route optimisation AI"],["Customs & Compliance","$18,000","$9,000","$9,000","50.0%","Automated documentation"],["Supplier Vetting","$12,000","$3,000","$9,000","75.0%","AI risk scoring"],["Trade Finance Cost","$22,000","$17,000","$5,000","22.7%","AI credit scoring"],["Project Delay Cost","$45,000","$18,000","$27,000","60.0%","Predictive supply chain"],["Currency Risk","$8,000","$4,000","$4,000","50.0%","Hedging strategy AI"],["Manual Admin","$15,000","$4,000","$11,000","73.3%","Automation of docs & POs"],["TOTAL","$575,000","$471,000","$104,000","18.1%","Combined platform saving"]],
        "chart": {"type":"bar","labels":["Procurement","Freight","Customs","Vetting","Finance","Delay","Currency","Admin"],"datasets":[{"label":"Without AI","data":[420000,35000,18000,12000,22000,45000,8000,15000],"color":"#dc3545"},{"label":"With AI","data":[388000,28000,9000,3000,17000,18000,4000,4000],"color":"#198754"}]}
    },
    "opportunity_scores": {
        "label": "Country Opportunity Scores (Yearly)", "source": "Novoanalytics Scoring Model", "type": "estimated",
        "headers": ["Country","Year","Price Score","Supply Score","Trade Policy","Logistics","Market Growth","AI Fit","Total Score (Weighted)"],
        "rows": []
    },
}

# populate opportunity score rows
for country, cdata in OPPORTUNITY_DATA.items():
    for year, dims in cdata["years"].items():
        score = compute_score(dims)
        DEFAULT_DATASETS["opportunity_scores"]["rows"].append([
            country, str(year),
            str(dims["price_competitiveness"]), str(dims["supply_reliability"]),
            str(dims["trade_policy"]), str(dims["logistics_ease"]),
            str(dims["market_growth"]), str(dims["ai_platform_fit"]),
            str(score)
        ])

UPLOADED_DATASETS = {}


def parse_excel(file_path):
    if not OPENPYXL_AVAILABLE:
        return None
    try:
        wb = openpyxl.load_workbook(file_path, data_only=True)
        result = {}
        for sheet_name in wb.sheetnames:
            ws = wb[sheet_name]
            rows_data, headers = [], []
            for i, row in enumerate(ws.iter_rows(values_only=True)):
                if all(v is None for v in row): continue
                clean = [str(v) if v is not None else "" for v in row]
                if i == 0: headers = clean
                else: rows_data.append(clean)
            if headers and rows_data:
                result[sheet_name] = {"headers": headers, "rows": rows_data[:200]}
        return result
    except Exception:
        return None


def parse_csv_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8-sig') as f:
            rows = list(csv_mod.reader(f))
        if not rows: return None
        return {"Sheet1": {"headers": rows[0], "rows": rows[1:201]}}
    except Exception:
        return None


def index(request):
    ctx = {
        "datasets": DEFAULT_DATASETS,
        "uploaded": UPLOADED_DATASETS,
        "dataset_keys": list(DEFAULT_DATASETS.keys()),
        "kpis": [
            {"label": "Total AU Al Imports 2024", "value": "A$1.90B", "change": "+4.1% vs 2023", "trend": "up", "icon": "bi-box-seam", "source": "ABS/AAC"},
            {"label": "Extrusions Imported 2024", "value": "91,480 t", "change": "A$544.9M value", "trend": "neutral", "icon": "bi-layers", "source": "ABS/AAC"},
            {"label": "LME Price Avg 2024", "value": "$2,419/t", "change": "+7.5% vs 2023", "trend": "up", "icon": "bi-graph-up-arrow", "source": "World Bank/LME"},
            {"label": "China Dumping Duty", "value": "ACTIVE", "change": "ADN 2023/051 (Sept 2023)", "trend": "warning", "icon": "bi-exclamation-triangle", "source": "Anti-Dumping Commission"},
            {"label": "India Opportunity Score", "value": "8.7/10", "change": "Highest among all countries", "trend": "up", "icon": "bi-trophy", "source": "Novoanalytics Model"},
            {"label": "AI Platform Saving", "value": "5–8%", "change": "A$27M–A$43M on extrusions", "trend": "up", "icon": "bi-cpu", "source": "Project Brief"},
        ],
        "opportunity_data_json": json.dumps(OPPORTUNITY_DATA),
        "india_price_json": json.dumps(INDIA_PRICE_DATA),
        "dimension_weights_json": json.dumps(DIMENSION_WEIGHTS),
    }
    return render(request, 'dashboard/index.html', ctx)


@csrf_exempt
@require_http_methods(["POST"])
def upload_file(request):
    if 'file' not in request.FILES:
        return JsonResponse({"error": "No file provided"}, status=400)
    f = request.FILES['file']
    ext = os.path.splitext(f.name)[1].lower()
    if ext not in ['.xlsx', '.xls', '.csv']:
        return JsonResponse({"error": "Only .xlsx, .xls, .csv files supported"}, status=400)
    upload_dir = os.path.join(settings.MEDIA_ROOT, 'uploads')
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, f.name)
    with open(file_path, 'wb+') as dest:
        for chunk in f.chunks(): dest.write(chunk)
    parsed = parse_excel(file_path) if ext in ['.xlsx', '.xls'] else parse_csv_file(file_path)
    if not parsed:
        return JsonResponse({"error": "Could not parse file. Ensure it has a header row."}, status=400)
    key = os.path.splitext(f.name)[0].replace(' ', '_').lower()
    UPLOADED_DATASETS[key] = {"label": f.name, "source": "Uploaded by user", "type": "uploaded", "sheets": parsed, "filename": f.name}
    return JsonResponse({"success": True, "key": key, "label": f.name, "sheets": list(parsed.keys()),
        "preview": {s: {"headers": parsed[s]["headers"], "rows": parsed[s]["rows"][:5]} for s in parsed}})


def chart_data(request):
    key = request.GET.get('dataset', 'au_imports')
    ds = DEFAULT_DATASETS.get(key, DEFAULT_DATASETS['au_imports'])
    return JsonResponse({"label": ds["label"], "source": ds["source"], "type": ds["type"], "chart": ds.get("chart", {})})


def table_data(request):
    key = request.GET.get('dataset', 'au_imports')
    if key in UPLOADED_DATASETS:
        ud = UPLOADED_DATASETS[key]
        sheet = request.GET.get('sheet', list(ud['sheets'].keys())[0])
        sd = ud['sheets'].get(sheet, {})
        return JsonResponse({"label": ud["label"], "source": ud["source"], "type": "uploaded",
            "headers": sd.get("headers", []), "rows": sd.get("rows", []), "sheets": list(ud['sheets'].keys())})
    ds = DEFAULT_DATASETS.get(key, DEFAULT_DATASETS['au_imports'])
    return JsonResponse({"label": ds["label"], "source": ds["source"], "type": ds["type"],
        "headers": ds["headers"], "rows": ds["rows"]})


def opportunity_scores(request):
    year = request.GET.get('year', 'all')
    result = {}
    for country, cdata in OPPORTUNITY_DATA.items():
        years_out = {}
        for y, dims in cdata["years"].items():
            if year != 'all' and str(y) != str(year): continue
            years_out[y] = {**dims, "total": compute_score(dims)}
        result[country] = {"color": cdata["color"], "flag": cdata["flag"], "years": years_out}
    return JsonResponse({"data": result, "weights": DIMENSION_WEIGHTS})


def profit_calc(request):
    india_fob  = float(request.GET.get('india_fob', 2.30))
    sell_price = float(request.GET.get('sell_price', 4.50))
    freight    = float(request.GET.get('freight', 0.25))
    duty       = float(request.GET.get('duty', 0.0))
    volume_mt  = float(request.GET.get('volume', 100))
    aud_usd    = float(request.GET.get('aud_usd', 0.65))

    landed_usd = india_fob + freight + duty
    landed_aud = landed_usd / aud_usd
    profit_per_kg = sell_price - landed_aud
    margin_pct = (profit_per_kg / sell_price) * 100 if sell_price > 0 else 0
    profit_total = profit_per_kg * volume_mt * 1000

    china_fob_avg = 2.95
    china_landed = (china_fob_avg + 0.34) / aud_usd
    advantage_vs_china = china_landed - landed_aud

    return JsonResponse({
        "india_fob_usd": round(india_fob, 3),
        "freight_usd": round(freight, 3),
        "duty_usd": round(duty, 3),
        "landed_usd": round(landed_usd, 3),
        "landed_aud": round(landed_aud, 3),
        "sell_price_aud": round(sell_price, 3),
        "profit_per_kg": round(profit_per_kg, 3),
        "margin_pct": round(margin_pct, 1),
        "profit_total_aud": round(profit_total, 0),
        "volume_mt": volume_mt,
        "advantage_vs_china_aud": round(advantage_vs_china, 3),
        "breakeven_sell_price": round(landed_aud, 3),
        "china_landed_aud": round(china_landed, 3),
    })
