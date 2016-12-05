'use strict'

/**
 * Show login form in a modal.
 */

$('#btn-login').on('click', function(e) {
  e.preventDefault()
  const $modal = $('#login-modal')
  const $formContainer = $modal.find('.form-area')
  const $successContainer = $modal.find('.alert-success').hide()
  const $errorContainer = $modal.find('.alert-danger').hide()

  // first click on Login button, so we need to load the form
  if ($formContainer.find('form').length == 0) {
    // load
    $formContainer.load('/login form', function() {
      // send form on click
      $modal.find('form').on('submit', function(e) {
        e.preventDefault()

        $.ajax({
          url: '/ajax/login',
          method: 'POST',
          data: $(this).serializeArray(),
          headers: { 'csrf-token': $('[name="_csrf"]').val() },

          success: () => {
            $successContainer.show()
            // give at least 1 sec for the user to read the success message
            const $prTimeout = new Promise((resolve, reject) => {
              window.setTimeout(resolve, 1000)
            })
            const $prLoad = new Promise((resolve, reject) => {
              $('#navbar-container').load('/ #navbar-main', resolve)
            })
            Promise.all([ $prLoad, $prTimeout ]).then(() => {
              $modal.modal('hide')
            })
          },

          error: () => {
            $errorContainer.show()
          }
        }) // END .ajax call
      }) // END onclick
    }) // END after load
  } // END if not loaded

  $modal.modal('show')
})
