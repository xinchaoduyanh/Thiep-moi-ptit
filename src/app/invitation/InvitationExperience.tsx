"use client";

import Image, { type StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import fbImage from "../../../assets/fb.png";
import type { MessageFormState } from "./actions";
import styles from "./invitation.module.css";

type InvitationExperienceProps = {
  className: string;
  facebookUrl: string;
  giftImage: StaticImageData;
  googleMapsEmbedUrl: string;
  googleMapsUrl: string;
  guestName: string;
  inviteId: string;
  inviteSlug: string;
  messageAction: (state: MessageFormState, formData: FormData) => Promise<MessageFormState>;
  salutation: string;
  schoolImage: StaticImageData;
  wishLines: string[];
};

function speakerPronoun(salutation: string) {
  const normalized = salutation.toLowerCase();

  if (["anh", "chị"].includes(normalized)) {
    return "em";
  }

  if (["dì", "bác", "chú", "cô"].includes(normalized)) {
    return "cháu";
  }

  if (normalized === "em") {
    return "anh";
  }

  return "mình";
}

function AnimatedDots() {
  return (
    <div className={styles.motionLayer} aria-hidden="true">
      <span className={styles.floatOne}>🎓</span>
      <span className={styles.floatTwo}>✎</span>
      <span className={styles.floatThree}>✦</span>
      <span className={styles.floatFour}>♡</span>
      <span className={styles.floatFive}>📚</span>
    </div>
  );
}

function TechDecor() {
  const items = [
    styles.decorOne,
    styles.decorTwo,
    styles.decorThree,
    styles.decorFour,
    styles.decorFive,
    styles.decorSix,
    styles.decorSeven,
  ];
  const icons = [styles.dockerWhale, styles.laptopIcon, styles.codeIcon, styles.databaseIcon, styles.capIcon];

  return (
    <div className={styles.techLayer} aria-hidden="true">
      {items.map((positionClass, index) => {
        const iconClass = icons[index % icons.length];
        const isDocker = iconClass === styles.dockerWhale;

        return (
          <span className={`${styles.decorIcon} ${positionClass} ${iconClass}`} key={`decor-icon-${index}`}>
            {isDocker ? (
              <>
                <span className={styles.dockerBoxes} />
                <span className={styles.dockerBody} />
                <span className={styles.dockerTail} />
              </>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}

function TrendDecor() {
  return (
    <div className={styles.trendLayer} aria-hidden="true">
      <span className={`${styles.trendSticker} ${styles.trendStickerOne}`}>PTIT</span>
      <span className={`${styles.trendSticker} ${styles.trendStickerTwo}`}>2026</span>
      <span className={`${styles.trendSticker} ${styles.trendStickerThree}`}>xoxo</span>
      <span className={styles.trendStamp}>save<br />the date</span>
      <span className={`${styles.trendPaperClip} ${styles.trendPaperClipOne}`} />
      <span className={`${styles.trendPaperClip} ${styles.trendPaperClipTwo}`} />
      <span className={styles.trendScribbleArrow} />
      <span className={styles.trendScribbleLoop} />
    </div>
  );
}

function useScrollGuard(isUnlocked: boolean) {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const stopScroll = (event: WheelEvent) => {
      if (isUnlocked || event.deltaY <= 0 || !sectionRef.current) {
        return;
      }

      const box = sectionRef.current.getBoundingClientRect();
      const isCurrentSection = box.top <= window.innerHeight * 0.24 && box.bottom >= window.innerHeight * 0.42;

      if (isCurrentSection) {
        event.preventDefault();
      }
    };

    window.addEventListener("wheel", stopScroll, { passive: false });

    return () => window.removeEventListener("wheel", stopScroll);
  }, [isUnlocked]);

  return sectionRef;
}

export function InvitationExperience({
  className,
  giftImage,
  googleMapsEmbedUrl,
  googleMapsUrl,
  guestName,
  inviteId,
  inviteSlug,
  messageAction,
  salutation,
  schoolImage,
  wishLines,
}: InvitationExperienceProps) {
  const router = useRouter();
  const [giftStep, setGiftStep] = useState(0);
  const [letterOpen, setLetterOpen] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [wishStep, setWishStep] = useState(0);
  const replyFormRef = useRef<HTMLFormElement | null>(null);
  const sentNoteRef = useRef<HTMLParagraphElement | null>(null);
  const [messageState, formAction, isSending] = useActionState(messageAction, {
    ok: false,
    message: "",
  });

  const wishDone = wishStep >= wishLines.length;
  const giftRef = useRef<HTMLElement | null>(null);
  const wishRef = useScrollGuard(wishDone);

  const visibleWishLines = useMemo(() => wishLines.slice(0, wishStep), [wishLines, wishStep]);
  const invitedGuest = `${salutation.toLowerCase()} ${guestName}`.trim();
  const speaker = speakerPronoun(salutation);
  const speakerTitle = `${speaker.charAt(0).toUpperCase()}${speaker.slice(1)}`;
  const invitee = salutation.toLowerCase();
  const addressedGuest = `${invitee} ${guestName}`.trim();
  const facebookProfileUrl = "https://www.facebook.com/danhvuvu192";
  const giftLines = useMemo(
    () => [
      `Có một món quà nhỏ đang được giữ bí mật cho ${invitee}.`,
      `${speakerTitle} sẽ không bật mí trước đâu.`,
      `Chỉ cần ${invitee} đến, món quà ấy sẽ tự tìm được chủ nhân.`,
    ],
    [invitee, speakerTitle],
  );
  const notes = useMemo(
    () => [
      `Đừng mang hoa hay tình yêu to bự quá nhé, ${speaker} sẽ khó khăn trong việc cầm tình yêu của ${invitee} về lắm, sự có mặt của ${invitee} là món quà tuyệt nhất rùi.`,
      `Hãy cố gắng đi trong khung giờ đó nha để ${speaker} có thể đón được ${invitee} nhé.`,
    ],
    [invitee, speaker],
  );
  const giftDone = giftStep >= giftLines.length;
  const visibleGiftLines = useMemo(() => giftLines.slice(0, giftStep), [giftLines, giftStep]);
  const wishReserveHeight = Math.min(420, Math.max(230, wishLines.length * 92 + 48));
  const wishCardHeight = Math.min(680, Math.max(500, wishReserveHeight + 280));

  useEffect(() => {
    if (!giftRef.current || giftDone) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        giftLines.forEach((_, index) => {
          window.setTimeout(() => {
            setGiftStep((current) => Math.max(current, index + 1));
          }, index * 620);
        });

        observer.disconnect();
      },
      { threshold: 0.45 },
    );

    observer.observe(giftRef.current);

    return () => observer.disconnect();
  }, [giftDone, giftLines]);

  useEffect(() => {
    if (messageState.ok) {
      sentNoteRef.current?.classList.remove(styles.sentNoteHidden);
      sentNoteRef.current?.classList.add(styles.sentNoteVisible);

      const timeout = window.setTimeout(() => {
        sentNoteRef.current?.classList.remove(styles.sentNoteVisible);
        sentNoteRef.current?.classList.add(styles.sentNoteHidden);
      }, 3600);

      replyFormRef.current?.reset();
      router.refresh();

      return () => window.clearTimeout(timeout);
    }
  }, [messageState.ok, messageState.savedMessage, router]);

  return (
    <main className={`${styles.page} ${className}`}>
      <section className={`${styles.section} ${styles.hero}`} id="hello">
        <AnimatedDots />
        <TechDecor />
        <TrendDecor />
        <div className={styles.noteCard}>
          <p className={styles.kicker}>HÀ NỘI · 23/5 · 9H-12H</p>
          <h1>MỜI {invitedGuest.toUpperCase()}</h1>
          <p className={styles.heroCopy}>
            {speakerTitle} xin mời {invitedGuest} tới dự lễ tốt nghiệp của {speaker} tại PTIT. Hẹn gặp {salutation.toLowerCase()} vào sáng ngày 23/05 nhé.
            Cùng {speaker} lưu lại một cột mốc rất đáng nhớ nhé.
          </p>
          <div className={styles.heroMeta}>
            <span>PTIT</span>
            <span>23 · 05</span>
            <span>Lễ tốt nghiệp</span>
          </div>
        </div>
        <p className={styles.scrollHint}>Lướt xuống nhé</p>
      </section>

      <section className={`${styles.section} ${styles.place}`} id="place">
        <AnimatedDots />
        <TechDecor />
        <TrendDecor />
        <div className={styles.sectionHeader}>
          <p className={styles.kicker}>Địa điểm</p>
          <h2>Học viện Công nghệ Bưu chính Viễn thông</h2>
          <p>Km10, Đường Nguyễn Trãi, Hà Đông, Hà Nội</p>
        </div>
        <div className={styles.placeGrid}>
          <figure className={styles.mapFrame}>
            <span className={`${styles.mapTape} ${styles.mapTapeOne}`} aria-hidden="true" />
            <span className={`${styles.mapTape} ${styles.mapTapeTwo}`} aria-hidden="true" />
            <span className={`${styles.mapTape} ${styles.mapTapeThree}`} aria-hidden="true" />
            <div className={styles.mapEmbed}>
              <iframe
                title="Bản đồ PTIT"
                src={googleMapsEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <figcaption>✦ Ghé thăm {speaker} nhé ✦</figcaption>
          </figure>
          <div className={styles.mapNote}>
            <Image src={schoolImage} alt="Ảnh Học viện Công nghệ Bưu chính Viễn thông" priority />
            <span>📍</span>
            <strong>Google Maps đã sẵn sàng</strong>
            <p>Ấn vào dòng bên dưới để mở vị trí PTIT.</p>
            <a href={googleMapsUrl} target="_blank" rel="noreferrer">
              Mở Google Maps
            </a>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.notice}`} id="notice">
        <AnimatedDots />
        <TechDecor />
        <TrendDecor />
        <div className={styles.noticePaper}>
          <p className={styles.kicker}>P.S · vài điều nhỏ</p>
          <h2>Đọc giúp {speaker} nhé</h2>
          <ul>
            {notes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <a href={facebookProfileUrl} target="_blank" rel="noreferrer" className={styles.inlineLink}>
            Liên lạc qua FB Vũ Duy Anh
          </a>
          <p className={styles.contactChip}>SĐT: 0988659126</p>
          <a href={facebookProfileUrl} target="_blank" rel="noreferrer" className={styles.facebookCard}>
            <span className={styles.fbDoodle}>Here is my fb</span>
            <span className={styles.fbDoodleTwo}>đây nè</span>
            <span className={styles.fbTapHint}>Nhấn vào để qua FB gọi {speaker} nhé</span>
            <span className={`${styles.fbFlower} ${styles.fbFlowerOne}`} aria-hidden="true" />
            <span className={`${styles.fbFlower} ${styles.fbFlowerTwo}`} aria-hidden="true" />
            <span className={styles.fbLeafTrail} aria-hidden="true" />
            <span className={styles.fbImageCrop}>
              <Image src={fbImage} alt="Facebook Vũ Duy Anh" />
            </span>
            <span className={styles.fbProfileRow}>
              <span className={styles.fbAvatar} />
              <span>
                <strong>Vũ Duy Anh</strong>
                <small>727 người bạn</small>
              </span>
            </span>
            <span className={styles.fbTabs}>
              <span>Bài viết</span>
              <span>Giới thiệu</span>
              <span>Ảnh</span>
            </span>
          </a>
        </div>
      </section>

      <section ref={giftRef} className={`${styles.section} ${styles.gift}`} id="gift">
        <AnimatedDots />
        <TechDecor />
        <TrendDecor />
        <div className={styles.giftLayout}>
          <div className={styles.giftPhoto}>
            <span className={`${styles.giftTape} ${styles.giftTapeOne}`} aria-hidden="true" />
            <span className={`${styles.giftTape} ${styles.giftTapeTwo}`} aria-hidden="true" />
            <span className={`${styles.giftTape} ${styles.giftTapeThree}`} aria-hidden="true" />
            <span className={`${styles.giftTape} ${styles.giftTapeFour}`} aria-hidden="true" />
            <span className={styles.giftDoodleOne}>mystery gift</span>
            <span className={styles.giftDoodleTwo}>điều gì đó?</span>
            <span className={styles.giftDoodleArrow} aria-hidden="true" />
            <Image src={giftImage} alt="Khung bí mật món quà đặc biệt" />
          </div>
          <div className={styles.revealCard}>
            <p className={styles.kicker}>Bí mật nhỏ</p>
            <h2>Một món quà đặc biệt đang chờ {invitee}</h2>
            <div className={styles.revealLines} aria-live="polite">
              {visibleGiftLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <p className={styles.autoRevealHint}>{giftDone ? "Bí mật đã tự mở khi bạn lướt tới đây." : "Đang mở bí mật..."}</p>
          </div>
        </div>
      </section>

      <section ref={wishRef} className={`${styles.section} ${styles.wish}`} id="wish">
        <AnimatedDots />
        <TechDecor />
        <TrendDecor />
        <div className={styles.letterStage}>
          <p className={`${styles.envelopeHint} ${letterOpen ? styles.envelopeHintHidden : ""}`}>
            Bấm vào bức thư của {speaker} bên dưới nhé
          </p>
          <button
            className={`${styles.envelope} ${letterOpen ? styles.envelopeOpen : ""}`}
            type="button"
            onClick={() => {
              setLetterOpen(true);
              setWishStep((current) => Math.max(current, 1));
            }}
            disabled={letterOpen}
          >
            <span className={styles.envelopeBack} />
            <span className={styles.envelopePaper}>Riêng cho {addressedGuest}</span>
            <span className={styles.envelopeFront} />
            <span className={styles.envelopeFlap} />
            <span className={styles.envelopeSeal}>♡</span>
          </button>

          <div
            className={`${styles.wishCard} ${letterOpen ? styles.wishCardOpen : ""}`}
            style={{ minHeight: `${wishCardHeight}px` }}
          >
            <span className={`${styles.flowerDoodle} ${styles.flowerDoodleOne}`} aria-hidden="true" />
            <span className={`${styles.flowerDoodle} ${styles.flowerDoodleTwo}`} aria-hidden="true" />
            <span className={styles.leafDoodle} aria-hidden="true" />
            <p className={styles.kicker}>Riêng cho {addressedGuest}</p>
            <h2>Lời nhắn của {speaker}</h2>
            <div
              className={`${styles.revealLines} ${styles.wishLines}`}
              style={{ minHeight: `${wishReserveHeight}px` }}
              aria-live="polite"
            >
              {letterOpen && visibleWishLines.map((line, lineIndex) => (
                <p className={styles.typedLine} key={`${lineIndex}-${line}`}>
                  {line.split("").map((char, index) => (
                    <span key={`${lineIndex}-${index}-${char}`} style={{ animationDelay: `${index * 22}ms` }}>
                      {char === " " ? "\u00a0" : char}
                    </span>
                  ))}
                </p>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setWishStep((current) => Math.min(current + 1, wishLines.length))}
              disabled={!letterOpen || wishDone}
              className={letterOpen && !wishDone ? styles.nextWishButton : undefined}
            >
              {!letterOpen ? "Mở phong bì trước nhé" : wishDone ? "Đã xem hết lời nhắn" : "Xem dòng tiếp theo"}
            </button>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.reply}`} id="reply">
        <AnimatedDots />
        <TechDecor />
        <TrendDecor />
        <form
          ref={replyFormRef}
          className={styles.replyNote}
          action={formAction}
          onSubmit={(event) => {
            const formData = new FormData(event.currentTarget);
            const message = String(formData.get("message") || "").trim();

            if (!message) {
              event.preventDefault();
              setReplyError("Bạn viết vài chữ trước khi gửi nha.");
            }
          }}
        >
          {messageState.ok ? <span className={styles.replySparkles} aria-hidden="true" /> : null}
          <input type="hidden" name="inviteId" value={inviteId} />
          <input type="hidden" name="inviteSlug" value={inviteSlug} />
          <input type="hidden" name="senderName" value={guestName} />
          <p className={styles.kicker}>Gửi {speaker} một dòng</p>
          <h2>Ghi lại lời nhắn nhủ tới Duy Anh nha ♡</h2>
          <textarea
            name="message"
            placeholder="Viết gì đó cho Duy Anh..."
            rows={5}
            required
            onInput={() => setReplyError("")}
          />
          <button type="submit" disabled={isSending}>
            {isSending ? "Đang gửi..." : "Gửi đi →"}
          </button>
          {replyError ? <p className={styles.errorNote}>{replyError}</p> : null}
          {messageState.message ? (
            <p
              ref={messageState.ok ? sentNoteRef : undefined}
              className={messageState.ok ? `${styles.sentNote} ${styles.sentNoteVisible}` : styles.errorNote}
            >
              {messageState.ok ? <span aria-hidden="true">♡</span> : null}
              {messageState.message}
            </p>
          ) : null}
        </form>
        <div className={styles.thanks}>
          <h2>Cảm ơn {invitedGuest}</h2>
          <p>Sự xuất hiện của {salutation.toLowerCase()} trong ngày hôm ấy là điều tuyệt vời nhất với Duy Anh.</p>
        </div>
      </section>
    </main>
  );
}
