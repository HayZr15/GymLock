// ================= GLOBALE APPLICATIE STATE =================
let logs = JSON.parse(localStorage.getItem('gymLockLogs')) || [];
let progressChart = null;
let currentLang = localStorage.getItem('gymLockLang') || 'NL';
let info = { NL: null, EN: null }; // Wordt dynamisch gevuld vanuit JSON

let profile = JSON.parse(localStorage.getItem('gymLockProfile')) || {
    height: 0,
    weight: 0,
    age: 0,
    frequency: '3-4'
};

// ================= APP INITIALISATIE & NAVIGATIE =================
document.addEventListener('DOMContentLoaded', async () => {
    // Start direct met het laden van externe JSON-taalbestanden
    await laadTaalBestanden();

    const dateInput = document.getElementById('input-date');
    if (dateInput) dateInput.valueAsDate = new Date();

    if (profile.height) document.getElementById('profile-height').value = profile.height;
    if (profile.weight) document.getElementById('profile-weight').value = profile.weight;
    if (profile.age) document.getElementById('profile-age').value = profile.age;
    if (profile.frequency) document.getElementById('profile-frequency').value = profile.frequency;

    document.getElementById('btn-lang-toggle').addEventListener('click', toggleLanguage);

    // Koppel onchange event om labels direct mee te veranderen bij categorie-switch
    document.getElementById('input-category').addEventListener('change', updateLogLabels);

    vertaalApp(currentLang);
    renderLogs();
});

// Asynchroon inladen van de JSON-bestanden uit de hoofdmap
async function laadTaalBestanden() {
    try {
        const [resNL, resEN] = await Promise.all([
            fetch('nl.json'),
            fetch('en.json')
        ]);
        info.NL = await resNL.json();
        info.EN = await resEN.json();
    } catch (err) {
        console.error("Fout bij het laden van externe JSON-taalbestanden:", err);
    }
}

function switchView(viewId, navBtn) {
    document.querySelectorAll('.app-view').forEach(view => view.classList.add('hidden'));
    document.getElementById(`view-${viewId}`).classList.remove('hidden');

    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    navBtn.classList.add('active');

    if (viewId === 'dashboard') {
        setTimeout(updateChart, 50);
    }
}

// ================= DYNAMISCHE EENHEDEN & LABELS PER CATEGORIE =================
function updateLogLabels() {
    if (!info[currentLang]) return;

    const cat = document.getElementById('input-category').value;
    const labelSubtype = document.getElementById('label-subtype');
    const inputSubtype = document.getElementById('input-subtype');
    const labelAmount = document.getElementById('label-amount');
    const inputAmount = document.getElementById('input-amount');
    
    const vertaalData = info[currentLang].logLabels[cat];

    if (vertaalData) {
        labelSubtype.innerText = vertaalData.subtype;
        inputSubtype.placeholder = vertaalData.subph;
        labelAmount.innerText = vertaalData.amount;
        inputAmount.placeholder = vertaalData.amountph;
    }
}

// ================= VERTAAL ENGINE =================
async function toggleLanguage() {
    currentLang = currentLang === 'NL' ? 'EN' : 'NL';
    localStorage.setItem('gymLockLang', currentLang);
    vertaalApp(currentLang);
    renderLogs();
}

function vertaalApp(taal) {
    const t = info[taal];
    if (!t) return; // Beveiliging als JSON nog niet binnen is

    document.getElementById('btn-lang-toggle').innerText = taal === 'NL' ? 'EN' : 'NL';

    // Vertaal statische elementen en invoer-placeholders
    document.getElementById('title-chart').innerText = t.titleChart;
    document.getElementById('sub-chart').innerText = t.subChart;
    document.getElementById('title-add-log').innerText = t.titleAddLog;
    document.getElementById('sub-add-log').innerText = t.subAddLog;
    document.getElementById('label-category').innerText = t.labelCategory;
    document.getElementById('label-date').innerText = t.labelDate;
    document.getElementById('btn-submit-log').innerText = t.btnSubmitLog;
    document.getElementById('title-history').innerText = t.titleHistory;
    document.getElementById('sub-history').innerText = t.subHistory;
    document.getElementById('title-profile-card').innerText = t.titleProfileCard;
    document.getElementById('sub-profile-card').innerText = t.subProfileCard;
    document.getElementById('label-height').innerText = t.labelLengte;
    document.getElementById('label-weight').innerText = t.labelGewicht;
    document.getElementById('label-age').innerText = t.labelAge;
    document.getElementById('label-frequency').innerText = t.labelFrequency;
    document.getElementById('btn-save-profile').innerText = t.btnOpslaan;
    document.getElementById('title-data-management').innerText = t.dataKop;
    document.getElementById('text-clear-data').innerText = t.textClearData;
    document.getElementById('btn-reset-data').innerText = t.btnReset;
    document.getElementById('nav-dashboard').innerText = t.navDashboard;
    document.getElementById('nav-logs').innerText = t.navLogs;
    document.getElementById('nav-settings').innerText = t.navSettings;

    // Vertaal invoer-placeholders van de profielvelden
    document.getElementById('profile-height').placeholder = t.phHeight;
    document.getElementById('profile-weight').placeholder = t.phWeight;
    document.getElementById('profile-age').placeholder = t.phAge;

    // Vertaal de opties van de Categorie Dropdown
    const catSelect = document.getElementById('input-category');
    Array.from(catSelect.options).forEach(opt => {
        if (t.categories[opt.value]) {
            opt.innerText = t.categories[opt.value];
        }
    });

    updateLogLabels();
    generateAndRenderWorkout();
}

// ================= LOG MANAGEMENT & GRAFIEK LOGICA =================
function addNewLog() {
    const category = document.getElementById('input-category').value;
    const subtype = document.getElementById('input-subtype').value.trim();
    const amount = document.getElementById('input-amount').value;
    const date = document.getElementById('input-date').value;

    const newLog = { id: Date.now(), category, subtype, amount, date };
    logs.push(newLog);
    localStorage.setItem('gymLockLogs', JSON.stringify(logs));

    document.getElementById('input-subtype').value = '';
    document.getElementById('input-amount').value = '';
    renderLogs();
}

// Expose deleteLog to window scope globally for dynamic onclick handling
window.deleteLog = function(id) {
    logs = logs.filter(log => log.id !== id);
    localStorage.setItem('gymLockLogs', JSON.stringify(logs));
    renderLogs();
};

function renderLogs() {
    const listContainer = document.getElementById('log-list');
    if (!listContainer || !info[currentLang]) return;
    listContainer.innerHTML = '';

    const t = info[currentLang];
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedLogs.forEach(log => {
        const item = document.createElement('div');
        item.className = 'log-item';
        
        let displayCat = t.categories[log.category] || log.category;
        let unit = '';

        if (log.category === 'Krachttraining') unit = t.units.kg;
        if (log.category === 'Cardio') unit = t.units.min;
        if (log.category === 'Voeding') unit = t.units.kcal;
        if (log.category === 'Stappen') unit = t.units.steps;
        if (log.category === 'Hartslag') unit = t.units.bpm;
        if (log.category === 'Gewicht') unit = t.units.kg;

        let titleText = displayCat;
        if (log.subtype) {
            titleText += ` <span style="color: var(--text-muted); font-weight:400;">— ${log.subtype}</span>`;
        }

        item.innerHTML = `
            <div>
                <div class="log-meta">${log.date}</div>
                <div class="log-title">${titleText}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 16px;">
                <span class="log-value">${log.amount} <span style="font-size:0.75rem; color:var(--text-muted); font-weight:400;">${unit}</span></span>
                <button class="btn-delete" onclick="window.deleteLog(${log.id})">X</button>
            </div>
        `;
        listContainer.appendChild(item);
    });

    updateChart();
    generateAndRenderWorkout();
}

function updateChart() {
    const canvas = document.getElementById('progressChart');
    if (!canvas) return;

    const weightLogs = logs
        .filter(log => log.category === 'Gewicht')
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    const labels = weightLogs.map(log => {
        const d = new Date(log.date);
        return `${d.getDate()}-${d.getMonth() + 1}`;
    });
    const dataValues = weightLogs.map(log => Number(log.amount));

    if (progressChart) {
        progressChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 240);
    gradient.addColorStop(0, 'rgba(204, 255, 0, 0.35)');
    gradient.addColorStop(1, 'rgba(204, 255, 0, 0.0)');

    progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: dataValues,
                borderColor: '#ccff00',
                backgroundColor: gradient,
                borderWidth: 2.5,
                pointBackgroundColor: '#ccff00',
                pointRadius: 4,
                tension: 0.2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { color: '#242429' }, ticks: { color: '#8e8e93', font: { family: 'Inter', size: 10 } } },
                y: { grid: { color: '#242429' }, ticks: { color: '#8e8e93', font: { family: 'Inter', size: 10 } }, beginAtZero: false }
            }
        }
    });
}

// ================= ALGORITMISCH TRAININGSPROGRAMMA MET EXPLICIETE DAGROUTINES =================
function generateAndRenderWorkout() {
    const container = document.getElementById('workout-program-container');
    if (!container || !info[currentLang]) return;

    const t = info[currentLang].workout;

    if (!profile.height || !profile.weight || !profile.age) {
        container.innerHTML = `
            <div class="dashboard-card">
                <h3>${t.titleEmpty}</h3>
                <p class="subtitle">${t.subEmpty}</p>
            </div>
        `;
        return;
    }

    const heightInMeters = profile.height / 100;
    const bmi = (profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
    
    let doel = t.goals.strength;
    let splitName = t.splits[profile.frequency] || t.splits['3-4'];
    let routines = [];

    if (profile.frequency === '1-2') {
        routines = [
            { dag: t.routines.workoutA, spieren: t.routines.musclesA, oefeningen: "Squats, Bench Press, Lat Pulldowns, Planks (4 sets x 8-12 reps)" },
            { dag: t.routines.workoutB, spieren: t.routines.musclesB, oefeningen: "Deadlifts, Overhead Press, Bicep Curls, Tricep Pushdowns (4 sets x 8-12 reps)" }
        ];
    } else if (profile.frequency === '3-4') {
        routines = [
            { dag: t.routines.day13Upper, spieren: t.routines.musclesUpper, oefeningen: "Bench Press, Barbell Rows, Dumbbell Shoulder Press, Pull-ups" },
            { dag: t.routines.day24Lower, spieren: t.routines.musclesLower, oefeningen: "Leg Press, Romanian Deadlifts, Calf Raises, Hanging Leg Raises" }
        ];
    } else if (profile.frequency === '5+') {
        routines = [
            { dag: t.routines.day14Push, spieren: t.routines.musclesPush, oefeningen: "Incline Dumbbell Press, Overhead Press, Lateral Raises, Cable Tricep Extensions" },
            { dag: t.routines.day25Pull, spieren: t.routines.musclesPull, oefeningen: "Barbell Rows, Face Pulls, Incline Bicep Curls, Hammer Curls" },
            { dag: t.routines.day36Legs, spieren: t.routines.musclesLegs, oefeningen: "Barbell Squats, Bulgarian Split Squats, Leg Curls, Ab Wheel Rollouts" }
        ];
    }

    if (bmi < 18.5) {
        doel = t.goals.hypertrophy;
    } else if (bmi >= 25.0) {
        doel = t.goals.fatloss;
    }

    if (profile.age > 40) {
        doel += t.goals.recovery;
    }

    let routinesHTML = '';
    routines.forEach(r => {
        routinesHTML += `
            <div class="workout-day-box">
                <div class="workout-day-header">${r.dag}</div>
                <div class="workout-day-body">${r.spieren}</div>
                <div class="workout-day-details"><b>${t.coreExercises}</b> ${r.oefeningen}</div>
            </div>
        `;
    });

    container.innerHTML = `
        <div class="dashboard-card">
            <h3>${t.titleCustom}</h3>
            <p class="subtitle">${t.subCustom}</p>
            
            <div style="margin-bottom: 14px; display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                <div>
                    <label>${t.targetGoal}</label>
                    <p style="font-weight: 700; font-size: 1rem; color: var(--accent);">${doel}</p>
                </div>
                <div style="text-align: right;">
                    <label>${t.splitSystem}</label>
                    <p style="font-weight: 600; font-size: 1rem;">${splitName}</p>
                </div>
            </div>

            <label style="margin-bottom: 4px;">${t.dailyBreakdown}</label>
            ${routinesHTML}
        </div>
    `;
}

// Expose globally for HTML onclick triggers
window.switchView = switchView;
window.saveProfile = saveProfile;
window.resetAllData = resetAllData;
window.addNewLog = addNewLog;

// ================= DATA EN INSTELLINGEN OPSLAAN =================
function saveProfile() {
    profile = {
        height: Number(document.getElementById('profile-height').value),
        weight: Number(document.getElementById('profile-weight').value),
        age: Number(document.getElementById('profile-age').value),
        frequency: document.getElementById('profile-frequency').value
    };

    localStorage.setItem('gymLockProfile', JSON.stringify(profile));
    generateAndRenderWorkout();
    updateChart();
    
    if (info[currentLang]) alert(info[currentLang].msgSaved);
}

function resetAllData() {
    if (!info[currentLang]) return;

    if (confirm(info[currentLang].msgResetConfirm)) {
        localStorage.clear();
        logs = [];
        profile = { height: 0, weight: 0, age: 0, frequency: '3-4' };
        
        document.getElementById('profile-height').value = '';
        document.getElementById('profile-weight').value = '';
        document.getElementById('profile-age').value = '';
        document.getElementById('profile-frequency').value = '3-4';

        renderLogs();
    }
}

// ================= SERVICE WORKER REGISTRATIE =================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker geregistreerd!', reg))
            .catch(err => console.error('Service Worker faal:', err));
    });
}