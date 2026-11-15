import posthog, { type CaptureResult } from "posthog-js";

const token = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN;
const host = import.meta.env.VITE_POSTHOG_HOST;
export let analyticsEnabled = Boolean(token && host);

const allowedEvents = new Set([
  "$pageview",
  "application_submitted",
  "job_saved",
  "recruitment_stage_changed",
  "project_saved",
]);

export function limitEvent(event: CaptureResult | null): CaptureResult | null {
  if (!event || !allowedEvents.has(event.event)) return null;
  if (event.event !== "$pageview")
    return { ...event, properties: { $process_person_profile: false } };
  const pathname = event.properties?.$pathname;
  const currentUrl = event.properties?.$current_url;
  if (typeof pathname !== "string" || typeof currentUrl !== "string") return null;
  return {
    ...event,
    properties: { $pathname: pathname, $current_url: currentUrl, $process_person_profile: false },
  };
}

if (analyticsEnabled) {
  try {
    posthog.init(token, {
      api_host: host,
      defaults: "2026-08-30",
      persistence: "memory",
      person_profiles: "never",
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      capture_exceptions: false,
      capture_performance: false,
      disable_session_recording: true,
      disable_surveys: true,
      disable_web_experiments: true,
      before_send: limitEvent,
    });
  } catch {
    analyticsEnabled = false;
  }
}

export function captureEvent(
  name: "application_submitted" | "job_saved" | "recruitment_stage_changed" | "project_saved",
) {
  if (!analyticsEnabled || !allowedEvents.has(name)) return;
  try {
    posthog.capture(name);
  } catch {
    // Telemetry must not change the result of a local scenario action.
  }
}

export function capturePageview(route: string) {
  if (!analyticsEnabled) return;
  const safeUrl = `${window.location.origin}/#${route}`;
  try {
    posthog.capture("$pageview", { $pathname: route, $current_url: safeUrl });
  } catch {
    // Navigation remains usable if analytics is unavailable.
  }
}

export { posthog };
