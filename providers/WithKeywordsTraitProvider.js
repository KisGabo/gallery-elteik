'use strict'

const ServiceProvider = require('adonis-fold').ServiceProvider
const trait = require('../app/Model/Traits/WithKeywords.js')

class WithKeywordsTraitProvider extends ServiceProvider {

  * register () {
    this.app.bind('Gallery/Traits/WithKeywords', (app) => {
      trait.inject(
        use('Database'),
        use('App/Model/Keyword')
      )
      return trait
    })
  }

  * boot () {

  }

}

module.exports = WithKeywordsTraitProvider