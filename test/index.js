'use strict';

var images = require("../");

images("input.png")
    .resize( 200 )
    .save("output_new.png");

images("input.png")
    .rotate( 45 )
    .save("output_rotate.png");

images("input.png")
    .size( 200 )
    .save("output_old.png");


images("input.jpg")
    .resize( 200 )
    .save("output_new.jpg");

images("input.webp")
     .resize( 200 )
     .save("output_webp.webp");

images("input.jpg")
    .size( 200 )
    .save("output_old.jpg");

images("input.gif")
    .resize( 200 )
    .save("output_new_gif.jpg");

images("input.webp")
    .resize( 200 )
    .save("output_new_webp.jpg");

images("input.gif")
    .size( 200 )
    .save("output_old_gif.jpg");
