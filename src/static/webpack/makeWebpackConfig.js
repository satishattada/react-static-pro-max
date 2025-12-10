import webpack from "webpack";
import path from "path";
import CaseSensitivePathsPlugin from "case-sensitive-paths-webpack-plugin";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";

// Import webpack configurations properly
import webpackConfigDev from "./webpack.config.dev";
import webpackConfigProd from "./webpack.config.prod";

export default function makeWebpackConfig(state) {
  // Logging FIRST THING
  try {
    const fs = require('fs');
    fs.writeFileSync('/tmp/makeweb-called.txt', 'Called at ' + new Date().toISOString());
  } catch(e) {
    console.error('Failed to write debug file:', e);
  }
  
  const { config } = state;
  const stage = config.stage || "dev";

  let webpackConfig;

  // Select the appropriate webpack config based on stage
  if (stage === "dev") {
    webpackConfig = webpackConfigDev({ config });
  } else if (stage === "prod") {
    webpackConfig = webpackConfigProd({ config });
  } else if (stage === "node") {
    webpackConfig = webpackConfigProd({
      config: {
        ...config,
        stage: "node",
      },
    });
  } else {
    throw new Error(`Unknown webpack stage: ${stage}`);
  }

  // Validate that we got a config object
  if (!webpackConfig || typeof webpackConfig !== "object") {
    throw new Error(
      `Webpack config for stage "${stage}" is invalid or undefined`,
    );
  }

  // Apply bundle analyzer if enabled
  if (process.env.ANALYZE && webpackConfig.plugins) {
    webpackConfig.plugins.push(
      new BundleAnalyzerPlugin({
        analyzerMode: "static",
        openAnalyzer: false,
        reportFilename: path.join(
          config.paths.DIST,
          "bundle-analyzer-report.html",
        ),
      }),
    );
  }

  // Apply user webpack customizations from static.config.js
  if (config.webpack) {
    if (typeof config.webpack === "function") {
      const userConfig = config.webpack(webpackConfig, { stage, config });

      if (userConfig && typeof userConfig === "object") {
        webpackConfig = userConfig;
      }
    } else if (typeof config.webpack === "object") {
      // Merge webpack config objects
      webpackConfig = {
        ...webpackConfig,
        ...config.webpack,
        // Deep merge for certain properties
        resolve: {
          ...webpackConfig.resolve,
          ...(config.webpack.resolve || {}),
          alias: {
            ...(webpackConfig.resolve?.alias || {}),
            ...(config.webpack.resolve?.alias || {}),
          },
        },
        module: {
          ...webpackConfig.module,
          ...(config.webpack.module || {}),
          rules: [
            ...(webpackConfig.module?.rules || []),
            ...(config.webpack.module?.rules || []),
          ],
        },
        plugins: [
          ...(webpackConfig.plugins || []),
          ...(config.webpack.plugins || []),
        ],
      };
    }
  }

  // Final validation
  if (!webpackConfig.mode) {
    throw new Error("Webpack config must have a mode property");
  }
  if (!webpackConfig.entry) {
    throw new Error("Webpack config must have an entry property");
  }
  if (!webpackConfig.output) {
    throw new Error("Webpack config must have an output property");
  }

  // Debug output
  const fs = require('fs');
  fs.appendFileSync('/tmp/webpack-configs.log', 
    `Config for stage=${stage}: output.path=${webpackConfig.output.path}, output.filename=${webpackConfig.output.filename}, target=${webpackConfig.target}\n`
  );

  return webpackConfig;
}
