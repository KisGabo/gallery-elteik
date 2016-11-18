'use strict'

const Schema = use('Schema')

class RenamePivotTables extends Schema {

  up () {
    this.renameTable('likes', 'p_likes')
    this.renameTable('p_image_keyword', 'p_image_keywords')
    this.renameTable('p_gallery_keyword', 'p_gallery_keywords')
  }

  down () {
    this.renameTable('p_likes', 'likes')
    this.renameTable('p_image_keywords', 'p_image_keyword')
    this.renameTable('p_gallery_keywords', 'p_gallery_keyword')
  }

}

module.exports = RenamePivotTables
