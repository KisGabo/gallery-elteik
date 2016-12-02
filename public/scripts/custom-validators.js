'use strict'

/**
 * Custom validator functions for Bootstrap validator.
 */

$.fn.validator.Constructor.DEFAULTS.custom = {
  
  datetime: function($el) {
    if (!moment($el.val(), 'YYYY.MM.DD. HH:mm:ss', true).isValid()) {
      return 'A dátum formátuma a következő legyen: YYYY.MM.DD. HH:mm:ss'
    }
  },

  /*
  requiredother: function($el) {console.log("val")
    const $other = $el.data('requiredother')
    const otherVal = $($other).val()
    if (!otherVal && $el.val()) {
      return 'Majd a megerősítést is töltsd ki.'
    }
  },
  */

}