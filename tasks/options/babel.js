module.exports = {
  babel: {
    options: {
      sourceMap: true
    },
    files: [{
      "expand": true,
      "cwd": "public/js/",
      "src": ["**/*.js"],
      "dest": "public/dist/js/",
      "ext": ".js"
    }]
  }
};