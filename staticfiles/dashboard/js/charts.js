'use strict';

// ── Helpers ──────────────────────────────────────────────────────────────────
const GRID = { color: 'rgba(0,0,0,0.05)' };
const TICK = { color: '#8a95a3', font: { size: 11, family: 'DM Sans' } };
const charts = {};

function mkLegend(containerId, items) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = items.map(i =>
    `<span class="legend-item"><span class="legend-sq" style="background:${i.color}"></span>${i.label}</span>`
  ).join('');
}

function destroyChart(id) {
  if (charts[id]) { charts[id].destroy(); delete charts[id]; }
}

function makeChart(id, cfg) {
  destroyChart(id);
  const el = document.getElementById(id);
  if (!el) return;
  charts[id] = new Chart(el, cfg);
}

// ── TAB SWITCHING ─────────────────────────────────────────────────────────────
const TAB_TITLES = {
  overview: 'Overview', imports: 'AU Imports', prices: 'Price Analysis',
  suppliers: 'India Suppliers', market: 'AU Construction Market',
  cost: 'AI Cost-Benefit', risk: 'Risk Analysis', data: 'Data Tables'
};

function switchTab(tabName) {
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const pane = document.getElementById('tab-' + tabName);
  if (pane) pane.classList.add('active');
  document.querySelectorAll(`.nav-item[data-tab="${tabName}"]`).forEach(n => n.classList.add('active'));
  const titleEl = document.getElementById('pageTitle');
  if (titleEl) titleEl.textContent = TAB_TITLES[tabName] || tabName;
  setTimeout(() => initTabCharts(tabName), 60);
}

function initTabCharts(tab) {
  if (tab === 'overview') initOverview();
  else if (tab === 'imports') initImports();
  else if (tab === 'prices') initPrices();
  else if (tab === 'suppliers') initSuppliers();
  else if (tab === 'market') initMarket();
  else if (tab === 'cost') initCost();
  else if (tab === 'risk') initRisk();
  else if (tab === 'data') renderTable('au_imports');
}

// ── OVERVIEW ─────────────────────────────────────────────────────────────────
function initOverview() {
  // Import mix doughnut
  mkLegend('legend-mix', [
    { label: 'Sheet & Plate', color: '#0d6efd' }, { label: 'Extrusions', color: '#0dcaf0' },
    { label: 'Unwrought Alloys', color: '#6f42c1' }, { label: 'Alumina', color: '#198754' },
    { label: 'Foil', color: '#fd7e14' }, { label: 'Other', color: '#adb5bd' },
  ]);
  makeChart('overviewMixChart', {
    type: 'doughnut',
    data: {
      labels: ['Sheet & Plate', 'Extrusions', 'Unwrought Alloys', 'Alumina', 'Foil', 'Other'],
      datasets: [{ data: [201172, 91480, 49360, 178000, 16448, 26533],
        backgroundColor: ['#0d6efd','#0dcaf0','#6f42c1','#198754','#fd7e14','#adb5bd'],
        borderWidth: 2, borderColor: '#fff', hoverOffset: 6 }]
    },
    options: { responsive: true, maintainAspectRatio: false, cutout: '60%',
      plugins: { legend: { display: false }, tooltip: { callbacks: {
        label: c => ` ${c.label}: ${c.raw.toLocaleString()} t`
      }}}
    }
  });

  // LME price line
  makeChart('overviewPriceChart', {
    type: 'line',
    data: {
      labels: ['2019','2020','2021','2022','2023','2024'],
      datasets: [
        { label: 'LME USD/t', data: [1794,1704,2472,2710,2250,2419],
          borderColor: '#0d6efd', backgroundColor: 'rgba(13,110,253,0.07)',
          tension: 0.4, fill: true, pointRadius: 5, pointBackgroundColor: '#0d6efd',
          borderWidth: 2 },
        { label: 'AUD/t (est)', data: [2581,2466,3288,3905,3409,3722],
          borderColor: '#fd7e14', backgroundColor: 'transparent',
          tension: 0.4, fill: false, pointRadius: 4, pointBackgroundColor: '#fd7e14',
          borderWidth: 2, borderDash: [5,4] },
      ]
    },
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
      scales: { x: { grid: GRID, ticks: TICK }, y: { grid: GRID, ticks: { ...TICK, callback: v => '$' + v.toLocaleString() } } }
    }
  });

  // Partners grouped bar
  mkLegend('legend-partners', [
    { label: 'China', color: '#0d6efd' }, { label: 'USA', color: '#dc3545' },
    { label: 'Japan', color: '#198754' }, { label: 'S Korea', color: '#fd7e14' },
    { label: 'India (est)', color: '#6f42c1' },
  ]);
  makeChart('overviewPartnersChart', {
    type: 'bar',
    data: {
      labels: ['FY18-19','FY20-21','FY22-23','FY23-24'],
      datasets: [
        { label:'China', data:[81.6,88.7,113.7,112.6], backgroundColor:'#0d6efd' },
        { label:'USA', data:[27.8,28.5,49.7,42.4], backgroundColor:'#dc3545' },
        { label:'Japan', data:[22.8,19.2,32.4,34.3], backgroundColor:'#198754' },
        { label:'S Korea', data:[25.8,26.3,35.4,37.9], backgroundColor:'#fd7e14' },
        { label:'India', data:[8.2,9.1,16.3,18.5], backgroundColor:'#6f42c1' },
      ]
    },
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: { grid: { display: false }, ticks: TICK },
        y: { grid: GRID, ticks: { ...TICK, callback: v => 'A$' + v + 'B' } } }
    }
  });
}

// ── IMPORTS ───────────────────────────────────────────────────────────────────
function initImports() {
  makeChart('importProductChart', {
    type: 'bar',
    data: {
      labels: ['Sheet & Plate','Extrusions','Alumina','Unwrought Alloys','Foil','Wire','Scrap','Unwrought (unalloyed)'],
      datasets: [{ label: 'Weight (tonnes)', data: [201172,91480,178000,49360,16448,3090,1497,459],
        backgroundColor: ['#0d6efd','#0dcaf0','#198754','#6f42c1','#fd7e14','#20c997','#adb5bd','#e9ecef'],
        borderWidth: 0, borderRadius: 4 }]
    },
    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: {
        label: c => ` ${c.raw.toLocaleString()} tonnes`
      }}},
      scales: { x: { grid: GRID, ticks: { ...TICK, callback: v => v >= 1000 ? (v/1000).toFixed(0)+'k' : v } },
        y: { grid: { display: false }, ticks: TICK } }
    }
  });

  mkLegend('legend-h1h2', [
    { label: 'H1 2024', color: '#0d6efd' }, { label: 'H2 2024', color: '#0dcaf0' },
  ]);
  makeChart('importH1H2Chart', {
    type: 'bar',
    data: {
      labels: ['Sheet & Plate','Extrusions','Alumina','Unwrought Alloys','Foil'],
      datasets: [
        { label:'H1 2024', data:[499.3,269.6,47.2,92.1,58.0], backgroundColor:'#0d6efd', borderRadius: 3 },
        { label:'H2 2024', data:[516.7,275.3,83.4,98.9,65.2], backgroundColor:'#0dcaf0', borderRadius: 3 },
      ]
    },
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: { grid: { display: false }, ticks: TICK },
        y: { grid: GRID, ticks: { ...TICK, callback: v => 'A$' + v + 'M' } } }
    }
  });
}

// ── PRICES ────────────────────────────────────────────────────────────────────
function initPrices() {
  mkLegend('legend-lme', [
    { label: 'LME Annual Avg (USD/t)', color: '#0d6efd' },
    { label: 'AUD/t (est)', color: '#fd7e14' },
  ]);
  makeChart('lmeFullChart', {
    type: 'line',
    data: {
      labels: ['2019','2020','2021','2022','2023','2024'],
      datasets: [
        { label:'LME USD/t', data:[1794,1704,2472,2710,2250,2419],
          borderColor:'#0d6efd', backgroundColor:'rgba(13,110,253,0.06)',
          tension:0.4, fill:true, pointRadius:5, pointBackgroundColor:'#0d6efd', borderWidth:2.5 },
        { label:'AUD/t (est)', data:[2581,2466,3288,3905,3409,3722],
          borderColor:'#fd7e14', backgroundColor:'transparent',
          tension:0.4, fill:false, pointRadius:4, pointBackgroundColor:'#fd7e14',
          borderWidth:2, borderDash:[5,4] }
      ]
    },
    options: { responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false}, tooltip:{mode:'index',intersect:false} },
      scales:{ x:{grid:GRID,ticks:TICK}, y:{grid:GRID,min:1400, ticks:{...TICK,callback:v=>'$'+v.toLocaleString()}} }
    }
  });

  const changes = [0,-5.0,45.1,9.6,-17.0,7.5];
  makeChart('priceChangeChart', {
    type: 'bar',
    data: {
      labels: ['2019','2020','2021','2022','2023','2024'],
      datasets: [{ label:'YoY %', data:changes,
        backgroundColor: changes.map(v => v >= 0 ? '#198754' : '#dc3545'),
        borderRadius: 4, borderWidth: 0 }]
    },
    options: { responsive:true, maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{ x:{grid:{display:false},ticks:TICK}, y:{grid:GRID,ticks:{...TICK,callback:v=>v+'%'}} }
    }
  });

  mkLegend('legend-compare', [
    { label: 'China landed (AUD/kg)', color: '#dc3545' },
    { label: 'India landed (AUD/kg)', color: '#198754' },
  ]);
  makeChart('priceCompareChart', {
    type: 'line',
    data: {
      labels: ["Q1'22","Q2'22","Q3'22","Q4'22","Q1'23","Q2'23","Q3'23","Q4'23","Q1'24","Q2'24","Q3'24","Q4'24"],
      datasets: [
        { label:'China landed', data:[3.87,3.95,4.02,4.10,4.13,4.22,4.25,4.33,4.37,4.43,4.48,4.55],
          borderColor:'#dc3545', backgroundColor:'rgba(220,53,69,0.06)', tension:0.3, fill:true, pointRadius:3, borderWidth:2 },
        { label:'India landed', data:[3.20,3.23,3.27,3.31,3.34,3.37,3.42,3.46,3.49,3.54,3.57,3.61],
          borderColor:'#198754', backgroundColor:'rgba(25,135,84,0.06)', tension:0.3, fill:true, pointRadius:3, borderWidth:2 }
      ]
    },
    options: { responsive:true, maintainAspectRatio:false,
      plugins:{legend:{display:false}, tooltip:{mode:'index',intersect:false}},
      scales:{ x:{grid:GRID,ticks:{...TICK,maxRotation:45}}, y:{grid:GRID,ticks:{...TICK,callback:v=>'A$'+v}} }
    }
  });
}

// ── SUPPLIERS ─────────────────────────────────────────────────────────────────
function initSuppliers() {
  makeChart('supplierCapChart', {
    type: 'bar',
    data: {
      labels: ['Hindalco','Vedanta','NALCO','BALCO','Century','Rajhans','GreenTech','Aluplex'],
      datasets: [{ label:'Capacity (000 MT)',
        data: [2500,1900,460,245,120,45,12,28],
        backgroundColor: ['#0d6efd','#0d6efd','#0dcaf0','#0dcaf0','#6f42c1','#adb5bd','#198754','#adb5bd'],
        borderRadius: 4, borderWidth: 0 }]
    },
    options: { indexAxis:'y', responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false}, tooltip:{callbacks:{label:c=>` ${c.raw.toLocaleString()}k MT/year`}} },
      scales:{ x:{grid:GRID,ticks:{...TICK,callback:v=>v+'k'}}, y:{grid:{display:false},ticks:TICK} }
    }
  });

  const supplierNames = ['Hindalco','Vedanta','NALCO','BALCO','Century','Rajhans','GreenTech','Aluplex'];
  makeChart('supplierScatterChart', {
    type: 'bubble',
    data: {
      datasets: [{
        label:'Suppliers',
        data: [
          {x:9.2,y:2.10,r:18},{x:8.5,y:1.95,r:16},{x:8.8,y:1.85,r:11},
          {x:8.0,y:2.00,r:9},{x:7.8,y:2.05,r:7},{x:7.2,y:1.90,r:5},
          {x:7.5,y:1.75,r:4},{x:6.9,y:1.88,r:4}
        ],
        backgroundColor:'rgba(13,110,253,0.45)', borderColor:'#0d6efd', borderWidth:1.5
      }]
    },
    options: { responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false}, tooltip:{ callbacks:{ label:c=>' '+supplierNames[c.dataIndex]+': Score '+c.raw.x+', $'+c.raw.y+'/kg' } } },
      scales:{
        x:{grid:GRID,ticks:TICK,title:{display:true,text:'AI Reliability Score',color:'#8a95a3',font:{size:11}},min:6,max:10},
        y:{grid:GRID,ticks:{...TICK,callback:v=>'$'+v},title:{display:true,text:'Export Price (USD/kg)',color:'#8a95a3',font:{size:11}},min:1.6,max:2.3}
      }
    }
  });

  makeChart('indiaGrowthChart', {
    type: 'bar',
    data: {
      labels: ['2021','2022','2023','2024','2024-25 TTM'],
      datasets: [{ label:'Shipments',
        data: [18200,22400,25800,28900,31518],
        backgroundColor: ['#e9ecef','#adb5bd','#6c757d','#0dcaf0','#198754'],
        borderRadius: 4, borderWidth: 0 }]
    },
    options: { responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false}, tooltip:{callbacks:{label:c=>` ${c.raw.toLocaleString()} shipments`}} },
      scales:{ x:{grid:{display:false},ticks:TICK}, y:{grid:GRID,ticks:{...TICK,callback:v=>v.toLocaleString()}} }
    }
  });
}

// ── MARKET ────────────────────────────────────────────────────────────────────
function initMarket() {
  const segColors = ['#0d6efd','#0dcaf0','#198754','#fd7e14','#6f42c1','#adb5bd'];
  const segLabels = ['Residential High-Rise','Commercial Office','Infrastructure','Industrial','Mid-Rise','Other'];
  const segData = [85000,62000,58000,44000,38000,62000];

  mkLegend('legend-market', segLabels.map((l,i)=>({label:l,color:segColors[i]})));
  makeChart('marketMixChart', {
    type: 'doughnut',
    data: { labels: segLabels,
      datasets: [{ data: segData, backgroundColor: segColors, borderWidth:2, borderColor:'#fff', hoverOffset:6 }]
    },
    options: { responsive:true, maintainAspectRatio:false, cutout:'55%',
      plugins:{ legend:{display:false}, tooltip:{callbacks:{label:c=>` ${c.label}: ${c.raw.toLocaleString()} MT`}} }
    }
  });

  const fullSegs = ['Residential High-Rise','Commercial Office','Infrastructure','Industrial','Mid-Rise','Retail','Education','Renovation'];
  const demands = [85000,62000,58000,44000,38000,27000,22000,13000];
  const growths = [6.2,3.5,8.1,4.8,9.3,2.1,5.5,7.8];

  makeChart('marketBubbleChart', {
    type: 'bubble',
    data: { datasets: [{ label:'Segments',
      data: fullSegs.map((s,i)=>({x:growths[i], y:demands[i]/1000, r: Math.sqrt(demands[i])/25})),
      backgroundColor:'rgba(13,110,253,0.45)', borderColor:'#0d6efd', borderWidth:1.5 }]
    },
    options: { responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false}, tooltip:{callbacks:{label:c=>` ${fullSegs[c.dataIndex]}: ${c.raw.y}k MT, +${c.raw.x}% growth`}} },
      scales:{
        x:{grid:GRID,ticks:TICK,title:{display:true,text:'Growth Rate (%)',color:'#8a95a3',font:{size:11}}},
        y:{grid:GRID,ticks:{...TICK,callback:v=>v+'k MT'},title:{display:true,text:'Annual Demand',color:'#8a95a3',font:{size:11}}}
      }
    }
  });

  mkLegend('legend-segdem', [{label:'Demand (MT)',color:'#0d6efd'},{label:'Growth Rate %',color:'#198754'}]);
  makeChart('segmentDemandChart', {
    type: 'bar',
    data: {
      labels: fullSegs.map(s=>s.split(' ').slice(0,2).join(' ')),
      datasets: [
        { label:'Demand (MT)', data:demands, backgroundColor:'#0d6efd', borderRadius:4, yAxisID:'y', borderWidth:0 },
        { label:'Growth %', data:growths, type:'line', borderColor:'#198754', backgroundColor:'transparent',
          tension:0.3, pointRadius:4, pointBackgroundColor:'#198754', yAxisID:'y1', borderWidth:2 }
      ]
    },
    options: { responsive:true, maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{
        x:{grid:{display:false},ticks:{...TICK,maxRotation:30}},
        y:{grid:GRID,ticks:{...TICK,callback:v=>v.toLocaleString()}},
        y1:{position:'right',grid:{display:false},ticks:{...TICK,callback:v=>v+'%'}}
      }
    }
  });
}

// ── COST-BENEFIT ──────────────────────────────────────────────────────────────
function initCost() {
  const cats = ['Procurement','Freight','Customs','Vetting','Finance','Delay','Currency','Admin'];
  const without = [420000,35000,18000,12000,22000,45000,8000,15000];
  const withAI  = [388000,28000,9000,3000,17000,18000,4000,4000];

  mkLegend('legend-cost', [{label:'Without AI',color:'#dc3545'},{label:'With AI Platform',color:'#198754'}]);
  makeChart('costBenefitChart', {
    type: 'bar',
    data: {
      labels: cats,
      datasets: [
        { label:'Without AI', data:without, backgroundColor:'#dc3545', borderRadius:4, borderWidth:0 },
        { label:'With AI', data:withAI, backgroundColor:'#198754', borderRadius:4, borderWidth:0 }
      ]
    },
    options: { responsive:true, maintainAspectRatio:false,
      plugins:{legend:{display:false}, tooltip:{mode:'index',intersect:false,
        callbacks:{label:c=>` ${c.dataset.label}: A$${c.raw.toLocaleString()}`}}},
      scales:{ x:{grid:{display:false},ticks:TICK}, y:{grid:GRID,ticks:{...TICK,callback:v=>'A$'+(v/1000).toFixed(0)+'k'}} }
    }
  });

  const savings = without.map((w,i)=>w-withAI[i]);
  makeChart('savingMixChart', {
    type: 'doughnut',
    data: {
      labels: cats,
      datasets: [{ data:savings, backgroundColor:['#0d6efd','#0dcaf0','#198754','#fd7e14','#6f42c1','#dc3545','#20c997','#adb5bd'],
        borderWidth:2, borderColor:'#fff', hoverOffset:6 }]
    },
    options: { responsive:true, maintainAspectRatio:false, cutout:'55%',
      plugins:{ legend:{display:false}, tooltip:{callbacks:{label:c=>` ${c.label}: A$${c.raw.toLocaleString()} saved`}} }
    }
  });
}

// ── RISK ──────────────────────────────────────────────────────────────────────
function initRisk() {
  const riskItems = [
    {label:'Shipping cost spikes',x:4,y:4,r:16},
    {label:'China anti-dumping',x:4,y:3,r:14},
    {label:'Port congestion AU',x:3,y:4,r:12},
    {label:'China-AU tensions',x:4,y:2,r:11},
    {label:'AUD/USD volatility',x:3,y:3,r:10},
    {label:'Supplier quality',x:2,y:3,r:9},
    {label:'Compliance errors',x:3,y:2,r:8},
    {label:'AUD/INR fluctuation',x:2,y:2,r:7},
    {label:'Carbon adjustments',x:1,y:2,r:6},
    {label:'India export duty',x:2,y:1,r:5},
  ];
  makeChart('riskHeatmapChart', {
    type: 'bubble',
    data: { datasets: [{ label:'Risks',
      data: riskItems.map(r=>({x:r.x,y:r.y,r:r.r})),
      backgroundColor: riskItems.map(r=>{
        if(r.x>=4&&r.y>=3) return 'rgba(220,53,69,0.6)';
        if(r.x>=3||r.y>=3) return 'rgba(253,126,20,0.6)';
        return 'rgba(25,135,84,0.5)';
      }),
      borderColor: riskItems.map(r=>{
        if(r.x>=4&&r.y>=3) return '#dc3545';
        if(r.x>=3||r.y>=3) return '#fd7e14';
        return '#198754';
      }),
      borderWidth: 1.5
    }]},
    options: { responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false}, tooltip:{callbacks:{label:c=>` ${riskItems[c.dataIndex].label}`}} },
      scales:{
        x:{grid:GRID,ticks:{...TICK,callback:v=>['','Low','Med','High','Critical'][v]||''},title:{display:true,text:'Impact',color:'#8a95a3',font:{size:11}},min:0,max:5},
        y:{grid:GRID,ticks:{...TICK,callback:v=>['','Low','Med','High','Critical'][v]||''},title:{display:true,text:'Probability',color:'#8a95a3',font:{size:11}},min:0,max:5}
      }
    }
  });

  mkLegend('legend-riskcat', [
    {label:'Geopolitical',color:'#dc3545'},{label:'Logistics',color:'#fd7e14'},
    {label:'Currency',color:'#0d6efd'},{label:'Trade policy',color:'#6f42c1'},
    {label:'Regulatory',color:'#198754'},{label:'Supply chain',color:'#adb5bd'},
  ]);
  makeChart('riskCatChart', {
    type: 'doughnut',
    data: {
      labels: ['Geopolitical','Logistics','Currency','Trade policy','Regulatory','Supply chain'],
      datasets: [{ data:[2,3,2,2,2,1],
        backgroundColor:['#dc3545','#fd7e14','#0d6efd','#6f42c1','#198754','#adb5bd'],
        borderWidth:2, borderColor:'#fff', hoverOffset:6 }]
    },
    options: { responsive:true, maintainAspectRatio:false, cutout:'55%',
      plugins:{ legend:{display:false} }
    }
  });

  mkLegend('legend-radar', [{label:'Risk Severity',color:'#dc3545'},{label:'AI Coverage',color:'#0d6efd'}]);
  makeChart('riskRadarChart', {
    type: 'radar',
    data: {
      labels: ['Geopolitical','Logistics','Currency','Trade Policy','Regulatory','Supply Chain'],
      datasets: [
        { label:'Risk Severity', data:[4,4,3,4,3,3],
          backgroundColor:'rgba(220,53,69,0.15)', borderColor:'#dc3545',
          pointBackgroundColor:'#dc3545', borderWidth:2, pointRadius:4 },
        { label:'AI Coverage', data:[2,4,4,3,5,4],
          backgroundColor:'rgba(13,110,253,0.15)', borderColor:'#0d6efd',
          pointBackgroundColor:'#0d6efd', borderWidth:2, pointRadius:4, borderDash:[4,3] }
      ]
    },
    options: { responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false} },
      scales:{ r:{ grid:{color:'rgba(0,0,0,0.07)'}, ticks:{display:false,stepSize:1},
        pointLabels:{font:{size:11,family:'DM Sans'},color:'#4b5568'}, min:0, max:5 } }
    }
  });
}

// ── DATA TABLE ────────────────────────────────────────────────────────────────
let currentSort = { col: -1, dir: 1 };
let currentTableData = { headers: [], rows: [] };

function renderTable(datasetKey) {
  fetch(`/api/table-data/?dataset=${datasetKey}`)
    .then(r => r.json())
    .then(data => {
      currentTableData = data;
      currentSort = { col: -1, dir: 1 };
      buildTable(data.headers, data.rows);
      const src = document.getElementById('tableSourceBadge');
      if (src) {
        const typeClass = data.type === 'real' ? 'success' : data.type === 'uploaded' ? 'primary' : 'warning';
        src.innerHTML = `<span class="badge bg-${typeClass}-subtle text-${typeClass} me-2">${data.type.toUpperCase()}</span><small class="text-muted">Source: ${data.source}</small>`;
      }
      const info = document.getElementById('tableInfo');
      if (info) info.textContent = `${data.rows.length} rows × ${data.headers.length} columns`;
    });
}

function buildTable(headers, rows) {
  const thead = document.getElementById('tableHead');
  const tbody = document.getElementById('tableBody');
  if (!thead || !tbody) return;
  thead.innerHTML = '<tr>' + headers.map((h, i) =>
    `<th onclick="sortTable(${i})" title="Click to sort">${h} <i class="bi bi-arrow-down-up ms-1" style="font-size:9px;opacity:0.5"></i></th>`
  ).join('') + '</tr>';
  renderTableRows(rows);
}

function renderTableRows(rows) {
  const tbody = document.getElementById('tableBody');
  if (!tbody) return;
  tbody.innerHTML = rows.map(row =>
    '<tr>' + row.map(cell => `<td>${cell}</td>`).join('') + '</tr>'
  ).join('');
}

function sortTable(colIdx) {
  if (currentSort.col === colIdx) currentSort.dir *= -1;
  else { currentSort.col = colIdx; currentSort.dir = 1; }
  const sorted = [...currentTableData.rows].sort((a, b) => {
    const va = a[colIdx]; const vb = b[colIdx];
    const na = parseFloat(String(va).replace(/[^0-9.\-]/g,''));
    const nb = parseFloat(String(vb).replace(/[^0-9.\-]/g,''));
    if (!isNaN(na) && !isNaN(nb)) return (na - nb) * currentSort.dir;
    return String(va).localeCompare(String(vb)) * currentSort.dir;
  });
  renderTableRows(sorted);
}

function exportCSV() {
  const { headers, rows } = currentTableData;
  if (!headers.length) return;
  const lines = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(','))];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'novoanalytics_export.csv'; a.click();
}

// ── FILE UPLOAD ───────────────────────────────────────────────────────────────
function handleUpload(file) {
  const status = document.getElementById('uploadStatus');
  if (!file) return;
  const ext = file.name.split('.').pop().toLowerCase();
  if (!['xlsx','xls','csv'].includes(ext)) {
    status.innerHTML = '<span class="text-danger"><i class="bi bi-x-circle me-1"></i>Only .xlsx, .xls, .csv supported</span>';
    return;
  }
  status.innerHTML = '<span class="text-muted"><i class="bi bi-hourglass-split me-1"></i>Uploading...</span>';
  const fd = new FormData(); fd.append('file', file);
  fetch('/upload/', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        status.innerHTML = '<span class="text-success"><i class="bi bi-check-circle me-1"></i>Uploaded!</span>';
        addUploadedDataset(data.key, data.label, data.sheets);
        showToast(`"${data.label}" loaded — ${data.sheets.length} sheet(s) detected`);
      } else {
        status.innerHTML = `<span class="text-danger"><i class="bi bi-x-circle me-1"></i>${data.error}</span>`;
      }
    })
    .catch(() => {
      status.innerHTML = '<span class="text-danger"><i class="bi bi-x-circle me-1"></i>Upload failed</span>';
    });
}

function addUploadedDataset(key, label, sheets) {
  const list = document.getElementById('datasetList');
  const item = document.createElement('div');
  item.className = 'dataset-item'; item.dataset.key = key;
  item.innerHTML = `<span class="ds-dot uploaded"></span><span class="ds-name">${label}</span><span class="badge-type uploaded">New</span>`;
  item.addEventListener('click', () => {
    document.querySelectorAll('.dataset-item').forEach(d => d.classList.remove('active'));
    item.classList.add('active');
    const tableSelect = document.getElementById('tableDatasetSelect');
    if (tableSelect) {
      const opt = document.createElement('option');
      opt.value = key; opt.textContent = label; tableSelect.appendChild(opt);
      tableSelect.value = key;
    }
    switchTab('data');
    setTimeout(() => renderTable(key), 100);
  });
  list.appendChild(item);

  // Add to table select
  const tableSelect = document.getElementById('tableDatasetSelect');
  if (tableSelect) {
    const opt = document.createElement('option'); opt.value = key; opt.textContent = label;
    tableSelect.appendChild(opt);
  }
}

function showToast(msg) {
  const toastEl = document.getElementById('uploadToast');
  const toastMsg = document.getElementById('toastMsg');
  if (toastEl && toastMsg) {
    toastMsg.textContent = msg;
    new bootstrap.Toast(toastEl, { delay: 3500 }).show();
  }
}

// ── INIT ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Nav clicks
  document.querySelectorAll('.nav-item[data-tab]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      switchTab(btn.dataset.tab);
    });
  });

  // Dataset sidebar clicks
  document.querySelectorAll('.dataset-item[data-key]').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.dataset-item').forEach(d => d.classList.remove('active'));
      item.classList.add('active');
      const key = item.dataset.key;
      const tableSelect = document.getElementById('tableDatasetSelect');
      if (tableSelect) tableSelect.value = key;
      switchTab('data');
      setTimeout(() => renderTable(key), 100);
    });
  });

  // Table dataset select
  const tableSelect = document.getElementById('tableDatasetSelect');
  if (tableSelect) tableSelect.addEventListener('change', e => renderTable(e.target.value));

  // Export CSV
  const expBtn = document.getElementById('exportCsvBtn');
  if (expBtn) expBtn.addEventListener('click', exportCSV);

  // File input
  const fileInput = document.getElementById('fileInput');
  const uploadZone = document.getElementById('uploadZone');

  if (uploadZone) {
    uploadZone.addEventListener('click', () => fileInput && fileInput.click());
    uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('dragover'); });
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
    uploadZone.addEventListener('drop', e => {
      e.preventDefault(); uploadZone.classList.remove('dragover');
      const files = e.dataTransfer.files;
      if (files.length) handleUpload(files[0]);
    });
  }

  if (fileInput) fileInput.addEventListener('change', e => e.target.files.length && handleUpload(e.target.files[0]));

  // Sidebar toggle (mobile)
  const toggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  if (toggle && sidebar) toggle.addEventListener('click', () => sidebar.classList.toggle('open'));

  // Boot
  initOverview();
});
