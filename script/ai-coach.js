const aiTemplates = {
    Krachttraining: {
        Zwaar: "Zware sessie. Richting volgende week is je Progressive Overload doel voor **DESC**: **TARGET**.",
        Gemiddeld: "Goede prikkel op **DESC**. Probeer dit volume minimaal 2 weken vast te houden voor hypertrofie.",
        Licht: "Actief herstel. Ideale sessie om puur op de techniek en ROM van je **DESC** te focussen."
    },
    Cardio: {
        Zwaar: "Intense cardiosessie (**AMOUNT** **UNIT**). Je hebt je glycogeenvoorraden uitgeput. Hersteltijd: 24-36 uur.",
        Gemiddeld: "Keurige Zone-2 conditietraining. Dit vergroot je cardiovasculaire netwerk.",
        Licht: "Lichte cardio stimuleert de bloedsomloop en versnelt het spierherstel."
    },
    Voeding: {
        Zwaar: "Grote maaltijd gelogd van **AMOUNT** kcal. Richtlijn voor je macro-verdeling: **MACROS**.",
        Gemiddeld: "Gebalanceerde maaltijd. Zorg voor een stabiele verdeling van je eiwitten over de dag.",
        Licht: "Lichte maaltijd/snack. Let op dat je aan het einde van de dag wel aan je totale eiwitdoel komt."
    }
};

function getSmartAdvice(log, profile) {
    let profileAnalysis = "";

    // Live BMI en Waterdoel berekening
    if (profile && profile.height && profile.weight) {
        const heightInMeters = profile.height / 100;
        const bmi = (profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
        const waterTarget = (profile.weight * 0.035).toFixed(1);
        
        let bmiStatus = "Gezond";
        if (bmi < 18.5) bmiStatus = "Ondergewicht";
        else if (bmi >= 25 && bmi < 30) bmiStatus = "Overgewicht";
        else if (bmi >= 30) bmiStatus = "Obesitas / Heavy Bulk";

        profileAnalysis = `📊 **Profiel**: BMI: ${bmi} (${bmiStatus}) • 💧 **Hydro Doel**: ${waterTarget}L water/dag.<br><br>`;
    } else {
        profileAnalysis = `💡 *Tip: Vul je profiel in bij 'Opties' voor BMI & Water doelen.*<br><br>`;
    }

    if (!log) {
        return `🤖 **AI Coach**<br>${profileAnalysis}Voer een log in voor een actuele workout of macro-analyse.`;
    }

    const { category, intensity, description, amount, unit } = log;
    if (!aiTemplates[category] || !aiTemplates[category][intensity]) {
        return `🤖 **AI Coach**<br>${profileAnalysis}Lekker bezig, log succesvol verwerkt!`;
    }

    let advice = aiTemplates[category][intensity];

    // Progressive Overload formule (+2.5kg)
    if (category === "Krachttraining") {
        const nextWeight = Number(amount) + 2.5;
        const nextTarget = `${nextWeight}${unit} voor dezelfde reps`;
        advice = advice.replace("**TARGET**", nextTarget);
    }
    
    // Macro opsplitsing formule (30% eiwit, 40% carbs, 30% vet)
    if (category === "Voeding" && intensity === "Zwaar") {
        const eiwit = Math.round((amount * 0.3) / 4);
        const carbs = Math.round((amount * 0.4) / 4);
        const vet = Math.round((amount * 0.3) / 9);
        advice = advice.replace("**MACROS**", `${eiwit}g Eiwit, ${carbs}g Carbs, ${vet}g Vet`);
    }

    advice = advice.replace("**DESC**", description).replace("**AMOUNT**", amount).replace("**UNIT**", unit);

    return `🤖 **AI Coach**<br>${profileAnalysis}${advice}`;
}