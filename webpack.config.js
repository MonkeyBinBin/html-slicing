'use strict'
const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const fs = require('fs')

function generateHtmlPlugins (templateDir) {
  const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir))
  return templateFiles.map((item) => {
    // Split names and extension
    const parts = item.split('.')
    const name = parts[0]
    const extension = parts[1]
    return new HtmlWebpackPlugin({
      filename: `${name}.html`,
      chunks: [name],
      template: path.resolve(
        __dirname,
        `${templateDir}/${name}.${extension}`
      )
    })
  })
}

function generateEntry (entryDir) {
  const entryFiles = fs.readdirSync(path.resolve(__dirname, entryDir))
  return entryFiles.reduce((acc, item) => {
    const parts = item.split('.')
    const name = parts[0]
    const extension = parts[1]
    acc[name] = `./src/entry/${name}.${extension}`
    return acc
  }, {})
}

const plugins = [
  new webpack.DefinePlugin({
    BASE_URL: JSON.stringify(process.env.BASE_URL || '/')
  }),
  new CopyPlugin({
    patterns: [{ from: 'static' }]
  }),
  new MiniCssExtractPlugin({
    filename: 'css/[name].css'
  })
].concat(generateHtmlPlugins('./src/templates'))

module.exports = {
  entry: generateEntry('./src/entry'),
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'js/[name].js'
  },
  resolve: {
    extensions: ['.js', '.scss', '.css', '.png', '.jpg', '.gif'],
    alias: {
      '@': path.resolve('src')
    },
    modules: ['node_modules', path.resolve('src')]
  },
  plugins,
  devServer: {
    index: 'index.html',
    hot: true,
    watchContentBase: true,
    contentBase: [
      path.join(__dirname, 'static'),
      path.join(__dirname, 'src/templates')
    ]
  },
  devtool: '#eval-source-map',
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../',
              hmr: process.env.NODE_ENV === 'development'
            }
          },
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: 'images/[name].[ext]'
            }
          }
        ]
      }
    ]
  }
}

if (process.env.NODE_ENV === 'development') {
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.HotModuleReplacementPlugin()
  ])
}

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  module.exports.plugins = (module.exports.plugins || []).concat([
    new CleanWebpackPlugin()
  ])
}

module.exports.plugins = (module.exports.plugins || []).concat([
  new webpack.ProvidePlugin({
    $: 'jquery',
    jQuery: 'jquery',
    'window.jQuery': 'jquery'
  })
])
