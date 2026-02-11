/**
 * 이메일 형식 검증 (일반적인 형식: local@domain.tld)
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return EMAIL_REGEX.test(trimmed);
}

/**
 * 비밀번호 유효성: 8자 이상, 영문 대문자/소문자/숫자 중 하나 이상 포함
 */
export function isValidPassword(value: string): boolean {
  if (value.length < 8) return false;
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  const hasDigit = /[0-9]/.test(value);
  return hasUpper || hasLower || hasDigit;
}
