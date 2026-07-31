import type { AuthUser } from '../types/auth-user';
export type LoginResult = {
    token: string;
    user: AuthUser;
};
export declare function signToken(user: AuthUser): string;
export declare function verifyToken(token: string): AuthUser;
export declare function login(data: unknown): Promise<LoginResult>;
export declare function getUserById(id: string): Promise<AuthUser>;
export declare function changePassword(userId: string, data: unknown): Promise<{
    message: string;
}>;
export declare function ensureAdminUser(username?: string, password?: string): Promise<void>;
//# sourceMappingURL=auth.service.d.ts.map