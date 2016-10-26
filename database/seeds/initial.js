'use strict'

const User = use('App/Model/User')
const Gallery = use('App/Model/Gallery')

// Itt szándékosan nem akarom a Factoryt használni

const users = [
  {
    username: 'KisGabo',
    password: 'semmi',
    email: 'mail@mail.com',
    intro: 'Ezt az <b>egészet</b> én csinálom',
    role: 2,
  },
  {
    username: 'Egy mod',
    password: 'semmi',
    email: 'mail@mod.com',
    role: 1,
  },
  {
    username: 'Egy user',
    password: 'semmi',
    email: 'mail@user.com',
  },
]

const galleries = [
  {
    uid: 1,
    name: 'Próba',
  }
]

class InitialDbSeeder {

  
  * run () {
    yield this._table(User, users)
    yield this._table(Gallery, galleries)
  }

  /**
   * Feltölt egy táblát, ha üres. 
   * @param model A Lucid objektum
   * @param data Sorok tömbje, melyet a createMany(..) kap meg
   */
  
  * _table(model, data) {
    if ((yield model.query().first()) == null)
      yield model.createMany(data)
    else
      console.log('"' + model.table + '" tábla feltöltése kihagyva')
  }

}

module.exports = InitialDbSeeder
