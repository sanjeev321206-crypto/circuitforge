# CircuitForge

An interactive electronics learning and engineering platform.

## v0.2 — Digital Circuit Lab
- Responsive landing page and project directory
- Interactive two-input logic gate demo on the homepage
- Separate circuit builder at `lab.html`
- Place input switches, AND, OR, NOT, XOR gates and output LEDs
- Connect component output ports to gate input ports
- Live combinational signal evaluation
- Load a sample AND circuit, toggle switches, inspect or delete components

## Run locally
```bash
python3 -m http.server 8000
```
Open `http://localhost:8000`.

## Files
- `index.html`, `styles.css`, `app.js` — platform homepage
- `lab.html`, `lab.css`, `lab.js` — Digital Circuit Lab

## Simulation limitations
This is an educational browser-based combinational logic model. It does not yet simulate propagation delay, clocked/sequential logic, electrical characteristics, Verilog or physical hardware.

## Roadmap
1. Add component dragging and snapping
2. Add sequential logic (D flip-flops, counters, clocks)
3. Add save/load circuit files and truth-table export
4. Integrate real Verilog simulation and waveform inspection
5. Add ngspice-based analog circuit simulation
6. Add CPU pipeline visualiser and synthesis dashboard
