const canvas=document.getElementById("canvas"), wiresSvg=document.getElementById("wires");
const inspector=document.getElementById("inspectorContent");
let components=[], connections=[], selected=null, placement="INPUT", pending=null, nextId=1;
const defs={INPUT:{label:"INPUT",glyph:"I",inputs:0},AND:{label:"AND",glyph:"∧",inputs:2},OR:{label:"OR",glyph:"≥1",inputs:2},NOT:{label:"NOT",glyph:"¬",inputs:1},XOR:{label:"XOR",glyph:"=1",inputs:2},OUTPUT:{label:"OUTPUT",glyph:"Y",inputs:1}};
function make(kind,x,y,value=0){const c={id:nextId++,kind,x,y,value};components.push(c);return c}
function get(id){return components.find(c=>c.id===id)}
function incoming(id,port){return connections.find(w=>w.to===id&&w.port===port)}
function signal(id,seen=new Set()){
  if(seen.has(id))return 0;seen.add(id);const c=get(id);if(!c)return 0;
  if(c.kind==="INPUT")return c.value;
  const a=incoming(id,0),b=incoming(id,1),av=a?signal(a.from,new Set(seen)):0,bv=b?signal(b.from,new Set(seen)):0;
  if(c.kind==="AND")return av&bv;if(c.kind==="OR")return av|bv;if(c.kind==="NOT")return 1-av;if(c.kind==="XOR")return av^bv;if(c.kind==="OUTPUT")return av;return 0;
}
function render(){
  canvas.querySelectorAll(".component").forEach(e=>e.remove());
  const empty=document.getElementById("emptyState");if(empty)empty.style.display=components.length?"none":"flex";
  components.forEach(c=>{
    const el=document.createElement("div");el.className="component"+(selected===c.id?" selected":"")+(c.kind==="INPUT"&&c.value?" input-on":"")+(c.kind==="OUTPUT"&&signal(c.id)?" output-on":"");
    el.style.left=c.x+"px";el.style.top=c.y+"px";el.dataset.id=c.id;
    const val=c.kind==="INPUT"?c.value:c.kind==="OUTPUT"?signal(c.id):signal(c.id);
    el.innerHTML=`<div class="component-head"><span>${defs[c.kind].label}</span><span>#${String(c.id).padStart(2,"0")}</span></div><div class="component-body"><span class="${c.kind==="INPUT"?"component-value":c.kind==="OUTPUT"?"component-output":"component-glyph"}">${c.kind==="INPUT"||c.kind==="OUTPUT"?val:defs[c.kind].glyph}</span></div>`;
    if(defs[c.kind].inputs>0){el.insertAdjacentHTML("beforeend",'<span class="port in1" data-port="0" title="Input 1"></span>');if(defs[c.kind].inputs>1)el.insertAdjacentHTML("beforeend",'<span class="port in2" data-port="1" title="Input 2"></span>')}
    if(c.kind!=="OUTPUT")el.insertAdjacentHTML("beforeend",'<span class="port out" data-port="out" title="Output"></span>');
    if(c.kind==="INPUT")el.classList.add("component-switch");
    el.addEventListener("click",e=>{const port=e.target.closest(".port");if(port){e.stopPropagation();handlePort(c.id,port.dataset.port);return}if(c.kind==="INPUT"){c.value=1-c.value;selected=c.id;render();return}selected=c.id;render()});
    canvas.appendChild(el);
  });
  drawWires();renderInspector();document.getElementById("componentCount").textContent=components.length;document.getElementById("connectionCount").textContent=connections.length;
}
function handlePort(id,port){
  if(port==="out"){pending=id;document.querySelectorAll(".port").forEach(p=>p.classList.remove("pending"));const el=canvas.querySelector(`[data-id="${id}"] .port.out`);if(el)el.classList.add("pending");document.getElementById("selectionHint").textContent="NOW SELECT A GATE INPUT PORT";return}
  if(pending===null){document.getElementById("selectionHint").textContent="SELECT AN OUTPUT PORT FIRST";return}
  if(pending===id){pending=null;render();return}
  const target=get(id),source=get(pending);if(!source||!target||source.kind==="OUTPUT"){pending=null;render();return}
  connections=connections.filter(w=>!(w.to===id&&w.port===Number(port)));
  connections.push({from:pending,to:id,port:Number(port)});pending=null;selected=id;document.getElementById("selectionHint").textContent="CONNECTION ADDED · SIGNALS UPDATED";render();
}
function drawWires(){
  const rect=canvas.getBoundingClientRect();wiresSvg.setAttribute("viewBox",`0 0 ${Math.max(rect.width,600)} ${Math.max(rect.height,460)}`);wiresSvg.innerHTML="";
  connections.forEach(w=>{const s=get(w.from),t=get(w.to);if(!s||!t)return;const x1=s.x+112,y1=s.y+58,x2=t.x,y2=t.y+(w.port===0?39:59),mid=(x1+x2)/2;const path=document.createElementNS("http://www.w3.org/2000/svg","path");path.setAttribute("d",`M ${x1} ${y1} H ${mid} V ${y2} H ${x2}`);path.setAttribute("class","wire-line"+(signal(w.from)?" high":""));wiresSvg.appendChild(path)});
}
function renderInspector(){
  const c=get(selected);if(!c){inspector.innerHTML='<div class="inspector-empty"><span>⌖</span><b>No component selected</b><small>Select a component on the canvas to inspect its properties.</small></div>';return}
  const connected=connections.filter(w=>w.from===c.id||w.to===c.id).length;
  inspector.innerHTML=`<div class="property"><label>COMPONENT</label><strong>${defs[c.kind].label} · #${c.id}</strong></div><div class="property"><label>POSITION</label><strong>${c.x}px, ${c.y}px</strong></div><div class="property"><label>OUTPUT SIGNAL</label><strong>${signal(c.id)}</strong></div><div class="property"><label>CONNECTIONS</label><strong>${connected}</strong></div>${c.kind==="INPUT"?'<div class="property"><label>SWITCH VALUE</label><button id="toggleValue">Toggle 0 / 1</button></div>':""}<div class="property"><label>COMPONENT ACTIONS</label><button id="deleteComponent" class="delete-btn">Delete component</button><button id="disconnectComponent">Remove wires</button></div>`;
  const toggle=document.getElementById("toggleValue");if(toggle)toggle.onclick=()=>{c.value=1-c.value;render()};
  document.getElementById("deleteComponent").onclick=()=>{components=components.filter(x=>x.id!==c.id);connections=connections.filter(w=>w.from!==c.id&&w.to!==c.id);selected=null;render()};
  document.getElementById("disconnectComponent").onclick=()=>{connections=connections.filter(w=>w.from!==c.id&&w.to!==c.id);render()};
}
document.querySelectorAll(".component-btn").forEach(btn=>btn.addEventListener("click",()=>{placement=btn.dataset.kind;document.querySelectorAll(".component-btn").forEach(b=>b.classList.toggle("selected",b===btn));document.getElementById("selectionHint").textContent=`CLICK CANVAS TO PLACE ${placement}`}));
canvas.addEventListener("click",e=>{if(e.target.closest(".component")||e.target.closest(".port"))return;if(!placement)return;const r=canvas.getBoundingClientRect();const x=Math.max(12,Math.min(e.clientX-r.left-56,r.width-124)),y=Math.max(12,Math.min(e.clientY-r.top-38,r.height-90));const c=make(placement,x,y);selected=c.id;placement=null;document.querySelectorAll(".component-btn").forEach(b=>b.classList.remove("selected"));document.getElementById("selectionHint").textContent="COMPONENT PLACED · SELECT AN OUTPUT PORT TO CONNECT";render()});
document.getElementById("clearBtn").onclick=()=>{components=[];connections=[];selected=null;pending=null;render();document.getElementById("selectionHint").textContent="CANVAS CLEARED"};
document.getElementById("exampleBtn").onclick=()=>{components=[];connections=[];selected=null;pending=null;nextId=1;const a=make("INPUT",35,105,1),b=make("INPUT",35,250,1),g=make("AND",260,175),o=make("OUTPUT",480,175);connections=[{from:a.id,to:g.id,port:0},{from:b.id,to:g.id,port:1},{from:g.id,to:o.id,port:0}];render();document.getElementById("selectionHint").textContent="EXAMPLE LOADED · TRY TOGGLE INPUT SWITCHES"};
window.addEventListener("resize",drawWires);
render();