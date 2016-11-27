'use strict'

/**
 * This seeder inserts example data into db.
 * 
 * Make sure you download the example images into
 * the storage folder (`node ace storage:download`),
 * otherwise images won't be displayed, and
 * gallery/image operations will fail for example users.
 */

const Db = use('Database')
const Hash = use('Hash')
const Config = use('Config')
const moment = require('moment')

function * users() {
  return [
    {
      username: Config.get('gallery.admin.username'),
      password: (yield Hash.make(Config.get('gallery.admin.password'))),
      email: Config.get('gallery.admin.email'),
      role: 2,
    },
    {
      username: 'Egy mod',
      password: (yield Hash.make('pwd')),
      email: 'mail@mod.com',
      intro: 'Helloooooooooooooo',
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
    date_from: moment('2016-10-02 11:06:21', 'YYYY-MM-DD HH:mm:ss').unix(),
    date_to: moment('2016-10-15 11:06:21', 'YYYY-MM-DD HH:mm:ss').unix(),
  }
]

const images = [
  {
    gallery_id: 1,
    title: 'Kép1',
    date_taken: moment('2016-10-29 11:06:21', 'YYYY-MM-DD HH:mm:ss').unix(),
    public: true,
    like_count: 1,
  },
  {
    gallery_id: 1,
    title: 'Kép2',
    date_taken: moment('2016-10-29 10:06:21', 'YYYY-MM-DD HH:mm:ss').unix(),
    public: true,
    like_count: 2,
  },
  {
    gallery_id: 1,
    title: 'Force private kép',
    date_taken: moment('2016-10-29 01:06:21', 'YYYY-MM-DD HH:mm:ss').unix(),
    public: false,
    force_private: true,
  },
  {
    gallery_id: 2,
    title: 'Privi galériában privi kép',
    date_taken: moment('2016-10-29 10:06:21', 'YYYY-MM-DD HH:mm:ss').unix(),
  },
  {
    gallery_id: 2,
    title: 'Privi galériában public kép',
    date_taken: moment('2016-10-21 21:08:21', 'YYYY-MM-DD HH:mm:ss').unix(),
    public: true,
    like_count: 1,
  },
  {
    gallery_id: 3,
    title: 'Public galériában privi kép',
    date_taken: moment('2016-10-21 21:08:21', 'YYYY-MM-DD HH:mm:ss').unix(),
  },
  {
    gallery_id: 3,
    title: 'kéééééép',
    date_taken: moment('2016-10-21 21:08:21', 'YYYY-MM-DD HH:mm:ss').unix(),
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

  /**
   * Seeder method called by Adonis.
   */
  * run () {
    yield this._table('users', yield users(), true)
    yield this._table('galleries', galleries, true)
    yield this._table('images', images, true)
    yield this._table('p_likes', likes, false)
    yield this._table('keywords', keywords, false)
    yield this._table('p_image_keywords', image_keywords, false)
    yield this._table('p_gallery_keywords', gallery_keywords, false)
  }

  /**
   * Seeds a table, if empty.
   * 
   * @param {string} tblname Name of table
   * @param {array} data Array of rows
   * @param {boolean} timestamps True if table stores created_at and updated_at
   * 
   * @private
   */
  
  * _table(tblname, data, timestamps) {
    if ((yield Db.table(tblname).limit(1)).length == 0) {
      // insert one by one, because generated SQL of multirow insert for sqlite
      // tries to set explicit NULL values for columns that are omitted from the data object
      for (let row of data) {
        if (timestamps) {
          row.created_at = moment().unix()
          row.updated_at = moment().unix()
        }
        yield Db.table(tblname).insert(row)
      }
    }
    else {
      console.log('Seeding "' + tblname + '" skipped')
    }
  }

}

module.exports = InitialDbSeeder
