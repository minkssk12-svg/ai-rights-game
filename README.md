# 🤖 로봇시티 인권 탐험대

5학년 도덕 8단원 「인권을 소중하게」 – '우리들의 인공지능 이야기' 수업용 웹 게임입니다.

- 태블릿(가로 화면) 브라우저에서 1인 1기기로 진행, 전체 25~30분
- 로그인·서버·DB 없음. 진행 상황은 **그 태블릿의 브라우저 안에만** 저장됩니다(새로고침해도 이어서 가능).
- 마지막에 만든 선언문을 PNG 사진으로 저장 → 패들렛에 올리기

| 정거장 | 미션 | 수업 단계 | 시간 |
|---|---|---|---|
| 1 | 🔦 그림자 찾기 | 부정적 영향 살펴보기 | 5분 |
| 2 | 🕵️ 사건 파일 탐정 | 인권 침해 사례 조사하기 | 7분 |
| 3 | 🌱 희망 연결하기 | 긍정적 영향 살펴보기 | 4분 |
| 4 | 🚦 갈림길 회의 | 개발·활용 방향 생각하기 | 6분 |
| 5 | 📜 AI 인권 선언문 | 인권 존중 사회를 위한 방향 정리 | 6분 |

미션 1~4가 끝나면 '한 줄 생각'을 쓰고, 이 생각들이 미션 5의 **재료함**에 모입니다.

---

## 1. 내 컴퓨터에서 실행해 보기

[Node.js](https://nodejs.org) (LTS 버전)를 설치한 뒤, 이 폴더에서:

```bash
npm install      # 처음 한 번만
npm run dev      # 화면에 나오는 주소를 브라우저로 열기
```

같은 와이파이의 태블릿에서도 `Network:`에 나온 주소(예: `http://192.168.0.5:5173`)로 접속해 볼 수 있습니다.

## 2. Vercel에 배포하기

**방법 A – GitHub 이용 (추천, 수정할 때마다 자동 반영)**
1. GitHub에 새 저장소를 만들고 이 폴더를 올립니다. (`node_modules`, `dist` 폴더는 올리지 않아도 됩니다)
2. [vercel.com](https://vercel.com) → **Add New → Project** → 방금 만든 저장소 **Import**
3. Framework Preset이 **Vite**로 잡혀 있는지 확인 → **Deploy**
4. 나온 주소(예: `https://ai-rights-game.vercel.app`)를 학생들에게 QR코드로 나눠 줍니다.

이후 JSON을 고쳐 GitHub에 올리면 1분 안에 자동으로 다시 배포됩니다.

**방법 B – 명령어 한 줄**
```bash
npx vercel        # 처음엔 로그인 안내가 나옵니다
npx vercel --prod
```

## 3. 수업 전에 꼭 할 일

1. `src/data/config.json`의 `"padletUrl"`에 우리 반 패들렛 주소를 넣으세요. (넣으면 마지막 화면에 **[우리 반 패들렛 열기]** 버튼이 생깁니다)
2. 주소 끝에 `?teacher=1`을 붙여 접속하면 **교사 모드**입니다.
   - 모든 미션이 처음부터 열려 있어 미리 살펴볼 수 있어요.
   - 사건 파일(미션 2)에 **교사용 메모**(실제 유사 사례 설명)가 보여요.
   - 위쪽에 **↺ 초기화** 버튼이 생겨요.
3. 첫 화면에 빨간 "선생님 확인" 상자가 보이면 JSON 파일에 고칠 곳이 있다는 뜻입니다. 상자에 적힌 파일과 칸을 고쳐 주세요.
4. 갤럭시탭 크롬에서 한 번 끝까지 해 보고, **사진 저장 → 패들렛 업로드**가 되는지 확인해 주세요.

> 같은 태블릿을 다른 반 학생이 이어서 쓸 때는 첫 화면의 **[↺ 처음부터 다시]**를 누르면 됩니다.

---

## 4. 내용 고치기 (src/data 폴더)

모든 글은 `src/data/*.json`에 있습니다. 메모장이나 VS Code로 열어서 **따옴표 안의 글자만** 고치면 됩니다.

⚠️ JSON 규칙
- 글자는 `"큰따옴표"` 안에 씁니다.
- 항목 사이에는 쉼표 `,`가 있고, **마지막 항목 뒤에는 쉼표가 없습니다.**
- `id`는 영어·숫자·`-`로만 쓰고, 다른 곳에서 그 id를 부르고 있으면 함께 바꿔야 합니다.

### 어느 파일이 어디에 나오나요?

| 파일 | 화면 | 자주 고치는 칸 |
|---|---|---|
| `config.json` | 첫 화면, 미션 소개, 한 줄 생각, 제출 안내 | `padletUrl`, `missions[].intro`, `reflectPrompt`, `submitSteps` |
| `rights.json` | 모든 미션의 **인권 카드 6장** | `name`, `desc`, `icon` |
| `mission1_scenes.json` | 미션 1 거리 장면 | `situation`, `relatedRights`, `feedback`, `thinkQuestion`, `spot` |
| `mission2_cases.json` | 미션 2 사건 파일 | `story`, `basis`, `teacherNote`, `explanation` |
| `mission3_matches.json` | 미션 3 연결하기 | `people`, `robots[].matchPeople`, `flipQuestion` |
| `mission4_dilemmas.json` | 미션 4 딜레마 | `question`, `choices`, `voices`, `promiseCards` |
| `mission5_declaration.json` | 미션 5 선언문 | `templates[].words`, `titles`, `themes`, `min/maxArticles` |

### 칸 설명

**인권 카드 (rights.json)** – `id`는 다른 파일에서 `"privacy"`처럼 불러 씁니다.
`privacy`(사생활) · `equality`(평등) · `safety`(안전) · `work`(일) · `dignity`(존엄) · `know`(알 권리)

**미션 1 장면**
- `spot`: 반짝이는 버튼 위치. `x`는 왼쪽→오른쪽 0~100, `y`는 위→아래 0~100 (%)
- `relatedRights`: 이 장면과 이어진 권리. 학생이 고르지 않은 것은 "✨ 이런 권리와도 이어져 있어"로 보여 줍니다.
- `feedback`: 권리 id별 아리의 말. 목록에 없는 권리를 고르면 `default`가 나옵니다.
- `minToComplete`: 몇 곳을 찾으면 다음으로 갈 수 있는지

**미션 2 사건**
- `basis`: `"similar_real"`(🔍 실제 유사 사례 있음) 또는 `"fictional"`(✏️ 가상 이야기) **둘 중 하나만** 쓸 수 있어요.
- `basisLabel`: 화면에 보이는 꼬리표 글자
- `teacherNote`: 교사 모드에서만 보이는 메모(출처·배경). 학생에게는 보이지 않아요.
- `victimOptions` / `victims`: 학생이 고를 보기 / 아리의 생각 (victims는 victimOptions 안에 있어야 해요)
- `answerRights`, `answerCauses`: 아리의 노트. 학생 노트와 비교해 ⭐같은 생각 · 💡내가 더 찾은 생각 · 🤖아리가 찾은 생각으로 보여 줍니다. (정답/오답 표시는 없어요)

**미션 3 연결**
- `robots[].matchPeople`: 이 로봇과 연결되는 사람 id (여러 명 가능)
- `tag`: "실제로 쓰이고 있어요" 같은 작은 꼬리표 (비워 두면 안 보여요)
- `flipQuestion`: 다 연결한 뒤 나오는 "잠깐! 좋은 점만 있을까?" 질문

**미션 4 딜레마**
- `choices[].reaction`: 그 선택을 했을 때 아리가 하는 말
- `promisePrompt.no`: '하지 않는다'를 골랐을 때 약속 고르기 안내 문구 (choice id가 `"no"`일 때)

**미션 5 선언문**
- `templates`: 문장 틀. `before + [빈칸] + after`로 문장이 됩니다. `words`가 빈칸 단어 카드예요.
- `words`가 비어 있고 `before`도 비어 있는 틀은 **직접 쓰기** 탭이 됩니다.

---

## 5. 사례 작성 원칙

- 사건은 특정 기업·인물을 단정하지 않는 **일반화된 시나리오**로 썼습니다.
- 실제 보도된 비슷한 일이 있는 사건은 `similar_real`, 꾸며 낸 이야기는 `fictional`로 표시합니다.
- AI 안경 관련 사건 3개(표시등 가림, 얼굴 검색, 시험 부정행위)는 2024~2026년 국내외 보도를 바탕으로 일반화했으며, 배경은 각 `teacherNote`에 적어 두었습니다. 범죄의 구체적 내용은 수업에서 다루지 않도록 순화했습니다.

## 6. 폴더 구조

```
src/
├─ data/          ← 선생님이 고치는 곳 (JSON)
├─ screens/       ← 화면 (Basics: 시작·지도·소개·한 줄 생각·배지 / Mission1~5)
├─ components/    ← 아리 캐릭터, 인권 카드, 상단 바
├─ lib/           ← 데이터 검사(data.js), 진행 저장(store.js)
└─ styles.css     ← 글자 크기·색
```

글자를 전체적으로 키우거나 줄이려면 `styles.css` 맨 위의 `font-size: clamp(16px, 1.55vw, 22px);`를 바꾸세요.
