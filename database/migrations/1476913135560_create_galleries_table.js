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
      table.timestamp('date_from')
      table.timestamp('date_to')
      table.boolean('public').notNullable().defaultTo(false)
      table.timestamps()
    })
  }

  down () {
    this.drop('galleries')
  }

}

module.exports = GalleriesTableSchema
