export default function ({ config, stage }) {
  const isNode = stage === 'node';

  // For node/SSR stage
  if (isNode) {
    return {
      test: /\.(png|jpe?g|gif|webp|svg|woff2?|ttf|eot|otf|ico)$/,
      type: 'asset/resource',
      generator: {
        emit: false,
        filename: 'static/[name].[hash:8][ext]',
      },
    };
  }

  // For browser stages (dev and prod)
  return {
    test: /\.(png|jpe?g|gif|webp|svg|woff2?|ttf|eot|otf|ico)$/,
    type: 'asset',
    parser: {
      dataUrlCondition: {
        maxSize: 10 * 1024, // 10kb - inline files smaller than this
      },
    },
    generator: {
      filename: 'static/[name].[hash:8][ext]',
    },
  };
}