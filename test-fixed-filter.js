const fs = require("fs-extra");
const path = require("path");

const templatePath = "/Users/satishkumar.attada/.nvm/versions/node/v20.19.1/lib/node_modules/react-static-pro-max/templates/basic";
const destPath = "/Users/satishkumar.attada/Desktop/test-fixed-copy";

console.log("Template path:", templatePath);
console.log("Template exists:", fs.existsSync(templatePath));
console.log("Template contents:", fs.readdirSync(templatePath).length, "items");

// Clean destination
if (fs.existsSync(destPath)) {
  fs.removeSync(destPath);
}
fs.mkdirSync(destPath, { recursive: true });

console.log("\n=== Copying with FIXED filter ===");
try {
  fs.copySync(templatePath, destPath, {
    filter: (src) => {
      // Skip node_modules subdirectories in the template, but allow paths that contain node_modules in parent directories
      const relativePath = path.relative(templatePath, src);
      const shouldCopy = !relativePath.split(path.sep).includes("node_modules");
      console.log(`  ${relativePath || '.'} -> ${shouldCopy}`);
      return shouldCopy;
    },
  });
  const copied = fs.readdirSync(destPath);
  console.log("\nCopied files:", copied);
  console.log("Count:", copied.length);
  
  if (copied.length > 0) {
    console.log("\n✓ SUCCESS! Files were copied!");
  } else {
    console.log("\n✗ FAILED! No files copied!");
  }
} catch (err) {
  console.error("Error:", err.message);
  console.error(err.stack);
}
