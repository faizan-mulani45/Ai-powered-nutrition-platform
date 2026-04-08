import { Spinner } from '../UI/UI';
import './PlanOutput.css';

/**
 * Parse the AI text into structured sections for clean rendering.
 * Handles: Day sections, Meals, Exercise, Tips, Medical notes, plain text.
 */
function parsePlan(text) {
  const lines = text.split('\n');
  const sections = [];
  let current = null;

  const flush = () => { if (current) { sections.push(current); current = null; } };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // Day heading: ## Day 1 — Theme
    if (/^##\s*Day\s*\d/i.test(line)) {
      flush();
      const title = line.replace(/^#+\s*/, '');
      current = { type: 'day', title, meals: [] };
      continue;
    }

    // Exercise section
    if (/^(💪|###?\s*Exercise|Exercise Plan)/i.test(line)) {
      flush();
      current = { type: 'exercise', title: line.replace(/^#+\s*/, ''), items: [] };
      continue;
    }

    // Nutrition tips section
    if (/^(🌿|###?\s*Nutrition Tips|Key Nutrition)/i.test(line)) {
      flush();
      current = { type: 'tips', title: line.replace(/^#+\s*/, ''), items: [] };
      continue;
    }

    // Medical considerations
    if (/^(⚠️|###?\s*Medical)/i.test(line)) {
      flush();
      current = { type: 'medical', title: line.replace(/^#+\s*/, ''), items: [] };
      continue;
    }

    // List items
    if (/^[-•]\s/.test(line)) {
      const text = line.replace(/^[-•]\s*/, '');
      if (current && ['exercise', 'tips', 'medical'].includes(current.type)) {
        current.items.push(text);
      } else if (current && current.type === 'day') {
        current.meals.push({ time: 'Note', name: text, desc: '' });
      } else {
        sections.push({ type: 'plain', text });
      }
      continue;
    }

    // Meal line: **Breakfast:** ...
    if (/^\*\*|^(Early Morning|Breakfast|Mid Morning|Lunch|Evening|Dinner|Snack|Day Total)/i.test(line)) {
      const clean = line.replace(/\*\*/g, '');
      const ci = clean.indexOf(':');
      if (ci > -1) {
        const time = clean.slice(0, ci).trim();
        const rest = clean.slice(ci + 1).trim();

        // Day total line
        if (/^Day Total/i.test(time)) {
          if (current && current.type === 'day') {
            current.total = rest;
          }
          continue;
        }

        const parts = rest.split(/\s*—\s*|\s*–\s*/);
        const meal = {
          time,
          name:  parts[0]?.trim() || '',
          desc:  parts.slice(1, -1).join(' – ').trim(),
          kcal:  parts[parts.length - 1]?.trim() || '',
        };
        if (current && current.type === 'day') {
          current.meals.push(meal);
        } else {
          sections.push({ type: 'meal', ...meal });
        }
        continue;
      }
    }

    // Fallback plain
    sections.push({ type: 'plain', text: line });
  }

  flush();
  return sections;
}

// Meal time to color mapping
const TIME_COLORS = {
  'Early Morning': { bg: 'rgba(212,148,26,0.1)',  border: 'rgba(212,148,26,0.3)',  text: '#F0B432' },
  'Breakfast':     { bg: 'rgba(232,87,10,0.12)',  border: 'rgba(232,87,10,0.35)',  text: '#FF7A2F' },
  'Mid Morning':   { bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.25)', text: '#93c5fd' },
  'Lunch':         { bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.25)', text: '#6ee7b7' },
  'Evening Snack': { bg: 'rgba(167,139,250,0.08)',border: 'rgba(167,139,250,0.25)',text: '#c4b5fd' },
  'Dinner':        { bg: 'rgba(248,113,113,0.08)',border: 'rgba(248,113,113,0.25)',text: '#fca5a5' },
};
const DEFAULT_COLOR = { bg: 'rgba(212,148,26,0.08)', border: 'var(--border-soft)', text: 'var(--turmeric-light)' };

function getTimeColor(time) {
  for (const key of Object.keys(TIME_COLORS)) {
    if (time.toLowerCase().includes(key.toLowerCase())) return TIME_COLORS[key];
  }
  return DEFAULT_COLOR;
}

export default function PlanOutput({ text, loading, error }) {
  if (loading) {
    return (
      <div className="plan-loading">
        <div className="plan-loading__spinner">
          <Spinner size="lg" color="gold" />
        </div>
        <div className="plan-loading__text">
          <p className="plan-loading__title">Crafting your personalised plan…</p>
          <p className="plan-loading__sub">Dr. Aahar AI is analysing your profile and calculating optimal nutrition</p>
        </div>
        <div className="plan-loading__dots">
          {['Analysing BMR & TDEE', 'Selecting Indian foods', 'Balancing macros', 'Personalising for your conditions'].map((s, i) => (
            <div key={s} className="plan-loading__dot-item" style={{ animationDelay: `${i * 0.4}s` }}>
              <div className="plan-loading__dot" />
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!text) return null;

  const sections = parsePlan(text);

  return (
    <div className="plan-output">
      {sections.map((sec, i) => {
        if (sec.type === 'day') {
          return (
            <div key={i} className="plan-day">
              <div className="plan-day__header">
                <div className="plan-day__badge">Day {i < 3 ? i + 1 : '?'}</div>
                <h3 className="plan-day__title">{sec.title}</h3>
                {sec.total && <div className="plan-day__total">{sec.total}</div>}
              </div>
              <div className="plan-meals">
                {sec.meals.map((meal, j) => {
                  const c = getTimeColor(meal.time);
                  return (
                    <div key={j} className="plan-meal" style={{ '--meal-bg': c.bg, '--meal-border': c.border }}>
                      <div className="plan-meal__time" style={{ color: c.text }}>{meal.time}</div>
                      <div className="plan-meal__content">
                        <div className="plan-meal__name">{meal.name}</div>
                        {meal.desc && <div className="plan-meal__desc">{meal.desc}</div>}
                      </div>
                      {meal.kcal && <div className="plan-meal__kcal">{meal.kcal}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }

        if (sec.type === 'exercise') {
          return (
            <div key={i} className="plan-section plan-section--exercise">
              <div className="plan-section__header">
                <span className="plan-section__icon">💪</span>
                <h3 className="plan-section__title">{sec.title}</h3>
              </div>
              <div className="plan-section__items">
                {sec.items.map((item, j) => (
                  <div key={j} className="plan-section__item">
                    <div className="plan-section__bullet plan-section__bullet--green" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        if (sec.type === 'tips') {
          return (
            <div key={i} className="plan-section plan-section--tips">
              <div className="plan-section__header">
                <span className="plan-section__icon">🌿</span>
                <h3 className="plan-section__title">{sec.title}</h3>
              </div>
              <div className="plan-section__items">
                {sec.items.map((item, j) => (
                  <div key={j} className="plan-section__item">
                    <span className="plan-section__bullet plan-section__bullet--saffron">✦</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        if (sec.type === 'medical') {
          return (
            <div key={i} className="plan-section plan-section--medical">
              <div className="plan-section__header">
                <span className="plan-section__icon">⚠️</span>
                <h3 className="plan-section__title">{sec.title}</h3>
              </div>
              <div className="plan-section__items">
                {sec.items.map((item, j) => (
                  <div key={j} className="plan-section__item">
                    <div className="plan-section__bullet plan-section__bullet--red" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        return (
          <p key={i} className="plan-plain">{sec.text}</p>
        );
      })}
    </div>
  );
}
