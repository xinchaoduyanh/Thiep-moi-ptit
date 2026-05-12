import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import ptitImg from "@/assets/ptit.png";
import giftImg from "@/assets/gift.jpg";

type Search = {
  name?: string;
  wish?: string;
  fb?: string;
  mapUrl?: string;
};

const DEFAULT_MAP =
  "https://www.google.com/maps/place/H%E1%BB%8Dc+vi%E1%BB%87n+C%C3%B4ng+ngh%E1%BB%87+B%C6%B0u+ch%C3%ADnh+vi%E1%BB%85n+th%C3%B4ng/@20.980913,105.7848416,17z";
const MAP_EMBED =
  "https://www.google.com/maps?q=20.980913,105.7874165&z=17&output=embed";

export const Route = createFileRoute("/invitation")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    name: typeof s.name === "string" ? s.name : undefined,
    wish: typeof s.wish === "string" ? s.wish : undefined,
    fb: typeof s.fb === "string" ? s.fb : undefined,
    mapUrl: typeof s.mapUrl === "string" ? s.mapUrl : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Thiệp mời Lễ tốt nghiệp PTIT — 23.05" },
      {
        name: "description",
        content:
          "Một lá thư tay mời bạn tới dự lễ tốt nghiệp tại Học viện Công nghệ Bưu chính Viễn thông.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@500;600;700&family=Patrick+Hand&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Be+Vietnam+Pro:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  component: InvitationPage,
});

function Floating({
  children,
  className,
  delay = 0,
  duration = 6,
  x = 0,
  rotate = 8,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  x?: number;
  rotate?: number;
}) {
  return (
    <motion.div
      animate={{ y: [0, -14, 0], x: [0, x, 0], rotate: [-rotate, rotate, -rotate] }}
      transition={{ duration, repeat: Infinity, delay, ease: "easeInOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Twinkle sparkle
function Sparkle({ className, delay = 0, size = 10, color = "#c75a7a" }: { className?: string; delay?: number; size?: number; color?: string }) {
  return (
    <motion.svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      animate={{ scale: [0, 1, 0], rotate: [0, 90, 180], opacity: [0, 1, 0] }}
      transition={{ duration: 2.4, repeat: Infinity, delay, ease: "easeInOut" }}
    >
      <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" fill={color} />
    </motion.svg>
  );
}

// Drifting petal/confetti
function Drifter({
  emoji,
  left,
  delay = 0,
  duration = 14,
  size = 20,
}: { emoji: string; left: string; delay?: number; duration?: number; size?: number }) {
  return (
    <motion.div
      className="absolute top-[-40px] pointer-events-none"
      style={{ left, fontSize: size }}
      initial={{ y: -40, x: 0, rotate: 0, opacity: 0 }}
      animate={{ y: "110vh", x: [0, 30, -20, 25, 0], rotate: 360, opacity: [0, 1, 1, 0.7, 0] }}
      transition={{ duration, repeat: Infinity, delay, ease: "easeInOut" }}
    >
      {emoji}
    </motion.div>
  );
}

// Decorative SVG layer per section: dotted grid + corner doodles + sparkles
function SectionDecor({ tone = "rose", doodles = [] as string[] }: { tone?: "rose" | "violet" | "amber" | "gold" | "pink" | "mint"; doodles?: string[] }) {
  const palette: Record<string, { dot: string; ink: string; spark: string }> = {
    rose:   { dot: "rgba(199,90,122,0.18)", ink: "rgba(154,59,42,0.35)", spark: "#c75a7a" },
    violet: { dot: "rgba(91,58,140,0.18)",  ink: "rgba(91,58,140,0.40)", spark: "#7a5bd0" },
    amber:  { dot: "rgba(168,90,26,0.18)",  ink: "rgba(168,90,26,0.40)", spark: "#d68b3c" },
    gold:   { dot: "rgba(244,200,120,0.20)", ink: "rgba(244,200,120,0.55)", spark: "#f4c878" },
    pink:   { dot: "rgba(199,90,122,0.20)", ink: "rgba(154,59,110,0.40)", spark: "#e08bb0" },
    mint:   { dot: "rgba(80,140,110,0.18)", ink: "rgba(80,140,110,0.40)", spark: "#7ab895" },
  };
  const c = palette[tone];
  return (
    <>
      {/* dotted grid wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${c.dot} 1px, transparent 1.4px)`,
          backgroundSize: "22px 22px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 85%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 85%)",
        }}
      />
      {/* hand-drawn corners */}
      <svg className="absolute top-6 left-6 w-28 h-28 pointer-events-none" viewBox="0 0 100 100" fill="none" stroke={c.ink} strokeWidth="1.2" strokeLinecap="round">
        <path d="M5,30 Q5,5 30,5" strokeDasharray="3 4" />
        <path d="M12,40 Q12,12 40,12" />
        <circle cx="20" cy="20" r="2" fill={c.ink} stroke="none" />
      </svg>
      <svg className="absolute bottom-6 right-6 w-28 h-28 pointer-events-none" viewBox="0 0 100 100" fill="none" stroke={c.ink} strokeWidth="1.2" strokeLinecap="round">
        <path d="M95,70 Q95,95 70,95" strokeDasharray="3 4" />
        <path d="M88,60 Q88,88 60,88" />
        <circle cx="80" cy="80" r="2" fill={c.ink} stroke="none" />
      </svg>
      {/* squiggly side lines */}
      <svg className="absolute left-4 top-1/4 w-6 h-1/2 pointer-events-none" viewBox="0 0 20 200" fill="none" stroke={c.ink} strokeWidth="1.3" strokeLinecap="round">
        <path d="M10,0 Q0,25 10,50 Q20,75 10,100 Q0,125 10,150 Q20,175 10,200" />
      </svg>
      <svg className="absolute right-4 top-1/4 w-6 h-1/2 pointer-events-none" viewBox="0 0 20 200" fill="none" stroke={c.ink} strokeWidth="1.3" strokeLinecap="round">
        <path d="M10,0 Q20,25 10,50 Q0,75 10,100 Q20,125 10,150 Q0,175 10,200" />
      </svg>
      {/* sparkles scattered */}
      <Sparkle className="absolute top-[12%] left-[18%]" size={14} color={c.spark} />
      <Sparkle className="absolute top-[22%] right-[22%]" size={10} color={c.spark} delay={0.6} />
      <Sparkle className="absolute bottom-[18%] left-[25%]" size={12} color={c.spark} delay={1.1} />
      <Sparkle className="absolute bottom-[28%] right-[18%]" size={16} color={c.spark} delay={0.3} />
      <Sparkle className="absolute top-[45%] left-[8%]" size={9} color={c.spark} delay={1.6} />
      <Sparkle className="absolute top-[55%] right-[10%]" size={11} color={c.spark} delay={0.9} />
      {/* extra emoji doodles */}
      {doodles.map((d, i) => (
        <Floating
          key={i}
          className="absolute text-2xl opacity-70"
          delay={i * 0.4}
          duration={6 + (i % 4)}
          rotate={12}
        >
          <span style={{ position: "absolute", left: `${10 + ((i * 73) % 80)}%`, top: `${15 + ((i * 41) % 70)}%` }}>{d}</span>
        </Floating>
      ))}
    </>
  );
}

// Reveal sentences one-by-one on click. Locks scroll until done.
function SequentialReveal({
  sentences,
  className = "",
  textClass,
  hint = "chạm để đọc tiếp ✿",
  doneHint = "↓ lướt tiếp nhé ↓",
  onDone,
}: {
  sentences: string[];
  className?: string;
  textClass: string;
  hint?: string;
  doneHint?: string;
  onDone?: () => void;
}) {
  const [count, setCount] = useState(0);
  const done = count >= sentences.length;

  return (
    <div
      onClick={() => {
        if (done) return;
        setCount((c) => {
          const next = Math.min(sentences.length, c + 1);
          if (next === sentences.length) onDone?.();
          return next;
        });
      }}
      className={`cursor-pointer select-none ${className}`}
    >
      <div className="space-y-5 min-h-[220px]">
        <AnimatePresence>
          {sentences.slice(0, count).map((s, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 25, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.9 }}
              className={textClass}
            >
              {s}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.8, repeat: Infinity }}
        className="mt-8 text-center text-sm tracking-[0.3em] uppercase"
        style={{ fontFamily: '"DM Mono", monospace' }}
      >
        {done ? doneHint : hint}
      </motion.p>
    </div>
  );
}

function InvitationPage() {
  const { name, wish, fb, mapUrl } = Route.useSearch();
  const guestName = name?.trim() || "bạn thân mến";
  const wishText =
    wish?.trim() ||
    "Cảm ơn cậu đã đi cùng mình suốt quãng đường vừa qua. Có những hôm mệt nhoài, chỉ một tin nhắn của cậu cũng đủ kéo mình dậy. Ngày 23 tới đây, mình muốn cậu là một phần của khung hình đẹp nhất.";
  const fbUrl = fb || "https://facebook.com/";
  const locationUrl = mapUrl || DEFAULT_MAP;

  const wishSentences = useMemo(
    () => wishText.split(/(?<=[.!?…])\s+/).filter(Boolean),
    [wishText],
  );
  const giftLines = [
    "Có một thứ mình đã giữ kín suốt mấy hôm nay…",
    "Không to tát đâu — nhỏ thôi, nhưng mình chọn riêng cho cậu.",
    "Đến nha, mình sẽ trao tận tay ♡",
  ];

  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Scroll-lock logic
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [giftDone, setGiftDone] = useState(false);
  const [wishDone, setWishDone] = useState(false);

  const hand = { fontFamily: '"Dancing Script", "Patrick Hand", cursive' };
  const serif = { fontFamily: '"Cormorant Garamond", Georgia, serif' };
  const mono = { fontFamily: '"DM Mono", monospace' };
  const body = { fontFamily: '"Be Vietnam Pro", system-ui, sans-serif' };

  // Section palettes (each section different color)
  const sections = {
    hero: "linear-gradient(160deg,#fff1e6 0%,#ffe4ec 50%,#fde2cf 100%)",
    place: "linear-gradient(160deg,#e7f0ff 0%,#f4ecff 60%,#ffe9f1 100%)",
    notes: "linear-gradient(160deg,#fff8d8 0%,#ffe6c7 60%,#ffd6dc 100%)",
    gift: "linear-gradient(160deg,#2a1a2e 0%,#3a1f33 50%,#1f1424 100%)",
    wish: "linear-gradient(160deg,#fde6f0 0%,#f3e1ff 50%,#e1f0ff 100%)",
    form: "linear-gradient(160deg,#eaf7ee 0%,#fff4e0 60%,#ffe4ec 100%)",
  };

  // Lock scroll past gift / wish sections until clicked through
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent | TouchEvent) => {
      const giftEl = document.getElementById("sec-gift");
      const wishEl = document.getElementById("sec-wish");
      if (!giftEl || !wishEl) return;
      const top = el.scrollTop;
      const dy = "deltaY" in e ? (e as WheelEvent).deltaY : 1;
      if (dy <= 0) return;
      if (!giftDone && top >= giftEl.offsetTop - 5 && top < giftEl.offsetTop + giftEl.offsetHeight - 50) {
        e.preventDefault();
      }
      if (!wishDone && top >= wishEl.offsetTop - 5 && top < wishEl.offsetTop + wishEl.offsetHeight - 50) {
        e.preventDefault();
      }
    };
    el.addEventListener("wheel", handler, { passive: false });
    el.addEventListener("touchmove", handler, { passive: false });
    return () => {
      el.removeEventListener("wheel", handler);
      el.removeEventListener("touchmove", handler);
    };
  }, [giftDone, wishDone]);

  const sectionBase =
    "snap-start snap-always relative min-h-screen flex items-center px-5 sm:px-8 py-16 overflow-hidden";

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-scroll overflow-x-hidden text-[#3a2a1f] snap-y snap-mandatory scroll-smooth"
      style={{ ...body, scrollSnapType: "y mandatory" }}
    >
      {/* global drifting petals/sparkles across whole page */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <Drifter emoji="🌸" left="6%" delay={0} duration={16} size={18} />
        <Drifter emoji="✿" left="22%" delay={3} duration={20} size={14} />
        <Drifter emoji="🌷" left="38%" delay={6} duration={18} size={16} />
        <Drifter emoji="✦" left="54%" delay={1.5} duration={22} size={12} />
        <Drifter emoji="🦋" left="70%" delay={4.2} duration={19} size={20} />
        <Drifter emoji="❀" left="86%" delay={2.8} duration={17} size={15} />
        <Drifter emoji="·" left="14%" delay={7} duration={24} size={28} />
        <Drifter emoji="✿" left="62%" delay={9} duration={21} size={13} />
      </div>

      {/* ===== HERO ===== */}
      <section className={sectionBase} style={{ background: sections.hero }}>
        <SectionDecor tone="rose" />
        <Floating className="absolute top-10 left-6 text-4xl" duration={7}>🎓</Floating>
        <Floating className="absolute top-20 right-10 text-3xl" duration={8} delay={1}>✏️</Floating>
        <Floating className="absolute bottom-24 left-10 text-3xl" duration={6} delay={0.5}>📚</Floating>
        <Floating className="absolute bottom-16 right-12 text-3xl" duration={9} delay={1.5}>🌸</Floating>

        <motion.div
          initial={{ opacity: 0, y: 30, rotate: -1.5 }}
          animate={{ opacity: 1, y: 0, rotate: -0.6 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative mx-auto max-w-xl bg-[#fbf5e8] px-7 sm:px-12 py-12 sm:py-16"
          style={{
            boxShadow: "0 30px 60px -30px rgba(180,80,100,0.35)",
            backgroundImage:
              "repeating-linear-gradient(transparent 0 31px, rgba(180,80,100,0.08) 31px 32px)",
          }}
        >
          <div className="absolute left-1/2 -translate-x-1/2 -top-3 w-28 h-6 bg-pink-200/80 rotate-[-3deg]" />
          <p className="text-center uppercase text-[10px] tracking-[0.5em] text-[#9a3b2a]" style={mono}>
            Hà Nội · 23 . 05
          </p>
          <p className="mt-8 text-3xl sm:text-4xl text-[#9a3b2a]" style={hand}>Gửi {guestName},</p>
          <p className="mt-5 leading-[1.9] text-base sm:text-lg" style={serif}>
            Có một ngày, mình đã chờ đợi suốt bốn năm. Và mình muốn — nếu có thể —
            ngày ấy có{" "}
            <span className="italic underline decoration-dotted underline-offset-4 text-[#c75a7a]">{guestName}</span> ở đó.
          </p>
          <p className="mt-5 leading-[1.9] text-base sm:text-lg" style={serif}>
            Mình xin phép trân trọng mời bạn tới dự
            <span className="block mt-3 text-3xl sm:text-4xl text-[#9a3b2a]" style={hand}>
              Lễ Tốt Nghiệp của mình tại PTIT
            </span>
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <span className="h-px flex-1 bg-[#9a3b2a]/30" />
            <span className="text-xs tracking-[0.4em] text-[#9a3b2a]" style={mono}>23 / 05</span>
            <span className="h-px flex-1 bg-[#9a3b2a]/30" />
          </div>

          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: -8 }}
            transition={{ delay: 0.6, type: "spring" }}
            className="absolute -right-4 -bottom-6 sm:-right-8 sm:-bottom-8 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-[#fbe7d3]"
            style={{
              background: "radial-gradient(circle at 35% 30%, #d96a8a, #7a2418 75%)",
              boxShadow: "0 8px 20px -6px rgba(180,60,90,0.5)",
              fontFamily: '"Dancing Script", cursive',
            }}
          >
            <span className="text-3xl">PTIT</span>
          </motion.div>
        </motion.div>
      </section>

      {/* ===== PLACE ===== */}
      <section className={sectionBase} style={{ background: sections.place }}>
        <SectionDecor tone="violet" />
        <Floating className="absolute top-12 right-16 text-3xl" duration={8}>🎒</Floating>
        <Floating className="absolute bottom-12 left-12 text-3xl" duration={7} delay={0.7}>🌷</Floating>

        <div className="max-w-5xl mx-auto w-full">
          <div className="text-center mb-10">
            <p className="text-[10px] uppercase tracking-[0.45em] text-[#5b3a8c]" style={mono}>Địa điểm</p>
            <h2 className="mt-2 text-4xl sm:text-5xl text-[#5b3a8c]" style={hand}>
              Học viện Công nghệ Bưu chính Viễn thông
            </h2>
            <p className="mt-2 italic text-[#4a3a6b]" style={serif}>
              122 Hoàng Quốc Việt · Cầu Giấy · Hà Nội
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8 items-center">
            <motion.figure
              initial={{ opacity: 0, rotate: -6, y: 30 }}
              whileInView={{ opacity: 1, rotate: -3, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="bg-white p-3 pb-12 shadow-[0_30px_60px_-30px_rgba(80,60,160,0.4)] relative"
            >
              <img src={ptitImg} alt="PTIT" className="w-full h-64 object-cover" />
              <figcaption className="absolute bottom-2 left-0 right-0 text-center text-2xl text-[#5a3a25]" style={hand}>
                ngôi trường của mình ✿
              </figcaption>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-pink-200/80 rotate-[2deg]" />
            </motion.figure>

            <motion.figure
              initial={{ opacity: 0, rotate: 6, y: 30 }}
              whileInView={{ opacity: 1, rotate: 2, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.15 }}
              className="bg-white p-3 pb-12 shadow-[0_30px_60px_-30px_rgba(80,60,160,0.4)] relative"
            >
              <div className="w-full h-64 overflow-hidden bg-amber-50">
                <iframe
                  title="Bản đồ PTIT"
                  src={MAP_EMBED}
                  className="w-full h-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <figcaption className="absolute bottom-2 left-0 right-0 text-center text-2xl text-[#5a3a25]" style={hand}>
                ✦ ghé thăm mình nhé ✦
              </figcaption>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-pink-200/80 rotate-[-3deg]" />
            </motion.figure>
          </div>

          <div className="text-center mt-8">
            <a
              href={locationUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block px-6 py-2 border border-[#5b3a8c] text-[#5b3a8c] hover:bg-[#5b3a8c] hover:text-white transition tracking-wider text-sm"
              style={mono}
            >
              ↗ MỞ GOOGLE MAPS
            </a>
          </div>
        </div>
      </section>

      {/* ===== NOTES ===== */}
      <section className={sectionBase} style={{ background: sections.notes }}>
        <SectionDecor tone="amber" />
        <Floating className="absolute top-16 left-12 text-3xl" duration={7}>📝</Floating>
        <Floating className="absolute bottom-20 right-14 text-3xl" duration={8} delay={1}>🎀</Floating>

        <div className="max-w-xl mx-auto w-full">
          <p className="text-[10px] uppercase tracking-[0.45em] text-[#a85a1a] text-center" style={mono}>
            P.S — vài điều nhỏ
          </p>
          <h2 className="mt-3 text-center text-5xl text-[#a85a1a]" style={hand}>đọc giùm mình nhé ~</h2>

          <ul className="mt-10 space-y-6 text-lg" style={serif}>
            {[
              "Đừng mang hoa hay quà cồng kềnh nha — mình chỉ cần cậu thôi.",
              "Cố đến đúng giờ giùm mình, để kịp khoảnh khắc tung mũ ✿",
              <>
                Có gì cứ nhắn mình qua{" "}
                <a href={fbUrl} target="_blank" rel="noreferrer" className="text-[#a85a1a] underline decoration-wavy underline-offset-4">
                  Facebook
                </a>{" "}nha.
              </>,
            ].map((t, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex gap-4"
              >
                <span className="text-3xl text-[#a85a1a] leading-none mt-1" style={hand}>✓</span>
                <span className="leading-relaxed">{t}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===== MYSTERY GIFT (locked) ===== */}
      <section id="sec-gift" className={sectionBase} style={{ background: sections.gift, color: "#f5e8d6" }}>
        <SectionDecor tone="gold" />
        <Floating className="absolute top-16 right-16 text-4xl" duration={7}>✨</Floating>
        <Floating className="absolute bottom-20 left-14 text-3xl" duration={8} delay={0.6}>💝</Floating>
        <Floating className="absolute top-1/3 left-10 text-2xl" duration={6} delay={1.2}>⭐</Floating>

        <div className="max-w-4xl mx-auto w-full grid sm:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -4 }}
            whileInView={{ opacity: 1, scale: 1, rotate: -2 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="relative bg-[#1a0f1d] p-3 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)]">
              <img src={giftImg} alt="món quà" className="w-full h-72 object-cover" />
              <div className="absolute inset-3 ring-1 ring-amber-300/30 pointer-events-none" />
            </div>
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              className="absolute -top-5 -right-5 text-3xl text-amber-300"
            >✦</motion.div>
          </motion.div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.45em] text-amber-300/80" style={mono}>
              Bí mật nhỏ
            </p>
            <h2 className="mt-3 text-4xl sm:text-5xl text-amber-200 leading-tight" style={hand}>
              Một món quà <em>đang chờ {guestName}.</em>
            </h2>
            <div className="mt-6">
              <SequentialReveal
                sentences={giftLines}
                textClass="text-2xl sm:text-3xl leading-[1.5] text-[#fdf3df]"
                hint="✦ chạm để mở từng dòng ✦"
                doneHint="↓ ổn rồi, lướt tiếp ↓"
                onDone={() => setGiftDone(true)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== PERSONAL WISH (locked) ===== */}
      <section id="sec-wish" className={sectionBase} style={{ background: sections.wish }}>
        <SectionDecor tone="pink" />
        <Floating className="absolute top-10 left-6 text-3xl text-[#c75a7a]/60">✿</Floating>
        <Floating className="absolute bottom-12 right-8 text-4xl text-[#c75a7a]/60" delay={1}>❀</Floating>
        <Floating className="absolute top-32 right-10 text-2xl" delay={0.5}>🌸</Floating>
        <Floating className="absolute bottom-32 left-10 text-2xl" delay={1.5}>🦋</Floating>

        <div className="max-w-2xl mx-auto text-center w-full">
          <p className="text-[10px] uppercase tracking-[0.45em] text-[#9a3b6e]" style={mono}>
            Riêng cho {guestName}
          </p>
          <SequentialReveal
            sentences={wishSentences}
            className="mt-10"
            textClass="text-3xl sm:text-4xl leading-[1.5] text-[#3a2a1f]"
            hint="♡ chạm để đọc tiếp ♡"
            doneHint="↓ một điều cuối ↓"
            onDone={() => setWishDone(true)}
          />
        </div>
      </section>

      {/* ===== FORM + THANKS ===== */}
      <section className={sectionBase} style={{ background: sections.form }}>
        <SectionDecor tone="mint" />
        <Floating className="absolute top-12 right-12 text-3xl" duration={7}>💌</Floating>
        <Floating className="absolute bottom-20 left-12 text-3xl" duration={8} delay={0.8}>🎓</Floating>

        <div className="max-w-lg mx-auto w-full">
          <div
            className="relative bg-[#fbf5e8] p-8 sm:p-10"
            style={{
              boxShadow: "0 25px 50px -25px rgba(180,80,100,0.3)",
              backgroundImage:
                "repeating-linear-gradient(transparent 0 29px, rgba(180,80,100,0.08) 29px 30px)",
            }}
          >
            <div className="absolute -top-3 left-10 w-16 h-5 bg-pink-200/80 rotate-[-4deg]" />
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#9a3b2a]" style={mono}>
              gửi mình một dòng
            </p>
            <h2 className="mt-3 text-4xl text-[#c75a7a]" style={hand}>
              ghi lại lời nhắn nhủ tới mình nha ♡
            </h2>

            {submitted ? (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 text-3xl text-[#c75a7a]"
                style={hand}
              >
                cảm ơn cậu — mình đọc rồi nha ♡
              </motion.p>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (message.trim()) setSubmitted(true);
                }}
                className="mt-6 space-y-5"
              >
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="viết gì đó cho mình..."
                  className="w-full bg-transparent border-b-2 border-dashed border-[#c75a7a]/40 focus:border-[#c75a7a] outline-none p-2 text-2xl resize-none placeholder:text-[#c75a7a]/40"
                  style={hand}
                />
                {/* Note-styled send button */}
                <div className="flex justify-end">
                  <motion.button
                    type="submit"
                    whileHover={{ rotate: -2, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="relative bg-[#fff7c2] px-6 py-3 text-[#9a3b2a] text-2xl shadow-[2px_4px_0_rgba(180,80,100,0.25)]"
                    style={{
                      ...hand,
                      backgroundImage:
                        "repeating-linear-gradient(transparent 0 18px, rgba(180,80,100,0.12) 18px 19px)",
                      transform: "rotate(-3deg)",
                    }}
                  >
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3 bg-pink-300/80 rotate-[-4deg]" />
                    gửi cậu nha →
                  </motion.button>
                </div>
              </form>
            )}
          </div>

          <div className="text-center mt-12">
            <div className="text-3xl text-[#c75a7a]" style={hand}>— cảm ơn {guestName} —</div>
            <p className="mt-3 italic text-[#6b4a30] leading-relaxed text-base" style={serif}>
              Sự xuất hiện của cậu trong ngày hôm ấy<br />
              là điều tuyệt vời nhất với mình.
            </p>
            <p className="mt-8 text-[10px] uppercase tracking-[0.5em] text-[#9a3b2a]/60" style={mono}>
              ✦ với rất nhiều thương mến ✦
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}