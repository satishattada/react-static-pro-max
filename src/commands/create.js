const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const { execSync } = require("child_process");

// Handle inquirer ES module import
let inquirer;
try {
  inquirer = require("inquirer");
} catch (err) {
  // inquirer v9+ is ESM only, fall back to dynamic import
  inquirer = null;
}

// For CommonJS compatibility after Babel compilation
const getTemplatePath = (template) => {
  // When built, this file will be at lib/commands/create.js
  // Templates are at templates/{template}
  // Go up from lib/commands/ to root, then to templates/
  return path.resolve(__dirname, "../../templates", String(template));
};

async function create(name) {
  try {
    // Ensure name is a string and not undefined or object
    let projectName = name;

    if (!projectName || typeof projectName !== "string") {
      const answers = await inquirer.prompt([
        {
          type: "input",
          name: "projectName",
          message: "What would you like to name your project?",
          default: "my-react-static-app",
          validate: (input) => {
            if (!input || input.trim().length === 0) {
              return "Project name cannot be empty";
            }
            return true;
          },
        },
      ]);
      projectName = answers.projectName.trim();
    }

    // Ensure projectName is a clean string
    projectName = String(projectName).trim();

    const projectPath = path.resolve(process.cwd(), projectName);

    // Check if directory already exists
    if (fs.existsSync(projectPath)) {
      console.log(chalk.red(`\nDirectory "${projectName}" already exists!\n`));
      process.exit(1);
    }

    console.log(
      chalk.blue(
        `\nCreating a new React Static Pro Max app in ${chalk.green(projectPath)}\n`,
      ),
    );

    // Ask which template to use
    const { template } = await inquirer.prompt([
      {
        type: "list",
        name: "template",
        message: "Choose a template:",
        choices: [
          { name: "Basic (JavaScript)", value: "basic" },
          { name: "TypeScript", value: "typescript" },
          { name: "Blank", value: "blank" },
        ],
        default: "basic",
      },
    ]);

    // Create project directory
    fs.mkdirSync(projectPath, { recursive: true });

    // Copy template files
    const templatePath = getTemplatePath(template);

    console.log(chalk.gray(`Template path: ${templatePath}`));
    console.log(chalk.gray(`Template exists: ${fs.existsSync(templatePath)}`));

    if (!fs.existsSync(templatePath)) {
      console.log(
        chalk.red(`\nTemplate "${template}" not found at ${templatePath}!\n`),
      );

      // Try alternative path (if run from package root)
      const altTemplatePath = path.resolve(
        process.cwd(),
        "templates",
        String(template),
      );
      console.log(
        chalk.yellow(`Trying alternative path: ${altTemplatePath}\n`),
      );

      if (fs.existsSync(altTemplatePath)) {
        console.log(chalk.blue("Copying template files with Template path...\n"));
        console.log(chalk.gray(`From: ${altTemplatePath}`));
        console.log(chalk.gray(`To: ${projectPath}`));

        try {
          const templateFiles = fs.readdirSync(altTemplatePath);
          console.log(
            chalk.gray(
              `Template contains ${templateFiles.length} items: ${templateFiles.slice(0, 5).join(", ")}${templateFiles.length > 5 ? "..." : ""}`,
            ),
          );

          fs.copySync(altTemplatePath, projectPath, {
            filter: (src) => {
              // Skip node_modules when copying
              return !src.includes("node_modules");
            },
            errorOnExist: false,
            overwrite: true,
            dereference: true,
          });

          const copiedFiles = fs.readdirSync(projectPath);
          console.log(
            chalk.gray(`Successfully copied ${copiedFiles.length} items`),
          );

          if (copiedFiles.length === 0) {
            throw new Error("No files were copied!");
          }
        } catch (copyError) {
          console.error(
            chalk.red("\nError copying files:"),
            copyError.message,
          );
          throw copyError;
        }
      } else {
        console.log(chalk.red(`Template not found at either location!\n`));
        process.exit(1);
      }
    } else {
      console.log(chalk.blue("Copying template files without Template path...\n"));
      console.log(chalk.gray(`From: ${templatePath}`));
      console.log(chalk.gray(`To: ${projectPath}`));

      try {
        // List files in template before copying
        const templateFiles = fs.readdirSync(templatePath);
        console.log(
          chalk.gray(
            `Template contains ${templateFiles.length} items: ${templateFiles.slice(0, 5).join(", ")}${templateFiles.length > 5 ? "..." : ""}`,
          ),
        );

        fs.copySync(templatePath, projectPath, {
          filter: (src) => {
            // Skip node_modules when copying
            return !src.includes("node_modules");
          },
          errorOnExist: false,
          overwrite: true,
          dereference: true,
        });

        // Verify copy
        const copiedFiles = fs.readdirSync(projectPath);
        console.log(
          chalk.gray(`Successfully copied ${copiedFiles.length} items`),
        );

        if (copiedFiles.length === 0) {
          throw new Error(
            "No files were copied! Copy operation may have failed silently.",
          );
        }
      } catch (copyError) {
        console.error(
          chalk.red("\nError during file copy:"),
          copyError.message,
        );
        console.error(copyError.stack);
        throw copyError;
      }
    }

    // Update package.json with project name
    const packageJsonPath = path.join(projectPath, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = fs.readJsonSync(packageJsonPath);
      packageJson.name = projectName;
      fs.writeJsonSync(packageJsonPath, packageJson, { spaces: 2 });
    }

    console.log(chalk.green("\n✓ Project created successfully!\n"));
    console.log(chalk.blue("Next steps:\n"));
    console.log(chalk.white(`  cd ${projectName}`));
    console.log(chalk.white(`  npm install`));
    console.log(chalk.white(`  npm start\n`));

    // Ask if user wants to install dependencies now
    const { installNow } = await inquirer.prompt([
      {
        type: "confirm",
        name: "installNow",
        message: "Would you like to install dependencies now?",
        default: false, // Changed to false to avoid npm errors
      },
    ]);

    if (installNow) {
      console.log(chalk.blue("\nInstalling dependencies...\n"));

      const originalDir = process.cwd();
      process.chdir(projectPath);

      try {
        // Try regular npm install first
        console.log(chalk.gray("Running: npm install\n"));
        execSync("npm install", { stdio: "inherit" });
        console.log(chalk.green("\n✓ Dependencies installed successfully!\n"));
        console.log(chalk.blue("You can now run:\n"));
        console.log(chalk.white(`  npm start\n`));
      } catch (error) {
        console.log(
          chalk.yellow(
            "\n⚠ npm install encountered an error. Trying alternative methods...\n",
          ),
        );

        try {
          // Try with --legacy-peer-deps
          console.log(chalk.gray("Running: npm install --legacy-peer-deps\n"));
          execSync("npm install --legacy-peer-deps", { stdio: "inherit" });
          console.log(
            chalk.green(
              "\n✓ Dependencies installed successfully with --legacy-peer-deps!\n",
            ),
          );
          console.log(chalk.blue("You can now run:\n"));
          console.log(chalk.white(`  npm start\n`));
        } catch (legacyError) {
          console.log(
            chalk.yellow("\n⚠ Alternative installation method also failed.\n"),
          );

          try {
            // Try cleaning npm cache and installing
            console.log(chalk.gray("Cleaning npm cache and retrying...\n"));
            execSync("npm cache clean --force", { stdio: "inherit" });
            execSync("npm install --force", { stdio: "inherit" });
            console.log(
              chalk.green(
                "\n✓ Dependencies installed successfully after cache clean!\n",
              ),
            );
            console.log(chalk.blue("You can now run:\n"));
            console.log(chalk.white(`  npm start\n`));
          } catch (finalError) {
            console.log(
              chalk.red("\n✗ Failed to install dependencies automatically\n"),
            );
            console.log(
              chalk.yellow("\nPlease try one of these commands manually:\n"),
            );
            console.log(chalk.white(`  cd ${projectName}`));
            console.log(chalk.white(`  npm cache clean --force`));
            console.log(chalk.white(`  npm install --legacy-peer-deps\n`));
            console.log(chalk.gray("or\n"));
            console.log(chalk.white(`  npm install --force\n`));
          }
        }
      } finally {
        process.chdir(originalDir);
      }
    } else {
      console.log(chalk.gray("\nSkipping dependency installation.\n"));
      console.log(
        chalk.yellow(
          "Remember to install dependencies before running the project:\n",
        ),
      );
      console.log(chalk.white(`  cd ${projectName}`));
      console.log(chalk.white(`  npm install\n`));
    }
  } catch (error) {
    console.error(chalk.red("\nError creating project:"), error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Export as both default and named export for compatibility
module.exports = create;
module.exports.default = create;
