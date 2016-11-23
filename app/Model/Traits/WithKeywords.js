'use strict'

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

module.exports.register = function(model) {
  // add database hook by calling .addHook on model CLASS
  model.addHook('beforeDelete', 'delete-keywords', hookBeforeDelete)
  // add method to model INSTANCE
  model.prototype.syncKeywords = syncKeywords
}

module.exports.inject = function(db, keyword) {
  Db = db
  Keyword = keyword
}

function * hookBeforeDelete(next) {
  const relation = this.keywords()
  yield Db.table(relation.pivotTable)
    .where(relation.pivotLocalKey, this.id)
    .delete()
  yield next
}

function * syncKeywords(names) {
  const relation = this.keywords()

  // handle empty array because it causes an error in .sync()
  if (names.length == 0) {
    yield Db.table(relation.pivotTable)
      .where(relation.pivotLocalKey, this.id)
      .delete()
  }

  else {
    const Keyword = use('App/Model/Keyword')
    const ids = yield Keyword.getIds(names)
    yield relation.sync(ids)
  }
}