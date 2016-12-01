/**
 * Add or remove file fields on image upload page.
 */

// hide 'how many fields' form
$('#form-field-count').remove()

// show file delete buttons
$('.btn-remove-upload-field').show().on('click', function(e) {
  // keep one, or else we can't clone :)
  if ($('.upload-field').length > 1) {
    $(this).closest('.upload-field').remove()
  }
})

// show new file button
$('.btn-add-upload-field').show().on('click', function(e) {
  const $last = $('.upload-field').last()
  $last.after($last.clone(true))
})
