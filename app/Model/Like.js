'use strict'

const Lucid = use('Lucid')

class Like extends Lucid {

  user() {
    return this.belongsTo('App/Model/User')
  }

  image() {
    return this.belongsTo('App/Model/Image')
  }

}

module.exports = Like