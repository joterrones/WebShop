import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error-handler';
import type { AuthUser } from '../types/auth-user';

const loginSchema = z.object({
  username: z.string().trim().min(1, 'Usuario requerido').max(80),
  password: z.string().min(1, 'Clave requerida').max(128),
});

export type LoginResult = {
  token: string;
  user: AuthUser;
};

function toAuthUser(user: {
  id: string;
  username: string;
  role: UserRole;
}): AuthUser {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
  };
}

export function signToken(user: AuthUser): string {
  return jwt.sign(
    { sub: user.id, username: user.username, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] },
  );
}

export function verifyToken(token: string): AuthUser {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload & {
      username?: string;
      role?: UserRole;
    };

    if (
      typeof payload.sub !== 'string' ||
      typeof payload.username !== 'string' ||
      (payload.role !== 'admin' && payload.role !== 'user')
    ) {
      throw new AppError(401, 'Token inválido');
    }

    return {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(401, 'Token inválido o expirado');
  }
}

export async function login(data: unknown): Promise<LoginResult> {
  const { username, password } = loginSchema.parse(data);

  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
  });

  if (!user) {
    throw new AppError(401, 'Usuario o clave incorrectos');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, 'Usuario o clave incorrectos');
  }

  const authUser = toAuthUser(user);
  return {
    token: signToken(authUser),
    user: authUser,
  };
}

export async function getUserById(id: string): Promise<AuthUser> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new AppError(401, 'Usuario no encontrado');
  }
  return toAuthUser(user);
}

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Clave actual requerida').max(128),
  newPassword: z
    .string()
    .min(4, 'La nueva clave debe tener al menos 4 caracteres')
    .max(128),
});

export async function changePassword(
  userId: string,
  data: unknown,
): Promise<{ message: string }> {
  const { currentPassword, newPassword } = changePasswordSchema.parse(data);

  if (currentPassword === newPassword) {
    throw new AppError(400, 'La nueva clave debe ser distinta a la actual');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(401, 'Usuario no encontrado');
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    throw new AppError(400, 'La clave actual es incorrecta');
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return { message: 'Contraseña actualizada' };
}

export async function ensureAdminUser(
  username = 'admin',
  password = 'admin123',
): Promise<void> {
  const passwordHash = await bcrypt.hash(password, 10);
  const normalized = username.toLowerCase();
  await prisma.user.upsert({
    where: { username: normalized },
    create: {
      username: normalized,
      passwordHash,
      role: UserRole.admin,
    },
    update: {},
  });
}
