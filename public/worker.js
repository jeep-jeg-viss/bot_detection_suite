self.addEventListener("message", (event) => {
  const { samples = 5 } = event.data || {};
  const deltas = [];
  let last = performance.now();

  for (let i = 0; i < samples; i += 1) {
    const now = performance.now();
    deltas.push(now - last);
    last = now;
  }

  const average = deltas.reduce((sum, value) => sum + value, 0) / deltas.length;
  const variance =
    deltas.reduce((sum, value) => sum + Math.pow(value - average, 2), 0) / deltas.length;
  const negativeDeltas = deltas.filter((value) => value < 0).length;

  self.postMessage({
    sampleCount: samples,
    averageDeltaMs: average,
    timingVarianceMs: variance,
    negativeDeltas
  });
});
