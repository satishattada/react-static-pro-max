const fs = require("fs-extra");
const path = require("path");

const templatePath = path.resolve(__dirname, "templates/basic");
const destPath = path.resolve(__dirname, "test-output");

console.log("Template path:", templatePath);
console.log("Template exists:", fs.existsSync(templatePath));
console.log("Template contents:", fs.readdirSync(templatePath));

// Clean destination
if (fs.existsSync(destPath)) {
  fs.removeSync(destPath);
}
fs.mkdirSync(destPath, { recursive: true });

console.log("\n=== TEST 1: Copy with filter ===");
try {
  fs.copySync(templatePath, destPath, {
    filter: (src) => {
      const shouldCopy = !src.includes("node_modules");
      console.log(`  ${src} -> ${shouldCopy}`);
      return shouldCopy;
    },
  });
  console.log("Copied files:", fs.readdirSync(destPath));
} catch (err) {
  console.error("Error:", err.message);
}

// Clean for test 2
fs.removeSync(destPath);
fs.mkdirSync(destPath, { recursive: true });

console.log("\n=== TEST 2: Copy without filter ===");
try {
  fs.copySync(templatePath, destPath);
  console.log("Copied files:", fs.readdirSync(destPath));
} catch (err) {
  console.error("Error:", err.message);
}

// Clean for test 3
fs.removeSync(destPath);
fs.mkdirSync(destPath, { recursive: true });

console.log("\n=== TEST 3: Copy with simplified filter ===");
try {
  fs.copySync(templatePath, destPath, {
    filter: () => true,
  });
  console.log("Copied files:", fs.readdirSync(destPath));
} catch (err) {
  console.error("Error:", err.message);
}
