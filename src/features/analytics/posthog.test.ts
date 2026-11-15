import { describe, expect, it } from "vitest";
import type { CaptureResult } from "posthog-js";
import { limitEvent } from "./posthog";
import { routeName } from "./pageviews";

describe("PostHog payload boundary", () => {
  it("removes SDK and scenario properties from workflow events", () => {
    const event = {
      uuid: "test-event-1",
      event: "application_submitted",
      properties: {
        token: "phc_test",
        distinct_id: "temporary-session-id",
        answer: "private answer",
        $current_url: "https://example.test/#/aplikuj/private-id?query=private",
        $elements: [{ text: "private answer" }],
      },
      $set: { email: "private@example.test" },
    } as CaptureResult;
    expect(limitEvent(event)?.properties).toEqual({
      token: "phc_test",
      distinct_id: "temporary-session-id",
      $process_person_profile: false,
    });
    expect(limitEvent(event)?.$set).toBeUndefined();
    expect(limitEvent({ ...event, event: "$autocapture" })).toBeNull();
  });

  it("keeps only normalized pageview fields", () => {
    const event = {
      uuid: "test-event-2",
      event: "$pageview",
      properties: {
        token: "phc_test",
        distinct_id: "temporary-session-id",
        $pathname: "/oferty/:slug",
        $current_url: "https://example.test/#/oferty/:slug",
        $referrer: "https://example.test/private",
      },
    } as CaptureResult;
    expect(limitEvent(event)?.properties).toEqual({
      token: "phc_test",
      distinct_id: "temporary-session-id",
      $pathname: "/oferty/:slug",
      $current_url: "https://example.test/#/oferty/:slug",
      $process_person_profile: false,
    });
    expect(limitEvent({ ...event, properties: { $pathname: "/oferty/:slug" } })).toBeNull();
  });

  it("replaces variable route segments before capture", () => {
    expect(routeName("/oferty/candidate-name")).toBe("/oferty/:slug");
    expect(routeName("/app/kandydaci/application-id")).toBe("/app/kandydaci/:id");
    expect(routeName("/app/aplikacje/application-id/wyslano")).toBe("/app/aplikacje/:id/wyslano");
    expect(routeName("/some-private-route")).toBe("/unknown");
  });
});
