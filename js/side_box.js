
(function() {
  
  var sidebox = document.querySelector('.chapter-sidebox');
  if (sidebox) {
    Sidebox();
  }

})();


function Sidebox() {

  function onScrollEventHandler(ev) {
    var sidebox = document.querySelector('.chapter-sidebox');
    var header = document.querySelector('.page-header');
    var headerBottom = header.getBoundingClientRect().bottom;

    if (headerBottom <= 42) {
      add(sidebox, 'chapter-sidebox--sticky');
    } else {
      remove(sidebox, 'chapter-sidebox--sticky');
    }

    var highlightedLinks = document.querySelectorAll('.sidebox__link--highlight');
    for (var i=0; i<highlightedLinks.length; i++) {
      remove(highlightedLinks[i], 'sidebox__link--highlight');
    }

    var headings = document.querySelectorAll('.subheading__heading');
    for (var i=headings.length-1; i>=0; i--) {
      var heading = headings[i];
      var rect = heading.getBoundingClientRect();

      if (rect.top < window.innerHeight - window.innerHeight/2 - 40) {
        
        var headingID = heading.getAttribute('id');
        var sideboxLinks = document.querySelectorAll('.sidebox__link');
        for (var j=0; j<sideboxLinks.length; j++) {
          var sideboxLink = sideboxLinks[j];
          var href = sideboxLink.getAttribute('href').substring(1);
          if (href === headingID) {
            add(sideboxLink, 'sidebox__link--highlight');
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


