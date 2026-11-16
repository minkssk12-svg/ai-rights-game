// 모든 JSON 데이터를 한곳에서 불러오고, 선생님이 수정하다 생긴 실수를 찾아 줍니다.
import config from '../data/config.json';
import rights from '../data/rights.json';
import m1 from '../data/mission1_scenes.json';
import m2 from '../data/mission2_cases.json';
import m3 from '../data/mission3_matches.json';
import m4 from '../data/mission4_dilemmas.json';
import m5 from '../data/mission5_declaration.json';

export { config, rights, m1, m2, m3, m4, m5 };

export const rightById = Object.fromEntries(rights.map((r) => [r.id, r]));

export function validateData() {
  const errors = [];
  const rightIds = new Set(rights.map((r) => r.id));
  const need = (obj, fields, where) => {
    fields.forEach((f) => {
      if (obj[f] === undefined || obj[f] === null || obj[f] === '') {
        errors.push(`${where}: '${f}' 칸이 비어 있어요.`);
      }
    });
  };
  const checkRights = (list, where) => {
    (list || []).forEach((id) => {
      if (!rightIds.has(id)) errors.push(`${where}: '${id}'는 rights.json에 없는 권리 id예요.`);
    });
  };
  const dupCheck = (list, where) => {
    const seen = new Set();
    list.forEach((x) => {
      if (seen.has(x.id)) errors.push(`${where}: id '${x.id}'가 두 번 쓰였어요.`);
      seen.add(x.id);
    });
  };

  rights.forEach((r, i) => need(r, ['id', 'icon', 'name', 'desc'], `rights.json ${i + 1}번째`));

  if (!Array.isArray(config.missions) || config.missions.length !== 5) {
    errors.push('config.json: missions는 5개여야 해요.');
  }

  // 미션 1
  dupCheck(m1.scenes, 'mission1_scenes.json');
  m1.scenes.forEach((s) => {
    const w = `mission1_scenes.json '${s.id}'`;
    need(s, ['id', 'icon', 'title', 'situation', 'thinkQuestion'], w);
    checkRights(s.relatedRights, w);
    if (!s.spot || typeof s.spot.x !== 'number' || typeof s.spot.y !== 'number') {
      errors.push(`${w}: spot의 x, y는 숫자(0~100)여야 해요.`);
    }
  });
  if (m1.minToComplete > m1.scenes.length) errors.push('mission1_scenes.json: minToComplete가 장면 수보다 커요.');

  // 미션 2
  const causeIds = new Set(m2.causes.map((c) => c.id));
  dupCheck(m2.cases, 'mission2_cases.json');
  m2.cases.forEach((c) => {
    const w = `mission2_cases.json '${c.id}'`;
    need(c, ['id', 'title', 'basis', 'story', 'explanation'], w);
    if (!['similar_real', 'fictional'].includes(c.basis)) {
      errors.push(`${w}: basis는 "similar_real" 또는 "fictional"만 쓸 수 있어요.`);
    }
    checkRights(c.answerRights, w);
    (c.answerCauses || []).forEach((id) => {
      if (!causeIds.has(id)) errors.push(`${w}: '${id}'는 causes에 없는 원인 id예요.`);
    });
    (c.victims || []).forEach((v) => {
      if (!(c.victimOptions || []).includes(v)) errors.push(`${w}: victims의 '${v}'가 victimOptions에 없어요.`);
    });
  });
  if (m2.minToComplete > m2.cases.length) errors.push('mission2_cases.json: minToComplete가 사건 수보다 커요.');

  // 미션 3
  const peopleIds = new Set(m3.people.map((p) => p.id));
  m3.robots.forEach((r) => {
    const w = `mission3_matches.json '${r.id}'`;
    need(r, ['id', 'icon', 'label', 'explanation'], w);
    checkRights(r.rights, w);
    (r.matchPeople || []).forEach((id) => {
      if (!peopleIds.has(id)) errors.push(`${w}: matchPeople의 '${id}'가 people에 없어요.`);
    });
  });
  m3.people.forEach((p) => {
    if (!m3.robots.some((r) => (r.matchPeople || []).includes(p.id))) {
      errors.push(`mission3_matches.json: '${p.label}'와 연결되는 로봇이 하나도 없어요.`);
    }
  });

  // 미션 4
  const promiseIds = new Set(m4.promiseCards.map((p) => p.id));
  if (promiseIds.size === 0) errors.push('mission4_dilemmas.json: promiseCards가 비어 있어요.');
  m4.dilemmas.forEach((d) => {
    const w = `mission4_dilemmas.json '${d.id}'`;
    need(d, ['id', 'question', 'situation'], w);
    if (!d.choices || d.choices.length < 2) errors.push(`${w}: choices는 2개 이상이어야 해요.`);
  });

  // 미션 5
  if (m5.minArticles > m5.maxArticles) errors.push('mission5_declaration.json: minArticles가 maxArticles보다 커요.');
  if (!m5.themes || m5.themes.length === 0) errors.push('mission5_declaration.json: themes가 비어 있어요.');

  return errors;
}

export const isTeacher = (() => {
  try {
    return new URLSearchParams(window.location.search).get('teacher') === '1';
  } catch {
    return false;
  }
})();
