'use strict'

const Route = use('Route')

Route.get   ('/',                   'GalleryBrowserController.showMainPage')

Route.get   ('/login',              'UserController.showLoginPage')
Route.post  ('/login',              'UserController.login')
Route.get   ('/logout',             'UserController.logout')
Route.get   ('/register',           'UserController.showRegisterPage')
Route.post  ('/register',           'UserController.registerUser')
Route.get   ('/user',               'UserController.showListPage')
Route.get   ('/user/:id',           'UserController.showProfilePage')           .as('profile')
Route.get   ('/user/:id/moderator', 'UserController.setModPrivilege')           .as('user_mod')      .middleware('admin')
Route.get   ('/usersettings',       'UserController.showSettingsPage')                               .middleware('auth')
Route.post  ('/usersettings',       'UserController.save')                                           .middleware('auth')

Route.get   ('/gallery',            'GalleryBrowserController.showGalleryListPage')                  .middleware('proc_gallery_filters')
Route.get   ('/gallery/add',        'GalleryManagerController.showFormPage')    .as('gallery_add')   .middleware('auth')
Route.post  ('/gallery/add',        'GalleryManagerController.save')                                 .middleware('auth')
Route.get   ('/gallery/:id',        'GalleryBrowserController.showGalleryPage') .as('gallery')       .middleware('proc_img_filters')
Route.get   ('/gallery/:id/edit',   'GalleryManagerController.showFormPage')    .as('gallery_edit')  .middleware('auth')
Route.post  ('/gallery/:id/edit',   'GalleryManagerController.save')                                 .middleware('auth')
Route.get   ('/gallery/:id/delete', 'GalleryManagerController.delete')          .as('gallery_delete').middleware('auth')
Route.get   ('/gallery/:id/upload', 'ImageManagerController.showUploadPage')    .as('gallery_upload').middleware('auth')
Route.post  ('/gallery/:id/upload', 'ImageManagerController.handleUpload')                           .middleware('auth')
Route.get   ('/own',                'GalleryBrowserController.showOwnPage')     .as('own')           .middleware('auth', 'proc_gallery_filters')

Route.get   ('/image',              'GalleryBrowserController.showImageListPage')                    .middleware('proc_img_filters')
Route.get   ('/image/:id',          'GalleryBrowserController.showImagePage')   .as('image')
Route.get   ('/image/:id/like',     'GalleryBrowserController.likeImage')       .as('like')          .middleware('auth')
Route.get   ('/image/:id/thumb',    'GalleryBrowserController.sendImage')       .as('thumb')
Route.get   ('/image/:id/medium',   'GalleryBrowserController.sendImage')       .as('medium')
Route.get   ('/image/:id/original', 'GalleryBrowserController.sendImage')       .as('original')
Route.get   ('/image/:id/edit',     'ImageManagerController.showFormPage')      .as('image_edit')    .middleware('auth')
Route.post  ('/image/:id/edit',     'ImageManagerController.save')                                   .middleware('auth')
Route.get   ('/image/:id/delete',   'ImageManagerController.delete')            .as('image_delete')  .middleware('auth')
Route.get   ('/image/:id/force',    'ImageManagerController.forcePrivate')      .as('image_force')   .middleware('mod')

Route.get   ('/keyword/:id/gallery','GalleryBrowserController.showKeywordPage') .as('gallery_keyword').middleware('proc_gallery_filters')
Route.get   ('/keyword/:id/image',  'GalleryBrowserController.showKeywordPage') .as('image_keyword') .middleware('proc_img_filters')

Route.group('ajax', function () {

  Route.post   ('/login',               'UserController.ajaxLogin')             .as('a_login')
  Route.get    ('/user/exists',         'UserController.checkUserExists')       .as('a_user_exists')

  Route.delete ('/gallery/:id/delete',  'GalleryManagerController.delete')      .as('a_gallery_delete')      .middleware('auth')
  Route.delete ('/image/:id/delete',    'ImageManagerController.delete')        .as('a_image_delete')        .middleware('auth')
  Route.post   ('/image/:id/like',      'GalleryBrowserController.likeImage')   .as('a_like')                .middleware('auth')
  Route.patch  ('/image/:id/force',     'ImageManagerController.forcePrivate')  .as('a_image_force')         .middleware('mod')

  Route.get    ('/keyword/search',      'KeywordController.ajaxSuggestions')    .as('a_keyword_search')
  Route.get    ('/gallery/:id/keywords','KeywordController.ajaxSuggestionsForGallery').as('a_gallery_keywords').middleware('auth')

}).prefix('/ajax')