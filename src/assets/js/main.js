document.documentElement.classList.add('js-ready');

const ERROR_BAR_MIN_OFFSET = 8;

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

function initErrorCharts() {
  const charts = Array.from(document.querySelectorAll('.error-chart[data-animate="bars"]'));

  if (!charts.length) {
    return;
  }

  charts.forEach((chart) => {
    chart.querySelectorAll('.error-chart__bar').forEach((bar) => setErrorBarState(bar, 0));
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateErrorChart(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.35
      }
    );

    charts.forEach((chart) => observer.observe(chart));
  } else {
    charts.forEach((chart) => animateErrorChart(chart));
  }

  window.addEventListener('resize', () => {
    charts.forEach((chart) => {
      if (chart.dataset.animated === 'true') {
        chart.querySelectorAll('.error-chart__bar').forEach((bar) => setErrorBarState(bar, 1));
      }
    });
  });
}

function initUsageDonuts() {
  const donuts = Array.from(document.querySelectorAll('.usage-panel__donut-ring[data-animate="donut"]'));

  if (!donuts.length) {
    return;
  }

  donuts.forEach((donut) => setUsageDonutState(donut, 0));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateUsageDonut(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.35
      }
    );

    donuts.forEach((donut) => observer.observe(donut));
  } else {
    donuts.forEach((donut) => animateUsageDonut(donut));
  }

  window.addEventListener('resize', () => {
    donuts.forEach((donut) => {
      if (donut.dataset.animated === 'true') {
        setUsageDonutState(donut, 1);
      }
    });
  });
}

function initUsageGauges() {
  const gauges = Array.from(document.querySelectorAll('.usage-gauge__chart[data-animate="gauge"]'));

  if (!gauges.length) {
    return;
  }

  gauges.forEach((gauge) => setUsageGaugeState(gauge, 0));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateUsageGauge(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.35
      }
    );

    gauges.forEach((gauge) => observer.observe(gauge));
  } else {
    gauges.forEach((gauge) => animateUsageGauge(gauge));
  }

  window.addEventListener('resize', () => {
    gauges.forEach((gauge) => {
      if (gauge.dataset.animated === 'true') {
        setUsageGaugeState(gauge, 1);
      }
    });
  });
}

function initCountValues() {
  const elements = Array.from(document.querySelectorAll('[data-animate="count"]'));

  if (!elements.length) {
    return;
  }

  elements.forEach((element) => setCountValue(element, 0));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCountValue(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.4
      }
    );

    elements.forEach((element) => observer.observe(element));
  } else {
    elements.forEach((element) => animateCountValue(element));
  }
}

window.addEventListener('load', () => {
  initErrorCharts();
  initUsageDonuts();
  initUsageGauges();
  initCountValues();
});
