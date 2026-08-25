function windowPopup(url, width, height) {
    var left = (screen.width / 2) - (width / 2),
        top = (screen.height / 2) - (height / 2);
    window.open(url, "", "menubar=no,toolbar=no,resizable=yes,scrollbars=yes,width=" + width + ",height=" + height + ",top=" + top + ",left=" + left);
}
var url = window.location.href, replaced_url = '+-tag%3aclone%2bproduct+-tag%3ASample+-product_type%3ADiscontinued%2BFlooring&type=product';

if (url.indexOf(replaced_url) == -1 && window.location.pathname != '/') {
    if( url.charAt(url.length-1) == '/' && url.charAt(url.length-2) == '/' ){
        for(let i = 1; i < url.length; i++){
            if(url.charAt(url.length-i) == '/'){
                url = url.replace(/\/$/, '').toLowerCase();
            }else{
                if( url.charAt(url.length-1) == '/' || url != url.toLowerCase() ){
                    url = url.replace(/\/$/, '').toLowerCase();
                    window.location = url;
                }
            }
        }
    }else{
        if( url.charAt(url.length-1) == '/' || url != url.toLowerCase() ){
            url = url.replace(/\/$/, '').toLowerCase();
            //window.location = url;
        }
    }
}

if (url.indexOf('/search?') == -1 && !url.indexOf(replaced_url) == -1 ) {
    window.location = url + replaced_url;
}

if (url.indexOf(replaced_url) != -1) {
    var newurl = url.replace(replaced_url, '');
    window.history.replaceState({ path: url }, '', newurl);
}

const dynamicAppHeight = () => {
    const doc = document.documentElement;  
  
    const storeViewInformation = document.getElementById("mastHeadTop");
    const headerWrapper = document.getElementById("mastHead");
    const announcement = document.getElementById("announcement");
    const promo = document.getElementById("shopify-section-promo-bar");
    
    let tempHeight = 0;
    let appInnerHeight = window.innerHeight;
  
  
    if(typeof(storeViewInformation) != 'undefined' && storeViewInformation != null){
      tempHeight = tempHeight + storeViewInformation.offsetHeight;
    }
    
    if(typeof(headerWrapper) != 'undefined' && headerWrapper != null){
      tempHeight = tempHeight + headerWrapper.offsetHeight;
    }

    if(typeof(announcement) != 'undefined' && announcement != null){
        doc.style.setProperty('--app-announcement', `${announcement.offsetHeight}px`)
    }

    if(typeof(promo) != 'undefined' && promo != null){
        doc.style.setProperty('--app-promo', `${promo.offsetHeight}px`)
    }
  
  
    appInnerHeight = window.innerHeight - tempHeight;
  
  
    
    doc.style.setProperty('--app-height', `${window.innerHeight}px`)
    doc.style.setProperty('--app-padding-top', `${tempHeight}px`)
    doc.style.setProperty('--app-inner-height', `${appInnerHeight}px`)
  };
//window.addEventListener('resize', dynamicAppHeight);
dynamicAppHeight();

jQuery(document).ready(function () {
    jQuery('.search-form').submit(function() {
        var form = jQuery(this),
            search_input = form.find('#search-input'),
            query = form.find('#q');
            //search_input = search_input.val();
            search_input = search_input.val() + '+-tag%3ASample';
            search_input = search_input + '+-tag%3aclone%2bproduct';
            search_input = search_input + '+-product_type%3ADiscontinued%2BFlooring';
            search_input = search_input + '&type=product';
        query.val(search_input);
    });

    jQuery('.js-open-newsletter').click(function(e) {
        e.preventDefault();
        jQuery('.newsletter-popup').addClass('active');
    });
    jQuery('.js-close-newsletter').click(function(e) {
        e.preventDefault();
    jQuery('.newsletter-popup').removeClass('active');
    if (jQuery('.newsletter-popup .form--success').length) {
      localStorage.setItem('newsletter', '1');
    }
  });

  if (jQuery('.newsletter-popup .form--success').length) {
    //if (!localStorage.getItem('newsletter')) {
      jQuery('.js-open-newsletter').trigger('click');
    //}
    jQuery('#mastFooter .sign-up').addClass('done');
  }

    var $mastHead = jQuery('body');
    var stickyHeader = function() {
        var winTop = jQuery(window).scrollTop();
        if (winTop > 100) {
            $mastHead.addClass('header-sticky');
        } else {
            $mastHead.removeClass('header-sticky');
        }
    };
    stickyHeader();
    jQuery(window).scroll(function() {
        stickyHeader();
    });

    jQuery('.faq-list dt').click(function () {
        jQuery(this).next().slideToggle(200);
        jQuery(this).toggleClass('active');
    });

    jQuery('.js-filter-by').click(function () {
        jQuery('body').addClass('open-filter');
    });
    jQuery('.filters-close').click(function () {
        jQuery('body').removeClass('open-filter');
    });

    jQuery('.toggle-sidebar-menu').click(function (e) {
        e.preventDefault();
        jQuery(this).toggleClass('active').next().slideToggle(200);
    });


    var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    jQuery('.swatch-colours li span').hover(function () {
        if (!is_touch_device()) {
            var img_url = jQuery(this).data('image-url');
            var parent = jQuery(this).closest('.item');
            var $img = parent.find('.product-image-wrap picture img');
            var $source = parent.find('.product-image-wrap picture source');
            if (!$img.attr('data-src')) {
                $img.data('src', $img.attr('src'));
                $source.data('src', $source.attr('srcset'));
            }
            $img.attr('src', img_url);
            $source.attr('srcset', img_url);
        }
    }, function () {
        if (!is_touch_device()) {
            var parent = jQuery(this).closest('.item');
            var $img = parent.find('.product-image-wrap picture img');
            var $source = parent.find('.product-image-wrap picture source');
            $img.attr('src', $img.data('src'));
            $source.attr('srcset', $source.data('src'));
        }
    });

    jQuery('.swatch-colours .mobile-interactive').click(function(e){
        var thisLi = jQuery(this).parent().parent();
        var thisURL = jQuery(this).parent().find('a').prop('href');
        
        jQuery(thisLi).parent().find('.selected').removeClass('selected');
        thisLi.addClass('selected');

        var img_url = jQuery(this).parent().data('image-url');
        var parent = jQuery(this).parent().closest('.item');
        
        var $img = parent.find('.product-image-wrap picture img');
        var $source = parent.find('.product-image-wrap picture source');
        if (!$img.attr('data-src')) {
            $img.data('src', $img.attr('src'));
            $source.data('src', $source.attr('srcset'));
        }

        $img.attr('src', img_url);
        $source.attr('srcset', img_url );
        parent.find('.product-image-wrap a').attr('href', thisURL);
        parent.find('.product-name a').attr('href', thisURL);
        parent.find('.buttons-set a').attr('href', thisURL);
    })

    if(jQuery('#mastHeadTop').length){
        
        jQuery('#mastHeadTop .owl-carousel').owlCarousel({            
            
            autoplayTimeout: 6000,
            autoplayHoverPause: true,
            autoplaySpeed: 1500,
            stopOnHover: false,
            margin: 0,
            nav: false,
            dots: false,
            responsive: {
                0: {
                    items: 1,
                    loop: true,
                    autoplay: true,
                    nav: true
                },
                1024: {
                    items: 4,
                    loop: false,
                    autoplay: false
                }
            },
            onInitialized: function(){
                dynamicAppHeight()
            }
        });
    }

    if(jQuery('#announcement').length){
        
        jQuery('#announcement .owl-carousel').owlCarousel({
            autoplayTimeout: 6000,
            autoplayHoverPause: true,
            autoplaySpeed: 1500,
            stopOnHover: false,
            margin: 0,
            nav: true,
            dots: false,
            items: 1,
            loop: true,
            autoplay: true,
            navText: ['<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" enable-background="new 0 0 48 48" xmlns:v="https://vecta.io/nano"><path d="M35.891 48a1 1 0 0 1-.692-.278L11.417 24.883a1 1 0 0 1-.001-1.441L35.044.423c.251-.355.719-.518 1.146-.368a1 1 0 0 1 .616 1.273c-.102.292-.196.566-23.254 22.831l23.031 22.119a1 1 0 0 1 .029 1.414c-.196.205-.459.308-.721.308z"/></svg>', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" enable-background="new 0 0 48 48" width="48" height="48" xmlns:v="https://vecta.io/nano"><path d="M12.139 48c-.105 0-.212-.017-.318-.052a1 1 0 0 1-.63-1.267c.1-.298.194-.578 23.256-22.845L11.419 1.721A1 1 0 1 1 12.805.279l23.776 22.835a1 1 0 0 1 .002 1.441L12.959 47.574c-.187.267-.495.426-.82.426z"/></svg>'],
            onInitialized: function(){
                dynamicAppHeight()
            }
            
        });
    }

    if (jQuery('.slideshow .owl-carousel').length) {
        jQuery('.slideshow .owl-carousel').owlCarousel({
            items: 1,
            loop: true,
            nav: false,
            navText: ['<i class="far fa-angle-left"></i>', '<i class="far fa-angle-right"></i>'],
            dots: true,
            autoplay: true,
            autoplayTimeout: 6000,
            autoplayHoverPause: true,
            autoplaySpeed: 1500,
            navSpeed: 1500,
            animateOut: 'fadeOut'
        });
    }

    if (jQuery('.logo-list .owl-carousel').length) {
        jQuery('.logo-list .owl-carousel').owlCarousel({
            loop: true,
            autoplay: true,
            autoplayTimeout: 3000,
            autoplayHoverPause: false,
            autoplaySpeed: 1500,
            stopOnHover: false,
            margin: 0,
            nav: false,
            navText: ['<i class="fas fa-chevron-left"></i>', '<i class="fas fa-chevron-right"></i>'],
            dots: false,
            responsive: {
                0: {
                    items: 1
                },
                480: {
                    items: 2
                },
                768: {
                    items: 3
                },
                1024: {
                    items: 5
                }
            }
        });
    }
    if (jQuery('#feefo-product-api-output .owl-carousel').length) {
        jQuery('#feefo-product-api-output .owl-carousel').owlCarousel({
            loop: false,
            autoplay: false,
            autoplayTimeout: 3000,
            autoplayHoverPause: false,
            autoplaySpeed: 1500,
            stopOnHover: false,
            margin: 14,
            nav: true,
            navText: ['<i class="icon-chevron-left"></i>', '<i class="icon-chevron-right"></i>'],
            dots: false,
            responsive: {
                0: {
                    items: 1
                },
                480: {
                    items: 2
                },
                768: {
                    items: 3
                }
            }
        });
    }
    jQuery('#toggleCMSNav').click(function (e) {
        e.preventDefault();
        jQuery(this).toggleClass('active').next().slideToggle(200);
    });

    jQuery("#shareOn a").on("click", function (e) {
        if (e) {
            e.preventDefault();
        }
        if (jQuery(this).hasClass('pin')) {
            // pinterest needs a larger popup:
            windowPopup(jQuery(this).attr("href"), 750, 552);
        } else {
            windowPopup(jQuery(this).attr("href"), 500, 300);
        }
    });


    jQuery("#orderFreeSample").on("click", function (e) {
        if (e) {
            e.preventDefault();
        }
        if(!(jQuery(this).hasClass('disabled'))) {

        var isOkToRequest = true;
        if(jQuery('.swatch-colours .grid').length>0) {
            if(jQuery('.swatch-colours .grid li.selected').length == 0) {
                isOkToRequest = false;
            }
        }
        $this = jQuery(this);
        jQuery.getJSON('/cart.js', function(cart) {
            let items = cart.items;
            let sampleVariantsAlreadyInCart = [];
            let numberOfSamplesInCart = 0;
            for(var i=0; i < items.length; i++){
                sampleVariantsAlreadyInCart.push(items[i].id);
                if(items[i].product_type == 'Sample') {
                    numberOfSamplesInCart = numberOfSamplesInCart + 1;
                }
            }
            if(sampleVariantsAlreadyInCart.indexOf(parseInt($this.attr('data-variant'))) !== -1) {
                // already got one of these in the cart:
                jQuery('#duplicateSampleError').show();
                jQuery('#max6SampleError').hide();
            }
            else if (numberOfSamplesInCart > 5) {
                jQuery('#max6SampleError').show();
            } else {
                if(!isOkToRequest) {
                    jQuery('#addASampleColourError').show();
                } else {
                    jQuery('#addASampleColourError').hide();
                    jQuery('#duplicateSampleError').hide();
                    jQuery('#max6SampleError').hide();
                    jQuery("#orderFreeSample").html('Adding');
                    jQuery.ajax({
                        type: 'POST',
                        url: '/cart/add.js',
                        data: {
                            quantity: 1,
                            id: $this.attr('data-variant')
                        },
                        dataType: 'json',
                        success: function () {
                            ajaxCart.load();
                            //jQuery('#orderFreeSample').hide();
                            document.getElementById('basketToggle').click();
                            jQuery('#freeSampleAddedMessage').show();
                            jQuery('#GoToCheckout').addClass('active');
    
                            jQuery("#orderFreeSample").html('Order FREE Sample');
                            // location.href = '/cart';
                        }
                    });
                }
            }
        });
        
    }
    });

    jQuery("#toggleFlooringCalculator").on("click", function (e) {
        if (e) {
            e.preventDefault();
        }
        jQuery('#lengthWidthCalculator').slideToggle(140);
    });


    if(location.search.indexOf("contact%5Btags%5D=newsletter") !== -1) {
        if(location.search.indexOf("form_type=customer") !== -1) {
            // show the newsletter:
            jQuery('.newsletter-popup').addClass('active');
        }
  }


  // jQuery(document).on('click', '.js-cart-continue', function() {
  //   var lastestItem = jQuery('.ajaxcart__product .item:first-child');
  //   if (lastestItem.length) {
  //     var url = jQuery('a', lastestItem).attr('href');
  //     location.href = url;
  //   } else {
  //     location.href = '/collections/all';
  //   }
  // });


});

jQuery(window).load(function() {
    // if(jQuery('#feefo-product-review-widgetId').length > 0) {
    // 	setTimeout(function(){
    // 		if(jQuery('feefowidget-container-main').length == 0) {
    // 			jQuery('#feefoProductWrapper').hide();
    // 		}
    // 	}, 1000);
    // }

    
    setTimeout(function(){
        //Helpscout Beacon
        !function(e,t,n){function a(){
            var e=t.getElementsByTagName("script")[0],n=t.createElement("script");
            n.type="text/javascript",n.async=!0,n.src="https://beacon-v2.helpscout.net",e.parentNode.insertBefore(n,e)
        }
            if(e.Beacon=n=function(t,n,a){e.Beacon.readyQueue.push({method:t,options:n,data:a})},n.readyQueue=[],"complete"===t.readyState)return a();e.attachEvent?e.attachEvent("onload",a):e.addEventListener("load",a,!1)}(window,document,window.Beacon||function(){});
        window.Beacon('init', '5e4c8c09-83f7-4526-a454-8d273ee73dbb')
    }, 3000);

    if (jQuery('.template-collection,.template-search')) {
        jQuery('.template-collection .product-grid,.template-search .product-grid').each(function () {
            // jQuery(this).find('.item .product-image-wrap').matchHeight();
            jQuery(this).find('.item .product-name').matchHeight();
            // jQuery(this).find('.item .product-caption').matchHeight();
        });
    }

    if (jQuery('.featured-collections .owl-carousel').length) {
        var $featuredCollection = $('.featured-collections .owl-carousel');
        $featuredCollection.owlCarousel({
            loop: true,
            autoplay: false,
            margin: 20,
            nav: true,
            navText: ['<i class="fas fa-chevron-left"></i>', '<i class="fas fa-chevron-right"></i>'],
            dots: false,
            responsive: {
                0: {
                    items: 1
                },
                768: {
                    items: 2
                },
                1152: {
                    8
                }
            },
            onInitialized: match_height,
            onResized: match_height
        });

        $featuredCollection.on('translated.owl.carousel',function(event){
            $(event.target).find(".owl-item.active .product-name").sameHeight();
        });

        function match_height(event) {
            var img_height = jQuery(event.target).find('.owl-item.active').first().find('.product-image-wrap').height();
            if(isIpadOS()){
                var img_height = jQuery(event.target).find('.owl-item.active').first().height();
            }
            
            

            $(event.currentTarget).find('.owl-item .product-name').removeAttr('style');
            $(event.currentTarget).find('.owl-item.active .product-name').sameHeight();


            var windowwidth = $(window).width();
            jQuery(event.currentTarget).find('.owl-prev,.owl-next').css('top', img_height / 2);
            
        }
    }
});

(function( $ ) {
    // the sameHeight functions makes all the selected elements of the same height
    $.fn.sameHeight = function() {
        var selector = this;
        var heights = [];
        // Save the heights of every element into an array
        selector.each(function(){
            var height = $(this).height();
            heights.push(height);
        });

        // Get the biggest height
        var maxHeight = Math.max.apply(null, heights);
        // Set the maxHeight to every selected element
        selector.each(function(){
            $(this).height(maxHeight);
        });
    };
}( jQuery ));

window.FeatherLightafterOpen = function () {
    // fix tabindex on forms within Feather Light
    // called with eg:
    // <a href="#" class="button button-primary" data-featherlight="#mc_embed_signup" data-featherlight-variant="joinUs" data-featherlight-after-open="FeatherLightafterOpen()">Join us</a>
    var count = 1;
    jQuery('body > .featherlight').find('input').each(function () {
        jQuery(this).attr('tabindex', count++);
    });
}

var juno = {};

var cutsTheMustard = false;
if ('querySelector' in document && 'localStorage' in window && 'addEventListener' in window) {
  cutsTheMustard = true;
  document.documentElement.className = "js";
}

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
        // root node
        break;
      }
    }
    while ((element = element.parentNode));
  }
  return false;
}

function is_touch_device() {
  return (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
}

const isIOS = () => {
  if (/iPad|iPhone|iPod/.test(navigator.platform)) {
    return true;
  } else {
    return navigator.maxTouchPoints &&
      navigator.maxTouchPoints > 2 &&
      /MacIntel/.test(navigator.platform);
  }
}

const isIpadOS = () => {
  return navigator.maxTouchPoints &&
    navigator.maxTouchPoints > 2 &&
    /MacIntel/.test(navigator.platform);
}

jQuery(document).ready(function() {
	jQuery('#navigation .nav-primary .parent').hover(function() {
        let $this = jQuery(this);
        window.mytimeout = setTimeout(function(e){
		    $this.addClass('active').find(".nav-drop").addClass('isOpen').parents('.nav-primary')
        }, 200);
	}, function() {
        clearTimeout(window.mytimeout);
		jQuery(this).removeClass('active').find(".nav-drop").delay(200).queue(function(next) {
            jQuery(this).removeClass('isOpen');
            next();
        });
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
    
    
    function navHeight(){
        const doc = document.documentElement;  
        const innerHeight = parseInt( doc.style.getPropertyValue('--app-inner-height') );
        jQuery('.level0.parent  > .nav-drop').each(function(){
            if(jQuery(this).outerHeight() >= innerHeight){
                jQuery(this).addClass('scroll');
            }else{
                jQuery(this).removeClass('scroll');
            }
            
        })
    }

    window.addEventListener('resize', navHeight);
    navHeight();

    
});

if (cutsTheMustard) {
    juno.navigationIsRevealed = false;
    juno.basketIsRevealed = false;
    juno.searchIsRevealed = false;
    juno.accountIsRevealed = false;
    juno.phoneIsRevealed = false;
    juno.filterIsRevealed = false;
    // toggle with the menu button:
    //Custom Close Button

    document.getElementById('menuToggle').addEventListener('click', function(e) {
        juno.checkToggleNavigation();
        if (e) {
            e.preventDefault();
        }
    }, false);

    document.getElementById('basketToggle').addEventListener('click', function(e) {
        juno.checkToggleBasket();
        if (e) {
            e.preventDefault();
        }
    }, false);

    jQuery(document).on('click', '#closeBasket', function(e) {
        juno.checkToggleBasket();
        if (e) {
            e.preventDefault();
        }
    });

    document.getElementById('searchToggle').addEventListener('click', function(e) {
    juno.checkToggleSearch();
        if (juno.basketIsRevealed) {
            // hide navigation:
            removeClass(document.documentElement, 'offCanvasBasket');
            juno.basketIsRevealed = false;
            e.preventDefault();
        }
        if (e) {
            e.preventDefault();
        }
    }, false);

    document.getElementById('accountToggle').addEventListener('click', function(e) {
        juno.checkToggleAccount();
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

    if(document.getElementById('filterToggle')){
        document.getElementById('filterToggle').addEventListener('click', function(e) {
            juno.checkToggleFilter();
            if (e) {
                e.preventDefault();
            }
        }, false);
    }

    juno.checkToggleNavigation = function() {
        if (juno.navigationIsRevealed) {
            removeClass(document.documentElement, 'offCanvas');
            juno.navigationIsRevealed = false;
        } else {
            addClass(document.documentElement, 'offCanvas');
            juno.navigationIsRevealed = true;
        }
    };
    juno.checkToggleBasket = function() {
        if (juno.basketIsRevealed) {
            removeClass(document.documentElement, 'offCanvasBasket');
            juno.basketIsRevealed = false;
        } else {
            addClass(document.documentElement, 'offCanvasBasket');
            juno.basketIsRevealed = true;
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
    juno.checkToggleAccount = function() {
        if (juno.accountIsRevealed) {
            removeClass(document.documentElement, 'offCanvasAccount');
            juno.accountIsRevealed = false;
        } else {
            addClass(document.documentElement, 'offCanvasAccount');
            juno.accountIsRevealed = true;
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

    juno.checkToggleFilter = function() {
        if (juno.filterIsRevealed) {
            removeClass(document.documentElement, 'offCanvasFilter');
            juno.filterIsRevealed = false;
        } else {
            addClass(document.documentElement, 'offCanvasFilter');
            juno.filterIsRevealed = true;
            $('html, body').animate({scrollTop: '0'}, 250);
        }
    };


    juno.checkCloseNavigation = function(e) {
        if (juno.navigationIsRevealed) {
            // check it's not the menu icon (or its children) itself as this will trigger independently (and would cause the event to be fired twice)
            if ((e.target.id != 'menuToggle') && (!hasParent(e.target, 'menuToggle'))) {
                // check the click isn't within the nav panel:
                if (!hasParent(e.target, 'navigation')) {
                    removeClass(document.documentElement, 'offCanvas');
                    juno.navigationIsRevealed = false;
                    e.preventDefault();
                }
            }
        }
    };
    juno.checkCloseBasket = function(e) {
        if (juno.basketIsRevealed) {
            // check it's not the menu icon itself as this will trigger independently (and would cause the event to be fired twice)
            if ((e.target.id != 'basketToggle') && (!hasParent(e.target, 'basketToggle'))) {
                // check the click isn't within the nav panel:
                if (!hasParent(e.target, 'cart-container')) {
                    // hide navigation:
                    removeClass(document.documentElement, 'offCanvasBasket');
                    juno.basketIsRevealed = false;
                    e.preventDefault();
                }
            }
        }
    };
    juno.checkCloseSearch = function(e) {
        if (juno.searchIsRevealed) {
            // check it's not the menu icon itself as this will trigger independently (and would cause the event to be fired twice)
            if ((e.target.id != 'searchToggle') && (!hasParent(e.target, 'searchToggle'))) {
                // check the click isn't within the nav panel:
                if (!hasParent(e.target, 'search-container')) {
                    // hide navigation:
                    //removeClass(document.documentElement, 'offCanvasSearch');
                    juno.searchIsRevealed = false;
                    e.preventDefault();
                }
            }
        }
    };
    juno.checkCloseAccount = function(e) {
        if (juno.accountIsRevealed) {
            // check it's not the menu icon itself as this will trigger independently (and would cause the event to be fired twice)
            if ((e.target.id != 'accountToggle') && (!hasParent(e.target, 'accountToggle'))) {
                // check the click isn't within the nav panel:
                if (!hasParent(e.target, 'account-container')) {
                    // hide navigation:
                    removeClass(document.documentElement, 'offCanvasAccount');
                    juno.accountIsRevealed = false;
                    e.preventDefault();
                }
            }
        }
    };
    juno.checkClosePhone = function(e) {
        if (juno.phoneIsRevealed) {
            // check it's not the menu icon itself as this will trigger independently (and would cause the event to be fired twice)
            if ((e.target.id != 'phoneToggle') && (!hasParent(e.target, 'phoneToggle'))) {
                // check the click isn't within the nav panel:
                if (!hasParent(e.target, 'phone-container')) {
                    // hide navigation:
                    removeClass(document.documentElement, 'offCanvasPhone');
                    juno.phoneIsRevealed = false;
                    e.preventDefault();
                }
            }
        }
    };
    juno.checkCloseFilter = function(e) {
        if (juno.filterIsRevealed) {
            // check it's not the menu icon itself as this will trigger independently (and would cause the event to be fired twice)
            if ((e.target.id != 'filterToggle') && (!hasParent(e.target, 'filterToggle'))) {
                // check the click isn't within the nav panel:
                if ((!hasParent(e.target, 'collection-filters') && !hasParent(e.target, 'kuFilters'))) {
                    // hide navigation:
                    removeClass(document.documentElement, 'offCanvasFilter');
                    juno.filterIsRevealed = false;
                    e.preventDefault();
                }
            }
        }
    };



    // close by touching the visible part of the content:
    document.addEventListener('click', function(e) {
        juno.checkCloseNavigation(e);
        juno.checkCloseBasket(e);
        juno.checkCloseSearch(e);
        juno.checkCloseAccount(e);
        juno.checkClosePhone(e);
        juno.checkCloseFilter(e);
    }, true);
    // double up for mobile event:
    document.addEventListener('touchend', function(e) {
        juno.checkCloseNavigation(e);
        juno.checkCloseBasket(e);
        juno.checkCloseSearch(e);
        juno.checkCloseAccount(e);
        juno.checkClosePhone(e);
        juno.checkCloseFilter(e);
    });

    juno.swipeLeft = function() {
        if (juno.navigationIsRevealed) {
            removeClass(document.documentElement, 'offCanvas');
            juno.navigationIsRevealed = false;
        }
        if (juno.filterIsRevealed) {
            removeClass(document.documentElement, 'offCanvasFilter');
            juno.filterIsRevealed = false;
        }
    };
    juno.swipeRight = function() {
        if (juno.basketIsRevealed) {
            removeClass(document.documentElement, 'offCanvasBasket');
            juno.basketIsRevealed = false;
        }
        if (juno.accountIsRevealed) {
            removeClass(document.documentElement, 'offCanvasAccount');
            juno.accountIsRevealed = false;
        }
        if (juno.phoneIsRevealed) {
            removeClass(document.documentElement, 'offCanvasPhone');
            juno.phoneIsRevealed = false;
        }
    };
    // init touch:
    if ('ontouchstart' in document.documentElement) {
        document.body.addEventListener('touchstart', function(a) {
            startPointX = a.touches[0].pageX;
            startPointY = a.touches[0].pageY;
            isScrolling = '';
            deltaX = 0;
        }, false);
        document.body.addEventListener('touchmove', function(a) {
            if (a.touches.length > 1 || a.scale && a.scale !== 1) {
                return;
            }
            deltaX = a.touches[0].pageX - startPointX;
            if (isScrolling === '') {
                isScrolling = (isScrolling || Math.abs(deltaX) < Math.abs(a.touches[0].pageY - startPointY));
            }
            if (!isScrolling) {
                a.preventDefault();
            }
        }, false);
        document.body.addEventListener('touchend', function(a) {
            if (!isScrolling) {
                if ((Math.abs(deltaX)) > 100) {
                    if (deltaX < 0) {
                        juno.swipeLeft();
                    } else {
                        juno.swipeRight();
                    }
                }
            }
        }, false);
    }
}

// Generated by CoffeeScript 1.9.2
/**
@license Sticky-kit v1.1.2 | WTFPL | Leaf Corcoran 2015 | http://leafo.net
 */
(function() {
  var $, win;
  $ = this.jQuery || window.jQuery;
  win = $(window);
  $.fn.stick_in_parent = function(opts) {
    var doc, elm, enable_bottoming, fn, i, inner_scrolling, len, manual_spacer, offset_top, outer_width, parent_selector, recalc_every, sticky_class;
    if (opts == null) {
      opts = {};
    }
    sticky_class = opts.sticky_class, inner_scrolling = opts.inner_scrolling, recalc_every = opts.recalc_every, parent_selector = opts.parent, offset_top = opts.offset_top, manual_spacer = opts.spacer, enable_bottoming = opts.bottoming;
    if (offset_top == null) {
      offset_top = 0;
    }
    if (parent_selector == null) {
      parent_selector = void 0;
    }
    if (inner_scrolling == null) {
      inner_scrolling = true;
    }
    if (sticky_class == null) {
      sticky_class = "is_stuck";
    }
    doc = $(document);
    if (enable_bottoming == null) {
      enable_bottoming = true;
    }
    outer_width = function(el) {
      var _el, computed, w;
      if (window.getComputedStyle) {
        _el = el[0];
        computed = window.getComputedStyle(el[0]);
        w = parseFloat(computed.getPropertyValue("width")) + parseFloat(computed.getPropertyValue("margin-left")) + parseFloat(computed.getPropertyValue("margin-right"));
        if (computed.getPropertyValue("box-sizing") !== "border-box") {
          w += parseFloat(computed.getPropertyValue("border-left-width")) + parseFloat(computed.getPropertyValue("border-right-width")) + parseFloat(computed.getPropertyValue("padding-left")) + parseFloat(computed.getPropertyValue("padding-right"));
        }
        return w;
      } else {
        return el.outerWidth(true);
      }
    };
    fn = function(elm, padding_bottom, parent_top, parent_height, top, height, el_float, detached) {
      var bottomed, detach, fixed, last_pos, last_scroll_height, offset, parent, recalc, recalc_and_tick, recalc_counter, spacer, tick;
      if (elm.data("sticky_kit")) {
        return;
      }
      elm.data("sticky_kit", true);
      last_scroll_height = doc.height();
      parent = elm.parent();
      if (parent_selector != null) {
        parent = parent.closest(parent_selector);
      }
      if (!parent.length) {
        throw "failed to find stick parent";
      }
      fixed = false;
      bottomed = false;
      spacer = manual_spacer != null ? manual_spacer && elm.closest(manual_spacer) : $("<div />");
      if (spacer) {
        spacer.css('position', elm.css('position'));
      }
      recalc = function() {
        var border_top, padding_top, restore;
        if (detached) {
          return;
        }
        last_scroll_height = doc.height();
        border_top = parseInt(parent.css("border-top-width"), 10);
        padding_top = parseInt(parent.css("padding-top"), 10);
        padding_bottom = parseInt(parent.css("padding-bottom"), 10);
        parent_top = parent.offset().top + border_top + padding_top;
        parent_height = parent.height();
        if (fixed) {
          fixed = false;
          bottomed = false;
          if (manual_spacer == null) {
            elm.insertAfter(spacer);
            spacer.detach();
          }
          elm.css({
            position: "",
            top: "",
            width: "",
            bottom: ""
          }).removeClass(sticky_class);
          restore = true;
        }
        top = elm.offset().top - (parseInt(elm.css("margin-top"), 10) || 0) - offset_top;
        height = elm.outerHeight(true);
        el_float = elm.css("float");
        if (spacer) {
          spacer.css({
            width: outer_width(elm),
            height: height,
            display: elm.css("display"),
            "vertical-align": elm.css("vertical-align"),
            "float": el_float
          });
        }
        if (restore) {
          return tick();
        }
      };
      recalc();
      if (height === parent_height) {
        return;
      }
      last_pos = void 0;
      offset = offset_top;
      recalc_counter = recalc_every;
      tick = function() {
        var css, delta, recalced, scroll, will_bottom, win_height;
        if (detached) {
          return;
        }
        recalced = false;
        if (recalc_counter != null) {
          recalc_counter -= 1;
          if (recalc_counter <= 0) {
            recalc_counter = recalc_every;
            recalc();
            recalced = true;
          }
        }
        if (!recalced && doc.height() !== last_scroll_height) {
          recalc();
          recalced = true;
        }
        scroll = win.scrollTop();
        if (last_pos != null) {
          delta = scroll - last_pos;
        }
        last_pos = scroll;
        if (fixed) {
          if (enable_bottoming) {
            will_bottom = scroll + height + offset > parent_height + parent_top;
            if (bottomed && !will_bottom) {
              bottomed = false;
              elm.css({
                position: "fixed",
                bottom: "",
                top: offset
              }).trigger("sticky_kit:unbottom");
            }
          }
          if (scroll < top) {
            fixed = false;
            offset = offset_top;
            if (manual_spacer == null) {
              if (el_float === "left" || el_float === "right") {
                elm.insertAfter(spacer);
              }
              spacer.detach();
            }
            css = {
              position: "",
              width: "",
              top: "",
              // JHR addition ######################
              padding: ""
              // end JHR addition ##################
            };
            elm.css(css).removeClass(sticky_class).trigger("sticky_kit:unstick");
          }
          if (inner_scrolling) {
            win_height = win.height();
            if (height + offset_top > win_height) {
              if (!bottomed) {
                offset -= delta;
                offset = Math.max(win_height - height, offset);
                offset = Math.min(offset_top, offset);
                if (fixed) {
                  elm.css({
                    top: offset + "px"
                  });
                }
              }
            }
          }
        } else {
          if (scroll > top) {
            fixed = true;
            css = {
              position: "fixed",
              top: offset
            };
            css.width = elm.css("box-sizing") === "border-box" ? elm.outerWidth() + "px" : elm.width() + "px";
            // JHR addition ######################
            // in case padding is a percentage that will be altered by the addition of the parent element, convert padding to px while in this state
            elm.css("padding-left",(parseInt(elm.css("padding-left"), 10)));
            elm.css("padding-right",(parseInt(elm.css("padding-right"), 10)));
            // end JHR addition ##################
            elm.css(css).addClass(sticky_class);
            if (manual_spacer == null) {
              elm.after(spacer);
              if (el_float === "left" || el_float === "right") {
                spacer.append(elm);
              }
            }
            elm.trigger("sticky_kit:stick");
          }
        }
        if (fixed && enable_bottoming) {
          if (will_bottom == null) {
            will_bottom = scroll + height + offset > parent_height + parent_top;
          }
          if (!bottomed && will_bottom) {
            bottomed = true;
            if (parent.css("position") === "static") {
              parent.css({
                position: "relative"
              });
            }
            return elm.css({
              position: "absolute",
              bottom: padding_bottom,
              top: "auto"
            }).trigger("sticky_kit:bottom");
          }
        }
      };
      recalc_and_tick = function() {
        recalc();
        return tick();
      };
      detach = function() {
        detached = true;
        win.off("touchmove", tick);
        win.off("scroll", tick);
        win.off("resize", recalc_and_tick);
        $(document.body).off("sticky_kit:recalc", recalc_and_tick);
        elm.off("sticky_kit:detach", detach);
        elm.removeData("sticky_kit");
        elm.css({
          position: "",
          bottom: "",
          top: "",
          width: ""
        });
        parent.position("position", "");
        if (fixed) {
          if (manual_spacer == null) {
            if (el_float === "left" || el_float === "right") {
              elm.insertAfter(spacer);
            }
            spacer.remove();
          }
          return elm.removeClass(sticky_class);
        }
      };
      win.on("touchmove", tick);
      win.on("scroll", tick);
      win.on("resize", recalc_and_tick);
      $(document.body).on("sticky_kit:recalc", recalc_and_tick);
      elm.on("sticky_kit:detach", detach);
      return setTimeout(tick, 0);
    };
    for (i = 0, len = this.length; i < len; i++) {
      elm = this[i];
      fn($(elm));
    }
    return this;
  };
}).call(this);

/**
 * Featherlight - ultra slim jQuery lightbox
 * Version 1.7.9 - http://noelboss.github.io/featherlight/
 *
 * Copyright 2017, Noël Raoul Bossart (http://www.noelboss.com)
 * MIT Licensed.
**/
(function($) {
	"use strict";

	if('undefined' === typeof $) {
		if('console' in window){ window.console.info('Too much lightness, Featherlight needs jQuery.'); }
		return;
	}

	/* Featherlight is exported as $.featherlight.
	   It is a function used to open a featherlight lightbox.

	   [tech]
	   Featherlight uses prototype inheritance.
	   Each opened lightbox will have a corresponding object.
	   That object may have some attributes that override the
	   prototype's.
	   Extensions created with Featherlight.extend will have their
	   own prototype that inherits from Featherlight's prototype,
	   thus attributes can be overriden either at the object level,
	   or at the extension level.
	   To create callbacks that chain themselves instead of overriding,
	   use chainCallbacks.
	   For those familiar with CoffeeScript, this correspond to
	   Featherlight being a class and the Gallery being a class
	   extending Featherlight.
	   The chainCallbacks is used since we don't have access to
	   CoffeeScript's `super`.
	*/

	function Featherlight($content, config) {
		if(this instanceof Featherlight) {  /* called with new */
			this.id = Featherlight.id++;
			this.setup($content, config);
			this.chainCallbacks(Featherlight._callbackChain);
		} else {
			var fl = new Featherlight($content, config);
			fl.open();
			return fl;
		}
	}

	var opened = [],
		pruneOpened = function(remove) {
			opened = $.grep(opened, function(fl) {
				return fl !== remove && fl.$instance.closest('body').length > 0;
			} );
			return opened;
		};

	// Removes keys of `set` from `obj` and returns the removed key/values.
	function slice(obj, set) {
		var r = {};
		for (var key in obj) {
			if (key in set) {
				r[key] = obj[key];
				delete obj[key];
			}
		}
		return r;
	}

	// NOTE: List of available [iframe attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe).
	var iFrameAttributeSet = {
		allowfullscreen: 1, frameborder: 1, height: 1, longdesc: 1, marginheight: 1, marginwidth: 1,
		name: 1, referrerpolicy: 1, scrolling: 1, sandbox: 1, src: 1, srcdoc: 1, width: 1
	};

	// Converts camelCased attributes to dasherized versions for given prefix:
	//   parseAttrs({hello: 1, hellFrozeOver: 2}, 'hell') => {froze-over: 2}
	function parseAttrs(obj, prefix) {
		var attrs = {},
			regex = new RegExp('^' + prefix + '([A-Z])(.*)');
		for (var key in obj) {
			var match = key.match(regex);
			if (match) {
				var dasherized = (match[1] + match[2].replace(/([A-Z])/g, '-$1')).toLowerCase();
				attrs[dasherized] = obj[key];
			}
		}
		return attrs;
	}

	/* document wide key handler */
	var eventMap = { keyup: 'onKeyUp', resize: 'onResize' };

	var globalEventHandler = function(event) {
		$.each(Featherlight.opened().reverse(), function() {
			if (!event.isDefaultPrevented()) {
				if (false === this[eventMap[event.type]](event)) {
					event.preventDefault(); event.stopPropagation(); return false;
			  }
			}
		});
	};

	var toggleGlobalEvents = function(set) {
			if(set !== Featherlight._globalHandlerInstalled) {
				Featherlight._globalHandlerInstalled = set;
				var events = $.map(eventMap, function(_, name) { return name+'.'+Featherlight.prototype.namespace; } ).join(' ');
				$(window)[set ? 'on' : 'off'](events, globalEventHandler);
			}
		};

	Featherlight.prototype = {
		constructor: Featherlight,
		/*** defaults ***/
		/* extend featherlight with defaults and methods */
		namespace:      'featherlight',        /* Name of the events and css class prefix */
		targetAttr:     'data-featherlight',   /* Attribute of the triggered element that contains the selector to the lightbox content */
		variant:        null,                  /* Class that will be added to change look of the lightbox */
		resetCss:       false,                 /* Reset all css */
		background:     null,                  /* Custom DOM for the background, wrapper and the closebutton */
		openTrigger:    'click',               /* Event that triggers the lightbox */
		closeTrigger:   'click',               /* Event that triggers the closing of the lightbox */
		filter:         null,                  /* Selector to filter events. Think $(...).on('click', filter, eventHandler) */
		root:           'body',                /* Where to append featherlights */
		openSpeed:      250,                   /* Duration of opening animation */
		closeSpeed:     250,                   /* Duration of closing animation */
		closeOnClick:   'background',          /* Close lightbox on click ('background', 'anywhere' or false) */
		closeOnEsc:     true,                  /* Close lightbox when pressing esc */
		closeIcon:      '',            				 /* Close icon */
		loading:        '',                    /* Content to show while initial content is loading */
		persist:        false,                 /* If set, the content will persist and will be shown again when opened again. 'shared' is a special value when binding multiple elements for them to share the same content */
		otherClose:     null,                  /* Selector for alternate close buttons (e.g. "a.close") */
		beforeOpen:     $.noop,                /* Called before open. can return false to prevent opening of lightbox. Gets event as parameter, this contains all data */
		beforeContent:  $.noop,                /* Called when content is loaded. Gets event as parameter, this contains all data */
		beforeClose:    $.noop,                /* Called before close. can return false to prevent opening of lightbox. Gets event as parameter, this contains all data */
		afterOpen:      $.noop,                /* Called after open. Gets event as parameter, this contains all data */
		afterContent:   $.noop,                /* Called after content is ready and has been set. Gets event as parameter, this contains all data */
		afterClose:     $.noop,                /* Called after close. Gets event as parameter, this contains all data */
		onKeyUp:        $.noop,                /* Called on key up for the frontmost featherlight */
		onResize:       $.noop,                /* Called after new content and when a window is resized */
		type:           null,                  /* Specify type of lightbox. If unset, it will check for the targetAttrs value. */
		contentFilters: ['jquery', 'image', 'html', 'ajax', 'iframe', 'text'], /* List of content filters to use to determine the content */

		/*** methods ***/
		/* setup iterates over a single instance of featherlight and prepares the background and binds the events */
		setup: function(target, config){
			/* all arguments are optional */
			if (typeof target === 'object' && target instanceof $ === false && !config) {
				config = target;
				target = undefined;
			}

			var self = $.extend(this, config, {target: target}),
				css = !self.resetCss ? self.namespace : self.namespace+'-reset', /* by adding -reset to the classname, we reset all the default css */
				$background = $(self.background || [
					'<div class="'+css+'-loading '+css+'">',
						'<div class="'+css+'-content">',
							'<button class="'+css+'-close-icon '+ self.namespace + '-close" aria-label="Close">',
								self.closeIcon,
							'</button>',
							'<div class="'+self.namespace+'-inner">' + self.loading + '</div>',
						'</div>',
					'</div>'].join('')),
				closeButtonSelector = '.'+self.namespace+'-close' + (self.otherClose ? ',' + self.otherClose : '');

			self.$instance = $background.clone().addClass(self.variant); /* clone DOM for the background, wrapper and the close button */

			/* close when click on background/anywhere/null or closebox */
			self.$instance.on(self.closeTrigger+'.'+self.namespace, function(event) {
				var $target = $(event.target);
				if( ('background' === self.closeOnClick  && $target.is('.'+self.namespace))
					|| 'anywhere' === self.closeOnClick
					|| $target.closest(closeButtonSelector).length ){
					self.close(event);
					event.preventDefault();
				}
			});

			return this;
		},

		/* this method prepares the content and converts it into a jQuery object or a promise */
		getContent: function(){
			if(this.persist !== false && this.$content) {
				return this.$content;
			}
			var self = this,
				filters = this.constructor.contentFilters,
				readTargetAttr = function(name){ return self.$currentTarget && self.$currentTarget.attr(name); },
				targetValue = readTargetAttr(self.targetAttr),
				data = self.target || targetValue || '';

			/* Find which filter applies */
			var filter = filters[self.type]; /* check explicit type like {type: 'image'} */

			/* check explicit type like data-featherlight="image" */
			if(!filter && data in filters) {
				filter = filters[data];
				data = self.target && targetValue;
			}
			data = data || readTargetAttr('href') || '';

			/* check explicity type & content like {image: 'photo.jpg'} */
			if(!filter) {
				for(var filterName in filters) {
					if(self[filterName]) {
						filter = filters[filterName];
						data = self[filterName];
					}
				}
			}

			/* otherwise it's implicit, run checks */
			if(!filter) {
				var target = data;
				data = null;
				$.each(self.contentFilters, function() {
					filter = filters[this];
					if(filter.test)  {
						data = filter.test(target);
					}
					if(!data && filter.regex && target.match && target.match(filter.regex)) {
						data = target;
					}
					return !data;
				});
				if(!data) {
					if('console' in window){ window.console.error('Featherlight: no content filter found ' + (target ? ' for "' + target + '"' : ' (no target specified)')); }
					return false;
				}
			}
			/* Process it */
			return filter.process.call(self, data);
		},

		/* sets the content of $instance to $content */
		setContent: function($content){
			var self = this;
			/* we need a special class for the iframe */
			if($content.is('iframe')) {
				self.$instance.addClass(self.namespace+'-iframe');
			}

			self.$instance.removeClass(self.namespace+'-loading');

			/* replace content by appending to existing one before it is removed
			   this insures that featherlight-inner remain at the same relative
				 position to any other items added to featherlight-content */
			self.$instance.find('.'+self.namespace+'-inner')
				.not($content)                /* excluded new content, important if persisted */
				.slice(1).remove().end()      /* In the unexpected event where there are many inner elements, remove all but the first one */
				.replaceWith($.contains(self.$instance[0], $content[0]) ? '' : $content);

			self.$content = $content.addClass(self.namespace+'-inner');

			return self;
		},

		/* opens the lightbox. "this" contains $instance with the lightbox, and with the config.
			Returns a promise that is resolved after is successfully opened. */
		open: function(event){
			var self = this;
			self.$instance.hide().appendTo(self.root);
			if((!event || !event.isDefaultPrevented())
				&& self.beforeOpen(event) !== false) {

				if(event){
					event.preventDefault();
				}
				var $content = self.getContent();

				if($content) {
					opened.push(self);

					toggleGlobalEvents(true);

					self.$instance.fadeIn(self.openSpeed);
					self.beforeContent(event);

					/* Set content and show */
					return $.when($content)
						.always(function($content){
							self.setContent($content);
							self.afterContent(event);
						})
						.then(self.$instance.promise())
						/* Call afterOpen after fadeIn is done */
						.done(function(){ self.afterOpen(event); });
				}
			}
			self.$instance.detach();
			return $.Deferred().reject().promise();
		},

		/* closes the lightbox. "this" contains $instance with the lightbox, and with the config
			returns a promise, resolved after the lightbox is successfully closed. */
		close: function(event){
			var self = this,
				deferred = $.Deferred();

			if(self.beforeClose(event) === false) {
				deferred.reject();
			} else {

				if (0 === pruneOpened(self).length) {
					toggleGlobalEvents(false);
				}

				self.$instance.fadeOut(self.closeSpeed,function(){
					self.$instance.detach();
					self.afterClose(event);
					deferred.resolve();
				});
			}
			return deferred.promise();
		},

		/* resizes the content so it fits in visible area and keeps the same aspect ratio.
				Does nothing if either the width or the height is not specified.
				Called automatically on window resize.
				Override if you want different behavior. */
		resize: function(w, h) {
			if (w && h) {
				/* Reset apparent image size first so container grows */
				this.$content.css('width', '').css('height', '');
				/* Calculate the worst ratio so that dimensions fit */
				 /* Note: -1 to avoid rounding errors */
				var ratio = Math.max(
					w  / (this.$content.parent().width()-1),
					h / (this.$content.parent().height()-1));
				/* Resize content */
				if (ratio > 1) {
					ratio = h / Math.floor(h / ratio); /* Round ratio down so height calc works */
					this.$content.css('width', '' + w / ratio + 'px').css('height', '' + h / ratio + 'px');
				}
			}
		},

		/* Utility function to chain callbacks
		   [Warning: guru-level]
		   Used be extensions that want to let users specify callbacks but
		   also need themselves to use the callbacks.
		   The argument 'chain' has callback names as keys and function(super, event)
		   as values. That function is meant to call `super` at some point.
		*/
		chainCallbacks: function(chain) {
			for (var name in chain) {
				this[name] = $.proxy(chain[name], this, $.proxy(this[name], this));
			}
		}
	};

	$.extend(Featherlight, {
		id: 0,                                    /* Used to id single featherlight instances */
		autoBind:       '[data-featherlight]',    /* Will automatically bind elements matching this selector. Clear or set before onReady */
		defaults:       Featherlight.prototype,   /* You can access and override all defaults using $.featherlight.defaults, which is just a synonym for $.featherlight.prototype */
		/* Contains the logic to determine content */
		contentFilters: {
			jquery: {
				regex: /^[#.]\w/,         /* Anything that starts with a class name or identifiers */
				test: function(elem)    { return elem instanceof $ && elem; },
				process: function(elem) { return this.persist !== false ? $(elem) : $(elem).clone(true); }
			},
			image: {
				regex: /\.(png|jpg|jpeg|gif|tiff|bmp|svg)(\?\S*)?$/i,
				process: function(url)  {
					var self = this,
						deferred = $.Deferred(),
						img = new Image(),
						$img = $('<img src="'+url+'" alt="" class="'+self.namespace+'-image" />');
					img.onload  = function() {
						/* Store naturalWidth & height for IE8 */
						$img.naturalWidth = img.width; $img.naturalHeight = img.height;
						deferred.resolve( $img );
					};
					img.onerror = function() { deferred.reject($img); };
					img.src = url;
					return deferred.promise();
				}
			},
			html: {
				regex: /^\s*<[\w!][^<]*>/, /* Anything that starts with some kind of valid tag */
				process: function(html) { return $(html); }
			},
			ajax: {
				regex: /./,            /* At this point, any content is assumed to be an URL */
				process: function(url)  {
					var self = this,
						deferred = $.Deferred();
					/* we are using load so one can specify a target with: url.html #targetelement */
					var $container = $('<div></div>').load(url, function(response, status){
						if ( status !== "error" ) {
							deferred.resolve($container.contents());
						}
						deferred.fail();
					});
					return deferred.promise();
				}
			},
			iframe: {
				process: function(url) {
					var deferred = new $.Deferred();
					var $content = $('<iframe/>');
					var css = parseAttrs(this, 'iframe');
					var attrs = slice(css, iFrameAttributeSet);
					$content.hide()
						.attr('src', url)
						.attr(attrs)
						.css(css)
						.on('load', function() { deferred.resolve($content.show()); })
						// We can't move an <iframe> and avoid reloading it,
						// so let's put it in place ourselves right now:
						.appendTo(this.$instance.find('.' + this.namespace + '-content'));
					return deferred.promise();
				}
			},
			text: {
				process: function(text) { return $('<div>', {text: text}); }
			}
		},

		functionAttributes: ['beforeOpen', 'afterOpen', 'beforeContent', 'afterContent', 'beforeClose', 'afterClose'],

		/*** class methods ***/
		/* read element's attributes starting with data-featherlight- */
		readElementConfig: function(element, namespace) {
			var Klass = this,
				regexp = new RegExp('^data-' + namespace + '-(.*)'),
				config = {};
			if (element && element.attributes) {
				$.each(element.attributes, function(){
					var match = this.name.match(regexp);
					if (match) {
						var val = this.value,
							name = $.camelCase(match[1]);
						if ($.inArray(name, Klass.functionAttributes) >= 0) {  /* jshint -W054 */
							val = new Function(val);                           /* jshint +W054 */
						} else {
							try { val = JSON.parse(val); }
							catch(e) {}
						}
						config[name] = val;
					}
				});
			}
			return config;
		},

		/* Used to create a Featherlight extension
		   [Warning: guru-level]
		   Creates the extension's prototype that in turn
		   inherits Featherlight's prototype.
		   Could be used to extend an extension too...
		   This is pretty high level wizardy, it comes pretty much straight
		   from CoffeeScript and won't teach you anything about Featherlight
		   as it's not really specific to this library.
		   My suggestion: move along and keep your sanity.
		*/
		extend: function(child, defaults) {
			/* Setup class hierarchy, adapted from CoffeeScript */
			var Ctor = function(){ this.constructor = child; };
			Ctor.prototype = this.prototype;
			child.prototype = new Ctor();
			child.__super__ = this.prototype;
			/* Copy class methods & attributes */
			$.extend(child, this, defaults);
			child.defaults = child.prototype;
			return child;
		},

		attach: function($source, $content, config) {
			var Klass = this;
			if (typeof $content === 'object' && $content instanceof $ === false && !config) {
				config = $content;
				$content = undefined;
			}
			/* make a copy */
			config = $.extend({}, config);

			/* Only for openTrigger and namespace... */
			var namespace = config.namespace || Klass.defaults.namespace,
				tempConfig = $.extend({}, Klass.defaults, Klass.readElementConfig($source[0], namespace), config),
				sharedPersist;
			var handler = function(event) {
				var $target = $(event.currentTarget);
				/* ... since we might as well compute the config on the actual target */
				var elemConfig = $.extend(
					{$source: $source, $currentTarget: $target},
					Klass.readElementConfig($source[0], tempConfig.namespace),
					Klass.readElementConfig(event.currentTarget, tempConfig.namespace),
					config);
				var fl = sharedPersist || $target.data('featherlight-persisted') || new Klass($content, elemConfig);
				if(fl.persist === 'shared') {
					sharedPersist = fl;
				} else if(fl.persist !== false) {
					$target.data('featherlight-persisted', fl);
				}
				if (elemConfig.$currentTarget.blur) {
					elemConfig.$currentTarget.blur(); // Otherwise 'enter' key might trigger the dialog again
				}
				fl.open(event);
			};

			$source.on(tempConfig.openTrigger+'.'+tempConfig.namespace, tempConfig.filter, handler);

			return handler;
		},

		current: function() {
			var all = this.opened();
			return all[all.length - 1] || null;
		},

		opened: function() {
			var klass = this;
			pruneOpened();
			return $.grep(opened, function(fl) { return fl instanceof klass; } );
		},

		close: function(event) {
			var cur = this.current();
			if(cur) { return cur.close(event); }
		},

		/* Does the auto binding on startup.
		   Meant only to be used by Featherlight and its extensions
		*/
		_onReady: function() {
			var Klass = this;
			if(Klass.autoBind){
				/* Bind existing elements */
				$(Klass.autoBind).each(function(){
					Klass.attach($(this));
				});
				/* If a click propagates to the document level, then we have an item that was added later on */
				$(document).on('click', Klass.autoBind, function(evt) {
					if (evt.isDefaultPrevented()) {
						return;
					}
					/* Bind featherlight */
					var handler = Klass.attach($(evt.currentTarget));
					/* Dispatch event directly */
					handler(evt);
				});
			}
		},

		/* Featherlight uses the onKeyUp callback to intercept the escape key.
		   Private to Featherlight.
		*/
		_callbackChain: {
			onKeyUp: function(_super, event){
				if(27 === event.keyCode) {
					if (this.closeOnEsc) {
						$.featherlight.close(event);
					}
					return false;
				} else {
					return _super(event);
				}
			},

			beforeOpen: function(_super, event) {
				// Used to disable scrolling
				$(document.documentElement).addClass('with-featherlight');

				// Remember focus:
				this._previouslyActive = document.activeElement;

				// Disable tabbing:
				// See http://stackoverflow.com/questions/1599660/which-html-elements-can-receive-focus
				this._$previouslyTabbable = $("a, input, select, textarea, iframe, button, iframe, [contentEditable=true]")
					.not('[tabindex]')
					.not(this.$instance.find('button'));

				this._$previouslyWithTabIndex = $('[tabindex]').not('[tabindex="-1"]');
				this._previousWithTabIndices = this._$previouslyWithTabIndex.map(function(_i, elem) {
					return $(elem).attr('tabindex');
				});

				this._$previouslyWithTabIndex.add(this._$previouslyTabbable).attr('tabindex', -1);

				if (document.activeElement.blur) {
					document.activeElement.blur();
				}
				return _super(event);
			},

			afterClose: function(_super, event) {
				var r = _super(event);
				// Restore focus
				var self = this;
				this._$previouslyTabbable.removeAttr('tabindex');
				this._$previouslyWithTabIndex.each(function(i, elem) {
					$(elem).attr('tabindex', self._previousWithTabIndices[i]);
				});
				this._previouslyActive.focus();
				// Restore scroll
				if(Featherlight.opened().length === 0) {
					$(document.documentElement).removeClass('with-featherlight');
				}
				return r;
			},

			onResize: function(_super, event){
				this.resize(this.$content.naturalWidth, this.$content.naturalHeight);
				return _super(event);
			},

			afterContent: function(_super, event){
				var r = _super(event);
				this.$instance.find('[autofocus]:not([disabled])').focus();
				this.onResize(event);
				return r;
			}
		}
	});

	$.featherlight = Featherlight;

	/* bind jQuery elements to trigger featherlight */
	$.fn.featherlight = function($content, config) {
		Featherlight.attach(this, $content, config);
		return this;
	};

	/* bind featherlight on ready if config autoBind is set */
	$(document).ready(function(){ Featherlight._onReady(); });
}(jQuery));

/**
 * Featherlight Gallery – an extension for the ultra slim jQuery lightbox
 * Version 1.7.9 - http://noelboss.github.io/featherlight/
 *
 * Copyright 2017, Noël Raoul Bossart (http://www.noelboss.com)
 * MIT Licensed.
**/
(function($) {
  "use strict";

  var warn = function(m) {
    if(window.console && window.console.warn) {
      window.console.warn('FeatherlightGallery: ' + m);
    }
  };

  if('undefined' === typeof $) {
    return warn('Too much lightness, Featherlight needs jQuery.');
  } else if(!$.featherlight) {
    return warn('Load the featherlight plugin before the gallery plugin');
  }

  var isTouchAware = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
    jQueryConstructor = $.event && $.event.special.swipeleft && $,
    hammerConstructor = window.Hammer && function($el){
      var mc = new window.Hammer.Manager($el[0]);
      mc.add(new window.Hammer.Swipe());
      return mc;
    },
    swipeAwareConstructor = isTouchAware && (jQueryConstructor || hammerConstructor);
  if(isTouchAware && !swipeAwareConstructor) {
    warn('No compatible swipe library detected; one must be included before featherlightGallery for swipe motions to navigate the galleries.');
  }

  var callbackChain = {
      afterClose: function(_super, event) {
          var self = this;
          self.$instance.off('next.'+self.namespace+' previous.'+self.namespace);
          if (self._swiper) {
            self._swiper
              .off('swipeleft', self._swipeleft) /* See http://stackoverflow.com/questions/17367198/hammer-js-cant-remove-event-listener */
              .off('swiperight', self._swiperight);
            self._swiper = null;
          }
          return _super(event);
      },
      beforeOpen: function(_super, event){
          var self = this;

          self.$instance.on('next.'+self.namespace+' previous.'+self.namespace, function(event){
            var offset = event.type === 'next' ? +1 : -1;
            self.navigateTo(self.currentNavigation() + offset);
          });

          if (swipeAwareConstructor) {
            self._swiper = swipeAwareConstructor(self.$instance)
              .on('swipeleft', self._swipeleft = function()  { self.$instance.trigger('next'); })
              .on('swiperight', self._swiperight = function() { self.$instance.trigger('previous'); });

            self.$instance
              .addClass(this.namespace+'-swipe-aware', swipeAwareConstructor);
          }

          self.$instance.find('.'+self.namespace+'-content')
            .append(self.createNavigation('previous'))
            .append(self.createNavigation('next'));

          return _super(event);
      },
      beforeContent: function(_super, event) {
        var index = this.currentNavigation();
        var len = this.slides().length;
        this.$instance
          .toggleClass(this.namespace+'-first-slide', index === 0)
          .toggleClass(this.namespace+'-last-slide', index === len - 1);
        return _super(event);
      },
      onKeyUp: function(_super, event){
        var dir = {
          37: 'previous', /* Left arrow */
          39: 'next'      /* Rigth arrow */
        }[event.keyCode];
        if(dir) {
          this.$instance.trigger(dir);
          return false;
        } else {
          return _super(event);
        }
      }
    };

  function FeatherlightGallery($source, config) {
    if(this instanceof FeatherlightGallery) {  /* called with new */
      $.featherlight.apply(this, arguments);
      this.chainCallbacks(callbackChain);
    } else {
      var flg = new FeatherlightGallery($.extend({$source: $source, $currentTarget: $source.first()}, config));
      flg.open();
      return flg;
    }
  }

  $.featherlight.extend(FeatherlightGallery, {
    autoBind: '[data-featherlight-gallery]'
  });

  $.extend(FeatherlightGallery.prototype, {
    /** Additional settings for Gallery **/
    previousIcon: '&#9664;',     /* Code that is used as previous icon */
    nextIcon: '&#9654;',         /* Code that is used as next icon */
    galleryFadeIn: 100,          /* fadeIn speed when image is loaded */
    galleryFadeOut: 300,         /* fadeOut speed before image is loaded */

    slides: function() {
      if (this.filter) {
        return this.$source.find(this.filter);
      }
      return this.$source;
    },

    images: function() {
      warn('images is deprecated, please use slides instead');
      return this.slides();
    },

    currentNavigation: function() {
      return this.slides().index(this.$currentTarget);
    },

    navigateTo: function(index) {
      var self = this,
        source = self.slides(),
        len = source.length,
        $inner = self.$instance.find('.' + self.namespace + '-inner');
      index = ((index % len) + len) % len; /* pin index to [0, len[ */

      self.$currentTarget = source.eq(index);
      self.beforeContent();
      return $.when(
        self.getContent(),
        $inner.fadeTo(self.galleryFadeOut,0.2)
      ).always(function($newContent) {
          self.setContent($newContent);
          self.afterContent();
          $newContent.fadeTo(self.galleryFadeIn,1);
      });
    },

    createNavigation: function(target) {
      var self = this;
      return $('<span title="'+target+'" class="'+this.namespace+'-'+target+'"><span>'+this[target+'Icon']+'</span></span>').click(function(){
        $(this).trigger(target+'.'+self.namespace);
      });
    }
  });

  $.featherlightGallery = FeatherlightGallery;

  /* extend jQuery with selector featherlight method $(elm).featherlight(config, elm); */
  $.fn.featherlightGallery = function(config) {
    FeatherlightGallery.attach(this, config);
    return this;
  };

  /* bind featherlight on ready if config autoBind is set */
  $(document).ready(function(){ FeatherlightGallery._onReady(); });

}(jQuery));

/**
* jquery-match-height master by @liabru
* http://brm.io/jquery-match-height/
* License: MIT
*/

;(function(factory) { // eslint-disable-line no-extra-semi
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery'], factory);
    } else if (typeof module !== 'undefined' && module.exports) {
        // CommonJS
        module.exports = factory(require('jquery'));
    } else {
        // Global
        factory(jQuery);
    }
})(function($) {
    /*
    *  internal
    */

    var _previousResizeWidth = -1,
        _updateTimeout = -1;

    /*
    *  _parse
    *  value parse utility function
    */

    var _parse = function(value) {
        // parse value and convert NaN to 0
        return parseFloat(value) || 0;
    };

    /*
    *  _rows
    *  utility function returns array of jQuery selections representing each row
    *  (as displayed after float wrapping applied by browser)
    */

    var _rows = function(elements) {
        var tolerance = 1,
            $elements = $(elements),
            lastTop = null,
            rows = [];

        // group elements by their top position
        $elements.each(function(){
            var $that = $(this),
                top = $that.offset().top - _parse($that.css('margin-top')),
                lastRow = rows.length > 0 ? rows[rows.length - 1] : null;

            if (lastRow === null) {
                // first item on the row, so just push it
                rows.push($that);
            } else {
                // if the row top is the same, add to the row group
                if (Math.floor(Math.abs(lastTop - top)) <= tolerance) {
                    rows[rows.length - 1] = lastRow.add($that);
                } else {
                    // otherwise start a new row group
                    rows.push($that);
                }
            }

            // keep track of the last row top
            lastTop = top;
        });

        return rows;
    };

    /*
    *  _parseOptions
    *  handle plugin options
    */

    var _parseOptions = function(options) {
        var opts = {
            byRow: true,
            property: 'height',
            target: null,
            remove: false
        };

        if (typeof options === 'object') {
            return $.extend(opts, options);
        }

        if (typeof options === 'boolean') {
            opts.byRow = options;
        } else if (options === 'remove') {
            opts.remove = true;
        }

        return opts;
    };

    /*
    *  matchHeight
    *  plugin definition
    */

    var matchHeight = $.fn.matchHeight = function(options) {
        var opts = _parseOptions(options);

        // handle remove
        if (opts.remove) {
            var that = this;

            // remove fixed height from all selected elements
            this.css(opts.property, '');

            // remove selected elements from all groups
            $.each(matchHeight._groups, function(key, group) {
                group.elements = group.elements.not(that);
            });

            // TODO: cleanup empty groups

            return this;
        }

        if (this.length <= 1 && !opts.target) {
            return this;
        }

        // keep track of this group so we can re-apply later on load and resize events
        matchHeight._groups.push({
            elements: this,
            options: opts
        });

        // match each element's height to the tallest element in the selection
        matchHeight._apply(this, opts);

        return this;
    };

    /*
    *  plugin global options
    */

    matchHeight.version = 'master';
    matchHeight._groups = [];
    matchHeight._throttle = 80;
    matchHeight._maintainScroll = false;
    matchHeight._beforeUpdate = null;
    matchHeight._afterUpdate = null;
    matchHeight._rows = _rows;
    matchHeight._parse = _parse;
    matchHeight._parseOptions = _parseOptions;

    /*
    *  matchHeight._apply
    *  apply matchHeight to given elements
    */

    matchHeight._apply = function(elements, options) {
        var opts = _parseOptions(options),
            $elements = $(elements),
            rows = [$elements];

        // take note of scroll position
        var scrollTop = $(window).scrollTop(),
            htmlHeight = $('html').outerHeight(true);

        // get hidden parents
        var $hiddenParents = $elements.parents().filter(':hidden');

        // cache the original inline style
        $hiddenParents.each(function() {
            var $that = $(this);
            $that.data('style-cache', $that.attr('style'));
        });

        // temporarily must force hidden parents visible
        $hiddenParents.css('display', 'block');

        // get rows if using byRow, otherwise assume one row
        if (opts.byRow && !opts.target) {

            // must first force an arbitrary equal height so floating elements break evenly
            $elements.each(function() {
                var $that = $(this),
                    display = $that.css('display');

                // temporarily force a usable display value
                if (display !== 'inline-block' && display !== 'flex' && display !== 'inline-flex') {
                    display = 'block';
                }

                // cache the original inline style
                $that.data('style-cache', $that.attr('style'));

                $that.css({
                    'display': display,
                    'padding-top': '0',
                    'padding-bottom': '0',
                    'margin-top': '0',
                    'margin-bottom': '0',
                    'border-top-width': '0',
                    'border-bottom-width': '0',
                    'height': '100px',
                    'overflow': 'hidden'
                });
            });

            // get the array of rows (based on element top position)
            rows = _rows($elements);

            // revert original inline styles
            $elements.each(function() {
                var $that = $(this);
                $that.attr('style', $that.data('style-cache') || '');
            });
        }

        $.each(rows, function(key, row) {
            var $row = $(row),
                targetHeight = 0;

            if (!opts.target) {
                // skip apply to rows with only one item
                if (opts.byRow && $row.length <= 1) {
                    $row.css(opts.property, '');
                    return;
                }

                // iterate the row and find the max height
                $row.each(function(){
                    var $that = $(this),
                        style = $that.attr('style'),
                        display = $that.css('display');

                    // temporarily force a usable display value
                    if (display !== 'inline-block' && display !== 'flex' && display !== 'inline-flex') {
                        display = 'block';
                    }

                    // ensure we get the correct actual height (and not a previously set height value)
                    var css = { 'display': display };
                    css[opts.property] = '';
                    $that.css(css);

                    // find the max height (including padding, but not margin)
                    if ($that.outerHeight(false) > targetHeight) {
                        targetHeight = $that.outerHeight(false);
                    }

                    // revert styles
                    if (style) {
                        $that.attr('style', style);
                    } else {
                        $that.css('display', '');
                    }
                });
            } else {
                // if target set, use the height of the target element
                targetHeight = opts.target.outerHeight(false);
            }

            // iterate the row and apply the height to all elements
            $row.each(function(){
                var $that = $(this),
                    verticalPadding = 0;

                // don't apply to a target
                if (opts.target && $that.is(opts.target)) {
                    return;
                }

                // handle padding and border correctly (required when not using border-box)
                if ($that.css('box-sizing') !== 'border-box') {
                    verticalPadding += _parse($that.css('border-top-width')) + _parse($that.css('border-bottom-width'));
                    verticalPadding += _parse($that.css('padding-top')) + _parse($that.css('padding-bottom'));
                }

                // set the height (accounting for padding and border)
                $that.css(opts.property, (targetHeight - verticalPadding) + 'px');
            });
        });

        // revert hidden parents
        $hiddenParents.each(function() {
            var $that = $(this);
            $that.attr('style', $that.data('style-cache') || null);
        });

        // restore scroll position if enabled
        if (matchHeight._maintainScroll) {
            $(window).scrollTop((scrollTop / htmlHeight) * $('html').outerHeight(true));
        }

        return this;
    };

    /*
    *  matchHeight._applyDataApi
    *  applies matchHeight to all elements with a data-match-height attribute
    */

    matchHeight._applyDataApi = function() {
        var groups = {};

        // generate groups by their groupId set by elements using data-match-height
        $('[data-match-height], [data-mh]').each(function() {
            var $this = $(this),
                groupId = $this.attr('data-mh') || $this.attr('data-match-height');

            if (groupId in groups) {
                groups[groupId] = groups[groupId].add($this);
            } else {
                groups[groupId] = $this;
            }
        });

        // apply matchHeight to each group
        $.each(groups, function() {
            this.matchHeight(true);
        });
    };

    /*
    *  matchHeight._update
    *  updates matchHeight on all current groups with their correct options
    */

    var _update = function(event) {
        if (matchHeight._beforeUpdate) {
            matchHeight._beforeUpdate(event, matchHeight._groups);
        }

        $.each(matchHeight._groups, function() {
            matchHeight._apply(this.elements, this.options);
        });

        if (matchHeight._afterUpdate) {
            matchHeight._afterUpdate(event, matchHeight._groups);
        }
    };

    matchHeight._update = function(throttle, event) {
        // prevent update if fired from a resize event
        // where the viewport width hasn't actually changed
        // fixes an event looping bug in IE8
        if (event && event.type === 'resize') {
            var windowWidth = $(window).width();
            if (windowWidth === _previousResizeWidth) {
                return;
            }
            _previousResizeWidth = windowWidth;
        }

        // throttle updates
        if (!throttle) {
            _update(event);
        } else if (_updateTimeout === -1) {
            _updateTimeout = setTimeout(function() {
                _update(event);
                _updateTimeout = -1;
            }, matchHeight._throttle);
        }
    };

    /*
    *  bind events
    */

    // apply on DOM ready event
    $(matchHeight._applyDataApi);

    // use on or bind where supported
    var on = $.fn.on ? 'on' : 'bind';

    // update heights on load and resize events
    $(window)[on]('load', function(event) {
        matchHeight._update(false, event);
    });

    // throttled update heights on resize events
    $(window)[on]('resize orientationchange', function(event) {
        matchHeight._update(true, event);
    });

});

/*! modernizr 3.4.0 (Custom Build) | MIT *
 * https://modernizr.com/download/?-csstransforms-flexbox-svg-setclasses !*/
!function(e,n,t){function r(e,n){return typeof e===n}function s(){var e,n,t,s,o,i,a;for(var l in w)if(w.hasOwnProperty(l)){if(e=[],n=w[l],n.name&&(e.push(n.name.toLowerCase()),n.options&&n.options.aliases&&n.options.aliases.length))for(t=0;t<n.options.aliases.length;t++)e.push(n.options.aliases[t].toLowerCase());for(s=r(n.fn,"function")?n.fn():n.fn,o=0;o<e.length;o++)i=e[o],a=i.split("."),1===a.length?Modernizr[a[0]]=s:(!Modernizr[a[0]]||Modernizr[a[0]]instanceof Boolean||(Modernizr[a[0]]=new Boolean(Modernizr[a[0]])),Modernizr[a[0]][a[1]]=s),C.push((s?"":"no-")+a.join("-"))}}function o(e){var n=x.className,t=Modernizr._config.classPrefix||"";if(_&&(n=n.baseVal),Modernizr._config.enableJSClass){var r=new RegExp("(^|\\s)"+t+"no-js(\\s|$)");n=n.replace(r,"$1"+t+"js$2")}Modernizr._config.enableClasses&&(n+=" "+t+e.join(" "+t),_?x.className.baseVal=n:x.className=n)}function i(e,n){return!!~(""+e).indexOf(n)}function a(){return"function"!=typeof n.createElement?n.createElement(arguments[0]):_?n.createElementNS.call(n,"http://www.w3.org/2000/svg",arguments[0]):n.createElement.apply(n,arguments)}function l(e){return e.replace(/([a-z])-([a-z])/g,function(e,n,t){return n+t.toUpperCase()}).replace(/^-/,"")}function f(e,n){return function(){return e.apply(n,arguments)}}function u(e,n,t){var s;for(var o in e)if(e[o]in n)return t===!1?e[o]:(s=n[e[o]],r(s,"function")?f(s,t||n):s);return!1}function c(e){return e.replace(/([A-Z])/g,function(e,n){return"-"+n.toLowerCase()}).replace(/^ms-/,"-ms-")}function d(n,t,r){var s;if("getComputedStyle"in e){s=getComputedStyle.call(e,n,t);var o=e.console;if(null!==s)r&&(s=s.getPropertyValue(r));else if(o){var i=o.error?"error":"log";o[i].call(o,"getComputedStyle returning null, its possible modernizr test results are inaccurate")}}else s=!t&&n.currentStyle&&n.currentStyle[r];return s}function p(){var e=n.body;return e||(e=a(_?"svg":"body"),e.fake=!0),e}function m(e,t,r,s){var o,i,l,f,u="modernizr",c=a("div"),d=p();if(parseInt(r,10))for(;r--;)l=a("div"),l.id=s?s[r]:u+(r+1),c.appendChild(l);return o=a("style"),o.type="text/css",o.id="s"+u,(d.fake?d:c).appendChild(o),d.appendChild(c),o.styleSheet?o.styleSheet.cssText=e:o.appendChild(n.createTextNode(e)),c.id=u,d.fake&&(d.style.background="",d.style.overflow="hidden",f=x.style.overflow,x.style.overflow="hidden",x.appendChild(d)),i=t(c,e),d.fake?(d.parentNode.removeChild(d),x.style.overflow=f,x.offsetHeight):c.parentNode.removeChild(c),!!i}function g(n,r){var s=n.length;if("CSS"in e&&"supports"in e.CSS){for(;s--;)if(e.CSS.supports(c(n[s]),r))return!0;return!1}if("CSSSupportsRule"in e){for(var o=[];s--;)o.push("("+c(n[s])+":"+r+")");return o=o.join(" or "),m("@supports ("+o+") { #modernizr { position: absolute; } }",function(e){return"absolute"==d(e,null,"position")})}return t}function v(e,n,s,o){function f(){c&&(delete z.style,delete z.modElem)}if(o=r(o,"undefined")?!1:o,!r(s,"undefined")){var u=g(e,s);if(!r(u,"undefined"))return u}for(var c,d,p,m,v,y=["modernizr","tspan","samp"];!z.style&&y.length;)c=!0,z.modElem=a(y.shift()),z.style=z.modElem.style;for(p=e.length,d=0;p>d;d++)if(m=e[d],v=z.style[m],i(m,"-")&&(m=l(m)),z.style[m]!==t){if(o||r(s,"undefined"))return f(),"pfx"==n?m:!0;try{z.style[m]=s}catch(h){}if(z.style[m]!=v)return f(),"pfx"==n?m:!0}return f(),!1}function y(e,n,t,s,o){var i=e.charAt(0).toUpperCase()+e.slice(1),a=(e+" "+E.join(i+" ")+i).split(" ");return r(n,"string")||r(n,"undefined")?v(a,n,s,o):(a=(e+" "+N.join(i+" ")+i).split(" "),u(a,n,t))}function h(e,n,r){return y(e,t,t,n,r)}var C=[],w=[],S={_version:"3.4.0",_config:{classPrefix:"",enableClasses:!0,enableJSClass:!0,usePrefixes:!0},_q:[],on:function(e,n){var t=this;setTimeout(function(){n(t[e])},0)},addTest:function(e,n,t){w.push({name:e,fn:n,options:t})},addAsyncTest:function(e){w.push({name:null,fn:e})}},Modernizr=function(){};Modernizr.prototype=S,Modernizr=new Modernizr;var x=n.documentElement,_="svg"===x.nodeName.toLowerCase();Modernizr.addTest("svg",!!n.createElementNS&&!!n.createElementNS("http://www.w3.org/2000/svg","svg").createSVGRect);var b="Moz O ms Webkit",E=S._config.usePrefixes?b.split(" "):[];S._cssomPrefixes=E;var N=S._config.usePrefixes?b.toLowerCase().split(" "):[];S._domPrefixes=N;var P={elem:a("modernizr")};Modernizr._q.push(function(){delete P.elem});var z={style:P.elem.style};Modernizr._q.unshift(function(){delete z.style}),S.testAllProps=y,S.testAllProps=h,Modernizr.addTest("flexbox",h("flexBasis","1px",!0)),Modernizr.addTest("csstransforms",function(){return-1===navigator.userAgent.indexOf("Android 2.")&&h("transform","scale(1)",!0)}),s(),o(C),delete S.addTest,delete S.addAsyncTest;for(var T=0;T<Modernizr._q.length;T++)Modernizr._q[T]();e.Modernizr=Modernizr}(window,document);
