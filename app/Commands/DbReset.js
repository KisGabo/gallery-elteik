'use strict'

/**
 * This ace command drops every table in the database.
 * 
 * This is handy when willing to do a full database reset
 * and there are many migrations, because it skips
 * the migration rollbacks.
 * 
 * Another use-case is when existing migrations change
 * (which shouldn't happen), and that way rollbacks
 * wouldn't work.
 */

const Config = use('Config')
const Command = use('Command')
const Database = use('Database')

class DbReset extends Command {

  /**
   * signature defines the requirements and name
   * of command.
   *
   * @return {String}
   */
  get signature () {
    return 'db:reset {-f,--force?}'
  }

  /**
   * description is the little helpful information displayed
   * on the console.
   *
   * @return {String}
   */
  get description () {
    return 'Delete all tables'
  }

  /**
   * handle method is invoked automatically by ace, once your
   * command has been executed.
   *
   * @param  {Object} args    [description]
   * @param  {Object} options [description]
   */
  * handle (args, flags) {
    if (process.env.NODE_ENV === 'production' && !flags.force) {
      this.error('Cannot reset db in production. Use --force flag to continue')
    }

    for (let tblName of DbReset._tables) {
      yield Database.schema.dropTableIfExists(tblName)
    }

    // migration metatable
    yield Database.schema.dropTableIfExists(Config.get('database.migrationsTable', 'adonis_schema'))

    Database.close()
    this.success('Tables dropped!')
  }

  static get _tables() {
    return [
      'users',
      'galleries',
      'images',
      'keywords',
      'p_likes',
      'p_gallery_keywords',
      'p_image_keywords',
    ]
  }

}

module.exports = DbReset
