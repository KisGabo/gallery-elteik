'use strict'

/**
 * Upgrade keyword input field with auto-suggestions,
 * completion and tags.
 */

$('#keywords').removeClass('form-control')

$('#keywords').selectize({
  create: true,
  hideSelected: true,
  labelField: 'name',
  valueField: 'name',
  searchField: 'name',
  createOnBlur: true,

  /**
   * Queries suggestions from server after
   * typing ended.
   */
  load: function(query, callback) {
    if (query) {
      $.ajax({
        url: '/ajax/keyword/search',
        data: { search: query },
        method: 'get',
        success: callback,
      })
    }
  },

  /**
   * Opens dropdown on focus with gallery-related
   * keywords auto-loaded.
   * If they're not present (so first Focus event),
   * they're quired from server.
   */
  onFocus: function() {
    if (!this.defaultsLoaded) {
      this.defaultsLoaded = true
      const self = this
      const galId = this.$input.data('gallery')

      $.ajax({
        url: `/ajax/gallery/${galId}/keywords`,
        method: 'get',
        success: res => {
          self.addOption(res)
          self.refreshOptions(true)
        }
      })
    }
    else {
      this.open()
    }
  }
})