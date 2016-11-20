'use strict'

const Db = use('Database')
const Hash = use('Hash')

function * users() {
  return [
    {
      username: 'KisGabo',
      password: (yield Hash.make('pwd')),
      email: 'mail@mail.com',
      intro: 'Ezt az <b>egészet</b> én csinálom',
      role: 2,
    },
    {
      username: 'Egy mod',
      password: (yield Hash.make('pwd')),
      email: 'mail@mod.com',
      role: 1,
    },
    {
      username: 'Egy user',
      password: (yield Hash.make('pwd')),
      email: 'mail@user.com',
    },
  ]
}

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
    like_count: 1,
  },
  {
    gallery_id: 1,
    title: 'Kép2',
    date_taken: '2016-10-29 10:06:21',
    public: true,
    like_count: 2,
  },
  {
    gallery_id: 1,
    title: 'Force private kép',
    date_taken: '2016-10-29 01:06:21',
    public: false,
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
    like_count: 1,
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
    public: true,
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

const image_keywords = [
  { image_id: 1, keyword_id: 1 },
  { image_id: 1, keyword_id: 2 },
  { image_id: 2, keyword_id: 2 },
  { image_id: 2, keyword_id: 3 },
  { image_id: 4, keyword_id: 3 },
]

const gallery_keywords = [
  { gallery_id: 1, keyword_id: 1 },
  { gallery_id: 1, keyword_id: 2 },
  { gallery_id: 2, keyword_id: 4 },
  { gallery_id: 3, keyword_id: 1 },
]

class InitialDbSeeder {

  * run () {
    yield this._table('users', yield users())
    yield this._table('galleries', galleries)
    yield this._table('images', images)
    yield this._table('p_likes', likes)
    yield this._table('keywords', keywords)
    yield this._table('p_image_keywords', image_keywords)
    yield this._table('p_gallery_keywords', gallery_keywords)
  }

  /**
   * Seeds a table, if empty.
   * @param tblname Name of table
   * @param data Array of rows
   */
  
  * _table(tblname, data) {
    if ((yield Db.table(tblname).limit(1)).length == 0) {
      // insert one by one, because generated SQL of multirow insert for sqlite
      // tries to set explicit NULL values for columns that are omitted from the data object
      for (let row of data) {
        yield Db.table(tblname).insert(row)
      }
    }
    else {
      console.log('Seeding "' + tblname + '" skipped')
    }
  }

}

module.exports = InitialDbSeeder
