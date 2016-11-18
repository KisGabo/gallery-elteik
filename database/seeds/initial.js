'use strict'

const User = use('App/Model/User')
const Gallery = use('App/Model/Gallery')
const Image = use('App/Model/Image')
const Like = use('App/Model/Like')
const Keyword = use('App/Model/Keyword')

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
    user_id: 1,
    name: 'Egy publikus galéria',
    public: true,
  },
  {
    user_id: 1,
    name: 'Egy privát galéria',
  },
  {
    user_id: 3,
    name: 'Egy sima public galéria',
    public: true,
    date_from: '2015-10-12 12:00:00',
    date_to: '2015-10-15 12:00:00',
  }
]

const images = [
  {
    gallery_id: 1,
    title: 'Kép1',
    date_taken: '2016-10-29 11:06:21',
    public: true,
  },
  {
    gallery_id: 1,
    title: 'Kép2',
    date_taken: '2016-10-29 10:06:21',
    public: true,
    likes: 2,
  },
  {
    gallery_id: 1,
    title: 'Force private kép',
    date_taken: '2016-10-29 01:06:21',
    public: true,
    force_private: true,
  },
  {
    gallery_id: 2,
    title: 'Privi galériában privi kép',
    date_taken: '2016-10-29 10:06:21',
  },
  {
    gallery_id: 2,
    title: 'Privi galériában public kép',
    date_taken: '2016-10-29 10:06:21',
    public: true,
    likes: 1,
  },
  {
    gallery_id: 3,
    title: 'Public galériában privi kép',
    date_taken: '2016-10-29 10:06:21',
  },
  {
    gallery_id: 3,
    title: 'kéééééép',
    date_taken: '2016-10-29 10:06:21',
    pubilc: true,
  },
]

const likes = [
  {
    user_id: 2,
    image_id: 2,
  },
  {
    user_id: 3,
    image_id: 2,
  },
  {
    user_id: 1,
    image_id: 5,
  },
  {
    user_id: 1,
    image_id: 1,
  }
]

const keywords = [
  { name: 'szó1' },
  { name: 'szó2' },
  { name: 'szó3' },
  { name: 'szó4' },
]

class InitialDbSeeder {

  
  * run () {
    yield this._table(User, users)
    yield this._table(Gallery, galleries)
    yield this._table(Image, images)
    yield this._table(Like, likes)
    yield this._table(Keyword, keywords)
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
