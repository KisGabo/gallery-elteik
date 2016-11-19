'use strict'

const Validator = use('Validator')
const Hash = use('Hash')
const User = use('App/Model/User')
const helpers = require('../../helpers.js')

class UserController {

  * showRegisterPage(req, resp) {
    yield resp.sendView('user/registerPage', {
      fd: req.old('fd'),
    })
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
    user.password = yield Hash.make(data.password);
    user.intro = data.intro
    yield user.save();

    // login

    yield req.auth.login(user);

    // redirect with success message

    yield req.with({ messages: [
      {
        type: 'success',
        message: 'Sikeresen regisztráltál. Üdv a felhasználók között!'
      }
    ]}).flash()
    
    resp.redirect('/')
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