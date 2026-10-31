import {z} from "zod";

export const snapshotRequest = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  builds: z.array(z.object({id: z.string(), status: z.enum(["passed", "failed"]), commit: z.string()})),
  releases: z.array(z.object({version: z.string(), channel: z.enum(["stable", "canary"]), status: z.enum(["published", "rolled_back"])})),
  diagnostics: z.array(z.object({tool: z.string(), severity: z.enum(["info", "warning", "error"]), message: z.string()}))
});
export type SnapshotRequest = z.infer<typeof snapshotRequest>;

export function snapshotKey(date: string): string { return `snapshots/${date}.json`; }

export function encodeSnapshot(input: SnapshotRequest): string {
  return Buffer.from(JSON.stringify({captured_at: input.date, builds: input.builds, releases: input.releases, diagnostics: input.diagnostics})).toString("base64");
}
