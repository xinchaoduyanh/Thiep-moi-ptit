"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSession } from "@/lib/admin-auth";
import { createInvite, deleteInvite, updateInvite } from "@/lib/invitations";

export type CreateInviteState = {
  ok: boolean;
  message: string;
  link?: string;
};

export type UpdateInviteState = {
  ok: boolean;
  message: string;
};

export async function createInviteAction(
  _state: CreateInviteState,
  formData: FormData,
): Promise<CreateInviteState> {
  const guestName = String(formData.get("guestName") || "");
  const salutation = String(formData.get("salutation") || "ban");
  const privateWish = String(formData.get("privateWish") || "");
  const slug = String(formData.get("slug") || "");

  if (!guestName.trim()) {
    return {
      ok: false,
      message: "Nhập tên khách mời trước khi tạo thiệp.",
    };
  }

  if (!privateWish.trim()) {
    return {
      ok: false,
      message: "Nhập lời nhắn gửi để truyền vào thiệp.",
    };
  }

  try {
    const invite = await createInvite({
      guestName,
      salutation,
      privateWish,
      slug,
    });

    revalidatePath("/");

    return {
      ok: true,
      message: "Đã tạo thiệp mời.",
      link: `/invitation/${invite.slug}`,
    };
  } catch (error) {
    if (error instanceof Error && error.message === "SLUG_EXISTS") {
      return {
        ok: false,
        message: "Slug này đã tồn tại. Đổi slug khác để mỗi thiệp có link riêng.",
      };
    }

    return {
      ok: false,
      message: "Chưa tạo được thiệp. Kiểm tra lại Supabase policy/schema.",
    };
  }
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/login");
}

export async function deleteInviteAction(inviteId: string) {
  await deleteInvite(inviteId);
  revalidatePath("/");
}

export async function updateInviteAction(
  _state: UpdateInviteState,
  formData: FormData,
): Promise<UpdateInviteState> {
  const id = String(formData.get("inviteId") || "");
  const originalSlug = String(formData.get("originalSlug") || "");
  const guestName = String(formData.get("guestName") || "");
  const salutation = String(formData.get("salutation") || "ban");
  const slug = String(formData.get("slug") || "");
  const privateWish = String(formData.get("privateWish") || "");

  if (!guestName.trim() || !privateWish.trim() || !slug.trim()) {
    return {
      ok: false,
      message: "Nhập đủ tên, slug và lời nhắn trước khi lưu.",
    };
  }

  try {
    await updateInvite({
      id,
      guestName,
      privateWish,
      salutation,
      slug,
    });

    revalidatePath("/");
    if (originalSlug) {
      revalidatePath(`/invitation/${originalSlug}`);
    }
    revalidatePath(`/invitation/${slug}`);

    return {
      ok: true,
      message: "Đã lưu thay đổi.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "SLUG_EXISTS") {
      return {
        ok: false,
        message: "Slug này đã tồn tại. Chọn slug khác nhé.",
      };
    }

    return {
      ok: false,
      message: "Chưa lưu được thay đổi.",
    };
  }
}
