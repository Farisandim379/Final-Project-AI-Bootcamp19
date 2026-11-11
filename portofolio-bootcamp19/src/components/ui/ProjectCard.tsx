import type { Project } from "../../lib/api.ts";
import { IconArrowUpRight, IconCode } from "../icons/index.ts";
import { PROJECT_THUMB_GRADIENT } from "../content/site.ts";

function splitTech(tech: string): string[] {
  return tech
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
}

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const tech = splitTech(project.tech);
  const thumb = PROJECT_THUMB_GRADIENT[index % PROJECT_THUMB_GRADIENT.length];

  return (
    <article className="card card--project">
      <div className="project-card__thumb" style={{ backgroundImage: thumb }} aria-hidden="true">
        <span className="project-card__thumb-mark">{project.title.slice(0, 2).toUpperCase()}</span>
      </div>

      <div className="project-card__body">
        <h3 className="card__title">{project.title}</h3>
        <p className="card__desc">{project.description}</p>

        {tech.length > 0 && (
          <ul className="card__tech" aria-label={`Teknologi ${project.title}`}>
            {tech.map((item) => (
              <li className="tag" key={item}>
                {item}
              </li>
            ))}
          </ul>
        )}

        {(project.demo_url || project.repo_url) && (
          <div className="card__links">
            {project.demo_url && (
              <a className="card__link" href={project.demo_url} target="_blank" rel="noopener noreferrer">
                <IconArrowUpRight width={16} height={16} />
                <span>
                  Demo Langsung<span className="sr-only"> — {project.title}</span>
                </span>
              </a>
            )}
            {project.repo_url && (
              <a className="card__link" href={project.repo_url} target="_blank" rel="noopener noreferrer">
                <IconCode width={16} height={16} />
                <span>
                  Kode Sumber<span className="sr-only"> — {project.title}</span>
                </span>
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
