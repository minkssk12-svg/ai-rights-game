import { useEffect, useMemo } from 'react';
import { rightById } from '../lib/data.js';

/** 안내 로봇 '아리' 그림 */
export function Robot({ size = 120, mood = 'happy' }) {
  const eyes =
    mood === 'think' ? (
      <>
        <rect x="38" y="52" width="16" height="6" rx="3" fill="#1e2a5a" />
        <circle cx="82" cy="55" r="8" fill="#1e2a5a" />
      </>
    ) : mood === 'wow' ? (
      <>
        <circle cx="46" cy="55" r="10" fill="#1e2a5a" />
        <circle cx="82" cy="55" r="10" fill="#1e2a5a" />
        <circle cx="49" cy="52" r="3" fill="#fff" />
        <circle cx="85" cy="52" r="3" fill="#fff" />
      </>
    ) : (
      <>
        <path d="M37 57 q9 -12 18 0" stroke="#1e2a5a" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M73 57 q9 -12 18 0" stroke="#1e2a5a" strokeWidth="6" fill="none" strokeLinecap="round" />
      </>
    );
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" className="ari-robot" aria-hidden="true">
      <line x1="64" y1="8" x2="64" y2="24" stroke="#1e2a5a" strokeWidth="5" />
      <circle cx="64" cy="8" r="7" fill="#ffd43b" stroke="#1e2a5a" strokeWidth="3" />
      <rect x="14" y="24" width="100" height="74" rx="30" fill="#e7ecff" stroke="#1e2a5a" strokeWidth="5" />
      <rect x="26" y="36" width="76" height="46" rx="20" fill="#fff" stroke="#1e2a5a" strokeWidth="3" />
      {eyes}
      <path d="M54 70 q10 8 20 0" stroke="#e64980" strokeWidth="5" fill="none" strokeLinecap="round" />
      <circle cx="34" cy="70" r="5" fill="#ffc9c9" />
      <circle cx="94" cy="70" r="5" fill="#ffc9c9" />
      <rect x="5" y="48" width="10" height="24" rx="5" fill="#4263eb" stroke="#1e2a5a" strokeWidth="3" />
      <rect x="113" y="48" width="10" height="24" rx="5" fill="#4263eb" stroke="#1e2a5a" strokeWidth="3" />
      <rect x="38" y="98" width="52" height="22" rx="10" fill="#4263eb" stroke="#1e2a5a" strokeWidth="4" />
      <circle cx="64" cy="109" r="5" fill="#ffd43b" />
    </svg>
  );
}

/** 아리 + 말풍선 */
export function Ari({ lines, children, size = 96, mood = 'happy', bob = true }) {
  const list = lines ? (Array.isArray(lines) ? lines : [lines]) : null;
  return (
    <div className="ari">
      <div className={bob ? 'ari-bob' : ''}>
        <Robot size={size} mood={mood} />
      </div>
      <div className="bubble">
        {list && list.map((l, i) => <p key={i}>{l}</p>)}
        {children}
      </div>
    </div>
  );
}

export function rightStyle(r) {
  return { '--rc': r.color, '--rcbg': `${r.color}22` };
}

/** 고를 수 있는 인권 카드 */
export function RightCard({ id, selected, onClick, disabled, compact }) {
  const r = rightById[id];
  if (!r) return null;
  return (
    <button
      className={`right-card ${selected ? 'selected' : ''} ${compact ? 'compact' : ''}`}
      style={rightStyle(r)}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="icon">{r.icon}</span>
      <span>
        <div className="name">{r.name}</div>
        {!compact && <div className="desc">{r.desc}</div>}
      </span>
    </button>
  );
}

/** 작은 인권 꼬리표 */
export function RightChip({ id }) {
  const r = rightById[id];
  if (!r) return null;
  return (
    <span className="right-chip" style={rightStyle(r)}>
      {r.icon} {r.name}
    </span>
  );
}

export function Confetti({ count = 60 }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        dur: 2.2 + Math.random() * 1.8,
        color: ['#ffd43b', '#4263eb', '#e64980', '#37b24d', '#ff922b', '#7048e8'][i % 6],
      })),
    [count],
  );
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <i key={i} style={{ left: `${p.left}%`, background: p.color, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }} />
      ))}
    </div>
  );
}

/** 바깥을 눌러도 닫히지 않는 큰 패널 */
export function Panel({ children }) {
  useEffect(() => {
    const prev = document.activeElement;
    return () => prev && prev.focus && prev.focus();
  }, []);
  return (
    <div className="overlay" role="dialog" aria-modal="true">
      <div className="panel">{children}</div>
    </div>
  );
}

export function toggleIn(list, id, max = Infinity) {
  if (list.includes(id)) return list.filter((x) => x !== id);
  if (list.length >= max) return [...list.slice(1), id];
  return [...list, id];
}
