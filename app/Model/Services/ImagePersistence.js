'use strict'

/**
 * Handles image file validation, storage and getting.
 */

const fs = require('co-fs')
const fsx = require('co-fs-extra')
const jimp = require('jimp')
const image_size = require('image-size')
const extract = require('extract-zip')
var Config
var AdonisHelpers

class ImagePersistenceService {

  /**
   * Must be called before using.
   * 
   * @param {Config} config Builtin Config service
   * @param {Helpers} adonisHelpers Builtin Helpers service
   */
  static inject(config, adonisHelpers) {
    Config = config
    AdonisHelpers = adonisHelpers
  }

  /**
   * Gets the absolute path of the folder of given gallery.
   * 
   * @param {Gallery} gallery 
   * @return {string}
   */
  static getGalleryFolder(gallery) {
    return AdonisHelpers.storagePath(`gallery/${gallery.user_id}/${gallery.id}`)
  }

  /**
   * Gets the absolute paths to all three versions of given image.
   * 
   * @param {Image} image
   * @return {object} An object with 'original', 'medium' and 'thumb' props
   */
  static * getImageFiles(image) {
    yield image.relatedNotLoaded('gallery').load()
    const galFolder = this.getGalleryFolder(image.relations['gallery'])

    return {
      original: `${galFolder}/${image.id}.jpg`,
      medium: `${galFolder}/md${image.id}.jpg`,
      thumb: `${galFolder}/th${image.id}.jpg`,
    }
  }

  /**
   * Gets the absolute path to demanded version of given image.
   * If this version doesn't exist because the original
   * image is smaller, it returns the path to the original.
   * 
   * @param {Image} image
   * @param {string} which original | medium | thumb
   * @return {string}
   */
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

  /**
   * Creates the storage directory for a new user.
   * 
   * @param {User} user Must be already saved into db
   */
  static * createUserFolder(user) {
    yield fs.mkdir(AdonisHelpers.storagePath(`gallery/${user.id}`))
  }

  /**
   * Creates the storage directory for a new gallery.
   * 
   * @param {Gallery} gallery Must be already saved into db
   */
  static * createGalleryFolder(gallery) {
    yield fs.mkdir(this.getGalleryFolder(gallery))
  }

  /**
   * Validates files as images and returns info about them.
   * Accepts jpg files and zip of jpg files.
   * 
   * Saves every valid image to a temporary folder in gallery,
   * and deletes invalid ones from their current locaion.
   * 
   * @param {Gallery} gallery The gallery the images will belong to
   * @param {array} files
   *   Array of objects: {
   *     name: <original file name>,
   *     ext: <original file extension>,
   *     path: <current path of file>
   *   }
   * @return {object}
   *   Info about files: {
   *     skipped: [ <filename>, ... ],
   *     valid: [ {
   *       path: <temporary path to image>
   *       dimensions: { width, height }
   *     }, ... ]
   *   }
   */
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
        yield fs.unlink(file.path)
      }
      else if (file.ext.toLowerCase() == 'jpg') {
        // it's possible that upload temp dir is on another device,
        // and file.move(..) or fs.rename(..) fails with cross-device link error 
        yield fsx.move(file.path, tmpFolder + '/' + file.name)
      }
      else {
        yield fs.unlink(file.path)
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

  /**
   * Saves an image file to its permanent location,
   * and creates medium-sized and thumbnail images, if necessary.
   * 
   * @param {string} filePath Path to a valid image file
   * @param {Image} image Image model which the file belongs to
   * @param {object} dimension Size of image: { width, height }
   */
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

  /**
   * Deletes the (empty) temporary folder of given gallery.
   * Should be called after upload process is complete.
   * 
   * @param {Gallery} gallery
   */
  static * deleteTempFolder(gallery) {
    yield fs.rmdir(this.getGalleryFolder(gallery) + '/tmp')
  }

  /**
   * Deletes the whole folder of given gallery.
   * 
   * @param {Gallery} gallery
   */
  static * deleteGallery(gallery) {
    // TODO yield only after for
    const galFolder = this.getGalleryFolder(gallery)
    const files = yield fs.readdir(galFolder)
    for (let file of files) {
      yield fs.unlink(galFolder + '/' + file)
    }
    yield fs.rmdir(galFolder)
  }

  /**
   * Deletes all three versions of given image.
   * 
   * @param {Image} image
   */
  static * deleteImageFiles(image) {
    const files = yield this.getImageFiles(image)
    try { yield fs.unlink(files.original) } catch(e) {}
    try { yield fs.unlink(files.medium) } catch(e) {}
    try { yield fs.unlink(files.thumb) } catch(e) {}
  }

}

module.exports = ImagePersistenceService