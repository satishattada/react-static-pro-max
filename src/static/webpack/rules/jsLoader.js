import path from 'path';

export default function({ config, stage }) {
  const isNode = stage === 'node';
  const isDev = stage === 'dev';

  // Check if TypeScript preset is available
  let hasTypescriptPreset = false;
  try {
    require.resolve('@babel/preset-typescript');
    hasTypescriptPreset = true;
  } catch (e) {
    // TypeScript preset not available, that's okay
  }

  return {
    test: /\.(js|jsx|mjs|cjs|ts|tsx)$/,
    // More specific exclusion strategy
    exclude: (modulePath) => {
      // Don't exclude source files
      if (!modulePath.includes('node_modules')) {
        return false;
      }

      // Always transpile these packages even if they're in node_modules
      const includePackages = [
        'axios',
        'react-static-pro-max',
        'react-static-pro-plugin',
      ];

      const shouldInclude = includePackages.some(pkg => 
        modulePath.includes(path.sep + 'node_modules' + path.sep + pkg + path.sep) ||
        modulePath.endsWith(path.sep + 'node_modules' + path.sep + pkg)
      );

      // Exclude everything else in node_modules
      return !shouldInclude;
    },
    use: [
      {
        loader: require.resolve('babel-loader'),
        options: {
          cacheDirectory: isDev,
          cacheCompression: false,
          compact: !isDev,
          sourceType: 'unambiguous', // Let Babel detect module type
          presets: [
            [
              require.resolve('@babel/preset-env'),
              {
                targets: isNode
                  ? { node: 'current' }
                  : { 
                      browsers: ['last 2 versions', 'not dead', 'not ie <= 11'],
                    },
                // Force CommonJS for compatibility
                modules: isNode ? 'commonjs' : false,
                useBuiltIns: 'usage',
                corejs: 3,
                loose: true,
              },
            ],
            [
              require.resolve('@babel/preset-react'),
              {
                runtime: 'automatic',
                development: isDev,
                pure: !isDev,
              },
            ],
            // Add TypeScript preset only if it's available
            hasTypescriptPreset && [
              require.resolve('@babel/preset-typescript'),
              {
                isTSX: true,
                allExtensions: true,
                onlyRemoveTypeImports: true,
              }
            ],
          ].filter(Boolean),
          plugins: [
            require.resolve('@babel/plugin-syntax-dynamic-import'),
            require.resolve('@babel/plugin-proposal-export-default-from'),
            [
              require.resolve('@babel/plugin-transform-runtime'),
              {
                regenerator: true,
                corejs: false,
                helpers: true,
                useESModules: false,
              },
            ],
            // Transform all module types to CommonJS for node_modules
            require.resolve('@babel/plugin-transform-modules-commonjs'),
          ].filter(Boolean),
          // Don't look for external babel config
          babelrc: false,
          configFile: false,
        },
      },
    ],
  };
}