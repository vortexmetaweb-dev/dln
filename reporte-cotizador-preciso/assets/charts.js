(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  var ivaChart = echarts.init(document.getElementById('chart-iva'), null, { renderer: 'svg' });
  ivaChart.setOption({
    animation: false,
    tooltip: { trigger: 'item', appendToBody: true },
    color: [accent, accent2],
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      label: { color: ink },
      data: [
        { value: 9, name: 'Con IVA' },
        { value: 20, name: 'Sin IVA' }
      ]
    }]
  });
  window.addEventListener('resize', function() { ivaChart.resize(); });

  var baseChart = echarts.init(document.getElementById('chart-base'), null, { renderer: 'svg' });
  baseChart.setOption({
    animation: false,
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, appendToBody: true },
    grid: { left: 140, right: 20, top: 20, bottom: 30 },
    xAxis: {
      type: 'value',
      axisLabel: { color: muted },
      splitLine: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'category',
      axisLabel: { color: ink },
      data: ["Por BL/documento", "Por tonelada/m³", "Por contenedor", "Por servicio/evento", "Por evento", "Por embarque/documento"]
    },
    series: [{
      type: 'bar',
      data: [2, 3, 4, 6, 7, 7],
      itemStyle: { color: accent },
      label: { show: true, position: 'right', color: ink }
    }]
  });
  window.addEventListener('resize', function() { baseChart.resize(); });
})();
