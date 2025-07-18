
const templates = {
    fm55: {
        finalDrive: 4.05,
        rpm: 3000,
        tireDiameter: 0.626,
        gearRatios: [3.38, 1.76, 1.18, 0.89, 0.66, 0],
        tolerances: [25.9, 19.8, 14.9, 11.5, 11, 0]
    },
    fm57: {
        finalDrive: 3.828,
        rpm: 3000,
        tireDiameter: 0.626,
        gearRatios: [3.38, 1.76, 1.18, 0.89, 0.66, 0],
        tolerances: [27.4, 21, 15.5, 11.7, 11.5, 0]
    },
    roffe: {
        finalDrive: 3.61,
        rpm: 3000,
        tireDiameter: 0.626,
        gearRatios: [3.00, 1.933, 1.368, 1.045, 0.833, 0.704],
        tolerances: [25.9, 19.8, 14.9, 11.5, 11, 10.5]
    }
};

function loadTemplate() {
    const selected = document.getElementById('templateSelect').value;
    if (!templates[selected]) return;

    const tmpl = templates[selected];
    document.getElementById('finalDrive').value = tmpl.finalDrive;
    document.getElementById('rpm').value = tmpl.rpm;
    document.getElementById('tireDiameter').value = tmpl.tireDiameter;

    const gearInputs = document.querySelectorAll('.gearRatio');
    const tolInputs = document.querySelectorAll('.tolerance');

    tmpl.gearRatios.forEach((val, i) => {
        if (val !== null) gearInputs[i].value = val;
    });
    tmpl.tolerances.forEach((val, i) => {
        if (val !== null) tolInputs[i].value = val;
    });
    calculateRatios();
}

let gearChartInstance = null;

function calculateRatios() {
    const fd = parseFloat(document.getElementById('finalDrive').value);
    const baseRpm = parseFloat(document.getElementById('rpm').value);
    const td = parseFloat(document.getElementById('tireDiameter').value);
    const gears = ['1st', '2nd', '3rd', '4th', '5th', '6th'];
    const gearRatios = [...document.querySelectorAll('.gearRatio')].map(el => parseFloat(el.value));
    const tolerances = [...document.querySelectorAll('.tolerance')].map(el => parseFloat(el.value));

    const tbody = document.querySelector('#outputTable tbody');
    tbody.innerHTML = '';

    if (gearRatios[5] == "0") {
        gearRatios.pop();
        gears.pop();
        tolerances.pop();
    }

    // Table Output
    gearRatios.forEach((gr, i) => {
        const wheelRPM = baseRpm / (gr * fd);
        const speedKmh = (wheelRPM * Math.PI * td * 60) / 1000;
        const ratio = (baseRpm * 10) / speedKmh;
        const ratioInt = Math.round(ratio);
        const range = Math.round(ratio * (tolerances[i] / 100));

        const row = `<tr><td>${gears[i]}</td><td>${ratioInt}</td><td>${range}</td><td>${speedKmh.toFixed(1)}</td></tr>`;
        tbody.insertAdjacentHTML('beforeend', row);
    });

    document.getElementById('outputTable').style.display = 'table';

    // Chart Output
    const rpmPoints = [];
    for (let rpm = 600; rpm <= 8000; rpm += 100) {
        rpmPoints.push(rpm);
    }



    const datasets = gearRatios.map((gr, idx) => {
        const data = rpmPoints.map(rpm => {
            const wheelRPM = rpm / (gr * fd);
            const speedKmh = (wheelRPM * Math.PI * td * 60) / 1000;
            return { x: rpm, y: speedKmh };
        });

        return {
            label: gears[idx],
            data,
            borderWidth: 2,
            fill: false
        };
    });

    const ctx = document.getElementById('gearChart').getContext('2d');
    if (gearChartInstance) {
        gearChartInstance.destroy();
    }

    gearChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: datasets
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'linear',
                    title: { display: true, text: 'Engine RPM' },
                    min: 600,
                    max: 8000
                },
                y: {
                    title: { display: true, text: 'Speed (km/h)' }
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    mode: 'nearest',
                    intersect: false
                }
            }
        }
    });
}