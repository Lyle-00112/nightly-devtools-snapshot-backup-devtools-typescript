import {infrai} from "./infrai_client.js";
import {encodeSnapshot, snapshotKey, snapshotRequest} from "./snapshot_domain.js";

const BUCKET = "developer-tools-nightly";
export async function saveNightlySnapshot(raw: unknown): Promise<{bucket: string; key: string}> {
  const input = snapshotRequest.parse(raw);
  await infrai.storage.bucket.create({name: BUCKET});
  const key = snapshotKey(input.date);
  await infrai.storage.object.put(BUCKET, key, {data_base64: encodeSnapshot(input), content_type: "application/json", idempotency_key: `nightly-${input.date}`});
  return {bucket: BUCKET, key};
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const raw = process.env.SNAPSHOT_JSON;
  if (!raw) throw new Error("Set SNAPSHOT_JSON to a JSON request body");
  saveNightlySnapshot(JSON.parse(raw)).then((result) => console.log(JSON.stringify(result))).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
