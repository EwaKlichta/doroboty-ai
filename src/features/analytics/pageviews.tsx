import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { capturePageview } from "./posthog";

export function routeName(pathname: string): string {
  if (/^\/oferty\/[^/]+$/.test(pathname)) return "/oferty/:slug";
  if (/^\/firmy\/[^/]+$/.test(pathname)) return "/firmy/:slug";
  if (/^\/aplikuj\/[^/]+$/.test(pathname)) return "/aplikuj/:slug";
  if (/^\/auth\/[^/]+$/.test(pathname)) return "/auth/:mode";
  if (/^\/app\/aplikacje\/[^/]+\/wyslano$/.test(pathname)) return "/app/aplikacje/:id/wyslano";
  if (/^\/app\/aplikacje\/[^/]+$/.test(pathname)) return "/app/aplikacje/:id";
  if (/^\/app\/kandydaci\/[^/]+$/.test(pathname)) return "/app/kandydaci/:id";
  if (/^\/app\/oferty\/[^/]+$/.test(pathname)) return "/app/oferty/:id";
  const staticRoutes = new Set([
    "/",
    "/oferty",
    "/metodologia",
    "/polityka-prywatnosci",
    "/app",
    "/app/projekty",
    "/app/projekt",
    "/app/onboarding",
    "/app/profil",
    "/app/profil/podglad",
    "/app/zapisane",
    "/app/aplikacje",
    "/app/oferty",
    "/app/organizacja",
    "/app/kandydaci",
    "/app/case",
    "/app/settings",
  ]);
  return staticRoutes.has(pathname) ? pathname : "/unknown";
}

export function PageviewTracker() {
  const { pathname } = useLocation();
  const previous = useRef<string | null>(null);
  useEffect(() => {
    const route = routeName(pathname);
    if (previous.current === route) return;
    previous.current = route;
    capturePageview(route);
  }, [pathname]);
  return null;
}
