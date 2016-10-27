'use strict'

const Schema = use('Schema')

class KeywordsTableSchema extends Schema {

  up () {
    this.create('keywords', (table) => {
      table.increments()
      table.string('name', 80).notNullable()
    })
  }

  down () {
    this.drop('keywords')
  }

}

module.exports = KeywordsTableSchema
