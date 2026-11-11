import { useEffect, useState } from "react";

import { getProjects, type Project } from "../lib/api.ts";
import { PageHeader } from "../components/ui/PageHeader.tsx";
import { ProjectCard } from "../components/ui/ProjectCard.tsx";
import { Notice } from "../components/ui/Notice.tsx";
import { IconArrowRight } from "../components/icons/index.ts";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; projects: Project[] };

export function Projects() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let active = true;

    getProjects()
      .then((projects) => {
        if (active) setState({ status: "ready", projects });
      })
      .catch((error: unknown) => {
        if (!active) return;
        const message =
          error instanceof Error ? error.message : "Gagal memuat proyek";
        setState({ status: "error", message });
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="section container" id="proyek" aria-labelledby="proyek-title">
      <PageHeader
        id="proyek-title"
        accent="Pilihan"
        lead="Kumpulan pekerjaan yang saya bangun dari riset, desain, hingga rilis production — dengan fokus pada performa dan kemudahan penggunaan."
      >
        Proyek
      </PageHeader>

      {state.status === "loading" && (
        <Notice role="status">Memuat proyek…</Notice>
      )}

      {state.status === "error" && (
        <Notice tone="error" role="alert">
          {state.message}
        </Notice>
      )}

      {state.status === "ready" && state.projects.length === 0 && (
        <Notice>Belum ada proyek yang ditambahkan.</Notice>
      )}

      {state.status === "ready" && state.projects.length > 0 && (
        <>
          <ul className="project-grid">
            {state.projects.map((project, index) => (
              <li key={project.id}>
                <ProjectCard project={project} index={index} />
              </li>
            ))}
          </ul>

          <div className="projects__more">
            <a className="btn btn--dark" href="#kontak">
              <span>Diskusikan Proyek Berikutnya</span>
              <IconArrowRight width={18} height={18} />
            </a>
          </div>
        </>
      )}
    </section>
  );
}
