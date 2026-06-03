const healthForm = document.getElementById('health-form');
const logList = document.getElementById('log-list');
const btnReset = document.getElementById('btn-reset');
const aiAdvice = document.getElementById('ai-advice');
const statKcal = document.getElementById('stat-kcal');
const filterButtons = document.querySelectorAll('.filter-btn');
const navButtons = document.querySelectorAll('.nav-btn');
const appScreens = document.querySelectorAll('.app-screen');

let logs = JSON.parse(localStorage.getItem('gymLogs')) || [];
let activeFilter = 'day';

// MENU SCHERMEN SWITCH LOGICA
navButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        navButtons.forEach(b => b.classList.remove('active'));
        appScreens.forEach(s => s.classList.remove('active'));
        
        this.classList.add('active');
        const targetScreen = this.getAttribute('data-target');
        document.getElementById(targetScreen).classList.add('active');
    });
});

// Filter berekening op datum
function isInPeriod(logDateStr, period) {
    const logDate = new Date(logDateStr);
    const today = new Date();
    today.setHours(0,0,0,0);
    logDate.setHours(0,0,0,0);
    
    const diffTime = today - logDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (period === 'day') return diffDays === 0;
    if (period === 'week') return diffDays >= 0 && diffDays <= 7;
    if (period === 'month') return diffDays >= 0 && diffDays <= 30;
    return true;
}

// Data tonen (Read)
function renderLogs() {
    logList.innerHTML = '';
    const filteredLogs = logs.filter(log => isInPeriod(log.date, activeFilter));

    const totaalKcal = filteredLogs
        .filter(log => log.category === 'Voeding')
        .reduce((sum, log) => sum + Number(log.amount), 0);
    statKcal.innerText = totaalKcal;

    if (filteredLogs.length === 0) {
        logList.innerHTML = '<p style="color:#8e8e93; font-size:0.9rem;">Geen logs gevonden voor deze periode.</p>';
        aiAdvice.innerText = 'Voer gegevens in voor deze periode voor AI hersteladvies.';
        return;
    }

    filteredLogs.forEach(log => {
        const div = document.createElement('div');
        div.className = 'log-item';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.padding = '12px 0';
        div.style.borderBottom = '1px solid #2c2c2e';
        div.innerHTML = `
            <div>
                <span style="font-weight:700; color:#ccff00;">${log.description}</span>
                <p style="font-size:0.75rem; color:#8e8e93;">${log.date} • ${log.category}</p>
            </div>
            <span style="font-weight:700;">${log.amount} ${log.unit}</span>
        `;
        logList.appendChild(div);
    });

    const lastLog = filteredLogs[filteredLogs.length - 1];
    if (lastLog.intensity === 'Zwaar') {
        aiAdvice.innerText = `🤖 AI Coach: Je workout (${lastLog.description}) was intensief. Zorg voor direct spierherstel: pak extra eiwitten en pak minimaal 8 uur slaap!`;
    } else {
        aiAdvice.innerText = `🤖 AI Coach: Goed ritme! Invoer verwerkt. Blijf progressief laden om sterker te worden.`;
    }
}

// Opslaan (Create)
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
    
    // Na opslaan springt de app automatisch terug naar het Dashboard om je log te zien!
    document.querySelector('[data-target="screen-dashboard"]').click();
});

// Dashboard filters (Dag/Week/Maand)
filterButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        filterButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        activeFilter = this.getAttribute('data-filter');
        renderLogs();
    });
});

// Reset database
btnReset.addEventListener('click', function() {
    if (confirm('Weet je zeker dat je alle gym-data wilt wissen?')) {
        logs = [];
        localStorage.removeItem('gymLogs');
        renderLogs();
    }
});

renderLogs();