'use strict'

const Route = use('Route')

Route.get   ('/',                   'GalleryBrowserController.showMainPage')

Route.get   ('/login',              'UserController.showLoginPage')
Route.post  ('/login',              'UserController.login')
Route.get   ('/logout',             'UserController.logout')
Route.get   ('/register',           'UserController.showRegisterPage')
Route.post  ('/register',           'UserController.registerUser')
Route.get   ('/user',               'UserController.showListPage')
Route.get   ('/user/:id',           'UserController.showProfilePage').as('profile')

Route.get   ('/gallery',            'GalleryBrowserController.showGalleryListPage')
Route.get   ('/gallery/add',        'GalleryManagerController.showFormPage').as('gallery_add').middleware('auth')
Route.post  ('/gallery/add',        'GalleryManagerController.save').middleware('auth')
Route.get   ('/gallery/:id',        'GalleryBrowserController.showGalleryPage').as('gallery')
Route.get   ('/gallery/:id/edit',   'GalleryManagerController.showFormPage').as('gallery_edit').middleware('auth')
Route.post  ('/gallery/:id/edit',   'GalleryManagerController.save').middleware('auth')
Route.get   ('/gallery/:id/delete', 'GalleryManagerController.delete').as('gallery_delete').middleware('auth')

Route.get   ('/image/:id',          'GalleryBrowserController.showImagePage').as('image')
Route.get   ('/image/:id/like',     'GalleryBrowserController.likeImage').as('like').middleware('auth')
Route.get   ('/image/:id/thumb',    'GalleryBrowserController.sendImage').as('thumb')
Route.get   ('/image/:id/medium',   'GalleryBrowserController.sendImage').as('medium')
Route.get   ('/image/:id/original', 'GalleryBrowserController.sendImage').as('original')

Route.get   ('/keyword/:id/gallery','GalleryBrowserController.showKeywordPage').as('gallery_keyword')
Route.get   ('/keyword/:id/image',  'GalleryBrowserController.showKeywordPage').as('image_keyword')