module.exports = {
  dist: {
    options: {
      // cssmin will minify later
      style: 'expanded'
    },
    files: {
      'public/css/build/main.css': 'public/css/main.scss'
    }
  }
};