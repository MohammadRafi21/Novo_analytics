'use strict';
const CHARTS={};
const GRID={color:'rgba(0,0,0,0.05)'};
const TICK={color:'#8a95a3',font:{size:11,family:'DM Sans'}};
let currentKMeansMode='supplier';
let lastKMeansData=null;
const TAB_TITLES={overview:'Overview',imports:'AU Imports',prices:'Price Analysis',kmeans:'K-Means Clustering',suppliers:'India Suppliers',market:'AU Construction',cost:'AI Cost-Benefit',risk:'Risk Analysis',opportunity:'Opportunity Scores',profit:'India Profit Calculator',aichat:'AI Trade Advisor',data:'Data Tables'};

function destroyChart(id){if(CHARTS[id]){CHARTS[id].destroy();delete CHARTS[id];}}
function makeChart(id,cfg){destroyChart(id);const el=document.getElementById(id);if(el)CHARTS[id]=new Chart(el,cfg);}
function mkLegend(id,items){const el=document.getElementById(id);if(!el)return;el.innerHTML=items.map(i=>`<span class="legend-item"><span class="legend-sq" style="background:${i.color}"></span>${i.label}</span>`).join('');}

function switchTab(name){
  document.querySelectorAll('.tab-pane').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('tab-'+name)?.classList.add('active');
  document.querySelectorAll(`.nav-item[data-tab="${name}"]`).forEach(n=>n.classList.add('active'));
  const t=document.getElementById('pageTitle');if(t)t.textContent=TAB_TITLES[name]||name;
  setTimeout(()=>initTabCharts(name),60);
}

function initTabCharts(tab){
  const fn={overview:initOverview,imports:initImports,prices:initPrices,suppliers:initSuppliers,market:initMarket,cost:initCost,risk:initRisk,opportunity:initOpportunity,profit:()=>{updateProfitCalc();},data:()=>renderTable('au_imports')};
  if(fn[tab])fn[tab]();
  if(tab==='kmeans'&&!lastKMeansData)runKMeans();
}

// ── OVERVIEW ──────────────────────────────────────────────────────────────────
function initOverview(){
  mkLegend('legend-mix',[{label:'Sheet & Plate',color:'#0d6efd'},{label:'Extrusions',color:'#0dcaf0'},{label:'Unwrought Alloys',color:'#6f42c1'},{label:'Alumina',color:'#198754'},{label:'Foil',color:'#fd7e14'},{label:'Other',color:'#adb5bd'}]);
  makeChart('overviewMixChart',{type:'doughnut',data:{labels:['Sheet & Plate','Extrusions','Unwrought Alloys','Alumina','Foil','Other'],datasets:[{data:[201172,91480,49360,178000,16448,26533],backgroundColor:['#0d6efd','#0dcaf0','#6f42c1','#198754','#fd7e14','#adb5bd'],borderWidth:2,borderColor:'#fff',hoverOffset:6}]},options:{responsive:true,maintainAspectRatio:false,cutout:'60%',plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${c.label}: ${c.raw.toLocaleString()} t`}}}}});
  makeChart('overviewPriceChart',{type:'line',data:{labels:['2019','2020','2021','2022','2023','2024'],datasets:[{label:'LME USD/t',data:[1794,1704,2472,2710,2250,2419],borderColor:'#0d6efd',backgroundColor:'rgba(13,110,253,0.07)',tension:0.4,fill:true,pointRadius:5,pointBackgroundColor:'#0d6efd',borderWidth:2},{label:'AUD/t (est)',data:[2581,2466,3288,3905,3409,3722],borderColor:'#fd7e14',backgroundColor:'transparent',tension:0.4,fill:false,pointRadius:4,pointBackgroundColor:'#fd7e14',borderWidth:2,borderDash:[5,4]}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{mode:'index',intersect:false}},scales:{x:{grid:GRID,ticks:TICK},y:{grid:GRID,ticks:{...TICK,callback:v=>'$'+v.toLocaleString()}}}}});
  mkLegend('legend-partners',[{label:'China',color:'#0d6efd'},{label:'USA',color:'#dc3545'},{label:'Japan',color:'#198754'},{label:'S Korea',color:'#fd7e14'},{label:'India (est)',color:'#6f42c1'}]);
  makeChart('overviewPartnersChart',{type:'bar',data:{labels:['FY18-19','FY20-21','FY22-23','FY23-24'],datasets:[{label:'China',data:[81.6,88.7,113.7,112.6],backgroundColor:'#0d6efd'},{label:'USA',data:[27.8,28.5,49.7,42.4],backgroundColor:'#dc3545'},{label:'Japan',data:[22.8,19.2,32.4,34.3],backgroundColor:'#198754'},{label:'S Korea',data:[25.8,26.3,35.4,37.9],backgroundColor:'#fd7e14'},{label:'India',data:[8.2,9.1,16.3,18.5],backgroundColor:'#6f42c1'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:TICK},y:{grid:GRID,ticks:{...TICK,callback:v=>'A$'+v+'B'}}}}});
}

// ── K-MEANS ───────────────────────────────────────────────────────────────────
function setKMeansMode(mode){
  currentKMeansMode=mode;
  document.getElementById('modeSupplierBtn').classList.toggle('active',mode==='supplier');
  document.getElementById('modeSegmentBtn').classList.toggle('active',mode==='segments');
  runKMeans();
}

async function runKMeans(){
  const k=parseInt(document.getElementById('kSlider').value);
  document.getElementById('kVal').textContent=k;
  document.getElementById('kpi-k').textContent=k;
  document.getElementById('kmeans-loading').style.display='block';
  document.getElementById('kmeans-results').style.display='none';
  try{
    const r=await fetch(`/api/kmeans/?mode=${currentKMeansMode}&k=${k}`);
    const data=await r.json();
    if(data.error){alert(data.error);return;}
    lastKMeansData=data;
    renderKMeansResults(data);
  }catch(e){console.error(e);}
  finally{document.getElementById('kmeans-loading').style.display='none';}
}

function renderKMeansResults(d){
  document.getElementById('kmeans-results').style.display='block';
  document.getElementById('kpi-sil').textContent=d.silhouette_score.toFixed(4);
  document.getElementById('kpi-inertia').textContent=d.inertia.toFixed(1);

  // Elbow chart
  makeChart('elbowChart',{type:'line',data:{labels:d.elbow.k_values,datasets:[{label:'Inertia (WCSS)',data:d.elbow.inertias,borderColor:'#6f42c1',backgroundColor:'rgba(111,66,193,0.08)',tension:0.3,fill:true,pointRadius:5,pointBackgroundColor:d.elbow.k_values.map(v=>v===d.k?'#dc3545':'#6f42c1'),pointRadius:d.elbow.k_values.map(v=>v===d.k?8:4),borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` Inertia: ${c.raw.toFixed(1)}`}}},scales:{x:{grid:GRID,ticks:TICK,title:{display:true,text:'Number of clusters (k)',color:'#8a95a3',font:{size:11}}},y:{grid:GRID,ticks:TICK}}}});

  // Scatter / PCA
  const scatterDatasets=d.clusters.map(c=>({label:c.name,data:d.points.filter(p=>p.cluster===c.id).map(p=>({x:p.x,y:p.y,label:p.name})),backgroundColor:c.color+'99',borderColor:c.color,pointRadius:7,pointHoverRadius:9,borderWidth:1.5}));
  makeChart('scatterChart',{type:'scatter',data:{datasets:scatterDatasets},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>{const pt=c.raw;return ` ${pt.label||''} (${c.dataset.label})`;}}}},scales:{x:{grid:GRID,ticks:TICK,title:{display:true,text:`PC1 (${d.variance_explained[0]}% variance)`,color:'#8a95a3',font:{size:11}}},y:{grid:GRID,ticks:TICK,title:{display:true,text:`PC2 (${d.variance_explained[1]}% variance)`,color:'#8a95a3',font:{size:11}}}}}});

  // Radar chart (supplier mode)
  if(d.mode==='supplier'){
    const radarLabels=['Price (USD/kg)','Reliability','Lead Time','Compliance','Anti-Dump Risk','Freight'];
    const radarDatasets=d.clusters.map(c=>({label:c.name,data:[c.avg_price*3,c.avg_reliability,10-c.avg_lead_time/5,c.avg_compliance,10-c.avg_anti_dumping,10-c.avg_freight*20],backgroundColor:c.color+'22',borderColor:c.color,pointBackgroundColor:c.color,borderWidth:2,pointRadius:3}));
    mkLegend('legend-radar-km',d.clusters.map(c=>({label:c.name,color:c.color})));
    makeChart('clusterRadarChart',{type:'radar',data:{labels:radarLabels,datasets:radarDatasets},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{r:{grid:{color:'rgba(0,0,0,0.07)'},ticks:{display:false,stepSize:2},pointLabels:{font:{size:11,family:'DM Sans'},color:'#4b5568'},min:0,max:10}}}});
  }else{
    const radarLabels=['Demand (norm)','Growth Rate','Price Sensitivity','Compliance Priority','Speed Priority','Volume/Order'];
    const radarDatasets=d.clusters.map(c=>({label:c.name,data:[c.total_demand_mt/85000*10,c.avg_growth,c.avg_price_sensitivity,c.avg_compliance,c.avg_price_sensitivity,5],backgroundColor:c.color+'22',borderColor:c.color,pointBackgroundColor:c.color,borderWidth:2,pointRadius:3}));
    mkLegend('legend-radar-km',d.clusters.map(c=>({label:c.name,color:c.color})));
    makeChart('clusterRadarChart',{type:'radar',data:{labels:radarLabels,datasets:radarDatasets},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{r:{grid:{color:'rgba(0,0,0,0.07)'},ticks:{display:false},pointLabels:{font:{size:11,family:'DM Sans'},color:'#4b5568'},min:0,max:10}}}});
  }

  // Cluster cards
  const cards=document.getElementById('clusterCards');
  if(cards){
    cards.innerHTML=d.clusters.map(c=>`
      <div class="col-md-6 col-lg-3">
        <div class="chart-card h-100" style="border-left:4px solid ${c.color}">
          <div class="d-flex align-items-center gap-2 mb-2">
            <span style="width:12px;height:12px;border-radius:50%;background:${c.color};flex-shrink:0"></span>
            <span style="font-size:13px;font-weight:500;color:var(--bs-body-color)">${c.name}</span>
          </div>
          <div class="d-flex gap-3 mb-2">
            <div><div style="font-size:10px;color:var(--bs-secondary-color)">Members</div><div style="font-size:20px;font-weight:700;color:${c.color}">${c.count}</div></div>
            ${d.mode==='supplier'?`<div><div style="font-size:10px;color:var(--bs-secondary-color)">Avg price</div><div style="font-size:14px;font-weight:500">$${c.avg_price}/kg</div></div><div><div style="font-size:10px;color:var(--bs-secondary-color)">Reliability</div><div style="font-size:14px;font-weight:500">${c.avg_reliability}/10</div></div>`:`<div><div style="font-size:10px;color:var(--bs-secondary-color)">Total demand</div><div style="font-size:14px;font-weight:500">${(c.total_demand_mt/1000).toFixed(0)}k MT</div></div><div><div style="font-size:10px;color:var(--bs-secondary-color)">Avg growth</div><div style="font-size:14px;font-weight:500">${c.avg_growth}%</div></div>`}
          </div>
          <div style="font-size:11px;color:var(--bs-secondary-color);line-height:1.5">${c.description}</div>
          <div style="margin-top:8px;font-size:11px;color:var(--bs-body-color)">${(d.mode==='supplier'?c.suppliers:c.segments).join(', ')}</div>
        </div>
      </div>`).join('');
  }

  // Table
  const th=document.getElementById('kmeansTableHead');
  const tb=document.getElementById('kmeansTableBody');
  if(!th||!tb)return;
  if(d.mode==='supplier'){
    th.innerHTML='<tr><th>Supplier</th><th>Country</th><th>Cluster</th><th>Price USD/kg</th><th>Reliability</th><th>Anti-Dump Risk</th></tr>';
    tb.innerHTML=d.points.map(p=>`<tr><td>${p.name}</td><td>${p.country}</td><td><span style="background:${p.color}22;color:${p.color};padding:2px 8px;border-radius:4px;font-size:11px">${d.clusters[p.cluster]?.name||'C'+p.cluster}</span></td><td>$${p.price}</td><td>${p.reliability}</td><td>${p.anti_dumping===0?'<span class="text-success">None</span>':'<span class="text-danger">'+p.anti_dumping+'</span>'}</td></tr>`).join('');
  }else{
    th.innerHTML='<tr><th>Segment</th><th>Cluster</th><th>Demand (MT)</th><th>Growth %</th><th>Price Sensitivity</th></tr>';
    tb.innerHTML=d.points.map(p=>`<tr><td>${p.name}</td><td><span style="background:${p.color}22;color:${p.color};padding:2px 8px;border-radius:4px;font-size:11px">${d.clusters[p.cluster]?.name||'C'+p.cluster}</span></td><td>${p.demand.toLocaleString()}</td><td>${p.growth}%</td><td>${p.price_sensitivity}/10</td></tr>`).join('');
  }
}

// ── AI CHAT ───────────────────────────────────────────────────────────────────
const chatHistory=[];

function getApiKey(){return document.getElementById('apiKeyInput')?.value?.trim()||'';}

function getContext(){
  let ctx='Platform: NOVO AI Cross-Border Aluminium Trade Intelligence\n';
  ctx+='Supplier count: 20 (India:8, China:5, Thailand:3, South Korea:2, Malaysia:2)\n';
  ctx+='Construction segments: 10 AU construction market segments\n';
  if(lastKMeansData){
    ctx+=`\nLatest k-means results (mode=${lastKMeansData.mode}, k=${lastKMeansData.k}):\n`;
    ctx+=`Silhouette score: ${lastKMeansData.silhouette_score}\n`;
    lastKMeansData.clusters.forEach(c=>{
      ctx+=`- Cluster "${c.name}": ${c.count} members`;
      if(lastKMeansData.mode==='supplier')ctx+=` | avg price $${c.avg_price}/kg | reliability ${c.avg_reliability} | anti-dump risk ${c.avg_anti_dumping}`;
      ctx+='\n';
    });
  }
  return ctx;
}

function addChatMessage(role,text){
  chatHistory.push({role,content:text});
  const msgs=document.getElementById('chatMessages');
  if(!msgs)return;
  const div=document.createElement('div');
  div.className=`chat-msg ${role}`;
  div.innerHTML=`<div class="chat-bubble">${role==='assistant'?'<strong>NOVO AI:</strong> ':'<strong>You:</strong> '}${text.replace(/\n/g,'<br>')}</div>`;
  msgs.appendChild(div);
  msgs.scrollTop=msgs.scrollHeight;
}

async function sendChat(){
  const input=document.getElementById('chatInput');
  const msg=input?.value?.trim();
  if(!msg)return;
  const apiKey=getApiKey();
  if(!apiKey){alert('Please enter your Claude API key in the sidebar.');return;}
  input.value='';
  addChatMessage('user',msg);
  const btn=document.getElementById('chatSendBtn');
  if(btn)btn.disabled=true;

  const loadingDiv=document.createElement('div');
  loadingDiv.className='chat-msg assistant';
  loadingDiv.innerHTML='<div class="chat-bubble"><div class="spinner-border spinner-border-sm text-primary me-2"></div>Analysing...</div>';
  document.getElementById('chatMessages')?.appendChild(loadingDiv);

  try{
    const resp=await fetch('/api/ai-chat/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:chatHistory,context:getContext(),api_key:apiKey})});
    const data=await resp.json();
    loadingDiv.remove();
    if(data.error){addChatMessage('assistant','Error: '+data.error);}
    else{addChatMessage('assistant',data.reply);}
  }catch(e){
    loadingDiv.remove();
    addChatMessage('assistant','Connection error: '+e.message);
  }finally{if(btn)btn.disabled=false;}
}

function quickAsk(q){
  const input=document.getElementById('chatInput');
  if(input){input.value=q;sendChat();}
}

function clearChat(){
  chatHistory.length=0;
  const msgs=document.getElementById('chatMessages');
  if(msgs)msgs.innerHTML='<div class="chat-msg assistant"><div class="chat-bubble"><strong>NOVO AI:</strong> Chat cleared. How can I help you?</div></div>';
}

async function analyseDataset(){
  const key=document.getElementById('analyseDatasetSelect')?.value;
  const apiKey=getApiKey();
  if(!apiKey){alert('Please enter your Claude API key first.');return;}
  const result=document.getElementById('analysisResult');
  if(result){result.style.display='block';result.innerHTML='<div class="spinner-border spinner-border-sm text-success me-2"></div>Analysing with AI...';}
  try{
    const resp=await fetch('/api/analyse-dataset/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({dataset_key:key,api_key:apiKey})});
    const data=await resp.json();
    if(result){
      if(data.error){result.innerHTML='<span class="text-danger">Error: '+data.error+'</span>';}
      else{result.innerHTML='<strong>'+data.dataset+'</strong><br><br>'+data.analysis.replace(/\n/g,'<br>');}
    }
  }catch(e){if(result)result.innerHTML='<span class="text-danger">Error: '+e.message+'</span>';}
}

// ── IMPORTS ───────────────────────────────────────────────────────────────────
function initImports(){
  makeChart('importProductChart',{type:'bar',data:{labels:['Sheet & Plate','Extrusions','Alumina','Unwrought Alloys','Foil','Wire','Scrap'],datasets:[{label:'Weight (t)',data:[201172,91480,178000,49360,16448,3090,1497],backgroundColor:['#0d6efd','#0dcaf0','#198754','#6f42c1','#fd7e14','#20c997','#adb5bd'],borderWidth:0,borderRadius:4}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${c.raw.toLocaleString()} t`}}},scales:{x:{grid:GRID,ticks:{...TICK,callback:v=>v>=1000?(v/1000).toFixed(0)+'k':v}},y:{grid:{display:false},ticks:TICK}}}});
  mkLegend('legend-h1h2',[{label:'H1 2024',color:'#0d6efd'},{label:'H2 2024',color:'#0dcaf0'}]);
  makeChart('importH1H2Chart',{type:'bar',data:{labels:['Sheet & Plate','Extrusions','Alumina','Unwrought Alloys','Foil'],datasets:[{label:'H1 2024',data:[499.3,269.6,47.2,92.1,58.0],backgroundColor:'#0d6efd',borderRadius:3},{label:'H2 2024',data:[516.7,275.3,83.4,98.9,65.2],backgroundColor:'#0dcaf0',borderRadius:3}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:TICK},y:{grid:GRID,ticks:{...TICK,callback:v=>'A$'+v+'M'}}}}});
}

// ── PRICES ────────────────────────────────────────────────────────────────────
function initPrices(){
  mkLegend('legend-lme',[{label:'LME USD/t',color:'#0d6efd'},{label:'AUD/t (est)',color:'#fd7e14'}]);
  makeChart('lmeFullChart',{type:'line',data:{labels:['2019','2020','2021','2022','2023','2024'],datasets:[{label:'LME USD/t',data:[1794,1704,2472,2710,2250,2419],borderColor:'#0d6efd',backgroundColor:'rgba(13,110,253,0.06)',tension:0.4,fill:true,pointRadius:5,pointBackgroundColor:'#0d6efd',borderWidth:2.5},{label:'AUD/t (est)',data:[2581,2466,3288,3905,3409,3722],borderColor:'#fd7e14',backgroundColor:'transparent',tension:0.4,fill:false,pointRadius:4,pointBackgroundColor:'#fd7e14',borderWidth:2,borderDash:[5,4]}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{mode:'index',intersect:false}},scales:{x:{grid:GRID,ticks:TICK},y:{grid:GRID,min:1400,ticks:{...TICK,callback:v=>'$'+v.toLocaleString()}}}}});
  const changes=[0,-5.0,45.1,9.6,-17.0,7.5];
  makeChart('priceChangeChart',{type:'bar',data:{labels:['2019','2020','2021','2022','2023','2024'],datasets:[{label:'YoY %',data:changes,backgroundColor:changes.map(v=>v>=0?'#198754':'#dc3545'),borderRadius:4,borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:TICK},y:{grid:GRID,ticks:{...TICK,callback:v=>v+'%'}}}}});
  mkLegend('legend-compare',[{label:'China landed (AUD/kg)',color:'#dc3545'},{label:'India landed (AUD/kg)',color:'#198754'}]);
  makeChart('priceCompareChart',{type:'line',data:{labels:["Q1'22","Q2'22","Q3'22","Q4'22","Q1'23","Q2'23","Q3'23","Q4'23","Q1'24","Q2'24","Q3'24","Q4'24"],datasets:[{label:'China landed',data:[3.87,3.95,4.02,4.10,4.13,4.22,4.25,4.33,4.37,4.43,4.48,4.55],borderColor:'#dc3545',backgroundColor:'rgba(220,53,69,0.06)',tension:0.3,fill:true,pointRadius:3,borderWidth:2},{label:'India landed',data:[3.20,3.23,3.27,3.31,3.34,3.37,3.42,3.46,3.49,3.54,3.57,3.61],borderColor:'#198754',backgroundColor:'rgba(25,135,84,0.06)',tension:0.3,fill:true,pointRadius:3,borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{mode:'index',intersect:false}},scales:{x:{grid:GRID,ticks:{...TICK,maxRotation:45}},y:{grid:GRID,ticks:{...TICK,callback:v=>'A$'+v}}}}});
}

// ── SUPPLIERS ─────────────────────────────────────────────────────────────────
function initSuppliers(){
  makeChart('supplierCapChart',{type:'bar',data:{labels:['Hindalco','Vedanta','NALCO','BALCO','Century','Rajhans','GreenTech','Aluplex'],datasets:[{label:'Capacity (000 MT)',data:[2500,1900,460,245,120,45,12,28],backgroundColor:['#0d6efd','#0d6efd','#0dcaf0','#0dcaf0','#6f42c1','#adb5bd','#198754','#adb5bd'],borderRadius:4,borderWidth:0}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:GRID,ticks:{...TICK,callback:v=>v+'k'}},y:{grid:{display:false},ticks:TICK}}}});
  const supNames=['Hindalco','Vedanta','NALCO','BALCO','Century','Rajhans','GreenTech','Aluplex'];
  makeChart('supplierScatterChart',{type:'bubble',data:{datasets:[{label:'Suppliers',data:[{x:9.2,y:2.10,r:18},{x:8.5,y:1.95,r:16},{x:8.8,y:1.85,r:11},{x:8.0,y:2.00,r:9},{x:7.8,y:2.05,r:7},{x:7.2,y:1.90,r:5},{x:7.5,y:1.75,r:4},{x:6.9,y:1.88,r:4}],backgroundColor:'rgba(13,110,253,0.45)',borderColor:'#0d6efd',borderWidth:1.5}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${supNames[c.dataIndex]}: Score ${c.raw.x}, $${c.raw.y}/kg`}}},scales:{x:{grid:GRID,ticks:TICK,title:{display:true,text:'AI Reliability Score',color:'#8a95a3',font:{size:11}},min:6,max:10},y:{grid:GRID,ticks:{...TICK,callback:v=>'$'+v},title:{display:true,text:'Export Price (USD/kg)',color:'#8a95a3',font:{size:11}},min:1.6,max:2.3}}}});
  makeChart('indiaGrowthChart',{type:'bar',data:{labels:['2021','2022','2023','2024','2024-25 TTM'],datasets:[{label:'Shipments',data:[18200,22400,25800,28900,31518],backgroundColor:['#e9ecef','#adb5bd','#6c757d','#0dcaf0','#198754'],borderRadius:4,borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:TICK},y:{grid:GRID,ticks:{...TICK,callback:v=>v.toLocaleString()}}}}});
}

// ── MARKET ────────────────────────────────────────────────────────────────────
function initMarket(){
  const sc=['#0d6efd','#0dcaf0','#198754','#fd7e14','#6f42c1','#adb5bd'];
  const sl=['Residential High-Rise','Commercial Office','Infrastructure','Industrial','Mid-Rise','Other'];
  mkLegend('legend-market',sl.map((l,i)=>({label:l,color:sc[i]})));
  makeChart('marketMixChart',{type:'doughnut',data:{labels:sl,datasets:[{data:[85000,62000,58000,44000,38000,62000],backgroundColor:sc,borderWidth:2,borderColor:'#fff',hoverOffset:6}]},options:{responsive:true,maintainAspectRatio:false,cutout:'55%',plugins:{legend:{display:false}}}});
  const fs=['Residential High-Rise','Commercial Office','Infrastructure','Industrial','Mid-Rise','Retail','Education','Renovation'];
  const dem=[85000,62000,58000,44000,38000,27000,22000,13000];
  const gr=[6.2,3.5,8.1,4.8,9.3,2.1,5.5,7.8];
  makeChart('marketBubbleChart',{type:'bubble',data:{datasets:[{label:'Segments',data:fs.map((s,i)=>({x:gr[i],y:dem[i]/1000,r:Math.sqrt(dem[i])/25})),backgroundColor:'rgba(13,110,253,0.45)',borderColor:'#0d6efd',borderWidth:1.5}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${fs[c.dataIndex]}: ${c.raw.y}k MT, +${c.raw.x}% growth`}}},scales:{x:{grid:GRID,ticks:TICK,title:{display:true,text:'Growth Rate (%)',color:'#8a95a3',font:{size:11}}},y:{grid:GRID,ticks:{...TICK,callback:v=>v+'k MT'},title:{display:true,text:'Annual Demand',color:'#8a95a3',font:{size:11}}}}}});
  mkLegend('legend-segdem',[{label:'Demand (MT)',color:'#0d6efd'},{label:'Growth %',color:'#198754'}]);
  makeChart('segmentDemandChart',{type:'bar',data:{labels:fs.map(s=>s.split(' ').slice(0,2).join(' ')),datasets:[{label:'Demand (MT)',data:dem,backgroundColor:'#0d6efd',borderRadius:4,yAxisID:'y',borderWidth:0},{label:'Growth %',data:gr,type:'line',borderColor:'#198754',backgroundColor:'transparent',tension:0.3,pointRadius:4,pointBackgroundColor:'#198754',yAxisID:'y1',borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:{...TICK,maxRotation:30}},y:{grid:GRID,ticks:{...TICK,callback:v=>v.toLocaleString()}},y1:{position:'right',grid:{display:false},ticks:{...TICK,callback:v=>v+'%'}}}}});
}

// ── COST ──────────────────────────────────────────────────────────────────────
function initCost(){
  const cats=['Procurement','Freight','Customs','Vetting','Finance','Delay','Currency','Admin'];
  const wo=[420000,35000,18000,12000,22000,45000,8000,15000];
  const wi=[388000,28000,9000,3000,17000,18000,4000,4000];
  mkLegend('legend-cost',[{label:'Without AI',color:'#dc3545'},{label:'With AI Platform',color:'#198754'}]);
  makeChart('costBenefitChart',{type:'bar',data:{labels:cats,datasets:[{label:'Without AI',data:wo,backgroundColor:'#dc3545',borderRadius:4,borderWidth:0},{label:'With AI',data:wi,backgroundColor:'#198754',borderRadius:4,borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{mode:'index',intersect:false,callbacks:{label:c=>` ${c.dataset.label}: A$${c.raw.toLocaleString()}`}}},scales:{x:{grid:{display:false},ticks:TICK},y:{grid:GRID,ticks:{...TICK,callback:v=>'A$'+(v/1000).toFixed(0)+'k'}}}}});
  makeChart('savingMixChart',{type:'doughnut',data:{labels:cats,datasets:[{data:wo.map((w,i)=>w-wi[i]),backgroundColor:['#0d6efd','#0dcaf0','#198754','#fd7e14','#6f42c1','#dc3545','#20c997','#adb5bd'],borderWidth:2,borderColor:'#fff',hoverOffset:6}]},options:{responsive:true,maintainAspectRatio:false,cutout:'55%',plugins:{legend:{display:false}}}});
}

// ── RISK ──────────────────────────────────────────────────────────────────────
function initRisk(){
  const ri=[{label:'Shipping spikes',x:4,y:4,r:16},{label:'China anti-dumping',x:4,y:3,r:14},{label:'Port congestion AU',x:3,y:4,r:12},{label:'China-AU tensions',x:4,y:2,r:11},{label:'AUD/USD volatility',x:3,y:3,r:10},{label:'Supplier quality',x:2,y:3,r:9},{label:'Compliance errors',x:3,y:2,r:8},{label:'AUD/INR',x:2,y:2,r:7}];
  makeChart('riskHeatmapChart',{type:'bubble',data:{datasets:[{label:'Risks',data:ri.map(r=>({x:r.x,y:r.y,r:r.r})),backgroundColor:ri.map(r=>r.x>=4&&r.y>=3?'rgba(220,53,69,0.6)':r.x>=3||r.y>=3?'rgba(253,126,20,0.6)':'rgba(25,135,84,0.5)'),borderColor:ri.map(r=>r.x>=4&&r.y>=3?'#dc3545':r.x>=3||r.y>=3?'#fd7e14':'#198754'),borderWidth:1.5}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${ri[c.dataIndex].label}`}}},scales:{x:{grid:GRID,ticks:{...TICK,callback:v=>['','Low','Med','High','Critical'][v]||''},title:{display:true,text:'Impact',color:'#8a95a3',font:{size:11}},min:0,max:5},y:{grid:GRID,ticks:{...TICK,callback:v=>['','Low','Med','High','Critical'][v]||''},title:{display:true,text:'Probability',color:'#8a95a3',font:{size:11}},min:0,max:5}}}});
  mkLegend('legend-riskcat',[{label:'Geopolitical',color:'#dc3545'},{label:'Logistics',color:'#fd7e14'},{label:'Currency',color:'#0d6efd'},{label:'Trade policy',color:'#6f42c1'},{label:'Regulatory',color:'#198754'}]);
  makeChart('riskCatChart',{type:'doughnut',data:{labels:['Geopolitical','Logistics','Currency','Trade policy','Regulatory','Supply chain'],datasets:[{data:[2,3,2,2,2,1],backgroundColor:['#dc3545','#fd7e14','#0d6efd','#6f42c1','#198754','#adb5bd'],borderWidth:2,borderColor:'#fff',hoverOffset:6}]},options:{responsive:true,maintainAspectRatio:false,cutout:'55%',plugins:{legend:{display:false}}}});
  mkLegend('legend-radar',[{label:'Risk Severity',color:'#dc3545'},{label:'AI Coverage',color:'#0d6efd'}]);
  makeChart('riskRadarChart',{type:'radar',data:{labels:['Geopolitical','Logistics','Currency','Trade Policy','Regulatory','Supply Chain'],datasets:[{label:'Risk Severity',data:[4,4,3,4,3,3],backgroundColor:'rgba(220,53,69,0.15)',borderColor:'#dc3545',pointBackgroundColor:'#dc3545',borderWidth:2,pointRadius:4},{label:'AI Coverage',data:[2,4,4,3,5,4],backgroundColor:'rgba(13,110,253,0.15)',borderColor:'#0d6efd',pointBackgroundColor:'#0d6efd',borderWidth:2,pointRadius:4,borderDash:[4,3]}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{r:{grid:{color:'rgba(0,0,0,0.07)'},ticks:{display:false,stepSize:1},pointLabels:{font:{size:11,family:'DM Sans'},color:'#4b5568'},min:0,max:5}}}});
}

// ── OPPORTUNITY ───────────────────────────────────────────────────────────────
function computeScore(dims){return Object.keys(DIM_WEIGHTS).reduce((s,k)=>s+(dims[k]||0)*DIM_WEIGHTS[k],0);}
function initOpportunity(){buildScoreCards();buildOpportunityCharts('2024');}
function updateOpportunityCharts(){const yr=document.getElementById('scoreYearFilter').value;buildScoreCards(yr);buildOpportunityCharts(yr);}
function buildScoreCards(year='2024'){
  const container=document.getElementById('countryScoreCards');if(!container)return;
  const scores=Object.entries(OPPORTUNITY_DATA).map(([c,d])=>{const yrs=Object.entries(d.years);const filtered=year==='all'?yrs:yrs.filter(([y])=>String(y)===year);const avg=filtered.reduce((s,[,d])=>s+computeScore(d),0)/(filtered.length||1);return{country:c,flag:d.flag,color:d.color,score:avg};}).sort((a,b)=>b.score-a.score);
  container.innerHTML=scores.map((s,i)=>`<div class="col-6 col-md-4 col-lg-2"><div class="score-card ${i===0?'rank-1':''}"><div class="score-flag">${s.flag}</div><div class="score-country">${s.country}</div><div class="score-value" style="color:${s.color}">${s.score.toFixed(1)}</div><div class="score-bar-wrap"><div class="score-bar" style="width:${s.score*10}%;background:${s.color}"></div></div><div class="score-rank">Rank #${i+1} · ${year==='all'?'avg':year}</div></div></div>`).join('');
}
function buildOpportunityCharts(year='all'){
  const countries=Object.keys(OPPORTUNITY_DATA);
  const colors=Object.values(OPPORTUNITY_DATA).map(d=>d.color);
  const allYears=[2019,2020,2021,2022,2023,2024];
  mkLegend('legend-optrend',countries.map((c,i)=>({label:c,color:colors[i]})));
  makeChart('oppTrendChart',{type:'line',data:{labels:allYears.map(String),datasets:countries.map((c,i)=>({label:c,data:allYears.map(y=>{const d=OPPORTUNITY_DATA[c].years[y];return d?parseFloat(computeScore(d).toFixed(2)):null;}),borderColor:colors[i],backgroundColor:'transparent',tension:0.35,pointRadius:4,borderWidth:2.5,pointBackgroundColor:colors[i],borderDash:c==='China'?[5,3]:[]}))} ,options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{mode:'index',intersect:false}},scales:{x:{grid:GRID,ticks:TICK},y:{grid:GRID,min:0,max:10,ticks:{...TICK,callback:v=>v.toFixed(1)}}}}});
  const yr=year==='all'?2024:parseInt(year);
  const rankData=countries.map(c=>{const d=OPPORTUNITY_DATA[c].years[yr];return d?parseFloat(computeScore(d).toFixed(2)):0;});
  const sortedIdx=[...rankData.keys()].sort((a,b)=>rankData[b]-rankData[a]);
  makeChart('oppRankChart',{type:'bar',data:{labels:sortedIdx.map(i=>countries[i]),datasets:[{label:'Score',data:sortedIdx.map(i=>rankData[i]),backgroundColor:sortedIdx.map(i=>colors[i]),borderRadius:6,borderWidth:0}]},options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:GRID,ticks:TICK,min:0,max:10},y:{grid:{display:false},ticks:TICK}}}});
  mkLegend('legend-diverge',[{label:'India',color:'#ff9933'},{label:'China',color:'#de2910'}]);
  const indiaS=allYears.map(y=>parseFloat(computeScore(OPPORTUNITY_DATA.India.years[y]).toFixed(2)));
  const chinaS=allYears.map(y=>parseFloat(computeScore(OPPORTUNITY_DATA.China.years[y]).toFixed(2)));
  makeChart('oppDivergeChart',{type:'line',data:{labels:allYears.map(String),datasets:[{label:'India',data:indiaS,borderColor:'#ff9933',backgroundColor:'rgba(255,153,51,0.1)',tension:0.35,fill:false,pointRadius:4,pointBackgroundColor:'#ff9933',borderWidth:2.5},{label:'China',data:chinaS,borderColor:'#de2910',backgroundColor:'transparent',tension:0.35,fill:false,pointRadius:4,pointBackgroundColor:'#de2910',borderWidth:2,borderDash:[5,3]}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{mode:'index',intersect:false}},scales:{x:{grid:GRID,ticks:TICK},y:{grid:GRID,min:0,max:10,ticks:{...TICK,callback:v=>v.toFixed(1)}}}}});
}

// ── PROFIT CALC ───────────────────────────────────────────────────────────────
let profitTimer=null;
function updateProfitCalc(){
  const fmts={india_fob:v=>'$'+parseFloat(v).toFixed(2),sell_price:v=>'$'+parseFloat(v).toFixed(2),freight:v=>'$'+parseFloat(v).toFixed(2),duty:v=>'$'+parseFloat(v).toFixed(2),audusd:v=>parseFloat(v).toFixed(2),volume:v=>parseInt(v)+' MT'};
  for(const[k,fn] of Object.entries(fmts)){const sl=document.getElementById('sl_'+k);const lb=document.getElementById('lbl_'+k);if(sl&&lb)lb.textContent=fn(sl.value);}
  clearTimeout(profitTimer);
  profitTimer=setTimeout(async()=>{
    const params=new URLSearchParams({india_fob:document.getElementById('sl_india_fob').value,sell_price:document.getElementById('sl_sell_price').value,freight:document.getElementById('sl_freight').value,duty:document.getElementById('sl_duty').value,aud_usd:document.getElementById('sl_audusd').value,volume:document.getElementById('sl_volume').value});
    const r=await fetch('/api/profit-calc/?'+params);
    const d=await r.json();
    const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
    set('val_landed','A$'+d.landed_aud);set('val_profit_kg',(d.profit_per_kg>=0?'+':'')+'A$'+d.profit_per_kg);set('val_margin',d.margin_pct+'%');set('val_total_profit',(d.profit_total_aud>=0?'+':'')+'A$'+Math.round(d.profit_total_aud).toLocaleString());
    const pEl=document.getElementById('val_profit_kg');if(pEl)pEl.className='kpi-value '+(d.profit_per_kg>=0?'text-success':'text-danger');
    const ab=document.getElementById('advantageBox');
    if(ab){const ok=d.profit_per_kg>=0;ab.style.background=ok?'#f0faf5':'#fff5f5';ab.style.borderColor=ok?'#a3d9b8':'#fca5a5';ab.innerHTML=`<strong>${ok?'Profitable':'Below breakeven'}</strong><br>Breakeven: A$${d.breakeven_sell_price}/kg<br>India vs China: <span class="text-success">A$${d.advantage_vs_china_aud}/kg cheaper</span><br>China landed: A$${d.china_landed_aud}/kg`;}
    const sell=parseFloat(document.getElementById('sl_sell_price').value);
    const aud=parseFloat(document.getElementById('sl_audusd').value);
    const qLanded=INDIA_PRICE_DATA.india_fob.map((f,i)=>parseFloat(((f+INDIA_PRICE_DATA.freight_india[i])/INDIA_PRICE_DATA.aud_usd[i]).toFixed(3)));
    makeChart('profitZoneChart',{type:'line',data:{labels:INDIA_PRICE_DATA.quarters,datasets:[{label:'India landed (AUD/kg)',data:qLanded,borderColor:'#dc3545',backgroundColor:'transparent',tension:0.3,pointRadius:3,borderWidth:2},{label:'Your sell price',data:INDIA_PRICE_DATA.quarters.map(()=>sell),borderColor:'#0d6efd',backgroundColor:'transparent',tension:0,pointRadius:0,borderWidth:2,borderDash:[6,3]},{label:'Profit zone',data:qLanded,fill:{target:1,above:'rgba(25,135,84,0.15)',below:'rgba(220,53,69,0.1)'},borderColor:'transparent',backgroundColor:'transparent',pointRadius:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{mode:'index',intersect:false}},scales:{x:{grid:GRID,ticks:{...TICK,maxRotation:45}},y:{grid:GRID,ticks:{...TICK,callback:v=>'A$'+v}}}}});
    const il=d.landed_aud,cl=d.china_landed_aud;
    makeChart('waterfallChart',{type:'bar',data:{labels:['India FOB','Freight','Duty','Landed','Sell Price','Profit','China Landed'],datasets:[{label:'AUD/kg',data:[parseFloat(document.getElementById('sl_india_fob').value)/aud,parseFloat(document.getElementById('sl_freight').value)/aud,parseFloat(document.getElementById('sl_duty').value)/aud,il,sell,sell-il,cl],backgroundColor:['#0dcaf0','#adb5bd','#fd7e14','#0d6efd','#6f42c1',sell-il>=0?'#198754':'#dc3545','#de2910'],borderRadius:4,borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` A$${parseFloat(c.raw).toFixed(3)}/kg`}}},scales:{x:{grid:{display:false},ticks:{...TICK,maxRotation:30}},y:{grid:GRID,ticks:{...TICK,callback:v=>'A$'+parseFloat(v).toFixed(2)}}}}});
    const bd=document.getElementById('profitBreakdown');
    if(bd)bd.innerHTML=`<div class="d-flex justify-content-between border-bottom py-1"><span>India FOB (USD/kg)</span><span>$${parseFloat(document.getElementById('sl_india_fob').value).toFixed(3)}</span></div><div class="d-flex justify-content-between border-bottom py-1"><span>+ Freight</span><span>$${parseFloat(document.getElementById('sl_freight').value).toFixed(3)}</span></div><div class="d-flex justify-content-between border-bottom py-1"><span>+ Duty</span><span>$${parseFloat(document.getElementById('sl_duty').value).toFixed(3)}</span></div><div class="d-flex justify-content-between border-bottom py-1"><span class="text-danger fw-500">= Landed (AUD/kg)</span><span class="text-danger">A$${d.landed_aud}</span></div><div class="d-flex justify-content-between border-bottom py-1"><span>Sell price</span><span>A$${sell.toFixed(2)}</span></div><div class="d-flex justify-content-between py-1 fw-500"><span class="${d.profit_per_kg>=0?'text-success':'text-danger'}">Profit/kg</span><span class="${d.profit_per_kg>=0?'text-success':'text-danger'}">${d.profit_per_kg>=0?'+':''}A$${d.profit_per_kg}</span></div>`;
  },80);
}

// ── DATA TABLE ────────────────────────────────────────────────────────────────
let curSort={col:-1,dir:1};let curData={headers:[],rows:[]};
function renderTable(key){fetch(`/api/table-data/?dataset=${key}`).then(r=>r.json()).then(d=>{curData=d;curSort={col:-1,dir:1};buildTable(d.headers,d.rows);const src=document.getElementById('tableSourceBadge');if(src){const tc=d.type==='real'?'success':d.type==='ml_ready'?'primary':d.type==='uploaded'?'info':'warning';src.innerHTML=`<span class="badge bg-${tc}-subtle text-${tc} me-2">${d.type?.toUpperCase()}</span><small class="text-muted">Source: ${d.source}</small>`;}const info=document.getElementById('tableInfo');if(info)info.textContent=`${d.rows.length} rows x ${d.headers.length} columns`;});}
function buildTable(headers,rows){const th=document.getElementById('tableHead');const tb=document.getElementById('tableBody');if(!th||!tb)return;th.innerHTML='<tr>'+headers.map((h,i)=>`<th onclick="sortTable(${i})">${h} <i class="bi bi-arrow-down-up ms-1" style="font-size:9px;opacity:.4"></i></th>`).join('')+'</tr>';renderTableRows(rows);}
function renderTableRows(rows){const tb=document.getElementById('tableBody');if(!tb)return;tb.innerHTML=rows.map(r=>'<tr>'+r.map(c=>`<td>${c}</td>`).join('')+'</tr>').join('');}
function sortTable(ci){if(curSort.col===ci)curSort.dir*=-1;else{curSort.col=ci;curSort.dir=1;}const sorted=[...curData.rows].sort((a,b)=>{const na=parseFloat(String(a[ci]).replace(/[^0-9.\-]/g,'')),nb=parseFloat(String(b[ci]).replace(/[^0-9.\-]/g,''));if(!isNaN(na)&&!isNaN(nb))return(na-nb)*curSort.dir;return String(a[ci]).localeCompare(String(b[ci]))*curSort.dir;});renderTableRows(sorted);}
function exportCSV(){const{headers,rows}=curData;if(!headers.length)return;const lines=[headers.join(','),...rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(','))];const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/csv'}));a.download='novoanalytics_export.csv';a.click();}

// ── FILE UPLOAD ───────────────────────────────────────────────────────────────
function handleUpload(file){
  const st=document.getElementById('uploadStatus');if(!file)return;
  const ext=file.name.split('.').pop().toLowerCase();
  if(!['xlsx','xls','csv'].includes(ext)){if(st)st.innerHTML='<span class="text-danger">Only .xlsx, .xls, .csv</span>';return;}
  if(st)st.innerHTML='<span class="text-muted"><i class="bi bi-hourglass-split me-1"></i>Uploading...</span>';
  const fd=new FormData();fd.append('file',file);
  fetch('/upload/',{method:'POST',body:fd}).then(r=>r.json()).then(d=>{
    if(d.success){if(st)st.innerHTML='<span class="text-success"><i class="bi bi-check-circle me-1"></i>Done</span>';addUploadedDs(d.key,d.label);showToast(d.label+' loaded');}
    else{if(st)st.innerHTML=`<span class="text-danger">${d.error}</span>`;}
  });
}
function addUploadedDs(key,label){
  const list=document.getElementById('datasetList');
  const item=document.createElement('div');item.className='dataset-item';item.dataset.key=key;item.dataset.type='uploaded';
  item.innerHTML=`<span class="ds-dot ml"></span><span class="ds-name">${label}</span><span class="badge-type ml">New</span>`;
  item.addEventListener('click',()=>{document.querySelectorAll('.dataset-item').forEach(d=>d.classList.remove('active'));item.classList.add('active');const ts=document.getElementById('tableDatasetSelect');if(ts){const o=document.createElement('option');o.value=key;o.textContent=label;ts.appendChild(o);ts.value=key;}switchTab('data');setTimeout(()=>renderTable(key),100);});
  list.appendChild(item);
  const ts=document.getElementById('tableDatasetSelect');if(ts){const o=document.createElement('option');o.value=key;o.textContent=label;ts.appendChild(o);}
}
function showToast(msg){const el=document.getElementById('uploadToast');const m=document.getElementById('toastMsg');if(el&&m){m.textContent=msg;new bootstrap.Toast(el,{delay:3000}).show();}}

// ── INIT ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.nav-item[data-tab]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();switchTab(b.dataset.tab);}));
  document.querySelectorAll('.dataset-item[data-key]').forEach(item=>item.addEventListener('click',()=>{document.querySelectorAll('.dataset-item').forEach(d=>d.classList.remove('active'));item.classList.add('active');const ts=document.getElementById('tableDatasetSelect');if(ts)ts.value=item.dataset.key;switchTab('data');setTimeout(()=>renderTable(item.dataset.key),100);}));
  const ts=document.getElementById('tableDatasetSelect');if(ts)ts.addEventListener('change',e=>renderTable(e.target.value));
  document.getElementById('exportCsvBtn')?.addEventListener('click',exportCSV);
  const fi=document.getElementById('fileInput');const uz=document.getElementById('uploadZone');
  if(uz){uz.addEventListener('click',()=>fi?.click());uz.addEventListener('dragover',e=>{e.preventDefault();uz.classList.add('dragover');});uz.addEventListener('dragleave',()=>uz.classList.remove('dragover'));uz.addEventListener('drop',e=>{e.preventDefault();uz.classList.remove('dragover');if(e.dataTransfer.files.length)handleUpload(e.dataTransfer.files[0]);});}
  if(fi)fi.addEventListener('change',e=>e.target.files.length&&handleUpload(e.target.files[0]));
  document.getElementById('sidebarToggle')?.addEventListener('click',()=>document.getElementById('sidebar')?.classList.toggle('open'));
  document.getElementById('chatInput')?.addEventListener('keydown',e=>{if(e.key==='Enter')sendChat();});
  initOverview();
});
