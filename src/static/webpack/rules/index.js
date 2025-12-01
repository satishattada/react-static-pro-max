import jsLoader from "./jsLoader";
import cssLoader from "./cssLoader";
import fileLoader from "./fileLoader";

export default function rules({ config, stage }) {
  // Get all loader rules
  const jsLoaderRule = jsLoader({ config, stage });
  const cssLoaderRule = cssLoader({ config, stage });
  const fileLoaderRule = fileLoader({ config, stage });

  // Validate loaders
  if (!jsLoaderRule) {
    throw new Error("jsLoader returned undefined");
  }
  if (!cssLoaderRule) {
    throw new Error("cssLoader returned undefined");
  }
  if (!fileLoaderRule) {
    throw new Error("fileLoader returned undefined");
  }

  // Special rule for axios to handle mixed module formats
  const axiosRule = {
    test: /\.cjs$/,
    include: /node_modules[\\/]axios/,
    type: "javascript/auto",
    use: [
      {
        loader: require.resolve("babel-loader"),
        options: {
          cacheDirectory: stage === "dev",
          sourceType: "unambiguous",
          presets: [
            [
              require.resolve("@babel/preset-env"),
              {
                modules: "commonjs",
                loose: true,
              },
            ],
          ],
          plugins: [
            require.resolve("@babel/plugin-transform-modules-commonjs"),
          ],
        },
      },
    ],
  };

  return [
    axiosRule,
    {
      oneOf: [
        jsLoaderRule,
        cssLoaderRule,
        fileLoaderRule,
        // Fallback for any other files
        {
          exclude: [/\.(js|mjs|jsx|cjs|ts|tsx)$/, /\.html$/, /\.json$/],
          type: "asset/resource",
          generator: {
            filename: "static/[name].[hash:8][ext]",
          },
        },
      ],
    },
  ];
}
