'use strict'

const Lucid = use('Lucid')

class Keyword extends Lucid {

  /**
   * Inserts new keywords which aren't in db,
   * then returns the ID of every keyword given in array.
   * 
   * @param {array} names Array of keyword names
   * @return {array} Array of ids
   * 
   * @static
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

  /**
   * Tells Adonis that this model doesn't store
   * its time of creation.
   * 
   * @return {null}
   * 
   * @static
   */
  static get createTimestamp () {
    return null
  }

  /**
   * Tells Adonis that this model doesn't store
   * its time of update.
   * 
   * @return {null}
   * 
   * @static
   */
  static get updateTimestamp () {
    return null
  }

  /**
   * Relation of images which have this keyword.
   * 
   * @return {Relation}
   */
  images() {
    return this.belongsToMany('App/Model/Image', 'p_image_keywords')
  }

  /**
   * Relation of galleries which have this keyword.
   * 
   * @return {Relation}
   */
  galleries() {
    return this.belongsToMany('App/Model/Gallery', 'p_gallery_keywords')
  }

}

module.exports = Keyword