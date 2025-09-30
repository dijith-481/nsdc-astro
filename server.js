// server.js (Final, Corrected Version with Zero-Downtime and Correct Routing)
import express from "express";
import { exec } from "child_process";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

// --- Basic Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 8080;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

const liveDir = path.join(__dirname, "dist");
const newBuildDir = path.join(__dirname, "dist-new");
const oldBuildDir = path.join(__dirname, "dist-old");

if (!WEBHOOK_SECRET) {
  console.error("FATAL: WEBHOOK_SECRET environment variable must be set.");
  process.exit(1);
}

// --- The Rebuild Function with Atomic Swap ---
let isBuilding = false;
async function runBuild() {
  if (isBuilding) {
    console.log("Build already in progress. Ignoring request.");
    return;
  }
  isBuilding = true;
  console.log(`Starting application rebuild into '${newBuildDir}'...`);

  try {
    await new Promise((resolve, reject) => {
      exec(
        `npm run build -- --outDir ${newBuildDir}`,
        (error, stdout, stderr) => {
          if (error) {
            console.error(`Build Error: ${error.message}`);
            return reject(error);
          }
          if (stderr) console.error(`Build Stderr: ${stderr}`);
          console.log(`Build Stdout: ${stdout}`);
          resolve(stdout);
        },
      );
    });

    console.log("Build successful. Performing atomic swap...");
    try {
      await fs.rename(liveDir, oldBuildDir);
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
      console.log("No existing live directory to backup.");
    }
    await fs.rename(newBuildDir, liveDir);
    console.log(`Site is now live from '${liveDir}'.`);

    fs.rm(oldBuildDir, { recursive: true, force: true })
      .then(() => console.log("Cleaned up old build directory."))
      .catch((e) => console.error("Error cleaning up old build directory:", e));
  } catch (buildError) {
    console.error("Build process failed. The live site was not changed.");
    fs.rm(newBuildDir, { recursive: true, force: true }).catch(() => {});
  } finally {
    isBuilding = false;
  }
}

// --- Webhook Endpoint ---
app.post("/webhook", express.json(), (req, res) => {
  console.log("Webhook received...");
  const signature = req.headers["x-hub-signature-256"];
  if (!signature) return res.status(401).send("Signature required.");
  const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
  const digest =
    "sha256=" + hmac.update(JSON.stringify(req.body)).digest("hex");
  if (!crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))) {
    return res.status(401).send("Invalid signature.");
  }
  res.status(202).send("Rebuild process started.");
  runBuild();
});

// --- Static File Serving ---
app.use(express.static(liveDir));

// --- SPA Fallback / Catch-All Route ---
// THIS IS THE CORRECT, FINAL FIX.
// It uses a regular expression to match everything EXCEPT the /webhook API route.
app.get(/^\/(?!webhook).*/, (req, res) => {
  res.sendFile(path.resolve(liveDir, "index.html"));
});

// --- Initial Build and Server Start ---
(async () => {
  console.log("Performing initial build before starting server...");
  try {
    await runBuild();
    app.listen(PORT, () => {
      console.log(`Server started and listening on http://localhost:${PORT}`);
      console.log(`Serving files from '${liveDir}'.`);
    });
  } catch (initialBuildError) {
    console.error(
      "FATAL: Initial build failed. Server not starting.",
      initialBuildError,
    );
    process.exit(1);
  }
})();
