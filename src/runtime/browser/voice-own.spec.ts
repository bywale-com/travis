import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runtimeBaseUrl } from "../desk";
import { closePhone, launchPhone } from "./harness";
import { LIVE_OWNERSHIP_MOCKS } from "./injections";

const haveUrl = Boolean(runtimeBaseUrl());

describe("browser voice-own", { skip: !haveUrl }, () => {
  it("Voice + Travis connecting/connected never starts SpeechRecognition", async () => {
    const phone = await launchPhone({ initScript: LIVE_OWNERSHIP_MOCKS });
    try {
      await phone.page.getByText(/Talking with Travis|Reconnecting|Listening/i).first().waitFor({
        timeout: 20_000,
      });
      await phone.page.waitForTimeout(3500);
      const starts = await phone.page.evaluate(
        () => (window as unknown as { __travisSttStarts?: number }).__travisSttStarts ?? 0,
      );
      assert.equal(starts, 0, "SpeechRecognition must not start while Live owns the mic");
      const draft = await phone.page.locator("p").filter({ hasText: /hello|draft|stream-arch/i }).count();
      assert.equal(draft, 0, "no Talk draft while Live owns the microphone");
    } finally {
      await closePhone(phone);
    }
  });
});
