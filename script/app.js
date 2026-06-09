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

// ================= VERTAAL DICTIONARY =================
const info = {
    NL: {
        titleChart: "Voortgang",
        subChart: "Gewichtsverloop afgelopen periode (Dynamische Schaal)",
        titleAddLog: "Activiteit Loggen",
        subAddLog: "Voer je training of fysiometrie in",
        labelCategory: "Categorie",
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
        subChart: "Weight distribution over time (Dynamic Scale)",
        titleAddLog: "Log Activity",
        subAddLog: "Enter your training or fysiometrics",
        labelCategory: "Category",
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
    const dateInput = document.getElementById('input-date');
    if (dateInput) dateInput.valueAsDate = new Date();

    if (profile.height) document.getElementById('profile-height').value = profile.height;
    if (profile.weight) document.getElementById('profile-weight').value = profile.weight;
    if (profile.age) document.getElementById('profile-age').value = profile.age;
    if (profile.frequency) document.getElementById('profile-frequency').value = profile.frequency;

    document.getElementById('btn-lang-toggle').addEventListener('click', toggleLanguage);

    vertaalApp(currentLang);
    updateLogLabels(); // Zet direct de juiste invoervelden klaar voor Krachttraining
    renderLogs();
});

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
    const cat = document.getElementById('input-category').value;
    const labelSubtype = document.getElementById('label-subtype');
    const inputSubtype = document.getElementById('input-subtype');
    const labelAmount = document.getElementById('label-amount');
    const inputAmount = document.getElementById('input-amount');
    
    if (currentLang === 'NL') {
        if (cat === 'Krachttraining') {
            labelSubtype.innerText = "Oefening / Spiergroep";
            inputSubtype.placeholder = "Bijv. Bench Press, Squats, Pull-ups";
            labelAmount.innerText = "Gewicht (kg)";
            inputAmount.placeholder = "Bijv. 80";
        } else if (cat === 'Cardio') {
            labelSubtype.innerText = "Type Activiteit";
            inputSubtype.placeholder = "Bijv. Hardlopen, Wielrennen, Roeien";
            labelAmount.innerText = "Duur (minuten)";
            inputAmount.placeholder = "Bijv. 45";
        } else if (cat === 'Voeding') {
            labelSubtype.innerText = "Product / Maaltijd";
            inputSubtype.placeholder = "Bijv. Eiwitshake, Kip met Rijst";
            labelAmount.innerText = "Inname (kcal)";
            inputAmount.placeholder = "Bijv. 650";
        } else if (cat === 'Stappen') {
            labelSubtype.innerText = "Opmerking (Optioneel)";
            inputSubtype.placeholder = "Bijv. Ochtendwandeling";
            labelAmount.innerText = "Aantal stappen";
            inputAmount.placeholder = "Bijv. 10000";
        } else if (cat === 'Hartslag') {
            labelSubtype.innerText = "Toestand / Meetmoment";
            inputSubtype.placeholder = "Bijv. In rust, Direct na sprint";
            labelAmount.innerText = "Hartslag (BPM)";
            inputAmount.placeholder = "Bijv. 68";
        } else if (cat === 'Gewicht') {
            labelSubtype.innerText = "Opmerking (Optioneel)";
            inputSubtype.placeholder = "Bijv. Nuchter gewogen";
            labelAmount.innerText = "Lichaamsgewicht (kg)";
            inputAmount.placeholder = "Bijv. 78.4";
        }
    } else { // ENGELS
        if (cat === 'Krachttraining') {
            labelSubtype.innerText = "Exercise / Muscle Group";
            inputSubtype.placeholder = "E.g., Bench Press, Squats, Pull-ups";
            labelAmount.innerText = "Weight (kg)";
            inputAmount.placeholder = "E.g., 80";
        } else if (cat === 'Cardio') {
            labelSubtype.innerText = "Activity Type";
            inputSubtype.placeholder = "E.g., Running, Cycling, Rowing";
            labelAmount.innerText = "Duration (minutes)";
            inputAmount.placeholder = "E.g., 45";
        } else if (cat === 'Voeding') {
            labelSubtype.innerText = "Product / Meal";
            inputSubtype.placeholder = "E.g., Protein Shake, Chicken & Rice";
            labelAmount.innerText = "Intake (kcal)";
            inputAmount.placeholder = "E.g., 650";
        } else if (cat === 'Stappen') {
            labelSubtype.innerText = "Note (Optional)";
            inputSubtype.placeholder = "E.g., Morning walk";
            labelAmount.innerText = "Step Count";
            inputAmount.placeholder = "E.g., 10000";
        } else if (cat === 'Hartslag') {
            labelSubtype.innerText = "State / Moment";
            inputSubtype.placeholder = "E.g., Resting, Post-sprint";
            labelAmount.innerText = "Heart Rate (BPM)";
            inputAmount.placeholder = "E.g., 68";
        } else if (cat === 'Gewicht') {
            labelSubtype.innerText = "Note (Optional)";
            inputSubtype.placeholder = "E.g., Fasting weight";
            labelAmount.innerText = "Body Weight (kg)";
            inputAmount.placeholder = "E.g., 78.4";
        }
    }
}

// ================= VERTAAL ENGINE =================
function toggleLanguage() {
    currentLang = currentLang === 'NL' ? 'EN' : 'NL';
    localStorage.setItem('gymLockLang', currentLang);
    vertaalApp(currentLang);
    updateLogLabels();
    renderLogs();
}

function vertaalApp(taal) {
    const t = info[taal];
    document.getElementById('btn-lang-toggle').innerText = taal === 'NL' ? 'EN' : 'NL';

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

    const catSelect = document.getElementById('input-category');
    Array.from(catSelect.options).forEach(opt => {
        if (opt.value === 'Krachttraining') opt.innerText = taal === 'EN' ? 'Strength Training' : 'Krachttraining';
        if (opt.value === 'Cardio') opt.innerText = taal === 'EN' ? 'Cardio' : 'Cardio';
        if (opt.value === 'Voeding') opt.innerText = taal === 'EN' ? 'Nutrition' : 'Voeding';
        if (opt.value === 'Stappen') opt.innerText = taal === 'EN' ? 'Steps' : 'Stappen';
        if (opt.value === 'Hartslag') opt.innerText = taal === 'EN' ? 'Heart Rate' : 'Hartslag';
        if (opt.value === 'Gewicht') opt.innerText = taal === 'EN' ? 'Weight' : 'Gewicht';
    });

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

function deleteLog(id) {
    logs = logs.filter(log => log.id !== id);
    localStorage.setItem('gymLockLogs', JSON.stringify(logs));
    renderLogs();
}

function renderLogs() {
    const listContainer = document.getElementById('log-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedLogs.forEach(log => {
        const item = document.createElement('div');
        item.className = 'log-item';
        
        let displayCat = log.category;
        let unit = '';

        if (log.category === 'Krachttraining') { displayCat = currentLang === 'EN' ? 'Strength' : 'Krachttraining'; unit = 'kg'; }
        if (log.category === 'Cardio') { displayCat = 'Cardio'; unit = 'min'; }
        if (log.category === 'Voeding') { displayCat = currentLang === 'EN' ? 'Nutrition' : 'Voeding'; unit = 'kcal'; }
        if (log.category === 'Stappen') { displayCat = currentLang === 'EN' ? 'Steps' : 'Stappen'; unit = currentLang === 'EN' ? 'steps' : 'stappen'; }
        if (log.category === 'Hartslag') { displayCat = currentLang === 'EN' ? 'Heart Rate' : 'Hartslag'; unit = 'BPM'; }
        if (log.category === 'Gewicht') { displayCat = currentLang === 'EN' ? 'Weight' : 'Gewicht'; unit = 'kg'; }

        // Voeg de specifieke oefening/onderdeel toe aan de titel als deze bestaat
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
                <button class="btn-delete" onclick="deleteLog(${log.id})">X</button>
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
    
    // Premium Upgrade: Kleurverloop/Gradient onder de lijn toevoegen voor diepte
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
                y: { 
                    grid: { color: '#242429' }, 
                    ticks: { color: '#8e8e93', font: { family: 'Inter', size: 10 } },
                    beginAtZero: false // FIX: Haalt de grafiek van het nulpunt af om platte lijnen te voorkomen!
                }
            }
        }
    });
}

// ================= ALGORITMISCH TRAININGSPROGRAMMA MET EXPLICIETE DAGROUTINES =================
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
    let splitName = currentLang === 'EN' ? "Full Body" : "Full Body Routine";
    let routines = [];

    // Bepalen van de specifieke dagroutines op basis van de ingevulde sportfrequentie
    if (profile.frequency === '1-2') {
        splitName = currentLang === 'EN' ? "Full Body (2x / week)" : "Full Body (2x per week)";
        routines = [
            { 
                dag: currentLang === 'EN' ? "Workout A" : "Training A", 
                spieren: currentLang === 'EN' ? "Chest, Back, Legs & Core" : "Borst, Rug, Benen & Buik", 
                oefeningen: "Squats, Bench Press, Lat Pulldowns, Planks (4 sets x 8-12 reps)" 
            },
            { 
                dag: currentLang === 'EN' ? "Workout B" : "Training B", 
                spieren: currentLang === 'EN' ? "Shoulders, Arms, Posterior Chain" : "Schouders, Armen & Achterkant Benen", 
                oefeningen: "Deadlifts, Overhead Press, Bicep Curls, Tricep Pushdowns (4 sets x 8-12 reps)" 
            }
        ];
    } else if (profile.frequency === '3-4') {
        splitName = currentLang === 'EN' ? "Upper / Lower Split (4x / week)" : "Upper / Lower Split (4x per week)";
        routines = [
            { 
                dag: currentLang === 'EN' ? "Day 1 & 3: Upper Body" : "Dag 1 & 3: Bovenlichaam", 
                spieren: currentLang === 'EN' ? "Chest, Back, Shoulders & Arms" : "Borst, Rug, Schouders & Armen", 
                oefeningen: "Bench Press, Barbell Rows, Dumbbell Shoulder Press, Pull-ups" 
            },
            { 
                dag: currentLang === 'EN' ? "Day 2 & 4: Lower Body" : "Dag 2 & 4: Onderlichaam", 
                spieren: currentLang === 'EN' ? "Quads, Hamstrings, Calves & Abs" : "Quadriceps, Hamstrings, Kuiten & Buik", 
                oefeningen: "Leg Press, Romanian Deadlifts, Calf Raises, Hanging Leg Raises" 
            }
        ];
    } else if (profile.frequency === '5+') {
        splitName = currentLang === 'EN' ? "Push / Pull / Legs Split (5-6x / week)" : "Push / Pull / Legs Split (5-6x per week)";
        routines = [
            { 
                dag: currentLang === 'EN' ? "Day 1 & 4: Push" : "Dag 1 & 4: Push (Duwen)", 
                spieren: currentLang === 'EN' ? "Chest, Shoulders & Triceps" : "Borst, Schouders & Triceps", 
                oefeningen: "Incline Dumbbell Press, Overhead Press, Lateral Raises, Cable Tricep Extensions" 
            },
            { 
                dag: currentLang === 'EN' ? "Day 2 & 5: Pull" : "Dag 2 & 5: Pull (Treken)", 
                spieren: currentLang === 'EN' ? "Back, Rear Delts & Biceps" : "Rug, Achterkant Schouders & Biceps", 
                oefeningen: "Barbell Rows, Face Pulls, Incline Bicep Curls, Hammer Curls" 
            },
            { 
                dag: currentLang === 'EN' ? "Day 3 & 6: Legs & Core" : "Dag 3 & 6: Legs (Benen & Buik)", 
                spieren: currentLang === 'EN' ? "Quads, Hamstrings & Core Stability" : "Bovenbenen, Hamstrings & Buikspieren", 
                oefeningen: "Barbell Squats, Bulgarian Split Squats, Leg Curls, Ab Wheel Rollouts" 
            }
        ];
    }

    // Fysiologische finetuning op basis van BMI en Leeftijd
    if (bmi < 18.5) {
        doel = currentLang === 'EN' ? "Hypertrophy (Mass Building)" : "Hypertrofie (Spiermassa Opbouw)";
    } else if (bmi >= 25.0) {
        doel = currentLang === 'EN' ? "Recomposition & Fat Loss" : "Recompositie & Vetverlies";
    }

    if (profile.age > 40) {
        doel += currentLang === 'EN' ? " (Recovery Oriented)" : " (Focus op Gewrichtsherstel)";
    }

    // Genereer de HTML voor de dagelijkse routineverdelingen
    let routinesHTML = '';
    routines.forEach(r => {
        routinesHTML += `
            <div class="workout-day-box">
                <div class="workout-day-header">${r.dag}</div>
                <div class="workout-day-body">${r.spieren}</div>
                <div class="workout-day-details"><b>${currentLang === 'EN' ? 'Core exercises:' : 'Basis oefeningen:'}</b> ${r.oefeningen}</div>
            </div>
        `;
    });

    container.innerHTML = `
        <div class="dashboard-card">
            <h3>${currentLang === 'EN' ? 'Custom Routine' : 'Gepersonaliseerd Trainingsprogramma'}</h3>
            <p class="subtitle">${currentLang === 'EN' ? 'Generated using real fysiometrics' : 'Gegenereerd op basis van actuele fysiometrie'}</p>
            
            <div style="margin-bottom: 14px; display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                <div>
                    <label>${currentLang === 'EN' ? 'Target Goal' : 'Doelstelling'}</label>
                    <p style="font-weight: 700; font-size: 1rem; color: var(--accent);">${doel}</p>
                </div>
                <div style="text-align: right;">
                    <label>${currentLang === 'EN' ? 'Split System' : 'Systeemsplit'}</label>
                    <p style="font-weight: 600; font-size: 1rem;">${splitName}</p>
                </div>
            </div>

            <label style="margin-bottom: 4px;">${currentLang === 'EN' ? 'Daily Split Breakdown' : 'Schema Verdeling per Dag'}</label>
            ${routinesHTML}
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