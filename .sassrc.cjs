const sass = require("sass")

module.exports = {
  "includePaths": [
    "node_modules",
    // "F:/projets/corvee-server/src"
  ],
  "sourceMap": !process.env.NODE_ENV.endsWith('production'),
  functions: {
    env: function () {
      return new sass.SassString(process.env.NODE_ENV)
    }
  }
}