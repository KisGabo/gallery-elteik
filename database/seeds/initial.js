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
    yield User.createMany(users)
    yield Gallery.createMany(galleries);
  }

}

module.exports = InitialDbSeeder
