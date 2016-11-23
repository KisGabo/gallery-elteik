'use strict'

const ServiceProvider = require('adonis-fold').ServiceProvider
const imgPersist = require('../app/Model/Services/ImagePersistence.js')

class ImagePersistenceServiceProvider extends ServiceProvider {

  * register () {
    this.app.bind('Gallery/ImagePersistence', (app) => {
      imgPersist.inject(
        use('Adonis/Src/Config'),
        use('Adonis/Src/Helpers')
      )
      return imgPersist
    })
  }

  * boot () {
    
  }

}

module.exports = ImagePersistenceServiceProvider