export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);

  // 只保護 /admin 路徑
  if (!url.pathname.startsWith('/admin')) {
    return next();
  }

  const authHeader = request.headers.get('Authorization');

  if (authHeader) {
    const encoded = authHeader.replace('Basic ', '');
    const decoded = atob(encoded);
    const [username, password] = decoded.split(':');

    const expectedUser = env.ADMIN_USERNAME || 'admin';
    const expectedPass = env.ADMIN_PASSWORD || 'jinyi2026';

    if (username === expectedUser && password === expectedPass) {
      return next();
    }
  }

  return new Response('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Admin Area"',
    },
  });
}
