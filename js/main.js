(function() {
const canvas = document.getElementById('myChart');
const context = canvas.getContext('2d');
const generateProjectionBtn = document.getElementById('generateProjectionBtn');

const commissionFeeMult = 30;
//const initialBalance = 263.64;
//const pipSize = 60;
const initialDate = new Date(Date.now());
const numOfGeneratedData = 100;

window.addEventListener('resize', resizeCanvas, false);
generateProjectionBtn.addEventListener('click', generateProjection);


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

function populateTable(initialBalance, pipSize) {
    const data = generateData(initialBalance, pipSize, numOfGeneratedData);
    const dates = generateChartLabels(initialDate, numOfGeneratedData);
    const table = document.getElementById('projectionTable');
    for (var i = 0; i < numOfGeneratedData; ++i) {
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
    const initialBalance = document.getElementById('initBalance').value;
    const pipSize = document.getElementById('pipSize').value;
    hideInputs();
    showProjection();
    populateTable(initialBalance, pipSize);
    resizeCanvas();
    const myChart = new Chart(context, {
        type: 'line',
        data: {
            labels: generateChartLabels(initialDate, numOfGeneratedData),
            datasets: [{
                label: 'Projection',
                data: generateChartData(initialBalance, pipSize, numOfGeneratedData),
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
}

}
)();
