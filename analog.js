// CircuitForge Analog Simulator
// Change this URL when the hosted backend is ready.
const API_BASE_URL = "http://127.0.0.1:8000";

const button = document.getElementById("simulate");
const statusText = document.getElementById("status");
const resultText = document.getElementById("result");
const canvas = document.getElementById("waveform");

if (!button || !statusText || !resultText || !canvas) {
  throw new Error("Analog simulator UI elements were not found.");
}

const ctx = canvas.getContext("2d");

function drawWaveform(points) {
  if (!Array.isArray(points) || points.length === 0) {
    throw new Error("No waveform data received.");
  }

  const width = canvas.width;
  const height = canvas.height;
  const padding = 55;

  ctx.clearRect(0, 0, width, height);

  const maxTime = Math.max(...points.map(p => p.time), 0.001);
  const maxVoltage = Math.max(
    1,
    ...points.map(p => p.voltage)
  );

  ctx.strokeStyle = "#344b6b";
  ctx.lineWidth = 1;

  for (let i = 0; i <= 5; i++) {
    const y = padding + (height - 2 * padding) * i / 5;

    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }

  ctx.fillStyle = "#aebed5";
  ctx.font = "13px Arial";
  ctx.fillText("Voltage (V)", 12, 25);
  ctx.fillText("Time (s)", width - 95, height - 12);

  ctx.strokeStyle = "#00d9ff";
  ctx.lineWidth = 3;
  ctx.beginPath();

  points.forEach((point, index) => {
    const x = padding +
      (point.time / maxTime) * (width - 2 * padding);

    const y = height - padding -
      (point.voltage / maxVoltage) * (height - 2 * padding);

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.stroke();
}

button.addEventListener("click", async () => {
  const payload = {
    resistance: Number(document.getElementById("resistance").value),
    capacitance: Number(document.getElementById("capacitance").value),
    voltage: Number(document.getElementById("voltage").value),
    duration: Number(document.getElementById("duration").value)
  };

  if (Object.values(payload).some(value =>
    !Number.isFinite(value) || value <= 0
  )) {
    statusText.textContent = "Enter valid positive numbers.";
    return;
  }

  if (
    payload.resistance > 10_000_000 ||
    payload.capacitance > 10 ||
    payload.voltage > 100 ||
    payload.duration > 10
  ) {
    statusText.textContent = "One or more values exceed the allowed limits.";
    return;
  }

  button.disabled = true;
  statusText.textContent = "Running ngspice...";
  resultText.textContent = "";

  try {
    const response = await fetch(
      `${API_BASE_URL}/simulate-rc`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Simulation failed.");
    }

    if (
      !data.success ||
      !Array.isArray(data.points) ||
      data.points.length === 0 ||
      data.points.length > 600
    ) {
      throw new Error("Invalid simulation response.");
    }

    drawWaveform(data.points);

    const finalPoint = data.points[data.points.length - 1];

    resultText.textContent =
      `Final voltage: ${finalPoint.voltage.toFixed(4)} V | ` +
      `${data.points.length} simulation points`;

    statusText.textContent =
      "Simulation completed successfully.";

  } catch (error) {
    statusText.textContent =
      "Simulation error: " + error.message;

  } finally {
    button.disabled = false;
  }
});