'use strict'

const Validator = use('Validator')
const Gallery = use('App/Model/Gallery')
const Image = use('App/Model/Image')
const Keyword = use('App/Model/Keyword')
const h = require('../../helpers.js')

class GalleryManagerController {

  * save(req, resp) {
    const data = req.except('_csrf');

    // process keywords

    const keywordNames = data.keywords.split(',')
      .map(kw => kw.trim())
      .filter(kw => kw.length > 0)

    // validate

    const validation = yield Validator.validateAll(data, Gallery.validationRules, _validationMessages);
    
    if (validation.fails()) {
      const messages = validation.messages()
      h.cleanValidationMessages(messages)

      yield req.with({ gallery: data, keywordNames, messages }).flash()
      resp.redirect('back')
      return
    }

    // check if exists

    let gallery

    if (req.match('/gallery/add')) {
      gallery = new Gallery()
    }
    else {
      gallery = yield Gallery.find(req.param('id'))
      if (!gallery) {
        resp.notFound('A galéria nem található.')
        return
      }

      if (!h.checkOwn(gallery, req)) {
        resp.unauthorized('Ez a galéria nem a tiéd.')
        return
      }
    }

    // save

    gallery.user_id = req.currentUser.id
    gallery.name = data.name
    gallery.about = data.about
    gallery.date_from = data.date_from
    gallery.date_to = data.date_to
    gallery.public = data.public

    yield gallery.save();
    yield gallery.syncKeywords(keywordNames)

    // redirect with success message

    yield req.with({ messages: [
      { type: 'success', message: 'A galériát sikeresen elmentetted.' }
    ]}).flash()
    
    resp.redirect('back')
  }

  * delete(req, resp) {
    const gallery = yield Gallery.find(req.param('id'))
    if (!gallery) {
      resp.notFound('A galéria nem található.')
      return
    }

    if (!h.checkOwn(gallery, req)) {
      resp.unauthorized('Ez a galéria nem a tiéd.')
      return
    }

    yield gallery.delete()
    resp.redirect('back')
  }

  * showFormPage(req, resp) {
    let gallery = null
    let keywordNames = null

    if (req.match('/gallery/:id/edit')) {
      gallery = yield Gallery.find(req.param('id'))
      if (!gallery) {
        resp.notFound('A galéria nem található.')
        return
      }

      if (!h.checkOwn(gallery, req)) {
        resp.unauthorized('Ez a galéria nem a tiéd.')
        return
      }
    }

    if (req.old('gallery')) {
      gallery = req.old('gallery')
      keywordNames = req.old('keywordNames')
    }
    else if (gallery) {
      const keywords = yield gallery.keywords().fetch()
      keywordNames = keywords.map(kw => kw.name)
      gallery = gallery.toJSON()
    }

    yield resp.sendView('forms/gallery', {
      gallery,
      keywordNames,
    })
  }

}

const _mapFieldToLabel = {
  name:             'galéria neve',
  date_from:        'kezdő dátum',
  date_to:          'befejező dátum',
  about:            'galéria leírása',
}

const _validationMessages = {
  'required': (field) =>       `A(z) ${_mapFieldToLabel[field]} megadása kötelező.`,
  'max': (field, val, args) => `A(z) ${_mapFieldToLabel[field]} maximum ${args[0]} hosszú lehet.`,
  'datetime': (field) =>       `A(z) ${_mapFieldToLabel[field]} formátuma rossz.`,
}

module.exports = GalleryManagerController