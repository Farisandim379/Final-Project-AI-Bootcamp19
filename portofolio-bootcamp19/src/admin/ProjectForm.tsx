import { useState, type FormEvent } from "react";

import { HttpError, createProject, groupIssues, updateProject } from "../lib/api.ts";
import type { Project } from "../lib/project.ts";

interface ProjectFormProps {
  /** `null` = mode tambah. */
  editing: Project | null;
  onSaved: () => void;
  onCancel: () => void;
}

interface FormState {
  title: string;
  description: string;
  repoUrl: string;
  demoUrl: string;
  tech: string;
}

const EMPTY: FormState = {
  title: "",
  description: "",
  repoUrl: "",
  demoUrl: "",
  tech: "",
};

function toFormState(project: Project | null): FormState {
  if (!project) return EMPTY;

  return {
    title: project.title,
    description: project.description,
    repoUrl: project.repoUrl ?? "",
    demoUrl: project.demoUrl ?? "",
    tech: project.tech.join(", "),
  };
}

export function ProjectForm({ editing, onSaved, onCancel }: ProjectFormProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(editing));
  const [issues, setIssues] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setIssues({});
    setFormError(null);

    // String kosong dikirim sebagai null agar backend menyimpannya sebagai NULL.
    const payload = {
      title: form.title,
      description: form.description,
      repo_url: form.repoUrl.trim() === "" ? null : form.repoUrl.trim(),
      demo_url: form.demoUrl.trim() === "" ? null : form.demoUrl.trim(),
      tech: form.tech,
    };

    try {
      if (editing) {
        await updateProject(editing.id, payload);
      } else {
        await createProject(payload);
      }
      onSaved();
    } catch (error: unknown) {
      if (error instanceof HttpError && error.payload.issues) {
        setIssues(groupIssues(error.payload.issues));
        setFormError("Periksa kembali isian yang ditandai.");
      } else {
        setFormError(error instanceof Error ? error.message : "Gagal menyimpan proyek");
      }
    } finally {
      setSaving(false);
    }
  }

  const errorFor = (field: string) => issues[field]?.[0];

  return (
    <form className="admin-form" onSubmit={handleSubmit} noValidate>
      <h3 className="admin-form__title">
        {editing ? `Ubah: ${editing.title}` : "Tambah proyek baru"}
      </h3>

      {formError && (
        <p className="admin-notice admin-notice--error" role="alert">
          {formError}
        </p>
      )}

      <div className="admin-form__grid">
        <div className="admin-field admin-field--full">
          <label className="admin-field__label" htmlFor="project-title">
            Judul
          </label>
          <input
            className="admin-field__control"
            id="project-title"
            value={form.title}
            onChange={(event) => update("title", event.target.value)}
            aria-invalid={Boolean(errorFor("title"))}
            aria-describedby={errorFor("title") ? "project-title-error" : undefined}
            maxLength={120}
            required
          />
          {errorFor("title") && (
            <span className="admin-field__error" id="project-title-error">
              {errorFor("title")}
            </span>
          )}
        </div>

        <div className="admin-field admin-field--full">
          <label className="admin-field__label" htmlFor="project-description">
            Deskripsi
          </label>
          <textarea
            className="admin-field__control"
            id="project-description"
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
            aria-invalid={Boolean(errorFor("description"))}
            aria-describedby={
              errorFor("description") ? "project-description-error" : undefined
            }
            maxLength={1000}
            required
          />
          {errorFor("description") && (
            <span className="admin-field__error" id="project-description-error">
              {errorFor("description")}
            </span>
          )}
        </div>

        <div className="admin-field">
          <label className="admin-field__label" htmlFor="project-repo">
            URL Repositori
          </label>
          <input
            className="admin-field__control"
            id="project-repo"
            type="url"
            value={form.repoUrl}
            onChange={(event) => update("repoUrl", event.target.value)}
            aria-invalid={Boolean(errorFor("repo_url"))}
            aria-describedby={errorFor("repo_url") ? "project-repo-error" : "project-repo-hint"}
            placeholder="https://github.com/…"
          />
          {errorFor("repo_url") ? (
            <span className="admin-field__error" id="project-repo-error">
              {errorFor("repo_url")}
            </span>
          ) : (
            <span className="admin-field__hint" id="project-repo-hint">
              Kosongkan bila tidak ada repositori publik.
            </span>
          )}
        </div>

        <div className="admin-field">
          <label className="admin-field__label" htmlFor="project-demo">
            URL Demo
          </label>
          <input
            className="admin-field__control"
            id="project-demo"
            type="url"
            value={form.demoUrl}
            onChange={(event) => update("demoUrl", event.target.value)}
            aria-invalid={Boolean(errorFor("demo_url"))}
            aria-describedby={errorFor("demo_url") ? "project-demo-error" : "project-demo-hint"}
            placeholder="https://…"
          />
          {errorFor("demo_url") ? (
            <span className="admin-field__error" id="project-demo-error">
              {errorFor("demo_url")}
            </span>
          ) : (
            <span className="admin-field__hint" id="project-demo-hint">
              Kosongkan bila belum ada demo. Tombol demo otomatis disembunyikan.
            </span>
          )}
        </div>

        <div className="admin-field admin-field--full">
          <label className="admin-field__label" htmlFor="project-tech">
            Teknologi
          </label>
          <input
            className="admin-field__control"
            id="project-tech"
            value={form.tech}
            onChange={(event) => update("tech", event.target.value)}
            aria-invalid={Boolean(errorFor("tech"))}
            aria-describedby={errorFor("tech") ? "project-tech-error" : "project-tech-hint"}
            placeholder="React, TypeScript, Express"
            maxLength={200}
          />
          {errorFor("tech") ? (
            <span className="admin-field__error" id="project-tech-error">
              {errorFor("tech")}
            </span>
          ) : (
            <span className="admin-field__hint" id="project-tech-hint">
              Pisahkan dengan koma. Setiap item tampil sebagai tag di kartu proyek.
            </span>
          )}
        </div>
      </div>

      <div className="admin-form__actions">
        <button className="admin-btn admin-btn--primary" type="submit" disabled={saving}>
          {saving ? "Menyimpan…" : editing ? "Simpan perubahan" : "Tambah proyek"}
        </button>
        {editing && (
          <button
            className="admin-btn admin-btn--ghost"
            type="button"
            onClick={onCancel}
            disabled={saving}
          >
            Batal
          </button>
        )}
      </div>
    </form>
  );
}