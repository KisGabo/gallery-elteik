'use strict'

const Schema = use('Schema')

class PGalleryKeywordTableSchema extends Schema {

  up () {
    this.create('p_gallery_keyword', (table) => {
      table.integer('gallery_id').unsigned().notNullable()
        .references('id').inTable('galleries')
      table.integer('keyword_id').unsigned().notNullable()
        .references('id').inTable('keywords')

      table.primary([ 'gallery_id', 'keyword_id' ])
    })
  }

  down () {
    this.drop('p_gallery_keyword')
  }

}

module.exports = PGalleryKeywordTableSchema
