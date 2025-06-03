const firebaseURL = "https://water-lever-monitoring-system-default-rtdb.firebaseio.com/water_levels.json";

let chart, chartData = [], chartLabels = [];

async function fetchData() {
  const res = await fetch(firebaseURL);
  const data = await res.json();

  if (!data) return;

  const entries = Object.entries(data).map(([_, val]) => ({
    time: val.timestamp,
    level: val.water_level
  }));

  entries.sort((a, b) => new Date(a.time) - new Date(b.time));

  chartLabels = entries.map(e => e.time);
  chartData = entries.map(e => e.level);

  updateChart();
  updateDisplay(entries[entries.length - 1]);
}

function updateDisplay(latest) {
  document.getElementById('currentLevel').textContent = `${latest.level} cm`;

  const alertBox = document.getElementById('alertMsg');
  if (latest.level < 10) {
    alertBox.textContent = "⚠️ Water level too low!";
    alertBox.classList.add("alert");
  } else if (latest.level > 90) {
    alertBox.textContent = "⚠️ Water tank full!";
    alertBox.classList.add("alert");
  } else {
    alertBox.textContent = "✅ Status: Normal";
    alertBox.classList.remove("alert");
  }
}

function updateChart() {
  if (!chart) {
    const ctx = document.getElementById("levelChart").getContext("2d");
    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: chartLabels,
        datasets: [{
          label: "Water Level (cm)",
          data: chartData,
          borderColor: "#007bff",
          backgroundColor: "rgba(0,123,255,0.1)",
          tension: 0.4,
          pointRadius: 3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  } else {
    chart.data.labels = chartLabels;
    chart.data.datasets[0].data = chartData;
    chart.update();
  }
}

function toggleTheme() {
  document.body.classList.toggle("dark");
  if (chart) chart.update();
}

setInterval(fetchData, 5000);
fetchData();
