import assert from "node:assert/strict";
import { test } from "node:test";
import {
  destAfterRemove,
  destOnCreate,
  membershipRoleFor,
} from "./room-membership";

test("Travis is facilitator; everyone else is member", () => {
  assert.equal(membershipRoleFor("travis"), "facilitator");
  assert.equal(membershipRoleFor("pm"), "member");
  assert.equal(membershipRoleFor("sa"), "member");
  assert.equal(membershipRoleFor("engineer"), "member");
  assert.equal(membershipRoleFor("auth-engineer"), "member");
  assert.equal(membershipRoleFor(null), "member");
});

test("explicit create dest is the first chosen member, not Travis", () => {
  const travis = { id: "t", seatKey: "travis" };
  const sa = { id: "sa", seatKey: "sa" };
  assert.equal(destOnCreate({ chosen: [travis, sa] }), "sa");
  assert.equal(destOnCreate({ chosen: [travis] }), "t");
});

test("stand-in create keeps PM when that row is in the set", () => {
  const chosen = [
    { id: "t", seatKey: "travis" },
    { id: "pm", seatKey: "pm" },
    { id: "sa", seatKey: "sa" },
  ];
  assert.equal(destOnCreate({ chosen, standInPmId: "pm" }), "pm");
  assert.equal(destOnCreate({ chosen, standInPmId: "missing" }), "pm");
});

test("remove of dest repoints to the first remaining member, else Travis", () => {
  const remaining = [
    { id: "t", seatKey: "travis" },
    { id: "sa", seatKey: "sa" },
  ];
  const next = destAfterRemove({
    removedId: "eng",
    current: { activeId: "eng", defaultId: "eng", bindingId: "eng" },
    remaining,
  });
  assert.deepEqual(next, { activeId: "sa", defaultId: "sa", bindingId: "sa" });

  const onlyTravis = destAfterRemove({
    removedId: "sa",
    current: { activeId: "sa", defaultId: "pm", bindingId: "sa" },
    remaining: [{ id: "t", seatKey: "travis" }],
  });
  assert.deepEqual(onlyTravis, {
    activeId: "t",
    defaultId: "pm",
    bindingId: "t",
  });
});
