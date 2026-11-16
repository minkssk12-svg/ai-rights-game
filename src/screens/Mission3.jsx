import { useEffect, useState } from 'react';
import { m3 } from '../lib/data.js';
import { Ari, RightChip, Panel } from '../components/common.jsx';

const personById = Object.fromEntries(m3.people.map((p) => [p.id, p]));
const robotById = Object.fromEntries(m3.robots.map((r) => [r.id, r]));

export default function Mission3({ progress, update, onComplete }) {
  const matched = progress.m3.matched; // robotId -> personId
  const [person, setPerson] = useState(null);
  const [robot, setRobot] = useState(null);
  const [toast, setToast] = useState('');
  const [showRobot, setShowRobot] = useState(null);
  const [phase, setPhase] = useState('match');

  const linkedPeople = Object.values(matched);
  const pairNo = (robotId) => Object.keys(matched).indexOf(robotId) + 1;
  const allDone = m3.people.every((p) => linkedPeople.includes(p.id));

  useEffect(() => {
    if (!person || !robot) return;
    const r = robotById[robot];
    if (r.matchPeople.includes(person)) {
      update((p) => {
        p.m3.matched[robot] = person;
        return p;
      });
      setShowRobot(robot);
      setToast('');
    } else {
      setToast(
        m3.notMatchMessage.replaceAll('{robot}', r.label).replaceAll('{person}', personById[person].label),
      );
    }
    setPerson(null);
    setRobot(null);
  }, [person, robot, update]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3800);
    return () => clearTimeout(t);
  }, [toast]);

  if (phase === 'flip') {
    return (
      <main className="main">
        <div style={{ marginBottom: '0.9rem' }}>
          <Ari mood="wow" size={84} lines={['잠깐! 좋은 점만 있을까? 🤔', '도움을 주는 로봇도 잘못 쓰이면 미션 1에서 본 그림자가 생길 수 있어. 아래 질문을 읽고 생각해 봐.']} />
        </div>
        <div className="flip-list">
          {m3.robots
            .filter((r) => matched[r.id])
            .map((r) => (
              <div key={r.id} className="flip-item">
                <span className="ficon">{r.icon}</span>
                <div>
                  <b>{r.label}</b>
                  <div>{r.flipQuestion}</div>
                </div>
              </div>
            ))}
        </div>
        <div className="btn-row">
          <button className="btn green" onClick={onComplete}>
            생각해 봤어요 ▶
          </button>
        </div>
      </main>
    );
  }

  const sr = showRobot && robotById[showRobot];

  return (
    <main className="main">
      <div style={{ marginBottom: '0.7rem' }}>
        <Ari size={64} lines={allDone ? '모두 연결했어! 아래 버튼을 눌러 줘.' : '① 왼쪽에서 도움이 필요한 사람을 누르고 → ② 오른쪽에서 도와줄 로봇을 눌러 봐!'} />
      </div>
      <div className="match-board">
        <div className="match-col">
          <h3>🙋 도움이 필요한 사람</h3>
          {m3.people.map((p) => {
            const rid = Object.keys(matched).find((k) => matched[k] === p.id);
            return (
              <button
                key={p.id}
                className={`match-card ${person === p.id ? 'active' : ''} ${rid ? 'linked' : ''}`}
                onClick={() => !rid && setPerson(person === p.id ? null : p.id)}
              >
                <span className="micon">{p.icon}</span>
                <span>
                  <div className="mlabel">{p.label}</div>
                  <div className="mneed">{p.need}</div>
                </span>
                {rid && <span className="pair">{pairNo(rid)}</span>}
              </button>
            );
          })}
        </div>
        <div className="match-col">
          <h3>🤖 AI 로봇</h3>
          {m3.robots.map((r) => (
            <button
              key={r.id}
              className={`match-card ${robot === r.id ? 'active' : ''} ${matched[r.id] ? 'linked' : ''}`}
              onClick={() => (matched[r.id] ? setShowRobot(r.id) : setRobot(robot === r.id ? null : r.id))}
            >
              <span className="micon">{r.icon}</span>
              <span>
                <div className="mlabel">{r.label}</div>
                {r.tag && <span className="tag-real">🌍 {r.tag}</span>}
              </span>
              {matched[r.id] && <span className="pair">{pairNo(r.id)}</span>}
            </button>
          ))}
        </div>
      </div>
      <div className="btn-row">
        <span className="muted big-text">
          연결 <b className="counter">{linkedPeople.length}</b> / {m3.people.length}
        </span>
        <button className="btn green" disabled={!allDone} onClick={() => setPhase('flip')}>
          다 연결했어요 ▶
        </button>
      </div>

      {toast && (
        <div className="toast">
          <Ari size={60} mood="think" lines={toast} bob={false} />
        </div>
      )}

      {sr && (
        <Panel>
          <div className="two-col even">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4.5rem', lineHeight: 1.1 }}>
                {personById[matched[sr.id]]?.icon} 🤝 {sr.icon}
              </div>
              <h2 className="h2" style={{ marginTop: '0.6rem' }}>{sr.label}</h2>
              <p className="muted big-text" style={{ margin: 0 }}>→ {personById[matched[sr.id]]?.label}</p>
            </div>
            <div>
              <h3 className="h3">🌱 이렇게 도와줘요</h3>
              <p className="big-text" style={{ marginTop: 0 }}>{sr.explanation}</p>
              <h3 className="h3">지켜 주는 권리</h3>
              <div className="chips">
                {sr.rights.map((id) => (
                  <RightChip key={id} id={id} />
                ))}
              </div>
              <div className="btn-row">
                <button className="btn green" onClick={() => setShowRobot(null)}>
                  좋아! 계속하기 ▶
                </button>
              </div>
            </div>
          </div>
        </Panel>
      )}
    </main>
  );
}
