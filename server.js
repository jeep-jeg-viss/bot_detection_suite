import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/collect", (req, res) => {
  const payload = req.body || {};
  res.json({
    received: true,
    timestamp: new Date().toISOString(),
    riskScore: scoreRisk(payload),
    reasons: buildReasons(payload)
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Bot detection suite running on http://localhost:${port}`);
});

function scoreRisk(payload) {
  let score = 0;
  if (!payload.workerMetrics || payload.workerMetrics.sampleCount < 3) {
    score += 25;
  }
  if (payload.workerMetrics?.timingVarianceMs > 8) {
    score += 20;
  }
  if (payload.debuggerDetected) {
    score += 35;
  }
  if (payload.performanceAnomaly) {
    score += 20;
  }
  return Math.min(score, 100);
}

function buildReasons(payload) {
  const reasons = [];
  if (!payload.workerMetrics || payload.workerMetrics.sampleCount < 3) {
    reasons.push("Insufficient worker timing samples");
  }
  if (payload.workerMetrics?.timingVarianceMs > 8) {
    reasons.push("High performance.now variance in worker");
  }
  if (payload.debuggerDetected) {
    reasons.push("Debugger pause detected");
  }
  if (payload.performanceAnomaly) {
    reasons.push("Performance API anomalies");
  }
  return reasons;
}
