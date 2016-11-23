'use strict'

const fs = require('co-fs')
var AdonisHelpers

// TODO
class ImagePersistenceService {

  static inject(adonisHelpers) {
    AdonisHelpers = adonisHelpers
  }

  static getGalleryFolder(gallery) {
    return AdonisHelpers.storagePath(`gallery/${gallery.user_id}/${gallery.id}`)
  }

  static * getImageFiles(image) {
    yield image.relatedNotLoaded('gallery').load()
    const galFolder = this.getGalleryFolder(image.relations['gallery'])

    return {
      original: `${galFolder}/${image.id}.jpg`,
      medium: `${galFolder}/md${image.id}.jpg`,
      thumb: `${galFolder}/th${image.id}.jpg`,
    }
  }

  static * getImageFileToServe(image, which) {
    if (!which) which = 'original'
    const files = yield this.getImageFiles(image)

    if (which == 'original' || !(yield fs.exists(files[which]))) {
      return files.original
    }
    else {
      return files[which]
    }
  }

  static * deleteGallery(gallery) {
    // TODO yield only after for
    const galFolder = this.getGalleryFolder(gallery)
    const files = yield fs.readdir(galFolder)
    for (let file of files) {
      yield fs.unlink(galFolder + '/' + file)
    }
    yield fs.rmdir(galFolder)
  }

  static * deleteImageFiles(image) {
    const files = yield this.getImageFiles(image)
    try { yield fs.unlink(files.original) } catch(e) {}
    try { yield fs.unlink(files.medium) } catch(e) {}
    try { yield fs.unlink(files.thumb) } catch(e) {}
  }

}

module.exports = ImagePersistenceService