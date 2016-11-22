'use strict'

const fs = require('co-fs')
const AdonisHelpers = use('Helpers')
const Gallery = use('App/Model/Gallery')
const Image = use('App/Model/Image')
const Keyword = use('App/Model/Keyword')
const h = require('../../helpers.js')

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

    if (!img.public && !h.checkOwn(gal, req)) {
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

    const isOwn = h.checkOwn(gallery, req)
    if (!gallery.public && !isOwn) {
      resp.unauthorized('Ez a galéria privát.')
      return
    }

    yield gallery.related('user').load()
    // if gallery belongs to current user, show private images too
    const images = yield (isOwn ? gallery.images().fetch() : gallery.images().public().fetch())
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

    // TODO access gallery without toJSON
    if (!image.public && !h.checkOwn(image.toJSON().gallery, req)) {
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

    image.view_count++
    yield image.save()

    yield resp.sendView('galleryBrowser/imagePage', {
      image: image.toJSON(),
      keywords: keywords.toJSON(),
      likes: likes.toJSON(),
      likeStatus
    })
  }

  * showKeywordPage(req, resp) {
    const keyword = yield Keyword.find(req.param('id'))
    if (!keyword) {
      resp.notFound('A kulcsszó nem létezik.')
      return
    }

    let galleries = null
    let images = null
    if (req.match('/keyword/:id/gallery')) {
      galleries = (yield keyword.galleries().public().fetch()).toJSON()
    }
    else {
      images = (yield keyword.images().public().fetch()).toJSON()
    }

    yield resp.sendView('galleryBrowser/keywordPage', {
      keyword: keyword.toJSON(),
      galleries,
      images,
    })
  }

  * showOwnPage(req, resp) {
    const galleries = yield req.currentUser.galleries()
      .orderBy('name', 'asc')
      .fetch()

    yield resp.sendView('galleryBrowser/ownPage', {
      galleries: galleries.toJSON(),
    })
  }

  * likeImage(req, resp) {
    const image = yield Image.find(req.param('id'))
    if (!image) {
      resp.notFound('A kép nem létezik.')
      return
    }

    yield image.related('gallery').load()

    // TODO access gallery without toJSON
    if (!image.public && !h.checkOwn(image.toJSON().gallery, req)) {
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