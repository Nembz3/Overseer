const fs = require("fs");
const path = require("path");
const { execFileSync, spawn } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const HOME = process.env.HOME || process.env.USERPROFILE || ROOT;

const STATE_DIR = path.join(HOME, ".overseer");
const STATE_FILE = path.join(STATE_DIR, "update-state.json");
const BACKUP_DIR = path.join(STATE_DIR, "backups");

const DEFAULT_INTERVAL_MINUTES = 30;

function ensureDirs() {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function run(command, args = []) {
  try {
    return execFileSync(command, args, {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    }).trim();
  } catch (error) {
    const stderr = error.stderr?.toString().trim();
    const stdout = error.stdout?.toString().trim();

    throw new Error(
      stderr ||
      stdout ||
      error.message ||
      `Failed to run ${command}`
    );
  }
}

function readVersion() {
  try {
    return (
      fs.readFileSync(
        path.join(ROOT, "VERSION"),
        "utf8"
      ).trim() || "unknown"
    );
  } catch {
    return "unknown";
  }
}

function readState() {
  ensureDirs();

  try {
    const data = JSON.parse(
      fs.readFileSync(STATE_FILE, "utf8")
    );

    return {
      autoUpdate: Boolean(data.autoUpdate),

      intervalMinutes: Math.max(
        5,
        Number(data.intervalMinutes) ||
        DEFAULT_INTERVAL_MINUTES
      ),

      lastCheckAt: data.lastCheckAt || null,

      lastUpdateAt: data.lastUpdateAt || null,

      lastResult: data.lastResult || null,

      history: Array.isArray(data.history)
        ? data.history.slice(0, 25)
        : []
    };
  } catch {
    return {
      autoUpdate: false,

      intervalMinutes: DEFAULT_INTERVAL_MINUTES,

      lastCheckAt: null,

      lastUpdateAt: null,

      lastResult: null,

      history: []
    };
  }
}

function writeState(patch) {
  ensureDirs();

  const next = {
    ...readState(),
    ...patch
  };

  fs.writeFileSync(
    STATE_FILE,
    JSON.stringify(next, null, 2)
  );

  return next;
}

function git(args) {
  return run("git", args);
}

function currentCommit() {
  return git([
    "rev-parse",
    "HEAD"
  ]);
}

function currentBranch() {
  const branch = git([
    "rev-parse",
    "--abbrev-ref",
    "HEAD"
  ]);

  if (!branch || branch === "HEAD") {
    throw new Error(
      "Cannot check for updates from a detached Git HEAD."
    );
  }

  return branch;
}

function remoteCommit() {
  const branch = currentBranch();
  git([
    "fetch",
    "origin",
    branch,
    "--quiet"
  ]);

  return git([
    "rev-parse",
    `origin/${branch}`
  ]);
}

function checkForUpdate() {
  const localCommit = currentCommit();

  const remote = remoteCommit();

  const state = writeState({
    lastCheckAt: new Date().toISOString()
  });

  return {
    currentVersion: readVersion(),

    localCommit,

    remoteCommit: remote,

    updateAvailable:
      localCommit !== remote,

    autoUpdate:
      state.autoUpdate,

    intervalMinutes:
      state.intervalMinutes,

    lastCheckAt:
      state.lastCheckAt
  };
}

function setAutoUpdate(
  enabled,
  intervalMinutes
) {
  const patch = {
    autoUpdate: Boolean(enabled)
  };

  if (intervalMinutes !== null &&
      intervalMinutes !== undefined) {

    patch.intervalMinutes =
      Math.max(
        5,
        Number(intervalMinutes) ||
        DEFAULT_INTERVAL_MINUTES
      );
  }

  return writeState(patch);
}

function history(limit = 10) {
  return readState()
    .history
    .slice(
      0,
      Math.max(
        1,
        Math.min(25, limit)
      )
    );
}

function queueUpdate(mode = "install") {
  ensureDirs();

  const runner = path.join(
    ROOT,
    "scripts",
    "overseer-updater.js"
  );

  if (!fs.existsSync(runner)) {
    throw new Error(
      "Updater script is missing."
    );
  }

  const child = spawn(
    process.execPath,
    [runner, mode],
    {
      cwd: ROOT,

      detached: true,

      stdio: "ignore",

      env: {
        ...process.env,

        OVERSEER_ROOT: ROOT
      }
    }
  );

  child.unref();

  return true;
}

function startAutoUpdater(
  onUpdateAvailable
) {
  let timer = null;

  let running = false;

  const tick = async () => {
    if (running) return;

    const state = readState();

    if (!state.autoUpdate) return;

    running = true;

    try {
      const info =
        checkForUpdate();

      if (info.updateAvailable) {

        if (
          typeof onUpdateAvailable ===
          "function"
        ) {
          await onUpdateAvailable(info);
        }

        queueUpdate("install");
      }
    } catch (error) {

      writeState({
        lastResult: {
          ok: false,

          at:
            new Date().toISOString(),

          error:
            error.message
        }
      });

      console.error(
        "Overseer auto-update check failed:",
        error.message
      );
    } finally {
      running = false;
    }
  };

  const schedule = (delayMs = null) => {
    if (timer) {
      clearTimeout(timer);
    }

    const minutes = readState().intervalMinutes;
    const delay =
      delayMs ??
      minutes * 60 * 1000;

    timer = setTimeout(async () => {
      await tick();
      schedule();
    }, delay);
  };

  schedule(60 * 1000);

  return {
    refresh: () => schedule(),

    stop: () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    }
  };
}

module.exports = {

  ROOT,

  STATE_FILE,

  BACKUP_DIR,

  readVersion,

  readState,

  writeState,

  checkForUpdate,

  setAutoUpdate,

  history,

  queueUpdate,

  startAutoUpdater
};