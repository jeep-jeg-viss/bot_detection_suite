# Bot Detection Suite

This project demonstrates a production-ready approach for bot detection based on **real JavaScript execution signals**. It focuses on verifying that a genuine browser is running by:

- Sampling `performance.now()` inside a Web Worker.
- Detecting debugger pauses that indicate interference or instrumentation.
- Computing a lightweight risk score and rationale server-side.

## Stack

- **Node.js + Express** for a lightweight API backend.
- **Vanilla JavaScript + Web Workers** for low-level, high-signal browser probes.

## How it works

1. The browser spawns a worker that samples `performance.now()` multiple times.
2. The main thread runs a `debugger` statement and measures pause time.
3. Signals are sent to `/api/collect`, which scores risk and returns reasons.

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:3000` and click **Run Detection**.

## Next steps for production

- Add attestation: challenge-response signatures for high-risk traffic.
- Correlate with IP reputation and anomaly scoring.
- Store session-level signals for model training.
- Extend with WebGL, audio, and input-timing signals.
