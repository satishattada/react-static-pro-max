const fs = require("fs-extra");
const path = require("path");

const templatePath = "/Users/satishkumar.attada/.nvm/versions/node/v20.19.1/lib/node_modules/react-static-pro-max/templates/basic";
const destPath = "/Users/satishkumar.attada/Desktop/test-global-copy";

console.log("Template path:", templatePath);
console.log("Template exists:", fs.existsSync(templatePath));

// Read with different methods
console.log("\nfs.readdirSync():", fs.readdirSync(templatePath));
console.log("\nfs.readdirSync() length:", fs.readdirSync(templatePath).length);

// Clean destination
if (fs.existsSync(destPath)) {
  fs.removeSync(destPath);
}
fs.mkdirSync(destPath, { recursive: true });

console.log("\n=== Copying from global install ===");
try {
  fs.copySync(templatePath, destPath, {
    filter: (src) => {
      const shouldCopy = !src.includes("node_modules");
      console.log(`  ${src} -> ${shouldCopy}`);
      return shouldCopy;
    },
  });
  const copied = fs.readdirSync(destPath);
  console.log("\nCopied files:", copied);
  console.log("Count:", copied.length);
} catch (err) {
  console.error("Error:", err.message);
  console.error(err.stack);
}
