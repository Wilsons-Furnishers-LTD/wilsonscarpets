jQuery(document).ready(function () {
  jQuery('#navigation .nav-primary .parent').hover(function() {
    jQuery(this).addClass('active').find(".nav-drop").addClass('isOpen');
  }, function() {
    jQuery(this).removeClass('active').find(".nav-drop").removeClass('isOpen');
  });

  jQuery('#navigation .toggle-parent').click(function(e) {
    if(jQuery(this).hasClass('back')){
      jQuery(this).parents('.wrapper.isOpen').eq(0).removeClass('isOpen');
      jQuery(this).parents('.parent.isOpen').eq(0).removeClass('isOpen');
    }else{
      jQuery(this).parents('.wrapper').eq(0).addClass('isOpen');
      jQuery(this).parents('.parent').eq(0).addClass('isOpen');
    }
    jQuery('#navigation .container').animate({ scrollTop: 0 }, "fast");
  });

  jQuery('.js-open-newsletter').click(function(e) {
    e.preventDefault();
    jQuery('.newsletter-popup').addClass('active');
  });
  jQuery('.js-close-newsletter').click(function(e) {
    e.preventDefault();
    jQuery('.newsletter-popup').removeClass('active');
  });

  stickyHeader();
  jQuery('body').scroll(function() {
    stickyHeader();
  });
});

function stickyHeader() {
  var winTop = jQuery('body').scrollTop();
  if (winTop > 100) {
    jQuery('body').addClass('header-sticky');
  } else {
    jQuery('body').removeClass('header-sticky');
  }
};

var juno = {};
juno.navigationIsRevealed = false;
juno.searchIsRevealed = false;
juno.phoneIsRevealed = false;

function addClass(whichElement, className) {
  if (whichElement.classList) {
    whichElement.classList.add(className);
  } else {
    whichElement.className += ' ' + className;
  }
}

function removeClass(el, className) {
  if (el.classList) {
    el.classList.remove(className);
  } else {
    el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
  }
}

function hasParent(element, id) {
  if (element) {
    do {
      if (element.id === id) {
        return true;
      }
      if (element.nodeType === 9) {
        break;
      }
    }
    while ((element = element.parentNode));
  }
  return false;
}

document.getElementById('menuToggle').addEventListener('click', function(e) {
  juno.checkToggleNavigation();
  if (e) {
    e.preventDefault();
  }
}, false);

document.getElementById('searchToggle').addEventListener('click', function(e) {
  juno.checkToggleSearch();
  if (e) {
    e.preventDefault();
  }
}, false);

document.getElementById('phoneToggle').addEventListener('click', function(e) {
  juno.checkTogglePhone();
  if (e) {
    e.preventDefault();
  }
}, false);

juno.checkToggleNavigation = function() {
  if (juno.navigationIsRevealed) {
    removeClass(document.documentElement, 'offCanvas');
    juno.navigationIsRevealed = false;
  } else {
    addClass(document.documentElement, 'offCanvas');
    juno.navigationIsRevealed = true;
  }
};

juno.checkToggleSearch = function() {
  if (juno.searchIsRevealed) {
    removeClass(document.documentElement, 'offCanvasSearch');
    juno.searchIsRevealed = false;
  } else {
    addClass(document.documentElement, 'offCanvasSearch');
    document.getElementById('search-input').focus();
    juno.searchIsRevealed = true;
  }
};

juno.checkTogglePhone = function() {
  if (juno.phoneIsRevealed) {
    removeClass(document.documentElement, 'offCanvasPhone');
    juno.phoneIsRevealed = false;
  } else {
    addClass(document.documentElement, 'offCanvasPhone');
    juno.phoneIsRevealed = true;
  }
};

juno.checkCloseNavigation = function(e) {
  if (juno.navigationIsRevealed) {
    if ((e.target.id != 'menuToggle') && (!hasParent(e.target, 'menuToggle'))) {
      if (!hasParent(e.target, 'navigation')) {
        removeClass(document.documentElement, 'offCanvas');
        juno.navigationIsRevealed = false;
        e.preventDefault();
      }
    }
  }
};

juno.checkCloseSearch = function(e) {
  if (juno.searchIsRevealed) {
    if ((e.target.id != 'searchToggle') && (!hasParent(e.target, 'searchToggle'))) {
      if (!hasParent(e.target, 'search-container')) {
        removeClass(document.documentElement, 'offCanvasSearch');
        juno.searchIsRevealed = false;
        e.preventDefault();
      }
    }
  }
};

juno.checkClosePhone = function(e) {
  if (juno.phoneIsRevealed) {
    if ((e.target.id != 'phoneToggle') && (!hasParent(e.target, 'phoneToggle'))) {
      if (!hasParent(e.target, 'phone-container')) {
        removeClass(document.documentElement, 'offCanvasPhone');
        juno.phoneIsRevealed = false;
        e.preventDefault();
      }
    }
  }
};

document.addEventListener('click', function(e) {
  juno.checkCloseNavigation(e);
  juno.checkCloseSearch(e);
  juno.checkClosePhone(e);
}, true);
// double up for mobile event:
document.addEventListener('touchend', function(e) {
  juno.checkCloseNavigation(e);
  juno.checkCloseSearch(e);
  juno.checkClosePhone(e);
});
