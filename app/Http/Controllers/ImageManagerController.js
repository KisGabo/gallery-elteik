'use strict'

const Validator = use('Validator')
const Config = use('Config')
const fs = require('co-fs')
const fsx = require('co-fs-extra')
const jimp = require('jimp')
const image_size = require('image-size')
const extract = require('extract-zip')
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
      max_dim: Config.get('gallery.validation.max_original_dimensions'),
      max_size: Config.get('gallery.validation.max_upload_size'),
    })
  }

  * showFormPage(req, resp) {
    let image = yield Image.find(req.param('id'))
    if (!image) {
      resp.notFound('A kép nem található.')
      return
    }

    yield image.related('gallery').load()

    // TODO gallery access without toJSON
    if (!h.checkOwn(image.toJSON().gallery, req)) {
      resp.unauthorized('Ez a kép nem a tiéd.')
      return
    }

    let keywordNames
    if (req.old('image')) {
      image = req.old('image')
      keywordNames = req.old('keywordNames')
    }
    else {
      const keywords = yield image.keywords().fetch()
      keywordNames = keywords.map(kw => kw.name)
      image = image.toJSON()
    }

    yield resp.sendView('forms/image', {
      image,
      keywordNames,
    })
  }

  * handleUpload(req, resp) {
    const gallery = yield Gallery.find(req.param('id'))
    if (!gallery) {
      resp.notFound('A galéria nem található.')
      return
    }

    if (!h.checkOwn(gallery, req)) {
      resp.unauthorized('Ez a galéria nem a tiéd.')
      return
    }

    // move or extract images to temp folder

    let files = req.file('files[]')
    // files won't be an array if only one file comes
    if (typeof files[Symbol.iterator] !== 'function') {
      files = [ files ]
    }
    const skipped = []
    const galleryFolder = gallery.getFolder()
    const tmpDir = galleryFolder + '/tmp'
    yield fs.mkdir(tmpDir)

    // iterate over uploaded files

    for (let file of files) {
      if (file.file.size == 0) continue
      if (file.extension() == 'zip') {
        const zipPath = file.tmpPath()
        try {
          yield new Promise((resolve, reject) => {
            extract(zipPath, { dir: tmpDir }, err => {
              if (err) reject()
              else resolve()
            })
          })
        }
        catch (e) {
          skipped.push(file.clientName())
        }
      }
      else if (file.extension() == 'jpg') {
        // it's possible that upload temp dir is on another device,
        // and file.move(..) or fs.rename(..) fails with cross-device link error 
        yield fsx.move(file.tmpPath(), tmpDir + '/' + file.clientName())
      }
      else {
        skipped.push(file.clientName())
      }
    }

    // process images in temp folder

    const images = yield fs.readdir(tmpDir)
    let firstId = 0
    for (let img of images) {
      const imgPath = tmpDir + '/' + img

      // check file size

      const stat = yield fs.stat(imgPath)
      if (stat.size > Config.get('gallery.validation.max_upload_size') * 1000) {
        skipped.push(img)
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
        skipped.push(img)
        yield fs.unlink(imgPath)
        continue
      }

      // check image size

      const maxDim = Config.get('gallery.validation.max_original_dimensions')
      if (size.width > maxDim || size.height > maxDim) {
        skipped.push(img)
        yield fs.unlink(imgPath)
        continue
      }

      // create model instance

      const imgModel = new Image()
      imgModel.public = gallery.public
      imgModel.gallery().associate(gallery)
      yield imgModel.save()
      if (firstId == 0) firstId = imgModel.id

      // create scaled images, if needed

      const imgJimp = yield jimp.read(imgPath)
      let max
      let mdWidth, mdHeight, thWidth, thHeight
      const params = Config.get('gallery.scale_params')

      if (size.width > size.height) {
        max = size.width
        mdWidth = params.medium_dim
        thWidth = params.thumb_dim
        mdHeight = jimp.AUTO
        thHeight = jimp.AUTO
      }
      else {
        max = size.height
        mdWidth = jimp.AUTO
        thWidth = jimp.AUTO
        mdHeight = params.medium_dim
        thHeight = params.thumb_dim
      }

      if (max > params.medium_dim) {
        yield new Promise((resolve, reject) => {
          imgJimp
            .clone()
            .resize(mdWidth, mdHeight)
            .quality(params.quality)
            .write(galleryFolder + '/' + imgModel.getFile('medium'))
          resolve()
        })
      }

      if (max > params.thumb_dim) {
        yield new Promise((resolve, reject) => {
          imgJimp
            .resize(thWidth, thHeight)
            .quality(params.quality)
            .write(galleryFolder + '/' + imgModel.getFile('thumb'))
          resolve()
        })
      }

      // move original image to gallery folder

      yield fs.rename(imgPath, galleryFolder + '/' + imgModel.getFile('original'))
    } // end for: process images

    // remove temp dir

    yield fs.rmdir(tmpDir)

    // > END OF FILE PROCESSING <

    // redirect with message

    if (firstId == 0) {
      // no files could be uploaded :(
      yield req.with({ messages: [
        { type: 'danger', message: 'A feltöltés sikertelen.' }
        ]}).flash()
      resp.redirect('back')
      return
    }
    else if (skipped.length > 0) {
      yield req.with({ messages: [
        { type: 'warning', message: 'Néhány kép feltöltése sikeres, de a következőket nem sikerült feltölteni: ' + skipped.join(', ') }
        ]}).flash()
    }
    else {
      yield req.with({ messages: [
        { type: 'success', message: 'A feltöltés sikeres.' }
        ]}).flash()
    }

    resp.route('image_edit', { id: firstId })
  }

}

module.exports = ImageManagerController