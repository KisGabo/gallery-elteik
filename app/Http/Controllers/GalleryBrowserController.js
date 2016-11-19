'use strict'

class GalleryBrowserController {

  * showMainPage(req, resp) {
    yield resp.sendView('galleryBrowser/mainPage')   
  }

}

module.exports = GalleryBrowserController