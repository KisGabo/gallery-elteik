'use strict'

const Schema = use('Schema')

class ImagesTableSchema extends Schema {

  up () {
    this.create('images', (table) => {
      table.increments()
      table.integer('gallery_id').unsigned().notNullable()
        .references('id').inTable('galleries')
      table.string('title', 100)
      table.text('about')
      table.timestamp('date_taken')
      table.boolean('public').notNullable().defaultTo(false)
      table.boolean('force_private').notNullable().defaultTo(false)
      table.integer('views').unsigned().notNullable()
      table.integer('likes').unsigned().notNullable() // gyorsítás
      table.timestamps()
    })
  }

  down () {
    this.drop('images')
  }

}

module.exports = ImagesTableSchema
