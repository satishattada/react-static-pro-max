import ExtractCssChunks from "extract-css-chunks-webpack-plugin";
import path from "path";

export default function ({ config, stage }) {
  const isNode = stage === "node";
  const isDev = stage === "dev";

  // Base CSS loader configuration
  const cssLoader = {
    loader: require.resolve("css-loader"),
    options: {
      importLoaders: 1,
      sourceMap: isDev,
      modules: {
        auto: true,
        localIdentName: isDev
          ? "[path][name]__[local]--[hash:base64:5]"
          : "[hash:base64]",
      },
    },
  };

  // PostCSS loader configuration (updated for postcss-loader v8)
  const postcssLoader = {
    loader: require.resolve("postcss-loader"),
    options: {
      postcssOptions: {
        plugins: [
          require.resolve("postcss-flexbugs-fixes"),
          [
            require.resolve("autoprefixer"),
            {
              flexbox: "no-2009",
            },
          ],
        ],
      },
      sourceMap: isDev,
    },
  };

  // For server-side rendering (node stage)
  if (isNode) {
    return {
      test: /\.css$/,
      loader: require.resolve("css-loader/locals"),
    };
  }

  // For client-side (dev and prod)
  return {
    test: /\.css$/,
    use: [
      isDev ? require.resolve("style-loader") : ExtractCssChunks.loader,
      cssLoader,
      postcssLoader,
    ],
  };
}
