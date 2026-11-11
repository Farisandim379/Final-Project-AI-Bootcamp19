import { useState } from "react";

import { MessageInbox } from "./MessageInbox.tsx";
import { ProjectManager } from "./ProjectManager.tsx";

type Tab = "inbox" | "projects";

const TABS: { id: Tab; label: string }[] = [
  { id: "inbox", label: "Pesan Masuk" },
  { id: "projects", label: "Proyek" },
];

export function AdminApp() {
  const [tab, setTab] = useState<Tab>("inbox");
  const [messageCount, setMessageCount] = useState<number | null>(null);
  const [projectCount, setProjectCount] = useState<number | null>(null);

  return (
    <div className="admin">
      <div className="admin__inner">
        <header className="admin__header">
          <div>
            <p className="admin__eyebrow">Dashboard</p>
            <h1 className="admin__title">Panel Backend Portofolio</h1>
            <p className="admin__lead">
              Kelola pesan dari formulir kontak dan daftar proyek yang tampil di
              halaman publik.
            </p>
          </div>
          <a className="admin__back" href="/">
            ← Lihat halaman publik
          </a>
        </header>

        <div className="admin-tabs" role="tablist" aria-label="Bagian dashboard">
          {TABS.map((item) => (
            <button
              key={item.id}
              className="admin-tabs__tab"
              type="button"
              role="tab"
              id={`tab-${item.id}`}
              aria-selected={tab === item.id}
              aria-controls={`panel-${item.id}`}
              onClick={() => setTab(item.id)}
            >
              {item.label}
              {item.id === "inbox" && messageCount !== null && (
                <span className="admin-tabs__count">({messageCount})</span>
              )}
              {item.id === "projects" && projectCount !== null && (
                <span className="admin-tabs__count">({projectCount})</span>
              )}
            </button>
          ))}
        </div>

        {/* Panel tidak di-mount saat tidak aktif agar fetch tidak berjalan sia-sia. */}
        {tab === "inbox" ? (
          <section id="panel-inbox" role="tabpanel" aria-labelledby="tab-inbox">
            <MessageInbox onCountChange={setMessageCount} />
          </section>
        ) : (
          <section id="panel-projects" role="tabpanel" aria-labelledby="tab-projects">
            <ProjectManager onCountChange={setProjectCount} />
          </section>
        )}
      </div>
    </div>
  );
}