import { FOOTER } from "../content/site.ts";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <p className="site-footer__copyright">{FOOTER.copyright}</p>
        <p className="site-footer__dedication">{FOOTER.dedication}</p>
      </div>
    </footer>
  );
}
