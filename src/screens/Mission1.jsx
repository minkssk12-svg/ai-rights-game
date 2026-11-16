import { useState } from 'react';
import { m1, rights, rightById } from '../lib/data.js';
import { Ari, RightCard, RightChip, Panel, toggleIn } from '../components/common.jsx';

function CityScene() {
  return (
    <svg viewBox="0 0 1000 560" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a5d8ff" />
          <stop offset="1" stopColor="#e7f5ff" />
        </linearGradient>
      </defs>
      <rect width="1000" height="560" fill="url(#sky1)" />
      <circle cx="900" cy="70" r="40" fill="#ffe066" />
      {/* 먼 건물 */}
      {[0, 110, 260, 380, 520, 640, 760, 880].map((x, i) => (
        <rect key={i} x={x} y={120 + (i % 3) * 30} width={100} height={260} fill={['#d0bfff', '#bac8ff', '#a5d8ff'][i % 3]} opacity="0.55" />
      ))}
      {/* 가까운 건물 */}
      <g>
        <rect x="40" y="150" width="200" height="240" rx="10" fill="#748ffc" />
        <rect x="430" y="110" width="230" height="280" rx="10" fill="#9775fa" />
        <rect x="740" y="190" width="230" height="200" rx="10" fill="#ffa94d" />
        <rect x="740" y="190" width="230" height="40" fill="#e8590c" />
        <text x="855" y="218" textAnchor="middle" fontSize="24" fontWeight="900" fill="#fff">로봇 마트</text>
        {[...Array(12)].map((_, i) => (
          <rect key={`a${i}`} x={60 + (i % 4) * 45} y={175 + Math.floor(i / 4) * 60} width="28" height="36" rx="4" fill="#dbe4ff" />
        ))}
        {[...Array(15)].map((_, i) => (
          <rect key={`b${i}`} x={455 + (i % 5) * 42} y={140 + Math.floor(i / 5) * 70} width="26" height="40" rx="4" fill="#e5dbff" />
        ))}
        {/* 큰 화면 */}
        <rect x="470" y="330" width="150" height="50" rx="6" fill="#212529" />
        <text x="545" y="362" textAnchor="middle" fontSize="18" fill="#69db7c" fontWeight="700">AI 뉴스</text>
      </g>
      {/* 인도와 차도 */}
      <rect x="0" y="390" width="1000" height="60" fill="#dee2e6" />
      <rect x="0" y="450" width="1000" height="110" fill="#495057" />
      {[...Array(10)].map((_, i) => (
        <rect key={i} x={20 + i * 100} y="500" width="60" height="10" rx="5" fill="#fff" />
      ))}
      {/* 정류장 */}
      <rect x="300" y="300" width="10" height="100" fill="#343a40" />
      <rect x="270" y="290" width="120" height="20" rx="6" fill="#20c997" />
      <text x="330" y="305" textAnchor="middle" fontSize="14" fontWeight="900" fill="#fff">정류장</text>
      {/* 가로등 + 카메라 */}
      <rect x="135" y="220" width="8" height="180" fill="#343a40" />
      <rect x="120" y="205" width="50" height="22" rx="6" fill="#343a40" />
      {/* 나무 */}
      {[260, 690].map((x) => (
        <g key={x}>
          <rect x={x - 5} y="350" width="10" height="45" fill="#8d6e63" />
          <circle cx={x} cy="340" r="26" fill="#51cf66" />
        </g>
      ))}
    </svg>
  );
}

export default function Mission1({ progress, update, onComplete }) {
  const visited = progress.m1.visited;
  const [openId, setOpenId] = useState(null);
  const [picks, setPicks] = useState([]);
  const [phase, setPhase] = useState('choose');
  const count = Object.keys(visited).length;
  const total = m1.scenes.length;
  const canFinish = count >= m1.minToComplete;
  const scene = m1.scenes.find((s) => s.id === openId);

  const open = (s) => {
    setOpenId(s.id);
    if (visited[s.id]) {
      setPicks(visited[s.id]);
      setPhase('feedback');
    } else {
      setPicks([]);
      setPhase('choose');
    }
  };

  const confirm = () => {
    update((p) => {
      p.m1.visited[scene.id] = picks;
      return p;
    });
    setPhase('feedback');
  };

  const missed = scene ? scene.relatedRights.filter((id) => !picks.includes(id)) : [];

  return (
    <main className="main">
      <div className="scene">
        <CityScene />
        <div className="scene-ari">
          <Ari size={72} lines={[`반짝이는 곳을 눌러 봐! (${count}/${total})`, canFinish ? '이제 다음으로 갈 수 있어. 더 찾아봐도 좋아!' : `${m1.minToComplete}곳 이상 찾으면 다음으로 갈 수 있어.`]} />
        </div>
        {m1.scenes.map((s) => (
          <button
            key={s.id}
            className={`spot ${visited[s.id] ? 'visited' : ''}`}
            style={{ left: `${s.spot.x}%`, top: `${s.spot.y}%` }}
            onClick={() => open(s)}
            aria-label={s.title}
          >
            {s.icon}
            {visited[s.id] && <span className="check">✅</span>}
          </button>
        ))}
      </div>
      <div className="btn-row">
        <span className="muted big-text">
          찾은 그림자 <b className="counter">{count}</b> / {total}
        </span>
        <button className="btn green" disabled={!canFinish} onClick={onComplete}>
          그림자 찾기 끝! ▶
        </button>
      </div>

      {scene && (
        <Panel>
          <div className="two-col">
            <div>
              <div style={{ fontSize: '4rem', lineHeight: 1 }}>{scene.icon}</div>
              <h2 className="h2">{scene.title}</h2>
              <p className="story">{scene.situation}</p>
              {phase === 'feedback' && <div className="think">🤔 {scene.thinkQuestion}</div>}
            </div>
            <div>
              {phase === 'choose' ? (
                <>
                  <h3 className="h3">어떤 권리가 위협받을까? (1~{m1.maxPick}장 골라요)</h3>
                  <div className="rights-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                    {rights.map((r) => (
                      <RightCard key={r.id} id={r.id} selected={picks.includes(r.id)} onClick={() => setPicks((l) => toggleIn(l, r.id, m1.maxPick))} />
                    ))}
                  </div>
                  <div className="btn-row">
                    <button className="btn secondary small" onClick={() => setOpenId(null)}>
                      닫기
                    </button>
                    <button className="btn" disabled={picks.length === 0} onClick={confirm}>
                      아리의 생각 듣기 💬
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="h3">💬 아리의 생각</h3>
                  {picks.map((id) => (
                    <div className="feedback-item" key={id}>
                      <span className="ficon">{rightById[id]?.icon}</span>
                      <div>
                        <RightChip id={id} />
                        <div style={{ marginTop: 4 }}>{scene.feedback[id] || scene.feedback.default}</div>
                      </div>
                    </div>
                  ))}
                  {missed.length > 0 && (
                    <>
                      <h3 className="h3" style={{ marginTop: '0.8rem' }}>✨ 이런 권리와도 이어져 있어</h3>
                      {missed.map((id) => (
                        <div className="feedback-item extra" key={id}>
                          <span className="ficon">{rightById[id]?.icon}</span>
                          <div>
                            <RightChip id={id} />
                            <div style={{ marginTop: 4 }}>{scene.feedback[id]}</div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                  <div className="btn-row">
                    <button className="btn secondary small" onClick={() => setPhase('choose')}>
                      다시 고르기
                    </button>
                    <button className="btn green" onClick={() => setOpenId(null)}>
                      알겠어! 계속 찾기 ▶
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </Panel>
      )}
    </main>
  );
}
