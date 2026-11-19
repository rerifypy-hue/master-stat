(() => {
  const chartSets = {
    2: [
      ["poisson-pmf", "Poisson olasilik kutle fonksiyonu, lambda 3."],
      ["cauchy-normal", "Standart Cauchy ve standart normal yogunluklarinin karsilastirmasi."],
      ["exponential-survival", "Ortalama bir olan ustel dagilim icin hayatta kalma fonksiyonu."]
    ],
    3: [
      ["convergence-hierarchy", "Hemen hemen kesin ve momentlerde yakinmanin olasilikta yakinmayi, olasilikta yakinmanin dagilimda yakinmayi gerektirdigi sema."],
      ["uniform-order-statistics", "Uniform dagilim icin n bes iken minimum ve maksimumun yogunluklari."],
      ["chi-square-normal", "Standartlastirilmis ki-kare yogunluklarinin standart normal dagilima yaklasimi."]
    ],
    4: [
      ["binomial-normal", "Binom dagiliminin standartlastirilmis bicimi ve standart normal yaklasimi."],
      ["square-transform", "Uniform eksi bir iki dagilimindan karesel donusumle elde edilen yogunluk."]
    ],
    5: [
      ["sampling-family", "Standart normal dagilimdan ki-kare, Student t ve Fisher F dagilimlarina gecis semasi."],
      ["student-normal", "Standart normal ve farkli serbestlik derecelerindeki Student t yogunluklari."],
      ["triangular-density", "X2 eksi X1 degiskeninin ucgensel yogunlugu."],
      ["mse-parabola", "n on icin aT tahmin edicisinin MSE fonksiyonu ve minimum noktasi."]
    ],
    6: [
      ["normal-loglik", "Normal modelde log olabilirlik egrisi ve maksimum olabilirlik tahmini."],
      ["crlb-sample-size", "Poisson orneklem ortalamasi varyansi ile Cramer Rao alt sinirinin orneklem buyuklugune gore degisimi."]
    ],
    7: [
      ["estimator-targets", "Yansiz ve yanli tahmin edicilerin hedef etrafindaki dagilimini karsilastiran sema."],
      ["poisson-parity-estimator", "Poisson modelinde eksi bir us X tahmin edicisinin ayrik degerleri ve hedef parametre fonksiyonu."],
      ["parametric-density", "f x theta yogunluk ailesi icin uc farkli theta degeri."]
    ]
  };

  const gamma = value => {
    const coefficients = [
      676.5203681218851, -1259.1392167224028, 771.3234287776531,
      -176.6150291621406, 12.507343278686905, -0.13857109526572012,
      9.984369578019572e-6, 1.5056327351493116e-7
    ];
    if (value < 0.5) return Math.PI / (Math.sin(Math.PI * value) * gamma(1 - value));
    const adjusted = value - 1;
    let sum = 0.9999999999998099;
    coefficients.forEach((coefficient, index) => {
      sum += coefficient / (adjusted + index + 1);
    });
    const t = adjusted + coefficients.length - 0.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, adjusted + 0.5) * Math.exp(-t) * sum;
  };

  const colors = () => {
    const style = getComputedStyle(document.documentElement);
    return {
      text: style.getPropertyValue("--text-primary").trim() || "#1e293b",
      muted: style.getPropertyValue("--text-muted").trim() || "#64748b",
      grid: style.getPropertyValue("--border-color").trim() || "#e2e8f0",
      blue: style.getPropertyValue("--primary").trim() || "#2563eb",
      red: "#dc2626",
      green: "#16a34a",
      purple: "#9333ea",
      orange: "#ea580c"
    };
  };

  function plot(canvas, settings, palette) {
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

    const area = { left: 58, right: width - 18, top: 24, bottom: height - 46 };
    const x = value => area.left + (value - settings.xMin) / (settings.xMax - settings.xMin) * (area.right - area.left);
    const y = value => area.bottom - (value - settings.yMin) / (settings.yMax - settings.yMin) * (area.bottom - area.top);

    context.strokeStyle = palette.grid;
    context.lineWidth = 1;
    settings.xTicks.forEach(value => {
      const position = x(value);
      context.beginPath();
      context.moveTo(position, area.top);
      context.lineTo(position, area.bottom);
      context.stroke();
      context.fillStyle = palette.text;
      context.textAlign = "center";
      context.fillText(String(value), position, area.bottom + 17);
    });
    settings.yTicks.forEach(value => {
      const position = y(value);
      context.beginPath();
      context.moveTo(area.left, position);
      context.lineTo(area.right, position);
      context.stroke();
      context.fillStyle = palette.text;
      context.textAlign = "right";
      context.fillText(String(value), area.left - 7, position + 4);
    });

    context.strokeStyle = palette.text;
    context.lineWidth = 1.4;
    const zeroY = settings.yMin <= 0 && settings.yMax >= 0 ? y(0) : area.bottom;
    const zeroX = settings.xMin <= 0 && settings.xMax >= 0 ? x(0) : area.left;
    context.beginPath();
    context.moveTo(area.left, zeroY);
    context.lineTo(area.right, zeroY);
    context.moveTo(zeroX, area.top);
    context.lineTo(zeroX, area.bottom);
    context.stroke();
    context.fillStyle = palette.text;
    context.textAlign = "center";
    context.fillText(settings.xLabel, (area.left + area.right) / 2, height - 9);
    context.textAlign = "left";
    context.fillStyle = palette.muted;
    context.fillText(settings.yLabel, area.left, area.top - 8);
    return { context, area, x, y };
  }

  function curve(chart, fn, start, end, color, options) {
    const { context, area, x, y } = chart;
    context.save();
    context.beginPath();
    context.rect(area.left, area.top, area.right - area.left, area.bottom - area.top);
    context.clip();
    context.beginPath();
    const steps = 280;
    for (let index = 0; index <= steps; index += 1) {
      const value = start + (end - start) * index / steps;
      const screenY = y(fn(value));
      if (index === 0) context.moveTo(x(value), screenY);
      else context.lineTo(x(value), screenY);
    }
    context.strokeStyle = color;
    context.lineWidth = options && options.width || 2.4;
    context.setLineDash(options && options.dash || []);
    context.stroke();
    context.restore();
  }

  function bars(chart, values, start, step, color) {
    const { context, area, x, y } = chart;
    const base = y(0);
    const barWidth = Math.max(2, (x(start + step) - x(start)) * 0.68);
    context.fillStyle = color;
    values.forEach((value, index) => {
      const center = x(start + index * step);
      context.fillRect(center - barWidth / 2, y(value), barWidth, base - y(value));
    });
  }

  function fillArea(chart, fn, start, end, color) {
    const { context, area, x, y } = chart;
    context.save();
    context.beginPath();
    context.rect(area.left, area.top, area.right - area.left, area.bottom - area.top);
    context.clip();
    context.beginPath();
    context.moveTo(x(start), y(0));
    for (let index = 0; index <= 150; index += 1) {
      const value = start + (end - start) * index / 150;
      context.lineTo(x(value), y(fn(value)));
    }
    context.lineTo(x(end), y(0));
    context.closePath();
    context.fillStyle = color;
    context.fill();
    context.restore();
  }

  function marker(chart, value, label, palette) {
    const { context, area, x } = chart;
    context.save();
    context.strokeStyle = palette.muted;
    context.setLineDash([5, 5]);
    context.beginPath();
    context.moveTo(x(value), area.top);
    context.lineTo(x(value), area.bottom);
    context.stroke();
    context.setLineDash([]);
    context.fillStyle = palette.text;
    context.textAlign = "center";
    context.fillText(label, x(value), area.top + 13);
    context.restore();
  }

  function legend(chart, entries, palette) {
    const { context, area } = chart;
    context.font = "12px system-ui, sans-serif";
    context.textAlign = "left";
    entries.forEach((entry, index) => {
      const x = area.right - 158;
      const y = area.top + 14 + index * 19;
      context.strokeStyle = entry.color;
      context.lineWidth = 2.4;
      context.setLineDash(entry.dash || []);
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + 19, y);
      context.stroke();
      context.setLineDash([]);
      context.fillStyle = palette.text;
      context.fillText(entry.label, x + 24, y + 4);
    });
  }

  function plotCanvas(canvas, settings, palette, draw) {
    const chart = plot(canvas, settings, palette);
    if (chart) draw(chart);
  }

  function drawPoisson(canvas, palette) {
    plotCanvas(canvas, {
      xMin: -0.5, xMax: 10.5, yMin: 0, yMax: 0.28,
      xTicks: [0, 2, 4, 6, 8, 10], yTicks: [0, 0.1, 0.2],
      xLabel: "x", yLabel: "P(X=x)"
    }, palette, chart => {
      const probabilities = [Math.exp(-3)];
      for (let k = 1; k <= 10; k += 1) probabilities.push(probabilities[k - 1] * 3 / k);
      bars(chart, probabilities, 0, 1, palette.blue);
      legend(chart, [{ color: palette.blue, label: "Poisson(3)" }], palette);
    });
  }

  function drawCauchy(canvas, palette) {
    plotCanvas(canvas, {
      xMin: -5, xMax: 5, yMin: 0, yMax: 0.42,
      xTicks: [-4, -2, 0, 2, 4], yTicks: [0, 0.1, 0.2, 0.3, 0.4],
      xLabel: "x", yLabel: "yogunluk"
    }, palette, chart => {
      curve(chart, value => Math.exp(-value * value / 2) / Math.sqrt(2 * Math.PI), -5, 5, palette.blue);
      curve(chart, value => 1 / (Math.PI * (1 + value * value)), -5, 5, palette.red, { dash: [7, 5] });
      legend(chart, [
        { color: palette.blue, label: "N(0,1)" },
        { color: palette.red, label: "Cauchy(0,1)", dash: [7, 5] }
      ], palette);
    });
  }

  function drawSurvival(canvas, palette) {
    plotCanvas(canvas, {
      xMin: 0, xMax: 6, yMin: 0, yMax: 1.05,
      xTicks: [0, 1, 2, 3, 4, 5, 6], yTicks: [0, 0.25, 0.5, 0.75, 1],
      xLabel: "x", yLabel: "P(X>x)"
    }, palette, chart => {
      fillArea(chart, value => Math.exp(-value), 0, 6, "rgba(37, 99, 235, 0.16)");
      curve(chart, value => Math.exp(-value), 0, 6, palette.blue);
    });
  }

  function drawHierarchy(canvas, palette) {
    const chart = plot(canvas, {
      xMin: 0, xMax: 10, yMin: 0, yMax: 8,
      xTicks: [], yTicks: [], xLabel: "", yLabel: ""
    }, palette);
    if (!chart) return;
    const { context, x, y } = chart;
    const nodes = [
      { key: "as", label: "Hemen hemen kesin", x: 2, y: 6.3, color: palette.purple },
      { key: "lr", label: "Lᵣ momentlerinde", x: 8, y: 6.3, color: palette.green },
      { key: "p", label: "Olasilikta", x: 5, y: 3.8, color: palette.blue },
      { key: "d", label: "Dagilimda", x: 5, y: 1.3, color: palette.orange }
    ];
    const positions = Object.fromEntries(nodes.map(node => [node.key, { x: x(node.x), y: y(node.y) }]));
    const arrow = (from, to, label) => {
      const a = positions[from];
      const b = positions[to];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const length = Math.hypot(dx, dy);
      const ux = dx / length;
      const uy = dy / length;
      const startX = a.x + ux * 70;
      const startY = a.y + uy * 25;
      const endX = b.x - ux * 72;
      const endY = b.y - uy * 25;
      context.strokeStyle = palette.muted;
      context.fillStyle = palette.muted;
      context.lineWidth = 1.8;
      context.beginPath();
      context.moveTo(startX, startY);
      context.lineTo(endX, endY);
      context.stroke();
      context.beginPath();
      context.moveTo(endX, endY);
      context.lineTo(endX - ux * 9 - uy * 5, endY - uy * 9 + ux * 5);
      context.lineTo(endX - ux * 9 + uy * 5, endY - uy * 9 - ux * 5);
      context.closePath();
      context.fill();
      context.textAlign = "center";
      context.fillText(label, (startX + endX) / 2, (startY + endY) / 2 - 7);
    };
    arrow("as", "p", "⇒");
    arrow("lr", "p", "⇒");
    arrow("p", "d", "⇒");
    nodes.forEach(node => {
      const point = positions[node.key];
      context.fillStyle = node.color;
      context.beginPath();
      context.roundRect(point.x - 75, point.y - 24, 150, 48, 10);
      context.fill();
      context.fillStyle = "#ffffff";
      context.textAlign = "center";
      context.fillText(node.label, point.x, point.y + 4);
    });
  }

  function drawOrderStats(canvas, palette) {
    plotCanvas(canvas, {
      xMin: 0, xMax: 1, yMin: 0, yMax: 5.2,
      xTicks: [0, 0.2, 0.4, 0.6, 0.8, 1], yTicks: [0, 1, 2, 3, 4, 5],
      xLabel: "x", yLabel: "yogunluk"
    }, palette, chart => {
      curve(chart, value => 5 * Math.pow(1 - value, 4), 0, 1, palette.blue);
      curve(chart, value => 5 * Math.pow(value, 4), 0, 1, palette.red, { dash: [7, 5] });
      legend(chart, [
        { color: palette.blue, label: "minimum" },
        { color: palette.red, label: "maksimum", dash: [7, 5] }
      ], palette);
    });
  }

  function drawChiNormal(canvas, palette) {
    plotCanvas(canvas, {
      xMin: -3.5, xMax: 4, yMin: 0, yMax: 0.48,
      xTicks: [-3, -2, -1, 0, 1, 2, 3, 4], yTicks: [0, 0.1, 0.2, 0.3, 0.4],
      xLabel: "standartlastirilmis deger", yLabel: "yogunluk"
    }, palette, chart => {
      const normal = value => Math.exp(-value * value / 2) / Math.sqrt(2 * Math.PI);
      const chiStandard = (value, degrees) => {
        const x = degrees + value * Math.sqrt(2 * degrees);
        if (x <= 0) return 0;
        const density = Math.pow(x, degrees / 2 - 1) * Math.exp(-x / 2) /
          (Math.pow(2, degrees / 2) * gamma(degrees / 2));
        return density * Math.sqrt(2 * degrees);
      };
      curve(chart, normal, -3.5, 4, palette.text, { dash: [4, 4] });
      curve(chart, value => chiStandard(value, 4), -2.7, 4, palette.blue);
      curve(chart, value => chiStandard(value, 20), -3.2, 4, palette.red, { dash: [7, 5] });
      legend(chart, [
        { color: palette.text, label: "N(0,1)", dash: [4, 4] },
        { color: palette.blue, label: "df=4" },
        { color: palette.red, label: "df=20", dash: [7, 5] }
      ], palette);
    });
  }

  function drawBinomial(canvas, palette) {
    plotCanvas(canvas, {
      xMin: -4, xMax: 4, yMin: 0, yMax: 0.45,
      xTicks: [-4, -3, -2, -1, 0, 1, 2, 3, 4], yTicks: [0, 0.1, 0.2, 0.3, 0.4],
      xLabel: "(k-np)/sqrt(npq)", yLabel: "olasilik yogunlugu"
    }, palette, chart => {
      const n = 20;
      const p = 0.4;
      const q = 1 - p;
      const mean = n * p;
      const standardDeviation = Math.sqrt(n * p * q);
      let probability = Math.pow(q, n);
      const standardized = [];
      for (let k = 0; k <= n; k += 1) {
        standardized.push({ value: (k - mean) / standardDeviation, probability: probability * standardDeviation });
        if (k < n) probability *= ((n - k) / (k + 1)) * (p / q);
      }
      const { context, x, y } = chart;
      const base = y(0);
      const barWidth = Math.max(2, (x(0.3) - x(0)) * 0.62);
      context.fillStyle = "rgba(37, 99, 235, 0.42)";
      standardized.forEach(item => {
        context.fillRect(x(item.value) - barWidth / 2, y(item.probability), barWidth, base - y(item.probability));
      });
      curve(chart, value => Math.exp(-value * value / 2) / Math.sqrt(2 * Math.PI), -4, 4, palette.red);
      legend(chart, [{ color: palette.red, label: "N(0,1)" }], palette);
    });
  }

  function drawSquareTransform(canvas, palette) {
    plotCanvas(canvas, {
      xMin: 0, xMax: 4, yMin: 0, yMax: 1.7,
      xTicks: [0, 1, 2, 3, 4], yTicks: [0, 0.5, 1, 1.5],
      xLabel: "y", yLabel: "fY(y)"
    }, palette, chart => {
      curve(chart, value => 1 / (3 * Math.sqrt(value)), 0.02, 1, palette.blue);
      curve(chart, value => 1 / (6 * Math.sqrt(value)), 1, 4, palette.red);
      marker(chart, 1, "dal degisir", palette);
      legend(chart, [
        { color: palette.blue, label: "0<y<1" },
        { color: palette.red, label: "1<y<4" }
      ], palette);
    });
  }

  function drawDiagram(canvas, palette, kind) {
    const chart = plot(canvas, {
      xMin: 0, xMax: 10, yMin: 0, yMax: 8,
      xTicks: [], yTicks: [], xLabel: "", yLabel: ""
    }, palette);
    if (!chart) return;
    const { context, x, y } = chart;
    const nodes = kind === "sampling-family"
      ? [
          { label: "Z ~ N(0,1)", x: 2, y: 6.3, color: palette.blue },
          { label: "Z kare ~ chi-kare", x: 8, y: 6.3, color: palette.red },
          { label: "Z / sqrt(V/r) ~ t", x: 2, y: 1.7, color: palette.green },
          { label: "(U/r1)/(V/r2) ~ F", x: 8, y: 1.7, color: palette.purple }
        ]
      : [];
    const points = nodes.map(node => ({ ...node, px: x(node.x), py: y(node.y) }));
    context.strokeStyle = palette.muted;
    context.fillStyle = palette.muted;
    context.lineWidth = 2;
    const connect = (from, to, label) => {
      const a = points[from];
      const b = points[to];
      context.beginPath();
      context.moveTo(a.px, a.py + (b.py > a.py ? 28 : -28));
      context.lineTo(b.px, b.py + (b.py > a.py ? -28 : 28));
      context.stroke();
      context.textAlign = "center";
      context.fillText(label, (a.px + b.px) / 2, (a.py + b.py) / 2);
    };
    connect(0, 1, "kare al");
    connect(0, 2, "bagimsiz ki-kare ile bol");
    connect(1, 3, "bagimsiz ki-kare ile oranla");
    points.forEach(node => {
      context.fillStyle = node.color;
      context.beginPath();
      context.roundRect(node.px - 85, node.py - 28, 170, 56, 10);
      context.fill();
      context.fillStyle = "#ffffff";
      context.textAlign = "center";
      context.fillText(node.label, node.px, node.py + 4);
    });
  }

  function drawStudent(canvas, palette) {
    plotCanvas(canvas, {
      xMin: -5, xMax: 5, yMin: 0, yMax: 0.42,
      xTicks: [-4, -2, 0, 2, 4], yTicks: [0, 0.1, 0.2, 0.3, 0.4],
      xLabel: "x", yLabel: "yogunluk"
    }, palette, chart => {
      const tDensity = degrees => value =>
        gamma((degrees + 1) / 2) /
        (Math.sqrt(degrees * Math.PI) * gamma(degrees / 2)) *
        Math.pow(1 + value * value / degrees, -(degrees + 1) / 2);
      curve(chart, value => Math.exp(-value * value / 2) / Math.sqrt(2 * Math.PI), -5, 5, palette.text, { dash: [4, 4] });
      curve(chart, tDensity(1), -5, 5, palette.blue);
      curve(chart, tDensity(5), -5, 5, palette.red, { dash: [7, 5] });
      curve(chart, tDensity(20), -5, 5, palette.green, { dash: [2, 4] });
      legend(chart, [
        { color: palette.text, label: "N(0,1)", dash: [4, 4] },
        { color: palette.blue, label: "t(1)" },
        { color: palette.red, label: "t(5)", dash: [7, 5] },
        { color: palette.green, label: "t(20)", dash: [2, 4] }
      ], palette);
    });
  }

  function drawTriangle(canvas, palette) {
    plotCanvas(canvas, {
      xMin: -2, xMax: 2, yMin: 0, yMax: 0.55,
      xTicks: [-2, -1, 0, 1, 2], yTicks: [0, 0.1, 0.2, 0.3, 0.4, 0.5],
      xLabel: "y", yLabel: "fY(y)"
    }, palette, chart => {
      fillArea(chart, value => (2 - Math.abs(value)) / 4, -2, 2, "rgba(37, 99, 235, 0.16)");
      curve(chart, value => (2 - Math.abs(value)) / 4, -2, 2, palette.blue);
    });
  }

  function drawMse(canvas, palette) {
    plotCanvas(canvas, {
      xMin: 0, xMax: 0.25, yMin: 0, yMax: 1.15,
      xTicks: [0, 0.05, 0.1, 0.15, 0.2, 0.25], yTicks: [0, 0.25, 0.5, 0.75, 1],
      xLabel: "a", yLabel: "MSE(aT)/sigma^4"
    }, palette, chart => {
      const fn = value => 18 * value * value + Math.pow(9 * value - 1, 2);
      curve(chart, fn, 0, 0.25, palette.blue);
      marker(chart, 1 / 11, "a=1/11", palette);
      const { context, x, y } = chart;
      context.fillStyle = palette.red;
      context.beginPath();
      context.arc(x(1 / 11), y(fn(1 / 11)), 5, 0, 2 * Math.PI);
      context.fill();
    });
  }

  function drawLogLikelihood(canvas, palette) {
    plotCanvas(canvas, {
      xMin: -2, xMax: 4, yMin: -18, yMax: 1,
      xTicks: [-2, -1, 0, 1, 2, 3, 4], yTicks: [-15, -10, -5, 0],
      xLabel: "theta", yLabel: "ell(theta)-ell(thetaHat)"
    }, palette, chart => {
      curve(chart, value => -2.5 * (value - 1) * (value - 1), -2, 4, palette.blue);
      marker(chart, 1, "thetaHat=xBar", palette);
    });
  }

  function drawCrlb(canvas, palette) {
    plotCanvas(canvas, {
      xMin: 1, xMax: 50, yMin: 0, yMax: 2.2,
      xTicks: [1, 10, 20, 30, 40, 50], yTicks: [0, 0.5, 1, 1.5, 2],
      xLabel: "orneklem buyuklugu n", yLabel: "varyans"
    }, palette, chart => {
      curve(chart, value => 2 / value, 1, 50, palette.blue);
      curve(chart, value => 2 / value, 1, 50, palette.red, { dash: [7, 5] });
      legend(chart, [
        { color: palette.blue, label: "V(XBar)=2/n" },
        { color: palette.red, label: "CRLB=2/n", dash: [7, 5] }
      ], palette);
    });
  }

  function drawTargets(canvas, palette) {
    const context = canvas.getContext("2d");
    if (!context) return;
    const width = Math.max(canvas.clientWidth, 280);
    const height = 300;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    const centers = [width * 0.28, width * 0.72];
    centers.forEach((center, index) => {
      const centerY = 130;
      [54, 38, 22, 8].forEach((radius, ring) => {
        context.beginPath();
        context.arc(center, centerY, radius, 0, 2 * Math.PI);
        context.fillStyle = ring % 2 ? "#ffffff" : "#ef4444";
        context.fill();
        context.strokeStyle = palette.grid;
        context.stroke();
      });
      context.fillStyle = palette.text;
      context.textAlign = "center";
      context.fillText(index === 0 ? "yansiz, yuksek varyans" : "yansiz, dusuk varyans", center, 220);
    });
    const dots = [
      [centers[0] - 25, 105], [centers[0] + 30, 147], [centers[0] + 8, 83],
      [centers[0] - 10, 168], [centers[0] + 48, 117], [centers[0] - 42, 140],
      [centers[1] - 7, 128], [centers[1] + 6, 132], [centers[1] + 9, 124],
      [centers[1] - 11, 138], [centers[1] + 1, 119], [centers[1] + 14, 141]
    ];
    context.fillStyle = palette.blue;
    dots.forEach(([x, y]) => {
      context.beginPath();
      context.arc(x, y, 4, 0, 2 * Math.PI);
      context.fill();
    });
  }

  function drawParityEstimator(canvas, palette) {
    plotCanvas(canvas, {
      xMin: 0, xMax: 3, yMin: -1.2, yMax: 1.2,
      xTicks: [0, 0.5, 1, 1.5, 2, 2.5, 3], yTicks: [-1, -0.5, 0, 0.5, 1],
      xLabel: "theta", yLabel: "tahmin / hedef"
    }, palette, chart => {
      curve(chart, value => Math.exp(-2 * value), 0, 3, palette.red);
      const { context, x, y } = chart;
      context.fillStyle = palette.blue;
      for (let index = 0; index <= 8; index += 1) {
        const px = x(index * 3 / 8);
        [1, -1].forEach(value => {
          context.beginPath();
          context.arc(px, y(value), 4, 0, 2 * Math.PI);
          context.fill();
        });
      }
      legend(chart, [
        { color: palette.red, label: "hedef exp(-2theta)" },
        { color: palette.blue, label: "tahmin (-1)^X" }
      ], palette);
    });
  }

  function drawParametricDensity(canvas, palette) {
    plotCanvas(canvas, {
      xMin: -1, xMax: 1, yMin: 0, yMax: 1.1,
      xTicks: [-1, -0.5, 0, 0.5, 1], yTicks: [0, 0.25, 0.5, 0.75, 1],
      xLabel: "x", yLabel: "f(x;theta)"
    }, palette, chart => {
      curve(chart, value => (1 - value) / 2, -1, 1, palette.blue);
      curve(chart, () => 0.5, -1, 1, palette.red, { dash: [7, 5] });
      curve(chart, value => (1 + value) / 2, -1, 1, palette.green, { dash: [2, 4] });
      legend(chart, [
        { color: palette.blue, label: "theta=-1" },
        { color: palette.red, label: "theta=0", dash: [7, 5] },
        { color: palette.green, label: "theta=1", dash: [2, 4] }
      ], palette);
    });
  }

  const drawers = {
    "poisson-pmf": drawPoisson,
    "cauchy-normal": drawCauchy,
    "exponential-survival": drawSurvival,
    "convergence-hierarchy": drawHierarchy,
    "uniform-order-statistics": drawOrderStats,
    "chi-square-normal": drawChiNormal,
    "binomial-normal": drawBinomial,
    "square-transform": drawSquareTransform,
    "sampling-family": (canvas, palette) => drawDiagram(canvas, palette, "sampling-family"),
    "student-normal": drawStudent,
    "triangular-density": drawTriangle,
    "mse-parabola": drawMse,
    "normal-loglik": drawLogLikelihood,
    "crlb-sample-size": drawCrlb,
    "estimator-targets": drawTargets,
    "poisson-parity-estimator": drawParityEstimator,
    "parametric-density": drawParametricDensity
  };

  function weekFor(node) {
    const section = node.closest("section[id^='hafta-']");
    if (section) {
      const match = section.id.match(/^hafta-(\d+)$/);
      if (match) return Number(match[1]);
    }
    const match = window.location.pathname.match(/hafta-(\d{2})\.html$/);
    return match ? Number(match[1]) : null;
  }

  function installCharts() {
    const counts = {};
    document.querySelectorAll(".tikz-diagram-card").forEach(card => {
      const week = weekFor(card);
      const charts = chartSets[week];
      const index = counts[week] || 0;
      if (!charts || !charts[index]) return;
      counts[week] = index + 1;
      const [type, label] = charts[index];
      const wrapper = card.parentElement;
      const caption = wrapper.querySelector(":scope > .table-caption");
      const figure = document.createElement("figure");
      figure.className = "week-chart-card";
      const canvas = document.createElement("canvas");
      canvas.className = "week-chart";
      canvas.dataset.chart = type;
      canvas.width = 900;
      canvas.height = 360;
      canvas.setAttribute("role", "img");
      canvas.setAttribute("aria-label", label);
      canvas.textContent = label;
      figure.appendChild(canvas);
      if (caption) {
        caption.textContent = caption.textContent.replace(/^Tablo:/, "Grafik:");
        figure.appendChild(caption);
      }
      wrapper.replaceWith(figure);
    });
  }

  function renderAll() {
    const palette = colors();
    document.querySelectorAll("canvas[data-chart]").forEach(canvas => {
      const draw = drawers[canvas.dataset.chart];
      if (draw) draw(canvas, palette);
    });
  }

  installCharts();
  renderAll();

  let frame = 0;
  const scheduleRender = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(renderAll);
  };
  window.addEventListener("resize", scheduleRender, { passive: true });
  new MutationObserver(scheduleRender).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"]
  });
})();
