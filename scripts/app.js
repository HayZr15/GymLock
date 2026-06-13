// --- STATE MANAGEMENT & LOCALSTORAGE ---
let logs = JSON.parse(localStorage.getItem('gymlock_logs')) || [];
let editLogId = null; // Houdt bij welke log we bewerken (indien in edit mode)

// Dynamische voorbeeldantwoorden per activiteit
const placeholders = {
    steps: "Bijv. 10000 (stappen)",
    calories: "Bijv. 2450 (kcal)",
    weight: "Bijv. 79.5 (kg)",
    workout: "Bijv. 60 (minuten)"
};

const valueLabels = {
    steps: "Aantal stappen",
    calories: "Aantal verbrande calorieën (kcal)",
    weight: "Huidig gewicht (kg)",
    workout: "Duur van de workout (minuten)"
};

document.addEventListener("DOMContentLoaded", () => {
    // Zet datumkiezer standaard op vandaag
    const dateInput = document.getElementById("log-date");
    dateInput.value = new Date().toISOString().split('T')[0];

    setupNavigation();
    setupLoggingForm();
    setupDynamicPlaceholders();
    setupSettings();
    
    // Eerste render bij opstarten app
    updateDashboardStats();
    renderHistory();
});

// --- NAVIGATIE SCHERMEN ---
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

// --- DYNAMISCHE PLACEHOLDERS ---
function setupDynamicPlaceholders() {
    const typeSelect = document.getElementById("log-type");
    const valueInput = document.getElementById("log-value");
    const valueLabel = document.getElementById("value-label");

    typeSelect.addEventListener("change", () => {
        const selectedType = typeSelect.value;
        valueInput.placeholder = placeholders[selectedType];
        valueLabel.textContent = valueLabels[selectedType];
    });
}

// --- FORMULIERAFHANDELING (ADD & EDIT) ---
function setupLoggingForm() {
    const form = document.getElementById("log-form");
    const typeSelect = document.getElementById("log-type");
    const dateInput = document.getElementById("log-date");
    const valueInput = document.getElementById("log-value");
    const submitBtn = document.getElementById("submit-btn");
    const cancelBtn = document.getElementById("cancel-edit-btn");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const type = typeSelect.value;
        const date = dateInput.value;
        const value = parseFloat(valueInput.value);

        if (editLogId !== null) {
            // EDIT MODE: Update bestaande log
            logs = logs.map(log => {
                if (log.id === editLogId) {
                    return { ...log, type, date, value };
                }
                return log;
            });
            editLogId = null;
            submitBtn.textContent = "LOG OPSLAAN";
            document.getElementById("form-title").innerHTML = `Add <span style="color: #CCFF00;">Log</span>`;
            cancelBtn.style.display = "none";
            typeSelect.disabled = false; // Ontgrendel selectie weer
        } else {
            // ADD MODE: Maak een nieuwe log aan
            const newLog = {
                id: Date.now().toString(), // Unieke ID genereren
                type,
                date,
                value
            };
            logs.push(newLog);
        }

        saveToLocalStorage();
        updateDashboardStats();
        renderHistory();

        // Reset invoerveld en stuur terug naar Dashboard
        valueInput.value = "";
        document.querySelector('[data-screen="screen-dashboard"]').click();
    });

    // Annuleren knop tijdens editen
    cancelBtn.addEventListener("click", () => {
        editLogId = null;
        form.reset();
        dateInput.value = new Date().toISOString().split('T')[0];
        submitBtn.textContent = "LOG OPSLAAN";
        document.getElementById("form-title").innerHTML = `Add <span style="color: #CCFF00;">Log</span>`;
        cancelBtn.style.display = "none";
        typeSelect.disabled = false;
        // Trigger handmatig change event om placeholder te herstellen
        typeSelect.dispatchEvent(new Event('change'));
    });
}

// --- DASHBOARD CALCULATIONS (LIVE UPDATING) ---
function updateDashboardStats() {
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. STEPS (Sommeren van alle stappen ingevoerd voor VANDAAG)
    const todaySteps = logs
        .filter(l => l.type === 'steps' && l.date === todayStr)
        .reduce((sum, l) => sum + l.value, 0);
    document.getElementById("stat-steps").textContent = todaySteps > 0 ? todaySteps.toLocaleString('en-US') : "0";

    // 2. CALORIES (Sommeren van alle kcal ingevoerd voor VANDAAG)
    const todayCalories = logs
        .filter(l => l.type === 'calories' && l.date === todayStr)
        .reduce((sum, l) => sum + l.value, 0);
    document.getElementById("stat-calories").textContent = todayCalories > 0 ? todayCalories.toLocaleString('en-US') : "0";

    // 3. WORKOUTS (Aantal workout logs ingevoerd in de HUIDIGE KALENDERWEEK)
    const now = new Date();
    const currentDay = now.getDay();
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1; // Zondag fix
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);
    monday.setHours(0,0,0,0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23,59,59,999);

    const weekWorkouts = logs.filter(l => {
        if (l.type !== 'workout') return false;
        const logDate = new Date(l.date);
        return logDate >= monday && logDate <= sunday;
    }).length;
    document.getElementById("stat-workouts").textContent = weekWorkouts;

    // 4. WEIGHT (Altijd het allernieuwste gewicht tonen dat ooit gelogd is)
    const weightLogs = logs.filter(l => l.type === 'weight');
    if (weightLogs.length > 0) {
        // Sorteer op datum om de nieuwste te pakken
        weightLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
        document.getElementById("stat-weight").textContent = weightLogs[0].value + " kg";
    } else {
        document.getElementById("stat-weight").textContent = "--";
    }
}

// --- RENDER GESCHIEDENIS MET EDIT/DELETE ---
function renderHistory() {
    const container = document.getElementById("history-container");
    container.innerHTML = "";

    if (logs.length === 0) {
        container.innerHTML = `<p style="color: #434347; text-align: center; padding: 20px; font-size: 13px;">Nog geen logs aanwezig.</p>`;
        return;
    }

    // Sorteer geschiedenis op datum (nieuwste bovenaan)
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id);

    sortedLogs.forEach(log => {
        const card = document.createElement("div");
        card.className = "history-card";
        
        let displayType = log.type.toUpperCase();
        let displayUnit = "";
        if (log.type === "steps") displayType = "👣 STEPS";
        if (log.type === "calories") { displayType = "🔥 CALORIES"; displayUnit = " kcal"; }
        if (log.type === "weight") { displayType = "📉 WEIGHT"; displayUnit = " kg"; }
        if (log.type === "workout") { displayType = "🏋️ WORKOUT"; displayUnit = " min"; }

        // Formatteer datum naar nette weergave
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

// --- EDIT & DELETE ACTION FUNCTIES ---
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

    // Activeer Edit modus status
    editLogId = id;

    // Vul formuliervelden met de huidige data van de log
    document.getElementById("log-type").value = logToEdit.type;
    document.getElementById("log-date").value = logToEdit.date;
    document.getElementById("log-value").value = logToEdit.value;

    // Update UI elementen van het formulier
    document.getElementById("form-title").innerHTML = `Edit <span style="color: #CCFF00;">Log</span>`;
    document.getElementById("submit-btn").textContent = "WIJZIGINGEN OPSLAAN";
    document.getElementById("cancel-edit-btn").style.display = "block";
    document.getElementById("log-type").disabled = true; // Vergrendel type om inconsistentie te voorkomen

    // Trigger placeholders update
    document.getElementById("log-type").dispatchEvent(new Event('change'));

    // Scroll soepel naar de bovenkant van het formulier
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// --- SETTINGS HULPFUNCTIES ---
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