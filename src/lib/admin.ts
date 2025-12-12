// 관리자 이메일 및 ID 목록
export const ADMIN_EMAILS = [
  "johunsang@gmail.com",
  "johunsang@hwasubun.ai",
];

// 관리자 userId 패턴 (화수분 토큰 인증 시 사용)
// 정확한 매칭 또는 포함 여부 확인
export const ADMIN_USER_IDS = [
  "johunsang",
];

export function isAdmin(emailOrId: string | null | undefined): boolean {
  if (!emailOrId) return false;
  // 이메일 또는 userId로 확인
  return ADMIN_EMAILS.includes(emailOrId) || isAdminByUserId(emailOrId);
}

export function isAdminByEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  // 정확히 일치하거나 johunsang을 포함하는 @hwasubun.ai 이메일
  if (ADMIN_EMAILS.includes(email)) return true;
  if (email.endsWith("@hwasubun.ai") && email.toLowerCase().includes("johunsang")) return true;
  return false;
}

export function isAdminByUserId(userId: string | null | undefined): boolean {
  if (!userId) return false;
  // 정확한 일치 또는 johunsang 포함 여부 확인
  const lowerUserId = userId.toLowerCase();
  return ADMIN_USER_IDS.some(adminId =>
    lowerUserId === adminId.toLowerCase() || lowerUserId.includes(adminId.toLowerCase())
  );
}
