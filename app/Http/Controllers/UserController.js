'use strict'

const Validator = use('Validator')
const Hash = use('Hash')
const User = use('App/Model/User')
const helpers = require('../../helpers.js')

class UserController {

  * login(req, resp) {
    const email = req.input('email')
    const password = req.input('password')

    try {
      yield req.auth.attempt(email, password)
      yield req.with({ messages: [{
        type: 'success', message: 'Sikeres bejelentkezés!'
      }]}).flash()
      resp.redirect('/')
    }
    catch (e) {
      yield req.with({ messages: [{
        type: 'danger', message: 'Az e-mail cím vagy a jelszó nem stimmel!'
      }]}).flash()
      resp.redirect('/login')
    }
  }

  * logout(req, resp) {
    yield req.auth.logout()
    resp.redirect('/')
  }

  * save(req, resp) {

    // validate

    const data = req.except('_csrf');
    const validation = yield Validator.validateAll(data, User.settingsRules, _validationMessages);
    
    if (validation.fails()) {
      const messages = validation.messages()
      helpers.cleanValidationMessages(messages)

      yield req.with({ fd: data, messages }).flash()
      resp.redirect('back')
      return
    }

    // save

    req.currentUser.intro = data.intro
    yield req.currentUser.save()

    // redirect with success message

    yield req.with({ messages: [
      { type: 'success', message: 'Sikeresen mentve.' }
    ]}).flash()
    
    resp.redirect('back')
  }

  * setModPrivilege(req, resp) {
    const user = yield User.find(req.param('id'))
    if (!user) {
      resp.notFound('A felhasználó nem található.')
      return
    }
    if (user.role == 2) {
      resp.redirect('back')
      return
    }

    user.role = (user.role == 1 ? 0 : 1)
    yield user.save()

    resp.redirect('back')
  }

  * registerUser(req, resp) {

    // validate

    const data = req.except('_csrf');
    const validation = yield Validator.validateAll(data, User.validationRules, _validationMessages);
    
    if (validation.fails()) {
      const messages = validation.messages()
      helpers.cleanValidationMessages(messages)

      yield req.with({ fd: data, messages }).flash()
      resp.redirect('back')
      return
    }

    // save

    const user = new User();
    user.username = data.username
    user.email = data.email
    user.password = data.password
    user.intro = data.intro
    yield user.save();

    // login

    yield req.auth.login(user);

    // redirect with success message

    yield req.with({ messages: [
      { type: 'success', message: 'Sikeresen regisztráltál. Üdv a felhasználók között!' }
    ]}).flash()
    
    resp.redirect('/')
  }

  * showLoginPage(req, resp) {
    yield resp.sendView('user/loginPage')
  }

  * showRegisterPage(req, resp) {
    yield resp.sendView('user/registerPage', {
      fd: req.old('fd'),
    })
  }

  * showProfilePage(req, resp) {
    const user = yield User.find(req.param('id'))

    if (!user) {
      resp.notFound('A felhasználó nem található.')
      return
    }

    const galleries = yield user.galleries().public().fetch()
    const likedImages = yield user.likes().public().fetch()

    yield resp.sendView('user/profilePage', {
      user: user.toJSON(),
      galleries: galleries.toJSON(),
      likedImages: likedImages.toJSON(),
    })
  }

  * showSettingsPage(req, resp) {
    yield resp.sendView('user/settingsPage', {
      user: req.currentUser,
      fd: {
        intro: (req.old('fd') ? req.old('fd').intro : req.currentUser.intro),
      },
    })
  }

  * showListPage(req, resp) {
    const users = yield User.all()

    yield resp.sendView('user/profileListPage', {
      users: users.toJSON(),
    })
  }

}

const _mapFieldToLabel = {
  username:         'felhasználói név',
  email:            'e-mail cím',
  password:         'jelszó',
  password_confirm: 'jelszó megerősítés',
  intro:            'bemutatkozó szöveg',
}

const _validationMessages = {
  'required': (field) =>       `A(z) ${_mapFieldToLabel[field]} megadása kötelező.`,
  'min': (field, val, args) => `A(z) ${_mapFieldToLabel[field]} legalább ${args[0]} hosszú legyen.`,
  'max': (field, val, args) => `A(z) ${_mapFieldToLabel[field]} maximum ${args[0]} hosszú lehet.`,

  'username.alpha_numeric': 'A felhasználói név csak alfanumerikus karakterekből állhat.',
  'username.unique':        'Ezzel a felhasználói névvel már regisztráltak. Kérlek válassz másikat!',
  'email.unique':           'Ezzel az e-mail címmel már regisztráltak.',
  'email.email':            'Érvénytelen e-mail cím.',
  'password_confirm.same':  'A megadott két jelszó nem egyezik, kérlek javítsd!',
}

module.exports = UserController