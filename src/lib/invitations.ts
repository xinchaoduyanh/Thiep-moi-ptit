import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createSupabaseServerClient, isSupabaseConfigured } from "./supabase/server";

export type Invite = {
  id: string;
  slug: string;
  salutation: string;
  guestName: string;
  privateWish: string;
  facebookUrl: string;
  note: string;
  createdAt?: string;
};

export type InviteMessage = {
  id: string;
  inviteId: string;
  senderName: string | null;
  message: string;
  createdAt: string;
};

export type InviteWithMessages = Invite & {
  messages: InviteMessage[];
};

type MessageRow = {
  id: string;
  invite_id: string;
  sender_name: string | null;
  message: string;
  created_at: string;
};

type InviteRow = {
  id: string;
  slug: string;
  salutation: string | null;
  guest_name: string;
  private_wish: string | null;
  facebook_url: string | null;
  note: string | null;
  created_at?: string;
  messages?: MessageRow[];
};

type LocalStore = {
  invites: Invite[];
  messages: InviteMessage[];
};

const localStorePath = path.join(process.cwd(), "data", "local-invites.json");
const useLocalData = process.env.STORAGE_DRIVER !== "supabase";
const localFallbackEnabled = process.env.ENABLE_LOCAL_FALLBACK === "1";

export const demoInvite: Invite = {
  id: "demo",
  slug: "demo",
  salutation: "ban",
  guestName: "bạn thân mến",
  privateWish:
    "Nếu ngày hôm đó có cậu ở PTIT, khoảnh khắc tung mũ của mình chắc chắn sẽ vui hơn rất nhiều.\nMình muốn giữ lại một tấm ảnh thật xinh cùng cậu trong cột mốc này.\nHẹn gặp cậu tối 23/05 nha, chỉ cần cậu đến là mình vui rồi.",
  facebookUrl: "https://www.facebook.com/danhvuvu192",
  note: "Thiệp demo khi chưa cấu hình Supabase.",
};

async function readLocalStore(): Promise<LocalStore> {
  try {
    const raw = await readFile(localStorePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<LocalStore>;

    return {
      invites: parsed.invites || [],
      messages: parsed.messages || [],
    };
  } catch {
    return {
      invites: [],
      messages: [],
    };
  }
}

async function writeLocalStore(store: LocalStore) {
  await mkdir(path.dirname(localStorePath), { recursive: true });
  await writeFile(localStorePath, JSON.stringify(store, null, 2), "utf8");
}

function shouldUseLocalFallback(error?: { message?: string } | null) {
  return Boolean(
    localFallbackEnabled &&
      (error?.message?.includes("Could not find the table") ||
      error?.message?.includes("schema cache") ||
      error?.message?.includes("relation") ||
      error?.message?.includes("does not exist")),
  );
}

function mapInvite(row: InviteRow): Invite {
  return {
    id: row.id,
    slug: row.slug,
    salutation: row.salutation || "ban",
    guestName: row.guest_name,
    privateWish: row.private_wish || "",
    facebookUrl: row.facebook_url || "https://www.facebook.com/danhvuvu192",
    note: row.note || "",
    createdAt: row.created_at,
  };
}

function mapMessage(row: MessageRow): InviteMessage {
  return {
    id: row.id,
    inviteId: row.invite_id,
    senderName: row.sender_name,
    message: row.message,
    createdAt: row.created_at,
  };
}

export function splitWishLines(value: string) {
  return value
    .split(/\||\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function salutationLabel(value: string) {
  const labels: Record<string, string> = {
    anh: "Anh",
    chi: "Chị",
    em: "Em",
    ban: "Bạn",
    cau: "Cậu",
    di: "Dì",
    bac: "Bác",
    chu: "Chú",
    co: "Cô",
  };

  return labels[value] || "Bạn";
}

export function slugify(value: string) {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 56);

  return slug || "khach-moi";
}

function defaultWish(salutation: string, guestName: string) {
  const label = salutationLabel(salutation).toLowerCase();
  const speaker = speakerPronoun(salutation);

  return [
    `Nếu ngày hôm đó có ${label} ${guestName} ở PTIT, khoảnh khắc tung mũ của ${speaker} chắc chắn sẽ vui hơn rất nhiều.`,
    `${speaker} muốn giữ lại một tấm ảnh thật xinh cùng ${label} trong cột mốc này.`,
    `Hẹn gặp ${label} tối 23/05 nha, chỉ cần ${label} đến là ${speaker} vui rồi.`,
  ].join("\n");
}

function speakerPronoun(salutation: string) {
  if (["anh", "chi"].includes(salutation)) {
    return "em";
  }

  if (["cau", "di", "bac", "chu", "co"].includes(salutation)) {
    return "cháu";
  }

  if (salutation === "em") {
    return "anh";
  }

  return "tôi";
}

export async function getInviteBySlug(slug: string) {
  if (useLocalData || !isSupabaseConfigured()) {
    const store = await readLocalStore();
    return store.invites.find((invite) => invite.slug === slug) || (slug === "demo" ? demoInvite : null);
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("invites")
    .select("id, slug, salutation, guest_name, private_wish, facebook_url, note")
    .eq("slug", slug)
    .eq("is_active", true)
    .single<InviteRow>();

  if (shouldUseLocalFallback(error)) {
    const store = await readLocalStore();
    return store.invites.find((invite) => invite.slug === slug) || null;
  }

  if (error || !data) {
    return null;
  }

  return mapInvite(data);
}

export async function getInviteWithMessagesBySlug(slug: string): Promise<InviteWithMessages | null> {
  const invite = await getInviteBySlug(slug);

  if (!invite) {
    return null;
  }

  if (useLocalData || !isSupabaseConfigured() || invite.id === demoInvite.id) {
    const store = await readLocalStore();

    return {
      ...invite,
      messages: store.messages
        .filter((message) => message.inviteId === invite.id)
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
    };
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return {
      ...invite,
      messages: [],
    };
  }

  const { data, error } = await supabase
    .from("messages")
    .select("id, invite_id, sender_name, message, created_at")
    .eq("invite_id", invite.id)
    .order("created_at", { ascending: false });

  if (shouldUseLocalFallback(error)) {
    const store = await readLocalStore();

    return {
      ...invite,
      messages: store.messages
        .filter((message) => message.inviteId === invite.id)
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
    };
  }

  return {
    ...invite,
    messages: error || !data ? [] : (data as MessageRow[]).map(mapMessage),
  };
}

export async function listInvitesWithMessages(): Promise<InviteWithMessages[]> {
  if (useLocalData || !isSupabaseConfigured()) {
    const store = await readLocalStore();
    return store.invites.map((invite) => ({
      ...invite,
      messages: store.messages.filter((message) => message.inviteId === invite.id),
    }));
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("invites")
    .select(
      "id, slug, salutation, guest_name, private_wish, facebook_url, note, created_at, messages(id, invite_id, sender_name, message, created_at)",
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (shouldUseLocalFallback(error)) {
    const store = await readLocalStore();
    return store.invites.map((invite) => ({
      ...invite,
      messages: store.messages.filter((message) => message.inviteId === invite.id),
    }));
  }

  if (error || !data) {
    return [];
  }

  return (data as InviteRow[]).map((row) => ({
    ...mapInvite(row),
    messages: (row.messages || []).map(mapMessage),
  }));
}

export async function createInvite(input: {
  guestName: string;
  salutation: string;
  privateWish?: string;
  slug?: string;
}) {
  const guestName = input.guestName.trim();
  const validSalutations = ["anh", "chi", "em", "ban", "cau", "di", "bac", "chu", "co"];
  const salutation = validSalutations.includes(input.salutation) ? input.salutation : "ban";
  const privateWish = input.privateWish?.trim() || defaultWish(salutation, guestName);

  if (!guestName) {
    throw new Error("GUEST_NAME_REQUIRED");
  }

  const suffix = Math.random().toString(36).slice(2, 7);
  const slug = input.slug?.trim() ? slugify(input.slug) : `${slugify(guestName)}-${suffix}`;

  if (useLocalData || !isSupabaseConfigured()) {
    const store = await readLocalStore();

    if (store.invites.some((invite) => invite.slug === slug)) {
      throw new Error("SLUG_EXISTS");
    }

    const invite = {
      ...demoInvite,
      id: crypto.randomUUID(),
      slug,
      guestName,
      salutation,
      privateWish,
      createdAt: new Date().toISOString(),
    };

    store.invites.unshift(invite);
    await writeLocalStore(store);

    return invite;
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    throw new Error("SUPABASE_NOT_CONFIGURED");
  }

  const { data: existing, error: existingError } = await supabase
    .from("invites")
    .select("id")
    .eq("slug", slug)
    .maybeSingle<{ id: string }>();

  if (shouldUseLocalFallback(existingError)) {
    const store = await readLocalStore();

    if (store.invites.some((invite) => invite.slug === slug)) {
      throw new Error("SLUG_EXISTS");
    }

    const invite = {
      ...demoInvite,
      id: crypto.randomUUID(),
      slug,
      guestName,
      salutation,
      privateWish,
      createdAt: new Date().toISOString(),
    };

    store.invites.unshift(invite);
    await writeLocalStore(store);

    return {
      ...invite,
    };
  }

  if (existing) {
    throw new Error("SLUG_EXISTS");
  }

  const { data, error } = await supabase
    .from("invites")
    .insert({
      slug,
      salutation,
      guest_name: guestName,
      private_wish: privateWish,
      facebook_url: "https://www.facebook.com/danhvuvu192",
      note: "",
      is_active: true,
    })
    .select("id, slug, salutation, guest_name, private_wish, facebook_url, note, created_at")
    .single<InviteRow>();

  if (error || !data) {
    throw new Error(error?.message || "INVITE_CREATE_FAILED");
  }

  return mapInvite(data);
}

export async function createInviteMessage(input: {
  inviteId: string;
  senderName?: string;
  message: string;
}) {
  const message = input.message.trim();

  if (!message) {
    throw new Error("MESSAGE_REQUIRED");
  }

  if (useLocalData || !isSupabaseConfigured() || input.inviteId === demoInvite.id) {
    const store = await readLocalStore();
    const saved = {
      id: crypto.randomUUID(),
      inviteId: input.inviteId,
      senderName: input.senderName || null,
      message,
      createdAt: new Date().toISOString(),
    } satisfies InviteMessage;

    if (input.inviteId !== demoInvite.id) {
      store.messages.unshift(saved);
      await writeLocalStore(store);
    }

    return saved;
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    throw new Error("SUPABASE_NOT_CONFIGURED");
  }

  const { error } = await supabase.from("messages").insert({
    invite_id: input.inviteId,
    sender_name: input.senderName?.trim() || null,
    message,
  });

  if (shouldUseLocalFallback(error)) {
    const store = await readLocalStore();
    const saved = {
      id: crypto.randomUUID(),
      inviteId: input.inviteId,
      senderName: input.senderName || null,
      message,
      createdAt: new Date().toISOString(),
    } satisfies InviteMessage;

    store.messages.unshift(saved);
    await writeLocalStore(store);

    return saved;
  }

  if (error) {
    throw new Error(error?.message || "MESSAGE_CREATE_FAILED");
  }

  return {
    id: "created",
    inviteId: input.inviteId,
    senderName: input.senderName?.trim() || null,
    message,
    createdAt: new Date().toISOString(),
  } satisfies InviteMessage;
}

export async function deleteInvite(inviteId: string) {
  if (!inviteId) {
    throw new Error("INVITE_ID_REQUIRED");
  }

  if (useLocalData || !isSupabaseConfigured()) {
    const store = await readLocalStore();

    await writeLocalStore({
      invites: store.invites.filter((invite) => invite.id !== inviteId),
      messages: store.messages.filter((message) => message.inviteId !== inviteId),
    });

    return;
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    throw new Error("SUPABASE_NOT_CONFIGURED");
  }

  const { error } = await supabase.from("invites").delete().eq("id", inviteId);

  if (shouldUseLocalFallback(error)) {
    const store = await readLocalStore();

    await writeLocalStore({
      invites: store.invites.filter((invite) => invite.id !== inviteId),
      messages: store.messages.filter((message) => message.inviteId !== inviteId),
    });

    return;
  }

  if (error) {
    throw new Error(error.message || "INVITE_DELETE_FAILED");
  }
}

export async function updateInvite(input: {
  id: string;
  guestName: string;
  privateWish: string;
  salutation: string;
  slug: string;
}) {
  const id = input.id.trim();
  const guestName = input.guestName.trim();
  const privateWish = input.privateWish.trim();
  const validSalutations = ["anh", "chi", "em", "ban", "cau", "di", "bac", "chu", "co"];
  const salutation = validSalutations.includes(input.salutation) ? input.salutation : "ban";
  const slug = slugify(input.slug);

  if (!id || !guestName || !privateWish || !slug) {
    throw new Error("INVITE_UPDATE_INVALID");
  }

  if (useLocalData || !isSupabaseConfigured()) {
    const store = await readLocalStore();
    const duplicate = store.invites.some((invite) => invite.id !== id && invite.slug === slug);

    if (duplicate) {
      throw new Error("SLUG_EXISTS");
    }

    await writeLocalStore({
      ...store,
      invites: store.invites.map((invite) =>
        invite.id === id
          ? {
              ...invite,
              guestName,
              privateWish,
              salutation,
              slug,
            }
          : invite,
      ),
    });

    return;
  }

  const supabase = createSupabaseServerClient();

  if (!supabase) {
    throw new Error("SUPABASE_NOT_CONFIGURED");
  }

  const { data: existing, error: existingError } = await supabase
    .from("invites")
    .select("id")
    .eq("slug", slug)
    .neq("id", id)
    .maybeSingle<{ id: string }>();

  if (shouldUseLocalFallback(existingError)) {
    const store = await readLocalStore();
    const duplicate = store.invites.some((invite) => invite.id !== id && invite.slug === slug);

    if (duplicate) {
      throw new Error("SLUG_EXISTS");
    }

    await writeLocalStore({
      ...store,
      invites: store.invites.map((invite) =>
        invite.id === id
          ? {
              ...invite,
              guestName,
              privateWish,
              salutation,
              slug,
            }
          : invite,
      ),
    });

    return;
  }

  if (existing) {
    throw new Error("SLUG_EXISTS");
  }

  const { error } = await supabase
    .from("invites")
    .update({
      guest_name: guestName,
      private_wish: privateWish,
      salutation,
      slug,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message || "INVITE_UPDATE_FAILED");
  }
}
