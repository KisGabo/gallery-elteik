'use strict'

const Validator = use('Validator')
const Config = use('Config')
const ImgPersist = use('Gallery/ImagePersistence')
const Gallery = use('App/Model/Gallery')
const Image = use('App/Model/Image')
const Keyword = use('App/Model/Keyword')
const exif = require('fast-exif')
const moment = require('moment')
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

    if (!h.checkOwn(image.relations['gallery'], req)) {
      resp.unauthorized('Ez a kép nem a tiéd.')
      return
    }

    let keywordNames
    if (req.old('image')) {
      image = image.toJSON()
      h.copyInto(req.old('image'), image)
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

  * save(req, resp) {
    const data = req.except('_csrf');

    // process keywords

    const keywordNames = h.splitByComma(data.keywords)

    // validate

    const validation = yield Validator.validateAll(data, Image.validationRules, _validationMessages);
    
    if (validation.fails()) {
      const messages = validation.messages()
      h.cleanValidationMessages(messages)

      yield req.with({ image: data, keywordNames, messages }).flash()
      resp.redirect('back')
      return
    }

    // get model instance

    const image = yield Image.find(req.param('id'))
    if (!image) {
      resp.notFound('A kép nem található.')
      return
    }

    const gallery = yield image.gallery().fetch()
    if (!h.checkOwn(gallery, req)) {
      resp.unauthorized('Ez a kép nem a tiéd.')
      return
    }

    // check force_private

    if (image.force_private && !!data.public) {
      resp.redirect('back')
      return
    }

    // save

    image.title = data.title
    image.about = data.about
    image.date_taken = h.toTs(data.date_taken)
    image.public = !!data.public

    yield image.save();
    yield image.syncKeywords(keywordNames)

    // redirect with success message

    yield req.with({ messages: [
      { type: 'success', message: 'A képet sikeresen módosítottad.' }
    ]}).flash()
    
    if (data.next) {
      const nextId = yield image.getNextIdInGallery()
      if(nextId) {
        resp.route('image_edit', { id: nextId })
      }
      // this is the last image, redirect to gallery
      else {
        resp.route('gallery', { id: image.gallery_id })
      }
      return
    }
    else {
      resp.redirect('back')
    }

  }

  * delete(req, resp) {
    let image = yield Image.find(req.param('id'))
    if (!image) {
      resp.notFound('A kép nem található.')
      return
    }

    yield image.related('gallery').load()

    if (!h.checkOwn(image.relations['gallery'], req)) {
      resp.unauthorized('Ez a kép nem a tiéd.')
      return
    }

    yield image.delete()
    resp.redirect('back')
  }

  * forcePrivate(req, resp) {
    const image = yield Image.find(req.param('id'))
    if (!image) {
      resp.notFound('A kép nem található.')
      return
    }

    image.force_private = true
    yield image.save()
    resp.redirect('back')
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

    let files = req.file('files[]')
    // files won't be an array if only one file comes
    if (typeof files[Symbol.iterator] !== 'function') {
      files = [ files ]
    }

    // collect file info

    const fileInfos = files
      .filter(file => file.file.size > 0)
      .map(file => {
        return {
          path: file.tmpPath(),
          ext: file.extension(),
          name: file.clientName(),
        }
      });

    // validate files

    const validationResult = yield ImgPersist.validateImages(gallery, fileInfos)

    // save valid images

    let firstId = 0
    for (let img of validationResult.valid) {
      const imgModel = new Image()

      try {
        const exifData = yield exif.read(img.path)
        const dateTaken = moment(exifData.exif.DateTimeOriginal).unix()
        imgModel.date_taken = dateTaken
      } catch (e) {}
      

      imgModel.gallery().associate(gallery)
      yield imgModel.save()
      yield ImgPersist.saveImage(img.path, imgModel, img.dimensions)
      if (firstId == 0) firstId = imgModel.id
    }

    // remove temp dir

    yield ImgPersist.deleteTempFolder(gallery)

    // redirect with message

    if (firstId == 0) {
      // no files could be uploaded :(
      yield req.with({ messages: [
        { type: 'danger', message: 'A feltöltés sikertelen.' }
        ]}).flash()
      resp.redirect('back')
      return
    }
    else if (validationResult.skipped.length > 0) {
      yield req.with({ messages: [
        { type: 'warning', message: 'Néhány kép feltöltése sikeres, de a következőket nem sikerült feltölteni: ' + validationResult.skipped.join(', ') }
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

const _mapFieldToLabel = {
  title:            'kép címe',
  date_taken:       'készítés ideje',
  about:            'kép leírása',
}

const _validationMessages = {
  'max': (field, val, args) => `A(z) ${_mapFieldToLabel[field]} maximum ${args[0]} hosszú lehet.`,
  'datetime': (field) =>       `A(z) ${_mapFieldToLabel[field]} formátuma rossz.`,
  'keywords.max': (field, val, args) => `A kulcsszavak összhosszúsága maximum ${args[0]} lehet.`,
}

module.exports = ImageManagerController