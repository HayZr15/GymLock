// HTML Elementen selecteren
const healthForm = document.getElementById('health-form');
const logList = document.getElementById('log-list');
const btnReset = document.getElementById('btn-reset');
const aiAdvice = document.getElementById('ai-advice');

// 1. Data ophalen uit LocalStorage (of lege array als er nog niks is)
let logs = JSON.parse(localStorage.getItem('gymLogs')) || [];

// 2. Functie om de opgeslagen logs op het scherm te tonen (Read)
function renderLogs() {
    logList.innerHTML = '';
    
    if (logs.length === 0) {
        logList.innerHTML = '<p>Nog geen gegevens ingevoerd voor deze periode.</p>';
        aiAdvice.innerText = 'Voer je eerste training in voor persoonlijk advies!';
        return;
    }

    // Toon elk item in de lijst
    logs.forEach(log => {
        const div = document.createElement('div');
        div.style.borderBottom = '1px solid #29292e';
        div.style.padding = '10px 0';
        div.innerHTML = `
            <strong>${log.date}</strong> - [${log.category}] 
            ${log.description}: ${log.amount} ${log.unit} (${log.intensity})
        `;
        logList.appendChild(div);
    });

    // Offline AI Coach Logica: reageert op het laatst ingevoerde item
    const lastLog = logs[logs.length - 1];
    if (lastLog.intensity === 'Zwaar') {
        aiAdvice.innerText = `🤖 AI Coach: Je laatste training (${lastLog.description}) was zwaar. Focus vandaag op extra eiwitten en pak voldoende rust!`;
    } else {
        aiAdvice.innerText = `🤖 AI Coach: Lekker bezig! Consistentie is key. Blijf je logs bijhouden om progressie te zien.`;
    }
}

// 3. Luisteren naar het formulier (Create)
healthForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // Nieuw log-object aanmaken op basis van invoervelden
    const newLog = {
        id: Date.now(), // Unieke timestamp
        date: document.getElementById('input-date').value,
        category: document.getElementById('input-category').value,
        description: document.getElementById('input-desc').value,
        amount: document.getElementById('input-amount').value,
        unit: document.getElementById('input-unit').value,
        intensity: document.getElementById('input-intensity').value
    };

    // Toevoegen aan array en opslaan in LocalStorage
    logs.push(newLog);
    localStorage.setItem('gymLogs', JSON.stringify(logs));

    // Formulier leegmaken en scherm updaten
    healthForm.reset();
    renderLogs();
});

// 4. Reset knop functionaliteit (Delete)
btnReset.addEventListener('click', function() {
    if (confirm('Weet je zeker dat je alle gym-data wilt wissen?')) {
        logs = [];
        localStorage.removeItem('gymLogs');
        renderLogs();
    }
});

// Starten bij laden van de pagina
renderLogs();
// Bereken totale calorieën van vandaag voor het gifgroene vakje
const totaalKcal = logs
    .filter(log => log.category === 'Voeding')
    .reduce((sum, log) => sum + Number(log.amount), 0);

document.getElementById('stat-kcal').innerText = totaalKcal;