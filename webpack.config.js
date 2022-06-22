const path = require('path');
const serverlessWebpack = require('serverless-webpack');

module.exports = {
  entry: serverlessWebpack.lib.entries,
  mode: 'development',
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.ts$/,
        use: 'babel-loader',
      },
    ],
  },
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, 'src'),
      '@test': path.resolve(__dirname, 'test'),
    },
    extensions: ['.ts', '.mjs', '.js'],
  },
  target: 'node',
};
