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
    calories: "Aantal verbrande calorieën (kcal)",
    weight: "Huidig gewicht (kg)",
    strength: "Gewicht (kg)",
    cardio: "Duur (minuten)"
};

// Dynamische data voor het NIEUWE SUB-VELD
const subPlaceholders = {
    strength: "Bijv. Bench Press, Squat, Shoulder Press",
    cardio: "Bijv. Hardlopen, Fietsen, Roeitrainer"
};

const subLabels = {
    strength: "Welke oefening?",
    cardio: "Welke activiteit?"
};

document.addEventListener("DOMContentLoaded", () => {
    const dateInput = document.getElementById("log-date");
    dateInput.value = new Date().toISOString().split('T')[0];

    setupNavigation();
    setupLoggingForm();
    setupDynamicPlaceholders();
    setupSettings();
    
    updateDashboardStats();
    renderHistory();
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
        });
    });
}

// --- DYNAMISCHE PLACEHOLDERS & SUB-VELD LOGICA ---
function setupDynamicPlaceholders() {
    const typeSelect = document.getElementById("log-type");
    const valueInput = document.getElementById("log-value");
    const valueLabel = document.getElementById("value-label");
    
    const subGroup = document.getElementById("sub-activity-group");
    const subLabel = document.getElementById("sub-activity-label");
    const subInput = document.getElementById("log-sub-activity");

    typeSelect.addEventListener("change", () => {
        const selectedType = typeSelect.value;
        
        // Update hoofdveld labels & placeholders
        valueInput.placeholder = placeholders[selectedType];
        valueLabel.textContent = valueLabels[selectedType];

        // Toon of verberg het sub-veld op basis van je keuze
        if (selectedType === 'strength' || selectedType === 'cardio') {
            subGroup.style.display = "flex";
            subLabel.textContent = subLabels[selectedType];
            subInput.placeholder = subPlaceholders[selectedType];
            subInput.required = true; // Verplicht maken als het krachttraining of cardio is
        } else {
            subGroup.style.display = "none";
            subInput.required = false;
            subInput.value = ""; // Resetten als het niet nodig is
        }
    });
}

// --- FORMULIERAFHANDELING ---
function setupLoggingForm() {
    const form = document.getElementById("log-form");
    const typeSelect = document.getElementById("log-type");
    const dateInput = document.getElementById("log-date");
    const valueInput = document.getElementById("log-value");
    const subInput = document.getElementById("log-sub-activity");
    const submitBtn = document.getElementById("submit-btn");
    const cancelBtn = document.getElementById("cancel-edit-btn");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const type = typeSelect.value;
        const date = dateInput.value;
        const value = parseFloat(valueInput.value);
        const subActivity = subInput.value.trim();

        if (editLogId !== null) {
            // EDIT MODE
            logs = logs.map(log => {
                if (log.id === editLogId) {
                    return { ...log, type, date, value, subActivity };
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
                subActivity
            };
            logs.push(newLog);
        }

        saveToLocalStorage();
        updateDashboardStats();
        renderHistory();

        // Volledige reset en terug naar Dashboard
        form.reset();
        dateInput.value = new Date().toISOString().split('T')[0];
        typeSelect.dispatchEvent(new Event('change')); // Reset de placeholders
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

// --- DASHBOARD BEREKENINGEN ---
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

    // 3. Workouts (Telt alle Krachttraining + Cardio logs van deze week samen)
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

    // 4. Weight (Meest recente gewichtslog)
    const weightLogs = logs.filter(l => l.type === 'weight');
    if (weightLogs.length > 0) {
        weightLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
        document.getElementById("stat-weight").textContent = weightLogs[0].value + " kg";
    } else {
        document.getElementById("stat-weight").textContent = "--";
    }
}

// --- RENDER GESCHIEDENIS ---
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
        
        if (log.type === "steps") displayType = "👣 STEPS";
        if (log.type === "calories") { displayType = "🔥 CALORIES"; displayUnit = " kcal"; }
        if (log.type === "weight") { displayType = "📉 WEIGHT"; displayUnit = " kg"; }
        
        // Dynamische naamsverwerking voor krachttraining en cardio!
        if (log.type === "strength") { 
            displayType = `🏋️ ${log.subActivity.toUpperCase()}`; 
            displayUnit = " kg"; 
        }
        if (log.type === "cardio") { 
            displayType = `🏃 ${log.subActivity.toUpperCase()}`; 
            displayUnit = " min"; 
        }

        const dateObj = new Date(log.date);
        const formattedDate = dateObj.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });

        card.innerHTML = `
            <div class="history-info">
                <strong style="font-size: 14px;">${displayType}</strong>
                <span class="history-date">${formattedDate}</span>
            </div>
            <div class="history-actions">
                <span style="color: #CCFF00; font-weight: 700; font-size: 16px; margin-right: 12px;">${log.value}${displayUnit}</span>
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
    }
};

window.editLog = function(id) {
    const logToEdit = logs.find(log => log.id === id);
    if (!logToEdit) return;

    editLogId = id;

    document.getElementById("log-type").value = logToEdit.type;
    document.getElementById("log-date").value = logToEdit.date;
    document.getElementById("log-value").value = logToEdit.value;
    
    // Zorg dat het sub-veld ook weer gevuld wordt bij editen
    document.getElementById("log-sub-activity").value = logToEdit.subActivity || "";

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
            alert("Alle data is succesvol gewist.");
        }
    });
}

function saveToLocalStorage() {
    localStorage.setItem('gymlock_logs', JSON.stringify(logs));
}