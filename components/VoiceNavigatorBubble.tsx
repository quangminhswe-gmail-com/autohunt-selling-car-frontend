'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { VOICE_ROUTES } from '@/lib/voiceRoutes.generated';
import { apiClient } from '@/app/utils/api';

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: null | (() => void);
  onend: null | (() => void);
  onerror: null | ((event: { error?: string; message?: string }) => void);
  onresult: null | ((event: {
    resultIndex: number;
    results: ArrayLike<ArrayLike<{ transcript: string; confidence?: number }> & { isFinal?: boolean }>;
  }) => void);
  start: () => void;
  stop: () => void;
  abort: () => void;
};

const getSpeechRecognitionCtor = (): (new () => SpeechRecognitionLike) | null => {
  if (typeof window === 'undefined') return null;
  const anyWindow = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return anyWindow.SpeechRecognition || anyWindow.webkitSpeechRecognition || null;
};

const stripDiacritics = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');

const normalizeCommand = (value: string) =>
  stripDiacritics(value)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

type VoiceAction =
  | { type: 'push'; href: string }
  | { type: 'back' }
  | { type: 'reload' };

type VehicleFilterPayload = {
  reset?: boolean;
  searchQuery?: string;
  selectedMakes?: string[];
  selectedTypes?: string[];
  selectedYear?: string;
  selectedTransmissions?: string[];
  selectedFuelTypes?: string[];
  minPrice?: string;
  maxPrice?: string;
  sortBy?: string;
};

type VehicleFilterEnvelope = {
  filters: VehicleFilterPayload;
  criteriaCount?: number;
  criteriaKeys?: Array<keyof VehicleFilterPayload>;
};

export default function VoiceNavigatorBubble() {
  const router = useRouter();
  const pathname = usePathname();
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastHeard, setLastHeard] = useState<string>('');
  const [showCheatsheet, setShowCheatsheet] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const sendTimerRef = useRef<number | null>(null);
  const bufferRef = useRef<string>('');

  const bubbleBaseClasses =
    'flex items-center gap-2 rounded-full bg-slate-900/70 backdrop-blur border border-white/10 px-3 py-2.5 text-white font-semibold shadow-lg transition-transform duration-200 hover:-translate-y-0.5 hover:bg-slate-900/85';

  const cheatsheet = useMemo(() => {
    const segmentToVi: Record<string, string> = {
      home: 'Trang chủ',
      admin: 'Quản trị',
      dashboard: 'Bảng điều khiển',
      cars: 'Xe',
      vehicle: 'Xe',
      vehicles: 'Danh sách xe',
      posting: 'Bài đăng',
      reviews: 'Đánh giá',
      coupons: 'Mã giảm giá',
      customers: 'Khách hàng',
      finance: 'Tài chính',
      transactions: 'Giao dịch',
      notifications: 'Thông báo',
      support: 'Hỗ trợ',
      requests: 'Yêu cầu',
      messages: 'Tin nhắn',
      orders: 'Đơn hàng',
      seller: 'Người bán',
      sell: 'Đăng bán xe',
      profile: 'Hồ sơ cá nhân',
      login: 'Đăng nhập',
      signup: 'Đăng ký',
      auth: 'Xác thực',
      google: 'Google',
      callback: 'Callback',
      careers: 'Tuyển dụng',
      terms: 'Điều khoản',
      privacy: 'Quyền riêng tư',
      cookies: 'Cookie',
    };

    const englishWordToVi: Array<[RegExp, string]> = [
      [/\borders?\b/gi, 'đơn hàng'],
      [/\bmessages?\b/gi, 'tin nhắn'],
      [/\bvehicles?\b/gi, 'xe'],
      [/\bvehicle\b/gi, 'xe'],
      [/\bprofile\b/gi, 'hồ sơ'],
      [/\blogin\b/gi, 'đăng nhập'],
      [/\bsign\s*up\b/gi, 'đăng ký'],
      [/\bsignup\b/gi, 'đăng ký'],
      [/\bsell\b/gi, 'đăng bán'],
      [/\bseller\b/gi, 'người bán'],
      [/\bsupport\b/gi, 'hỗ trợ'],
      [/\brequest(s)?\b/gi, 'yêu cầu'],
      [/\badmin\b/gi, 'quản trị'],
      [/\bdashboard\b/gi, 'bảng điều khiển'],
      [/\btransaction(s)?\b/gi, 'giao dịch'],
      [/\bnotification(s)?\b/gi, 'thông báo'],
      [/\bcoupon(s)?\b/gi, 'mã giảm giá'],
      [/\bcustomer(s)?\b/gi, 'khách hàng'],
      [/\bfinance\b/gi, 'tài chính'],
      [/\bcareer(s)?\b/gi, 'tuyển dụng'],
      [/\bterms?\b/gi, 'điều khoản'],
      [/\bprivacy\b/gi, 'quyền riêng tư'],
      [/\bcookie(s)?\b/gi, 'cookie'],
    ];

    const translateEnglishTitleToVi = (title: string) => {
      let out = String(title || '');
      for (const [re, rep] of englishWordToVi) {
        out = out.replace(re, rep);
      }
      return out;
    };

    const titleFromPathVi = (routePath: string, fallbackTitle?: string) => {
      if (routePath === '/') return 'Trang chủ';
      const segs = routePath.split('/').filter(Boolean);
      const vnParts = segs.map((seg) => {
        const cleaned = seg.replace(/[-_]/g, ' ').trim().toLowerCase();
        return segmentToVi[cleaned] || cleaned.replace(/\b\w/g, (m) => m.toUpperCase());
      });
      const composed = vnParts.join(' / ').trim();
      if (composed) return composed;
      return fallbackTitle ? fallbackTitle.replaceAll('/', ' / ') : routePath;
    };

    const titleForSpeech = (title: string) =>
      title
        .replaceAll('/', ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const buildPhrasesLegacy = (title: string) => {
      const t = titleForSpeech(title);
      if (!t) return [];
      return [
        `mở ${t}`,
        `vào ${t}`,
        `đi đến ${t}`,
        `đi tới ${t}`,
        `cho tôi tới ${t}`,
      ];
    };

    const buildPhrasesVietnamese = (title: string) => {
      const t = titleForSpeech(title);
      if (!t) return [];
      return [
        `mở trang ${t}`,
        `vào trang ${t}`,
        `đi đến trang ${t}`,
        `chuyển đến trang ${t}`,
        `đưa tôi đến trang ${t}`,
      ];
    };

    const routes = VOICE_ROUTES
      .filter((r) => r.path && r.title && !r.path.startsWith('/admin'))
      .map((r) => {
        const viTitle = titleFromPathVi(r.path, r.title);
        const legacyPhrases = buildPhrasesLegacy(r.title);
        const translatedFromEnglish = translateEnglishTitleToVi(r.title);
        const viFromEnglishPhrases =
          translatedFromEnglish && translatedFromEnglish !== r.title
            ? buildPhrasesVietnamese(translatedFromEnglish)
            : [];
        const viPhrases = buildPhrasesVietnamese(viTitle);
        const phrases = Array.from(new Set([...legacyPhrases, ...viFromEnglishPhrases, ...viPhrases]));
        return {
          path: r.path,
          title: viTitle,
          rawTitle: r.title,
          phrases,
          legacyCount: legacyPhrases.length,
        };
      });

    return routes;
  }, []);

  const intentIndex = useMemo(() => {
    const verbs = new Set([
      'mo',
      'vao',
      'di',
      'den',
      'toi',
      'cho toi',
      'giup toi',
      'hay',
      'lam on',
      'please',
      'go',
      'open',
      'navigate',
    ]);

    const tokenize = (cmd: string) => normalizeCommand(cmd).split(' ').filter(Boolean);

    const hasAnyPhrase = (cmd: string, phrases: string[]) => phrases.some((p) => cmd.includes(p));

    const scoreByKeywords = (tokens: string[], keywords: string[]) => {
      let score = 0;
      for (const k of keywords) {
        if (k.includes(' ')) continue;
        if (tokens.includes(k)) score += 2;
      }
      return score;
    };

    const intents: Array<{
      label: string;
      action: VoiceAction;
      phrases?: string[];
      keywords: string[];
      minScore: number;
    }> = [
      {
        label: 'Profile',
        action: { type: 'push', href: '/profile' },
        phrases: ['trang ca nhan', 'tai khoan cua toi'],
        keywords: ['profile', 'ho', 'so', 'hoso', 'ca', 'nhan', 'taikhoan', 'account', 'user'],
        minScore: 2,
      },
      {
        label: 'Home',
        action: { type: 'push', href: '/' },
        phrases: ['trang chu', 'trang chu cua toi'],
        keywords: ['home', 'trang', 'chu', 'chuyen', 'giao'],
        minScore: 2,
      },
      {
        label: 'Vehicles',
        action: { type: 'push', href: '/vehicles' },
        phrases: ['danh sach xe', 'xem xe', 'trang xe', 'tim xe', 'phuong tien', 'phuong tien di chuyen'],
        keywords: ['xe', 'vehicles', 'car', 'cars', 'phuong tien', 'phuong tien di chuyen'],
        minScore: 2,
      },
      {
        label: 'Sell',
        action: { type: 'push', href: '/sell' },
        phrases: ['dang ban', 'ban xe', 'dang tin'],
        keywords: ['sell', 'ban', 'dang', 'tin'],
        minScore: 2,
      },
      {
        label: 'Messages',
        action: { type: 'push', href: '/messages' },
        phrases: ['tin nhan', 'hop thu'],
        keywords: ['messages', 'message', 'chat', 'tin', 'nhan'],
        minScore: 2,
      },
      {
        label: 'Orders',
        action: { type: 'push', href: '/orders' },
        phrases: ['don hang', 'lich su mua'],
        keywords: ['orders', 'order', 'don', 'hang'],
        minScore: 2,
      },
      {
        label: 'Back',
        action: { type: 'back' },
        phrases: ['quay lai', 'tro lai', 'lui lai', 've truoc'],
        keywords: ['back', 'quay', 'tro', 'lai', 'lui'],
        minScore: 2,
      },
      {
        label: 'Reload',
        action: { type: 'reload' },
        phrases: ['tai lai', 'lam moi', 'refresh'],
        keywords: ['reload', 'refresh', 'tai', 'lai', 'moi'],
        minScore: 2,
      },
    ];

    return { intents, tokenize, verbs, hasAnyPhrase, scoreByKeywords };
  }, []);

  const applyVehicleFilter = async (utterance: string) => {
    try {
      const data = await apiClient<{
        ok?: boolean;
        filters?: VehicleFilterPayload;
        criteriaCount?: number;
        criteriaKeys?: Array<keyof VehicleFilterPayload>;
      }>('/voice-vehicle-filter', {
        method: 'POST',
        body: { utterance },
      });
      const envelope: VehicleFilterEnvelope = {
        filters: data?.filters || {},
        criteriaCount: data?.criteriaCount,
        criteriaKeys: data?.criteriaKeys,
      };

      if (pathname !== '/vehicles') {
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem('voiceVehicleFilter', JSON.stringify(envelope));
        }
        router.push('/vehicles');
        return true;
      }

      window.dispatchEvent(new CustomEvent('voice:vehicle-filter', { detail: envelope }));
      return true;
    } catch (error) {
      console.error('Voice filter error:', error);
      return false;
    }
  };

  const runCommand = async (raw: string) => {
    const cmd = normalizeCommand(raw);
    if (!cmd) return false;

    // Voice-driven filtering on Browse Cars
    if (
      cmd.includes('tim xe') ||
      cmd.includes('tìm xe') ||
      (cmd.includes('tim') && cmd.includes('xe')) ||
      cmd.includes('loc xe') ||
      cmd.includes('lọc xe') ||
      cmd.includes('search xe')
    ) {
      try {
        return await applyVehicleFilter(raw);
      } catch {
        return false;
      }
    }

    const tokens = intentIndex.tokenize(cmd).filter((t) => !intentIndex.verbs.has(t));
    const expandedTokens = Array.from(
      new Set([
        ...tokens,
        // Vietnamese -> English aliases to match route segments
        ...(cmd.includes('nguoi ban') || (tokens.includes('nguoi') && tokens.includes('ban')) ? ['seller'] : []),
        ...(tokens.includes('don') && tokens.includes('hang') ? ['orders'] : []),
      ])
    );

    // Hard rule: seller + orders => /orders/seller (prevents confusing "seller" with "sell")
    const wantsSeller =
      expandedTokens.includes('seller') || expandedTokens.includes('seller') || cmd.includes('seller');
    const wantsOrders =
      expandedTokens.includes('orders') ||
      expandedTokens.includes('order') ||
      tokens.includes('order') ||
      tokens.includes('orders') ||
      (tokens.includes('don') && tokens.includes('hang')) ||
      cmd.includes('don hang');

    if (wantsSeller && wantsOrders) {
      const sellerOrdersRoute = VOICE_ROUTES.find((r) => r.path === '/orders/seller');
      if (sellerOrdersRoute && pathname !== sellerOrdersRoute.path) {
        router.push(sellerOrdersRoute.path);
        return true;
      }
    }

    let best: { intent: (typeof intentIndex.intents)[number]; score: number } | null = null;

    // 1) Try special intents (back/reload, plus a few key pages)
    for (const intent of intentIndex.intents) {
      let score = 0;
      if (intent.phrases && intentIndex.hasAnyPhrase(cmd, intent.phrases)) score += 4;
      score += intentIndex.scoreByKeywords(expandedTokens, intent.keywords);

      // If user mentions orders, de-prioritize Sell intent.
      if (wantsOrders && intent.label === 'Sell') score -= 3;

      if (score >= intent.minScore && (!best || score > best.score)) {
        best = { intent, score };
      }
    }

    // 2) Try any static route in the app/ directory (auto-generated)
    let bestRoute: { href: string; score: number } | null = null;
    for (const route of VOICE_ROUTES) {
      // quick phrase boost (route title/path often appears in speech)
      let score = 0;
      const titleNorm = normalizeCommand(route.title);
      const pathNorm = normalizeCommand(route.path.replaceAll('/', ' '));
      if (titleNorm && cmd.includes(titleNorm)) score += 6;
      if (pathNorm && cmd.includes(pathNorm)) score += 5;

      // keyword overlap
      score += intentIndex.scoreByKeywords(expandedTokens, route.keywords);

      // small boost if user says "trang X"
      if (cmd.includes('trang ') && route.title && cmd.includes(normalizeCommand(route.title.split('/').pop() || ''))) {
        score += 2;
      }

      // prefer more specific nested pages when tie-ish
      const depth = route.path.split('/').filter(Boolean).length;
      score += Math.min(2, Math.max(0, depth - 1) * 0.15);

      if (!bestRoute || score > bestRoute.score) bestRoute = { href: route.path, score };
    }

    // If route match is better than intent match, navigate by route.
    if (bestRoute && bestRoute.score >= 3 && (!best || bestRoute.score > best.score + 0.5)) {
      if (pathname !== bestRoute.href) router.push(bestRoute.href);
      return true;
    }

    if (!best) return false;

    const action = best.intent.action;
    if (action.type === 'push') {
      if (pathname !== action.href) router.push(action.href);
    } else if (action.type === 'back') {
      router.back();
    } else if (action.type === 'reload') {
      router.refresh();
    }

    return true;
  };

  useEffect(() => {
    const RecognitionCtor = getSpeechRecognitionCtor();
    setSupported(Boolean(RecognitionCtor));
    if (!RecognitionCtor) return;

    const recognition = new RecognitionCtor();
    recognition.lang = 'vi-VN';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setError(null);
      bufferRef.current = '';
      setShowCheatsheet(true);
    };

    recognition.onend = () => {
      setListening(false);
      bufferRef.current = '';
      setShowCheatsheet(false);
      if (sendTimerRef.current) {
        window.clearTimeout(sendTimerRef.current);
        sendTimerRef.current = null;
      }
    };

    recognition.onerror = (event) => {
      const code = String(event?.error || '').toLowerCase();
      if (code === 'not-allowed' || code === 'service-not-allowed') {
        setError('Bạn đã chặn quyền microphone trên trình duyệt.');
      } else if (code === 'no-speech') {
        setError('Mình chưa nghe rõ. Bạn thử nói lại nhé.');
      } else if (code === 'audio-capture') {
        setError('Không tìm thấy microphone.');
      } else {
        setError('Không thể bật nhận giọng nói lúc này.');
      }
      setListening(false);
    };

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const transcript = String(result?.[0]?.transcript || '').trim();
        if (!transcript) continue;
        if (result.isFinal) finalText += `${transcript} `;
        else interimText += `${transcript} `;
      }

      const finalChunk = finalText.trim();
      const interimChunk = interimText.trim();

      if (finalChunk) bufferRef.current = `${bufferRef.current} ${finalChunk}`.trim();

      const composed = `${bufferRef.current}${interimChunk ? ` ${interimChunk}` : ''}`.trim();
      if (composed) setLastHeard(composed);

      if (sendTimerRef.current) window.clearTimeout(sendTimerRef.current);

      // wait 2s of silence to run command
      sendTimerRef.current = window.setTimeout(() => {
        sendTimerRef.current = null;
        const message = bufferRef.current.trim() || composed;
        if (!message) return;

        bufferRef.current = '';
        void (async () => {
          const ok = await runCommand(message);
          if (!ok) setError('Không nhận ra lệnh. Thử: "về trang chủ", "mở profile", "quay lại", "tìm xe Toyota".');
          try {
            recognition.stop();
          } catch {
            // ignore
          }
        })();
      }, 2000);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        if (sendTimerRef.current) {
          window.clearTimeout(sendTimerRef.current);
          sendTimerRef.current = null;
        }
        recognition.onstart = null;
        recognition.onend = null;
        recognition.onerror = null;
        recognition.onresult = null;
        recognition.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    };
  }, [intentIndex, pathname, router]);

  const toggle = () => {
    if (!supported || !recognitionRef.current) {
      setError('Trình duyệt chưa hỗ trợ. Hãy dùng Chrome/Edge.');
      return;
    }
    setError(null);
    try {
      if (listening) {
        setShowCheatsheet(false);
        recognitionRef.current.stop();
      } else {
        setShowCheatsheet(true);
        recognitionRef.current.start();
      }
    } catch {
      setError('Không thể bật microphone. Hãy tải lại trang và cho phép mic.');
      setListening(false);
      setShowCheatsheet(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-2">
      {error && (
        <div className="max-w-[320px] rounded-2xl border border-amber-300/30 bg-slate-950/85 px-3 py-2 text-xs text-amber-200 shadow-lg shadow-black/20">
          {error}
        </div>
      )}
      {lastHeard && listening && (
        <div className="max-w-[320px] rounded-2xl border border-white/15 bg-slate-950/70 px-3 py-2 text-xs text-slate-100 shadow-lg shadow-black/15">
          Đang nghe: <span className="text-slate-100 font-semibold">{lastHeard}</span>
        </div>
      )}

      {showCheatsheet && (
        <div className="w-[360px] max-w-[86vw] overflow-hidden rounded-3xl border border-white/10 bg-slate-950/90 backdrop-blur shadow-xl shadow-black/30">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <div className="text-sm font-semibold text-slate-100">Cách nói để đi đến mọi trang</div>
            <button
              type="button"
              onClick={() => setShowCheatsheet(false)}
              className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200 hover:bg-white/10"
            >
              Đóng
            </button>
          </div>
          <div className="max-h-[420px] overflow-y-auto px-4 py-3">
            <div className="text-xs text-slate-300">
              Bạn có thể nói tự nhiên. Ví dụ:{' '}
              <span className="text-slate-100 font-semibold">“mở …”</span>,{' '}
              <span className="text-slate-100 font-semibold">“đi đến …”</span> hoặc{' '}
              <span className="text-slate-100 font-semibold">“mở trang …”</span> (thuần tiếng Việt).
              <div className="mt-2 text-[11px] text-slate-400">
                Mẹo nhanh: bạn cũng có thể nói <span className="text-slate-200 font-semibold">“quay lại”</span> hoặc{' '}
                <span className="text-slate-200 font-semibold">“tải lại trang”</span>.
              </div>
            </div>
            <div className="mt-3 space-y-3">
              {cheatsheet.map((r) => (
                <div key={r.path} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-semibold text-slate-100">{r.title}</div>
                      {r.rawTitle && r.rawTitle !== r.title && (
                        <div className="mt-0.5 text-[11px] text-slate-400">{r.rawTitle}</div>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">{r.path}</div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {r.phrases.slice(0, 5).map((p) => (
                      <span
                        key={p}
                        className="rounded-full border border-white/10 bg-slate-950/40 px-2 py-0.5 text-[11px] text-slate-200"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={toggle}
        aria-pressed={listening}
        disabled={!supported}
        className={`${bubbleBaseClasses} ${listening ? 'ring-2 ring-cyan-400/50' : ''} disabled:opacity-60`}
        title={supported ? (listening ? 'Dừng điều hướng bằng giọng nói' : 'Điều hướng bằng giọng nói') : 'Trình duyệt không hỗ trợ'}
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-900 text-xs">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={listening ? 'animate-pulse' : ''}
          >
            <path
              d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19 11a7 7 0 0 1-14 0"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 18v3"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 21h8"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="hidden sm:inline text-sm">{listening ? 'Đang điều hướng…' : 'Voice'}</span>
      </button>
    </div>
  );
}

