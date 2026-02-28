import { useState } from "react";

// ─── DETERMINISTIC ENGINE ─────────────────────────────────────────────────────

function calcBMI(weight, height) {
  const h = height / 100;
  return +(weight / (h * h)).toFixed(1);
}

function bmiCategory(bmi) {
  if (bmi < 18.5) return { label: "Underweight", color: "#60a5fa" };
  if (bmi < 25)   return { label: "Normal",       color: "#34d399" };
  if (bmi < 30)   return { label: "Overweight",   color: "#fbbf24" };
  return           { label: "Obese",          color: "#f87171" };
}

function calcBMR(weight, height, age, gender) {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return Math.round(gender === "male" ? base + 5 : base - 161);
}

function calcActivityFactor(workType, exerciseTime) {
  const workScore = { sedentary: 1, light: 2, moderate: 3, active: 4, demanding: 5 }[workType] || 1;
  const exScore   = { "0": 0, "15-30": 1, "30-60": 2, "60+": 3 }[exerciseTime] || 0;
  const combined  = workScore * 0.7 + exScore * 0.3;
  if (combined < 1.5) return 1.2;
  if (combined < 2.2) return 1.375;
  if (combined < 2.9) return 1.55;
  if (combined < 3.5) return 1.725;
  return 1.9;
}

function calcGoalCalories(tdee, goal) {
  if (goal === "loss") return tdee - 400;
  if (goal === "gain") return tdee + 250;
  return tdee;
}

function calcMacros(calories, weight, goal) {
  const protein = Math.round(goal === "gain" ? weight * 2.2 : weight * 1.8);
  const fat     = Math.round((goal === "loss" ? calories * 0.25 : calories * 0.3) / 9);
  const carbs   = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));
  return { protein, fat, carbs };
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --saffron:#FF6B00;--turmeric:#F5A623;--cardamom:#2D5016;
    --bg:#0F0A06;--surface:#1A120A;--surface2:#241A10;
    --border:rgba(245,166,35,0.15);--text:#F5EDD8;--muted:#8A7A65;--radius:16px;
  }
  body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;min-height:100vh}
  .app{min-height:100vh;background:radial-gradient(ellipse at 80% 0%,#1f1008 0%,#0F0A06 50%)}
  .deco1{position:fixed;top:-200px;right:-200px;width:600px;height:600px;background:radial-gradient(circle,rgba(255,107,0,.06) 0%,transparent 70%);border-radius:50%;pointer-events:none;z-index:0}
  .deco2{position:fixed;bottom:-100px;left:-100px;width:400px;height:400px;background:radial-gradient(circle,rgba(245,166,35,.05) 0%,transparent 70%);border-radius:50%;pointer-events:none;z-index:0}

  /* HEADER */
  .hdr{position:relative;z-index:10;padding:20px 40px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
  .logo{display:flex;align-items:center;gap:12px}
  .logo-icon{width:40px;height:40px;background:linear-gradient(135deg,var(--saffron),var(--turmeric));border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px}
  .logo-name{font-family:'Playfair Display',serif;font-size:22px;font-weight:700}
  .logo-sub{font-size:11px;color:var(--muted);letter-spacing:2px;text-transform:uppercase}
  .badge{background:linear-gradient(135deg,rgba(255,107,0,.2),rgba(245,166,35,.2));border:1px solid rgba(255,107,0,.3);color:var(--turmeric);padding:6px 14px;border-radius:20px;font-size:12px;font-weight:500}

  /* LAYOUT */
  .wrap{position:relative;z-index:1;max-width:1100px;margin:0 auto;padding:40px 24px}

  /* STEPS */
  .steps{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:4px;margin-bottom:48px}
  .s-item{display:flex;align-items:center;gap:8px}
  .s-dot{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;border:2px solid var(--border);color:var(--muted);transition:all .3s}
  .s-dot.active{background:var(--saffron);border-color:var(--saffron);color:#fff;box-shadow:0 0 20px rgba(255,107,0,.4)}
  .s-dot.done{background:var(--cardamom);border-color:#4a7a24;color:#86efac}
  .s-lbl{font-size:12px;color:var(--muted);white-space:nowrap}
  .s-lbl.active{color:var(--turmeric)}
  .s-line{width:40px;height:1px;background:var(--border);margin:0 4px}
  .s-line.done{background:var(--cardamom)}

  /* CARD */
  .card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:32px;margin-bottom:24px;box-shadow:0 4px 24px rgba(0,0,0,.3)}
  .card-hdr{display:flex;align-items:center;gap:12px;margin-bottom:28px}
  .card-ico{width:36px;height:36px;background:linear-gradient(135deg,rgba(255,107,0,.2),rgba(245,166,35,.1));border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
  .card-ttl{font-family:'Playfair Display',serif;font-size:20px;font-weight:700}
  .card-sub{font-size:13px;color:var(--muted);margin-top:2px}

  /* FORM */
  .g2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px}
  .fld{display:flex;flex-direction:column;gap:8px}
  .lbl{font-size:12px;font-weight:600;color:var(--muted);letter-spacing:1px;text-transform:uppercase}
  .inp{background:var(--surface2);border:1px solid var(--border);border-radius:10px;color:var(--text);padding:12px 16px;font-size:15px;font-family:'DM Sans',sans-serif;outline:none;transition:all .2s;width:100%}
  .inp:focus{border-color:var(--saffron);box-shadow:0 0 0 3px rgba(255,107,0,.1)}
  .sel{background:var(--surface2);border:1px solid var(--border);border-radius:10px;color:var(--text);padding:12px 16px;font-size:15px;font-family:'DM Sans',sans-serif;outline:none;cursor:pointer;width:100%;-webkit-appearance:none}
  .sel:focus{border-color:var(--saffron)}

  /* PILLS */
  .pills{display:flex;flex-wrap:wrap;gap:10px}
  .pill{padding:8px 18px;border-radius:20px;border:1px solid var(--border);background:var(--surface2);color:var(--muted);font-size:13px;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif}
  .pill:hover{border-color:var(--saffron);color:var(--turmeric)}
  .pill.on{background:linear-gradient(135deg,rgba(255,107,0,.2),rgba(245,166,35,.15));border-color:var(--saffron);color:var(--turmeric)}

  /* ACTIVITY METER */
  .sec{margin-bottom:28px}
  .sec-ttl{font-size:12px;font-weight:600;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:12px}
  .act-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
  .act-card{background:var(--surface2);border:1px solid var(--border);border-radius:12px;padding:14px 16px;cursor:pointer;transition:all .2s}
  .act-card:hover{border-color:var(--saffron)}
  .act-card.on{background:linear-gradient(135deg,rgba(255,107,0,.15),rgba(245,166,35,.1));border-color:var(--saffron)}
  .act-ico{font-size:22px;margin-bottom:6px}
  .act-nm{font-size:13px;font-weight:500;color:var(--text)}
  .act-ds{font-size:11px;color:var(--muted);margin-top:2px}

  /* METRICS */
  .metrics-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px}
  .m-box{background:var(--surface2);border:1px solid var(--border);border-radius:14px;padding:20px;text-align:center;position:relative;overflow:hidden}
  .m-box::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--saffron),var(--turmeric))}
  .m-val{font-family:'Playfair Display',serif;font-size:28px;font-weight:700}
  .m-unit{font-size:12px;color:var(--muted);margin-top:2px}
  .m-name{font-size:11px;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-top:8px}

  /* MACRO BARS */
  .mbars{display:flex;flex-direction:column;gap:14px}
  .mrow{display:flex;align-items:center;gap:14px}
  .mlbl{width:70px;font-size:13px;color:var(--muted)}
  .mtrack{flex:1;background:var(--surface2);border-radius:6px;height:10px;overflow:hidden}
  .mbar{height:100%;border-radius:6px;transition:width .8s ease}
  .mnum{width:80px;font-size:13px;font-weight:600;color:var(--text);text-align:right}

  /* BUTTONS */
  .btn{padding:14px 32px;border-radius:12px;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:600;transition:all .2s;display:inline-flex;align-items:center;gap:8px}
  .btn-p{background:linear-gradient(135deg,var(--saffron),var(--turmeric));color:#fff}
  .btn-p:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(255,107,0,.4)}
  .btn-p:disabled{opacity:.5;cursor:not-allowed;transform:none;box-shadow:none}
  .btn-g{background:transparent;border:1px solid var(--border);color:var(--muted)}
  .btn-g:hover{border-color:var(--saffron);color:var(--turmeric)}
  .btn-row{display:flex;justify-content:space-between;align-items:center;margin-top:32px}

  /* MODE CARDS */
  .mode-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:40px}
  .mode-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:28px 20px;cursor:pointer;transition:all .3s;text-align:center}
  .mode-card:hover{border-color:var(--saffron);transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,.4)}
  .mode-card.on{border-color:var(--saffron);background:linear-gradient(135deg,rgba(255,107,0,.1),rgba(245,166,35,.05))}
  .mc-ico{font-size:36px;margin-bottom:12px}
  .mc-ttl{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;margin-bottom:6px}
  .mc-dsc{font-size:13px;color:var(--muted);line-height:1.6}

  /* HERO */
  .hero{text-align:center;padding:60px 20px 48px}
  .hero-tag{display:inline-block;background:linear-gradient(135deg,rgba(255,107,0,.15),rgba(245,166,35,.1));border:1px solid rgba(255,107,0,.3);color:var(--turmeric);padding:6px 18px;border-radius:20px;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin-bottom:20px}
  .hero h1{font-family:'Playfair Display',serif;font-size:52px;font-weight:900;line-height:1.1;margin-bottom:16px}
  .hero h1 span{background:linear-gradient(135deg,var(--saffron),var(--turmeric));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .hero p{font-size:17px;color:var(--muted);max-width:500px;margin:0 auto 36px;line-height:1.7}

  /* PREVIEW BOX */
  .preview{background:var(--surface2);border-radius:12px;padding:16px 20px;border:1px solid var(--border);margin-top:16px}

  /* RESULTS */
  .res-hdr{text-align:center;margin-bottom:40px}
  .res-hdr h2{font-family:'Playfair Display',serif;font-size:32px;font-weight:700;margin-bottom:8px}
  .res-hdr p{color:var(--muted);font-size:15px}

  /* AI OUTPUT */
  .ai-wrap{background:var(--surface2);border:1px solid var(--border);border-radius:14px;padding:28px}
  .loading{display:flex;align-items:center;gap:12px;color:var(--turmeric);font-size:15px;padding:20px 0}
  .spin{width:22px;height:22px;border:2px solid rgba(245,166,35,.2);border-top-color:var(--turmeric);border-radius:50%;animation:spin .8s linear infinite;flex-shrink:0}
  @keyframes spin{to{transform:rotate(360deg)}}
  .day-ttl{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:var(--turmeric);margin:20px 0 14px;border-bottom:1px solid var(--border);padding-bottom:8px}
  .meal-row{display:flex;gap:12px;margin-bottom:10px;background:var(--surface);border-radius:10px;padding:12px 14px}
  .meal-badge{background:linear-gradient(135deg,rgba(255,107,0,.2),rgba(245,166,35,.1));color:var(--turmeric);font-size:11px;font-weight:600;padding:3px 10px;border-radius:10px;white-space:nowrap;align-self:flex-start;margin-top:2px;letter-spacing:.5px}
  .meal-body{flex:1}
  .meal-name{font-size:14px;font-weight:600;color:var(--text);margin-bottom:3px}
  .meal-desc{font-size:12px;color:var(--muted);line-height:1.5}
  .ex-box{background:linear-gradient(135deg,rgba(45,80,22,.2),rgba(45,80,22,.1));border:1px solid rgba(74,122,36,.3);border-radius:12px;padding:20px;margin-top:20px}
  .ex-ttl{font-family:'Playfair Display',serif;font-size:16px;color:#86efac;margin-bottom:12px}
  .ex-item{display:flex;align-items:flex-start;gap:10px;margin-bottom:8px;font-size:13px;color:var(--text);line-height:1.5}
  .ex-dot{width:6px;height:6px;background:#86efac;border-radius:50%;flex-shrink:0;margin-top:5px}
  .tip-box{background:linear-gradient(135deg,rgba(139,26,26,.2),rgba(139,26,26,.1));border:1px solid rgba(139,26,26,.3);border-radius:12px;padding:20px;margin-top:16px}
  .tip-ttl{font-size:14px;font-weight:600;color:#fca5a5;margin-bottom:12px}
  .tip-item{display:flex;gap:8px;margin-bottom:8px;font-size:13px;color:var(--text);line-height:1.5;align-items:flex-start}
  .plain{font-size:13px;color:var(--text);line-height:1.7;margin-bottom:6px}
  .err{background:rgba(139,26,26,.2);border:1px solid rgba(248,113,113,.3);border-radius:10px;padding:12px 16px;color:#fca5a5;margin-bottom:16px;font-size:14px}

  @media(max-width:768px){
    .g2,.g3,.metrics-grid,.mode-grid{grid-template-columns:1fr 1fr}
    .hdr{padding:16px 20px}
    .hero h1{font-size:34px}
    .wrap{padding:24px 16px}
    .card{padding:20px}
  }
  @media(max-width:480px){
    .g2,.g3,.metrics-grid,.mode-grid{grid-template-columns:1fr}
  }
`;

// ─── DATA ─────────────────────────────────────────────────────────────────────

const STEPS = ["Mode", "Personal", "Activity", "Diet & Health", "Your Plan"];

const WORK_TYPES = [
  { value: "sedentary", icon: "🪑", name: "Sedentary",     desc: "Desk work all day"  },
  { value: "light",     icon: "🚶", name: "Light",          desc: "Some walking"       },
  { value: "moderate",  icon: "🧑‍💼", name: "Moderate",      desc: "On feet often"      },
  { value: "active",    icon: "⚡",  name: "Highly Active",  desc: "Physical work"      },
  { value: "demanding", icon: "🏗️", name: "Demanding",      desc: "Labour / sports"    },
];

const EXERCISE_TIMES = [
  { value: "0",     label: "0 min"      },
  { value: "15-30", label: "15–30 min"  },
  { value: "30-60", label: "30–60 min"  },
  { value: "60+",   label: "60+ min"    },
];

const EXERCISE_TYPES = [
  { value: "walking",  emoji: "🚶", label: "Walking"          },
  { value: "strength", emoji: "🏋️", label: "Strength Training" },
  { value: "cardio",   emoji: "🏃", label: "Cardio"            },
  { value: "yoga",     emoji: "🧘", label: "Yoga"              },
  { value: "sports",   emoji: "⚽", label: "Sports"            },
  { value: "none",     emoji: "😴", label: "None"              },
];

const MEDICAL = [
  { value: "diabetes",     emoji: "🩸", label: "Diabetes"          },
  { value: "hypertension", emoji: "❤️", label: "Hypertension"      },
  { value: "pcos",         emoji: "🌸", label: "PCOS"              },
  { value: "thyroid",      emoji: "🦋", label: "Thyroid"           },
  { value: "cholesterol",  emoji: "⚠️", label: "High Cholesterol"  },
  { value: "none",         emoji: "✅", label: "None"              },
];

const AVOID = [
  { value: "eggs",   emoji: "🥚", label: "Avoid Eggs"   },
  { value: "meat",   emoji: "🥩", label: "Avoid Meat"   },
  { value: "gluten", emoji: "🌾", label: "Avoid Gluten" },
  { value: "dairy",  emoji: "🥛", label: "Avoid Dairy"  },
  { value: "nuts",   emoji: "🥜", label: "Avoid Nuts"   },
];

// ─── SMALL COMPONENTS ────────────────────────────────────────────────────────

function StepBar({ current }) {
  return (
    <div className="steps">
      {STEPS.map((s, i) => (
        <div key={s} className="s-item">
          {i > 0 && <div className={`s-line${i <= current ? " done" : ""}`} />}
          <div className={`s-dot${i === current ? " active" : i < current ? " done" : ""}`}>
            {i < current ? "✓" : i + 1}
          </div>
          <span className={`s-lbl${i === current ? " active" : ""}`}>{s}</span>
        </div>
      ))}
    </div>
  );
}

function Pills({ options, value, onChange, multi = false }) {
  const sel = multi ? (Array.isArray(value) ? value : []) : value;
  return (
    <div className="pills">
      {options.map((o) => {
        const active = multi ? sel.includes(o.value) : sel === o.value;
        return (
          <button
            key={o.value}
            className={`pill${active ? " on" : ""}`}
            onClick={() => {
              if (multi) {
                onChange(active ? sel.filter((v) => v !== o.value) : [...sel, o.value]);
              } else {
                onChange(o.value);
              }
            }}
          >
            {o.emoji && `${o.emoji} `}{o.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── AI OUTPUT RENDERER ───────────────────────────────────────────────────────

function AIOutput({ text, loading }) {
  if (loading) {
    return (
      <div className="ai-wrap">
        <div className="loading">
          <div className="spin" />
          Crafting your personalised Indian nutrition plan…
        </div>
      </div>
    );
  }
  if (!text) return null;

  const lines = text.split("\n");

  // We'll collect sections as typed objects, then render them
  const sections = [];
  let currentSection = null;

  const flush = () => {
    if (currentSection) sections.push(currentSection);
    currentSection = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    if (/^##\s*Day/i.test(line)) {
      flush();
      currentSection = { type: "day", title: line.replace(/^#+\s*/, ""), meals: [] };
    } else if (/💪|🏃|^exercise|^workout/i.test(line) && !/^[-•]/.test(line)) {
      flush();
      currentSection = { type: "exercise", title: line, items: [] };
    } else if (/🌿|^key nutrition|^tip|^advice/i.test(line) && !/^[-•]/.test(line)) {
      flush();
      currentSection = { type: "tips", title: line, items: [] };
    } else if (/^[-•]\s/.test(line)) {
      const text2 = line.replace(/^[-•]\s*/, "");
      if (currentSection && (currentSection.type === "exercise" || currentSection.type === "tips")) {
        currentSection.items.push(text2);
      } else {
        sections.push({ type: "plain", text: text2 });
      }
    } else if (/^\*\*|^(Early Morning|Breakfast|Mid Morning|Lunch|Evening|Dinner|Snack)/i.test(line)) {
      const clean = line.replace(/\*\*/g, "");
      const colonIdx = clean.indexOf(":");
      if (colonIdx > -1) {
        const time = clean.slice(0, colonIdx).trim();
        const rest = clean.slice(colonIdx + 1).trim();
        const parts = rest.split(/\s*[–-]\s*/);
        const meal = { time, name: parts[0] || "", desc: parts.slice(1).join(" – ") };
        if (currentSection && currentSection.type === "day") {
          currentSection.meals.push(meal);
        } else {
          sections.push({ type: "meal", ...meal });
        }
      }
    } else {
      sections.push({ type: "plain", text: line });
    }
  }
  flush();

  return (
    <div className="ai-wrap">
      {sections.map((sec, i) => {
        if (sec.type === "day") {
          return (
            <div key={i}>
              <div className="day-ttl">{sec.title}</div>
              {sec.meals.map((m, j) => (
                <div key={j} className="meal-row">
                  <div className="meal-badge">{m.time}</div>
                  <div className="meal-body">
                    <div className="meal-name">{m.name}</div>
                    {m.desc && <div className="meal-desc">{m.desc}</div>}
                  </div>
                </div>
              ))}
            </div>
          );
        }
        if (sec.type === "meal") {
          return (
            <div key={i} className="meal-row">
              <div className="meal-badge">{sec.time}</div>
              <div className="meal-body">
                <div className="meal-name">{sec.name}</div>
                {sec.desc && <div className="meal-desc">{sec.desc}</div>}
              </div>
            </div>
          );
        }
        if (sec.type === "exercise") {
          return (
            <div key={i} className="ex-box">
              <div className="ex-ttl">{sec.title}</div>
              {sec.items.map((item, j) => (
                <div key={j} className="ex-item">
                  <div className="ex-dot" />
                  {item}
                </div>
              ))}
            </div>
          );
        }
        if (sec.type === "tips") {
          return (
            <div key={i} className="tip-box">
              <div className="tip-ttl">{sec.title}</div>
              {sec.items.map((item, j) => (
                <div key={j} className="tip-item">
                  <span style={{ color: "var(--turmeric)" }}>✦</span>
                  {item}
                </div>
              ))}
            </div>
          );
        }
        return <p key={i} className="plain">{sec.text}</p>;
      })}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

const DEFAULT_FORM = {
  age: "", gender: "female", height: "", weight: "", targetWeight: "",
  diet: "vegetarian", budget: "medium",
  avoid: [], allergies: "",
  medical: [],
  workType: "sedentary", exerciseTime: "0", exerciseTypes: [],
};

export default function App() {
  const [step, setStep]       = useState(0);
  const [mode, setMode]       = useState("");
  const [form, setForm]       = useState(DEFAULT_FORM);
  const [metrics, setMetrics] = useState(null);
  const [aiText, setAiText]   = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError]     = useState("");

  const up = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  function computeMetrics() {
    const af       = calcActivityFactor(form.workType, form.exerciseTime);
    const bmi      = calcBMI(+form.weight, +form.height);
    const bmr      = calcBMR(+form.weight, +form.height, +form.age, form.gender);
    const tdee     = Math.round(bmr * af);
    const wDiff    = form.targetWeight ? +form.weight - +form.targetWeight : 0;
    const goal     = wDiff > 2 ? "loss" : wDiff < -2 ? "gain" : "maintain";
    const goalCals = calcGoalCalories(tdee, goal);
    const macros   = calcMacros(goalCals, +form.weight, goal);
    return { bmi, bmiCat: bmiCategory(bmi), bmr, tdee, goalCals, goal, af, macros };
  }

  async function generatePlan() {
    setAiLoading(true);
    setAiText("");
    setError("");
    const m = computeMetrics();
    setMetrics(m);
    const modeLabel = mode === "loss" ? "Weight Loss" : mode === "gain" ? "Muscle Gain" : "Balanced Diet";

    const prompt = `You are an expert Indian nutritionist. Create a structured 3-day personalised Indian diet plan.

PATIENT PROFILE:
- Age: ${form.age} | Gender: ${form.gender}
- Height: ${form.height}cm | Current Weight: ${form.weight}kg | Target: ${form.targetWeight || form.weight}kg
- BMI: ${m.bmi} (${m.bmiCat.label}) | Programme: ${modeLabel}
- Diet: ${form.diet} | Budget: ${form.budget} | Avoid: ${form.avoid.join(", ") || "nothing"}
- Allergies: ${form.allergies || "none"} | Medical: ${form.medical.join(", ") || "none"}

CALCULATED TARGETS (DO NOT CHANGE):
- BMR: ${m.bmr} kcal | TDEE: ${m.tdee} kcal | Goal Calories: ${m.goalCals} kcal
- Protein: ${m.macros.protein}g | Carbs: ${m.macros.carbs}g | Fat: ${m.macros.fat}g
- Activity Factor: ${m.af}x | Goal: ${m.goal}

FORMAT EXACTLY LIKE THIS:

## Day 1
**Early Morning:** Warm lemon water with jeera – helps digestion – ~5 kcal
**Breakfast:** Moong dal chilla with mint chutney – high protein – ~320 kcal
**Mid Morning:** Roasted chana – protein snack – ~120 kcal
**Lunch:** Brown rice + rajma + cucumber raita – balanced – ~480 kcal
**Evening Snack:** Masala buttermilk + fruit – refreshing – ~100 kcal
**Dinner:** Palak dal + 2 multigrain roti + salad – light – ~380 kcal

## Day 2
(same format, different foods)

## Day 3
(same format, different foods)

💪 Exercise Recommendations
- 4-5 specific recommendations based on their activity level and goal

🌿 Key Nutrition Tips
- 4-5 tips specific to their medical conditions and goals

Use authentic Indian foods only. Stay within ${form.budget} budget. Respect all dietary restrictions.`;

    const GEMINI_API_KEY = ""; // ← paste your key here

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 2048, temperature: 0.7 },
          }),
        }
      );
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        setAiText(text);
      } else {
        setError("Could not generate plan. Check your API key and try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    }
    setAiLoading(false);
  }

  const canNext = () => {
    if (step === 0) return !!mode;
    if (step === 1) return !!(form.age && form.height && form.weight);
    if (step === 2) return !!(form.workType && form.exerciseTime);
    if (step === 3) return !!form.diet;
    return true;
  };

  const goNext = () => {
    if (step === 3) { setStep(4); generatePlan(); }
    else setStep((s) => s + 1);
  };

  // live preview for step 1
  const live = (form.age && form.height && form.weight) ? (() => {
    const bmi = calcBMI(+form.weight, +form.height);
    const bmr = calcBMR(+form.weight, +form.height, +form.age, form.gender);
    return { bmi, cat: bmiCategory(bmi), bmr };
  })() : null;

  // live preview for step 2
  const live2 = (form.workType && form.exerciseTime && form.weight && form.height && form.age) ? (() => {
    const af   = calcActivityFactor(form.workType, form.exerciseTime);
    const bmr  = calcBMR(+form.weight, +form.height, +form.age, form.gender);
    const tdee = Math.round(bmr * af);
    return { af, tdee };
  })() : null;

  return (
    <div className="app">
      <style>{css}</style>
      <div className="deco1" />
      <div className="deco2" />

      {/* HEADER */}
      <header className="hdr">
        <div className="logo">
          <div className="logo-icon">🌿</div>
          <div>
            <div className="logo-name">Aahar AI</div>
            <div className="logo-sub">Indian Nutrition Intelligence</div>
          </div>
        </div>
        <div className="badge">✦ Powered by Gemini AI</div>
      </header>

      <div className="wrap">

        {/* ── STEP 0: MODE ─────────────────────────────────────────────────── */}
        {step === 0 && (
          <>
            <div className="hero">
              <div className="hero-tag">✦ Personalised Indian Nutrition</div>
              <h1>Your Health,<br /><span>Your Thali</span></h1>
              <p>Deterministic health calculations combined with AI-generated Indian meal plans crafted for your body, lifestyle &amp; taste.</p>
            </div>
            <StepBar current={0} />
            <div className="card">
              <div className="card-hdr">
                <div className="card-ico">🎯</div>
                <div>
                  <div className="card-ttl">Choose Your Goal</div>
                  <div className="card-sub">What would you like to achieve?</div>
                </div>
              </div>
              <div className="mode-grid">
                {[
                  { id: "diet",   icon: "🥗", title: "Diet Generation",  desc: "Personalised Indian diet plan based on your body metrics and lifestyle." },
                  { id: "loss",   icon: "⚖️", title: "Weight Loss Plan",  desc: "Caloric deficit plan with authentic Indian meals to reach your target weight." },
                  { id: "custom", icon: "✨", title: "Custom Diet Plan",  desc: "Fully tailored plan considering medical conditions and dietary restrictions." },
                ].map((m) => (
                  <div key={m.id} className={`mode-card${mode === m.id ? " on" : ""}`} onClick={() => setMode(m.id)}>
                    <div className="mc-ico">{m.icon}</div>
                    <div className="mc-ttl">{m.title}</div>
                    <div className="mc-dsc">{m.desc}</div>
                  </div>
                ))}
              </div>
              <div className="btn-row">
                <div />
                <button className="btn btn-p" disabled={!mode} onClick={goNext}>Get Started →</button>
              </div>
            </div>
          </>
        )}

        {/* ── STEP 1: PERSONAL ─────────────────────────────────────────────── */}
        {step === 1 && (
          <>
            <StepBar current={1} />
            <div className="card">
              <div className="card-hdr">
                <div className="card-ico">👤</div>
                <div>
                  <div className="card-ttl">Personal Information</div>
                  <div className="card-sub">Used for precise health metric calculations</div>
                </div>
              </div>
              <div className="g3" style={{ marginBottom: 20 }}>
                <div className="fld">
                  <label className="lbl">Age (years)</label>
                  <input className="inp" type="number" min="10" max="100" placeholder="25" value={form.age} onChange={(e) => up("age", e.target.value)} />
                </div>
                <div className="fld">
                  <label className="lbl">Height (cm)</label>
                  <input className="inp" type="number" min="100" max="250" placeholder="165" value={form.height} onChange={(e) => up("height", e.target.value)} />
                </div>
                <div className="fld">
                  <label className="lbl">Weight (kg)</label>
                  <input className="inp" type="number" min="30" max="300" placeholder="65" value={form.weight} onChange={(e) => up("weight", e.target.value)} />
                </div>
              </div>
              <div className="g2" style={{ marginBottom: 20 }}>
                <div className="fld">
                  <label className="lbl">Target Weight (kg)</label>
                  <input className="inp" type="number" placeholder="Leave blank for maintenance" value={form.targetWeight} onChange={(e) => up("targetWeight", e.target.value)} />
                </div>
                <div className="fld">
                  <label className="lbl">Gender</label>
                  <select className="sel" value={form.gender} onChange={(e) => up("gender", e.target.value)}>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>
              </div>

              {live && (
                <div className="preview">
                  <div style={{ fontSize: 12, color: "var(--muted)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Live Health Preview</div>
                  <div style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: 26, fontWeight: 700, color: live.cat.color, fontFamily: "'Playfair Display',serif" }}>{live.bmi}</span>
                      <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 6 }}>BMI · {live.cat.label}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: 26, fontWeight: 700, color: "var(--turmeric)", fontFamily: "'Playfair Display',serif" }}>{live.bmr}</span>
                      <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 6 }}>kcal Basal Rate</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="btn-row">
                <button className="btn btn-g" onClick={() => setStep(0)}>← Back</button>
                <button className="btn btn-p" disabled={!canNext()} onClick={goNext}>Continue →</button>
              </div>
            </div>
          </>
        )}

        {/* ── STEP 2: ACTIVITY ─────────────────────────────────────────────── */}
        {step === 2 && (
          <>
            <StepBar current={2} />
            <div className="card">
              <div className="card-hdr">
                <div className="card-ico">🏃</div>
                <div>
                  <div className="card-ttl">Activity Meter</div>
                  <div className="card-sub">Determines your Total Daily Energy Expenditure accurately</div>
                </div>
              </div>

              <div className="sec">
                <div className="sec-ttl">A. Work Type — What does your typical day look like?</div>
                <div className="act-grid">
                  {WORK_TYPES.map((w) => (
                    <div key={w.value} className={`act-card${form.workType === w.value ? " on" : ""}`} onClick={() => up("workType", w.value)}>
                      <div className="act-ico">{w.icon}</div>
                      <div className="act-nm">{w.name}</div>
                      <div className="act-ds">{w.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sec">
                <div className="sec-ttl">B. Daily Exercise Duration</div>
                <Pills options={EXERCISE_TIMES} value={form.exerciseTime} onChange={(v) => up("exerciseTime", v)} />
              </div>

              <div className="sec">
                <div className="sec-ttl">C. Exercise Types (select all that apply)</div>
                <Pills options={EXERCISE_TYPES} value={form.exerciseTypes} onChange={(v) => up("exerciseTypes", v)} multi />
              </div>

              {live2 && (
                <div className="preview">
                  <div style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: 22, fontWeight: 700, color: "var(--saffron)", fontFamily: "'Playfair Display',serif" }}>{live2.af}×</span>
                      <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 6 }}>Activity Multiplier</span>
                    </div>
                    <div>
                      <span style={{ fontSize: 22, fontWeight: 700, color: "var(--turmeric)", fontFamily: "'Playfair Display',serif" }}>{live2.tdee}</span>
                      <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 6 }}>kcal TDEE / day</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="btn-row">
                <button className="btn btn-g" onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-p" disabled={!canNext()} onClick={goNext}>Continue →</button>
              </div>
            </div>
          </>
        )}

        {/* ── STEP 3: DIET & HEALTH ─────────────────────────────────────────── */}
        {step === 3 && (
          <>
            <StepBar current={3} />
            <div className="card">
              <div className="card-hdr">
                <div className="card-ico">🍛</div>
                <div>
                  <div className="card-ttl">Diet &amp; Health Profile</div>
                  <div className="card-sub">Personalises every aspect of your Indian meal plan</div>
                </div>
              </div>

              <div className="sec">
                <div className="sec-ttl">Diet Preference</div>
                <Pills
                  options={[
                    { value: "vegetarian",     emoji: "🥦", label: "Vegetarian"     },
                    { value: "non-vegetarian", emoji: "🍗", label: "Non-Vegetarian" },
                    { value: "jain",           emoji: "🌿", label: "Jain"           },
                    { value: "vegan",          emoji: "🌱", label: "Vegan"          },
                  ]}
                  value={form.diet}
                  onChange={(v) => up("diet", v)}
                />
              </div>

              <div className="sec">
                <div className="sec-ttl">Daily Food Budget</div>
                <Pills
                  options={[
                    { value: "low",    emoji: "💰", label: "Low (₹100–200/day)"  },
                    { value: "medium", emoji: "💰", label: "Medium (₹200–400/day)" },
                    { value: "high",   emoji: "💰", label: "High (₹400+/day)"    },
                  ]}
                  value={form.budget}
                  onChange={(v) => up("budget", v)}
                />
              </div>

              <div className="sec">
                <div className="sec-ttl">Foods to Avoid (optional)</div>
                <Pills options={AVOID} value={form.avoid} onChange={(v) => up("avoid", v)} multi />
              </div>

              <div className="sec">
                <div className="sec-ttl">Medical Conditions</div>
                <Pills options={MEDICAL} value={form.medical} onChange={(v) => up("medical", v)} multi />
              </div>

              <div className="fld" style={{ marginBottom: 8 }}>
                <label className="lbl">Other Allergies or Notes</label>
                <input className="inp" placeholder="e.g. peanut allergy, prefer South Indian foods…" value={form.allergies} onChange={(e) => up("allergies", e.target.value)} />
              </div>

              <div className="btn-row">
                <button className="btn btn-g" onClick={() => setStep(2)}>← Back</button>
                <button className="btn btn-p" onClick={goNext}>✦ Generate My Plan</button>
              </div>
            </div>
          </>
        )}

        {/* ── STEP 4: RESULTS ──────────────────────────────────────────────── */}
        {step === 4 && (
          <>
            <StepBar current={4} />
            <div className="res-hdr">
              <h2>Your Personalised Plan ✦</h2>
              <p>Calculated with precision. Crafted by AI. Made for India.</p>
            </div>

            {metrics && (
              <>
                <div className="metrics-grid">
                  <div className="m-box">
                    <div className="m-val" style={{ color: metrics.bmiCat.color }}>{metrics.bmi}</div>
                    <div className="m-unit">{metrics.bmiCat.label}</div>
                    <div className="m-name">BMI Index</div>
                  </div>
                  <div className="m-box">
                    <div className="m-val" style={{ color: "var(--turmeric)" }}>{metrics.bmr}</div>
                    <div className="m-unit">kcal / day</div>
                    <div className="m-name">Basal Metabolic Rate</div>
                  </div>
                  <div className="m-box">
                    <div className="m-val" style={{ color: "var(--turmeric)" }}>{metrics.tdee}</div>
                    <div className="m-unit">kcal / day</div>
                    <div className="m-name">Total Energy (TDEE)</div>
                  </div>
                  <div className="m-box">
                    <div className="m-val" style={{ color: "var(--saffron)" }}>{metrics.goalCals}</div>
                    <div className="m-unit">kcal / day</div>
                    <div className="m-name">Target ({metrics.goal})</div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-hdr">
                    <div className="card-ico">📊</div>
                    <div>
                      <div className="card-ttl">Daily Macro Targets</div>
                      <div className="card-sub">Algorithmically calculated · {metrics.af}× activity factor applied</div>
                    </div>
                  </div>
                  <div className="mbars">
                    {[
                      { label: "Protein", val: metrics.macros.protein, unit: "g", factor: 4, color: "#60a5fa" },
                      { label: "Carbs",   val: metrics.macros.carbs,   unit: "g", factor: 4, color: "#fbbf24" },
                      { label: "Fat",     val: metrics.macros.fat,     unit: "g", factor: 9, color: "#f87171" },
                    ].map((macro) => {
                      const pct = Math.min(100, Math.round((macro.val * macro.factor / metrics.goalCals) * 100));
                      return (
                        <div key={macro.label} className="mrow">
                          <div className="mlbl">{macro.label}</div>
                          <div className="mtrack">
                            <div className="mbar" style={{ width: `${pct}%`, background: macro.color }} />
                          </div>
                          <div className="mnum">{macro.val}{macro.unit} <span style={{ fontSize: 10, color: "var(--muted)" }}>({pct}%)</span></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            <div className="card">
              <div className="card-hdr">
                <div className="card-ico">🤖</div>
                <div>
                  <div className="card-ttl">AI-Generated Indian Meal Plan</div>
                  <div className="card-sub">3-day plan with authentic Indian foods, exercise guidance &amp; nutrition tips</div>
                </div>
              </div>
              {error && <div className="err">⚠️ {error}</div>}
              <AIOutput text={aiText} loading={aiLoading} />
            </div>

            <div className="btn-row">
              <button className="btn btn-g" onClick={() => { setStep(0); setMetrics(null); setAiText(""); setMode(""); setForm(DEFAULT_FORM); }}>
                ← Start Over
              </button>
              <button className="btn btn-p" disabled={aiLoading} onClick={() => { setAiText(""); generatePlan(); }}>
                ↺ Regenerate Plan
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
