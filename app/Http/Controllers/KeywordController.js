'use strict'

const Keyword = use('App/Model/Keyword')
const Gallery = use('App/Model/Gallery')

class KeywordController {

  * ajaxSuggestions(req, resp) {
    const search = req.input('search')
    if (!search) {
      resp.status(400).send('')
      return
    }

    let keywords = yield Keyword.query().where('name', 'LIKE', search + '%')
    if (keywords.length == 0) {
      keywords = yield Keyword.query().where('name', 'LIKE', '%' + search + '%')
    }

    resp.json(keywords)
  }

  * ajaxSuggestionsForGallery(req, resp) {
    const gallery = yield Gallery.find(req.param('id'))
    if (!gallery || !req.checkOwn(gallery, req)) {
      resp.status(400).send('')
      return
    }

    const keywords = yield gallery.getRelatedKeywords()
    resp.json(keywords.toJSON())
  }

}

module.exports = KeywordController