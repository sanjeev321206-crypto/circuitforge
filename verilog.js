const examples = {
  halfAdder: {
    name:"half_adder", desc:"Adds two 1-bit inputs and produces sum and carry outputs.", time:"10 ns",
    code:`module half_adder(\n    input  wire a,\n    input  wire b,\n    output wire sum,\n    output wire carry\n);\n    assign sum   = a ^ b;\n    assign carry = a & b;\nendmodule`,
    ports:[["a","INPUT"],["b","INPUT"],["sum","OUTPUT"],["carry","OUTPUT"]],
    signals:["a","b","sum","carry"],
    vectors:[[0,0],[0,1],[1,0],[1,1]],
    calc:v=>({a:v[0],b:v[1],sum:v[0]^v[1],carry:v[0]&v[1]})
  },
  fullAdder: {
    name:"full_adder", desc:"Adds three 1-bit values: a, b and carry-in. Produces sum and carry-out.", time:"10 ns",
    code:`module full_adder(\n    input  wire a,\n    input  wire b,\n    input  wire cin,\n    output wire sum,\n    output wire cout\n);\n    assign sum  = a ^ b ^ cin;\n    assign cout = (a & b) | (b & cin) | (a & cin);\nendmodule`,
    ports:[["a","INPUT"],["b","INPUT"],["cin","INPUT"],["sum","OUTPUT"],["cout","OUTPUT"]],
    signals:["a","b","cin","sum","cout"],
    vectors:[[0,0,0],[0,0,1],[0,1,0],[0,1,1],[1,0,0],[1,0,1],[1,1,0],[1,1,1]],
    calc:v=>({a:v[0],b:v[1],cin:v[2],sum:v[0]^v[1]^v[2],cout:(v[0]&v[1])|(v[1]&v[2])|(v[0]&v[2])})
  },
  mux2: {
    name:"mux2", desc:"A 2:1 multiplexer routes d0 or d1 to y depending on select input s.", time:"10 ns",
    code:`module mux2(\n    input  wire d0,\n    input  wire d1,\n    input  wire s,\n    output wire y\n);\n    assign y = s ? d1 : d0;\nendmodule`,
    ports:[["d0","INPUT"],["d1","INPUT"],["s","SELECT"],["y","OUTPUT"]],
    signals:["d0","d1","s","y"],
    vectors:[[0,0,0],[0,1,0],[1,0,0],[1,1,0],[0,0,1],[0,1,1],[1,0,1],[1,1,1]],
    calc:v=>({d0:v[0],d1:v[1],s:v[2],y:v[2]?v[1]:v[0]})
  },
  counter: {
    name:"counter4", desc:"A conceptual 4-bit modulo-16 counter. The preview displays successive count states.", time:"10 ns",
    code:`module counter4(\n    input  wire clk,\n    input  wire reset,\n    output reg [3:0] count\n);\n    always @(posedge clk or posedge reset) begin\n        if (reset)\n            count <= 4'b0000;\n        else\n            count <= count + 1'b1;\n    end\nendmodule`,
    ports:[["clk","INPUT"],["reset","INPUT"],["count[3:0]","OUTPUT"]],
    signals:["clk","reset","count"],
    vectors:[[0,1],[1,0],[0,0],[1,0],[0,0],[1,0],[0,0],[1,0]],
    calc:v=>({clk:v[0],reset:v[1],count:0})
  }
};
const $=id=>document.getElementById(id);
let selected="halfAdder";
function loadExample(key){
  selected=key;const ex=examples[key];
  $("codeEditor").value=ex.code;$("moduleName").textContent=ex.name;$("moduleDesc").textContent=ex.desc;$("timeStep").textContent=ex.time;
  $("portList").innerHTML=ex.ports.map(([n,t])=>`<div class="port-row"><span>${n}</span><small>${t}</small></div>`).join("");
  $("editorStatus").textContent="EXAMPLE LOADED";updateLines();$("runStatus").textContent="READY · "+ex.name.toUpperCase();
  $("waveform").innerHTML='<div class="wave-empty">Run a preview to generate signal traces.</div>';
  $("resultHead").innerHTML="";$("resultBody").innerHTML='<tr><td class="empty-cell" colspan="5">No results yet. Run a preview.</td></tr>';
}
function updateLines(){const n=$("codeEditor").value.split("\n").length;$("lineNumbers").textContent=Array.from({length:n},(_,i)=>i+1).join("\n")}
function makeWave(name,values,total){
  const w=520,step=w/values.length;let d=`M 0 ${values[0]?7:25}`;
  values.forEach((v,i)=>{const x=(i+1)*step,y=v?7:25;d+=` H ${x} V ${y}`});
  return `<div class="signal-label">${name}</div><svg class="signal-svg" viewBox="0 0 ${w} 32" preserveAspectRatio="none"><path d="${d}"/></svg>`;
}
async function run(){
  const benches = {
    halfAdder: `module tb;
      reg a,b; wire sum,carry;
      half_adder dut(a,b,sum,carry);
      initial begin
        $display("a b sum carry");
        a=0;b=0;#10;$display("%b %b %b %b",a,b,sum,carry);
        a=0;b=1;#10;$display("%b %b %b %b",a,b,sum,carry);
        a=1;b=0;#10;$display("%b %b %b %b",a,b,sum,carry);
        a=1;b=1;#10;$display("%b %b %b %b",a,b,sum,carry);
        $finish;
      end
    endmodule`,
    fullAdder: `module tb;
      reg a,b,cin; wire sum,cout; integer i;
      full_adder dut(a,b,cin,sum,cout);
      initial begin
        $display("a b cin sum cout");
        for(i=0;i<8;i=i+1) begin
          {a,b,cin}=i; #10;
          $display("%b %b %b %b %b",a,b,cin,sum,cout);
        end
        $finish;
      end
    endmodule`,
    mux2: `module tb;
      reg d0,d1,s; wire y; integer i;
      mux2 dut(d0,d1,s,y);
      initial begin
        $display("d0 d1 s y");
        for(i=0;i<8;i=i+1) begin
          {d0,d1,s}=i; #10;
          $display("%b %b %b %b",d0,d1,s,y);
        end
        $finish;
      end
    endmodule`,
    counter: `module tb;
      reg clk=0,reset=0;
      wire [3:0] count;
      counter4 dut(clk,reset,count);
      initial begin
        $display("clk reset count");
        #2 reset=1;
        #2 $display("%b %b %b",clk,reset,count);
        #2 reset=0;
        repeat(6) begin
          #4 clk=1;
          #1 $display("%b %b %b",clk,reset,count);
          #4 clk=0;
        end
        $finish;
      end
    endmodule`
  };

  const button=$("runSimulation");
  button.disabled=true;
  $("runStatus").textContent="RUNNING · ICARUS VERILOG";
  $("resultBody").textContent="";
  $("waveform").textContent="Running actual HDL simulation...";

  try {
    const response=await fetch("https://missed-leisure-colorado-animated.trycloudflare.com/simulate",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        verilog_code:$("codeEditor").value,
        testbench_code:benches[selected]
      })
    });

    const data=await response.json();

    if(!data.success){
      $("runStatus").textContent="SIMULATION FAILED";
      $("resultBody").textContent=data.errors||"Compilation or simulation failed.";
      $("waveform").textContent=data.stage||"Check your Verilog code.";
      return;
    }

    const lines=data.output.trim().split(/\r?\n/).filter(Boolean);
    const headers=lines.shift().split(/\s+/);
    const rows=lines.filter(x=>!x.includes("$finish called")).map(x=>x.trim().split(/\s+/));

    $("resultHead").innerHTML="<tr>"+headers.map(x=>`<th>${x.toUpperCase()}</th>`).join("")+"</tr>";
    $("resultBody").innerHTML=rows.map(row=>"<tr>"+row.map(x=>`<td class='bit'>${x}</td>`).join("")+"</tr>").join("");

    $("waveDuration").textContent="REAL HDL SIMULATION";
    $("waveform").textContent="Actual Icarus Verilog results displayed above. Real waveform export is a future step.";
    $("runStatus").textContent=`SIMULATION COMPLETE · ${rows.length} RESULT ROWS`;
    $("editorStatus").textContent="COMPILED · ICARUS VERILOG";

  } catch(error) {
    $("runStatus").textContent="CONNECTION ERROR";
    $("waveform").textContent=error.message;
  } finally {
    button.disabled=false;
  }
}
$("exampleSelect").addEventListener("change",e=>loadExample(e.target.value));
$("resetCode").addEventListener("click",()=>loadExample(selected));
$("codeEditor").addEventListener("input",()=>{updateLines();$("editorStatus").textContent="EDITED · PREVIEW MODEL UNCHANGED"});
$("codeEditor").addEventListener("keydown",e=>{if(e.key==="Tab"){e.preventDefault();const s=e.target.selectionStart,end=e.target.selectionEnd;e.target.setRangeText("  ",s,end,"end")}});
$("runSimulation").addEventListener("click",run);
loadExample(selected);
