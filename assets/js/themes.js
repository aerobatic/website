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

  // Load the stargazers count for each theme repo
  Promise.all($.map($('#themes .theme .gh-stars').toArray(), function(elem) {
    var target = $(elem);
    var gitHubUrl = target.attr('href');
    // Extract the repo full name 
    var repoFullName = gitHubUrl.match(/^https:\/\/github\.com\/(.*)/)[1];

    return fetch('https://www.aerobatic.com/github-api/repos/' + repoFullName)
      .then(function(res) { return res.json()})
      .then(function(json) {
        target.text(target.text() + ' ' + json.stargazers_count);
      });
  }));
});