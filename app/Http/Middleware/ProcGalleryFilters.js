'use strict'

/**
 * This processes gallery listing filters coming in query string:
 *   - filter_name
 *   - filter_keywords: separated by commas
 *   - orderby: attribute and direction (asc or desc) separated by dash
 * 
 * Processed filter data goes into request.galleryFilters.
 * It can be used with gallery's filtered() scope. (see description)
 * 
 * Passes the filter form data back to view as 'gallery_filter_fd':
 * {
 *   filter_name: <name filter>,
 *   filter_keywords: [ ... ],
 *   orderby: <option value as string>
 * }
 */

const moment = require('moment')
const h = require('../../helpers.js')
const View = use('Adonis/Src/View')
const Keyword = use('App/Model/Keyword')
const Gallery = use('App/Model/Image')

class ProcGalleryFilters {

  * handle (req, resp, next) {
    let keywords = req.input('filter_keywords')
    keywords = (keywords ? h.splitByComma(keywords) : null)
    let name = req.input('filter_name')
    let order = req.input('orderby', 'updated_at-desc')
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