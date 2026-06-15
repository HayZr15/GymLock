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

// --- INITIALISATIE ---
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
    updateDynamicSuggestion();
});

// --- TAAL INTERFACE UPDATE ENGINE ---
function setupLanguageToggle() {
    const langBtn = document.getElementById("lang-toggle");
    if (!langBtn) return;
    
    langBtn.addEventListener("click", () => {
        currentLang = currentLang === 'nl' ? 'en' : 'nl';
        localStorage.setItem('gymlock_lang', currentLang);
        
        updateLanguageUI();
        setupDynamicPlaceholders();
        renderHistory();
        renderChart();
    });
}

function updateLanguageUI() {
    // 1. Veilige update voor alle algemene i18n data attributen
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (I18N[currentLang] && I18N[currentLang][key]) {
            element.textContent = I18N[currentLang][key];
        }
    });

    // 2. Veilige checks voor specifieke knoppen en titels op de pagina
    const langBtn = document.getElementById("lang-toggle");
    if (langBtn) langBtn.textContent = I18N[currentLang].lang_btn;
    
    const submitBtn = document.getElementById("submit-btn");
    const cancelBtn = document.getElementById("cancel-edit-btn");
    const formTitle = document.getElementById("form-title");
    
    if (formTitle) {
        formTitle.innerHTML = editLogId !== null ? I18N[currentLang].editTitle : I18N[currentLang].addTitle;
    }
    if (submitBtn) {
        submitBtn.textContent = editLogId !== null ? I18N[currentLang].btnEdit : I18N[currentLang].btnSave;
    }
    if (cancelBtn) {
        cancelBtn.textContent = I18N[currentLang].btnCancel;
    }
}

// --- NAVIGATIE ---
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

    if (!typeSelect) return; // Veilige stop

    const selectedType = typeSelect.value;
    const langData = I18N[currentLang];
    
    if (valueInput && langData.placeholders) valueInput.placeholder = langData.placeholders[selectedType] || "";
    if (valueLabel && langData.valueLabels) valueLabel.textContent = langData.valueLabels[selectedType] || "";

    if (subGroup) subGroup.style.display = "flex";
    if (subLabel && langData.subLabels) subLabel.textContent = langData.subLabels[selectedType] || "";
    if (subInput && langData.subPlaceholders) subInput.placeholder = langData.subPlaceholders[selectedType] || "";
    
    if (selectedType === 'strength' || selectedType === 'cardio') {
        if (intensityGroup) intensityGroup.style.display = "flex";
        if (subInput) subInput.required = true;
    } else {
        if (intensityGroup) intensityGroup.style.display = "none";
        if (subInput) subInput.required = false;
    }
}

function setupChartToggle() {
    const metricSelect = document.getElementById("chart-metric-select");
    if (metricSelect) {
        metricSelect.addEventListener("change", renderChart);
    }
}

// --- FORMULIERAFHANDELING (VEILIG & GECONSOLIDEERD) ---
function setupLoggingForm() {
    const form = document.getElementById("log-form");
    const typeSelect = document.getElementById("log-type");
    const cancelBtn = document.getElementById("cancel-edit-btn");

    if (typeSelect) {
        typeSelect.addEventListener("change", setupDynamicPlaceholders);
    }

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            saveLog();
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener("click", resetForm);
    }
}

function saveLog() {
    const typeSelect = document.getElementById('log-type');
    const dateInput = document.getElementById('log-date');
    const valueInput = document.getElementById('log-value');
    const subInput = document.getElementById('log-sub-activity');
    const intensityInput = document.getElementById('log-intensity');

    if (!typeSelect || !dateInput || !valueInput) return;

    const logType = typeSelect.value;
    const date = dateInput.value || new Date().toISOString().split('T')[0];
    const value = parseFloat(valueInput.value);
    
    if (isNaN(value)) {
        alert('Vul een geldige waarde in!');
        return;
    }

    const newLog = {
        id: editLogId ? editLogId : Date.now().toString(),
        type: logType,
        date: date,
        value: value,
        subActivity: subInput ? subInput.value.trim() : "",
        intensity: intensityInput ? intensityInput.value : ""
    };

    if (editLogId) {
        logs = logs.map(l => l.id === editLogId ? newLog : l);
        editLogId = null;
        if (typeSelect) typeSelect.disabled = false;
    } else {
        logs.push(newLog);
    }

    saveToLocalStorage();
    resetForm();
    alert('Log succesvol opgeslagen!');

    // Update alles
    updateLanguageUI();
    updateDashboardStats();
    renderHistory();
    renderChart();
    updateDynamicSuggestion();
    
    // Terug naar dashboard of logs
    const logsTab = document.querySelector('[data-screen="screen-logs"]');
    if (logsTab) logsTab.click();
}

function resetForm() {
    const form = document.getElementById("log-form");
    if (form) form.reset();
    
    const typeSelect = document.getElementById("log-type");
    if (typeSelect) typeSelect.disabled = false;
    
    editLogId = null;
    const dateInput = document.getElementById("log-date");
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    
    updateLanguageUI();
    setupDynamicPlaceholders();
}

// --- DATA BEHEER ---
function saveToLocalStorage() {
    localStorage.setItem('gymlock_logs', JSON.stringify(logs));
}

function setupSettings() {
    const clearBtn = document.getElementById("clear-data-btn");
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            if (confirm(I18N[currentLang].confirmClear)) {
                logs = [];
                saveToLocalStorage();
                alert(I18N[currentLang].clearSuccess);
                window.location.reload(); // Herstart de app voor een 100% schone lei
            }
        });
    }
}

// --- BEREKENINGEN & SUGGESTIES ---
function updateDashboardStats() {
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Steps vandaag
    const todaySteps = logs
        .filter(l => (l.type === 'steps' || l.type === 'stappen') && l.date === todayStr)
        .reduce((sum, l) => sum + l.value, 0);
    const stepEl = document.getElementById("stat-steps");
    if (stepEl) stepEl.textContent = todaySteps > 0 ? todaySteps.toLocaleString(currentLang === 'nl' ? 'nl-NL' : 'en-US') : "0";

    // 2. Calories vandaag
    const todayCalories = logs
        .filter(l => l.type === 'calories' && l.date === todayStr)
        .reduce((sum, l) => sum + l.value, 0);
    const calEl = document.getElementById("stat-calories");
    if (calEl) calEl.textContent = todayCalories > 0 ? todayCalories.toLocaleString(currentLang === 'nl' ? 'nl-NL' : 'en-US') : "0";

    // 3. Workouts deze week
    const now = new Date();
    const currentDay = now.getDay();
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);
    monday.setHours(0,0,0,0);

    const weekWorkouts = logs.filter(l => {
        if (l.type !== 'strength' && l.type !== 'cardio' && l.type !== 'workout') return false;
        return new Date(l.date) >= monday;
    }).length;
    
    const workoutEl = document.getElementById("stat-workouts");
    if (workoutEl) workoutEl.textContent = weekWorkouts;

    // 4. Weight laatste log
    const weightLogs = logs.filter(l => l.type === 'weight');
    const weightEl = document.getElementById("stat-weight");
    if (weightEl) {
        if (weightLogs.length > 0) {
            weightLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
            weightEl.textContent = weightLogs[0].value + " kg";
        } else {
            weightEl.textContent = "--";
        }
    }
}

function updateDynamicSuggestion() {
    const tzOffset = (new Date()).getTimezoneOffset() * 60000;
    const today = (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];

    const titleEl = document.getElementById('suggestion-title');
    const contentTitleEl = document.getElementById('suggestion-content-title');
    const textEl = document.getElementById('suggestion-text');
    const tagsEl = document.getElementById('suggestion-tags');

    // Als we niet op het dashboard staan (of HTML is niet klaar), stop veilig!
    if (!titleEl || !textEl || !tagsEl || !contentTitleEl) return;

    // A. BEREKEN STAPPEN VAN VANDAAG
    const todaySteps = logs
        .filter(log => (log.type === 'steps' || log.type === 'stappen') && log.date === today)
        .reduce((sum, log) => sum + log.value, 0);

    // CONTROLEER STAPPEN-DOEL
    if (todaySteps < 10000) {
        const overig = 10000 - todaySteps;
        titleEl.innerText = "Dagelijkse Activiteit";
        contentTitleEl.innerText = "👣 Stappen Doel Behalen";
        textEl.innerText = `Je hebt vandaag ${todaySteps.toLocaleString()} stappen gezet. Loop nog ${overig.toLocaleString()} stappen om je dagelijkse doel te behalen!`;
        tagsEl.innerHTML = `<span class="suggestion-tag">Cardio</span><span class="suggestion-tag">Gezondheid</span><span class="suggestion-tag">Vandaag</span>`;
        return; 
    }

    // B. CONTROLEER WORKOUTS VAN DEZE WEEK
    const strengthWorkouts = logs.filter(log => log.type === 'strength' || log.type === 'workout');
    const heeftBorstGedaan = strengthWorkouts.some(w => w.subActivity && w.subActivity.toLowerCase().includes('borst') || w.subActivity.toLowerCase().includes('bench'));
    const heeftRugGedaan = strengthWorkouts.some(w => w.subActivity && w.subActivity.toLowerCase().includes('rug') || w.subActivity.toLowerCase().includes('pull'));
    const heeftBenenGedaan = strengthWorkouts.some(w => w.subActivity && w.subActivity.toLowerCase().includes('been') || w.subActivity.toLowerCase().includes('squat'));

    if (heeftBorstGedaan && !heeftRugGedaan) {
        titleEl.innerText = "Aanbevolen Trainingsprogramma";
        contentTitleEl.innerText = "🏋️ Rug & Achterkant Schouders";
        textEl.innerText = "Je hebt deze week je borst al aangepakt. Focus vandaag op Rows, Pull-ups en Lat Pulldowns voor een gebalanceerde groei.";
        tagsEl.innerHTML = `<span class="suggestion-tag">Rug</span><span class="suggestion-tag">Hypertrofie</span><span class="suggestion-tag">Kracht</span>`;
    } else if (heeftRugGedaan && !heeftBenenGedaan) {
        titleEl.innerText = "Aanbevolen Trainingsprogramma";
        contentTitleEl.innerText = "🍗 Sla Leg Day Niet Over!";
        textEl.innerText = "Je bovenlichaam heeft deze week vuur gehad. Vandaag is het tijd voor Squats, Leg Presses en Lunges. Bouw die basis op!";
        tagsEl.innerHTML = `<span class="suggestion-tag">Benen</span><span class="suggestion-tag">Kracht</span><span class="suggestion-tag">Focus</span>`;
    } else {
        titleEl.innerText = "Aanbevolen Trainingsprogramma";
        contentTitleEl.innerText = "💪 Bovenlichaam Kracht";
        textEl.innerText = "Geen dringende tekorten! Aanbevolen basistraining: Bench Press - Pull-ups - OHP - Rows — 4×8";
        tagsEl.innerHTML = `<span class="suggestion-tag">45 Min</span><span class="suggestion-tag">Gemiddeld</span><span class="suggestion-tag">Hypertrofie</span>`;
    }
}

// --- GRAFIEK & GESCHIEDENIS RENDERING ---
function renderChart() {
    const metricSelect = document.getElementById("chart-metric-select");
    const svg = document.getElementById("dynamic-svg");
    const tooltip = document.getElementById("chart-tooltip");
    
    if (!metricSelect || !svg) return; // Veilige check
    
    const metric = metricSelect.value;
    const langData = I18N[currentLang];
    
    svg.innerHTML = "";
    
    let chartLogs = logs.filter(l => l.type === metric || (metric === 'steps' && l.type === 'stappen'));
    chartLogs.sort((a, b) => new Date(a.date) - new Date(b.date));

    const titleText = document.getElementById("chart-title-text");
    if (titleText && langData.chartTitles[metric]) titleText.textContent = langData.chartTitles[metric];

    const currentValEl = document.getElementById("chart-current-value");
    const diffValEl = document.getElementById("chart-diff-value");

    if (chartLogs.length === 0) {
        svg.innerHTML = `<text x="150" y="65" fill="#434347" font-size="11" font-weight="600" text-anchor="middle">Geen data / No data found.</text>`;
        if (currentValEl) currentValEl.textContent = "--";
        if (diffValEl) diffValEl.textContent = "";
        return;
    }

    const latestLog = chartLogs[chartLogs.length - 1];
    const firstLog = chartLogs[0];
    const unit = langData.units[metric] || "";
    const numLocale = currentLang === 'nl' ? 'nl-NL' : 'en-US';
    
    if (currentValEl) currentValEl.textContent = latestLog.value.toLocaleString(numLocale) + unit;
    
    if (chartLogs.length > 1) {
        const diff = latestLog.value - firstLog.value;
        const sign = diff >= 0 ? "+" : "";
        if (diffValEl) {
            diffValEl.textContent = `${sign}${diff.toLocaleString(numLocale)}${unit}`;
            diffValEl.style.color = (diff <= 0 && metric === 'weight') || (diff >= 0 && metric !== 'weight') ? '#CCFF00' : '#71717A';
        }
    } else {
        if (diffValEl) {
            diffValEl.textContent = langData.startPoint;
            diffValEl.style.color = "#71717A";
        }
    }

    // Viewbox schaling
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

    // Teken Y-as
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

    // Teken Lijn
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) { d += ` L ${points[i].x} ${points[i].y}`; }
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#CCFF00");
    path.setAttribute("stroke-width", "2.5");
    path.setAttribute("stroke-linecap", "round");
    svg.appendChild(path);

    // Teken Stipjes + Tooltips
    points.forEach(pt => {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", pt.x);
        circle.setAttribute("cy", pt.y);
        circle.setAttribute("r", "3.5");
        circle.setAttribute("fill", "#CCFF00");

        if (tooltip) {
            circle.addEventListener("mouseover", () => {
                const dateObj = new Date(pt.log.date);
                const formattedDate = dateObj.toLocaleDateString(numLocale, { day: 'numeric', month: 'short' });
                const contextText = pt.log.subActivity ? `<br><span style="color:#71717A; font-size:10px;">${pt.log.subActivity}</span>` : "";

                tooltip.innerHTML = `<strong>${pt.log.value.toLocaleString(numLocale)} ${unit}</strong><br><span style="color:#A1A1AA; font-size:10px;">${formattedDate}</span>${contextText}`;
                tooltip.style.display = "block";

                const containerRect = svg.parentElement.getBoundingClientRect();
                const circleRect = circle.getBoundingClientRect();
                tooltip.style.left = `${circleRect.left - containerRect.left + (circleRect.width / 2)}px`;
                tooltip.style.top = `${circleRect.top - containerRect.top}px`;
            });

            circle.addEventListener("mouseout", () => { tooltip.style.display = "none"; });
        }
        svg.appendChild(circle);
    });
}

function renderHistory() {
    const container = document.getElementById("history-container");
    if (!container) return; // Veilige stop

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
        
        if (log.type === "steps" || log.type === "stappen") displayType = (currentLang === 'nl' ? "👣 STAPPEN" : "👣 STEPS") + extraContextText;
        if (log.type === "calories") displayType = (currentLang === 'nl' ? "🔥 CALORIEËN" : "🔥 CALORIES") + extraContextText;
        if (log.type === "weight") displayType = (currentLang === 'nl' ? "📉 GEWICHT" : "📉 WEIGHT") + extraContextText;
        if (log.type === "strength") displayType = `🏋️ ${log.subActivity ? log.subActivity.toUpperCase() : "KRACHT"}${intensityBadge}`;
        if (log.type === "cardio") displayType = `🏃 ${log.subActivity ? log.subActivity.toUpperCase() : "CARDIO"}${intensityBadge}`;

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

// GLOBALE FUNCTIES VOOR INLINE ONCLICK (EDIT/DELETE)
window.deleteLog = function(id) {
    if (confirm(I18N[currentLang].confirmDelete)) {
        logs = logs.filter(log => log.id !== id);
        if (editLogId === id) resetForm();
        
        saveToLocalStorage();
        updateLanguageUI();
        updateDashboardStats();
        renderHistory();
        renderChart();
        updateDynamicSuggestion();
    }
};

window.editLog = function(id) {
    const logToEdit = logs.find(log => log.id === id);
    if (!logToEdit) return;

    editLogId = id;

    document.getElementById("log-type").value = logToEdit.type;
    document.getElementById("log-date").value = logToEdit.date;
    document.getElementById("log-value").value = logToEdit.value;
    
    const subActivityInput = document.getElementById("log-sub-activity");
    if (subActivityInput) subActivityInput.value = logToEdit.subActivity || "";
    
    const intensityInput = document.getElementById("log-intensity");
    if (intensityInput && logToEdit.intensity) intensityInput.value = logToEdit.intensity;

    document.getElementById("log-type").disabled = true;
    
    updateLanguageUI();
    setupDynamicPlaceholders();
    
    const addLogScreen = document.querySelector('[data-screen="screen-add"]');
    if (addLogScreen) addLogScreen.click();
};