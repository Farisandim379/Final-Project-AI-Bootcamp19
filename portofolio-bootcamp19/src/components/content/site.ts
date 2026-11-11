/**
 * Konten statis hasil ekstraksi teks dari Figma (canvas 7:2).
 * Dipisah dari JSX agar teks desain mudah disunting tanpa menyentuh komponen.
 */

export interface NavLink {
  label: string;
  href: string;
}

/**
 * Setiap `href` WAJIB menunjuk ke sebuah `id` yang benar-benar dirender
 * oleh App.tsx / halaman (lihat pemetaan di App.tsx).
 */
export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "#hero" },
  { label: "Tentang", href: "#tentang" },
  { label: "Keahlian", href: "#skill" },
  { label: "Proyek", href: "#proyek" },
  { label: "Kontak", href: "#kontak" },
];

export const BRAND = {
  monogram: "FA",
  name: "Faris Andi Muhammad",
  shortName: "Faris",
  ctaLabel: "Hubungi Saya",
  ctaHref: "#kontak",
} as const;

/** Profil pribadi: dipakai hero (foto + identitas) dan footer. */
export const PROFILE = {
  name: "Faris Andi Muhammad",
  shortName: "Faris",
  role: "Full Stack Developer",
  location: "Yogyakarta",
  /** Alt text deskriptif — wajib, jangan dikosongkan. */
  photo: {
    src: "/profile.jpg",
    alt: "Foto profil Faris Andi Muhammad, Full Stack Developer berbasis di Yogyakarta",
    width: 1088,
    height: 1456,
  },
} as const;

export interface Stat {
  value: string;
  label: string;
}

/** Figma 01-home, blok "Stats" (1080x126, tiga kartu). */
export const STATS: Stat[] = [
  { value: "3+ Tahun", label: "Pengalaman Industri Nyata" },
  { value: "25+ Proyek", label: "Selesai & Beroperasi di Production" },
  { value: "99%", label: "Tingkat Kepuasan Klien & Partner" },
];

export type ShortcutIcon = "user" | "layers" | "folder";

export interface Shortcut {
  icon: ShortcutIcon;
  title: string;
  description: string;
  href: string;
}

/** Figma 01-home, blok "Shortcuts" (1080x250, tiga kartu). */
export const SHORTCUTS: Shortcut[] = [
  {
    icon: "user",
    title: "Tentang Saya",
    description: "Perjalanan, nilai, dan filosofi kerja.",
    href: "#tentang",
  },
  {
    icon: "layers",
    title: "Skill & Keahlian",
    description: "Teknologi yang saya gunakan sehari-hari.",
    href: "#skill",
  },
  {
    icon: "folder",
    title: "Proyek & Karya",
    description: "Studi kasus dan pekerjaan terpilih.",
    href: "#proyek",
  },
];

/** Figma 01-home, baris mono di bawah CTA hero. */
export const TECH_STACK = [
  "React 19",
  "Next.js 15",
  "TypeScript",
  "Node.js",
  "Tailwind CSS",
];

export interface SocialLink {
  icon: "linkedin" | "github" | "x";
  label: string;
  href: string;
}

export const CONTACT_INFO = {
  eyebrow: "Surat terbuka",
  email: "farisandi458@gmail.com",
  lead: "Punya ide, kebutuhan produk, atau ingin berdiskusi teknis? Saya membaca setiap pesan yang masuk.",
  socials: [
    {
      icon: "linkedin",
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/faris-andi-muhammad",
    },
    { icon: "github", label: "GitHub", href: "https://github.com/farisandim379" },
    { icon: "x", label: "X (Twitter)", href: "https://x.com/" },
  ] as SocialLink[],
} as const;

export const FOOTER = {
  copyright: "© 2024 Faris Andi Muhammad. All rights reserved.",
  dedication: "Faris Andi Muhammad — Dibuat dengan dedikasi & passion.",
} as const;

/** Placeholder thumbnail project: Figma belum menyediakan gambar (hanya rect). */
export const PROJECT_THUMB_GRADIENT = [
  "linear-gradient(135deg, #0B1D26 0%, #2A1D57 100%)",
  "linear-gradient(135deg, #1A1440 0%, #4F5BD5 100%)",
  "linear-gradient(135deg, #3B1F6E 0%, #22E5F5 100%)",
  "linear-gradient(135deg, #0B1D26 0%, #4F5BD5 100%)",
];


