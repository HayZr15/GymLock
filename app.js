// --- PWA SERVICE WORKER REGISTRATIE ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('GymLock Service Worker succesvol geregistreerd!', reg.scope))
            .catch(err => console.log('Service Worker registratie mislukt: ', err));
    });
}

// --- STATE MANAGEMENT & LOCALSTORAGE ---
let logs = JSON.parse(localStorage.getItem('gymlock_logs')) || [];
let currentLang = localStorage.getItem('gymlock_lang') || 'nl';
let editLogId = null;

// --- MULTILANGUAGE DICTIONARY (NL/EN) ---
const I18N = {
    nl: {
        lang_btn: "EN",
        sugg_tag: "SUGGESTIE VAN DE DAG",
        sugg_title: "Aanbevolen Trainingsprogramma",
        sugg_workout_name: "Bovenlichaam Kracht",
        badge_time: "45 MIN",
        badge_level: "GEMIDDELD",
        badge_type: "HYPERTROFIE",
        stat_steps: "STAPPEN",
        stat_steps_footer: "vandaag",
        stat_calories: "CALORIEËN",
        stat_calories_footer: "kcal vandaag",
        stat_workouts: "TRAININGEN",
        stat_workouts_footer: "deze week",
        stat_weight: "GEWICHT",
        stat_weight_footer: "laatste log",
        opt_weight: "📉 Gewicht (kg)",
        opt_steps: "👣 Stappen",
        opt_calories: "🔥 Calorieën (kcal)",
        label_type: "Type activiteit",
        opt_steps_log: "👣 Stappen",
        opt_calories_log: "🔥 Calorieën (kcal)",
        opt_weight_log: "📉 Lichaamsgewicht (kg)",
        opt_strength_log: "🏋️ Krachttraining (Oefening)",
        opt_cardio_log: "🏃 Cardio (Sessie)",
        label_intensity: "Intensiteit / Zwaarte",
        opt_light: "🟢 Licht (RPE 6-7 / Hersteltraining)",
        opt_medium: "🟡 Gemiddeld (RPE 8 / Normale werkset)",
        opt_heavy: "🔴 Zwaar (RPE 9-10 / Fail set of PR poging)",
        label_date: "Datum van activiteit",
        history_title: "Loggeschiedenis",
        settings_header: "Instellingen",
        settings_engine: "Interactieve SVG-grafiekengine en RPE intensiteit-ondersteuning.",
        btn_clear: "ALLE DATA WISSEN",
        nav_dashboard: "DASHBOARD",
        nav_logs: "LOGS",
        nav_settings: "INSTELLINGEN",
        
        // Dynamische JS elementen
        placeholders: { steps: "Bijv. 10000", calories: "Bijv. 2450", weight: "Bijv. 79.5", strength: "Bijv. 80", cardio: "Bijv. 45" },
        valueLabels: { steps: "Aantal stappen", calories: "Aantal verbrande / binnengekomen calorieën (kcal)", weight: "Huidig gewicht (kg)", strength: "Gewicht gebruikt (kg)", cardio: "Duur (minuten)" },
        subPlaceholders: { steps: "Bijv. Ochtendwandeling, hardlopen (optioneel)", calories: "Bijv. Ontbijt, avondeten (optioneel)", weight: "Bijv. Ochtend nuchter (optioneel)", strength: "Bijv. Bench Press, Squat", cardio: "Bijv. Hardlopen, Fietsen" },
        subLabels: { steps: "Specifieke activiteit / Context", calories: "Welke maaltijd / Context?", weight: "Meetmoment / Context", strength: "Welke oefening?", cardio: "Welke activiteit?" },
        chartTitles: { weight: "PROGRESS CHART — WEIGHT TRACKER", steps: "PROGRESS CHART — STEPS TRACKER", calories: "PROGRESS CHART — CALORIES TRACKER" },
        units: { weight: " kg", calories: " kcal", steps: " stappen", strength: " kg", cardio: " min" },
        historyEmpty: "Nog geen logs aanwezig.",
        confirmDelete: "Weet je zeker dat je deze log wilt verwijderen?",
        confirmClear: "Weet je het 100% zeker? Dit wist je volledige geschiedenis permanent.",
        clearSuccess: "Alle data is succesvol gewist.",
        addTitle: 'Add <span style="color: #CCFF00;">Log</span>',
        editTitle: 'Edit <span style="color: #CCFF00;">Log</span>',
        btnSave: "LOG OPSLAAN",
        btnEdit: "WIJZIGINGEN OPSLAAN",
        btnCancel: "ANNULEREN",
        startPoint: "Startpunt"
    },
    en: {
        lang_btn: "NL",
        sugg_tag: "SUGGESTION OF THE DAY",
        sugg_title: "Suggested Workout Program",
        sugg_workout_name: "Upper Body Strength",
        badge_time: "45 MIN",
        badge_level: "INTERMEDIATE",
        badge_type: "HYPERTROPHY",
        stat_steps: "STEPS",
        stat_steps_footer: "today",
        stat_calories: "CALORIES",
        stat_calories_footer: "kcal today",
        stat_workouts: "WORKOUTS",
        stat_workouts_footer: "this week",
        stat_weight: "WEIGHT",
        stat_weight_footer: "last log",
        opt_weight: "📉 Weight (kg)",
        opt_steps: "👣 Steps",
        opt_calories: "🔥 Calories (kcal)",
        label_type: "Activity Type",
        opt_steps_log: "👣 Steps",
        opt_calories_log: "🔥 Calories (kcal)",
        opt_weight_log: "📉 Body Weight (kg)",
        opt_strength_log: "🏋️ Strength Training (Exercise)",
        opt_cardio_log: "🏃 Cardio (Session)",
        label_intensity: "Intensity / Difficulty",
        opt_light: "🟢 Light (RPE 6-7 / Recovery)",
        opt_medium: "🟡 Medium (RPE 8 / Working Set)",
        opt_heavy: "🔴 Heavy (RPE 9-10 / Failure or PR)",
        label_date: "Activity Date",
        history_title: "Log History",
        settings_header: "Settings",
        settings_engine: "Interactive SVG chart engine and RPE intensity support.",
        btn_clear: "CLEAR ALL DATA",
        nav_dashboard: "DASHBOARD",
        nav_logs: "LOGS",
        nav_settings: "SETTINGS",
        
        // Dynamische JS elementen
        placeholders: { steps: "E.g. 10000", calories: "E.g. 2450", weight: "E.g. 79.5", strength: "E.g. 80", cardio: "E.g. 45" },
        valueLabels: { steps: "Number of steps", calories: "Calories burned / consumed (kcal)", weight: "Current weight (kg)", strength: "Weight used (kg)", cardio: "Duration (minutes)" },
        subPlaceholders: { steps: "E.g. Morning walk, running (optional)", calories: "E.g. Breakfast, dinner (optional)", weight: "E.g. Morning fasted (optional)", strength: "E.g. Bench Press, Squat", cardio: "E.g. Running, Cycling" },
        subLabels: { steps: "Specific activity / Context", calories: "Which meal / Context?", weight: "Measurement moment / Context", strength: "Which exercise?", cardio: "Which activity?" },
        chartTitles: { weight: "PROGRESS CHART — WEIGHT TRACKER", steps: "PROGRESS CHART — STEPS TRACKER", calories: "PROGRESS CHART — CALORIES TRACKER" },
        units: { weight: " kg", calories: " kcal", steps: " steps", strength: " kg", cardio: " min" },
        historyEmpty: "No logs registered yet.",
        confirmDelete: "Are you sure you want to delete this log?",
        confirmClear: "Are you 100% sure? This will wipe your entire history permanently.",
        clearSuccess: "All data successfully cleared.",
        addTitle: 'Add <span style="color: #CCFF00;">Log</span>',
        editTitle: 'Edit <span style="color: #CCFF00;">Log</span>',
        btnSave: "SAVE LOG",
        btnEdit: "SAVE CHANGES",
        btnCancel: "CANCEL",
        startPoint: "Start point"
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const dateInput = document.getElementById("log-date");
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }

    setupNavigation();
    setupLoggingForm();
    setupDynamicPlaceholders();
    setupChartToggle();
    setupSettings();
    setupLanguageToggle();
    
    // Initiële render ronde
    updateLanguageUI();
    updateDashboardStats();
    renderHistory();
    renderChart();

    if (typeof updateDynamicSuggestion === 'function') {
        updateDynamicSuggestion();
    }
});

// --- TAAL INTERFACE UPDATE ENGINE ---
function setupLanguageToggle() {
    const langBtn = document.getElementById("lang-toggle");
    langBtn.addEventListener("click", () => {
        currentLang = currentLang === 'nl' ? 'en' : 'nl';
        localStorage.setItem('gymlock_lang', currentLang);
        
        updateLanguageUI();
        setupDynamicPlaceholders(); // Ververst placeholders direct naar juiste taal
        renderHistory();            // Vertaalt eenheden in de geschiedenis direct
        renderChart();              // Vertaalt de assen en titels van de grafiek direct
    });
}

function updateLanguageUI() {
    // Loop door alle HTML elementen met data-i18n kenmerk
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (I18N[currentLang] && I18N[currentLang][key]) {
            element.textContent = I18N[currentLang][key];
        }
    });

    // Update de taal-badge/knop tekst zelf
    document.getElementById("lang-toggle").textContent = I18N[currentLang].lang_btn;
    
    // Update de formuliertitels en knoppen dynamisch op basis van add/edit mode
    const submitBtn = document.getElementById("submit-btn");
    const cancelBtn = document.getElementById("cancel-edit-btn");
    const formTitle = document.getElementById("form-title");
    
    if (editLogId !== null) {
        formTitle.innerHTML = I18N[currentLang].editTitle;
        submitBtn.textContent = I18N[currentLang].btnEdit;
    } else {
        formTitle.innerHTML = I18N[currentLang].addTitle;
        submitBtn.textContent = I18N[currentLang].btnSave;
    }
    cancelBtn.textContent = I18N[currentLang].btnCancel;
}

function setupNavigation() {
    const buttons = document.querySelectorAll(".nav-btn");
    const screens = document.querySelectorAll(".app-screen");

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            buttons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            const targetScreen = button.getAttribute("data-screen");
            screens.forEach(screen => {
                screen.classList.remove("active");
                if (screen.id === targetScreen) {
                    screen.classList.add("active");
                }
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            if (targetScreen === 'screen-dashboard') {
                renderChart();
            }
        });
    });
}

// --- DYNAMISCHE PLACEHOLDERS & INTENSITEIT LOGICA ---
function setupDynamicPlaceholders() {
    const typeSelect = document.getElementById("log-type");
    const valueInput = document.getElementById("log-value");
    const valueLabel = document.getElementById("value-label");
    
    const subGroup = document.getElementById("sub-activity-group");
    const subLabel = document.getElementById("sub-activity-label");
    const subInput = document.getElementById("log-sub-activity");
    const intensityGroup = document.getElementById("intensity-group");

    // 1. HOOFDCHECK: Als de dropdown er niet is (bijv. op het dashboard), stop direct!
    if (!typeSelect) return;

    const selectedType = typeSelect.value;
    const langData = I18N[currentLang];
    
    // 2. INDIVIDUELE CHECKS: Pas elementen alleen aan als ze écht in je HTML staan
    if (valueInput && langData.placeholders) {
        valueInput.placeholder = langData.placeholders[selectedType] || "";
    }
    if (valueLabel && langData.valueLabels) {
        valueLabel.textContent = langData.valueLabels[selectedType] || "";
    }

    if (subGroup) {
        subGroup.style.display = "flex";
    }
    if (subLabel && langData.subLabels) {
        subLabel.textContent = langData.subLabels[selectedType] || "";
    }
    if (subInput && langData.subPlaceholders) {
        subInput.placeholder = langData.subPlaceholders[selectedType] || "";
    }
    
    // 3. Veilig de intensiteit en verplichte velden schakelen
    if (selectedType === 'strength' || selectedType === 'cardio') {
        if (intensityGroup) intensityGroup.style.display = "flex";
        if (subInput) subInput.required = true;
    } else {
        if (intensityGroup) intensityGroup.style.display = "none";
        if (subInput) subInput.required = false;
    }
}

function setupChartToggle() {
    document.getElementById("chart-metric-select").addEventListener("change", () => {
        renderChart();
    });
}

// --- FORMULIERAFHANDELING ---
function setupLoggingForm() {
    const form = document.getElementById("log-form");
    const typeSelect = document.getElementById("log-type");
    const dateInput = document.getElementById("log-date");
    const valueInput = document.getElementById("log-value");
    const subInput = document.getElementById("log-sub-activity");
    const intensitySelect = document.getElementById("log-intensity");
    const cancelBtn = document.getElementById("cancel-edit-btn");

    // Alleen luisteren naar veranderingen als de dropdown bestaat
    if (typeSelect) {
        typeSelect.addEventListener("change", setupDynamicPlaceholders);
    }

    // Alleen het formulier afhandelen als het formulier op dit scherm bestaat
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const type = typeSelect ? typeSelect.value : 'stappen';
            const date = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];
            
            // Als valueInput bestaat gebruiken we de waarde, anders 0 (bijv. bij een workout)
            let value = (valueInput && valueInput.value) ? parseFloat(valueInput.value) : 0;
            const subActivity = subInput ? subInput.value.trim() : '';

            // Roep je opslagfunctie aan
            saveLog();
        });
    }

    // Alleen de annuleerknop activeren als die er daadwerkelijk is
    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
            if (typeof resetForm === 'function') resetForm();
        });
    }
}

// --- DASHBOARD WIDGET BEREKENINGEN ---
function updateDashboardStats() {
    const todayStr = new Date().toISOString().split('T')[0];
    const langData = I18N[currentLang];

    // 1. Steps vandaag
    const todaySteps = logs
        .filter(l => l.type === 'steps' && l.date === todayStr)
        .reduce((sum, l) => sum + l.value, 0);
    document.getElementById("stat-steps").textContent = todaySteps > 0 ? todaySteps.toLocaleString(currentLang === 'nl' ? 'nl-NL' : 'en-US') : "0";

    // 2. Calories vandaag
    const todayCalories = logs
        .filter(l => l.type === 'calories' && l.date === todayStr)
        .reduce((sum, l) => sum + l.value, 0);
    document.getElementById("stat-calories").textContent = todayCalories > 0 ? todayCalories.toLocaleString(currentLang === 'nl' ? 'nl-NL' : 'en-US') : "0";

    // 3. Workouts deze week
    const now = new Date();
    const currentDay = now.getDay();
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);
    monday.setHours(0,0,0,0);

    const weekWorkouts = logs.filter(l => {
        if (l.type !== 'strength' && l.type !== 'cardio') return false;
        const logDate = new Date(l.date);
        return logDate >= monday;
    }).length;
    document.getElementById("stat-workouts").textContent = weekWorkouts;

    // 4. Weight laatste log
    const weightLogs = logs.filter(l => l.type === 'weight');
    if (weightLogs.length > 0) {
        weightLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
        document.getElementById("stat-weight").textContent = weightLogs[0].value + " kg";
    } else {
        document.getElementById("stat-weight").textContent = "--";
    }
}

// --- INTERACTIEVE SVG GRAFIEK ENGINE ---
function renderChart() {
    const metric = document.getElementById("chart-metric-select").value;
    const svg = document.getElementById("dynamic-svg");
    const tooltip = document.getElementById("chart-tooltip");
    const langData = I18N[currentLang];
    
    svg.innerHTML = "";
    
    let chartLogs = logs.filter(l => l.type === metric);
    chartLogs.sort((a, b) => new Date(a.date) - new Date(b.date));

    document.getElementById("chart-title-text").textContent = langData.chartTitles[metric];

    if (chartLogs.length === 0) {
        svg.innerHTML = `<text x="150" y="65" fill="#434347" font-size="11" font-weight="600" text-anchor="middle">Geen data / No data found.</text>`;
        document.getElementById("chart-current-value").textContent = "--";
        document.getElementById("chart-diff-value").textContent = "";
        return;
    }

    const latestLog = chartLogs[chartLogs.length - 1];
    const firstLog = chartLogs[0];
    const unit = langData.units[metric];
    const numLocale = currentLang === 'nl' ? 'nl-NL' : 'en-US';
    
    document.getElementById("chart-current-value").textContent = latestLog.value.toLocaleString(numLocale) + unit;
    
    if (chartLogs.length > 1) {
        const diff = latestLog.value - firstLog.value;
        const sign = diff >= 0 ? "+" : "";
        document.getElementById("chart-diff-value").textContent = `${sign}${diff.toLocaleString(numLocale)}${unit}`;
        document.getElementById("chart-diff-value").style.color = (diff <= 0 && metric === 'weight') || (diff >= 0 && metric !== 'weight') ? '#CCFF00' : '#71717A';
    } else {
        document.getElementById("chart-diff-value").textContent = langData.startPoint;
        document.getElementById("chart-diff-value").style.color = "#71717A";
    }

    // Viewbox schaling berekeningen (300x120)
    const paddingLeft = 45, paddingRight = 20, paddingTop = 15, paddingBottom = 20;
    const width = 300 - paddingLeft - paddingRight;
    const height = 120 - paddingTop - paddingBottom;

    const values = chartLogs.map(l => l.value);
    let minY = Math.min(...values);
    let maxY = Math.max(...values);
    if (minY === maxY) { minY -= 5; maxY += 5; }
    const yMargin = (maxY - minY) * 0.15;
    minY -= yMargin; maxY += yMargin;

    const times = chartLogs.map(l => new Date(l.date).getTime());
    let minX = Math.min(...times);
    let maxX = Math.max(...times);
    if (minX === maxX) { minX -= 86400000; maxX += 86400000; }

    const points = chartLogs.map(log => {
        const xTime = new Date(log.date).getTime();
        const x = paddingLeft + ((xTime - minX) / (maxX - minX)) * width;
        const y = paddingTop + height - ((log.value - minY) / (maxY - minY)) * height;
        return { x, y, log };
    });

    // Teken Y-as Grid
    const axisLabels = [maxY, (maxY + minY) / 2, minY];
    const axisYPos = [paddingTop, paddingTop + height / 2, paddingTop + height];
    axisLabels.forEach((label, i) => {
        const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
        txt.setAttribute("x", "5");
        txt.setAttribute("y", axisYPos[i] + 3);
        txt.setAttribute("class", "axis-text");
        txt.textContent = Math.round(label).toLocaleString(numLocale);
        svg.appendChild(txt);
    });

    // Teken Grafieklijn
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) { d += ` L ${points[i].x} ${points[i].y}`; }
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#CCFF00");
    path.setAttribute("stroke-width", "2.5");
    path.setAttribute("stroke-linecap", "round");
    svg.appendChild(path);

    // Teken Data-stipjes + Figma Tooltip logica
    points.forEach(pt => {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", pt.x);
        circle.setAttribute("cy", pt.y);
        circle.setAttribute("r", "3.5");
        circle.setAttribute("fill", "#CCFF00");

        circle.addEventListener("mouseover", () => {
            const dateObj = new Date(pt.log.date);
            const formattedDate = dateObj.toLocaleDateString(currentLang === 'nl' ? 'nl-NL' : 'en-US', { day: 'numeric', month: 'short' });
            const contextText = pt.log.subActivity ? `<br><span style="color:#71717A; font-size:10px;">${pt.log.subActivity}</span>` : "";

            tooltip.innerHTML = `<strong>${pt.log.value.toLocaleString(numLocale)} ${unit}</strong><br><span style="color:#A1A1AA; font-size:10px;">${formattedDate}</span>${contextText}`;
            tooltip.style.display = "block";

            const containerRect = svg.parentElement.getBoundingClientRect();
            const circleRect = circle.getBoundingClientRect();
            tooltip.style.left = `${circleRect.left - containerRect.left + (circleRect.width / 2)}px`;
            tooltip.style.top = `${circleRect.top - containerRect.top}px`;
        });

        circle.addEventListener("mouseout", () => { tooltip.style.display = "none"; });
        svg.appendChild(circle);
    });
}

// --- HISTORY LOG CONSOLE RENDERING ---
function renderHistory() {
    const container = document.getElementById("history-container");
    const langData = I18N[currentLang];
    container.innerHTML = "";

    if (logs.length === 0) {
        container.innerHTML = `<p style="color: #434347; text-align: center; padding: 20px; font-size: 13px;">${langData.historyEmpty}</p>`;
        return;
    }

    const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id);
    const numLocale = currentLang === 'nl' ? 'nl-NL' : 'en-US';

    sortedLogs.forEach(log => {
        const card = document.createElement("div");
        card.className = "history-card";
        
        let displayType = log.type.toUpperCase();
        let displayUnit = langData.units[log.type] || "";
        
        let intensityBadge = "";
        if (log.intensity === "light") intensityBadge = " 🟢";
        if (log.intensity === "medium") intensityBadge = " 🟡";
        if (log.intensity === "heavy") intensityBadge = " 🔴";

        const extraContextText = log.subActivity ? ` <span style="color: #71717A; font-size: 12px; font-weight:400;">(${log.subActivity}${intensityBadge})</span>` : "";
        
        if (log.type === "steps") displayType = (currentLang === 'nl' ? "👣 STAPPEN" : "👣 STEPS") + extraContextText;
        if (log.type === "calories") displayType = (currentLang === 'nl' ? "🔥 CALORIEËN" : "🔥 CALORIES") + extraContextText;
        if (log.type === "weight") displayType = (currentLang === 'nl' ? "📉 GEWICHT" : "📉 WEIGHT") + extraContextText;
        if (log.type === "strength") displayType = `🏋️ ${log.subActivity.toUpperCase()}${intensityBadge}`;
        if (log.type === "cardio") displayType = `🏃 ${log.subActivity.toUpperCase()}${intensityBadge}`;

        const dateObj = new Date(log.date);
        const formattedDate = dateObj.toLocaleDateString(numLocale, { day: 'numeric', month: 'short', year: 'numeric' });

        card.innerHTML = `
            <div class="history-info">
                <strong style="font-size: 14px; display: flex; align-items: center; gap: 6px;">${displayType}</strong>
                <span class="history-date">${formattedDate}</span>
            </div>
            <div class="history-actions">
                <span style="color: #CCFF00; font-weight: 700; font-size: 16px; margin-right: 12px;">${log.value.toLocaleString(numLocale)}${displayUnit}</span>
                <button class="action-btn edit" onclick="editLog('${log.id}')">✏️</button>
                <button class="action-btn delete" onclick="deleteLog('${log.id}')">🗑️</button>
            </div>
        `;
        container.appendChild(card);
    });
}

window.deleteLog = function(id) {
    if (confirm(I18N[currentLang].confirmDelete)) {
        logs = logs.filter(log => log.id !== id);
        if (editLogId === id) {
            editLogId = null;
            document.getElementById("log-form").reset();
            document.getElementById("log-type").disabled = false;
        }
        saveToLocalStorage();
        updateLanguageUI();
        updateDashboardStats();
        renderHistory();
        renderChart();
    }
};

window.editLog = function(id) {
    const logToEdit = logs.find(log => log.id === id);
    if (!logToEdit) return;

    editLogId = id;

    document.getElementById("log-type").value = logToEdit.type;
    document.getElementById("log-date").value = logToEdit.date;
    document.getElementById("log-value").value = logToEdit.value;
    document.getElementById("log-sub-activity").value = logToEdit.subActivity || "";
    if (logToEdit.intensity) {
        document.getElementById("log-intensity").value = logToEdit.intensity;
    }

    document.getElementById("log-type").disabled = true;
    
    updateLanguageUI();
    setupDynamicPlaceholders();
    
    document.querySelector('[data-screen="screen-logs"]').click();
};

function setupSettings() {
    document.getElementById("clear-data-btn").addEventListener("click", () => {
        if (confirm(I18N[currentLang].confirmClear)) {
            logs = [];
            saveToLocalStorage();
            updateDashboardStats();
            renderHistory();
            renderChart();
            alert(I18N[currentLang].clearSuccess);
        }
    });
}

function saveToLocalStorage() {
    localStorage.setItem('gymlock_logs', JSON.stringify(logs));
}

// --- 1. SCHERM LOGICA VOOR WORKOUT VELDEN ---
function toggleLogFields() {
    const logType = document.getElementById('log-type').value;
    const standardGroup = document.getElementById('standard-input-group');
    const workoutGroup = document.getElementById('workout-input-group');

    if (logType === 'workout') {
        standardGroup.style.display = 'none';
        workoutGroup.style.display = 'flex';
    } else {
        standardGroup.style.display = 'block';
        workoutGroup.style.display = 'none';
    }
}

function addExerciseRow() {
    const container = document.getElementById('exercise-rows');
    const newRow = document.createElement('div');
    newRow.className = 'exercise-row';
    newRow.innerHTML = `
        <input type="text" class="ex-name" placeholder="Oefening">
        <input type="number" class="ex-sets" placeholder="Sets">
        <input type="number" class="ex-reps" placeholder="Reps">
    `;
    container.appendChild(newRow);
}

// --- 2. DE LOGS OPSLAAN (INCLUSIEF WORKOUTS) ---
function saveLog() {
    const logType = document.getElementById('log-type').value;
    const today = new Date().toISOString().split('T')[0]; // Formaat: YYYY-MM-DD
    
    // Haal bestaande logs op uit localStorage
    let logs = JSON.parse(localStorage.getItem('gymlock_logs')) || [];
    let logEntry = { date: today, type: logType };

    if (logType === 'workout') {
        const workoutType = document.getElementById('workout-type').value;
        const rows = document.querySelectorAll('.exercise-row');
        let exercises = [];

        rows.forEach(row => {
            const name = row.querySelector('.ex-name').value;
            const sets = row.querySelector('.ex-sets').value;
            const reps = row.querySelector('.ex-reps').value;
            if (name && sets && reps) {
                exercises.push({ name, sets, reps });
            }
        });

        if (exercises.length === 0) {
            alert('Voer tenminste één geldige oefening in!');
            return;
        }

        logEntry.workoutType = workoutType;
        logEntry.exercises = exercises;
    } else {
        const val = document.getElementById('log-value').value;
        if (!val) {
            alert('Vul een waarde in!');
            return;
        }
        logEntry.value = Number(val);
    }

    logs.push(logEntry);
    localStorage.setItem('gymlock_logs', JSON.setItem ? JSON.stringify(logs) : JSON.stringify(logs));
    
    alert('Succesvol opgeslagen!');
    
    // Reset invoervelden
    if(document.getElementById('log-value')) document.getElementById('log-value').value = '';
    document.getElementById('exercise-rows').innerHTML = `
        <div class="exercise-row">
            <input type="text" class="ex-name" placeholder="Oefening (bijv. Bench Press)">
            <input type="number" class="ex-sets" placeholder="Sets">
            <input type="number" class="ex-reps" placeholder="Reps">
        </div>
    `;

    // Update direct het dashboard en de suggesties
    initDashboard();
}

function updateDynamicSuggestion() {
    const logs = JSON.parse(localStorage.getItem('gymlock_logs')) || [];
    
    // Haal de datum van vandaag op in lokale tijd (YYYY-MM-DD)
    const tzOffset = (new Date()).getTimezoneOffset() * 60000;
    const today = (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];

    // Haal alle DOM elementen veilig op
    const titleEl = document.getElementById('suggestion-title');
    const contentTitleEl = document.getElementById('suggestion-content-title');
    const textEl = document.getElementById('suggestion-text');
    const tagsEl = document.getElementById('suggestion-tags');

    // CRUCIALE FIX: Als de elementen niet op het huidige scherm staan, stop gerust zonder te crashen!
    if (!titleEl || !textEl || !tagsEl || !contentTitleEl) return;

    // A. BEREKEN STAPPEN VAN VANDAAG
    const todaySteps = logs
        .filter(log => log.type === 'stappen' && log.date === today)
        .reduce((sum, log) => sum + log.value, 0);

    // CONTROLEER STAPPEN-DOEL (10.000 stappen)
    if (todaySteps < 10000) {
        const overig = 10000 - todaySteps;
        titleEl.innerText = "Dagelijkse Activiteit";
        contentTitleEl.innerText = "👣 Stappen Doel Behalen";
        textEl.innerText = `Je hebt vandaag ${todaySteps.toLocaleString()} stappen gezet. Loop nog ${overig.toLocaleString()} stappen om je dagelijkse doel te behalen!`;
        tagsEl.innerHTML = `<span class="suggestion-tag">Cardio</span><span class="suggestion-tag">Gezondheid</span><span class="suggestion-tag">Vandaag</span>`;
        return; 
    }

    // B. CONTROLEER WORKOUTS VAN DEZE WEEK
    const recentWorkouts = logs.filter(log => log.type === 'workout');
    const heeftBorstGedaan = recentWorkouts.some(w => w.workoutType === 'Borst');
    const heeftRugGedaan = recentWorkouts.some(w => w.workoutType === 'Rug');
    const heeftBenenGedaan = recentWorkouts.some(w => w.workoutType === 'Benen');

    if (heeftBorstGedaan && !heeftRugGedaan) {
        titleEl.innerText = "Aanbevolen Trainingsprogramma";
        contentTitleEl.innerText = "🏋️ Rug & Achterkant Schouders (Back Day)";
        textEl.innerText = "Je hebt deze week je borst al aangepakt, maar je rug nog niet. Focus vandaag op Rows, Pull-ups en Lat Pulldowns voor een gebalanceerde groei.";
        tagsEl.innerHTML = `<span class="suggestion-tag">Rug</span><span class="suggestion-tag">Hypertrofie</span><span class="suggestion-tag">Kracht</span>`;
    } else if (heeftRugGedaan && !heeftBenenGedaan) {
        titleEl.innerText = "Aanbevolen Trainingsprogramma";
        contentTitleEl.innerText = "🍗 Sla Leg Day Niet Over!";
        textEl.innerText = "Je bovenlichaam heeft deze week vuur gehad. Vandaag is het tijd voor Squats, Leg Presses en Lunges. Bouw die basis op!";
        tagsEl.innerHTML = `<span class="suggestion-tag">Benen</span><span class="suggestion-tag">Kracht</span><span class="suggestion-tag">Focus</span>`;
    } else {
        // Standaard suggestie
        titleEl.innerText = "Aanbevolen Trainingsprogramma";
        contentTitleEl.innerText = "💪 Bovenlichaam Kracht";
        textEl.innerText = "Geen dringende tekorten deze week! Aanbevolen basistraining: Bench Press - Pull-ups - OHP - Rows — 4×8";
        tagsEl.innerHTML = `<span class="suggestion-tag">45 Min</span><span class="suggestion-tag">Gemiddeld</span><span class="suggestion-tag">Hypertrofie</span>`;
    }
}