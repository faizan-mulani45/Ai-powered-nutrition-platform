// ─── GEMINI API SERVICE ───────────────────────────────────────────────────────
// Get a free key at: https://aistudio.google.com/app/apikey
// Then replace YOUR_GEMINI_API_KEY_HERE below with your actual key.

const GEMINI_API_KEY = '';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

function buildPrompt(form, metrics, modeLabel) {
  return `You are Dr. Aahar, India's most trusted AI nutritionist. Create a personalised 3-day Indian diet plan.

PATIENT: Age ${form.age} | ${form.gender} | ${form.heightCm}cm | ${form.weightKg}kg → ${form.targetWeightKg||form.weightKg}kg
BMI: ${metrics.bmi} (${metrics.bmiCat.label}) | Programme: ${modeLabel}
Diet: ${form.dietType} | Budget: ${form.budget}
Avoid: ${form.avoid?.join(', ')||'none'} | Allergies: ${form.allergies||'none'}
Medical: ${form.medical?.join(', ')||'none'}
Activity: ${form.workType} work + ${form.exerciseTime}min exercise (${form.exerciseTypes?.join(', ')||'none'})

LOCKED TARGETS:
BMR: ${metrics.bmr} kcal | TDEE: ${metrics.tdee} kcal | Activity: ${metrics.activityFactor}x (${metrics.activityLabel})
GOAL: ${metrics.goalCalories} kcal/day | P:${metrics.macros.protein}g C:${metrics.macros.carbs}g F:${metrics.macros.fat}g
Goal type: ${metrics.goal==='loss'?'Weight Loss (-400 kcal)':metrics.goal==='gain'?'Muscle Gain (+250 kcal)':'Maintenance'}
${metrics.weeksToGoal?`Timeline: ~${metrics.weeksToGoal} weeks`:''}

OUTPUT FORMAT (follow exactly):

## Day 1 — [Theme]
**Early Morning (6–7 AM):** [food] — [benefit] — ~[X] kcal
**Breakfast (8–9 AM):** [food] — [benefit] — ~[X] kcal
**Mid Morning (11 AM):** [food] — [benefit] — ~[X] kcal
**Lunch (1–2 PM):** [food] — [benefit] — ~[X] kcal
**Evening Snack (4–5 PM):** [food] — [benefit] — ~[X] kcal
**Dinner (7–8 PM):** [food] — [benefit] — ~[X] kcal
Day Total: ~[sum] kcal | P: [g] | C: [g] | F: [g]

## Day 2 — [Theme]
(same structure, different foods)

## Day 3 — [Theme]
(same structure, different foods)

💪 Exercise Plan
- [4-5 specific exercise recommendations]

🌿 Nutrition Tips
- [5 specific tips for their conditions and goals]

⚠️ Medical Considerations
- [2-3 warnings if they have conditions, else skip this section]

RULES: Only authentic Indian foods with quantities. Each day ±50 kcal of ${metrics.goalCalories}. Respect all restrictions. Vary regional cuisines across days.`;
}

export async function generateDietPlan(form, metrics, modeLabel) {
  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(form, metrics, modeLabel) }] }],
      generationConfig: { maxOutputTokens: 2048, temperature: 0.75, topP: 0.95 },
    }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${response.status} — check your key in src/utils/gemini.js`);
  }
  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No response from Gemini. Please check your API key in src/utils/gemini.js');
  return text;
}
