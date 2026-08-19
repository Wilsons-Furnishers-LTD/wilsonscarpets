!(function() {

    async function checkHolidays() {
        const year = new Date().getFullYear();
        const res = await fetch("https://www.gov.uk/bank-holidays.json");
        const data = await res.json();
        
        const today = new Date().toLocaleDateString("en-CA");
        
        const easterMonday = data["england-and-wales"].events.find(
        e => e.title === "Easter Monday" &&
                e.date.startsWith(`${year}-`)
        );

        const d = new Date(easterMonday.date);
        d.setDate(d.getDate() - 1);
        const christmasDay = year + '-' + '12' + '-25';
        const christmasEve = year + '-' + '12' + '-24';
        const boxingDay = year + '-' + '12' + '-26';
        const newYearsEve = year + '-' + '12' + '-31';
        const newYearsDay = year + '-' + '01' + '-01';
        const easterSunday = d.toISOString().slice(0, 10);
        const holidays = [christmasDay, christmasEve, boxingDay, newYearsEve, newYearsDay, easterSunday];
        
        
        let isTodayHoliday;
        holidays.forEach(holiday => {
            if(holiday === today) {
                // remove times
                isTodayHoliday = true;
            }
        });
        if(!isTodayHoliday) {
            $('.cw-storelocator').addClass('not-holiday');
        }
    }

    function getCurrentDayOpeningTime(openingTimes) {
        const today = new Date().toLocaleDateString('en-US', {weekday: 'long'});
        const temp = document.createElement('div');
        temp.innerHTML = openingTimes;
        const td = [...temp.querySelectorAll('td')].find(el => el.textContent.trim() === today);
        
        if(td && td.nextElementSibling) {
            if(td.nextElementSibling.textContent.trim() !== 'CLOSED') {
                return 'Open today ' + td.nextElementSibling.innerHTML
            } else {
                return 'Closed today'
            }
        }
    }
    function getFullOpeningTimes(openingTimes) {
        const today = new Date().toLocaleDateString('en-US', {weekday: 'long'});
        const temp = document.createElement('div');
        temp.innerHTML = openingTimes;
        temp.querySelectorAll('tr').forEach(row => {
            const dayCell = row.querySelector('td');

            if (dayCell && dayCell.textContent.trim() === today) {
            row.classList.add('today');
            }
        });
        return temp.innerHTML
    }

    function create_html_list(store, i, search = false) {
        
        let storeProperties = store;
        let thumbnail; 
        let openingTime = '';
        let fullOpeningTimes = '';
        if(!search && store.properties) {
            storeProperties = store.properties;
            thumbnail = storeProperties.thumbnail;
            if(storeProperties.opening_times) {
                openingTime = getCurrentDayOpeningTime(storeProperties.opening_times);
                fullOpeningTimes = getFullOpeningTimes(storeProperties.opening_times);
            }
        } else {
            thumbnail = store.thum;
            if(store.opening_times) {
                openingTime = getCurrentDayOpeningTime(store.opening_times);
                fullOpeningTimes = getFullOpeningTimes(store.opening_times);
            }
        }
        if(storeProperties) {
            let featuredClass = '',
                featuredFlag = '';
            if(storeProperties.featured_store == '1') {
                featuredClass = 'featured',
                featuredFlag = '<img class="feature-flag" src="' + window.themeAssets.bed_flag + '">';
            }
            storeProperties.url = storeProperties.url.replace('https://www.wilsonscarpets.com', '');
            
            let storeHtml = `
                    <div class="item thumbnail store-item ${featuredClass}" datamarker="${i}">
                        <div class="inner-item" data-lat="${storeProperties.lat}" data-place="${storeProperties.place_id}" data-long="${storeProperties.long}" store-id="${storeProperties.id}" id="store_id_${storeProperties.id}">
                            ${featuredFlag}
                            <div class="item-header">
                                <label class="storeify-sl-item-row store-name">
                                    <a target="_blank" href="${storeProperties.url}" rel="nofollow">
                                        <strong>${storeProperties.name}</strong>
                                    </a>
                                </label>   
                                
                                <a class="getdirectionstore" href="${storeProperties.place_id}" target="_blank" aria-label="This link opens in a new tab.">Directions &#8594;</a> 
                            </div>
                            <div class="inner-item-wrapper">
                                <div class="item-thumb has-thumb">
                                    <img title="" src="${thumbnail}">
                                </div>
                                <div class="item-content">
                                    <div class="storeify-sl-item-row address">
                                        <a href="https://www.google.com/maps/place/Wilsons+Carpets,${storeProperties.name}" target="_blank">${storeProperties.address}</a>
                                        <div class="distance-element">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <path d="M20 2 L44 2 L52 62 L12 62 Z" fill="#414B52"/>

  <line x1="32" y1="8" x2="32" y2="16" stroke="white" stroke-width="4"/>
  <line x1="32" y1="22" x2="32" y2="30" stroke="white" stroke-width="4"/>
  <line x1="32" y1="36" x2="32" y2="44" stroke="white" stroke-width="4"/>
  <line x1="32" y1="50" x2="32" y2="58" stroke="white" stroke-width="4"/>
</svg>
                                            <div class="distance-calc"></div>
                                            <div class="distance-label"> Miles away</div>
                                        </div>
                                    </div>
                                    <div class="store-opening-times">
                                        ${openingTime}
                                    </div>
                                    <div class="store-details-modal-button" data-id="store-details-modal-${i}">
                                    Opening hours
                                    </div>
                                    <!--- 
                                    <div class="storeify-sl-item-row item-link">
                                        <a class="storeify-storelocator-web cta" target="_blank" href="${storeProperties.url}" rel="nofollow">
                                            <span class="storeify_sl_button_svg">
                                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.202 1.33349L16.6664 7.79796C17.3303 8.46185 17.3303 9.53824 16.6664 10.2021L10.202 16.6665C9.53812 17.3304 8.46173 17.3304 7.79784 16.6665L1.33337 10.2021C0.669477 9.53824 0.669477 8.46185 1.33337 7.79796L7.79784 1.33349C8.46173 0.669599 9.53812 0.669599 10.202 1.33349Z" stroke="currentColor" stroke-width="1.6"></path><path d="M7.20717 11.99V9.5704H10.3614L9.28416 10.713L10.2268 11.7127L12.9199 8.85635L10.2268 6L9.28416 6.99972L10.3614 8.14226H7.20717C6.83686 8.14226 6.51986 8.2821 6.25616 8.56179C5.99245 8.84147 5.8606 9.1777 5.8606 9.5704V11.99H7.20717Z" fill="currentColor"></path>
                                                </svg>
                                            </span> 
                                            View Store
                                        </a>
                                    </div>
                                    <div class="storeify-sl-item-row item-phone">
                                        <a href="tel:${storeProperties.phone}" class="phone-no cta">
                                          <span class="storeify_sl_button_svg">
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="#333" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.38965 1.88883C2.96296 1.88846 1.93012 3.02796 2.11813 4.25248C2.5443 7.0282 3.55803 9.20644 5.1255 10.7968C6.69171 12.3858 8.87297 13.451 11.7474 13.8923C12.9712 14.0803 14.1099 13.0481 14.1099 11.6212L14.1099 10.8129C14.1099 10.6866 14.0247 10.5762 13.9026 10.5442L11.7914 9.9908C11.7233 9.97295 11.651 9.98163 11.589 10.0151L10.4032 10.6554C9.63601 11.0697 8.58374 11.2018 7.71244 10.5938C6.85806 9.99767 5.99989 9.12859 5.41071 8.27112C4.80948 7.3961 4.94159 6.34348 5.36115 5.57338L5.99502 4.40994C6.02806 4.34819 6.03707 4.2753 6.0193 4.20753L5.46595 2.09639C5.43393 1.97423 5.32353 1.88905 5.19724 1.88905L4.38965 1.88883ZM0.470762 4.50541C0.0999112 2.09001 2.13421 0.221577 4.39009 0.222168L5.19723 0.22238C6.08115 0.222475 6.85403 0.818754 7.07815 1.67381L7.63151 3.78495C7.75647 4.26171 7.69573 4.76814 7.46155 5.20182L7.46007 5.20457L6.8247 6.37075C6.61189 6.76136 6.63706 7.11288 6.78437 7.32727C7.26194 8.02231 7.97865 8.74728 8.66615 9.227C8.87409 9.37208 9.22045 9.39993 9.61127 9.1889L10.7972 8.54856C11.2308 8.31438 11.7373 8.25363 12.214 8.3786L14.3252 8.93196C15.1803 9.1561 15.7766 9.92886 15.7766 10.8129L15.7766 11.6212C15.7766 13.8762 13.9098 15.9106 11.4944 15.5397C8.34059 15.0554 5.80517 13.8606 3.93849 11.9667C2.07307 10.0741 0.937697 7.54662 0.470762 4.50541Z" fill="currentColor"></path>
                                                </svg>
                                            </span> 
                                            <div class="phone-no-desktop-text">${storeProperties.phone}</div>
                                            <div class="phone-no-mobile-text">Speak to us</div>
                                        </a>
                                    </div>
                                    --->
                                    
                                </div>
                                <div class="item-mobile-ctas">
                                <div class="storeify-sl-item-row item-link">

                                        <a class="storeify-storelocator-web cta" target="_blank" href="${storeProperties.url}" rel="nofollow">
                                            View Store
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
  <path d="M6 3L11 8L6 13" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
                                        </a>
                                    </div>
                                    <div class="storeify-sl-item-row item-phone">
    
                                        <a href="tel:${storeProperties.phone}" class="phone-no cta">
                                                   <svg width="16" height="16" viewBox="0 0 16 16" fill="#333" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.38965 1.88883C2.96296 1.88846 1.93012 3.02796 2.11813 4.25248C2.5443 7.0282 3.55803 9.20644 5.1255 10.7968C6.69171 12.3858 8.87297 13.451 11.7474 13.8923C12.9712 14.0803 14.1099 13.0481 14.1099 11.6212L14.1099 10.8129C14.1099 10.6866 14.0247 10.5762 13.9026 10.5442L11.7914 9.9908C11.7233 9.97295 11.651 9.98163 11.589 10.0151L10.4032 10.6554C9.63601 11.0697 8.58374 11.2018 7.71244 10.5938C6.85806 9.99767 5.99989 9.12859 5.41071 8.27112C4.80948 7.3961 4.94159 6.34348 5.36115 5.57338L5.99502 4.40994C6.02806 4.34819 6.03707 4.2753 6.0193 4.20753L5.46595 2.09639C5.43393 1.97423 5.32353 1.88905 5.19724 1.88905L4.38965 1.88883ZM0.470762 4.50541C0.0999112 2.09001 2.13421 0.221577 4.39009 0.222168L5.19723 0.22238C6.08115 0.222475 6.85403 0.818754 7.07815 1.67381L7.63151 3.78495C7.75647 4.26171 7.69573 4.76814 7.46155 5.20182L7.46007 5.20457L6.8247 6.37075C6.61189 6.76136 6.63706 7.11288 6.78437 7.32727C7.26194 8.02231 7.97865 8.74728 8.66615 9.227C8.87409 9.37208 9.22045 9.39993 9.61127 9.1889L10.7972 8.54856C11.2308 8.31438 11.7373 8.25363 12.214 8.3786L14.3252 8.93196C15.1803 9.1561 15.7766 9.92886 15.7766 10.8129L15.7766 11.6212C15.7766 13.8762 13.9098 15.9106 11.4944 15.5397C8.34059 15.0554 5.80517 13.8606 3.93849 11.9667C2.07307 10.0741 0.937697 7.54662 0.470762 4.50541Z" fill="currentColor"></path>
                                                </svg>
                                                                                <div class="phone-no-desktop-text">${storeProperties.phone}</div>
                                            <div class="phone-no-mobile-text">Speak to us</div>
                                        </a>
                                    </div>
                                    
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="store-details-modal" id="store-details-modal-${i}">
                        <div class="store-details-modal-inner">
                            <div class="store-details-modal-header">
                                <div class="store-details-modal-title">
                                    Store information
                                </div>
                                <div class="store-details-modal-close" data-id="store-details-modal-${i}">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                                        <path d="M18 6L6 18M6 6l12 12"></path>
                                    </svg>
                                </div>
                            </div>
                            <div class="store-details-modal-address">
                                <div class="store-details-modal-store-title">
                                    <a target="_blank" href="${storeProperties.url}" rel="nofollow">
                                        <strong>${storeProperties.name}</strong>
                                    </a>
                                </div>
                                ${storeProperties.address}
                            </div>
                            <div class="store-details-modal-current-time">
                                ${openingTime}
                            </div>
                            <div class="store-details-modal-directions">
                                <a href="https://maps.google.com/?daddr=${storeProperties.name} ${storeProperties.address}" target="_blank" aria-label="This link opens in a new tab.">Directions </a> 
                            </div>
                            <div class="store-details-modal-opening-times">
                                <div class="store-details-modal-subtitle">
                                    Opening Times
                                </div>
                                ${fullOpeningTimes}
                            </div>
                        </div>
                    </div>
                    
                `;
                return storeHtml
        }
    }
    

    

    var loadScript = function(url, callback) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        // If the browser is Internet Explorer.
        if (script.readyState) {
            script.onreadystatechange = function() {
                if (script.readyState == "loaded" || script.readyState == "complete") {
                    script.onreadystatechange = null;
                    callback();
                }
            };
            // For any other browser.
        } else {
            script.onload = function() {
                callback();
            };
        }
        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
    };
    var storeifyappsJavaScript = function(jQuery) {
        var B64={alphabet:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",lookup:null,ie:/MSIE /.test(navigator.userAgent),ieo:/MSIE [67]/.test(navigator.userAgent),encode:function(a){var e,f,g,b=B64.toUtf8(a),c=-1,d=b.length,h=[,,];if(B64.ie){for(var i=[];++c<d;)e=b[c],f=b[++c],h[0]=e>>2,h[1]=(3&e)<<4|f>>4,isNaN(f)?h[2]=h[3]=64:(g=b[++c],h[2]=(15&f)<<2|g>>6,h[3]=isNaN(g)?64:63&g),i.push(B64.alphabet.charAt(h[0]),B64.alphabet.charAt(h[1]),B64.alphabet.charAt(h[2]),B64.alphabet.charAt(h[3]));return i.join("")}for(var i="";++c<d;)e=b[c],f=b[++c],h[0]=e>>2,h[1]=(3&e)<<4|f>>4,isNaN(f)?h[2]=h[3]=64:(g=b[++c],h[2]=(15&f)<<2|g>>6,h[3]=isNaN(g)?64:63&g),i+=B64.alphabet[h[0]]+B64.alphabet[h[1]]+B64.alphabet[h[2]]+B64.alphabet[h[3]];return i},decode:function(a){if(a.length%4)throw new Error("InvalidCharacterError: 'B64.decode' failed: The string to be decoded is not correctly encoded.");var b=B64.fromUtf8(a),c=0,d=b.length;if(B64.ieo){for(var e=[];d>c;)b[c]<128?e.push(String.fromCharCode(b[c++])):b[c]>191&&b[c]<224?e.push(String.fromCharCode((31&b[c++])<<6|63&b[c++])):e.push(String.fromCharCode((15&b[c++])<<12|(63&b[c++])<<6|63&b[c++]));return e.join("")}for(var e="";d>c;)e+=b[c]<128?String.fromCharCode(b[c++]):b[c]>191&&b[c]<224?String.fromCharCode((31&b[c++])<<6|63&b[c++]):String.fromCharCode((15&b[c++])<<12|(63&b[c++])<<6|63&b[c++]);return e},toUtf8:function(a){var d,b=-1,c=a.length,e=[];if(/^[\x00-\x7f]*$/.test(a))for(;++b<c;)e.push(a.charCodeAt(b));else for(;++b<c;)d=a.charCodeAt(b),128>d?e.push(d):2048>d?e.push(192|d>>6,128|63&d):e.push(224|d>>12,128|63&d>>6,128|63&d);return e},fromUtf8:function(a){var c,b=-1,d=[],e=[,,];if(!B64.lookup){for(c=B64.alphabet.length,B64.lookup={};++b<c;)B64.lookup[B64.alphabet.charAt(b)]=b;b=-1;}for(c=a.length;++b<c&&(e[0]=B64.lookup[a.charAt(b)],e[1]=B64.lookup[a.charAt(++b)],d.push(e[0]<<2|e[1]>>4),e[2]=B64.lookup[a.charAt(++b)],64!=e[2])&&(d.push((15&e[1])<<4|e[2]>>2),e[3]=B64.lookup[a.charAt(++b)],64!=e[3]);)d.push((3&e[2])<<6|e[3]);return d}};
        var replacer = function(finder, element, blackList, type = 1) {
            if (!finder) {
                return;
            }
            
            var regex = (typeof finder == 'string') ? new RegExp(finder, 'g') : finder;
            var childNodes = Array.from(element.childNodes); // Convert to array Ä‘á»ƒ trÃ¡nh lá»—i khi modify DOM
            var list = typeof blackList == 'undefined' ? 'html,head,style,title,link,meta,script,object,iframe,pre,a,' : blackList;
            
            for (var i = 0; i < childNodes.length; i++) {
                var node = childNodes[i];
                
                // Xá»­ lÃ½ element nodes - Ä‘á»‡ quy vÃ o cÃ¡c tháº» con (trá»« blacklist)
                if (node.nodeType === 1 && (list.indexOf(node.nodeName.toLowerCase() + ',') === -1)) {
                    replacer(finder, node, list, type);
                }
                
                // Xá»­ lÃ½ text nodes - kiá»ƒm tra vÃ  thay tháº¿ shortcode
                else if (node.nodeType === 3 && node.data && regex.test(node.data)) {
                    // Reset regex lastIndex
                    regex.lastIndex = 0;
                    
                    var newHTML = node.data.replace(regex, function(match, tagValue) {
                        if (type == 1) {
                            if (tagValue) {
                                return '<div class="storeifyapps-storelocator-shortcode ify-shortcode-default" id="storeifyapps-storelocator-shortcode-tags" data-tag="' + tagValue + '"></div>';
                            } else {
                                return '<div class="storeifyapps-storelocator-shortcode ify-shortcode-default" id="storeifyapps-storelocator-shortcode"></div>';
                            }
                        } else {
                            if (tagValue) {
                                return '<div class="storeifyapps-storelocator-short" id="storeifyapps-storelocator-short-tags" data-tag="' + tagValue + '"></div>';
                            } else {
                                return '<div class="storeifyapps-storelocator-short"></div>';
                            }
                        }
                    });
                    
                    // Thay tháº¿ ná»™i dung
                    if (newHTML !== node.data) {
                        var tempDiv = document.createElement('div');
                        tempDiv.innerHTML = newHTML;
                        var parent = node.parentNode;
                        
                        while (tempDiv.firstChild) {
                            parent.insertBefore(tempDiv.firstChild, node);
                        }
                        parent.removeChild(node);
                    }
                }
            }
        };

        if (typeof storeify_app_proxy_url !== 'undefined') {
            storeify_app_proxy_url = storeify_app_proxy_url;
        }else {
            storeify_app_proxy_url = url_app;
        }
        if (typeof storeify_app_url !== 'undefined') {
            storeify_app_url = storeify_app_url;
        }else {
            storeify_app_url = app_url_config;
        }
        
        var html_reponse_short = B64.decode(html_render_short);
        JSON.parse(B64.decode(products_render));
        var storelocator_tags_response = JSON.parse(B64.decode(tags_render));
        var storelocator_country = JSON.parse(B64.decode(array_country));
        var html_reponse = B64.decode(html_render);
        var html_list = JSON.parse(B64.decode(html_list_render));
        var gmarkers = [];
        var marker_search = null;
        var search_radius_circle = null;
        var map;
        var infowindow;
        var bounds;
        var randomID = 'main-slider-storelocator';
        var dataApps = window.storeifyStorelocator || {};
        var root_url = '/';
        var storelocator_lang = [];
        var ifyFieldsVisibility = {'map':[1,1,1,1,1,1,1,0]};
        var phone_icon = '<span class="storeify_sl_button_svg"><svg width="16" height="16" viewBox="0 0 16 16" fill="#333" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.38965 1.88883C2.96296 1.88846 1.93012 3.02796 2.11813 4.25248C2.5443 7.0282 3.55803 9.20644 5.1255 10.7968C6.69171 12.3858 8.87297 13.451 11.7474 13.8923C12.9712 14.0803 14.1099 13.0481 14.1099 11.6212L14.1099 10.8129C14.1099 10.6866 14.0247 10.5762 13.9026 10.5442L11.7914 9.9908C11.7233 9.97295 11.651 9.98163 11.589 10.0151L10.4032 10.6554C9.63601 11.0697 8.58374 11.2018 7.71244 10.5938C6.85806 9.99767 5.99989 9.12859 5.41071 8.27112C4.80948 7.3961 4.94159 6.34348 5.36115 5.57338L5.99502 4.40994C6.02806 4.34819 6.03707 4.2753 6.0193 4.20753L5.46595 2.09639C5.43393 1.97423 5.32353 1.88905 5.19724 1.88905L4.38965 1.88883ZM0.470762 4.50541C0.0999112 2.09001 2.13421 0.221577 4.39009 0.222168L5.19723 0.22238C6.08115 0.222475 6.85403 0.818754 7.07815 1.67381L7.63151 3.78495C7.75647 4.26171 7.69573 4.76814 7.46155 5.20182L7.46007 5.20457L6.8247 6.37075C6.61189 6.76136 6.63706 7.11288 6.78437 7.32727C7.26194 8.02231 7.97865 8.74728 8.66615 9.227C8.87409 9.37208 9.22045 9.39993 9.61127 9.1889L10.7972 8.54856C11.2308 8.31438 11.7373 8.25363 12.214 8.3786L14.3252 8.93196C15.1803 9.1561 15.7766 9.92886 15.7766 10.8129L15.7766 11.6212C15.7766 13.8762 13.9098 15.9106 11.4944 15.5397C8.34059 15.0554 5.80517 13.8606 3.93849 11.9667C2.07307 10.0741 0.937697 7.54662 0.470762 4.50541Z" fill="currentColor"></path></svg></span>';
        var web_icon = '<span class="storeify_sl_button_svg"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.202 1.33349L16.6664 7.79796C17.3303 8.46185 17.3303 9.53824 16.6664 10.2021L10.202 16.6665C9.53812 17.3304 8.46173 17.3304 7.79784 16.6665L1.33337 10.2021C0.669477 9.53824 0.669477 8.46185 1.33337 7.79796L7.79784 1.33349C8.46173 0.669599 9.53812 0.669599 10.202 1.33349Z" stroke="currentColor" stroke-width="1.6"></path><path d="M7.20717 11.99V9.5704H10.3614L9.28416 10.713L10.2268 11.7127L12.9199 8.85635L10.2268 6L9.28416 6.99972L10.3614 8.14226H7.20717C6.83686 8.14226 6.51986 8.2821 6.25616 8.56179C5.99245 8.84147 5.8606 9.1777 5.8606 9.5704V11.99H7.20717Z" fill="currentColor"></path></svg></span>';
        var email_icon = '<span class="storeify_sl_button_svg"><svg width="16" height="14" viewBox="0 0 16 14" fill="#333" xmlns="http://www.w3.org/2000/svg"><path d="M4.18568 4.30043C3.76862 4.1058 3.27275 4.28612 3.07812 4.70318C2.88349 5.12024 3.06381 5.61611 3.48087 5.81073L7.4126 7.64554C7.78489 7.81928 8.21499 7.81928 8.58728 7.64554L12.519 5.81073C12.9361 5.61611 13.1164 5.12024 12.9218 4.70318C12.7271 4.28612 12.2313 4.1058 11.8142 4.30043L7.99994 6.08042L4.18568 4.30043Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M3.27772 0.888916C1.59019 0.888916 0.222168 2.25693 0.222168 3.94447V10.0556C0.222168 11.7431 1.59019 13.1111 3.27772 13.1111H12.7222C14.4097 13.1111 15.7777 11.7431 15.7777 10.0556V3.94447C15.7777 2.25693 14.4097 0.888916 12.7222 0.888916H3.27772ZM1.88883 3.94447C1.88883 3.17741 2.51066 2.55558 3.27772 2.55558H12.7222C13.4892 2.55558 14.1111 3.17741 14.1111 3.94447V10.0556C14.1111 10.8226 13.4892 11.4445 12.7222 11.4445H3.27772C2.51066 11.4445 1.88883 10.8226 1.88883 10.0556V3.94447Z" fill="currentColor"></path></svg></span>';
        var ifyArr_country_region_city = {};
        if(typeof ifyArr_country_region != 'undefined')
            ifyArr_country_region_city = JSON.parse(B64.decode(ifyArr_country_region));

        var ify_Arr_country = {};
        if(typeof ifyArr_country != 'undefined')
            ify_Arr_country = JSON.parse(B64.decode(ifyArr_country));

        var ify_filter_region_city = window.ify_filter_region_city || 0;
        var ify_mode_filtercountry = window.ify_mode_filtercountry || 1;
        

        function clearSearchMarker() {
            if (marker_search != null) {
                marker_search.setMap(null);
                marker_search = null;
            }
            if (search_radius_circle != null) {
                search_radius_circle.setMap(null);
                search_radius_circle = null;
            }
        }

        function updateSearchCircleStyles(hasResults) {
            
            if (!search_radius_circle) return;
            if (hasResults) {
                search_radius_circle.setOptions({
                    strokeColor: '#BA3C3D',
                    strokeOpacity: 0.35,
                    strokeWeight: 1,
                    fillColor: '#BA3C3D',
                    fillOpacity: 0.1,
                    clickable: false
                });
            } else {
                search_radius_circle.setOptions({
                    strokeColor: '#FF0000',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#FF0000',
                    fillOpacity: 0.35,
                    clickable: false
                });
            }
        }

        let storeify_open_new_tab_index = 0;
        if(typeof storeify_open_new_tab !== 'undefined')
            storeify_open_new_tab_index = storeify_open_new_tab;
        if (typeof ify_fieldsVisibility !== 'undefined')
            ifyFieldsVisibility = JSON.parse(B64.decode(ify_fieldsVisibility));
        if (typeof ifylangs !== 'undefined')
            storelocator_lang = JSON.parse(B64.decode(ifylangs));
        if (typeof dataApps.lang !== 'undefined') {
            storelocator_lang = dataApps.lang;
        }
        if (dataApps.root_url && dataApps.root_url != '/') root_url = dataApps.root_url;

        ////////=========================
        var htmlListTrans = '';
        var isIfyTrans = false;
        var rootUrlCurrent = (root_url).replace("/", "");
        var locationList = dataApps.location_list;
        var localeCurrent = window.Shopify.locale;
        if(locationList !== undefined && rootUrlCurrent && locationList.includes(localeCurrent)){
            isIfyTrans = true;
        }
        /////==============
        // localeCurrent = 'vi';
        // isIfyTrans = true;
        /////==============
        var ify_layout = dataApps.ify_layout || 1;
        var ify_show_block_cart = window.ify_show_block_cart || 0;
        if(ify_show_block_cart === 1 && dataApps.shopify_template === 'cart')
            ify_show_block_cart = 1;
        else
            ify_show_block_cart = 0;

        // var limit_store = 5000;
        // var list_mode = 0;
        // var search_mode = 0;
        //code here

       // document.addEventListener('DOMContentLoaded', () => {
            
        //});
        
        function initMap() {
            var script = document.createElement('script');
            script.src = window.geojson_url;
            document.getElementsByTagName('head')[0].appendChild(script);
            if(document.getElementById("map") && !document.getElementById("storeify-detail-store")){
                locationDiv = document.getElementById("storeify_location");
                if(!locationDiv) locationDiv = document.getElementById("location");
                const ifyInputAddress = document.getElementById('address');
                var styledMapType = new google.maps.StyledMapType(JSON.parse(B64.decode(map_style_render)));
                map = new google.maps.Map(document.getElementById("map"), {
                    center: new google.maps.LatLng(center_lat, center_lng),
                    zoom: initial_zoom,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    mapTypeControl: false,
                    streetViewControl: false,
                    mapTypeControlOptions: {
                        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
                    }
                });
                map.mapTypes.set('styled_map', styledMapType);
                map.setMapTypeId('styled_map');
                infowindow = new google.maps.InfoWindow();
                bounds = new google.maps.LatLngBounds();
                new google.maps.places.SearchBox(ifyInputAddress);
                var tags_input = [];
                if (priority_search != 'global') {
                    const options = {
                        componentRestrictions: { country: priority_search },
                    };
                    const autocomplete = new google.maps.places.Autocomplete(ifyInputAddress, options);
                    google.maps.event.addListener(autocomplete, 'place_changed', function() {
                        searchLocation(priority_search);
                    });
                }
                else {
                    const autocomplete = new google.maps.places.Autocomplete(ifyInputAddress);
                    google.maps.event.addListener(autocomplete, 'place_changed', function() {
                        searchLocation(null);
                    });
                }
                jQuery.each(jQuery('input.storeifyapp_stores_tags_filter:checked'), function() {
                    tags_input.push(jQuery(this).val());
                });
                if (jQuery('input.storeifyapp_stores_country_filter').length) {
                    jQuery('input.storeifyapp_stores_country_filter:checked').val();                   
                }
                if (jQuery('input.storeifyapp_stores_region_filter').length) {
                    jQuery('input.storeifyapp_stores_region_filter:checked').val();                   
                }
                if (jQuery('input.storeifyapp_stores_city_filter').length) {
                    jQuery('input.storeifyapp_stores_city_filter:checked').val();                   
                }
                if(jQuery('.storeifyapp_stores_countrys_filter_list').data('tag') == 'select'){
                        jQuery('select.storeifyapp_stores_country_filter').val();
                }
                if(jQuery('.storeifyapp_stores_region_filter_list').data('tag') == 'select'){
                        jQuery('select.storeifyapp_stores_region_filter').val();
                }
                if(jQuery('.storeifyapp_stores_city_filter_list').data('tag') == 'select'){
                        jQuery('select.storeifyapp_stores_city_filter').val();
                }

                if (locationDiv) locationDiv.innerHTML = '<div id="' + randomID + '" class="list-item-3"></div>';
                var tilesloaded = google.maps.event.addListener(map, "tilesloaded", function() {
                    if(!isIfyTrans){
                        html_list = html_list.replaceAll("{{ directions }}",storelocator_lang.directions);
                        html_list = html_list.replaceAll("{{ link_detail }}",storelocator_lang.link_detail);
                        html_list = html_list.replaceAll("{{ load_map_text }}",storelocator_lang.load_map_text);
                        html_list = html_list.replaceAll("{{ ify_select_provider }}",storelocator_lang.ify_select_provider);
                       
                        
                        html_list = html_list.replaceAll("{{ ify_trans_contact_us }}", storelocator_lang.contact_store);
                        let open_new_tabText = 'This link opens in a new tab.';
                        if(typeof storelocator_lang.open_new_tab != 'undefined')
                            open_new_tabText = storelocator_lang.open_new_tab;
                        html_list = html_list.replaceAll("{{ open_new_tab }}",open_new_tabText);
                        if(!jQuery('.content-results-slt').hasClass('shortcode-tags-list'));else {
                           jQuery('.content-results-slt').removeClass('shortcode-tags-list'); 
                        }
                    }else {
                        if(!jQuery('.content-results-slt').hasClass('shortcode-tags-list'));else {
                           jQuery('.content-results-slt').removeClass('shortcode-tags-list'); 
                        }
                    }
                    jQuery("#results-slt").show();
                    google.maps.event.removeListener(tilesloaded);
                });

            async function runHolidayCheck() {
                await checkHolidays();
            }
            runHolidayCheck();

            }

        }

        function formatCmsStoreData() {
            let data = window.themeAssets.store_data;
            return {
                    type: "FeatureCollection",
                    features: data.address.map((address, index) => ({
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [
                            data.long ? Number(data.long[index]) : '',
                            data.lat[index] ? Number(data.lat[index]) : ''
                        ]
                    },
                    properties: {
                        category: "store",
                        address,
                        name: data.name ? data.name[index] : '',
                        thumbnail: data.thumbnail ? data.thumbnail[index] : '',
                        address: data.address ? data.address[index] : '',
                        url: data.url ? data.url[index] : '',
                        phone: data.address ? data.phone[index] : '',
                        lat: data.lat[index] ? data.lat[index] : '',
                        long: data.long[index] ? data.long[index] : '',
                        social: data.social ? data.social[index] : '',
                        tags: data.tags ? data.tags[index] : [],
                        opening_times: data.opening_times ? data.opening_times[index] : '',
                        country: data.country ? data.country[index] : '',
                        region: data.region ? data.region[index] : '',
                        city: data.city ? data.city[index] : '',
                        schedule: data.schedule ? data.schedule[index] : '',
                        schedule_text: data.schedule ? data.schedule_text[index] : '',
                        id: data.store_id ? Number(data.store_id[index]) : '',
                        email: data.email ? data.email[index] : '',
                        place_id: data.place_id ? data.place_id[index] : '',
                        featured_store: data.featured_store ? data.featured_store[index] : ''
                    }
                }))
            };
  
        }

        // format metadata
        let cms_store_data = formatCmsStoreData();


        window.eqfeed_callback = function(results) {
            var thum = '';
            var count_marker = 0;
            var params = [];
            var list = '';
            
            results = cms_store_data;
            
            for (var i = 0; i < results.features.length; i++) {
                var coords = results.features[i].geometry.coordinates;
                var latLng = new google.maps.LatLng(coords[1], coords[0]);
                
                var properties = results.features[i].properties;
                if (typeof properties.thumbnail !== 'undefined') {
                    thum = properties.thumbnail;
                }
                let trans = [];
                if(properties.trans !== undefined && properties.trans[localeCurrent] !== undefined){
                    trans = properties.trans[localeCurrent];
                }

                // create list here
                if(results.features[i]) {
                    list += create_html_list(results.features[i], [i]);
                }

                

                params.push({
                    country: properties.country,
                    region: properties.region,
                    city: properties.city,
                    tags: properties.tags,
                    web: properties.web,
                    email: properties.email,
                    phone: properties.phone,
                    thum: thum,
                    id: properties.id,
                    name: properties.name,
                    url: properties.url,
                    address: properties.address,
                    social: properties.social,
                    place_id: properties.place_id,
                    tags: properties.tags,
                    schedule: properties.schedule,
                    schedule_text: properties.schedule_text
                });
                if(map){
                    let data_maker = {
                        position: new google.maps.LatLng(coords[1], coords[0]),
                        social: properties.social,
                        country: properties.country,
                        region: properties.region,
                        city: properties.city,
                        tags: properties.tags,
                        web: properties.web,
                        email: properties.email,
                        phone: properties.phone,
                        thum: thum,
                        id: properties.id,
                        name: properties.name,
                        opening_times: properties.opening_times,
                        place_id: properties.place_id,
                        featured_store: properties.featured_store,
                        url: properties.url,
                        address: properties.address,
                        schedule: properties.schedule,
                        schedule_text: properties.schedule_text,
                        map: map,
                        icon_marker: properties.icon_marker,
                        num: i,
                        visible: true,
                        trans: trans

                    };
                    if (list_mode != 1 || (list_mode == 1 && i < limit_store)) {
                        bounds.extend(latLng);
                    } else {
                        data_maker.visible = false;
                    }
                    if((list_mode != 1 && list_mode != 3) || ((list_mode == 3 || list_mode == 1) && i < limit_store)){
                        count_marker++;
                    }
                
                    var marker = createMarker(data_maker, map);
                    gmarkers.push(marker);
                    
                }
                if(isIfyTrans){
                    htmlListTrans += create_html_list(properties[i], [i], true);
                    //htmlListTrans += listItem(properties.social, thum, properties.id, properties.name, properties.url, properties.address, properties.phone, properties.email, properties.web, null, properties.tags, i,search = null, trans, localeCurrent);
                }
                //                 if(i > 10) marker.setVisible(true);
            }
            jQuery('#' + randomID).html(list);

            let storeItems = document.getElementsByClassName('inner-item');
            for (let i = 0; i < storeItems.length; i++) {
                const storeItem = storeItems[i];
                if(storeItem) {
                    
                    storeItem.dataset.place;
                    
                }
            }

            if(isIfyTrans)
                jQuery('#' + randomID).html(htmlListTrans);
            if(map){
                if (count_marker > 1) {
                    jQuery("#storeify-text-result").text(jQuery("#storeify-text-result").data('results'));
                } else {
                    jQuery("#storeify-text-result").text(jQuery("#storeify-text-result").data('result'));
                }
                if(ify_layout != 8) document.getElementById("num-rs").innerHTML = count_marker;
                if (list_mode == 2 || limit_store == 0) {
                    jQuery("#results-slt h3.title").hide();
                    jQuery("#main-slider-storelocator").addClass('storeify-first-alert');
                }
                if (list_mode == 2 || limit_store == 0) {
                    jQuery("#results-slt h3.title").hide();
                    jQuery("#main-slider-storelocator").removeClass('storeify-first-alert');
                }
                if (center_lat == 0 && center_lng == 0) {
                    map.fitBounds(bounds);
                } else {
                    
                    map.setZoom(initial_zoom);
                    map.setCenter(new google.maps.LatLng(center_lat, center_lng));
                }
                document.getElementById("loading_mask_loader").style.display = 'none';

                setTimeout(() => {
                    loadGeolocationInit();
                    
                }, 1000);
                
                
            }
            if(shortcode_use == 1){
                new Shortcode(document.querySelector('body'), {
                  storeifyStorelocator: function() {
                    var country = this.options.country;
                    var city = this.options.city;
                    var class_text = 'storeify-list-country';
                    if(city){
                        class_text = 'storeify-list-city';
                    }
                    var htmlCountry = '<div class="'+class_text+'">';
                    jQuery.each(params, function( index, value ) {
                      if(country && value.country == country){
                        htmlCountry += '<div class="storeify-item-city">';
                        htmlCountry += '<div class="storelocator-title storeify-item-info"><a href="'+value.url+'">'+value.name+'</a></div>';
                        if (value.address != null) {
                            htmlCountry += '<div class="storeify-sl-item-row item-address storeify-item-info"><p>' + value.address + '</p></div>';
                        }
                        if (value.email != null && typeof value.email != 'undefined' && value.email != '') {
                            htmlCountry += '<div class="storeify-sl-item-row item-envelope storeify-item-info">'+email_icon+'';
                            htmlCountry += '<a href="mailto:' + value.email + '" class="phone-email">' + value.email + '</a></div>';
                        }
                        if (value.phone != null && typeof value.phone != 'undefined' && value.phone != '') {
                            htmlCountry += '<div class="storeify-sl-item-row item-phone storeify-item-info">'+phone_icon+'';
                            htmlCountry += '<a href="tel:' + value.phone + '" class="phone-no">' + value.phone + '</a></div>';
                        }
                        if (value.web != null && typeof value.web != 'undefined' && value.web != '') {
                            htmlCountry += '<div class="storeify-sl-item-row item-link storeify-item-info">'+web_icon+'';
                            htmlCountry += value.web + '</div>';
                        }
                        if (value.tags.length > 0) {
                            var tag_arr = value.tags;
                            var tag_html = '';
                            jQuery.each(tag_arr, function(i, val) {
                                tag_html += '<span class="tag-item tag-item-'+string_to_slug(val)+'"><i class="fa fa-check" aria-hidden="true"></i> ' + val + '</span>';
                            });
                            htmlCountry += '<div class="item-tags storeify-item-info">' + tag_html +'</div>';
                        }
                        if (value.social != null && typeof value.social != 'undefined' && value.social != '') {
                            htmlCountry += '<div class="storeify-storelocator-social-maker">' + value.social + '</div>';
                        }
                        htmlCountry += '</div>';
                      }
                        
                      if(city && value.city == city){
                        htmlCountry += '<div class="storeify-item-city">';
                        htmlCountry += '<div class="storelocator-title storeify-item-info"><a href="'+value.url+'">'+value.name+'</a></div>';
                        if (value.address != null) {
                            htmlCountry += '<div class="storeify-sl-item-row item-address storeify-item-info"><p>' + value.address + '</p></div>';
                        }
                        if (value.email != null && typeof value.email != 'undefined' && value.email != '') {
                            htmlCountry += '<div class="storeify-sl-item-row item-envelope storeify-item-info">'+email_icon+'';
                            htmlCountry += '<a href="mailto:' + value.email + '" class="phone-email">' + value.email + '</a></div>';
                        }
                        if (value.phone != null && typeof value.phone != 'undefined' && value.phone != '') {
                            htmlCountry += '<div class="storeify-sl-item-row item-phone storeify-item-info">'+phone_icon+'';
                            htmlCountry += '<a href="tel:' + value.phone + '" class="phone-no">' + value.phone + '</a></div>';
                        }
                        if (value.web != null && typeof value.web != 'undefined' && value.web != '') {
                            htmlCountry += '<div class="storeify-sl-item-row item-link storeify-item-info">'+web_icon+'';
                            htmlCountry += value.web + '</div>';
                        }
                        if (value.tags.length > 0) {
                            var tag_arr = value.tags;
                            var tag_html = '';
                            jQuery.each(tag_arr, function(i, val) {
                                tag_html += '<span class="tag-item tag-item-'+string_to_slug(val)+'"><i class="fa fa-check" aria-hidden="true"></i> ' + val + '</span>';
                            });
                            htmlCountry += '<div class="item-tags storeify-item-info">' + tag_html +'</div>';
                        }
                        if (value.social != null && typeof value.social != 'undefined' && value.social != '') {
                            htmlCountry += '<div class="storeify-storelocator-social-maker">' + value.social + '</div>';
                        }
                        htmlCountry += '</div>';
                      }
                          
                    });
                    htmlCountry +='</div>';
                    //return this.options.text;
                    return htmlCountry;
                  }
                });
            }

        };

        //================== filter ============
        var blackList;
        const finderIfy_1 = /\[storeify-storelocator(?:\s+tag=['"]([^'"]+)['"])?\s*\]/g;
        const finderIfy_2 = /\[storeify-storelocator-short(?:\s+tag=['"]([^'"]+)['"])?\s*\]/g;
        jQuery('body').each(function() {            replacer(finderIfy_1, jQuery(this).get(0), blackList, 1);
            replacer(finderIfy_2, jQuery(this).get(0), blackList, 2);
        });
        var arrLangmap = {
            'location' : storelocator_lang.location,
            'product_name' : storelocator_lang.product_name,
            'store_name' : storelocator_lang.store_name,
            'type_to_search' : storelocator_lang.type_to_search,
            'use_my_location' : storelocator_lang.use_my_location,
            'search_product' : storelocator_lang.search_product,
            'search_store' : storelocator_lang.search_store,
            'radius_2' : storelocator_lang.radius_2,
            'kilometers' : storelocator_lang.kilometers,
            'miles' : storelocator_lang.miles,
            'radius_1' : storelocator_lang.radius_1,
            'filter' : storelocator_lang.filter,
            'search' : storelocator_lang.search,
            'reset' : storelocator_lang.reset,
            'list' : storelocator_lang.list,
            'map' : storelocator_lang.map,
            'store_list' : storelocator_lang.store_list,
            'result' : storelocator_lang.result,
            'results' : storelocator_lang.results,
        };
        jQuery.each(arrLangmap, function( key, val ) {
          html_reponse = html_reponse.replaceAll("{{ "+key+" }}", val);
        });
        // jQuery('.storeifyapps-storelocator-shortcode').html(html_reponse);
        /* Check áº©n widget náº¿u cÃ³ block map */
        const listShortcode = document.querySelectorAll('.storeifyapps-storelocator-shortcode');
        if(listShortcode.length > 0){
            if(listShortcode.length > 1){
                listShortcode.forEach((el, index) => {
                  [...el.classList].filter(c => c !== 'storeifyapps-storelocator-shortcode');
                  // Kiá»ƒm tra class cá»¥ thá»ƒ
                  if(el.classList.contains('ify-shortcode-widget')){
                    jQuery('#storeify-sl-light-modal-wrapper').remove();
                    jQuery('#storeify-sl-btn-trigger-popup').remove();
                  }else {
                    jQuery('.storeifyapps-storelocator-shortcode').html(html_reponse);
                  }
                });
            }else {
                //jQuery('.storeifyapps-storelocator-shortcode').html(html_reponse);
                jQuery('#storeify-widget-loading').remove();
            }
        }/* end check */

        if (jQuery('.storeifyapps-storelocator-short').length) {
            jQuery('.storeifyapps-storelocator-short').html(html_reponse_short);
        }
        if(!isIfyTrans){
            storelocator_tags_response = storelocator_tags_response.replaceAll("{{ filter_tags }}",storelocator_lang.filter_tags);
            storelocator_country = storelocator_country.replaceAll("{{ all }}",storelocator_lang.all);
            storelocator_country = storelocator_country.replaceAll("{{ filter_country }}",storelocator_lang.filter_country);
            storelocator_country = storelocator_country.replaceAll("{{ select_country }}",storelocator_lang.select_country);
        
            jQuery('#tags').html(storelocator_tags_response);
            jQuery('#country_html').html(storelocator_country);
        }else {
            const ifyTagsObj = dataApps.tag_array;
            jQuery('#tags').html(ifyRenderTags(ifyTagsObj));
            const ifyCountrysObj = dataApps.country_array;
            jQuery('#country_html').html(ifyRenderCountrys(ify_Arr_country,ifyCountrysObj));
        }

        if(ify_filter_region_city == 1){
            renderDefaultRegion();
        }
        if(storelocator_tags_response == '' && jQuery('#stores-country-filter').length <= 0 ){
          jQuery('#btn-filter').hide();
        }
        if (jQuery('.storeifyapps-storelocator-equal').length) {
            jQuery('#frm-storelocator-search #map').css("height", (jQuery('.storeify-sear-box').outerHeight() + 540) + "px");
        }
        if (list_mode == 2 || limit_store == 0) {
            jQuery("#results-slt h3.title").hide();
            jQuery("#main-slider-storelocator").addClass('storeify-first-alert');
        }
        //================================

        function createMarker(data_maker, map, infowindow) {

            var html = '';
            html += '<div class="store-marker" style="max-width:400px">';
            html += '<div class="address-info"><div class="table-store-marker">';
            html += '<div class="row">';
            let nameText = data_maker.trans !== undefined && data_maker.trans['name'] !== undefined && data_maker.trans['name'] !== '' ? data_maker.trans['name'] : data_maker.name;
            html += '<p class="col-md-12 storeify-sl-item-row store-name">' + nameText + '</p>';
            if (data_maker.thum) {
                html += '<div class="col-md-4 store-image"><img src="' + data_maker.thum + '" alt="' + nameText + '"></div>';
                html += '<div class="col-md-8">';
            } else
                html += '<div class="col-md-12">';
            //html += '<tr><td><strong>' + trans['address'] + ':</strong></td><td><p>' + address + '</p></td></tr>';
            if(ifyFieldsVisibility['map'][0] == 1){
                let addressText = data_maker.trans !== undefined && data_maker.trans['address'] !== undefined && data_maker.trans['address'] !== '' ? data_maker.trans['address'] : data_maker.address;
                html += '<p class="storeify-sl-item-row">' + addressText + '</p>';
            }

            if (data_maker.email != null && typeof data_maker.email != 'undefined' && data_maker.email != '' && ifyFieldsVisibility['map'][1] == 1) {
                html += '<p class="storeify-sl-item-row marker-envelope">'+email_icon+' <a href="mailto:' + data_maker.email + '">' + data_maker.email + '</a></p>';
            }
            if (data_maker.phone != null && typeof data_maker.phone != 'undefined' && data_maker.phone != '' && ifyFieldsVisibility['map'][2] == 1) {
                html += '<p class="storeify-sl-item-row marker-phone">'+phone_icon+' <a href="tel:' + data_maker.phone + '">' + data_maker.phone + '</a></p>';
            }
            if (data_maker.web != null && typeof data_maker.web != 'undefined' && data_maker.web != '' && ifyFieldsVisibility['map'][3] == 1) {
                html += '<p class="storeify-sl-item-row marker-link">'+web_icon+' ' + data_maker.web + '</p>';
            }
            if (data_maker.tags.length > 0 && ifyFieldsVisibility['map'][4] == 1) {
                //html += '<label>' + storelocator_lang.web + ': </label>';
                var tag_arr = data_maker.tags;
                var tag_html = '';
                let tagsText =  data_maker.trans !== undefined && data_maker.trans['tags'] !== undefined &&  data_maker.trans['tags'].length > 0 ?  data_maker.trans['tags'] : tag_arr;
                jQuery.each(tag_arr, function(key, value) {
                    let  tagText = tagsText[key] !== undefined && tagsText[key] !== '' ? tagsText[key] : value;
                    tag_html += '<span class="tag-item tag-item-'+string_to_slug(value)+'"><i class="fa fa-check" aria-hidden="true"></i> ' + tagText + '</span>';
                });
                html += '<p class="tag-items">' + tag_html + '</p>';
            }
            if (data_maker.email != null && typeof data_maker.email != 'undefined' && data_maker.email != '' && ifyFieldsVisibility['map'][7] != undefined && ifyFieldsVisibility['map'][7] == 1 && dataApps.show_contact_us == 1) {
                html += '<p class="storeify-sl-item-row item-link ify-item-btn-contact" ><span data-email="' + data_maker.email + '" data-store="' + data_maker.id + '">' + storelocator_lang.contact_store + '</span></p>';
            }
            if (data_maker.social != null && typeof data_maker.social != 'undefined' && data_maker.social != '' && ifyFieldsVisibility['map'][5] == 1) {
                html += '<div class="storeify-storelocator-social-maker">' + data_maker.social + '</div>';
            }
            html +='</div>';
            html +='<div class="col-md-12">';
            let open_new_tab = '';
            if(storeify_open_new_tab_index == 1)
               open_new_tab = 'target="_blank" aria-label="'+storelocator_lang.open_new_tab+'"';
            if (data_maker.schedule != null && typeof data_maker.schedule != 'undefined' && data_maker.schedule != '' && store_schedule == 1 && ifyFieldsVisibility['map'][6] == 1) {
                $arrLangschedule = {
                    'mon' : storelocator_lang.mon,
                    'tue' : storelocator_lang.tue,
                    'wed' : storelocator_lang.wed,
                    'thu' : storelocator_lang.thu,
                    'fri' : storelocator_lang.fri,
                    'sat' : storelocator_lang.sat,
                    'sun' : storelocator_lang.sun,
                    'store_operation' : storelocator_lang.store_operation,
                    'am' : storelocator_lang.am,
                    'pm' : storelocator_lang.pm,
                    'closed' : storelocator_lang.closed,
                    'the_next_day' : storelocator_lang.the_next_day,
                };
                let htmlSchedule = data_maker.schedule;
                jQuery.each($arrLangschedule, function( key, val ) {
                  htmlSchedule = htmlSchedule.replaceAll("{{ "+key+" }}", val);
                });
                html += '<div class="ify-col-schedule">'+htmlSchedule+'</div>';
            }
            if(ify_show_block_cart === 1)
                html += '<button type="button" class="ify-select-provider" data-id="'+data_maker.id+'"> '+storelocator_lang.ify_select_provider+' </button>';
            if (data_maker.url != null) {
                html += '<a class="linkdetailstore" href="' + data_maker.url + '">' + storelocator_lang.link_detail + '</a>';
            }
            html += '<a class="getdirectionstore" href="https://maps.google.com/?daddr=' + data_maker.address + '&saddr=" '+open_new_tab+'>' + storelocator_lang.directions + '</a></div>';
            html += '<div id="' + data_maker.id + '"></div></div>';
            html += '</div></div></div></div>';
            var marker = new google.maps.Marker(data_maker);
            
            var icon_marker_url = window.default_marker;
            
            if(window.icon_marker != '') icon_marker_url = window.icon_marker;
            // if (data_maker.icon_marker != null && data_maker.icon_marker != "")  icon_marker_url = data_maker.icon_marker;
            var icon = {
              url: icon_marker_url, // url
              scaledSize: new google.maps.Size(30, 43), // scaled size
              // origin: new google.maps.Point(0,0), // origin
              // anchor: new google.maps.Point(0, 0) // anchor
            };

            if(data_maker.featured_store == '1') {
                icon.scaledSize = new google.maps.Size(45, 64);
                icon.url = window.themeAssets.bed_marker;
            }

            marker.setIcon(icon);
            
            google.maps.event.addListener(marker, 'click', function(evt) { // the click event function is called with the "event" as an argument
                if(jQuery('.chose-search-slt').val() == 'location'){
                    address = jQuery('#address').val();
                    html = html.replace("saddr=", "saddr="+address);
                }
                // load info window here 
                
                

                let infoWindowWrapper = document.getElementById('info-window-wrapper');
                $(infoWindowWrapper).html('');

                if($(window).width() < 768) {
                    var top = $(infoWindowWrapper).offset().top - 400;
                    $('html,body').animate({scrollTop: top}, 1000);
                }
                
                let storeInfo = create_html_list(data_maker, 0, true);
                
                $(infoWindowWrapper).html(storeInfo);
                
                $(infoWindowWrapper).find('.store-item')[0].removeAttribute('datamarker');
                // add store time
                
                getCurrentDayOpeningTime($(infoWindowWrapper).context);
                map.getCenter();
                $(infoWindowWrapper).find('.distance-element');


                if ('geolocation' in navigator) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const userLocation = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude
                            };

                            
                            distanceMiles(userLocation.lat, userLocation.lng, data_maker.position.lat(), data_maker.position.lng());
    
                        },
                        (error) => {
                            console.error('Location error:', error);
                        },
                        {
                            enableHighAccuracy: true,
                            timeout: 10000,
                            maximumAge: 300000 // 5 minutes
                        }
                    );
                } else {
                    console.error('Geolocation is not supported by this browser.');
                }
                
                
                
                
                showInfoWindow(evt, this, map);
                var $container = jQuery('#main-slider-storelocator');

                
                if ($container.length) {
                    var markerSelector = '.item[datamarker="' + data_maker.num + '"] .inner-item';
                    var idSelector = '.inner-item[data-storeify-id="' + data_maker.id + '"]';

                    

                    var $target = $container.find(markerSelector);
                    
                    if (!$target.length) {
                        $target = $container.find(idSelector);
                    }
                    if (!$target.length) {
                        $target = jQuery(markerSelector + ',' + idSelector).first();
                    }

                    
                    
                    if ($target.length) {
                        $container.find('.inner-item').removeClass('inner-item-active');
                        $target.addClass('inner-item-active');
                        
                        var scrollTop = $target.offset().top - $container.offset().top + $container.scrollTop() - 20;
                        $container.stop().animate({ scrollTop: scrollTop }, 300);
                    }
                }
            });
            return marker;
        }
        function string_to_slug (str) {
            str = str.replace(/^\s+|\s+$/g, ''); // trim
            str = str.toLowerCase();
          
            // remove accents, swap ÃƒÂ± for n, etc
            var from = "Ãƒ ÃƒÂ¡ÃƒÂ¤ÃƒÂ¢ÃƒÂ¨ÃƒÂ©ÃƒÂ«ÃƒÂªÃƒÂ¬ÃƒÂ­ÃƒÂ¯ÃƒÂ®ÃƒÂ²ÃƒÂ³ÃƒÂ¶ÃƒÂ´ÃƒÂ¹ÃƒÂºÃƒÂ¼ÃƒÂ»ÃƒÂ±ÃƒÂ§Ã‚Â·/_,:;";
            var to   = "aaaaeeeeiiiioooouuuunc------";
            for (var i=0, l=from.length ; i<l ; i++) {
                str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
            }

            str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
                .replace(/\s+/g, '-') // collapse whitespace and replace by -
                .replace(/-+/g, '-'); // collapse dashes

            return str;
        }
        function showInfoWindow(evt, marker, map, infowindow, html) {
            map.panTo(marker.getPosition());

            // var currentIcon = gmarkers[markerNum];
            // currentIcon.setAnimation(null);

            // if (currentIcon.getAnimation() != null) {
            //     currentIcon.setAnimation(null);
            // } else {
            //     marker.setAnimation(google.maps.Animation.BOUNCE);
            //     setTimeout(function() {
            //         currentIcon.setAnimation(null);
            //     }, 500);
            // }
            gmarkers.forEach(storeMarker => {
                storeMarker.setAnimation(null);
            });
            marker.setAnimation(google.maps.Animation.BOUNCE);
        
        

            // if (marker.getVisible() && (marker.getMap() != null)) {
            //     infowindow.setContent(html);
            //     infowindow.open(map, marker);
            // } else {
            //     infowindow.setContent(html);
            //     infowindow.setPosition(marker.getPosition());
            //     infowindow.open(map);
            //     google.maps.event.addListenerOnce(map, 'idle', function() {
            //         infowindow.setContent(html);
            //         infowindow.open(map, marker);
            //     });
            // }
        }

        function degreesToRadians(degrees) {
            return degrees * Math.PI / 180;
        }

        function getDistanceBetweenPoints(lat1, lng1, lat2, lng2) {
            // The radius of the planet earth in meters
            let R = 6378137;
            let dLat = degreesToRadians(lat2 - lat1);
            let dLong = degreesToRadians(lng2 - lng1);
            let a = Math.sin(dLat / 2) *
                Math.sin(dLat / 2) +
                Math.cos(degreesToRadians(lat1)) *
                Math.cos(degreesToRadians(lat1)) *
                Math.sin(dLong / 2) *
                Math.sin(dLong / 2);

            let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            let distance = R * c;

            return distance;
        }

        function superbag(sup, sub) {
            if (sup.length < sub.length)
                return false;
            sup.sort();
            sub.sort();
            var i, j;
            for (i = 0, j = 0; i < sup.length && j < sub.length;) {

                if (sup[i] < sub[j]) {
                    ++i;
                } else if (sup[i] == sub[j]) {
                    ++i;
                    ++j;
                } else {
                    // sub[j] not in sup, so sub not subbag
                    return false;
                }
            }
            // make sure there are no elements left in sub

            if (j < sub.length)
                return false;
            else
                return true;

        }
            /*
        function checkDistanceBetweenPoints(lat1, lng1, lat2, lng2, radius, dv = 0.001){
            var check = -1;
            if(getDistanceBetweenPoints(lat1, lng1, lat2, lng2)*dv <= radius )
              check = getDistanceBetweenPoints(lat1, lng1, lat2, lng2)*dv;
            return check;
        }*/
            /*Fix for IE*/
        function checkDistanceBetweenPoints(lat1, lng1, lat2, lng2, radius) {
                var dv = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0.001;
                var check = -1;
                if (getDistanceBetweenPoints(lat1, lng1, lat2, lng2) * dv <= radius)
                    check = getDistanceBetweenPoints(lat1, lng1, lat2, lng2) * dv;
                return check;
            }
            /**/
        function checkTag(tag, tags) {
            var check = 0;

            if (tag.length == 0 || superbag(tags, tag) == true)
                check = 1;
            return check;
        }

        function distanceMiles(lat1, lon1, lat2, lon2) {
            
            const R = 3958.8; // Earth radius in miles

            const toRad = deg => deg * Math.PI / 180;

            const dLat = toRad(lat2 - lat1);
            const dLon = toRad(lon2 - lon1);

            const a =
                Math.sin(dLat / 2) ** 2 +
                Math.cos(toRad(lat1)) *
                Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) ** 2;

            const c = 2 * Math.asin(Math.sqrt(a));

            return R * c;
        }

        function addAnalytic(resultGeo,count){
            var url = storeify_app_url + '/add-analytic';
            var data = {
              'lat':resultGeo.geometry.location.lat(),
              'lng':resultGeo.geometry.location.lng(),
              'result':resultGeo.address_components,
              'address':resultGeo.formatted_address,
              'count':count,
              'domain':Shopify.shop,
            };
            jQuery.ajax({
                url: url,
                type: "post",
                data: data,
                cache: false,
                dataType: "json",
            }).done(function(data) {
               
            }).fail(function() {
                
            });
        }

        function searchLocationsNear(resultGeo, map, bounds, gmarkers,search) {

            document.getElementById('info-window-wrapper').removeAttribute('order');

            // radius set here 
            var radius = document.getElementById('radius_search').value;
            
            var center = resultGeo.geometry.location;

            bounds = new google.maps.LatLngBounds();
            //var searchUrl = baseurl + 'all/ajax?lat=' + center.lat() + '&lng=' + center.lng() + '&radius=' + radius + '&shop=' + Shopify.shop;
            storeify_app_proxy_url + '/all/ajax'; //?lat=' + center.lat() + '&lng=' + center.lng() + '&radius=' + radius + '&radius=' + Shopify.shop;
            var tags_check = [];
            jQuery.each(jQuery('input.storeifyapp_stores_tags_filter:checked'), function() {
                tags_check.push(jQuery(this).val());
            });
            var filter_country = 'all',filter_region = 'ify_all',filter_city = 'ify_all';
            if (jQuery('input.storeifyapp_stores_country_filter').length) {
                filter_country = jQuery('input.storeifyapp_stores_country_filter:checked').val();                   
            }
            if (jQuery('input.storeifyapp_stores_region_filter').length) {
                filter_region = jQuery('input.storeifyapp_stores_region_filter:checked').val();                   
            }
            if (jQuery('input.storeifyapp_stores_city_filter').length) {
                filter_city = jQuery('input.storeifyapp_stores_city_filter:checked').val();                   
            }
            if(jQuery('.storeifyapp_stores_countrys_filter_list').data('tag') == 'select'){
                filter_country = jQuery('select.storeifyapp_stores_country_filter').val();
            }
            if(jQuery('.storeifyapp_stores_region_filter_list').data('tag') == 'select'){
                filter_region = jQuery('select.storeifyapp_stores_region_filter').val();
            }
            if(jQuery('.storeifyapp_stores_city_filter_list').data('tag') == 'select'){
                filter_city = jQuery('select.storeifyapp_stores_city_filter').val();
            }
            if(filter_region == 'unnamed_region') filter_region = '';
            if(filter_city == 'unnamed_city') filter_city = '';

            var check_country = 0;
            ({
                lat: center.lat(),
                lng: center.lng(),
                shop: Shopify.shop});
            var marker_count = 0;
            var marker_first;
            var dv = 1;
            if (radius_unit == 1) {
                dv = 0.001;
            } else {
                dv = 0.00062137;
            }
            var array_poin = [];
            for (var i = 0; i < gmarkers.length; i++) {
                
                marker = gmarkers[i];
                var distance = checkDistanceBetweenPoints(center.lat(), center.lng(), marker.position.lat(), marker.position.lng(), radius, dv);
                check_country = 0;

                if ( (filter_country == 'all' || filter_country == marker.country) && (filter_region == 'ify_all' || filter_region == marker.region) && (filter_city == 'ify_all' || filter_city == marker.city) ) {
                    check_country = 1;
                }
                if (distance > -1 && checkTag(tags_check, marker.tags) && check_country == 1) {
                    thum = null;
                    if (typeof marker.thum !== 'undefined') {
                        thum = marker.thum;
                    }
                    var id = marker.id;
                    var name = marker.name;
                    var url = marker.url;
                    var address = marker.address;
                    var phone = marker.phone;
                    var email = marker.email;
                    var web = marker.web;
                    var tags = marker.tags;
                    var social = marker.social;
                    var num = marker.num;
                    var place_id = marker.place_id;
                    array_poin[i] = {
                        social: social,
                        thum: thum,
                        id: id,
                        name: name,
                        url: url,
                        address: address,
                        phone: phone,
                        email: email,
                        web: web,
                        distance: distance,
                        tags: tags,
                        marker_count: marker_count,
                        num: num,
                        place_id: place_id,
                        trans:marker.trans !== undefined ? marker.trans : [],
                    };
                    marker.setVisible(true);
                    marker_first = marker;
                    marker_count++;
                    bounds.extend(marker.getPosition());
                } else {
                    marker.setVisible(false);
                }
            }

            map.fitBounds(bounds);
            if(ify_layout != 8) document.getElementById("num-rs").innerHTML = marker_count;
            //jQuery("#results-slt h3.title").show();
            jQuery("#main-slider-storelocator").removeClass('storeify-first-alert');
            if (marker_count > 0) {
                array_poin = array_poin.sort(function(a, b) {
                    return a.distance - b.distance;
                });
//                var html_list = '';
                let stores = document.getElementsByClassName('inner-item');
                
                for (let i = 0; i < stores.length; i++) {
                    stores[i].parentNode.classList.add('store-item-hide');
                    // stores[i].parentNode.removeProperty('order')
                }
                if(ify_layout != 8)
                
                for (var i = 0; i < array_poin.length; i++) {
                    if(array_poin[i] && array_poin[i].id) {
                        let store = document.getElementById('store_id_' + array_poin[i].id);
                        if(store && store.parentNode) {
                            
                            store.parentNode.style.setProperty('order', i + 1);
                            store.parentNode.classList.remove('store-item-hide');
                            store.parentNode.classList.remove('store-closest');
                            if(i === 0) {
                                store.classList.add('inner-item-active');
                                
                                array_poin[i];
                                gmarkers.forEach(storeMarker => {
                                    storeMarker.setAnimation(null);
                                    if(storeMarker.id === array_poin[i].id) {
                                        storeMarker.setAnimation(google.maps.Animation.BOUNCE);
                                        store.parentNode.classList.add('store-closest');
                                    if ('geolocation' in navigator) {
                                        navigator.geolocation.getCurrentPosition(
                                            (position) => {
                                                ({
                                                    lat: position.coords.latitude,
                                                    lng: position.coords.longitude
                                                });

                                                
                                              //distanceMilesAPI(center.lat(), center.lng(), store.dataset.lat, store.dataset.long, store.querySelector('.distance-element'))
                                                
                                            },
                                            (error) => {
                                                console.error('Location error:', error);
                                            },
                                            {
                                                enableHighAccuracy: true,
                                                timeout: 10000,
                                                maximumAge: 300000 // 5 minutes
                                            }
                                        );
                                    } else {
                                        console.error('Geolocation is not supported by this browser.');
                                    }
                                    }

                                });
                            }
                        }
                        
                    }
                    
                    // store.parentNode.classList.remove('store-item-hide')
                }
                
                // for (var i = 0; i < marker_count; i++) {
            
                //     let store = document.getElementById('store_id_' + array_poin[i].id)
                //     console.log(store)
                //     store.parentNode.classList.remove('store-item-hide')
                // }
                if(marker_count == 1){
                    map.setCenter(marker_first.getPosition());
                    map.setZoom(search_result_zoom);
                }else {
                    var zoom = map.getZoom();
                    zoom = Math.min(zoom, 12);
                    map.setZoom(zoom);
                }

                for (let i = 0; i < stores.length; i++) {
                    let radius = document.getElementById('radius_search').value;
                    // let center = map.getCenter();
                    let dv = 0.00062137;
                    
                    checkDistanceBetweenPoints(center.lat(), center.lng(), stores[i].dataset.lat, stores[i].dataset.long, radius, dv);
                    
                    let distanceWrapper = stores[i].querySelector('.distance-element');
                    
                   
                    
                    
                    if ('geolocation' in navigator) {
                        navigator.geolocation.getCurrentPosition(
                            (position) => {
                                ({
                                    lat: position.coords.latitude,
                                    lng: position.coords.longitude
                                });
                                
                                
                                distanceMiles(center.lat(), center.lng(), Number(stores[i].dataset.lat), Number(stores[i].dataset.long), distanceWrapper, stores[i]);
        
                            },
                            (error) => {
                                console.error('Location error:', error);
                            },
                            {
                                enableHighAccuracy: true,
                                timeout: 10000,
                                maximumAge: 300000 // 5 minutes
                            }
                        );
                    } else {
                        console.error('Geolocation is not supported by this browser.');
                    }
                    

                }

                if($(window).width() < 768) {
                    
                    // Open marker

                    let infoWindowWrapper = document.getElementById('info-window-wrapper');
                    $(infoWindowWrapper).html('');

                    // if($(window).width() < 768) {
                    //     // var top = $(infoWindowWrapper).offset().top - 400;
                    //     // $('html,body').animate({scrollTop: top}, 1000);
                    // }
                    
                    let storeInfo = $('.store-closest')[0].outerHTML;
                    
                    $(infoWindowWrapper).html(storeInfo);
                    
                    
                    getCurrentDayOpeningTime($(infoWindowWrapper).context);
                }

                jQuery("#storeify-text-result").text(jQuery("#storeify-text-result").data('results'));
                // jQuery('#' + randomID).html(html_list);


            }
            updateSearchCircleStyles(marker_count > 0);
            if (marker_count == 0) {
                
                map.setZoom(search_result_zoom);
                map.setCenter(new google.maps.LatLng(center.lat(), center.lng()));
                
                document.getElementById("loading_mask_loader").style.display = 'none';

                jQuery("#results-slt").hide();
                var address = document.getElementById("address").value;
                //alert(trans['store_near'] + address); //"store_near"
                jQuery("#storeify-text-result").text(jQuery("#storeify-text-result").data('result'));
                jQuery('#results-empty').html('<h5 class="alert alert-danger">' + storelocator_lang.store_near + ' <i>"' + address + '"</i></h5>');
                addAnalytic(resultGeo,marker_count);
                return;
            }

            jQuery('#results-empty').html('<h5></h5>');
            jQuery("#results-slt").show();
            var thum = '';


            // map.fitBounds(bounds);
            // var zoom = map.getZoom();
            // zoom = Math.min(zoom, 12);
            // jQuery(".map-tab-mobile-bnt-item").attr("data-zoom",zoom);
            // map.setZoom(zoom);
            document.getElementById("loading_mask_loader").style.display = 'none';
            addAnalytic(resultGeo,marker_count);

        }
        function searchLocationsNearShort(resultGeo) {
          clearSearchMarker();
          var center = resultGeo.geometry.location;
          if(infowindow) infowindow.close();
          var radius = document.getElementById('radius_search').value;
          //var searchUrl = baseurl + 'all/ajax?lat=' + center.lat() + '&lng=' + center.lng() + '&radius=' + radius + '&shop=' + Shopify.shop;
          storeify_app_proxy_url + '/all/ajax';//?lat=' + center.lat() + '&lng=' + center.lng() + '&radius=' + radius + '&radius=' + Shopify.shop;
          var tags_check = [];
          var check_country = 0;
          ({lat:center.lat(),lng:center.lng(),shop: Shopify.shop});
            var marker_count = 0;
            var dv = 1;
            if(radius_unit == 1 ){
                dv = 0.001; 
            }else {
                dv= 0.00062137;
            }
            var array_poin = [];
            for (var i = 0; i < gmarkers.length; i++) {
                marker = gmarkers[i];
                var distance = checkDistanceBetweenPoints(center.lat(), center.lng(), marker.position.lat(), marker.position.lng(), radius, dv);
                check_country = 0;

                {
                    check_country = 1;
                }
                if (distance > -1 && checkTag(tags_check, marker.tags) && check_country == 1) {
                    thum = null;
                    if (typeof marker.thum !== 'undefined') {
                        thum = marker.thum;
                    }
                    var id = marker.id;
                    var name = marker.name;
                    var url = marker.url;
                    var address = marker.address;
                    var phone = marker.phone;
                    var email = marker.email;
                    var web = marker.web;
                    var tags = marker.tags;
                    var social = marker.social;
                    var num = marker.num;
                    array_poin[i] = {
                        social: social,
                        thum: thum,
                        id: id,
                        name: name,
                        url: url,
                        address: address,
                        phone: phone,
                        email: email,
                        web: web,
                        distance: distance,
                        tags: tags,
                        marker_count: marker_count,
                        num: num,
                        trans: marker.trans !== undefined ? marker.trans : [],
                    };
                    marker.setVisible(true);
                    marker_count++;
                } else {
                    marker.setVisible(false);
                }
            }

            // markerCluster.setIgnoreHidden(true);
            // markerCluster.repaint();
            // markerCluster.fitMapToMarkers();

            document.getElementById("storeify-storeloctor-contactFrm").style.display = 'block';
            document.getElementById("loading_mask_loader").style.display = 'none';
            updateSearchCircleStyles(marker_count > 0);
            if(marker_count > 0 ){
                

                array_poin = array_poin.sort(function (a, b) {
                return a.distance - b.distance ;
                });
                var html_list='';
                if(ify_layout != 8)
                for (var i = 0; i < marker_count; i++) {
                    html_list += create_html_list(array_poin[i], [i], true);
                    //html_list += listItem(array_poin[i].social, array_poin[i].thum, array_poin[i].id, array_poin[i].name, array_poin[i].url, array_poin[i].address, array_poin[i].phone, array_poin[i].email, array_poin[i].web, array_poin[i].distance, array_poin[i].tags, array_poin[i].num, null, array_poin[i].trans);
                }
                if(ify_layout != 8) document.getElementById("num-rs").innerHTML = marker_count;
                jQuery('#results-slt .list-custo-storeify').html(html_list);
            }else {
              if(ify_layout != 8) document.getElementById("num-rs").innerHTML = marker_count;
              jQuery("#storeify-text-result").text(jQuery("#storeify-text-result").data('result'));
              jQuery('#results-slt .list-custo-storeify').html('');
              jQuery('#results-empty').html('<h5 class="alert alert-danger">'+ storelocator_lang.store_near +'<i>"'+ address+'"</i></h5>');
            }
          

        }
        function searchStoresByName() {
            clearSearchMarker();
            if(infowindow) infowindow.close();
            bounds = new google.maps.LatLngBounds();
            document.getElementById("loading_mask_loader").style.display = '';
            jQuery('.content-results-slt').removeClass('content-results-first');
            var search_text = jQuery.trim(document.getElementById("store_search").value);
            var tags = [];
            jQuery.each(jQuery('input.storeifyapp_stores_tags_filter:checked'), function() {
                tags.push(jQuery(this).val());
            });
            var filter_country = 'all',filter_region = 'ify_all',filter_city = 'ify_all';
            if (jQuery('input.storeifyapp_stores_country_filter').length) {
                filter_country = jQuery('input.storeifyapp_stores_country_filter:checked').val();                   
            }
            if (jQuery('input.storeifyapp_stores_region_filter').length) {
                filter_region = jQuery('input.storeifyapp_stores_region_filter:checked').val();                   
            }
            if (jQuery('input.storeifyapp_stores_city_filter').length) {
                filter_city = jQuery('input.storeifyapp_stores_city_filter:checked').val();                   
            }
            if(jQuery('.storeifyapp_stores_countrys_filter_list').data('tag') == 'select'){
                filter_country = jQuery('select.storeifyapp_stores_country_filter').val();
            }
            if(jQuery('.storeifyapp_stores_region_filter_list').data('tag') == 'select'){
                filter_region = jQuery('select.storeifyapp_stores_region_filter').val();
            }
            if(jQuery('.storeifyapp_stores_city_filter_list').data('tag') == 'select'){
                filter_city = jQuery('select.storeifyapp_stores_city_filter').val();
            }
            if(filter_region == 'unnamed_region') filter_region = '';
            if(filter_city == 'unnamed_city') filter_city = '';

            var data = {
                name: search_text,
                shop: Shopify.shop,
                tags: tags.join(','),
                country: filter_country,
                region: filter_region,
                city: filter_city,
                v: 2
            };
            if(isIfyTrans)
                data.locale = localeCurrent;
            var searchUrl = storeify_app_proxy_url + '/searchbyname'; //?name=' + search_text + '&shop=' + Shopify.shop;
            jQuery.ajaxSetup({
                headers: {
                    'X-CSRF-TOKEN': jQuery('input[name="_token"]').val()
                }
            });
            jQuery.ajax({
                url: searchUrl,
                type: "GET",
                data: data,
                cache: false,
                dataType: "json",
            }).done(function(data) {

                var markerNodes = data.data;

                if (markerNodes.length == 0) {

                    document.getElementById("loading_mask_loader").style.display = 'none';
                    jQuery("#results-slt").hide();
                    var query_search = jQuery.trim(document.getElementById("store_search").value);
                    jQuery('#results-empty').html('<h5 class="alert alert-danger">' + storelocator_lang.no_store_name + ' <i>"' + query_search + '"</i></h5>');
                    setMapOnAll();
                    return;
                }
                jQuery("#results-slt").show();
                if (markerNodes.length > 1) {
                    jQuery("#storeify-text-result").text(jQuery("#storeify-text-result").data('results'));
                } else {
                    jQuery("#storeify-text-result").text(jQuery("#storeify-text-result").data('result'));
                }
                if(ify_layout != 8) document.getElementById("num-rs").innerHTML = markerNodes.length;
                //jQuery("#results-slt h3.title").show();
                jQuery("#main-slider-storelocator").removeClass('storeify-first-alert');
                var html_list = '';
                var marker_count = 0;
                var marker_first;
                for (var i = 0; i < gmarkers.length; i++) {
                    // console.log( markerNodes[i]['tags'] );
                    marker = gmarkers[i];
                    var id = marker.id;
                    if (markerNodes.includes(id)) {
                        if (typeof marker.thum !== 'undefined') {
                            marker.thum;
                        }
                        marker.name;
                        marker.url;
                        marker.address;
                        marker.phone;
                        marker.email;
                        marker.web;
                        marker.tags;
                        marker.social;
                        marker.num;
                        marker.trans !== undefined ? marker.trans : [];
                        marker.setVisible(true);
                        marker_first = marker;
                        bounds.extend(marker.getPosition());
                        marker_count++;
                        if(ify_layout != 8)
                        html_list += create_html_list(marker[i], [i], true);
                        //html_list += listItem(social, thum, id, name, url, address, phone, email, web, null, tags, num, null, trans);
                    } else {
                        marker.setVisible(false);
                    }
                }

                map.fitBounds(bounds);
                var zoom = map.getZoom();
                zoom = Math.min(zoom, 12);
                if(marker_count == 1){
                    map.setCenter(marker_first.getPosition());
                    map.setZoom(search_result_zoom);
                }else {
                    map.setZoom(zoom);
                }
                jQuery(".map-tab-mobile-bnt-item").attr("data-zoom", zoom);
                jQuery('#' + randomID).html(html_list);
                document.getElementById("loading_mask_loader").style.display = 'none';

            }).fail(function() {
                // window.location.href = '/';
                document.getElementById("loading_mask_loader").style.display = 'none';
                jQuery("#results-slt").hide();
                jQuery('#results-empty').html('<h5 class="alert alert-danger"> An error occurred. Please try again. </i></h5>');
                setMapOnAll();
              
            });
            // }        
            return true;
        }

        function searchStoresByProducts() {
            clearSearchMarker();
            if(infowindow) infowindow.close();
            bounds = new google.maps.LatLngBounds();
            document.getElementById("loading_mask_loader").style.display = '';
            jQuery('.content-results-slt').removeClass('content-results-first');
            var search_text = document.getElementById("product_search").value;
            var tags = [];
            jQuery.each(jQuery('input.storeifyapp_stores_tags_filter:checked'), function() {
                tags.push(jQuery(this).val());
            });
            var filter_country = 'all',filter_region = 'ify_all',filter_city = 'ify_all';
            if (jQuery('input.storeifyapp_stores_country_filter').length) {
                filter_country = jQuery('input.storeifyapp_stores_country_filter:checked').val();                   
            }
            if (jQuery('input.storeifyapp_stores_region_filter').length) {
                filter_region = jQuery('input.storeifyapp_stores_region_filter:checked').val();                   
            }
            if (jQuery('input.storeifyapp_stores_city_filter').length) {
                filter_city = jQuery('input.storeifyapp_stores_city_filter:checked').val();                   
            }
            if(jQuery('.storeifyapp_stores_countrys_filter_list').data('tag') == 'select'){
                filter_country = jQuery('select.storeifyapp_stores_country_filter').val();
            }
            if(jQuery('.storeifyapp_stores_region_filter_list').data('tag') == 'select'){
                filter_region = jQuery('select.storeifyapp_stores_region_filter').val();
            }
            if(jQuery('.storeifyapp_stores_city_filter_list').data('tag') == 'select'){
                filter_city = jQuery('select.storeifyapp_stores_city_filter').val();
            }
            if(filter_region == 'unnamed_region') filter_region = '';
            if(filter_city == 'unnamed_city') filter_city = '';

            var data = {
                name: search_text,
                shop: Shopify.shop,
                tags: tags.join(','),
                country: filter_country,
                region: filter_region,
                city: filter_city,
                v: 2
            };
            if(isIfyTrans)
                data.locale = localeCurrent;
            var searchUrl = storeify_app_proxy_url + '/searchproduct'; //?name=' + search_text + '&shop=' + Shopify.shop;
            jQuery.ajaxSetup({
                headers: {
                    'X-CSRF-TOKEN': jQuery('input[name="_token"]').val()
                }
            });
            jQuery.ajax({
                url: searchUrl,
                type: "GET",
                data: data,
                cache: false,
                dataType: "json",
            }).done(function(data) {

                var markerNodes = data.data;

                if (markerNodes.length == 0) {

                    document.getElementById("loading_mask_loader").style.display = 'none';
                    jQuery("#results-slt").hide();
                    var query_search = document.getElementById("product_search").value;
                    jQuery('#results-empty').html('<h5 class="alert alert-danger">' + storelocator_lang.no_store_product + ' <i>"' + query_search + '"</i></h5>');
                    setMapOnAll();
                    return;
                }
                jQuery("#results-slt").show();
                if (markerNodes.length > 1) {
                    jQuery("#storeify-text-result").text(jQuery("#storeify-text-result").data('results'));
                } else {
                    jQuery("#storeify-text-result").text(jQuery("#storeify-text-result").data('result'));
                }
                if(ify_layout != 8) document.getElementById("num-rs").innerHTML = markerNodes.length;
                //jQuery("#results-slt h3.title").show();
                jQuery("#main-slider-storelocator").removeClass('storeify-first-alert');
                var html_list = '';
                var marker_first;
                var marker_count = 0;
                for (var i = 0; i < gmarkers.length; i++) {
                    // console.log( markerNodes[i]['tags'] );
                    marker = gmarkers[i];
                    var id = marker.id;
                    if (markerNodes.includes(id)) {
                        if (typeof marker.thum !== 'undefined') {
                            marker.thum;
                        }
                        marker.name;
                        marker.url;
                        marker.address;
                        marker.phone;
                        marker.email;
                        marker.web;
                        marker.tags;
                        marker.social;
                        marker.num;
                        marker.trans !== undefined ? marker.trans : [];
                        marker.setVisible(true);
                        marker_first = marker;
                        marker_count++;
                        bounds.extend(marker.getPosition());
                        if(ify_layout != 8)
                        html_list += create_html_list(marker[i], [i], true);
                        // html_list += listItem(social, thum, id, name, url, address, phone, email, web, null, tags, num, null, trans);
                    } else {
                        marker.setVisible(false);
                    }
                }

                map.fitBounds(bounds);
                var zoom = map.getZoom();
                zoom = Math.min(zoom, 12);
                if(marker_count == 1){
                    map.setCenter(marker_first.getPosition());
                    map.setZoom(search_result_zoom);
                }else {
                    map.setZoom(zoom);
                }
                jQuery(".map-tab-mobile-bnt-item").attr("data-zoom", zoom);
                jQuery('#' + randomID).html(html_list);
                document.getElementById("loading_mask_loader").style.display = 'none';

            }).fail(function() {
                // window.location.href = '/';
                document.getElementById("loading_mask_loader").style.display = 'none';
                jQuery("#results-slt").hide();
                jQuery('#results-empty').html('<h5 class="alert alert-danger"> An error occurred. Please try again. </i></h5>');
                setMapOnAll();
             
            });
            // }        
            return true;
        }
        function loadGeolocationInit() {

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var geocoder = new google.maps.Geocoder();
                    var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    geocoder.geocode({
                        'latLng': latlng
                    }, function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            if (results[1]) {
                                document.getElementById('address').value = results[1].formatted_address;
                                jQuery('#submit-search').trigger( "click" );
                            } else {
                                //alert(trans['no_result']); //"no_result"
                                jQuery('#results-empty').html('<h5 class="alert alert-danger">' + storelocator_lang.no_result + '</h5>');
                            }
                        } else {
                            //alert(trans['geocoder_failed'] + status); //"geocoder_failed"
                            jQuery('#results-empty').html('<h5 class="alert alert-danger">' + storelocator_lang.geocoder_failed + '</h5>');
                        }

                    }.bind(this));

                    // document.getElementById("latitude").value = position.coords.latitude;

                    //            document.getElementById("longitude").value = position.coords.longitude;

                }.bind(this), function(error) {}.bind(this));
            }

        }

        function loadGeolocationCountry() {
            navigator.geolocation.getCurrentPosition(function(position) {
                var geocoder = new google.maps.Geocoder();
                var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                geocoder.geocode({
                    'latLng': latlng
                }, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        if (results[0]) {
                            var loc = getCountry(results);
                            searchLocation(loc);
                        }
                    }
                });
            });
            searchLocation(null);
        }

        function getCountry(results) {
            for (var i = 0; i < results[0].address_components.length; i++) {
                var shortname = results[0].address_components[i].short_name;
                var longname = results[0].address_components[i].long_name;
                var type = results[0].address_components[i].types;
                if (type.indexOf("country") != -1) {
                    if (!isNullOrWhitespace(shortname)) {
                        return shortname;
                    } else {
                        return longname;
                    }
                }
            }
            return null;

        }

        function isNullOrWhitespace(text) {
            if (text == null) {
                return true;
            }
            return text.replace(/\s/gi, '').length < 1;
        }

        function searchLocation(currentCountry = null) {

            clearSearchMarker();
            if(infowindow) infowindow.close();
            document.getElementById("loading_mask_loader").style.display = '';
            jQuery('.content-results-slt').removeClass('content-results-first');
            var address = document.getElementById("address").value;
            var radius_search = document.getElementById("radius_search").value;

            var checkboxes = document.getElementsByName('stores_tags_filter[]');
            var vals = "";
            for (var i = 0, n = checkboxes.length; i < n; i++) {
                if (checkboxes[i].checked) {
                    vals += "," + checkboxes[i].value;
                }
            }
            if ((address == '' || address == null) && vals == "") {
                //alert(trans['please_enter']);
                jQuery('#address').focus();
                document.getElementById("loading_mask_loader").style.display = 'none';
                return false;
            }
            if ((radius_search == '' || radius_search == null) && vals == "") {
                //alert('Please enter a radius.');
                document.getElementById("loading_mask_loader").style.display = 'none';
                return false;
            }
            var focus_country = {
                address: address
            };
            if (currentCountry != null) {
                focus_country = {
                    address: address,
                    componentRestrictions: {
                        country: currentCountry,
                    }
                };
            }
            if (priority_search != 'global') {
                focus_country = {
                    address: address,
                    componentRestrictions: {
                        country: priority_search,
                    }
                };
            }
            
            var geocoder = new google.maps.Geocoder();


            geocoder.geocode(focus_country, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var latlng = new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng());
                    if (marker_search) {
                        marker_search.setMap(null);
                    }
                    
                    marker_search = new google.maps.Marker({
                        map: map,
                        position: latlng,
                        icon: {
                            url: window.themeAssets.default_marker,
                            scaledSize: new google.maps.Size(30, 43)
                        },
                    });
                    var radiusValue = parseFloat(radius_search);
                    if (!isNaN(radiusValue)) {
                        var meterToUnit = (radius_unit == 1) ? 0.001 : 0.00062137;
                        if (meterToUnit > 0) {
                            var radiusInMeters = radiusValue / meterToUnit;
                            if (search_radius_circle) {
                                search_radius_circle.setMap(null);
                            }
                            search_radius_circle = new google.maps.Circle({
                                map: map,
                                center: latlng,
                                radius: radiusInMeters,
                                strokeColor: '#f2bf00',
                                strokeOpacity: 0.35,
                                strokeWeight: 2,
                                fillColor: '#f2bf00',
                                fillOpacity: 0.08,
                                clickable: false
                            });
                            
                        }
                    }
                    google.maps.event.addListener(marker_search, 'click', function(evt) { // the click event function is called with the "event" as an argument
                        //showInfoWindow(evt, this, map, infowindow, address);
                    });
                    
                    //                         markers.push(marker);
                    searchLocationsNear(results[0], map, bounds, gmarkers);
                        //            searchLocationsNear(results[0].geometry.location);
                } else {
                    if (currentCountry == null) {
                        document.getElementById("loading_mask_loader").style.display = 'none';
                        jQuery('#results-empty').html('<h5 class="alert alert-danger"><i>' + address + '</i>' + storelocator_lang.address_null + '</h5>');
                    } else {
                        searchLocation(null);
                    }

                }
                
            });

        
        }

        function findbyTags() {

                clearSearchMarker();
                if(infowindow) infowindow.close();
                bounds = new google.maps.LatLngBounds();
                var tags_check = [];
                jQuery.each(jQuery('input.storeifyapp_stores_tags_filter:checked'), function() {
                    tags_check.push(jQuery(this).val());
                });
                var filter_country = 'all',filter_region = 'ify_all',filter_city = 'ify_all';
                if (jQuery('input.storeifyapp_stores_country_filter').length) {
                    filter_country = jQuery('input.storeifyapp_stores_country_filter:checked').val();                   
                }
                if (jQuery('input.storeifyapp_stores_region_filter').length) {
                    filter_region = jQuery('input.storeifyapp_stores_region_filter:checked').val();                   
                }
                if (jQuery('input.storeifyapp_stores_city_filter').length) {
                    filter_city = jQuery('input.storeifyapp_stores_city_filter:checked').val();                   
                }
                if(jQuery('.storeifyapp_stores_countrys_filter_list').data('tag') == 'select'){
                    filter_country = jQuery('select.storeifyapp_stores_country_filter').val();
                }
                if(jQuery('.storeifyapp_stores_region_filter_list').data('tag') == 'select'){
                    filter_region = jQuery('select.storeifyapp_stores_region_filter').val();
                }
                if(jQuery('.storeifyapp_stores_city_filter_list').data('tag') == 'select'){
                    filter_city = jQuery('select.storeifyapp_stores_city_filter').val();
                }
                if(filter_region == 'unnamed_region') filter_region = '';
                if(filter_city == 'unnamed_city') filter_city = '';

                var check_country = 0;
                var marker_first;
                var marker_count = 0;
                var html_list = '';
                for (var i = 0; i < gmarkers.length; i++) {
                    // console.log( markerNodes[i]['tags'] );
                    marker = gmarkers[i];
                    check_country = 0;

                    if ( (filter_country == 'all' || filter_country == marker.country) && (filter_region == 'ify_all' || filter_region == marker.region) && (filter_city == 'ify_all' || filter_city == marker.city) ) {
                        check_country = 1;
                    }
                    if (checkTag(tags_check, marker.tags) && check_country == 1) {
                        thum = null;
                        if (typeof marker.thum !== 'undefined') {
                            thum = marker.thum;
                        }
                        marker.id;
                        marker.name;
                        marker.url;
                        var address = marker.address;
                        marker.phone;
                        marker.email;
                        marker.web;
                        marker.tags;
                        marker.social;
                        marker.num;
                        marker.trans !== undefined ? marker.trans : [];
                        bounds.extend(marker.getPosition());
                        marker.setVisible(true);
                        marker_first = marker;
                        marker_count++;
                        if(ify_layout != 8)
                        html_list += create_html_list(marker[i], [i], true);
                        //html_list += listItem(social, thum, id, name, url, address, phone, email, web, null, tags, num, null, trans);
                    } else {
                        marker.setVisible(false);
                    }
                }
                map.fitBounds(bounds);
                document.getElementById("loading_mask_loader").style.display = 'none';
                if(ify_layout != 8) document.getElementById("num-rs").innerHTML = marker_count;
                //jQuery("#results-slt h3.title").show();
                jQuery("#main-slider-storelocator").removeClass('storeify-first-alert');
                if (marker_count > 0) {
                    if(marker_count == 1){
                        map.setCenter(marker_first.getPosition());
                        map.setZoom(search_result_zoom);
                    }else {
                        var zoom = map.getZoom();
                        zoom = Math.min(zoom, 12);
                        map.setZoom(zoom);
                    }
                    jQuery("#storeify-text-result").text(jQuery("#storeify-text-result").data('results'));
                    jQuery('#' + randomID).html(html_list);
                }
                if (marker_count == 0) {

                    jQuery("#results-slt").hide();
                    var address = document.getElementById("address").value;
                    jQuery("#storeify-text-result").text(jQuery("#storeify-text-result").data('result'));
                    jQuery('#results-empty').html('<h5 class="alert alert-danger">' + storelocator_lang.store_near + '<i>"' + address + '"</i></h5>');
                    return;
                }

                jQuery('#results-empty').html('<h5></h5>');
                jQuery("#results-slt").show();
            }
            //---------//end code here
        
        // tao Region khi chi co 1 country
        function renderDefaultRegion(){
            let currentCountry =  jQuery('.storeifyapp_stores_country_filter').val();
            if(jQuery('select.storeifyapp_stores_country_filter').length)
                currentCountry =  jQuery('select.storeifyapp_stores_country_filter').val();
            else
                currentCountry = jQuery('input.storeifyapp_stores_country_filter:checked').val();
            if(currentCountry == 'all') return true;
            let arrValueRegion = [];
            if(currentCountry !== 'all'){
                jQuery('#stores-city-filter').html('<select class="storeifyapp_stores_city_filter storeifyapp_stores_city_filter_list" data-tag = "select"><option value="ify_all">Select City</option></select>').hide();
                if(typeof ifyArr_country_region_city[currentCountry] !=='undefined'){
                    arrValueRegion = Object.keys(ifyArr_country_region_city[currentCountry]);
                    if(arrValueRegion.length == 1){
                        let currentRegion =  arrValueRegion[0];
                        let arrValueCity = [];
                        if(typeof ifyArr_country_region_city[currentCountry][currentRegion] !=='undefined'){
                            arrValueCity = ifyArr_country_region_city[currentCountry][currentRegion];
                        }
                        renderFilter(arrValueCity,'city',Number(ify_mode_filtercountry));
                    }
                }
                renderFilter(arrValueRegion,'region',Number(ify_mode_filtercountry));
            }else {
                jQuery('#stores-region-filter').html('').hide();
                jQuery('#stores-city-filter').html('').hide();
            }
        }
        function setMapOnAll(map) {
            for (let i = 0; i < gmarkers.length; i++) {
              gmarkers[i].setVisible(false);
            }
          }
        // window.onload = initMap;
        function checkMapLoaded() {
            //console.log(dataApps.permanent_domain);
            if (typeof google === "undefined") {
                setTimeout(checkMapLoaded, 500);
            } else {
                // do some work here
                initMap();
            }
        }

        function ifyRenderTags(tags){
            if(tags === undefined || Object.keys(tags).length === 0)
                return '';
            let html = `<div id="stores-tags-filter">
                <label>${storelocator_lang.filter_tags}</label>
                <ul class="storeifyapp_stores_tags_filter_list">`;
                Object.keys(tags).forEach(key => {
                  html += `<li><label class="label_storeifyapp_stores_tags_filter" for="storeifyapp_stores_tags_filter_${key}"> <input type="checkbox" name="stores_tags_filter[]" class="storeifyapp_stores_tags_filter" id="storeifyapp_stores_tags_filter_${key}" value="${key}"  /> <span>${tags[key]}</span> </label></li>`;
                });

            html += `</ul></div>`;
            return html
        }

        function ifyRenderCountrys(countryArr,countryObj){
            if(countryArr === undefined || countryArr.length === 0)
                return '';
            let html = `<div id="stores-country-filter" class="stores-filter-by">
                <label>${storelocator_lang.filter_country}</label>`;
                if(Number(ify_mode_filtercountry) === 1){
                    html += `<ul class="storeifyapp_stores_countrys_filter_list" data-tag = "radio">
                        <li><label class="label_storeifyapp_stores_country_filter" for="storeifyapp_stores_country_filter_all"> <input type="radio" name="stores_country_filter" class="storeifyapp_stores_country_filter" id="storeifyapp_stores_country_filter_all" value="all" checked="checked" /> <span>${storelocator_lang.all}</span> </label></li>
                    `;
                    countryArr.forEach(key => {
                        let label = countryObj[key] !== undefined ? countryObj[key] : key;
                        html += `<li><label class="label_storeifyapp_stores_country_filter" for="storeifyapp_stores_country_filter_${key}"> <input type="radio" name="stores_country_filter" class="storeifyapp_stores_country_filter" id="storeifyapp_stores_country_filter_${key}" value="${key}"  /> <span>${label}</span> </label></li>`;
                    });
                    html += '</ul>';
                }else {
                    html += `<select name="stores_country_filter" class="storeifyapp_stores_country_filter storeifyapp_stores_countrys_filter_list" data-tag = "select">
                        <option value="all"> <span>${storelocator_lang.all}</span></option>
                    `;
                    countryArr.forEach(key => {
                        let label = countryObj[key] !== undefined ? countryObj[key] : key;
                        html += `<option value="${key}"> <span>${label}</span></option>`;
                    });
                    html += '</select>';
                }

            html += '</div>';
            if(Number(ify_filter_region_city) === 1)
                html += '<div id="stores-region-filter" class="stores-filter-by"></div> <div id="stores-city-filter" class="stores-filter-by"></div>';
            return html
        }

        var loadTime = 3;
        var loadTime2 = 1;
        if(dataApps.permanent_domain == 'audittesting.myshopify.com' || dataApps.permanent_domain ==  'al-test-my.myshopify.com'){
            loadTime = 3000;
            loadTime2 = 1000;
        }
            
        setTimeout(() => {
            const sl_idex = document.getElementById('storeifyapps-storelocator-index');
            if (sl_idex) {
                sl_idex.style.opacity = '1';
                sl_idex.style.transform = 'translateY(0)';
            }
            //jQuery('#sl-tab-list').trigger('click');
        }, loadTime2);

        jQuery( document ).ready(function() {
        //window.addEventListener('load', () => {
            let mapLoaded = false;
            const mapElement = document.getElementById("map");
            
            if(mapElement){
                function loadGoogleMapScript() {
                    if (mapLoaded) return;
                    const script = document.createElement("script");
                    script.src = window.api_key;
                    script.defer = true;
                    document.head.appendChild(script);
                    if (typeof dataApps !== 'undefined' && dataApps.recaptcha_enabled !== undefined && dataApps.recaptcha_enabled !== '') {
                        const recaptchaAlreadyLoaded = document.querySelector('script[src*="www.google.com/recaptcha/api.js"]');
                        if (!recaptchaAlreadyLoaded) {
                            const recaptchaScript = document.createElement("script");
                            recaptchaScript.src = "https://www.google.com/recaptcha/api.js?render=" + dataApps.recaptcha_enabled;
                            recaptchaScript.async = true;
                            recaptchaScript.defer = true;
                            document.head.appendChild(recaptchaScript);
                        }
                    }
                    mapLoaded = true;
                }
                
                
                // const isMobile = window.innerWidth <= 992;
                // if (isMobile){
                //     const onMobileScroll = () => {
                //         console.log('Scroll láº§n Ä‘áº§u trÃªn mobile!');
                //         // VÃ­ dá»¥: chá»‰ load Google Map sau láº§n scroll Ä‘áº§u tiÃªn
                //         loadGoogleMapScript();
                //         console.log( "Storeify SL loaded" );
                //         if(!map && typeof dataApps.detail == 'undefined') checkMapLoaded();
                //         // XoÃ¡ listener Ä‘á»ƒ trÃ¡nh cháº¡y láº¡i
                //         window.removeEventListener('scroll', onMobileScroll);
                //     };
                //     window.addEventListener('scroll', onMobileScroll);
                // }else{
                    setTimeout(() => {
                        if (!window.mapLoaded) {
                            loadGoogleMapScript();
                            window.mapLoaded = true;
                      
                            if (!map && typeof dataApps.detail == 'undefined') checkMapLoaded();
                        }
                    }, loadTime);

                // }
                jQuery(document).on("click", "#storeify-sl-btn-trigger-popup", function(e) {
                    //if (!window.mapLoaded) {
                        loadGoogleMapScript();
                        //window.mapLoaded = true;
                        // console.log("Storeify SL loaded");
                        if (!map && typeof dataApps.detail == 'undefined') checkMapLoaded();
                    //}
                });
            }
            //============ tag map=================
            var dataTag = jQuery("#storeifyapps-storelocator-shortcode-tags").attr("data-tag");
            if(typeof dataTag != "undefined"){
                jQuery('.content-results-slt').addClass('shortcode-tags-list');
                jQuery(".bootstrap-storeifyapps").css({
                    "opacity": 0,
                    "display": "none",
                });
                jQuery('#storeifyapps-storelocator-shortcode-tags').before('<div class="ify-custom-loading" style="text-align:center;display:block;margin-top:30px;">Loading...</div>');
                setTimeout(function() {
                    jQuery('.storeifyapp_stores_tags_filter[value="'+dataTag+'"]').trigger( "click" );
                    jQuery('.bootstrap-storeifyapps').css('opacity','1');
                    jQuery('.bootstrap-storeifyapps').show();
                    jQuery('.ify-custom-loading').remove();
                    jQuery('.storeifyapp_stores_tags_filter').parent().parent().hide();
                    jQuery('#tags').hide();
                    jQuery("#reset-search").hide();
                    jQuery(".tag-item-"+dataTag).hide();
               }, 2000);
            }


        document.addEventListener('click', function(e){
            const target = e.target.closest(".store-details-modal-button"); 
            if(target){
                
                
                let id = target.getAttribute('data-id');
                $('#' + id).addClass('active');
                $('body').addClass('store-modal-open');
                

            }
        });


        document.addEventListener('click', function(e){
            const target = e.target.closest(".store-details-modal-close"); 
            if(target){
                let id = target.getAttribute('data-id');
                $('#' + id).removeClass('active');
                $('body').removeClass('store-modal-open');
            }
        });

        });

        jQuery(document).on("click", ".ify-search-submit-btn", function(e) {
            e.preventDefault();
            let val = jQuery('#storeify_search_cart').val();
            if(val == ''){
                jQuery('#storeify_search_cart').focus();
                return false;
            }
            if (!map && typeof dataApps.detail == 'undefined') checkMapLoaded(); 
            
            jQuery("#storeify-sl-light-modal-wrapper").addClass('show');
            if(jQuery("#storeify-sl-light-modal-wrapper").find('.storeify-sear-box').length){
                h = jQuery("#storeify-sl-light-modal-wrapper").find('.storeify-sear-box').height()+540;
                jQuery('#map').height(h);
            }
            jQuery('select.form-control-storeify').val('location').trigger('change');
            jQuery('#frm-storelocator-search #address').val(jQuery('#storeify_search_cart').val());
            setTimeout(() => { jQuery('.storelocator-submit-search').trigger('click'); }, 500);
   
        });
        jQuery(document).on("click", ".ify-select-provider", function(e) {
            e.preventDefault();
            let currentId = jQuery(this).attr('data-id');
            let formElement = dataApps.form_cart_element;
            let cartAttribute = dataApps.form_cart_attribute;
            let cartUrl = dataApps.cart_url;
            if(typeof formElement == 'undefined' || formElement == '' || formElement == null){
                if(typeof cartUrl == 'undefined' || cartUrl == '' || cartUrl == null){
                    cartUrl = '/cart';
                }
                formElement = 'form[action="'+cartUrl+'"]';
            }
            jQuery(formElement).find('#storeify-info').remove();
            gmarkers.forEach((item, index) => {
                if(Number(currentId) == Number(item.id)){
                    let html = '';
                    let infor = "";
                    if(cartAttribute.name == true){
                        html += '<h4 class="ify-select-provider-item ify-select-provider-title">'+item.name+'</h4>';
                        infor =  `${item.name} \n`;
                    }
                    if(cartAttribute.address == true){
                        html += '<div class="ify-select-provider-item ify-select-provider-address">'+item.address+'</div>';
                        infor =  `Address: ${item.address} \n`;
                    }
                    if (item.email != null && typeof item.email != 'undefined' && item.email != '' && cartAttribute.email == true) {
                        html += '<div class="ify-select-provider-item ify-select-provider-address">'+email_icon+'';
                        html += item.email + '</div>';
                        infor +=  `Email: ${item.email}\n`;
                    }
                    if (item.phone != null && typeof item.phone != 'undefined' && item.phone != '' && cartAttribute.phone == true) {
                        html += '<div class="ify-select-provider-item ify-select-provider-phone">'+phone_icon+'';
                        html += item.phone + '</div>';
                        infor +=  `Phone: ${item.phone}\n`;
                    }
                    if (item.web != null && typeof item.web != 'undefined' && item.web != '' && cartAttribute.web == true) {
                        html += '<div class="ify-select-provider-item ify-select-provider-web">'+web_icon+'';
                        html += item.web + '</div>';
                        let url = getUrlsFromHtml(item.web);
                        infor +=  `Web: ${url}\n`;
                    }
                    if (item.tags.length > 0 && cartAttribute.tags == true) {
                        let tag_arr = item.tags;
                        let tag_html = '';
                        jQuery.each(tag_arr, function(key, value) {
                            tag_html += '<span class="tag-item tag-item-'+string_to_slug(value)+'"><i class="fa fa-check" aria-hidden="true"></i> ' + value + '</span>';
                        });
                        html += '<div class="ify-select-provider-item ify-select-provider-tags">' + tag_html + '</div>';
                        infor +=  `Tags: ${tag_arr}\n`;
                    }
                    if (item.schedule_text != null && typeof item.schedule_text != 'undefined' && item.schedule_text != '' && cartAttribute.schedule == true) {
                        $arrLangschedule = {
                            'mon' : storelocator_lang.mon,
                            'tue' : storelocator_lang.tue,
                            'wed' : storelocator_lang.wed,
                            'thu' : storelocator_lang.thu,
                            'fri' : storelocator_lang.fri,
                            'sat' : storelocator_lang.sat,
                            'sun' : storelocator_lang.sun,
                            'store_operation' : storelocator_lang.store_operation,
                            'am' : storelocator_lang.am,
                            'pm' : storelocator_lang.pm,
                            'closed' : storelocator_lang.closed,
                            'the_next_day' : storelocator_lang.the_next_day,
                        };
                        let htmlSchedule = item.schedule;
                        let textSchedule = item.schedule_text;
                        jQuery.each($arrLangschedule, function( key, val ) {
                          htmlSchedule = htmlSchedule.replaceAll("{{ "+key+" }}", val);
                          textSchedule = textSchedule.replaceAll("{{ "+key+" }}", val);
                        });
                        html += '<div class="ify-select-provider-item ify-select-provider-schedule">'+htmlSchedule+'</div>';
                        infor +=  `Store Operation Hours:\n ${textSchedule}\n`;
                    }
                    jQuery('.ify-search-cart-result').html(html).show();
                    jQuery("#storeify-sl-light-modal-wrapper").removeClass('show');
                    jQuery(formElement).append('<input type="hidden" name="attributes[Location]" id="storeify-info" value="">');
                    jQuery(formElement).find('#storeify-info').val(infor);
                    return false;
                }
            });
        });
        function getUrlsFromHtml(htmlString) {
            const regex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
            const urls = [];
            let match;
            
            while ((match = regex.exec(htmlString)) !== null) {
                urls.push(match[1]);
            }
            
            return urls;
        }
        jQuery('#radius_search').on("change mousemove", function() {
            jQuery('#radius-value .num-range').html(jQuery(this).val());
        });

        jQuery('#radius_search').on("change mouseend", function() {
            
            if (jQuery('#frm-storelocator-search #address').val() != '') {
                    searchLocation(null);
            } 
        });




        jQuery(document).on("click", ".storelocator-submit-search", function(e) {
            e.preventDefault();
            
            jQuery('#results-empty').html('<h5></h5>');
            
                if (search_mode == 1)
                    loadGeolocationCountry();
                else
                    searchLocation(null);
            return 0;
        });
        jQuery(document).on('click', '#reset-search', function(e) {
            e.preventDefault();
            let storeItems = document.getElementsByClassName('inner-item');
            for (let i = 0; i < storeItems.length; i++) {
                storeItems[i].classList.remove('inner-item-active');
            }
            clearSearchMarker();
            if(infowindow) infowindow.close();
            jQuery('#results-empty').html('<h5></h5>');
            jQuery('#address,#product_search').val('');
            jQuery('#radius_search').val(radius_default);
            jQuery('.num-range').html(radius_default);
            jQuery(".storeifyapp_stores_tags_filter").prop("checked", false);
            if(jQuery("input[name=stores_country_filter]").length){
                jQuery("input[name=stores_country_filter]:first").prop("checked", true);
                filter_region_city(jQuery("input[name=stores_country_filter]"));
            }
            if(jQuery("select[name=stores_country_filter]").length){
                jQuery("select[name=stores_country_filter]").val(jQuery("select[name=stores_country_filter] option:first").val());
                filter_region_city(jQuery("select[name=stores_country_filter]"));
            }
            // if(ify_filter_region_city == 1)
            //     jQuery("#stores-region-filter,#stores-city-filter").html('').hide();
            var count_marker = 0;
            for (var i = 0; i < gmarkers.length; i++) {
                marker = gmarkers[i];
                if((list_mode != 1 && list_mode != 3) || ((list_mode == 3 || list_mode == 1) && i < limit_store))
                    count_marker++;
                if (list_mode != 1 || (list_mode == 1 && i < limit_store)) {
                    gmarkers[i].setVisible(true);
                    bounds.extend(marker.getPosition());
                } else {
                    gmarkers[i].setVisible(false);
                }
            }

            let stores = document.getElementsByClassName('inner-item');
            for (let i = 0; i < stores.length; i++) {
                stores[i].parentNode.classList.remove('store-item-hide');
            }


            if (count_marker > 1) {
                jQuery("#storeify-text-result").text(jQuery("#storeify-text-result").data('results'));
            } else {
                jQuery("#storeify-text-result").text(jQuery("#storeify-text-result").data('result'));
            }
            if(ify_layout != 8) document.getElementById("num-rs").innerHTML = count_marker;
            //jQuery("#results-slt h3.title").show();
            jQuery("#main-slider-storelocator").removeClass('storeify-first-alert');
            
            if (center_lat == 0 && center_lng == 0) {
                map.fitBounds(bounds);
            } else {
                map.setZoom(initial_zoom);
                map.setCenter(new google.maps.LatLng(center_lat, center_lng));
                
            }
            if (list_mode == 2 && limit_store == 0) {
                jQuery("#results-slt h3.title").hide();
                jQuery("#main-slider-storelocator").addClass('storeify-first-alert');
            }
            jQuery("#results-slt").show();
            

            document.getElementById("loading_mask_loader").style.display = 'none';

            $('.distance-element').each(function() {
                $(this).removeClass('active');
            });

            // remove marker animation
            
            gmarkers.forEach(gmarker => {
                gmarker.setAnimation(null);
            });
            

        });
        // jQuery(document).on('mouseover', '.inner-item', function() {
        //     onMouseover(jQuery(this).parent().attr("datamarker"));
        // });
        // jQuery(document).on('mouseout', '.inner-item', function() {
        //     onMouseover(jQuery(this).parent().attr("datamarker"));
        // });
        jQuery(document).on('click', '.inner-item', function() {
            jQuery('#main-slider-storelocator .inner-item').removeClass('inner-item-active');
            jQuery(this).addClass('inner-item-active');
            num = jQuery(this).parent().attr("datamarker");
            google.maps.event.trigger(gmarkers[num], 'click');
            
        });
        jQuery('.storeify-modal-elon .storeify-close').on("click", function() {
            jQuery(this).parent().parent().parent().hide();
        });
        jQuery('.chose-search-slt').on("change", function() {
            if (jQuery(this).val() == 'location') {
                jQuery('.input-radius-slt').parent().show();
                jQuery('.gr-search-slt').show();
                //jQuery('.input-attribute-slt').hide();
                jQuery('#product_search').hide();
                jQuery('#store_search').hide();

            }
            if (jQuery(this).val() == 'product') {
                jQuery('.input-radius-slt').parent().hide();
                //jQuery('.input-attribute-slt').show();
                jQuery('#store_search').hide();
                jQuery('.gr-search-slt').hide();                jQuery('#product_search').show();

            }
            if (jQuery(this).val() == 'store') {
                jQuery('.input-radius-slt').parent().hide();
                //jQuery('.input-attribute-slt').show();
                jQuery('.gr-search-slt').hide();
                jQuery('#product_search').hide();
                jQuery('#store_search').show();

            }
        });
        function renderFilter(arrValue = [],option='region',mode = 1) {
            if(mode == 2){
                if(arrValue.length > 0){
                    let html = '<label>'+storelocator_lang['filter_by_'+option]+'</label><select class="storeifyapp_stores_'+option+'_filter storeifyapp_stores_'+option+'_filter_list" data-tag="select">';
                    if(arrValue.length > 1) 
                        html += '<option value="ify_all">'+storelocator_lang['select_'+option]+'</option>';
                    jQuery.each(arrValue, function( index, value ) {
                        html += '<option value="'+value+'">'+value+'</option>';
                    });
                    html += '</select>';
                    
                    jQuery('#stores-'+option+'-filter').html(html).show();
                }else {
                    jQuery('#stores-'+option+'filter').html('<select class="storeifyapp_stores_'+option+'_filter storeifyapp_stores_'+option+'_filter_list" data-tag = "select"><option value="ify_all">'+storelocator_lang['select_'+option]+'</option></select>').hide();
                }
            }else {
                if(arrValue.length > 0){
                    let html = '<label>'+storelocator_lang['filter_by_'+option]+'</label><ul class="storeifyapp_stores_'+option+'_filter_list" data-tag="radio">';
                    if(arrValue.length > 1){
                        html += '<li><label class="label_storeifyapp_stores_'+option+'_filter" for="storeifyapp_stores_'+option+'_filter_all"> <input type="radio" name="stores_'+option+'_filter" class="storeifyapp_stores_'+option+'_filter" id="storeifyapp_stores_'+option+'_filter_all" value="ify_all" checked="checked" /> <span>'+storelocator_lang.all+'</span> </label></li>';
                        jQuery.each(arrValue, function( index, value ) {
                            html += '<li><label class="label_storeifyapp_stores_'+option+'_filter" for="storeifyapp_stores_'+option+'_filter_'+index+'"> <input type="radio" name="stores_'+option+'_filter" class="storeifyapp_stores_'+option+'_filter" id="storeifyapp_stores_'+option+'_filter_'+index+'" value="'+value+'"/> <span>'+value+'</span> </label></li>';
                        });
                    }else {
                        html += '<li><label class="label_storeifyapp_stores_'+option+'_filter" for="storeifyapp_stores_'+option+'_filter_0"> <input type="radio" name="stores_'+option+'_filter" class="storeifyapp_stores_'+option+'_filter" id="storeifyapp_stores_'+option+'_filter_0" value="'+arrValue[0]+'" checked="checked"/> <span>'+arrValue[0]+'</span> </label></li>';
                    }
                    html += '</ul>';
                    jQuery('#stores-'+option+'-filter').html(html).show();
                }else {
                    jQuery('#stores-'+option+'filter').html('<ul class="storeifyapp_stores_'+option+'_filter storeifyapp_stores_'+option+'_filter_list" data-tag = "ul"><li><label class="label_storeifyapp_stores_'+option+'_filter" for="storeifyapp_stores_'+option+'_filter_all"> <input type="radio" name="stores_'+option+'_filter" class="storeifyapp_stores_'+option+'_filter" id="storeifyapp_stores_'+option+'_filter_all" value="ify_all" checked="checked" /> <span>All</span> </label></li></ul>').hide();
                }
            }
        }
        function filter_region_city(that){
            
            if(that.hasClass('storeifyapp_stores_country_filter')){
                let currentCountry =  that.val();
                let arrValueRegion = [];
                if(currentCountry !== 'all'){
                    jQuery('#stores-city-filter').html('<select class="storeifyapp_stores_city_filter storeifyapp_stores_city_filter_list" data-tag = "select"><option value="ify_all">'+storelocator_lang['select_city']+'</option></select>').hide();
                    if(typeof ifyArr_country_region_city[currentCountry] !=='undefined'){
                        arrValueRegion = Object.keys(ifyArr_country_region_city[currentCountry]);
                        if(arrValueRegion.length == 1){
                            let currentRegion =  arrValueRegion[0];
                            let arrValueCity = [];
                            if(typeof ifyArr_country_region_city[currentCountry][currentRegion] !=='undefined'){
                                arrValueCity = ifyArr_country_region_city[currentCountry][currentRegion];
                            }
                            renderFilter(arrValueCity,'city',Number(ify_mode_filtercountry));
                        }
                    }
                    renderFilter(arrValueRegion,'region',Number(ify_mode_filtercountry));
                }else {
                    jQuery('#stores-region-filter').html('').hide();
                    jQuery('#stores-city-filter').html('').hide();
                }
            }
            if(that.hasClass('storeifyapp_stores_region_filter')){
                let currentCountry = 'all';
                if(Number(ify_mode_filtercountry) == 2)
                    currentCountry =  jQuery('select.storeifyapp_stores_country_filter').val();
                else
                    currentCountry = jQuery('input.storeifyapp_stores_country_filter:checked').val();
                let currentRegion =  that.val();
                let arrValueCity = [];
                if(currentRegion !== 'ify_all'){
                    if(typeof ifyArr_country_region_city[currentCountry][currentRegion] !=='undefined'){
                        arrValueCity = ifyArr_country_region_city[currentCountry][currentRegion];
                    }
                    renderFilter(arrValueCity,'city',Number(ify_mode_filtercountry));
                }else {
                   jQuery('#stores-city-filter').html('').hide(); 
                }
                
            }

            return false;
        }
        jQuery(document).on('change', '.storeifyapp_stores_country_filter,.storeifyapp_stores_region_filter,.storeifyapp_stores_city_filter,.storeifyapp_stores_tags_filter', function(e) {
            e.preventDefault();
            jQuery('#loading_mask_loader').show();
            jQuery("#storeify-liststore-result").html('');
            if(ify_filter_region_city == 1)
                filter_region_city(jQuery(this));
            setTimeout(function() {
                if (jQuery('.chose-search-slt').val() == 'location') {
                    if (jQuery('#frm-storelocator-search #address').val() != '') {
                        if (search_mode == 1)
                            loadGeolocationCountry();
                        else
                            searchLocation(null);
                    } else {

                        findbyTags();
                    }
                }
                if (jQuery('.chose-search-slt').val() == 'product') {
                    if (jQuery('#frm-storelocator-search #product_search').val() != '') {
                        searchStoresByProducts();
                    } else {
                        findbyTags();
                    }
                }
                if (jQuery('.chose-search-slt').val() == 'store') {
                    if (jQuery('#frm-storelocator-search #store_search').val() != '') {
                        searchStoresByName();
                    } else {
                        findbyTags();
                    }
                }
            }, 100);
        });
        jQuery(document).on('click', '#getbylocal', function() {
            
            loadGeolocationInit();
        });
        jQuery(document).on('click', '.map-tab-mobile-bnt-item', function(e) {
            
            if (jQuery(this).hasClass('active') && jQuery(this).data('val') == 'map-tab-ggmap' && jQuery(this).data('zoom')) {
               
                map.setZoom(jQuery(this).data('zoom'));

            }
            setTimeout(() => {
                map.fitBounds(bounds);
            }, 10);
        });
        jQuery(document).on("submit","#frm-storelocator-short-search",function(e) {
          e.preventDefault();
          document.getElementById("loading_mask_loader").style.display = '';

          var address = document.getElementById("address").value;
          var radius_search = document.getElementById("radius_search").value;

          if ((address == '' || address == null) && vals == "") {
            //alert(trans['please_enter']);
            jQuery('#address').focus();
            document.getElementById("loading_mask_loader").style.display = 'none';
            return false;
          }
          if ((radius_search == '' || radius_search == null) && vals == "") {
            //alert('Please enter a radius.');
            document.getElementById("loading_mask_loader").style.display = 'none';
            return false;
          }
          var focus_country = {address: address};
          if(priority_search != 'global'){
            focus_country = {address: address,componentRestrictions:{country: priority_search,}};
          }
          
          var geocoder = new google.maps.Geocoder();
          geocoder.geocode(focus_country, function (results, status) {
            jQuery('#results-empty').html('');
            if (status == google.maps.GeocoderStatus.OK) {
              searchLocationsNearShort(results[0]);
            } else {
              document.getElementById("loading_mask_loader").style.display = 'none';
              document.getElementById("storeify-storeloctor-contactFrm").style.display = 'block';
              if(ify_layout != 8) document.getElementById("num-rs").innerHTML = 0;
              jQuery("#storeify-text-result").text(jQuery("#storeify-text-result").data('result'));
              jQuery('#results-slt .list-custo-storeify').html('');
              jQuery('#results-empty').html('<h5 class="alert alert-danger">'+storelocator_lang.store_near +'<i>"'+ address+'"</i></h5>');
              
            }

          });
          

        });
        jQuery(document).on("keydown","#frm-storelocator-search input",function(e) {
          if (e.which == 13) {
            e.preventDefault();
            jQuery(".storelocator-submit-search").trigger("click");
          }
        });
        jQuery(document).on('click', '.linkdetailstore', function(e) {
            e.preventDefault();
            let href = jQuery(this).attr("href");
            const baseUrl = window.location.origin;
            href = href.replace(baseUrl, '');
            href = href.replace('//'+dataApps.shopify_domain, '');
            if(root_url != '/')
                    href = root_url + href;
            window.location.href = href;
        });
        //
        function moveMapUp(distance = 100) {
          // The panBy method takes x and y offsets in pixels
          // x: 0 means no horizontal movement
          // y: -distance means moving upwards (negative values move up)
          if(map){
            map.panBy(0, -distance);
          }
            
        }
        jQuery(document).ready(function() {
            jQuery(document).on("click","#storeify-sl-btn-trigger-popup",function(e) {
                e.preventDefault();
                jQuery("#storeify-sl-light-modal-wrapper").addClass('show');
                if(jQuery("#storeify-sl-light-modal-wrapper").find('.storeify-sear-box').length){
                    h = jQuery("#storeify-sl-light-modal-wrapper").find('.storeify-sear-box').height()+540;
                    jQuery('#map').height(h);
                }
                jQuery("#reset-search").trigger("click");
            });
            
            jQuery(document).on("click",".storeify-sl-light-modal-close-icon",function(e) {
                e.preventDefault();
                jQuery("#storeify-sl-light-modal-wrapper").removeClass('show');
            });
            jQuery(document).on("click","#btn-filter",function(e) {
                e.preventDefault();
              if(!jQuery(this).hasClass('open')){
                jQuery(this).addClass('open');
                jQuery(this).next().addClass('open');
                h = jQuery('#filter-group').height();
                h2 = jQuery('#main-slider-storelocator').height();
                w = jQuery( window ).width();
                if(w > 720){
                    let mapHeight = jQuery('.map_container #map').height();
                    if (h2 - h > 200){
                        jQuery('#main-slider-storelocator').height(h2-h);
                    }else {
                        jQuery('.storeifyapps-storelocator-equal').height(mapHeight);
                        jQuery('.storeifyapps-storelocator-equal').addClass('equal-scroll');
                    }
                }
                
              }else {
                h = jQuery('#filter-group').height();
                h2 = jQuery('#main-slider-storelocator').height();
                if(w > 720 && h2 < 450){
                  jQuery('#main-slider-storelocator').height(h2+h);
                }
                jQuery('.storeifyapps-storelocator-equal').height('');
                jQuery('.storeifyapps-storelocator-equal').removeClass('equal-scroll');
                jQuery(this).removeClass('open');
                jQuery('#filter-group').removeClass('open');
              }
            });
            jQuery(document).on('click', '.table-store-marker .ify-col-schedule .title-store-info', function(e) {
                e.preventDefault();
                let parent = jQuery(this).parent();
                let distance = parent.find('.content-store-info').height();

                if(parent.hasClass( "active" )){
                    parent.removeClass( "active" );
                    moveMapUp(0 - distance);
                }else {
                    parent.addClass( "active" );
                    moveMapUp(distance);
                }
            });
        });

        ///táº¡o form contact
        function createFormContact(that) {
            if (jQuery('#storeify-storeloctor-contactFrm').length) return;
            const token = jQuery('#frm-storelocator-search input[name="_token"]').val(); // .attr('content');
            const shopify_domain = dataApps.permanent_domain;
            const store_name = that.parent().parent().find('.store-name strong').text();
            const store_id = that.attr('data-store');
            const email = that.attr('data-email');
            let formHtml = `
                <div id="storeify-storeloctor-contactFrm" class="storeify-modal" style="display: none;">

                    <!-- Modal content -->

                    <div class="storeify-modal-content">
                        <form id="storeify-contactForm">
                            <div class="storeify-modal-header">
                                <span class="storeify-close">Ã—</span>
                                <strong class="storeify-title-model">${storelocator_lang.contact_us}</strong>

                            </div>
                            <div class="storeify-modal-body">
                                <div class="storeify-success" style="display: none;">
                                </div>
                                <div class="storeify-alert" style="display: none;">
                                </div>
                                <div class="storeify-storelocator-hidden">
                                    <input type="hidden" name="_token" value="${token}">
                                    <input type="hidden" value="${email}" name="recipient" id="recipient">
                                    <input type="hidden" name="shopify_domain" value="${shopify_domain}" >
                                    <input type="hidden" name="store_name" value="${store_name}" >
                                    <input type="hidden" name="store_id" value="${store_id}" >
                                    <div class="fieldset">
                                        <label>${storelocator_lang.full_name}*</label>
                                        <input name="name" id="ifystorelocator_name" title="Name" value="" class="field__input required-entry" type="text" placeholder="Full Name*">
                                    </div>
                                    <div class="fieldset">
                                        <label>${storelocator_lang.email}*</label>
                                        <input name="store_email" id="ifystorelocator_email" title="Email" value="" class="field__input required-entry" type="text" placeholder="${storelocator_lang.email}*">
                                    </div>
                                    <div class="fieldset">
                                        <label>${storelocator_lang.telephone}</label>
                                        <input name="telephone" id="telephone" title="Telephone" value="" class="field__input required-entry" type="text" placeholder="${storelocator_lang.telephone}">
                                    </div>
                                    <div class="fieldset">
                                        <label>${storelocator_lang.comment}*</label>
                                        <textarea name="comment" id="ifystorelocator_comment" title="Comment" class="required-entry field__input" cols="5" rows="3" placeholder="${storelocator_lang.comment}*"></textarea>
                                    </div>
                                </div>
                            </div>
                            <div class="storeify-modal-footer">
                                <p class="required">* ${storelocator_lang.required}</p>
                                <button id="bntContactsubmitbystore" type="submit" title="Submit" class="button btn btn btn-primary-storeify">${storelocator_lang.submit}</button>
                            </div>
                        </form>
                    </div>
                </div>
                `;
            jQuery('body').append(formHtml);
            ifyFieldscontactFrm = {
                name: {
                    input: document.getElementById('ifystorelocator_name'),
                    error: document.getElementById('error-name'),
                    message: storelocator_lang.name_required
                },
                email: {
                    input: document.getElementById('ifystorelocator_email'),
                    error: document.getElementById('error-email'),
                    message: storelocator_lang.email_required,
                    invalid: storelocator_lang.email_format
                },
                comment: {
                    input: document.getElementById('ifystorelocator_comment'),
                    error: document.getElementById('error-comment'),
                    message: storelocator_lang.comment_required
                }
            };
        }
        var ifyFieldscontactFrm = {
            name: {
                input: document.getElementById('ifystorelocator_name'),
                error: document.getElementById('error-name'),
                message: storelocator_lang.name_required
            },
            email: {
                input: document.getElementById('ifystorelocator_email'),
                error: document.getElementById('error-email'),
                message: storelocator_lang.email_required,
                invalid: storelocator_lang.email_format
            },
            comment: {
                input: document.getElementById('ifystorelocator_comment'),
                error: document.getElementById('error-comment'),
                message: storelocator_lang.comment_required
            }
        };
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // show error (append)
        function ifyshowError(input, message) {
            ifyremoveError(input); // trÃ¡nh duplicate

            const error = document.createElement('small');
            error.className = 'error-message';
            error.textContent = message;

            input.classList.add('error');
            input.parentNode.appendChild(error);
        }

        // remove error
        function ifyremoveError(input) {
            input.classList.remove('error');

            const error = input.parentNode.querySelector('.error-message');
            if (error) {
                error.remove();
            }
        }

        // validate field
        function ifyvalidateField(key) {
            const fieldParams = ifyFieldscontactFrm[key];
            const field = fieldParams.input;
            const value = field.value.trim();

            if (value === '') {
                ifyshowError(field, fieldParams.message);
                return false;
            }

            if (key === 'email' && !emailRegex.test(value)) {
                ifyshowError(field, fieldParams.invalid);
                return false;
            }

            ifyremoveError(field);
            return true;
        }

        jQuery(document).on('click', '.ify-item-btn-contact span', function (e) {
            e.preventDefault();
            const contactModal = jQuery('#storeify-storeloctor-contactFrm');
            const that = jQuery(this);
            if (contactModal.length) {
                contactModal.show();
                jQuery('#storeify-storeloctor-contactFrm input[name="_token"]').val(jQuery('#frm-storelocator-search input[name="_token"]').val()); // .attr('content');
                jQuery('#storeify-storeloctor-contactFrm input[name="shopify_domain"]').val(dataApps.permanent_domain);
                jQuery('#storeify-storeloctor-contactFrm input[name="store_name"]').val(that.parent().parent().find('.store-name strong').text());
                jQuery('#storeify-storeloctor-contactFrm input[name="store_id"]').val(that.attr('data-store'));
                jQuery('#storeify-storeloctor-contactFrm input[name="recipient"]').val(that.attr('data-email'));

                jQuery('#storeify-storeloctor-contactFrm .storeify-success').hide();
                jQuery('#storeify-storeloctor-contactFrm .storeify-alert').hide();
                jQuery('.storeify-storelocator-hidden').css("visibility", "visible");
                jQuery('#storeify-storeloctor-contactFrm .storeify-modal-footer').show();
                jQuery('#storeify-storeloctor-contactFrm .error-message').remove();
                jQuery('#storeify-storeloctor-contactFrm .field__input ').removeClass('error').prop('readonly', false);
            } else {
                createFormContact(that);
                jQuery('#storeify-storeloctor-contactFrm').show();
            }
            const formStoreifyContactForm = document.getElementById('storeify-contactForm');
            if (typeof dataApps !== 'undefined' && dataApps.recaptcha_enabled !== undefined && dataApps.recaptcha_enabled !== '') {
                if (!document.getElementById('storeify_recaptchaResponse')) {
                    const recaptchaInput = document.createElement('input');
                    recaptchaInput.type = 'hidden';
                    recaptchaInput.name = 'recaptcha_response';
                    recaptchaInput.id = 'storeify_recaptchaResponse';
                    formStoreifyContactForm.appendChild(recaptchaInput);
                }
                if (typeof grecaptcha !== 'undefined' && grecaptcha.execute) {
                    grecaptcha.execute(dataApps.recaptcha_enabled, { action: 'contact' }).then(function (token) {
                        document.getElementById('storeify_recaptchaResponse').value = token;
                    });
                }
            }
            if (formStoreifyContactForm) {
                formStoreifyContactForm.addEventListener('keyup', function (e) {
                    if (e.target.matches('input, textarea')) {
                        ifyremoveError(e.target);
                    }
                });

                formStoreifyContactForm.addEventListener('change', function (e) {
                    if (e.target.matches('input, textarea')) {
                        ifyremoveError(e.target);
                    }
                });


            }
        });
        jQuery(document).on('click', '#storeify-contactForm .storeify-close', function (e) {
            jQuery('#storeify-storeloctor-contactFrm').hide();
        });
        jQuery(document).on("click", "#bntContactsubmitbystore", function (e) {
            e.preventDefault();
            jQuery("#storeify-contactForm .field__input ").prop('readonly', true);
            jQuery("#storeify-contactForm #bntContactsubmitbystore").prop('disabled', true);
            let isValid = true;

            for (let key in ifyFieldscontactFrm) {
                if (!ifyvalidateField(key)) {
                    isValid = false;
                }
            }
            if (!isValid) {
                jQuery("#storeify-contactForm .field__input ").prop('readonly', false);
                jQuery("#storeify-contactForm #bntContactsubmitbystore").prop('disabled', false);
                return false;
            }
            jQuery.ajaxSetup({
                headers: {
                    'X-CSRF-TOKEN': jQuery('input[name="_token"]').val()
                }
            });
            var data = jQuery('#storeify-contactForm').serialize();
            jQuery.ajax({
                url: storeify_app_proxy_url + '/send-ajax',
                type: "GET",
                data: data,
                cache: false,
                dataType: "json",
            }).done(function (results) {
                //storeify-alert
                jQuery("#storeify-contactForm .field__input ").prop('readonly', false);
                jQuery("#storeify-contactForm #bntContactsubmitbystore").prop('disabled', false);
                if (results.error == true) {
                    jQuery('#storeify-contactForm .storeify-success').hide();
                    if (typeof results.mess == 'object')
                        jQuery('#storeify-contactForm .storeify-alert').html('* Required Fields');
                    else
                        jQuery('#storeify-contactForm .storeify-alert').html(results.mess);
                    jQuery('#storeify-contactForm .storeify-alert').show();
                } else {
                    jQuery('#storeify-contactForm .storeify-alert').hide();
                    jQuery('#storeify-contactForm .storeify-success').html(results.mess).show();
                    jQuery('.storeify-storelocator-hidden').css("visibility", "hidden");
                    jQuery('#storeify-contactForm .storeify-alert,#storeify-contactForm .storeify-modal-footer').hide();
                }

            }).fail(function () {

            });
        });//end 


        if(document.getElementById('storeify-detail-store'))
        {   
            //trans theo locale
            if(isIfyTrans && dataApps.locale_detail !== undefined && dataApps.locale_detail[localeCurrent] !== undefined){

                const detailTrans = dataApps.locale_detail[localeCurrent];
                jQuery('.storeify-details-content .header-store-name').text(detailTrans.name);
                jQuery('.storeify-details-content .entry-item-address-link').text(detailTrans.address);
                jQuery('.storeify-details-content .storeify-store-tags-list').html(ifyRenderTagsDetail(detailTrans.tags));
                jQuery('.storeify-details-content .store-detail-content').html(detailTrans.description);
                jQuery('#ify_trans_detail_styles').remove();
            }
            function ifyRenderTagsDetail(tags){
                if(tags.length == 0)
                    return '';
                let htmlTags = '';
                jQuery.each(tags, function(i, val) {
                    htmlTags += '<span class="tag-item tag-item-'+string_to_slug(val)+'"><i class="fa fa-check" aria-hidden="true"></i> ' + val + '</span>';
                });
                return htmlTags;
            }
            //end
            function checkMapLoadDetail(){
              if (typeof google == "undefined") {
                setTimeout(checkMapLoadDetail);
              } else {
                initialize();
              }
            }

            var storeify_detail = dataApps.storeify_detail;
            var detail_zoom = dataApps.detail_zoom;
            var layout = dataApps.layout;
            var icon_marker = dataApps.icon_marker;
            var map_detail;
            var street_view;
            var panorama;
            checkMapLoadDetail();

            function initialize()
            {   var lat = storeify_detail.lat;
                var lng = storeify_detail.long;
                var address = storeify_detail.address,
                directionsDisplay = new google.maps.DirectionsRenderer();
                new google.maps.DirectionsService();
                var storeLatlng = new google.maps.LatLng(lat, lng);
                var ViewControl = true;
                var styledMapType = new google.maps.StyledMapType(JSON.parse(B64.decode(map_style_render)));
                if (layout == 2) ViewControl = false;
                map_detail = new google.maps.Map(document.getElementById("map"),
                {
                    center: storeLatlng,
                    zoom: detail_zoom,
                    mapTypeId: 'roadmap',
                    mapTypeControl: false,
                    mapTypeControlOptions:
                    {
                        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
                    },
                    streetViewControl: ViewControl
                });

                map_detail.mapTypes.set('styled_map', styledMapType);
                map_detail.setMapTypeId('styled_map');
                
                directionsDisplay.setMap(map_detail);
                directionsDisplay.setPanel(document.getElementById('directions-panel'));
                var control = document.getElementById('store-info-popup');
                //control.style.display = 'block';
                map_detail.controls[google.maps.ControlPosition.TOP_RIGHT].push(control);

                if (address.length != 0)
                {

                    if (icon_marker != '')
                    {
                        var icon = {
                            url: icon_marker, // url
                            scaledSize: new google.maps.Size(30, 30), // scaled size
                            // origin: new google.maps.Point(0,0), // origin
                            // anchor: new google.maps.Point(0, 0) // anchor
                        };
                        marker = new google.maps.Marker(
                        {
                            position: storeLatlng,
                            map: map_detail,
                            title: address,
                            icon: icon
                        });
                    }
                    else
                    {
                        marker = new google.maps.Marker(
                        {
                            position: storeLatlng,
                            map: map_detail,
                            title: address
                        });
                    }
                }

                new google.maps.InfoWindow();

                locationDiv = document.getElementById("storeify_location");
                if(!locationDiv) locationDiv = document.getElementById("location");

                new google.maps.places.SearchBox(document.getElementById('start'));
                var panoramaOptions = {
                    position: storeLatlng,
                    pov:
                    {
                        heading: 34,
                        pitch: 10
                    }
                };
                if (layout == 1)
                {
                    street_view = new google.maps.StreetViewPanorama(document.getElementById('street_view'), panoramaOptions);
                    map_detail.setStreetView(street_view);
                    document.getElementById('street_view').style.display = 'block';
                }
                else
                {
                    //layout 2
                    panorama = map_detail.getStreetView();
                    panorama.setPosition(storeLatlng);
                    panorama.setPov( /** @type {google.maps.StreetViewPov} */ (
                    {
                        heading: 265,
                        pitch: 0
                    }));
                }
                /*var addMarker = google.maps.event.addListener(map_detail, 'click', function (e)
                {
                    closeAllInfoWindow();
                    var lat = e.latLng.lat(); // lat of clicked point
                    var lng = e.latLng.lng(); // lng of clicked point
                    var markerId = getMarkerUniqueId(lat, lng); // an that will be used to cache this marker in markers object.
                    var geocoder = new google.maps.Geocoder;
                    var marker;
                    var html = '';


                    if (icon_marker != '')
                    {
                        var icon = {
                            url: window.icon_marker, // url
                            scaledSize: new google.maps.Size(40, 40), // scaled size
                            // origin: new google.maps.Point(0,0), // origin
                            // anchor: new google.maps.Point(0, 0) // anchor
                        };
                        var marker = new google.maps.Marker(
                        {
                            position: getLatLng(lat, lng),
                            map: map_detail,
                            animation: google.maps.Animation.DROP,
                            id: 'marker_' + markerId,
                            icon: icon

                        });
                    }
                    else
                    {
                        var marker = new google.maps.Marker(
                        {
                            position: getLatLng(lat, lng),
                            map: map_detail,
                            animation: google.maps.Animation.DROP,
                            id: 'marker_' + markerId,

                        });
                    }
                    geocoder.geocode(
                    {
                        'location': getLatLng(lat, lng)
                    }, function (results, status)
                    {
                        // console.log(results);
                        if (status === 'OK')
                        {
                            if (results[0])
                            {
                                //  console.log(results);
                                html += '<div class="store-marker" style="padding: 5px 15px 15px 0;">';
                                html += '<strong>' + results[0].formatted_address + '</strong>';
                                html += '</div>';

                                marker.html = html;
                                markers[markerId] = marker; // cache marker in markers object
                                infoWindow_detail = new google.maps.InfoWindow();
                                infoWindow_detail.setContent(html);
                                infoWindow_detail.open(map_detail, marker);

                            }
                            else
                            {
                                window.alert("{{ addslashes(__('no_result')) }}");
                            }
                        }
                        else
                        {
                            window.alert("{{ addslashes(__('geocoder_failed')) }}" + status);
                        }
                    });
                    bindMarkerinfo(marker);
                    bindMarkerEvents(marker); // bind right click event to marker
                });*/
            }

            /**
             * Binds  click event to given marker and invokes a callback function that will remove the marker from map.
             * @param {!google.maps.Marker} marker A google.maps.Marker instance that the handler will binded.
             */
            /*var bindMarkerinfo = function (marker)
            {
                google.maps.event.addListener(marker, "click", function (point)
                {
                    closeAllInfoWindow();
                    var markerId = getMarkerUniqueId(point.latLng.lat(), point.latLng.lng()); // get marker id by using clicked point's coordinate
                    var marker = markers[markerId]; // find marker
                    infoWindow_detail = new google.maps.InfoWindow();
                    infoWindow_detail.setContent(marker.html);
                    infoWindow_detail.open(map_detail, marker);
                    // removeMarker(marker, markerId); // remove it
                });
            };*/

            /**
             * Binds right click event to given marker and invokes a callback function that will remove the marker from map.
             * @param {!google.maps.Marker} marker A google.maps.Marker instance that the handler will binded.
             */
            /*var bindMarkerEvents = function (marker)
            {
                google.maps.event.addListener(marker, "rightclick", function (point)
                {
                    var markerId = getMarkerUniqueId(point.latLng.lat(), point.latLng.lng()); // get marker id by using clicked point's coordinate
                    var marker = markers[markerId]; // find marker
                    removeMarker(marker, markerId); // remove it
                });
            };
            var removeMarker = function (marker, markerId)
            {
                marker.setMap(null); // set markers setMap to null to remove it from map
                delete markers[markerId]; // delete marker instance from markers object
            };
            jQuery(document).on('click', '#bntDirection', function () {
                var start = document.getElementById('start').value;
                var selectedMode = document.getElementById('mode').value;
            
                var request = {
                    origin:start,
                    destination:storeify_detail.address,
                    travelMode: google.maps.TravelMode[selectedMode],
                    unitSystem: google.maps.UnitSystem.METRIC        };
                
                directionsService.route(request, function(response, status) {
                    if (status == google.maps.DirectionsStatus.OK) {
                        directionsDisplay.setDirections(response);
                    }
                });
            });*/
            jQuery(document).on('click', '#toggleStreetView', function () {
                var toggle = panorama.getVisible();
                if (toggle == false) {
                  panorama.setVisible(true);
                } else {
                  panorama.setVisible(false);
                } 
            });
            // const ifyFieldscontactFrm = {
            //     name: {
            //         input: document.getElementById('ifystorelocator_name'),
            //         error: document.getElementById('error-name'),
            //         message: storelocator_lang.name_required
            //     },
            //     email: {
            //         input: document.getElementById('ifystorelocator_email'),
            //         error: document.getElementById('error-email'),
            //         message: storelocator_lang.email_required,
            //         invalid: storelocator_lang.email_format
            //     },
            //     comment: {
            //         input: document.getElementById('ifystorelocator_comment'),
            //         error: document.getElementById('error-comment'),
            //         message: storelocator_lang.comment_required
            //     }
            // };
            // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            // // show error (append)
            // function ifyshowError(input, message) {
            //     ifyremoveError(input); // trÃ¡nh duplicate

            //     const error = document.createElement('small');
            //     error.className = 'error-message';
            //     error.textContent = message;

            //     input.classList.add('error');
            //     input.parentNode.appendChild(error);
            // }

            // // remove error
            // function ifyremoveError(input) {
            //     input.classList.remove('error');

            //     const error = input.parentNode.querySelector('.error-message');
            //     if (error) {
            //         error.remove();
            //     }
            // }

            // // validate field
            // function ifyvalidateField(key) {
            //     const fieldParams = ifyFieldscontactFrm[key];
            //     const field = fieldParams.input;
            //     const value = field.value.trim();

            //     if (value === '') {
            //         ifyshowError(field, fieldParams.message);
            //         return false;
            //     }

            //     if (key === 'email' && !emailRegex.test(value)) {
            //         ifyshowError(field, fieldParams.invalid);
            //         return false;
            //     }

            //     ifyremoveError(field);
            //     return true;
            // }
            const formStoreifyContactForm = document.getElementById('storeify-contactForm');
            if (formStoreifyContactForm) {
                formStoreifyContactForm.addEventListener('keyup', function (e) {
                    if (e.target.matches('input, textarea')) {
                        ifyremoveError(e.target);
                    }
                });

                formStoreifyContactForm.addEventListener('change', function (e) {
                    if (e.target.matches('input, textarea')) {
                        ifyremoveError(e.target);
                    }
                });
            }
            jQuery(document).on("click","#bntContactsubmit",function(e){
                e.preventDefault();
                jQuery("#storeify-contactForm .field__input ").prop('readonly', true);
                jQuery("#storeify-contactForm #bntContactsubmit").prop('disabled', true);
                let isValid = true;

                for (let key in ifyFieldscontactFrm) {
                    if (!ifyvalidateField(key)) {
                        isValid = false;
                    }
                }
                if(!isValid) {
                    jQuery("#storeify-contactForm .field__input ").prop('readonly', false);
                    jQuery("#storeify-contactForm #bntContactsubmit").prop('disabled', false);
                    return false;
               
                }
                jQuery.ajaxSetup({
                    headers: {
                        'X-CSRF-TOKEN': jQuery('input[name="_token"]').val()
                    }
                });
                var data = jQuery('#storeify-contactForm').serialize();
                jQuery.ajax({
                    url: storeify_app_proxy_url + '/send-ajax',
                    type: "GET",
                    data: data,
                    cache: false,
                    dataType: "json",
                }).done(function(results) {
                  //storeify-alert
                  jQuery("#storeify-contactForm .field__input ").prop('readonly', false);
                  jQuery("#storeify-contactForm #bntContactsubmit").prop('disabled', false);
                  if(results.error == true){
                    jQuery('#storeify-contactForm .storeify-success').hide();
                    if(typeof results.mess == 'object')
                      jQuery('#storeify-contactForm .storeify-alert').html('* Required Fields'); 
                    else
                      jQuery('#storeify-contactForm .storeify-alert').html(results.mess);
                    jQuery('#storeify-contactForm .storeify-alert').show();
                  }else {
                    jQuery('#storeify-contactForm .storeify-alert').hide();
                    jQuery('#storeify-contactForm .storeify-success').html(results.mess).show();
                    jQuery('.storeify-storelocator-hidden').css("visibility","hidden");
                    jQuery('#storeify-contactForm .storeify-alert,#storeify-contactForm .storeify-modal-footer').hide();
                  }
                
                }).fail(function() {
                    
                });
            });
            jQuery(document).on("click",".storelocator-paged .page-item",function(e){
                e.preventDefault();
                jQuery('.storeify-list-product').addClass('load-ajax');
                var id = jQuery('.storelocator-paged').data('id');
                var count = jQuery('.storelocator-paged').data('count');
                var page = 1;
                var btnClick = jQuery(this).data('page');
                var current = jQuery('.storelocator-paged .page-item-btn.active').data('page');
                if(btnClick != 'next' && btnClick != 'pre'){
                   page = btnClick;
                }
                if(btnClick == 'next'){
                   page = current + 1;
                }
                if(btnClick == 'prev'){
                   page = current - 1;
                }
                jQuery('.storelocator-paged .page-item').removeClass('active');
                jQuery('.storelocator-paged .page-item-'+page).addClass('active');
                if(page > 1 && page < count){
                  jQuery('.storelocator-paged .page-control').addClass('active');
                }
                if(page == 1){
                  jQuery('.storelocator-paged .page-next').addClass('active');
                }
                if(page == count){
                  jQuery('.storelocator-paged .page-pre').addClass('active');
                }
                jQuery.ajax({
                    url: storeify_app_proxy_url + '/load-page',
                    type: "GET",
                    data: {id:id,page:page},
                    cache: false,
                    dataType: "html",
                }).done(function(results) {
                  //storeify-alert
                  jQuery( "div.content-store-products" ).scrollTop( 0 );
                  jQuery([document.documentElement, document.body]).animate({
                    scrollTop: jQuery("div.storeify-list-product").offset().top
                  }, 500);
                  jQuery('.storeify-list-product').removeClass('load-ajax');
                  if(jQuery('.content-store-products .storeify-flex').length)
                    jQuery('.content-store-products .storeify-flex').html(results);
                  else
                    jQuery('.storeify-products-grid').html(results);
                  
                }).fail(function() {
                    jQuery('.storeify-list-product').removeClass('load-ajax');
                });
            });
            jQuery(document).on('click', '.storeify-sl-details .back-stores a', function(e) {
                e.preventDefault();
                let href = jQuery(this).attr("href");
                href = href.replace('https://'+dataApps.shopify_domain, '');
                href = href.replace('https://'+dataApps.permanent_domain, '');
                if(root_url != '/')
                        href = root_url + href;
                window.location.href = href;
            });
        } //end detail

    }; //end storeifyappsJavaScript

    
    
    if (typeof jQuery == 'undefined' || typeof jQuery.fn.on == 'undefined'){
        loadScript('//code.jquery.com/jquery-3.7.1.min.js', function() {

            storeifyAPPS = jQuery.noConflict(true);

            storeifyAPPS(document).ready(function() {
                storeifyappsJavaScript(storeifyAPPS);

            });

        });

    } else {

        storeifyappsJavaScript(jQuery);

    }

})();
