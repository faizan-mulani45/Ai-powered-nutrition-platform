import './StepBar.css';

export default function StepBar({ steps, current }) {
  return (
    <div className="stepbar" role="list" aria-label="Progress">
      {steps.map((step, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : 'pending';
        return (
          <div key={step} className="stepbar__item" role="listitem">
            {i > 0 && <div className={`stepbar__line stepbar__line--${i <= current ? 'filled' : 'empty'}`} />}
            <div className="stepbar__node-wrap">
              <div className={`stepbar__node stepbar__node--${state}`}>
                {state === 'done' ? (
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <span className={`stepbar__label stepbar__label--${state}`}>{step}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
