"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useState } from "react";
import type { CreateInviteState } from "./admin-actions";
import styles from "./page.module.css";

type CreateInviteFormProps = {
  action: (state: CreateInviteState, formData: FormData) => Promise<CreateInviteState>;
};

const salutations = [
  { value: "anh", label: "Anh" },
  { value: "chi", label: "Chị" },
  { value: "em", label: "Em" },
  { value: "ban", label: "Bạn" },
  { value: "cau", label: "Cậu" },
  { value: "di", label: "Dì" },
  { value: "bac", label: "Bác" },
  { value: "chu", label: "Chú" },
  { value: "co", label: "Cô" },
];

const sampleWish =
  "Nếu ngày hôm đó có bạn ở PTIT, khoảnh khắc tung mũ của mình chắc chắn sẽ vui hơn rất nhiều.\nMình muốn giữ lại một tấm ảnh thật xinh cùng bạn trong cột mốc này.\nHẹn gặp bạn tối 23/05 nha, chỉ cần bạn đến là mình vui rồi.";

function slugifyPreview(value: string) {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 56) || "khach-moi"
  );
}

export function CreateInviteForm({ action }: CreateInviteFormProps) {
  const router = useRouter();
  const [guestName, setGuestName] = useState("");
  const [salutation, setSalutation] = useState("ban");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [privateWish, setPrivateWish] = useState(sampleWish);
  const [state, formAction, pending] = useActionState(action, {
    ok: false,
    message: "",
  });

  const salutationLabel = useMemo(
    () => salutations.find((item) => item.value === salutation)?.label || "Bạn",
    [salutation],
  );
  const previewName = guestName.trim() || "khách mời";
  const previewSlug = slugifyPreview(slugTouched ? slug : guestName);
  const previewLines = privateWish
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  useEffect(() => {
    if (state.ok && state.link) {
      router.refresh();
    }
  }, [router, state.link, state.ok]);

  return (
    <form className={styles.createCard} id="create" action={formAction}>
      <div>
        <p className={styles.eyebrow}>Tạo thiệp mới</p>
        <h3>Thông tin khách mời</h3>
      </div>

      <label>
        Tên khách mời
        <input
          name="guestName"
          placeholder="VD: Nguyễn Văn A"
          value={guestName}
          onChange={(event) => {
            setGuestName(event.target.value);
            if (!slugTouched) {
              setSlug(slugifyPreview(event.target.value));
            }
          }}
          required
        />
      </label>

      <label>
        Slug đường dẫn
        <input
          name="slug"
          placeholder="nguyen-van-a"
          value={slug}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(event.target.value);
          }}
          required
        />
        <span className={styles.fieldHint}>Có thể sửa slug bất kỳ lúc nào. Slug đang dùng làm link /invitation/slug.</span>
      </label>

      <fieldset className={styles.segmented}>
        <legend>Cách xưng hô</legend>
        {salutations.map((item) => (
          <label key={item.value}>
            <input
              type="radio"
              name="salutation"
              value={item.value}
              checked={salutation === item.value}
              onChange={() => setSalutation(item.value)}
            />
            <span>{item.label}</span>
          </label>
        ))}
      </fieldset>

      <label>
        Lời nhắn gửi trong thiệp
        <textarea
          name="privateWish"
          rows={6}
          placeholder="Viết lời nhắn riêng cho khách mời..."
          value={privateWish}
          onChange={(event) => setPrivateWish(event.target.value)}
          required
        />
      </label>

      <section className={styles.formPreview} aria-label="Preview thiệp mời">
        <p className={styles.previewKicker}>Preview nhanh</p>
        <strong>
          Mời {salutationLabel.toLowerCase()} {previewName}
        </strong>
        <code>/invitation/{previewSlug}</code>
        <div>
          {previewLines.length ? (
            previewLines.map((line) => <p key={line}>{line}</p>)
          ) : (
            <p>Lời nhắn sẽ hiển thị tại đây.</p>
          )}
        </div>
      </section>

      <button type="submit" disabled={pending}>
        {pending ? "Đang tạo..." : "Tạo link thiệp"}
      </button>

      {state.message ? (
        <div className={state.ok ? styles.formSuccess : styles.formError}>
          <p>{state.message}</p>
          {state.link ? <a href={state.link}>Mở preview thiệp vừa tạo</a> : null}
        </div>
      ) : null}
    </form>
  );
}
