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
Route.get   ('/image/:id/thumb',    'GalleryBrowserController.sendImage').as('thumb')
Route.get   ('/image/:id/medium',   'GalleryBrowserController.sendImage').as('medium')
Route.get   ('/image/:id/original', 'GalleryBrowserController.sendImage').as('original')