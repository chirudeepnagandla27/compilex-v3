const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputPath = path.join(__dirname, "outputs");

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const executeCpp = (filepath, inputPath) => {
  const jobId = path.basename(filepath).split(".")[0];
  const outPath = path.join(outputPath, `${jobId}.out`);

  return new Promise((resolve, reject) => {
    // Step 1: Compile the code
    const compileCommand = `g++ ${filepath} -o ${outPath}`;
    exec(compileCommand, (error, stdout, stderr) => {
      if (error) {
        // Reject with a clear compilation error
        return reject({ type: "CompilationError", message: stderr });
      }

      // Step 2: If compilation succeeds, execute the compiled file
      const runCommand = `${outPath} < ${inputPath}`;
      exec(runCommand, (runError, runStdout, runStderr) => {
        if (runError) {
          // Reject with a runtime error
          return reject({ type: "RuntimeError", message: runStderr });
        }
        
        // Resolve with the output on success
        resolve(runStdout);
      });
    });
  });
};

module.exports = {
  executeCpp,
};