const aiTemplates = {
    NL: {
        Krachttraining: {
            Zwaar: "Zware sessie. Richting volgende week is je Progressive Overload doel voor <b>DESC</b>: <b>TARGET</b>.",
            Gemiddeld: "Goede prikkel op <b>DESC</b>. Probeer dit volume minimaal 2 weken vast te houden voor hypertrofie.",
            Licht: "Actief herstel. Ideale sessie om puur op de techniek en ROM van je <b>DESC</b> te focussen."
        },
        Cardio: {
            Zwaar: "Intense cardiosessie (<b>AMOUNT</b> <b>UNIT</b>). Je hebt je glycogeenvoorraden uitgeput. Hersteltijd: 24-36 uur.",
            Gemiddeld: "Keurige Zone-2 conditietraining. Dit vergroot je cardiovasculaire netwerk.",
            Licht: "Lichte cardio stimuleert de bloedsomloop en versnelt het spierherstel."
        },
        Voeding: {
            Zwaar: "Grote maaltijd gelogd van <b>AMOUNT</b> kcal. Richtlijn voor je macro-verdeling: <b>MACROS</b>.",
            Gemiddeld: "Gebalanceerde maaltijd. Zorg voor een stabiele verdeling van je eiwitten over de dag.",
            Licht: "Lichte maaltijd/snack. Let op dat je aan het einde van de dag wel aan je totale eiwitdoel komt."
        }
    },
    EN: {
        Krachttraining: {
            Zwaar: "Heavy session. Next week your Progressive Overload target for <b>DESC</b> is: <b>TARGET</b>.",
            Gemiddeld: "Good stimulus on <b>DESC</b>. Try to maintain this volume for at least 2 weeks for hypertrophy.",
            Licht: "Active recovery. Perfect session to focus purely on form and ROM of your <b>DESC</b>."
        },
        Cardio: {
            Zwaar: "Intense cardio session (<b>AMOUNT</b> <b>UNIT</b>). You depleted your glycogen stores. Recovery time: 24-36 hours.",
            Gemiddeld: "Great Zone-2 conditioning work. This expands your cardiovascular network.",
            Licht: "Light cardio stimulates blood circulation and speeds up muscle recovery."
        },
        Voeding: {
            Zwaar: "Large meal logged of <b>AMOUNT</b> kcal. Target macro breakdown: <b>MACROS</b>.",
            Gemiddeld: "Balanced meal. Ensure a steady distribution of proteins throughout the day.",
            Licht: "Light meal/snack. Make sure to hit your total daily protein goal by the end of the day."
        }
    }
};

function getSmartAdvice(log, profile, lang = 'NL') {
    let profileAnalysis = "";
    const isEn = lang === 'EN';

    // Live BMI en Waterdoel berekening
    if (profile && profile.height && profile.weight) {
        const heightInMeters = profile.height / 100;
        const bmi = (profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
        const waterTarget = (profile.weight * 0.035).toFixed(1);
        
        let bmiStatus = isEn ? "Healthy" : "Gezond";
        if (bmi < 18.5) bmiStatus = isEn ? "Underweight" : "Ondergewicht";
        else if (bmi >= 25 && bmi < 30) bmiStatus = isEn ? "Overweight" : "Overgewicht";
        else if (bmi >= 30) bmiStatus = isEn ? "Obesity / Heavy Bulk" : "Obesitas / Heavy Bulk";

        if (isEn) {
            profileAnalysis = `📊 <b>Profile</b>: BMI: ${bmi} (${bmiStatus}) • 💧 <b>Hydro Target</b>: ${waterTarget}L water/day.<br><br>`;
        } else {
            profileAnalysis = `📊 <b>Profiel</b>: BMI: ${bmi} (${bmiStatus}) • 💧 <b>Hydro Doel</b>: ${waterTarget}L water/dag.<br><br>`;
        }
    } else {
        profileAnalysis = isEn 
            ? `💡 <i>Tip: Fill in your profile details in 'Settings' for BMI & Water targets.</i><br><br>`
            : `💡 <i>Tip: Vul je profiel in bij 'Instellingen' voor BMI & Water doelen.</i><br><br>`;
    }

    const aiTitle = isEn ? "AI Coach" : "AI Coach";

    if (!log) {
        const noLogTxt = isEn 
            ? "Submit a log to generate a live workout or macro analysis."
            : "Voer een log in voor een actuele workout of macro-analyse.";
        return `🤖 <b>${aiTitle}</b><br>${profileAnalysis}${noLogTxt}`;
    }

    const { category, intensity, description, amount, unit } = log;
    
    // Fallback als categorie (zoals Stappen/Hartslag) geen specifieke template heeft
    if (!aiTemplates[lang][category] || !aiTemplates[lang][category][intensity]) {
        const successTxt = isEn ? "Great job, log processed successfully!" : "Lekker bezig, log succesvol verwerkt!";
        return `🤖 <b>${aiTitle}</b><br>${profileAnalysis}${successTxt}`;
    }

    let advice = aiTemplates[lang][category][intensity];

    // Progressive Overload formule (+2.5kg)
    if (category === "Krachttraining") {
        const nextWeight = Number(amount) + 2.5;
        const nextTarget = isEn ? `${nextWeight}${unit} for the same reps` : `${nextWeight}${unit} voor dezelfde reps`;
        advice = advice.replace("<b>TARGET</b>", `<b>${nextTarget}</b>`);
    }
    
    // Macro opsplitsing formule (30% eiwit, 40% carbs, 30% vet)
    if (category === "Voeding" && intensity === "Zwaar") {
        const eiwit = Math.round((amount * 0.3) / 4);
        const carbs = Math.round((amount * 0.4) / 4);
        const vet = Math.round((amount * 0.3) / 9);
        
        const macroTxt = isEn 
            ? `${eiwit}g Protein, ${carbs}g Carbs, ${vet}g Fat`
            : `${eiwit}g Eiwit, ${carbs}g Carbs, ${vet}g Vet`;
            
        advice = advice.replace("<b>MACROS</b>", `<b>${macroTxt}</b>`);
    }

    advice = advice.replace("<b>DESC</b>", `<b>${description}</b>`).replace("<b>AMOUNT</b>", amount).replace("<b>UNIT</b>", unit);

    return `🤖 <b>${aiTitle}</b><br>${profileAnalysis}${advice}`;
}