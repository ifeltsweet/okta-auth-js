require('@okta/env').setEnvironmentVarsFromTestEnv(); // Set environment variables from "testenv" file

const path = require('path');
const webpack = require('webpack');
const PORT = process.env.PORT || 8080;

const babelOptions = {
  presets: ['@babel/env'],
  plugins: ['@babel/plugin-transform-runtime'],
  sourceType: 'unambiguous'
};

module.exports = {
  mode: 'development',
  entry: './src/webpackEntry.ts',
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'oidc-app.js',
    publicPath: '/'
  },
  plugins: [
    new webpack.EnvironmentPlugin(['CLIENT_ID', 'ISSUER']),
  ],
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    port: PORT,
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['source-map-loader'],
        enforce: 'pre'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: babelOptions
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: babelOptions
          },
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.ts'],
    alias: {
      '@okta/okta-auth-js': path.join(__dirname, '..', '..', 'build')
    }
  }
};
