'use strict'

const Lucid = use('Lucid')

class Image extends Lucid {

  user() {
    // TODO no hasOneThrough relationship in Lucid
    throw 'Not implemented: please query user through gallery';
  }

  gallery() {
    return this.belongsTo('App/Model/Gallery')
  }

  likes() {
    return this.hasMany('App/Model/Like')
  }

  keywords() {
    return this.belongsToMany('App/Model/Keyword', 'p_image_keyword')
  }

}

module.exports = Image