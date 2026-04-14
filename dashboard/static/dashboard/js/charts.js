'use strict';

const CHARTS = {};
const GRID = { color:'rgba(0,0,0,0.05)' };
const TICK = { color:'#8a95a3', font:{ size:11, family:'DM Sans' } };
const COUNTRY_COLORS = { India:'#ff9933', China:'#de2910', Thailand:'#0033a0', 'South Korea':'#003478', Malaysia:'#cc0001', Vietnam:'#da251d' };

function destroyChart(id) { if (CHARTS[id]) { CHARTS[id].destroy(); delete CHARTS[id]; } }
function makeChart(id, cfg) { destroyChart(id); const el = document.getElementById(id); if (el) CHARTS[id] = new Chart(el, cfg); }
function mkLegend(id, items) {
  const el = document.getElementById(id); if (!el) return;
  el.innerHTML = items.map(i => `<span class="legend-item"><span class="legend-sq" style="background:${i.color}"></span>${i.label}</span>`).join('');
}

const TAB_TITLES = { overview:'Overview', imports:'AU Imports', prices:'Price Analysis', suppliers:'India Suppliers', market:'AU Construction Market', cost:'AI Cost-Benefit', risk:'Risk Analysis', opportunity:'Opportunity Scores', profit:'India Profit Calculator', data:'Data Tables' };

function switchTab(name) {
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const pane = document.getElementById('tab-' + name);
  if (pane) pane.classList.add('active');
  document.querySelectorAll(`.nav-item[data-tab="${name}"]`).forEach(n => n.classList.add('active'));
  const t = document.getElementById('pageTitle'); if (t) t.textContent = TAB_TITLES[name] || name;
  setTimeout(() => initTabCharts(name), 60);
}

function initTabCharts(tab) {
  const fn = { overview:initOverview, imports:initImports, prices:initPrices, suppliers:initSuppliers, market:initMarket, cost:initCost, risk:initRisk, opportunity:initOpportunity, profit:initProfit, data:()=>renderTable('au_imports') };
  if (fn[tab]) fn[tab]();
}

// ── OVERVIEW ─────────────────────────────────────────────────────────────────
function initOverview() {
  mkLegend('legend-mix', [{label:'Sheet & Plate',color:'#0d6efd'},{label:'Extrusions',color:'#0dcaf0'},{label:'Unwrought Alloys',color:'#6f42c1'},{label:'Alumina',color:'#198754'},{label:'Foil',color:'#fd7e14'},{label:'Other',color:'#adb5bd'}]);
  makeChart('overviewMixChart', { type:'doughnut', data:{ labels:['Sheet & Plate','Extrusions','Unwrought Alloys','Alumina','Foil','Other'], datasets:[{ data:[201172,91480,49360,178000,16448,26533], backgroundColor:['#0d6efd','#0dcaf0','#6f42c1','#198754','#fd7e14','#adb5bd'], borderWidth:2, borderColor:'#fff', hoverOffset:6 }] }, options:{ responsive:true, maintainAspectRatio:false, cutout:'60%', plugins:{ legend:{display:false}, tooltip:{callbacks:{label:c=>` ${c.label}: ${c.raw.toLocaleString()} t`}} } } });

  makeChart('overviewPriceChart', { type:'line', data:{ labels:['2019','2020','2021','2022','2023','2024'], datasets:[{ label:'LME USD/t', data:[1794,1704,2472,2710,2250,2419], borderColor:'#0d6efd', backgroundColor:'rgba(13,110,253,0.07)', tension:0.4, fill:true, pointRadius:5, pointBackgroundColor:'#0d6efd', borderWidth:2 },{ label:'AUD/t (est)', data:[2581,2466,3288,3905,3409,3722], borderColor:'#fd7e14', backgroundColor:'transparent', tension:0.4, fill:false, pointRadius:4, pointBackgroundColor:'#fd7e14', borderWidth:2, borderDash:[5,4] }] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}, tooltip:{mode:'index',intersect:false}}, scales:{ x:{grid:GRID,ticks:TICK}, y:{grid:GRID,ticks:{...TICK,callback:v=>'$'+v.toLocaleString()}} } } });

  mkLegend('legend-partners', [{label:'China',color:'#0d6efd'},{label:'USA',color:'#dc3545'},{label:'Japan',color:'#198754'},{label:'S Korea',color:'#fd7e14'},{label:'India (est)',color:'#6f42c1'}]);
  makeChart('overviewPartnersChart', { type:'bar', data:{ labels:['FY18-19','FY20-21','FY22-23','FY23-24'], datasets:[{label:'China',data:[81.6,88.7,113.7,112.6],backgroundColor:'#0d6efd'},{label:'USA',data:[27.8,28.5,49.7,42.4],backgroundColor:'#dc3545'},{label:'Japan',data:[22.8,19.2,32.4,34.3],backgroundColor:'#198754'},{label:'S Korea',data:[25.8,26.3,35.4,37.9],backgroundColor:'#fd7e14'},{label:'India',data:[8.2,9.1,16.3,18.5],backgroundColor:'#6f42c1'}] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{ x:{grid:{display:false},ticks:TICK}, y:{grid:GRID,ticks:{...TICK,callback:v=>'A$'+v+'B'}} } } });
}

// ── IMPORTS ───────────────────────────────────────────────────────────────────
function initImports() {
  makeChart('importProductChart', { type:'bar', data:{ labels:['Sheet & Plate','Extrusions','Alumina','Unwrought Alloys','Foil','Wire','Scrap'], datasets:[{ label:'Weight (t)', data:[201172,91480,178000,49360,16448,3090,1497], backgroundColor:['#0d6efd','#0dcaf0','#198754','#6f42c1','#fd7e14','#20c997','#adb5bd'], borderWidth:0, borderRadius:4 }] }, options:{ indexAxis:'y', responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${c.raw.toLocaleString()} t`}}}, scales:{ x:{grid:GRID,ticks:{...TICK,callback:v=>v>=1000?(v/1000).toFixed(0)+'k':v}}, y:{grid:{display:false},ticks:TICK} } } });
  mkLegend('legend-h1h2', [{label:'H1 2024',color:'#0d6efd'},{label:'H2 2024',color:'#0dcaf0'}]);
  makeChart('importH1H2Chart', { type:'bar', data:{ labels:['Sheet & Plate','Extrusions','Alumina','Unwrought Alloys','Foil'], datasets:[{label:'H1 2024',data:[499.3,269.6,47.2,92.1,58.0],backgroundColor:'#0d6efd',borderRadius:3},{label:'H2 2024',data:[516.7,275.3,83.4,98.9,65.2],backgroundColor:'#0dcaf0',borderRadius:3}] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{ x:{grid:{display:false},ticks:TICK}, y:{grid:GRID,ticks:{...TICK,callback:v=>'A$'+v+'M'}} } } });
}

// ── PRICES ────────────────────────────────────────────────────────────────────
function initPrices() {
  mkLegend('legend-lme', [{label:'LME USD/t',color:'#0d6efd'},{label:'AUD/t (est)',color:'#fd7e14'}]);
  makeChart('lmeFullChart', { type:'line', data:{ labels:['2019','2020','2021','2022','2023','2024'], datasets:[{label:'LME USD/t',data:[1794,1704,2472,2710,2250,2419],borderColor:'#0d6efd',backgroundColor:'rgba(13,110,253,0.06)',tension:0.4,fill:true,pointRadius:5,pointBackgroundColor:'#0d6efd',borderWidth:2.5},{label:'AUD/t (est)',data:[2581,2466,3288,3905,3409,3722],borderColor:'#fd7e14',backgroundColor:'transparent',tension:0.4,fill:false,pointRadius:4,pointBackgroundColor:'#fd7e14',borderWidth:2,borderDash:[5,4]}] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false},tooltip:{mode:'index',intersect:false}}, scales:{ x:{grid:GRID,ticks:TICK}, y:{grid:GRID,min:1400,ticks:{...TICK,callback:v=>'$'+v.toLocaleString()}} } } });

  const changes = [0,-5.0,45.1,9.6,-17.0,7.5];
  makeChart('priceChangeChart', { type:'bar', data:{ labels:['2019','2020','2021','2022','2023','2024'], datasets:[{label:'YoY %',data:changes,backgroundColor:changes.map(v=>v>=0?'#198754':'#dc3545'),borderRadius:4,borderWidth:0}] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{ x:{grid:{display:false},ticks:TICK}, y:{grid:GRID,ticks:{...TICK,callback:v=>v+'%'}} } } });

  mkLegend('legend-compare', [{label:'China landed (AUD/kg)',color:'#dc3545'},{label:'India landed (AUD/kg)',color:'#198754'}]);
  makeChart('priceCompareChart', { type:'line', data:{ labels:["Q1'22","Q2'22","Q3'22","Q4'22","Q1'23","Q2'23","Q3'23","Q4'23","Q1'24","Q2'24","Q3'24","Q4'24"], datasets:[{label:'China landed',data:[3.87,3.95,4.02,4.10,4.13,4.22,4.25,4.33,4.37,4.43,4.48,4.55],borderColor:'#dc3545',backgroundColor:'rgba(220,53,69,0.06)',tension:0.3,fill:true,pointRadius:3,borderWidth:2},{label:'India landed',data:[3.20,3.23,3.27,3.31,3.34,3.37,3.42,3.46,3.49,3.54,3.57,3.61],borderColor:'#198754',backgroundColor:'rgba(25,135,84,0.06)',tension:0.3,fill:true,pointRadius:3,borderWidth:2}] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false},tooltip:{mode:'index',intersect:false}}, scales:{ x:{grid:GRID,ticks:{...TICK,maxRotation:45}}, y:{grid:GRID,ticks:{...TICK,callback:v=>'A$'+v}} } } });
}

// ── SUPPLIERS ─────────────────────────────────────────────────────────────────
function initSuppliers() {
  makeChart('supplierCapChart', { type:'bar', data:{ labels:['Hindalco','Vedanta','NALCO','BALCO','Century','Rajhans','GreenTech','Aluplex'], datasets:[{label:'Capacity (000 MT)',data:[2500,1900,460,245,120,45,12,28],backgroundColor:['#0d6efd','#0d6efd','#0dcaf0','#0dcaf0','#6f42c1','#adb5bd','#198754','#adb5bd'],borderRadius:4,borderWidth:0}] }, options:{ indexAxis:'y', responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${c.raw.toLocaleString()}k MT/year`}}}, scales:{ x:{grid:GRID,ticks:{...TICK,callback:v=>v+'k'}}, y:{grid:{display:false},ticks:TICK} } } });
  const supNames = ['Hindalco','Vedanta','NALCO','BALCO','Century','Rajhans','GreenTech','Aluplex'];
  makeChart('supplierScatterChart', { type:'bubble', data:{ datasets:[{label:'Suppliers',data:[{x:9.2,y:2.10,r:18},{x:8.5,y:1.95,r:16},{x:8.8,y:1.85,r:11},{x:8.0,y:2.00,r:9},{x:7.8,y:2.05,r:7},{x:7.2,y:1.90,r:5},{x:7.5,y:1.75,r:4},{x:6.9,y:1.88,r:4}],backgroundColor:'rgba(13,110,253,0.45)',borderColor:'#0d6efd',borderWidth:1.5}] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${supNames[c.dataIndex]}: Score ${c.raw.x}, $${c.raw.y}/kg`}}}, scales:{ x:{grid:GRID,ticks:TICK,title:{display:true,text:'AI Reliability Score',color:'#8a95a3',font:{size:11}},min:6,max:10}, y:{grid:GRID,ticks:{...TICK,callback:v=>'$'+v},title:{display:true,text:'Export Price (USD/kg)',color:'#8a95a3',font:{size:11}},min:1.6,max:2.3} } } });
  makeChart('indiaGrowthChart', { type:'bar', data:{ labels:['2021','2022','2023','2024','2024-25 TTM'], datasets:[{label:'Shipments',data:[18200,22400,25800,28900,31518],backgroundColor:['#e9ecef','#adb5bd','#6c757d','#0dcaf0','#198754'],borderRadius:4,borderWidth:0}] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${c.raw.toLocaleString()} shipments`}}}, scales:{ x:{grid:{display:false},ticks:TICK}, y:{grid:GRID,ticks:{...TICK,callback:v=>v.toLocaleString()}} } } });
}

// ── MARKET ────────────────────────────────────────────────────────────────────
function initMarket() {
  const sc = ['#0d6efd','#0dcaf0','#198754','#fd7e14','#6f42c1','#adb5bd'];
  const sl = ['Residential High-Rise','Commercial Office','Infrastructure','Industrial','Mid-Rise','Other'];
  mkLegend('legend-market', sl.map((l,i)=>({label:l,color:sc[i]})));
  makeChart('marketMixChart', { type:'doughnut', data:{ labels:sl, datasets:[{data:[85000,62000,58000,44000,38000,62000],backgroundColor:sc,borderWidth:2,borderColor:'#fff',hoverOffset:6}] }, options:{ responsive:true, maintainAspectRatio:false, cutout:'55%', plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${c.label}: ${c.raw.toLocaleString()} MT`}}} } });
  const fs = ['Residential High-Rise','Commercial Office','Infrastructure','Industrial','Mid-Rise','Retail','Education','Renovation'];
  const dem = [85000,62000,58000,44000,38000,27000,22000,13000];
  const gr = [6.2,3.5,8.1,4.8,9.3,2.1,5.5,7.8];
  makeChart('marketBubbleChart', { type:'bubble', data:{ datasets:[{label:'Segments',data:fs.map((s,i)=>({x:gr[i],y:dem[i]/1000,r:Math.sqrt(dem[i])/25})),backgroundColor:'rgba(13,110,253,0.45)',borderColor:'#0d6efd',borderWidth:1.5}] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${fs[c.dataIndex]}: ${c.raw.y}k MT, +${c.raw.x}% growth`}}}, scales:{ x:{grid:GRID,ticks:TICK,title:{display:true,text:'Growth Rate (%)',color:'#8a95a3',font:{size:11}}}, y:{grid:GRID,ticks:{...TICK,callback:v=>v+'k MT'},title:{display:true,text:'Annual Demand',color:'#8a95a3',font:{size:11}}} } } });
  mkLegend('legend-segdem', [{label:'Demand (MT)',color:'#0d6efd'},{label:'Growth %',color:'#198754'}]);
  makeChart('segmentDemandChart', { type:'bar', data:{ labels:fs.map(s=>s.split(' ').slice(0,2).join(' ')), datasets:[{label:'Demand (MT)',data:dem,backgroundColor:'#0d6efd',borderRadius:4,yAxisID:'y',borderWidth:0},{label:'Growth %',data:gr,type:'line',borderColor:'#198754',backgroundColor:'transparent',tension:0.3,pointRadius:4,pointBackgroundColor:'#198754',yAxisID:'y1',borderWidth:2}] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{ x:{grid:{display:false},ticks:{...TICK,maxRotation:30}}, y:{grid:GRID,ticks:{...TICK,callback:v=>v.toLocaleString()}}, y1:{position:'right',grid:{display:false},ticks:{...TICK,callback:v=>v+'%'}} } } });
}

// ── COST ──────────────────────────────────────────────────────────────────────
function initCost() {
  const cats = ['Procurement','Freight','Customs','Vetting','Finance','Delay','Currency','Admin'];
  const wo = [420000,35000,18000,12000,22000,45000,8000,15000];
  const wi = [388000,28000,9000,3000,17000,18000,4000,4000];
  mkLegend('legend-cost', [{label:'Without AI',color:'#dc3545'},{label:'With AI Platform',color:'#198754'}]);
  makeChart('costBenefitChart', { type:'bar', data:{ labels:cats, datasets:[{label:'Without AI',data:wo,backgroundColor:'#dc3545',borderRadius:4,borderWidth:0},{label:'With AI',data:wi,backgroundColor:'#198754',borderRadius:4,borderWidth:0}] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false},tooltip:{mode:'index',intersect:false,callbacks:{label:c=>` ${c.dataset.label}: A$${c.raw.toLocaleString()}`}}}, scales:{ x:{grid:{display:false},ticks:TICK}, y:{grid:GRID,ticks:{...TICK,callback:v=>'A$'+(v/1000).toFixed(0)+'k'}} } } });
  makeChart('savingMixChart', { type:'doughnut', data:{ labels:cats, datasets:[{data:wo.map((w,i)=>w-wi[i]),backgroundColor:['#0d6efd','#0dcaf0','#198754','#fd7e14','#6f42c1','#dc3545','#20c997','#adb5bd'],borderWidth:2,borderColor:'#fff',hoverOffset:6}] }, options:{ responsive:true, maintainAspectRatio:false, cutout:'55%', plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${c.label}: A$${c.raw.toLocaleString()} saved`}}} } });
}

// ── RISK ──────────────────────────────────────────────────────────────────────
function initRisk() {
  const ri = [{label:'Shipping cost spikes',x:4,y:4,r:16},{label:'China anti-dumping',x:4,y:3,r:14},{label:'Port congestion AU',x:3,y:4,r:12},{label:'China-AU tensions',x:4,y:2,r:11},{label:'AUD/USD volatility',x:3,y:3,r:10},{label:'Supplier quality',x:2,y:3,r:9},{label:'Compliance errors',x:3,y:2,r:8},{label:'AUD/INR fluctuation',x:2,y:2,r:7},{label:'Carbon adjustments',x:1,y:2,r:6},{label:'India export duty',x:2,y:1,r:5}];
  makeChart('riskHeatmapChart', { type:'bubble', data:{ datasets:[{label:'Risks',data:ri.map(r=>({x:r.x,y:r.y,r:r.r})),backgroundColor:ri.map(r=>r.x>=4&&r.y>=3?'rgba(220,53,69,0.6)':r.x>=3||r.y>=3?'rgba(253,126,20,0.6)':'rgba(25,135,84,0.5)'),borderColor:ri.map(r=>r.x>=4&&r.y>=3?'#dc3545':r.x>=3||r.y>=3?'#fd7e14':'#198754'),borderWidth:1.5}] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${ri[c.dataIndex].label}`}}}, scales:{ x:{grid:GRID,ticks:{...TICK,callback:v=>['','Low','Med','High','Critical'][v]||''},title:{display:true,text:'Impact',color:'#8a95a3',font:{size:11}},min:0,max:5}, y:{grid:GRID,ticks:{...TICK,callback:v=>['','Low','Med','High','Critical'][v]||''},title:{display:true,text:'Probability',color:'#8a95a3',font:{size:11}},min:0,max:5} } } });
  mkLegend('legend-riskcat', [{label:'Geopolitical',color:'#dc3545'},{label:'Logistics',color:'#fd7e14'},{label:'Currency',color:'#0d6efd'},{label:'Trade policy',color:'#6f42c1'},{label:'Regulatory',color:'#198754'},{label:'Supply chain',color:'#adb5bd'}]);
  makeChart('riskCatChart', { type:'doughnut', data:{ labels:['Geopolitical','Logistics','Currency','Trade policy','Regulatory','Supply chain'], datasets:[{data:[2,3,2,2,2,1],backgroundColor:['#dc3545','#fd7e14','#0d6efd','#6f42c1','#198754','#adb5bd'],borderWidth:2,borderColor:'#fff',hoverOffset:6}] }, options:{ responsive:true, maintainAspectRatio:false, cutout:'55%', plugins:{legend:{display:false}} } });
  mkLegend('legend-radar', [{label:'Risk Severity',color:'#dc3545'},{label:'AI Coverage',color:'#0d6efd'}]);
  makeChart('riskRadarChart', { type:'radar', data:{ labels:['Geopolitical','Logistics','Currency','Trade Policy','Regulatory','Supply Chain'], datasets:[{label:'Risk Severity',data:[4,4,3,4,3,3],backgroundColor:'rgba(220,53,69,0.15)',borderColor:'#dc3545',pointBackgroundColor:'#dc3545',borderWidth:2,pointRadius:4},{label:'AI Coverage',data:[2,4,4,3,5,4],backgroundColor:'rgba(13,110,253,0.15)',borderColor:'#0d6efd',pointBackgroundColor:'#0d6efd',borderWidth:2,pointRadius:4,borderDash:[4,3]}] }, options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{ r:{grid:{color:'rgba(0,0,0,0.07)'},ticks:{display:false,stepSize:1},pointLabels:{font:{size:11,family:'DM Sans'},color:'#4b5568'},min:0,max:5} } } });
}

// ── OPPORTUNITY SCORING ───────────────────────────────────────────────────────
function computeScore(dims) {
  return Object.keys(DIM_WEIGHTS).reduce((s, k) => s + (dims[k] || 0) * DIM_WEIGHTS[k], 0);
}

function initOpportunity() {
  buildScoreCards();
  buildOpportunityCharts('2024');
}

function updateOpportunityCharts() {
  const yr = document.getElementById('scoreYearFilter').value;
  buildScoreCards(yr);
  buildOpportunityCharts(yr);
}

function buildScoreCards(year = '2024') {
  const container = document.getElementById('countryScoreCards');
  if (!container) return;
  const scores = Object.entries(OPPORTUNITY_DATA).map(([country, cdata]) => {
    const yrs = Object.entries(cdata.years);
    const filtered = year === 'all' ? yrs : yrs.filter(([y]) => String(y) === year);
    const avg = filtered.reduce((s, [, d]) => s + computeScore(d), 0) / (filtered.length || 1);
    return { country, flag: cdata.flag, color: cdata.color, score: avg };
  }).sort((a, b) => b.score - a.score);

  container.innerHTML = scores.map((s, i) => `
    <div class="col-6 col-md-4 col-lg-2">
      <div class="score-card ${i === 0 ? 'rank-1' : ''}">
        <div class="score-flag">${s.flag}</div>
        <div class="score-country">${s.country}</div>
        <div class="score-value" style="color:${s.color}">${s.score.toFixed(1)}</div>
        <div class="score-bar-wrap"><div class="score-bar" style="width:${s.score*10}%;background:${s.color}"></div></div>
        <div class="score-rank">Rank #${i+1} · ${year === 'all' ? 'All years avg' : year}</div>
      </div>
    </div>`).join('');
}

function buildOpportunityCharts(year = 'all') {
  const countries = Object.keys(OPPORTUNITY_DATA);
  const colors = countries.map(c => COUNTRY_COLORS[c] || '#0d6efd');

  // Trend chart — all years
  const allYears = [2019,2020,2021,2022,2023,2024];
  mkLegend('legend-optrend', countries.map((c,i) => ({label:c, color:colors[i]})));
  makeChart('oppTrendChart', {
    type: 'line',
    data: {
      labels: allYears.map(String),
      datasets: countries.map((c, i) => ({
        label: c,
        data: allYears.map(y => {
          const d = OPPORTUNITY_DATA[c].years[y];
          return d ? parseFloat(computeScore(d).toFixed(2)) : null;
        }),
        borderColor: colors[i], backgroundColor: 'transparent',
        tension: 0.35, pointRadius: 4, borderWidth: 2.5,
        pointBackgroundColor: colors[i],
        borderDash: c === 'China' ? [5,3] : []
      }))
    },
    options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false},tooltip:{mode:'index',intersect:false}}, scales:{ x:{grid:GRID,ticks:TICK}, y:{grid:GRID,min:0,max:10,ticks:{...TICK,callback:v=>v.toFixed(1)}} } }
  });

  // Rank bar for selected year
  const yr = year === 'all' ? 2024 : parseInt(year);
  const rankData = countries.map(c => {
    const d = OPPORTUNITY_DATA[c].years[yr];
    return d ? parseFloat(computeScore(d).toFixed(2)) : 0;
  });
  const sortedIdx = [...rankData.keys()].sort((a,b) => rankData[b]-rankData[a]);
  makeChart('oppRankChart', {
    type: 'bar',
    data: {
      labels: sortedIdx.map(i => countries[i]),
      datasets: [{ label:'Score', data: sortedIdx.map(i => rankData[i]), backgroundColor: sortedIdx.map(i => colors[i]), borderRadius:6, borderWidth:0 }]
    },
    options: { indexAxis:'y', responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` Score: ${c.raw.toFixed(2)}/10`}}}, scales:{ x:{grid:GRID,ticks:TICK,min:0,max:10}, y:{grid:{display:false},ticks:TICK} } }
  });

  // India dimension breakdown
  const dimLabels = { price_competitiveness:'Price', supply_reliability:'Supply', trade_policy:'Trade Policy', logistics_ease:'Logistics', market_growth:'Growth', ai_platform_fit:'AI Fit' };
  const indiaYr = OPPORTUNITY_DATA.India.years[yr] || OPPORTUNITY_DATA.India.years[2024];
  const dimColors = ['#0d6efd','#198754','#ff9933','#0dcaf0','#6f42c1','#fd7e14'];
  mkLegend('legend-indiadim', Object.keys(dimLabels).map((k,i)=>({label:dimLabels[k],color:dimColors[i]})));
  makeChart('indiaDimChart', {
    type: 'bar',
    data: {
      labels: Object.values(dimLabels),
      datasets: [{ label:'India Score', data: Object.keys(dimLabels).map(k=>indiaYr[k]), backgroundColor: dimColors, borderRadius:5, borderWidth:0 }]
    },
    options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${c.label}: ${c.raw}/10`}}}, scales:{ x:{grid:{display:false},ticks:TICK}, y:{grid:GRID,min:0,max:10,ticks:{...TICK,callback:v=>v}} } }
  });

  // India vs China diverge
  mkLegend('legend-diverge', [{label:'India',color:'#ff9933'},{label:'China',color:'#de2910'},{label:'Gap (India advantage)',color:'rgba(25,135,84,0.2)'}]);
  const indiaScores = allYears.map(y => parseFloat(computeScore(OPPORTUNITY_DATA.India.years[y]).toFixed(2)));
  const chinaScores = allYears.map(y => parseFloat(computeScore(OPPORTUNITY_DATA.China.years[y]).toFixed(2)));
  makeChart('oppDivergeChart', {
    type: 'line',
    data: {
      labels: allYears.map(String),
      datasets: [
        { label:'India', data:indiaScores, borderColor:'#ff9933', backgroundColor:'rgba(255,153,51,0.1)', tension:0.35, fill:false, pointRadius:4, pointBackgroundColor:'#ff9933', borderWidth:2.5 },
        { label:'China', data:chinaScores, borderColor:'#de2910', backgroundColor:'transparent', tension:0.35, fill:false, pointRadius:4, pointBackgroundColor:'#de2910', borderWidth:2, borderDash:[5,3] },
        { label:'Gap', data:indiaScores.map((v,i)=>v-chinaScores[i]), borderColor:'transparent', backgroundColor:'rgba(25,135,84,0.15)', tension:0.35, fill:'origin', pointRadius:0, borderWidth:0, yAxisID:'y1' }
      ]
    },
    options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false},tooltip:{mode:'index',intersect:false}}, scales:{ x:{grid:GRID,ticks:TICK}, y:{grid:GRID,min:0,max:10,ticks:{...TICK,callback:v=>v.toFixed(1)}}, y1:{position:'right',grid:{display:false},ticks:{...TICK,callback:v=>'+'+v.toFixed(1)}} } }
  });
}

// ── INDIA PROFIT CALCULATOR ───────────────────────────────────────────────────
let profitCalcTimer = null;

function initProfit() {
  updateProfitCalc();
}

function updateProfitCalc() {
  // Update slider labels
  const sliders = { india_fob:'lbl_india_fob', sell_price:'lbl_sell_price', freight:'lbl_freight', duty:'lbl_duty', audusd:'lbl_audusd', volume:'lbl_volume' };
  const fmts = { india_fob:v=>'$'+parseFloat(v).toFixed(2), sell_price:v=>'$'+parseFloat(v).toFixed(2), freight:v=>'$'+parseFloat(v).toFixed(2), duty:v=>'$'+parseFloat(v).toFixed(2), audusd:v=>parseFloat(v).toFixed(2), volume:v=>parseInt(v)+' MT' };
  for (const [k,lblId] of Object.entries(sliders)) {
    const sl = document.getElementById('sl_'+k); const lbl = document.getElementById(lblId);
    if (sl && lbl) lbl.textContent = fmts[k](sl.value);
  }

  const india_fob = parseFloat(document.getElementById('sl_india_fob').value);
  const sell_price = parseFloat(document.getElementById('sl_sell_price').value);
  const freight = parseFloat(document.getElementById('sl_freight').value);
  const duty = parseFloat(document.getElementById('sl_duty').value);
  const aud_usd = parseFloat(document.getElementById('sl_audusd').value);
  const volume = parseInt(document.getElementById('sl_volume').value);

  const landed_usd = india_fob + freight + duty;
  const landed_aud = landed_usd / aud_usd;
  const profit_kg = sell_price - landed_aud;
  const margin_pct = sell_price > 0 ? (profit_kg / sell_price * 100) : 0;
  const total_profit = profit_kg * volume * 1000;
  const china_fob_avg = 2.95;
  const china_landed = (china_fob_avg + 0.34) / aud_usd;
  const advantage = china_landed - landed_aud;

  // Update KPI cards
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('val_landed', 'A$' + landed_aud.toFixed(2));
  set('val_profit_kg', (profit_kg >= 0 ? '+' : '') + 'A$' + profit_kg.toFixed(2));
  set('val_margin', margin_pct.toFixed(1) + '%');
  set('val_total_profit', (total_profit >= 0 ? '+' : '') + 'A$' + Math.round(total_profit).toLocaleString());

  const profitKg = document.getElementById('val_profit_kg');
  if (profitKg) profitKg.className = 'kpi-value ' + (profit_kg >= 0 ? 'text-success' : 'text-danger');
  const marginEl = document.getElementById('val_margin');
  if (marginEl) marginEl.className = 'kpi-value ' + (margin_pct >= 0 ? 'text-success' : 'text-danger');
  const totalEl = document.getElementById('val_total_profit');
  if (totalEl) totalEl.className = 'kpi-value ' + (total_profit >= 0 ? 'text-success' : 'text-danger');

  // Cost breakdown
  const bd = document.getElementById('profitBreakdown');
  if (bd) bd.innerHTML = `
    <div class="breakdown-row"><span class="breakdown-label">India FOB (USD/kg)</span><span class="breakdown-val">$${india_fob.toFixed(3)}</span></div>
    <div class="breakdown-row"><span class="breakdown-label">Freight (USD/kg)</span><span class="breakdown-val">$${freight.toFixed(3)}</span></div>
    <div class="breakdown-row"><span class="breakdown-label">Duties (USD/kg)</span><span class="breakdown-val">$${duty.toFixed(3)}</span></div>
    <div class="breakdown-row"><span class="breakdown-label">Total Landed (USD/kg)</span><span class="breakdown-val">$${landed_usd.toFixed(3)}</span></div>
    <div class="breakdown-row"><span class="breakdown-label">AUD/USD Rate</span><span class="breakdown-val">${aud_usd.toFixed(3)}</span></div>
    <div class="breakdown-row"><span class="breakdown-label" style="font-weight:600">Landed Cost (AUD/kg)</span><span class="breakdown-val text-danger">A$${landed_aud.toFixed(3)}</span></div>
    <div class="breakdown-row"><span class="breakdown-label">Sell Price (AUD/kg)</span><span class="breakdown-val">A$${sell_price.toFixed(3)}</span></div>
    <div class="breakdown-row"><span class="breakdown-label" style="font-weight:700;color:#198754">Profit (AUD/kg)</span><span class="breakdown-val ${profit_kg>=0?'text-success':'text-danger'}" style="font-weight:700">${profit_kg>=0?'+':''}A$${profit_kg.toFixed(3)}</span></div>
  `;

  const ab = document.getElementById('advantageBox');
  if (ab) {
    const isProfit = profit_kg >= 0;
    ab.style.background = isProfit ? '#f0faf5' : '#fff5f5';
    ab.style.borderColor = isProfit ? '#a3d9b8' : '#fca5a5';
    ab.innerHTML = `
      <div style="font-size:12px;font-weight:600;color:${isProfit?'#15803d':'#dc2626'};margin-bottom:6px">
        ${isProfit ? '✓ Profitable at this sell price' : '✗ Below breakeven — increase sell price'}
      </div>
      <div style="font-size:11px;color:#4b5568;line-height:1.7">
        Breakeven sell price: <strong>A$${landed_aud.toFixed(2)}/kg</strong><br>
        India vs China advantage: <strong class="text-success">A$${advantage.toFixed(2)}/kg cheaper</strong><br>
        China landed cost: <strong>A$${china_landed.toFixed(2)}/kg</strong> (vs India A$${landed_aud.toFixed(2)}/kg)<br>
        Total order profit (${volume} MT): <strong class="${isProfit?'text-success':'text-danger'}">${isProfit?'+':''}A$${Math.round(total_profit).toLocaleString()}</strong>
      </div>`;
  }

  clearTimeout(profitCalcTimer);
  profitCalcTimer = setTimeout(() => updateProfitCharts(india_fob, sell_price, freight, duty, aud_usd, landed_aud), 80);
}

function updateProfitCharts(india_fob, sell_price, freight, duty, aud_usd, landed_aud) {
  const Q = INDIA_PRICE_DATA;
  const quarterlyLanded = Q.india_fob.map((f,i) => parseFloat(((f + Q.freight_india[i] + 0) / Q.aud_usd[i]).toFixed(3)));
  const quarterlySell = Q.quarters.map(() => sell_price);
  const profitZone = quarterlyLanded.map(l => Math.max(0, sell_price - l));
  const lossZone = quarterlyLanded.map(l => Math.min(0, sell_price - l));

  makeChart('profitZoneChart', {
    type: 'line',
    data: {
      labels: Q.quarters,
      datasets: [
        { label:'India landed (AUD/kg)', data:quarterlyLanded, borderColor:'#dc3545', backgroundColor:'transparent', tension:0.3, pointRadius:3, borderWidth:2 },
        { label:'Your sell price', data:quarterlySell, borderColor:'#0d6efd', backgroundColor:'transparent', tension:0, pointRadius:0, borderWidth:2, borderDash:[6,3] },
        { label:'Profit zone', data:quarterlyLanded.map((l,i)=>({x:Q.quarters[i],y:sell_price,y0:l})), type:'line',
          fill: { target: 1, above:'rgba(25,135,84,0.18)', below:'rgba(220,53,69,0.12)' },
          data: quarterlySell, borderColor:'transparent', backgroundColor:'transparent', pointRadius:0 }
      ]
    },
    options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false},tooltip:{mode:'index',intersect:false,callbacks:{label:c=>` ${c.dataset.label}: A$${parseFloat(c.raw).toFixed(3)}`}}}, scales:{ x:{grid:GRID,ticks:{...TICK,maxRotation:45}}, y:{grid:GRID,ticks:{...TICK,callback:v=>'A$'+v}} } }
  });

  // Waterfall: cost breakdown India vs China
  const china_landed = (2.95 + 0.34 + 0.22) / aud_usd;
  makeChart('waterfallChart', {
    type: 'bar',
    data: {
      labels: ['India FOB','+ Freight','+ Duty','= Landed','Sell Price','Profit','China Landed'],
      datasets: [{ label:'AUD/kg',
        data: [india_fob/aud_usd, freight/aud_usd, duty/aud_usd, landed_aud, sell_price, sell_price - landed_aud, china_landed],
        backgroundColor: ['#0dcaf0','#adb5bd','#fd7e14','#0d6efd','#6f42c1',sell_price-landed_aud>=0?'#198754':'#dc3545','#de2910'],
        borderRadius: 4, borderWidth: 0 }]
    },
    options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` A$${parseFloat(c.raw).toFixed(3)}/kg`}}}, scales:{ x:{grid:{display:false},ticks:{...TICK,maxRotation:30}}, y:{grid:GRID,ticks:{...TICK,callback:v=>'A$'+parseFloat(v).toFixed(2)}} } }
  });
}

// ── DATA TABLE ────────────────────────────────────────────────────────────────
let currentSort = {col:-1,dir:1};
let currentTableData = {headers:[],rows:[]};

function renderTable(key) {
  fetch(`/api/table-data/?dataset=${key}`).then(r=>r.json()).then(data => {
    currentTableData = data; currentSort = {col:-1,dir:1};
    buildTable(data.headers, data.rows);
    const src = document.getElementById('tableSourceBadge');
    if (src) { const tc = data.type==='real'?'success':data.type==='uploaded'?'primary':'warning'; src.innerHTML = `<span class="badge bg-${tc}-subtle text-${tc} me-2">${data.type.toUpperCase()}</span><small class="text-muted">Source: ${data.source}</small>`; }
    const info = document.getElementById('tableInfo');
    if (info) info.textContent = `${data.rows.length} rows × ${data.headers.length} columns`;
  });
}

function buildTable(headers, rows) {
  const thead = document.getElementById('tableHead'); const tbody = document.getElementById('tableBody');
  if (!thead||!tbody) return;
  thead.innerHTML = '<tr>' + headers.map((h,i) => `<th onclick="sortTable(${i})">${h} <i class="bi bi-arrow-down-up ms-1" style="font-size:9px;opacity:0.5"></i></th>`).join('') + '</tr>';
  renderTableRows(rows);
}

function renderTableRows(rows) {
  const tbody = document.getElementById('tableBody'); if (!tbody) return;
  tbody.innerHTML = rows.map(row => '<tr>' + row.map(cell => `<td>${cell}</td>`).join('') + '</tr>').join('');
}

function sortTable(colIdx) {
  if (currentSort.col===colIdx) currentSort.dir*=-1; else { currentSort.col=colIdx; currentSort.dir=1; }
  const sorted = [...currentTableData.rows].sort((a,b) => {
    const na=parseFloat(String(a[colIdx]).replace(/[^0-9.\-]/g,'')), nb=parseFloat(String(b[colIdx]).replace(/[^0-9.\-]/g,''));
    if (!isNaN(na)&&!isNaN(nb)) return (na-nb)*currentSort.dir;
    return String(a[colIdx]).localeCompare(String(b[colIdx]))*currentSort.dir;
  });
  renderTableRows(sorted);
}

function exportCSV() {
  const {headers,rows} = currentTableData; if (!headers.length) return;
  const lines = [headers.join(','), ...rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(','))];
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/csv'}));
  a.download = 'novoanalytics_export.csv'; a.click();
}

// ── FILE UPLOAD ───────────────────────────────────────────────────────────────
function handleUpload(file) {
  const status = document.getElementById('uploadStatus');
  if (!file) return;
  const ext = file.name.split('.').pop().toLowerCase();
  if (!['xlsx','xls','csv'].includes(ext)) { status.innerHTML = '<span class="text-danger">Only .xlsx, .xls, .csv supported</span>'; return; }
  status.innerHTML = '<span class="text-muted"><i class="bi bi-hourglass-split me-1"></i>Uploading...</span>';
  const fd = new FormData(); fd.append('file', file);
  fetch('/upload/', {method:'POST',body:fd}).then(r=>r.json()).then(data => {
    if (data.success) {
      status.innerHTML = '<span class="text-success"><i class="bi bi-check-circle me-1"></i>Uploaded!</span>';
      addUploadedDataset(data.key, data.label);
      showToast(`"${data.label}" loaded — ${data.sheets.length} sheet(s)`);
    } else { status.innerHTML = `<span class="text-danger">${data.error}</span>`; }
  }).catch(() => { status.innerHTML = '<span class="text-danger">Upload failed</span>'; });
}

function addUploadedDataset(key, label) {
  const list = document.getElementById('datasetList');
  const item = document.createElement('div');
  item.className='dataset-item'; item.dataset.key=key; item.dataset.type='uploaded';
  item.innerHTML=`<span class="ds-dot uploaded"></span><span class="ds-name">${label}</span><span class="badge-type uploaded">New</span>`;
  item.addEventListener('click', () => { document.querySelectorAll('.dataset-item').forEach(d=>d.classList.remove('active')); item.classList.add('active'); const ts=document.getElementById('tableDatasetSelect'); if(ts){const o=document.createElement('option');o.value=key;o.textContent=label;ts.appendChild(o);ts.value=key;} switchTab('data'); setTimeout(()=>renderTable(key),100); });
  list.appendChild(item);
  const ts=document.getElementById('tableDatasetSelect'); if(ts){const o=document.createElement('option');o.value=key;o.textContent=label;ts.appendChild(o);}
}

function showToast(msg) {
  const el=document.getElementById('uploadToast'); const m=document.getElementById('toastMsg');
  if(el&&m){m.textContent=msg;new bootstrap.Toast(el,{delay:3500}).show();}
}

// ── INIT ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-item[data-tab]').forEach(btn => btn.addEventListener('click', e => { e.preventDefault(); switchTab(btn.dataset.tab); }));
  document.querySelectorAll('.dataset-item[data-key]').forEach(item => item.addEventListener('click', () => { document.querySelectorAll('.dataset-item').forEach(d=>d.classList.remove('active')); item.classList.add('active'); const ts=document.getElementById('tableDatasetSelect'); if(ts) ts.value=item.dataset.key; switchTab('data'); setTimeout(()=>renderTable(item.dataset.key),100); }));
  const ts=document.getElementById('tableDatasetSelect'); if(ts) ts.addEventListener('change', e=>renderTable(e.target.value));
  const eb=document.getElementById('exportCsvBtn'); if(eb) eb.addEventListener('click', exportCSV);
  const fi=document.getElementById('fileInput'); const uz=document.getElementById('uploadZone');
  if(uz){uz.addEventListener('click',()=>fi&&fi.click());uz.addEventListener('dragover',e=>{e.preventDefault();uz.classList.add('dragover');});uz.addEventListener('dragleave',()=>uz.classList.remove('dragover'));uz.addEventListener('drop',e=>{e.preventDefault();uz.classList.remove('dragover');if(e.dataTransfer.files.length)handleUpload(e.dataTransfer.files[0]);});}
  if(fi) fi.addEventListener('change',e=>e.target.files.length&&handleUpload(e.target.files[0]));
  const tog=document.getElementById('sidebarToggle'); const sb=document.getElementById('sidebar');
  if(tog&&sb) tog.addEventListener('click',()=>sb.classList.toggle('open'));
  initOverview();
});
