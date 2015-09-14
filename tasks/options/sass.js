module.exports = {
  dist: {
    options: {
      // cssmin will minify later
      style: 'expanded'
    },
    files: {
      'public/dist/css/main.css': 'public/css/main.scss'
    }
  }
};