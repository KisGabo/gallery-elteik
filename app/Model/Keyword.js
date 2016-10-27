'use strict'

const Lucid = use('Lucid')

class Keyword extends Lucid {

  images() {
    return this.belongsToMany('App/Model/Image', 'p_image_keyword')
  }

  galleries() {
    return this.belongsToMany('App/Model/Gallery', 'p_gallery_keyword')
  }

}

module.exports = Keyword