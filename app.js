const projects = [
  {n:"01",icon:"⌘",name:"Digital Circuit Lab",desc:"Build logic circuits, connect gates and experiment with digital signals in an interactive workspace.",tag:"DIGITAL LOGIC",status:"Interactive demo",anchor:"lab.html"},
  {n:"02",icon:"⌁",name:"Verilog Visualizer",desc:"Explore RTL behaviour through signal waveforms, testbench results and step-by-step simulation.",tag:"HDL / RTL",status:"Planned",anchor:"#about"},
  {n:"03",icon:"∿",name:"Analog Circuit Simulator",desc:"Experiment with RC, RLC and op-amp circuits and inspect their voltage and frequency responses.",tag:"ANALOG",status:"Planned",anchor:"#about"},
  {n:"04",icon:"▦",name:"CPU Architecture Simulator",desc:"Follow instructions through a processor pipeline and understand hazards, forwarding and performance.",tag:"COMPUTER ARCHITECTURE",status:"Planned",anchor:"#about"},
  {n:"05",icon:"▣",name:"Mini EDA Dashboard",desc:"Explore synthesis reports, logic utilisation, timing estimates and design trade-offs.",tag:"EDA / VLSI",status:"Planned",anchor:"#about"}
];
const grid=document.getElementById("projectGrid");
grid.innerHTML=projects.map(p=>`<article class="project-card"><span class="project-no">${p.n} / 05</span><div class="project-icon">${p.icon}</div><h3>${p.name}</h3><p>${p.desc}</p><div class="card-bottom"><span class="tag">${p.tag}</span><a class="card-link" href="${p.anchor}">${p.status==="Interactive demo"?"Try demo ↗":"Explore ↗"}</a></div></article>`).join("");

const gateSelect=document.getElementById("gateSelect");
const toggleA=document.getElementById("toggleA"),toggleB=document.getElementById("toggleB");
let A=0,B=0;
const evalGate=(gate,a,b)=>({AND:a&b,OR:a|b,XOR:a^b,NAND:1-(a&b),NOR:1-(a|b),XNOR:1-(a^b)})[gate];
const gatePath=(gate)=>{
  const paths={
    AND:"M235 85 H285 C370 85 370 215 285 215 H235 Z",
    OR:"M235 85 Q290 150 235 215 Q300 215 390 150 Q300 85 235 85 Z",
    XOR:"M250 85 Q305 150 250 215 Q315 215 405 150 Q315 85 250 85 Z",
    NAND:"M235 85 H285 C370 85 370 215 285 215 H235 Z",
    NOR:"M235 85 Q290 150 235 215 Q300 215 390 150 Q300 85 235 85 Z",
    XNOR:"M250 85 Q305 150 250 215 Q315 215 405 150 Q315 85 250 85 Z"
  };
  return paths[gate];
};
function render(){
  const gate=gateSelect.value,y=evalGate(gate,A,B);
  document.getElementById("aValue").textContent=A;document.getElementById("bValue").textContent=B;
  toggleA.classList.toggle("on",!!A);toggleB.classList.toggle("on",!!B);
  document.getElementById("outputValue").textContent=y;
  document.getElementById("outputText").textContent=y?"HIGH / TRUE":"LOW / FALSE";
  document.getElementById("wireA").classList.toggle("high",!!A);document.getElementById("wireB").classList.toggle("high",!!B);document.getElementById("wireOut").classList.toggle("high",!!y);
  document.getElementById("dotA").classList.toggle("high",!!A);document.getElementById("dotB").classList.toggle("high",!!B);document.getElementById("dotOut").classList.toggle("high",!!y);
  const bubble=["NAND","NOR","XNOR"].includes(gate)?'<circle cx="410" cy="150" r="8" fill="#0b1421" stroke="#5ac9e9" stroke-width="2.5"/>':"";
  document.getElementById("gateShape").innerHTML=`<path class="gate-shape" d="${gatePath(gate)}"/>${bubble}`;
  document.getElementById("gateSvgLabel").textContent=gate+" GATE";
  const combos=[[0,0],[0,1],[1,0],[1,1]];
  document.getElementById("truthTable").innerHTML=["A","B","Y"].map(x=>`<span class="th">${x}</span>`).join("")+combos.map(([a,b])=>`<span class="${a===A&&b===B?'current':''}">${a}</span><span class="${a===A&&b===B?'current':''}">${b}</span><span class="${a===A&&b===B?'current':''}">${evalGate(gate,a,b)}</span>`).join("");
}
toggleA.addEventListener("click",()=>{A=1-A;render()});toggleB.addEventListener("click",()=>{B=1-B;render()});gateSelect.addEventListener("change",render);
document.getElementById("resetDemo").addEventListener("click",()=>{A=0;B=0;gateSelect.value="AND";render()});
document.getElementById("year").textContent=new Date().getFullYear();
document.getElementById("menuToggle").addEventListener("click",()=>document.querySelector(".nav-links").classList.toggle("open"));
document.querySelectorAll(".nav-links a").forEach(a=>a.addEventListener("click",()=>document.querySelector(".nav-links").classList.remove("open")));
render();