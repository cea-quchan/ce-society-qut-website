export const roleMap: Record<string, string> = {
  'ادمین': 'ADMIN',
  'admin': 'ADMIN',
  'Admin': 'ADMIN',
  'مدیر': 'ADMIN',
  'user': 'USER',
  'کاربر': 'USER',
  'کاربر عادی': 'USER',
  'USER': 'USER',
  'دانشجو': 'STUDENT',
  'student': 'STUDENT',
  'STUDENT': 'STUDENT',
  'استاد': 'INSTRUCTOR',
  'teacher': 'INSTRUCTOR',
  'instructor': 'INSTRUCTOR',
  'INSTRUCTOR': 'INSTRUCTOR',
};
export function normalizeRole(role: string) {
  return roleMap[role] || 'USER';
} 