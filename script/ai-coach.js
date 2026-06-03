// script/ai-coach.js
const gymKnowledgeBase = {
    Krachttraining: {
        Zwaar: [
            "Je CNS (Central Nervous System) heeft een flinke klap gehad. Zorg voor 8+ uur slaap vannacht.",
            "Zware sessie! Zorg dat je binnen 2 uur na deze training 30-40g hoogwaardige eiwitten pakt.",
            "Vergeet je progressive overload niet: probeer dit gewicht volgende week met 1 rep te verhogen."
        ],
        Gemiddeld: [
            "Lekkere pomp! Goed volume gedraaid vandaag. Blijf consistent.",
            "Prima onderhoudssessie. Drink voldoende water om je spieren te hydrateren."
        ],
        Licht: [
            "Actief herstel is ook belangrijk. Focus je vandaag op techniek en ademhaling.",
            "Lichte sessie vandaag. Perfect om je pezen en gewrichten even rust te geven voor je volgende zware lift."
        ]
    },
    Cardio: {
        Zwaar: ["Je glycogeenvoorraden zijn leeg. Vul ze aan met complexe koolhydraten zoals havermout of rijst!"],
        Gemiddeld: ["Lekker aan je hartspier gewerkt! Goed voor je algehele conditie en doorbloeding."],
        Licht: ["Perfecte zone-2 cardio sessie. Dit verbetert je mitochondriën zonder je spierherstel in de weg te zitten."]
    },
    Voeding: {
        Zwaar: ["Hoge calorie-inname geregistreerd. Als je in een bulk zit: lekker bezig. Zit je in een cut? Let dan morgen even op je macro's."],
        Gemiddeld: ["Keurige maaltijd gelogd. Consistency in je voeding is 80% van het resultaat in de gym!"],
        Licht: ["Lichte maaltijd. Zorg dat je gedurende de dag wel aan je totale eiwitbehoefte (ca. 1.8g per kg lichaamsgewicht) komt."]
    }
};

// Functie die een random advies kiest uit de juiste categorie
function getSmartAdvice(category, intensity) {
    // Check of de combinatie bestaat in onze kennisbank
    if (gymKnowledgeBase[category] && gymKnowledgeBase[category][intensity]) {
        const adviceArray = gymKnowledgeBase[category][intensity];
        // Kies een willekeurig advies uit de lijst voor variatie
        const randomInhoud = Math.floor(Math.random() * adviceArray.length);
        return `🤖 AI Coach: ${adviceArray[randomInhoud]}`;
    }
    return "🤖 AI Coach: Blijf je logs bijhouden om je progressie in kaart te brengen!";
}