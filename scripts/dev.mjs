import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const services = [
  { name: "backend ", dir: path.join(rootDir, "backend"), cmd: "npm", args: ["run", "dev"], color: "\x1b[34m" }, // Blue
  { name: "frontend", dir: path.join(rootDir, "frontend"), cmd: "npm", args: ["run", "dev"], color: "\x1b[32m" }, // Green
  { name: "admin   ", dir: path.join(rootDir, "admin"), cmd: "npm", args: ["run", "dev"], color: "\x1b[35m" }, // Magenta
];

const RESET = "\x1b[0m";
const processes = [];

console.log("\x1b[1m\x1b[33m✦ Starting all 3 services: Backend (:3001), Frontend (:3000), Admin (:3002) ✦\x1b[0m\n");

for (const svc of services) {
  const child = spawn(svc.cmd, svc.args, {
    cwd: svc.dir,
    stdio: ["inherit", "pipe", "pipe"],
    shell: true,
  });

  child.stdout.on("data", (data) => {
    process.stdout.write(`${svc.color}[${svc.name}]${RESET} ${data}`);
  });

  child.stderr.on("data", (data) => {
    process.stderr.write(`${svc.color}[${svc.name}]${RESET} ${data}`);
  });

  child.on("close", (code) => {
    console.log(`${svc.color}[${svc.name}]${RESET} exited with code ${code}`);
  });

  processes.push(child);
}

function cleanup() {
  console.log("\n\x1b[33mShutting down all services...\x1b[0m");
  for (const p of processes) {
    p.kill("SIGTERM");
  }
  process.exit(0);
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
