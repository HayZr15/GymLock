const healthForm = document.getElementById('health-form');
const logList = document.getElementById('log-list');
const btnReset = document.getElementById('btn-reset');
const aiAdvice = document.getElementById('ai-advice');
const statKcal = document.getElementById('stat-kcal');
const filterButtons = document.querySelectorAll('.filter-btn');
const navButtons = document.querySelectorAll('.nav-btn');
const appScreens = document.querySelectorAll('.app-screen');
const statSteps = document.getElementById('stat-steps');
const statBpm = document.getElementById('stat-bpm');

// Profiel elementen
const inputHeight = document.getElementById('profile-height');
const inputWeight = document.getElementById('profile-weight');
const btnSaveProfile = document.getElementById('btn-save-profile');

// Taal elementen
const btnNl = document.getElementById('btn-lang-nl');
const btnEn = document.getElementById('btn-lang-en');

let logs = JSON.parse(localStorage.getItem('gymLogs')) || [];
let profile = JSON.parse(localStorage.getItem('gymProfile')) || null;
let currentLang = localStorage.getItem('gymLang') || 'NL';
let activeFilter = 'day';

// COMPLEET VERTALINGS-WOORDENBOEK
const vertalingen = {
    NL: {
        dashboardKop: "Mijn Dashboard",
        logKop: "Nieuwe Log Toevoegen",
        settingsKop: "Instellingen",
        profielKop: "Mijn Profiel",
        taalKop: "Taal / Language",
        dataKop: "Data Beheer",
        labelLengte: "Lengte (in cm):",
        labelGewicht: "Gewicht (in kg):",
        btnOpslaan: "Profiel Opslaan",
        btnReset: "Reset Alle Gegevens",
        labelDatum: "Datum:",
        labelCategorie: "Categorie:",
        labelOmschrijving: "Omschrijving:",
        labelAantal: "Aantal / Gewicht / Kcal:",
        labelEenheid: "Eenheid:",
        labelIntensiteit: "Hoe zwaar was het? (Voor AI Coach):",
        btnLogOpslaan: "OPSLAAN",
        noLogs: "Geen logs gevonden voor deze periode.",
        resetVraag: "Weet je zeker dat je alle gym-data wilt wissen?",
        savedAlert: "Profiel succesvol bijgewerkt!",
        // Filters
        filterDay: "Dag",
        filterWeek: "Week",
        filterMonth: "Maand",
        // Categorieën Dropdown
        optKrachttraining: "Krachttraining (Gym)",
        optCardio: "Cardio",
        optVoeding: "Voeding",
        optStappen: "Stappen (Steps)",
        optHartslag: "Hartslag (BPM)"
    },
    EN: {
        dashboardKop: "My Dashboard",
        logKop: "Add New Log",
        settingsKop: "Settings",
        profielKop: "My Profile",
        taalKop: "Language / Taal",
        dataKop: "Data Management",
        labelLengte: "Height (in cm):",
        labelGewicht: "Weight (in kg):",
        btnOpslaan: "Save Profile",
        btnReset: "Reset All Data",
        labelDatum: "Date:",
        labelCategorie: "Category:",
        labelOmschrijving: "Description:",
        labelAantal: "Amount / Weight / Kcal:",
        labelEenheid: "Unit:",
        labelIntensiteit: "How heavy was it? (For AI Coach):",
        btnLogOpslaan: "SAVE LOG",
        noLogs: "No logs found for this period.",
        resetVraag: "Are you sure you want to clear all data?",
        savedAlert: "Profile updated successfully!",
        // Filters
        filterDay: "Day",
        filterWeek: "Week",
        filterMonth: "Month",
        // Categorieën Dropdown
        optKrachttraining: "Strength Training (Gym)",
        optCardio: "Cardio",
        optVoeding: "Nutrition",
        optStappen: "Steps",
        optHartslag: "Heart Rate (BPM)"
    }
};

if (profile && inputHeight && inputWeight) {
    inputHeight.value = profile.height;
    inputWeight.value = profile.weight;
}

// Menu Schakelen
navButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        navButtons.forEach(b => b.classList.remove('active'));
        appScreens.forEach(s => s.classList.remove('active'));
        this.classList.add('active');
        document.getElementById(this.getAttribute('data-target')).classList.add('active');
    });
});

function isInPeriod(logDateStr, period) {
    const logDate = new Date(logDateStr);
    const today = new Date();
    today.setHours(0,0,0,0); logDate.setHours(0,0,0,0);
    const diffDays = Math.ceil((today - logDate) / (1000 * 60 * 60 * 24));
    if (period === 'day') return diffDays === 0;
    if (period === 'week') return diffDays >= 0 && diffDays <= 7;
    if (period === 'month') return diffDays >= 0 && diffDays <= 30;
    return true;
}

// Scherm updaten (Read + Delete)
function renderLogs() {
    if (!logList) return;
    logList.innerHTML = '';
    
    const filteredLogs = logs.filter(log => isInPeriod(log.date, activeFilter));

    // 1. Calorieën berekenen
    const totaalKcal = filteredLogs
        .filter(log => log.category === 'Voeding')
        .reduce((sum, log) => sum + Number(log.amount), 0);
    if (statKcal) statKcal.innerText = totaalKcal;

    // 2. Stappen berekenen
    const totaalSteps = filteredLogs
        .filter(log => log.category === 'Stappen')
        .reduce((sum, log) => sum + Number(log.amount), 0);
    if (statSteps) statSteps.innerText = totaalSteps.toLocaleString('nl-NL');

    // 3. Hartslag berekenen
    const hartslagLogs = filteredLogs.filter(log => log.category === 'Hartslag');
    const laatsteBpm = hartslagLogs.length > 0 ? hartslagLogs[hartslagLogs.length - 1].amount : 0;
    if (statBpm) statBpm.innerText = laatsteBpm;

    // AI aanroepen
    const lastLog = filteredLogs[filteredLogs.length - 1];
    if (aiAdvice && typeof getSmartAdvice === 'function') {
        aiAdvice.innerHTML = getSmartAdvice(lastLog, profile, currentLang);
    }

    if (filteredLogs.length === 0) {
        logList.innerHTML = `<p style="color:#8e8e93; font-size:0.9rem; text-align:center;">${vertalingen[currentLang].noLogs}</p>`;
        return;
    }

    filteredLogs.forEach(log => {
        const div = document.createElement('div');
        div.className = 'log-item';
        // Flexbox aangepast zodat de prullenbak netjes rechts staat en alles verticaal gecentreerd is
        div.style.display = 'flex'; 
        div.style.justifyContent = 'space-between'; 
        div.style.alignItems = 'center'; 
        div.style.padding = '12px 0'; 
        div.style.borderBottom = '1px solid #2c2c2e';
        
        div.innerHTML = `
            <div>
                <span style="font-weight:700; color:#ccff00;">${log.description}</span>
                <p style="font-size:0.75rem; color:#8e8e93;">${log.date} • ${log.category}</p>
            </div>
            <div style="display: flex; align-items: center; gap: 16px;">
                <span style="font-weight:700;">${log.amount} ${log.unit}</span>
                <button class="btn-delete" style="background: none; border: none; color: #ff453a; cursor: pointer; font-size: 1.1rem; padding: 4px 8px; transition: transform 0.1s;">🗑️</button>
            </div>
        `;

        // Klik-event koppelen aan de specifieke prullenbak
        const deleteBtn = div.querySelector('.btn-delete');
        deleteBtn.addEventListener('click', () => {
            const vraag = currentLang === 'EN' 
                ? "Are you sure you want to delete this log?" 
                : "Weet je zeker dat je deze log wilt verwijderen?";
                
            if (confirm(vraag)) {
                deleteLog(log.id);
            }
        });

        logList.appendChild(div);
    });
}

healthForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const newLog = {
        id: Date.now(),
        date: document.getElementById('input-date').value,
        category: document.getElementById('input-category').value,
        description: document.getElementById('input-desc').value,
        amount: document.getElementById('input-amount').value,
        unit: document.getElementById('input-unit').value,
        intensity: document.getElementById('input-intensity').value
    };
    logs.push(newLog);
    localStorage.setItem('gymLogs', JSON.stringify(logs));
    healthForm.reset();
    renderLogs();
    document.querySelector('[data-target="screen-dashboard"]').click();
});

btnSaveProfile.addEventListener('click', function() {
    profile = {
        height: inputHeight.value,
        weight: inputWeight.value
    };
    localStorage.setItem('gymProfile', JSON.stringify(profile));
    alert(vertalingen[currentLang].savedAlert);
    renderLogs();
    document.querySelector('[data-target="screen-dashboard"]').click();
});

filterButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        filterButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        activeFilter = this.getAttribute('data-filter');
        renderLogs();
    });
});

btnReset.addEventListener('click', function() {
    if (confirm(vertalingen[currentLang].resetVraag)) {
        logs = []; profile = null;
        localStorage.removeItem('gymLogs');
        localStorage.removeItem('gymProfile');
        inputHeight.value = ''; inputWeight.value = '';
        renderLogs();
    }
});

if (btnNl && btnEn) {
    if (currentLang === 'EN') {
        btnEn.classList.add('active');
        btnNl.classList.remove('active');
    } else {
        btnNl.classList.add('active');
        btnEn.classList.remove('active');
    }

    btnNl.addEventListener('click', () => {
        btnNl.classList.add('active');
        btnEn.classList.remove('active');
        currentLang = 'NL';
        localStorage.setItem('gymLang', 'NL');
        vertaalApp('NL');
        renderLogs();
    });

    btnEn.addEventListener('click', () => {
        btnEn.classList.add('active');
        btnNl.classList.remove('active');
        currentLang = 'EN';
        localStorage.setItem('gymLang', 'EN');
        vertaalApp('EN');
        renderLogs();
    });
}

function vertaalApp(taal) {
    const t = vertalingen[taal];

    // 1. Hoofdkoppen (H2's)
    const dashboardKop = document.querySelector('#screen-dashboard h2') || document.querySelector('.main-content h2');
    const logKop = document.querySelector('#screen-log h2') || document.querySelectorAll('h2')[1];
    const settingsKop = document.querySelector('#screen-settings h2');
    
    if (dashboardKop) dashboardKop.innerText = t.dashboardKop;
    if (logKop) logKop.innerText = t.logKop;
    if (settingsKop) settingsKop.innerText = t.settingsKop;

    // 2. Settings subkoppen (H3's)
    const settingsH3s = document.querySelectorAll('#screen-settings h3');
    if (settingsH3s.length >= 3) {
        settingsH3s[0].innerText = t.profielKop;
        settingsH3s[1].innerText = t.taalKop;
        settingsH3s[2].innerText = t.dataKop;
    }

    // 3. Settings Labels en Knoppen
    const labelLengte = document.querySelector('label[for="profile-height"]') || document.querySelectorAll('#screen-settings label')[0];
    const labelGewicht = document.querySelector('label[for="profile-weight"]') || document.querySelectorAll('#screen-settings label')[1];
    if (labelLengte) labelLengte.innerText = t.labelLengte;
    if (labelGewicht) labelGewicht.innerText = t.labelGewicht;
    if (btnSaveProfile) btnSaveProfile.innerText = t.btnOpslaan;
    if (btnReset) btnReset.innerText = t.btnReset;

    // 4. Log Formulier Labels + Opslaan Knop
    const labelsForm = document.querySelectorAll('#health-form label');
    if (labelsForm.length >= 6) {
        labelsForm[0].innerText = t.labelDatum;
        labelsForm[1].innerText = t.labelCategorie;
        labelsForm[2].innerText = t.labelOmschrijving;
        labelsForm[3].innerText = t.labelAantal;
        labelsForm[4].innerText = t.labelEenheid;
        labelsForm[5].innerText = t.labelIntensiteit;
    }
    const btnSubmit = document.getElementById('health-form').querySelector('button');
    if (btnSubmit) btnSubmit.innerText = t.btnLogOpslaan;

    // 5. NIEUW: Dashboard Periode Filters (Dag / Week / Maand)
    filterButtons.forEach(btn => {
        const filterType = btn.getAttribute('data-filter');
        if (filterType === 'day') btn.innerText = t.filterDay;
        if (filterType === 'week') btn.innerText = t.filterWeek;
        if (filterType === 'month') btn.innerText = t.filterMonth;
    });

    // 6. NIEUW: Categorie Dropdown Opties live vertalen
    const selectCategory = document.getElementById('input-category');
    if (selectCategory) {
        Array.from(selectCategory.options).forEach(opt => {
            if (opt.value === 'Krachttraining') opt.innerText = t.optKrachttraining;
            if (opt.value === 'Cardio') opt.innerText = t.optCardio;
            if (opt.value === 'Voeding') opt.innerText = t.optVoeding;
            if (opt.value === 'Stappen') opt.innerText = t.optStappen;
            if (opt.value === 'Hartslag') opt.innerText = t.optHartslag;
        });
    }

    // 7. NIEUW: Intensiteit Dropdown Opties live vertalen
    const selectIntensity = document.getElementById('input-intensity');
    if (selectIntensity) {
        Array.from(selectIntensity.options).forEach(opt => {
            if (opt.value === 'Zwaar') opt.innerText = taal === 'EN' ? 'Heavy / High' : 'Zwaar';
            if (opt.value === 'Gemiddeld') opt.innerText = taal === 'EN' ? 'Moderate' : 'Gemiddeld';
            if (opt.value === 'Licht') opt.innerText = taal === 'EN' ? 'Light' : 'Licht';
        });
    }

    // 8. Settings omschrijving tekstje
    const paragraphs = document.querySelectorAll('.settings-card p');
    paragraphs.forEach(p => {
        p.innerText = taal === 'EN' ? "Want to clear all saved data?" : "Wil je alle opgeslagen gegevens wissen?";
    });
}

// Log Verwijderen (Delete)
function deleteLog(id) {
    logs = logs.filter(log => log.id !== id);
    localStorage.setItem('gymLogs', JSON.stringify(logs));
    renderLogs();
}

// Opstarten (Nu netjes één keer uitgevoerd!)
vertaalApp(currentLang);
renderLogs();

// Service Worker Registratie voor PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker succesvol geregistreerd!', reg))
            .catch(err => console.error('Service Worker registratie mislukt:', err));
    });
}