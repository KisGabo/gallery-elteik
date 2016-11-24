'use strict'

/**
 * This file is for small app-level extensions or hacks,
 * which would fit somewhere else only with overkill,
 * or wouldn't fit anywhere at all.
 */

module.exports.boot = function() {

  // timestamp formatter for Nunjucks

  const View = use('Adonis/Src/View')
  const moment = require('moment')
  View.filter('date', (ts, format) => {
    if (!ts) return ''
    if (!format) format = 'YYYY. MM. DD. HH:mm:ss'
    const result = moment.unix(ts)
    return result.isValid() ? result.format(format) : ts
  })

  // datetime validator for Indicative

  const Validator = use('Adonis/Addons/Validator')
  Validator.extend('datetime', (data, field, message, args, get) => {
    return new Promise((resolve, reject) => {
      let val = get(data, field)
      if (!val) resolve('Empty')

      if (moment(val, 'YYYY. MM. DD. HH:mm:ss', true).isValid()) {
        resolve('OK')
      }
      else {
        reject(message)
      }
    })
  }, 'Wrong datetime format')


  /*** DANGER ZONE BELOW: UGLY HACKS */


  /**
   * I can't see why Lucid formats auto timestamps with moment
   * when getting these. What makes it more nonsense is that
   * it does the same when setting.
   * 
   * Maybe I'm missing something, but anyway,
   * this messes up my unix timestamps, because
   * moment thinks that they're in milliseconds.
   * 
   * Moreover this gets called waaay too many times.
   */

  const Lucid = use('Lucid')

  Lucid.prototype.formatDate = function(date) {
    return date
  }

  /**
   * A little hack to have a new handy method on ALL Lucid model instances.
   * 
   * .relatedNotLoaded(..) does what the original .related(..) does,
   * but won't add relations that are already loaded, to the eager loading queue.
   */

  const _ = require('lodash')

  Lucid.prototype.relatedNotLoaded = function() {
    const relations = _.isArray(arguments[0]) ? arguments[0] : _.toArray(arguments)

    relations.filter(rel => {
        const splitted = rel.split('.')
        let data = this.relations
        for (rel of splitted) {
        data = data[rel]
        if (!data) return true
        }
        return false
    });

    this.eagerLoad.with(relations)
    return this
  }
}