'use strict'

const fs = require('co-fs')
const fsx = require('co-fs-extra')
const jimp = require('jimp')
const image_size = require('image-size')
const extract = require('extract-zip')
var Config
var AdonisHelpers

class ImagePersistenceService {

  static inject(config, adonisHelpers) {
    Config = config
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

  static * createUserFolder(user) {
    yield fs.mkdir(AdonisHelpers.storagePath(`gallery/${user.id}`))
  }

  static * createGalleryFolder(gallery) {
    yield fs.mkdir(this.getGalleryFolder(gallery))
  }

  static * validateImages(gallery, files) {
    const result = { valid: [], skipped: [] }
    const galFolder = this.getGalleryFolder(gallery)
    const tmpFolder = galFolder + '/tmp'
    yield fs.mkdir(tmpFolder)

    // iterate over files and move .jpg files to gallery temp folder

    for (let file of files) {
      if (file.ext.toLowerCase() == 'zip') {
        try {
          yield new Promise((resolve, reject) => {
            extract(file.path, { dir: tmpFolder }, err => {
              if (err) reject()
              else resolve()
            })
          })
        }
        catch (e) {
          result.skipped.push(file.name)
        }
      }
      else if (file.ext.toLowerCase() == 'jpg') {
        // it's possible that upload temp dir is on another device,
        // and file.move(..) or fs.rename(..) fails with cross-device link error 
        yield fsx.move(file.path, tmpFolder + '/' + file.name)
      }
      else {
        result.skipped.push(file.name)
      }
    }

    // validate images in temp folder

    const images = yield fs.readdir(tmpFolder)
    for (let img of images) {
      const imgPath = tmpFolder + '/' + img

      // check file size

      const stat = yield fs.stat(imgPath)
      if (stat.size > Config.get('gallery.validation.max_upload_size') * 1000) {
        result.skipped.push(img)
        yield fs.unlink(imgPath)
        continue
      }

      // determine image size

      let size
      try {
        size = yield new Promise((resolve, reject) => {
          image_size(imgPath, (err, size) => {
            if (err) reject()
            else resolve(size)
          })
        })
      }
      catch (e) {
        result.skipped.push(img)
        yield fs.unlink(imgPath)
        continue
      }

      // check image size

      const maxDim = Config.get('gallery.validation.max_original_dimensions')
      if (size.width > maxDim || size.height > maxDim) {
        result.skipped.push(img)
        yield fs.unlink(imgPath)
        continue
      }

      // everything is OK

      result.valid.push({ path: imgPath, dimensions: size })
    }

    return result
  }

  static * saveImage(filePath, image, dimensions) {
    const imgJimp = yield jimp.read(filePath)
    let max
    let mdWidth, mdHeight, thWidth, thHeight
    const params = Config.get('gallery.scale_params')

    // calculate resize parameters

    if (dimensions.width > dimensions.height) {
      max = dimensions.width
      mdWidth = params.medium_dim
      thWidth = params.thumb_dim
      mdHeight = jimp.AUTO
      thHeight = jimp.AUTO
    }
    else {
      max = dimensions.height
      mdWidth = jimp.AUTO
      thWidth = jimp.AUTO
      mdHeight = params.medium_dim
      thHeight = params.thumb_dim
    }

    // save resized images, if needed

    const savedImgPaths = yield this.getImageFiles(image)

    if (max > params.medium_dim) {
      yield new Promise((resolve, reject) => {
        imgJimp
          .clone()
          .resize(mdWidth, mdHeight)
          .quality(params.quality)
          .write(savedImgPaths.medium)
        resolve()
      })
    }

    if (max > params.thumb_dim) {
      yield new Promise((resolve, reject) => {
        imgJimp
          .resize(thWidth, thHeight)
          .quality(params.quality)
          .write(savedImgPaths.thumb)
        resolve()
      })
    }

    // move original image to gallery folder

    yield fs.rename(filePath, savedImgPaths.original)
  }

  static * deleteTempFolder(gallery) {
    yield fs.rmdir(this.getGalleryFolder(gallery) + '/tmp')
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