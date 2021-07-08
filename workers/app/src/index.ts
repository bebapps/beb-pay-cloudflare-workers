import { Environment } from './Environment';

export default {
  fetch: async (request: Request, env: Environment) => {
    const startTime = Date.now();
    const url = new URL(request.url);

    if (url.pathname.endsWith('.map')) {
      return new Response('{}', {
        headers: {
          'content-type': 'application/json; charset=utf-8',
        },
      });
    }

    const prefixes = {
      '/sample-product-images': ['sample-product-images', 'bebdevpayresaue01.blob.core.windows.net'],
      '/product-images': ['product-images', 'bebdevpayresaue01.blob.core.windows.net'],
      '/store-logos': ['store-logos', 'bebdevpayresaue01.blob.core.windows.net'],

      '/api/stores': ['stores', 'beb-dev-pay-sto-aue-01.azurewebsites.net'],
      '/api/users': ['users', 'beb-dev-pay-usr-aue-01.azurewebsites.net'],

      '/': ['frontend', (
        (env.FRONTEND_BRANCH ? `${env.FRONTEND_BRANCH}.` : '') +
        'beb-pay-frontend.pages.dev'
      )],
    };

    let origin;

    for (const [prefix, [name, host]] of Object.entries(prefixes)) {
      if (url.pathname.startsWith(prefix)) {
        url.hostname = host;
        origin = name;
        break;
      }
    }

    request = new Request(url.toString(), request);
    request.headers.set('host', url.hostname);

    let response = await fetch(request);
    response = new Response(response.body, response);

    const endTime = Date.now();
    const duration = endTime - startTime;

    response.headers.set('access-control-allow-origin', request.headers.get('origin') ?? 'null');
    response.headers.append('server-timing', `cf-worker;dur=${duration}`);
    response.headers.set('bebapps', `beb-pay/${origin}`);

    return response;
  },
};

