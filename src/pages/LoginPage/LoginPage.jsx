import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button, Input, Divider, Alert } from '../../components/UI/UI';
import './LoginPage.css';

const FEATURES = [
  { icon: '🧮', title: 'Precision Engine',    desc: 'BMR, TDEE & macros calculated to the gram using WHO-approved formulas' },
  { icon: '🍛', title: 'Authentic Indian',     desc: 'Every meal uses real Indian foods — dals, sabzis, rotis, rice preparations' },
  { icon: '🩺', title: 'Medically Aware',      desc: 'Plans adapt for diabetes, PCOS, hypertension, thyroid & more' },
  { icon: '⚡', title: 'Instant AI Plans',     desc: 'Gemini AI generates your 3-day plan in seconds with exercise guidance' },
];

export default function LoginPage({ onNavigate }) {
  const { login } = useAuth();
  const [mode, setMode]       = useState('login'); // 'login' | 'signup'
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
  });

  const up = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    if (!form.email || !form.password) return 'Please fill in all required fields.';
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Please enter a valid email address.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (mode === 'signup') {
      if (!form.name.trim()) return 'Please enter your name.';
      if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    // Simulate auth delay (replace with real Supabase/Firebase auth)
    await new Promise((r) => setTimeout(r, 900));

    login({
      name:  form.name || form.email.split('@')[0],
      email: form.email,
    });
    onNavigate('home');
    setLoading(false);
  };

  const handleDemo = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    login({ name: 'Demo User', email: 'demo@aahar.ai' });
    onNavigate('home');
    setLoading(false);
  };

  return (
    <div className="login-page">
      {/* Left panel — branding */}
      <div className="login-left">
        <div className="login-left__inner">
          {/* Brand mark */}
          <div className="login-brand">
            <div className="login-brand__mark">🌿</div>
            <div>
              <div className="login-brand__name">Aahar<span> AI</span></div>
              <div className="login-brand__tagline">Indian Nutrition Intelligence</div>
            </div>
          </div>

          {/* Headline */}
          <div className="login-headline">
            <h1>
              Eat Right,<br />
              <em>Live Better</em>
            </h1>
            <p>Science-backed Indian diet plans personalised to your body, medical profile, and budget — powered by AI.</p>
          </div>

          {/* Feature list */}
          <div className="login-features">
            {FEATURES.map((f) => (
              <div key={f.title} className="login-feature">
                <div className="login-feature__icon">{f.icon}</div>
                <div>
                  <div className="login-feature__title">{f.title}</div>
                  <div className="login-feature__desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Decorative spice motif */}
          <div className="login-deco" aria-hidden>
            <div className="login-deco__ring login-deco__ring--1" />
            <div className="login-deco__ring login-deco__ring--2" />
            <div className="login-deco__ring login-deco__ring--3" />
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="login-right">
        <div className="login-form-wrap">
          {/* Tab toggle */}
          <div className="login-tabs">
            <button
              className={`login-tab ${mode === 'login' ? 'login-tab--active' : ''}`}
              onClick={() => { setMode('login'); setError(''); }}
            >
              Sign In
            </button>
            <button
              className={`login-tab ${mode === 'signup' ? 'login-tab--active' : ''}`}
              onClick={() => { setMode('signup'); setError(''); }}
            >
              Create Account
            </button>
          </div>

          <h2 className="login-form-title">
            {mode === 'login' ? 'Welcome back' : 'Start your journey'}
          </h2>
          <p className="login-form-sub">
            {mode === 'login'
              ? 'Sign in to access your personalised diet plans'
              : 'Create a free account to get your AI-powered nutrition plan'}
          </p>

          {error && (
            <div style={{ marginBottom: 20 }}>
              <Alert type="error">{error}</Alert>
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {mode === 'signup' && (
              <Input
                label="Full Name"
                name="name"
                type="text"
                value={form.name}
                onChange={up('name')}
                placeholder="e.g. Priya Sharma"
                required
              />
            )}

            <Input
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={up('email')}
              placeholder="you@example.com"
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={up('password')}
              placeholder="Min. 6 characters"
              required
            />

            {mode === 'signup' && (
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={up('confirmPassword')}
                placeholder="Repeat your password"
                required
              />
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              className="login-submit"
            >
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <Divider label="or" />

          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={handleDemo}
            loading={loading}
          >
            Continue as Guest
          </Button>

          <p className="login-switch">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              className="login-switch__btn"
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
            >
              {mode === 'login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>

          <p className="login-legal">
            By continuing, you agree to our Terms of Service and Privacy Policy.
            This platform does not replace professional medical advice.
          </p>
        </div>
      </div>
    </div>
  );
}
