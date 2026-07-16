const path = require('node:path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');

const rootDir = __dirname;
const resolveSrc = (dir) => path.resolve(rootDir, 'src', dir);

module.exports = {
  entry: path.resolve(rootDir, 'src/main.tsx'),
  output: {
    path: path.resolve(rootDir, 'dist'),
    filename: 'assets/[name].[contenthash:8].js',
    chunkFilename: 'assets/[name].[contenthash:8].js',
    assetModuleFilename: 'assets/[name].[contenthash:8][ext][query]',
    clean: true,
    publicPath: '/'
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@app': resolveSrc('app'),
      '@pages': resolveSrc('pages'),
      '@features': resolveSrc('features'),
      '@entities': resolveSrc('entities'),
      '@shared': resolveSrc('shared'),
      '@store': resolveSrc('store'),
      '@styles': resolveSrc('styles')
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.module\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                namedExport: false,
                localIdentName: '[name]__[local]__[hash:base64:5]'
              }
            }
          },
          'less-loader'
        ]
      },
      {
        test: /\.less$/,
        exclude: /\.module\.less$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader']
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|webp|avif)$/i,
        type: 'asset'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(rootDir, 'public/index.html')
    }),
    new webpack.DefinePlugin({
      'import.meta.env': JSON.stringify({
        VITE_TMDB_ACCESS_TOKEN: process.env.VITE_TMDB_ACCESS_TOKEN ?? '',
        VITE_TMDB_BASE_URL: process.env.VITE_TMDB_BASE_URL ?? 'https://api.themoviedb.org/3'
      })
    }),
    new MiniCssExtractPlugin({
      filename: 'assets/[name].[contenthash:8].css',
      chunkFilename: 'assets/[name].[contenthash:8].css'
    })
  ],
  performance: {
    hints: false
  }
};
