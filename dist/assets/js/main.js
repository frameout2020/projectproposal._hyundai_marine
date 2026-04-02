document.documentElement.classList.add('js-ready');

const ERROR_BAR_MIN_OFFSET = 8;
const DASHBOARD_ENTRANCE_DURATION = 560;
const DASHBOARD_ROW_DELAY = 220;
const DASHBOARD_METRIC_DELAY = 120;

function setErrorBarState(bar, progress) {
  const chart = bar.closest('.error-chart');
  const barArea = bar.querySelector('.error-chart__bar-area');
  const column = bar.querySelector('.error-chart__column');
  const value = bar.querySelector('.error-chart__value');

  if (!chart || !barArea || !column || !value) {
    return;
  }

  const targetValue = Number(bar.dataset.value || 0);
  const maxValue = Number(chart.dataset.max || 0) || targetValue || 1;
  const targetRatio = Math.min(Math.max(targetValue / maxValue, 0), 1);
  const availableHeight = barArea.clientHeight;
  const currentHeight = availableHeight * targetRatio * progress;

  column.style.height = `${currentHeight}px`;
  value.style.bottom = `${currentHeight + ERROR_BAR_MIN_OFFSET}px`;
  value.textContent = `${Math.round(targetValue * progress)}`;
}

function setUsageDonutState(donut, progress) {
  const ring = donut.querySelector('.usage-panel__donut-progress');
  const value = donut.querySelector('.usage-panel__donut-text strong');

  if (!ring || !value) {
    return;
  }

  const radius = Number(ring.getAttribute('r') || 0);
  const circumference = 2 * Math.PI * radius;
  const targetProgress = Number(donut.dataset.progress || 0);
  const normalizedTarget = Math.min(Math.max(targetProgress / 100, 0), 1);
  const currentProgress = normalizedTarget * progress;

  ring.style.strokeDasharray = `${circumference}`;
  ring.style.strokeDashoffset = `${circumference * (1 - currentProgress)}`;
  value.textContent = `${Math.round(targetProgress * progress)}%`;
}

function setUsageGaugeState(gauge, progress) {
  const path = gauge.querySelector('.usage-gauge__progress');
  const value = gauge.querySelector('.usage-gauge__inner strong');

  if (!path || !value) {
    return;
  }

  const totalLength = path.getTotalLength();
  const targetProgress = Number(gauge.dataset.progress || 0);
  const normalizedTarget = Math.min(Math.max(targetProgress / 100, 0), 1);
  const currentProgress = normalizedTarget * progress;

  path.style.strokeDasharray = `${totalLength}`;
  path.style.strokeDashoffset = `${totalLength * (1 - currentProgress)}`;
  value.textContent = `${Math.round(targetProgress * progress)}%`;
}

function setCountValue(element, progress) {
  const target = Number(element.dataset.count || 0);
  const suffix = element.dataset.suffix || '';
  const currentValue = Math.round(target * progress);

  element.textContent = `${currentValue}${suffix}`;
}

function animateErrorChart(chart) {
  if (chart.dataset.animated === 'true') {
    return;
  }

  const bars = Array.from(chart.querySelectorAll('.error-chart__bar'));

  if (!bars.length) {
    return;
  }

  chart.dataset.animated = 'true';

  bars.forEach((bar) => setErrorBarState(bar, 0));

  const startedAt = performance.now();
  const barDuration = 900;
  const barDelay = 110;

  const tick = (now) => {
    let finished = true;

    bars.forEach((bar, index) => {
      const localElapsed = now - startedAt - index * barDelay;
      const rawProgress = Math.min(Math.max(localElapsed / barDuration, 0), 1);
      const easedProgress = 1 - Math.pow(1 - rawProgress, 3);

      setErrorBarState(bar, easedProgress);

      if (rawProgress < 1) {
        finished = false;
      }
    });

    if (!finished) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
}

function animateUsageDonut(donut) {
  if (donut.dataset.animated === 'true') {
    return;
  }

  donut.dataset.animated = 'true';
  setUsageDonutState(donut, 0);

  const startedAt = performance.now();
  const duration = 1100;

  const tick = (now) => {
    const rawProgress = Math.min(Math.max((now - startedAt) / duration, 0), 1);
    const easedProgress = 1 - Math.pow(1 - rawProgress, 3);

    setUsageDonutState(donut, easedProgress);

    if (rawProgress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
}

function animateUsageGauge(gauge) {
  if (gauge.dataset.animated === 'true') {
    return;
  }

  gauge.dataset.animated = 'true';
  setUsageGaugeState(gauge, 0);

  const startedAt = performance.now();
  const duration = 1100;

  const tick = (now) => {
    const rawProgress = Math.min(Math.max((now - startedAt) / duration, 0), 1);
    const easedProgress = 1 - Math.pow(1 - rawProgress, 3);

    setUsageGaugeState(gauge, easedProgress);

    if (rawProgress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
}

function animateCountValue(element) {
  if (element.dataset.animated === 'true') {
    return;
  }

  element.dataset.animated = 'true';
  setCountValue(element, 0);

  const startedAt = performance.now();
  const duration = 900;

  const tick = (now) => {
    const rawProgress = Math.min(Math.max((now - startedAt) / duration, 0), 1);
    const easedProgress = 1 - Math.pow(1 - rawProgress, 3);

    setCountValue(element, easedProgress);

    if (rawProgress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
}

function prepareErrorCharts(root = document) {
  const charts = Array.from(root.querySelectorAll('.error-chart[data-animate="bars"]'));

  charts.forEach((chart) => {
    delete chart.dataset.animated;
    chart.querySelectorAll('.error-chart__bar').forEach((bar) => setErrorBarState(bar, 0));
  });
}

function prepareUsageDonuts(root = document) {
  const donuts = Array.from(root.querySelectorAll('.usage-panel__donut-ring[data-animate="donut"]'));

  donuts.forEach((donut) => {
    delete donut.dataset.animated;
    setUsageDonutState(donut, 0);
  });
}

function prepareUsageGauges(root = document) {
  const gauges = Array.from(root.querySelectorAll('.usage-gauge__chart[data-animate="gauge"]'));

  gauges.forEach((gauge) => {
    delete gauge.dataset.animated;
    setUsageGaugeState(gauge, 0);
  });
}

function prepareCountValues(root = document) {
  const elements = Array.from(root.querySelectorAll('[data-animate="count"]'));

  elements.forEach((element) => {
    delete element.dataset.animated;
    setCountValue(element, 0);
  });
}

function prepareDashboardMetrics(root = document) {
  prepareErrorCharts(root);
  prepareUsageDonuts(root);
  prepareUsageGauges(root);
  prepareCountValues(root);
}

function playDashboardMetrics(root = document) {
  root.querySelectorAll('.error-chart[data-animate="bars"]').forEach((chart) => animateErrorChart(chart));
  root.querySelectorAll('.usage-panel__donut-ring[data-animate="donut"]').forEach((donut) => animateUsageDonut(donut));
  root.querySelectorAll('.usage-gauge__chart[data-animate="gauge"]').forEach((gauge) => animateUsageGauge(gauge));
  root.querySelectorAll('[data-animate="count"]').forEach((element) => animateCountValue(element));
}

function syncDashboardMetrics() {
  document.querySelectorAll('.error-chart[data-animate="bars"]').forEach((chart) => {
    if (chart.dataset.animated === 'true') {
      chart.querySelectorAll('.error-chart__bar').forEach((bar) => setErrorBarState(bar, 1));
    }
  });

  document.querySelectorAll('.usage-panel__donut-ring[data-animate="donut"]').forEach((donut) => {
    if (donut.dataset.animated === 'true') {
      setUsageDonutState(donut, 1);
    }
  });

  document.querySelectorAll('.usage-gauge__chart[data-animate="gauge"]').forEach((gauge) => {
    if (gauge.dataset.animated === 'true') {
      setUsageGaugeState(gauge, 1);
    }
  });
}

function initDashboardEntrance() {
  const cards = Array.from(document.querySelectorAll('.dashboard-entry-card'));

  if (!cards.length) {
    playDashboardMetrics(document);
    return;
  }

  const rows = [
    Array.from(document.querySelectorAll('.summary-grid .dashboard-entry-card')),
    Array.from(document.querySelectorAll('.dashboard-grid--top .dashboard-entry-card')),
    Array.from(document.querySelectorAll('.dashboard-grid--bottom .dashboard-entry-card'))
  ].filter((group) => group.length);

  let lastRowDelay = 0;

  rows.forEach((group, rowIndex) => {
    if (!group.length) {
      return;
    }

    const delay = rowIndex * DASHBOARD_ROW_DELAY;

    lastRowDelay = delay;

    group
      .sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left)
      .forEach((card) => {
        window.setTimeout(() => {
          card.classList.add('is-revealed');
        }, delay);
      });
  });

  window.setTimeout(() => {
    playDashboardMetrics(document);
  }, lastRowDelay + DASHBOARD_ENTRANCE_DURATION + DASHBOARD_METRIC_DELAY);
}

window.addEventListener('load', () => {
  prepareDashboardMetrics(document);
  initDashboardEntrance();
  window.addEventListener('resize', syncDashboardMetrics);
});
