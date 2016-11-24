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
      table.integer('date_taken').unsigned()
      table.boolean('public').notNullable().defaultTo(false)
      table.boolean('force_private').notNullable().defaultTo(false)
      // added defaultTo(0), since no modify-column :(
      table.integer('views').unsigned().notNullable().defaultTo(0)
      table.integer('likes').unsigned().notNullable().defaultTo(0)
      table.integer('created_at').unsigned().notNullable()
      table.integer('updated_at').unsigned().notNullable()
    })
  }

  down () {
    this.drop('images')
  }

}

module.exports = ImagesTableSchema
