// Cloudflare Pages Functions - Admin Basic Auth Middleware
// 保護 /admin 路由，需要帳號密碼才能進入

async function authentication(context) {
  const { request, next, env } = context;

  // 從環境變數讀取帳號密碼（在 Cloudflare Pages 設定）
  const BASIC_USER = env.ADMIN_USERNAME ?? 'admin';
  const BASIC_PASS = env.ADMIN_PASSWORD ?? 'jinyi2026';

  if (request.headers.has('Authorization')) {
    const Authorization = request.headers.get('Authorization');
    const [scheme, encoded] = Authorization.split(' ');

    if (!encoded || scheme !== 'Basic') {
      return new Response('Bad Request', { status: 400 });
    }

    const buffer = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
    const decoded = new TextDecoder().decode(buffer).normalize();
    const index = decoded.indexOf(':');

    if (index === -1 || /[\0-\x1F\x7F]/.test(decoded)) {
      return new Response('Invalid authorization value.', { status: 400 });
    }

    const user = decoded.substring(0, index);
    const pass = decoded.substring(index + 1);

    if (BASIC_USER === user && BASIC_PASS === pass) {
      return await next(); // 驗證通過
    }
  }

  // 未驗證，跳出登入框
  return new Response('Unauthorized - Admin Area', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Jinyi Admin", charset="UTF-8"',
      'Content-Type': 'text/plain; charset=UTF-8',
    },
  });
}

export const onRequest = [authentication];
