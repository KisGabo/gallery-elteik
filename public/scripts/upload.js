/**
 * Add or remove file fields on image upload page.
 */

/**
 * Hide 'how many fields' form
 */

$('#form-field-count').remove()

/**
 * Show file field delete buttons
 */

$('.btn-remove-upload-field').show().on('click', function(e) {
  // keep one, or else we can't clone :)
  if ($('.upload-field').length > 1) {
    $(this).closest('.upload-field').remove()
  }
})

/**
 * Show new file button
 */

$('.btn-add-upload-field').show().on('click', function(e) {
  const $last = $('.upload-field').last()
  $last.after($last.clone(true))
})

/**
 * Show upload status to user in a modal dialog with progress bar.
 * 
 * Server flashes success/error messages, so redirect will work as expected.
 * Server response: { firstId, skipped: [..] }
 */

$('#upload').ajaxForm({

  beforeSend: function() {
    $('.progress-modal').modal('show')
    const $bar = $("#progress")
    $bar.width('0%')
    $bar.text('0%')
    $bar.removeClass('progress-bar-success')
    $bar.addClass('progress-bar-info')
  },

  uploadProgress: function(event, position, total, percentComplete) {
    const $bar = $("#progress")
    const percentVal = percentComplete + '%'
    $bar.width(percentVal)
    if (percentComplete != 100) {
      $bar.text(percentVal)
    }
    else {
      $bar.text('Feltöltés kész, feldolgozás folyamatban...')
      $bar.removeClass('progress-bar-info')
      $bar.addClass('progress-bar-success')
    }
  },

  success: function(res) {
    if (res.firstId == 0) {
      alert('A feltöltés sikertelen.')
      $('.progress-modal').modal('hide')
    }
    else {
      location.assign(`/image/${res.firstId}/edit`)
    }
  },

  error: function(res) {
    alert('A feltöltés sikertelen.')
    $('.progress-modal').modal('hide')
  }

});
