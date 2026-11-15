import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./features/prototype/app";
import { DiagnosticBoundary } from "./features/prototype/diagnostic-boundary";
import { installDiagnosticHandlers } from "./features/prototype/diagnostics";
import { PostHogProvider } from "@posthog/react";
import { analyticsEnabled, posthog } from "./features/analytics/posthog";
import "./app/globals.css";
installDiagnosticHandlers();
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DiagnosticBoundary>
      {analyticsEnabled ? (
        <PostHogProvider client={posthog}>
          <App />
        </PostHogProvider>
      ) : (
        <App />
      )}
    </DiagnosticBoundary>
  </StrictMode>,
);
