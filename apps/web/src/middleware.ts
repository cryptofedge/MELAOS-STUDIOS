import { NextRequest, NextResponse } from 'next/server';

// Canonical-domain redirect: once melaosstudios.com is live, requests that
// arrive via the onrender.com subdomain are permanently redirected to the
// branded domain (SEO canonical + consistent share links).
const CANONICAL_HOST = 'melaosstudios.com';

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';
  if (host.endsWith('.onrender.com')) {
    const url = new URL(req.url);
    url.host = CANONICAL_HOST;
    url.port = '';
    url.protocol = 'https:';
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

// Skip static assets and API routes — only page navigations need the redirect.
export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
