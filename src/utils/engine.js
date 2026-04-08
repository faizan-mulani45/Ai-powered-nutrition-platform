export function calcBMI(weightKg, heightCm) {
  const h = heightCm / 100;
  return +(weightKg / (h * h)).toFixed(1);
}
export function bmiCategory(bmi) {
  if (bmi < 18.5) return { label: 'Underweight', color: '#60a5fa' };
  if (bmi < 23.0) return { label: 'Normal',       color: '#34d399' };
  if (bmi < 27.5) return { label: 'Overweight',   color: '#fbbf24' };
  return                  { label: 'Obese',        color: '#f87171' };
}
export function calcBMR(weightKg, heightCm, ageYears, gender) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  return Math.round(gender === 'male' ? base + 5 : base - 161);
}
export function calcActivityFactor(workType, exerciseTime) {
  const w = { sedentary:1, light:2, moderate:3, active:4, demanding:5 }[workType] ?? 1;
  const e = { '0':0, '15-30':1, '30-60':2, '60+':3 }[exerciseTime] ?? 0;
  const c = w * 0.7 + e * 0.3;
  if (c < 1.5) return 1.2;
  if (c < 2.2) return 1.375;
  if (c < 2.9) return 1.55;
  if (c < 3.5) return 1.725;
  return 1.9;
}
export function activityLabel(f) {
  if (f <= 1.2)   return 'Sedentary';
  if (f <= 1.375) return 'Lightly Active';
  if (f <= 1.55)  return 'Moderately Active';
  if (f <= 1.725) return 'Very Active';
  return 'Extra Active';
}
export function deriveGoal(cur, tgt) {
  if (!tgt || +tgt === 0) return 'maintain';
  const d = +cur - +tgt;
  if (d > 2) return 'loss';
  if (d < -2) return 'gain';
  return 'maintain';
}
export function calcGoalCalories(tdee, goal) {
  if (goal === 'loss') return tdee - 400;
  if (goal === 'gain') return tdee + 250;
  return tdee;
}
export function calcMacros(kcal, kg, goal) {
  const p = Math.round(goal === 'gain' ? kg*2.2 : goal === 'loss' ? kg*1.8 : kg*1.6);
  const f = Math.round((goal === 'loss' ? kcal*0.25 : kcal*0.30) / 9);
  const c = Math.max(80, Math.round((kcal - p*4 - f*9) / 4));
  return { protein:p, fat:f, carbs:c };
}
export function idealWeightRange(heightCm, gender) {
  const h = heightCm - 152.4;
  const mid = (gender === 'male' ? 50 : 45.5) + 0.9 * (h / 2.54);
  return { min: Math.round(mid - 5), max: Math.round(mid + 5) };
}
export function weeksToGoal(cur, tgt, goalKcal, tdee) {
  if (!tgt || +cur === +tgt) return null;
  const weekly = ((goalKcal - tdee) * 7) / 7700;
  if (weekly === 0) return null;
  return Math.abs(Math.round((+tgt - +cur) / weekly));
}
export function computeAllMetrics(form) {
  const { age, gender, heightCm, weightKg, targetWeightKg, workType, exerciseTime } = form;
  const bmi          = calcBMI(+weightKg, +heightCm);
  const bmiCat       = bmiCategory(bmi);
  const bmr          = calcBMR(+weightKg, +heightCm, +age, gender);
  const af           = calcActivityFactor(workType, exerciseTime);
  const tdee         = Math.round(bmr * af);
  const goal         = deriveGoal(+weightKg, +targetWeightKg);
  const goalCalories = calcGoalCalories(tdee, goal);
  const macros       = calcMacros(goalCalories, +weightKg, goal);
  const idealRange   = idealWeightRange(+heightCm, gender);
  const weeks        = weeksToGoal(+weightKg, +targetWeightKg, goalCalories, tdee);
  return { bmi, bmiCat, bmr, activityFactor:af, activityLabel:activityLabel(af), tdee, goal, goalCalories, macros, idealRange, weeksToGoal:weeks };
}
