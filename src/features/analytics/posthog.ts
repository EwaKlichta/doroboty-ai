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
  const projectToken = event.properties?.token;
  const distinctId = event.properties?.distinct_id;
  if (typeof projectToken !== "string" || typeof distinctId !== "string") return null;
  const properties = {
    token: projectToken,
    distinct_id: distinctId,
    $process_person_profile: false,
  };
  if (event.event !== "$pageview")
    return { uuid: event.uuid, event: event.event, timestamp: event.timestamp, properties };
  const pathname = event.properties?.$pathname;
  const currentUrl = event.properties?.$current_url;
  if (typeof pathname !== "string" || typeof currentUrl !== "string") return null;
  return {
    uuid: event.uuid,
    event: event.event,
    timestamp: event.timestamp,
    properties: { ...properties, $pathname: pathname, $current_url: currentUrl },
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
      advanced_disable_flags: true,
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
