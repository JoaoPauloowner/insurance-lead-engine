import { getIronSession, SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export interface SessionData {
  userId: string;
  organizationId: string;
  nome: string;
  email: string;
  role: string;
}

const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'insurance-lead-engine-secret-key-32chars-min',
  cookieName: 'lead-engine-session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  return session;
}

export async function requireAuth(): Promise<SessionData> {
  const session = await getSession();

  if (!session.userId || !session.organizationId) {
    redirect('/login');
  }

  return {
    userId: session.userId,
    organizationId: session.organizationId,
    nome: session.nome || '',
    email: session.email || '',
    role: session.role || 'user',
  };
}
