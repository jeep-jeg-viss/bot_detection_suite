const statusEl = document.querySelector("#status");
const runButton = document.querySelector("#run-check");

runButton.addEventListener("click", async () => {
  runButton.disabled = true;
  statusEl.innerHTML = "<div class=\"pill\">Collecting signals...</div>";
  const signals = await collectSignals();
  const response = await fetch("/api/collect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(signals)
  });
  const verdict = await response.json();
  renderResults(signals, verdict);
  runButton.disabled = false;
});

async function collectSignals() {
  const workerMetrics = await getWorkerMetrics();
  const debuggerDetected = await detectDebuggerPause();
  const performanceAnomaly = detectPerformanceTampering(workerMetrics);

  return {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    hardwareConcurrency: navigator.hardwareConcurrency,
    workerMetrics,
    debuggerDetected,
    performanceAnomaly
  };
}

function getWorkerMetrics() {
  return new Promise((resolve) => {
    const worker = new Worker("./worker.js", { type: "module" });
    worker.postMessage({ samples: 5 });
    worker.addEventListener("message", (event) => {
      worker.terminate();
      resolve(event.data);
    });
  });
}

async function detectDebuggerPause() {
  const start = performance.now();
  const before = Date.now();
  debugger;
  const after = Date.now();
  const elapsed = performance.now() - start;
  const wallClockDelta = after - before;

  return elapsed > 150 || wallClockDelta > 200;
}

function detectPerformanceTampering(workerMetrics) {
  if (!workerMetrics) {
    return true;
  }
  if (workerMetrics.negativeDeltas > 0) {
    return true;
  }
  if (workerMetrics.timingVarianceMs > 12) {
    return true;
  }
  return false;
}

function renderResults(signals, verdict) {
  statusEl.innerHTML = "";
  statusEl.appendChild(renderMetric("Risk Score", `${verdict.riskScore}/100`));
  statusEl.appendChild(
    renderMetric("Debugger pause", verdict.reasons.includes("Debugger pause detected") ? "Yes" : "No")
  );
  statusEl.appendChild(
    renderMetric(
      "Worker variance",
      `${signals.workerMetrics.timingVarianceMs.toFixed(2)} ms`
    )
  );
  statusEl.appendChild(
    renderMetric(
      "Sample count",
      `${signals.workerMetrics.sampleCount}`
    )
  );
  if (verdict.reasons.length) {
    statusEl.appendChild(renderMetric("Reasons", verdict.reasons.join(", ")));
  }
}

function renderMetric(label, value) {
  const wrapper = document.createElement("div");
  wrapper.className = "metric";
  wrapper.innerHTML = `<strong>${label}:</strong> ${value}`;
  return wrapper;
}
