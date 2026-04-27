'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { VOICE_ROUTES } from '@/lib/voiceRoutes.generated';

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

export default function VoiceNavigatorBubble() {
  const router = useRouter();
  const pathname = usePathname();
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastHeard, setLastHeard] = useState<string>('');
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const sendTimerRef = useRef<number | null>(null);
  const bufferRef = useRef<string>('');

  const bubbleBaseClasses =
    'flex items-center gap-2 rounded-full bg-slate-900/70 backdrop-blur border border-white/10 px-3 py-2.5 text-white font-semibold shadow-lg transition-transform duration-200 hover:-translate-y-0.5 hover:bg-slate-900/85';

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
        phrases: ['danh sach xe', 'xem xe', 'trang xe'],
        keywords: ['xe', 'vehicles', 'car', 'cars'],
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

  const runCommand = (raw: string) => {
    const cmd = normalizeCommand(raw);
    if (!cmd) return false;

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
    };

    recognition.onend = () => {
      setListening(false);
      bufferRef.current = '';
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

        const ok = runCommand(message);
        bufferRef.current = '';
        if (!ok) setError('Không nhận ra lệnh. Thử: "về trang chủ", "mở profile", "quay lại".');

        try {
          recognition.stop();
        } catch {
          // ignore
        }
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
      if (listening) recognitionRef.current.stop();
      else recognitionRef.current.start();
    } catch {
      setError('Không thể bật microphone. Hãy tải lại trang và cho phép mic.');
      setListening(false);
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

