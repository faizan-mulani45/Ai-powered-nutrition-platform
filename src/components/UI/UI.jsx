import './UI.css';

// ─── BUTTON ───────────────────────────────────────────────────────────────────
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  icon,
  iconRight,
  fullWidth = false,
}) {
  return (
    <button
      type={type}
      className={`btn btn--${variant} btn--${size} ${fullWidth ? 'btn--full' : ''} ${loading ? 'btn--loading' : ''} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && <span className="btn__spinner" />}
      {!loading && icon && <span className="btn__icon btn__icon--left">{icon}</span>}
      <span className="btn__label">{children}</span>
      {!loading && iconRight && <span className="btn__icon btn__icon--right">{iconRight}</span>}
    </button>
  );
}

// ─── INPUT ────────────────────────────────────────────────────────────────────
export function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  hint,
  prefix,
  suffix,
  required = false,
  min,
  max,
  className = '',
}) {
  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`}>
      {label && (
        <label className="field__label" htmlFor={name}>
          {label}
          {required && <span className="field__required">*</span>}
        </label>
      )}
      <div className="field__wrap">
        {prefix && <span className="field__prefix">{prefix}</span>}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="field__input"
          min={min}
          max={max}
          required={required}
          autoComplete="off"
        />
        {suffix && <span className="field__suffix">{suffix}</span>}
      </div>
      {error && <span className="field__error">{error}</span>}
      {hint && !error && <span className="field__hint">{hint}</span>}
    </div>
  );
}

// ─── SELECT ───────────────────────────────────────────────────────────────────
export function Select({ label, name, value, onChange, options, required = false, error }) {
  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      {label && (
        <label className="field__label" htmlFor={name}>
          {label}
          {required && <span className="field__required">*</span>}
        </label>
      )}
      <div className="field__wrap">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className="field__select"
          required={required}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span className="field__select-arrow">▾</span>
      </div>
      {error && <span className="field__error">{error}</span>}
    </div>
  );
}

// ─── CARD ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', elevated = false, bordered = false, glow = false }) {
  return (
    <div className={`card ${elevated ? 'card--elevated' : ''} ${bordered ? 'card--bordered' : ''} ${glow ? 'card--glow' : ''} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ icon, title, subtitle, action }) {
  return (
    <div className="card-header">
      <div className="card-header__left">
        {icon && <div className="card-header__icon">{icon}</div>}
        <div>
          <h3 className="card-header__title">{title}</h3>
          {subtitle && <p className="card-header__sub">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="card-header__action">{action}</div>}
    </div>
  );
}

// ─── BADGE ────────────────────────────────────────────────────────────────────
export function Badge({ children, variant = 'default', size = 'md' }) {
  return (
    <span className={`badge badge--${variant} badge--${size}`}>
      {children}
    </span>
  );
}

// ─── SPINNER ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md', color = 'saffron' }) {
  return <div className={`spinner spinner--${size} spinner--${color}`} />;
}

// ─── DIVIDER ──────────────────────────────────────────────────────────────────
export function Divider({ label }) {
  return (
    <div className="divider">
      {label && <span className="divider__label">{label}</span>}
    </div>
  );
}

// ─── PROGRESS BAR ─────────────────────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color = 'saffron', label, sublabel }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="progress">
      {(label || sublabel) && (
        <div className="progress__head">
          {label && <span className="progress__label">{label}</span>}
          {sublabel && <span className="progress__sublabel">{sublabel}</span>}
        </div>
      )}
      <div className="progress__track">
        <div
          className={`progress__fill progress__fill--${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── PILL SELECTOR ────────────────────────────────────────────────────────────
export function PillGroup({ options, value, onChange, multi = false, className = '' }) {
  const selected = multi ? (Array.isArray(value) ? value : []) : value;

  const handleClick = (val) => {
    if (multi) {
      const arr = selected.includes(val)
        ? selected.filter((v) => v !== val)
        : [...selected, val];
      onChange(arr);
    } else {
      onChange(val);
    }
  };

  return (
    <div className={`pill-group ${className}`}>
      {options.map((o) => {
        const active = multi ? selected.includes(o.value) : selected === o.value;
        return (
          <button
            key={o.value}
            type="button"
            className={`pill ${active ? 'pill--active' : ''}`}
            onClick={() => handleClick(o.value)}
            aria-pressed={active}
          >
            {o.emoji && <span className="pill__emoji">{o.emoji}</span>}
            {o.icon && <span className="pill__emoji">{o.icon}</span>}
            <span className="pill__label">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
export function StatCard({ value, unit, label, color, sublabel }) {
  return (
    <div className="stat-card">
      <div className="stat-card__accent" style={{ background: color }} />
      <div className="stat-card__value" style={{ color: color || 'var(--turmeric-light)' }}>
        {value}
      </div>
      {unit && <div className="stat-card__unit">{unit}</div>}
      <div className="stat-card__label">{label}</div>
      {sublabel && <div className="stat-card__sublabel">{sublabel}</div>}
    </div>
  );
}

// ─── TOAST (simple inline) ────────────────────────────────────────────────────
export function Alert({ type = 'info', children }) {
  const icons = { info: 'ℹ', success: '✓', warning: '⚠', error: '✕' };
  return (
    <div className={`alert alert--${type}`} role="alert">
      <span className="alert__icon">{icons[type]}</span>
      <span className="alert__body">{children}</span>
    </div>
  );
}
