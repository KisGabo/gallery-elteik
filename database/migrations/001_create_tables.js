'use strict'

/**
 * This is the first migration, which creates
 * the tables for the first deployed and working version.
 */

const Schema = use('Schema')

class TableSchemas extends Schema {

  up () {

    // USERS

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

    // GALLERIES

    this.create('galleries', (table) => {
      table.increments()
      table.integer('user_id').unsigned().notNullable()
        .references('id').inTable('users')
      table.string('name', 254).notNullable()
      table.text('about')
      table.integer('date_from').unsigned()
      table.integer('date_to').unsigned()
      table.boolean('public').notNullable().defaultTo(false)
      table.integer('created_at').unsigned().notNullable()
      table.integer('updated_at').unsigned().notNullable()
    })

    // IMAGES

    this.create('images', (table) => {
      table.increments()
      table.integer('gallery_id').unsigned().notNullable()
        .references('id').inTable('galleries')
      table.string('title', 100)
      table.text('about')
      table.integer('date_taken').unsigned()
      table.boolean('public').notNullable().defaultTo(false)
      table.boolean('force_private').notNullable().defaultTo(false)
      table.integer('view_count').unsigned().notNullable().defaultTo(0)
      table.integer('like_count').unsigned().notNullable().defaultTo(0)
      table.integer('created_at').unsigned().notNullable()
      table.integer('updated_at').unsigned().notNullable()
    })

    // LIKES

    this.create('p_likes', (table) => {
      table.integer('user_id').unsigned().notNullable()
        .references('id').inTable('users')
      table.integer('image_id').unsigned().notNullable()
        .references('id').inTable('images')
      
      table.primary([ 'user_id', 'image_id' ])
    })

    // KEYWORDS

    this.create('keywords', (table) => {
      table.increments()
      table.string('name', 80).notNullable()
    })

    // PIVOT: P_IMAGE_KEYWORDS

    this.create('p_image_keywords', (table) => {
      table.integer('image_id').unsigned().notNullable()
        .references('id').inTable('images')
      table.integer('keyword_id').unsigned().notNullable()
        .references('id').inTable('keywords')

      table.primary([ 'image_id', 'keyword_id' ])
    })

    // PIVOT: P_GALLERY_KEYWORDS

    this.create('p_gallery_keywords', (table) => {
      table.integer('gallery_id').unsigned().notNullable()
        .references('id').inTable('galleries')
      table.integer('keyword_id').unsigned().notNullable()
        .references('id').inTable('keywords')

      table.primary([ 'gallery_id', 'keyword_id' ])
    })


  }

  down () {
    this.drop('users')
    this.drop('galleries')
    this.drop('images')
    this.drop('likes')
    this.drop('keywords')
    this.drop('p_image_keywords')
    this.drop('p_gallery_keywords')
  }

}

module.exports = TableSchemas
