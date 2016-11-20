'use strict'

const Lucid = use('Lucid')

class Image extends Lucid {

  static get computed() {
    return [ 'isPrivate' ];
  }

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
    return this.belongsToMany('App/Model/Keyword', 'p_image_keywords')
  }

  getIsPrivate() {
    return !this.public || this.force_private;
  }

}

module.exports = Image