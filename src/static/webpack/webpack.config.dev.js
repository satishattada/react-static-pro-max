import webpack from "webpack";
import resolveFrom from "resolve-from";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CaseSensitivePathsPlugin from "case-sensitive-paths-webpack-plugin";
import path from "path";

import rules from "./rules";

export default function ({ config }) {
  const { DIST, NODE_MODULES, SRC, HTML_TEMPLATE } = config.paths;

  process.env.REACT_STATIC_BASE_PATH = config.basePath;
  process.env.REACT_STATIC_PUBLIC_PATH = config.publicPath;
  process.env.REACT_STATIC_ASSETS_PATH = config.assetsPath;

  return {
    mode: "development",
    optimization: {
      emitOnErrors: false,
      concatenateModules: true,
      removeAvailableModules: false,
      removeEmptyChunks: false,
      splitChunks: false,
    },
    context: path.resolve(__dirname, "../../../node_modules"),
    entry: [
      ...(config.disableRuntime
        ? []
        : [
            require.resolve("../../bootstrapPlugins"),
            require.resolve("../../bootstrapTemplates"),
          ]),
      config.entry,
    ].filter(Boolean),
    stats: {
      warnings: false,
      errorDetails: true,
    },
    output: {
      filename: "[name].js",
      chunkFilename: "templates/[name].js",
      path: DIST,
      publicPath: process.env.REACT_STATIC_ASSETS_PATH || "/",
      pathinfo: false,
    },
    module: {
      rules: rules({ config, stage: "dev" }),
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
        "webpack/hot/emitter": resolveFrom(__dirname, "webpack/hot/emitter"),
        // Add types alias
        types: path.resolve(config.paths.ROOT, "src/types"),
      },
      mainFields: ["browser", "module", "main"],
      // IMPORTANT: Set fullySpecified to false for .mjs files
      fullySpecified: false,
      // Add fallbacks for Node.js core modules
      fallback: {
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
      new HtmlWebpackPlugin({
        inject: true,
        template: `!!raw-loader!${HTML_TEMPLATE}`,
      }),
      new MiniCssExtractPlugin({
        filename: "[name].css",
        chunkFilename: "[id].css",
      }),
      new webpack.HotModuleReplacementPlugin(),
      new CaseSensitivePathsPlugin(),
      // Provide process and Buffer globally
      new webpack.ProvidePlugin({
        process: "process/browser",
        Buffer: ["buffer", "Buffer"],
      }),
      // Define global variables
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify("development"),
        "process.browser": true,
        global: "window",
      }),
      // Ignore certain node modules
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      }),
    ],
    devtool: "cheap-module-source-map",
    devServer: {
      static: {
        directory: DIST,
        publicPath: process.env.REACT_STATIC_ASSETS_PATH || "/",
        watch: {
          ignored: /node_modules/,
          usePolling: false,
        },
      },
      hot: true,
      compress: true,
      port: config.devServer?.port || 3000,
      host: config.devServer?.host || "localhost",
      open: config.devServer?.open || false,
      historyApiFallback: {
        disableDotRule: true,
        verbose: false,
      },
      client: {
        logging: "info",
        overlay: {
          errors: true,
          warnings: false,
        },
        progress: true,
        reconnect: true,
        webSocketURL: {
          hostname: "localhost",
          pathname: "/ws",
          port: config.devServer?.port || 3000,
          protocol: "ws",
        },
      },
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers":
          "X-Requested-With, content-type, Authorization",
      },
      // Remove or fix proxy configuration
      setupMiddlewares: (middlewares, devServer) => {
        // Socket.IO middleware will be added here if needed
        return middlewares;
      },
      allowedHosts: "all",
      webSocketServer: "ws",
      devMiddleware: {
        publicPath: process.env.REACT_STATIC_ASSETS_PATH || "/",
        stats: "minimal",
        serverSideRender: false,
      },
    },
    performance: {
      hints: false,
    },
    watchOptions: {
      aggregateTimeout: 300,
      poll: false,
      ignored: /node_modules/,
    },
    infrastructureLogging: {
      level: "warn",
    },
    experiments: {
      topLevelAwait: true,
    },
    cache: {
      type: "filesystem",
      cacheDirectory: path.resolve(
        config.paths.ROOT,
        "node_modules/.cache/webpack"
      ),
      buildDependencies: {
        config: [__filename],
      },
    },
  };
}
