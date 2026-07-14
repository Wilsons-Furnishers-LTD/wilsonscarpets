var onSale = false;
var soldOut = false;
var priceVaries = false;
var images = [];
var firstVariant = {};

// Override Settings
var bcSfFilterSettings = {
    general: {
        limit: 60,
        /* Optional */
        activeScrollToTop: true,
        // Color
        colorFilterOptionTitle: '',
        colorFilterOptionItem: '',
        colorClearButton: '',
        // Font size
        fontSizeFilterOptionTitle: '',
        fontSizeFilterOptionItem: '',
        fontSizeClearButton: ''
    },
    basic: {
        productsPerRow: 3,
        productsPerRowMobile: 2,
        showPrice: true,
        showVendor: true,
        showSaleLabel: true,
        showSoldOutLabel: true,
        activeImageSwap: true,
        showSorting: true,
        showLimit: true,
        // Color
        colorSaleLabel: '#e95144',
        borderColorSaleLabel: '#e95144',
        bgSaleLabel: '#fff',
        colorSoldOutLabel: '#d2d8db',
        borderColorSoldOutLabel: '#d2d8db',
        bgSoldOutLabel: '#fff',
    }
};

// Declare Templates
var bcSfFilterTemplate = {
    'soldOutClass': ' sold-out',
    'saleClass': ' on-sale',
    'soldOutLabelHtml': '<span class="soldout label" {{style}}>' + bcSfFilterConfig.label_basic.sold_out + '</span>',
    'saleLabelHtml': '<span class="sale label" {{style}}>' + bcSfFilterConfig.label_basic.sale + '</span>',
    'vendorHtml': '<p class="bc-sf-filter-product-item-vendor">{{itemVendorLabel}}</p>',

    // Grid Template
    'productGridItemHtml': '<div class="bc-sf-filter-product-item {{gridWidthClass}}{{soldOutClass}}{{saleClass}}">' +
                                '<div class="bc-sf-filter-product-item-inner">' +
                                    '<a href="{{itemUrl}}" class="bc-sf-filter-product-item-link">' +
                                        '<span class="bc-sf-filter-product-item-image">{{itemImages}}</span>' +
                                        '<span class="bc-sf-filter-product-item-label">{{itemLabels}}</span>' +
                                        '<div class="bc-sf-filter-product-bottom">' +
                                            '<p class="bc-sf-filter-product-item-title">{{itemTitle}}</p>' +
                                            '{{itemVendor}}' +
                                            '{{itemPrice}}' +
                                        '</div>' +
                                    '</a>' +
                                '</div>' +
                                '<div class="quickViewOverlay"></div>'+
                                '<a href="#" class="quickViewLink" data-featherlightid="quickView{{itemHandle}}">Quick View</a>'+
                                '<form action="/cart/add" method="post" enctype="multipart/form-data" class="quickViewForm clearfix" id="quickView{{itemHandle}}">'+
                                '<div class="quickViewImage">{{itemMainImage}}'+
                                '</div>' +
                                '<div class="quickViewDetails">' +
                                '<h3 itemprop="name">{{itemTitle}}</h3>'+
                                '{{addToCart}}'+
                                '<div class="desc">'+
'<h4>Details:</h4>'+
                    '<p>{{itemDescription}}</p>'+
                  '</div>'+
                                '<a href="{{itemUrl}}" class="viewFullDetails">View full product details</a>'+
                                '</div>' +
                                '</form>'+
                            '</div>',

    // Pagination Template
    'previousActiveHtml': '<li><a href="{{itemUrl}}">&larr;</a></li>',
    'previousDisabledHtml': '<li class="disabled"><span>&larr;</span></li>',
    'nextActiveHtml': '<li><a href="{{itemUrl}}">&rarr;</a></li>',
    'nextDisabledHtml': '<li class="disabled"><span>&rarr;</span></li>',
    'pageItemHtml': '<li><a href="{{itemUrl}}">{{itemTitle}}</a></li>',
    'pageItemSelectedHtml': '<li><span class="active">{{itemTitle}}</span></li>',
    'pageItemRemainHtml': '<li><span>{{itemTitle}}</span></li>',
    'paginateHtml': '<ul>{{previous}}{{pageItems}}{{next}}</ul>',
  
    // Sorting Template
    'sortingHtml': '<label>' + bcSfFilterConfig.label.sorting + '</label><select class="bc-sf-filter-filter-dropdown">{{sortingItems}}</select>',

    // Show Limit Template
    'showLimitHtml': '<label>' + bcSfFilterConfig.label.show_limit + '</label><select class="bc-sf-filter-filter-dropdown">{{showLimitItems}}</select>',

    // Breadcrumb Template
    'breadcrumbHtml': '<a href="/">' + bcSfFilterConfig.label.breadcrumb_home + '</a> {{breadcrumbDivider}} {{breadcrumbItems}}',
    'breadcrumbDivider': '<span class="divider">/</span>',
    'breadcrumbItemLink': '<a href="{{itemLink}}">{{itemTitle}}</a>',
    'breadcrumbItemSelected': '<span>{{itemTitle}}</span>',
};

/************************** BUILD PRODUCT LIST **************************/

// Build Product Grid Item
BCSfFilter.prototype.buildProductGridItem = function(data, index) {
    // Get Template
    var itemHtml = bcSfFilterTemplate.productGridItemHtml;

    // Customize API data to get the Shopify data
    data = prepareShopifyData(data);

    // Add Custom class
    var soldOutClass = soldOut ? bcSfFilterTemplate.soldOutClass : '';
    var saleClass = onSale ? bcSfFilterTemplate.saleClass : '';
    itemHtml = itemHtml.replace(/{{soldOutClass}}/g, soldOutClass);
    itemHtml = itemHtml.replace(/{{saleClass}}/g, saleClass);

    // Add Grid Width class
    itemHtml = itemHtml.replace(/{{gridWidthClass}}/g, buildGridWidthClass(data));

    // Add Label
    itemHtml = itemHtml.replace(/{{itemLabels}}/g, buildLabels(data));

    // Add Images
    itemHtml = itemHtml.replace(/{{itemImages}}/g, buildImages(data));

    // Add Price
    var isOutOfStock = '';
    if(!data.available) {
        isOutOfStock = '<p class="outOfStock">Sorry, this is out of stock </p>';
    }

    itemHtml = itemHtml.replace(/{{itemPrice}}/g, buildPrice(data)+isOutOfStock);

    // Add Vendor
    itemHtml = itemHtml.replace(/{{itemVendor}}/g, buildVendor(data));

    // Add main attribute (Always put at the end of this function)
    itemHtml = itemHtml.replace(/{{itemId}}/g, data.id);
    itemHtml = itemHtml.replace(/{{itemTitle}}/g, data.title);
    itemHtml = itemHtml.replace(/{{itemHandle}}/g, data.handle);
    itemHtml = itemHtml.replace(/{{itemVendorLabel}}/g, data.vendor);
    itemHtml = itemHtml.replace(/{{itemUrl}}/g, this.buildProductItemUrl(data));

var imageMarkup = '';
if(data.images_info.length>0) {
    imageMarkup = '<img src="'+data.images_info[0].src+'" alt="'+data.title+'">';

}
    itemHtml = itemHtml.replace(/{{itemMainImage}}/g, imageMarkup);

var ellipsis = '';
if (data.description.length>280) {
 ellipsis = '...';
}
itemHtml = itemHtml.replace(/{{itemDescription}}/g, data.description.substring(0,280)+ellipsis);



if(data.available) {
    var hiddenClass = '';
    if(data.variants.length == 1) {
if(data.variants[0]['title'].indexOf('Default') != -1) {
hiddenClass = 'hidden';
}
    }
    var addToCartMarkup = '<div id="product-variants" class="'+hiddenClass+'">';


 if(data.options.length == 1) {
  if(data.options[0] != 'Title'){
                  addToCartMarkup += '<label>'+data.options[0]+'</label>';
                  }
              }


     addToCartMarkup += '<div class="selectWrapper">';
     addToCartMarkup += '<select class="product-select" name="id">';




for (var i in data.variants) {
    
            addToCartMarkup += '<option value="'+data.variants[i]['id']+'">';
              addToCartMarkup += data.variants[i]['title'] + ' - ' + bcsffilter.formatMoney(data.variants[i]['price'], bcsffilter.moneyFormat);
              addToCartMarkup += '</option>';
         }





     addToCartMarkup += '</select>';
     addToCartMarkup += '</div>';
     addToCartMarkup += '</div>';
     addToCartMarkup += '<input class="btn button button-primary" type="submit" name="add" value="Add to bag">';
itemHtml = itemHtml.replace(/{{addToCart}}/g, addToCartMarkup);
} else {
itemHtml = itemHtml.replace(/{{addToCart}}/g, '<p class="outOfStock">Sorry, this is out of stock</p>');
}
    
//console.log(data);
    return itemHtml;
};

// Build Product List Item
BCSfFilter.prototype.buildProductListItem = function(data) {};

// Customize data to suit the data of Shopify API
BCSfFilter.prototype.prepareProductData = function(data) {
    for (var k in data) {
        // Featured image
        if (data['images_info'] > 0) {
            data[k]['featured_image'] = data['images_info'][0];
        } else {
            data[k]['featured_image'] = {width: '', height: '', aspect_ratio: 0}
        }

        // Add Options
        var optionsArr = [];
        for (var i in data[k]['options_with_values']) {
            optionsArr.push(data[k]['options_with_values'][i]['name']);
        }
        data[k]['options'] = optionsArr;

        // Customize variants
        for (var i in data[k]['variants']) {
            var variantOptionArr = [];
            var count = 1;
            var variant = data[k]['variants'][i];
            // Add Options
            var variantOptions = variant['merged_options'];
            if (Array.isArray(variantOptions)) {
                for (var j = 0; j < variantOptions.length; j++) {
                    var temp = variantOptions[j].split(':');
                    data[k]['variants'][i]['option' + (parseInt(j) + 1)] = temp[1];
                    data[k]['variants'][i]['option_' + temp[0]] = temp[1];
                    variantOptionArr.push(temp[1]);
                }
                data[k]['variants'][i]['options'] = variantOptionArr;
            }
            data[k]['variants'][i]['compare_at_price'] = parseFloat(data[k]['variants'][i]['compare_at_price']) * 100;
            data[k]['variants'][i]['price'] = parseFloat(data[k]['variants'][i]['price']) * 100;
        }

        // Add Description
        data[k]['description'] = data[k]['body_html'];
    }
    return data;
};

/************************** END BUILD PRODUCT LIST **************************/

/************************** CUSTOMIZE DATA BEFORE BUILDING PRODUCT ITEM **************************/

function prepareShopifyData(data) {
    data.price_min *= 100, data.price_max *= 100, data.compare_at_price_min *= 100, data.compare_at_price_max *= 100; // Displaying price base on the policy of Shopify, have to multiple by 100
    soldOut = !data.available; // Check a product is out of stock
    onSale = data.compare_at_price_min > data.price_min; // Check a product is on sale
    priceVaries = data.price_min != data.price_max; // Check a product has many prices
    // Convert images to array
    images = Object.keys(data.images).map(function (key) { return data.images[key]; });
    // Get First Variant (selected_or_first_available_variant)
    var firstVariant = data['variants'][0];
    if (getParam('variant') !== null && getParam('variant') != '') {
        var paramVariant = data.variants.filter(function(e) { return e.id == getParam('variant'); });
        if (typeof paramVariant[0] !== 'undefined') firstVariant = paramVariant[0];
    } else {
        for (var i = 0; i < data['variants'].length; i++) {
            if (data['variants'][i].available) {
                firstVariant = data['variants'][i];
                break;
            }
        }
    }
    return data;
}

/************************** END CUSTOMIZE DATA BEFORE BUILDING PRODUCT ITEM **************************/

/************************** BUILD PRODUCT ITEM ELEMENTS **************************/

function buildGridWidthClass() {
    var gridWidthClass = '';
    // On PC
    switch (bcsffilter.getSettingValue('basic.productsPerRow')) {
        case 2: gridWidthClass = 'bc-sf-filter-grid-width-2'; break;
        case 3: gridWidthClass = 'bc-sf-filter-grid-width-3'; break;
        case 5: gridWidthClass = 'bc-sf-filter-grid-width-5'; break;
        default: gridWidthClass = 'bc-sf-filter-grid-width-4'; break;
    }    
    // On Mobile
    switch (bcsffilter.getSettingValue('basic.productsPerRowMobile')) {
        case 1: gridWidthClass += ' bc-sf-filter-grid-width-mb-1'; break;
        case 3: gridWidthClass += ' bc-sf-filter-grid-width-mb-3'; break;
        default:  gridWidthClass += ' bc-sf-filter-grid-width-mb-2'; break;
    }
    return gridWidthClass;
}
function buildImages(data) {
    var html = '';
    // Build Main Image
    var thumbUrl = images.length > 0 ? bcsffilter.optimizeImage(images[0]) : bcSfFilterConfig.general.no_image_url;
    html += '<img src="' + thumbUrl + '" class="bc-sf-filter-product-item-main-image" />';
    // Build Image Swap
    var flipImageUrl = images.length > 1 ? bcsffilter.optimizeImage(images[1]) : thumbUrl;
    html += '<img src="' + flipImageUrl + '" class="bc-sf-filter-product-item-flip-image" />';
    return html;
}
function buildVendor(data) {
    var html = '';
    if (bcsffilter.getSettingValue('basic.showVendor')) {
        html = bcSfFilterTemplate.vendorHtml;
    }
    return html;
}
function buildPrice(data) {
    var html = '';
    if (bcsffilter.getSettingValue('basic.showPrice')) {
        html = '<p class="bc-sf-filter-product-item-price">';
        if (onSale) {
            html += '<s>' + bcsffilter.formatMoney(data.compare_at_price_min, bcsffilter.moneyFormat) + '</s> ';
            html += '<span class="bc-sf-filter-product-item-sale-price">' + bcsffilter.formatMoney(data.price_min, bcsffilter.moneyFormat) + '</span>';
        } else {
            if (priceVaries) {
                html += (bcSfFilterConfig.label_basic.from) + ' ';
            }
            html += '<span class="bc-sf-filter-product-item-regular-price">' + bcsffilter.formatMoney(data.price_min, bcsffilter.moneyFormat) + '</span>';
        }
        html += '</p>';
    }
    return html;
}
function buildLabels(data) {
    // Build Sold out label
    var soldOutLabel = '';
    if (bcsffilter.getSettingValue('basic.showSoldOutLabel') && soldOut) {
        var color = 'color: ' + bcsffilter.getSettingValue('basic.colorSoldOutLabel') + ';';
        var border = ' border: 1px solid ' + bcsffilter.getSettingValue('basic.borderColorSoldOutLabel') + ';';
        var bg = ' background: ' + bcsffilter.getSettingValue('basic.bgSoldOutLabel') + ';';
        var style = 'style="' + color + border + bg + '";';
        soldOutLabel = bcSfFilterTemplate.soldOutLabelHtml.replace(/{{style}}/g, style);
    }
    // Build Sale label
    var saleLabel = '';
    if (bcsffilter.getSettingValue('basic.showSaleLabel') && onSale && !soldOut) {
        var color = 'color: ' + bcsffilter.getSettingValue('basic.colorSaleLabel') + ';';
        var border = ' border: 1px solid ' + bcsffilter.getSettingValue('basic.borderColorSaleLabel') + ';';
        var bg = ' background: ' + bcsffilter.getSettingValue('basic.bgSaleLabel') + ';';
        var style = 'style="' + color + border + bg + '";';
        saleLabel = bcSfFilterTemplate.saleLabelHtml.replace(/{{style}}/g, style);
    }
    // Build Labels
    var html = soldOutLabel + saleLabel;
    return html
}

/************************** END BUILD PRODUCT ITEM ELEMENTS **************************/

/************************** BUILD TOOLBAR **************************/

// Build Pagination
BCSfFilter.prototype.buildPagination = function(totalProduct) {
    // Get page info
    var currentPage = parseInt(this.queryParams.page);
    var totalPage = Math.ceil(totalProduct / this.queryParams.limit);

    // If it has only one page, clear Pagination
    if (totalPage == 1) {
        jQ(this.selector.bottomPagination).html('');
        return false;
    }

    if (this.getSettingValue('general.paginationType') == 'default') {
        var paginationHtml = bcSfFilterTemplate.paginateHtml;

        // Build Previous
        var previousHtml = (currentPage > 1) ? bcSfFilterTemplate.previousActiveHtml : bcSfFilterTemplate.previousDisabledHtml;
        previousHtml = previousHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, currentPage - 1));
        paginationHtml = paginationHtml.replace(/{{previous}}/g, previousHtml);

        // Build Next
        var nextHtml = (currentPage < totalPage) ? bcSfFilterTemplate.nextActiveHtml :  bcSfFilterTemplate.nextDisabledHtml;
        nextHtml = nextHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, currentPage + 1));
        paginationHtml = paginationHtml.replace(/{{next}}/g, nextHtml);

        // Create page items array
        var beforeCurrentPageArr = [];
        for (var iBefore = currentPage - 1; iBefore > currentPage - 3 && iBefore > 0; iBefore--) {
            beforeCurrentPageArr.unshift(iBefore);
        }
        if (currentPage - 4 > 0) {
            beforeCurrentPageArr.unshift('...');
        }
        if (currentPage - 4 >= 0) {
            beforeCurrentPageArr.unshift(1);
        }
        beforeCurrentPageArr.push(currentPage);

        var afterCurrentPageArr = [];
        for (var iAfter = currentPage + 1; iAfter < currentPage + 3 && iAfter <= totalPage; iAfter++) {
            afterCurrentPageArr.push(iAfter);
        }
        if (currentPage + 3 < totalPage) {
            afterCurrentPageArr.push('...');
        }
        if (currentPage + 3 <= totalPage) {
            afterCurrentPageArr.push(totalPage);
        }

        // Build page items
        var pageItemsHtml = '';
        var pageArr = beforeCurrentPageArr.concat(afterCurrentPageArr);
        for (var iPage = 0; iPage < pageArr.length; iPage++) {
            if (pageArr[iPage] == '...') {
                pageItemsHtml += bcSfFilterTemplate.pageItemRemainHtml;
            } else {
                pageItemsHtml += (pageArr[iPage] == currentPage) ? bcSfFilterTemplate.pageItemSelectedHtml : bcSfFilterTemplate.pageItemHtml;
            }
            pageItemsHtml = pageItemsHtml.replace(/{{itemTitle}}/g, pageArr[iPage]);
            pageItemsHtml = pageItemsHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, pageArr[iPage]));
        }
        paginationHtml = paginationHtml.replace(/{{pageItems}}/g, pageItemsHtml);

        jQ(this.selector.bottomPagination).html(paginationHtml);
    }
};

// Build Sorting
BCSfFilter.prototype.buildFilterSorting = function() {
    if (this.getSettingValue('basic.showSorting') && bcSfFilterTemplate.hasOwnProperty('sortingHtml')) {
        jQ(this.selector.topSorting).html('');

        var sortingArr = this.getSortingList();
        if (sortingArr) {
            // Build content 
            var sortingItemsHtml = '';
            for (var k in sortingArr) {
                sortingItemsHtml += '<option value="' + k +'">' + sortingArr[k] + '</option>';
            }
            var html = bcSfFilterTemplate.sortingHtml.replace(/{{sortingItems}}/g, sortingItemsHtml);
            jQ(this.selector.topSorting).html(html);
            // Set current value
            jQ(this.selector.topSorting + ' select').val(this.queryParams.sort);
        }
    }
};

// Build Show Limit
BCSfFilter.prototype.buildFilterShowLimit = function() {
    if (this.getSettingValue('basic.showLimit') && bcSfFilterTemplate.hasOwnProperty('showLimitHtml')) {
        jQ(this.selector.topShowLimit).html('');

        var numberList = this.getSettingValue('general.showLimitList');
        if (numberList != '') {
            // Build content
            var showLimitItemsHtml = '';
            var arr = numberList.split(',');
            for (var k = 0; k < arr.length; k++) {
                showLimitItemsHtml += '<option value="' + arr[k].trim() +'">' + arr[k].trim() + '</option>';
            }
            var html = bcSfFilterTemplate.showLimitHtml.replace(/{{showLimitItems}}/g, showLimitItemsHtml);
            jQ(this.selector.topShowLimit).html(html);
            // Set value
            jQ(this.selector.topShowLimit + ' select').val(this.queryParams.limit);
        }
    }
};

// Build Breadcrumb
BCSfFilter.prototype.buildBreadcrumb = function(colData, apiData) {
    if (bcSfFilterTemplate.hasOwnProperty('breadcrumbHtml')) {
        var breadcrumbItemsHtml = '';
        if (typeof colData !== 'undefined' && colData.hasOwnProperty('collection')) {
            var colInfo = colData.collection;
            if (typeof this.collectionTags !== 'undefined' && this.collectionTags !== null) {
                breadcrumbItemsHtml += bcSfFilterTemplate.breadcrumbItemLink.replace(/{{itemLink}}/g, '/collections/' + colInfo.handle).replace(/{{itemTitle}}/g, colInfo.title);
                breadcrumbItemsHtml += " {{breadcrumbDivider}} ";
                breadcrumbItemsHtml += bcSfFilterTemplate.breadcrumbItemSelected.replace(/{{itemTitle}}/g, this.collectionTags[0]);
            } else {
                breadcrumbItemsHtml += bcSfFilterTemplate.breadcrumbItemSelected.replace(/{{itemTitle}}/g, colInfo.title);
            }
        } else {
            breadcrumbItemsHtml += bcSfFilterTemplate.breadcrumbItemSelected.replace(/{{itemTitle}}/g, this.getSettingValue('label.defaultCollectionHeader'));
        }
        var html = bcSfFilterTemplate.breadcrumbHtml.replace(/{{breadcrumbItems}}/g, breadcrumbItemsHtml)
        html = html.replace(/{{breadcrumbDivider}}/g, bcSfFilterTemplate.breadcrumbDivider);
        jQ(this.selector.breadcrumb).html(html);
    }
};

/************************** END BUILD TOOLBAR **************************/

// Add additional feature for product list, used commonly in customizing product list
BCSfFilter.prototype.buildExtrasProductList = function(data, eventType) {};

// Build additional elements
BCSfFilter.prototype.buildAdditionalElements = function(data, eventType) {
    matchHeightImage();
    jQ(window).resize(function(){
        matchHeightImage();
    })

    // Build Image Swap
    if (this.getSettingValue('basic.activeImageSwap')) buildImageSwap();
};

function matchHeightImage() {
    jQ('.bc-sf-filter-product-item-main-image').load(function(){
        var imageContainer = jQ(this).parent();
        imageContainer.css('width', '100%').css('height', $(this).height());
    }).each(function() {
           if(this.complete) jQ(this).load();
    });
    // jQ('.bc-sf-filter-product-item').each(function(){
    //     var mainImage = jQ(this).find('.bc-sf-filter-product-item-main-image');
    //     var imageContainer = jQ(this).find('.bc-sf-filter-product-item-image');
    //     mainImage.one('load', function() {
    //         imageContainer.css('width', '100%').css('height', mainImage.height());
    //     }).each(function() {
    //         if(this.complete) jQ(this).load();
    //     });
    // });
}

// Build Image Swap
function buildImageSwap() {
    jQ('.bc-sf-filter-product-item-image').each(function() {
        jQ(this).children('img').css({
            'position': 'absolute',
            'top': 0,
            'left': 0,
            'width': '100%'
        })
    });
    jQ('.bc-sf-filter-product-item-main-image').hover(function() {
        jQ(this).css('opacity', 0);
        jQ(this).siblings().show();
    }, function() {
        jQ(this).css('opacity', 1);
        jQ(this).siblings().hide();
    });
}

// Build Breadcrumb
// BCSfFilter.prototype.buildBreadcrumb = function(colData, apiData) {
//     if (bcSfFilterTemplate.hasOwnProperty('breadcrumbHtml')) {
//         var breadcrumbHtml = bcSfFilterTemplate.breadcrumbHtml;
//         var colInfo = colData.collection;
//         // Build Tags
//         var currentTagsHtml = '';
//         if (Array.isArray(bcSfFilterConfig.general.current_tags)) {
//             var current_tags = bcSfFilterConfig.general.current_tags;
//             for (var k in current_tags) {
//                 var tag = current_tags[k];
//                 currentTagsHtml += '&nbsp; / &nbsp;';
//                 currentTagsHtml += '<span itemprop="itemListElement" itemscope itemtype="http://schema.org/ListItem"><a href="/collections/{{currentCollectionLink}}/' + this.slugify(tag) + '" title="' + tag + '" itemprop="item"><span itemprop="name">' + tag + '</span></a></span>';
//             }
//         }
//         // Build Collection Info
//         breadcrumbHtml = breadcrumbHtml.replace(/{{currentTags}}/g, currentTagsHtml);
//         breadcrumbHtml = breadcrumbHtml.replace(/{{currentCollectionLink}}/g, '/collections/' + colInfo.handle).replace(/{{currentCollectionTitle}}/g, colInfo.title);
//         // Top Pagination
//         var currentPage = parseInt(this.queryParams.page);
//         var totalPage = Math.ceil(apiData.total_product / this.queryParams.limit);
//         var topPaginationHtml = '&nbsp; / &nbsp;' + (bcSfFilterConfig.label.breadcrumb_page).replace(/{{ current_page }}/g, this.queryParams.page).replace(/{{ pages }}/g, totalPage)
//         breadcrumbHtml = breadcrumbHtml.replace(/{{topPagination}}/g, topPaginationHtml);

//         jQ(this.selector.breadcrumb).html(breadcrumbHtml);
//     }
// };


function junoBCSFilterApplyFeatherlight() {
 
    $( ".bc-sf-filter-product-item a[data-featherlightid]" ).each(function() {
$(this).featherlight($('#'+$(this).data("featherlightid")));

});
}