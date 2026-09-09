import assert from "node:assert/strict";
import test from "node:test";
import { streamIntent, type StreamOpenJob } from "./stream-intent";

function dest(
  id: string,
  bindingId: string,
  text: string,
  seatKey: string,
  label: string,
): StreamOpenJob {
  return {
    job: { id, payload: { text } },
    binding: { id: bindingId, seatKey, label },
  };
}

test("yesterday is walk-back on the travis thread — no dest", () => {
  const [one] = streamIntent({
    phrase: "What did we do yesterday?",
    openJobs: [],
  });
  assert.equal(one.kind, "new");
  assert.deepEqual(one.target, { kind: "travis-thread" });
});

test("notes plus Technical Architect is a new dest", () => {
  const found = streamIntent({
    phrase: "Put this paragraph in the notes. Send that to Technical Architect.",
    openJobs: [],
  });
  assert.ok(
    found.some(
      (i) => i.kind === "new" && i.target?.kind === "seat" && i.target.seatKey === "pm",
    ),
  );
  assert.equal(
    found.some((i) => i.target?.kind === "dest"),
    false,
  );
});

test("by the way Engineer is a second new dest, not a change", () => {
  const open = [
    dest("job-pm", "bind-pm", "put this in the notes", "pm", "Technical Architect"),
  ];
  const found = streamIntent({
    phrase: "By the way, send that to Engineer as well.",
    openJobs: open,
  });
  assert.ok(
    found.some(
      (i) =>
        i.kind === "new" && i.target?.kind === "seat" && i.target.seatKey === "engineer",
    ),
  );
  assert.equal(
    found.some((i) => i.kind === "change"),
    false,
  );
});

test("actually the blue one after one open dest is a change of that id", () => {
  const open = [
    dest("job-board", "bind-board", "put that image on the board", "sa", "SA"),
  ];
  const [one] = streamIntent({
    phrase: "Actually, use the blue one",
    openJobs: open,
  });
  assert.equal(one.kind, "change");
  assert.deepEqual(one.target, {
    kind: "dest",
    destJobId: "job-board",
    bindingId: "bind-board",
  });
});

test("I'm done is not this file — chatter without a pivot is talk", () => {
  const [one] = streamIntent({
    phrase: "I'm done",
    openJobs: [],
  });
  assert.equal(one.kind, "talk");
});

test("scrap that alone cancels the only open dest", () => {
  const open = [dest("job-1", "bind-1", "order coffee", "engineer", "Engineer")];
  const [one] = streamIntent({ phrase: "scrap that", openJobs: open });
  assert.equal(one.kind, "cancel");
  assert.equal(one.target?.kind === "dest" && one.target.destJobId, "job-1");
});

test("lone no is not change-mode", () => {
  const [one] = streamIntent({
    phrase: "no",
    openJobs: [dest("job-1", "bind-1", "order coffee", "engineer", "Engineer")],
  });
  assert.equal(one.kind, "talk");
});
