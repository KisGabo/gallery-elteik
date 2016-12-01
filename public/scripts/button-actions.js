function btnGalleryDelete_click(e) {
  e.preventDefault()
  $a = $(this)
  $modal = $('.confirm-modal')
  $ok = $modal.find('.modal-ok')
  $modal.modal('show')

  // perform delete on OK
  $ok.off('click')
  $ok.on('click', function(e) {
    _ajaxOp($a, 'DELETE', resp => {
      if ($a.data('redirect')) {
        // redirect to desired URL after delete, if we're on a single gallery's page
        location.assign($a.data('redirect'))
      }
      else {
        // delete table row from gallery list, if we're listing galleries
        $a.closest('tr').remove()
      }
    })
  })
}

function btnImageDelete_click(e) {
  e.preventDefault()
  $a = $(this)
  $modal = $('.confirm-modal')
  $ok = $modal.find('.modal-ok')
  $modal.modal('show')

  // perform delete on OK
  $ok.off('click')
  $ok.on('click', function(e) {
    _ajaxOp($a, 'DELETE', resp => {
      if ($a.data('redirect')) {
        // redirect to desired URL after delete, if we're on a single image's page
        location.assign($a.data('redirect'))
      }
      else {
        // delete image from table, if we're listing images
        $a.closest('.image-table-item').remove()
      }
    })
  })
}

function btnLike_click(e) {
  e.preventDefault()
  $a = $(this)

  _ajaxOp($a, 'POST', resp => {
    // remove 'Like' link
    $parent = $a.parent()
    $a.after('<strong>Megtörtént!</strong>')
    $a.remove()
  })
}

function btnForce_click(e) {
  e.preventDefault()
  $a = $(this)

  _ajaxOp($a, 'PATCH', resp => {
    if ($a.data('redirect')) {
      // redirect to desired URL after delete, if we're on a single image's page
      location.assign($a.data('redirect'))
    }
    else {
      // delete image from table, if we're listing images
      $a.closest('.image-table-item').remove()
    }
  })
}

function _ajaxOp($a, method, success) {
  const headers = {
    'csrf-token': $('[name="_csrf"]').val()
  }
  $.ajax({
    url: '/ajax' + $a.attr('href'),
    method,
    headers,
    error: e => alert('Sikertelen :('),
    success,
  })
}