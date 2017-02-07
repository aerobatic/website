// trigger a change
$(document).ready(function() {
  // Track all clicks on external links
  $('a[rel=external]').on('click', function() {
    if (!ga) return true;

    var url = $(this).attr('href');
    ga('send', 'event', 'outbound', 'click', url, {
      hitCallback: function () {
        document.location = url;
      }
    });
    return true;
  });

  var pluginsHeader = $('#docs-menu li.plugins');
  pluginsHeader.on('click', function(e) {
    e.preventDefault();
    var pluginsMenu = $('#docs-menu ul.plugins');
    var expandedCaret = pluginsHeader.find('i.fa');
    if (pluginsMenu.is(':visible')) {
      expandedCaret.removeClass('fa-caret-down').addClass('fa-caret-right');
    } else {
      expandedCaret.removeClass('fa-caret-right').addClass('fa-caret-down');
    }
    pluginsMenu.slideToggle();
    pluginsHeader.find('a').blur();
  });

  // Following the example of GitHub: add a behavior where hovering
  // over a header displays a chain alongside that when clicked navigates
  // to the anchored header. Then it's easy to copy that URL
  // to paste somewhere else.
  $('.markdown').find('h2, h3, h4, h5').on('mouseenter', function(e) {
    var heading = $(this);
    var headingId = heading.attr('id');
    if (headingId) {
      heading.css({cursor: 'pointer'})
        .append('<i class="header-anchor fa fa-link"></i>')
        .on('click', function() {
          location.href = location.pathname + '#' + headingId;
        });
    }
  })
  .on('mouseleave', function(e) {
    // Remove the anchor on mouseleave
    $(this).find('i.fa').remove();
  });

  $('div.content dt > code').on('mouseenter', function(e) {
    var codeDefinition = $(this);
    var nextElem = codeDefinition.next();
    if (nextElem.is('a[id]')) {
      codeDefinition.css({cursor: 'pointer'})
        .after('<i class="code-anchor fa fa-link"></i>')
        .on('click', function() {
          location.href = location.pathname + '#' + nextElem.attr('id');
        });
    }
  })
  .on('mouseleave', function() {
    $(this).next('i.fa').remove();
  });

  // HACKY way to replace https://!!baseurl!! with https://__baseurl__
  $('code:contains("https://!!baseurl!!"), span.code:contains("https://!!baseurl!!")').each(function(i, elem) {
    $(elem).contents().each(function(j, child) {
      if (child.nodeType === 3) {
        child.nodeValue = child.nodeValue.replace('https://!!baseurl!!', 'https://__baseurl__');
      } else {
        child.innerText = child.innerText.replace('https://!!baseurl!!', 'https://__baseurl__');
      }
    });
  });
});
