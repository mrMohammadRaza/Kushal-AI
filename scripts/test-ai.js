/**
 * Cross-platform runner for AI service pytest suite
 * Works across Windows, Linux, macOS, and CI/CD environments,
 * safely handling directory paths containing whitespace.
 */
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const aiDir = path.join(__dirname, '..', 'ai-service');

// Determine candidate python executables
const winVenvPython = path.join(aiDir, '.venv', 'Scripts', 'python.exe');
const unixVenvPython = path.join(aiDir, '.venv', 'bin', 'python');

let pythonCmd = 'python';

if (process.platform === 'win32' && fs.existsSync(winVenvPython)) {
  pythonCmd = winVenvPython;
} else if (process.platform !== 'win32' && fs.existsSync(unixVenvPython)) {
  pythonCmd = unixVenvPython;
} else if (process.platform !== 'win32') {
  pythonCmd = 'python3';
}

console.log(`[test:ai] Running pytest in ${aiDir} using: ${pythonCmd}`);

// shell: false avoids Windows shell space-splitting bugs
const child = spawn(pythonCmd, ['-m', 'pytest', 'tests'], {
  cwd: aiDir,
  stdio: 'inherit',
  shell: false
});

child.on('close', (code) => {
  if (code !== 0) {
    console.error(`[test:ai] Pytest exited with code ${code}`);
  }
  process.exit(code || 0);
});

child.on('error', (err) => {
  console.error(`[test:ai] Failed to start pytest process:`, err.message);
  process.exit(1);
});
