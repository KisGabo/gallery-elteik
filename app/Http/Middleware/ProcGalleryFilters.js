'use strict'

const View = use('Adonis/Src/View')
const Keyword = use('App/Model/Keyword')
const Gallery = use('App/Model/Image')
const moment = require('moment')
const h = require('../../helpers.js')

class ProcGalleryFilters {

  * handle (req, resp, next) {
    let keywords = req.input('filter_keywords')
    keywords = (keywords ? h.splitByComma(keywords) : null)
    let name = req.input('filter_name')
    let order = req.input('orderby', 'updated_ad-desc')
    order = order.split('-')
    if (order[1] != 'asc' && order[1] != 'desc') {
      order = null
    }
    else {
      order = { col: order[0], dir: order[1] }
    }

    req.galleryFilters = { keywords, name, order }

    View.global('gallery_filter_fd', {
      filter_keywords: keywords || [],
      filter_name: name,
      orderby: req.input('orderby'),
    })

    yield next
  }

}

module.exports = ProcGalleryFilters