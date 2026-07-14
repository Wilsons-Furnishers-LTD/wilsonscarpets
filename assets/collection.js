/*
 * colour_filter declare as global var in footer-scripts.liquid
*/
function get_real_colour(colour){
    /*
    const real_colours = {
        'grey' : ['grey', 'smoke', 'slate', 'silver', 'platinum', 'zephyr', 'duante', 'pewter', 'concrete', 'anthracite' ]
    };
    */

    const temp_colour = real_colours[colour_filter];

    let return_true_colour = '';

    

    if(temp_colour){
        
        for (let i = 0; i < temp_colour.length; i++) {
            let temp_check = temp_colour[i].trim();
            
            if( colour.indexOf(temp_check) !== -1 ){
                return_true_colour = colour_filter;
                break;
            }
        }
    }

    return return_true_colour;

    
}

function select_colour_filtered(colour_filter){
    try{
        
        $('.product-grid .swatch-colours').each(function(){
            let is_first = true;
            $(this).find('li').each(function(){
                let alt = $(this).find('img').prop('alt').toLowerCase();
                //console.log(get_real_colour(alt));
                

                let real_color = get_real_colour(alt);

                
                
                if(real_color != ''){
                    if( real_color.indexOf(colour_filter) !== -1 ){

                        if(is_first){
                            $(this).addClass('selected');

                            let $span = $(this).find('span');

                            let img_url = $span.data('image-url');
                            let parent = $span.closest('.item');
                            let $img = parent.find('.product-image-wrap picture img');
                            let $source = parent.find('.product-image-wrap picture source');
                            if (!$img.attr('data-src')) {
                                $img.data('src', $img.attr('src'));
                                $source.data('src', $source.attr('srcset'));
                            }
                            $img.attr('src', img_url);
                            $source.attr('srcset', img_url);
                            
                            is_first = false;
                        }
                        
                    }
                }
            })
        })
    }catch(err){
        console.log('select_colour_filtered: ', err)
    }
}

jQuery(function($){
    if(colour_filter !== null && colour_filter !== ''){
        if($('.product-grid .swatch-colours').length){
            select_colour_filtered(colour_filter)
            
        }
        
    }

    $('.product-grid .swatch-colours li').hover(
        function(){
            if (!is_touch_device()) {
                $(this).parent().find('.selected').removeClass('selected');
            }
        }
    )
})