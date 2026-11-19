(() => {
  const canvases = Array.from(document.querySelectorAll("canvas[data-chart]"));
  if (!canvases.length) return;

  const palette = () => {
    const styles = getComputedStyle(document.documentElement);
    return {
      text: styles.getPropertyValue("--text-primary").trim() || "#1e293b",
      muted: styles.getPropertyValue("--text-muted").trim() || "#64748b",
      grid: styles.getPropertyValue("--border-color").trim() || "#e2e8f0",
      primary: styles.getPropertyValue("--primary").trim() || "#2563eb",
      red: "#dc2626",
      green: "#16a34a"
    };
  };

  function createPlot(canvas, options, colors) {
    const width = Math.max(canvas.clientWidth, 280);
    const height = 300;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);

    const context = canvas.getContext("2d");
    if (!context) return null;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.font = "12px system-ui, sans-serif";
    context.fillStyle = colors.text;
    context.strokeStyle = colors.grid;
    context.lineWidth = 1;

    const plot = {
      left: 62,
      right: width - 18,
      top: 24,
      bottom: height - 50
    };
    const x = value => plot.left + (value - options.xMin) / (options.xMax - options.xMin) * (plot.right - plot.left);
    const y = value => plot.bottom - (value - options.yMin) / (options.yMax - options.yMin) * (plot.bottom - plot.top);

    options.xTicks.forEach(value => {
      const position = x(value);
      context.beginPath();
      context.moveTo(position, plot.top);
      context.lineTo(position, plot.bottom);
      context.stroke();
      context.textAlign = "center";
      context.fillText(String(value), position, plot.bottom + 18);
    });

    options.yTicks.forEach(value => {
      const position = y(value);
      context.beginPath();
      context.moveTo(plot.left, position);
      context.lineTo(plot.right, position);
      context.stroke();
      context.textAlign = "right";
      context.fillText(String(value), plot.left - 8, position + 4);
    });

    context.strokeStyle = colors.text;
    context.lineWidth = 1.4;
    const horizontalAxis = options.yMin <= 0 && options.yMax >= 0 ? y(0) : plot.bottom;
    const verticalAxis = options.xMin <= 0 && options.xMax >= 0 ? x(0) : plot.left;
    context.beginPath();
    context.moveTo(plot.left, horizontalAxis);
    context.lineTo(plot.right, horizontalAxis);
    context.moveTo(verticalAxis, plot.top);
    context.lineTo(verticalAxis, plot.bottom);
    context.stroke();

    context.fillStyle = colors.text;
    context.textAlign = "center";
    context.fillText(options.xLabel, (plot.left + plot.right) / 2, height - 10);
    context.textAlign = "left";
    context.fillStyle = colors.muted;
    context.fillText(options.yLabel, plot.left, plot.top - 8);

    return { context, plot, x, y };
  }

  function drawCurve(chart, fn, start, end, color, width, dash) {
    const { context, plot, x, y } = chart;
    context.save();
    context.beginPath();
    context.rect(plot.left, plot.top, plot.right - plot.left, plot.bottom - plot.top);
    context.clip();
    context.beginPath();
    const steps = 240;
    for (let index = 0; index <= steps; index += 1) {
      const value = start + (end - start) * index / steps;
      const pointX = x(value);
      const pointY = y(fn(value));
      if (index === 0) context.moveTo(pointX, pointY);
      else context.lineTo(pointX, pointY);
    }
    context.strokeStyle = color;
    context.lineWidth = width;
    context.setLineDash(dash || []);
    context.stroke();
    context.restore();
  }

  function drawArea(chart, fn, start, end, color) {
    const { context, plot, x, y } = chart;
    context.save();
    context.beginPath();
    context.rect(plot.left, plot.top, plot.right - plot.left, plot.bottom - plot.top);
    context.clip();
    context.beginPath();
    context.moveTo(x(start), y(0));
    const steps = 120;
    for (let index = 0; index <= steps; index += 1) {
      const value = start + (end - start) * index / steps;
      context.lineTo(x(value), y(fn(value)));
    }
    context.lineTo(x(end), y(0));
    context.closePath();
    context.fillStyle = color;
    context.fill();
    context.restore();
  }

  function drawMarker(chart, value, label, colors) {
    const { context, plot, x } = chart;
    context.save();
    context.strokeStyle = colors.muted;
    context.setLineDash([5, 5]);
    context.beginPath();
    context.moveTo(x(value), plot.top);
    context.lineTo(x(value), plot.bottom);
    context.stroke();
    context.setLineDash([]);
    context.fillStyle = colors.text;
    context.textAlign = "center";
    context.fillText(label, x(value), plot.top + 13);
    context.restore();
  }

  function drawOddIntegrand(canvas, colors) {
    const chart = createPlot(canvas, {
      xMin: -3.5, xMax: 3.5, yMin: -0.8, yMax: 0.8,
      xTicks: [-3, -2, -1, 0, 1, 2, 3], yTicks: [-0.5, 0, 0.5],
      xLabel: "z", yLabel: "g(z)"
    }, colors);
    if (!chart) return;
    const fn = value => value * Math.exp(-value * value / 2);
    drawArea(chart, fn, -3.5, 0, "rgba(220, 38, 38, 0.18)");
    drawArea(chart, fn, 0, 3.5, "rgba(22, 163, 74, 0.18)");
    drawCurve(chart, fn, -3.5, 3.5, colors.primary, 2.5);
  }

  function drawChebyshev(canvas, colors) {
    const chart = createPlot(canvas, {
      xMin: -4, xMax: 4, yMin: 0, yMax: 0.8,
      xTicks: [-4, -3, -2, -1, 0, 1, 2, 3, 4], yTicks: [0, 0.2, 0.4, 0.6],
      xLabel: "x", yLabel: "f(x)"
    }, colors);
    if (!chart) return;
    const fn = value => Math.exp(-Math.SQRT2 * Math.abs(value)) / Math.SQRT2;
    drawArea(chart, fn, -4, -2, "rgba(220, 38, 38, 0.18)");
    drawArea(chart, fn, -2, 2, "rgba(37, 99, 235, 0.16)");
    drawArea(chart, fn, 2, 4, "rgba(220, 38, 38, 0.18)");
    drawCurve(chart, fn, -4, 4, colors.primary, 2.5);
    drawMarker(chart, -2, "μ−2σ", colors);
    drawMarker(chart, 2, "μ+2σ", colors);
  }

  function drawJensen(canvas, colors) {
    const chart = createPlot(canvas, {
      xMin: 0, xMax: 2.4, yMin: 0, yMax: 6,
      xTicks: [0, 0.5, 1, 1.5, 2], yTicks: [0, 1, 2, 3, 4, 5],
      xLabel: "x", yLabel: "g(x)"
    }, colors);
    if (!chart) return;
    drawCurve(chart, value => value * value, 0, 2.4, colors.primary, 2.5);
    drawCurve(chart, value => 2 * value - 1, 0.5, 2.4, colors.green, 2, [7, 5]);
    drawMarker(chart, 1, "μ", colors);
  }

  function drawGammaSum(canvas, colors) {
    const chart = createPlot(canvas, {
      xMin: 0, xMax: 7, yMin: 0, yMax: 1.1,
      xTicks: [0, 1, 2, 3, 4, 5, 6, 7], yTicks: [0, 0.25, 0.5, 0.75, 1],
      xLabel: "x", yLabel: "yoğunluk"
    }, colors);
    if (!chart) return;
    const series = [
      { shape: 1, color: colors.primary },
      { shape: 2, color: colors.red },
      { shape: 4, color: colors.green }
    ];
    series.forEach(({ shape, color }) => {
      const denominator = [1, 1, 2, 6][shape - 1];
      const density = value => value === 0
        ? (shape === 1 ? 1 : 0)
        : Math.pow(value, shape - 1) * Math.exp(-value) / denominator;
      drawCurve(chart, density, 0, 7, color, 2.3);
    });

    const { context, plot } = chart;
    series.forEach(({ shape, color }, index) => {
      const x = plot.right - 145 + index % 2 * 75;
      const y = plot.top + 16 + Math.floor(index / 2) * 20;
      context.strokeStyle = color;
      context.lineWidth = 2.3;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + 18, y);
      context.stroke();
      context.fillStyle = colors.text;
      context.textAlign = "left";
      context.fillText(`n=${shape}`, x + 23, y + 4);
    });
  }

  function drawGammaIntegrand(canvas, colors) {
    const chart = createPlot(canvas, {
      xMin: 0, xMax: 6, yMin: 0, yMax: 4,
      xTicks: [0, 1, 2, 3, 4, 5, 6], yTicks: [0, 1, 2, 3, 4],
      xLabel: "u", yLabel: "u⁻¹ᐟ²e⁻ᵘ"
    }, colors);
    if (!chart) return;
    const fn = value => Math.exp(-value) / Math.sqrt(value);
    drawArea(chart, fn, 0.02, 6, "rgba(37, 99, 235, 0.16)");
    drawCurve(chart, fn, 0.02, 6, colors.primary, 2.5);
  }

  const drawers = {
    "odd-integrand": drawOddIntegrand,
    chebyshev: drawChebyshev,
    jensen: drawJensen,
    "gamma-sum": drawGammaSum,
    "gamma-integrand": drawGammaIntegrand
  };

  function renderAll() {
    const colors = palette();
    canvases.forEach(canvas => {
      const draw = drawers[canvas.dataset.chart];
      if (draw) draw(canvas, colors);
    });
  }

  let frame = 0;
  function scheduleRender() {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(renderAll);
  }

  renderAll();
  window.addEventListener("resize", scheduleRender, { passive: true });
  new MutationObserver(scheduleRender).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"]
  });
})();
