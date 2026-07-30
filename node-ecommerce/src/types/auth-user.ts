import type { UserRole } from '@prisma/client';

export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
}
