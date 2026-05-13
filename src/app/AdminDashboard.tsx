"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import type { CreateInviteState, UpdateInviteState } from "./admin-actions";
import { CreateInviteForm } from "./CreateInviteForm";
import styles from "./page.module.css";
import type { InviteWithMessages } from "@/lib/invitations";

type AdminDashboardProps = {
  createAction: (state: CreateInviteState, formData: FormData) => Promise<CreateInviteState>;
  deleteAction: (inviteId: string) => Promise<void>;
  invites: InviteWithMessages[];
  logoutAction: () => Promise<void>;
  updateAction: (state: UpdateInviteState, formData: FormData) => Promise<UpdateInviteState>;
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

const invitesPerPage = 8;

function formatDate(value?: string) {
  if (!value) {
    return "Vừa tạo";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value));
}

function compactWish(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "Chưa có lời nhắn.";
  }

  return trimmed.length > 100 ? `${trimmed.slice(0, 100)}...` : trimmed;
}

function salutationLabel(value: string) {
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

function InviteListItem({
  active,
  deleteAction,
  invite,
  onSelect,
}: {
  active: boolean;
  deleteAction: (inviteId: string) => Promise<void>;
  invite: InviteWithMessages;
  onSelect: () => void;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <article className={styles.inviteRow} data-active={active}>
      <button className={styles.inviteSelect} type="button" onClick={onSelect}>
        <span>{formatDate(invite.createdAt)}</span>
        <strong>
          {salutationLabel(invite.salutation)} {invite.guestName}
        </strong>
        <small>/invitation/{invite.slug}</small>
        <p>{compactWish(invite.privateWish)}</p>
      </button>

      <div className={styles.rowActions}>
        <Link href={`/invitation/${invite.slug}`} target="_blank">
          <span aria-hidden="true">↗</span>
          <span className={styles.actionText}>Preview</span>
        </Link>
        {confirming ? (
          <>
            <button
              className={styles.deleteConfirm}
              type="button"
              disabled={pending}
              onClick={() => {
                startTransition(async () => {
                  await deleteAction(invite.id);
                  setConfirming(false);
                  router.refresh();
                });
              }}
            >
              <span aria-hidden="true">{pending ? "…" : "✓"}</span>
              <span className={styles.actionText}>{pending ? "Đang xóa..." : "Xóa"}</span>
            </button>
            <button type="button" onClick={() => setConfirming(false)} disabled={pending} aria-label="Hủy xóa">
              <span aria-hidden="true">↩</span>
              <span className={styles.actionText}>Hủy</span>
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setConfirming(true)} aria-label={`Xóa thiệp ${invite.guestName}`}>
            <span aria-hidden="true">×</span>
            <span className={styles.actionText}>Delete</span>
          </button>
        )}
      </div>
    </article>
  );
}

function EditInviteForm({
  invite,
  updateAction,
}: {
  invite: InviteWithMessages;
  updateAction: (state: UpdateInviteState, formData: FormData) => Promise<UpdateInviteState>;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(updateAction, {
    ok: false,
    message: "",
  });

  useEffect(() => {
    if (state.ok) {
      router.refresh();
    }
  }, [router, state.ok]);

  return (
    <form className={styles.editForm} action={formAction}>
      <input type="hidden" name="inviteId" value={invite.id} />
      <input type="hidden" name="originalSlug" value={invite.slug} />

      <div className={styles.formTwoCols}>
        <label>
          Tên khách mời
          <input name="guestName" defaultValue={invite.guestName} required />
        </label>
        <label>
          Slug
          <input name="slug" defaultValue={invite.slug} required />
          <span className={styles.fieldHint}>Sửa được nhiều lần; link cũ sẽ đổi sang slug mới sau khi lưu.</span>
        </label>
      </div>

      <label>
        Xưng hô
        <select name="salutation" defaultValue={invite.salutation}>
          {salutations.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Lời nhắn trong thiệp
        <textarea name="privateWish" rows={6} defaultValue={invite.privateWish} required />
      </label>

      <button type="submit" disabled={pending}>
        {pending ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
      {state.message ? <p className={state.ok ? styles.formSuccess : styles.formError}>{state.message}</p> : null}
    </form>
  );
}

function AdminMessages({ messages }: { messages: InviteWithMessages["messages"] }) {
  return (
    <section className={styles.adminMessages}>
      <div>
        <p className={styles.eyebrow}>Lời nhắn gửi đến</p>
        <h3>{messages.length} lời nhắn</h3>
      </div>
      {messages.length ? (
        <div className={styles.adminMessageList}>
          {messages.map((item) => (
            <article key={item.id}>
              <p>{item.message}</p>
              <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
            </article>
          ))}
        </div>
      ) : (
        <p className={styles.emptyText}>Chưa có lời nhắn nào từ khách.</p>
      )}
    </section>
  );
}

export function AdminDashboard({ createAction, deleteAction, invites, logoutAction, updateAction }: AdminDashboardProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedId, setSelectedId] = useState(invites[0]?.id || "");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(invites.length / invitesPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const visibleInvites = useMemo(() => {
    const start = (safeCurrentPage - 1) * invitesPerPage;

    return invites.slice(start, start + invitesPerPage);
  }, [safeCurrentPage, invites]);
  const selectedInvite = useMemo(
    () => visibleInvites.find((invite) => invite.id === selectedId) || visibleInvites[0] || invites[0],
    [invites, selectedId, visibleInvites],
  );

  return (
    <main className={styles.adminPage}>
      <header className={styles.adminTopbar}>
        <div>
          <p className={styles.eyebrow}>Thiệp mời của Duy Anh</p>
          <h1>Quản lý invite</h1>
        </div>
        <div className={styles.topbarActions}>
          <button type="button" onClick={() => setIsCreating((current) => !current)}>
            {isCreating ? "Đóng form" : "Tạo thiệp"}
          </button>
          <form action={logoutAction}>
            <button type="submit">Đăng xuất</button>
          </form>
        </div>
      </header>

      <section className={styles.adminWorkspace}>
        <section className={styles.listPanel} aria-label="Danh sách thiệp">
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.eyebrow}>Danh sách</p>
              <h2>{invites.length} thiệp</h2>
            </div>
            {selectedInvite ? <Link href={`/invitation/${selectedInvite.slug}`}>Preview đang chọn</Link> : null}
          </div>

          <div className={styles.inviteList}>
            {invites.length ? (
              visibleInvites.map((invite) => (
                <InviteListItem
                  active={invite.id === selectedInvite?.id}
                  deleteAction={deleteAction}
                  invite={invite}
                  key={invite.id}
                  onSelect={() => {
                    setSelectedId(invite.id);
                    setIsCreating(false);
                  }}
                />
              ))
            ) : (
              <div className={styles.emptyState}>
                <strong>Chưa có thiệp nào.</strong>
                <p>Bấm “Tạo thiệp” để tạo invite riêng với slug riêng.</p>
              </div>
            )}
          </div>

          {invites.length > invitesPerPage ? (
            <div className={styles.paginationBar}>
              <button
                type="button"
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, Math.min(page, totalPages) - 1))}
              >
                Trước
              </button>
              <span>
                Trang {safeCurrentPage}/{totalPages}
              </span>
              <button
                type="button"
                disabled={safeCurrentPage === totalPages}
                onClick={() => setCurrentPage((page) => Math.min(totalPages, Math.min(page, totalPages) + 1))}
              >
                Sau
              </button>
            </div>
          ) : null}
        </section>

        <aside className={styles.detailPanel} aria-label="Chi tiết thiệp">
          {isCreating ? (
            <CreateInviteForm action={createAction} />
          ) : selectedInvite ? (
            <>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.eyebrow}>Đang chọn</p>
                  <h2>
                    {salutationLabel(selectedInvite.salutation)} {selectedInvite.guestName}
                  </h2>
                </div>
              </div>

              <dl className={styles.inviteMeta}>
                <div>
                  <dt>Slug</dt>
                  <dd>{selectedInvite.slug}</dd>
                </div>
                <div>
                  <dt>Đường dẫn</dt>
                  <dd>/invitation/{selectedInvite.slug}</dd>
                </div>
                <div>
                  <dt>Phản hồi</dt>
                  <dd>{selectedInvite.messages.length}</dd>
                </div>
              </dl>

              <section className={styles.notePreview}>
                <p className={styles.previewKicker}>Preview data</p>
                <strong>
                  Mời {salutationLabel(selectedInvite.salutation).toLowerCase()} {selectedInvite.guestName}
                </strong>
                <p>{selectedInvite.privateWish || "Chưa có lời nhắn."}</p>
              </section>

              <EditInviteForm invite={selectedInvite} key={selectedInvite.id} updateAction={updateAction} />
              <AdminMessages messages={selectedInvite.messages} />

              <div className={styles.detailActions}>
                <Link href={`/invitation/${selectedInvite.slug}`}>Mở preview</Link>
                <Link href={`/invitation/${selectedInvite.slug}`} target="_blank">
                  Mở tab mới
                </Link>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <strong>Chưa chọn thiệp.</strong>
              <p>Chọn một invite trong danh sách để xem data và preview.</p>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
