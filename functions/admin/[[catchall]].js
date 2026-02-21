export async function onRequest(context) {
  const { request, env, next } = context;

  const authHeader = request.headers.get('Authorization');

  if (authHeader && authHeader.startsWith('Basic ')) {
    const encoded = authHeader.slice(6);
    const decoded = atob(encoded);
    const colonIndex = decoded.indexOf(':');
    const username = decoded.slice(0, colonIndex);
    const password = decoded.slice(colonIndex + 1);

    const expectedUser = env.ADMIN_USERNAME || 'admin';
    const expectedPass = env.ADMIN_PASSWORD || 'jinyi2026';

    if (username === expectedUser && password === expectedPass) {
      return next();
    }
  }

  return new Response('Unauthorized - Admin Area Protected', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Admin Area", charset="UTF-8"',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
