// 진행 상황은 이 태블릿의 브라우저 안에만 저장돼요. (서버로 보내지 않음)
import { useEffect, useState, useCallback } from 'react';

const KEY = 'robotcity-ai-rights-v1';

export const emptyProgress = () => ({
  completed: {},
  reflections: {},
  m1: { visited: {} },
  m2: { done: {} },
  m3: { matched: {} },
  m4: { done: {} },
  m5: { articles: [], title: '', name: '', theme: '', signature: '', saved: false },
});

function load() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyProgress();
    const data = JSON.parse(raw);
    const base = emptyProgress();
    return { ...base, ...data, m1: { ...base.m1, ...data.m1 }, m2: { ...base.m2, ...data.m2 }, m3: { ...base.m3, ...data.m3 }, m4: { ...base.m4, ...data.m4 }, m5: { ...base.m5, ...data.m5 } };
  } catch {
    return emptyProgress();
  }
}

export function useProgress() {
  const [progress, setProgress] = useState(load);

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(progress));
    } catch {
      /* 저장 공간을 쓸 수 없어도 게임은 계속돼요 */
    }
  }, [progress]);

  const update = useCallback((fn) => setProgress((p) => fn(structuredClone(p))), []);
  const reset = useCallback(() => setProgress(emptyProgress()), []);
  const hasProgress = Object.keys(progress.completed).length > 0 || Object.keys(progress.m1.visited).length > 0;

  return { progress, update, reset, hasProgress };
}
