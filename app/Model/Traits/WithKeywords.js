'use strict'

/**
 * This trait should be used in models which
 * hold keywords for items.
 */

/**
 * Note to self:
 * It's a trait.
 * It'll be provided by a provider as any other service.
 * 
 * Since it's a trait, it must be an object with a 'register' method.
 * This method has to extend the prototype of given class (argument)
 * 
 * A regular service would likely be a Class, but in this case
 * it's enough to export an object literal (thus my provider doesn't 'new' it)
 */

var Db
var Keyword

/**
 * Extends the given model.
 * This gets called by Adonis when adding the trait.
 * 
 * @param {Model} model
 */
module.exports.register = function(model) {
  // add database hook by calling .addHook on model CLASS
  model.addHook('beforeDelete', 'delete-keywords', hookBeforeDelete)
  // add method to model CLASS (static)
  model._filterByKeywords = _filterByKeywords
  // add method to model INSTANCE
  model.prototype.syncKeywords = syncKeywords
}

/**
 * Must be called before using.
 * This gets called by the provider.
 * 
 * @param {Database} db Builtin Database service
 * @param {Keyword} keyword Keyword CLASS from app
 */
module.exports.inject = function(db, keyword) {
  Db = db
  Keyword = keyword
}

/**
 * Deletes records from pivot table before deleting actual item.
 * This gets called by Adonis via hooks.
 * 
 * @param {any} next
 */
function * hookBeforeDelete(next) {
  const relation = this.keywords()
  yield Db.table(relation.pivotTable)
    .where(relation.pivotLocalKey, this.id)
    .delete()
  yield next
}

/**
 * Creates new keywords, then synchronizes pivot table.
 * 
 * @param {array} names Array of keyword names
 */
function * syncKeywords(names) {
  const relation = this.keywords()

  // handle empty array because it causes an error in .sync()
  if (names.length == 0) {
    yield Db
      .table(relation.pivotTable)
      .where(relation.pivotLocalKey, this.id)
      .delete()
  }

  else {
    const Keyword = use('App/Model/Keyword')
    const ids = yield Keyword.getIds(names)
    yield relation.sync(ids)
  }
}

/**
 * Returns a function, which can be supplied to
 * query builder's .where(..) method to filter the result
 * by keywords.
 * 
 * This is a private static helper method.
 * It should be used in model scope functions.
 * Since scope functions in Adonis are static,
 * this must be also static, which means we can't
 * access relation info (nor pivot table name and column name).
 * 
 * @param {array} names Array of keyword names
 * @param {string} pivotTable Pivot table name
 * @param {string} pivotLocalKey Name of column referencing item ID in pivot table
 * @return {function}
 * 
 * @private
 */
function _filterByKeywords(names, pivotTable, pivotLocalKey) {
  const queryKwIds = Db
    .table('keywords')
    .whereIn('name', names)
    .select('id')

  const queryItemIds = Db
    .table(pivotTable)
    .whereIn('keyword_id', queryKwIds)
    .distinct(pivotLocalKey)

  return function () {
    this.whereIn('id', queryItemIds)
  }
}