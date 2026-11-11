import { Hero } from "./pages/Hero.tsx";
import { Projects } from "./pages/Projects.tsx";
import { Contact } from "./pages/Contact.tsx";
import { SiteHeader } from "./components/layout/SiteHeader.tsx";
import { SiteFooter } from "./components/layout/SiteFooter.tsx";
import { Section } from "./components/layout/Section.tsx";
import { StatsGrid } from "./components/ui/StatsGrid.tsx";
import { ShortcutGrid } from "./components/ui/ShortcutGrid.tsx";
import { SectionHeading } from "./components/ui/SectionHeading.tsx";
import { PROFILE } from "./components/content/site.ts";

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Lompat ke konten utama
      </a>

      <SiteHeader />

      <main id="main">
        <Hero />

        <Section labelledBy="stats-title" className="section--stats">
          <h2 className="sr-only" id="stats-title">
            Pencapaian singkat
          </h2>
          <StatsGrid />
        </Section>

        {/* `#tentang` dan `#skill` sengaja jadi dua section terpisah supaya tiap
            menu navigasi punya pita scroll sendiri dan tidak saling menimpa. */}
        <Section id="tentang" labelledBy="tentang-title" className="section--shortcuts">
          <SectionHeading
            id="tentang-title"
            accent="Saya"
            lead={`${PROFILE.name} — ${PROFILE.role} yang berbasis di ${PROFILE.location}. Saya membangun aplikasi web end-to-end: dari perancangan antarmuka, API, sampai basis data.`}
          >
            Tentang
          </SectionHeading>
        </Section>

        <Section id="skill" labelledBy="skill-title" className="section--shortcuts">
          <SectionHeading id="skill-title" accent="Portofolio">
            Jelajahi
          </SectionHeading>
          <ShortcutGrid />
        </Section>

        <Projects />
        <Contact />
      </main>

      <SiteFooter />
    </>
  );
}

