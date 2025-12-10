import MiniCssExtractPlugin from "mini-css-extract-plugin";
import path from "path";

export default function ({ config, stage }) {
  const isNode = stage === "node";
  const isDev = stage === "dev";

  // Base CSS loader configuration
  const cssLoader = {
    loader: require.resolve("css-loader"),
    options: {
      importLoaders: 2,
      sourceMap: isDev,
      modules: {
        auto: true,
        localIdentName: isDev
          ? "[path][name]__[local]--[hash:base64:5]"
          : "[hash:base64]",
      },
      url: {
        // Don't process URLs starting with / - these are already public assets
        filter: (url) => !url.startsWith('/'),
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

  // SCSS/SASS loader configuration
  const sassLoader = {
    loader: require.resolve("sass-loader"),
    options: {
      sourceMap: isDev,
      sassOptions: {
        includePaths: [
          path.resolve(process.cwd(), "src"),
          path.resolve(process.cwd(), "src/app"),
          path.resolve(process.cwd(), "src/app/scss"),
        ],
        quietDeps: true,
        silenceDeprecations: ['import'],
      },
    },
  };

  // For server-side rendering (node stage)
  if (isNode) {
    return {
      oneOf: [
        {
          test: /\.s[ac]ss$/,
          use: [
            {
              loader: require.resolve("css-loader"),
              options: {
                modules: {
                  exportOnlyLocals: true,
                },
              },
            },
            postcssLoader,
            sassLoader,
          ],
        },
        {
          test: /\.css$/,
          loader: require.resolve("css-loader"),
          options: {
            modules: {
              exportOnlyLocals: true,
            },
          },
        },
      ],
    };
  }

  // For client-side (dev and prod)
  const styleLoader = isDev
    ? require.resolve("style-loader")
    : MiniCssExtractPlugin.loader;

  return {
    oneOf: [
      {
        test: /\.s[ac]ss$/,
        use: [styleLoader, cssLoader, postcssLoader, sassLoader],
      },
      {
        test: /\.css$/,
        use: [styleLoader, cssLoader, postcssLoader],
      },
    ],
  };
}
