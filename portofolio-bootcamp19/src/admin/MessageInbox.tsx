import { useCallback, useEffect, useState } from "react";

import { deleteMessage, getMessages, type Message } from "../lib/api.ts";
import { AdminEmpty, AdminNotice, formatDateTime } from "./AdminNotice.tsx";

type InboxState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; messages: Message[] };

/** Pratinjau satu baris isi pesan tanpa memotong di tengah kata. */
function preview(body: string, max = 110): string {
  const flat = body.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;

  const sliced = flat.slice(0, max);
  const lastSpace = sliced.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? sliced.slice(0, lastSpace) : sliced).trimEnd()}…`;
}

export function MessageInbox({ onCountChange }: { onCountChange: (count: number) => void }) {
  const [state, setState] = useState<InboxState>({ status: "loading" });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const messages = await getMessages();
      setState({ status: "ready", messages });
      onCountChange(messages.length);
      setSelectedId((current) => {
        if (current !== null && messages.some((m) => m.id === current)) return current;
        return messages[0]?.id ?? null;
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memuat pesan";
      setState({ status: "error", message });
    }
  }, [onCountChange]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleDelete(id: number) {
    setDeletingId(id);
    setActionError(null);

    try {
      await deleteMessage(id);
      await load();
    } catch (error: unknown) {
      setActionError(error instanceof Error ? error.message : "Gagal menghapus pesan");
    } finally {
      setDeletingId(null);
    }
  }

  if (state.status === "loading") {
    return <AdminNotice>Memuat pesan…</AdminNotice>;
  }

  if (state.status === "error") {
    return (
      <AdminNotice tone="error" role="alert">
        {state.message}
      </AdminNotice>
    );
  }

  const { messages } = state;
  const selected = messages.find((item) => item.id === selectedId) ?? null;

  return (
    <div className="admin-panel">
      <div className="admin-panel__bar">
        <h2 className="admin-panel__title">Kotak Masuk</h2>
        <button className="admin-btn admin-btn--ghost admin-btn--sm" type="button" onClick={() => void load()}>
          Muat ulang
        </button>
      </div>
      <p className="admin-panel__hint">
        {messages.length} pesan dari formulir kontak. Klik pesan untuk membaca isinya.
      </p>

      {actionError && (
        <AdminNotice tone="error" role="alert">
          {actionError}
        </AdminNotice>
      )}

      {messages.length === 0 ? (
        <AdminEmpty>Belum ada pesan masuk. Pesan dari halaman kontak akan muncul di sini.</AdminEmpty>
      ) : (
        <div className="inbox">
          <ul className="inbox__list">
            {messages.map((item) => (
              <li key={item.id}>
                <button
                  className="inbox__item"
                  type="button"
                  aria-current={item.id === selectedId}
                  onClick={() => setSelectedId(item.id)}
                >
                  <span className="inbox__from">
                    {item.name}
                    <span className="inbox__date">{formatDateTime(item.created_at)}</span>
                  </span>
                  <span className="inbox__preview">{preview(item.body)}</span>
                </button>
              </li>
            ))}
          </ul>

          {selected && (
            <article className="inbox__detail" aria-live="polite">
              <div className="inbox__detail-head">
                <div>
                  <h3 className="admin-panel__title">{selected.name}</h3>
                  <a className="inbox__email" href={`mailto:${selected.email}`}>
                    {selected.email}
                  </a>
                </div>
                <span className="inbox__date">{formatDateTime(selected.created_at)}</span>
              </div>

              <p className="inbox__body">{selected.body}</p>

              <div className="inbox__detail-actions">
                <a className="admin-btn admin-btn--primary admin-btn--sm" href={`mailto:${selected.email}`}>
                  Balas via email
                </a>
                <button
                  className="admin-btn admin-btn--danger admin-btn--sm"
                  type="button"
                  disabled={deletingId === selected.id}
                  onClick={() => void handleDelete(selected.id)}
                >
                  {deletingId === selected.id ? "Menghapus…" : "Hapus pesan"}
                </button>
              </div>
            </article>
          )}
        </div>
      )}
    </div>
  );
}