import { useState } from 'react';
import { m2, rights, isTeacher } from '../lib/data.js';
import { Ari, RightCard, RightChip, toggleIn } from '../components/common.jsx';

const causeById = Object.fromEntries(m2.causes.map((c) => [c.id, c]));

function BasisTag({ c }) {
  return <span className={`basis-tag ${c.basis}`}>{c.basis === 'similar_real' ? '🔍 ' : '✏️ '}{c.basisLabel}</span>;
}

function CompareBlock({ title, mine, answer, render }) {
  const same = mine.filter((x) => answer.includes(x));
  const onlyMine = mine.filter((x) => !answer.includes(x));
  const onlyAri = answer.filter((x) => !mine.includes(x));
  return (
    <div style={{ marginBottom: '0.8rem' }}>
      <h3 className="h3">{title}</h3>
      {same.map((x) => (
        <div key={x} className="compare-line same">⭐ 같은 생각: {render(x)}</div>
      ))}
      {onlyMine.map((x) => (
        <div key={x} className="compare-line mine">💡 내가 더 찾은 생각: {render(x)}</div>
      ))}
      {onlyAri.map((x) => (
        <div key={x} className="compare-line ari">🤖 아리가 찾은 생각: {render(x)}</div>
      ))}
    </div>
  );
}

export default function Mission2({ progress, update, onComplete }) {
  const done = progress.m2.done;
  const [openId, setOpenId] = useState(null);
  const [phase, setPhase] = useState('note');
  const [note, setNote] = useState({ victims: [], rights: [], causes: [] });
  const c = m2.cases.find((x) => x.id === openId);
  const count = Object.keys(done).length;
  const canFinish = count >= m2.minToComplete;

  const open = (item) => {
    setOpenId(item.id);
    if (done[item.id]) {
      setNote(done[item.id]);
      setPhase('compare');
    } else {
      setNote({ victims: [], rights: [], causes: [] });
      setPhase('note');
    }
  };

  const ready = note.victims.length && note.rights.length && note.causes.length;

  const submit = () => {
    update((p) => {
      p.m2.done[c.id] = note;
      return p;
    });
    setPhase('compare');
  };

  // 사건 목록
  if (!c) {
    return (
      <main className="main">
        <div style={{ marginBottom: '0.8rem' }}>
          <Ari size={72} lines={[`사건 파일을 ${m2.minToComplete}개 이상 골라 조사해 줘. (조사 완료 ${count}개)`, '🔍 표시는 실제로 비슷한 일이 있었던 사건, ✏️ 표시는 꾸며 낸 이야기야.']} />
        </div>
        <div className="case-grid">
          {m2.cases.map((item) => (
            <button key={item.id} className={`case-card ${done[item.id] ? 'done' : ''}`} onClick={() => open(item)}>
              {done[item.id] && <span className="done-mark">✅</span>}
              <span className="cicon">{item.icon}</span>
              <span className="ctitle">{item.title}</span>
              <BasisTag c={item} />
            </button>
          ))}
        </div>
        <div className="btn-row">
          <span className="muted big-text">
            조사 완료 <b className="counter">{count}</b> / {m2.cases.length}
          </span>
          <button className="btn green" disabled={!canFinish} onClick={onComplete}>
            조사 끝내기 ▶
          </button>
        </div>
      </main>
    );
  }

  const storyCard = (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '2.6rem' }}>{c.icon}</span>
        <h2 className="h2" style={{ margin: 0 }}>{c.title}</h2>
      </div>
      <div style={{ margin: '0.5rem 0' }}>
        <BasisTag c={c} />
      </div>
      <p className="story" style={{ margin: 0 }}>{c.story}</p>
      {isTeacher && c.teacherNote && <div className="teacher-note">👩‍🏫 교사용 메모: {c.teacherNote}</div>}
    </div>
  );

  if (phase === 'note') {
    return (
      <main className="main">
        <div className="two-col" style={{ gridTemplateColumns: '0.85fr 1.3fr' }}>
          <div>{storyCard}</div>
          <div className="card">
            <h2 className="h2">🗒️ 탐정 노트</h2>
            <div className="note-q">
              <div className="q">1. 누가 피해를 입었을까?</div>
              <div className="chips">
                {c.victimOptions.map((v) => (
                  <button key={v} className={`chip ${note.victims.includes(v) ? 'selected' : ''}`} onClick={() => setNote((n) => ({ ...n, victims: toggleIn(n.victims, v) }))}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div className="note-q">
              <div className="q">2. 어떤 권리가 침해되었을까? (1~2장)</div>
              <div className="rights-grid">
                {rights.map((r) => (
                  <RightCard key={r.id} id={r.id} compact selected={note.rights.includes(r.id)} onClick={() => setNote((n) => ({ ...n, rights: toggleIn(n.rights, r.id, 2) }))} />
                ))}
              </div>
            </div>
            <div className="note-q">
              <div className="q">3. 왜 이런 일이 생겼을까? (1~2개)</div>
              <div className="chips">
                {m2.causes.map((k) => (
                  <button key={k.id} className={`chip ${note.causes.includes(k.id) ? 'selected' : ''}`} onClick={() => setNote((n) => ({ ...n, causes: toggleIn(n.causes, k.id, 2) }))}>
                    {k.icon} {k.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="btn-row sticky-actions">
              <button className="btn secondary small" onClick={() => setOpenId(null)}>
                ← 다른 사건 고르기
              </button>
              <button className="btn" disabled={!ready} onClick={submit}>
                아리의 해설과 비교하기 🔎
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 비교
  return (
    <main className="main">
      <div className="two-col">
        <div>
          {storyCard}
          <div className="card" style={{ marginTop: '1rem' }}>
            <h3 className="h3">🤖 탐정 아리의 해설</h3>
            <p className="big-text" style={{ margin: 0 }}>{c.explanation}</p>
          </div>
        </div>
        <div className="card">
          <h2 className="h2">내 노트 vs 아리의 노트</h2>
          <p className="legend" style={{ marginTop: 0 }}>⭐ 같은 생각 · 💡 내가 더 찾은 생각 · 🤖 아리가 찾은 생각</p>
          <CompareBlock title="누가 피해를 입었을까?" mine={note.victims} answer={c.victims} render={(v) => <b>{v}</b>} />
          <CompareBlock title="어떤 권리가?" mine={note.rights} answer={c.answerRights} render={(id) => <RightChip id={id} />} />
          <CompareBlock
            title="왜 생겼을까?"
            mine={note.causes}
            answer={c.answerCauses}
            render={(id) => (
              <b>
                {causeById[id]?.icon} {causeById[id]?.label}
              </b>
            )}
          />
          <p className="muted" style={{ fontSize: '1rem' }}>💡 내가 더 찾은 생각이 있다면, 왜 그렇게 생각했는지 짝에게 설명해 볼까?</p>
          <div className="think">🤔 {c.reflectQuestion}</div>
          <div className="btn-row">
            <button className="btn secondary small" onClick={() => setPhase('note')}>
              노트 고치기
            </button>
            <button className="btn green" onClick={() => setOpenId(null)}>
              사건 목록으로 ▶
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
