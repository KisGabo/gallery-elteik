'use strict'

const Db = use('Database')

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

class InitialDbSeeder {

  
  * run () {
    yield this._table('users', users)
    yield this._table('galleries', galleries)
    yield this._table('images', images)
    yield this._table('likes', likes)
    yield this._table('keywords', keywords)
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
