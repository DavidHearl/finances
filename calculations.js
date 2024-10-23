let mortgageChart;

function calculateMortgage(principal, annualInterestRate, years, months, overpayment) {
    let monthlyInterestRate = annualInterestRate / 100 / 12;
    let numberOfPayments = (years * 12) + months;
    let monthlyPayment = principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
    monthlyPayment += overpayment; // Add overpayment to the monthly payment

    let payments = [];
    let remainingPrincipal = principal;

    for (let i = 0; i < numberOfPayments; i++) {
        let interestPayment = remainingPrincipal * monthlyInterestRate;
        let principalPayment = monthlyPayment - interestPayment;
        remainingPrincipal -= principalPayment;

        if (remainingPrincipal < 0) {
            remainingPrincipal = 0;
        }

        payments.push({
            month: i + 1,
            totalPayment: monthlyPayment,
            principalLeft: remainingPrincipal,
            principalPaid: principalPayment,
            interestPaid: interestPayment
        });

        if (remainingPrincipal <= 0) {
            break;
        }
    }

    return payments;
}

function calculateAndDisplayMortgage() {
    let principal = parseFloat(document.getElementById('principal').value);
    let annualInterestRate = parseFloat(document.getElementById('annualInterestRate').value);
    let years = parseFloat(document.getElementById('years').value);
    let months = parseFloat(document.getElementById('months').value);
    let overpayment = parseFloat(document.getElementById('overpayment').value);

    if (principal && annualInterestRate && (years || months)) {
        let payments = calculateMortgage(principal, annualInterestRate, years, months, overpayment);
        let resultElement = document.getElementById('result');
        resultElement.innerHTML = '';

        // Calculate total interest paid
        let totalInterestPaid = payments.reduce((acc, payment) => acc + payment.interestPaid, 0);
        document.getElementById('totalInterestPaid').innerText = `£${totalInterestPaid.toFixed(2)}`;

        // Create table
        let table = document.createElement('table');

        // Create table header
        let header = table.createTHead();
        let headerRow = header.insertRow(0);
        let headers = ['Year', 'Month', 'Total Payment', 'Principal Left', 'Principal Paid', 'Interest Paid'];
        headers.forEach((headerText, index) => {
            let cell = headerRow.insertCell(index);
            cell.outerHTML = `<th>${headerText}</th>`;
        });

        // Create table body
        let tbody = table.createTBody();
        payments.forEach(payment => {
            let row = tbody.insertRow();
            row.insertCell(0).innerText = Math.floor(payment.month / 12);
            row.insertCell(1).innerText = payment.month % 12 + 1;
            row.insertCell(2).innerText = `£${payment.totalPayment.toFixed(2)}`;
            row.insertCell(3).innerText = `£${payment.principalLeft.toFixed(2)}`;
            row.insertCell(4).innerText = `£${payment.principalPaid.toFixed(2)}`;
            row.insertCell(5).innerText = `£${payment.interestPaid.toFixed(2)}`;
        });

        // Append table to result element
        resultElement.appendChild(table);

        // Prepare data for the chart
        let labels = payments.map(payment => `Year ${Math.floor(payment.month / 12)} Month ${payment.month % 12 + 1}`);
        let totalPayments = payments.map(payment => payment.totalPayment);
        let principalPayments = payments.map(payment => payment.principalPaid);
        let interestPayments = payments.map(payment => payment.interestPaid);

        // Render or update the chart
        if (!mortgageChart) {
            renderChart(labels, totalPayments, principalPayments, interestPayments);
        } else {
            updateChart(labels, totalPayments, principalPayments, interestPayments);
        }
    } else {
        document.getElementById('result').innerText = '';
    }
}

function renderChart(labels, totalPayments, principalPayments, interestPayments) {
    let ctx = document.getElementById('mortgageChart').getContext('2d');
    mortgageChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Total Payment',
                    data: totalPayments,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    fill: false
                },
                {
                    label: 'Principal Payment',
                    data: principalPayments,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    fill: false
                },
                {
                    label: 'Interest Payment',
                    data: interestPayments,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    display: window.innerWidth > 600,
                    title: {
                        display: true,
                        text: 'Month'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Amount (£)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true
                },
                tooltip: {
                    enabled: true
                }
            }
        },
        plugins: [{
            id: 'responsiveLabels',
            beforeDraw: (chart) => {
                chart.options.scales.x.display = window.innerWidth > 600;
            }
        }]
    });
}

function updateChart(labels, totalPayments, principalPayments, interestPayments) {
    mortgageChart.data.labels = labels;
    mortgageChart.data.datasets[0].data = totalPayments;
    mortgageChart.data.datasets[1].data = principalPayments;
    mortgageChart.data.datasets[2].data = interestPayments;
    mortgageChart.update();
}

function validateMonthsInput() {
    let monthsInput = document.getElementById('months');
    let yearsInput = document.getElementById('years');
    let months = parseInt(monthsInput.value);
    let years = parseInt(yearsInput.value);

    if (months > 11) {
        monthsInput.value = 0;
        yearsInput.value = years + 1;
    } else if (months < 0) {
        monthsInput.value = 11;
        yearsInput.value = years - 1;
    }
}

function validateOverpaymentInput() {
    let overpaymentInput = document.getElementById('overpayment');
    let overpayment = parseFloat(overpaymentInput.value);

    if (overpayment < 0) {
        overpaymentInput.value = 0;
    }
}

document.getElementById('principal').addEventListener('input', calculateAndDisplayMortgage);
document.getElementById('annualInterestRate').addEventListener('input', calculateAndDisplayMortgage);
document.getElementById('years').addEventListener('input', calculateAndDisplayMortgage);
document.getElementById('months').addEventListener('input', () => {
    validateMonthsInput();
    calculateAndDisplayMortgage();
});
document.getElementById('overpayment').addEventListener('input', () => {
    validateOverpaymentInput();
    calculateAndDisplayMortgage();
});
window.addEventListener('DOMContentLoaded', calculateAndDisplayMortgage);