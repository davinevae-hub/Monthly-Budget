const $ = id => document.getElementById(id);
let chartInstance;

// Add expense row
function addExpense() {
  const container = $('expenseList');
  const div = document.createElement('div');
  div.classList.add('expenseRow');
  div.innerHTML = `
    <label>Description: <input type="text" class="desc"></label>
    <label>Amount ($): <input type="number" class="amount" step="0.01"></label>
  `;
  container.appendChild(div);
}

// Calculate income
function calculateIncome() {
  const hourly = parseFloat($('hourlyPay').value) || 0;
  const hours = parseFloat($('hoursPerWeek').value) || 0;
  const tax = (parseFloat($('taxPercent').value) || 0) / 100;

  const gross = hourly * hours * 2; // biweekly gross
  const net = gross * (1 - tax);

  $('incomeResults').innerHTML = `
    <p><b>Gross Pay (Biweekly):</b> $${gross.toFixed(2)}</p>
    <p><b>Net Pay (Biweekly):</b> $${net.toFixed(2)}</p>
    <p><i>*Does not include benefits (insurance, retirement, etc.)</i></p>
  `;
}

// Calculate budget
function calculateBudget() {
  const amounts = [...document.querySelectorAll('.amount')].map(el => parseFloat(el.value) || 0);
  const totalBiweekly = amounts.reduce((a, b) => a + b, 0);
  const totalMonthly = totalBiweekly * 2;

  $('budgetResults').innerHTML = `
    <p><b>Total Expenses (Biweekly):</b> $${totalBiweekly.toFixed(2)}</p>
    <p><b>Projected Expenses (Monthly):</b> $${totalMonthly.toFixed(2)}</p>
  `;

  // Draw chart
  const ctx = $('budgetChart').getContext('2d');
  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Expenses', 'Remaining'],
      datasets: [{
        data: [totalMonthly, Math.max(0, totalMonthly * 0.1)], // placeholder leftover
        backgroundColor: ['#FF6384', '#36A2EB']
      }]
    }
  });
}

// Download PDF
function downloadReport() {
  const element = document.createElement('div');
  element.innerHTML = `
    <h1>Monthly Budgeting Report</h1>
    ${$('incomeResults').innerHTML}
    ${$('budgetResults').innerHTML}
  `;

  // Add chart snapshot
  const chartCanvas = $('budgetChart');
  if (chartCanvas) {
    const imgEl = document.createElement('img');
    imgEl.src = chartCanvas.toDataURL('image/png', 1.0);
    imgEl.style.width = '100%';
    element.appendChild(imgEl);
  }

  const opt = {
    margin: 10,
    filename: 'Budgeting_Report.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
}

// Reset all fields
function resetAll() {
  $('hourlyPay').value = '';
  $('hoursPerWeek').value = '';
  $('taxPercent').value = '';
  $('incomeResults').innerHTML = '';
  $('budgetResults').innerHTML = '';
  $('expenseList').innerHTML = '';
  if (chartInstance) chartInstance.destroy();
}
