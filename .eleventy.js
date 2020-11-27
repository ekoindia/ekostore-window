const yaml = require('js-yaml');
const fs = require("fs");
const htmlmin = require("html-minifier");
const CleanCSS = require("clean-css");
const blogTools = require("eleventy-plugin-blog-tools");


module.exports = function(eleventyConfig) {

  eleventyConfig.addFilter("cssmin", function(code) {
    return new CleanCSS({}).minify(code).styles;
  });

  eleventyConfig.addTransform("htmlmin", function(content, outputPath) {
    if( outputPath.endsWith(".html") ) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true
      });
      return minified;
    }
    return content;
  });
  
  eleventyConfig.addNunjucksAsyncFilter("jsmin", async function (
    code,
    callback
  ) {
    try {
      const minified = await minify(code);
      callback(null, minified.code);
    } catch (err) {
      console.error("Terser error: ", err);
      // Fail gracefully.
      callback(null, code);
    }
  });

  eleventyConfig.addPlugin(blogTools);

  eleventyConfig.addPassthroughCopy('src/images');

  eleventyConfig.addLayoutAlias('base', '/base.njk');
  eleventyConfig.addLayoutAlias('product-page', '/product-page.njk');

  eleventyConfig.addDataExtension('yaml', contents => yaml.safeLoad(contents))

  // Filter source file names using a glob
  eleventyConfig.addCollection("products", function(collection) {
    return collection.getFilteredByGlob('src/products/*.md');
  });

  return {
    markdownTemplateEngine: 'njk',
    dir: {
      input: 'src',
      data: '_data',
      includes: '_includes',
      layouts: '_layouts',
      output: '_site'
    }
  }
}