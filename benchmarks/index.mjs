import { exec } from "node:child_process";

exec(`node benchmarks/fetch/index.mjs`, (error, stdout, stderr) => {
  console.log(`Fetch Benchmarks`)
  console.log(stdout)
})
exec(`node benchmarks/headers/index.mjs`, (error, stdout, stderr) => {
  console.log(`Headers Benchmarks`)
  console.log(stdout)
})