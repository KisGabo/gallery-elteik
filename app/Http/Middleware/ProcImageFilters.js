'use strict'

const View = use('Adonis/Src/View')
const Keyword = use('App/Model/Keyword')
const Image = use('App/Model/Image')
const moment = require('moment')
const h = require('../../helpers.js')

class ProcImageFilters {

  * handle (req, resp, next) {
    let keywords = req.input('filter_keywords')
    keywords = (keywords ? h.splitByComma(keywords) : null)
    let dateMode = req.input('filter_date_taken_mode')
    let date = moment(req.input('filter_date_taken'), 'YYYY.MM.DD.').unix()
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