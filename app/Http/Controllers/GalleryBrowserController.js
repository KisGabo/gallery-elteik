'use strict'

const AdonisHelpers = use('Helpers')
const Gallery = use('App/Model/Gallery')
const Image = use('App/Model/Image')

class GalleryBrowserController {

  * sendOriginalImage(req, resp) {
    const img = yield Image.find(req.param('id'))
    if (!img) {
      resp.notFound('A kép nem létezik.')
      return
    }

    const gal = yield img.gallery().fetch()
    if (img.getIsPrivate() && (!req.currentUser || req.currentUser.id != gal.user_id)) {
      resp.unauthorized('Ez a kép privát.')
      return
    }

    const path = AdonisHelpers.storagePath(`gallery/${gal.user_id}/${gal.id}/${img.id}.jpg`)
    resp.download(path)

    img.views++
    yield img.save()
  }

  * showMainPage(req, resp) {
    const galleries = yield Gallery.query()
      .orderBy('created_at', 'desc')
      .limit(5)
      .with('user').fetch()

    yield resp.sendView('galleryBrowser/mainPage', {
      galleries: galleries.toJSON()
    })
  }

}

module.exports = GalleryBrowserController