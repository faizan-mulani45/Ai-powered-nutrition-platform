import { useAuth } from '../../hooks/useAuth';
import { Button, Badge } from '../../components/UI/UI';
import './HomePage.css';

const PLAN_MODES = [
  {
    id: 'diet',
    icon: '🥗',
    title: 'Diet Generation',
    desc: 'Get a complete 3-day Indian diet plan tailored to your body metrics and food preferences.',
    tags: ['Personalised', 'Indian Foods'],
    highlight: false,
  },
  {
    id: 'loss',
    icon: '⚖️',
    title: 'Weight Loss Plan',
    desc: 'Structured caloric deficit with authentic Indian meals. Scientifically calculated for safe, sustainable weight loss.',
    tags: ['400 kcal Deficit', 'Sustainable'],
    highlight: true,
  },
  {
    id: 'custom',
    icon: '✨',
    title: 'Custom Diet Plan',
    desc: 'Fully tailored plan adapting to your medical conditions, budget, and dietary restrictions.',
    tags: ['Medical-Aware', 'Flexible'],
    highlight: false,
  },
];

const STATS = [
  { icon: '🧮', value: '7', label: 'Health Metrics Calculated' },
  { icon: '🍽️', value: '18+', label: 'Meals Per Plan' },
  { icon: '🌿', value: '100%', label: 'Authentic Indian Foods' },
  { icon: '⚡', value: '<30s', label: 'Plan Generation Time' },
];

export default function HomePage({ onNavigate, onSelectMode }) {
  const { user } = useAuth();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="home-page page-enter">
      {/* Hero */}
      <section className="home-hero">
        <div className="container">
          <div className="home-hero__inner">
            <div className="home-hero__content">
              <Badge variant="saffron" size="md" className="home-hero__badge">
                ✦ AI-Powered Indian Nutrition
              </Badge>
              <h1 className="home-hero__title">
                {greeting()},<br />
                <em>{user?.name?.split(' ')[0] || 'Welcome'}</em>
              </h1>
              <p className="home-hero__sub">
                Your personalised Indian diet plan awaits. Choose a programme below and let our deterministic health engine
                combined with Gemini AI craft your perfect nutrition plan.
              </p>
              <div className="home-hero__cta">
                <Button variant="primary" size="xl" onClick={() => onNavigate('generator')} iconRight="→">
                  Start Your Plan
                </Button>
                <Button variant="ghost" size="xl" onClick={() => document.getElementById('programmes')?.scrollIntoView({ behavior: 'smooth' })}>
                  View Programmes
                </Button>
              </div>
            </div>

            {/* Quick stats */}
            <div className="home-stats">
              {STATS.map((s) => (
                <div key={s.label} className="home-stat">
                  <div className="home-stat__icon">{s.icon}</div>
                  <div className="home-stat__value">{s.value}</div>
                  <div className="home-stat__label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Programmes */}
      <section className="home-programmes" id="programmes">
        <div className="container">
          <div className="home-section-head">
            <h2>Choose Your Programme</h2>
            <p>Each plan is powered by a deterministic health engine that calculates your exact BMR, TDEE and macros before generating AI-crafted Indian meals.</p>
          </div>

          <div className="home-plans">
            {PLAN_MODES.map((plan) => (
              <div
                key={plan.id}
                className={`home-plan ${plan.highlight ? 'home-plan--highlight' : ''}`}
                onClick={() => { onSelectMode(plan.id); onNavigate('generator'); }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onNavigate('generator')}
              >
                {plan.highlight && (
                  <div className="home-plan__popular">Most Popular</div>
                )}
                <div className="home-plan__icon">{plan.icon}</div>
                <h3 className="home-plan__title">{plan.title}</h3>
                <p className="home-plan__desc">{plan.desc}</p>
                <div className="home-plan__tags">
                  {plan.tags.map((t) => (
                    <span key={t} className="home-plan__tag">{t}</span>
                  ))}
                </div>
                <div className="home-plan__cta">
                  Get Started <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="home-how">
        <div className="container--narrow">
          <div className="home-section-head">
            <h2>How It Works</h2>
            <p>A hybrid system that combines algorithmic precision with AI creativity.</p>
          </div>

          <div className="home-steps">
            {[
              { n: '01', title: 'Input Your Profile',    desc: 'Age, height, weight, activity level, medical conditions, and dietary preferences.' },
              { n: '02', title: 'Engine Calculates',     desc: 'BMI, BMR (Mifflin-St Jeor), activity factor, TDEE, goal calories, and exact macros are computed deterministically.' },
              { n: '03', title: 'AI Generates Plan',     desc: 'Gemini AI receives your locked metabolic targets and crafts an authentic 3-day Indian meal plan within those constraints.' },
              { n: '04', title: 'Follow & Achieve',      desc: 'Get your complete plan with meal timings, exercise recommendations, and medical-specific nutrition tips.' },
            ].map((s, i) => (
              <div key={s.n} className="home-step">
                <div className="home-step__number">{s.n}</div>
                <div className="home-step__content">
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
                {i < 3 && <div className="home-step__arrow">↓</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="container">
          <div className="home-footer__inner">
            <div className="home-footer__brand">
              <span className="home-footer__logo">🌿 Aahar AI</span>
              <span>Indian Nutrition Intelligence</span>
            </div>
            <p className="home-footer__legal">
              For informational purposes only. Not a substitute for professional medical or dietary advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
