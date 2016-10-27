'use strict'

const Schema = use('Schema')

class PImageKeywordTableSchema extends Schema {

  up () {
    this.create('p_image_keyword', (table) => {
      table.integer('image_id').unsigned().notNullable()
        .references('id').inTable('images')
      table.integer('keyword_id').unsigned().notNullable()
        .references('id').inTable('keywords')

      table.primary([ 'image_id', 'keyword_id' ])
    })
  }

  down () {
    this.drop('p_image_keyword')
  }

}

module.exports = PImageKeywordTableSchema
