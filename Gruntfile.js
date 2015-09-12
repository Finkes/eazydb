module.exports = function(grunt) {
  grunt.initConfig({
    jasmine_node: {
       options: {
         forceExit: true,
         match: '.',
         matchall: false,
         extensions: 'js',
         specNameMatcher: 'spec'
       },
       all: ['spec/']
     }
  });

  // Register tasks.
  grunt.loadNpmTasks('grunt-jasmine-node');

  // Default task.
  grunt.registerTask('default', 'jasmine_node');
  grunt.registerTask('test', 'jasmine_node');

};
