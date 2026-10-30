import { NextResponse, type NextRequest } from 'next/server';
import { legacyLocaleRedirect } from './lib/site-config';
export function proxy(request: NextRequest) {
  const destination = legacyLocaleRedirect(request.url);
  return destination ? NextResponse.redirect(destination, 308) : NextResponse.next();
}
export const config = { matcher: ['/', '/id'] };
