'use strict'

const Gallery = use('App/Model/Gallery')
const Image = use('App/Model/Image')
const Keyword = use('App/Model/Keyword')

class GalleryManagerController {

  * showFormPage(req, resp) {
    let gallery = null

    if (req.match('/gallery/add')) {

    }

    yield resp.sendView('forms/gallery')
  }

}

module.exports = GalleryManagerController