// --- STATE MANAGEMENT & LOCALSTORAGE ---
let logs = JSON.parse(localStorage.getItem('gymlock_logs')) || [];
let editLogId = null;

// Dynamische data voor het HOOFDVELD
const placeholders = {
    steps: "Bijv. 10000",
    calories: "Bijv. 2450",
    weight: "Bijv. 79.5",
    strength: "Bijv. 80",
    cardio: "Bijv. 45"
};

const valueLabels = {
    steps: "Aantal stappen",
    calories: "Aantal verbrande / binnengekomen calorieën (kcal)",
    weight: "Huidig gewicht (kg)",
    strength: "Gewicht gebruikt (kg)",
    cardio: "Duur (minuten)"
};

// Dynamische data voor het SUB-VELD
const subPlaceholders = {
    steps: "Bijv. Ochtendwandeling, hardlopen, werk (optioneel)",
    calories: "Bijv. Ontbijt, pre-workout snack, avondeten (optioneel)",
    weight: "Bijv. Ochtend nuchter, avond (na eten) (optioneel)",
    strength: "Bijv. Bench Press, Squat, Shoulder Press",
    cardio: "Bijv. Hardlopen, Fietsen, Roeitrainer"
};

const subLabels = {
    steps: "Specifieke activiteit / Context",
    calories: "Welke maaltijd / Context?",
    weight: "Meetmoment / Context",
    strength: "Welke oefening?",
    cardio: "Welke activiteit?"
};

document.addEventListener("DOMContentLoaded", () => {
    const dateInput = document.getElementById("log-date");
    dateInput.value = new Date().toISOString().split('T')[0];

    setupNavigation();
    setupLoggingForm();
    setupDynamicPlaceholders();
    setupChartToggle(); // Activeert de grafiek selectieluisteraar
    setupSettings();
    
    // Alles initieel laden
    updateDashboardStats();
    renderHistory();
    renderChart();
});

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
            
            // Als we teruggaan naar het dashboard, herteken de grafiek
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

    typeSelect.addEventListener("change", () => {
        const selectedType = typeSelect.value;
        
        valueInput.placeholder = placeholders[selectedType];
        valueLabel.textContent = valueLabels[selectedType];

        subGroup.style.display = "flex";
        subLabel.textContent = subLabels[selectedType];
        subInput.placeholder = subPlaceholders[selectedType];
        
        // Toon intensiteitskiezer ALLEEN bij kracht en cardio
        if (selectedType === 'strength' || selectedType === 'cardio') {
            intensityGroup.style.display = "flex";
            subInput.required = true;
        } else {
            intensityGroup.style.display = "none";
            subInput.required = false;
        }
    });
}

// --- GRAFIEK METRIC SWITCHER ---
function setupChartToggle() {
    const selector = document.getElementById("chart-metric-select");
    selector.addEventListener("change", () => {
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
    const submitBtn = document.getElementById("submit-btn");
    const cancelBtn = document.getElementById("cancel-edit-btn");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const type = typeSelect.value;
        const date = dateInput.value;
        let value = parseFloat(valueInput.value);
        const subActivity = subInput.value.trim();
        const intensity = (type === 'strength' || type === 'cardio') ? intensitySelect.value : null;

        // EXTRA INTELLIGENTIE: Aanpassen van de waarde op basis van de intensiteit!
        // Bij krachttraining passen we een geschatte RPE vermenigvuldiging toe op je 'Volume Score' 
        // als je zwaar traint, of we slaan de intensiteit visueel op in de log data.
        if (editLogId !== null) {
            // EDIT MODE
            logs = logs.map(log => {
                if (log.id === editLogId) {
                    return { ...log, type, date, value, subActivity, intensity };
                }
                return log;
            });
            editLogId = null;
            submitBtn.textContent = "LOG OPSLAAN";
            document.getElementById("form-title").innerHTML = `Add <span style="color: #CCFF00;">Log</span>`;
            cancelBtn.style.display = "none";
            typeSelect.disabled = false;
        } else {
            // ADD MODE
            const newLog = {
                id: Date.now().toString(),
                type,
                date,
                value,
                subActivity,
                intensity
            };
            logs.push(newLog);
        }

        saveToLocalStorage();
        updateDashboardStats();
        renderHistory();
        renderChart();

        form.reset();
        dateInput.value = new Date().toISOString().split('T')[0];
        typeSelect.dispatchEvent(new Event('change'));
        document.querySelector('[data-screen="screen-dashboard"]').click();
    });

    cancelBtn.addEventListener("click", () => {
        editLogId = null;
        form.reset();
        dateInput.value = new Date().toISOString().split('T')[0];
        submitBtn.textContent = "LOG OPSLAAN";
        document.getElementById("form-title").innerHTML = `Add <span style="color: #CCFF00;">Log</span>`;
        cancelBtn.style.display = "none";
        typeSelect.disabled = false;
        typeSelect.dispatchEvent(new Event('change'));
    });
}

// --- DASHBOARD CALCULATION WIDGETS ---
function updateDashboardStats() {
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Steps vandaag
    const todaySteps = logs
        .filter(l => l.type === 'steps' && l.date === todayStr)
        .reduce((sum, l) => sum + l.value, 0);
    document.getElementById("stat-steps").textContent = todaySteps > 0 ? todaySteps.toLocaleString('en-US') : "0";

    // 2. Calories vandaag
    const todayCalories = logs
        .filter(l => l.type === 'calories' && l.date === todayStr)
        .reduce((sum, l) => sum + l.value, 0);
    document.getElementById("stat-calories").textContent = todayCalories > 0 ? todayCalories.toLocaleString('en-US') : "0";

    // 3. Workouts deze week
    const now = new Date();
    const currentDay = now.getDay();
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);
    monday.setHours(0,0,0,0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23,59,59,999);

    const weekWorkouts = logs.filter(l => {
        if (l.type !== 'strength' && l.type !== 'cardio') return false;
        const logDate = new Date(l.date);
        return logDate >= monday && logDate <= sunday;
    }).length;
    document.getElementById("stat-workouts").textContent = weekWorkouts;

    // 4. Weight
    const weightLogs = logs.filter(l => l.type === 'weight');
    if (weightLogs.length > 0) {
        weightLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
        document.getElementById("stat-weight").textContent = weightLogs[0].value + " kg";
    } else {
        document.getElementById("stat-weight").textContent = "--";
    }
}

// --- DE ULTIEME DYNAMISCHE GRAFIEK ENGINE ---
function renderChart() {
    const metric = document.getElementById("chart-metric-select").value;
    const svg = document.getElementById("dynamic-svg");
    const tooltip = document.getElementById("chart-tooltip");
    
    // Leegmaken voor een schone lei
    svg.innerHTML = "";
    
    // Haal alle logs op voor de gekozen metric
    let chartLogs = logs.filter(l => l.type === metric);
    
    // Sorteer van oud naar nieuw (chronologisch op de X-as)
    chartLogs.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Update de titelkaart bovenin
    const titles = {
        weight: "PROGRESS CHART — WEIGHT TRACKER",
        steps: "PROGRESS CHART — STEPS TRACKER",
        calories: "PROGRESS CHART — CALORIES TRACKER"
    };
    document.getElementById("chart-title-text").textContent = titles[metric];

    if (chartLogs.length === 0) {
        svg.innerHTML = `<text x="150" y="65" fill="#434347" font-size="11" font-weight="600" text-anchor="middle">Geen logs gevonden voor deze grafiek.</text>`;
        document.getElementById("chart-current-value").textContent = "--";
        document.getElementById("chart-diff-value").textContent = "";
        return;
    }

    // Bereken eenheden en koppen
    const latestLog = chartLogs[chartLogs.length - 1];
    const firstLog = chartLogs[0];
    const unit = metric === 'weight' ? ' kg' : (metric === 'calories' ? ' kcal' : ' stappen');
    
    document.getElementById("chart-current-value").textContent = latestLog.value.toLocaleString('en-US') + unit;
    
    if (chartLogs.length > 1) {
        const diff = latestLog.value - firstLog.value;
        const sign = diff >= 0 ? "+" : "";
        document.getElementById("chart-diff-value").textContent = `${sign}${diff.toLocaleString('en-US')}${unit}`;
        // Kleurverandering op basis van succesrichting (gewicht omlaag is groen, stappen omhoog is groen)
        document.getElementById("chart-diff-value").style.color = (diff <= 0 && metric === 'weight') || (diff >= 0 && metric !== 'weight') ? '#CCFF00' : '#71717A';
    } else {
        document.getElementById("chart-diff-value").textContent = "Startpunt";
        document.getElementById("chart-diff-value").style.color = "#71717A";
    }

    // Wiskundige dimensies bepalen binnen het SVG ViewBox (300x120)
    const paddingLeft = 45;
    const paddingRight = 20;
    const paddingTop = 15;
    const paddingBottom = 20;
    const width = 300 - paddingLeft - paddingRight;
    const height = 120 - paddingTop - paddingBottom;

    // Y-As Waardeberekening (Min / Max bepalen voor automatische schaling)
    const values = chartLogs.map(l => l.value);
    let minY = Math.min(...values);
    let maxY = Math.max(...values);
    
    if (minY === maxY) { minY -= 5; maxY += 5; } // Voorkom delen door nul bij 1 datapunt
    const yMargin = (maxY - minY) * 0.15; // 15% padding boven en onder de lijn
    minY -= yMargin;
    maxY += yMargin;

    // X-As Waardeberekening (Tijdstempels omzetten naar pixels)
    const times = chartLogs.map(l => new Date(l.date).getTime());
    let minX = Math.min(...times);
    let maxX = Math.max(...times);
    
    if (minX === maxX) { minX -= 86400000; maxX += 86400000; } // +/- 1 dag marge

    // Bereken de exacte pixel-coördinaten per datapunt
    const points = chartLogs.map(log => {
        const xTime = new Date(log.date).getTime();
        const x = paddingLeft + ((xTime - minX) / (maxX - minX)) * width;
        const y = paddingTop + height - ((log.value - minY) / (maxY - minY)) * height;
        return { x, y, log };
    });

    // RENDER 1: Teken Y-as gridteksten (Boven, Midden, Onder)
    const axisLabels = [maxY, (maxY + minY) / 2, minY];
    const axisYPos = [paddingTop, paddingTop + height / 2, paddingTop + height];
    
    axisLabels.forEach((label, i) => {
        const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
        txt.setAttribute("x", "5");
        txt.setAttribute("y", axisYPos[i] + 3);
        txt.setAttribute("class", "axis-text");
        txt.textContent = Math.round(label).toLocaleString('en-US');
        svg.appendChild(txt);
    });

    // RENDER 2: Teken de verbindingslijn (Path)
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        d += ` L ${points[i].x} ${points[i].y}`;
    }

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#CCFF00");
    path.setAttribute("stroke-width", "2.5");
    path.setAttribute("stroke-linecap", "round");
    svg.appendChild(path);

    // RENDER 3: Teken de bolletjes met de Figma Interactieve Hover-Tooltip
    points.forEach(pt => {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", pt.x);
        circle.setAttribute("cy", pt.y);
        circle.setAttribute("r", "3.5");
        circle.setAttribute("fill", "#CCFF00");

        // Hover IN: Toon tooltip en positioneer exact boven het bolletje
        circle.addEventListener("mouseover", () => {
            const dateObj = new Date(pt.log.date);
            const formattedDate = dateObj.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
            const contextText = pt.log.subActivity ? `<br><span style="color:#71717A; font-size:10px;">${pt.log.subActivity}</span>` : "";

            tooltip.innerHTML = `<strong>${pt.log.value.toLocaleString('en-US')}${unit}</strong><br><span style="color:#A1A1AA; font-size:10px;">${formattedDate}</span>${contextText}`;
            tooltip.style.display = "block";

            // Berekening relatieve positie binnen de responsive wrapper container
            const containerRect = svg.parentElement.getBoundingClientRect();
            const circleRect = circle.getBoundingClientRect();
            
            const tooltipX = circleRect.left - containerRect.left + (circleRect.width / 2);
            const tooltipY = circleRect.top - containerRect.top;

            tooltip.style.left = `${tooltipX}px`;
            tooltip.style.top = `${tooltipY}px`;
        });

        // Hover UIT: Verberg tooltip direct
        circle.addEventListener("mouseout", () => {
            tooltip.style.display = "none";
        });

        svg.appendChild(circle);
    });
}

// --- RENDER HISTORY ---
function renderHistory() {
    const container = document.getElementById("history-container");
    container.innerHTML = "";

    if (logs.length === 0) {
        container.innerHTML = `<p style="color: #434347; text-align: center; padding: 20px; font-size: 13px;">Nog geen logs aanwezig.</p>`;
        return;
    }

    const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id);

    sortedLogs.forEach(log => {
        const card = document.createElement("div");
        card.className = "history-card";
        
        let displayType = log.type.toUpperCase();
        let displayUnit = "";
        
        // Bepaal intensiteits-kleurindicator (Emoji badge)
        let intensityBadge = "";
        if (log.intensity === "light") intensityBadge = " 🟢";
        if (log.intensity === "medium") intensityBadge = " 🟡";
        if (log.intensity === "heavy") intensityBadge = " 🔴";

        const extraContextText = log.subActivity ? ` <span style="color: #71717A; font-size: 12px; font-weight:400;">(${log.subActivity}${intensityBadge})</span>` : "";
        
        if (log.type === "steps") { displayType = "👣 STEPS" + extraContextText; displayUnit = ""; }
        if (log.type === "calories") { displayType = "🔥 CALORIES" + extraContextText; displayUnit = " kcal"; }
        if (log.type === "weight") { displayType = "📉 WEIGHT" + extraContextText; displayUnit = " kg"; }
        
        if (log.type === "strength") { 
            displayType = `🏋️ ${log.subActivity.toUpperCase()}${intensityBadge}`; 
            displayUnit = " kg"; 
        }
        if (log.type === "cardio") { 
            displayType = `🏃 ${log.subActivity.toUpperCase()}${intensityBadge}`; 
            displayUnit = " min"; 
        }

        const dateObj = new Date(log.date);
        const formattedDate = dateObj.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });

        card.innerHTML = `
            <div class="history-info">
                <strong style="font-size: 14px; display: flex; align-items: center; gap: 6px;">${displayType}</strong>
                <span class="history-date">${formattedDate}</span>
            </div>
            <div class="history-actions">
                <span style="color: #CCFF00; font-weight: 700; font-size: 16px; margin-right: 12px;">${log.value.toLocaleString('en-US')}${displayUnit}</span>
                <button class="action-btn edit" onclick="editLog('${log.id}')">✏️</button>
                <button class="action-btn delete" onclick="deleteLog('${log.id}')">🗑️</button>
            </div>
        `;
        container.appendChild(card);
    });
}

window.deleteLog = function(id) {
    if (confirm("Weet je zeker dat je deze log wilt verwijderen?")) {
        logs = logs.filter(log => log.id !== id);
        if (editLogId === id) {
            document.getElementById("cancel-edit-btn").click();
        }
        saveToLocalStorage();
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

    document.getElementById("form-title").innerHTML = `Edit <span style="color: #CCFF00;">Log</span>`;
    document.getElementById("submit-btn").textContent = "WIJZIGINGEN OPSLAAN";
    document.getElementById("cancel-edit-btn").style.display = "block";
    document.getElementById("log-type").disabled = true;

    document.getElementById("log-type").dispatchEvent(new Event('change'));

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

function setupSettings() {
    document.getElementById("clear-data-btn").addEventListener("click", () => {
        if (confirm("Weet je het 100% zeker? Dit wist je volledige geschiedenis permanent.")) {
            logs = [];
            saveToLocalStorage();
            updateDashboardStats();
            renderHistory();
            renderChart();
            alert("Alle data is succesvol gewist.");
        }
    });
}

function saveToLocalStorage() {
    localStorage.setItem('gymlock_logs', JSON.stringify(logs));
}