require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT =
  process.env.OVERSEER_ROOT ||
  path.resolve(__dirname, "..");

const HOME =
  process.env.HOME ||
  process.env.USERPROFILE ||
  ROOT;

const STATE_DIR = path.join(
  HOME,
  ".overseer"
);

const STATE_FILE = path.join(
  STATE_DIR,
  "update-state.json"
);

const BACKUP_DIR = path.join(
  STATE_DIR,
  "backups"
);

const mode =
  process.argv[2] || "install";

fs.mkdirSync(
  BACKUP_DIR,
  { recursive: true }
);

fs.mkdirSync(
  STATE_DIR,
  { recursive: true }
);

function run(command, args = []) {
  return execFileSync(
    command,
    args,
    {
      cwd: ROOT,

      encoding: "utf8",

      stdio: "pipe",

      env: process.env
    }
  ).trim();
}

function currentBranch() {
  const branch = run(
    "git",
    [
      "rev-parse",
      "--abbrev-ref",
      "HEAD"
    ]
  );

  if (!branch || branch === "HEAD") {
    throw new Error(
      "Cannot update from a detached Git HEAD."
    );
  }

  return branch;
}

function readVersion() {
  try {
    return (
      fs.readFileSync(
        path.join(
          ROOT,
          "VERSION"
        ),
        "utf8"
      ).trim() ||
      "unknown"
    );
  } catch {
    return "unknown";
  }
}

function loadState() {
  try {
    return JSON.parse(
      fs.readFileSync(
        STATE_FILE,
        "utf8"
      )
    );
  } catch {
    return {
      autoUpdate: false,

      intervalMinutes: 30,

      history: []
    };
  }
}

function record(entry) {
  const state = loadState();

  state.history = [
    entry,

    ...(
      Array.isArray(state.history)
        ? state.history
        : []
    )
  ].slice(0, 25);

  state.lastUpdateAt =
    entry.at;

  state.lastResult =
    entry;

  fs.writeFileSync(
    STATE_FILE,

    JSON.stringify(
      state,
      null,
      2
    )
  );
}

function backupCurrent() {
  const commit = run(
    "git",
    [
      "rev-parse",
      "HEAD"
    ]
  );

  const version =
    readVersion();

  const timestamp =
    new Date()
      .toISOString()
      .replace(
        /[:.]/g,
        "-"
      );

  const backupPath =
    path.join(
      BACKUP_DIR,
      timestamp
    );

  fs.mkdirSync(
    backupPath,
    {
      recursive: true
    }
  );

  fs.writeFileSync(
    path.join(
      backupPath,
      "metadata.json"
    ),

    JSON.stringify(
      {
        commit,

        version,

        createdAt:
          new Date()
            .toISOString()
      },

      null,
      2
    )
  );

  return {
    commit,

    version
  };
}

function getLatestBackup() {
  const directories =
    fs.readdirSync(
      BACKUP_DIR
    )
      .map(
        name =>
          path.join(
            BACKUP_DIR,
            name
          )
      )
      .filter(
        filePath =>
          fs.statSync(
            filePath
          ).isDirectory()
      )
      .sort()
      .reverse();

  for (
    const directory
    of directories
  ) {
    const metadata =
      path.join(
        directory,
        "metadata.json"
      );

    if (
      fs.existsSync(
        metadata
      )
    ) {
      return JSON.parse(
        fs.readFileSync(
          metadata,
          "utf8"
        )
      );
    }
  }

  return null;
}

function validate() {
  const files = [
    "src/index.js",

    "src/ai.js",

    "src/automod.js",

    "src/database.js",

    "src/deploy-commands.js",

    "src/server-intelligence.js",

    "src/tools.js",

    "src/tickets.js",

    "src/runtime.js",

    "src/proactive.js",

    "src/update-manager.js"
  ];

  for (
    const file
    of files
  ) {
    const fullPath =
      path.join(
        ROOT,
        file
      );

    if (
      fs.existsSync(
        fullPath
      )
    ) {
      run(
        process.execPath,
        [
          "--check",
          file
        ]
      );
    }
  }
}

function installUpdate() {
  const before =
    backupCurrent();

  console.log(
    "Creating update backup..."
  );

  try {
    console.log(
      "Fetching latest version..."
    );

    const branch = currentBranch();

    run(
      "git",
      [
        "fetch",
        "origin",
        branch,
        "--quiet"
      ]
    );

    const target =
      run(
        "git",
        [
          "rev-parse",
          `origin/${branch}`
        ]
      );

    if (
      target ===
      before.commit
    ) {
      console.log(
        "Already up to date."
      );

      record({
        ok: true,

        action:
          "install",

        skipped: true,

        at:
          new Date()
            .toISOString(),

        before,

        after:
          before
      });

      return;
    }

    console.log(
      "Installing GitHub update..."
    );

    run(
      "git",
      [
        "reset",
        "--hard",
        target
      ]
    );

    console.log(
      "Installing dependencies..."
    );

    run(
      "npm",
      [
        "ci"
      ]
    );

    console.log(
      "Validating update..."
    );

    validate();

    console.log(
      "Deploying Discord commands..."
    );

    run(
      "npm",
      [
        "run",
        "deploy"
      ]
    );

    const after = {
      version:
        readVersion(),

      commit:
        run(
          "git",
          [
            "rev-parse",
            "HEAD"
          ]
        )
    };

    record({
      ok: true,

      action:
        "install",

      at:
        new Date()
          .toISOString(),

      before,

      after
    });

    console.log(
      "Restarting Overseer..."
    );

    run(
      "pm2",
      [
        "restart",
        "overseer",
        "--update-env"
      ]
    );

    console.log(
      "Update complete!"
    );
  } catch (error) {

    console.error(
      "Update failed:",
      error.message
    );

    console.log(
      "Attempting rollback..."
    );

    try {
      run(
        "git",
        [
          "reset",
          "--hard",
          before.commit
        ]
      );

      run(
        "npm",
        [
          "ci"
        ]
      );

      validate();

      run(
        "npm",
        [
          "run",
          "deploy"
        ]
      );

      run(
        "pm2",
        [
          "restart",
          "overseer",
          "--update-env"
        ]
      );

      record({
        ok: false,

        action:
          "install",

        at:
          new Date()
            .toISOString(),

        error:
          error.message,

        rolledBackTo:
          before
      });

      console.log(
        "Rollback successful."
      );
    } catch (rollbackError) {

      record({
        ok: false,

        action:
          "install",

        at:
          new Date()
            .toISOString(),

        error:
          error.message,

        rollbackError:
          rollbackError.message,

        before
      });

      console.error(
        "Rollback failed:",
        rollbackError.message
      );

      throw rollbackError;
    }

    throw error;
  }
}

function rollback() {
  const backup =
    getLatestBackup();

  if (
    !backup ||
    !backup.commit
  ) {
    throw new Error(
      "No previous update backup is available."
    );
  }

  const before = {
    version:
      readVersion(),

    commit:
      run(
        "git",
        [
          "rev-parse",
          "HEAD"
        ]
      )
  };

  console.log(
    "Rolling back to:",
    backup.version
  );

  run(
    "git",
    [
      "reset",
      "--hard",
      backup.commit
    ]
  );

  run(
    "npm",
    [
      "ci"
    ]
  );

  validate();

  run(
    "npm",
    [
      "run",
      "deploy"
    ]
  );

  const after = {
    version:
      readVersion(),

    commit:
      run(
        "git",
        [
          "rev-parse",
          "HEAD"
        ]
      )
  };

  record({
    ok: true,

    action:
      "rollback",

    at:
      new Date()
        .toISOString(),

    before,

    after
  });

  run(
    "pm2",
    [
      "restart",
      "overseer",
      "--update-env"
    ]
  );

  console.log(
    "Rollback complete!"
  );
}

try {

  if (
    mode === "rollback"
  ) {
    rollback();
  } else {
    installUpdate();
  }

} catch (error) {

  console.error(
    "Overseer updater failed:",
    error.stack ||
    error.message
  );

  process.exitCode = 1;
}