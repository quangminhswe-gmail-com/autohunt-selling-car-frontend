'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { apiClient } from '@/app/utils/api';
import { showErrorNotification } from '@/utils/notifications';

type MessageRole = 'user' | 'assistant' | 'system';

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: null | (() => void);
  onend: null | (() => void);
  onerror: null | ((event: { error?: string; message?: string }) => void);
  onresult: null | ((event: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string; confidence?: number }> & { isFinal?: boolean }> }) => void);
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

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
}

interface AiChatIntent {
  budget?: number | null;
  carType?: string | null;
  passengers?: number | null;
  purpose?: string | null;
}

interface AiChatResponse {
  reply: string;
  intent?: AiChatIntent;
  recommendedVehicles?: PostingRecord[];
}

interface VehicleRecord {
  _id?: string;
  id?: string;
  make?: string;
  model?: string;
  yearOfManufacture?: number;
  type?: string;
  transmission?: string;
  fuelType?: string;
  mileage?: number;
  price?: number;
  images?: string[];
}

interface PostingRecord {
  _id: string;
  title?: string;
  price: number;
  status?: string;
  locationCity?: string;
  locationDistrict?: string;
  locationAddress?: string;
  vehicle?: VehicleRecord;
  vehicleId?: VehicleRecord;
}

interface AiVehicleSearchResponse {
  vehicles?: VehicleRecord[];
}

const CAR_PLACEHOLDER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450'><rect width='100%25' height='100%25' fill='%230f172a'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='30' font-family='Arial'>No car image</text></svg>";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const randomThinkingDelay = () => Math.floor(Math.random() * 2000) + 2000; // 2-4s

export default function AiConsultantPage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchingDb, setSearchingDb] = useState(false);
  const [postings, setPostings] = useState<PostingRecord[]>([]);
  const [recommendedPostings, setRecommendedPostings] = useState<PostingRecord[]>([]);
  const [dbError, setDbError] = useState<string | null>(null);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content:
        'Xin chào, mình là trợ lý AI tư vấn xe. Bạn chỉ cần mô tả nhu cầu, mình sẽ gợi ý các xe đang có trên website theo ngân sách và mục đích sử dụng.',
    },
    {
      id: 'welcome-2',
      role: 'system',
      content:
        'Mẹo: Bạn có thể thay đổi tiêu chí liên tục (ví dụ: “tăng ngân sách”, “đổi sang SUV”, “ưu tiên xe 7 chỗ”) — hệ thống sẽ cập nhật kết quả ngay.',
    },
  ]);
  const [latestIntent, setLatestIntent] = useState<AiChatIntent | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const lastVoiceSentRef = useRef<string>('');
  const loadingRef = useRef(false);
  const sendToAssistantRef = useRef<(message: string) => void>(() => undefined);
  const voiceBufferRef = useRef<string>('');
  const voiceSendTimerRef = useRef<number | null>(null);

  const appendMessage = (role: MessageRole, content: string) => {
    setMessages((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, role, content }]);
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 20);
  };

  const resetConversation = async () => {
    try {
      await apiClient('/ai-chat/reset', { method: 'POST' });
    } catch {
      // ignore reset failures, session may not exist yet
    }
  };

  useEffect(() => {
    void resetConversation();

    const loadPostings = async () => {
      try {
        const data = await apiClient<PostingRecord[]>('/postings');
        const active = (data || []).filter((posting) => posting.status?.toLowerCase() === 'active');
        setPostings(active);
      } catch (err) {
        const message = (err as Error).message || 'Khong the tai du lieu xe tu database.';
        setDbError(message);
      }
    };

    void loadPostings();
  }, []);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    const RecognitionCtor = getSpeechRecognitionCtor();
    setVoiceSupported(Boolean(RecognitionCtor));
    if (!RecognitionCtor) return;

    const recognition = new RecognitionCtor();
    recognition.lang = 'vi-VN';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceError(null);
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    recognition.onerror = (event) => {
      const error = String(event?.error || '').toLowerCase();
      if (error === 'not-allowed' || error === 'service-not-allowed') {
        setVoiceError('Bạn đã chặn quyền microphone. Hãy bật lại quyền mic trên trình duyệt.');
      } else if (error === 'no-speech') {
        setVoiceError('Mình chưa nghe rõ. Bạn thử nói lại nhé.');
      } else if (error === 'audio-capture') {
        setVoiceError('Không tìm thấy microphone. Bạn kiểm tra lại thiết bị ghi âm nhé.');
      } else {
        setVoiceError('Không thể nhận giọng nói ngay lúc này. Bạn thử lại sau.');
      }
    };
    recognition.onresult = (event) => {
      let interim = '';
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const transcript = String(result?.[0]?.transcript || '').trim();
        if (!transcript) continue;
        if (result.isFinal) finalText += `${transcript} `;
        else interim += `${transcript} `;
      }

      const finalChunk = finalText.trim();
      const interimChunk = interim.trim();

      if (finalChunk) {
        voiceBufferRef.current = `${voiceBufferRef.current} ${finalChunk}`.trim();
      }

      const composed = `${voiceBufferRef.current}${interimChunk ? ` ${interimChunk}` : ''}`.trim();
      if (composed) {
        setInput(composed);
        setTimeout(() => inputRef.current?.focus(), 0);
      }

      if (voiceSendTimerRef.current) {
        window.clearTimeout(voiceSendTimerRef.current);
      }

      voiceSendTimerRef.current = window.setTimeout(() => {
        voiceSendTimerRef.current = null;
        const message = voiceBufferRef.current.trim() || composed.trim();
        if (!message) return;
        if (loadingRef.current) return;
        if (message === lastVoiceSentRef.current) return;

        lastVoiceSentRef.current = message;
        voiceBufferRef.current = '';
        try {
          recognitionRef.current?.stop();
        } catch {
          // ignore
        }
        sendToAssistantRef.current(message);
      }, 2000);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        if (voiceSendTimerRef.current) {
          window.clearTimeout(voiceSendTimerRef.current);
          voiceSendTimerRef.current = null;
        }
        voiceBufferRef.current = '';
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
  }, []);

  const toggleVoiceInput = () => {
    if (loading) return;
    if (!voiceSupported || !recognitionRef.current) {
      setVoiceError('Trình duyệt của bạn chưa hỗ trợ nhập giọng nói. Hãy dùng Chrome/Edge.');
      return;
    }

    setVoiceError(null);
    try {
      if (isListening) {
        if (voiceSendTimerRef.current) {
          window.clearTimeout(voiceSendTimerRef.current);
          voiceSendTimerRef.current = null;
        }
        voiceBufferRef.current = '';
        recognitionRef.current.stop();
      } else {
        if (voiceSendTimerRef.current) {
          window.clearTimeout(voiceSendTimerRef.current);
          voiceSendTimerRef.current = null;
        }
        voiceBufferRef.current = '';
        recognitionRef.current.start();
      }
    } catch {
      setVoiceError('Không thể bật microphone. Bạn thử tải lại trang và cho phép mic nhé.');
      setIsListening(false);
    }
  };

  const normalizeVehicle = (posting: PostingRecord): VehicleRecord => {
    return posting.vehicle || posting.vehicleId || {};
  };

  const toVehicleId = (vehicle?: VehicleRecord) => String(vehicle?._id || vehicle?.id || '').trim();

  const createSearchQuery = (intent: AiChatIntent | undefined, latestMessage: string) => {
    const parts = [latestMessage.trim()];

    if (intent?.carType) parts.push(`loai ${intent.carType}`);
    if (intent?.budget) {
      const budgetMillion = Math.round(intent.budget / 1_000_000);
      parts.push(`tam ${budgetMillion} trieu`);
    }
    if (intent?.purpose === 'family') parts.push('xe gia dinh');
    if (intent?.purpose === 'business') parts.push('xe dich vu');
    if (intent?.purpose === 'personal') parts.push('xe di lam');
    if (intent?.passengers) parts.push(`${intent.passengers} nguoi`);

    return parts.filter(Boolean).join(', ');
  };

  const scorePosting = (posting: PostingRecord, intent: AiChatIntent | undefined) => {
    let score = 0;
    const vehicle = normalizeVehicle(posting);

    if (intent?.carType) {
      const wanted = intent.carType.toLowerCase();
      const typeMatch = String(vehicle.type || '').toLowerCase().includes(wanted);
      const titleMatch = String(posting.title || '').toLowerCase().includes(wanted);
      if (typeMatch || titleMatch) score += 40;
    }

    if (intent?.budget && posting.price > 0) {
      const distance = Math.abs(posting.price - intent.budget) / intent.budget;
      score += Math.max(0, 30 - distance * 30);
      if (posting.price <= intent.budget * 1.05) score += 10;
    }

    if (intent?.purpose === 'family') {
      const title = String(posting.title || '').toLowerCase();
      if (title.includes('7 cho') || title.includes('mpv') || title.includes('suv')) score += 20;
    }

    return score;
  };

  const getRecommendationsFromDatabase = async (message: string, intent?: AiChatIntent) => {
    if (!postings.length) {
      setRecommendedPostings([]);
      return;
    }

    const messageLower = message.toLowerCase();
    const knownMakes = Array.from(
      new Set(
        postings
          .map((p) => String(normalizeVehicle(p).make || '').trim().toLowerCase())
          .filter(Boolean)
      )
    );
    const mentionedMakes = knownMakes.filter((make) => make.length >= 3 && messageLower.includes(make));

    setSearchingDb(true);
    setDbError(null);
    try {
      const query = createSearchQuery(intent, message);
      const aiSearch = await apiClient<AiVehicleSearchResponse>('/public/vehicle/ai-search', {
        method: 'POST',
        body: { query },
      });
      const aiVehicles = aiSearch.vehicles || [];

      const matched = postings.filter((posting) => {
        const postingVehicle = normalizeVehicle(posting);
        const postingVehicleId = toVehicleId(postingVehicle);

        return aiVehicles.some((aiVehicle) => {
          const aiVehicleId = toVehicleId(aiVehicle);
          if (postingVehicleId && aiVehicleId && postingVehicleId === aiVehicleId) return true;

          const makeMatched =
            String(postingVehicle.make || '')
              .toLowerCase()
              .includes(String(aiVehicle.make || '').toLowerCase().trim()) ||
            String(aiVehicle.make || '')
              .toLowerCase()
              .includes(String(postingVehicle.make || '').toLowerCase().trim());
          const modelMatched =
            String(postingVehicle.model || '')
              .toLowerCase()
              .includes(String(aiVehicle.model || '').toLowerCase().trim()) ||
            String(aiVehicle.model || '')
              .toLowerCase()
              .includes(String(postingVehicle.model || '').toLowerCase().trim());
          const yearMatched =
            Number(postingVehicle.yearOfManufacture || 0) === Number(aiVehicle.yearOfManufacture || 0);
          return makeMatched && modelMatched && yearMatched;
        });
      });

      const makeFiltered =
        !matched.length && mentionedMakes.length
          ? postings.filter((posting) => {
              const vehicle = normalizeVehicle(posting);
              const make = String(vehicle.make || '').toLowerCase();
              const title = String(posting.title || '').toLowerCase();
              return mentionedMakes.some((mentioned) => make.includes(mentioned) || title.includes(mentioned));
            })
          : [];

      const basePool = matched.length ? matched : makeFiltered.length ? makeFiltered : postings;

      const scored = basePool
        .map((posting) => ({ posting, score: scorePosting(posting, intent) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .map((item) => item.posting);

      setRecommendedPostings(scored);
    } catch (err) {
      const message = (err as Error).message || 'Khong the truy van ket qua tu database.';
      setDbError(message);
      setRecommendedPostings([]);
    } finally {
      setSearchingDb(false);
    }
  };

  const sendToAssistant = async (rawMessage: string) => {
    const message = rawMessage.trim();
    if (!message || loading) return;

    appendMessage('user', message);
    setInput('');
    setDbError(null);
    setRecommendedPostings([]);
    setLoading(true);

    try {
      const response = await apiClient<AiChatResponse>('/ai-chat', {
        method: 'POST',
        body: { message },
      });
      await delay(randomThinkingDelay());

      appendMessage('assistant', response.reply || 'Minh chua co cau tra loi phu hop, ban thu doi goi y nhe.');
      setLatestIntent(response.intent);
      if (Array.isArray(response.recommendedVehicles) && response.recommendedVehicles.length > 0) {
        setRecommendedPostings(response.recommendedVehicles.slice(0, 8));
      } else {
        await getRecommendationsFromDatabase(message, response.intent);
      }
    } catch (err) {
      const errorMessage =
        (err as Error).message || 'Khong the ket noi AI Assistant. Vui long thu lai sau.';
      appendMessage('assistant', 'He thong dang ban, ban thu lai sau it phut nhe.');
      showErrorNotification('AI Assistant Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  sendToAssistantRef.current = (message: string) => {
    void sendToAssistant(message);
  };

  const intentSummary = useMemo(() => {
    if (!latestIntent) return 'Chưa có dữ liệu ưu tiên từ cuộc hội thoại.';

    const budgetLabel = latestIntent.budget
      ? `${latestIntent.budget.toLocaleString('vi-VN')} VND`
      : 'Chưa rõ';
    const carTypeLabel = latestIntent.carType || 'Chưa rõ';
    const passengersLabel = latestIntent.passengers ? `${latestIntent.passengers} người` : 'Chưa rõ';
    const purposeLabel = latestIntent.purpose || 'Chưa rõ';

    return `Ngân sách: ${budgetLabel} | Dòng xe: ${carTypeLabel} | Số chỗ: ${passengersLabel} | Mục đích: ${purposeLabel}`;
  }, [latestIntent]);

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute top-1/4 -right-32 h-[520px] w-[520px] rounded-full bg-indigo-500/18 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.35] [background:radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.22)_1px,transparent_0)] [background-size:28px_28px]" />
      </div>

      <div className="relative z-10">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
                AI Car Consultant • Tư vấn dựa trên dữ liệu thật
              </p>
              <h1 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight">
                Tư vấn mua xe nhanh, rõ ràng, dựa trên xe đang có trên website
              </h1>
              <p className="mt-2 max-w-3xl text-sm md:text-base text-slate-300">
                Hãy nói nhu cầu (ngân sách, kiểu xe, mục đích). AI sẽ hỏi đúng phần còn thiếu và đề xuất danh sách xe phù hợp.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/vehicles"
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10 transition"
              >
                Xem tất cả xe
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await resetConversation();
                  setMessages((prev) => prev.slice(0, 2));
                  setLatestIntent(undefined);
                  setInput('');
                  setDbError(null);
                  setRecommendedPostings([]);
                }}
                className="rounded-xl border border-cyan-300/25 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-100 hover:bg-cyan-500/15 transition"
              >
                Tạo cuộc tư vấn mới
              </button>
            </div>
          </div>

          <section className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.04)] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-cyan-400/30 via-indigo-400/20 to-transparent border border-white/10 grid place-items-center">
                    <span className="text-xs font-semibold text-slate-100">AI</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-100">Tư vấn viên</div>
                    <div className="text-xs text-slate-400">
                      {loading ? 'Đang suy nghĩ…' : 'Sẵn sàng tư vấn theo dữ liệu xe đang có trên website'}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-400 hidden sm:block">
                  {recommendedPostings.length > 0 ? `${recommendedPostings.length} xe gợi ý` : 'Chưa có gợi ý'}
                </div>
              </div>

              <div ref={scrollRef} className="h-[520px] overflow-y-auto px-5 py-5 space-y-4">
                {messages.map((message) => {
                  const isUser = message.role === 'user';
                  const isSystem = message.role === 'system';
                  return (
                    <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[92%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                          isUser
                            ? 'bg-gradient-to-r from-cyan-500/25 to-indigo-500/20 border border-cyan-300/25'
                            : isSystem
                              ? 'bg-amber-400/10 border border-amber-300/25 text-amber-100'
                              : 'bg-white/7 border border-white/10 text-slate-100'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl border border-white/10 bg-white/7 px-4 py-3 text-sm text-slate-200">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-cyan-300 animate-pulse" />
                        Đang phân tích nhu cầu…
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-5 pb-5">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void sendToAssistant(input);
                  }}
                  className="mt-4 flex flex-col gap-3 md:flex-row"
                >
                  <div className="flex-1 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 focus-within:ring-2 focus-within:ring-cyan-400/60">
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      disabled={loading}
                      placeholder="Ví dụ: SUV gia đình 7 chỗ, tầm 1 tỷ, ưu tiên bền và an toàn"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
                    />
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">ngân sách</span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">kiểu xe</span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">mục đích</span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">số chỗ</span>
                    </div>
                    {voiceError && (
                      <div className="mt-2 text-[11px] text-amber-200/90">
                        {voiceError}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 md:flex-col md:justify-stretch">
                    <button
                      type="button"
                      onClick={toggleVoiceInput}
                      disabled={loading || !voiceSupported}
                      aria-pressed={isListening}
                      title={voiceSupported ? (isListening ? 'Dừng ghi âm' : 'Nhập bằng giọng nói') : 'Trình duyệt không hỗ trợ'}
                      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition disabled:opacity-60 ${
                        isListening
                          ? 'border-rose-300/30 bg-rose-500/15 text-rose-100'
                          : 'border-white/15 bg-white/5 text-slate-200 hover:bg-white/10'
                      }`}
                    >
                      <span className="inline-flex items-center justify-center gap-2">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className={isListening ? 'animate-pulse' : ''}
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
                        {isListening ? 'Đang nghe…' : 'Nói'}
                      </span>
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white hover:from-cyan-400 hover:to-indigo-400 disabled:opacity-60 shadow-lg shadow-cyan-500/20"
                    >
                      {loading ? 'Đang gửi…' : 'Gửi tư vấn'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <aside className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.04)] overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10">
                <div className="text-sm font-semibold text-slate-100">Tóm tắt nhu cầu</div>
                <div className="text-xs text-slate-400 mt-1">Cập nhật theo từng lần bạn thay đổi tiêu chí</div>
              </div>
              <div className="p-5">
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-200">
                  {intentSummary}
                </div>

                {/* <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-500/10 p-4">
                  <div className="text-sm font-semibold text-cyan-100">Mẹo nhanh</div>
                  <ul className="mt-2 space-y-2 text-sm text-cyan-50/90">
                    <li className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-200" />
                      Thử thay đổi ngân sách để xem danh sách xe cập nhật ngay.
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-200" />
                      Nói rõ mục đích: đi làm, gia đình, dịch vụ.
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-200" />
                      Nếu cần, hãy nhắn “so sánh 2 mẫu” để chốt nhanh.
                    </li>
                  </ul>
                </div> */}

                {/* <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs text-slate-400">
                    Ghi chú: Tên xe trong câu trả lời được lấy từ dữ liệu xe đang có trên website (database), không tự đặt tên.
                  </div>
                </div> */}
              </div>
            </aside>
          </section>

          <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-semibold tracking-tight">Xe phù hợp đang có trên website</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Kết quả được ưu tiên theo độ gần ngân sách và tiêu chí bạn vừa cập nhật.
                </p>
              </div>
              {searchingDb && (
                <span className="text-xs text-cyan-200 animate-pulse rounded-full border border-cyan-300/20 bg-cyan-500/10 px-3 py-1">
                  Đang đối chiếu…
                </span>
              )}
            </div>

            {dbError && (
              <div className="mt-4 rounded-2xl border border-red-300/25 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                {dbError}
              </div>
            )}

            {!searchingDb && !dbError && recommendedPostings.length === 0 && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 p-5">
                <div className="text-sm text-slate-200 font-semibold">Xin lỗi, hiện chưa có xe phù hợp</div>
                <div className="mt-1 text-sm text-slate-400">
                  Bạn có thể điều chỉnh lại ngân sách/kiểu xe, hoặc chuyển sang <span className="text-slate-200 font-medium">AI Finder Alerts</span> để lưu tiêu chí và nhận thông báo khi có xe phù hợp được đăng.
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Link
                    href="/vehicles/ai-finder"
                    className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition"
                  >
                    Đi đến AI Finder Alerts
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      const suggestion = 'SUV gia đình 7 chỗ tầm 1 tỷ';
                      void sendToAssistant(suggestion);
                    }}
                    className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-white/10 transition"
                  >
                    Thử một gợi ý mẫu
                  </button>
                </div>
              </div>
            )}

            {recommendedPostings.length > 0 && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {recommendedPostings.map((posting) => {
                  const vehicle = normalizeVehicle(posting);
                  const image = vehicle.images?.[0] || CAR_PLACEHOLDER;
                  const title =
                    posting.title || `${vehicle.make || ''} ${vehicle.model || ''}`.trim() || 'Vehicle';
                  const location =
                    posting.locationCity || posting.locationDistrict || posting.locationAddress || 'Đang cập nhật vị trí';

                  return (
                    <article
                      key={posting._id}
                      className="group overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/60 via-slate-900/35 to-indigo-950/30 shadow-xl shadow-black/30 transition hover:-translate-y-0.5 hover:border-white/20"
                    >
                      <Link href={`/vehicle/${posting._id}`} className="block">
                        <div className="relative h-44 w-full overflow-hidden">
                          <Image
                            src={image}
                            alt={title}
                            fill
                            className="object-cover transition duration-500 group-hover:scale-[1.04]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />
                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                            <span className="rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[11px] text-slate-100">
                              {vehicle.type || 'N/A'}
                            </span>
                            <span className="rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[11px] text-slate-100">
                              {vehicle.yearOfManufacture || 'N/A'}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="line-clamp-2 text-sm font-semibold text-slate-100">{title}</div>
                          <div className="mt-2 flex items-end justify-between gap-3">
                            <div className="text-cyan-200 font-bold">
                              {Number(posting.price || 0).toLocaleString('vi-VN')} VND
                            </div>
                            <div className="text-[11px] text-slate-400">{vehicle.transmission || 'N/A'}</div>
                          </div>
                          <div className="mt-2 text-xs text-slate-400 line-clamp-1">{location}</div>
                        </div>
                      </Link>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </main>
        <Footer />
      </div>
    </div>
  );
}
