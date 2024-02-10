/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");

module.exports = {
  entry: path.resolve(__dirname, "src", "index.ts"),
  output: {
    globalObject: "this",
    library: "advancedPostMessage",
    libraryTarget: "umd",
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
    chunkFilename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
        include: [path.resolve(__dirname, "src")],
        options: {
          configFile: "prod.tsconfig.json",
        },
      },
    ],
  },

  resolve: {
    extensions: [".json", ".js", ".ts"],
    alias: {
      "@common": path.resolve(__dirname, "src", "common"),
      "@configHandler": path.resolve(__dirname, "src", "configHandler"),
      "@eventManager": path.resolve(__dirname, "src", "eventManager"),
      "@logger": path.resolve(__dirname, "src", "logger"),
      "@testUtils": path.resolve(__dirname, "src", "testUtils"),
      "@": path.resolve(__dirname, "src"),
    },
  },
};
