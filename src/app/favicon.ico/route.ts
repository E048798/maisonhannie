export const runtime = 'nodejs';

export function GET(request: Request) {
  const url = new URL('/favicon.svg', request.url);
  return Response.redirect(url, 308);
}

