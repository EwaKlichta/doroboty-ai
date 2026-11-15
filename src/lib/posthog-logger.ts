import posthog from "posthog-js";

type LogAttributes = Record<string, boolean | number | string>;
type DiagnosticCode =
  "storage-write" | "writer-unavailable" | "runtime-error" | "unhandled-rejection" | "render-error";

export const prototypeLogger = {
  info(message: string, attributes: LogAttributes) {
    if (posthog.__loaded) posthog.logger.info(message, attributes);
  },
  diagnostic(code: DiagnosticCode) {
    if (!posthog.__loaded) return;
    const attributes = { diagnostic_code: code };
    if (code === "runtime-error" || code === "unhandled-rejection" || code === "render-error") {
      posthog.logger.error("prototype diagnostic recorded", attributes);
      return;
    }
    posthog.logger.warn("prototype diagnostic recorded", attributes);
  },
};
