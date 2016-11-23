'use strict'

/*
|--------------------------------------------------------------------------
| Events
|--------------------------------------------------------------------------
|
| Here you register events and define their listeners, which can be inline
| closures or reference to a Listener inside app/Listeners. Also your
| listeners can be async.
|
| Listeners are saved in app/Listeners directory.
|
| @example
| Event.when('login', 'User.login')
|
*/
const Event = use('Event')
const ioc = require('adonis-fold').Ioc

Event.when('Http.error.*', 'Http.handleError')
Event.when('Http.start', 'Http.onStart')

/**
 * A little hack to have a new handy method on ALL Lucid model instances.
 * 
 * .relatedNotLoaded(..) does what the original .related(..) does,
 * but won't add relations that are already loaded, to the eager loading queue.
 */

const _ = require('lodash')

use('Lucid').prototype.relatedNotLoaded = function() {
  const relations = _.isArray(arguments[0]) ? arguments[0] : _.toArray(arguments)

  relations.filter(rel => {
      const splitted = rel.split('.')
      let data = this.relations
      for (rel of splitted) {
      data = data[rel]
      if (!data) return true
      }
      return false
  });

  this.eagerLoad.with(relations)
  return this
}
