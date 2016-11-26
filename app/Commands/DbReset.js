'use strict'

/**

 */

const Config = use('Config')
const Command = use('Command')
const Database = use('Database')
const Schema = new (use('Schema'))
const RunnerCommand = use('Adonis/Commands/Migration:Run')
const SeederCommand = use('Adonis/Commands/DB:Seed')

class DbReset extends Command {

  /**
   * signature defines the requirements and name
   * of command.
   *
   * @return {String}
   */
  get signature () {
    return 'db:reset'
  }

  /**
   * description is the little helpful information displayed
   * on the console.
   *
   * @return {String}
   */
  get description () {
    return 'Reset database to initial state with example data seeded'
  }

  /**
   * handle method is invoked automatically by ace, once your
   * command has been executed.
   *
   * @param  {Object} args    [description]
   * @param  {Object} options [description]
   */
  * handle (args, options) {

    // drop tables

    for (let tblName of DbReset._tables) {
      yield Database.schema.dropTableIfExists(tblName)
    }
    // migration metatable
    yield Database.schema.dropTableIfExists(Config.get('database.migrationsTable', 'adonis_schema'))

    this.info('Tables dropped')

    // run migrations

    yield RunnerCommand.handle(null, { force: true })

    // seed database

    yield SeederCommand.handle(null, { force: true })
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
