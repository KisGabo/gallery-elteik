'use strict'

const Route = use('Route')

Route.get   ('/',                   'GalleryBrowserController.showMainPage')

Route.get   ('/login',              'UserController.showLoginPage')
Route.post  ('/login',              'UserController.login')
Route.get   ('/logout',             'UserController.logout')
Route.get   ('/register',           'UserController.showRegisterPage')
Route.post  ('/register',           'UserController.registerUser')
