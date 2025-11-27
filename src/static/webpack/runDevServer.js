/* eslint-disable import/no-dynamic-require, import/no-mutable-exports */
import webpack from "webpack";
import chalk from "chalk";
import { Server as SocketIOServer } from "socket.io";
import { createServer } from "http";
import WebpackDevServer from "webpack-dev-server";
//
import makeWebpackConfig from "./makeWebpackConfig";
import getRouteData from "../getRouteData";
import plugins from "../plugins";
import { findAvailablePort, time, timeEnd } from "../../utils";
import fetchSiteData from "../fetchSiteData";

let devServer;
let latestState;
let buildDevRoutes = () => {};
let socketServer; // Add socket server reference

export const reloadClientData = () => {
  if (reloadClientData.current) {
    reloadClientData.current();
  }
};

// Starts the development server
export default async function runDevServer(state) {
  state = await runExpressServer(state);
  return state;
}

async function runExpressServer(state) {
  // Default to localhost:3000, or use a custom combo if defined in static.config.js
  // or environment variables
  const intendedPort = Number(state.config.devServer.port);
  const port = await findAvailablePort(intendedPort);

  let defaultMessagePort = 4000;

  if (process.env.REACT_STATIC_MESSAGE_SOCKET_PORT) {
    defaultMessagePort = process.env.REACT_STATIC_MESSAGE_SOCKET_PORT;
  }
  // Find an available port for messages, as long as it's not the devServer port
  const messagePort = await findAvailablePort(defaultMessagePort, [port]);

  if (intendedPort !== port) {
    console.log(
      chalk.red(
        `Warning! Port ${intendedPort} is not available. Using port ${chalk.green(
          port,
        )} instead!`,
      ),
    );
  }

  state = {
    ...state,
    config: {
      ...state.config,
      devServer: {
        ...state.config.devServer,
        port,
      },
    },
  };

  const devConfig = makeWebpackConfig(state);
  const devCompiler = webpack(devConfig);

  // Convert proxy object to array format for webpack-dev-server v5
  const userProxy = state.config.devServer?.proxy || {};
  const proxyArray = [];
  
  // Add Socket.IO proxy
  proxyArray.push({
    context: ['/socket.io'],
    target: `http://localhost:${messagePort}`,
    ws: true,
    changeOrigin: true,
  });

  // Convert user proxy config from object to array
  if (userProxy && typeof userProxy === 'object' && !Array.isArray(userProxy)) {
    Object.entries(userProxy).forEach(([context, options]) => {
      if (typeof options === 'string') {
        proxyArray.push({
          context: [context],
          target: options,
          changeOrigin: true,
        });
      } else {
        proxyArray.push({
          context: [context],
          ...options,
        });
      }
    });
  } else if (Array.isArray(userProxy)) {
    proxyArray.push(...userProxy);
  }

  const devServerConfig = {
    historyApiFallback: true,
    compress: false,
    hot: true,
    client: {
      overlay: true,
      logging: "warn",
    },
    ...state.config.devServer,
    devMiddleware: {
      stats: "errors-only",
      publicPath: "/",
    },
    // Proxy must be an array in webpack-dev-server v5
    proxy: proxyArray.length > 0 ? proxyArray : undefined,
    static: [
      {
        directory: state.config.paths.PUBLIC,
      },
      {
        directory: state.config.paths.DIST,
      },
    ],
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error("webpack-dev-server is not defined");
      }
      
      buildDevRoutes = async (newState) => {
        latestState = await fetchSiteData(newState);

        devServer.app.get(
          "/__react-static-pro-max__/siteData",
          async (req, res, next) => {
            try {
              res.send(latestState.siteData);
            } catch (err) {
              res.status(500);
              res.send(err);
              next(err);
            }
          },
        );

        // Serve each routes data
        latestState.routes.forEach(({ path: routePath }) => {
          devServer.app.get(
            `/__react-static-pro-max__/routeInfo/${encodeURI(
              routePath === "/" ? "" : routePath,
            )}`,
            async (req, res, next) => {
              // Make sure we have the most up to date route from the config, not
              // an out of date object.
              let route = latestState.routes.find((d) => d.path === routePath);
              try {
                if (!route) {
                  const err = new Error(
                    `Route could not be found for: ${routePath}
                      If you removed this route, disregard this error.
                      If this is a dynamic route, consider adding it to the prefetchExcludes list:
                        addPrefetchExcludes(['${routePath}'])
                      `,
                  );
                  delete err.stack;
                  throw err;
                }

                route = await getRouteData(route, latestState);
                route = await plugins.routeInfo(route, latestState, route);

                // Don't use any hashProp, just pass all the data in dev
                res.json(route);
              } catch (err) {
                res.status(404);
                next(err);
              }
            },
          );
        });
        return new Promise((resolve) => setTimeout(resolve, 1));
      };

      buildDevRoutes(state);

      return middlewares;
    },
  };

  let first = true;
  const startedAt = Date.now();
  let skipLog = false;

  console.log("Bundling Application...");
  time(chalk.green("[\u2713] Application Bundled"));

  devCompiler.hooks.invalid.tap(
    {
      name: "react-static-pro-max",
    },
    (file, changed) => {
      // If a file is changed within the first two seconds of
      // the server starting, we don't bark about it. Less
      // noise is better!
      skipLog = changed - startedAt < 2000;
      if (!skipLog) {
        console.log("File changed:", file.replace(state.config.paths.ROOT, ""));
        console.log("Updating bundle...");
        time(chalk.green("[\u2713] Bundle Updated"));
      }
    },
  );

  devCompiler.hooks.done.tap(
    {
      name: "react-static-pro-max",
    },
    (stats) => {
      const messages = stats.toJson({}, true);
      const isSuccessful = !messages.errors.length;
      const hasWarnings = messages.warnings.length;

      if (isSuccessful && !skipLog) {
        if (first) {
          // Print out any dev compiler warnings
          if (hasWarnings) {
            console.log(
              chalk.yellowBright(
                `\n[\u0021] There were ${messages.warnings.length} warnings during compilation\n`,
              ),
            );
            messages.warnings.forEach((message, index) => {
              console.warn(`[warning ${index}]: ${message}\n`);
            });
          }

          timeEnd(chalk.green("[\u2713] Application Bundled"));
          const protocol = state.config.devServer.https ? "https" : "http";
          console.log(
            `${chalk.green("[\u2713] App serving at")} ${chalk.blue(
              `${protocol}://${state.config.devServer.host}:${state.config.devServer.port}`,
            )}`,
          );
        } else {
          timeEnd(chalk.green("[\u2713] Bundle Updated"));
        }
      } else if (!skipLog) {
        console.log(chalk.redBright("[\u274C] Application bundling failed"));
        console.error(chalk.redBright(messages.errors.join("\n")));
        console.warn(chalk.yellowBright(messages.warnings.join("\n")));
      }

      first = false;
    },
  );

  // Start the webpack dev server
  devServer = new WebpackDevServer(devServerConfig, devCompiler);

  // Create HTTP server for Socket.IO
  const httpServer = createServer();
  
  // Initialize Socket.IO server properly
  socketServer = new SocketIOServer(httpServer, {
    cors: {
      origin: `http://localhost:${port}`,
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ['polling', 'websocket'],
  });

  // Handle Socket.IO connections
  socketServer.on('connection', (socket) => {
    console.log('Client connected to Socket.IO');
    
    socket.on('disconnect', () => {
      console.log('Client disconnected from Socket.IO');
    });
  });

  reloadClientData.current = async () => {
    try {
      latestState = await fetchSiteData(latestState);
      socketServer.emit("message", { type: "reloadClientData" });
    } catch (error) {
      console.error('Error reloading client data:', error);
    }
  };

  await new Promise((resolve, reject) => {
    devServer.startCallback((err) => {
      if (err) {
        console.error(`Dev server failed to start: ${err}`);
        return reject(err);
      }
      console.log("Dev server started successfully");
      resolve();
    });
  });

  // Start the Socket.IO server on the message port
  await new Promise((resolve, reject) => {
    httpServer.listen(messagePort, (err) => {
      if (err) {
        console.error(`Socket.IO server failed to start on port ${messagePort}: ${err}`);
        return reject(err);
      }
      console.log(`Socket.IO server listening on port ${messagePort}`);
      resolve();
    });
  });

  console.log("Running plugins...");
  state = await plugins.afterDevServerStart(state);

  return state;
}

// Add cleanup function
export const cleanup = () => {
  if (socketServer) {
    socketServer.close();
  }
  if (devServer) {
    devServer.close();
  }
};