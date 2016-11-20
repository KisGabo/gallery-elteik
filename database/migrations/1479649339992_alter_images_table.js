'use strict'

const Schema = use('Schema')

class AlterGalleriesTableSchema extends Schema {

  up () {
    this.table('images', (table) => {
      table.renameColumn('likes', 'like_count')
      table.renameColumn('views', 'view_count')
    })
  }

  down () {
    this.table('images', (table) => {
      table.renameColumn('like_count', 'likes')
      table.renameColumn('view_count', 'views')
    })
  }

}

module.exports = AlterGalleriesTableSchema
