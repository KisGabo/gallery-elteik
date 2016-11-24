'use strict'

const Schema = use('Schema')

class UsersTableSchema extends Schema {

  up () {
    this.create('users', table => {
      table.increments()
      table.string('username', 80).notNullable().unique()
      table.string('email', 254).notNullable().unique()
      table.string('password', 60).notNullable()
      table.string('intro')
      table.integer('role').notNullable().defaultTo(0)
      table.integer('created_at').unsigned().notNullable()
      table.integer('updated_at').unsigned().notNullable()
    })
  }

  down () {
    this.drop('users')
  }

}

module.exports = UsersTableSchema
