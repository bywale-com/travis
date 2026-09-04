import assert from "node:assert/strict";
import { test } from "node:test";
import {
  interpretRealtimeEvent,
  liveInstructions,
  openaiErrorMessage,
  parseEphemeralSecret,
  realtimeSessionConfig,
  responsesText,
  toRealtimeTools,
} from "./travis-openai";

test("parseEphemeralSecret reads value or nested client_secret", () => {
  assert.equal(parseEphemeralSecret({ value: "ek_abc" }), "ek_abc");
  assert.equal(
    parseEphemeralSecret({ client_secret: { value: "ek_nested" } }),
    "ek_nested",
  );
  assert.equal(parseEphemeralSecret({}), null);
  assert.equal(parseEphemeralSecret(null), null);
});

test("openaiErrorMessage prefers the API error string", () => {
  assert.equal(
    openaiErrorMessage({ error: { message: "invalid_api_key" } }, 401),
    "invalid_api_key",
  );
  assert.equal(openaiErrorMessage({}, 500), "OpenAI 500");
});

test("toRealtimeTools keeps existing port names", () => {
  const tools = toRealtimeTools([
    {
      name: "list_seats",
      description: "List room addressees",
      parameters: { type: "object", properties: {} },
    },
  ]);
  assert.equal(tools[0].type, "function");
  assert.equal(tools[0].name, "list_seats");
});

test("liveInstructions keeps Here on the system; empty here is system only", () => {
  assert.equal(liveInstructions("You are Travis.", ""), "You are Travis.");
  assert.match(
    liveInstructions("You are Travis.", "Here:\nDest Travis."),
    /Here:\nDest Travis\./,
  );
});

test("realtimeSessionConfig pins audio out and tools", () => {
  const cfg = realtimeSessionConfig({
    instructions: "You are Travis.",
    tools: [
      {
        name: "end_session",
        description: "End this room.",
        parameters: { type: "object", properties: {} },
      },
    ],
  });
  assert.equal(cfg.type, "realtime");
  assert.equal(cfg.model.startsWith("gpt-realtime"), true);
  assert.equal(cfg.audio.output.voice, "cedar");
  assert.equal(cfg.tools[0].name, "end_session");
});

test("interpretRealtimeEvent holds user speech across a hitch", () => {
  const delta = interpretRealtimeEvent({
    type: "conversation.item.input_audio_transcription.delta",
    delta: "for the p.m.",
  });
  assert.deepEqual(delta, [{ op: "user_delta", text: "for the p.m." }]);
  const done = interpretRealtimeEvent({
    type: "conversation.item.input_audio_transcription.completed",
    transcript: "for the p.m. log this",
  });
  assert.deepEqual(done, [{ op: "user_flush", text: "for the p.m. log this" }]);
});

test("interpretRealtimeEvent folds Travis audio into the log then tools", () => {
  assert.deepEqual(
    interpretRealtimeEvent({
      type: "response.output_audio_transcript.delta",
      delta: "Sent to Engineer.",
    }),
    [{ op: "travis_delta", text: "Sent to Engineer." }],
  );
  const done = interpretRealtimeEvent({
    type: "response.done",
    response: {
      output: [
        {
          type: "function_call",
          name: "send_to_seat",
          call_id: "call_1",
          arguments: '{"seat":"engineer","text":"look at the queue"}',
        },
      ],
    },
  });
  assert.equal(done[0].op, "travis_flush");
  assert.equal(done[1]?.op, "tools");
  if (done[1]?.op === "tools") {
    assert.equal(done[1].calls[0].name, "send_to_seat");
    assert.equal(done[1].calls[0].args.seat, "engineer");
  }
});

test("responsesText reads output_text or message parts", () => {
  assert.equal(responsesText({ output_text: "hey" }), "hey");
  assert.equal(
    responsesText({
      output: [
        {
          type: "message",
          content: [{ type: "output_text", text: "wired" }],
        },
      ],
    }),
    "wired",
  );
});
