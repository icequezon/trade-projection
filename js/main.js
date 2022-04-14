(function() {
const canvas = document.getElementById('myChart');
const context = canvas.getContext('2d');
const generateProjectionBtn = document.getElementById('generateProjectionBtn');
const endDateInput = document.getElementById('endDate');

const commissionFeeMult = 30;
const initialDate = new Date(Date.now());

window.gInitBalance = 0.0;
window.gPipSize = 60;
window.gEndDate = new Date();

window.addEventListener('resize', resizeCanvas, false);
generateProjectionBtn.addEventListener('click', generateProjection);
endDateInput.addEventListener('input', checkWeekendInput);

function setEndDate() {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth()+1);
    if (nextMonth.getDay() === 6) {
        nextMonth.setDate(nextMonth.getDate()-1);
    }
    if (nextMonth.getDay() === 0) {
        nextMonth.setDate(nextMonth.getDate()+1);
    }
    endDateInput.valueAsDate = new Date(nextMonth);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight-55;
}

function hideInputs() {
    let pInput = document.getElementById('projectionInputs');
    pInput.style.display = 'none';
}

function showProjection() {
    let pChart = document.getElementById('projectionChartDiv');
    let pTable = document.getElementById('projectionTableDiv');
    pChart.style.display = '';
    pTable.style.display = '';
}

function checkWeekendInput(e) {
    const day = new Date(this.value).getDay();
    if ([0,6].includes(day)) {
        e.preventDefault();
        this.value = '';
        alert('Weekends not allowed');
    }
}

function computeDays(startDate, endDate) {
    startDate = new Date(startDate);
    endDate = new Date(endDate);
    let currDate = new Date(startDate);
    var days = 0;
    while(true) {
        if (currDate.getYear() === startDate.getYear()+100) {
            break;
        }
        currDate.setDate(currDate.getDate()+1);
        if (currDate.getDay() === 0 || currDate.getDay() === 6) {
            continue;
        }
        if (currDate > endDate) {
            break;
        }
        ++days;
    }
    return days;
}

function truncateTwoDecimal(num) {
    return parseFloat(num.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]);
}

function generateData(initialBalance, pipSize, days) {
    var data = [];
    for (i = 0; i < days; ++i)
    {
        const lotSize = truncateTwoDecimal(initialBalance/830);
        const grossProfit = truncateTwoDecimal(lotSize * pipSize);
        const commission = truncateTwoDecimal(lotSize * commissionFeeMult);
        const netProfit = truncateTwoDecimal(grossProfit - commission);
        const expectedBalance = truncateTwoDecimal(initialBalance + netProfit);

        data.push({
            'initialBalance': initialBalance,
            'lotSize': lotSize,
            'grossProfit': grossProfit,
            'commission': commission,
            'netProfit': netProfit,
            'expectedBalance': expectedBalance
        });

        initialBalance = expectedBalance;
    }
    return data;
}

function generateChartData(initialBalance, pipSize, days) {
    return generateData(initialBalance, pipSize, days).map(x => x['expectedBalance']);
}

function generateChartLabels(startDate, days) {
    let labels = [new Date(startDate),];
    var i = 0;
    var nextDate = new Date(startDate);
    while(labels.length < days) {
        if (i === 1000)
            break;
        i++;
        nextDate.setDate(nextDate.getDate()+1);
        if (nextDate.getDay() === 0 || nextDate.getDay() === 6) {
            continue;
        }
        labels.push(new Date(nextDate));
    }
    return labels.map(x => x.toLocaleDateString('en-us', {day: 'numeric', month: 'short', year: 'numeric'}));
}

function populateTable(initialBalance, pipSize, days) {
    const data = generateData(initialBalance, pipSize, days);
    const dates = generateChartLabels(initialDate, days);
    const table = document.getElementById('projectionTable');
    for (var i = 0; i < days; ++i) {
        let row = table.insertRow();

        let date = row.insertCell(0);
        date.setAttribute('scope', 'row');
        date.innerHTML = dates[i];

        let initialBalance = row.insertCell(1);
        initialBalance.innerHTML = data[i]['initialBalance'];

        let lotSize = row.insertCell(2);
        lotSize.innerHTML = data[i]['lotSize'];

        let grossProfit = row.insertCell(3);
        grossProfit.innerHTML = data[i]['grossProfit'];

        let commission = row.insertCell(4);
        commission.innerHTML = data[i]['commission'];

        let netProfit = row.insertCell(5);
        netProfit.innerHTML = data[i]['netProfit'];

        let expectedBalance = row.insertCell(6);
        expectedBalance.innerHTML = data[i]['expectedBalance'];
    }
}

function generateProjection() {
    const initialBalance = parseFloat(document.getElementById('initBalance').value);

    if(initialBalance <= 0 || isNaN(initialBalance)) {
        alert('Input a starting balance');
        return;
    }

    const pipSize = document.getElementById('pipSize').value;
    const days = computeDays(initialDate, document.getElementById('endDate').value);

    hideInputs();
    showProjection();
    populateTable(initialBalance, pipSize, days);
    const myChart = new Chart(context, {
        type: 'line',
        data: {
            labels: generateChartLabels(initialDate, days),
            datasets: [{
                label: 'Projection',
                data: generateChartData(initialBalance, pipSize, days),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    resizeCanvas();
}

resizeCanvas();
setEndDate();

}
)();
