// ================= GLOBALE APPLICATIE STATE =================
let logs = JSON.parse(localStorage.getItem('gymLockLogs')) || [];
let progressChart = null;
let currentLang = localStorage.getItem('gymLockLang') || 'NL';

let profile = JSON.parse(localStorage.getItem('gymLockProfile')) || {
    height: 0,
    weight: 0,
    age: 0,
    frequency: '3-4'
};

// ================= VERTAAL DICTIONARY (Echt Alles Compleet) =================
const info = {
    NL: {
        titleChart: "Voortgang",
        subChart: "Gewichtsverloop afgelopen periode",
        titleAddLog: "Activiteit Loggen",
        subAddLog: "Voer je training of fysiometrie in",
        labelCategory: "Categorie",
        labelAmount: "Waarde / Aantal",
        labelDate: "Datum",
        btnSubmitLog: "Log Opslaan",
        titleHistory: "Geschiedenis",
        subHistory: "Je geregistreerde activiteiten",
        titleProfileCard: "Profiel",
        subProfileCard: "Je fysiologische eigenschappen voor het schema",
        labelLengte: "Lengte (cm)",
        labelGewicht: "Gewicht (kg)",
        labelAge: "Leeftijd",
        labelFrequency: "Trainingen per week",
        btnOpslaan: "Profiel Opslaan",
        dataKop: "Data Beheer",
        textClearData: "Wil je alle opgeslagen gegevens wissen?",
        btnReset: "Reset Alle Gegevens",
        navDashboard: "Dashboard",
        navLogs: "Logs",
        navSettings: "Instellingen",
        msgSaved: "Profiel succesvol bijgewerkt.",
        msgResetConfirm: "Weet je zeker dat je alle data wilt wissen? Dit kan niet ongedaan worden gemaakt."
    },
    EN: {
        titleChart: "Progress",
        subChart: "Weight distribution over time",
        titleAddLog: "Log Activity",
        subAddLog: "Enter your training or fysiometrics",
        labelCategory: "Category",
        labelAmount: "Value / Amount",
        labelDate: "Date",
        btnSubmitLog: "Save Log",
        titleHistory: "History",
        subHistory: "Your registered activities",
        titleProfileCard: "Profile",
        subProfileCard: "Your physiological attributes for scheduling",
        labelLengte: "Height (cm)",
        labelGewicht: "Weight (kg)",
        labelAge: "Age",
        labelFrequency: "Workouts per week",
        btnOpslaan: "Save Profile",
        dataKop: "Data Management",
        textClearData: "Want to clear all saved data?",
        btnReset: "Reset All Data",
        navDashboard: "Dashboard",
        navLogs: "Logs",
        navSettings: "Settings",
        msgSaved: "Profile updated successfully.",
        msgResetConfirm: "Are you sure you want to clear all data? This cannot be undone."
    }
};

// ================= APP INITIALISATIE & NAVIGATIE =================
document.addEventListener('DOMContentLoaded', () => {
    // Stel de datum-input standaard in op vandaag
    const dateInput = document.getElementById('input-date');
    if (dateInput) dateInput.valueToDate = new Date();

    // Vul de profielvelden in vanuit localStorage
    if (profile.height) document.getElementById('profile-height').value = profile.height;
    if (profile.weight) document.getElementById('profile-weight').value = profile.weight;
    if (profile.age) document.getElementById('profile-age').value = profile.age;
    if (profile.frequency) document.getElementById('profile-frequency').value = profile.frequency;

    // Koppel de taalwisselknop
    document.getElementById('btn-lang-toggle').addEventListener('click', toggleLanguage);

    // Render alles voor de eerste start
    vertaalApp(currentLang);
    renderLogs();
});

function switchView(viewId, navBtn) {
    // Verberg alle views
    document.querySelectorAll('.app-view').forEach(view => view.classList.add('hidden'));
    // Toon geselecteerde view
    document.getElementById(`view-${viewId}`).classList.remove('hidden');

    // Update actieve knop in navigatie
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    navBtn.classList.add('active');

    // Als we naar het dashboard gaan, forceer een chart redraw om sizing-bugs te voorkomen
    if (viewId === 'dashboard') {
        setTimeout(updateChart, 50);
    }
}

// ================= VERTAAL ENGINE =================
function toggleLanguage() {
    currentLang = currentLang === 'NL' ? 'EN' : 'NL';
    localStorage.setItem('gymLockLang', currentLang);
    vertaalApp(currentLang);
    renderLogs();
}

function vertaalApp(taal) {
    const t = info[taal];
    document.getElementById('btn-lang-toggle').innerText = taal === 'NL' ? 'EN' : 'NL';

    // Koppelen aan alle HTML IDs
    document.getElementById('title-chart').innerText = t.titleChart;
    document.getElementById('sub-chart').innerText = t.subChart;
    document.getElementById('title-add-log').innerText = t.titleAddLog;
    document.getElementById('sub-add-log').innerText = t.subAddLog;
    document.getElementById('label-category').innerText = t.labelCategory;
    document.getElementById('label-amount').innerText = t.labelAmount;
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

    // Vertaal de dropdown opties van categorieën live mee
    const catSelect = document.getElementById('input-category');
    Array.from(catSelect.options).forEach(opt => {
        if (opt.value === 'Krachttraining') opt.innerText = taal === 'EN' ? 'Strength Training' : 'Krachttraining';
        if (opt.value === 'Voeding') opt.innerText = taal === 'EN' ? 'Nutrition' : 'Voeding';
        if (opt.value === 'Stappen') opt.innerText = taal === 'EN' ? 'Steps' : 'Stappen';
        if (opt.value === 'Hartslag') opt.innerText = taal === 'EN' ? 'Heart Rate' : 'Hartslag';
        if (opt.value === 'Gewicht') opt.innerText = taal === 'EN' ? 'Weight (kg)' : 'Gewicht (kg)';
    });

    generateAndRenderWorkout();
}

// ================= LOG MANAGEMENT & GRAFIEK LOGICA =================
function addNewLog() {
    const category = document.getElementById('input-category').value;
    const amount = document.getElementById('input-amount').value;
    const date = document.getElementById('input-date').value;

    const newLog = { id: Date.now(), category, amount, date };
    logs.push(newLog);
    localStorage.setItem('gymLockLogs', JSON.stringify(logs));

    document.getElementById('input-amount').value = '';
    renderLogs();
}

function deleteLog(id) {
    logs = logs.filter(log => log.id !== id);
    localStorage.setItem('gymLockLogs', JSON.stringify(logs));
    renderLogs();
}

function renderLogs() {
    const listContainer = document.getElementById('log-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    // Sorteer de logs op datum (nieuwste bovenaan)
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedLogs.forEach(log => {
        const item = document.createElement('div');
        item.className = 'log-item';
        
        // Vertaal categorie naam in de lijst
        let displayCat = log.category;
        if (currentLang === 'EN') {
            if (log.category === 'Krachttraining') displayCat = 'Strength';
            if (log.category === 'Voeding') displayCat = 'Nutrition';
            if (log.category === 'Stappen') displayCat = 'Steps';
            if (log.category === 'Hartslag') displayCat = 'Heart Rate';
            if (log.category === 'Gewicht') displayCat = 'Weight';
        }

        item.innerHTML = `
            <div>
                <div class="log-meta">${log.date}</div>
                <div class="log-title">${displayCat}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 16px;">
                <span class="log-value">${log.amount}</span>
                <button class="btn-delete" onclick="deleteLog(${log.id})">X</button>
            </div>
        `;
        listContainer.appendChild(item);
    });

    // Update direct de grafiek en het trainingsprogramma
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
    progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: dataValues,
                borderColor: '#ccff00',
                backgroundColor: 'rgba(204, 255, 0, 0.05)',
                borderWidth: 2,
                pointBackgroundColor: '#ccff00',
                pointRadius: 4,
                tension: 0.15,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { color: '#242429' }, ticks: { color: '#8e8e93', font: { family: 'Inter', size: 10 } } },
                y: { grid: { color: '#242429' }, ticks: { color: '#8e8e93', font: { family: 'Inter', size: 10 } } }
            }
        }
    });
}

// ================= ALGORITMISCH TRAININGSPROGRAMMA =================
function generateAndRenderWorkout() {
    const container = document.getElementById('workout-program-container');
    if (!container) return;

    if (!profile.height || !profile.weight || !profile.age) {
        container.innerHTML = `
            <div class="dashboard-card">
                <h3>${currentLang === 'EN' ? 'Workout Program' : 'Trainingsprogramma'}</h3>
                <p class="subtitle">${currentLang === 'EN' ? 'Complete your profile in Settings to generate a specialized routine.' : 'Vul je profielgegevens in bij Instellingen om een gepersonaliseerd schema te genereren.'}</p>
            </div>
        `;
        return;
    }

    const heightInMeters = profile.height / 100;
    const bmi = (profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
    
    let doel = currentLang === 'EN' ? "Strength & Conditioning" : "Kracht & Conditie";
    let focus = currentLang === 'EN' ? "Focus on progressive overload and general fitness enhancement." : "Progressive overload en algemene fitheid verbeteren.";
    let split = currentLang === 'EN' ? "Full Body (3x / week)" : "Full Body (3x per week)";

    if (bmi < 18.5) {
        doel = currentLang === 'EN' ? "Hypertrophy (Muscle Mass Building)" : "Hypertrofie (Spiermassa Opbouw)";
        focus = currentLang === 'EN' ? "Focus on compound mechanics, steady weight increases, and a caloric surplus." : "Focus on compound oefeningen, progressieve belasting en een calorie-overschot.";
    } else if (bmi >= 25.0) {
        doel = currentLang === 'EN' ? "Recomposition & Fat Loss" : "Recompositie & Vetverlies";
        focus = currentLang === 'EN' ? "Preserving motor units via heavy resistance training coupled with a controlled energy deficit." : "Behoud van spiermassa middels krachttraining gecombineerd met een gecontroleerd calorietekort.";
    }

    if (profile.frequency === '3-4') {
        split = currentLang === 'EN' ? "Upper / Lower Split (4x / week)" : "Upper / Lower Split (4x per week)";
    } else if (profile.frequency === '5+') {
        split = currentLang === 'EN' ? "Push / Pull / Legs Split (5-6x / week)" : "Push / Pull / Legs Split (5-6x per week)";
    }

    let intensiteit = currentLang === 'EN' ? "High Intensity (Maximum Output)" : "High Intensity (Maximale output)";
    if (profile.age > 40) {
        intensiteit = currentLang === 'EN' ? "Regulated Intensity (Recovery Oriented)" : "Gereguleerde Intensiteit (Focus op herstel)";
    }

    container.innerHTML = `
        <div class="dashboard-card">
            <h3>${currentLang === 'EN' ? 'Custom Routine' : 'Gepersonaliseerd Trainingsprogramma'}</h3>
            <p class="subtitle">${currentLang === 'EN' ? 'Generated using real fysiometrics' : 'Gegenereerd op basis van actuele fysiometrie'}</p>
            
            <div style="margin-bottom: 12px;">
                <label>${currentLang === 'EN' ? 'Goal' : 'Doelstelling'}</label>
                <p style="font-weight: 600; font-size: 1.1rem; color: var(--accent);">${doel}</p>
            </div>
            
            <div style="margin-bottom: 12px;">
                <label>${currentLang === 'EN' ? 'Routine Split' : 'Routine Verdeling'}</label>
                <p style="font-weight: 500;">${split}</p>
            </div>

            <div style="margin-bottom: 12px;">
                <label>${currentLang === 'EN' ? 'Intensity Threshold' : 'Intensiteit Niveau'}</label>
                <p style="font-weight: 500;">${intensiteit}</p>
            </div>
            
            <div>
                <label>Focus</label>
                <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.4;">${focus}</p>
            </div>
        </div>
    `;
}

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
    alert(info[currentLang].msgSaved);
}

function resetAllData() {
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