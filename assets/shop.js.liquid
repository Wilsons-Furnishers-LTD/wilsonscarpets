/*============================*/
/* Update main product image. */
/*============================*/
var switchImage = function(newImageSrc, newImage, mainImageDomEl, newZoomSrc) {
  // newImageSrc is the path of the new image in the same size as originalImage is sized.
  // newImage is Shopify's object representation of the new image, with various attributes, such as scr, id, position.
  // mainImageDomEl is the passed domElement, which has not yet been manipulated. Let's manipulate it now.
  jQuery(mainImageDomEl).parents('a').attr('href', newZoomSrc);
  jQuery(mainImageDomEl).attr('src', newImageSrc);
  jQuery(mainImageDomEl).parents('a').attr('data-featherlight', newZoomSrc);
};

jQuery(function($) {


// get image size:
productImageWidth = Math.ceil($('.product-photo-container').width());


  /* Placeholder JS */
  /*==========================*/
  var test = document.createElement('input');
  if (!('placeholder' in test)) {
    $('[placeholder]').each(function(){
      if ($(this).val() === '') {
        var hint = $(this).attr('placeholder');
        $(this).val(hint).addClass('hint');
      }
    });
    $('[placeholder]').focus(function() {
      if ($(this).val() === $(this).attr('placeholder')) {
        $(this).val('').removeClass('hint');
      }
    }).blur(function() {
      if ($(this).val() === '') {
        $(this).val($(this).attr('placeholder')).addClass('hint');
      }
    });
  }

  /* Form validation JS */
  /*==========================*/

  $('input.error, textarea.error').focus(function() {
    $(this).removeClass('error');
  });

  $('form :submit').click(function() {
    $(this).parents('form').find('input.hint, textarea.hint').each(function() {
      $(this).val('').removeClass('hint');
    });
    return true;
  });

  /* Remove SVG images to avoid broken images in all browsers that don't support SVG. */
  /*==========================*/

  var supportsSVG = function() {
    return document.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#Image', '1.1');
  }
  if (!supportsSVG()) {
    $('img[src*=".svg"]').remove();
  }

  /* Prepare to have floated images fill the width of the design on blog pages on small devices. */
  /*==========================*/

  var images = $('.article img').load(function() {
    var src = $(this).attr('src').replace(/_grande\.|_large\.|_medium\.|_small\./, '.');
    var width = $(this).width();
    $(this).attr('src', src).attr('width', width).removeAttr('height');
  });

  /* Update main product image when a thumbnail is clicked. */
  /*==========================*/
   $('.product-photo-thumb a').on('click', function(e) {
	    e.preventDefault();
	
	
	
	// var thisHref = $(this).attr('href');
	
	// var queryParam = thisHref.lastIndexOf("?v=");
	// var queryParamStored = thisHref.substring(queryParam);
	
	// var lastUnderscore = thisHref.lastIndexOf("_");
	// thisHref = thisHref.substring(0,lastUnderscore) + "_"+productImageWidth+"x.jpg"+queryParamStored;
	
	// remove the picture source as the fallback image can be used as it will be resized exactly:

    // switchImage(thisHref, null, $('.product-photo-container img')[0], $(this).attr('data-zoom'));
    // $('.product-photo-container picture source').remove();
  } );

});
