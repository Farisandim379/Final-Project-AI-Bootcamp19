import { Badge } from "../components/ui/Badge.tsx";
import { Button } from "../components/ui/Button.tsx";
import { SocialLinks } from "../components/ui/SocialLinks.tsx";
import { IconArrowRight } from "../components/icons/index.ts";
import { CONTACT_INFO, PROFILE, TECH_STACK } from "../components/content/site.ts";

export function Hero() {
  return (
    <section className="hero" id="hero" aria-labelledby="hero-title">
      <div className="container hero__inner">
        <div className="hero__layout">
          <figure className="hero__figure">
            <img
              className="hero__photo"
              src={PROFILE.photo.src}
              alt={PROFILE.photo.alt}
              width={PROFILE.photo.width}
              height={PROFILE.photo.height}
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          </figure>

          <div className="hero__content">
            <Badge>Tersedia untuk proyek baru &amp; kontrak freelance</Badge>

            <h1 className="hero__title" id="hero-title">
              <span className="hero__title-line">Membangun Solusi Web Modern dengan</span>{" "}
              <span className="hero__title-line">
                <span className="hero__title-accent">Pengalaman Digital</span> yang Memukau.
              </span>
            </h1>

            <p className="hero__lead">
              {PROFILE.role} berbasis di {PROFILE.location}. Saya merancang dan
              membangun antarmuka yang cepat, aksesibel, serta menyelesaikan
              masalah nyata pengguna.
            </p>

            <div className="hero__actions">
              <Button href="#proyek" variant="primary" icon={<IconArrowRight width={18} height={18} />}>
                Eksplorasi Proyek
              </Button>
              <Button href="#tentang" variant="ghost">
                Tentang Saya
              </Button>
            </div>

            <p className="hero__stack">
              {TECH_STACK.map((item, index) => (
                <span key={item}>
                  {index > 0 && <span aria-hidden="true"> · </span>}
                  {item}
                </span>
              ))}
            </p>

            <SocialLinks links={CONTACT_INFO.socials} variant="inline" />
          </div>
        </div>

        <div className="hero__divider" aria-hidden="true" />
      </div>
    </section>
  );
}
