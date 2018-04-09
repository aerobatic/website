(function(i, s, o, g, r, a, m) {
  i["GoogleAnalyticsObject"] = r;
  (i[r] =
    i[r] ||
    function() {
      (i[r].q = i[r].q || []).push(arguments);
    }),
    (i[r].l = 1 * new Date());
  (a = s.createElement(o)), (m = s.getElementsByTagName(o)[0]);
  a.async = 1;
  a.src = g;
  m.parentNode.insertBefore(a, m);
})(window, document, "script", "//www.google-analytics.com/analytics.js", "ga");

if (ga) {
  ga("create", "UA-48559935-3", "auto");
  ga("send", "pageview");
}

// Algolia docsearch
docsearch({
  apiKey: "bb94ffdd8f41a58713bd1ffdd0936900",
  indexName: "aerobatic",
  inputSelector: "#search-box",
  debug: false, // Set debug to true if you want to inspect the dropdown
  transformData: function(hits) {
    // modify hits
    if (/localhost/.test(location.origin)) {
      for (var i = 0; i < hits.length; i++) {
        hits[i].url = hits[i].url.replace(
          "https://www.aerobatic.com",
          location.origin
        );
      }
    }
    return hits;
  }
});

// trigger a change
$(document).ready(function() {
  // Track all clicks on external links
  $("a[rel=external]").on("click", function() {
    if (!ga) return true;

    var url = $(this).attr("href");
    ga("send", "event", "outbound", "click", url, {
      hitCallback: function() {
        document.location = url;
      }
    });
    return true;
  });

  var pluginsHeader = $("#docs-menu li.plugins");
  pluginsHeader.on("click", function(e) {
    e.preventDefault();
    var pluginsMenu = $("#docs-menu ul.plugins");
    var expandedCaret = pluginsHeader.find("i.fa");
    if (pluginsMenu.is(":visible")) {
      expandedCaret.removeClass("fa-caret-down").addClass("fa-caret-right");
    } else {
      expandedCaret.removeClass("fa-caret-right").addClass("fa-caret-down");
    }
    pluginsMenu.slideToggle();
    pluginsHeader.find("a").blur();
  });

  // Following the example of GitHub: add a behavior where hovering
  // over a header displays a chain alongside that when clicked navigates
  // to the anchored header. Then it's easy to copy that URL
  // to paste somewhere else.
  $(".markdown")
    .find("h2, h3, h4, h5")
    .on("mouseenter", function(e) {
      var heading = $(this);
      var headingId = heading.attr("id");
      if (headingId) {
        heading
          .css({ cursor: "pointer" })
          .append('<i class="header-anchor fa fa-link"></i>')
          .on("click", function() {
            location.href = location.pathname + "#" + headingId;
          });
      }
    })
    .on("mouseleave", function(e) {
      // Remove the anchor on mouseleave
      $(this)
        .find("i.fa")
        .remove();
    });

  $("div.content dt > code")
    .on("mouseenter", function(e) {
      var codeDefinition = $(this);
      var nextElem = codeDefinition.next();
      if (nextElem.is("a[id]")) {
        codeDefinition
          .css({ cursor: "pointer" })
          .after('<i class="code-anchor fa fa-link"></i>')
          .on("click", function() {
            location.href = location.pathname + "#" + nextElem.attr("id");
          });
      }
    })
    .on("mouseleave", function() {
      $(this)
        .next("i.fa")
        .remove();
    });

  // HACKY way to replace https://!!baseurl!! with https://__baseurl__
  $(
    'code:contains("https://!!baseurl!!"), span.code:contains("https://!!baseurl!!")'
  ).each(function(i, elem) {
    $(elem)
      .contents()
      .each(function(j, child) {
        if (child.nodeType === 3) {
          child.nodeValue = child.nodeValue.replace(
            "https://!!baseurl!!",
            "https://__baseurl__"
          );
        } else {
          child.innerText = child.innerText.replace(
            "https://!!baseurl!!",
            "https://__baseurl__"
          );
        }
      });
  });
});
