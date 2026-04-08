import { useState, useEffect } from 'react';
import StepBar from '../../components/StepBar/StepBar';
import PlanOutput from '../../components/PlanOutput/PlanOutput';
import { Button, Input, Select, PillGroup, StatCard, ProgressBar, Alert, Card, CardHeader, Badge } from '../../components/UI/UI';
import { computeAllMetrics } from '../../utils/engine';
import { generateDietPlan } from '../../utils/gemini';
import './GeneratorPage.css';

const WIZARD_STEPS = ['Programme', 'Personal Info', 'Activity Meter', 'Diet & Health', 'Your Plan'];

const PLAN_MODES = [
  { id: 'diet',   icon: '🥗', title: 'Diet Generation',  desc: 'A complete personalised Indian diet plan calibrated to your body metrics and food preferences.' },
  { id: 'loss',   icon: '⚖️', title: 'Weight Loss Plan',  desc: 'Structured 400 kcal/day deficit using authentic Indian foods for safe, sustainable fat loss.' },
  { id: 'custom', icon: '✨', title: 'Custom Diet Plan',  desc: 'Fully adaptive plan addressing your medical conditions, budget constraints, and dietary restrictions.' },
];

const WORK_TYPES = [
  { value: 'sedentary', icon: '🪑', name: 'Sedentary',      desc: 'Desk-based, minimal movement' },
  { value: 'light',     icon: '🚶', name: 'Light Activity',  desc: 'Teaching, retail, light walking' },
  { value: 'moderate',  icon: '🧑‍💼', name: 'Moderate',       desc: 'Field work, frequent standing' },
  { value: 'active',    icon: '⚡',  name: 'Highly Active',   desc: 'Fitness trainer, nurse, warehouse' },
  { value: 'demanding', icon: '🏗️', name: 'Demanding',       desc: 'Construction, farming, sports' },
];

const EXERCISE_TIMES = [
  { value: '0',     label: 'No Exercise'  },
  { value: '15-30', label: '15–30 min'    },
  { value: '30-60', label: '30–60 min'    },
  { value: '60+',   label: '60+ min'      },
];

const EXERCISE_TYPES = [
  { value: 'walking',  emoji: '🚶', label: 'Walking'          },
  { value: 'strength', emoji: '🏋️', label: 'Strength Training' },
  { value: 'cardio',   emoji: '🏃', label: 'Cardio / Running'  },
  { value: 'yoga',     emoji: '🧘', label: 'Yoga'              },
  { value: 'cycling',  emoji: '🚴', label: 'Cycling'           },
  { value: 'sports',   emoji: '⚽', label: 'Sports'            },
  { value: 'none',     emoji: '😴', label: 'None'              },
];

const MEDICAL = [
  { value: 'diabetes',     emoji: '🩸', label: 'Diabetes'          },
  { value: 'hypertension', emoji: '❤️', label: 'Hypertension'      },
  { value: 'pcos',         emoji: '🌸', label: 'PCOS'              },
  { value: 'thyroid',      emoji: '🦋', label: 'Thyroid Disorder'  },
  { value: 'cholesterol',  emoji: '⚠️', label: 'High Cholesterol'  },
  { value: 'ibs',          emoji: '🫁', label: 'IBS / Gut Issues'  },
  { value: 'none',         emoji: '✅', label: 'None'              },
];

const AVOID = [
  { value: 'eggs',   emoji: '🥚', label: 'Eggs'    },
  { value: 'meat',   emoji: '🥩', label: 'Meat'    },
  { value: 'fish',   emoji: '🐟', label: 'Fish'    },
  { value: 'gluten', emoji: '🌾', label: 'Gluten'  },
  { value: 'dairy',  emoji: '🥛', label: 'Dairy'   },
  { value: 'nuts',   emoji: '🥜', label: 'Nuts'    },
  { value: 'soy',    emoji: '🫘', label: 'Soy'     },
];

const EMPTY_FORM = {
  age: '', gender: 'female', heightCm: '', weightKg: '', targetWeightKg: '',
  dietType: 'vegetarian', budget: 'medium',
  avoid: [], allergies: '',
  medical: [],
  workType: 'sedentary', exerciseTime: '0', exerciseTypes: [],
};

export default function GeneratorPage({ initialMode }) {
  const [step, setStep]       = useState(initialMode ? 1 : 0);
  const [mode, setMode]       = useState(initialMode || '');
  const [form, setForm]       = useState(EMPTY_FORM);
  const [metrics, setMetrics] = useState(null);
  const [planText, setPlanText] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (initialMode) { setMode(initialMode); setStep(1); }
  }, [initialMode]);

  const up = (k) => (e) => setForm((f) => ({ ...f, [k]: typeof e === 'object' && e.target ? e.target.value : e }));

  // Live metrics preview
  const liveMetrics = (form.age && form.heightCm && form.weightKg)
    ? computeAllMetrics(form)
    : null;

  const canAdvance = () => {
    if (step === 0) return !!mode;
    if (step === 1) return !!(form.age && form.heightCm && form.weightKg);
    if (step === 2) return !!(form.workType && form.exerciseTime);
    if (step === 3) return !!form.dietType;
    return true;
  };

  const next = () => {
    if (step === 3) {
      setStep(4);
      runGeneration();
    } else {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const back = () => {
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reset = () => {
    setStep(0); setMode(''); setForm(EMPTY_FORM);
    setMetrics(null); setPlanText(''); setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const runGeneration = async () => {
    setLoading(true);
    setPlanText('');
    setError('');
    const m = computeAllMetrics(form);
    setMetrics(m);
    const modeLabel = mode === 'loss' ? 'Weight Loss' : mode === 'custom' ? 'Custom Plan' : 'Balanced Diet';
    try {
      const text = await generateDietPlan(form, m, modeLabel);
      setPlanText(text);
    } catch (err) {
      setError(err.message || 'Failed to generate plan. Please check your API key in src/utils/gemini.js');
    }
    setLoading(false);
  };

  return (
    <div className="gen-page page-enter">
      <div className="container--narrow">

        {/* Page header */}
        <div className="gen-header">
          <h1 className="gen-header__title">
            {step < 4 ? 'Build Your Plan' : 'Your Personalised Plan'}
          </h1>
          <p className="gen-header__sub">
            {step < 4
              ? 'Answer a few questions — our engine will calculate your exact nutritional needs'
              : 'Science-calculated targets. AI-crafted Indian meals. Ready to follow.'}
          </p>
        </div>

        <StepBar steps={WIZARD_STEPS} current={step} />

        {/* ── STEP 0: MODE ───────────────────────────────────────────────── */}
        {step === 0 && (
          <div className="gen-step gen-step--modes">
            <div className="gen-modes">
              {PLAN_MODES.map((m) => (
                <div
                  key={m.id}
                  className={`gen-mode-card ${mode === m.id ? 'gen-mode-card--active' : ''}`}
                  onClick={() => setMode(m.id)}
                  role="radio"
                  aria-checked={mode === m.id}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setMode(m.id)}
                >
                  {mode === m.id && <div className="gen-mode-card__check">✓</div>}
                  <div className="gen-mode-card__icon">{m.icon}</div>
                  <h3 className="gen-mode-card__title">{m.title}</h3>
                  <p className="gen-mode-card__desc">{m.desc}</p>
                </div>
              ))}
            </div>
            <div className="gen-footer">
              <div />
              <Button variant="primary" size="lg" disabled={!canAdvance()} onClick={next} iconRight="→">
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 1: PERSONAL INFO ──────────────────────────────────────── */}
        {step === 1 && (
          <div className="gen-step">
            <Card bordered elevated>
              <CardHeader icon="👤" title="Personal Information" subtitle="Used for precise health metric calculations (BMI, BMR, TDEE)" />

              <div className="gen-grid-3">
                <Input label="Age" name="age" type="number" min="10" max="100" placeholder="25" value={form.age} onChange={up('age')} required suffix="yrs" />
                <Input label="Height" name="heightCm" type="number" min="100" max="250" placeholder="165" value={form.heightCm} onChange={up('heightCm')} required suffix="cm" />
                <Input label="Current Weight" name="weightKg" type="number" min="30" max="300" placeholder="65" value={form.weightKg} onChange={up('weightKg')} required suffix="kg" />
              </div>

              <div className="gen-grid-2" style={{ marginTop: 16 }}>
                <Input
                  label="Target Weight"
                  name="targetWeightKg"
                  type="number"
                  placeholder="Optional — leave blank to maintain"
                  value={form.targetWeightKg}
                  onChange={up('targetWeightKg')}
                  suffix="kg"
                  hint="Leave blank for maintenance"
                />
                <Select
                  label="Biological Sex"
                  name="gender"
                  value={form.gender}
                  onChange={up('gender')}
                  required
                  options={[
                    { value: 'female', label: 'Female' },
                    { value: 'male',   label: 'Male' },
                  ]}
                />
              </div>

              {/* Live preview */}
              {liveMetrics && (
                <div className="gen-live-preview">
                  <div className="gen-live-preview__label">Live Health Preview</div>
                  <div className="gen-live-stats">
                    <div className="gen-live-stat">
                      <span className="gen-live-stat__val" style={{ color: liveMetrics.bmiCat.color }}>
                        {liveMetrics.bmi}
                      </span>
                      <span className="gen-live-stat__sub">BMI · {liveMetrics.bmiCat.label}</span>
                    </div>
                    <div className="gen-live-divider" />
                    <div className="gen-live-stat">
                      <span className="gen-live-stat__val">{liveMetrics.bmr}</span>
                      <span className="gen-live-stat__sub">kcal Basal Rate</span>
                    </div>
                    {liveMetrics.idealRange && (
                      <>
                        <div className="gen-live-divider" />
                        <div className="gen-live-stat">
                          <span className="gen-live-stat__val">{liveMetrics.idealRange.min}–{liveMetrics.idealRange.max}</span>
                          <span className="gen-live-stat__sub">kg Ideal Range</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </Card>

            <div className="gen-footer">
              <Button variant="ghost" size="lg" onClick={back}>← Back</Button>
              <Button variant="primary" size="lg" disabled={!canAdvance()} onClick={next} iconRight="→">
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 2: ACTIVITY METER ─────────────────────────────────────── */}
        {step === 2 && (
          <div className="gen-step">
            <Card bordered elevated>
              <CardHeader icon="🏃" title="Activity Meter" subtitle="Determines your Total Daily Energy Expenditure with 70/30 work-exercise weighting" />

              <div className="gen-section">
                <div className="gen-section__label">A. Work Type — What does a typical workday look like?</div>
                <div className="gen-work-grid">
                  {WORK_TYPES.map((w) => (
                    <div
                      key={w.value}
                      className={`gen-work-card ${form.workType === w.value ? 'gen-work-card--active' : ''}`}
                      onClick={() => up('workType')(w.value)}
                      role="radio"
                      aria-checked={form.workType === w.value}
                      tabIndex={0}
                    >
                      <div className="gen-work-card__icon">{w.icon}</div>
                      <div className="gen-work-card__name">{w.name}</div>
                      <div className="gen-work-card__desc">{w.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="gen-section">
                <div className="gen-section__label">B. Daily Exercise Duration</div>
                <PillGroup options={EXERCISE_TIMES} value={form.exerciseTime} onChange={up('exerciseTime')} />
              </div>

              <div className="gen-section">
                <div className="gen-section__label">C. Exercise Types (select all that apply)</div>
                <PillGroup options={EXERCISE_TYPES} value={form.exerciseTypes} onChange={up('exerciseTypes')} multi />
              </div>

              {/* Live TDEE preview */}
              {liveMetrics && (
                <div className="gen-live-preview">
                  <div className="gen-live-preview__label">Calculated Activity Profile</div>
                  <div className="gen-live-stats">
                    <div className="gen-live-stat">
                      <span className="gen-live-stat__val" style={{ color: 'var(--saffron-light)' }}>{liveMetrics.activityFactor}×</span>
                      <span className="gen-live-stat__sub">Activity Factor</span>
                    </div>
                    <div className="gen-live-divider" />
                    <div className="gen-live-stat">
                      <span className="gen-live-stat__val">{liveMetrics.tdee}</span>
                      <span className="gen-live-stat__sub">kcal TDEE / day</span>
                    </div>
                    <div className="gen-live-divider" />
                    <div className="gen-live-stat">
                      <span className="gen-live-stat__val" style={{ color: 'var(--mint)' }}>{liveMetrics.activityLabel}</span>
                      <span className="gen-live-stat__sub">Activity Level</span>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            <div className="gen-footer">
              <Button variant="ghost" size="lg" onClick={back}>← Back</Button>
              <Button variant="primary" size="lg" disabled={!canAdvance()} onClick={next} iconRight="→">
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 3: DIET & HEALTH ──────────────────────────────────────── */}
        {step === 3 && (
          <div className="gen-step">
            <Card bordered elevated>
              <CardHeader icon="🍛" title="Diet & Health Profile" subtitle="Personalises every meal in your plan" />

              <div className="gen-section">
                <div className="gen-section__label">Diet Preference</div>
                <PillGroup
                  options={[
                    { value: 'vegetarian',     emoji: '🥦', label: 'Vegetarian'      },
                    { value: 'non-vegetarian', emoji: '🍗', label: 'Non-Vegetarian'  },
                    { value: 'jain',           emoji: '🌿', label: 'Jain'            },
                    { value: 'vegan',          emoji: '🌱', label: 'Vegan'           },
                    { value: 'eggetarian',     emoji: '🥚', label: 'Eggetarian'      },
                  ]}
                  value={form.dietType}
                  onChange={up('dietType')}
                />
              </div>

              <div className="gen-section">
                <div className="gen-section__label">Daily Food Budget</div>
                <PillGroup
                  options={[
                    { value: 'low',    emoji: '💰', label: 'Low  (₹100–200/day)'   },
                    { value: 'medium', emoji: '💰', label: 'Medium  (₹200–400/day)' },
                    { value: 'high',   emoji: '💰', label: 'High  (₹400+/day)'     },
                  ]}
                  value={form.budget}
                  onChange={up('budget')}
                />
              </div>

              <div className="gen-section">
                <div className="gen-section__label">Foods to Avoid</div>
                <PillGroup options={AVOID} value={form.avoid} onChange={up('avoid')} multi />
              </div>

              <div className="gen-section">
                <div className="gen-section__label">Medical Conditions</div>
                <PillGroup options={MEDICAL} value={form.medical} onChange={up('medical')} multi />
              </div>

              <div className="gen-section">
                <div className="gen-section__label">Other Allergies / Notes for Dr. Aahar AI</div>
                <Input
                  name="allergies"
                  value={form.allergies}
                  onChange={up('allergies')}
                  placeholder="e.g. peanut allergy, prefer South Indian cuisine, no onion-garlic…"
                />
              </div>
            </Card>

            <div className="gen-footer">
              <Button variant="ghost" size="lg" onClick={back}>← Back</Button>
              <Button variant="primary" size="lg" onClick={next} iconRight="✦">
                Generate My Plan
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 4: RESULTS ────────────────────────────────────────────── */}
        {step === 4 && (
          <div className="gen-step">
            {/* Metrics dashboard */}
            {metrics && (
              <>
                <div className="gen-metrics">
                  <StatCard
                    value={metrics.bmi}
                    unit={metrics.bmiCat.label}
                    label="BMI (South Asian)"
                    color={metrics.bmiCat.color}
                    sublabel="WHO adapted thresholds"
                  />
                  <StatCard
                    value={metrics.bmr}
                    unit="kcal / day"
                    label="Basal Metabolic Rate"
                    color="var(--turmeric-light)"
                    sublabel="Mifflin-St Jeor formula"
                  />
                  <StatCard
                    value={metrics.tdee}
                    unit="kcal / day"
                    label="Total Daily Energy"
                    color="var(--turmeric-light)"
                    sublabel={`${metrics.activityFactor}× activity factor`}
                  />
                  <StatCard
                    value={metrics.goalCalories}
                    unit="kcal / day"
                    label={`Target (${metrics.goal})`}
                    color="var(--saffron-light)"
                    sublabel={
                      metrics.goal === 'loss'     ? '−400 kcal deficit' :
                      metrics.goal === 'gain'     ? '+250 kcal surplus' :
                      'maintenance calories'
                    }
                  />
                </div>

                {/* Macro bars */}
                <Card bordered className="gen-macros-card">
                  <CardHeader
                    icon="📊"
                    title="Daily Macro Targets"
                    subtitle={`Algorithmically locked · Goal: ${metrics.goal} · ${metrics.activityLabel}`}
                    action={
                      metrics.weeksToGoal
                        ? <Badge variant="saffron" size="sm">~{metrics.weeksToGoal} weeks to goal</Badge>
                        : null
                    }
                  />
                  <div className="gen-macros">
                    {[
                      { label: 'Protein', val: metrics.macros.protein, unit: 'g', factor: 4, color: 'blue',   hint: 'Muscle preservation' },
                      { label: 'Carbs',   val: metrics.macros.carbs,   unit: 'g', factor: 4, color: 'gold',   hint: 'Primary energy source' },
                      { label: 'Fat',     val: metrics.macros.fat,     unit: 'g', factor: 9, color: 'red',    hint: 'Hormones & absorption' },
                    ].map((m) => {
                      const pct = Math.min(100, Math.round((m.val * m.factor / metrics.goalCalories) * 100));
                      return (
                        <ProgressBar
                          key={m.label}
                          value={pct}
                          color={m.color}
                          label={`${m.label} — ${m.hint}`}
                          sublabel={`${m.val}${m.unit} (${pct}% of calories)`}
                        />
                      );
                    })}
                  </div>
                </Card>
              </>
            )}

            {/* AI Plan */}
            <Card bordered className="gen-plan-card">
              <CardHeader
                icon="🤖"
                title="AI-Generated Indian Diet Plan"
                subtitle="3-day plan with authentic Indian meals, exercise guidance & medical nutrition tips"
              />

              {error && (
                <div style={{ marginBottom: 20 }}>
                  <Alert type="error">{error}</Alert>
                </div>
              )}

              <PlanOutput text={planText} loading={loading} />
            </Card>

            {/* Actions */}
            <div className="gen-footer gen-footer--results">
              <Button variant="ghost" size="lg" onClick={reset}>← Start Over</Button>
              <div style={{ display: 'flex', gap: 12 }}>
                <Button variant="secondary" size="lg" onClick={back}>← Edit Profile</Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={runGeneration}
                  disabled={loading}
                  loading={loading}
                  icon="↺"
                >
                  Regenerate Plan
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
