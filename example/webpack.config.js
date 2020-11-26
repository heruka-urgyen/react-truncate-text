const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")

module.exports = env => ({
  mode: env.development ? "development" : "production",
  entry: env.development ?
    [
      "webpack-dev-server/client?http://localhost:9000",
      "core-js/stable",
      "./index.js",
    ] :
    [
      "core-js/stable",
      "./index.js",
    ],
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
  },
  devtool: "inline-source-map",
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    port: 9000,
  },
  plugins: [
    new HtmlWebpackPlugin({template: "index.ejs"}),
  ],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
})
