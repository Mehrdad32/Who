import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import {
  ArrowLeft, ArrowRight, BadgeCheck, Check,
  CircleHelp, Copy, Eye, Github, Globe2, Heart,
  Info, LockKeyhole, BookOpen, ExternalLink, MonitorSmartphone, MousePointer2,
  Radio, RefreshCcw, Search, Share2, Shield, ShieldCheck, ShieldOff,
  Sparkles, Terminal, UnlockKeyhole
} from 'lucide-react';
import { collectMetrics, detectDevice, requestServerInfo, scenes } from './detect';
import type { DeviceSummary, Metric, ServerInfo } from './detect';
import { permissionDemos, runPermission } from './permissions';

const SITE = 'https://who.mehrdad32.ir/';
const REPO = 'https://github.com/Mehrdad32/Who';
const MAKER = 'https://mehrdad32.ir/';
const emptyDevice: DeviceSummary = { browser: 'در حال شناسایی', browserVersion: '', os: 'در حال شناسایی', kind: 'نامشخص' };

type DataState = { server: ServerInfo | null; device: DeviceSummary; metrics: Metric[]; ready: boolean; };

function useWhoData(collectDetailedMetrics: boolean): DataState {
  const [data, setData] = useState<DataState>({ server: null, device: emptyDevice, metrics: [], ready: false });
  useEffect(() => {
    let active = true;
    void (async () => {
      const [server, device] = await Promise.all([requestServerInfo(), detectDevice()]);
      if (!active) return;
      if (!collectDetailedMetrics) {
        setData({ server, device, metrics: [], ready: true });
        return;
      }
      setData(prev => ({ ...prev, server, device }));
      const metrics = await collectMetrics(server, device);
      if (active) setData({ server, device, metrics, ready: true });
    })();
    return () => { active = false; };
  }, [collectDetailedMetrics]);
  return data;
}

function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'mint' | 'violet' | 'rose' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

const WIKI_TERMS: Record<string, string> = {
  ip: 'نشانی آی پی', ipgeo: 'مکان یابی جغرافیایی', isp: 'ارائه دهنده خدمات اینترنت',
  browser: 'مرورگر وب', os: 'سیستم عامل', device: 'دستگاه همراه', ua: 'عامل کاربر',
  accept: 'پروتکل انتقال ابرمتن', acceptEncoding: 'فشرده سازی داده ها',
  acceptLanguage: 'بین المللی سازی و بومی سازی', referer: 'ارجاع دهنده اچ تی تی پی',
  clientHints: 'اثر انگشت دستگاه', fetchMeta: 'امنیت وب', privacyHeaders: 'ردیابی اینترنتی',
  lang: 'بومی سازی نرم افزار', timezone: 'منطقه زمانی', clock: 'زمان سیستم',
  display: 'وضوح تصویر', viewport: 'طراحی وب واکنش گرا', displayColor: 'عمق رنگ',
  accessibility: 'دسترس پذیری وب', touch: 'صفحه لمسی', cpu: 'پردازنده چند هسته ای',
  ram: 'حافظه دسترسی تصادفی', gpu: 'واحد پردازش گرافیکی', network: 'شبکه رایانه ای',
  battery: 'باتری', cookies: 'کوکی اچ تی تی پی', storage: 'ذخیره سازی وب',
  features: 'رابط برنامه نویسی کاربردی وب', codecs: 'کدک', canvas: 'اثر انگشت مرورگر',
  audio: 'اثر انگشت مرورگر', geolocation: 'مکان یابی جغرافیایی', camera: 'وب کم',
  microphone: 'میکروفون', screen: 'اشتراک گذاری صفحه نمایش', clipboard: 'بریده دان',
  notification: 'اعلان فشاری', bluetooth: 'بلوتوث', usb: 'گذرگاه سریال جهانی',
  nfc: 'ارتباط حوزه نزدیک', serial: 'درگاه سریال', hid: 'دستگاه رابط انسانی',
  file: 'مجوز دسترسی', contacts: 'حریم خصوصی اطلاعات', fonts: 'قلم رایانه ای',
  windows: 'چند نمایشگری', orientation: 'شتاب سنج',
};
function LearnMore({ topic }: { topic: string }) {
  const search = WIKI_TERMS[topic] ?? 'حریم خصوصی اینترنت';
  return <a className="learn-more" href={`https://fa.wikipedia.org/w/index.php?search=${encodeURIComponent(search)}`}
    target="_blank" rel="nofollow noopener noreferrer" title={`مطالعه درباره ${search} در ویکی‌پدیای فارسی`}>
    <BookOpen size={15}/><span>بیشتر بدانید</span><ExternalLink size={13}/>
  </a>;
}
function Footer() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  return <footer className="footer wrap">
    <div className="footer-nav-row">
      <a href="/" className="footer-brand" aria-label="WHO — What Happens Online? | بازگشت به صفحه اصلی"><Eye size={20}/><strong>WHO<span className="brand-dot">.</span></strong></a>
      <nav className="footer-nav" aria-label="پیوندهای سایت">
        <a className={path === '/' || path === '/home' ? 'active' : ''} href="/">ماجراجویی</a>
        <a className={path === '/full' ? 'active' : ''} href="/full">نمای کامل</a>
        <a className={path === '/lite' ? 'active' : ''} href="/lite">نمای سبک</a>
        <a href={REPO} target="_blank" rel="noopener noreferrer"><Github size={16}/> سورس پروژه</a>
      </nav>
    </div>
    <div className="footer-bottom">
      <div className="footer-note"><ShieldCheck size={17} /><span>بدون ردیاب · بدون دیتابیس · بدون ارسال نتایج آزمایش‌ها به سرور</span></div>
      <div className="footer-links"><a href={MAKER} target="_blank" rel="noopener noreferrer">ساخته‌شده با <Heart size={14} fill="currentColor"/> توسط مهرداد۳۲</a></div>
    </div>
  </footer>;
}
function MetricCard({ metric }: { metric: Metric }) {
  return <div className="metric-card">
    <div className="metric-top"><span>{metric.title}</span><Badge tone={metric.source === 'HTTP' ? 'violet' : 'mint'}>{metric.source === 'HTTP' ? 'دریافتی سرور' : 'فقط مرورگر'}</Badge></div>
    <div className="metric-value" dir="auto">{metric.value}</div>
    <p>{metric.detail}</p>
    <LearnMore topic={metric.id}/>
  </div>;
}
function focusCurrentHeading() {
  const heading = document.querySelector<HTMLElement>('main h1');
  if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
}
function Loading() { return <div className="loading"><span className="loader"/>داریم اطلاعات قابل مشاهده را بررسی می‌کنیم...</div>; }

function ShareButtons() {
  const [feedback, setFeedback] = useState('');
  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'WHO — What Happens Online? | مرورگرت چقدر لو می‌ده؟', text: 'ببین سایت‌ها بدون اجازه چقدر درباره مرورگرت می‌فهمند!', url: SITE });
      } else {
        await navigator.clipboard.writeText(SITE);
        setFeedback('لینک کپی شد. برای دوستانت بفرست!');
      }
    } catch (e) { if (e instanceof Error && e.name !== 'AbortError') setFeedback('اشتراک مستقیم در این مرورگر ممکن نیست؛ لینک را از کادر زیر کپی کن.'); }
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(SITE); setFeedback('لینک کپی شد!'); }
    catch { setFeedback('برای کپی، آدرس را از کادر زیر انتخاب کن.'); }
  };
  return <div className="share-area">
    <div className="share-actions"><button className="button button-primary" onClick={() => void share()}><Share2 size={19}/> معرفی به دوستان</button><button className="button button-ghost" onClick={() => void copy()}><Copy size={18}/> کپی لینک</button></div>
    <input className="share-input" readOnly value={SITE} onFocus={e => e.target.select()} aria-label="آدرس سایت برای اشتراک‌گذاری" dir="ltr"/>
    {feedback && <p className="feedback"><Check size={16}/>{feedback}</p>}
  </div>;
}

function Intro({ data, onStart }: { data: DataState; onStart: () => void }) {
  const surprise = data.server?.city || data.server?.country;
  return <div className="hero-view reveal">
    <div className="hero-grid">
      <section className="hero-content">
        <h1>فکر می‌کنی<br/><span className="gradient-text">مرورگرت چی ازت لو می‌ده؟</span></h1>
        <div className="eyebrow"><span className="pulse"/><span>یک تجربه واقعی درباره حریم خصوصی تو</span><Sparkles size={15}/></div>
        <p className="hero-description">هنوز هیچ اجازه‌ای ندادی؛ اما همین الان چند سرنخ درباره دستگاهت داریم. بیا پرده‌به‌پرده کشف کنیم وب‌سایت‌ها چی می‌فهمن.</p>
        <div className="microcopy"><LockKeyhole size={16}/> داده‌های آزمایش‌ها ارسال یا ذخیره نمی‌شن. <a href={REPO} target="_blank" rel="noopener noreferrer">کد متن‌باز رو ببین <ArrowLeft size={13}/></a></div>
        <div className="hero-readouts">
          <div className="readout"><MonitorSmartphone size={21}/><div><small>مرورگر تو</small><strong dir="ltr">{data.device.browser} {data.device.browserVersion}</strong></div></div>
          <div className="readout"><Globe2 size={21}/><div><small>دستگاه و سیستم‌عامل</small><strong>{data.device.kind} · {data.device.os}</strong></div></div>
        </div>
        <div className="surprise"><span className="surprise-icon"><Eye size={22}/></span><div><b>اولین غافلگیری!</b><p>{surprise ? `حتی بدون اجازه GPS، از روی IP می‌شه حدس زد اتصال اینترنتت به «${surprise}» مربوطه! البته ممکنه VPN یا اپراتور این تخمین رو تغییر بده.` : `بدون درخواست هیچ مجوزی می‌شه منطقه زمانی دستگاهت رو فهمید: ${Intl.DateTimeFormat().resolvedOptions().timeZone || 'نامشخص'}. عجیب نیست؟`}</p></div></div>
        <button className="button button-primary button-big" onClick={onStart}>شروع ماجراجویی <ArrowLeft size={21}/></button>
      </section>
      <div className="hero-art" aria-hidden="true">
        <div className="orbit orbit-a"/><div className="orbit orbit-b"/><div className="orbit orbit-c"/>
        <div className="hero-eye"><Eye size={104} strokeWidth={1.25}/></div>
        <div className="orbit-label orbit-label-one"><span className="mini-dot"/> <span>DEVICE DETECTED</span></div>
        <div className="orbit-label orbit-label-two">PRIVACY // 001</div>
        <div className="orbit-card orbit-card-one"><span>browser</span><strong>{data.device.browser}</strong></div>
        <div className="orbit-card orbit-card-two"><span>exposure</span><strong>NO PERMISSION</strong></div>
      </div>
    </div>
    <div className="trust-strip"><span><ShieldCheck size={18}/> بدون ذخیره اطلاعات</span><span><Github size={18}/> کاملاً متن‌باز</span><span><MousePointer2 size={18}/> اجازه‌ها فقط با کلیک تو</span></div>
  </div>;
}

function Choice({ opted, setOpted, onNext, onBack }: { opted: boolean; setOpted: (x: boolean) => void; onNext: () => void; onBack: () => void }) {
  return <div className="center-scene reveal">
    <Badge tone="mint">قبل از شروع سفر</Badge>
    <h1>دو دنیای متفاوت وجود داره.</h1>
    <p className="lead">بعضی اطلاعات به‌طور معمول همراه درخواست وب می‌رسند یا بدون مجوز در مرورگر خوانده می‌شن. بعضی قابلیت‌ها هم باید با انتخاب و اجازه تو فعال بشن.</p>
    <div className="choice-grid">
      <div className="choice-card"><span className="choice-icon mint"><UnlockKeyhole size={29}/></span><h3>بدون درخواست مجوز</h3><p>IP، مرورگر، منطقه زمانی، نمایشگر، سخت‌افزار تقریبی و اثر انگشت مرورگر</p><Badge tone="mint">همیشه در سفر ما</Badge></div>
      <button type="button" className={`choice-card choice-select ${opted ? 'choice-selected' : ''}`} onClick={() => setOpted(!opted)} aria-pressed={opted}>
        <span className="choice-icon violet"><LockKeyhole size={29}/></span><h3>با اجازه و انتخاب تو</h3><p>موقعیت دقیق، دوربین، میکروفون، اشتراک صفحه، USB و قابلیت‌های بیشتر</p><span className="checkline"><span className={`custom-check ${opted ? 'checked' : ''}`}>{opted && <Check size={14}/>}</span>{opted ? 'این بخش هم به سفر اضافه شد' : 'می‌خواهم این بخش را هم ببینم'}</span>
      </button>
    </div>
    <div className="privacy-info"><Info size={20}/><span>حتی با فعال کردن این بخش، هیچ مجوزی خودکار درخواست نمی‌شود؛ برای هر آزمایش باید خودت روی دکمه آن بزنی. نتیجه فقط روی همین دستگاه نشان داده می‌شود.</span></div>
    <div className="action-row"><button className="button button-ghost" onClick={onBack}><ArrowRight size={18}/> بازگشت</button><button className="button button-primary" onClick={onNext}>کشف اطلاعات <ArrowLeft size={19}/></button></div>
  </div>;
}
function SceneView({ step, data }: { step: number; data: DataState }) {
  const scene = scenes[step];
  const metrics = scene.keys.map(key => data.metrics.find(m => m.id === key)).filter((m): m is Metric => Boolean(m));
  return <div className="scene reveal" key={scene.id}>
    <div className="scene-heading"><Badge tone="mint">{scene.eyebrow}</Badge><h1>{scene.title}</h1><p>{scene.subtitle}</p></div>
    {!data.ready ? <Loading/> : <div className="metric-grid">{metrics.map(m => <MetricCard key={m.id} metric={m}/>)}</div>}
    <div className="reveal-note"><Sparkles size={22}/><span>{scene.surprise}</span></div>
  </div>;
}
function PermissionView({ index, result, busy, onRequest, onFilePicked, inputRef }: {
  index: number; result: string | undefined; busy: boolean;
  onRequest: () => void; onFilePicked: (file: File | null) => void; inputRef: RefObject<HTMLInputElement | null>;
}) {
  const p = permissionDemos[index];
  const supported = p.supported();
  const Icon = p.icon;
  return <div className="permission-scene reveal" key={p.id}>
    <Badge tone="violet">مجوزهای اختیاری · {new Intl.NumberFormat('fa-IR').format(index + 1)} از {new Intl.NumberFormat('fa-IR').format(permissionDemos.length)}</Badge>
    <div className="permission-visual"><span className="permission-ring"><Icon size={60} strokeWidth={1.4}/></span><span className="permission-lock"><LockKeyhole size={19}/></span></div>
    <h1>{p.title}</h1><p className="lead">{p.description}</p>
    <div className="hint-box"><Shield size={21}/>{p.hint}</div>
    <div className="permission-learn"><LearnMore topic={p.id}/></div>
    {supported ? <button disabled={busy} className="button button-primary button-big" onClick={onRequest}>{busy ? 'در حال انجام آزمایش...' : p.button}<ArrowLeft size={20}/></button>
      : <div className="unsupported"><ShieldOff size={21}/> این قابلیت در مرورگر فعلی در دسترس نیست. این خودش یک نکته امنیتی جالب است!</div>}
    {result && <div className="permission-result" role="status"><BadgeCheck size={22}/><span>{result}</span></div>}
    <p className="permission-hint">لازم نیست مجوز بدهی؛ می‌توانی مستقیم به مرحله بعد بروی.</p>
    {p.id === 'file' && <input ref={inputRef} type="file" className="visually-hidden" tabIndex={-1} onChange={e => { onFilePicked(e.target.files?.[0] ?? null); e.currentTarget.value = ''; }}/>} 
  </div>;
}
function Journey({ data, withPermission, onDone, onBackToChoice }: { data: DataState; withPermission: boolean; onDone: () => void; onBackToChoice: () => void }) {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const count = scenes.length + (withPermission ? permissionDemos.length : 0);
  const isPermission = index >= scenes.length;
  const current = isPermission ? permissionDemos[index - scenes.length] : null;
  const cancel = () => { controller.current?.abort(); controller.current = null; setBusy(false); };
  useEffect(() => () => { controller.current?.abort(); }, []);
  useEffect(() => {
    focusCurrentHeading();
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [index]);
  const next = () => { cancel(); if (index + 1 >= count) onDone(); else setIndex(v => v + 1); };
  const prev = () => { cancel(); if (index === 0) onBackToChoice(); else setIndex(v => v - 1); };
  const request = () => {
    if (!current || busy) return;
    if (current.id === 'file') { fileRef.current?.click(); return; }
    cancel();
    const local = new AbortController(); controller.current = local;
    setBusy(true);
    const id = current.id;
    void runPermission(id, local.signal, message => {
      if (!local.signal.aborted) setResults(prev => ({ ...prev, [id]: message }));
    }).then(message => {
      if (!local.signal.aborted) { setResults(prev => ({ ...prev, [id]: message })); setBusy(false); }
    }).catch(() => { if (!local.signal.aborted) { setResults(prev => ({ ...prev, [id]: 'انجام آزمایش ممکن نبود.' })); setBusy(false); } });
  };
  return <div className="journey-wrap">
    <div className="journey-top"><div><small>سفر کشف حریم خصوصی</small><strong>مرحله {new Intl.NumberFormat('fa-IR').format(index + 1)} از {new Intl.NumberFormat('fa-IR').format(count)}</strong></div><Badge tone={isPermission ? 'violet' : 'mint'}>{isPermission ? 'با انتخاب تو' : 'بدون مجوز'}</Badge></div>
    <div className="progress-track" role="progressbar" aria-label="پیشرفت ماجراجویی" aria-valuemin={0} aria-valuemax={count} aria-valuenow={index + 1}><div style={{ width: `${((index + 1) / count) * 100}%` }}/></div>
    {current ? <PermissionView index={index - scenes.length} result={results[current.id]} busy={busy} inputRef={fileRef} onRequest={request}
      onFilePicked={file => setResults(prev => ({ ...prev, file: file ? `فایل «${file.name}» (${(file.size / 1024).toFixed(1)} KB) انتخاب شد؛ فقط نام و اندازه دیده شد، محتوای فایل خوانده نشد.` : 'فایلی انتخاب نشد.' }))}/> : <SceneView step={index} data={data}/>}
    <div className="journey-actions"><button className="button button-ghost" onClick={prev}><ArrowRight size={18}/> قبلی</button><span className="step-indicator"><span className="step-pulse"/> {isPermission ? 'بدون اجبار به دادن مجوز' : 'فقط مشاهده اطلاعات'}</span><button className="button button-primary" onClick={next}>{index + 1 === count ? 'دیدن نتیجه نهایی' : 'مرحله بعد'} <ArrowLeft size={18}/></button></div>
    {isPermission && index + 1 < count && <button className="journey-end-early" onClick={() => { cancel(); onDone(); }}>فعلاً از بقیه آزمایش‌های اختیاری بگذر و نتیجه رو ببین <ArrowLeft size={15}/></button>}
  </div>;
}
function Finish({ data, onRestart }: { data: DataState; onRestart: () => void }) {
  const http = data.metrics.filter(m => m.source === 'HTTP').length;
  return <div className="finish-page reveal"><div className="finish-illustration"><ShieldCheck size={74}/></div><Badge tone="mint">پرونده بسته شد؛ آگاهی باز شد!</Badge><h1>حالا می‌دونی پشت هر کلیک چه خبره. <span className="gradient-text">✨</span></h1><p className="lead">بعضی داده‌ها در درخواست اینترنتی می‌روند، بعضی فقط برای JavaScript قابل خواندن‌اند، و قابلیت‌های حساس به رضایت تو نیاز دارند.</p>
    <div className="finish-stats"><div><strong>{new Intl.NumberFormat('fa-IR').format(data.metrics.length)}</strong><span>مورد بررسی‌شده</span></div><div><strong>{new Intl.NumberFormat('fa-IR').format(http)}</strong><span>مورد HTTP</span></div><div><strong>{new Intl.NumberFormat('fa-IR').format(data.metrics.length - http)}</strong><span>مورد سمت مرورگر</span></div></div>
    <div className="finish-tips"><h3><ShieldCheck size={21}/> سه کار ساده برای حفظ حریم خصوصی</h3><p>مرورگرت را به‌روز نگه دار؛ مجوزهای دوربین و موقعیت را فقط به سایت‌های معتبر بده؛ و بدان حالت ناشناس، اثر انگشت مرورگر را کاملاً از بین نمی‌برد.</p></div>
    <div className="finish-lessons"><article><strong>VPN چه چیزی را پنهان می‌کند؟</strong><p>آدرس IP و موقعیت تقریبی اتصال می‌تواند عوض شود؛ اما مشخصات مرورگر و نمایشگر لزوماً نه.</p></article><article><strong>حالت ناشناس چطور؟</strong><p>ردپای محلی مرور را کمتر نگه می‌دارد، ولی وب‌سایت همچنان می‌تواند برخی اطلاعات دستگاه را ببیند.</p></article></div>
    <h2>این تجربه رو به یک دوست هم نشون بده!</h2><p className="muted">شاید اون هم از دیدن اطلاعات مرورگرش غافلگیر بشه.</p><ShareButtons/>
    <div className="action-row center-actions"><button className="button button-ghost" onClick={onRestart}><RefreshCcw size={17}/> شروع دوباره</button><a href="/full" className="button button-secondary"><Terminal size={18}/> نمای کامل اطلاعات</a></div>
  </div>;
}
function Home({ data }: { data: DataState }) {
  const [phase, setPhase] = useState<'intro' | 'choice' | 'journey' | 'finish'>('intro');
  const [includePermissions, setIncludePermissions] = useState(false);
  useEffect(() => {
    focusCurrentHeading();
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [phase]);
  return <main className="main wrap">{phase === 'intro' ? <Intro data={data} onStart={() => setPhase('choice')}/> : phase === 'choice' ? <Choice opted={includePermissions} setOpted={setIncludePermissions} onNext={() => setPhase('journey')} onBack={() => setPhase('intro')}/> : phase === 'journey' ? <Journey data={data} withPermission={includePermissions} onDone={() => setPhase('finish')} onBackToChoice={() => setPhase('choice')}/> : <Finish data={data} onRestart={() => { setIncludePermissions(false); setPhase('intro'); }}/>}</main>;
}
function Lite({ data }: { data: DataState }) {
  const entries = [
    { label: 'IP عمومی', topic: 'ip', value: data.server?.ip || 'در این محیط قابل دریافت نیست', icon: Globe2 },
    { label: 'مرورگر', topic: 'browser', value: `${data.device.browser} ${data.device.browserVersion}`, icon: Eye },
    { label: 'سیستم‌عامل', topic: 'os', value: data.device.os, icon: MonitorSmartphone },
    { label: 'نوع دستگاه', topic: 'device', value: data.device.kind, icon: Radio }
  ];
  return <main className="main wrap page-view"><div className="page-heading"><Badge tone="mint">WHO / LITE</Badge><h1>تو، در یک نگاه.</h1><p>فقط چهار مورد مهم؛ بدون درخواست مجوز یا ذخیره داده.</p></div><div className="lite-panel"><div className="lite-top"><span><Eye size={24}/> نمای سبک</span><Badge tone="mint">زنده</Badge></div>{entries.map(({ label, topic, value, icon: Icon }) => <div className="lite-row" key={label}><span><Icon size={20}/>{label}</span><div className="lite-answer"><strong dir="auto">{value}</strong><LearnMore topic={topic}/></div></div>)}</div><div className="below-panel"><span><ShieldCheck size={19}/> هیچ‌یک از نتایج این صفحه ذخیره نمی‌شوند.</span><a href="/" className="button button-primary">کشف اطلاعات بیشتر <ArrowLeft size={18}/></a></div></main>;
}
function Full({ data }: { data: DataState }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'HTTP' | 'JavaScript'>('all');
  const items = useMemo(() => data.metrics.filter(m => (filter === 'all' || m.source === filter) && [m.title, m.value, m.detail].some(x => x.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))), [data.metrics, query, filter]);
  return <main className="main wrap page-view"><div className="page-heading"><Badge tone="violet">WHO / FULL</Badge><h1>تمام سرنخ‌ها، یک‌جا.</h1><p>اطلاعات واقعی قابل مشاهده بدون درخواست مجوز؛ با تفکیک داده‌های HTTP و JavaScript. این جدول آزمایش مجوزدار اجرا نمی‌کند.</p></div>
    <div className="full-toolbar"><label className="searchbox"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="جستجو در اطلاعات..." aria-label="جستجو در جدول"/></label><div className="tabs" role="group" aria-label="فیلتر منبع اطلاعات"><button className={filter === 'all' ? 'selected' : ''} onClick={() => setFilter('all')}>همه</button><button className={filter === 'HTTP' ? 'selected' : ''} onClick={() => setFilter('HTTP')}>سرور HTTP</button><button className={filter === 'JavaScript' ? 'selected' : ''} onClick={() => setFilter('JavaScript')}>مرورگر JS</button></div></div>
    <div className="full-info"><Info size={19}/> داده‌های HTTP هنگام بارگذاری سایت به سرور می‌رسند؛ داده‌های JavaScript اینجا فقط روی دستگاهت خوانده می‌شوند و هیچ‌کدام از آن‌ها برای ذخیره‌سازی آپلود نمی‌شوند.</div>
    <div className="table-container"><table className="full-table"><thead><tr><th>اطلاعات</th><th>مقدار تشخیص‌داده‌شده</th><th>منبع</th><th>توضیح</th></tr></thead><tbody>{items.map(m => <tr key={m.id}><td className="table-title">{m.title}</td><td className="table-value" dir="auto">{m.value}</td><td><Badge tone={m.source === 'HTTP' ? 'violet' : 'mint'}>{m.source === 'HTTP' ? 'HTTP' : 'JS'}</Badge></td><td className="table-detail">{m.detail}<LearnMore topic={m.id}/></td></tr>)}</tbody></table>{!data.ready && <Loading/>}{data.ready && !items.length && <div className="empty-search">موردی با این جستجو پیدا نشد.</div>}</div>
    <div className="below-panel"><span><ShieldCheck size={20}/> بدون کوکی ردیابی، دیتابیس یا انتقال داده‌های JavaScript به سرور</span><a className="button button-secondary" href="/lite">نمای سبک <ArrowLeft size={18}/></a></div>
  </main>;
}
function NotFound() { return <main className="main wrap missing"><CircleHelp size={58}/><h1>این مسیر پیدا نشد!</h1><p>می‌تونی از صفحه اصلی ماجراجویی رو آغاز کنی.</p><a className="button button-primary" href="/">بازگشت به صفحه اصلی <ArrowLeft size={18}/></a></main>; }
export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const data = useWhoData(path !== '/lite');
  return <div className="app-shell"><div className="glow glow-one"/><div className="glow glow-two"/>{path === '/' || path === '/home' ? <Home data={data}/> : path === '/full' ? <Full data={data}/> : path === '/lite' ? <Lite data={data}/> : <NotFound/>}<Footer/></div>;
}
