'use strict'

const Command = use('Command')
const AdonisHelpers = use('Helpers')
const https = require('https')
const fs = require('fs')
const extract = require('extract-zip')

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

    this.info('Downloading...')
    var file = fs.createWriteStream(storage + '/storage.zip');
    var request = https.get("https://dl.dropboxusercontent.com/u/69565179/k%C3%BCld-nagyg%C3%A9p/gallery-elteik/storage.zip", (resp) => {
      resp.pipe(file);
      resp.on('end', () => {
        this.info('Extracting...')
        extract(storage + '/storage.zip', { dir: storage + '/..' }, (err) => {
          fs.unlink(storage + '/storage.zip')
          this.info('Finished!')
        })
      })
    });
  }

}

module.exports = StorageDownload
