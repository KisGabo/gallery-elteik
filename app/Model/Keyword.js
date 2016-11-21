'use strict'

const Lucid = use('Lucid')

class Keyword extends Lucid {

  /**
   * Insert new keywords into db, then return id of every keyword.
   * @param names Array of keyword names
   * @return Array of ids
   */
  static * getIds(names) {
    if (names.length == 0) return []

    const ids = []
    const oldNames = []
    const newKeywords = []

    ;(yield Keyword.query().whereIn('name', names).fetch())
      .forEach(kw => {
        ids.push(kw.id)
        oldNames.push(kw.name)
      })

    names.forEach(name => {
      if (oldNames.indexOf(name) == -1) {
        newKeywords.push({ name: name })
      }
    })
    
    if (newKeywords.length > 0) {
      ;(yield Keyword.createMany(newKeywords))
        .forEach(kw => ids.push(kw.id))
    }

    return ids
  }

  static get createTimestamp () {
    return null
  }

  static get updateTimestamp () {
    return null
  }

  images() {
    return this.belongsToMany('App/Model/Image', 'p_image_keywords')
  }

  galleries() {
    return this.belongsToMany('App/Model/Gallery', 'p_gallery_keywords')
  }

}

module.exports = Keyword