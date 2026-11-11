import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import "./styles/global.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Elemen #root tidak ditemukan di index.html");
}

const root = createRoot(rootElement);

/**
 * Dua entry dalam satu bundle:
 * - `/admin` -> dashboard (dimuat lazy, hanya diunduh saat dibutuhkan)
 * - selain itu -> halaman portofolio publik
 * Tanpa router pihak ketiga karena hanya ada satu rute tambahan.
 */
if (window.location.pathname.replace(/\/+$/, "") === "/admin") {
  // stylesheet dashboard hanya relevan di rute ini
  void import("./styles/admin.css");

  void import("./admin/AdminApp.tsx").then(({ AdminApp }) => {
    root.render(
      <StrictMode>
        <AdminApp />
      </StrictMode>,
    );
  });
} else {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}