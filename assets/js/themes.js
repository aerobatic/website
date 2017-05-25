$(function () {
  $('[data-toggle="tooltip"]').tooltip();

  var clipboard = new Clipboard('#themes div[data-copy-cli] button');
  clipboard.on('success', function(e) {
    // https://stackoverflow.com/a/9875490
    $(e.trigger).attr('title', 'Copied!')
      .tooltip('fixTitle')
      .tooltip('show');
  });

  clipboard.on('error', function(e) {
      console.log(e);
  });

  // var getStarsPromises = $.map('#themes .theme .gh-stars', );  
});