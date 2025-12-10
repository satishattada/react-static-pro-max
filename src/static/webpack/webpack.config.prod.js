import webpack from "webpack";
import resolveFrom from "resolve-from";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CaseSensitivePathsPlugin from "case-sensitive-paths-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import nodeExternals from "webpack-node-externals";
import path from "path";

import rules from "./rules";

export default function ({ config }) {
  const { DIST, NODE_MODULES, SRC, HTML_TEMPLATE, ARTIFACTS } = config.paths;
  const isNode = config.stage === "node";

  // CRITICAL DEBUG - WILL SHOW IN BUILD OUTPUT
  process.stdout.write(`\n🔍 WEBPACK CONFIG: stage="${config.stage}", isNode=${isNode}, ARTIFACTS="${ARTIFACTS}"\n`);
  
  console.log('=== WEBPACK CONFIG DEBUG ===');
  console.log('Stage:', config.stage);
  console.log('isNode:', isNode);
  console.log('ARTIFACTS:', ARTIFACTS);
  console.log('DIST:', DIST);
  console.log('===========================');

  process.env.REACT_STATIC_ENTRY_PATH = config.entry;
  process.env.REACT_STATIC_SITE_ROOT = config.siteRoot;
  process.env.REACT_STATIC_BASE_PATH = config.basePath;
  process.env.REACT_STATIC_PUBLIC_PATH = config.publicPath;
  process.env.REACT_STATIC_ASSETS_PATH = config.assetsPath;

  return {
    mode: "production",
    target: isNode ? "node" : "web",
    optimization: {
      minimize: !isNode,
      minimizer: isNode
        ? []
        : [
            new TerserPlugin({
              terserOptions: {
                parse: {
                  ecma: 8,
                },
                compress: {
                  ecma: 5,
                  warnings: false,
                  comparisons: false,
                  inline: 2,
                },
                mangle: {
                  safari10: true,
                },
                output: {
                  ecma: 5,
                  comments: false,
                  ascii_only: true,
                },
              },
            }),
            new CssMinimizerPlugin(),
          ],
      splitChunks: isNode
        ? false
        : {
            chunks: "all",
            name: false,
          },
      runtimeChunk: isNode
        ? false
        : {
            name: (entrypoint) => `runtime-${entrypoint.name}`,
          },
    },
    context: path.resolve(__dirname, "../../../node_modules"),
    entry: (() => {
      const entries = [
        ...(isNode ? [require.resolve("./nodeGlobals")] : []),
        ...(config.disableRuntime
          ? []
          : [
              require.resolve("../../bootstrapPlugins"),
              require.resolve("../../bootstrapTemplates"),
            ]),
        ...(config.disableRuntime || !isNode
          ? [config.entry]
          : [require.resolve("../../bootstrapApp")]),
      ].filter(Boolean);
      console.log('=== WEBPACK ENTRIES ===');
      console.log('isNode:', isNode);
      console.log('Entries:', entries);
      console.log('======================');
      // Return as object for node build to ensure proper naming
      return isNode ? { 'static-app': entries } : entries;
    })(),
    stats: {
      warnings: false,
      errorDetails: true,
    },
    output: {
      filename: isNode ? "[name].js" : "static/js/[name].[contenthash:8].js",
      chunkFilename: isNode
        ? "[name].js"
        : "static/js/[name].[contenthash:8].chunk.js",
      path: isNode ? ARTIFACTS : DIST,
      publicPath: process.env.REACT_STATIC_ASSETS_PATH || "/",
      pathinfo: false,
      libraryTarget: isNode ? "commonjs2" : undefined,
    },
    // Externalize all node_modules for node builds
    externals: isNode
      ? [
          nodeExternals({
            allowlist: [
              // Include files that need to be bundled
              /\.css$/,
              /\.s[ac]ss$/,
              /\.less$/,
              /\.(png|jpe?g|gif|svg|webp)$/i,
            ],
          }),
        ]
      : undefined,
    module: {
      rules: rules({ config, stage: config.stage || "prod" }),
      strictExportPresence: false,
    },
    resolve: {
      modules: [
        NODE_MODULES,
        SRC,
        DIST,
        ...[NODE_MODULES, SRC, DIST].map((d) => path.resolve(__dirname, d)),
        "node_modules",
      ],
      extensions: [
        ".wasm",
        ".mjs",
        ".js",
        ".json",
        ".jsx",
        ".cjs",
        ".ts",
        ".tsx",
      ],
      alias: {
        react$: resolveFrom(NODE_MODULES, "react"),
        "react-dom$": resolveFrom(NODE_MODULES, "react-dom"),
        __react_static_root__: config.paths.ROOT,
        ...(isNode ? {} : {
          "webpack/hot/emitter": resolveFrom(__dirname, "webpack/hot/emitter"),
        }),
        // Add types alias
        types: path.resolve(config.paths.ROOT, "src/types"),
      },
      mainFields: isNode 
        ? ["main", "module"]
        : ["browser", "module", "main"],
      // IMPORTANT: Set fullySpecified to false for .mjs files
      fullySpecified: false,
      // Add fallbacks for Node.js core modules
      fallback: isNode
        ? {}
        : {
            process: require.resolve("process/browser.js"),
            "process/browser": require.resolve("process/browser.js"),
            buffer: require.resolve("buffer/"),
            stream: require.resolve("stream-browserify"),
            util: require.resolve("util/"),
            assert: require.resolve("assert/"),
            http: false,
            https: false,
            os: false,
            url: false,
            crypto: false,
            querystring: false,
            path: false,
            fs: false,
            zlib: false,
          },
    },
    plugins: [
      new webpack.EnvironmentPlugin(process.env),
      !isNode &&
        new HtmlWebpackPlugin({
          inject: true,
          template: `!!raw-loader!${HTML_TEMPLATE}`,
          minify: {
            removeComments: true,
            collapseWhitespace: true,
            removeRedundantAttributes: true,
            useShortDoctype: true,
            removeEmptyAttributes: true,
            removeStyleLinkTypeAttributes: true,
            keepClosingSlash: true,
            minifyJS: true,
            minifyCSS: true,
            minifyURLs: true,
          },
        }),
      !isNode &&
        new MiniCssExtractPlugin({
          filename: "static/css/[name].[contenthash:8].css",
          chunkFilename: "static/css/[name].[contenthash:8].chunk.css",
        }),
      new CaseSensitivePathsPlugin(),
      !isNode &&
        new webpack.ProvidePlugin({
          process: "process/browser",
          Buffer: ["buffer", "Buffer"],
        }),
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify("production"),
        "process.browser": !isNode,
        "__REACT_STATIC_SSR__": isNode,
        ...(isNode
          ? {
              // Don't replace typeof checks - they need to work naturally
              // Instead, rely on __REACT_STATIC_SSR__ flag
            }
          : {}),
      }),
    ].filter(Boolean),
    devtool: isNode ? false : "source-map",
    performance: {
      hints: false,
    },
    node: isNode
      ? {
          __dirname: false,
          __filename: false,
          global: false,
        }
      : false,
  };
}
