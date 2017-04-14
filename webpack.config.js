// Workaround for Windows Based Development/Build
try {
  require('os').networkInterfaces();
} catch (e) {
  require('os').networkInterfaces = () => ({});
}

const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const PATHS = {
  BUILD: path.resolve(__dirname, 'build'),
  APP: path.resolve(__dirname, 'src'),
  NODE_MODULES: path.resolve(__dirname, 'node_modules')
};

// COMMON CONFIG
let config = {
  entry: {
    'assets/styles/styles': `${PATHS.APP}/styles`,
    'assets/scripts/vendor': [
      'react',
      'react-dom',
      'redux',
      'redux-thunk',
      'moment',
      'react-datetime'
    ]
  },
  output: {
    filename: '[name].[chunkhash].js',
    path: PATHS.BUILD,
    publicPath: '/'
  },
  resolve: {
    modules: ['node_modules', PATHS.APP],
    extensions: [
      '.html',
      '.less',
      '.js',
      '.jsx',
      '.json'
    ],
    alias: {
      modules: path.resolve(PATHS.APP, 'modules'),
      utils: path.resolve(PATHS.APP, 'utils')
    },
    symlinks: false
  },
  resolveLoader: {
    moduleExtensions: ['-loader']
  },
  module: {
    rules: [
      {
        test: /npm-cli|node-hid/,
        loader: 'null'
      },
      {
        test: /\.less/,
        enforce: 'pre',
        loader: 'import-glob'
      },
      {
        test: /\.html/,
        loader: 'html',
        query: {
          minimize: true
        }
      },
      {
        test: /\.jsx?/,
        exclude: /node_modules/,
        loader: 'babel'
      },
      {
        test: /\.json/,
        loader: 'json'
      }
    ]
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(true),
    new CopyWebpackPlugin([
      {
        from: path.resolve(PATHS.APP, 'splash.css'),
        to: path.resolve(PATHS.BUILD, 'assets/styles')
      },
      {
        from: path.resolve(PATHS.APP, 'env.json'),
        to: path.resolve(PATHS.BUILD, 'config')
      },
      {
        from: path.resolve(PATHS.APP, 'manifest.json'),
        to: path.resolve(PATHS.BUILD, 'config')
      },
      {
        from: path.resolve(PATHS.APP, 'favicon.ico'),
        to: PATHS.BUILD
      },
      {
        from: path.resolve(PATHS.APP, 'assets/fonts'),
        to: path.resolve(PATHS.BUILD, 'assets/fonts')
      },
      {
        from: path.resolve(PATHS.APP, 'assets/images'),
        to: path.resolve(PATHS.BUILD, 'assets/images')
      },
      {
        from: path.resolve(__dirname, 'node_modules/airbitz-core-js-ui/assets'),
        to: path.resolve(PATHS.BUILD, 'abcui/assets')
      },
      {
        from: path.resolve(PATHS.APP, 'sitemap.xml'),
        to: PATHS.BUILD
      }
    ]),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'common',
      filename: 'assets/scripts/common.js'
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(PATHS.APP, 'index.html'),
      chunksSortMode: (a, b) => {
        const order = ['common', 'assets/scripts/vendor', 'assets/styles/styles', 'main'];

        return order.indexOf(b.names[0]) + order.indexOf(a.names[0]);
      }
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        GETH_PASSWORD: JSON.stringify(process.env.GETH_PASSWORD)
      }
    })
  ],
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  }
};

// DEVELOPMENT CONFIG
if (!process.env.DEBUG_BUILD && process.env.NODE_ENV === 'development') {
  config = merge(config, {
    entry: {
      main: [
        'react-hot-loader/patch',
        'webpack-hot-middleware/client',
        `${PATHS.APP}/main`
      ]
    },
    module: {
      rules: [
        {
          test: /\.less/,
          use: [
            'style-loader',
            'css-loader',
            'postcss-loader',
            'less-loader'
          ]
        }
      ]
    },
    devtool: 'eval-source-map',
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
    ]
  });
// PRODUCTION DEBUG CONFIG (unminified build + more specific source maps + no hot reload)
} else if (process.env.DEBUG_BUILD && process.env.NODE_ENV === 'development') {
  config = merge(config, {
    entry: {
      main: `${PATHS.APP}/main`
    },
    module: {
      rules: [
        {
          test: /\.less/,
          use: [
            'style-loader',
            'css-loader',
            'postcss-loader',
            'less-loader'
          ]
        }
      ]
    },
    devtool: 'eval-source-map'
  });
// PRODUCTION CONFIG
} else {
  config = merge(config, {
    entry: {
      main: `${PATHS.APP}/main`
    },
    module: {
      rules: [
        {
          test: /\.less/,
          use: ExtractTextPlugin.extract({
            use: [
              'css-loader',
              'postcss-loader',
              'less-loader'
            ],
            fallback: 'style-loader'
          }),
        }
      ]
    },
    devtool: 'source-map',
    plugins: [
      new ExtractTextPlugin({
        filename: '[name].css'
      }),
      new UglifyJSPlugin({
        comments: false,
        dropConsole: true,
        sourceMap: true
      })
    ]
  });
}

const WEBPACK_CONFIG = config;

module.exports = WEBPACK_CONFIG;
