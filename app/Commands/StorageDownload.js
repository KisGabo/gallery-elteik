'use strict'

/**
 * This ace command downloads the example image files
 * and puts them into the storage folder.
 * 
 * This step is strongly recommended if using the db seeder,
 * or else no galleries nor images can be created
 * because of missing folders.
 */

const http = require('http')
const fs = require('fs')
const extract = require('extract-zip')
const Command = use('Command')
const AdonisHelpers = use('Helpers')

class StorageDownload extends Command {

  /**
   * signature defines the requirements and name
   * of command.
   *
   * @return {String}
   */
  get signature () {
    return 'storage:download'
  }

  /**
   * description is the little helpful information displayed
   * on the console.
   *
   * @return {String}
   */
  get description () {
    return 'Download example image files according to db seeder data'
  }

  /**
   * handle method is invoked automatically by ace, once your
   * command has been executed.
   *
   * @param  {Object} args    [description]
   * @param  {Object} options [description]
   */
  * handle (args, options) {
    const storage = AdonisHelpers.storagePath()

    // sorry for callbacks

    this.info('Downloading example images...')
    var file = fs.createWriteStream(storage + '/storage.zip');
    var request = http.get("http://share.srv.kisgabo.com/public/gallery-elteik-storage.zip", (resp) => {
      resp.pipe(file);
      resp.on('end', () => {
        this.info('Extracting example images...')
        extract(storage + '/storage.zip', { dir: storage + '/..' }, (err) => {
          fs.unlink(storage + '/storage.zip')
          this.success('Example images saved!')
        })
      })
    });
  }

}

module.exports = StorageDownload
