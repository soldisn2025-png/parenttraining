# Design Review Template

Use this template whenever reviewing a Walktogether screen, screenshot, or prototype. The goal is not to make the product look like Toss. The goal is to reduce user confusion, hesitation, and effort so parents and Kelly can act with confidence.

## How to Use

Copy the prompt below into a design review request. Attach a screenshot when available. If a screenshot is attached and image annotation is requested, use imagegen to place arrows and short Korean notes directly on the screenshot. If no screenshot is needed, return the text review only.

For Walktogether, judge admin and parent screens differently:

- Admin screens may be denser, but the next action must be obvious: generate, review, revise, approve, send, or follow up.
- Parent screens must be mobile-first, readable by a 5th grader, calm, and free of clinical jargon.
- Parent screens should use one small action at a time, large tap targets, and plain language.
- Do not show parents module codes, scores, clinical labels, technical errors, or internal audit details.

## Reusable Prompt

```text
첨부한 서비스 스크린샷을 기반으로, 토스(Toss)의 최상위 시니어 프로덕트 디자이너이자 UI/UX 디렉터의 관점으로 화면을 리뷰해 주세요.

목표는 흠을 많이 찾는 것이 아니라, 실제 제품 개선 회의에서 바로 활용할 수 있는 정확하고 신뢰할 수 있는 UI/UX 피드백을 제공하는 것입니다.

중요한 태도:
- 잘된 부분은 분명히 좋다고 인정해 주세요.
- 이미 충분히 잘 설계된 부분에는 억지 조언을 추가하지 마세요.
- 모든 요소에 코멘트를 달지 말고 사용성, 전환, 이해도, 신뢰감에 영향을 주는 문제만 고르세요.
- 취향 기반 지적, 과잉 피드백, 근거 없는 트렌드 평가는 금지합니다.
- 화면 밖의 흐름은 추정이라고 명시하세요.

판단 기준:
- Simplicity: 사용자가 별도 학습 없이 바로 이해할 수 있는가?
- One thing per One page: 이 화면의 핵심 목표가 하나로 읽히는가?
- Clear CTA: 가장 중요한 행동이 한눈에 보이고 결과를 예상할 수 있는가?
- Easy to Answer: 사용자가 3초 안에 선택하거나 이해할 수 있는가?
- Value First: 행동 요구보다 사용자가 얻는 가치가 먼저 보이는가?
- Minimum Features: 핵심 목표와 직접 관련 없는 요소가 시선을 뺏지 않는가?
- Context Based: 이전 단계의 기대와 현재 화면이 자연스럽게 이어지는가?
- Low-cost Action: 다음 행동까지 가는 과정이 짧고 부담이 낮은가?

Walktogether 기준:
- 부모 화면은 초등학교 5학년이 이해할 수 있는 쉬운 말이어야 합니다.
- 부모 화면에는 임상 용어, 점수, 모듈 코드, 기술적 오류 문구를 보여주지 않습니다.
- 부모 화면의 주요 버튼과 체크박스는 모바일에서 쉽게 누를 수 있어야 합니다.
- 관리자 화면은 Kelly가 지금 무엇을 해야 하는지 바로 알아야 합니다.
- 생성, 수정, 승인, 발송, 후속 확인 상태가 서로 헷갈리지 않아야 합니다.

이미지 주석이 필요한 경우:
- 반드시 imagegen으로 원본 이미지 위에 직접 화살표와 짧은 한국어 주석을 남겨 주세요.
- 화살표는 실제 문제가 있는 UI 컴포넌트에서 시작해야 합니다.
- 주석은 화면 가장자리나 여백에 정돈해 주세요.
- 원본 UI를 과도하게 가리지 마세요.
- 하나의 주석에는 하나의 핵심 문제만 담으세요.
- 실제 영향이 큰 지점만 4-8개 정도 표시하세요.
- 화면이 전반적으로 좋다면 억지로 주석 수를 채우지 마세요.

주석 문장 구조:
문제 진단 + 사용자에게 생기는 영향 + 개선 방향

예:
- "CTA가 주변 요소와 경쟁해요. 다음 행동이 흐려질 수 있어 주 행동 하나를 더 선명하게 보여야 합니다."
- "선택 기준이 모호해요. 사용자가 바로 답하기 어려워 결정을 미룰 수 있습니다."
- "조건 설명이 먼저 보여요. 사용자가 얻는 가치를 먼저 보여주는 편이 설득력이 높습니다."

금지 표현:
- "디자인이 별로예요"
- "예쁘게 바꾸세요"
- "여백 수정 필요"
- "더 트렌디하게"
- "토스처럼 바꾸기"
- "전체적으로 UX가 아쉬움"

아래 형식으로 답변해 주세요.

### [한 줄 진단]
이 화면의 가장 큰 UX 문제 또는 핵심 상태를 한 문장으로 정리해 주세요. 문제가 크지 않다면 균형 있게 말해 주세요.

### [잘된 점]
- 유지해도 좋은 부분 1-3개를 적어 주세요.
- 왜 좋은지 간단히 설명해 주세요.
- 추가 개선 조언 없이 인정만 해 주세요.

### [가장 중요한 개선 포인트 3개]
1. 사용자가 가장 먼저 이해해야 하는 문제: 문제 + 이유 + 개선 방향
2. 사용자가 가장 쉽게 행동해야 하는 문제: 문제 + 이유 + 개선 방향
3. 신뢰감 또는 완성도에 영향을 주는 문제: 문제 + 이유 + 개선 방향

### [토스식 원칙으로 보면]
실제로 해당되는 항목만 골라 간단히 진단해 주세요.

- Simplicity:
- One thing per One page:
- Clear CTA:
- Easy to Answer:
- Value First:
- Minimum Features:
- Context Based:
- Low-cost Action:

### [우선순위]
- P0:
- P1:
- P2:

### [리디자인 방향]
필요한 경우에만 제안해 주세요.
- 헤드라인
- CTA 문구
- 정보 순서
- 덜어낼 요소
- 더 강조할 요소
```

## Priority Guide

Use P0 for issues that stop or seriously confuse the user:

- The user cannot tell what to do next.
- The CTA is unclear or misleading.
- The core value is hidden.
- The screen creates a meaningful trust problem.

Use P1 for issues that add hesitation or cognitive load:

- The explanation is too long.
- The information order feels awkward.
- The user has to guess selection criteria.
- Secondary elements compete with the main action.

Use P2 only when visible polish affects trust or readability:

- Weak hierarchy, alignment, contrast, spacing, or tap target quality.
- Use this sparingly. Do not turn preferences into product problems.

