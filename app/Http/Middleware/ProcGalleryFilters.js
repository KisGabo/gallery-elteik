'use strict'

const View = use('Adonis/Src/View')
const Keyword = use('App/Model/Keyword')
const Gallery = use('App/Model/Image')
const moment = require('moment')

class ProcGalleryFilters {

  * handle (req, resp, next) {
    let keywords = req.input('filter_keywords')
    keywords = (keywords ? keywords.split(',').map(name => name.trim()) : null)
    let name = req.input('filter_name')
    let order = req.input('orderby')
    if (order) {
      order = order.split('-')
      if (order[1] != 'asc' && order[1] != 'desc') {
        order = null
      }
      else {
        order = { col: order[0], dir: order[1] }
      }
    }
    else {
      order = null
    }

    req.galleryFilters = { keywords, name, order }

    View.global('gallery_filter_fd', {
      filter_keywords: keywords,
      filter_name: name,
      orderby: req.input('orderby'),
    })

    yield next
  }

}

module.exports = ProcGalleryFilters