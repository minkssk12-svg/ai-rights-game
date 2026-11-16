import { useState } from 'react';
import { config, isTeacher } from '../lib/data.js';
import { Ari, Robot, Confetti } from '../components/common.jsx';

function goFullscreen() {
  const el = document.documentElement;
  try {
    if (!document.fullscreenElement && el.requestFullscreen) el.requestFullscreen().catch(() => {});
  } catch {
    /* 전체 화면이 안 되는 브라우저도 있어요 */
  }
}

export function StartScreen({ errors, hasProgress, onStart, onReset }) {
  return (
    <main className="main">
      {errors.length > 0 && (
        <div className="errors">
          <h4>⚠️ 선생님 확인: 데이터 파일에 고칠 곳이 있어요</h4>
          <ul>
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="start">
        <div>
          <span className="step-tag">5학년 도덕 · 인권을 소중하게</span>
          <h1 className="h1" style={{ fontSize: '3.2rem', margin: '0.6rem 0 0.3rem' }}>
            🤖 {config.title}
          </h1>
          <p className="big-text muted" style={{ marginTop: 0 }}>{config.subtitle}</p>
          <div className="btn-row" style={{ justifyContent: 'flex-start', marginTop: '1.6rem' }}>
            <button className="btn yellow" style={{ fontSize: '1.5rem', minHeight: 80, padding: '0 2.4rem' }} onClick={() => { goFullscreen(); onStart(); }}>
              {hasProgress ? '▶ 이어서 탐험하기' : '🚀 탐험 시작!'}
            </button>
          </div>
          {hasProgress && (
            <div className="btn-row" style={{ justifyContent: 'flex-start' }}>
              <button
                className="btn secondary small"
                onClick={() => {
                  if (window.confirm('지금까지 한 것이 모두 지워져요. 처음부터 할까요?')) onReset();
                }}
              >
                ↺ 처음부터 다시
              </button>
            </div>
          )}
          {isTeacher && (
            <p className="muted" style={{ fontSize: '0.95rem' }}>
              교사 모드: 모든 미션이 열려 있고, 사건 파일에 교사용 메모가 보여요.
            </p>
          )}
        </div>
        <Ari lines={config.startLines} size={150} />
      </div>
    </main>
  );
}

export function CityMap({ progress, isUnlocked, onOpen }) {
  const missions = config.missions;
  const pos = [
    { x: 14, y: 70 },
    { x: 33, y: 38 },
    { x: 52, y: 72 },
    { x: 70, y: 40 },
    { x: 87, y: 70 },
  ];
  const nextIdx = missions.findIndex((m) => !progress.completed[m.id]);
  const doneCount = missions.filter((m) => progress.completed[m.id]).length;
  const msg =
    doneCount === 0
      ? '1번 정거장부터 출발해 볼까? 반짝이는 정거장을 눌러 줘!'
      : doneCount === missions.length
        ? '모든 정거장을 다 돌았어! 정말 멋진 인권 탐험대야. 🎉'
        : `배지 ${doneCount}개를 모았어! 다음 정거장으로 가 보자.`;

  return (
    <main className="main">
      <div className="map-wrap">
        <svg viewBox="0 0 1000 560" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="mapsky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#d0ebff" />
              <stop offset="1" stopColor="#e6fcf5" />
            </linearGradient>
          </defs>
          <rect width="1000" height="560" fill="url(#mapsky)" />
          {/* 건물 실루엣 */}
          {[60, 150, 230, 330, 420, 520, 600, 700, 790, 880].map((x, i) => (
            <rect key={i} x={x} y={90 + (i % 3) * 25} width={70} height={140} rx={8} fill={['#bac8ff', '#c5f6fa', '#d0bfff'][i % 3]} opacity="0.7" />
          ))}
          <rect x="0" y="300" width="1000" height="260" fill="#c3fae8" />
          {/* 길 */}
          <path
            d={`M ${pos.map((p) => `${p.x * 10} ${p.y * 5.6}`).join(' L ')}`}
            stroke="#fff" strokeWidth="46" fill="none" strokeLinecap="round" strokeLinejoin="round"
          />
          <path
            d={`M ${pos.map((p) => `${p.x * 10} ${p.y * 5.6}`).join(' L ')}`}
            stroke="#ffd43b" strokeWidth="6" strokeDasharray="18 16" fill="none" strokeLinecap="round" strokeLinejoin="round"
          />
          {[[90, 500], [260, 520], [450, 470], [640, 520], [930, 480], [800, 330]].map(([x, y], i) => (
            <g key={i}>
              <rect x={x - 4} y={y - 10} width="8" height="26" fill="#8d6e63" />
              <circle cx={x} cy={y - 18} r="22" fill="#69db7c" />
            </g>
          ))}
        </svg>
        <div className="map-ari">
          <Ari lines={msg} size={80} />
        </div>
        {missions.map((m, i) => {
          const done = !!progress.completed[m.id];
          const unlocked = isUnlocked(i);
          const cls = done ? 'done' : !unlocked ? 'locked' : i === nextIdx ? 'next' : '';
          return (
            <button
              key={m.id}
              className={`stop ${cls}`}
              style={{ left: `${pos[i].x}%`, top: `${pos[i].y}%` }}
              onClick={() => unlocked && onOpen(i)}
              aria-label={`${i + 1}번 정거장 ${m.name}${!unlocked ? ' (잠김)' : ''}`}
            >
              <div className="circle">
                <span className="num">{i + 1}</span>
                {m.icon}
                {done && <span className="state">✅</span>}
                {!unlocked && <span className="state">🔒</span>}
              </div>
              <div className="label">
                {m.name}
                <small>약 {m.minutes}분</small>
              </div>
            </button>
          );
        })}
      </div>
    </main>
  );
}

export function MissionIntro({ index, onStart }) {
  const m = config.missions[index];
  return (
    <main className="main">
      <div className="center-stage">
        <div className="mission-icon">{m.icon}</div>
        <span className="step-tag">
          {index + 1}단계 · {m.step}
        </span>
        <h1 className="h1">
          미션 {index + 1}. {m.name}
        </h1>
        <div style={{ maxWidth: 900, textAlign: 'left' }}>
          <Ari lines={m.intro} size={100} />
        </div>
        <div className="btn-row center">
          <span className="muted big-text">⏱️ 약 {m.minutes}분</span>
          <button className="btn yellow" onClick={onStart}>
            미션 시작하기 ▶
          </button>
        </div>
      </div>
    </main>
  );
}

export function ReflectScreen({ index, initial, onDone }) {
  const m = config.missions[index];
  const [text, setText] = useState(initial || '');
  const ok = text.trim().length >= 2;
  return (
    <main className="main">
      <div style={{ maxWidth: 1000, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        <Ari mood="think" size={96} lines={['미션을 마치기 전에, 네 생각을 한 줄로 남겨 줘!', '이 생각은 마지막 선언문을 만들 때 다시 볼 수 있어.']} />
        <div className="card">
          <h2 className="h2">✏️ 한 줄 생각</h2>
          <p className="big-text" style={{ marginTop: 0, fontWeight: 700 }}>{m.reflectPrompt}</p>
          <div className="chips" style={{ marginBottom: '0.6rem' }}>
            <span className="muted" style={{ alignSelf: 'center' }}>말 꺼내기 도우미:</span>
            {m.reflectStarters.map((s) => (
              <button key={s} className="chip" onClick={() => setText((t) => t + s)}>
                {s.trim()}…
              </button>
            ))}
          </div>
          <textarea
            className="reflect-box"
            value={text}
            maxLength={200}
            onChange={(e) => setText(e.target.value)}
            placeholder="여기를 눌러 생각을 써 주세요."
          />
          <div className="btn-row">
            <span className="muted">{text.length}/200</span>
            <button className="btn green" disabled={!ok} onClick={() => onDone(text.trim())}>
              다 썼어요 ✔
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export function BadgeScreen({ index, isLast, onNext }) {
  const m = config.missions[index];
  return (
    <main className="main">
      <Confetti />
      <div className="center-stage">
        <div className="badge-big">{m.badge.icon}</div>
        <h1 className="h1">🎉 {m.badge.name}를 받았어요!</h1>
        <p className="big-text muted" style={{ margin: 0 }}>
          미션 {index + 1} '{m.name}' 완료
        </p>
        <div className="btn-row center">
          <button className="btn yellow" onClick={onNext}>
            {isLast ? '탐험 마치기 🏁' : '🗺️ 지도로 가기'}
          </button>
        </div>
      </div>
    </main>
  );
}

export function RotateHint() {
  return (
    <div className="rotate">
      <div className="phone">📱</div>
      태블릿을 가로로 돌려 주세요!
      <Robot size={90} mood="wow" />
    </div>
  );
}
