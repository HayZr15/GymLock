// ==========================================
// 1. GLOBALE VARIABELEN & DATA
// ==========================================
let logs = JSON.parse(localStorage.getItem('gymlock_logs')) || [];
let currentLang = localStorage.getItem('gymlock_lang') || 'nl';

const translations = {
    en: {
        nav_dashboard: "DASHBOARD", nav_logs: "LOGS", nav_settings: "SETTINGS",
        stat_steps: "STEPS", stat_steps_footer: "today",
        stat_calories: "CALORIES", stat_calories_footer: "kcal today",
        stat_workouts: "WORKOUTS", stat_workouts_footer: "this week",
        stat_weight: "WEIGHT", stat_weight_footer: "latest log",
        opt_weight: "📉 Weight (kg)", opt_steps: "👣 Steps", opt_calories: "🔥 Calories (kcal)",
        settings_header: "Settings", settings_engine: "Interactive SVG chart engine.",
        btn_clear: "CLEAR ALL DATA"
    },
    nl: {
        nav_dashboard: "DASHBOARD", nav_logs: "LOGS", nav_settings: "SETTINGS",
        stat_steps: "STAPPEN", stat_steps_footer: "vandaag",
        stat_calories: "CALORIEËN", stat_calories_footer: "kcal vandaag",
        stat_workouts: "WORKOUTS", stat_workouts_footer: "deze week",
        stat_weight: "GEWICHT", stat_weight_footer: "laatste log",
        opt_weight: "📉 Gewicht (kg)", opt_steps: "👣 Stappen", opt_calories: "🔥 Calorieën (kcal)",
        settings_header: "Instellingen", settings_engine: "Interactieve SVG-grafiekengine.",
        btn_clear: "ALLE DATA WISSEN"
    }
};

// ==========================================
// 2. INITIALISATIE BIJ OPSTARTEN
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    setupNavigation();
    setupLanguage();
    setupSettings();
    setupChartListener();
    
    // Eerste render van de UI
    updateLanguageUI();
    updateDashboard();
    renderLogHistory();
    toggleLogFields(); // Zet formulier in de juiste startpositie
});

// ==========================================
// 3. NAVIGATIE LOGICA
// ==========================================
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // 1. Verwijder active class van alle knoppen
            navButtons.forEach(b => b.classList.remove('active'));
            // 2. Voeg active class toe aan geklikte knop
            btn.classList.add('active');
            
            // 3. Verberg alle schermen
            const screens = ['screen-dashboard', 'screen-logs', 'screen-settings'];
            screens.forEach(id => {
                const screenEl = document.getElementById(id);
                if (screenEl) {
                    screenEl.style.display = 'none';
                    screenEl.classList.remove('active');
                }
            });
            
            // 4. Toon het geselecteerde scherm
            const targetScreenId = btn.getAttribute('data-screen');
            const targetScreen = document.getElementById(targetScreenId);
            if (targetScreen) {
                targetScreen.style.display = 'block';
                // Voor dashboard en settings de flex structuur behouden, voor logs block
                if(targetScreen.classList.contains('app-screen')) {
                    targetScreen.style.display = 'flex'; 
                }
                setTimeout(() => targetScreen.classList.add('active'), 10);
            }
        });
    });
}

// ==========================================
// 4. FORMULIER FUNCTIES (Aangeroepen in HTML)
// ==========================================
window.toggleLogFields = function() {
    const typeSelect = document.getElementById('log-type');
    const stdGroup = document.getElementById('standard-input-group');
    const woGroup = document.getElementById('workout-input-group');
    
    if (!typeSelect || !stdGroup || !woGroup) return; // Null-guard

    if (typeSelect.value === 'workout') {
        stdGroup.style.display = 'none';
        woGroup.style.display = 'block';
    } else {
        stdGroup.style.display = 'block';
        woGroup.style.display = 'none';
    }
};

window.addExerciseRow = function() {
    const container = document.getElementById('exercise-rows');
    if (!container) return; // Null-guard

    const row = document.createElement('div');
    row.className = 'exercise-row';
    row.style.marginTop = '10px';
    row.innerHTML = `
        <input type="text" class="ex-name" placeholder="Oefening (bijv. Bench Press)">
        <input type="number" class="ex-sets" placeholder="Sets">
        <input type="number" class="ex-reps" placeholder="Reps">
    `;
    container.appendChild(row);
};

window.saveLog = function() {
    const type = document.getElementById('log-type')?.value;
    
    const newLog = {
        id: Date.now(),
        date: new Date().toISOString(),
        type: type,
        value: null,
        workoutData: null
    };

    if (type === 'workout') {
        const focus = document.getElementById('workout-type')?.value;
        const rows = document.querySelectorAll('.exercise-row');
        let exercises = [];
        
        rows.forEach(row => {
            const name = row.querySelector('.ex-name').value;
            const sets = row.querySelector('.ex-sets').value;
            const reps = row.querySelector('.ex-reps').value;
            if (name) exercises.push({ name, sets, reps });
        });
        
        if (exercises.length === 0) return alert("Voeg minimaal 1 oefening toe.");
        newLog.workoutData = { focus, exercises };
    } else {
        const valInput = document.getElementById('log-value')?.value;
        if (!valInput) return alert("Vul een waarde in!");
        newLog.value = parseFloat(valInput);
    }

    // Opslaan
    logs.push(newLog);
    localStorage.setItem('gymlock_logs', JSON.stringify(logs));
    
    // UI updaten
    updateDashboard();
    renderLogHistory();
    
    // Formulier resetten
    document.getElementById('log-value').value = '';
    const container = document.getElementById('exercise-rows');
    if(container) {
        container.innerHTML = `
            <div class="exercise-row">
                <input type="text" class="ex-name" placeholder="Oefening (bijv. Bench Press)">
                <input type="number" class="ex-sets" placeholder="Sets">
                <input type="number" class="ex-reps" placeholder="Reps">
            </div>
        `;
    }
    
    alert("Log succesvol opgeslagen!");
};

// ==========================================
// 5. DATA & DASHBOARD UPDATES
// ==========================================
function updateDashboard() {
    const today = new Date().toISOString().split('T')[0];
    
    let stepsToday = 0;
    let calsToday = 0;
    let weightLatest = '--';
    let workoutsWeek = 0;

    // Simpele filter logica
    logs.forEach(log => {
        const logDate = log.date.split('T')[0];
        
        if (logDate === today) {
            if (log.type === 'stappen') stepsToday += log.value;
            if (log.type === 'calorieen') calsToday += log.value;
        }
        
        if (log.type === 'workout') {
            workoutsWeek++; // Versimpeld: telt nu alle workouts in logs
        }
    });

    // Laatste gewicht zoeken
    const weightLogs = logs.filter(l => l.type === 'gewicht').sort((a,b) => b.id - a.id);
    if (weightLogs.length > 0) weightLatest = weightLogs[0].value;

    // DOM updaten met null-guards
    if (document.getElementById('stat-steps')) document.getElementById('stat-steps').textContent = stepsToday;
    if (document.getElementById('stat-calories')) document.getElementById('stat-calories').textContent = calsToday;
    if (document.getElementById('stat-workouts')) document.getElementById('stat-workouts').textContent = workoutsWeek;
    if (document.getElementById('stat-weight')) document.getElementById('stat-weight').textContent = weightLatest;
    
    renderChart();
    updateSuggestion();
}

function renderLogHistory() {
    const list = document.getElementById('log-history-list');
    if (!list) return;

    list.innerHTML = '';
    const sortedLogs = [...logs].sort((a,b) => b.id - a.id);

    if (sortedLogs.length === 0) {
        list.innerHTML = '<p>Nog geen logs gevonden.</p>';
        return;
    }

    sortedLogs.forEach(log => {
        const d = new Date(log.date).toLocaleDateString();
        let content = '';
        let icon = '';

        if (log.type === 'stappen') { icon = '👣'; content = `${log.value} stappen`; }
        if (log.type === 'calorieen') { icon = '🔥'; content = `${log.value} kcal`; }
        if (log.type === 'gewicht') { icon = '📉'; content = `${log.value} kg`; }
        if (log.type === 'workout') { icon = '🏋️'; content = `${log.workoutData.focus} training`; }

        list.innerHTML += `
            <div style="background: #18181b; padding: 10px; margin-bottom: 8px; border-radius: 8px; border: 1px solid #27272a;">
                <span style="margin-right: 10px;">${icon}</span>
                <span style="color: #fff;">${content}</span>
                <span style="float: right; color: #71717a; font-size: 12px;">${d}</span>
            </div>
        `;
    });
}

function updateSuggestion() {
    const title = document.getElementById('suggestion-content-title');
    const text = document.getElementById('suggestion-text');
    if(title) title.textContent = "Blijf Gehydrateerd";
    if(text) text.textContent = "Je hebt deze week goed getraind! Zorg dat je voldoende water drinkt voor optimaal spierherstel.";
}

// ==========================================
// 6. GRAFIEK (SVG)
// ==========================================
function setupChartListener() {
    const select = document.getElementById('chart-metric-select');
    if(select) {
        select.addEventListener('change', renderChart);
    }
}

function renderChart() {
    const svg = document.getElementById('dynamic-svg');
    const metric = document.getElementById('chart-metric-select')?.value || 'weight';
    if (!svg) return;

    // Filter logs op basis van de dropdown ('gewicht', 'stappen', 'calorieen')
    let typeFilter = 'gewicht';
    if(metric === 'steps') typeFilter = 'stappen';
    if(metric === 'calories') typeFilter = 'calorieen';

    const data = logs.filter(l => l.type === typeFilter).sort((a,b) => a.id - b.id);
    
    // Leeg SVG
    svg.innerHTML = '';
    
    if (data.length < 2) {
        if(document.getElementById('chart-current-value')) document.getElementById('chart-current-value').textContent = '--';
        return;
    }

    // Update current value UI
    if(document.getElementById('chart-current-value')) {
        document.getElementById('chart-current-value').textContent = data[data.length-1].value;
    }

    // Simpele berekening voor SVG path (X/Y coordinaten)
    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min === 0 ? 1 : max - min;
    
    let pathD = "";
    data.forEach((point, i) => {
        const x = (i / (data.length - 1)) * 300;
        const y = 120 - (((point.value - min) / range) * 100) - 10; // padding
        
        if (i === 0) pathD += `M ${x} ${y} `;
        else pathD += `L ${x} ${y} `;
        
        // Teken een cirkel
        svg.innerHTML += `<circle cx="${x}" cy="${y}" r="4" fill="#CCFF00" />`;
    });

    svg.innerHTML = `<path d="${pathD}" fill="none" stroke="#CCFF00" stroke-width="2" />` + svg.innerHTML;
}


function setupLanguage() {
    const toggleBtn = document.getElementById('lang-toggle');
    if (!toggleBtn) return;
    
    toggleBtn.textContent = currentLang.toUpperCase();
    toggleBtn.addEventListener('click', () => {
        currentLang = currentLang === 'nl' ? 'en' : 'nl';
        localStorage.setItem('gymlock_lang', currentLang);
        toggleBtn.textContent = currentLang.toUpperCase();
        updateLanguageUI();
    });
}

function updateLanguageUI() {
    const dict = translations[currentLang];
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            el.textContent = dict[key];
        }
    });
}

function setupSettings() {
    const clearBtn = document.getElementById('clear-data-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm("Weet je zeker dat je alle data wilt wissen? Dit kan niet ongedaan worden gemaakt.")) {
                localStorage.removeItem('gymlock_logs');
                logs = [];
                updateDashboard();
                renderLogHistory();
                alert("Alle data is gewist.");
            }
        });
    }
}