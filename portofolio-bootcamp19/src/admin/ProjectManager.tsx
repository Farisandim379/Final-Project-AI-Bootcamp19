import { useCallback, useEffect, useState } from "react";

import { deleteProject, getProjects } from "../lib/api.ts";
import { toProject, type Project } from "../lib/project.ts";
import { AdminEmpty, AdminNotice, formatDateTime } from "./AdminNotice.tsx";
import { ProjectForm } from "./ProjectForm.tsx";

type ProjectsState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; projects: Project[] };

export function ProjectManager({
  onCountChange,
}: {
  onCountChange: (count: number) => void;
}) {
  const [state, setState] = useState<ProjectsState>({ status: "loading" });
  const [editing, setEditing] = useState<Project | null>(null);
    /** Dinaikkan setelah simpan agar form ter-mount ulang dengan isian kosong. */
    const [formVersion, setFormVersion] = useState(0);
    const [deletingId, setDeletingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      // Baris API memakai snake_case; form bekerja dengan model camelCase.
      const projects = (await getProjects()).map(toProject);
      setState({ status: "ready", projects });
      onCountChange(projects.length);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal memuat proyek";
      setState({ status: "error", message });
    }
  }, [onCountChange]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleDelete(project: Project) {
    setDeletingId(project.id);
    setActionError(null);
    setActionSuccess(null);

    try {
      await deleteProject(project.id);
      if (editing?.id === project.id) setEditing(null);
      await load();
      setActionSuccess(`Proyek "${project.title}" dihapus.`);
    } catch (error: unknown) {
      setActionError(error instanceof Error ? error.message : "Gagal menghapus proyek");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSaved() {
    setEditing(null);
    setActionError(null);
    await load();
      // Naikkan versi supaya form kembali ke keadaan kosong setelah tambah.
      setFormVersion((version) => version + 1);
      setActionSuccess("Proyek berhasil disimpan.");
    }

  const projects = state.status === "ready" ? state.projects : [];

  return (
    <div className="admin-panel">
      <div className="admin-panel__bar">
        <h2 className="admin-panel__title">Kelola Proyek</h2>
        <button
          className="admin-btn admin-btn--ghost admin-btn--sm"
          type="button"
          onClick={() => void load()}
        >
          Muat ulang
        </button>
      </div>
      <p className="admin-panel__hint">
        Proyek di sini yang tampil di halaman publik <code>#proyek</code>.
      </p>

      {actionError && (
        <AdminNotice tone="error" role="alert">
          {actionError}
        </AdminNotice>
      )}

      {actionSuccess && <AdminNotice tone="success">{actionSuccess}</AdminNotice>}

      <ProjectForm
              key={`${editing?.id ?? "new"}-${formVersion}`}
        editing={editing}
        onSaved={() => void handleSaved()}
        onCancel={() => setEditing(null)}
      />

      {state.status === "loading" && <AdminNotice>Memuat proyek…</AdminNotice>}

      {state.status === "error" && (
        <AdminNotice tone="error" role="alert">
          {state.message}
        </AdminNotice>
      )}

      {state.status === "ready" && projects.length === 0 && (
        <AdminEmpty>Belum ada proyek. Tambahkan lewat formulir di atas.</AdminEmpty>
      )}

      {state.status === "ready" && projects.length > 0 && (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <caption className="admin-table__caption">
                    {projects.length} proyek terdaftar
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Proyek</th>
                      <th scope="col">Tautan</th>
                      <th scope="col">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => (
                      <tr key={project.id}>
                        <td>
                          <div className="admin-table__title">{project.title}</div>
                          <div className="admin-table__meta">
                            {project.tech.length > 0 ? project.tech.join(" · ") : "tanpa tech"}
                          </div>
                          <div className="admin-table__meta">
                            Ditambahkan {formatDateTime(project.createdAt)}
                          </div>
                        </td>
                        <td>
                          <div className="admin-table__meta">repo: {project.repoUrl ?? "—"}</div>
                          <div className="admin-table__meta">demo: {project.demoUrl ?? "—"}</div>
                        </td>
                        <td>
                          <div className="admin-table__actions">
                            <button
                              className="admin-btn admin-btn--ghost admin-btn--sm"
                              type="button"
                              onClick={() => setEditing(project)}
                            >
                              Ubah
                            </button>
                            <button
                              className="admin-btn admin-btn--danger admin-btn--sm"
                              type="button"
                              disabled={deletingId === project.id}
                              onClick={() => void handleDelete(project)}
                            >
                              {deletingId === project.id ? "Menghapus…" : "Hapus"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
    </div>
  );
}