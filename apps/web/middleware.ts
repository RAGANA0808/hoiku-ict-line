import type { NextRequest } from 'next/server';
import { updateSupabaseSession } from './src/lib/supabase/middleware';

export const middleware = async (request: NextRequest) => {
  const response = await updateSupabaseSession(request);
  response.headers.set('x-pathname', request.nextUrl.pathname);
  return response;
};

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/health|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
