'use strict'

const Schema = use('Schema')

// Inkább követem az Adonis doksi konvencióját

class AlterGalleriesTableSchema extends Schema {

  up () {
    this.table('galleries', (table) => {
      table.renameColumn('uid', 'user_id')
    })
  }

  down () {
    this.table('galleries', (table) => {
      table.renameColumn('user_id', 'uid')
    })
  }

}

module.exports = AlterGalleriesTableSchema
