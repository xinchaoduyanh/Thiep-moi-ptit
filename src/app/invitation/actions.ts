"use server";

import { createInviteMessage } from "@/lib/invitations";
import { revalidatePath } from "next/cache";

export type MessageFormState = {
  ok: boolean;
  message: string;
  savedMessage?: string;
};

export async function submitInvitationMessage(
  _state: MessageFormState,
  formData: FormData,
): Promise<MessageFormState> {
  const inviteId = String(formData.get("inviteId") || "");
  const inviteSlug = String(formData.get("inviteSlug") || "");
  const senderName = String(formData.get("senderName") || "");
  const message = String(formData.get("message") || "").trim();

  if (!inviteId) {
    return {
      ok: false,
      message: "Thiệp chưa có mã invite để lưu lời nhắn.",
    };
  }

  if (!message) {
    return {
      ok: false,
      message: "Bạn viết lời nhắn trước khi gửi nhé.",
    };
  }

  try {
    const saved = await createInviteMessage({
      inviteId,
      senderName,
      message,
    });

    if (inviteSlug) {
      revalidatePath(`/invitation/${inviteSlug}`);
    }

    return {
      ok: true,
      message: "Đã gửi rồi nha ♡",
      savedMessage: saved.message,
    };
  } catch {
    return {
      ok: false,
      message: "Chưa gửi được lời nhắn, thử lại giúp mình nhé.",
    };
  }
}
