import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { config, m4, m5 } from '../lib/data.js';
import { Ari, Robot, Panel } from '../components/common.jsx';

const STEPS = ['재료함', '조항 쓰기', '꾸미기', '저장하기', '패들렛 제출'];
const promiseById = Object.fromEntries(m4.promiseCards.map((p) => [p.id, p]));

function Stepper({ step }) {
  return (
    <div className="stepper">
      {STEPS.map((s, i) => (
        <span key={s} className={i === step ? 'on' : i < step ? 'done' : ''}>
          {i < step ? '✔ ' : `${i + 1}. `}
          {s}
        </span>
      ))}
    </div>
  );
}

function Materials({ progress, compact }) {
  const promiseIds = [...new Set(Object.values(progress.m4.done).flatMap((d) => d.promises || []))];
  const refl = config.missions.filter((m) => progress.reflections[m.id]);
  return (
    <div>
      {refl.length === 0 && <p className="muted">아직 모은 생각이 없어요. 그래도 괜찮아! 지금 떠오르는 생각으로 써 보자.</p>}
      {refl.map((m) => (
        <div className="material" key={m.id}>
          <div className="mtitle">
            {m.icon} 미션 {config.missions.indexOf(m) + 1} '{m.name}'에서 쓴 생각
          </div>
          <div style={{ fontSize: compact ? '1rem' : '1.15rem' }}>{progress.reflections[m.id]}</div>
        </div>
      ))}
      {promiseIds.length > 0 && (
        <div className="material">
          <div className="mtitle">🚦 갈림길 회의에서 고른 약속</div>
          <div className="chips" style={{ marginTop: 4 }}>
            {promiseIds.map((id) => (
              <span key={id} className="chip" style={{ minHeight: 0, fontSize: '0.95rem' }}>
                {promiseById[id]?.icon} {promiseById[id]?.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SignaturePad({ value, onChange }) {
  const ref = useRef(null);
  const drawing = useRef(false);

  useEffect(() => {
    const cv = ref.current;
    const ratio = window.devicePixelRatio || 1;
    const rect = cv.getBoundingClientRect();
    cv.width = rect.width * ratio;
    cv.height = rect.height * ratio;
    const ctx = cv.getContext('2d');
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e2a5a';
    if (value) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pos = (e) => {
    const r = ref.current.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  const down = (e) => {
    drawing.current = true;
    ref.current.setPointerCapture?.(e.pointerId);
    const ctx = ref.current.getContext('2d');
    const [x, y] = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 0.1, y + 0.1);
    ctx.stroke();
  };
  const move = (e) => {
    if (!drawing.current) return;
    const ctx = ref.current.getContext('2d');
    const [x, y] = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    onChange(ref.current.toDataURL('image/png'));
  };
  const clear = () => {
    const cv = ref.current;
    cv.getContext('2d').clearRect(0, 0, cv.width, cv.height);
    onChange('');
  };

  return (
    <div>
      <canvas ref={ref} className="sig-pad" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={up} />
      <div className="btn-row" style={{ marginTop: '0.4rem' }}>
        <button className="btn secondary small" onClick={clear}>
          🧽 서명 지우기
        </button>
      </div>
    </div>
  );
}

function Poster({ progress, posterRef }) {
  const d = progress.m5;
  const theme = m5.themes.find((t) => t.id === d.theme) || m5.themes[0];
  const today = new Date();
  const dateStr = `${today.getFullYear()}. ${today.getMonth() + 1}. ${today.getDate()}.`;
  const badges = config.missions.filter((m) => progress.completed[m.id] || m.id === 'm5').map((m) => m.badge.icon);
  return (
    <div ref={posterRef} className={`poster ${theme.dark ? 'dark' : ''}`} style={{ background: theme.bg }}>
      <div className="p-robot">
        <Robot size={120} />
      </div>
      <div className="p-top">🤖 {config.title} · {config.subtitle}</div>
      <div className="p-title" style={{ color: theme.dark ? '#fff' : theme.accent, paddingRight: 140 }}>
        {d.title || m5.titles[0]}
      </div>
      <ol className="p-list">
        {d.articles.map((a, i) => (
          <li key={i}>
            <span className="p-num" style={{ background: theme.accent, color: theme.dark ? '#1e2a5a' : '#fff' }}>
              {i + 1}
            </span>
            <span>{a}</span>
          </li>
        ))}
      </ol>
      <div className="p-foot">
        <div>
          <div className="p-badges">{badges.join('')}</div>
          <div style={{ fontSize: 20, fontWeight: 700, opacity: 0.8 }}>{dateStr}</div>
        </div>
        <div className="p-sign">
          {d.signature && (
            <div className="p-sigbox">
              <img src={d.signature} alt="" />
            </div>
          )}
          선언한 사람: {d.name || '인권 탐험대'}
        </div>
      </div>
    </div>
  );
}

export default function Mission5({ progress, update, onComplete }) {
  const d = progress.m5;
  const [step, setStep] = useState(d.articles.length >= m5.minArticles && d.saved ? 3 : 0);
  const [tab, setTab] = useState(m5.templates[0].id);
  const [word, setWord] = useState('');
  const [free, setFree] = useState('');
  const [showMat, setShowMat] = useState(false);
  const [img, setImg] = useState('');
  const [saving, setSaving] = useState(false);
  const [scale, setScale] = useState(0.5);
  const posterRef = useRef(null);
  const stageRef = useRef(null);

  const set = (patch) =>
    update((p) => {
      p.m5 = { ...p.m5, ...patch };
      return p;
    });

  const tpl = m5.templates.find((t) => t.id === tab);
  const isFree = tpl.words.length === 0 && !tpl.before;
  const sentence = isFree ? free.trim() : word.trim() ? `${tpl.before} ${word.trim()} ${tpl.after}`.trim() : '';
  const full = d.articles.length >= m5.maxArticles;

  const addArticle = () => {
    if (!sentence || full) return;
    set({ articles: [...d.articles, sentence] });
    setWord('');
    setFree('');
  };

  useLayoutEffect(() => {
    if (step !== 3 || !stageRef.current) return;
    const fit = () => {
      const r = stageRef.current.getBoundingClientRect();
      setScale(Math.min(r.width / 800, r.height / 1000, 1));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, [step]);

  const fileName = `AI인권선언문_${(d.name || '탐험대').replace(/[\\/:*?"<>|\s]/g, '')}.png`;

  const savePng = async () => {
    setSaving(true);
    try {
      const url = await toPng(posterRef.current, { pixelRatio: 1.5, cacheBust: true });
      setImg(url);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      set({ saved: true });
    } catch (e) {
      window.alert('사진을 만들지 못했어요. 한 번 더 눌러 보거나, 태블릿 화면 캡처를 사용해 주세요.');
    } finally {
      setSaving(false);
    }
  };

  const canShare = (() => {
    try {
      return !!(img && navigator.canShare && navigator.canShare({ files: [new File([''], 'a.png', { type: 'image/png' })] }));
    } catch {
      return false;
    }
  })();

  const share = async () => {
    try {
      const blob = await (await fetch(img)).blob();
      const file = new File([blob], fileName, { type: 'image/png' });
      await navigator.share({ files: [file], title: d.title || m5.titles[0] });
    } catch {
      /* 공유를 취소했어요 */
    }
  };

  return (
    <main className="main">
      <Stepper step={step} />

      {step === 0 && (
        <div className="two-col">
          <div>
            <Ari size={96} lines={['지금까지 탐험하며 모은 생각이야.', '이 재료를 보면서 AI 로봇이 사람의 권리를 지키려면 어떻게 만들고, 어떻게 써야 할지 선언문으로 정리해 보자!']} />
          </div>
          <div className="card" style={{ maxHeight: '100%', overflow: 'auto' }}>
            <h2 className="h2">🧺 나의 재료함</h2>
            <Materials progress={progress} />
            <div className="btn-row">
              <button className="btn yellow" onClick={() => setStep(1)}>
                선언문 쓰러 가기 ▶
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="two-col" style={{ gridTemplateColumns: '1fr 1.3fr' }}>
          <div className="card">
            <h2 className="h2">
              📜 나의 선언문 ({d.articles.length}/{m5.maxArticles})
            </h2>
            {d.articles.length === 0 && <p className="muted">오른쪽에서 문장을 만들어 추가해 줘. {m5.minArticles}개 이상 필요해!</p>}
            <ol className="article-list">
              {d.articles.map((a, i) => (
                <li key={i}>
                  <span className="anum">{i + 1}</span>
                  <span>{a}</span>
                  <button className="del" aria-label="지우기" onClick={() => set({ articles: d.articles.filter((_, j) => j !== i) })}>
                    ✕
                  </button>
                </li>
              ))}
            </ol>
            <div className="btn-row">
              <button className="btn secondary small" onClick={() => setShowMat(true)}>
                🧺 재료함 보기
              </button>
              <button className="btn green" disabled={d.articles.length < m5.minArticles} onClick={() => setStep(2)}>
                꾸미기 ▶
              </button>
            </div>
          </div>
          <div className="card">
            <h3 className="h3">✍️ 문장 만들기</h3>
            <div className="tabs">
              {m5.templates.map((t) => (
                <button key={t.id} className={`tab ${tab === t.id ? 'on' : ''}`} onClick={() => { setTab(t.id); setWord(''); }}>
                  {t.tab}
                </button>
              ))}
            </div>
            {isFree ? (
              <>
                <p className="muted" style={{ marginTop: 0 }}>내 생각을 한 문장으로 직접 써 봐. (예: "AI 안경은 찍을 때 꼭 알려 줘야 한다.")</p>
                <input className="text-input" value={free} maxLength={60} onChange={(e) => setFree(e.target.value)} placeholder="여기를 눌러 문장을 써요" />
              </>
            ) : (
              <>
                <div className="sentence-preview">
                  {tpl.before} <span className="blank">{word || '　'}</span> {tpl.after}
                </div>
                <div className="chips" style={{ marginBottom: '0.6rem' }}>
                  {tpl.words.map((w) => (
                    <button key={w} className={`chip ${word === w ? 'selected' : ''}`} onClick={() => setWord(w)}>
                      {w}
                    </button>
                  ))}
                </div>
                <input className="text-input" value={tpl.words.includes(word) ? '' : word} maxLength={40} onChange={(e) => setWord(e.target.value)} placeholder="빈칸에 들어갈 말을 직접 써도 돼요" />
              </>
            )}
            <div className="btn-row">
              {full && <span className="muted">조항은 {m5.maxArticles}개까지 쓸 수 있어요.</span>}
              <button className="btn" disabled={!sentence || full} onClick={addArticle}>
                ＋ 선언문에 추가
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="two-col even">
          <div className="card">
            <h3 className="h3">🏷️ 선언문 제목</h3>
            <div className="chips" style={{ marginBottom: '0.5rem' }}>
              {m5.titles.map((t) => (
                <button key={t} className={`chip ${d.title === t ? 'selected' : ''}`} onClick={() => set({ title: t })}>
                  {t}
                </button>
              ))}
            </div>
            <input className="text-input" value={m5.titles.includes(d.title) ? '' : d.title} maxLength={24} onChange={(e) => set({ title: e.target.value })} placeholder="제목을 직접 지어도 돼요" />
            <h3 className="h3" style={{ marginTop: '1rem' }}>🙋 선언한 사람</h3>
            <input className="text-input" value={d.name} maxLength={12} onChange={(e) => set({ name: e.target.value })} placeholder="별명 또는 선생님이 알려 준 이름" />
            <h3 className="h3" style={{ marginTop: '1rem' }}>🎨 배경</h3>
            <div className="theme-row">
              {m5.themes.map((t) => (
                <button
                  key={t.id}
                  className={`theme-swatch ${(d.theme || m5.themes[0].id) === t.id ? 'on' : ''}`}
                  style={{ background: t.bg, color: t.dark ? '#fff' : '#1e2a5a' }}
                  onClick={() => set({ theme: t.id })}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 className="h3">✍️ 손가락으로 서명해요</h3>
            <SignaturePad value={d.signature} onChange={(v) => set({ signature: v })} />
            <div className="btn-row">
              <button className="btn secondary small" onClick={() => setStep(1)}>
                ← 조항 고치기
              </button>
              <button className="btn green" onClick={() => setStep(3)}>
                완성하기 ▶
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1.4rem' }}>
          <div ref={stageRef} className="poster-stage">
            <div style={{ width: 800 * scale, height: 1000 * scale }}>
              <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                <Poster progress={progress} posterRef={posterRef} />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1rem' }}>
            <Ari size={84} mood="wow" lines={['우와, 멋진 선언문이 완성됐어!', '[사진 저장]을 눌러 태블릿에 저장한 다음, 패들렛에 올려 줘.']} />
            <button className="btn yellow" style={{ minHeight: 80, fontSize: '1.45rem' }} disabled={saving} onClick={savePng}>
              {saving ? '사진 만드는 중…' : '📥 사진 저장'}
            </button>
            <div className="btn-row" style={{ justifyContent: 'space-between' }}>
              <button className="btn secondary small" onClick={() => setStep(2)}>
                ← 다시 꾸미기
              </button>
              <button className="btn green" disabled={!d.saved} onClick={() => setStep(4)}>
                패들렛에 올리러 가기 ▶
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="two-col">
          <div>
            <Ari size={96} lines={['마지막 단계야! 저장한 사진을 패들렛에 올려 줘.', '친구들의 선언문도 읽어 보고, 마음에 드는 조항에 댓글을 남겨 봐.']} />
          </div>
          <div className="card">
            <h2 className="h2">📤 패들렛에 올리는 방법</h2>
            <ol className="steps-list">
              {config.submitSteps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
            <div className="btn-row" style={{ justifyContent: 'flex-start' }}>
              {config.padletUrl && (
                <a className="btn" href={config.padletUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                  🧷 우리 반 패들렛 열기
                </a>
              )}
              <button className="btn secondary small" onClick={() => setStep(3)}>
                ← 다시 저장하기
              </button>
            </div>
            <div className="btn-row">
              <button className="btn green" style={{ minHeight: 76 }} onClick={onComplete}>
                패들렛에 올렸어요! 🎉
              </button>
            </div>
          </div>
        </div>
      )}

      {showMat && (
        <Panel>
          <h2 className="h2">🧺 나의 재료함</h2>
          <Materials progress={progress} compact />
          <div className="btn-row">
            <button className="btn" onClick={() => setShowMat(false)}>
              닫기
            </button>
          </div>
        </Panel>
      )}

      {img && (
        <Panel>
          <div className="two-col" style={{ alignItems: 'center' }}>
            <img className="saved-img" src={img} alt="완성한 AI 인권 선언문" />
            <div>
              <h2 className="h2">✅ 사진을 저장했어요!</h2>
              <p className="big-text" style={{ marginTop: 0 }}>
                태블릿의 <b>갤러리</b> 또는 <b>내 파일 → 다운로드</b> 폴더에 있어요.
              </p>
              <p className="muted">저장이 안 되었다면, 왼쪽 사진을 길게 누르고 '이미지 다운로드'를 눌러 주세요.</p>
              {canShare && (
                <button className="btn secondary" onClick={share} style={{ marginBottom: '0.6rem' }}>
                  📤 바로 공유하기 (패들렛 앱)
                </button>
              )}
              <div className="btn-row">
                <button className="btn green" onClick={() => { setImg(''); setStep(4); }}>
                  다음 ▶
                </button>
              </div>
            </div>
          </div>
        </Panel>
      )}
    </main>
  );
}
