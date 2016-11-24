'use strict'

const Schema = use('Schema')

class GalleriesTableSchema extends Schema {

  up () {
    this.create('galleries', (table) => {
      table.increments()
      table.integer('uid').unsigned().notNullable()
        .references('id').inTable('users')
      table.string('name', 254).notNullable()
      table.text('about')
      table.integer('date_from').unsigned()
      table.integer('date_to').unsigned()
      table.boolean('public').notNullable().defaultTo(false)
      table.integer('created_at').unsigned().notNullable()
      table.integer('updated_at').unsigned().notNullable()
    })
  }

  down () {
    this.drop('galleries')
  }

}

module.exports = GalleriesTableSchema
