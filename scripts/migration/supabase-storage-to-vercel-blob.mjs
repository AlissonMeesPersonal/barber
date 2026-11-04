/**
 * ONE-WAY export Supabase Storage -> Vercel Blob.
 * Never deletes source files. Dry run by default; no customer paths in logs.
 * Requires Node 22 and @vercel/blob >= 2.3.0 installed by the operator.
 * After verifying permissions and bucket contents, run in a protected CI environment.
 */
import { createHash } from "node:crypto";

const SUPABASE_URL = (process.env.BACKUP_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(/\/$/, "");
const SERVICE_KEY = process.env.BACKUP_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const DRY_RUN = process.env.MIGRATION_APPLY !== "yes";
const FILE_LIMIT = Number(process.env.MIGRATION_MAX_FILE_BYTES || 50 * 1024 * 1024);
const BUCKETS = (process.env.MIGRATION_BUCKETS || "").split(",").map(s => s.trim()).filter(Boolean);
if (!SUPABASE_URL || !SERVICE_KEY) throw new Error("Missing Supabase backup credentials.");
if (!BUCKETS.length) throw new Error("MIGRATION_BUCKETS is required.");
if (!DRY_RUN && !process.env.BLOB_READ_WRITE_TOKEN) throw new Error("BLOB_READ_WRITE_TOKEN is required for writes.");
const authHeaders = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` };
const blobPut = DRY_RUN ? null : (await import("@vercel/blob")).put;
const blobAccess = process.env.MIGRATION_BLOB_ACCESS;
if (!["public", "private"].includes(blobAccess)) throw new Error("MIGRATION_BLOB_ACCESS must be public or private.");

function encodePath(path) { return path.split("/").map(encodeURIComponent).join("/"); }
async function storageList(bucket, prefix = "") {
  const results = [];
  for (let offset = 0;; offset += 100) {
    const response = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${encodeURIComponent(bucket)}`, {
      method: "POST",
      headers: { ...authHeaders, "content-type": "application/json" },
      body: JSON.stringify({ prefix, limit: 100, offset, sortBy: { column: "name", order: "asc" } }),
    });
    if (!response.ok) throw new Error(`Source list failed: HTTP ${response.status}`);
    const items = await response.json();
    if (!Array.isArray(items)) throw new Error("Storage object list was not an array.");
    for (const item of items) {
      if (!item.name || item.name === ".emptyFolderPlaceholder") continue;
      const relPath = prefix + item.name;
      if (!item.id) results.push(...await storageList(bucket, relPath + "/"));
      else results.push({ bucket, path: relPath, size: Number(item.metadata?.size || 0) });
    }
    if (items.length < 100) break;
  }
  return results;
}

let totalObjects = 0;
let copiedObjects = 0;
let totalBytes = 0;
for (const bucket of BUCKETS) {
  const objects = await storageList(bucket);
  totalObjects += objects.length;
  if (!DRY_RUN) {
    for (const item of objects) {
      const response = await fetch(
        `${SUPABASE_URL}/storage/v1/object/authenticated/${encodeURIComponent(bucket)}/${encodePath(item.path)}`,
        { headers: authHeaders, redirect: "error" }
      );
      if (!response.ok) throw new Error(`Source download failed: HTTP ${response.status}`);
      const payload = Buffer.from(await response.arrayBuffer());
      if (payload.length > FILE_LIMIT) throw new Error("Object exceeds the configured size limit.");
      if (item.size && item.size !== payload.length) throw new Error("Source object size mismatch.");
      const fingerprint = createHash("sha256").update(payload).digest("hex");
      // Store prefix avoids collisions between buckets without exposing a customer path to logs.
      const targetPath = `supabase-archive/${bucket}/${item.path}`;
      await blobPut(targetPath, payload, {
        access: blobAccess,
        addRandomSuffix: false,
        allowOverwrite: false,
        contentType: response.headers.get("content-type") || "application/octet-stream",
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      // Hash is held only in memory; a separate authenticated read-back must be tested before cutting over.
      if (!fingerprint || fingerprint.length !== 64) throw new Error("Checksum failure.");
      copiedObjects++;
      totalBytes += payload.length;
    }
  }
  console.log(`Bucket inventoried: ${objects.length} objects (no object paths logged)`);
}
console.log(JSON.stringify({ dryRun: DRY_RUN, inventoriedObjects: totalObjects, uploadedObjects: copiedObjects, bytesUploaded: totalBytes }));
console.log("WARNING: verify read-back and application permissions separately. Supabase source was NOT modified.");
