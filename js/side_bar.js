
(function() {
  // Root init function
  colorSubheadings();

  var sidebar = document.querySelector('.chapter-sidebar');
  if (sidebar) {
    initializeChapterSidebar();
  }

})();


function colorSubheadings() {
  // Replace subheading background colors
  var redStart = 255;
  var greenStart = 255;
  var blueStart = 255;
  var redEnd = 249;
  var greenEnd = 250;
  var blueEnd = 251;

  var redDiff = redEnd - redStart;
  var greenDiff = greenEnd - greenStart;
  var blueDiff = blueEnd - blueStart;

  var page = document.querySelector('.page');
  var pageHeight = page.offsetHeight;

  var subheadings = document.querySelectorAll('.subheading');
  for(var i = 0; i < subheadings.length; i++){
    // Get the position relative to .page
    var span = subheadings[i].querySelector('span');
    var factor = span.offsetTop / pageHeight;

    var r = Math.floor(redDiff * factor + redStart);
    var g = Math.floor(greenDiff * factor + greenStart);
    var b = Math.floor(blueDiff * factor + blueStart);
    var color = 'rgb('+r+','+g+','+b+')';

    // Color background based on position
    span.style.backgroundColor = color;
    span.style.boxShadow = '11px 0 0 '+color+', -13px 0 0 '+color;
  }
}

function initializeChapterSidebar() {

  function onScrollEventHandler(ev) {
    // --- Sticky Sidebar ---

    var sidebar = document.querySelector('.chapter-sidebar');
    var header = document.querySelector('.page-header');
    var headerBottom = header.getBoundingClientRect().bottom;

    if (headerBottom <= 42) {
      // Make it sticky
      addClass(sidebar, 'chapter-sidebar--sticky');
    } else {
      // Make it not stick
      removeClass(sidebar, 'chapter-sidebar--sticky');
    }


    // --- Sidebar Link Highlight ---

    // Reset the highlighted sidebar link(s)
    var highlightedLinks = document.querySelectorAll('.sidebar__link--highlight');
    for (var i=0; i<highlightedLinks.length; i++) {
      removeClass(highlightedLinks[i], 'sidebar__link--highlight');
    }

    var headings = document.querySelectorAll('.subheading__heading');
    for (var i=headings.length-1; i>=0; i--) {
      var heading = headings[i];
      var rect = heading.getBoundingClientRect();

      // -40 is for .subheading top padding
      if (rect.top < window.innerHeight - window.innerHeight/2 - 40) {
        // Go find the matching element in the sidebar and highlight it
        // Get the first visible one (need to subtract window height)
        var headingID = heading.getAttribute('id');
        var sidebarLinks = document.querySelectorAll('.sidebar__link');
        for (var j=0; j<sidebarLinks.length; j++) {
          var sidebarLink = sidebarLinks[j];
          var href = sidebarLink.getAttribute('href').substring(1);
          if (href === headingID) {
            // Found it
            addClass(sidebarLink, 'sidebar__link--highlight');
          }
        }
        break;
      }
    }
  }

  if(window.addEventListener) {
    window.addEventListener('scroll', throttle(onScrollEventHandler, 15), false);
  } else if (window.attachEvent) {
    window.attachEvent('onscroll', throttle(onScrollEventHandler, 15));
  }
}

// --- Utils ---

function throttle (callback, limit) {
  var wait = false;
  return function () {
    if (!wait) {
      callback.call();
      wait = true;
      setTimeout(function () {
        wait = false;
        }, limit);
      }
    }
}

function addClass(element, className) {
  if (element.classList) {
    element.classList.add(className);
  } else {
    // Don't add more than once
    if (element.className.indexOf(className) === -1) {
      element.className += ' ' + className;
    }
  }
}

function removeClass(element, className) {
  if (element.classList) {
    element.classList.remove(className);
  } else {
    element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
  }
}
