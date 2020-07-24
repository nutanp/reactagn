const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const webpack = require('webpack');
//const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  entry: [__dirname + "/config/config.js", __dirname + "/app/appLanding.js"],
//	entry:  __dirname + "/app/appLanding.js",
  output: {
    path: __dirname + "/public",
    filename: "bundle.js"
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
   }),
    new UglifyJsPlugin({
    uglifyOptions: {
      ie8: false,
      ecma: 8,
      mangle : {
        toplevel : true
      },
      compress : {
        toplevel : true
      },
      output: {
        comments: false,
        beautify: false
      },
      warnings: false
    }
  }),
  // new CompressionPlugin({   
  //   asset: "[path].gz[query]",
  //   algorithm: "gzip",
  //   test: /\.js$|\.css$|\.html$/,
  //   threshold: 10240,
  //   minRatio: 0.8
  // })
  ],
	module: {
    noParse: [ /node_modules\/json-schema\/lib\/validate\.js/, /node_modules\/mapbox-gl/, ], 
    loaders: [{
      test: /\.jsx?$/,
      exclude: [
            /.*mapbox-gl.*/
          ],
      loader: 'babel-loader',
      query:{

        presets: ['react','es2015']
      }
    }]
  }
};
