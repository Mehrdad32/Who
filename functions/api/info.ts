/**
 * Stateless Cloudflare Pages Function.
 * Returns only the request metadata that Cloudflare already receives.
 * No KV, D1, R2, Analytics Engine, cookies, or logging in this application.
 */
type CfContext = {
  country?: string; city?: string; region?: string;
  timezone?: string; asOrganization?: string; colo?: string;
};

type RequestWithCf = Request & { cf?: CfContext };

export const onRequestGet = async (context: { request: RequestWithCf }): Promise<Response> => {
  const { request } = context;
  const cf = request.cf;
  const headers = request.headers;
  const h = (name: string) => headers.get(name) ?? null;
  const data = {
    ip: h('cf-connecting-ip'),
    country: cf?.country ?? null,
    city: cf?.city ?? null,
    region: cf?.region ?? null,
    isp: cf?.asOrganization ?? null,
    colo: cf?.colo ?? null,
    headers: {
      userAgent: h('user-agent'),
      accept: h('accept'),
      acceptLanguage: h('accept-language'),
      acceptEncoding: h('accept-encoding'),
      referer: h('referer'),
      secChUa: h('sec-ch-ua'),
      secChUaPlatform: h('sec-ch-ua-platform'),
      secChUaMobile: h('sec-ch-ua-mobile'),
      secFetchSite: h('sec-fetch-site'),
      secFetchMode: h('sec-fetch-mode'),
      dnt: h('dnt'),
      saveData: h('save-data'),
      cookiesPresent: !!h('cookie')
    }
  };
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'"
    }
  });
};
