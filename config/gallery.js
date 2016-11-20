'use strict'

module.exports = {
  // long side of thumbnail images (in pixels)
  thumb_dimensions: 200,

  // long side of medium-sized images (in pixels)
  medium_dimensions: 800,

  // long side of uploaded image must smaller than given value (in pixels)
  // otherwise image is not saved
  max_original_dimensions: 5000,

  // maximum size of uploaded image (in kilobytes)
  max_upload_size: 5000,
}