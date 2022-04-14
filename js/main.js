(function() {
const canvas = document.getElementById('myChart');
const context = canvas.getContext('2d');

const commissionFeeMult = 30;
const initialBalance = 263.64;
const pipSize = 60;
const startDate = new Date(Date.now());
const numOfGeneratedData = 100;

window.addEventListener('resize', resizeCanvas, false);

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight-55;
}

function truncateTwoDecimal(num) {
    return parseFloat(num.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]);
}

function generateData(initialBalance, pipSize, days) {
    var data = [];
    for (i = 0; i < days; ++i)
    {
        const lotSize = truncateTwoDecimal(initialBalance/830);
        const expectedGain = truncateTwoDecimal(lotSize * pipSize);
        const commission = truncateTwoDecimal(lotSize * commissionFeeMult);
        const netGain = truncateTwoDecimal(expectedGain - commission);
        const expectedBalance = truncateTwoDecimal(initialBalance + netGain);
        
        data.push({
            'lotSize': lotSize,
            'expectedGain': expectedGain,
            'commission': commission,
            'netGain': netGain,
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
    var labels = [startDate,];
    var i = 0;
    var nextDate = startDate;
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
    return labels.map(x => x.toLocaleDateString());
}

resizeCanvas();
const myChart = new Chart(context, {
    type: 'line',
    data: {
        labels: generateChartLabels(startDate, numOfGeneratedData),
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
)();
