// webpack.mix.js

let mix = require('laravel-mix');

mix.js([
  'js/data.js', 
], 'assets/app.js').setPublicPath('assets');

mix.css('style.css', 'assets/css/style.css');