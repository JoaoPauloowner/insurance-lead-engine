import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protege todas as rotas administrativas e operacionais do dashboard
  if (pathname.startsWith('/dashboard')) {
    const hasSessionCookie = request.cookies.has('lead-engine-session');

    // Se não há cookie de sessão autenticada, redireciona para a tela de login
    if (!hasSessionCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
