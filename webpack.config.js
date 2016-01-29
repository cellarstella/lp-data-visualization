var path = require('path');
var node_modules = path.resolve(__dirname, 'node_modules');
var pathToReact = path.resolve(node_modules, 'react/dist/react.js');
var pathToReactDom = path.resolve(node_modules, 'react/lib/ReactDOM');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var config = {
  entry: [
  'webpack/hot/dev-server',
  'webpack-dev-server/client?http://localhost:3000',
  path.resolve(__dirname, 'app/js/main.js')
	],
  resolve: {
  	alias: {
  		'react': pathToReact,
  		'react-dom': pathToReactDom

  	}
		  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js'
  },
	module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel',
      query: {
      	presets: [
	      	'es2015',
	      	'react'
      	]
      }
    },{
      test: /\.scss$/,
      loader: ExtractTextPlugin.extract('css!sass')
    }],
    noParse: [pathToReact]
	},
	plugins: [
	new ExtractTextPlugin('style.css', {
		allChunks: true
	})]
};

module.exports = config;