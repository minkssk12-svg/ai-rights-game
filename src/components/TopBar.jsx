import { config, isTeacher } from '../lib/data.js';

export default function TopBar({ title, progress, onHome, homeLabel = '🗺️ 지도', onReset }) {
  return (
    <header className="topbar">
      {onHome && (
        <button className="home-btn" onClick={onHome}>
          {homeLabel}
        </button>
      )}
      <div className="title">{title}</div>
      {isTeacher && <span className="teacher-tag">교사 모드</span>}
      {isTeacher && onReset && (
        <button className="home-btn" onClick={onReset}>
          ↺ 초기화
        </button>
      )}
      <div className="badges" aria-label="모은 배지">
        {config.missions.map((m) => (
          <div key={m.id} className={`badge-dot ${progress.completed[m.id] ? 'on' : ''}`} title={m.badge.name}>
            {m.badge.icon}
          </div>
        ))}
      </div>
    </header>
  );
}
