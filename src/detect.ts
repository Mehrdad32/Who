export type ServerInfo = {
  ip: string | null;
  country: string | null;
  city: string | null;
  region: string | null;
  isp: string | null;
  colo: string | null;
  headers: Record<string, string | boolean | null>;
};
export type Metric = { id: string; title: string; value: string; detail: string; source: 'HTTP' | 'JavaScript'; sensitivity: 'کم' | 'متوسط' | 'زیاد'; };
export type Scene = { id: string; eyebrow: string; title: string; subtitle: string; surprise: string; keys: string[]; };
export type DeviceSummary = { browser: string; browserVersion: string; os: string; kind: string; };

const na = 'در دسترس نیست';
const show = (value: unknown): string => value === null || value === undefined || value === '' ? na : String(value);
const number = (value: number): string => new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(value);
const byGB = (bytes: number) => `${number(bytes / 1024 ** 3)} گیگابایت`;
const media = (q: string) => window.matchMedia?.(q).matches ?? false;

export async function requestServerInfo(): Promise<ServerInfo | null> {
  try {
    const response = await fetch('/api/info', { cache: 'no-store', credentials: 'omit' });
    if (!response.ok) return null;
    return (await response.json()) as ServerInfo;
  } catch { return null; }
}

interface UADataLike {
  platform?: string; mobile?: boolean; brands?: { brand: string; version: string }[];
  getHighEntropyValues?: (keys: string[]) => Promise<{
    platformVersion?: string; model?: string; architecture?: string;
    fullVersionList?: { brand: string; version: string }[];
  }>;
}
const uaData = () => (navigator as Navigator & { userAgentData?: UADataLike }).userAgentData;

export async function detectDevice(): Promise<DeviceSummary> {
  const ua = navigator.userAgent;
  const low = uaData();
  let browser = 'نامشخص';
  let browserVersion = 'نامشخص';
  const picks: [RegExp, string][] = [
    [/Edg(?:A|iOS)?\/([\d.]+)/, 'Microsoft Edge'],
    [/OPR\/([\d.]+)/, 'Opera'],
    [/SamsungBrowser\/([\d.]+)/, 'Samsung Internet'],
    [/CriOS\/([\d.]+)/, 'Google Chrome'],
    [/FxiOS\/([\d.]+)/, 'Mozilla Firefox'],
    [/Firefox\/([\d.]+)/, 'Mozilla Firefox'],
    [/Chrome\/([\d.]+)/, 'Google Chrome'],
    [/Version\/([\d.]+).*Safari/, 'Safari']
  ];
  for (const [pattern, name] of picks) {
    const match = ua.match(pattern);
    if (match) { browser = name; browserVersion = match[1]; break; }
  }
  let os = /Android ([\d.]+)/.test(ua) ? `Android ${RegExp.$1}`
    : /iPhone|iPad|iPod/.test(ua) ? `iOS / iPadOS ${ua.match(/OS ([\d_]+)/)?.[1]?.replaceAll('_', '.') ?? ''}`.trim()
    : /Windows/.test(ua) ? 'Windows'
    : /Mac OS X/.test(ua) ? 'macOS'
    : /Linux/.test(ua) ? 'Linux'
    : 'نامشخص';
  let kind = low?.mobile ?? /Mobi|Android|iPhone/i.test(ua) ? 'موبایل' : 'کامپیوتر';
  if (/iPad|Tablet|SM-T|Tab/i.test(ua)) kind = 'تبلت';
  if (low?.platform === 'Android' && !low.mobile) kind = 'تبلت / کامپیوتر';
  try {
    const high = await low?.getHighEntropyValues?.(['platformVersion', 'fullVersionList']);
    const brands = high?.fullVersionList?.filter(v => !/Not.A.Brand|Chromium/i.test(v.brand));
    const picked = brands?.find(v => (browser.includes('Edge') && /Edge/i.test(v.brand))
      || (browser.includes('Chrome') && /Chrome/i.test(v.brand))
      || (browser.includes('Opera') && /Opera/i.test(v.brand)));
    if (picked?.version) browserVersion = picked.version;
    if (low?.platform === 'Android' && high?.platformVersion && high.platformVersion !== '0.0.0') os = `Android ${high.platformVersion.split('.')[0]}`;
  } catch { /* Some user agents deliberately restrict high-entropy hints. */ }
  return { browser, browserVersion, os, kind };
}

function collectGPU(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return na;
    const ctx = gl as WebGLRenderingContext;
    const ext = ctx.getExtension('WEBGL_debug_renderer_info');
    return ext ? show(ctx.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : show(ctx.getParameter(ctx.RENDERER));
  } catch { return na; }
}

async function canvasFingerprint(): Promise<string> {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 320; canvas.height = 80;
    const c = canvas.getContext('2d');
    if (!c) return na;
    c.fillStyle = '#0c172e'; c.fillRect(0, 0, 320, 80);
    c.font = '23px Arial'; c.fillStyle = '#78e7d5';
    c.fillText('Who? 🌐 1234', 12, 43);
    c.strokeStyle = '#9169f7'; c.arc(270, 38, 24, 0, Math.PI * 2); c.stroke();
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canvas.toDataURL()));
    return Array.from(new Uint8Array(digest).slice(0, 8)).map(x => x.toString(16).padStart(2, '0')).join('');
  } catch { return na; }
}

async function audioFingerprint(): Promise<string> {
  try {
    const Ctor = window.OfflineAudioContext;
    if (!Ctor) return na;
    const ctx = new Ctor(1, 2048, 44100);
    const oscillator = ctx.createOscillator(); oscillator.type = 'triangle'; oscillator.frequency.value = 980;
    const compressor = ctx.createDynamicsCompressor();
    oscillator.connect(compressor); compressor.connect(ctx.destination);
    oscillator.start(0);
    const rendered = await ctx.startRendering();
    const data = rendered.getChannelData(0);
    let sum = 0;
    for (let i = 450; i < 1100; i++) sum += Math.abs(data[i]);
    return sum.toFixed(6);
  } catch { return na; }
}

export async function collectMetrics(server: ServerInfo | null, device: DeviceSummary): Promise<Metric[]> {
  const result: Metric[] = [];
  const add = (id: string, title: string, value: unknown, detail: string, source: Metric['source'], sensitivity: Metric['sensitivity'] = 'متوسط') =>
    result.push({ id, title, value: show(value), detail, source, sensitivity });
  const h = (key: string) => server?.headers?.[key] ?? null;
  add('ip', 'آدرس IP عمومی', server?.ip, 'نشانی اتصال اینترنتی که سرور در این درخواست می‌بیند؛ معمولاً IP مودم، اپراتور یا VPN است، نه آدرس داخلی دستگاه.', 'HTTP', 'زیاد');
  add('ipgeo', 'موقعیت تقریبی از روی IP', [server?.city, server?.region, server?.country].filter(Boolean).join('، '), 'تخمین Cloudflare از محل شبکه؛ ممکن است به‌دلیل VPN یا اپراتور اشتباه باشد و GPS نیست.', 'HTTP', 'زیاد');
  add('isp', 'ارائه‌دهنده شبکه', server?.isp, 'نام سازمان شبکه یا مالک IP؛ در صورت عرضه توسط Cloudflare.', 'HTTP');
  add('browser', 'مرورگر و نسخه', `${device.browser} ${device.browserVersion}`, 'از اطلاعات شناسایی مرورگر؛ بعضی مرورگرها نسخه دقیق را پنهان می‌کنند.', 'JavaScript');
  add('os', 'سیستم‌عامل', device.os, 'نسخه سیستم‌عامل ممکن است پنهان یا تقریبی باشد.', 'JavaScript');
  add('device', 'نوع دستگاه', device.kind, 'تشخیص از نشانه‌های مرورگر، نه خواندن مدل قطعی گوشی.', 'JavaScript');
  add('ua', 'رشته User-Agent', h('userAgent'), 'این رشته به‌طور معمول همراه درخواست وب به سرور می‌رود؛ اطلاعاتش گاهی عمداً عمومی و ناقص شده است.', 'HTTP', 'زیاد');
  add('accept', 'فرمت‌های پذیرفته‌شده', h('accept'), 'مرورگر به سرور می‌گوید چه نوع محتوایی را برای این درخواست می‌پذیرد.', 'HTTP', 'کم');
  add('acceptEncoding', 'فشرده‌سازی قابل‌پذیرش', h('acceptEncoding'), 'مثل gzip و br؛ برای انتقال بهینه محتوای وب.', 'HTTP', 'کم');
  add('acceptLanguage', 'زبان‌های اعلامی به سرور', h('acceptLanguage'), 'هدر زبانی که در درخواست HTTP دیده می‌شود؛ ممکن است با زبان رابط کاربری متفاوت باشد.', 'HTTP');
  add('referer', 'صفحه ارجاع‌دهنده', h('referer') ? (() => { try { return new URL(String(h('referer'))).origin; } catch { return 'موجود'; } })() : 'بدون ارجاع', 'سایت ممکن است بداند از چه مبدأیی وارد شدی؛ جزئیات با Referrer-Policy محدود می‌شوند.', 'HTTP');
  add('clientHints', 'نشانه‌های دستگاه در HTTP', [h('secChUa'), h('secChUaPlatform'), h('secChUaMobile')].filter(Boolean).join(' | '), 'Client Hints تنها وقتی مرورگر آن‌ها را ارائه کند؛ بعضی نشانه‌ها نیاز به درخواست قبلی سرور دارند.', 'HTTP');
  add('fetchMeta', 'نوع درخواست', [h('secFetchSite'), h('secFetchMode')].filter(Boolean).join(' / '), 'هدرهای امنیتی درباره مبدأ و نوع درخواست، در مرورگرهای پشتیبانی‌کننده.', 'HTTP', 'کم');
  add('privacyHeaders', 'نشانه‌های حریم خصوصی', [h('dnt') ? `DNT: ${h('dnt')}` : null, h('saveData') ? `Save-Data: ${h('saveData')}` : null].filter(Boolean).join(' | '), 'برخی مرورگرها ترجیحات عدم ردیابی یا صرفه‌جویی مصرف اینترنت را در هدر اعلام می‌کنند.', 'HTTP');
  add('lang', 'زبان‌های مرورگر', navigator.languages?.join('، ') || navigator.language, 'صفحه با JavaScript می‌تواند زبان‌های ترجیحی را بخواند.', 'JavaScript');
  add('timezone', 'منطقه زمانی', Intl.DateTimeFormat().resolvedOptions().timeZone, 'بدون GPS، منطقه زمانی تنظیم‌شده دستگاه آشکار می‌شود.', 'JavaScript', 'زیاد');
  add('clock', 'ساعت و تاریخ محلی', new Date().toLocaleString('fa-IR'), 'زمان سیستم کاربر در لحظه بررسی؛ لزوماً ساعت دقیق واقعی نیست.', 'JavaScript', 'کم');
  add('display', 'اندازه نمایشگر', `${screen.width} × ${screen.height} پیکسل`, 'اعداد گزارش‌شده توسط مرورگر و مستقل از رزولوشن سخت‌افزاری واقعی.', 'JavaScript');
  add('viewport', 'اندازه فضای صفحه', `${window.innerWidth} × ${window.innerHeight} / DPR: ${window.devicePixelRatio}`, 'اندازه ناحیه نمایش وب و نسبت پیکسل؛ با تغییر اندازه پنجره عوض می‌شود.', 'JavaScript');
  add('displayColor', 'رنگ و حالت ظاهری', `${screen.colorDepth} بیت · ${media('(prefers-color-scheme: dark)') ? 'حالت تیره' : 'حالت روشن'}`, 'تنظیمات رنگ و تم دستگاه که صفحه می‌تواند تشخیص دهد.', 'JavaScript', 'کم');
  add('accessibility', 'ترجیحات ظاهری', `${media('(prefers-reduced-motion: reduce)') ? 'حرکت کمتر' : 'حرکت عادی'} · ${media('(prefers-contrast: more)') ? 'کنتراست بیشتر' : 'کنتراست معمول'}`, 'مرورگر ترجیحات نمایش و دسترس‌پذیری را در اختیار صفحه قرار می‌دهد.', 'JavaScript', 'کم');
  add('touch', 'امکانات لمس', `${navigator.maxTouchPoints} نقطه لمس`, 'تعداد نقاط لمس قابل گزارش، بدون امکان خواندن لمس خارج از صفحه.', 'JavaScript', 'کم');
  add('cpu', 'پردازنده‌های منطقی', navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} هسته قابل گزارش` : na, 'تعداد واحدهای پردازشی گزارش‌شده؛ ممکن است برای حفظ حریم خصوصی محدود شود.', 'JavaScript');
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  add('ram', 'حافظه تقریبی RAM', mem ? `${mem} گیگابایت (تقریبی)` : na, 'در بعضی مرورگرها فقط یک عدد گرد شده یا محدود ارائه می‌شود.', 'JavaScript');
  add('gpu', 'پردازنده گرافیکی قابل گزارش', collectGPU(), 'اطلاعات WebGL ممکن است پنهان، عمومی یا شبیه‌سازی‌شده باشد.', 'JavaScript', 'زیاد');
  const connection = (navigator as Navigator & { connection?: { effectiveType?: string; downlink?: number; rtt?: number; saveData?: boolean } }).connection;
  add('network', 'کیفیت تخمینی اتصال', connection ? [connection.effectiveType, connection.downlink ? `${connection.downlink} Mbps تخمینی` : null, connection.rtt ? `${connection.rtt} ms RTT تخمینی` : null].filter(Boolean).join(' · ') : na, 'این اعداد تخمین کیفیت‌اند؛ نوع دقیق Wi-Fi یا اپراتور معمولاً آشکار نمی‌شود.', 'JavaScript');
  const batteryAPI = (navigator as Navigator & { getBattery?: () => Promise<{ level: number; charging: boolean }> }).getBattery;
  try {
    const b = await batteryAPI?.call(navigator);
    add('battery', 'وضعیت باتری', b ? `${number(b.level * 100)}٪ · ${b.charging ? 'در حال شارژ' : 'بدون شارژر'}` : na, 'بسیاری از مرورگرها برای جلوگیری از ردیابی، Battery API را ارائه نمی‌کنند.', 'JavaScript');
  } catch { add('battery', 'وضعیت باتری', na, 'مرورگر دسترسی به وضعیت باتری را محدود کرده است.', 'JavaScript'); }
  add('cookies', 'وضعیت کوکی', `${navigator.cookieEnabled ? 'پشتیبانی مرورگر فعال' : 'غیرفعال'} · ${h('cookiesPresent') ? 'کوکی در درخواست وجود داشت' : 'کوکی در این درخواست نبود'}`, 'این سایت کوکی ایجاد نمی‌کند؛ فقط وضعیت پشتیبانی و وجود کوکی در درخواست را بررسی می‌کند.', 'HTTP');
  try {
    const estimate = await navigator.storage?.estimate?.();
    add('storage', 'سهمیه ذخیره‌سازی همین سایت', estimate?.quota ? byGB(estimate.quota) : na, 'سهمیه مجاز برای این مبدأ است؛ فضای خالی واقعی دستگاه نیست.', 'JavaScript');
  } catch { add('storage', 'سهمیه ذخیره‌سازی همین سایت', na, 'مرورگر این اندازه‌گیری را در دسترس نگذاشته است.', 'JavaScript'); }
  add('features', 'قابلیت‌های مرورگر', [
    'WebGL: ' + (!!document.createElement('canvas').getContext('webgl') ? 'بله' : 'خیر'),
    'WebRTC: ' + (!!window.RTCPeerConnection ? 'بله' : 'خیر'),
    'Service Worker: ' + ('serviceWorker' in navigator ? 'بله' : 'خیر'),
    'WebAssembly: ' + ('WebAssembly' in window ? 'بله' : 'خیر')
  ].join(' · '), 'وجود این APIها قابل بررسی است؛ اما این آزمایش هیچ اتصال WebRTC برقرار نمی‌کند.', 'JavaScript', 'کم');
  const video = document.createElement('video');
  add('codecs', 'پشتیبانی رسانه', ['H.264', 'video/mp4; codecs="avc1.42E01E"', 'VP9', 'video/webm; codecs="vp9"', 'AV1', 'video/mp4; codecs="av01.0.05M.08"']
    .reduce<string[]>((out, item, index, arr) => { if (index % 2 === 0 && video.canPlayType(arr[index + 1])) out.push(item); return out; }, []).join(' · '), 'فقط اعلام سازگاری مرورگر با چند فرمت؛ هیچ فایل رسانه‌ای بارگذاری نمی‌شود.', 'JavaScript', 'کم');
  add('canvas', 'اثر انگشت Canvas', await canvasFingerprint(), 'هش کوتاه از یک تصویر آزمایشی که فقط داخل مرورگر ساخته شد؛ شناسه شخصی قطعی یا پایدار نیست.', 'JavaScript', 'زیاد');
  add('audio', 'اثر انگشت صوتی', await audioFingerprint(), 'خروجی محاسبه صوتی آفلاین، بدون دسترسی به میکروفون؛ ممکن است در دستگاه‌های مختلف متفاوت شود.', 'JavaScript', 'زیاد');
  return result;
}

export const scenes: Scene[] = [
  { id: 'first', eyebrow: 'پرده ۰۱ — اولین برخورد', title: 'حتی قبل از سلام، دیده شدی!', subtitle: 'همین که صفحه را باز می‌کنی، یک درخواست اینترنتی به سرور می‌رسد.', surprise: 'IP با GPS فرق دارد؛ VPN می‌تواند مکان تقریبی را جابه‌جا کند.', keys: ['ip', 'ipgeo', 'isp'] },
  { id: 'identity', eyebrow: 'پرده ۰۲ — شناسنامه دیجیتال', title: 'مرورگرت خودش را معرفی می‌کند', subtitle: 'نشانه‌های نرم‌افزاری، نوع دستگاه و گاهی نسخه مرورگر قابل تشخیص است.', surprise: 'نسخه واقعی سیستم‌عامل همیشه معلوم نیست؛ مرورگرها گاهی آن را عمداً پنهان می‌کنند.', keys: ['browser', 'os', 'device', 'ua'] },
  { id: 'http', eyebrow: 'پرده ۰۳ — نامه پنهان', title: 'درخواست وب فقط یک آدرس نیست', subtitle: 'چند هدر HTTP همراه درخواست به سمت سرور ارسال می‌شوند.', surprise: 'این اطلاعات در درخواست HTTP هستند؛ داده‌های JavaScript خودکار برای سرور ارسال نمی‌شوند.', keys: ['accept', 'acceptEncoding', 'acceptLanguage', 'clientHints', 'fetchMeta', 'referer', 'privacyHeaders'] },
  { id: 'time', eyebrow: 'پرده ۰۴ — ساعتِ تو', title: 'کجا هستی؟ شاید ساعتت لو بدهد', subtitle: 'مرورگر می‌تواند بدون GPS منطقه زمانی و زبان‌های ترجیحی را بخواند.', surprise: 'منطقه زمانی فقط یک سرنخ است؛ مکان دقیق تو را مشخص نمی‌کند.', keys: ['timezone', 'clock', 'lang'] },
  { id: 'screen', eyebrow: 'پرده ۰۵ — صفحه و سلیقه', title: 'ردّ نمایشگرت روی وب می‌ماند', subtitle: 'اندازه نمایشگر، میزان زوم و ترجیحات ظاهری در مرورگر قابل مشاهده‌اند.', surprise: 'حتی تغییر اندازه پنجره می‌تواند ترکیب اطلاعات قابل مشاهده را تغییر دهد.', keys: ['display', 'viewport', 'displayColor', 'accessibility', 'touch'] },
  { id: 'hardware', eyebrow: 'پرده ۰۶ — پشت پرده دستگاه', title: 'قدرت سخت‌افزارت هم سرنخ می‌دهد', subtitle: 'بعضی مشخصات سخت‌افزاری به شکل تقریبی گزارش می‌شوند.', surprise: 'مقدار RAM یا تعداد هسته‌های اعلامی لزوماً مقدار واقعی دستگاه نیست.', keys: ['cpu', 'ram', 'gpu'] },
  { id: 'connection', eyebrow: 'پرده ۰۷ — اتصال و انرژی', title: 'از اینترنت و شارژت چه می‌فهمیم؟', subtitle: 'بعضی مرورگرها فقط تخمین کیفیت اتصال یا وضعیت باتری را آشکار می‌کنند.', surprise: 'اگر نتیجه‌ای در دسترس نیست، مرورگرت شاید برای حریم خصوصی آن را محدود کرده.', keys: ['network', 'battery'] },
  { id: 'storage', eyebrow: 'پرده ۰۸ — حافظه و ردپا', title: 'هر سایت در فضای خودش', subtitle: 'مرورگر قابلیت کوکی و سهمیه ذخیره‌سازی همان سایت را اعلام می‌کند.', surprise: 'سایت نمی‌تواند کوکی‌های سایر دامنه‌ها یا فایل‌های شخصی تو را آزادانه بخواند.', keys: ['cookies', 'storage'] },
  { id: 'skills', eyebrow: 'پرده ۰۹ — مهارت‌های مرورگر', title: 'مرورگرت چه کارهایی بلد است؟', subtitle: 'تنها از وجود قابلیت‌ها و پشتیبانی رسانه‌ها هم می‌توان سرنخ گرفت.', surprise: 'در این آزمایش حتی یک اتصال WebRTC یا پخش رسانه انجام نمی‌دهیم.', keys: ['features', 'codecs'] },
  { id: 'fingerprint', eyebrow: 'پرده ۱۰ — غافلگیری نهایی', title: 'دستگاهت می‌تواند اثر انگشت داشته باشد', subtitle: 'ترکیب خروجی‌های گرافیکی و صوتی گاهی به تشخیص دوباره مرورگر کمک می‌کند.', surprise: 'این اثر انگشت یکتا یا همیشگی نیست و در Who فقط روی خود دستگاه محاسبه می‌شود.', keys: ['canvas', 'audio'] }
];
