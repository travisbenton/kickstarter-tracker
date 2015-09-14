module.exports = {
  dynamic: {
    files: [{
      expand: true,
      cwd: 'public/dist/img/',
      src: ['**/*.{png,jpg,gif}'],
      dest: 'public/dist/img/'
    }]
  }
};