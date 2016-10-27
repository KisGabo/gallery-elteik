'use strict'

const Schema = use('Schema')

class LikesTableSchema extends Schema {

  up () {
    this.create('likes', (table) => {
      table.integer('user_id').unsigned().notNullable()
        .references('id').inTable('users')
      table.integer('image_id').unsigned().notNullable()
        .references('id').inTable('images')
      
      table.primary([ 'user_id', 'image_id' ])
    })
  }

  down () {
    this.drop('likes')
  }

}

module.exports = LikesTableSchema
