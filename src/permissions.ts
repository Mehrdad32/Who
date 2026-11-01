import type { LucideIcon } from 'lucide-react';
import { MapPin, Camera, Mic, MonitorUp, Clipboard, Bell, Bluetooth, Usb, Radio, Cable, FolderOpen, Contact, Type, PanelsTopLeft, Compass } from 'lucide-react';

export type PermissionDemo = {
  id: string; title: string; description: string; hint: string; button: string;
  icon: LucideIcon; supported: () => boolean;
};

type ExtendedNavigator = Navigator & {
  bluetooth?: { requestDevice: (options: { acceptAllDevices: boolean }) => Promise<{ name?: string }> };
  usb?: { requestDevice: (options: { filters: object[] }) => Promise<{ productName?: string }> };
  serial?: { requestPort: () => Promise<{ getInfo: () => { usbVendorId?: number; usbProductId?: number } }> };
  hid?: { requestDevice: (options: { filters: object[] }) => Promise<{ productName?: string }[]> };
  contacts?: { select: (fields: string[], options: { multiple: boolean }) => Promise<unknown[]> };
  clipboard: Clipboard;
};
const nav = () => navigator as ExtendedNavigator;
const win = () => window as Window & {
  NDEFReader?: new () => { scan: (o: { signal: AbortSignal }) => Promise<void>; addEventListener: (name: string, cb: () => void) => void };
  queryLocalFonts?: () => Promise<unknown[]>;
  getScreenDetails?: () => Promise<{ screens?: unknown[] }>;
  showOpenFilePicker?: () => Promise<unknown[]>;
  DeviceOrientationEvent?: typeof DeviceOrientationEvent & { requestPermission?: () => Promise<string> };
};

export const permissionDemos: PermissionDemo[] = [
  { id: 'geolocation', title: 'موقعیت دقیق', description: 'آیا یک سایت با اجازه تو می‌تواند طول و عرض جغرافیایی‌ات را بداند؟', hint: 'در صورت موافقت، مختصات فقط همین‌جا نمایش داده می‌شود.', button: 'درخواست موقعیت', icon: MapPin, supported: () => !!navigator.geolocation },
  { id: 'camera', title: 'دوربین', description: 'سایت می‌تواند جریان تصویر دوربین انتخابی را دریافت کند.', hint: 'دوربین فقط برای آزمایش باز می‌شود و بلافاصله بسته خواهد شد. هیچ عکسی ثبت نمی‌شود.', button: 'امتحان دوربین', icon: Camera, supported: () => !!navigator.mediaDevices?.getUserMedia },
  { id: 'microphone', title: 'میکروفون', description: 'اجازه می‌تواند دسترسی به صدای میکروفون را فعال کند.', hint: 'در این آزمایش جریان میکروفون بلافاصله قطع می‌شود و هیچ صوتی ضبط نمی‌شود.', button: 'امتحان میکروفون', icon: Mic, supported: () => !!navigator.mediaDevices?.getUserMedia },
  { id: 'screen', title: 'اشتراک صفحه', description: 'با انتخاب پنجره یا صفحه، وب‌سایت می‌تواند تصویر آن را دریافت کند.', hint: 'پس از انتخاب، اشتراک بلافاصله متوقف می‌شود و چیزی ذخیره نمی‌گردد.', button: 'آزمایش اشتراک صفحه', icon: MonitorUp, supported: () => !!navigator.mediaDevices?.getDisplayMedia },
  { id: 'clipboard', title: 'خواندن کلیپ‌بورد', description: 'بسته به مرورگر، خواندن متن کپی‌شده ممکن است به اجازه یا تعامل نیاز داشته باشد.', hint: 'برای حفظ حریم خصوصی حتی نمونه‌ای از متن هم نمایش نمی‌دهیم؛ فقط تعداد نویسه‌ها مشخص می‌شود.', button: 'خواندن متن کپی‌شده', icon: Clipboard, supported: () => !!nav().clipboard?.readText },
  { id: 'notification', title: 'اعلان‌های مرورگر', description: 'اگر اجازه بدهی، سایت می‌تواند اعلان نمایشی صادر کند.', hint: 'فقط وضعیت مجوز بررسی می‌شود؛ هیچ اعلان یا Push اشتراکی ثبت نمی‌کنیم.', button: 'درخواست اعلان', icon: Bell, supported: () => 'Notification' in window && typeof Notification.requestPermission === 'function' },
  { id: 'bluetooth', title: 'دستگاه بلوتوث', description: 'مرورگر می‌تواند با انتخاب تو به بعضی دستگاه‌های Bluetooth متصل شود.', hint: 'تنها نام دستگاه انتخاب‌شده نمایش داده می‌شود؛ اتصال یا انتقال داده انجام نمی‌شود.', button: 'انتخاب دستگاه بلوتوث', icon: Bluetooth, supported: () => !!nav().bluetooth?.requestDevice },
  { id: 'usb', title: 'دستگاه USB', description: 'انتخاب یک دستگاه USB پشتیبانی‌شده دسترسی بیشتری به صفحه می‌دهد.', hint: 'فقط اطلاعات عمومی دستگاه انتخابی نمایش داده می‌شود.', button: 'انتخاب دستگاه USB', icon: Usb, supported: () => !!nav().usb?.requestDevice },
  { id: 'nfc', title: 'تگ NFC', description: 'در برخی مرورگرهای اندروید، صفحه می‌تواند با اجازه تو به تگ‌های NFC نزدیک دسترسی پیدا کند.', hint: 'محتوای تگ نمایش یا ذخیره نمی‌شود؛ اسکن با خروج از این مرحله متوقف می‌شود.', button: 'فعال‌کردن اسکن NFC', icon: Radio, supported: () => !!win().NDEFReader },
  { id: 'serial', title: 'پورت سریال', description: 'امکان انتخاب دستگاه‌های سازگار با درگاه Serial در مرورگرهای خاص وجود دارد.', hint: 'پورت باز نمی‌شود و هیچ داده‌ای ارسال نمی‌کنیم.', button: 'انتخاب پورت', icon: Cable, supported: () => !!nav().serial?.requestPort },
  { id: 'hid', title: 'دستگاه HID', description: 'انتخاب بعضی تجهیزات ورودی USB و HID ممکن است.', hint: 'تنها دستگاه انتخابی شناسایی می‌شود.', button: 'انتخاب HID', icon: Cable, supported: () => !!nav().hid?.requestDevice },
  { id: 'file', title: 'فایل‌های شخصی', description: 'بدون انتخاب صریح تو، سایت عادی به فایل‌های شخصی دسترسی آزاد ندارد.', hint: 'نام و حجم فایل انتخابی فقط در مرورگر نمایش داده می‌شود؛ فایل خوانده یا آپلود نمی‌شود.', button: 'انتخاب یک فایل', icon: FolderOpen, supported: () => true },
  { id: 'contacts', title: 'مخاطبین', description: 'بعضی مرورگرها اجازه می‌دهند فقط مخاطبین منتخب خود را به سایت بدهی.', hint: 'فقط تعداد مخاطبین انتخاب‌شده نمایش داده می‌شود.', button: 'انتخاب مخاطب', icon: Contact, supported: () => !!nav().contacts?.select },
  { id: 'fonts', title: 'فونت‌های نصب‌شده', description: 'در برخی مرورگرهای دسکتاپ، دسترسی به فهرست فونت‌های محلی نیازمند اجازه است.', hint: 'فقط تعداد فونت‌ها نمایش داده می‌شود.', button: 'بررسی فونت‌ها', icon: Type, supported: () => !!win().queryLocalFonts },
  { id: 'windows', title: 'چند نمایشگر', description: 'مرورگرهای سازگار می‌توانند با اجازه، اطلاعات پنجره‌ها و نمایشگرهای متصل را به دست آورند.', hint: 'فقط تعداد نمایشگرها نشان داده می‌شود.', button: 'بررسی نمایشگرها', icon: PanelsTopLeft, supported: () => !!win().getScreenDetails },
  { id: 'orientation', title: 'جهت‌گیری و سنسورها', description: 'دستگاه ممکن است جهت‌گیری و حرکت خود را در اختیار صفحه قرار دهد.', hint: 'در بعضی سیستم‌ها، مثل iOS، مجوز مستقیم لازم است؛ در برخی مرورگرها نیست.', button: 'بررسی دسترسی سنسورها', icon: Compass, supported: () => 'DeviceOrientationEvent' in window }
];

export async function runPermission(id: string, signal: AbortSignal, onNfcEvent: (value: string) => void): Promise<string> {
  try {
    switch (id) {
      case 'geolocation': {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 12000, maximumAge: 0, enableHighAccuracy: false });
        });
        if (signal.aborted) return 'آزمایش متوقف شد.';
        return `اجازه داده شد · عرض: ${position.coords.latitude.toFixed(4)} · طول: ${position.coords.longitude.toFixed(4)} · دقت حدود ${Math.round(position.coords.accuracy)} متر`;
      }
      case 'camera':
      case 'microphone': {
        const stream = await navigator.mediaDevices.getUserMedia({ video: id === 'camera', audio: id === 'microphone' });
        const labels = stream.getTracks().map(t => t.label || t.kind).join('، ');
        stream.getTracks().forEach(t => t.stop());
        return `دسترسی تأیید شد · ${labels} · جریان فوراً قطع شد.`;
      }
      case 'screen': {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
        const count = stream.getTracks().length;
        stream.getTracks().forEach(t => t.stop());
        return `اشتراک ${count} جریان تأیید شد و بلافاصله متوقف شد.`;
      }
      case 'clipboard': {
        const value = await navigator.clipboard.readText();
        return `امکان خواندن تأیید شد · تعداد نویسه‌های متن: ${value.length} · خود متن عمداً نمایش داده یا ارسال نشد.`;
      }
      case 'notification': return `وضعیت مجوز اعلان: ${await Notification.requestPermission()}`;
      case 'bluetooth': {
        const d = await nav().bluetooth!.requestDevice({ acceptAllDevices: true });
        return `دستگاه انتخاب شد: ${d.name || 'بدون نام'} · هیچ اتصال بعدی برقرار نشد.`;
      }
      case 'usb': {
        const d = await nav().usb!.requestDevice({ filters: [] });
        return `دستگاه انتخاب شد: ${d.productName || 'بدون نام'} · هیچ داده‌ای منتقل نشد.`;
      }
      case 'nfc': {
        const Reader = win().NDEFReader!;
        const reader = new Reader();
        reader.addEventListener('reading', () => { onNfcEvent('تگ NFC شناسایی شد؛ محتوای آن خوانده یا ذخیره نشد.'); });
        await reader.scan({ signal });
        return 'اسکن فعال شد؛ یک تگ نزدیک کن. با تغییر مرحله اسکن قطع می‌شود.';
      }
      case 'serial': {
        const port = await nav().serial!.requestPort();
        const info = port.getInfo();
        return `پورت انتخاب شد · Vendor ID: ${info.usbVendorId ?? 'نامشخص'} · Product ID: ${info.usbProductId ?? 'نامشخص'} · پورت باز نشد.`;
      }
      case 'hid': {
        const devices = await nav().hid!.requestDevice({ filters: [] });
        return `${devices.length} دستگاه انتخاب شد · ${devices.map(d => d.productName || 'بدون نام').join('، ') || 'بدون انتخاب'}`;
      }
      case 'contacts': {
        const contacts = await nav().contacts!.select(['name'], { multiple: false });
        return `${contacts.length} مخاطب انتخاب شد؛ محتوا نمایش داده یا ارسال نمی‌شود.`;
      }
      case 'fonts': {
        const fonts = await win().queryLocalFonts!();
        return `${fonts.length} فونت قابل مشاهده است؛ فهرست ذخیره نمی‌شود.`;
      }
      case 'windows': {
        const details = await win().getScreenDetails!();
        return `${details.screens?.length ?? 0} نمایشگر گزارش شد.`;
      }
      case 'orientation': {
        const request = win().DeviceOrientationEvent?.requestPermission;
        if (request) return `وضعیت مجوز سنسورها: ${await request()}`;
        return 'این مرورگر درخواست مجوز جداگانه ارائه نمی‌کند؛ دسترسی به داده‌ها وابسته به سیاست مرورگر و سیستم‌عامل است.';
      }
      default: return 'برای انتخاب فایل از دکمه اختصاصی استفاده کن.';
    }
  } catch (error: unknown) {
    const name = error instanceof Error ? error.name : 'Error';
    if (name === 'NotAllowedError' || name === 'PermissionDeniedError' || name === 'SecurityError') return 'مجوز رد شد یا مرورگر به دلایل امنیتی دسترسی را مسدود کرد.';
    if (name === 'AbortError' || name === 'NotFoundError') return 'آزمایش لغو شد یا دستگاه مناسبی انتخاب نشد.';
    if (name === 'TimeoutError' || name === 'PositionError') return 'زمان آزمایش به پایان رسید یا موقعیت در دسترس نبود.';
    return `در این مرورگر آزمایش انجام نشد (${name}).`;
  }
}
