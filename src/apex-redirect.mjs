export function redirectApex(request) {
  const url = new URL(request.url);
  if (url.hostname !== 'inferred.uk') return null;
  url.protocol = 'https:';
  url.host = 'www.inferred.uk';
  url.port = '';
  return Response.redirect(url.toString(), 301);
}
