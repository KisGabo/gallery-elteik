'use strict'

/**
 * This processes image listing filters coming in query string:
 *   - filter_keywords: separated by commas
 *   - filter_date_taken: YYYY.MM.DD.
 *   - filter_date_taken_mode: exact | older | newer
 *   - orderby: attribute and direction (asc or desc) separated by dash
 * 
 * Processed filter data goes into request.imageFilters.
 * It can be used with image's filtered() scope. (see description)
 * 
 * Passes the filter form data back to view as 'gallery_filter_fd':
 * {
 *   filter_keywords: [ ... ],
 *   filter_date_taken: <timestamp>,
 *   filter_date_taken_mode: 'exact | older | newer',
 *   orderby: <option value as string>
 * }
 */

const moment = require('moment')
const h = require('../../helpers.js')
const View = use('Adonis/Src/View')
const Keyword = use('App/Model/Keyword')
const Image = use('App/Model/Image')

class ProcImageFilters {

  * handle (req, resp, next) {
    let keywords = req.input('filter_keywords')
    keywords = (keywords ? h.splitByComma(keywords) : null)
    let dateMode = req.input('filter_date_taken_mode')
    let date = moment(req.input('filter_date_taken'), 'YYYY.MM.DD.').unix()
    let order = req.input('orderby', 'id-desc')
    order = order.split('-')
    if (order[1] != 'asc' && order[1] != 'desc') {
      order = null
    }
    else {
      order = { col: order[0], dir: order[1] }
    }

    req.imageFilters = { keywords, dateMode, date, order }

    View.global('image_filter_fd', {
      filter_keywords: keywords || [],
      filter_date_taken_mode: dateMode,
      filter_date_taken: date,
      orderby: req.input('orderby'),
    })

    yield next
  }

}

module.exports = ProcImageFilters