'use strict'

const Validator = use('Validator')
const Config = use('Config')
const Gallery = use('App/Model/Gallery')
const Image = use('App/Model/Image')
const Keyword = use('App/Model/Keyword')
const h = require('../../helpers.js')

class ImageManagerController {

  * showUploadPage(req, resp) {
    const gallery = yield Gallery.find(req.param('id'))
    if (!gallery) {
      resp.notFound('A galéria nem található.')
      return
    }

    if (!h.checkOwn(gallery, req)) {
      resp.unauthorized('Ez a galéria nem a tiéd.')
      return
    }

    yield resp.sendView('forms/upload', {
      gallery: gallery.toJSON(),
      fields: req.input('fields', 1),
      max_dim: Config.get('gallery.max_original_dimensions'),
      max_size: Config.get('gallery.max_upload_size'),
    })
  }

}

module.exports = ImageManagerController