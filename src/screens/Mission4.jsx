import { useState } from 'react';
import { m4 } from '../lib/data.js';
import { Ari, toggleIn } from '../components/common.jsx';

const promiseById = Object.fromEntries(m4.promiseCards.map((p) => [p.id, p]));

export default function Mission4({ progress, update, onComplete }) {
  const done = progress.m4.done;
  const firstOpen = m4.dilemmas.findIndex((d) => !done[d.id]);
  const [idx, setIdx] = useState(firstOpen === -1 ? 0 : firstOpen);
  const d = m4.dilemmas[idx];
  const saved = done[d.id];
  const [phase, setPhase] = useState(saved ? 'closing' : 'question');
  const [choice, setChoice] = useState(saved?.choice || null);
  const [promises, setPromises] = useState(saved?.promises || []);
  const choiceObj = d.choices.find((c) => c.id === choice);
  const isLast = idx === m4.dilemmas.length - 1;
  const allDone = m4.dilemmas.every((x) => done[x.id]);

  const goTo = (i) => {
    const s = done[m4.dilemmas[i].id];
    setIdx(i);
    setPhase(s ? 'closing' : 'question');
    setChoice(s?.choice || null);
    setPromises(s?.promises || []);
  };

  const save = () => {
    update((p) => {
      p.m4.done[d.id] = { choice, promises };
      return p;
    });
    setPhase('closing');
  };

  const head = (
    <div className="dilemma-head">
      <span className="dicon">{d.icon}</span>
      <div style={{ flex: 1 }}>
        <span className="progress-pill">
          고민 {idx + 1} / {m4.dilemmas.length}
        </span>
        <h2 className="h2" style={{ margin: '0.3rem 0 0' }}>{d.question}</h2>
      </div>
    </div>
  );

  return (
    <main className="main">
      {head}

      {phase === 'question' && (
        <div className="two-col">
          <div className="card">
            <p className="story" style={{ margin: 0 }}>{d.situation}</p>
          </div>
          <div>
            <h3 className="h3">나라면 어떻게 할까?</h3>
            <div className="choice-list">
              {d.choices.map((c) => (
                <button
                  key={c.id}
                  className="choice-btn"
                  onClick={() => {
                    setChoice(c.id);
                    setPhase('voices');
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {phase === 'voices' && choiceObj && (
        <>
          <div style={{ marginBottom: '0.9rem' }}>
            <Ari size={72} lines={[`'${choiceObj.label}'를 골랐구나.`, choiceObj.reaction]} />
          </div>
          <h3 className="h3">🗣️ 여러 사람의 목소리를 들어 봐</h3>
          <div className="voices">
            {d.voices.map((v) => (
              <div className="voice" key={v.who}>
                <span className="vicon">{v.icon}</span>
                <div className="vbubble">
                  <div className="vwho">{v.who}</div>
                  {v.text}
                </div>
              </div>
            ))}
          </div>
          <div className="btn-row">
            <button className="btn secondary small" onClick={() => setPhase('question')}>
              ← 다시 고르기
            </button>
            <button className="btn" onClick={() => setPhase('promise')}>
              약속 정하러 가기 ▶
            </button>
          </div>
        </>
      )}

      {phase === 'promise' && (
        <>
          <h3 className="h3">🤝 {choice === 'no' ? d.promisePrompt.no : d.promisePrompt.default}</h3>
          <div className="promise-grid">
            {m4.promiseCards.map((p) => (
              <button key={p.id} className={`promise-card ${promises.includes(p.id) ? 'selected' : ''}`} onClick={() => setPromises((l) => toggleIn(l, p.id, m4.maxPromises))}>
                <span className="picon">{p.icon}</span>
                {p.label}
              </button>
            ))}
          </div>
          <div className="btn-row">
            <span className="muted">
              {promises.length} / {m4.maxPromises}개 골랐어요
            </span>
            <button className="btn secondary small" onClick={() => setPhase('voices')}>
              ← 목소리 다시 보기
            </button>
            <button className="btn green" disabled={promises.length === 0} onClick={save}>
              약속 정하기 ✔
            </button>
          </div>
        </>
      )}

      {phase === 'closing' && (
        <div className="two-col even">
          <div className="card">
            <h3 className="h3">나의 선택</h3>
            <p className="big-text" style={{ marginTop: 0, fontWeight: 800 }}>👉 {choiceObj?.label}</p>
            <h3 className="h3">내가 정한 약속</h3>
            <div className="chips">
              {promises.map((id) => (
                <span key={id} className="chip selected">
                  {promiseById[id]?.icon} {promiseById[id]?.label}
                </span>
              ))}
            </div>
          </div>
          <div>
            <Ari mood="happy" size={84} lines={[m4.closing, '다른 친구는 어떤 선택을 했을지 궁금하지 않니? 이유를 서로 이야기해 봐도 좋아.']} />
            <div className="btn-row">
              <button className="btn secondary small" onClick={() => setPhase('question')}>
                다시 생각하기
              </button>
              {isLast ? (
                <button className="btn green" disabled={!allDone} onClick={onComplete}>
                  회의 마치기 ▶
                </button>
              ) : (
                <button className="btn green" onClick={() => goTo(idx + 1)}>
                  다음 고민 ▶
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
