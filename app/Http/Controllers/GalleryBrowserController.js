'use strict'

const fs = require('co-fs')
const AdonisHelpers = use('Helpers')
const ImgPersist = use('Gallery/ImagePersistence')
const Gallery = use('App/Model/Gallery')
const Image = use('App/Model/Image')
const Keyword = use('App/Model/Keyword')

class GalleryBrowserController {

  /**
   * Sends JPG file to client.
   */
  * sendImage(req, resp) {
    const img = yield Image.find(req.param('id'))
    if (!img) {
      resp.notFound('A kép nem létezik.')
      return
    }

    const gal = yield img.gallery().fetch()

    if (!img.public && !req.checkOwn(gal, req)) {
      resp.unauthorized('Ez a kép privát.')
      return
    }

    let which = ''
    if (req.match('/image/:id/thumb')) which = 'thumb'
    else if (req.match('/image/:id/medium')) which = 'medium'
    
    let path = yield ImgPersist.getImageFileToServe(img, which)
    resp.download(path)
  }

  * showMainPage(req, resp) {
    const galleries = yield Gallery.query().public()
      .orderBy('id', 'desc')
      .limit(5)
      .with('user')
      .fetch()

    const images = yield Image.query().public()
      .orderBy('id', 'desc')
      .limit(5)
      .with('gallery', 'gallery.user')
      .fetch()

    const top = yield Image.query().public()
      .orderBy('like_count', 'desc')
      .limit(5)
      .with('gallery', 'gallery.user')
      .fetch()

    yield resp.sendView('galleryBrowser/mainPage', {
      galleries: galleries.toJSON(),
      images: images.toJSON(),
      topimages: top.toJSON(),
    })
  }

  * showGalleryListPage(req, resp) {
    const galleries = yield Gallery.query().filtered(req.galleryFilters).public()
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

    const isOwn = req.checkOwn(gallery, req)
    if (!gallery.public && !isOwn) {
      resp.unauthorized('Ez a galéria privát.')
      return
    }

    yield gallery.related('user').load()
    let imagesQuery = gallery.images().filtered(req.imageFilters)
    // if gallery belongs to current user, show private images too
    if (!isOwn) imagesQuery.public()
    const images = yield imagesQuery.fetch()
    const keywords = yield gallery.keywords().fetch()

    yield resp.sendView('galleryBrowser/galleryPage', {
      gallery: gallery.toJSON(),
      images: images.toJSON(),
      keywords: keywords.toJSON(),
      own: isOwn,
    })
  }

  * showImagePage(req, resp) {
    const image = yield Image.find(req.param('id'))
    if (!image) {
      resp.notFound('A kép nem létezik.')
      return
    }

    yield image.related('gallery').load()

    if (!image.public && !req.checkOwn(image.relations['gallery'], req)) {
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
      likeStatus,
      nextImageId: yield image.getNextIdInGallery()
    })
  }

  * showImageListPage(req, resp) {
    const images = yield Image.query()
      .filtered(req.imageFilters)
      .public()
      .with('gallery', 'gallery.user')
      .fetch()
    yield resp.sendView('galleryBrowser/imageListPage', {
      images: images.toJSON()
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
      galleries = (yield keyword.galleries().filtered(req.galleryFilters).public().fetch()).toJSON()
    }
    else {
      images = (yield keyword.images().filtered(req.imageFilters).public().fetch()).toJSON()
    }

    yield resp.sendView('galleryBrowser/keywordPage', {
      keyword: keyword.toJSON(),
      galleries,
      images,
    })
  }

  * showOwnPage(req, resp) {
    const galleries = yield req.currentUser.galleries()
      .filtered(req.galleryFilters)
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

    if (!image.public && !req.checkOwn(image.relations['gallery'], req)) {
      resp.unauthorized('Ez a kép privát.')
      return
    }

    const liked = yield image.likes().where('id', req.currentUser.id).first()
    if (!liked) {
      yield image.likes().attach([ req.currentUser.id ])
      image.like_count++
      yield image.save()
    }

    !req.ajax() ? resp.redirect('back') : resp.send('ok')
  }

}

module.exports = GalleryBrowserController