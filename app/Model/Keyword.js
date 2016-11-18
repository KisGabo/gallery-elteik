'use strict'

const Lucid = use('Lucid')

class Keyword extends Lucid {

  images() {
    return this.belongsToMany('App/Model/Image', 'p_image_keywords')
  }

  galleries() {
    return this.belongsToMany('App/Model/Gallery', 'p_gallery_keywords')
  }

}

module.exports = Keyword