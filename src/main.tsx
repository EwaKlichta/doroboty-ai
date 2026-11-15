import { PostHogErrorBoundary, PostHogProvider } from "@posthog/react";
import posthog from "posthog-js";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./features/prototype/app";
import { DiagnosticBoundary } from "./features/prototype/diagnostic-boundary";
import { installDiagnosticHandlers } from "./features/prototype/diagnostics";
import { prototypeLogger } from "./lib/posthog-logger";
import "./app/globals.css";

const posthogToken = import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN;
const posthogHost = import.meta.env.VITE_PUBLIC_POSTHOG_HOST;

if (posthogToken && posthogHost) {
  posthog.init(posthogToken, {
    api_host: posthogHost,
    defaults: "2026-08-30",
    capture_exceptions: {
      capture_unhandled_errors: true,
      capture_unhandled_rejections: true,
      capture_console_errors: false,
    },
    logs: {
      serviceName: "doroboty-ai-case-web",
      environment: import.meta.env.MODE,
    },
  });
  prototypeLogger.info("prototype application initialized", { router: "hash" });
} else if (import.meta.env.DEV) {
  const missingVariable = posthogToken
    ? "VITE_PUBLIC_POSTHOG_HOST"
    : "VITE_PUBLIC_POSTHOG_PROJECT_TOKEN";
  console.error(
    new Error(
      `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
    ),
  );
}

const application = (
  <DiagnosticBoundary>
    <App />
  </DiagnosticBoundary>
);

installDiagnosticHandlers();
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PostHogProvider client={posthog}>
      {posthog.__loaded ? <PostHogErrorBoundary>{application}</PostHogErrorBoundary> : application}
    </PostHogProvider>
  </StrictMode>,
);
