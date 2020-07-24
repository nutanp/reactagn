const path = require ('path');
console.log('webpack.config.js -> env_config : '+process.env.env_config)
process.env.NODE_ENV = process.env.env_config
console.log('webpack.config.js -> process.env.NODE_ENV: '+process.env.NODE_ENV)
module.exports = {
	entry: [__dirname + "/config/config."+process.env.NODE_ENV+".js", __dirname + "/app/appLanding.js"],
	output: {
		path: path.resolve(__dirname,"public"),
		filename: "bundle.js"
	},
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
