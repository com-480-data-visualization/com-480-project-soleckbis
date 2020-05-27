
(function() {
  
  var sidebar = document.querySelector('.chapter-sidebar');
  if (sidebar) {
    Sidebox();
  }

})();


function Sidebox() {

  function onScrollEventHandler(ev) {
    var sidebar = document.querySelector('.chapter-sidebar');
    var header = document.querySelector('.page-header');
    var headerBottom = header.getBoundingClientRect().bottom;

    if (headerBottom <= 42) {
      add(sidebar, 'chapter-sidebar--sticky');
    } else {
      remove(sidebar, 'chapter-sidebar--sticky');
    }

    var highlightedLinks = document.querySelectorAll('.sidebar__link--highlight');
    for (var i=0; i<highlightedLinks.length; i++) {
      remove(highlightedLinks[i], 'sidebar__link--highlight');
    }

    var headings = document.querySelectorAll('.subheading__heading');
    for (var i=headings.length-1; i>=0; i--) {
      var heading = headings[i];
      var rect = heading.getBoundingClientRect();

      if (rect.top < window.innerHeight - window.innerHeight/2 - 40) {
        
        var headingID = heading.getAttribute('id');
        var sidebarLinks = document.querySelectorAll('.sidebar__link');
        for (var j=0; j<sidebarLinks.length; j++) {
          var sidebarLink = sidebarLinks[j];
          var href = sidebarLink.getAttribute('href').substring(1);
          if (href === headingID) {
            add(sidebarLink, 'sidebar__link--highlight');
          }
        }
        break;
      }
    }
  }

  if(window.addEventListener) {
    window.addEventListener('scroll', step(onScrollEventHandler, 15), false);
  } else if (window.attachEvent) {
    window.attachEvent('onscroll', step(onScrollEventHandler, 15));
  }
}


function remove(element, className) {
  if (element.classList) {
    element.classList.remove(className);
  } else {
    element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
  }
}

function add(element, className) {
  if (element.classList) {
    element.classList.add(className);
  } else {
    if (element.className.indexOf(className) === -1) {
      element.className += ' ' + className;
    }
  }
}

function step (callback, limit) {
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


