import { useMemo, useState } from 'react';
import { config, isTeacher, validateData } from './lib/data.js';
import { useProgress } from './lib/store.js';
import TopBar from './components/TopBar.jsx';
import { StartScreen, CityMap, MissionIntro, ReflectScreen, BadgeScreen, RotateHint } from './screens/Basics.jsx';
import Mission1 from './screens/Mission1.jsx';
import Mission2 from './screens/Mission2.jsx';
import Mission3 from './screens/Mission3.jsx';
import Mission4 from './screens/Mission4.jsx';
import Mission5 from './screens/Mission5.jsx';

const MISSIONS = [Mission1, Mission2, Mission3, Mission4, Mission5];

export default function App() {
  const { progress, update, reset, hasProgress } = useProgress();
  const [screen, setScreen] = useState({ name: 'start', idx: 0 });
  const errors = useMemo(() => validateData(), []);

  const isUnlocked = (i) => isTeacher || i === 0 || !!progress.completed[config.missions[i - 1].id];
  const go = (name, idx = screen.idx) => setScreen({ name, idx });
  const m = config.missions[screen.idx];

  const finishPlay = () => {
    if (m.reflectPrompt) go('reflect');
    else {
      update((p) => ({ ...p, completed: { ...p.completed, [m.id]: true } }));
      go('badge');
    }
  };

  const doReset = () => {
    reset();
    setScreen({ name: 'start', idx: 0 });
  };

  let title = config.title;
  if (['intro', 'play', 'reflect', 'badge'].includes(screen.name)) {
    title = `${m.icon} 미션 ${screen.idx + 1}. ${m.name}`;
  }

  let body;
  switch (screen.name) {
    case 'start':
      body = <StartScreen errors={errors} hasProgress={hasProgress} onStart={() => go('map')} onReset={doReset} />;
      break;
    case 'map':
      body = <CityMap progress={progress} isUnlocked={isUnlocked} onOpen={(i) => setScreen({ name: 'intro', idx: i })} />;
      break;
    case 'intro':
      body = <MissionIntro index={screen.idx} onStart={() => go('play')} />;
      break;
    case 'play': {
      const Comp = MISSIONS[screen.idx];
      body = <Comp progress={progress} update={update} onComplete={finishPlay} />;
      break;
    }
    case 'reflect':
      body = (
        <ReflectScreen
          index={screen.idx}
          initial={progress.reflections[m.id]}
          onDone={(text) => {
            update((p) => ({
              ...p,
              reflections: { ...p.reflections, [m.id]: text },
              completed: { ...p.completed, [m.id]: true },
            }));
            go('badge');
          }}
        />
      );
      break;
    case 'badge':
      body = <BadgeScreen index={screen.idx} isLast={screen.idx === config.missions.length - 1} onNext={() => go('map')} />;
      break;
    default:
      body = null;
  }

  return (
    <div className="app">
      <TopBar
        title={title}
        progress={progress}
        onHome={screen.name !== 'start' && screen.name !== 'map' ? () => go('map') : screen.name === 'map' ? () => go('start') : null}
        homeLabel={screen.name === 'map' ? '🏠 처음' : '🗺️ 지도'}
        onReset={doReset}
      />
      {body}
      <RotateHint />
    </div>
  );
}
