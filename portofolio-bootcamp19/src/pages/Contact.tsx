import { useState, type FormEvent } from "react";

import { HttpError, groupIssues, sendMessage } from "../lib/api.ts";
import { PageHeader } from "../components/ui/PageHeader.tsx";
import { TextAreaField, TextField } from "../components/ui/Field.tsx";
import { SocialLinks } from "../components/ui/SocialLinks.tsx";
import { Notice } from "../components/ui/Notice.tsx";
import { IconMail } from "../components/icons/index.ts";
import { CONTACT_INFO } from "../components/content/site.ts";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "error"; message: string; issues: Record<string, string[]> }
  | { kind: "success" };

const EMPTY_FORM = { name: "", email: "", body: "" };

/** Menggabungkan semua pesan untuk satu field. */
function messagesFor(issues: Record<string, string[]>, field: string): string {
  return issues[field]?.join(" ") ?? "";
}

export function Contact() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  function update(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ kind: "sending" });

    try {
      await sendMessage(form);
      setForm(EMPTY_FORM);
      setStatus({ kind: "success" });
    } catch (error) {
      if (error instanceof HttpError) {
        setStatus({
          kind: "error",
          message: error.payload.error,
          issues: groupIssues(error.payload.issues ?? []),
        });
        return;
      }

      setStatus({
        kind: "error",
        message: "Tidak dapat menghubungi server",
        issues: {},
      });
    }
  }

  const issues = status.kind === "error" ? status.issues : {};
  const formIssues = issues.form ?? [];
  const isSending = status.kind === "sending";

  const nameError = messagesFor(issues, "name");
  const emailError = messagesFor(issues, "email");
  const bodyError = messagesFor(issues, "body");

  return (
    <section className="section container" id="kontak" aria-labelledby="kontak-title">
      <PageHeader
        id="kontak-title"
        accent="Bersama"
        lead="Ceritakan tujuan, tantangan, atau rencana proyek Anda. Saya akan membalas dengan langkah konkret berikutnya."
      >
        Mari Kolaborasi
      </PageHeader>

      <div className="contact-layout">
        <aside className="contact-info" aria-labelledby="surat-terbuka">
          <p className="eyebrow" id="surat-terbuka">
            {CONTACT_INFO.eyebrow}
          </p>
          <p className="contact-info__lead">{CONTACT_INFO.lead}</p>

          <a className="contact-info__email" href={`mailto:${CONTACT_INFO.email}`}>
            <IconMail width={20} height={20} />
            <span>{CONTACT_INFO.email}</span>
          </a>

          <SocialLinks links={CONTACT_INFO.socials} />
        </aside>

        <form className="form" onSubmit={handleSubmit} noValidate>
          <TextField
            id="name"
            name="name"
            label="Nama Lengkap"
            placeholder="mis. Budi Santoso"
            autoComplete="name"
            value={form.name}
            error={nameError}
            onChange={(event) => update("name", event.target.value)}
            required
          />

          <TextField
            id="email"
            name="email"
            type="email"
            label="Alamat Email"
            placeholder="nama@perusahaan.com"
            autoComplete="email"
            value={form.email}
            error={emailError}
            onChange={(event) => update("email", event.target.value)}
            required
          />

          <TextAreaField
            id="body"
            name="body"
            label="Pesan / Rencana Proyek"
            placeholder="Ceritakan tujuan proyek dan target waktu Anda…"
            value={form.body}
            error={bodyError}
            onChange={(event) => update("body", event.target.value)}
            required
          />

          <button className="btn btn--dark" type="submit" disabled={isSending}>
            <span>{isSending ? "Mengirim…" : "Kirim Pesan Sekarang"}</span>
          </button>

          {status.kind === "success" && (
            <Notice tone="success" role="status">
              Pesan terkirim. Terima kasih!
            </Notice>
          )}

          {status.kind === "error" && (
            <Notice tone="error" role="alert">
              {status.message}
            </Notice>
          )}

          {formIssues.length > 0 && (
            <Notice tone="error" role="alert">
              {formIssues.join(" ")}
            </Notice>
          )}
        </form>
      </div>
    </section>
  );
}
