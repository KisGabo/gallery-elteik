'use strict'

const Lucid = use('Lucid')

class Gallery extends Lucid {

  user () {
    return this.belongsTo('App/Model/User')
  }

}

module.exports = Gallery
