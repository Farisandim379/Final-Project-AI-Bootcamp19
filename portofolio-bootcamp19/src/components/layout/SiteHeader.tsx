import { useCallback, useEffect, useRef, useState } from "react";

import { BRAND, NAV_LINKS } from "../content/site.ts";
import { IconClose, IconMenu } from "../icons/index.ts";

/** Tinggi header dipakai sebagai garis batas atas scroll spy. */
const HEADER_FALLBACK_PX = 72;
/**
 * Tambahan kecil di atas `scroll-padding-top` html. Anchor berhenti tepat di
 * `scroll-padding-top`; garis batas harus sedikit di bawahnya supaya section
 * yang baru dituju tidak langsung dianggap "belum terlewati".
 */
const ACTIVATION_SLACK_PX = 16;
/** Di bawah ambang ini dianggap masih di paling atas halaman. */
const TOP_THRESHOLD_PX = 10;
/** Toleransi pembulatan untuk deteksi dasar halaman. */
const BOTTOM_TOLERANCE_PX = 4;
/** Jeda tanpa scroll yang menandakan smooth scroll sudah selesai. */
const SCROLL_SETTLE_MS = 150;
/** Batas aman bila smooth scroll tidak pernah memicu event scroll. */
const LOCK_MAX_MS = 1500;

const HOME_HREF = NAV_LINKS[0].href;
const LAST_HREF = NAV_LINKS[NAV_LINKS.length - 1].href;
const HREF_SET = new Set(NAV_LINKS.map((link) => link.href));

/** Hash awal yang valid, supaya tautan langsung seperti `/#proyek` tetap aktif. */
function hrefFromLocation(): string | null {
  const { hash } = window.location;
  return hash && HREF_SET.has(hash) ? hash : null;
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(() => hrefFromLocation() ?? HOME_HREF);
  const headerRef = useRef<HTMLElement | null>(null);
  /** Diisi saat klik/hash: scroll spy berhenti menimpa active sampai waktu habis. */
  const lockUntilRef = useRef(0);
  /** Memperpanjang/melepas kunci; diisi oleh efek scroll spy. */
  const releaseLockRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    // Hanya elemen target yang benar-benar ada di DOM.
    const targets = NAV_LINKS.map((link) => ({
      href: link.href,
      el: document.getElementById(link.href.slice(1)),
    })).filter((entry): entry is { href: string; el: HTMLElement } => entry.el !== null);

    if (targets.length === 0) return;

    function headerHeight(): number {
      return headerRef.current?.offsetHeight ?? HEADER_FALLBACK_PX;
    }

    /**
     * Garis batas aktivasi. Anchor berhenti di `scroll-padding-top` html, jadi
     * garis batas harus berada di bawahnya agar section tujuan langsung aktif.
     */
    function activationLine(): number {
      const scrollPadding =
        Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      return Math.max(headerHeight(), scrollPadding) + ACTIVATION_SLACK_PX;
    }

    function isAtBottom(): boolean {
      const scrolled = window.innerHeight + window.scrollY;
      return scrolled >= document.documentElement.scrollHeight - BOTTOM_TOLERANCE_PX;
    }

    /** Section terakhir (paling bawah) yang top-nya sudah melewati garis batas. */
    function sectionAtScrollLine(): string | null {
      const line = activationLine();
      let current: string | null = null;

      for (const { href, el } of targets) {
        if (el.getBoundingClientRect().top <= line) current = href;
      }

      return current;
    }

    function syncActive() {
      // Saat smooth scroll dari klik sedang berjalan, jangan ubah active.
      if (Date.now() < lockUntilRef.current) return;

      if (window.scrollY <= TOP_THRESHOLD_PX) {
        setActive(HOME_HREF);
        return;
      }

      if (isAtBottom()) {
        setActive(LAST_HREF);
        return;
      }

      const href = sectionAtScrollLine();
      if (href) setActive(href);
    }

    let frame = 0;
    function scheduleSync() {
      if (frame !== 0) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        syncActive();
      });
    }

    /**
     * Bekukan scroll spy sampai posisi scroll benar-benar berhenti (smooth scroll
     * bisa memakan waktu berbeda-beda tergantung jarak), lalu sinkronkan sekali.
     */
    let settleTimer = 0;

    function releaseLockWhenSettled() {
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        lockUntilRef.current = 0;
        // Beri kesempatan posisi final terpasang sebelum menghitung ulang.
        scheduleSync();
      }, SCROLL_SETTLE_MS);
    }

    releaseLockRef.current = releaseLockWhenSettled;

    function holdActive(href: string) {
      lockUntilRef.current = Date.now() + LOCK_MAX_MS;
      setActive(href);
      releaseLockWhenSettled();
    }

    function onScroll() {
      if (Date.now() < lockUntilRef.current) {
        // Masih terkunci dan halaman bergerak: perpanjang masa kunci agar
        // smooth scroll yang panjang tidak terpotong di tengah jalan.
        lockUntilRef.current = Date.now() + LOCK_MAX_MS;
        releaseLockWhenSettled();
        return;
      }
      scheduleSync();
    }

    function onHashChange() {
      const href = hrefFromLocation();
      if (href) {
        holdActive(href);
        return;
      }
      scheduleSync();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", scheduleSync);
    window.addEventListener("hashchange", onHashChange);

    // Buka URL dengan hash (mis. `/#proyek`): elemen baru ada setelah React
    // merender, jadi scroll bawaan browser tidak terjadi. Tangani manual.
    const initialHref = hrefFromLocation();
    const initialTarget = initialHref
      ? targets.find((entry) => entry.href === initialHref)
      : undefined;

    if (initialHref && initialTarget) {
      holdActive(initialHref);
      // `scroll-padding-top` di html membuat judul section tidak tertutup header.
      initialTarget.el.scrollIntoView({ block: "start", behavior: "auto" });
    } else {
      syncActive();
    }

    return () => {
      if (frame !== 0) window.cancelAnimationFrame(frame);
      window.clearTimeout(settleTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", scheduleSync);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  /**
   * Klik navigasi: set active segera, tutup menu seluler, dan bekukan scroll spy
   * selama smooth scroll agar garis aktif tidak melompat ke menu yang dilewati.
   */
  const handleNavigate = useCallback((href: string) => {
    lockUntilRef.current = Date.now() + LOCK_MAX_MS;
    setActive(href);
    setOpen(false);
    // Tanpa scroll (mis. klik link yang sudah aktif) kunci tetap dilepas.
    releaseLockRef.current();
  }, []);

  return (
    <header className="site-header" ref={headerRef}>
      <div className="container site-header__inner">
        <a className="brand" href="#main" aria-label={`${BRAND.name} — beranda`}>
          <span className="brand__mark" aria-hidden="true">
            {BRAND.monogram}
          </span>
          <span className="brand__name">
            {/* Nama pendek di layar sempit, nama lengkap mulai tablet. */}
            <span className="brand__name-short">{BRAND.shortName}</span>
            <span className="brand__name-full">{BRAND.name}</span>
          </span>
        </a>

        <button
          className="nav-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <IconClose width={24} height={24} /> : <IconMenu width={24} height={24} />}
          <span className="sr-only">{open ? "Tutup menu" : "Buka menu"}</span>
        </button>

        <nav
          className={`nav${open ? " nav--open" : ""}`}
          id="primary-nav"
          aria-label="Navigasi utama"
        >
          <ul className="nav__list">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  className={`nav__link${active === link.href ? " nav__link--active" : ""}`}
                  href={link.href}
                  aria-current={active === link.href ? "page" : undefined}
                  onClick={() => handleNavigate(link.href)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            className="btn btn--ghost nav__cta"
            href={BRAND.ctaHref}
            onClick={() => handleNavigate(BRAND.ctaHref)}
          >
            <span>{BRAND.ctaLabel}</span>
          </a>
        </nav>
      </div>
    </header>
  );
}

