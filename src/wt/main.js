import { cpus } from "os";
import { Worker } from "worker_threads";
import path from "path";
import { fileURLToPath } from "url";

const INPUT_NUM = 10;
const cpuCores = cpus();
const __dirname = fileURLToPath(new URL(".", import.meta.url));
const pathToFile = path.join(__dirname, "worker.js");

const performCalculations = async () => {
  const rowResult = await Promise.allSettled(
    cpuCores.map(
      (_, idx) =>
        new Promise((resolve, reject) => {
          const worker = new Worker(pathToFile, {
            workerData: INPUT_NUM + idx,
          });

          worker.on("message", resolve);

          worker.on("error", reject);

          worker.on("exit", (code) => {
            if (code !== 0)
              reject(new Error(`Worker stopped with exit code ${code}`));
          });
        })
    )
  );

  const result = rowResult.map(({ status, value }) =>
    status === "fulfilled"
      ? {
          status: "resolved",
          data: value,
        }
      : {
          status: "error",
          data: null,
        }
  );

  console.log(result);

  return result;
};

await performCalculations();
