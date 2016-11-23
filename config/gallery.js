'use strict'

module.exports = {

  // first (the only admin) user inserted into database when seeding
  admin: {
    username: 'admin',
    email: 'admin@admin.com',
    password: 'pwd',
  },

  scale_params: {
    // long side of medium-sized images (in pixels)
    medium_dim: 800,
    // long side of thumbnail images (in pixels)
    thumb_dim: 200,
    // quality of scaled images
    quality: 70,
  },

  validation: {
    // long side of uploaded image must be smaller than given value (in pixels)
    // otherwise image is not saved
    max_original_dimensions: 5000,

    // maximum size of uploaded image (in kilobytes)
    max_upload_size: 5000,
  },
}