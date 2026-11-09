from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import subprocess
import tempfile
import pathlib
import math
import threading

app = FastAPI(title="CircuitForge Analog Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://sanjeev321206-crypto.github.io",
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

# Limit simultaneous ngspice processes.
simulation_lock = threading.BoundedSemaphore(2)


class RCRequest(BaseModel):
    resistance: float = Field(gt=0, le=10_000_000)
    capacitance: float = Field(gt=0, le=10)
    voltage: float = Field(gt=0, le=100)
    duration: float = Field(default=0.5, gt=0, le=10)


@app.get("/")
def health():
    return {
        "status": "Analog engine online",
        "engine": "ngspice",
    }


@app.post("/simulate-rc")
def simulate_rc(request: RCRequest):

    if not simulation_lock.acquire(blocking=False):
        raise HTTPException(
            status_code=429,
            detail="Simulation capacity reached. Try again shortly.",
        )

    try:
        with tempfile.TemporaryDirectory() as temp:
            folder = pathlib.Path(temp)
            netlist = folder / "rc.cir"
            output = folder / "rc.dat"

            circuit = f"""
V1 input 0 DC {request.voltage}
R1 input output {request.resistance}
C1 output 0 {request.capacitance} IC=0

.control
set noaskquit
tran {request.duration / 500} {request.duration} uic
wrdata {output} v(output)
.endc
.end
"""

            netlist.write_text(circuit)

            try:
                result = subprocess.run(
                    ["ngspice", "-b", str(netlist)],
                    cwd=folder,
                    capture_output=True,
                    text=True,
                    timeout=10,
                    check=False,
                )

            except subprocess.TimeoutExpired:
                raise HTTPException(
                    status_code=504,
                    detail="Simulation timed out.",
                )

            except OSError:
                raise HTTPException(
                    status_code=500,
                    detail="Simulation engine unavailable.",
                )

            if result.returncode != 0 or not output.exists():
                raise HTTPException(
                    status_code=500,
                    detail="ngspice simulation failed.",
                )

            points = []

            for line in output.read_text().splitlines():
                columns = line.split()

                if len(columns) < 2:
                    continue

                try:
                    time_value = float(columns[0])
                    voltage_value = float(columns[1])
                except ValueError:
                    continue

                if not (
                    math.isfinite(time_value)
                    and math.isfinite(voltage_value)
                ):
                    continue

                points.append({
                    "time": time_value,
                    "voltage": voltage_value,
                })

                if len(points) > 600:
                    raise HTTPException(
                        status_code=500,
                        detail="Too many simulation points.",
                    )

            if not points:
                raise HTTPException(
                    status_code=500,
                    detail="Invalid simulation output.",
                )

            return {
                "success": True,
                "component": "RC circuit",
                "points": points,
                "message": "Simulation completed with ngspice",
            }

    finally:
        simulation_lock.release()
