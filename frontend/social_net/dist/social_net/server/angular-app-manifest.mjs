
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/"
  },
  {
    "renderMode": 1,
    "route": "/register"
  },
  {
    "renderMode": 1,
    "route": "/auth/callback"
  },
  {
    "renderMode": 1,
    "route": "/auth/check_jwt"
  },
  {
    "renderMode": 1,
    "route": "/users/*"
  },
  {
    "renderMode": 1,
    "redirectTo": "/",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 485, hash: '806163773b30c7b6806889e5db0de0d282760e892d0da281c88291b29e9554b6', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 998, hash: 'a9346e53683ba750815f902530f3730c264068ec8e8d9067b7456c3d9f4deb85', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 6708, hash: 'c167769a7d25ff4188a0f7b1c458ad56f7fdb03911a04f0ac302c41ac9aa5b32', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-5INURTSO.css': {size: 0, hash: 'menYUTfbRu8', text: () => import('./assets-chunks/styles-5INURTSO_css.mjs').then(m => m.default)}
  },
};
