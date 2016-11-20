'use strict'

const fs = require('co-fs')
const AdonisHelpers = use('Helpers')
const Gallery = use('App/Model/Gallery')
const Image = use('App/Model/Image')

class GalleryBrowserController {

  /**
   * Sends JPG file to client.
   * @todo Use secret filenames instead of db access
   */
  * sendImage(req, resp) {
    const img = yield Image.find(req.param('id'))
    if (!img) {
      resp.notFound('A kép nem létezik.')
      return
    }

    const gal = yield img.gallery().fetch()
    if (!img.public && (!req.currentUser || req.currentUser.id != gal.user_id)) {
      resp.unauthorized('Ez a kép privát.')
      return
    }

    let prefix = ''
    if (req.match('/image/:id/thumb')) prefix = 'th'
    else if (req.match('/image/:id/medium')) prefix = 'md'

    let path = AdonisHelpers.storagePath(`gallery/${gal.user_id}/${gal.id}/${prefix}${img.id}.jpg`)

    // if thumbnail or medium doesn't exist, send original
    // @TODO save original size to db, and check that instead of fs access
    if (!(yield fs.exists(path))) {
      path = AdonisHelpers.storagePath(`gallery/${gal.user_id}/${gal.id}/${img.id}.jpg`)
    }

    resp.download(path)

    img.view_count++
    yield img.save()
  }

  * showMainPage(req, resp) {
    const galleries = yield Gallery.query().public()
      .orderBy('id', 'desc')
      .limit(5)
      .with('user')
      .fetch()

    // TODO query user for images

    const images = yield Image.query().public()
      .orderBy('id', 'desc')
      .limit(5)
      .fetch()

    const top = yield Image.query().public()
      .orderBy('like_count', 'desc')
      .limit(5)
      .fetch()

    yield resp.sendView('galleryBrowser/mainPage', {
      galleries: galleries.toJSON(),
      images: images.toJSON(),
      topimages: top.toJSON(),
    })
  }

  * showGalleryListPage(req, resp) {
    const galleries = yield Gallery.query().public()
      .orderBy('id', 'desc')
      .with('user')
      .fetch()

    yield resp.sendView('galleryBrowser/galleryListPage', {
      galleries: galleries.toJSON(),
    })
  }

  * showGalleryPage(req, resp) {
    const gallery = yield Gallery.find(req.param('id'))
    if (!gallery) {
      resp.notFound('A galéria nem létezik.')
      return
    }

    if (!gallery.public && (!req.currentUser || req.currentUser.id != gallery.user_id)) {
      resp.unauthorized('Ez a galéria privát.')
      return
    }

    yield gallery.related('user').load()
    const images = yield gallery.images().public().fetch()
    const keywords = yield gallery.keywords().fetch()

    yield resp.sendView('galleryBrowser/galleryPage', {
      gallery: gallery.toJSON(),
      images: images.toJSON(),
      keywords: keywords.toJSON(),
    })
  }

  * showImagePage(req, resp) {
    const image = yield Image.find(req.param('id'))
    if (!image) {
      resp.notFound('A kép nem létezik.')
      return
    }

    yield image.related('gallery').load()

    if (!image.public && (!req.currentUser || req.currentUser.id != image.gallery.user_id)) {
      resp.unauthorized('Ez a kép privát.')
      return
    }

    yield image.related('gallery.user').load()
    const keywords = yield image.keywords().fetch()
    const likes = yield image.likes().fetch()
    
    let likeStatus = 'can-like'
    if (!req.currentUser) {
      likeStatus = 'guest'
    }
    else if (likes.some(user => user.id == req.currentUser.id)) {
      likeStatus = 'liked'
    }

    yield resp.sendView('galleryBrowser/imagePage', {
      image: image.toJSON(),
      keywords: keywords.toJSON(),
      likes: likes.toJSON(),
      likeStatus
    })
  }

  * likeImage(req, resp) {
    const image = yield Image.find(req.param('id'))
    if (!image) {
      resp.notFound('A kép nem létezik.')
      return
    }

    yield image.related('gallery').load()

    if (!image.public && req.currentUser.id != image.gallery.user_id) {
      resp.unauthorized('Ez a kép privát.')
      return
    }

    const liked = yield image.likes().where('id', req.currentUser.id).first()
    if (!liked) {
      yield image.likes().attach([ req.currentUser.id ])
      image.like_count++
      yield image.save()
    }

    resp.route('image', { id: image.id })
  }

}

module.exports = GalleryBrowserController