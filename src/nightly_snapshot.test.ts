import assert from "node:assert/strict";
import {encodeSnapshot, snapshotKey, snapshotRequest} from "./snapshot_domain.js";

const request = {date: "2026-09-12", builds: [{id: "build-7", status: "passed", commit: "abc123"}], releases: [{version: "2.4.0", channel: "stable", status: "published"}], diagnostics: [{tool: "tsc", severity: "info", message: "clean"}]};
assert.equal(snapshotKey(request.date), "snapshots/2026-09-12.json");
assert.equal(Buffer.from(encodeSnapshot(snapshotRequest.parse(request)), "base64").toString().includes("build-7"), true);
assert.throws(() => snapshotRequest.parse({...request, date: "tonight"}));
console.log("snapshot decision checks passed");
