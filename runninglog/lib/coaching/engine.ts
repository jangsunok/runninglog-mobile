import type { CoachingContext } from './types';
import { COACHING_RULES } from './rules';

/**
 * 컨텍스트를 평가하여 가장 적합한 코칭 메시지를 반환한다.
 * priority 오름차순으로 룰을 평가하고, 첫 매칭 룰의 메시지 중 하나를 선택.
 */
export function getCoachingMessage(ctx: CoachingContext): string {
  const sorted = [...COACHING_RULES].sort((a, b) => a.priority - b.priority);

  for (const rule of sorted) {
    if (rule.condition(ctx)) {
      const template = pickRandom(rule.messages);
      return interpolate(template, ctx.variables);
    }
  }

  return '오늘도 로기와 함께해요!';
}

/**
 * 하루 단위 시드 기반 랜덤 선택.
 * 같은 날에는 같은 메시지가 유지되어 리렌더링 시 깜빡임을 방지.
 */
function pickRandom(arr: string[]): string {
  const seed = getDaySeed();
  return arr[seed % arr.length];
}

function getDaySeed(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
  return now.getFullYear() * 1000 + dayOfYear;
}

/** {{variableName}} 형태의 플레이스홀더를 실제 값으로 치환 */
function interpolate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return key in variables ? variables[key] : match;
  });
}
