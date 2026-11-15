import posthog, { type CaptureResult } from "posthog-js";

const token = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN;
const host = import.meta.env.VITE_POSTHOG_HOST;
export let analyticsEnabled = Boolean(token && host);

const allowedEvents = new Set([
  "$pageview",
  "$autocapture",
  "$snapshot",
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
  // Replay data is masked by the recorder before it reaches before_send.
  // Keep its transport fields so PostHog can assemble the recording.
  if (event.event === "$snapshot") return event;
  const properties = {
    token: projectToken,
    distinct_id: distinctId,
    $process_person_profile: false,
  };
  if (event.event === "$autocapture") {
    if (event.properties?.$event_type !== "click" || !Array.isArray(event.properties?.$elements))
      return null;
    const elements = event.properties.$elements.map((element: unknown) => {
      if (!element || typeof element !== "object") return null;
      const value = element as Record<string, unknown>;
      return {
        tag_name: typeof value.tag_name === "string" ? value.tag_name : undefined,
        nth_child: typeof value.nth_child === "number" ? value.nth_child : undefined,
        nth_of_type: typeof value.nth_of_type === "number" ? value.nth_of_type : undefined,
        ...(value["attr__data-attr"] === "home-audience-employer"
          ? { "attr__data-attr": "home-audience-employer" }
          : {}),
      };
    });
    const currentUrl = event.properties.$current_url;
    if (typeof currentUrl !== "string") return null;
    let origin: string;
    try {
      const url = new URL(currentUrl);
      if (!/^https?:$/.test(url.protocol)) return null;
      origin = url.origin;
    } catch {
      return null;
    }
    return {
      uuid: event.uuid,
      event: event.event,
      timestamp: event.timestamp,
      properties: {
        ...properties,
        $event_type: "click",
        $elements: elements,
        $el_text:
          typeof event.properties.$el_text === "string"
            ? event.properties.$el_text.slice(0, 100)
            : undefined,
        $current_url: `${origin}/#/`,
      },
    };
  }
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
      autocapture: {
        dom_event_allowlist: ["click"],
        element_allowlist: ["button"],
        css_selector_allowlist: ["[data-ph-autocapture-public]"],
      },
      capture_pageview: false,
      capture_pageleave: false,
      capture_exceptions: false,
      capture_performance: false,
      disable_session_recording: false,
      disable_capture_url_hashes: true,
      enable_recording_console_log: false,
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: "*",
        maskAllElementAttributes: true,
        blockSelector: "iframe, canvas, video, img, input[type='file']",
        recordCrossOriginIframes: false,
        recordHeaders: false,
        recordBody: false,
        captureJsonLd: false,
      },
      disable_surveys: true,
      disable_web_experiments: true,
      advanced_disable_flags: false,
      before_send: limitEvent,
      loaded: (instance) => {
        instance.startSessionRecording(true);
      },
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
