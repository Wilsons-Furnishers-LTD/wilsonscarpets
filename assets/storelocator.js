(function () {

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
                  return 'Open today: ' + td.nextElementSibling.innerHTML
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
                                        <a href="${storeProperties.place_id}" target="_blank">${storeProperties.address}</a>
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
                                    <div class="store-details-modal-button-container">
                                        <div class="store-details-modal-button" data-id="store-details-modal-${i}">
                                        Opening hours
                                        </div>
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
                                <a class="modal-btn-yellow" href="${storeProperties.url}" aria-label="This link opens in a new tab.">View Store  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
  <path d="M6 3L11 8L6 13" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></a> 
                                <a  href="${storeProperties.place_id}" target="_blank" aria-label="This link opens in a new tab.">Get Directions </a> 
                            </div>
                            <div class="store-details-modal-opening-times">
                                <div class="store-details-modal-subtitle">
                                    Opening Times
                                </div>
                                ${fullOpeningTimes}
                            </div>
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
              $('.storelocator-loading').addClass('hide');

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
                  if(!event.target.classList.contains('store-details-modal-button')) {
                      $(infoWindowWrapper).html('');
                  }


                  // sort this
                  if($(window).width() < 768 && !event.target.classList.contains('store-details-modal-button')) {
                      var top = $(infoWindowWrapper).offset().top - 400;
                      $('html,body').animate({scrollTop: top}, 1000);
                  }
                  
                  let storeInfo = create_html_list(data_maker, 0, true);
                  
                  if(!event.target.classList.contains('store-details-modal-button')) {
                      $(infoWindowWrapper).html(storeInfo);
                  }
                  
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

                      if($(window).width() < 768) {
                          var top = $(infoWindowWrapper).offset().top - 400;
                          $('html,body').animate({scrollTop: top}, 1000);
                      }
                      
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

          let scrollPositionY = 0;
          document.addEventListener('click', function (e) {
              const openButton = e.target.closest('.store-details-modal-button');
              const closeButton = e.target.closest('.store-details-modal-close');

              if (openButton) {
                  let parent = $(openButton).closest('.item');
                  let modal = $(parent).find('.store-details-modal');

                  if(modal) {
                      $(modal).addClass('active');
                      scrollPositionY = window.scrollY;
                      document.body.style.top = `-${scrollPositionY}px`;
                      document.body.classList.add('store-modal-open');
                  }
              }

              if (closeButton) {
                  $('.store-details-modal').removeClass('active');
                  document.body.style.position = '';
                  document.body.style.top = '';
                  document.body.classList.remove('store-modal-open');
                  window.scrollTo(0, scrollPositionY);
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

})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmVsb2NhdG9yLmpzIiwic291cmNlcyI6WyIuLi9zcmMvc2NyaXB0cy9zdG9yZWxvY2F0b3IuanMiXSwic291cmNlc0NvbnRlbnQiOlsiXG4hKGZ1bmN0aW9uKCkge1xuXG4gICAgYXN5bmMgZnVuY3Rpb24gY2hlY2tIb2xpZGF5cygpIHtcbiAgICAgICAgY29uc3QgeWVhciA9IG5ldyBEYXRlKCkuZ2V0RnVsbFllYXIoKTtcbiAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goXCJodHRwczovL3d3dy5nb3YudWsvYmFuay1ob2xpZGF5cy5qc29uXCIpO1xuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzLmpzb24oKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHRvZGF5ID0gbmV3IERhdGUoKS50b0xvY2FsZURhdGVTdHJpbmcoXCJlbi1DQVwiKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGVhc3Rlck1vbmRheSA9IGRhdGFbXCJlbmdsYW5kLWFuZC13YWxlc1wiXS5ldmVudHMuZmluZChcbiAgICAgICAgZSA9PiBlLnRpdGxlID09PSBcIkVhc3RlciBNb25kYXlcIiAmJlxuICAgICAgICAgICAgICAgIGUuZGF0ZS5zdGFydHNXaXRoKGAke3llYXJ9LWApXG4gICAgICAgICk7XG5cbiAgICAgICAgY29uc3QgZCA9IG5ldyBEYXRlKGVhc3Rlck1vbmRheS5kYXRlKTtcbiAgICAgICAgZC5zZXREYXRlKGQuZ2V0RGF0ZSgpIC0gMSk7XG4gICAgICAgIGNvbnN0IGNocmlzdG1hc0RheSA9IHllYXIgKyAnLScgKyAnMTInICsgJy0yNSc7XG4gICAgICAgIGNvbnN0IGNocmlzdG1hc0V2ZSA9IHllYXIgKyAnLScgKyAnMTInICsgJy0yNCc7XG4gICAgICAgIGNvbnN0IGJveGluZ0RheSA9IHllYXIgKyAnLScgKyAnMTInICsgJy0yNic7XG4gICAgICAgIGNvbnN0IG5ld1llYXJzRXZlID0geWVhciArICctJyArICcxMicgKyAnLTMxJztcbiAgICAgICAgY29uc3QgbmV3WWVhcnNEYXkgPSB5ZWFyICsgJy0nICsgJzAxJyArICctMDEnO1xuICAgICAgICBjb25zdCBlYXN0ZXJTdW5kYXkgPSBkLnRvSVNPU3RyaW5nKCkuc2xpY2UoMCwgMTApO1xuICAgICAgICBjb25zdCBob2xpZGF5cyA9IFtjaHJpc3RtYXNEYXksIGNocmlzdG1hc0V2ZSwgYm94aW5nRGF5LCBuZXdZZWFyc0V2ZSwgbmV3WWVhcnNEYXksIGVhc3RlclN1bmRheV07XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgbGV0IGlzVG9kYXlIb2xpZGF5O1xuICAgICAgICBob2xpZGF5cy5mb3JFYWNoKGhvbGlkYXkgPT4ge1xuICAgICAgICAgICAgaWYoaG9saWRheSA9PT0gdG9kYXkpIHtcbiAgICAgICAgICAgICAgICAvLyByZW1vdmUgdGltZXNcbiAgICAgICAgICAgICAgICBpc1RvZGF5SG9saWRheSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZighaXNUb2RheUhvbGlkYXkpIHtcbiAgICAgICAgICAgICQoJy5jdy1zdG9yZWxvY2F0b3InKS5hZGRDbGFzcygnbm90LWhvbGlkYXknKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0Q3VycmVudERheU9wZW5pbmdUaW1lKG9wZW5pbmdUaW1lcykge1xuICAgICAgICBjb25zdCB0b2RheSA9IG5ldyBEYXRlKCkudG9Mb2NhbGVEYXRlU3RyaW5nKCdlbi1VUycsIHt3ZWVrZGF5OiAnbG9uZyd9KTtcbiAgICAgICAgY29uc3QgdGVtcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0ZW1wLmlubmVySFRNTCA9IG9wZW5pbmdUaW1lcztcbiAgICAgICAgY29uc3QgdGQgPSBbLi4udGVtcC5xdWVyeVNlbGVjdG9yQWxsKCd0ZCcpXS5maW5kKGVsID0+IGVsLnRleHRDb250ZW50LnRyaW0oKSA9PT0gdG9kYXkpO1xuICAgICAgICBcbiAgICAgICAgaWYodGQgJiYgdGQubmV4dEVsZW1lbnRTaWJsaW5nKSB7XG4gICAgICAgICAgICBpZih0ZC5uZXh0RWxlbWVudFNpYmxpbmcudGV4dENvbnRlbnQudHJpbSgpICE9PSAnQ0xPU0VEJykge1xuICAgICAgICAgICAgICAgIHJldHVybiAnT3BlbiB0b2RheTogJyArIHRkLm5leHRFbGVtZW50U2libGluZy5pbm5lckhUTUxcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdDbG9zZWQgdG9kYXknXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gZ2V0RnVsbE9wZW5pbmdUaW1lcyhvcGVuaW5nVGltZXMpIHtcbiAgICAgICAgY29uc3QgdG9kYXkgPSBuZXcgRGF0ZSgpLnRvTG9jYWxlRGF0ZVN0cmluZygnZW4tVVMnLCB7d2Vla2RheTogJ2xvbmcnfSk7XG4gICAgICAgIGNvbnN0IHRlbXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgdGVtcC5pbm5lckhUTUwgPSBvcGVuaW5nVGltZXM7XG4gICAgICAgIHRlbXAucXVlcnlTZWxlY3RvckFsbCgndHInKS5mb3JFYWNoKHJvdyA9PiB7XG4gICAgICAgICAgICBjb25zdCBkYXlDZWxsID0gcm93LnF1ZXJ5U2VsZWN0b3IoJ3RkJyk7XG5cbiAgICAgICAgICAgIGlmIChkYXlDZWxsICYmIGRheUNlbGwudGV4dENvbnRlbnQudHJpbSgpID09PSB0b2RheSkge1xuICAgICAgICAgICAgcm93LmNsYXNzTGlzdC5hZGQoJ3RvZGF5Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdGVtcC5pbm5lckhUTUxcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVfaHRtbF9saXN0KHN0b3JlLCBpLCBzZWFyY2ggPSBmYWxzZSkge1xuICAgICAgICBcbiAgICAgICAgbGV0IHN0b3JlUHJvcGVydGllcyA9IHN0b3JlXG4gICAgICAgIGxldCB0aHVtYm5haWwgXG4gICAgICAgIGxldCBvcGVuaW5nVGltZSA9ICcnXG4gICAgICAgIGxldCBmdWxsT3BlbmluZ1RpbWVzID0gJydcbiAgICAgICAgaWYoIXNlYXJjaCAmJiBzdG9yZS5wcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICBzdG9yZVByb3BlcnRpZXMgPSBzdG9yZS5wcm9wZXJ0aWVzXG4gICAgICAgICAgICB0aHVtYm5haWwgPSBzdG9yZVByb3BlcnRpZXMudGh1bWJuYWlsXG4gICAgICAgICAgICBpZihzdG9yZVByb3BlcnRpZXMub3BlbmluZ190aW1lcykge1xuICAgICAgICAgICAgICAgIG9wZW5pbmdUaW1lID0gZ2V0Q3VycmVudERheU9wZW5pbmdUaW1lKHN0b3JlUHJvcGVydGllcy5vcGVuaW5nX3RpbWVzKVxuICAgICAgICAgICAgICAgIGZ1bGxPcGVuaW5nVGltZXMgPSBnZXRGdWxsT3BlbmluZ1RpbWVzKHN0b3JlUHJvcGVydGllcy5vcGVuaW5nX3RpbWVzKVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGh1bWJuYWlsID0gc3RvcmUudGh1bVxuICAgICAgICAgICAgaWYoc3RvcmUub3BlbmluZ190aW1lcykge1xuICAgICAgICAgICAgICAgIG9wZW5pbmdUaW1lID0gZ2V0Q3VycmVudERheU9wZW5pbmdUaW1lKHN0b3JlLm9wZW5pbmdfdGltZXMpXG4gICAgICAgICAgICAgICAgZnVsbE9wZW5pbmdUaW1lcyA9IGdldEZ1bGxPcGVuaW5nVGltZXMoc3RvcmUub3BlbmluZ190aW1lcylcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZihzdG9yZVByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgIGxldCBmZWF0dXJlZENsYXNzID0gJycsXG4gICAgICAgICAgICAgICAgZmVhdHVyZWRGbGFnID0gJydcbiAgICAgICAgICAgIGlmKHN0b3JlUHJvcGVydGllcy5mZWF0dXJlZF9zdG9yZSA9PSAnMScpIHtcbiAgICAgICAgICAgICAgICBmZWF0dXJlZENsYXNzID0gJ2ZlYXR1cmVkJyxcbiAgICAgICAgICAgICAgICBmZWF0dXJlZEZsYWcgPSAnPGltZyBjbGFzcz1cImZlYXR1cmUtZmxhZ1wiIHNyYz1cIicgKyB3aW5kb3cudGhlbWVBc3NldHMuYmVkX2ZsYWcgKyAnXCI+J1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RvcmVQcm9wZXJ0aWVzLnVybCA9IHN0b3JlUHJvcGVydGllcy51cmwucmVwbGFjZSgnaHR0cHM6Ly93d3cud2lsc29uc2NhcnBldHMuY29tJywgJycpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgc3RvcmVIdG1sID0gYFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaXRlbSB0aHVtYm5haWwgc3RvcmUtaXRlbSAke2ZlYXR1cmVkQ2xhc3N9XCIgZGF0YW1hcmtlcj1cIiR7aX1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpbm5lci1pdGVtXCIgZGF0YS1sYXQ9XCIke3N0b3JlUHJvcGVydGllcy5sYXR9XCIgZGF0YS1wbGFjZT1cIiR7c3RvcmVQcm9wZXJ0aWVzLnBsYWNlX2lkfVwiIGRhdGEtbG9uZz1cIiR7c3RvcmVQcm9wZXJ0aWVzLmxvbmd9XCIgc3RvcmUtaWQ9XCIke3N0b3JlUHJvcGVydGllcy5pZH1cIiBpZD1cInN0b3JlX2lkXyR7c3RvcmVQcm9wZXJ0aWVzLmlkfVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7ZmVhdHVyZWRGbGFnfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpdGVtLWhlYWRlclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9XCJzdG9yZWlmeS1zbC1pdGVtLXJvdyBzdG9yZS1uYW1lXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiJHtzdG9yZVByb3BlcnRpZXMudXJsfVwiIHJlbD1cIm5vZm9sbG93XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz4ke3N0b3JlUHJvcGVydGllcy5uYW1lfTwvc3Ryb25nPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPiAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgY2xhc3M9XCJnZXRkaXJlY3Rpb25zdG9yZVwiIGhyZWY9XCIke3N0b3JlUHJvcGVydGllcy5wbGFjZV9pZH1cIiB0YXJnZXQ9XCJfYmxhbmtcIiBhcmlhLWxhYmVsPVwiVGhpcyBsaW5rIG9wZW5zIGluIGEgbmV3IHRhYi5cIj5EaXJlY3Rpb25zICYjODU5NDs8L2E+IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpbm5lci1pdGVtLXdyYXBwZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIml0ZW0tdGh1bWIgaGFzLXRodW1iXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW1nIHRpdGxlPVwiXCIgc3JjPVwiJHt0aHVtYm5haWx9XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaXRlbS1jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RvcmVpZnktc2wtaXRlbS1yb3cgYWRkcmVzc1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XCIke3N0b3JlUHJvcGVydGllcy5wbGFjZV9pZH1cIiB0YXJnZXQ9XCJfYmxhbmtcIj4ke3N0b3JlUHJvcGVydGllcy5hZGRyZXNzfTwvYT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGlzdGFuY2UtZWxlbWVudFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAgNjQgNjRcIiB3aWR0aD1cIjY0XCIgaGVpZ2h0PVwiNjRcIj5cbiAgPHBhdGggZD1cIk0yMCAyIEw0NCAyIEw1MiA2MiBMMTIgNjIgWlwiIGZpbGw9XCIjNDE0QjUyXCIvPlxuXG4gIDxsaW5lIHgxPVwiMzJcIiB5MT1cIjhcIiB4Mj1cIjMyXCIgeTI9XCIxNlwiIHN0cm9rZT1cIndoaXRlXCIgc3Ryb2tlLXdpZHRoPVwiNFwiLz5cbiAgPGxpbmUgeDE9XCIzMlwiIHkxPVwiMjJcIiB4Mj1cIjMyXCIgeTI9XCIzMFwiIHN0cm9rZT1cIndoaXRlXCIgc3Ryb2tlLXdpZHRoPVwiNFwiLz5cbiAgPGxpbmUgeDE9XCIzMlwiIHkxPVwiMzZcIiB4Mj1cIjMyXCIgeTI9XCI0NFwiIHN0cm9rZT1cIndoaXRlXCIgc3Ryb2tlLXdpZHRoPVwiNFwiLz5cbiAgPGxpbmUgeDE9XCIzMlwiIHkxPVwiNTBcIiB4Mj1cIjMyXCIgeTI9XCI1OFwiIHN0cm9rZT1cIndoaXRlXCIgc3Ryb2tlLXdpZHRoPVwiNFwiLz5cbjwvc3ZnPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGlzdGFuY2UtY2FsY1wiPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGlzdGFuY2UtbGFiZWxcIj4gTWlsZXMgYXdheTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RvcmUtb3BlbmluZy10aW1lc1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7b3BlbmluZ1RpbWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdG9yZS1kZXRhaWxzLW1vZGFsLWJ1dHRvbi1jb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RvcmUtZGV0YWlscy1tb2RhbC1idXR0b25cIiBkYXRhLWlkPVwic3RvcmUtZGV0YWlscy1tb2RhbC0ke2l9XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT3BlbmluZyBob3Vyc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8IS0tLSBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdG9yZWlmeS1zbC1pdGVtLXJvdyBpdGVtLWxpbmtcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBjbGFzcz1cInN0b3JlaWZ5LXN0b3JlbG9jYXRvci13ZWIgY3RhXCIgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cIiR7c3RvcmVQcm9wZXJ0aWVzLnVybH1cIiByZWw9XCJub2ZvbGxvd1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInN0b3JlaWZ5X3NsX2J1dHRvbl9zdmdcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdmcgd2lkdGg9XCIxOFwiIGhlaWdodD1cIjE4XCIgdmlld0JveD1cIjAgMCAxOCAxOFwiIGZpbGw9XCJub25lXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPjxwYXRoIGQ9XCJNMTAuMjAyIDEuMzMzNDlMMTYuNjY2NCA3Ljc5Nzk2QzE3LjMzMDMgOC40NjE4NSAxNy4zMzAzIDkuNTM4MjQgMTYuNjY2NCAxMC4yMDIxTDEwLjIwMiAxNi42NjY1QzkuNTM4MTIgMTcuMzMwNCA4LjQ2MTczIDE3LjMzMDQgNy43OTc4NCAxNi42NjY1TDEuMzMzMzcgMTAuMjAyMUMwLjY2OTQ3NyA5LjUzODI0IDAuNjY5NDc3IDguNDYxODUgMS4zMzMzNyA3Ljc5Nzk2TDcuNzk3ODQgMS4zMzM0OUM4LjQ2MTczIDAuNjY5NTk5IDkuNTM4MTIgMC42Njk1OTkgMTAuMjAyIDEuMzMzNDlaXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMS42XCI+PC9wYXRoPjxwYXRoIGQ9XCJNNy4yMDcxNyAxMS45OVY5LjU3MDRIMTAuMzYxNEw5LjI4NDE2IDEwLjcxM0wxMC4yMjY4IDExLjcxMjdMMTIuOTE5OSA4Ljg1NjM1TDEwLjIyNjggNkw5LjI4NDE2IDYuOTk5NzJMMTAuMzYxNCA4LjE0MjI2SDcuMjA3MTdDNi44MzY4NiA4LjE0MjI2IDYuNTE5ODYgOC4yODIxIDYuMjU2MTYgOC41NjE3OUM1Ljk5MjQ1IDguODQxNDcgNS44NjA2IDkuMTc3NyA1Ljg2MDYgOS41NzA0VjExLjk5SDcuMjA3MTdaXCIgZmlsbD1cImN1cnJlbnRDb2xvclwiPjwvcGF0aD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBWaWV3IFN0b3JlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RvcmVpZnktc2wtaXRlbS1yb3cgaXRlbS1waG9uZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XCJ0ZWw6JHtzdG9yZVByb3BlcnRpZXMucGhvbmV9XCIgY2xhc3M9XCJwaG9uZS1ubyBjdGFcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwic3RvcmVpZnlfc2xfYnV0dG9uX3N2Z1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN2ZyB3aWR0aD1cIjE2XCIgaGVpZ2h0PVwiMTZcIiB2aWV3Qm94PVwiMCAwIDE2IDE2XCIgZmlsbD1cIiMzMzNcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+PHBhdGggZmlsbC1ydWxlPVwiZXZlbm9kZFwiIGNsaXAtcnVsZT1cImV2ZW5vZGRcIiBkPVwiTTQuMzg5NjUgMS44ODg4M0MyLjk2Mjk2IDEuODg4NDYgMS45MzAxMiAzLjAyNzk2IDIuMTE4MTMgNC4yNTI0OEMyLjU0NDMgNy4wMjgyIDMuNTU4MDMgOS4yMDY0NCA1LjEyNTUgMTAuNzk2OEM2LjY5MTcxIDEyLjM4NTggOC44NzI5NyAxMy40NTEgMTEuNzQ3NCAxMy44OTIzQzEyLjk3MTIgMTQuMDgwMyAxNC4xMDk5IDEzLjA0ODEgMTQuMTA5OSAxMS42MjEyTDE0LjEwOTkgMTAuODEyOUMxNC4xMDk5IDEwLjY4NjYgMTQuMDI0NyAxMC41NzYyIDEzLjkwMjYgMTAuNTQ0MkwxMS43OTE0IDkuOTkwOEMxMS43MjMzIDkuOTcyOTUgMTEuNjUxIDkuOTgxNjMgMTEuNTg5IDEwLjAxNTFMMTAuNDAzMiAxMC42NTU0QzkuNjM2MDEgMTEuMDY5NyA4LjU4Mzc0IDExLjIwMTggNy43MTI0NCAxMC41OTM4QzYuODU4MDYgOS45OTc2NyA1Ljk5OTg5IDkuMTI4NTkgNS40MTA3MSA4LjI3MTEyQzQuODA5NDggNy4zOTYxIDQuOTQxNTkgNi4zNDM0OCA1LjM2MTE1IDUuNTczMzhMNS45OTUwMiA0LjQwOTk0QzYuMDI4MDYgNC4zNDgxOSA2LjAzNzA3IDQuMjc1MyA2LjAxOTMgNC4yMDc1M0w1LjQ2NTk1IDIuMDk2MzlDNS40MzM5MyAxLjk3NDIzIDUuMzIzNTMgMS44ODkwNSA1LjE5NzI0IDEuODg5MDVMNC4zODk2NSAxLjg4ODgzWk0wLjQ3MDc2MiA0LjUwNTQxQzAuMDk5OTExMiAyLjA5MDAxIDIuMTM0MjEgMC4yMjE1NzcgNC4zOTAwOSAwLjIyMjE2OEw1LjE5NzIzIDAuMjIyMzhDNi4wODExNSAwLjIyMjQ3NSA2Ljg1NDAzIDAuODE4NzU0IDcuMDc4MTUgMS42NzM4MUw3LjYzMTUxIDMuNzg0OTVDNy43NTY0NyA0LjI2MTcxIDcuNjk1NzMgNC43NjgxNCA3LjQ2MTU1IDUuMjAxODJMNy40NjAwNyA1LjIwNDU3TDYuODI0NyA2LjM3MDc1QzYuNjExODkgNi43NjEzNiA2LjYzNzA2IDcuMTEyODggNi43ODQzNyA3LjMyNzI3QzcuMjYxOTQgOC4wMjIzMSA3Ljk3ODY1IDguNzQ3MjggOC42NjYxNSA5LjIyN0M4Ljg3NDA5IDkuMzcyMDggOS4yMjA0NSA5LjM5OTkzIDkuNjExMjcgOS4xODg5TDEwLjc5NzIgOC41NDg1NkMxMS4yMzA4IDguMzE0MzggMTEuNzM3MyA4LjI1MzYzIDEyLjIxNCA4LjM3ODZMMTQuMzI1MiA4LjkzMTk2QzE1LjE4MDMgOS4xNTYxIDE1Ljc3NjYgOS45Mjg4NiAxNS43NzY2IDEwLjgxMjlMMTUuNzc2NiAxMS42MjEyQzE1Ljc3NjYgMTMuODc2MiAxMy45MDk4IDE1LjkxMDYgMTEuNDk0NCAxNS41Mzk3QzguMzQwNTkgMTUuMDU1NCA1LjgwNTE3IDEzLjg2MDYgMy45Mzg0OSAxMS45NjY3QzIuMDczMDcgMTAuMDc0MSAwLjkzNzY5NyA3LjU0NjYyIDAuNDcwNzYyIDQuNTA1NDFaXCIgZmlsbD1cImN1cnJlbnRDb2xvclwiPjwvcGF0aD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicGhvbmUtbm8tZGVza3RvcC10ZXh0XCI+JHtzdG9yZVByb3BlcnRpZXMucGhvbmV9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwaG9uZS1uby1tb2JpbGUtdGV4dFwiPlNwZWFrIHRvIHVzPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtLS0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpdGVtLW1vYmlsZS1jdGFzXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdG9yZWlmeS1zbC1pdGVtLXJvdyBpdGVtLWxpbmtcIj5cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhIGNsYXNzPVwic3RvcmVpZnktc3RvcmVsb2NhdG9yLXdlYiBjdGFcIiB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiJHtzdG9yZVByb3BlcnRpZXMudXJsfVwiIHJlbD1cIm5vZm9sbG93XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFZpZXcgU3RvcmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgd2lkdGg9XCIxNlwiIGhlaWdodD1cIjE2XCIgdmlld0JveD1cIjAgMCAxNiAxNlwiIGZpbGw9XCJub25lXCI+XG4gIDxwYXRoIGQ9XCJNNiAzTDExIDhMNiAxM1wiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZS13aWR0aD1cIjNcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIi8+XG48L3N2Zz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdG9yZWlmeS1zbC1pdGVtLXJvdyBpdGVtLXBob25lXCI+XG4gICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cInRlbDoke3N0b3JlUHJvcGVydGllcy5waG9uZX1cIiBjbGFzcz1cInBob25lLW5vIGN0YVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN2ZyB3aWR0aD1cIjE2XCIgaGVpZ2h0PVwiMTZcIiB2aWV3Qm94PVwiMCAwIDE2IDE2XCIgZmlsbD1cIiMzMzNcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+PHBhdGggZmlsbC1ydWxlPVwiZXZlbm9kZFwiIGNsaXAtcnVsZT1cImV2ZW5vZGRcIiBkPVwiTTQuMzg5NjUgMS44ODg4M0MyLjk2Mjk2IDEuODg4NDYgMS45MzAxMiAzLjAyNzk2IDIuMTE4MTMgNC4yNTI0OEMyLjU0NDMgNy4wMjgyIDMuNTU4MDMgOS4yMDY0NCA1LjEyNTUgMTAuNzk2OEM2LjY5MTcxIDEyLjM4NTggOC44NzI5NyAxMy40NTEgMTEuNzQ3NCAxMy44OTIzQzEyLjk3MTIgMTQuMDgwMyAxNC4xMDk5IDEzLjA0ODEgMTQuMTA5OSAxMS42MjEyTDE0LjEwOTkgMTAuODEyOUMxNC4xMDk5IDEwLjY4NjYgMTQuMDI0NyAxMC41NzYyIDEzLjkwMjYgMTAuNTQ0MkwxMS43OTE0IDkuOTkwOEMxMS43MjMzIDkuOTcyOTUgMTEuNjUxIDkuOTgxNjMgMTEuNTg5IDEwLjAxNTFMMTAuNDAzMiAxMC42NTU0QzkuNjM2MDEgMTEuMDY5NyA4LjU4Mzc0IDExLjIwMTggNy43MTI0NCAxMC41OTM4QzYuODU4MDYgOS45OTc2NyA1Ljk5OTg5IDkuMTI4NTkgNS40MTA3MSA4LjI3MTEyQzQuODA5NDggNy4zOTYxIDQuOTQxNTkgNi4zNDM0OCA1LjM2MTE1IDUuNTczMzhMNS45OTUwMiA0LjQwOTk0QzYuMDI4MDYgNC4zNDgxOSA2LjAzNzA3IDQuMjc1MyA2LjAxOTMgNC4yMDc1M0w1LjQ2NTk1IDIuMDk2MzlDNS40MzM5MyAxLjk3NDIzIDUuMzIzNTMgMS44ODkwNSA1LjE5NzI0IDEuODg5MDVMNC4zODk2NSAxLjg4ODgzWk0wLjQ3MDc2MiA0LjUwNTQxQzAuMDk5OTExMiAyLjA5MDAxIDIuMTM0MjEgMC4yMjE1NzcgNC4zOTAwOSAwLjIyMjE2OEw1LjE5NzIzIDAuMjIyMzhDNi4wODExNSAwLjIyMjQ3NSA2Ljg1NDAzIDAuODE4NzU0IDcuMDc4MTUgMS42NzM4MUw3LjYzMTUxIDMuNzg0OTVDNy43NTY0NyA0LjI2MTcxIDcuNjk1NzMgNC43NjgxNCA3LjQ2MTU1IDUuMjAxODJMNy40NjAwNyA1LjIwNDU3TDYuODI0NyA2LjM3MDc1QzYuNjExODkgNi43NjEzNiA2LjYzNzA2IDcuMTEyODggNi43ODQzNyA3LjMyNzI3QzcuMjYxOTQgOC4wMjIzMSA3Ljk3ODY1IDguNzQ3MjggOC42NjYxNSA5LjIyN0M4Ljg3NDA5IDkuMzcyMDggOS4yMjA0NSA5LjM5OTkzIDkuNjExMjcgOS4xODg5TDEwLjc5NzIgOC41NDg1NkMxMS4yMzA4IDguMzE0MzggMTEuNzM3MyA4LjI1MzYzIDEyLjIxNCA4LjM3ODZMMTQuMzI1MiA4LjkzMTk2QzE1LjE4MDMgOS4xNTYxIDE1Ljc3NjYgOS45Mjg4NiAxNS43NzY2IDEwLjgxMjlMMTUuNzc2NiAxMS42MjEyQzE1Ljc3NjYgMTMuODc2MiAxMy45MDk4IDE1LjkxMDYgMTEuNDk0NCAxNS41Mzk3QzguMzQwNTkgMTUuMDU1NCA1LjgwNTE3IDEzLjg2MDYgMy45Mzg0OSAxMS45NjY3QzIuMDczMDcgMTAuMDc0MSAwLjkzNzY5NyA3LjU0NjYyIDAuNDcwNzYyIDQuNTA1NDFaXCIgZmlsbD1cImN1cnJlbnRDb2xvclwiPjwvcGF0aD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicGhvbmUtbm8tZGVza3RvcC10ZXh0XCI+JHtzdG9yZVByb3BlcnRpZXMucGhvbmV9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwaG9uZS1uby1tb2JpbGUtdGV4dFwiPlNwZWFrIHRvIHVzPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdG9yZS1kZXRhaWxzLW1vZGFsXCIgaWQ9XCJzdG9yZS1kZXRhaWxzLW1vZGFsLSR7aX1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdG9yZS1kZXRhaWxzLW1vZGFsLWlubmVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInN0b3JlLWRldGFpbHMtbW9kYWwtaGVhZGVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdG9yZS1kZXRhaWxzLW1vZGFsLXRpdGxlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdG9yZSBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInN0b3JlLWRldGFpbHMtbW9kYWwtY2xvc2VcIiBkYXRhLWlkPVwic3RvcmUtZGV0YWlscy1tb2RhbC0ke2l9XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB3aWR0aD1cIjI0XCIgaGVpZ2h0PVwiMjRcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIyXCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNMTggNkw2IDE4TTYgNmwxMiAxMlwiPjwvcGF0aD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RvcmUtZGV0YWlscy1tb2RhbC1hZGRyZXNzXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdG9yZS1kZXRhaWxzLW1vZGFsLXN0b3JlLXRpdGxlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiJHtzdG9yZVByb3BlcnRpZXMudXJsfVwiIHJlbD1cIm5vZm9sbG93XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz4ke3N0b3JlUHJvcGVydGllcy5uYW1lfTwvc3Ryb25nPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtzdG9yZVByb3BlcnRpZXMuYWRkcmVzc31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RvcmUtZGV0YWlscy1tb2RhbC1jdXJyZW50LXRpbWVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtvcGVuaW5nVGltZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RvcmUtZGV0YWlscy1tb2RhbC1kaXJlY3Rpb25zXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhIGNsYXNzPVwibW9kYWwtYnRuLXllbGxvd1wiIGhyZWY9XCIke3N0b3JlUHJvcGVydGllcy51cmx9XCIgYXJpYS1sYWJlbD1cIlRoaXMgbGluayBvcGVucyBpbiBhIG5ldyB0YWIuXCI+VmlldyBTdG9yZSAgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgd2lkdGg9XCIxNlwiIGhlaWdodD1cIjE2XCIgdmlld0JveD1cIjAgMCAxNiAxNlwiIGZpbGw9XCJub25lXCI+XG4gIDxwYXRoIGQ9XCJNNiAzTDExIDhMNiAxM1wiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZS13aWR0aD1cIjNcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIi8+PC9hPiBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgIGhyZWY9XCIke3N0b3JlUHJvcGVydGllcy5wbGFjZV9pZH1cIiB0YXJnZXQ9XCJfYmxhbmtcIiBhcmlhLWxhYmVsPVwiVGhpcyBsaW5rIG9wZW5zIGluIGEgbmV3IHRhYi5cIj5HZXQgRGlyZWN0aW9ucyA8L2E+IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdG9yZS1kZXRhaWxzLW1vZGFsLW9wZW5pbmctdGltZXNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInN0b3JlLWRldGFpbHMtbW9kYWwtc3VidGl0bGVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9wZW5pbmcgVGltZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7ZnVsbE9wZW5pbmdUaW1lc31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBgO1xuICAgICAgICAgICAgICAgIHJldHVybiBzdG9yZUh0bWxcbiAgICAgICAgfVxuICAgIH1cbiAgICBcblxuICAgIFxuXG4gICAgdmFyIGxvYWRTY3JpcHQgPSBmdW5jdGlvbih1cmwsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpO1xuICAgICAgICBzY3JpcHQudHlwZSA9IFwidGV4dC9qYXZhc2NyaXB0XCI7XG4gICAgICAgIC8vIElmIHRoZSBicm93c2VyIGlzIEludGVybmV0IEV4cGxvcmVyLlxuICAgICAgICBpZiAoc2NyaXB0LnJlYWR5U3RhdGUpIHtcbiAgICAgICAgICAgIHNjcmlwdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAoc2NyaXB0LnJlYWR5U3RhdGUgPT0gXCJsb2FkZWRcIiB8fCBzY3JpcHQucmVhZHlTdGF0ZSA9PSBcImNvbXBsZXRlXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NyaXB0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8vIEZvciBhbnkgb3RoZXIgYnJvd3Nlci5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNjcmlwdC5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBzY3JpcHQuc3JjID0gdXJsO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImhlYWRcIilbMF0uYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbiAgICB9O1xuICAgIHZhciBzdG9yZWlmeWFwcHNKYXZhU2NyaXB0ID0gZnVuY3Rpb24oalF1ZXJ5KSB7XG4gICAgICAgIHZhciBCNjQ9e2FscGhhYmV0OlwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLz1cIixsb29rdXA6bnVsbCxpZTovTVNJRSAvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCksaWVvOi9NU0lFIFs2N10vLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCksZW5jb2RlOmZ1bmN0aW9uKGEpe3ZhciBlLGYsZyxiPUI2NC50b1V0ZjgoYSksYz0tMSxkPWIubGVuZ3RoLGg9WywsXTtpZihCNjQuaWUpe2Zvcih2YXIgaT1bXTsrK2M8ZDspZT1iW2NdLGY9YlsrK2NdLGhbMF09ZT4+MixoWzFdPSgzJmUpPDw0fGY+PjQsaXNOYU4oZik/aFsyXT1oWzNdPTY0OihnPWJbKytjXSxoWzJdPSgxNSZmKTw8MnxnPj42LGhbM109aXNOYU4oZyk/NjQ6NjMmZyksaS5wdXNoKEI2NC5hbHBoYWJldC5jaGFyQXQoaFswXSksQjY0LmFscGhhYmV0LmNoYXJBdChoWzFdKSxCNjQuYWxwaGFiZXQuY2hhckF0KGhbMl0pLEI2NC5hbHBoYWJldC5jaGFyQXQoaFszXSkpO3JldHVybiBpLmpvaW4oXCJcIil9Zm9yKHZhciBpPVwiXCI7KytjPGQ7KWU9YltjXSxmPWJbKytjXSxoWzBdPWU+PjIsaFsxXT0oMyZlKTw8NHxmPj40LGlzTmFOKGYpP2hbMl09aFszXT02NDooZz1iWysrY10saFsyXT0oMTUmZik8PDJ8Zz4+NixoWzNdPWlzTmFOKGcpPzY0OjYzJmcpLGkrPUI2NC5hbHBoYWJldFtoWzBdXStCNjQuYWxwaGFiZXRbaFsxXV0rQjY0LmFscGhhYmV0W2hbMl1dK0I2NC5hbHBoYWJldFtoWzNdXTtyZXR1cm4gaX0sZGVjb2RlOmZ1bmN0aW9uKGEpe2lmKGEubGVuZ3RoJTQpdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZENoYXJhY3RlckVycm9yOiAnQjY0LmRlY29kZScgZmFpbGVkOiBUaGUgc3RyaW5nIHRvIGJlIGRlY29kZWQgaXMgbm90IGNvcnJlY3RseSBlbmNvZGVkLlwiKTt2YXIgYj1CNjQuZnJvbVV0ZjgoYSksYz0wLGQ9Yi5sZW5ndGg7aWYoQjY0Lmllbyl7Zm9yKHZhciBlPVtdO2Q+YzspYltjXTwxMjg/ZS5wdXNoKFN0cmluZy5mcm9tQ2hhckNvZGUoYltjKytdKSk6YltjXT4xOTEmJmJbY108MjI0P2UucHVzaChTdHJpbmcuZnJvbUNoYXJDb2RlKCgzMSZiW2MrK10pPDw2fDYzJmJbYysrXSkpOmUucHVzaChTdHJpbmcuZnJvbUNoYXJDb2RlKCgxNSZiW2MrK10pPDwxMnwoNjMmYltjKytdKTw8Nnw2MyZiW2MrK10pKTtyZXR1cm4gZS5qb2luKFwiXCIpfWZvcih2YXIgZT1cIlwiO2Q+YzspZSs9YltjXTwxMjg/U3RyaW5nLmZyb21DaGFyQ29kZShiW2MrK10pOmJbY10+MTkxJiZiW2NdPDIyND9TdHJpbmcuZnJvbUNoYXJDb2RlKCgzMSZiW2MrK10pPDw2fDYzJmJbYysrXSk6U3RyaW5nLmZyb21DaGFyQ29kZSgoMTUmYltjKytdKTw8MTJ8KDYzJmJbYysrXSk8PDZ8NjMmYltjKytdKTtyZXR1cm4gZX0sdG9VdGY4OmZ1bmN0aW9uKGEpe3ZhciBkLGI9LTEsYz1hLmxlbmd0aCxlPVtdO2lmKC9eW1xceDAwLVxceDdmXSokLy50ZXN0KGEpKWZvcig7KytiPGM7KWUucHVzaChhLmNoYXJDb2RlQXQoYikpO2Vsc2UgZm9yKDsrK2I8YzspZD1hLmNoYXJDb2RlQXQoYiksMTI4PmQ/ZS5wdXNoKGQpOjIwNDg+ZD9lLnB1c2goMTkyfGQ+PjYsMTI4fDYzJmQpOmUucHVzaCgyMjR8ZD4+MTIsMTI4fDYzJmQ+PjYsMTI4fDYzJmQpO3JldHVybiBlfSxmcm9tVXRmODpmdW5jdGlvbihhKXt2YXIgYyxiPS0xLGQ9W10sZT1bLCxdO2lmKCFCNjQubG9va3VwKXtmb3IoYz1CNjQuYWxwaGFiZXQubGVuZ3RoLEI2NC5sb29rdXA9e307KytiPGM7KUI2NC5sb29rdXBbQjY0LmFscGhhYmV0LmNoYXJBdChiKV09YjtiPS0xfWZvcihjPWEubGVuZ3RoOysrYjxjJiYoZVswXT1CNjQubG9va3VwW2EuY2hhckF0KGIpXSxlWzFdPUI2NC5sb29rdXBbYS5jaGFyQXQoKytiKV0sZC5wdXNoKGVbMF08PDJ8ZVsxXT4+NCksZVsyXT1CNjQubG9va3VwW2EuY2hhckF0KCsrYildLDY0IT1lWzJdKSYmKGQucHVzaCgoMTUmZVsxXSk8PDR8ZVsyXT4+MiksZVszXT1CNjQubG9va3VwW2EuY2hhckF0KCsrYildLDY0IT1lWzNdKTspZC5wdXNoKCgzJmVbMl0pPDw2fGVbM10pO3JldHVybiBkfX07XG4gICAgICAgIHZhciByZXBsYWNlciA9IGZ1bmN0aW9uKGZpbmRlciwgZWxlbWVudCwgYmxhY2tMaXN0LCB0eXBlID0gMSkge1xuICAgICAgICAgICAgaWYgKCFmaW5kZXIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciByZWdleCA9ICh0eXBlb2YgZmluZGVyID09ICdzdHJpbmcnKSA/IG5ldyBSZWdFeHAoZmluZGVyLCAnZycpIDogZmluZGVyO1xuICAgICAgICAgICAgdmFyIGNoaWxkTm9kZXMgPSBBcnJheS5mcm9tKGVsZW1lbnQuY2hpbGROb2Rlcyk7IC8vIENvbnZlcnQgdG8gYXJyYXkgw4TigJjDocK7xpIgdHLDg8KhbmggbMOhwrvigJRpIGtoaSBtb2RpZnkgRE9NXG4gICAgICAgICAgICB2YXIgbGlzdCA9IHR5cGVvZiBibGFja0xpc3QgPT0gJ3VuZGVmaW5lZCcgPyAnaHRtbCxoZWFkLHN0eWxlLHRpdGxlLGxpbmssbWV0YSxzY3JpcHQsb2JqZWN0LGlmcmFtZSxwcmUsYSwnIDogYmxhY2tMaXN0O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkTm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgbm9kZSA9IGNoaWxkTm9kZXNbaV07XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gWMOhwrvCrSBsw4PCvSBlbGVtZW50IG5vZGVzIC0gw4TigJjDocK74oChIHF1eSB2w4MgbyBjw4PCoWMgdGjDocK6wrsgY29uICh0csOhwrvCqyBibGFja2xpc3QpXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IDEgJiYgKGxpc3QuaW5kZXhPZihub2RlLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgKyAnLCcpID09PSAtMSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVwbGFjZXIoZmluZGVyLCBub2RlLCBsaXN0LCB0eXBlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gWMOhwrvCrSBsw4PCvSB0ZXh0IG5vZGVzIC0ga2nDocK7xpJtIHRyYSB2w4MgIHRoYXkgdGjDocK6wr8gc2hvcnRjb2RlXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMyAmJiBub2RlLmRhdGEgJiYgcmVnZXgudGVzdChub2RlLmRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFJlc2V0IHJlZ2V4IGxhc3RJbmRleFxuICAgICAgICAgICAgICAgICAgICByZWdleC5sYXN0SW5kZXggPSAwO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld0hUTUwgPSBub2RlLmRhdGEucmVwbGFjZShyZWdleCwgZnVuY3Rpb24obWF0Y2gsIHRhZ1ZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZSA9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRhZ1ZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cInN0b3JlaWZ5YXBwcy1zdG9yZWxvY2F0b3Itc2hvcnRjb2RlIGlmeS1zaG9ydGNvZGUtZGVmYXVsdFwiIGlkPVwic3RvcmVpZnlhcHBzLXN0b3JlbG9jYXRvci1zaG9ydGNvZGUtdGFnc1wiIGRhdGEtdGFnPVwiJyArIHRhZ1ZhbHVlICsgJ1wiPjwvZGl2Pic7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwic3RvcmVpZnlhcHBzLXN0b3JlbG9jYXRvci1zaG9ydGNvZGUgaWZ5LXNob3J0Y29kZS1kZWZhdWx0XCIgaWQ9XCJzdG9yZWlmeWFwcHMtc3RvcmVsb2NhdG9yLXNob3J0Y29kZVwiPjwvZGl2Pic7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGFnVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwic3RvcmVpZnlhcHBzLXN0b3JlbG9jYXRvci1zaG9ydFwiIGlkPVwic3RvcmVpZnlhcHBzLXN0b3JlbG9jYXRvci1zaG9ydC10YWdzXCIgZGF0YS10YWc9XCInICsgdGFnVmFsdWUgKyAnXCI+PC9kaXY+JztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJzdG9yZWlmeWFwcHMtc3RvcmVsb2NhdG9yLXNob3J0XCI+PC9kaXY+JztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhheSB0aMOhwrrCvyBuw6HCu+KEomkgZHVuZ1xuICAgICAgICAgICAgICAgICAgICBpZiAobmV3SFRNTCAhPT0gbm9kZS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGVtcERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGVtcERpdi5pbm5lckhUTUwgPSBuZXdIVE1MO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBhcmVudCA9IG5vZGUucGFyZW50Tm9kZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKHRlbXBEaXYuZmlyc3RDaGlsZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudC5pbnNlcnRCZWZvcmUodGVtcERpdi5maXJzdENoaWxkLCBub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudC5yZW1vdmVDaGlsZChub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBpZiAodHlwZW9mIHN0b3JlaWZ5X2FwcF9wcm94eV91cmwgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBzdG9yZWlmeV9hcHBfcHJveHlfdXJsID0gc3RvcmVpZnlfYXBwX3Byb3h5X3VybDtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBzdG9yZWlmeV9hcHBfcHJveHlfdXJsID0gdXJsX2FwcDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHN0b3JlaWZ5X2FwcF91cmwgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBzdG9yZWlmeV9hcHBfdXJsID0gc3RvcmVpZnlfYXBwX3VybDtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBzdG9yZWlmeV9hcHBfdXJsID0gYXBwX3VybF9jb25maWc7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHZhciBodG1sX3JlcG9uc2Vfc2hvcnQgPSBCNjQuZGVjb2RlKGh0bWxfcmVuZGVyX3Nob3J0KTtcbiAgICAgICAgdmFyIHN0b3JlbG9jYXRvcl9wcm9kdWN0c19yZXNwb25zZSA9IEpTT04ucGFyc2UoQjY0LmRlY29kZShwcm9kdWN0c19yZW5kZXIpKTtcbiAgICAgICAgdmFyIHN0b3JlbG9jYXRvcl90YWdzX3Jlc3BvbnNlID0gSlNPTi5wYXJzZShCNjQuZGVjb2RlKHRhZ3NfcmVuZGVyKSk7XG4gICAgICAgIHZhciBzdG9yZWxvY2F0b3JfY291bnRyeSA9IEpTT04ucGFyc2UoQjY0LmRlY29kZShhcnJheV9jb3VudHJ5KSk7XG4gICAgICAgIHZhciBodG1sX3JlcG9uc2UgPSBCNjQuZGVjb2RlKGh0bWxfcmVuZGVyKTtcbiAgICAgICAgdmFyIGh0bWxfbGlzdCA9IEpTT04ucGFyc2UoQjY0LmRlY29kZShodG1sX2xpc3RfcmVuZGVyKSk7XG5cbiAgICAgICAgXG4gICAgICAgIHZhciBqc29uX2xpc3QgPSAnJztcbiAgICAgICAgdmFyIGdtYXJrZXJzID0gW107XG4gICAgICAgIHZhciBnbWFya2VyX3Nob3cgPSBbXTtcbiAgICAgICAgdmFyIG1hcmtlcnMgPSBbXTtcbiAgICAgICAgdmFyIG1hcmtlcl9zZWFyY2ggPSBudWxsO1xuICAgICAgICB2YXIgc2VhcmNoX3JhZGl1c19jaXJjbGUgPSBudWxsO1xuICAgICAgICB2YXIgbWFwO1xuICAgICAgICB2YXIgaW5mb3dpbmRvdztcbiAgICAgICAgdmFyIGJvdW5kcztcbiAgICAgICAgdmFyIHJhbmRvbUlEID0gJ21haW4tc2xpZGVyLXN0b3JlbG9jYXRvcic7XG4gICAgICAgIHZhciBkYXRhQXBwcyA9IHdpbmRvdy5zdG9yZWlmeVN0b3JlbG9jYXRvciB8fCB7fTtcbiAgICAgICAgdmFyIHJvb3RfdXJsID0gJy8nO1xuICAgICAgICB2YXIgc3RvcmVsb2NhdG9yX2xhbmcgPSBbXTtcbiAgICAgICAgdmFyIGlmeUZpZWxkc1Zpc2liaWxpdHkgPSB7J2xpc3QnOlsxLDEsMSwxLDEsMSwwXSwnbWFwJzpbMSwxLDEsMSwxLDEsMSwwXX07XG4gICAgICAgIHZhciBwaG9uZV9pY29uID0gJzxzcGFuIGNsYXNzPVwic3RvcmVpZnlfc2xfYnV0dG9uX3N2Z1wiPjxzdmcgd2lkdGg9XCIxNlwiIGhlaWdodD1cIjE2XCIgdmlld0JveD1cIjAgMCAxNiAxNlwiIGZpbGw9XCIjMzMzXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPjxwYXRoIGZpbGwtcnVsZT1cImV2ZW5vZGRcIiBjbGlwLXJ1bGU9XCJldmVub2RkXCIgZD1cIk00LjM4OTY1IDEuODg4ODNDMi45NjI5NiAxLjg4ODQ2IDEuOTMwMTIgMy4wMjc5NiAyLjExODEzIDQuMjUyNDhDMi41NDQzIDcuMDI4MiAzLjU1ODAzIDkuMjA2NDQgNS4xMjU1IDEwLjc5NjhDNi42OTE3MSAxMi4zODU4IDguODcyOTcgMTMuNDUxIDExLjc0NzQgMTMuODkyM0MxMi45NzEyIDE0LjA4MDMgMTQuMTA5OSAxMy4wNDgxIDE0LjEwOTkgMTEuNjIxMkwxNC4xMDk5IDEwLjgxMjlDMTQuMTA5OSAxMC42ODY2IDE0LjAyNDcgMTAuNTc2MiAxMy45MDI2IDEwLjU0NDJMMTEuNzkxNCA5Ljk5MDhDMTEuNzIzMyA5Ljk3Mjk1IDExLjY1MSA5Ljk4MTYzIDExLjU4OSAxMC4wMTUxTDEwLjQwMzIgMTAuNjU1NEM5LjYzNjAxIDExLjA2OTcgOC41ODM3NCAxMS4yMDE4IDcuNzEyNDQgMTAuNTkzOEM2Ljg1ODA2IDkuOTk3NjcgNS45OTk4OSA5LjEyODU5IDUuNDEwNzEgOC4yNzExMkM0LjgwOTQ4IDcuMzk2MSA0Ljk0MTU5IDYuMzQzNDggNS4zNjExNSA1LjU3MzM4TDUuOTk1MDIgNC40MDk5NEM2LjAyODA2IDQuMzQ4MTkgNi4wMzcwNyA0LjI3NTMgNi4wMTkzIDQuMjA3NTNMNS40NjU5NSAyLjA5NjM5QzUuNDMzOTMgMS45NzQyMyA1LjMyMzUzIDEuODg5MDUgNS4xOTcyNCAxLjg4OTA1TDQuMzg5NjUgMS44ODg4M1pNMC40NzA3NjIgNC41MDU0MUMwLjA5OTkxMTIgMi4wOTAwMSAyLjEzNDIxIDAuMjIxNTc3IDQuMzkwMDkgMC4yMjIxNjhMNS4xOTcyMyAwLjIyMjM4QzYuMDgxMTUgMC4yMjI0NzUgNi44NTQwMyAwLjgxODc1NCA3LjA3ODE1IDEuNjczODFMNy42MzE1MSAzLjc4NDk1QzcuNzU2NDcgNC4yNjE3MSA3LjY5NTczIDQuNzY4MTQgNy40NjE1NSA1LjIwMTgyTDcuNDYwMDcgNS4yMDQ1N0w2LjgyNDcgNi4zNzA3NUM2LjYxMTg5IDYuNzYxMzYgNi42MzcwNiA3LjExMjg4IDYuNzg0MzcgNy4zMjcyN0M3LjI2MTk0IDguMDIyMzEgNy45Nzg2NSA4Ljc0NzI4IDguNjY2MTUgOS4yMjdDOC44NzQwOSA5LjM3MjA4IDkuMjIwNDUgOS4zOTk5MyA5LjYxMTI3IDkuMTg4OUwxMC43OTcyIDguNTQ4NTZDMTEuMjMwOCA4LjMxNDM4IDExLjczNzMgOC4yNTM2MyAxMi4yMTQgOC4zNzg2TDE0LjMyNTIgOC45MzE5NkMxNS4xODAzIDkuMTU2MSAxNS43NzY2IDkuOTI4ODYgMTUuNzc2NiAxMC44MTI5TDE1Ljc3NjYgMTEuNjIxMkMxNS43NzY2IDEzLjg3NjIgMTMuOTA5OCAxNS45MTA2IDExLjQ5NDQgMTUuNTM5N0M4LjM0MDU5IDE1LjA1NTQgNS44MDUxNyAxMy44NjA2IDMuOTM4NDkgMTEuOTY2N0MyLjA3MzA3IDEwLjA3NDEgMC45Mzc2OTcgNy41NDY2MiAwLjQ3MDc2MiA0LjUwNTQxWlwiIGZpbGw9XCJjdXJyZW50Q29sb3JcIj48L3BhdGg+PC9zdmc+PC9zcGFuPic7XG4gICAgICAgIHZhciB3ZWJfaWNvbiA9ICc8c3BhbiBjbGFzcz1cInN0b3JlaWZ5X3NsX2J1dHRvbl9zdmdcIj48c3ZnIHdpZHRoPVwiMThcIiBoZWlnaHQ9XCIxOFwiIHZpZXdCb3g9XCIwIDAgMTggMThcIiBmaWxsPVwibm9uZVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj48cGF0aCBkPVwiTTEwLjIwMiAxLjMzMzQ5TDE2LjY2NjQgNy43OTc5NkMxNy4zMzAzIDguNDYxODUgMTcuMzMwMyA5LjUzODI0IDE2LjY2NjQgMTAuMjAyMUwxMC4yMDIgMTYuNjY2NUM5LjUzODEyIDE3LjMzMDQgOC40NjE3MyAxNy4zMzA0IDcuNzk3ODQgMTYuNjY2NUwxLjMzMzM3IDEwLjIwMjFDMC42Njk0NzcgOS41MzgyNCAwLjY2OTQ3NyA4LjQ2MTg1IDEuMzMzMzcgNy43OTc5Nkw3Ljc5Nzg0IDEuMzMzNDlDOC40NjE3MyAwLjY2OTU5OSA5LjUzODEyIDAuNjY5NTk5IDEwLjIwMiAxLjMzMzQ5WlwiIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZS13aWR0aD1cIjEuNlwiPjwvcGF0aD48cGF0aCBkPVwiTTcuMjA3MTcgMTEuOTlWOS41NzA0SDEwLjM2MTRMOS4yODQxNiAxMC43MTNMMTAuMjI2OCAxMS43MTI3TDEyLjkxOTkgOC44NTYzNUwxMC4yMjY4IDZMOS4yODQxNiA2Ljk5OTcyTDEwLjM2MTQgOC4xNDIyNkg3LjIwNzE3QzYuODM2ODYgOC4xNDIyNiA2LjUxOTg2IDguMjgyMSA2LjI1NjE2IDguNTYxNzlDNS45OTI0NSA4Ljg0MTQ3IDUuODYwNiA5LjE3NzcgNS44NjA2IDkuNTcwNFYxMS45OUg3LjIwNzE3WlwiIGZpbGw9XCJjdXJyZW50Q29sb3JcIj48L3BhdGg+PC9zdmc+PC9zcGFuPic7XG4gICAgICAgIHZhciBlbWFpbF9pY29uID0gJzxzcGFuIGNsYXNzPVwic3RvcmVpZnlfc2xfYnV0dG9uX3N2Z1wiPjxzdmcgd2lkdGg9XCIxNlwiIGhlaWdodD1cIjE0XCIgdmlld0JveD1cIjAgMCAxNiAxNFwiIGZpbGw9XCIjMzMzXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPjxwYXRoIGQ9XCJNNC4xODU2OCA0LjMwMDQzQzMuNzY4NjIgNC4xMDU4IDMuMjcyNzUgNC4yODYxMiAzLjA3ODEyIDQuNzAzMThDMi44ODM0OSA1LjEyMDI0IDMuMDYzODEgNS42MTYxMSAzLjQ4MDg3IDUuODEwNzNMNy40MTI2IDcuNjQ1NTRDNy43ODQ4OSA3LjgxOTI4IDguMjE0OTkgNy44MTkyOCA4LjU4NzI4IDcuNjQ1NTRMMTIuNTE5IDUuODEwNzNDMTIuOTM2MSA1LjYxNjExIDEzLjExNjQgNS4xMjAyNCAxMi45MjE4IDQuNzAzMThDMTIuNzI3MSA0LjI4NjEyIDEyLjIzMTMgNC4xMDU4IDExLjgxNDIgNC4zMDA0M0w3Ljk5OTk0IDYuMDgwNDJMNC4xODU2OCA0LjMwMDQzWlwiIGZpbGw9XCJjdXJyZW50Q29sb3JcIj48L3BhdGg+PHBhdGggZmlsbC1ydWxlPVwiZXZlbm9kZFwiIGNsaXAtcnVsZT1cImV2ZW5vZGRcIiBkPVwiTTMuMjc3NzIgMC44ODg5MTZDMS41OTAxOSAwLjg4ODkxNiAwLjIyMjE2OCAyLjI1NjkzIDAuMjIyMTY4IDMuOTQ0NDdWMTAuMDU1NkMwLjIyMjE2OCAxMS43NDMxIDEuNTkwMTkgMTMuMTExMSAzLjI3NzcyIDEzLjExMTFIMTIuNzIyMkMxNC40MDk3IDEzLjExMTEgMTUuNzc3NyAxMS43NDMxIDE1Ljc3NzcgMTAuMDU1NlYzLjk0NDQ3QzE1Ljc3NzcgMi4yNTY5MyAxNC40MDk3IDAuODg4OTE2IDEyLjcyMjIgMC44ODg5MTZIMy4yNzc3MlpNMS44ODg4MyAzLjk0NDQ3QzEuODg4ODMgMy4xNzc0MSAyLjUxMDY2IDIuNTU1NTggMy4yNzc3MiAyLjU1NTU4SDEyLjcyMjJDMTMuNDg5MiAyLjU1NTU4IDE0LjExMTEgMy4xNzc0MSAxNC4xMTExIDMuOTQ0NDdWMTAuMDU1NkMxNC4xMTExIDEwLjgyMjYgMTMuNDg5MiAxMS40NDQ1IDEyLjcyMjIgMTEuNDQ0NUgzLjI3NzcyQzIuNTEwNjYgMTEuNDQ0NSAxLjg4ODgzIDEwLjgyMjYgMS44ODg4MyAxMC4wNTU2VjMuOTQ0NDdaXCIgZmlsbD1cImN1cnJlbnRDb2xvclwiPjwvcGF0aD48L3N2Zz48L3NwYW4+JztcbiAgICAgICAgdmFyIHJvYWRfaWNvbiA9ICc8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB3aWR0aD1cIjE2XCIgaGVpZ2h0PVwiMTZcIiB2aWV3Qm94PVwiMCAwIDE2IDE2XCIgZmlsbD1cIiMzMzNcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIxLjVcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIj48cGF0aCBkPVwiTTEyIDEuNUwxNC41IDE0LjVMOCAxMi41TDEuNSAxNC41TDQgMS41XCIgLz48cGF0aCBkPVwiTTggMTIuNUw4IDZcIiAvPjxwYXRoIGQ9XCJNOCAzLjVMOCAyXCIgLz48L3N2Zz4nO1xuICAgICAgICB2YXIgaWZ5QXJyX2NvdW50cnlfcmVnaW9uX2NpdHkgPSB7fTtcbiAgICAgICAgaWYodHlwZW9mIGlmeUFycl9jb3VudHJ5X3JlZ2lvbiAhPSAndW5kZWZpbmVkJylcbiAgICAgICAgICAgIGlmeUFycl9jb3VudHJ5X3JlZ2lvbl9jaXR5ID0gSlNPTi5wYXJzZShCNjQuZGVjb2RlKGlmeUFycl9jb3VudHJ5X3JlZ2lvbikpO1xuXG4gICAgICAgIHZhciBpZnlfQXJyX2NvdW50cnkgPSB7fVxuICAgICAgICBpZih0eXBlb2YgaWZ5QXJyX2NvdW50cnkgIT0gJ3VuZGVmaW5lZCcpXG4gICAgICAgICAgICBpZnlfQXJyX2NvdW50cnkgPSBKU09OLnBhcnNlKEI2NC5kZWNvZGUoaWZ5QXJyX2NvdW50cnkpKTtcblxuICAgICAgICB2YXIgaWZ5X2ZpbHRlcl9yZWdpb25fY2l0eSA9IHdpbmRvdy5pZnlfZmlsdGVyX3JlZ2lvbl9jaXR5IHx8IDA7XG4gICAgICAgIHZhciBpZnlfbW9kZV9maWx0ZXJjb3VudHJ5ID0gd2luZG93LmlmeV9tb2RlX2ZpbHRlcmNvdW50cnkgfHwgMTtcbiAgICAgICAgXG5cbiAgICAgICAgZnVuY3Rpb24gY2xlYXJTZWFyY2hNYXJrZXIoKSB7XG4gICAgICAgICAgICBpZiAobWFya2VyX3NlYXJjaCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbWFya2VyX3NlYXJjaC5zZXRNYXAobnVsbCk7XG4gICAgICAgICAgICAgICAgbWFya2VyX3NlYXJjaCA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc2VhcmNoX3JhZGl1c19jaXJjbGUgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHNlYXJjaF9yYWRpdXNfY2lyY2xlLnNldE1hcChudWxsKTtcbiAgICAgICAgICAgICAgICBzZWFyY2hfcmFkaXVzX2NpcmNsZSA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiB1cGRhdGVTZWFyY2hDaXJjbGVTdHlsZXMoaGFzUmVzdWx0cykge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoIXNlYXJjaF9yYWRpdXNfY2lyY2xlKSByZXR1cm47XG4gICAgICAgICAgICBpZiAoaGFzUmVzdWx0cykge1xuICAgICAgICAgICAgICAgIHNlYXJjaF9yYWRpdXNfY2lyY2xlLnNldE9wdGlvbnMoe1xuICAgICAgICAgICAgICAgICAgICBzdHJva2VDb2xvcjogJyNCQTNDM0QnLFxuICAgICAgICAgICAgICAgICAgICBzdHJva2VPcGFjaXR5OiAwLjM1LFxuICAgICAgICAgICAgICAgICAgICBzdHJva2VXZWlnaHQ6IDEsXG4gICAgICAgICAgICAgICAgICAgIGZpbGxDb2xvcjogJyNCQTNDM0QnLFxuICAgICAgICAgICAgICAgICAgICBmaWxsT3BhY2l0eTogMC4xLFxuICAgICAgICAgICAgICAgICAgICBjbGlja2FibGU6IGZhbHNlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlYXJjaF9yYWRpdXNfY2lyY2xlLnNldE9wdGlvbnMoe1xuICAgICAgICAgICAgICAgICAgICBzdHJva2VDb2xvcjogJyNGRjAwMDAnLFxuICAgICAgICAgICAgICAgICAgICBzdHJva2VPcGFjaXR5OiAwLjgsXG4gICAgICAgICAgICAgICAgICAgIHN0cm9rZVdlaWdodDogMixcbiAgICAgICAgICAgICAgICAgICAgZmlsbENvbG9yOiAnI0ZGMDAwMCcsXG4gICAgICAgICAgICAgICAgICAgIGZpbGxPcGFjaXR5OiAwLjM1LFxuICAgICAgICAgICAgICAgICAgICBjbGlja2FibGU6IGZhbHNlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc3RvcmVpZnlfb3Blbl9uZXdfdGFiX2luZGV4ID0gMDtcbiAgICAgICAgaWYodHlwZW9mIHN0b3JlaWZ5X29wZW5fbmV3X3RhYiAhPT0gJ3VuZGVmaW5lZCcpXG4gICAgICAgICAgICBzdG9yZWlmeV9vcGVuX25ld190YWJfaW5kZXggPSBzdG9yZWlmeV9vcGVuX25ld190YWI7XG4gICAgICAgIGlmICh0eXBlb2YgaWZ5X2ZpZWxkc1Zpc2liaWxpdHkgIT09ICd1bmRlZmluZWQnKVxuICAgICAgICAgICAgaWZ5RmllbGRzVmlzaWJpbGl0eSA9IEpTT04ucGFyc2UoQjY0LmRlY29kZShpZnlfZmllbGRzVmlzaWJpbGl0eSkpO1xuICAgICAgICBpZiAodHlwZW9mIGlmeWxhbmdzICE9PSAndW5kZWZpbmVkJylcbiAgICAgICAgICAgIHN0b3JlbG9jYXRvcl9sYW5nID0gSlNPTi5wYXJzZShCNjQuZGVjb2RlKGlmeWxhbmdzKSk7XG4gICAgICAgIGlmICh0eXBlb2YgZGF0YUFwcHMubGFuZyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHN0b3JlbG9jYXRvcl9sYW5nID0gZGF0YUFwcHMubGFuZztcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGF0YUFwcHMucm9vdF91cmwgJiYgZGF0YUFwcHMucm9vdF91cmwgIT0gJy8nKSByb290X3VybCA9IGRhdGFBcHBzLnJvb3RfdXJsO1xuXG4gICAgICAgIC8vLy8vLy8vPT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAgICB2YXIgaHRtbExpc3RUcmFucyA9ICcnO1xuICAgICAgICB2YXIgaXNJZnlUcmFucyA9IGZhbHNlO1xuICAgICAgICB2YXIgcm9vdFVybEN1cnJlbnQgPSAocm9vdF91cmwpLnJlcGxhY2UoXCIvXCIsIFwiXCIpO1xuICAgICAgICB2YXIgbG9jYXRpb25MaXN0ID0gZGF0YUFwcHMubG9jYXRpb25fbGlzdDtcbiAgICAgICAgdmFyIGxvY2FsZUN1cnJlbnQgPSB3aW5kb3cuU2hvcGlmeS5sb2NhbGU7XG4gICAgICAgIGlmKGxvY2F0aW9uTGlzdCAhPT0gdW5kZWZpbmVkICYmIHJvb3RVcmxDdXJyZW50ICYmIGxvY2F0aW9uTGlzdC5pbmNsdWRlcyhsb2NhbGVDdXJyZW50KSl7XG4gICAgICAgICAgICBpc0lmeVRyYW5zID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICAvLy8vLz09PT09PT09PT09PT09XG4gICAgICAgIC8vIGxvY2FsZUN1cnJlbnQgPSAndmknO1xuICAgICAgICAvLyBpc0lmeVRyYW5zID0gdHJ1ZTtcbiAgICAgICAgLy8vLy89PT09PT09PT09PT09PVxuICAgICAgICB2YXIgaWZ5X2xheW91dCA9IGRhdGFBcHBzLmlmeV9sYXlvdXQgfHwgMTtcbiAgICAgICAgdmFyIGlmeV9zaG93X2Jsb2NrX2NhcnQgPSB3aW5kb3cuaWZ5X3Nob3dfYmxvY2tfY2FydCB8fCAwO1xuICAgICAgICBpZihpZnlfc2hvd19ibG9ja19jYXJ0ID09PSAxICYmIGRhdGFBcHBzLnNob3BpZnlfdGVtcGxhdGUgPT09ICdjYXJ0JylcbiAgICAgICAgICAgIGlmeV9zaG93X2Jsb2NrX2NhcnQgPSAxXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmeV9zaG93X2Jsb2NrX2NhcnQgPSAwXG5cbiAgICAgICAgLy8gdmFyIGxpbWl0X3N0b3JlID0gNTAwMDtcbiAgICAgICAgLy8gdmFyIGxpc3RfbW9kZSA9IDA7XG4gICAgICAgIC8vIHZhciBzZWFyY2hfbW9kZSA9IDA7XG4gICAgICAgIC8vY29kZSBoZXJlXG5cbiAgICAgICAvLyBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4ge1xuICAgICAgICAgICAgXG4gICAgICAgIC8vfSk7XG4gICAgICAgIFxuICAgICAgICBmdW5jdGlvbiBpbml0TWFwKCkge1xuICAgICAgICAgICAgdmFyIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgICAgICAgICAgc2NyaXB0LnNyYyA9IHdpbmRvdy5nZW9qc29uX3VybDtcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbiAgICAgICAgICAgIGlmKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFwXCIpICYmICFkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0b3JlaWZ5LWRldGFpbC1zdG9yZVwiKSl7XG4gICAgICAgICAgICAgICAgbG9jYXRpb25EaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0b3JlaWZ5X2xvY2F0aW9uXCIpO1xuICAgICAgICAgICAgICAgIGlmKCFsb2NhdGlvbkRpdikgbG9jYXRpb25EaXYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvY2F0aW9uXCIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGlmeUlucHV0QWRkcmVzcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZGRyZXNzJyk7XG4gICAgICAgICAgICAgICAgdmFyIHN0eWxlZE1hcFR5cGUgPSBuZXcgZ29vZ2xlLm1hcHMuU3R5bGVkTWFwVHlwZShKU09OLnBhcnNlKEI2NC5kZWNvZGUobWFwX3N0eWxlX3JlbmRlcikpKTtcbiAgICAgICAgICAgICAgICBtYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFwXCIpLCB7XG4gICAgICAgICAgICAgICAgICAgIGNlbnRlcjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhjZW50ZXJfbGF0LCBjZW50ZXJfbG5nKSxcbiAgICAgICAgICAgICAgICAgICAgem9vbTogaW5pdGlhbF96b29tLFxuICAgICAgICAgICAgICAgICAgICBtYXBUeXBlSWQ6IGdvb2dsZS5tYXBzLk1hcFR5cGVJZC5ST0FETUFQLFxuICAgICAgICAgICAgICAgICAgICBtYXBUeXBlQ29udHJvbDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHN0cmVldFZpZXdDb250cm9sOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgbWFwVHlwZUNvbnRyb2xPcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogZ29vZ2xlLm1hcHMuTWFwVHlwZUNvbnRyb2xTdHlsZS5EUk9QRE9XTl9NRU5VXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBtYXAubWFwVHlwZXMuc2V0KCdzdHlsZWRfbWFwJywgc3R5bGVkTWFwVHlwZSk7XG4gICAgICAgICAgICAgICAgbWFwLnNldE1hcFR5cGVJZCgnc3R5bGVkX21hcCcpO1xuICAgICAgICAgICAgICAgIGluZm93aW5kb3cgPSBuZXcgZ29vZ2xlLm1hcHMuSW5mb1dpbmRvdygpO1xuICAgICAgICAgICAgICAgIGJvdW5kcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmdCb3VuZHMoKTtcbiAgICAgICAgICAgICAgICB2YXIgc2VhcmNoQm94ID0gbmV3IGdvb2dsZS5tYXBzLnBsYWNlcy5TZWFyY2hCb3goaWZ5SW5wdXRBZGRyZXNzKTtcbiAgICAgICAgICAgICAgICB2YXIgdGFnc19pbnB1dCA9IFtdO1xuICAgICAgICAgICAgICAgIGlmIChwcmlvcml0eV9zZWFyY2ggIT0gJ2dsb2JhbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudFJlc3RyaWN0aW9uczogeyBjb3VudHJ5OiBwcmlvcml0eV9zZWFyY2ggfSxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYXV0b2NvbXBsZXRlID0gbmV3IGdvb2dsZS5tYXBzLnBsYWNlcy5BdXRvY29tcGxldGUoaWZ5SW5wdXRBZGRyZXNzLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgZ29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIoYXV0b2NvbXBsZXRlLCAncGxhY2VfY2hhbmdlZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoTG9jYXRpb24ocHJpb3JpdHlfc2VhcmNoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGF1dG9jb21wbGV0ZSA9IG5ldyBnb29nbGUubWFwcy5wbGFjZXMuQXV0b2NvbXBsZXRlKGlmeUlucHV0QWRkcmVzcyk7XG4gICAgICAgICAgICAgICAgICAgIGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKGF1dG9jb21wbGV0ZSwgJ3BsYWNlX2NoYW5nZWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaExvY2F0aW9uKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgalF1ZXJ5LmVhY2goalF1ZXJ5KCdpbnB1dC5zdG9yZWlmeWFwcF9zdG9yZXNfdGFnc19maWx0ZXI6Y2hlY2tlZCcpLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFnc19pbnB1dC5wdXNoKGpRdWVyeSh0aGlzKS52YWwoKSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdmFyIGZpbHRlcl9jb3VudHJ5ID0gJ2FsbCcsZmlsdGVyX3JlZ2lvbiA9ICdpZnlfYWxsJyxmaWx0ZXJfY2l0eSA9ICdpZnlfYWxsJztcbiAgICAgICAgICAgICAgICBpZiAoalF1ZXJ5KCdpbnB1dC5zdG9yZWlmeWFwcF9zdG9yZXNfY291bnRyeV9maWx0ZXInKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyX2NvdW50cnkgPSBqUXVlcnkoJ2lucHV0LnN0b3JlaWZ5YXBwX3N0b3Jlc19jb3VudHJ5X2ZpbHRlcjpjaGVja2VkJykudmFsKCk7ICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoalF1ZXJ5KCdpbnB1dC5zdG9yZWlmeWFwcF9zdG9yZXNfcmVnaW9uX2ZpbHRlcicpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJfcmVnaW9uID0galF1ZXJ5KCdpbnB1dC5zdG9yZWlmeWFwcF9zdG9yZXNfcmVnaW9uX2ZpbHRlcjpjaGVja2VkJykudmFsKCk7ICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoalF1ZXJ5KCdpbnB1dC5zdG9yZWlmeWFwcF9zdG9yZXNfY2l0eV9maWx0ZXInKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyX2NpdHkgPSBqUXVlcnkoJ2lucHV0LnN0b3JlaWZ5YXBwX3N0b3Jlc19jaXR5X2ZpbHRlcjpjaGVja2VkJykudmFsKCk7ICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZihqUXVlcnkoJy5zdG9yZWlmeWFwcF9zdG9yZXNfY291bnRyeXNfZmlsdGVyX2xpc3QnKS5kYXRhKCd0YWcnKSA9PSAnc2VsZWN0Jyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJfY291bnRyeSA9IGpRdWVyeSgnc2VsZWN0LnN0b3JlaWZ5YXBwX3N0b3Jlc19jb3VudHJ5X2ZpbHRlcicpLnZhbCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZihqUXVlcnkoJy5zdG9yZWlmeWFwcF9zdG9yZXNfcmVnaW9uX2ZpbHRlcl9saXN0JykuZGF0YSgndGFnJykgPT0gJ3NlbGVjdCcpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyX3JlZ2lvbiA9IGpRdWVyeSgnc2VsZWN0LnN0b3JlaWZ5YXBwX3N0b3Jlc19yZWdpb25fZmlsdGVyJykudmFsKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmKGpRdWVyeSgnLnN0b3JlaWZ5YXBwX3N0b3Jlc19jaXR5X2ZpbHRlcl9saXN0JykuZGF0YSgndGFnJykgPT0gJ3NlbGVjdCcpe1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyX2NpdHkgPSBqUXVlcnkoJ3NlbGVjdC5zdG9yZWlmeWFwcF9zdG9yZXNfY2l0eV9maWx0ZXInKS52YWwoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYoZmlsdGVyX3JlZ2lvbiA9PSAndW5uYW1lZF9yZWdpb24nKSBmaWx0ZXJfcmVnaW9uID0gJyc7XG4gICAgICAgICAgICAgICAgaWYoZmlsdGVyX2NpdHkgPT0gJ3VubmFtZWRfY2l0eScpIGZpbHRlcl9jaXR5ID0gJyc7XG5cbiAgICAgICAgICAgICAgICBpZiAobG9jYXRpb25EaXYpIGxvY2F0aW9uRGl2LmlubmVySFRNTCA9ICc8ZGl2IGlkPVwiJyArIHJhbmRvbUlEICsgJ1wiIGNsYXNzPVwibGlzdC1pdGVtLTNcIj48L2Rpdj4nO1xuICAgICAgICAgICAgICAgIHZhciB0aWxlc2xvYWRlZCA9IGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKG1hcCwgXCJ0aWxlc2xvYWRlZFwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYoIWlzSWZ5VHJhbnMpe1xuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbF9saXN0ID0gaHRtbF9saXN0LnJlcGxhY2VBbGwoXCJ7eyBkaXJlY3Rpb25zIH19XCIsc3RvcmVsb2NhdG9yX2xhbmcuZGlyZWN0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBodG1sX2xpc3QgPSBodG1sX2xpc3QucmVwbGFjZUFsbChcInt7IGxpbmtfZGV0YWlsIH19XCIsc3RvcmVsb2NhdG9yX2xhbmcubGlua19kZXRhaWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbF9saXN0ID0gaHRtbF9saXN0LnJlcGxhY2VBbGwoXCJ7eyBsb2FkX21hcF90ZXh0IH19XCIsc3RvcmVsb2NhdG9yX2xhbmcubG9hZF9tYXBfdGV4dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBodG1sX2xpc3QgPSBodG1sX2xpc3QucmVwbGFjZUFsbChcInt7IGlmeV9zZWxlY3RfcHJvdmlkZXIgfX1cIixzdG9yZWxvY2F0b3JfbGFuZy5pZnlfc2VsZWN0X3Byb3ZpZGVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGh0bWxfbGlzdCA9IGh0bWxfbGlzdC5yZXBsYWNlQWxsKFwie3sgaWZ5X3RyYW5zX2NvbnRhY3RfdXMgfX1cIiwgc3RvcmVsb2NhdG9yX2xhbmcuY29udGFjdF9zdG9yZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgb3Blbl9uZXdfdGFiVGV4dCA9ICdUaGlzIGxpbmsgb3BlbnMgaW4gYSBuZXcgdGFiLic7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZih0eXBlb2Ygc3RvcmVsb2NhdG9yX2xhbmcub3Blbl9uZXdfdGFiICE9ICd1bmRlZmluZWQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wZW5fbmV3X3RhYlRleHQgPSBzdG9yZWxvY2F0b3JfbGFuZy5vcGVuX25ld190YWI7XG4gICAgICAgICAgICAgICAgICAgICAgICBodG1sX2xpc3QgPSBodG1sX2xpc3QucmVwbGFjZUFsbChcInt7IG9wZW5fbmV3X3RhYiB9fVwiLG9wZW5fbmV3X3RhYlRleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoIWpRdWVyeSgnLmNvbnRlbnQtcmVzdWx0cy1zbHQnKS5oYXNDbGFzcygnc2hvcnRjb2RlLXRhZ3MtbGlzdCcpKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnaW5pdE1hcCA9Pj4gYWRkIGxpc3QgdjInKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGxpc3QgY3JlYXRlZCBoZXJlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZ2V0X2h0bWxfbGlzdCgpLnRoZW4oZGF0YSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgIC8vIGpRdWVyeSgnIycgKyByYW5kb21JRCkuaHRtbChodG1sX2xpc3QpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICBqUXVlcnkoJyMnICsgcmFuZG9tSUQpLmh0bWwoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gfSk7XG5cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGpRdWVyeSgnIycgKyByYW5kb21JRCkuaHRtbChodG1sX2xpc3QpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBqUXVlcnkoJy5jb250ZW50LXJlc3VsdHMtc2x0JykucmVtb3ZlQ2xhc3MoJ3Nob3J0Y29kZS10YWdzLWxpc3QnKSBcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZighalF1ZXJ5KCcuY29udGVudC1yZXN1bHRzLXNsdCcpLmhhc0NsYXNzKCdzaG9ydGNvZGUtdGFncy1saXN0Jykpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGpRdWVyeSgnIycgKyByYW5kb21JRCkuaHRtbCgnbG9hZGluZy4uLicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBqUXVlcnkoJy5jb250ZW50LXJlc3VsdHMtc2x0JykucmVtb3ZlQ2xhc3MoJ3Nob3J0Y29kZS10YWdzLWxpc3QnKSBcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBqUXVlcnkoXCIjcmVzdWx0cy1zbHRcIikuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICBnb29nbGUubWFwcy5ldmVudC5yZW1vdmVMaXN0ZW5lcih0aWxlc2xvYWRlZCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGFzeW5jIGZ1bmN0aW9uIHJ1bkhvbGlkYXlDaGVjaygpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgY2hlY2tIb2xpZGF5cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcnVuSG9saWRheUNoZWNrKCk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZm9ybWF0Q21zU3RvcmVEYXRhKCkge1xuICAgICAgICAgICAgbGV0IGRhdGEgPSB3aW5kb3cudGhlbWVBc3NldHMuc3RvcmVfZGF0YTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiRmVhdHVyZUNvbGxlY3Rpb25cIixcbiAgICAgICAgICAgICAgICAgICAgZmVhdHVyZXM6IGRhdGEuYWRkcmVzcy5tYXAoKGFkZHJlc3MsIGluZGV4KSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIkZlYXR1cmVcIixcbiAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cnk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiUG9pbnRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5sb25nID8gTnVtYmVyKGRhdGEubG9uZ1tpbmRleF0pIDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5sYXRbaW5kZXhdID8gTnVtYmVyKGRhdGEubGF0W2luZGV4XSkgOiAnJ1xuICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXRlZ29yeTogXCJzdG9yZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWRkcmVzcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGRhdGEubmFtZSA/IGRhdGEubmFtZVtpbmRleF0gOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRodW1ibmFpbDogZGF0YS50aHVtYm5haWwgPyBkYXRhLnRodW1ibmFpbFtpbmRleF0gOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZHJlc3M6IGRhdGEuYWRkcmVzcyA/IGRhdGEuYWRkcmVzc1tpbmRleF0gOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogZGF0YS51cmwgPyBkYXRhLnVybFtpbmRleF0gOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBob25lOiBkYXRhLmFkZHJlc3MgPyBkYXRhLnBob25lW2luZGV4XSA6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGF0OiBkYXRhLmxhdFtpbmRleF0gPyBkYXRhLmxhdFtpbmRleF0gOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvbmc6IGRhdGEubG9uZ1tpbmRleF0gPyBkYXRhLmxvbmdbaW5kZXhdIDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICBzb2NpYWw6IGRhdGEuc29jaWFsID8gZGF0YS5zb2NpYWxbaW5kZXhdIDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWdzOiBkYXRhLnRhZ3MgPyBkYXRhLnRhZ3NbaW5kZXhdIDogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICBvcGVuaW5nX3RpbWVzOiBkYXRhLm9wZW5pbmdfdGltZXMgPyBkYXRhLm9wZW5pbmdfdGltZXNbaW5kZXhdIDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudHJ5OiBkYXRhLmNvdW50cnkgPyBkYXRhLmNvdW50cnlbaW5kZXhdIDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICByZWdpb246IGRhdGEucmVnaW9uID8gZGF0YS5yZWdpb25baW5kZXhdIDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICBjaXR5OiBkYXRhLmNpdHkgPyBkYXRhLmNpdHlbaW5kZXhdIDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2hlZHVsZTogZGF0YS5zY2hlZHVsZSA/IGRhdGEuc2NoZWR1bGVbaW5kZXhdIDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2hlZHVsZV90ZXh0OiBkYXRhLnNjaGVkdWxlID8gZGF0YS5zY2hlZHVsZV90ZXh0W2luZGV4XSA6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGRhdGEuc3RvcmVfaWQgPyBOdW1iZXIoZGF0YS5zdG9yZV9pZFtpbmRleF0pIDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbWFpbDogZGF0YS5lbWFpbCA/IGRhdGEuZW1haWxbaW5kZXhdIDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZV9pZDogZGF0YS5wbGFjZV9pZCA/IGRhdGEucGxhY2VfaWRbaW5kZXhdIDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICBmZWF0dXJlZF9zdG9yZTogZGF0YS5mZWF0dXJlZF9zdG9yZSA/IGRhdGEuZmVhdHVyZWRfc3RvcmVbaW5kZXhdIDogJydcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgfTtcbiAgXG4gICAgICAgIH1cblxuICAgICAgICAvLyBmb3JtYXQgbWV0YWRhdGFcbiAgICAgICAgbGV0IGNtc19zdG9yZV9kYXRhID0gZm9ybWF0Q21zU3RvcmVEYXRhKCk7XG5cblxuICAgICAgICB3aW5kb3cuZXFmZWVkX2NhbGxiYWNrID0gZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICAgICAgJCgnLnN0b3JlbG9jYXRvci1sb2FkaW5nJykuYWRkQ2xhc3MoJ2hpZGUnKTtcblxuICAgICAgICAgICAgdmFyIHRodW0gPSAnJztcbiAgICAgICAgICAgIHZhciBjb3VudF9tYXJrZXIgPSAwO1xuICAgICAgICAgICAgdmFyIGh0bWxfbGlzdCA9ICcnO1xuICAgICAgICAgICAgdmFyIHBhcmFtcyA9IFtdO1xuICAgICAgICAgICAgdmFyIGxpc3QgPSAnJztcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmVzdWx0cyA9IGNtc19zdG9yZV9kYXRhO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlc3VsdHMuZmVhdHVyZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgY29vcmRzID0gcmVzdWx0cy5mZWF0dXJlc1tpXS5nZW9tZXRyeS5jb29yZGluYXRlcztcbiAgICAgICAgICAgICAgICB2YXIgbGF0TG5nID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhjb29yZHNbMV0sIGNvb3Jkc1swXSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdmFyIHByb3BlcnRpZXMgPSByZXN1bHRzLmZlYXR1cmVzW2ldLnByb3BlcnRpZXM7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBwcm9wZXJ0aWVzLnRodW1ibmFpbCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGh1bSA9IHByb3BlcnRpZXMudGh1bWJuYWlsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgdHJhbnMgPSBbXVxuICAgICAgICAgICAgICAgIGlmKHByb3BlcnRpZXMudHJhbnMgIT09IHVuZGVmaW5lZCAmJiBwcm9wZXJ0aWVzLnRyYW5zW2xvY2FsZUN1cnJlbnRdICE9PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgICAgICAgICB0cmFucyA9IHByb3BlcnRpZXMudHJhbnNbbG9jYWxlQ3VycmVudF07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIGxpc3QgaGVyZVxuICAgICAgICAgICAgICAgIGlmKHJlc3VsdHMuZmVhdHVyZXNbaV0pIHtcbiAgICAgICAgICAgICAgICAgICAgbGlzdCArPSBjcmVhdGVfaHRtbF9saXN0KHJlc3VsdHMuZmVhdHVyZXNbaV0sIFtpXSlcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBcblxuICAgICAgICAgICAgICAgIHBhcmFtcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgY291bnRyeTogcHJvcGVydGllcy5jb3VudHJ5LFxuICAgICAgICAgICAgICAgICAgICByZWdpb246IHByb3BlcnRpZXMucmVnaW9uLFxuICAgICAgICAgICAgICAgICAgICBjaXR5OiBwcm9wZXJ0aWVzLmNpdHksXG4gICAgICAgICAgICAgICAgICAgIHRhZ3M6IHByb3BlcnRpZXMudGFncyxcbiAgICAgICAgICAgICAgICAgICAgd2ViOiBwcm9wZXJ0aWVzLndlYixcbiAgICAgICAgICAgICAgICAgICAgZW1haWw6IHByb3BlcnRpZXMuZW1haWwsXG4gICAgICAgICAgICAgICAgICAgIHBob25lOiBwcm9wZXJ0aWVzLnBob25lLFxuICAgICAgICAgICAgICAgICAgICB0aHVtOiB0aHVtLFxuICAgICAgICAgICAgICAgICAgICBpZDogcHJvcGVydGllcy5pZCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogcHJvcGVydGllcy5uYW1lLFxuICAgICAgICAgICAgICAgICAgICB1cmw6IHByb3BlcnRpZXMudXJsLFxuICAgICAgICAgICAgICAgICAgICBhZGRyZXNzOiBwcm9wZXJ0aWVzLmFkZHJlc3MsXG4gICAgICAgICAgICAgICAgICAgIHNvY2lhbDogcHJvcGVydGllcy5zb2NpYWwsXG4gICAgICAgICAgICAgICAgICAgIHBsYWNlX2lkOiBwcm9wZXJ0aWVzLnBsYWNlX2lkLFxuICAgICAgICAgICAgICAgICAgICB0YWdzOiBwcm9wZXJ0aWVzLnRhZ3MsXG4gICAgICAgICAgICAgICAgICAgIHNjaGVkdWxlOiBwcm9wZXJ0aWVzLnNjaGVkdWxlLFxuICAgICAgICAgICAgICAgICAgICBzY2hlZHVsZV90ZXh0OiBwcm9wZXJ0aWVzLnNjaGVkdWxlX3RleHRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZihtYXApe1xuICAgICAgICAgICAgICAgICAgICBsZXQgZGF0YV9tYWtlciA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKGNvb3Jkc1sxXSwgY29vcmRzWzBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvY2lhbDogcHJvcGVydGllcy5zb2NpYWwsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudHJ5OiBwcm9wZXJ0aWVzLmNvdW50cnksXG4gICAgICAgICAgICAgICAgICAgICAgICByZWdpb246IHByb3BlcnRpZXMucmVnaW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2l0eTogcHJvcGVydGllcy5jaXR5LFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFnczogcHJvcGVydGllcy50YWdzLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2ViOiBwcm9wZXJ0aWVzLndlYixcbiAgICAgICAgICAgICAgICAgICAgICAgIGVtYWlsOiBwcm9wZXJ0aWVzLmVtYWlsLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGhvbmU6IHByb3BlcnRpZXMucGhvbmUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHVtOiB0aHVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHByb3BlcnRpZXMuaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBwcm9wZXJ0aWVzLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBvcGVuaW5nX3RpbWVzOiBwcm9wZXJ0aWVzLm9wZW5pbmdfdGltZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZV9pZDogcHJvcGVydGllcy5wbGFjZV9pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZlYXR1cmVkX3N0b3JlOiBwcm9wZXJ0aWVzLmZlYXR1cmVkX3N0b3JlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBwcm9wZXJ0aWVzLnVybCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZHJlc3M6IHByb3BlcnRpZXMuYWRkcmVzcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjaGVkdWxlOiBwcm9wZXJ0aWVzLnNjaGVkdWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2NoZWR1bGVfdGV4dDogcHJvcGVydGllcy5zY2hlZHVsZV90ZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwOiBtYXAsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uX21hcmtlcjogcHJvcGVydGllcy5pY29uX21hcmtlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bTogaSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuczogdHJhbnNcblxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBpZiAobGlzdF9tb2RlICE9IDEgfHwgKGxpc3RfbW9kZSA9PSAxICYmIGkgPCBsaW1pdF9zdG9yZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvdW5kcy5leHRlbmQobGF0TG5nKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFfbWFrZXIudmlzaWJsZSA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYoKGxpc3RfbW9kZSAhPSAxICYmIGxpc3RfbW9kZSAhPSAzKSB8fCAoKGxpc3RfbW9kZSA9PSAzIHx8IGxpc3RfbW9kZSA9PSAxKSAmJiBpIDwgbGltaXRfc3RvcmUpKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50X21hcmtlcisrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXJrZXIgPSBjcmVhdGVNYXJrZXIoZGF0YV9tYWtlciwgbWFwLCBpbmZvd2luZG93KTtcbiAgICAgICAgICAgICAgICAgICAgZ21hcmtlcnMucHVzaChtYXJrZXIpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYoaXNJZnlUcmFucyl7XG4gICAgICAgICAgICAgICAgICAgIGh0bWxMaXN0VHJhbnMgKz0gY3JlYXRlX2h0bWxfbGlzdChwcm9wZXJ0aWVzW2ldLCBbaV0sIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAvL2h0bWxMaXN0VHJhbnMgKz0gbGlzdEl0ZW0ocHJvcGVydGllcy5zb2NpYWwsIHRodW0sIHByb3BlcnRpZXMuaWQsIHByb3BlcnRpZXMubmFtZSwgcHJvcGVydGllcy51cmwsIHByb3BlcnRpZXMuYWRkcmVzcywgcHJvcGVydGllcy5waG9uZSwgcHJvcGVydGllcy5lbWFpbCwgcHJvcGVydGllcy53ZWIsIG51bGwsIHByb3BlcnRpZXMudGFncywgaSxzZWFyY2ggPSBudWxsLCB0cmFucywgbG9jYWxlQ3VycmVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICBpZihpID4gMTApIG1hcmtlci5zZXRWaXNpYmxlKHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgalF1ZXJ5KCcjJyArIHJhbmRvbUlEKS5odG1sKGxpc3QpO1xuXG4gICAgICAgICAgICBsZXQgc3RvcmVJdGVtcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2lubmVyLWl0ZW0nKVxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdG9yZUl0ZW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RvcmVJdGVtID0gc3RvcmVJdGVtc1tpXTtcbiAgICAgICAgICAgICAgICBpZihzdG9yZUl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGxldCBwbGFjZUlkID0gc3RvcmVJdGVtLmRhdGFzZXQucGxhY2VcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZihpc0lmeVRyYW5zKVxuICAgICAgICAgICAgICAgIGpRdWVyeSgnIycgKyByYW5kb21JRCkuaHRtbChodG1sTGlzdFRyYW5zKTtcbiAgICAgICAgICAgIGlmKG1hcCl7XG4gICAgICAgICAgICAgICAgaWYgKGNvdW50X21hcmtlciA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgalF1ZXJ5KFwiI3N0b3JlaWZ5LXRleHQtcmVzdWx0XCIpLnRleHQoalF1ZXJ5KFwiI3N0b3JlaWZ5LXRleHQtcmVzdWx0XCIpLmRhdGEoJ3Jlc3VsdHMnKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgalF1ZXJ5KFwiI3N0b3JlaWZ5LXRleHQtcmVzdWx0XCIpLnRleHQoalF1ZXJ5KFwiI3N0b3JlaWZ5LXRleHQtcmVzdWx0XCIpLmRhdGEoJ3Jlc3VsdCcpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYoaWZ5X2xheW91dCAhPSA4KSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm51bS1yc1wiKS5pbm5lckhUTUwgPSBjb3VudF9tYXJrZXI7XG4gICAgICAgICAgICAgICAgaWYgKGxpc3RfbW9kZSA9PSAyIHx8IGxpbWl0X3N0b3JlID09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgalF1ZXJ5KFwiI3Jlc3VsdHMtc2x0IGgzLnRpdGxlXCIpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgalF1ZXJ5KFwiI21haW4tc2xpZGVyLXN0b3JlbG9jYXRvclwiKS5hZGRDbGFzcygnc3RvcmVpZnktZmlyc3QtYWxlcnQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGxpc3RfbW9kZSA9PSAyIHx8IGxpbWl0X3N0b3JlID09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgalF1ZXJ5KFwiI3Jlc3VsdHMtc2x0IGgzLnRpdGxlXCIpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgalF1ZXJ5KFwiI21haW4tc2xpZGVyLXN0b3JlbG9jYXRvclwiKS5yZW1vdmVDbGFzcygnc3RvcmVpZnktZmlyc3QtYWxlcnQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGNlbnRlcl9sYXQgPT0gMCAmJiBjZW50ZXJfbG5nID09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbWFwLmZpdEJvdW5kcyhib3VuZHMpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBtYXAuc2V0Wm9vbShpbml0aWFsX3pvb20pO1xuICAgICAgICAgICAgICAgICAgICBtYXAuc2V0Q2VudGVyKG5ldyBnb29nbGUubWFwcy5MYXRMbmcoY2VudGVyX2xhdCwgY2VudGVyX2xuZykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvYWRpbmdfbWFza19sb2FkZXJcIikuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsb2FkR2VvbG9jYXRpb25Jbml0KClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihzaG9ydGNvZGVfdXNlID09IDEpe1xuICAgICAgICAgICAgICAgIHZhciBsaXN0Q291bnRyeSA9IG5ldyBTaG9ydGNvZGUoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpLCB7XG4gICAgICAgICAgICAgICAgICBzdG9yZWlmeVN0b3JlbG9jYXRvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjb3VudHJ5ID0gdGhpcy5vcHRpb25zLmNvdW50cnk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjaXR5ID0gdGhpcy5vcHRpb25zLmNpdHk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjbGFzc190ZXh0ID0gJ3N0b3JlaWZ5LWxpc3QtY291bnRyeSc7XG4gICAgICAgICAgICAgICAgICAgIGlmKGNpdHkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NfdGV4dCA9ICdzdG9yZWlmeS1saXN0LWNpdHknO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHZhciBodG1sQ291bnRyeSA9ICc8ZGl2IGNsYXNzPVwiJytjbGFzc190ZXh0KydcIj4nO1xuICAgICAgICAgICAgICAgICAgICBqUXVlcnkuZWFjaChwYXJhbXMsIGZ1bmN0aW9uKCBpbmRleCwgdmFsdWUgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgaWYoY291bnRyeSAmJiB2YWx1ZS5jb3VudHJ5ID09IGNvdW50cnkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbENvdW50cnkgKz0gJzxkaXYgY2xhc3M9XCJzdG9yZWlmeS1pdGVtLWNpdHlcIj4nO1xuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbENvdW50cnkgKz0gJzxkaXYgY2xhc3M9XCJzdG9yZWxvY2F0b3ItdGl0bGUgc3RvcmVpZnktaXRlbS1pbmZvXCI+PGEgaHJlZj1cIicrdmFsdWUudXJsKydcIj4nK3ZhbHVlLm5hbWUrJzwvYT48L2Rpdj4nO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlLmFkZHJlc3MgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0bWxDb3VudHJ5ICs9ICc8ZGl2IGNsYXNzPVwic3RvcmVpZnktc2wtaXRlbS1yb3cgaXRlbS1hZGRyZXNzIHN0b3JlaWZ5LWl0ZW0taW5mb1wiPjxwPicgKyB2YWx1ZS5hZGRyZXNzICsgJzwvcD48L2Rpdj4nO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlLmVtYWlsICE9IG51bGwgJiYgdHlwZW9mIHZhbHVlLmVtYWlsICE9ICd1bmRlZmluZWQnICYmIHZhbHVlLmVtYWlsICE9ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaHRtbENvdW50cnkgKz0gJzxkaXYgY2xhc3M9XCJzdG9yZWlmeS1zbC1pdGVtLXJvdyBpdGVtLWVudmVsb3BlIHN0b3JlaWZ5LWl0ZW0taW5mb1wiPicrZW1haWxfaWNvbisnJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sQ291bnRyeSArPSAnPGEgaHJlZj1cIm1haWx0bzonICsgdmFsdWUuZW1haWwgKyAnXCIgY2xhc3M9XCJwaG9uZS1lbWFpbFwiPicgKyB2YWx1ZS5lbWFpbCArICc8L2E+PC9kaXY+JztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZS5waG9uZSAhPSBudWxsICYmIHR5cGVvZiB2YWx1ZS5waG9uZSAhPSAndW5kZWZpbmVkJyAmJiB2YWx1ZS5waG9uZSAhPSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0bWxDb3VudHJ5ICs9ICc8ZGl2IGNsYXNzPVwic3RvcmVpZnktc2wtaXRlbS1yb3cgaXRlbS1waG9uZSBzdG9yZWlmeS1pdGVtLWluZm9cIj4nK3Bob25lX2ljb24rJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaHRtbENvdW50cnkgKz0gJzxhIGhyZWY9XCJ0ZWw6JyArIHZhbHVlLnBob25lICsgJ1wiIGNsYXNzPVwicGhvbmUtbm9cIj4nICsgdmFsdWUucGhvbmUgKyAnPC9hPjwvZGl2Pic7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUud2ViICE9IG51bGwgJiYgdHlwZW9mIHZhbHVlLndlYiAhPSAndW5kZWZpbmVkJyAmJiB2YWx1ZS53ZWIgIT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sQ291bnRyeSArPSAnPGRpdiBjbGFzcz1cInN0b3JlaWZ5LXNsLWl0ZW0tcm93IGl0ZW0tbGluayBzdG9yZWlmeS1pdGVtLWluZm9cIj4nK3dlYl9pY29uKycnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0bWxDb3VudHJ5ICs9IHZhbHVlLndlYiArICc8L2Rpdj4nO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlLnRhZ3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0YWdfYXJyID0gdmFsdWUudGFncztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGFnX2h0bWwgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqUXVlcnkuZWFjaCh0YWdfYXJyLCBmdW5jdGlvbihpLCB2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFnX2h0bWwgKz0gJzxzcGFuIGNsYXNzPVwidGFnLWl0ZW0gdGFnLWl0ZW0tJytzdHJpbmdfdG9fc2x1Zyh2YWwpKydcIj48aSBjbGFzcz1cImZhIGZhLWNoZWNrXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPiAnICsgdmFsICsgJzwvc3Bhbj4nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0bWxDb3VudHJ5ICs9ICc8ZGl2IGNsYXNzPVwiaXRlbS10YWdzIHN0b3JlaWZ5LWl0ZW0taW5mb1wiPicgKyB0YWdfaHRtbCArJzwvZGl2Pic7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUuc29jaWFsICE9IG51bGwgJiYgdHlwZW9mIHZhbHVlLnNvY2lhbCAhPSAndW5kZWZpbmVkJyAmJiB2YWx1ZS5zb2NpYWwgIT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sQ291bnRyeSArPSAnPGRpdiBjbGFzcz1cInN0b3JlaWZ5LXN0b3JlbG9jYXRvci1zb2NpYWwtbWFrZXJcIj4nICsgdmFsdWUuc29jaWFsICsgJzwvZGl2Pic7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBodG1sQ291bnRyeSArPSAnPC9kaXY+JztcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICBpZihjaXR5ICYmIHZhbHVlLmNpdHkgPT0gY2l0eSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBodG1sQ291bnRyeSArPSAnPGRpdiBjbGFzcz1cInN0b3JlaWZ5LWl0ZW0tY2l0eVwiPic7XG4gICAgICAgICAgICAgICAgICAgICAgICBodG1sQ291bnRyeSArPSAnPGRpdiBjbGFzcz1cInN0b3JlbG9jYXRvci10aXRsZSBzdG9yZWlmeS1pdGVtLWluZm9cIj48YSBocmVmPVwiJyt2YWx1ZS51cmwrJ1wiPicrdmFsdWUubmFtZSsnPC9hPjwvZGl2Pic7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUuYWRkcmVzcyAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaHRtbENvdW50cnkgKz0gJzxkaXYgY2xhc3M9XCJzdG9yZWlmeS1zbC1pdGVtLXJvdyBpdGVtLWFkZHJlc3Mgc3RvcmVpZnktaXRlbS1pbmZvXCI+PHA+JyArIHZhbHVlLmFkZHJlc3MgKyAnPC9wPjwvZGl2Pic7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUuZW1haWwgIT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUuZW1haWwgIT0gJ3VuZGVmaW5lZCcgJiYgdmFsdWUuZW1haWwgIT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sQ291bnRyeSArPSAnPGRpdiBjbGFzcz1cInN0b3JlaWZ5LXNsLWl0ZW0tcm93IGl0ZW0tZW52ZWxvcGUgc3RvcmVpZnktaXRlbS1pbmZvXCI+JytlbWFpbF9pY29uKycnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0bWxDb3VudHJ5ICs9ICc8YSBocmVmPVwibWFpbHRvOicgKyB2YWx1ZS5lbWFpbCArICdcIiBjbGFzcz1cInBob25lLWVtYWlsXCI+JyArIHZhbHVlLmVtYWlsICsgJzwvYT48L2Rpdj4nO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlLnBob25lICE9IG51bGwgJiYgdHlwZW9mIHZhbHVlLnBob25lICE9ICd1bmRlZmluZWQnICYmIHZhbHVlLnBob25lICE9ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaHRtbENvdW50cnkgKz0gJzxkaXYgY2xhc3M9XCJzdG9yZWlmeS1zbC1pdGVtLXJvdyBpdGVtLXBob25lIHN0b3JlaWZ5LWl0ZW0taW5mb1wiPicrcGhvbmVfaWNvbisnJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sQ291bnRyeSArPSAnPGEgaHJlZj1cInRlbDonICsgdmFsdWUucGhvbmUgKyAnXCIgY2xhc3M9XCJwaG9uZS1ub1wiPicgKyB2YWx1ZS5waG9uZSArICc8L2E+PC9kaXY+JztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZS53ZWIgIT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUud2ViICE9ICd1bmRlZmluZWQnICYmIHZhbHVlLndlYiAhPSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0bWxDb3VudHJ5ICs9ICc8ZGl2IGNsYXNzPVwic3RvcmVpZnktc2wtaXRlbS1yb3cgaXRlbS1saW5rIHN0b3JlaWZ5LWl0ZW0taW5mb1wiPicrd2ViX2ljb24rJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaHRtbENvdW50cnkgKz0gdmFsdWUud2ViICsgJzwvZGl2Pic7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUudGFncy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRhZ19hcnIgPSB2YWx1ZS50YWdzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0YWdfaHRtbCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpRdWVyeS5lYWNoKHRhZ19hcnIsIGZ1bmN0aW9uKGksIHZhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWdfaHRtbCArPSAnPHNwYW4gY2xhc3M9XCJ0YWctaXRlbSB0YWctaXRlbS0nK3N0cmluZ190b19zbHVnKHZhbCkrJ1wiPjxpIGNsYXNzPVwiZmEgZmEtY2hlY2tcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+ICcgKyB2YWwgKyAnPC9zcGFuPic7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaHRtbENvdW50cnkgKz0gJzxkaXYgY2xhc3M9XCJpdGVtLXRhZ3Mgc3RvcmVpZnktaXRlbS1pbmZvXCI+JyArIHRhZ19odG1sICsnPC9kaXY+JztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZS5zb2NpYWwgIT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUuc29jaWFsICE9ICd1bmRlZmluZWQnICYmIHZhbHVlLnNvY2lhbCAhPSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0bWxDb3VudHJ5ICs9ICc8ZGl2IGNsYXNzPVwic3RvcmVpZnktc3RvcmVsb2NhdG9yLXNvY2lhbC1tYWtlclwiPicgKyB2YWx1ZS5zb2NpYWwgKyAnPC9kaXY+JztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGh0bWxDb3VudHJ5ICs9ICc8L2Rpdj4nO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBodG1sQ291bnRyeSArPSc8L2Rpdj4nO1xuICAgICAgICAgICAgICAgICAgICAvL3JldHVybiB0aGlzLm9wdGlvbnMudGV4dDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGh0bWxDb3VudHJ5O1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICAvLz09PT09PT09PT09PT09PT09PSBmaWx0ZXIgPT09PT09PT09PT09XG4gICAgICAgIHZhciBibGFja0xpc3Q7XG4gICAgICAgIGNvbnN0IGZpbmRlcklmeV8xID0gL1xcW3N0b3JlaWZ5LXN0b3JlbG9jYXRvcig/Olxccyt0YWc9WydcIl0oW14nXCJdKylbJ1wiXSk/XFxzKlxcXS9nO1xuICAgICAgICBjb25zdCBmaW5kZXJJZnlfMiA9IC9cXFtzdG9yZWlmeS1zdG9yZWxvY2F0b3Itc2hvcnQoPzpcXHMrdGFnPVsnXCJdKFteJ1wiXSspWydcIl0pP1xccypcXF0vZztcbiAgICAgICAgalF1ZXJ5KCdib2R5JykuZWFjaChmdW5jdGlvbigpIHs7XG4gICAgICAgICAgICByZXBsYWNlcihmaW5kZXJJZnlfMSwgalF1ZXJ5KHRoaXMpLmdldCgwKSwgYmxhY2tMaXN0LCAxKTtcbiAgICAgICAgICAgIHJlcGxhY2VyKGZpbmRlcklmeV8yLCBqUXVlcnkodGhpcykuZ2V0KDApLCBibGFja0xpc3QsIDIpO1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGFyckxhbmdtYXAgPSB7XG4gICAgICAgICAgICAnbG9jYXRpb24nIDogc3RvcmVsb2NhdG9yX2xhbmcubG9jYXRpb24sXG4gICAgICAgICAgICAncHJvZHVjdF9uYW1lJyA6IHN0b3JlbG9jYXRvcl9sYW5nLnByb2R1Y3RfbmFtZSxcbiAgICAgICAgICAgICdzdG9yZV9uYW1lJyA6IHN0b3JlbG9jYXRvcl9sYW5nLnN0b3JlX25hbWUsXG4gICAgICAgICAgICAndHlwZV90b19zZWFyY2gnIDogc3RvcmVsb2NhdG9yX2xhbmcudHlwZV90b19zZWFyY2gsXG4gICAgICAgICAgICAndXNlX215X2xvY2F0aW9uJyA6IHN0b3JlbG9jYXRvcl9sYW5nLnVzZV9teV9sb2NhdGlvbixcbiAgICAgICAgICAgICdzZWFyY2hfcHJvZHVjdCcgOiBzdG9yZWxvY2F0b3JfbGFuZy5zZWFyY2hfcHJvZHVjdCxcbiAgICAgICAgICAgICdzZWFyY2hfc3RvcmUnIDogc3RvcmVsb2NhdG9yX2xhbmcuc2VhcmNoX3N0b3JlLFxuICAgICAgICAgICAgJ3JhZGl1c18yJyA6IHN0b3JlbG9jYXRvcl9sYW5nLnJhZGl1c18yLFxuICAgICAgICAgICAgJ2tpbG9tZXRlcnMnIDogc3RvcmVsb2NhdG9yX2xhbmcua2lsb21ldGVycyxcbiAgICAgICAgICAgICdtaWxlcycgOiBzdG9yZWxvY2F0b3JfbGFuZy5taWxlcyxcbiAgICAgICAgICAgICdyYWRpdXNfMScgOiBzdG9yZWxvY2F0b3JfbGFuZy5yYWRpdXNfMSxcbiAgICAgICAgICAgICdmaWx0ZXInIDogc3RvcmVsb2NhdG9yX2xhbmcuZmlsdGVyLFxuICAgICAgICAgICAgJ3NlYXJjaCcgOiBzdG9yZWxvY2F0b3JfbGFuZy5zZWFyY2gsXG4gICAgICAgICAgICAncmVzZXQnIDogc3RvcmVsb2NhdG9yX2xhbmcucmVzZXQsXG4gICAgICAgICAgICAnbGlzdCcgOiBzdG9yZWxvY2F0b3JfbGFuZy5saXN0LFxuICAgICAgICAgICAgJ21hcCcgOiBzdG9yZWxvY2F0b3JfbGFuZy5tYXAsXG4gICAgICAgICAgICAnc3RvcmVfbGlzdCcgOiBzdG9yZWxvY2F0b3JfbGFuZy5zdG9yZV9saXN0LFxuICAgICAgICAgICAgJ3Jlc3VsdCcgOiBzdG9yZWxvY2F0b3JfbGFuZy5yZXN1bHQsXG4gICAgICAgICAgICAncmVzdWx0cycgOiBzdG9yZWxvY2F0b3JfbGFuZy5yZXN1bHRzLFxuICAgICAgICB9O1xuICAgICAgICBqUXVlcnkuZWFjaChhcnJMYW5nbWFwLCBmdW5jdGlvbigga2V5LCB2YWwgKSB7XG4gICAgICAgICAgaHRtbF9yZXBvbnNlID0gaHRtbF9yZXBvbnNlLnJlcGxhY2VBbGwoXCJ7eyBcIitrZXkrXCIgfX1cIiwgdmFsKTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIGpRdWVyeSgnLnN0b3JlaWZ5YXBwcy1zdG9yZWxvY2F0b3Itc2hvcnRjb2RlJykuaHRtbChodG1sX3JlcG9uc2UpO1xuICAgICAgICAvKiBDaGVjayDDocK6wqluIHdpZGdldCBuw6HCusK/dSBjw4PCsyBibG9jayBtYXAgKi9cbiAgICAgICAgY29uc3QgbGlzdFNob3J0Y29kZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5zdG9yZWlmeWFwcHMtc3RvcmVsb2NhdG9yLXNob3J0Y29kZScpO1xuICAgICAgICBpZihsaXN0U2hvcnRjb2RlLmxlbmd0aCA+IDApe1xuICAgICAgICAgICAgaWYobGlzdFNob3J0Y29kZS5sZW5ndGggPiAxKXtcbiAgICAgICAgICAgICAgICBsaXN0U2hvcnRjb2RlLmZvckVhY2goKGVsLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgICAgY29uc3QgY2xhc3NlcyA9IFsuLi5lbC5jbGFzc0xpc3RdLmZpbHRlcihjID0+IGMgIT09ICdzdG9yZWlmeWFwcHMtc3RvcmVsb2NhdG9yLXNob3J0Y29kZScpO1xuICAgICAgICAgICAgICAgICAgLy8gS2nDocK7xpJtIHRyYSBjbGFzcyBjw6HCu8KlIHRow6HCu8aSXG4gICAgICAgICAgICAgICAgICBpZihlbC5jbGFzc0xpc3QuY29udGFpbnMoJ2lmeS1zaG9ydGNvZGUtd2lkZ2V0Jykpe1xuICAgICAgICAgICAgICAgICAgICBqUXVlcnkoJyNzdG9yZWlmeS1zbC1saWdodC1tb2RhbC13cmFwcGVyJykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIGpRdWVyeSgnI3N0b3JlaWZ5LXNsLWJ0bi10cmlnZ2VyLXBvcHVwJykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgalF1ZXJ5KCcuc3RvcmVpZnlhcHBzLXN0b3JlbG9jYXRvci1zaG9ydGNvZGUnKS5odG1sKGh0bWxfcmVwb25zZSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAvL2pRdWVyeSgnLnN0b3JlaWZ5YXBwcy1zdG9yZWxvY2F0b3Itc2hvcnRjb2RlJykuaHRtbChodG1sX3JlcG9uc2UpO1xuICAgICAgICAgICAgICAgIGpRdWVyeSgnI3N0b3JlaWZ5LXdpZGdldC1sb2FkaW5nJykucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0vKiBlbmQgY2hlY2sgKi9cblxuICAgICAgICBpZiAoalF1ZXJ5KCcuc3RvcmVpZnlhcHBzLXN0b3JlbG9jYXRvci1zaG9ydCcpLmxlbmd0aCkge1xuICAgICAgICAgICAgalF1ZXJ5KCcuc3RvcmVpZnlhcHBzLXN0b3JlbG9jYXRvci1zaG9ydCcpLmh0bWwoaHRtbF9yZXBvbnNlX3Nob3J0KTtcbiAgICAgICAgfVxuICAgICAgICBpZighaXNJZnlUcmFucyl7XG4gICAgICAgICAgICBzdG9yZWxvY2F0b3JfdGFnc19yZXNwb25zZSA9IHN0b3JlbG9jYXRvcl90YWdzX3Jlc3BvbnNlLnJlcGxhY2VBbGwoXCJ7eyBmaWx0ZXJfdGFncyB9fVwiLHN0b3JlbG9jYXRvcl9sYW5nLmZpbHRlcl90YWdzKTtcbiAgICAgICAgICAgIHN0b3JlbG9jYXRvcl9jb3VudHJ5ID0gc3RvcmVsb2NhdG9yX2NvdW50cnkucmVwbGFjZUFsbChcInt7IGFsbCB9fVwiLHN0b3JlbG9jYXRvcl9sYW5nLmFsbCk7XG4gICAgICAgICAgICBzdG9yZWxvY2F0b3JfY291bnRyeSA9IHN0b3JlbG9jYXRvcl9jb3VudHJ5LnJlcGxhY2VBbGwoXCJ7eyBmaWx0ZXJfY291bnRyeSB9fVwiLHN0b3JlbG9jYXRvcl9sYW5nLmZpbHRlcl9jb3VudHJ5KTtcbiAgICAgICAgICAgIHN0b3JlbG9jYXRvcl9jb3VudHJ5ID0gc3RvcmVsb2NhdG9yX2NvdW50cnkucmVwbGFjZUFsbChcInt7IHNlbGVjdF9jb3VudHJ5IH19XCIsc3RvcmVsb2NhdG9yX2xhbmcuc2VsZWN0X2NvdW50cnkpO1xuICAgICAgICBcbiAgICAgICAgICAgIGpRdWVyeSgnI3RhZ3MnKS5odG1sKHN0b3JlbG9jYXRvcl90YWdzX3Jlc3BvbnNlKTtcbiAgICAgICAgICAgIGpRdWVyeSgnI2NvdW50cnlfaHRtbCcpLmh0bWwoc3RvcmVsb2NhdG9yX2NvdW50cnkpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGNvbnN0IGlmeVRhZ3NPYmogPSBkYXRhQXBwcy50YWdfYXJyYXk7XG4gICAgICAgICAgICBqUXVlcnkoJyN0YWdzJykuaHRtbChpZnlSZW5kZXJUYWdzKGlmeVRhZ3NPYmopKTtcbiAgICAgICAgICAgIGNvbnN0IGlmeUNvdW50cnlzT2JqID0gZGF0YUFwcHMuY291bnRyeV9hcnJheTtcbiAgICAgICAgICAgIGpRdWVyeSgnI2NvdW50cnlfaHRtbCcpLmh0bWwoaWZ5UmVuZGVyQ291bnRyeXMoaWZ5X0Fycl9jb3VudHJ5LGlmeUNvdW50cnlzT2JqKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZihpZnlfZmlsdGVyX3JlZ2lvbl9jaXR5ID09IDEpe1xuICAgICAgICAgICAgcmVuZGVyRGVmYXVsdFJlZ2lvbigpO1xuICAgICAgICB9XG4gICAgICAgIGlmKHN0b3JlbG9jYXRvcl90YWdzX3Jlc3BvbnNlID09ICcnICYmIGpRdWVyeSgnI3N0b3Jlcy1jb3VudHJ5LWZpbHRlcicpLmxlbmd0aCA8PSAwICl7XG4gICAgICAgICAgalF1ZXJ5KCcjYnRuLWZpbHRlcicpLmhpZGUoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoalF1ZXJ5KCcuc3RvcmVpZnlhcHBzLXN0b3JlbG9jYXRvci1lcXVhbCcpLmxlbmd0aCkge1xuICAgICAgICAgICAgalF1ZXJ5KCcjZnJtLXN0b3JlbG9jYXRvci1zZWFyY2ggI21hcCcpLmNzcyhcImhlaWdodFwiLCAoalF1ZXJ5KCcuc3RvcmVpZnktc2Vhci1ib3gnKS5vdXRlckhlaWdodCgpICsgNTQwKSArIFwicHhcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxpc3RfbW9kZSA9PSAyIHx8IGxpbWl0X3N0b3JlID09IDApIHtcbiAgICAgICAgICAgIGpRdWVyeShcIiNyZXN1bHRzLXNsdCBoMy50aXRsZVwiKS5oaWRlKCk7XG4gICAgICAgICAgICBqUXVlcnkoXCIjbWFpbi1zbGlkZXItc3RvcmVsb2NhdG9yXCIpLmFkZENsYXNzKCdzdG9yZWlmeS1maXJzdC1hbGVydCcpO1xuICAgICAgICB9XG4gICAgICAgIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgICAgICBmdW5jdGlvbiBjcmVhdGVNYXJrZXIoZGF0YV9tYWtlciwgbWFwLCBpbmZvd2luZG93KSB7XG5cbiAgICAgICAgICAgIHZhciBodG1sID0gJyc7XG4gICAgICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic3RvcmUtbWFya2VyXCIgc3R5bGU9XCJtYXgtd2lkdGg6NDAwcHhcIj4nO1xuICAgICAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cImFkZHJlc3MtaW5mb1wiPjxkaXYgY2xhc3M9XCJ0YWJsZS1zdG9yZS1tYXJrZXJcIj4nO1xuICAgICAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInJvd1wiPic7XG4gICAgICAgICAgICBsZXQgbmFtZVRleHQgPSBkYXRhX21ha2VyLnRyYW5zICE9PSB1bmRlZmluZWQgJiYgZGF0YV9tYWtlci50cmFuc1snbmFtZSddICE9PSB1bmRlZmluZWQgJiYgZGF0YV9tYWtlci50cmFuc1snbmFtZSddICE9PSAnJyA/IGRhdGFfbWFrZXIudHJhbnNbJ25hbWUnXSA6IGRhdGFfbWFrZXIubmFtZTtcbiAgICAgICAgICAgIGh0bWwgKz0gJzxwIGNsYXNzPVwiY29sLW1kLTEyIHN0b3JlaWZ5LXNsLWl0ZW0tcm93IHN0b3JlLW5hbWVcIj4nICsgbmFtZVRleHQgKyAnPC9wPic7XG4gICAgICAgICAgICBpZiAoZGF0YV9tYWtlci50aHVtKSB7XG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cImNvbC1tZC00IHN0b3JlLWltYWdlXCI+PGltZyBzcmM9XCInICsgZGF0YV9tYWtlci50aHVtICsgJ1wiIGFsdD1cIicgKyBuYW1lVGV4dCArICdcIj48L2Rpdj4nO1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJjb2wtbWQtOFwiPic7XG4gICAgICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwiY29sLW1kLTEyXCI+JztcbiAgICAgICAgICAgIC8vaHRtbCArPSAnPHRyPjx0ZD48c3Ryb25nPicgKyB0cmFuc1snYWRkcmVzcyddICsgJzo8L3N0cm9uZz48L3RkPjx0ZD48cD4nICsgYWRkcmVzcyArICc8L3A+PC90ZD48L3RyPic7XG4gICAgICAgICAgICBpZihpZnlGaWVsZHNWaXNpYmlsaXR5WydtYXAnXVswXSA9PSAxKXtcbiAgICAgICAgICAgICAgICBsZXQgYWRkcmVzc1RleHQgPSBkYXRhX21ha2VyLnRyYW5zICE9PSB1bmRlZmluZWQgJiYgZGF0YV9tYWtlci50cmFuc1snYWRkcmVzcyddICE9PSB1bmRlZmluZWQgJiYgZGF0YV9tYWtlci50cmFuc1snYWRkcmVzcyddICE9PSAnJyA/IGRhdGFfbWFrZXIudHJhbnNbJ2FkZHJlc3MnXSA6IGRhdGFfbWFrZXIuYWRkcmVzcztcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8cCBjbGFzcz1cInN0b3JlaWZ5LXNsLWl0ZW0tcm93XCI+JyArIGFkZHJlc3NUZXh0ICsgJzwvcD4nO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZGF0YV9tYWtlci5lbWFpbCAhPSBudWxsICYmIHR5cGVvZiBkYXRhX21ha2VyLmVtYWlsICE9ICd1bmRlZmluZWQnICYmIGRhdGFfbWFrZXIuZW1haWwgIT0gJycgJiYgaWZ5RmllbGRzVmlzaWJpbGl0eVsnbWFwJ11bMV0gPT0gMSkge1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxwIGNsYXNzPVwic3RvcmVpZnktc2wtaXRlbS1yb3cgbWFya2VyLWVudmVsb3BlXCI+JytlbWFpbF9pY29uKycgPGEgaHJlZj1cIm1haWx0bzonICsgZGF0YV9tYWtlci5lbWFpbCArICdcIj4nICsgZGF0YV9tYWtlci5lbWFpbCArICc8L2E+PC9wPic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZGF0YV9tYWtlci5waG9uZSAhPSBudWxsICYmIHR5cGVvZiBkYXRhX21ha2VyLnBob25lICE9ICd1bmRlZmluZWQnICYmIGRhdGFfbWFrZXIucGhvbmUgIT0gJycgJiYgaWZ5RmllbGRzVmlzaWJpbGl0eVsnbWFwJ11bMl0gPT0gMSkge1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxwIGNsYXNzPVwic3RvcmVpZnktc2wtaXRlbS1yb3cgbWFya2VyLXBob25lXCI+JytwaG9uZV9pY29uKycgPGEgaHJlZj1cInRlbDonICsgZGF0YV9tYWtlci5waG9uZSArICdcIj4nICsgZGF0YV9tYWtlci5waG9uZSArICc8L2E+PC9wPic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZGF0YV9tYWtlci53ZWIgIT0gbnVsbCAmJiB0eXBlb2YgZGF0YV9tYWtlci53ZWIgIT0gJ3VuZGVmaW5lZCcgJiYgZGF0YV9tYWtlci53ZWIgIT0gJycgJiYgaWZ5RmllbGRzVmlzaWJpbGl0eVsnbWFwJ11bM10gPT0gMSkge1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxwIGNsYXNzPVwic3RvcmVpZnktc2wtaXRlbS1yb3cgbWFya2VyLWxpbmtcIj4nK3dlYl9pY29uKycgJyArIGRhdGFfbWFrZXIud2ViICsgJzwvcD4nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRhdGFfbWFrZXIudGFncy5sZW5ndGggPiAwICYmIGlmeUZpZWxkc1Zpc2liaWxpdHlbJ21hcCddWzRdID09IDEpIHtcbiAgICAgICAgICAgICAgICAvL2h0bWwgKz0gJzxsYWJlbD4nICsgc3RvcmVsb2NhdG9yX2xhbmcud2ViICsgJzogPC9sYWJlbD4nO1xuICAgICAgICAgICAgICAgIHZhciB0YWdfYXJyID0gZGF0YV9tYWtlci50YWdzO1xuICAgICAgICAgICAgICAgIHZhciB0YWdfaHRtbCA9ICcnO1xuICAgICAgICAgICAgICAgIGxldCB0YWdzVGV4dCA9ICBkYXRhX21ha2VyLnRyYW5zICE9PSB1bmRlZmluZWQgJiYgZGF0YV9tYWtlci50cmFuc1sndGFncyddICE9PSB1bmRlZmluZWQgJiYgIGRhdGFfbWFrZXIudHJhbnNbJ3RhZ3MnXS5sZW5ndGggPiAwID8gIGRhdGFfbWFrZXIudHJhbnNbJ3RhZ3MnXSA6IHRhZ19hcnI7XG4gICAgICAgICAgICAgICAgalF1ZXJ5LmVhY2godGFnX2FyciwgZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgIHRhZ1RleHQgPSB0YWdzVGV4dFtrZXldICE9PSB1bmRlZmluZWQgJiYgdGFnc1RleHRba2V5XSAhPT0gJycgPyB0YWdzVGV4dFtrZXldIDogdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHRhZ19odG1sICs9ICc8c3BhbiBjbGFzcz1cInRhZy1pdGVtIHRhZy1pdGVtLScrc3RyaW5nX3RvX3NsdWcodmFsdWUpKydcIj48aSBjbGFzcz1cImZhIGZhLWNoZWNrXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPiAnICsgdGFnVGV4dCArICc8L3NwYW4+JztcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8cCBjbGFzcz1cInRhZy1pdGVtc1wiPicgKyB0YWdfaHRtbCArICc8L3A+JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChkYXRhX21ha2VyLmVtYWlsICE9IG51bGwgJiYgdHlwZW9mIGRhdGFfbWFrZXIuZW1haWwgIT0gJ3VuZGVmaW5lZCcgJiYgZGF0YV9tYWtlci5lbWFpbCAhPSAnJyAmJiBpZnlGaWVsZHNWaXNpYmlsaXR5WydtYXAnXVs3XSAhPSB1bmRlZmluZWQgJiYgaWZ5RmllbGRzVmlzaWJpbGl0eVsnbWFwJ11bN10gPT0gMSAmJiBkYXRhQXBwcy5zaG93X2NvbnRhY3RfdXMgPT0gMSkge1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxwIGNsYXNzPVwic3RvcmVpZnktc2wtaXRlbS1yb3cgaXRlbS1saW5rIGlmeS1pdGVtLWJ0bi1jb250YWN0XCIgPjxzcGFuIGRhdGEtZW1haWw9XCInICsgZGF0YV9tYWtlci5lbWFpbCArICdcIiBkYXRhLXN0b3JlPVwiJyArIGRhdGFfbWFrZXIuaWQgKyAnXCI+JyArIHN0b3JlbG9jYXRvcl9sYW5nLmNvbnRhY3Rfc3RvcmUgKyAnPC9zcGFuPjwvcD4nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRhdGFfbWFrZXIuc29jaWFsICE9IG51bGwgJiYgdHlwZW9mIGRhdGFfbWFrZXIuc29jaWFsICE9ICd1bmRlZmluZWQnICYmIGRhdGFfbWFrZXIuc29jaWFsICE9ICcnICYmIGlmeUZpZWxkc1Zpc2liaWxpdHlbJ21hcCddWzVdID09IDEpIHtcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic3RvcmVpZnktc3RvcmVsb2NhdG9yLXNvY2lhbC1tYWtlclwiPicgKyBkYXRhX21ha2VyLnNvY2lhbCArICc8L2Rpdj4nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaHRtbCArPSc8L2Rpdj4nO1xuICAgICAgICAgICAgaHRtbCArPSc8ZGl2IGNsYXNzPVwiY29sLW1kLTEyXCI+JztcbiAgICAgICAgICAgIGxldCBvcGVuX25ld190YWIgPSAnJztcbiAgICAgICAgICAgIGlmKHN0b3JlaWZ5X29wZW5fbmV3X3RhYl9pbmRleCA9PSAxKVxuICAgICAgICAgICAgICAgb3Blbl9uZXdfdGFiID0gJ3RhcmdldD1cIl9ibGFua1wiIGFyaWEtbGFiZWw9XCInK3N0b3JlbG9jYXRvcl9sYW5nLm9wZW5fbmV3X3RhYisnXCInO1xuICAgICAgICAgICAgaWYgKGRhdGFfbWFrZXIuc2NoZWR1bGUgIT0gbnVsbCAmJiB0eXBlb2YgZGF0YV9tYWtlci5zY2hlZHVsZSAhPSAndW5kZWZpbmVkJyAmJiBkYXRhX21ha2VyLnNjaGVkdWxlICE9ICcnICYmIHN0b3JlX3NjaGVkdWxlID09IDEgJiYgaWZ5RmllbGRzVmlzaWJpbGl0eVsnbWFwJ11bNl0gPT0gMSkge1xuICAgICAgICAgICAgICAgICRhcnJMYW5nc2NoZWR1bGUgPSB7XG4gICAgICAgICAgICAgICAgICAgICdtb24nIDogc3RvcmVsb2NhdG9yX2xhbmcubW9uLFxuICAgICAgICAgICAgICAgICAgICAndHVlJyA6IHN0b3JlbG9jYXRvcl9sYW5nLnR1ZSxcbiAgICAgICAgICAgICAgICAgICAgJ3dlZCcgOiBzdG9yZWxvY2F0b3JfbGFuZy53ZWQsXG4gICAgICAgICAgICAgICAgICAgICd0aHUnIDogc3RvcmVsb2NhdG9yX2xhbmcudGh1LFxuICAgICAgICAgICAgICAgICAgICAnZnJpJyA6IHN0b3JlbG9jYXRvcl9sYW5nLmZyaSxcbiAgICAgICAgICAgICAgICAgICAgJ3NhdCcgOiBzdG9yZWxvY2F0b3JfbGFuZy5zYXQsXG4gICAgICAgICAgICAgICAgICAgICdzdW4nIDogc3RvcmVsb2NhdG9yX2xhbmcuc3VuLFxuICAgICAgICAgICAgICAgICAgICAnc3RvcmVfb3BlcmF0aW9uJyA6IHN0b3JlbG9jYXRvcl9sYW5nLnN0b3JlX29wZXJhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgJ2FtJyA6IHN0b3JlbG9jYXRvcl9sYW5nLmFtLFxuICAgICAgICAgICAgICAgICAgICAncG0nIDogc3RvcmVsb2NhdG9yX2xhbmcucG0sXG4gICAgICAgICAgICAgICAgICAgICdjbG9zZWQnIDogc3RvcmVsb2NhdG9yX2xhbmcuY2xvc2VkLFxuICAgICAgICAgICAgICAgICAgICAndGhlX25leHRfZGF5JyA6IHN0b3JlbG9jYXRvcl9sYW5nLnRoZV9uZXh0X2RheSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGxldCBodG1sU2NoZWR1bGUgPSBkYXRhX21ha2VyLnNjaGVkdWxlO1xuICAgICAgICAgICAgICAgIGpRdWVyeS5lYWNoKCRhcnJMYW5nc2NoZWR1bGUsIGZ1bmN0aW9uKCBrZXksIHZhbCApIHtcbiAgICAgICAgICAgICAgICAgIGh0bWxTY2hlZHVsZSA9IGh0bWxTY2hlZHVsZS5yZXBsYWNlQWxsKFwie3sgXCIra2V5K1wiIH19XCIsIHZhbCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cImlmeS1jb2wtc2NoZWR1bGVcIj4nK2h0bWxTY2hlZHVsZSsnPC9kaXY+JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKGlmeV9zaG93X2Jsb2NrX2NhcnQgPT09IDEpXG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJpZnktc2VsZWN0LXByb3ZpZGVyXCIgZGF0YS1pZD1cIicrZGF0YV9tYWtlci5pZCsnXCI+ICcrc3RvcmVsb2NhdG9yX2xhbmcuaWZ5X3NlbGVjdF9wcm92aWRlcisnIDwvYnV0dG9uPic7XG4gICAgICAgICAgICBpZiAoZGF0YV9tYWtlci51cmwgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxhIGNsYXNzPVwibGlua2RldGFpbHN0b3JlXCIgaHJlZj1cIicgKyBkYXRhX21ha2VyLnVybCArICdcIj4nICsgc3RvcmVsb2NhdG9yX2xhbmcubGlua19kZXRhaWwgKyAnPC9hPic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBodG1sICs9ICc8YSBjbGFzcz1cImdldGRpcmVjdGlvbnN0b3JlXCIgaHJlZj1cImh0dHBzOi8vbWFwcy5nb29nbGUuY29tLz9kYWRkcj0nICsgZGF0YV9tYWtlci5hZGRyZXNzICsgJyZzYWRkcj1cIiAnK29wZW5fbmV3X3RhYisnPicgKyBzdG9yZWxvY2F0b3JfbGFuZy5kaXJlY3Rpb25zICsgJzwvYT48L2Rpdj4nO1xuICAgICAgICAgICAgaHRtbCArPSAnPGRpdiBpZD1cIicgKyBkYXRhX21ha2VyLmlkICsgJ1wiPjwvZGl2PjwvZGl2Pic7XG4gICAgICAgICAgICBodG1sICs9ICc8L2Rpdj48L2Rpdj48L2Rpdj48L2Rpdj4nO1xuICAgICAgICAgICAgdmFyIG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoZGF0YV9tYWtlcik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBpY29uX21hcmtlcl91cmwgPSB3aW5kb3cuZGVmYXVsdF9tYXJrZXI7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKHdpbmRvdy5pY29uX21hcmtlciAhPSAnJykgaWNvbl9tYXJrZXJfdXJsID0gd2luZG93Lmljb25fbWFya2VyO1xuICAgICAgICAgICAgLy8gaWYgKGRhdGFfbWFrZXIuaWNvbl9tYXJrZXIgIT0gbnVsbCAmJiBkYXRhX21ha2VyLmljb25fbWFya2VyICE9IFwiXCIpICBpY29uX21hcmtlcl91cmwgPSBkYXRhX21ha2VyLmljb25fbWFya2VyO1xuICAgICAgICAgICAgdmFyIGljb24gPSB7XG4gICAgICAgICAgICAgIHVybDogaWNvbl9tYXJrZXJfdXJsLCAvLyB1cmxcbiAgICAgICAgICAgICAgc2NhbGVkU2l6ZTogbmV3IGdvb2dsZS5tYXBzLlNpemUoMzAsIDQzKSwgLy8gc2NhbGVkIHNpemVcbiAgICAgICAgICAgICAgLy8gb3JpZ2luOiBuZXcgZ29vZ2xlLm1hcHMuUG9pbnQoMCwwKSwgLy8gb3JpZ2luXG4gICAgICAgICAgICAgIC8vIGFuY2hvcjogbmV3IGdvb2dsZS5tYXBzLlBvaW50KDAsIDApIC8vIGFuY2hvclxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYoZGF0YV9tYWtlci5mZWF0dXJlZF9zdG9yZSA9PSAnMScpIHtcbiAgICAgICAgICAgICAgICBpY29uLnNjYWxlZFNpemUgPSBuZXcgZ29vZ2xlLm1hcHMuU2l6ZSg0NSwgNjQpXG4gICAgICAgICAgICAgICAgaWNvbi51cmwgPSB3aW5kb3cudGhlbWVBc3NldHMuYmVkX21hcmtlclxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBtYXJrZXIuc2V0SWNvbihpY29uKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZ29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIobWFya2VyLCAnY2xpY2snLCBmdW5jdGlvbihldnQpIHsgLy8gdGhlIGNsaWNrIGV2ZW50IGZ1bmN0aW9uIGlzIGNhbGxlZCB3aXRoIHRoZSBcImV2ZW50XCIgYXMgYW4gYXJndW1lbnRcbiAgICAgICAgICAgICAgICBpZihqUXVlcnkoJy5jaG9zZS1zZWFyY2gtc2x0JykudmFsKCkgPT0gJ2xvY2F0aW9uJyl7XG4gICAgICAgICAgICAgICAgICAgIGFkZHJlc3MgPSBqUXVlcnkoJyNhZGRyZXNzJykudmFsKCk7XG4gICAgICAgICAgICAgICAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoXCJzYWRkcj1cIiwgXCJzYWRkcj1cIithZGRyZXNzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gbG9hZCBpbmZvIHdpbmRvdyBoZXJlIFxuICAgICAgICAgICAgICAgIFxuXG4gICAgICAgICAgICAgICAgbGV0IGluZm9XaW5kb3dXcmFwcGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2luZm8td2luZG93LXdyYXBwZXInKTtcbiAgICAgICAgICAgICAgICBpZighZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnc3RvcmUtZGV0YWlscy1tb2RhbC1idXR0b24nKSkge1xuICAgICAgICAgICAgICAgICAgICAkKGluZm9XaW5kb3dXcmFwcGVyKS5odG1sKCcnKTtcbiAgICAgICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgICAgIC8vIHNvcnQgdGhpc1xuICAgICAgICAgICAgICAgIGlmKCQod2luZG93KS53aWR0aCgpIDwgNzY4ICYmICFldmVudC50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdzdG9yZS1kZXRhaWxzLW1vZGFsLWJ1dHRvbicpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0b3AgPSAkKGluZm9XaW5kb3dXcmFwcGVyKS5vZmZzZXQoKS50b3AgLSA0MDA7XG4gICAgICAgICAgICAgICAgICAgICQoJ2h0bWwsYm9keScpLmFuaW1hdGUoe3Njcm9sbFRvcDogdG9wfSwgMTAwMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGxldCBzdG9yZUluZm8gPSBjcmVhdGVfaHRtbF9saXN0KGRhdGFfbWFrZXIsIDAsIHRydWUpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmKCFldmVudC50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdzdG9yZS1kZXRhaWxzLW1vZGFsLWJ1dHRvbicpKSB7XG4gICAgICAgICAgICAgICAgICAgICQoaW5mb1dpbmRvd1dyYXBwZXIpLmh0bWwoc3RvcmVJbmZvKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJChpbmZvV2luZG93V3JhcHBlcikuZmluZCgnLnN0b3JlLWl0ZW0nKVswXS5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGFtYXJrZXInKTtcbiAgICAgICAgICAgICAgICAvLyBhZGQgc3RvcmUgdGltZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGdldEN1cnJlbnREYXlPcGVuaW5nVGltZSgkKGluZm9XaW5kb3dXcmFwcGVyKS5jb250ZXh0KVxuICAgICAgICAgICAgICAgIGNvbnN0IGNlbnRlciA9IG1hcC5nZXRDZW50ZXIoKTtcbiAgICAgICAgICAgICAgICBsZXQgZGlzdGFuY2VXcmFwcGVyID0gJChpbmZvV2luZG93V3JhcHBlcikuZmluZCgnLmRpc3RhbmNlLWVsZW1lbnQnKVxuXG5cbiAgICAgICAgICAgICAgICBpZiAoJ2dlb2xvY2F0aW9uJyBpbiBuYXZpZ2F0b3IpIHtcbiAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLmdlb2xvY2F0aW9uLmdldEN1cnJlbnRQb3NpdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgIChwb3NpdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJMb2NhdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF0OiBwb3NpdGlvbi5jb29yZHMubGF0aXR1ZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxuZzogcG9zaXRpb24uY29vcmRzLmxvbmdpdHVkZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXN0YW5jZU1pbGVzKHVzZXJMb2NhdGlvbi5sYXQsIHVzZXJMb2NhdGlvbi5sbmcsIGRhdGFfbWFrZXIucG9zaXRpb24ubGF0KCksIGRhdGFfbWFrZXIucG9zaXRpb24ubG5nKCksIGRpc3RhbmNlV3JhcHBlcilcbiAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdMb2NhdGlvbiBlcnJvcjonLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuYWJsZUhpZ2hBY2N1cmFjeTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lb3V0OiAxMDAwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhpbXVtQWdlOiAzMDAwMDAgLy8gNSBtaW51dGVzXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignR2VvbG9jYXRpb24gaXMgbm90IHN1cHBvcnRlZCBieSB0aGlzIGJyb3dzZXIuJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHNob3dJbmZvV2luZG93KGV2dCwgdGhpcywgbWFwLCBpbmZvd2luZG93LCBodG1sKTtcbiAgICAgICAgICAgICAgICB2YXIgJGNvbnRhaW5lciA9IGpRdWVyeSgnI21haW4tc2xpZGVyLXN0b3JlbG9jYXRvcicpO1xuXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKCRjb250YWluZXIubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXJrZXJTZWxlY3RvciA9ICcuaXRlbVtkYXRhbWFya2VyPVwiJyArIGRhdGFfbWFrZXIubnVtICsgJ1wiXSAuaW5uZXItaXRlbSc7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpZFNlbGVjdG9yID0gJy5pbm5lci1pdGVtW2RhdGEtc3RvcmVpZnktaWQ9XCInICsgZGF0YV9tYWtlci5pZCArICdcIl0nO1xuXG4gICAgICAgICAgICAgICAgICAgIFxuXG4gICAgICAgICAgICAgICAgICAgIHZhciAkdGFyZ2V0ID0gJGNvbnRhaW5lci5maW5kKG1hcmtlclNlbGVjdG9yKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmICghJHRhcmdldC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICR0YXJnZXQgPSAkY29udGFpbmVyLmZpbmQoaWRTZWxlY3Rvcik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCEkdGFyZ2V0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHRhcmdldCA9IGpRdWVyeShtYXJrZXJTZWxlY3RvciArICcsJyArIGlkU2VsZWN0b3IpLmZpcnN0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmICgkdGFyZ2V0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJGNvbnRhaW5lci5maW5kKCcuaW5uZXItaXRlbScpLnJlbW92ZUNsYXNzKCdpbm5lci1pdGVtLWFjdGl2ZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJHRhcmdldC5hZGRDbGFzcygnaW5uZXItaXRlbS1hY3RpdmUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNjcm9sbFRvcCA9ICR0YXJnZXQub2Zmc2V0KCkudG9wIC0gJGNvbnRhaW5lci5vZmZzZXQoKS50b3AgKyAkY29udGFpbmVyLnNjcm9sbFRvcCgpIC0gMjA7XG4gICAgICAgICAgICAgICAgICAgICAgICAkY29udGFpbmVyLnN0b3AoKS5hbmltYXRlKHsgc2Nyb2xsVG9wOiBzY3JvbGxUb3AgfSwgMzAwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIG1hcmtlcjtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBzdHJpbmdfdG9fc2x1ZyAoc3RyKSB7XG4gICAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpOyAvLyB0cmltXG4gICAgICAgICAgICBzdHIgPSBzdHIudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICBcbiAgICAgICAgICAgIC8vIHJlbW92ZSBhY2NlbnRzLCBzd2FwIMODxpLDgsKxIGZvciBuLCBldGNcbiAgICAgICAgICAgIHZhciBmcm9tID0gXCLDg8aSIMODxpLDgsKhw4PGksOCwqTDg8aSw4LCosODxpLDgsKow4PGksOCwqnDg8aSw4LCq8ODxpLDgsKqw4PGksOCwqzDg8aSw4LCrcODxpLDgsKvw4PGksOCwq7Dg8aSw4LCssODxpLDgsKzw4PGksOCwrbDg8aSw4LCtMODxpLDgsK5w4PGksOCwrrDg8aSw4LCvMODxpLDgsK7w4PGksOCwrHDg8aSw4LCp8OD4oCaw4LCty9fLDo7XCI7XG4gICAgICAgICAgICB2YXIgdG8gICA9IFwiYWFhYWVlZWVpaWlpb29vb3V1dXVuYy0tLS0tLVwiO1xuICAgICAgICAgICAgZm9yICh2YXIgaT0wLCBsPWZyb20ubGVuZ3RoIDsgaTxsIDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UobmV3IFJlZ0V4cChmcm9tLmNoYXJBdChpKSwgJ2cnKSwgdG8uY2hhckF0KGkpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UoL1teYS16MC05IC1dL2csICcnKSAvLyByZW1vdmUgaW52YWxpZCBjaGFyc1xuICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXHMrL2csICctJykgLy8gY29sbGFwc2Ugd2hpdGVzcGFjZSBhbmQgcmVwbGFjZSBieSAtXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoLy0rL2csICctJyk7IC8vIGNvbGxhcHNlIGRhc2hlc1xuXG4gICAgICAgICAgICByZXR1cm4gc3RyO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIHNob3dJbmZvV2luZG93KGV2dCwgbWFya2VyLCBtYXAsIGluZm93aW5kb3csIGh0bWwpIHtcbiAgICAgICAgICAgIG1hcC5wYW5UbyhtYXJrZXIuZ2V0UG9zaXRpb24oKSk7XG5cbiAgICAgICAgICAgIC8vIHZhciBjdXJyZW50SWNvbiA9IGdtYXJrZXJzW21hcmtlck51bV07XG4gICAgICAgICAgICAvLyBjdXJyZW50SWNvbi5zZXRBbmltYXRpb24obnVsbCk7XG5cbiAgICAgICAgICAgIC8vIGlmIChjdXJyZW50SWNvbi5nZXRBbmltYXRpb24oKSAhPSBudWxsKSB7XG4gICAgICAgICAgICAvLyAgICAgY3VycmVudEljb24uc2V0QW5pbWF0aW9uKG51bGwpO1xuICAgICAgICAgICAgLy8gfSBlbHNlIHtcbiAgICAgICAgICAgIC8vICAgICBtYXJrZXIuc2V0QW5pbWF0aW9uKGdvb2dsZS5tYXBzLkFuaW1hdGlvbi5CT1VOQ0UpO1xuICAgICAgICAgICAgLy8gICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgIGN1cnJlbnRJY29uLnNldEFuaW1hdGlvbihudWxsKTtcbiAgICAgICAgICAgIC8vICAgICB9LCA1MDApO1xuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgZ21hcmtlcnMuZm9yRWFjaChzdG9yZU1hcmtlciA9PiB7XG4gICAgICAgICAgICAgICAgc3RvcmVNYXJrZXIuc2V0QW5pbWF0aW9uKG51bGwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBtYXJrZXIuc2V0QW5pbWF0aW9uKGdvb2dsZS5tYXBzLkFuaW1hdGlvbi5CT1VOQ0UpO1xuICAgICAgICBcbiAgICAgICAgXG5cbiAgICAgICAgICAgIC8vIGlmIChtYXJrZXIuZ2V0VmlzaWJsZSgpICYmIChtYXJrZXIuZ2V0TWFwKCkgIT0gbnVsbCkpIHtcbiAgICAgICAgICAgIC8vICAgICBpbmZvd2luZG93LnNldENvbnRlbnQoaHRtbCk7XG4gICAgICAgICAgICAvLyAgICAgaW5mb3dpbmRvdy5vcGVuKG1hcCwgbWFya2VyKTtcbiAgICAgICAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyAgICAgaW5mb3dpbmRvdy5zZXRDb250ZW50KGh0bWwpO1xuICAgICAgICAgICAgLy8gICAgIGluZm93aW5kb3cuc2V0UG9zaXRpb24obWFya2VyLmdldFBvc2l0aW9uKCkpO1xuICAgICAgICAgICAgLy8gICAgIGluZm93aW5kb3cub3BlbihtYXApO1xuICAgICAgICAgICAgLy8gICAgIGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyT25jZShtYXAsICdpZGxlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgIGluZm93aW5kb3cuc2V0Q29udGVudChodG1sKTtcbiAgICAgICAgICAgIC8vICAgICAgICAgaW5mb3dpbmRvdy5vcGVuKG1hcCwgbWFya2VyKTtcbiAgICAgICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGRlZ3JlZXNUb1JhZGlhbnMoZGVncmVlcykge1xuICAgICAgICAgICAgcmV0dXJuIGRlZ3JlZXMgKiBNYXRoLlBJIC8gMTgwO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZ2V0RGlzdGFuY2VCZXR3ZWVuUG9pbnRzKGxhdDEsIGxuZzEsIGxhdDIsIGxuZzIpIHtcbiAgICAgICAgICAgIC8vIFRoZSByYWRpdXMgb2YgdGhlIHBsYW5ldCBlYXJ0aCBpbiBtZXRlcnNcbiAgICAgICAgICAgIGxldCBSID0gNjM3ODEzNztcbiAgICAgICAgICAgIGxldCBkTGF0ID0gZGVncmVlc1RvUmFkaWFucyhsYXQyIC0gbGF0MSk7XG4gICAgICAgICAgICBsZXQgZExvbmcgPSBkZWdyZWVzVG9SYWRpYW5zKGxuZzIgLSBsbmcxKTtcbiAgICAgICAgICAgIGxldCBhID0gTWF0aC5zaW4oZExhdCAvIDIpICpcbiAgICAgICAgICAgICAgICBNYXRoLnNpbihkTGF0IC8gMikgK1xuICAgICAgICAgICAgICAgIE1hdGguY29zKGRlZ3JlZXNUb1JhZGlhbnMobGF0MSkpICpcbiAgICAgICAgICAgICAgICBNYXRoLmNvcyhkZWdyZWVzVG9SYWRpYW5zKGxhdDEpKSAqXG4gICAgICAgICAgICAgICAgTWF0aC5zaW4oZExvbmcgLyAyKSAqXG4gICAgICAgICAgICAgICAgTWF0aC5zaW4oZExvbmcgLyAyKTtcblxuICAgICAgICAgICAgbGV0IGMgPSAyICogTWF0aC5hdGFuMihNYXRoLnNxcnQoYSksIE1hdGguc3FydCgxIC0gYSkpO1xuICAgICAgICAgICAgbGV0IGRpc3RhbmNlID0gUiAqIGM7XG5cbiAgICAgICAgICAgIHJldHVybiBkaXN0YW5jZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHN1cGVyYmFnKHN1cCwgc3ViKSB7XG4gICAgICAgICAgICBpZiAoc3VwLmxlbmd0aCA8IHN1Yi5sZW5ndGgpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgc3VwLnNvcnQoKTtcbiAgICAgICAgICAgIHN1Yi5zb3J0KCk7XG4gICAgICAgICAgICB2YXIgaSwgajtcbiAgICAgICAgICAgIGZvciAoaSA9IDAsIGogPSAwOyBpIDwgc3VwLmxlbmd0aCAmJiBqIDwgc3ViLmxlbmd0aDspIHtcblxuICAgICAgICAgICAgICAgIGlmIChzdXBbaV0gPCBzdWJbal0pIHtcbiAgICAgICAgICAgICAgICAgICAgKytpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc3VwW2ldID09IHN1YltqXSkge1xuICAgICAgICAgICAgICAgICAgICArK2k7XG4gICAgICAgICAgICAgICAgICAgICsrajtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBzdWJbal0gbm90IGluIHN1cCwgc28gc3ViIG5vdCBzdWJiYWdcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSB0aGVyZSBhcmUgbm8gZWxlbWVudHMgbGVmdCBpbiBzdWJcblxuICAgICAgICAgICAgaWYgKGogPCBzdWIubGVuZ3RoKVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcblxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZGlmZihhcnIxLCBhcnIyKSB7XG4gICAgICAgICAgICAgICAgdmFyIGZpbHRlcmVkQXJyMSA9IGFycjEuZmlsdGVyKGZ1bmN0aW9uKGVsZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXJyMi5pbmRleE9mKGVsZSkgPT0gLTE7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgZmlsdGVyZWRBcnIyID0gYXJyMi5maWx0ZXIoZnVuY3Rpb24oZWxlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhcnIxLmluZGV4T2YoZWxlKSA9PSAtMTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhmaWx0ZXJlZEFycjEpO1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGZpbHRlcmVkQXJyMik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpbHRlcmVkQXJyMS5jb25jYXQoZmlsdGVyZWRBcnIyKTtcbiAgICAgICAgfVxuICAgICAgICAgICAgLypcbiAgICAgICAgZnVuY3Rpb24gY2hlY2tEaXN0YW5jZUJldHdlZW5Qb2ludHMobGF0MSwgbG5nMSwgbGF0MiwgbG5nMiwgcmFkaXVzLCBkdiA9IDAuMDAxKXtcbiAgICAgICAgICAgIHZhciBjaGVjayA9IC0xO1xuICAgICAgICAgICAgaWYoZ2V0RGlzdGFuY2VCZXR3ZWVuUG9pbnRzKGxhdDEsIGxuZzEsIGxhdDIsIGxuZzIpKmR2IDw9IHJhZGl1cyApXG4gICAgICAgICAgICAgIGNoZWNrID0gZ2V0RGlzdGFuY2VCZXR3ZWVuUG9pbnRzKGxhdDEsIGxuZzEsIGxhdDIsIGxuZzIpKmR2O1xuICAgICAgICAgICAgcmV0dXJuIGNoZWNrO1xuICAgICAgICB9Ki9cbiAgICAgICAgICAgIC8qRml4IGZvciBJRSovXG4gICAgICAgIGZ1bmN0aW9uIGNoZWNrRGlzdGFuY2VCZXR3ZWVuUG9pbnRzKGxhdDEsIGxuZzEsIGxhdDIsIGxuZzIsIHJhZGl1cykge1xuICAgICAgICAgICAgICAgIHZhciBkdiA9IGFyZ3VtZW50cy5sZW5ndGggPiA1ICYmIGFyZ3VtZW50c1s1XSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzVdIDogMC4wMDE7XG4gICAgICAgICAgICAgICAgdmFyIGNoZWNrID0gLTE7XG4gICAgICAgICAgICAgICAgaWYgKGdldERpc3RhbmNlQmV0d2VlblBvaW50cyhsYXQxLCBsbmcxLCBsYXQyLCBsbmcyKSAqIGR2IDw9IHJhZGl1cylcbiAgICAgICAgICAgICAgICAgICAgY2hlY2sgPSBnZXREaXN0YW5jZUJldHdlZW5Qb2ludHMobGF0MSwgbG5nMSwgbGF0MiwgbG5nMikgKiBkdjtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2hlY2s7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKiovXG4gICAgICAgIGZ1bmN0aW9uIGNoZWNrVGFnKHRhZywgdGFncykge1xuICAgICAgICAgICAgdmFyIGNoZWNrID0gMDtcblxuICAgICAgICAgICAgaWYgKHRhZy5sZW5ndGggPT0gMCB8fCBzdXBlcmJhZyh0YWdzLCB0YWcpID09IHRydWUpXG4gICAgICAgICAgICAgICAgY2hlY2sgPSAxO1xuICAgICAgICAgICAgcmV0dXJuIGNoZWNrO1xuICAgICAgICB9XG5cblxuICAgICAgICBmdW5jdGlvbiBkaXN0YW5jZU1pbGVzQVBJKGxhdDEsIGxvbjEsIGxhdDIsIGxvbjIsIGRpc3RhbmNlV3JhcHBlciwgc3RvcmUpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgIHVybDogJ2h0dHBzOi8vcm91dGVzLmdvb2dsZWFwaXMuY29tL2RpcmVjdGlvbnMvdjI6Y29tcHV0ZVJvdXRlcycsXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICAgICAgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgJ1gtR29vZy1BcGktS2V5Jzogd2luZG93LnRoZW1lQXNzZXRzLmFwaUtleSxcbiAgICAgICAgICAgICAgICAnWC1Hb29nLUZpZWxkTWFzayc6XG4gICAgICAgICAgICAgICAgICAgICdyb3V0ZXMuZGlzdGFuY2VNZXRlcnMnXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgb3JpZ2luOiB7XG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgIGxhdExuZzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGF0aXR1ZGU6IGxhdDEsXG4gICAgICAgICAgICAgICAgICAgICAgICBsb25naXR1ZGU6IGxvbjFcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICBsYXRMbmc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhdGl0dWRlOiBsYXQyLFxuICAgICAgICAgICAgICAgICAgICAgICAgbG9uZ2l0dWRlOiBsb24yXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdHJhdmVsTW9kZTogJ0RSSVZFJ1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJvdXRlID0gcmVzcG9uc2Uucm91dGVzWzBdO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG1pbGVzID0gcm91dGUuZGlzdGFuY2VNZXRlcnMgKiAwLjAwMDYyMTM3MTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHJvdXRlLmRpc3RhbmNlTWV0ZXJzKVxuICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnRGlzdGFuY2U6JywgbWlsZXMudG9GaXhlZCgxKSwgJ21pbGVzJyk7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdEdXJhdGlvbjonLCByb3V0ZS5kdXJhdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdQb2x5bGluZTonLCByb3V0ZS5wb2x5bGluZS5lbmNvZGVkUG9seWxpbmUpO1xuICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhzdG9yZSlcblxuICAgICAgICAgICAgICAgICAgICAvLyBpZihzdG9yZS5nZXRBdHRyaWJ1dGUoJ2lkJykgPT0gJ3N0b3JlX2lkXzE2MjEzOTYnIHx8IHN0b3JlLmdldEF0dHJpYnV0ZSgnaWQnKSA9PSAnc3RvcmVfaWRfMTYyMTM4MicpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGF0aCA9IGdvb2dsZS5tYXBzLmdlb21ldHJ5LmVuY29kaW5nLmRlY29kZVBhdGgoXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICByb3V0ZS5wb2x5bGluZS5lbmNvZGVkUG9seWxpbmVcbiAgICAgICAgICAgICAgICAgICAgLy8gKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBuZXcgZ29vZ2xlLm1hcHMuUG9seWxpbmUoe1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgcGF0aCxcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIG1hcCxcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIHN0cm9rZVdlaWdodDogMlxuICAgICAgICAgICAgICAgICAgICAvLyB9KTtcbiAgICAgICAgICAgICAgICAgICAgLy8gfVxuICAgICBcblxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYoZGlzdGFuY2VXcmFwcGVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKGRpc3RhbmNlV3JhcHBlcikuYWRkQ2xhc3MoJ2FjdGl2ZScpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGxldCBkaXN0YW5jZUVsID0gJChkaXN0YW5jZVdyYXBwZXIpLmZpbmQoJy5kaXN0YW5jZS1jYWxjJylcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmKGRpc3RhbmNlRWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoZGlzdGFuY2VFbCkuYWRkQ2xhc3MoJ2FjdGl2ZScpXG4gICAgICAgICAgICAgICAgICAgICAgICAkKGRpc3RhbmNlRWwpLmh0bWwobWlsZXMudG9GaXhlZCgyKSlcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmKCQod2luZG93KS53aWR0aCgpIDwgNzY4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaW5mb1dpbmRvd1dyYXBwZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5mby13aW5kb3ctd3JhcHBlcicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGluZm9EaXN0YW5jZUVsID0gJChpbmZvV2luZG93V3JhcHBlcikuZmluZCgnLmRpc3RhbmNlLWNhbGMnKVxuICAgICAgICAgICAgICAgICAgICAgICAgJChpbmZvV2luZG93V3JhcHBlcikuZmluZCgnLmRpc3RhbmNlLWVsZW1lbnQnKS5hZGRDbGFzcygnYWN0aXZlJylcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAkKGluZm9EaXN0YW5jZUVsKS5hZGRDbGFzcygnYWN0aXZlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICQoaW5mb0Rpc3RhbmNlRWwpLmh0bWwobWlsZXMudG9GaXhlZCgyKSlcbiAgICAgICAgICAgICAgICAgICAgfSBcblxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbih4aHIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignUm91dGVzIEFQSSBlcnJvcjonLCB4aHIucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZGlzdGFuY2VNaWxlcyhsYXQxLCBsb24xLCBsYXQyLCBsb24yKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnN0IFIgPSAzOTU4Ljg7IC8vIEVhcnRoIHJhZGl1cyBpbiBtaWxlc1xuXG4gICAgICAgICAgICBjb25zdCB0b1JhZCA9IGRlZyA9PiBkZWcgKiBNYXRoLlBJIC8gMTgwO1xuXG4gICAgICAgICAgICBjb25zdCBkTGF0ID0gdG9SYWQobGF0MiAtIGxhdDEpO1xuICAgICAgICAgICAgY29uc3QgZExvbiA9IHRvUmFkKGxvbjIgLSBsb24xKTtcblxuICAgICAgICAgICAgY29uc3QgYSA9XG4gICAgICAgICAgICAgICAgTWF0aC5zaW4oZExhdCAvIDIpICoqIDIgK1xuICAgICAgICAgICAgICAgIE1hdGguY29zKHRvUmFkKGxhdDEpKSAqXG4gICAgICAgICAgICAgICAgTWF0aC5jb3ModG9SYWQobGF0MikpICpcbiAgICAgICAgICAgICAgICBNYXRoLnNpbihkTG9uIC8gMikgKiogMjtcblxuICAgICAgICAgICAgY29uc3QgYyA9IDIgKiBNYXRoLmFzaW4oTWF0aC5zcXJ0KGEpKTtcblxuICAgICAgICAgICAgcmV0dXJuIFIgKiBjO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gYWRkQW5hbHl0aWMocmVzdWx0R2VvLGNvdW50KXtcbiAgICAgICAgICAgIHZhciB1cmwgPSBzdG9yZWlmeV9hcHBfdXJsICsgJy9hZGQtYW5hbHl0aWMnO1xuICAgICAgICAgICAgdmFyIGRhdGEgPSB7XG4gICAgICAgICAgICAgICdsYXQnOnJlc3VsdEdlby5nZW9tZXRyeS5sb2NhdGlvbi5sYXQoKSxcbiAgICAgICAgICAgICAgJ2xuZyc6cmVzdWx0R2VvLmdlb21ldHJ5LmxvY2F0aW9uLmxuZygpLFxuICAgICAgICAgICAgICAncmVzdWx0JzpyZXN1bHRHZW8uYWRkcmVzc19jb21wb25lbnRzLFxuICAgICAgICAgICAgICAnYWRkcmVzcyc6cmVzdWx0R2VvLmZvcm1hdHRlZF9hZGRyZXNzLFxuICAgICAgICAgICAgICAnY291bnQnOmNvdW50LFxuICAgICAgICAgICAgICAnZG9tYWluJzpTaG9waWZ5LnNob3AsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgalF1ZXJ5LmFqYXgoe1xuICAgICAgICAgICAgICAgIHVybDogdXJsLFxuICAgICAgICAgICAgICAgIHR5cGU6IFwicG9zdFwiLFxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgICAgICAgIH0pLmRvbmUoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9KS5mYWlsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBzZWFyY2hMb2NhdGlvbnNOZWFyKHJlc3VsdEdlbywgbWFwLCBib3VuZHMsIGdtYXJrZXJzLHNlYXJjaCkge1xuXG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5mby13aW5kb3ctd3JhcHBlcicpLnJlbW92ZUF0dHJpYnV0ZSgnb3JkZXInKVxuXG4gICAgICAgICAgICAvLyByYWRpdXMgc2V0IGhlcmUgXG4gICAgICAgICAgICB2YXIgcmFkaXVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JhZGl1c19zZWFyY2gnKS52YWx1ZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGNlbnRlciA9IHJlc3VsdEdlby5nZW9tZXRyeS5sb2NhdGlvbjtcblxuICAgICAgICAgICAgYm91bmRzID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZ0JvdW5kcygpO1xuICAgICAgICAgICAgLy92YXIgc2VhcmNoVXJsID0gYmFzZXVybCArICdhbGwvYWpheD9sYXQ9JyArIGNlbnRlci5sYXQoKSArICcmbG5nPScgKyBjZW50ZXIubG5nKCkgKyAnJnJhZGl1cz0nICsgcmFkaXVzICsgJyZzaG9wPScgKyBTaG9waWZ5LnNob3A7XG4gICAgICAgICAgICB2YXIgc2VhcmNoVXJsID0gc3RvcmVpZnlfYXBwX3Byb3h5X3VybCArICcvYWxsL2FqYXgnOyAvLz9sYXQ9JyArIGNlbnRlci5sYXQoKSArICcmbG5nPScgKyBjZW50ZXIubG5nKCkgKyAnJnJhZGl1cz0nICsgcmFkaXVzICsgJyZyYWRpdXM9JyArIFNob3BpZnkuc2hvcDtcbiAgICAgICAgICAgIHZhciB0YWdzX2NoZWNrID0gW107XG4gICAgICAgICAgICBqUXVlcnkuZWFjaChqUXVlcnkoJ2lucHV0LnN0b3JlaWZ5YXBwX3N0b3Jlc190YWdzX2ZpbHRlcjpjaGVja2VkJyksIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRhZ3NfY2hlY2sucHVzaChqUXVlcnkodGhpcykudmFsKCkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgZmlsdGVyX2NvdW50cnkgPSAnYWxsJyxmaWx0ZXJfcmVnaW9uID0gJ2lmeV9hbGwnLGZpbHRlcl9jaXR5ID0gJ2lmeV9hbGwnO1xuICAgICAgICAgICAgaWYgKGpRdWVyeSgnaW5wdXQuc3RvcmVpZnlhcHBfc3RvcmVzX2NvdW50cnlfZmlsdGVyJykubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgZmlsdGVyX2NvdW50cnkgPSBqUXVlcnkoJ2lucHV0LnN0b3JlaWZ5YXBwX3N0b3Jlc19jb3VudHJ5X2ZpbHRlcjpjaGVja2VkJykudmFsKCk7ICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGpRdWVyeSgnaW5wdXQuc3RvcmVpZnlhcHBfc3RvcmVzX3JlZ2lvbl9maWx0ZXInKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBmaWx0ZXJfcmVnaW9uID0galF1ZXJ5KCdpbnB1dC5zdG9yZWlmeWFwcF9zdG9yZXNfcmVnaW9uX2ZpbHRlcjpjaGVja2VkJykudmFsKCk7ICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGpRdWVyeSgnaW5wdXQuc3RvcmVpZnlhcHBfc3RvcmVzX2NpdHlfZmlsdGVyJykubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgZmlsdGVyX2NpdHkgPSBqUXVlcnkoJ2lucHV0LnN0b3JlaWZ5YXBwX3N0b3Jlc19jaXR5X2ZpbHRlcjpjaGVja2VkJykudmFsKCk7ICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoalF1ZXJ5KCcuc3RvcmVpZnlhcHBfc3RvcmVzX2NvdW50cnlzX2ZpbHRlcl9saXN0JykuZGF0YSgndGFnJykgPT0gJ3NlbGVjdCcpe1xuICAgICAgICAgICAgICAgIGZpbHRlcl9jb3VudHJ5ID0galF1ZXJ5KCdzZWxlY3Quc3RvcmVpZnlhcHBfc3RvcmVzX2NvdW50cnlfZmlsdGVyJykudmFsKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihqUXVlcnkoJy5zdG9yZWlmeWFwcF9zdG9yZXNfcmVnaW9uX2ZpbHRlcl9saXN0JykuZGF0YSgndGFnJykgPT0gJ3NlbGVjdCcpe1xuICAgICAgICAgICAgICAgIGZpbHRlcl9yZWdpb24gPSBqUXVlcnkoJ3NlbGVjdC5zdG9yZWlmeWFwcF9zdG9yZXNfcmVnaW9uX2ZpbHRlcicpLnZhbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoalF1ZXJ5KCcuc3RvcmVpZnlhcHBfc3RvcmVzX2NpdHlfZmlsdGVyX2xpc3QnKS5kYXRhKCd0YWcnKSA9PSAnc2VsZWN0Jyl7XG4gICAgICAgICAgICAgICAgZmlsdGVyX2NpdHkgPSBqUXVlcnkoJ3NlbGVjdC5zdG9yZWlmeWFwcF9zdG9yZXNfY2l0eV9maWx0ZXInKS52YWwoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKGZpbHRlcl9yZWdpb24gPT0gJ3VubmFtZWRfcmVnaW9uJykgZmlsdGVyX3JlZ2lvbiA9ICcnO1xuICAgICAgICAgICAgaWYoZmlsdGVyX2NpdHkgPT0gJ3VubmFtZWRfY2l0eScpIGZpbHRlcl9jaXR5ID0gJyc7XG5cbiAgICAgICAgICAgIHZhciBjaGVja19jb3VudHJ5ID0gMDtcbiAgICAgICAgICAgIHZhciBkYXRhID0ge1xuICAgICAgICAgICAgICAgIGxhdDogY2VudGVyLmxhdCgpLFxuICAgICAgICAgICAgICAgIGxuZzogY2VudGVyLmxuZygpLFxuICAgICAgICAgICAgICAgIHJhZGl1czogcmFkaXVzLFxuICAgICAgICAgICAgICAgIHNob3A6IFNob3BpZnkuc2hvcCxcbiAgICAgICAgICAgICAgICB0YWdzOiB0YWdzX2NoZWNrLmpvaW4oJywnKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHZhciBtYXJrZXJfY291bnQgPSAwO1xuICAgICAgICAgICAgdmFyIG1hcmtlcl9maXJzdDtcbiAgICAgICAgICAgIHZhciBkdiA9IDE7XG4gICAgICAgICAgICBsZXQgY2xvc2VzdFN0b3JlOyBcbiAgICAgICAgICAgIGlmIChyYWRpdXNfdW5pdCA9PSAxKSB7XG4gICAgICAgICAgICAgICAgZHYgPSAwLjAwMTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZHYgPSAwLjAwMDYyMTM3O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGFycmF5X3BvaW4gPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ21hcmtlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBtYXJrZXIgPSBnbWFya2Vyc1tpXTtcbiAgICAgICAgICAgICAgICB2YXIgZGlzdGFuY2UgPSBjaGVja0Rpc3RhbmNlQmV0d2VlblBvaW50cyhjZW50ZXIubGF0KCksIGNlbnRlci5sbmcoKSwgbWFya2VyLnBvc2l0aW9uLmxhdCgpLCBtYXJrZXIucG9zaXRpb24ubG5nKCksIHJhZGl1cywgZHYpO1xuICAgICAgICAgICAgICAgIGNoZWNrX2NvdW50cnkgPSAwO1xuXG4gICAgICAgICAgICAgICAgaWYgKCAoZmlsdGVyX2NvdW50cnkgPT0gJ2FsbCcgfHwgZmlsdGVyX2NvdW50cnkgPT0gbWFya2VyLmNvdW50cnkpICYmIChmaWx0ZXJfcmVnaW9uID09ICdpZnlfYWxsJyB8fCBmaWx0ZXJfcmVnaW9uID09IG1hcmtlci5yZWdpb24pICYmIChmaWx0ZXJfY2l0eSA9PSAnaWZ5X2FsbCcgfHwgZmlsdGVyX2NpdHkgPT0gbWFya2VyLmNpdHkpICkge1xuICAgICAgICAgICAgICAgICAgICBjaGVja19jb3VudHJ5ID0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGRpc3RhbmNlID4gLTEgJiYgY2hlY2tUYWcodGFnc19jaGVjaywgbWFya2VyLnRhZ3MpICYmIGNoZWNrX2NvdW50cnkgPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICB0aHVtID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBtYXJrZXIudGh1bSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRodW0gPSBtYXJrZXIudGh1bTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB2YXIgaWQgPSBtYXJrZXIuaWQ7XG4gICAgICAgICAgICAgICAgICAgIHZhciBuYW1lID0gbWFya2VyLm5hbWU7XG4gICAgICAgICAgICAgICAgICAgIHZhciB1cmwgPSBtYXJrZXIudXJsO1xuICAgICAgICAgICAgICAgICAgICB2YXIgYWRkcmVzcyA9IG1hcmtlci5hZGRyZXNzO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGhvbmUgPSBtYXJrZXIucGhvbmU7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlbWFpbCA9IG1hcmtlci5lbWFpbDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHdlYiA9IG1hcmtlci53ZWI7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0YWdzID0gbWFya2VyLnRhZ3M7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzb2NpYWwgPSBtYXJrZXIuc29jaWFsO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbnVtID0gbWFya2VyLm51bTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBsYWNlX2lkID0gbWFya2VyLnBsYWNlX2lkO1xuICAgICAgICAgICAgICAgICAgICBhcnJheV9wb2luW2ldID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc29jaWFsOiBzb2NpYWwsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHVtOiB0aHVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogdXJsLFxuICAgICAgICAgICAgICAgICAgICAgICAgYWRkcmVzczogYWRkcmVzcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBob25lOiBwaG9uZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVtYWlsOiBlbWFpbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdlYjogd2ViLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2U6IGRpc3RhbmNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFnczogdGFncyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlcl9jb3VudDogbWFya2VyX2NvdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgbnVtOiBudW0sXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZV9pZDogcGxhY2VfaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuczptYXJrZXIudHJhbnMgIT09IHVuZGVmaW5lZCA/IG1hcmtlci50cmFucyA6IFtdLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBtYXJrZXIuc2V0VmlzaWJsZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgbWFya2VyX2ZpcnN0ID0gbWFya2VyO1xuICAgICAgICAgICAgICAgICAgICBtYXJrZXJfY291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgYm91bmRzLmV4dGVuZChtYXJrZXIuZ2V0UG9zaXRpb24oKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbWFya2VyLnNldFZpc2libGUoZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbWFwLmZpdEJvdW5kcyhib3VuZHMpO1xuICAgICAgICAgICAgaWYoaWZ5X2xheW91dCAhPSA4KSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm51bS1yc1wiKS5pbm5lckhUTUwgPSBtYXJrZXJfY291bnQ7XG4gICAgICAgICAgICAvL2pRdWVyeShcIiNyZXN1bHRzLXNsdCBoMy50aXRsZVwiKS5zaG93KCk7XG4gICAgICAgICAgICBqUXVlcnkoXCIjbWFpbi1zbGlkZXItc3RvcmVsb2NhdG9yXCIpLnJlbW92ZUNsYXNzKCdzdG9yZWlmeS1maXJzdC1hbGVydCcpO1xuICAgICAgICAgICAgaWYgKG1hcmtlcl9jb3VudCA+IDApIHtcbiAgICAgICAgICAgICAgICBhcnJheV9wb2luID0gYXJyYXlfcG9pbi5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGEuZGlzdGFuY2UgLSBiLmRpc3RhbmNlO1xuICAgICAgICAgICAgICAgIH0pO1xuLy8gICAgICAgICAgICAgICAgdmFyIGh0bWxfbGlzdCA9ICcnO1xuICAgICAgICAgICAgICAgIGxldCBzdG9yZXMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdpbm5lci1pdGVtJyk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdG9yZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgc3RvcmVzW2ldLnBhcmVudE5vZGUuY2xhc3NMaXN0LmFkZCgnc3RvcmUtaXRlbS1oaWRlJylcbiAgICAgICAgICAgICAgICAgICAgLy8gc3RvcmVzW2ldLnBhcmVudE5vZGUucmVtb3ZlUHJvcGVydHkoJ29yZGVyJylcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYoaWZ5X2xheW91dCAhPSA4KVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXlfcG9pbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZihhcnJheV9wb2luW2ldICYmIGFycmF5X3BvaW5baV0uaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzdG9yZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdG9yZV9pZF8nICsgYXJyYXlfcG9pbltpXS5pZClcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHN0b3JlICYmIHN0b3JlLnBhcmVudE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdG9yZS5wYXJlbnROb2RlLnN0eWxlLnNldFByb3BlcnR5KCdvcmRlcicsIGkgKyAxKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0b3JlLnBhcmVudE5vZGUuY2xhc3NMaXN0LnJlbW92ZSgnc3RvcmUtaXRlbS1oaWRlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdG9yZS5wYXJlbnROb2RlLmNsYXNzTGlzdC5yZW1vdmUoJ3N0b3JlLWNsb3Nlc3QnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGkgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RvcmUuY2xhc3NMaXN0LmFkZCgnaW5uZXItaXRlbS1hY3RpdmUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VzdFN0b3JlID0gYXJyYXlfcG9pbltpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ21hcmtlcnMuZm9yRWFjaChzdG9yZU1hcmtlciA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdG9yZU1hcmtlci5zZXRBbmltYXRpb24obnVsbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihzdG9yZU1hcmtlci5pZCA9PT0gYXJyYXlfcG9pbltpXS5pZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0b3JlTWFya2VyLnNldEFuaW1hdGlvbihnb29nbGUubWFwcy5BbmltYXRpb24uQk9VTkNFKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdG9yZS5wYXJlbnROb2RlLmNsYXNzTGlzdC5hZGQoJ3N0b3JlLWNsb3Nlc3QnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCdnZW9sb2NhdGlvbicgaW4gbmF2aWdhdG9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLmdlb2xvY2F0aW9uLmdldEN1cnJlbnRQb3NpdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHBvc2l0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VyTG9jYXRpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF0OiBwb3NpdGlvbi5jb29yZHMubGF0aXR1ZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG5nOiBwb3NpdGlvbi5jb29yZHMubG9uZ2l0dWRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2Rpc3RhbmNlTWlsZXNBUEkoY2VudGVyLmxhdCgpLCBjZW50ZXIubG5nKCksIHN0b3JlLmRhdGFzZXQubGF0LCBzdG9yZS5kYXRhc2V0LmxvbmcsIHN0b3JlLnF1ZXJ5U2VsZWN0b3IoJy5kaXN0YW5jZS1lbGVtZW50JykpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdMb2NhdGlvbiBlcnJvcjonLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuYWJsZUhpZ2hBY2N1cmFjeTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDEwMDAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4aW11bUFnZTogMzAwMDAwIC8vIDUgbWludXRlc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignR2VvbG9jYXRpb24gaXMgbm90IHN1cHBvcnRlZCBieSB0aGlzIGJyb3dzZXIuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIHN0b3JlLnBhcmVudE5vZGUuY2xhc3NMaXN0LnJlbW92ZSgnc3RvcmUtaXRlbS1oaWRlJylcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gZm9yICh2YXIgaSA9IDA7IGkgPCBtYXJrZXJfY291bnQ7IGkrKykge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gICAgIGxldCBzdG9yZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdG9yZV9pZF8nICsgYXJyYXlfcG9pbltpXS5pZClcbiAgICAgICAgICAgICAgICAvLyAgICAgY29uc29sZS5sb2coc3RvcmUpXG4gICAgICAgICAgICAgICAgLy8gICAgIHN0b3JlLnBhcmVudE5vZGUuY2xhc3NMaXN0LnJlbW92ZSgnc3RvcmUtaXRlbS1oaWRlJylcbiAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAgICAgaWYobWFya2VyX2NvdW50ID09IDEpe1xuICAgICAgICAgICAgICAgICAgICBtYXAuc2V0Q2VudGVyKG1hcmtlcl9maXJzdC5nZXRQb3NpdGlvbigpKTtcbiAgICAgICAgICAgICAgICAgICAgbWFwLnNldFpvb20oc2VhcmNoX3Jlc3VsdF96b29tKTtcbiAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHpvb20gPSBtYXAuZ2V0Wm9vbSgpO1xuICAgICAgICAgICAgICAgICAgICB6b29tID0gTWF0aC5taW4oem9vbSwgMTIpO1xuICAgICAgICAgICAgICAgICAgICBtYXAuc2V0Wm9vbSh6b29tKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsZXQgc3RvcmVPcmRlciA9IDBcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RvcmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCByYWRpdXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmFkaXVzX3NlYXJjaCcpLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAvLyBsZXQgY2VudGVyID0gbWFwLmdldENlbnRlcigpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgZHYgPSAwLjAwMDYyMTM3O1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRpc3RhbmNlID0gY2hlY2tEaXN0YW5jZUJldHdlZW5Qb2ludHMoY2VudGVyLmxhdCgpLCBjZW50ZXIubG5nKCksIHN0b3Jlc1tpXS5kYXRhc2V0LmxhdCwgc3RvcmVzW2ldLmRhdGFzZXQubG9uZywgcmFkaXVzLCBkdik7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBsZXQgZGlzdGFuY2VXcmFwcGVyID0gc3RvcmVzW2ldLnF1ZXJ5U2VsZWN0b3IoJy5kaXN0YW5jZS1lbGVtZW50JylcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgKCdnZW9sb2NhdGlvbicgaW4gbmF2aWdhdG9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IuZ2VvbG9jYXRpb24uZ2V0Q3VycmVudFBvc2l0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChwb3NpdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1c2VyTG9jYXRpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXQ6IHBvc2l0aW9uLmNvb3Jkcy5sYXRpdHVkZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxuZzogcG9zaXRpb24uY29vcmRzLmxvbmdpdHVkZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3RhbmNlTWlsZXMoY2VudGVyLmxhdCgpLCBjZW50ZXIubG5nKCksIE51bWJlcihzdG9yZXNbaV0uZGF0YXNldC5sYXQpLCBOdW1iZXIoc3RvcmVzW2ldLmRhdGFzZXQubG9uZyksIGRpc3RhbmNlV3JhcHBlciwgc3RvcmVzW2ldKVxuICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdMb2NhdGlvbiBlcnJvcjonLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuYWJsZUhpZ2hBY2N1cmFjeTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGltZW91dDogMTAwMDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heGltdW1BZ2U6IDMwMDAwMCAvLyA1IG1pbnV0ZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignR2VvbG9jYXRpb24gaXMgbm90IHN1cHBvcnRlZCBieSB0aGlzIGJyb3dzZXIuJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZigkKHdpbmRvdykud2lkdGgoKSA8IDc2OCkge1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8gT3BlbiBtYXJrZXJcblxuICAgICAgICAgICAgICAgICAgICBsZXQgaW5mb1dpbmRvd1dyYXBwZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5mby13aW5kb3ctd3JhcHBlcicpO1xuICAgICAgICAgICAgICAgICAgICAkKGluZm9XaW5kb3dXcmFwcGVyKS5odG1sKCcnKTtcblxuICAgICAgICAgICAgICAgICAgICBpZigkKHdpbmRvdykud2lkdGgoKSA8IDc2OCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRvcCA9ICQoaW5mb1dpbmRvd1dyYXBwZXIpLm9mZnNldCgpLnRvcCAtIDQwMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJ2h0bWwsYm9keScpLmFuaW1hdGUoe3Njcm9sbFRvcDogdG9wfSwgMTAwMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGxldCBzdG9yZUluZm8gPSAkKCcuc3RvcmUtY2xvc2VzdCcpWzBdLm91dGVySFRNTDtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICQoaW5mb1dpbmRvd1dyYXBwZXIpLmh0bWwoc3RvcmVJbmZvKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBnZXRDdXJyZW50RGF5T3BlbmluZ1RpbWUoJChpbmZvV2luZG93V3JhcHBlcikuY29udGV4dClcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBqUXVlcnkoXCIjc3RvcmVpZnktdGV4dC1yZXN1bHRcIikudGV4dChqUXVlcnkoXCIjc3RvcmVpZnktdGV4dC1yZXN1bHRcIikuZGF0YSgncmVzdWx0cycpKTtcbiAgICAgICAgICAgICAgICAvLyBqUXVlcnkoJyMnICsgcmFuZG9tSUQpLmh0bWwoaHRtbF9saXN0KTtcblxuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB1cGRhdGVTZWFyY2hDaXJjbGVTdHlsZXMobWFya2VyX2NvdW50ID4gMCk7XG4gICAgICAgICAgICBpZiAobWFya2VyX2NvdW50ID09IDApIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBtYXAuc2V0Wm9vbShzZWFyY2hfcmVzdWx0X3pvb20pO1xuICAgICAgICAgICAgICAgIG1hcC5zZXRDZW50ZXIobmV3IGdvb2dsZS5tYXBzLkxhdExuZyhjZW50ZXIubGF0KCksIGNlbnRlci5sbmcoKSkpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZGluZ19tYXNrX2xvYWRlclwiKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXG4gICAgICAgICAgICAgICAgalF1ZXJ5KFwiI3Jlc3VsdHMtc2x0XCIpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB2YXIgYWRkcmVzcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWRkcmVzc1wiKS52YWx1ZTtcbiAgICAgICAgICAgICAgICAvL2FsZXJ0KHRyYW5zWydzdG9yZV9uZWFyJ10gKyBhZGRyZXNzKTsgLy9cInN0b3JlX25lYXJcIlxuICAgICAgICAgICAgICAgIGpRdWVyeShcIiNzdG9yZWlmeS10ZXh0LXJlc3VsdFwiKS50ZXh0KGpRdWVyeShcIiNzdG9yZWlmeS10ZXh0LXJlc3VsdFwiKS5kYXRhKCdyZXN1bHQnKSk7XG4gICAgICAgICAgICAgICAgalF1ZXJ5KCcjcmVzdWx0cy1lbXB0eScpLmh0bWwoJzxoNSBjbGFzcz1cImFsZXJ0IGFsZXJ0LWRhbmdlclwiPicgKyBzdG9yZWxvY2F0b3JfbGFuZy5zdG9yZV9uZWFyICsgJyA8aT5cIicgKyBhZGRyZXNzICsgJ1wiPC9pPjwvaDU+Jyk7XG4gICAgICAgICAgICAgICAgYWRkQW5hbHl0aWMocmVzdWx0R2VvLG1hcmtlcl9jb3VudCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBqUXVlcnkoJyNyZXN1bHRzLWVtcHR5JykuaHRtbCgnPGg1PjwvaDU+Jyk7XG4gICAgICAgICAgICBqUXVlcnkoXCIjcmVzdWx0cy1zbHRcIikuc2hvdygpO1xuICAgICAgICAgICAgdmFyIHRodW0gPSAnJztcblxuXG4gICAgICAgICAgICAvLyBtYXAuZml0Qm91bmRzKGJvdW5kcyk7XG4gICAgICAgICAgICAvLyB2YXIgem9vbSA9IG1hcC5nZXRab29tKCk7XG4gICAgICAgICAgICAvLyB6b29tID0gTWF0aC5taW4oem9vbSwgMTIpO1xuICAgICAgICAgICAgLy8galF1ZXJ5KFwiLm1hcC10YWItbW9iaWxlLWJudC1pdGVtXCIpLmF0dHIoXCJkYXRhLXpvb21cIix6b29tKTtcbiAgICAgICAgICAgIC8vIG1hcC5zZXRab29tKHpvb20pO1xuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkaW5nX21hc2tfbG9hZGVyXCIpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICBhZGRBbmFseXRpYyhyZXN1bHRHZW8sbWFya2VyX2NvdW50KTtcblxuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIHNlYXJjaExvY2F0aW9uc05lYXJTaG9ydChyZXN1bHRHZW8pIHtcbiAgICAgICAgICBjbGVhclNlYXJjaE1hcmtlcigpO1xuICAgICAgICAgIHZhciBjZW50ZXIgPSByZXN1bHRHZW8uZ2VvbWV0cnkubG9jYXRpb247XG4gICAgICAgICAgaWYoaW5mb3dpbmRvdykgaW5mb3dpbmRvdy5jbG9zZSgpO1xuICAgICAgICAgIHZhciByYWRpdXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmFkaXVzX3NlYXJjaCcpLnZhbHVlO1xuICAgICAgICAgIC8vdmFyIHNlYXJjaFVybCA9IGJhc2V1cmwgKyAnYWxsL2FqYXg/bGF0PScgKyBjZW50ZXIubGF0KCkgKyAnJmxuZz0nICsgY2VudGVyLmxuZygpICsgJyZyYWRpdXM9JyArIHJhZGl1cyArICcmc2hvcD0nICsgU2hvcGlmeS5zaG9wO1xuICAgICAgICAgIHZhciBzZWFyY2hVcmwgPSBzdG9yZWlmeV9hcHBfcHJveHlfdXJsICsgJy9hbGwvYWpheCc7Ly8/bGF0PScgKyBjZW50ZXIubGF0KCkgKyAnJmxuZz0nICsgY2VudGVyLmxuZygpICsgJyZyYWRpdXM9JyArIHJhZGl1cyArICcmcmFkaXVzPScgKyBTaG9waWZ5LnNob3A7XG4gICAgICAgICAgdmFyIHRhZ3NfY2hlY2sgPSBbXTtcbiAgICAgICAgICB2YXIgZmlsdGVyX2NvdW50cnkgPSAnYWxsJyxmaWx0ZXJfcmVnaW9uID0gJ2lmeV9hbGwnLGZpbHRlcl9jaXR5ID0gJ2lmeV9hbGwnO1xuICAgICAgICAgIHZhciBjaGVja19jb3VudHJ5ID0gMDtcbiAgICAgICAgICB2YXIgZGF0YSA9IHtsYXQ6Y2VudGVyLmxhdCgpLGxuZzpjZW50ZXIubG5nKCkscmFkaXVzOnJhZGl1cyxzaG9wOiBTaG9waWZ5LnNob3AsdGFnczp0YWdzX2NoZWNrLmpvaW4oJywnKX07XG4gICAgICAgICAgICB2YXIgbWFya2VyX2NvdW50ID0gMDtcbiAgICAgICAgICAgIHZhciBkdiA9IDE7XG4gICAgICAgICAgICBpZihyYWRpdXNfdW5pdCA9PSAxICl7XG4gICAgICAgICAgICAgICAgZHYgPSAwLjAwMTsgXG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBkdj0gMC4wMDA2MjEzNztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBhcnJheV9wb2luID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdtYXJrZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgbWFya2VyID0gZ21hcmtlcnNbaV07XG4gICAgICAgICAgICAgICAgdmFyIGRpc3RhbmNlID0gY2hlY2tEaXN0YW5jZUJldHdlZW5Qb2ludHMoY2VudGVyLmxhdCgpLCBjZW50ZXIubG5nKCksIG1hcmtlci5wb3NpdGlvbi5sYXQoKSwgbWFya2VyLnBvc2l0aW9uLmxuZygpLCByYWRpdXMsIGR2KTtcbiAgICAgICAgICAgICAgICBjaGVja19jb3VudHJ5ID0gMDtcblxuICAgICAgICAgICAgICAgIGlmICggKGZpbHRlcl9jb3VudHJ5ID09ICdhbGwnIHx8IGZpbHRlcl9jb3VudHJ5ID09IG1hcmtlci5jb3VudHJ5KSAmJiAoZmlsdGVyX3JlZ2lvbiA9PSAnaWZ5X2FsbCcgfHwgZmlsdGVyX3JlZ2lvbiA9PSBtYXJrZXIucmVnaW9uKSAmJiAoZmlsdGVyX2NpdHkgPT0gJ2lmeV9hbGwnIHx8IGZpbHRlcl9jaXR5ID09IG1hcmtlci5jaXR5KSApIHtcbiAgICAgICAgICAgICAgICAgICAgY2hlY2tfY291bnRyeSA9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChkaXN0YW5jZSA+IC0xICYmIGNoZWNrVGFnKHRhZ3NfY2hlY2ssIG1hcmtlci50YWdzKSAmJiBjaGVja19jb3VudHJ5ID09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGh1bSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgbWFya2VyLnRodW0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHVtID0gbWFya2VyLnRodW07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdmFyIGlkID0gbWFya2VyLmlkO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmFtZSA9IG1hcmtlci5uYW1lO1xuICAgICAgICAgICAgICAgICAgICB2YXIgdXJsID0gbWFya2VyLnVybDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFkZHJlc3MgPSBtYXJrZXIuYWRkcmVzcztcbiAgICAgICAgICAgICAgICAgICAgdmFyIHBob25lID0gbWFya2VyLnBob25lO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZW1haWwgPSBtYXJrZXIuZW1haWw7XG4gICAgICAgICAgICAgICAgICAgIHZhciB3ZWIgPSBtYXJrZXIud2ViO1xuICAgICAgICAgICAgICAgICAgICB2YXIgdGFncyA9IG1hcmtlci50YWdzO1xuICAgICAgICAgICAgICAgICAgICB2YXIgc29jaWFsID0gbWFya2VyLnNvY2lhbDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG51bSA9IG1hcmtlci5udW07XG4gICAgICAgICAgICAgICAgICAgIGFycmF5X3BvaW5baV0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzb2NpYWw6IHNvY2lhbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRodW06IHRodW0sXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRyZXNzOiBhZGRyZXNzLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGhvbmU6IHBob25lLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW1haWw6IGVtYWlsLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2ViOiB3ZWIsXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXN0YW5jZTogZGlzdGFuY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWdzOiB0YWdzLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWFya2VyX2NvdW50OiBtYXJrZXJfY291bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBudW06IG51bSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zOiBtYXJrZXIudHJhbnMgIT09IHVuZGVmaW5lZCA/IG1hcmtlci50cmFucyA6IFtdLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBtYXJrZXIuc2V0VmlzaWJsZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgbWFya2VyX2NvdW50Kys7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbWFya2VyLnNldFZpc2libGUoZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gbWFya2VyQ2x1c3Rlci5zZXRJZ25vcmVIaWRkZW4odHJ1ZSk7XG4gICAgICAgICAgICAvLyBtYXJrZXJDbHVzdGVyLnJlcGFpbnQoKTtcbiAgICAgICAgICAgIC8vIG1hcmtlckNsdXN0ZXIuZml0TWFwVG9NYXJrZXJzKCk7XG5cbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RvcmVpZnktc3RvcmVsb2N0b3ItY29udGFjdEZybVwiKS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZGluZ19tYXNrX2xvYWRlclwiKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgdXBkYXRlU2VhcmNoQ2lyY2xlU3R5bGVzKG1hcmtlcl9jb3VudCA+IDApO1xuICAgICAgICAgICAgaWYobWFya2VyX2NvdW50ID4gMCApe1xuICAgICAgICAgICAgICAgIFxuXG4gICAgICAgICAgICAgICAgYXJyYXlfcG9pbiA9IGFycmF5X3BvaW4uc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgICAgIHJldHVybiBhLmRpc3RhbmNlIC0gYi5kaXN0YW5jZSA7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdmFyIGh0bWxfbGlzdD0nJztcbiAgICAgICAgICAgICAgICBpZihpZnlfbGF5b3V0ICE9IDgpXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtYXJrZXJfY291bnQ7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBodG1sX2xpc3QgKz0gY3JlYXRlX2h0bWxfbGlzdChhcnJheV9wb2luW2ldLCBbaV0sIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAvL2h0bWxfbGlzdCArPSBsaXN0SXRlbShhcnJheV9wb2luW2ldLnNvY2lhbCwgYXJyYXlfcG9pbltpXS50aHVtLCBhcnJheV9wb2luW2ldLmlkLCBhcnJheV9wb2luW2ldLm5hbWUsIGFycmF5X3BvaW5baV0udXJsLCBhcnJheV9wb2luW2ldLmFkZHJlc3MsIGFycmF5X3BvaW5baV0ucGhvbmUsIGFycmF5X3BvaW5baV0uZW1haWwsIGFycmF5X3BvaW5baV0ud2ViLCBhcnJheV9wb2luW2ldLmRpc3RhbmNlLCBhcnJheV9wb2luW2ldLnRhZ3MsIGFycmF5X3BvaW5baV0ubnVtLCBudWxsLCBhcnJheV9wb2luW2ldLnRyYW5zKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYoaWZ5X2xheW91dCAhPSA4KSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm51bS1yc1wiKS5pbm5lckhUTUwgPSBtYXJrZXJfY291bnQ7XG4gICAgICAgICAgICAgICAgalF1ZXJ5KCcjcmVzdWx0cy1zbHQgLmxpc3QtY3VzdG8tc3RvcmVpZnknKS5odG1sKGh0bWxfbGlzdCk7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgaWYoaWZ5X2xheW91dCAhPSA4KSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm51bS1yc1wiKS5pbm5lckhUTUwgPSBtYXJrZXJfY291bnQ7XG4gICAgICAgICAgICAgIGpRdWVyeShcIiNzdG9yZWlmeS10ZXh0LXJlc3VsdFwiKS50ZXh0KGpRdWVyeShcIiNzdG9yZWlmeS10ZXh0LXJlc3VsdFwiKS5kYXRhKCdyZXN1bHQnKSk7XG4gICAgICAgICAgICAgIGpRdWVyeSgnI3Jlc3VsdHMtc2x0IC5saXN0LWN1c3RvLXN0b3JlaWZ5JykuaHRtbCgnJyk7XG4gICAgICAgICAgICAgIGpRdWVyeSgnI3Jlc3VsdHMtZW1wdHknKS5odG1sKCc8aDUgY2xhc3M9XCJhbGVydCBhbGVydC1kYW5nZXJcIj4nKyBzdG9yZWxvY2F0b3JfbGFuZy5zdG9yZV9uZWFyICsnPGk+XCInKyBhZGRyZXNzKydcIjwvaT48L2g1PicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIFxuXG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gc2VhcmNoU3RvcmVzQnlOYW1lKCkge1xuICAgICAgICAgICAgY2xlYXJTZWFyY2hNYXJrZXIoKTtcbiAgICAgICAgICAgIGlmKGluZm93aW5kb3cpIGluZm93aW5kb3cuY2xvc2UoKTtcbiAgICAgICAgICAgIGJvdW5kcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmdCb3VuZHMoKTtcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZGluZ19tYXNrX2xvYWRlclwiKS5zdHlsZS5kaXNwbGF5ID0gJyc7XG4gICAgICAgICAgICBqUXVlcnkoJy5jb250ZW50LXJlc3VsdHMtc2x0JykucmVtb3ZlQ2xhc3MoJ2NvbnRlbnQtcmVzdWx0cy1maXJzdCcpO1xuICAgICAgICAgICAgdmFyIHNlYXJjaF90ZXh0ID0galF1ZXJ5LnRyaW0oZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdG9yZV9zZWFyY2hcIikudmFsdWUpO1xuICAgICAgICAgICAgdmFyIHRhZ3MgPSBbXTtcbiAgICAgICAgICAgIGpRdWVyeS5lYWNoKGpRdWVyeSgnaW5wdXQuc3RvcmVpZnlhcHBfc3RvcmVzX3RhZ3NfZmlsdGVyOmNoZWNrZWQnKSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGFncy5wdXNoKGpRdWVyeSh0aGlzKS52YWwoKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBmaWx0ZXJfY291bnRyeSA9ICdhbGwnLGZpbHRlcl9yZWdpb24gPSAnaWZ5X2FsbCcsZmlsdGVyX2NpdHkgPSAnaWZ5X2FsbCc7XG4gICAgICAgICAgICBpZiAoalF1ZXJ5KCdpbnB1dC5zdG9yZWlmeWFwcF9zdG9yZXNfY291bnRyeV9maWx0ZXInKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBmaWx0ZXJfY291bnRyeSA9IGpRdWVyeSgnaW5wdXQuc3RvcmVpZnlhcHBfc3RvcmVzX2NvdW50cnlfZmlsdGVyOmNoZWNrZWQnKS52YWwoKTsgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoalF1ZXJ5KCdpbnB1dC5zdG9yZWlmeWFwcF9zdG9yZXNfcmVnaW9uX2ZpbHRlcicpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGZpbHRlcl9yZWdpb24gPSBqUXVlcnkoJ2lucHV0LnN0b3JlaWZ5YXBwX3N0b3Jlc19yZWdpb25fZmlsdGVyOmNoZWNrZWQnKS52YWwoKTsgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoalF1ZXJ5KCdpbnB1dC5zdG9yZWlmeWFwcF9zdG9yZXNfY2l0eV9maWx0ZXInKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBmaWx0ZXJfY2l0eSA9IGpRdWVyeSgnaW5wdXQuc3RvcmVpZnlhcHBfc3RvcmVzX2NpdHlfZmlsdGVyOmNoZWNrZWQnKS52YWwoKTsgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihqUXVlcnkoJy5zdG9yZWlmeWFwcF9zdG9yZXNfY291bnRyeXNfZmlsdGVyX2xpc3QnKS5kYXRhKCd0YWcnKSA9PSAnc2VsZWN0Jyl7XG4gICAgICAgICAgICAgICAgZmlsdGVyX2NvdW50cnkgPSBqUXVlcnkoJ3NlbGVjdC5zdG9yZWlmeWFwcF9zdG9yZXNfY291bnRyeV9maWx0ZXInKS52YWwoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKGpRdWVyeSgnLnN0b3JlaWZ5YXBwX3N0b3Jlc19yZWdpb25fZmlsdGVyX2xpc3QnKS5kYXRhKCd0YWcnKSA9PSAnc2VsZWN0Jyl7XG4gICAgICAgICAgICAgICAgZmlsdGVyX3JlZ2lvbiA9IGpRdWVyeSgnc2VsZWN0LnN0b3JlaWZ5YXBwX3N0b3Jlc19yZWdpb25fZmlsdGVyJykudmFsKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihqUXVlcnkoJy5zdG9yZWlmeWFwcF9zdG9yZXNfY2l0eV9maWx0ZXJfbGlzdCcpLmRhdGEoJ3RhZycpID09ICdzZWxlY3QnKXtcbiAgICAgICAgICAgICAgICBmaWx0ZXJfY2l0eSA9IGpRdWVyeSgnc2VsZWN0LnN0b3JlaWZ5YXBwX3N0b3Jlc19jaXR5X2ZpbHRlcicpLnZhbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoZmlsdGVyX3JlZ2lvbiA9PSAndW5uYW1lZF9yZWdpb24nKSBmaWx0ZXJfcmVnaW9uID0gJyc7XG4gICAgICAgICAgICBpZihmaWx0ZXJfY2l0eSA9PSAndW5uYW1lZF9jaXR5JykgZmlsdGVyX2NpdHkgPSAnJztcblxuICAgICAgICAgICAgdmFyIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgbmFtZTogc2VhcmNoX3RleHQsXG4gICAgICAgICAgICAgICAgc2hvcDogU2hvcGlmeS5zaG9wLFxuICAgICAgICAgICAgICAgIHRhZ3M6IHRhZ3Muam9pbignLCcpLFxuICAgICAgICAgICAgICAgIGNvdW50cnk6IGZpbHRlcl9jb3VudHJ5LFxuICAgICAgICAgICAgICAgIHJlZ2lvbjogZmlsdGVyX3JlZ2lvbixcbiAgICAgICAgICAgICAgICBjaXR5OiBmaWx0ZXJfY2l0eSxcbiAgICAgICAgICAgICAgICB2OiAyXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYoaXNJZnlUcmFucylcbiAgICAgICAgICAgICAgICBkYXRhLmxvY2FsZSA9IGxvY2FsZUN1cnJlbnQ7XG4gICAgICAgICAgICB2YXIgc2VhcmNoVXJsID0gc3RvcmVpZnlfYXBwX3Byb3h5X3VybCArICcvc2VhcmNoYnluYW1lJzsgLy8/bmFtZT0nICsgc2VhcmNoX3RleHQgKyAnJnNob3A9JyArIFNob3BpZnkuc2hvcDtcbiAgICAgICAgICAgIGpRdWVyeS5hamF4U2V0dXAoe1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgJ1gtQ1NSRi1UT0tFTic6IGpRdWVyeSgnaW5wdXRbbmFtZT1cIl90b2tlblwiXScpLnZhbCgpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBqUXVlcnkuYWpheCh7XG4gICAgICAgICAgICAgICAgdXJsOiBzZWFyY2hVcmwsXG4gICAgICAgICAgICAgICAgdHlwZTogXCJHRVRcIixcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICAgICAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICAgICAgICB9KS5kb25lKGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgICAgICAgICAgICAgIHZhciBtYXJrZXJOb2RlcyA9IGRhdGEuZGF0YTtcblxuICAgICAgICAgICAgICAgIGlmIChtYXJrZXJOb2Rlcy5sZW5ndGggPT0gMCkge1xuXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZGluZ19tYXNrX2xvYWRlclwiKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgICAgICBqUXVlcnkoXCIjcmVzdWx0cy1zbHRcIikuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcXVlcnlfc2VhcmNoID0galF1ZXJ5LnRyaW0oZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdG9yZV9zZWFyY2hcIikudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBqUXVlcnkoJyNyZXN1bHRzLWVtcHR5JykuaHRtbCgnPGg1IGNsYXNzPVwiYWxlcnQgYWxlcnQtZGFuZ2VyXCI+JyArIHN0b3JlbG9jYXRvcl9sYW5nLm5vX3N0b3JlX25hbWUgKyAnIDxpPlwiJyArIHF1ZXJ5X3NlYXJjaCArICdcIjwvaT48L2g1PicpO1xuICAgICAgICAgICAgICAgICAgICBzZXRNYXBPbkFsbChudWxsKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGpRdWVyeShcIiNyZXN1bHRzLXNsdFwiKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgdmFyIHRodW0gPSAnJztcbiAgICAgICAgICAgICAgICBpZiAobWFya2VyTm9kZXMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgICAgICBqUXVlcnkoXCIjc3RvcmVpZnktdGV4dC1yZXN1bHRcIikudGV4dChqUXVlcnkoXCIjc3RvcmVpZnktdGV4dC1yZXN1bHRcIikuZGF0YSgncmVzdWx0cycpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBqUXVlcnkoXCIjc3RvcmVpZnktdGV4dC1yZXN1bHRcIikudGV4dChqUXVlcnkoXCIjc3RvcmVpZnktdGV4dC1yZXN1bHRcIikuZGF0YSgncmVzdWx0JykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZihpZnlfbGF5b3V0ICE9IDgpIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibnVtLXJzXCIpLmlubmVySFRNTCA9IG1hcmtlck5vZGVzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAvL2pRdWVyeShcIiNyZXN1bHRzLXNsdCBoMy50aXRsZVwiKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgalF1ZXJ5KFwiI21haW4tc2xpZGVyLXN0b3JlbG9jYXRvclwiKS5yZW1vdmVDbGFzcygnc3RvcmVpZnktZmlyc3QtYWxlcnQnKTtcbiAgICAgICAgICAgICAgICB2YXIgaHRtbF9saXN0ID0gJyc7XG4gICAgICAgICAgICAgICAgdmFyIG1hcmtlcl9jb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgdmFyIG1hcmtlcl9maXJzdDtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdtYXJrZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCBtYXJrZXJOb2Rlc1tpXVsndGFncyddICk7XG4gICAgICAgICAgICAgICAgICAgIG1hcmtlciA9IGdtYXJrZXJzW2ldO1xuICAgICAgICAgICAgICAgICAgICB2YXIgaWQgPSBtYXJrZXIuaWQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtYXJrZXJOb2Rlcy5pbmNsdWRlcyhpZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRodW0gPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBtYXJrZXIudGh1bSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHVtID0gbWFya2VyLnRodW07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmFtZSA9IG1hcmtlci5uYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHVybCA9IG1hcmtlci51cmw7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYWRkcmVzcyA9IG1hcmtlci5hZGRyZXNzO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBob25lID0gbWFya2VyLnBob25lO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVtYWlsID0gbWFya2VyLmVtYWlsO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHdlYiA9IG1hcmtlci53ZWI7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGFncyA9IG1hcmtlci50YWdzO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNvY2lhbCA9IG1hcmtlci5zb2NpYWw7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbnVtID0gbWFya2VyLm51bTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0cmFucyA9IG1hcmtlci50cmFucyAhPT0gdW5kZWZpbmVkID8gbWFya2VyLnRyYW5zIDogW107XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXIuc2V0VmlzaWJsZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlcl9maXJzdCA9IG1hcmtlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvdW5kcy5leHRlbmQobWFya2VyLmdldFBvc2l0aW9uKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFya2VyX2NvdW50Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihpZnlfbGF5b3V0ICE9IDgpXG4gICAgICAgICAgICAgICAgICAgICAgICBodG1sX2xpc3QgKz0gY3JlYXRlX2h0bWxfbGlzdChtYXJrZXJbaV0sIFtpXSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2h0bWxfbGlzdCArPSBsaXN0SXRlbShzb2NpYWwsIHRodW0sIGlkLCBuYW1lLCB1cmwsIGFkZHJlc3MsIHBob25lLCBlbWFpbCwgd2ViLCBudWxsLCB0YWdzLCBudW0sIG51bGwsIHRyYW5zKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlci5zZXRWaXNpYmxlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIG1hcC5maXRCb3VuZHMoYm91bmRzKTtcbiAgICAgICAgICAgICAgICB2YXIgem9vbSA9IG1hcC5nZXRab29tKCk7XG4gICAgICAgICAgICAgICAgem9vbSA9IE1hdGgubWluKHpvb20sIDEyKTtcbiAgICAgICAgICAgICAgICBpZihtYXJrZXJfY291bnQgPT0gMSl7XG4gICAgICAgICAgICAgICAgICAgIG1hcC5zZXRDZW50ZXIobWFya2VyX2ZpcnN0LmdldFBvc2l0aW9uKCkpO1xuICAgICAgICAgICAgICAgICAgICBtYXAuc2V0Wm9vbShzZWFyY2hfcmVzdWx0X3pvb20pO1xuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICBtYXAuc2V0Wm9vbSh6b29tKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgalF1ZXJ5KFwiLm1hcC10YWItbW9iaWxlLWJudC1pdGVtXCIpLmF0dHIoXCJkYXRhLXpvb21cIiwgem9vbSk7XG4gICAgICAgICAgICAgICAgalF1ZXJ5KCcjJyArIHJhbmRvbUlEKS5odG1sKGh0bWxfbGlzdCk7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkaW5nX21hc2tfbG9hZGVyXCIpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cbiAgICAgICAgICAgIH0pLmZhaWwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgLy8gd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnLyc7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkaW5nX21hc2tfbG9hZGVyXCIpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgalF1ZXJ5KFwiI3Jlc3VsdHMtc2x0XCIpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICBqUXVlcnkoJyNyZXN1bHRzLWVtcHR5JykuaHRtbCgnPGg1IGNsYXNzPVwiYWxlcnQgYWxlcnQtZGFuZ2VyXCI+IEFuIGVycm9yIG9jY3VycmVkLiBQbGVhc2UgdHJ5IGFnYWluLiA8L2k+PC9oNT4nKTtcbiAgICAgICAgICAgICAgICBzZXRNYXBPbkFsbChudWxsKTtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIH0gICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBzZWFyY2hTdG9yZXNCeVByb2R1Y3RzKCkge1xuICAgICAgICAgICAgY2xlYXJTZWFyY2hNYXJrZXIoKTtcbiAgICAgICAgICAgIGlmKGluZm93aW5kb3cpIGluZm93aW5kb3cuY2xvc2UoKTtcbiAgICAgICAgICAgIGJvdW5kcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmdCb3VuZHMoKTtcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZGluZ19tYXNrX2xvYWRlclwiKS5zdHlsZS5kaXNwbGF5ID0gJyc7XG4gICAgICAgICAgICBqUXVlcnkoJy5jb250ZW50LXJlc3VsdHMtc2x0JykucmVtb3ZlQ2xhc3MoJ2NvbnRlbnQtcmVzdWx0cy1maXJzdCcpO1xuICAgICAgICAgICAgdmFyIHNlYXJjaF90ZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcm9kdWN0X3NlYXJjaFwiKS52YWx1ZTtcbiAgICAgICAgICAgIHZhciB0YWdzID0gW107XG4gICAgICAgICAgICBqUXVlcnkuZWFjaChqUXVlcnkoJ2lucHV0LnN0b3JlaWZ5YXBwX3N0b3Jlc190YWdzX2ZpbHRlcjpjaGVja2VkJyksIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRhZ3MucHVzaChqUXVlcnkodGhpcykudmFsKCkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgZmlsdGVyX2NvdW50cnkgPSAnYWxsJyxmaWx0ZXJfcmVnaW9uID0gJ2lmeV9hbGwnLGZpbHRlcl9jaXR5ID0gJ2lmeV9hbGwnO1xuICAgICAgICAgICAgaWYgKGpRdWVyeSgnaW5wdXQuc3RvcmVpZnlhcHBfc3RvcmVzX2NvdW50cnlfZmlsdGVyJykubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgZmlsdGVyX2NvdW50cnkgPSBqUXVlcnkoJ2lucHV0LnN0b3JlaWZ5YXBwX3N0b3Jlc19jb3VudHJ5X2ZpbHRlcjpjaGVja2VkJykudmFsKCk7ICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGpRdWVyeSgnaW5wdXQuc3RvcmVpZnlhcHBfc3RvcmVzX3JlZ2lvbl9maWx0ZXInKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBmaWx0ZXJfcmVnaW9uID0galF1ZXJ5KCdpbnB1dC5zdG9yZWlmeWFwcF9zdG9yZXNfcmVnaW9uX2ZpbHRlcjpjaGVja2VkJykudmFsKCk7ICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGpRdWVyeSgnaW5wdXQuc3RvcmVpZnlhcHBfc3RvcmVzX2NpdHlfZmlsdGVyJykubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgZmlsdGVyX2NpdHkgPSBqUXVlcnkoJ2lucHV0LnN0b3JlaWZ5YXBwX3N0b3Jlc19jaXR5X2ZpbHRlcjpjaGVja2VkJykudmFsKCk7ICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoalF1ZXJ5KCcuc3RvcmVpZnlhcHBfc3RvcmVzX2NvdW50cnlzX2ZpbHRlcl9saXN0JykuZGF0YSgndGFnJykgPT0gJ3NlbGVjdCcpe1xuICAgICAgICAgICAgICAgIGZpbHRlcl9jb3VudHJ5ID0galF1ZXJ5KCdzZWxlY3Quc3RvcmVpZnlhcHBfc3RvcmVzX2NvdW50cnlfZmlsdGVyJykudmFsKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihqUXVlcnkoJy5zdG9yZWlmeWFwcF9zdG9yZXNfcmVnaW9uX2ZpbHRlcl9saXN0JykuZGF0YSgndGFnJykgPT0gJ3NlbGVjdCcpe1xuICAgICAgICAgICAgICAgIGZpbHRlcl9yZWdpb24gPSBqUXVlcnkoJ3NlbGVjdC5zdG9yZWlmeWFwcF9zdG9yZXNfcmVnaW9uX2ZpbHRlcicpLnZhbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoalF1ZXJ5KCcuc3RvcmVpZnlhcHBfc3RvcmVzX2NpdHlfZmlsdGVyX2xpc3QnKS5kYXRhKCd0YWcnKSA9PSAnc2VsZWN0Jyl7XG4gICAgICAgICAgICAgICAgZmlsdGVyX2NpdHkgPSBqUXVlcnkoJ3NlbGVjdC5zdG9yZWlmeWFwcF9zdG9yZXNfY2l0eV9maWx0ZXInKS52YWwoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKGZpbHRlcl9yZWdpb24gPT0gJ3VubmFtZWRfcmVnaW9uJykgZmlsdGVyX3JlZ2lvbiA9ICcnO1xuICAgICAgICAgICAgaWYoZmlsdGVyX2NpdHkgPT0gJ3VubmFtZWRfY2l0eScpIGZpbHRlcl9jaXR5ID0gJyc7XG5cbiAgICAgICAgICAgIHZhciBkYXRhID0ge1xuICAgICAgICAgICAgICAgIG5hbWU6IHNlYXJjaF90ZXh0LFxuICAgICAgICAgICAgICAgIHNob3A6IFNob3BpZnkuc2hvcCxcbiAgICAgICAgICAgICAgICB0YWdzOiB0YWdzLmpvaW4oJywnKSxcbiAgICAgICAgICAgICAgICBjb3VudHJ5OiBmaWx0ZXJfY291bnRyeSxcbiAgICAgICAgICAgICAgICByZWdpb246IGZpbHRlcl9yZWdpb24sXG4gICAgICAgICAgICAgICAgY2l0eTogZmlsdGVyX2NpdHksXG4gICAgICAgICAgICAgICAgdjogMlxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmKGlzSWZ5VHJhbnMpXG4gICAgICAgICAgICAgICAgZGF0YS5sb2NhbGUgPSBsb2NhbGVDdXJyZW50O1xuICAgICAgICAgICAgdmFyIHNlYXJjaFVybCA9IHN0b3JlaWZ5X2FwcF9wcm94eV91cmwgKyAnL3NlYXJjaHByb2R1Y3QnOyAvLz9uYW1lPScgKyBzZWFyY2hfdGV4dCArICcmc2hvcD0nICsgU2hvcGlmeS5zaG9wO1xuICAgICAgICAgICAgalF1ZXJ5LmFqYXhTZXR1cCh7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICAnWC1DU1JGLVRPS0VOJzogalF1ZXJ5KCdpbnB1dFtuYW1lPVwiX3Rva2VuXCJdJykudmFsKClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGpRdWVyeS5hamF4KHtcbiAgICAgICAgICAgICAgICB1cmw6IHNlYXJjaFVybCxcbiAgICAgICAgICAgICAgICB0eXBlOiBcIkdFVFwiLFxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgICAgICAgIH0pLmRvbmUoZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgICAgICAgICAgICAgdmFyIG1hcmtlck5vZGVzID0gZGF0YS5kYXRhO1xuXG4gICAgICAgICAgICAgICAgaWYgKG1hcmtlck5vZGVzLmxlbmd0aCA9PSAwKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkaW5nX21hc2tfbG9hZGVyXCIpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgICAgIGpRdWVyeShcIiNyZXN1bHRzLXNsdFwiKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBxdWVyeV9zZWFyY2ggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByb2R1Y3Rfc2VhcmNoXCIpLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBqUXVlcnkoJyNyZXN1bHRzLWVtcHR5JykuaHRtbCgnPGg1IGNsYXNzPVwiYWxlcnQgYWxlcnQtZGFuZ2VyXCI+JyArIHN0b3JlbG9jYXRvcl9sYW5nLm5vX3N0b3JlX3Byb2R1Y3QgKyAnIDxpPlwiJyArIHF1ZXJ5X3NlYXJjaCArICdcIjwvaT48L2g1PicpO1xuICAgICAgICAgICAgICAgICAgICBzZXRNYXBPbkFsbChudWxsKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGpRdWVyeShcIiNyZXN1bHRzLXNsdFwiKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgdmFyIHRodW0gPSAnJztcbiAgICAgICAgICAgICAgICBpZiAobWFya2VyTm9kZXMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgICAgICBqUXVlcnkoXCIjc3RvcmVpZnktdGV4dC1yZXN1bHRcIikudGV4dChqUXVlcnkoXCIjc3RvcmVpZnktdGV4dC1yZXN1bHRcIikuZGF0YSgncmVzdWx0cycpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBqUXVlcnkoXCIjc3RvcmVpZnktdGV4dC1yZXN1bHRcIikudGV4dChqUXVlcnkoXCIjc3RvcmVpZnktdGV4dC1yZXN1bHRcIikuZGF0YSgncmVzdWx0JykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZihpZnlfbGF5b3V0ICE9IDgpIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibnVtLXJzXCIpLmlubmVySFRNTCA9IG1hcmtlck5vZGVzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAvL2pRdWVyeShcIiNyZXN1bHRzLXNsdCBoMy50aXRsZVwiKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgalF1ZXJ5KFwiI21haW4tc2xpZGVyLXN0b3JlbG9jYXRvclwiKS5yZW1vdmVDbGFzcygnc3RvcmVpZnktZmlyc3QtYWxlcnQnKTtcbiAgICAgICAgICAgICAgICB2YXIgaHRtbF9saXN0ID0gJyc7XG4gICAgICAgICAgICAgICAgdmFyIG1hcmtlcl9maXJzdDtcbiAgICAgICAgICAgICAgICB2YXIgbWFya2VyX2NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdtYXJrZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCBtYXJrZXJOb2Rlc1tpXVsndGFncyddICk7XG4gICAgICAgICAgICAgICAgICAgIG1hcmtlciA9IGdtYXJrZXJzW2ldO1xuICAgICAgICAgICAgICAgICAgICB2YXIgaWQgPSBtYXJrZXIuaWQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtYXJrZXJOb2Rlcy5pbmNsdWRlcyhpZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRodW0gPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBtYXJrZXIudGh1bSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHVtID0gbWFya2VyLnRodW07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmFtZSA9IG1hcmtlci5uYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHVybCA9IG1hcmtlci51cmw7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYWRkcmVzcyA9IG1hcmtlci5hZGRyZXNzO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBob25lID0gbWFya2VyLnBob25lO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVtYWlsID0gbWFya2VyLmVtYWlsO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHdlYiA9IG1hcmtlci53ZWI7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGFncyA9IG1hcmtlci50YWdzO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNvY2lhbCA9IG1hcmtlci5zb2NpYWw7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbnVtID0gbWFya2VyLm51bTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0cmFucyA9IG1hcmtlci50cmFucyAhPT0gdW5kZWZpbmVkID8gbWFya2VyLnRyYW5zIDogW107XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXIuc2V0VmlzaWJsZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlcl9maXJzdCA9IG1hcmtlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlcl9jb3VudCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgYm91bmRzLmV4dGVuZChtYXJrZXIuZ2V0UG9zaXRpb24oKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihpZnlfbGF5b3V0ICE9IDgpXG4gICAgICAgICAgICAgICAgICAgICAgICBodG1sX2xpc3QgKz0gY3JlYXRlX2h0bWxfbGlzdChtYXJrZXJbaV0sIFtpXSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBodG1sX2xpc3QgKz0gbGlzdEl0ZW0oc29jaWFsLCB0aHVtLCBpZCwgbmFtZSwgdXJsLCBhZGRyZXNzLCBwaG9uZSwgZW1haWwsIHdlYiwgbnVsbCwgdGFncywgbnVtLCBudWxsLCB0cmFucyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXIuc2V0VmlzaWJsZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBtYXAuZml0Qm91bmRzKGJvdW5kcyk7XG4gICAgICAgICAgICAgICAgdmFyIHpvb20gPSBtYXAuZ2V0Wm9vbSgpO1xuICAgICAgICAgICAgICAgIHpvb20gPSBNYXRoLm1pbih6b29tLCAxMik7XG4gICAgICAgICAgICAgICAgaWYobWFya2VyX2NvdW50ID09IDEpe1xuICAgICAgICAgICAgICAgICAgICBtYXAuc2V0Q2VudGVyKG1hcmtlcl9maXJzdC5nZXRQb3NpdGlvbigpKTtcbiAgICAgICAgICAgICAgICAgICAgbWFwLnNldFpvb20oc2VhcmNoX3Jlc3VsdF96b29tKTtcbiAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgbWFwLnNldFpvb20oem9vbSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGpRdWVyeShcIi5tYXAtdGFiLW1vYmlsZS1ibnQtaXRlbVwiKS5hdHRyKFwiZGF0YS16b29tXCIsIHpvb20pO1xuICAgICAgICAgICAgICAgIGpRdWVyeSgnIycgKyByYW5kb21JRCkuaHRtbChodG1sX2xpc3QpO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZGluZ19tYXNrX2xvYWRlclwiKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXG4gICAgICAgICAgICB9KS5mYWlsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIC8vIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy8nO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZGluZ19tYXNrX2xvYWRlclwiKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgIGpRdWVyeShcIiNyZXN1bHRzLXNsdFwiKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgalF1ZXJ5KCcjcmVzdWx0cy1lbXB0eScpLmh0bWwoJzxoNSBjbGFzcz1cImFsZXJ0IGFsZXJ0LWRhbmdlclwiPiBBbiBlcnJvciBvY2N1cnJlZC4gUGxlYXNlIHRyeSBhZ2Fpbi4gPC9pPjwvaDU+Jyk7XG4gICAgICAgICAgICAgICAgc2V0TWFwT25BbGwobnVsbCk7XG4gICAgICAgICAgICAgXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIH0gICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBvbk1vdXNlb3ZlcihtYXJrZXJOdW0pIHtcbiAgICAgICAgICAgIHZhciBjdXJyZW50SWNvbiA9IGdtYXJrZXJzW21hcmtlck51bV07XG4gICAgICAgICAgICBjdXJyZW50SWNvbi5zZXRBbmltYXRpb24obnVsbCk7XG5cbiAgICAgICAgICAgIGlmIChjdXJyZW50SWNvbi5nZXRBbmltYXRpb24oKSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudEljb24uc2V0QW5pbWF0aW9uKG51bGwpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50SWNvbi5zZXRBbmltYXRpb24oZ29vZ2xlLm1hcHMuQW5pbWF0aW9uLkJPVU5DRSk7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudEljb24uc2V0QW5pbWF0aW9uKG51bGwpO1xuICAgICAgICAgICAgICAgIH0sIDUwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBvbk1vdXNlb3V0KG1hcmtlck51bSkge1xuICAgICAgICAgICAgZ21hcmtlcnNbbWFya2VyTnVtXS5zZXRBbmltYXRpb24obnVsbCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBsaXN0SXRlbShzb2NpYWwsIHRodW0sIGlkLCBuYW1lLCB1cmwsIGFkZHJlc3MsIHBob25lLCBlbWFpbCwgd2ViLCBkaXN0YW5jZSwgdGFncywgbnVtLCBzZWFyY2ggPSBudWxsLCB0cmFucyA9IFtdLCBsb2NhdGlvbiA9ICcnKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBhdHQgPSAnJztcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZGlzdGFuY2UgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgYXR0ID0gJ2RhdGFtYXJrZXI9XCInICsgbnVtICsgJ1wiJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBvcGVuX25ld190YWIgPSAnJztcbiAgICAgICAgICAgIGlmKHN0b3JlaWZ5X29wZW5fbmV3X3RhYl9pbmRleCA9PSAxKVxuICAgICAgICAgICAgICAgb3Blbl9uZXdfdGFiID0gJ3RhcmdldD1cIl9ibGFua1wiIGFyaWEtbGFiZWw9XCInK3N0b3JlbG9jYXRvcl9sYW5nLm9wZW5fbmV3X3RhYisnXCInO1xuXG4gICAgICAgICAgICB2YXIgaHRtbCA9ICc8ZGl2IGNsYXNzPVwiaXRlbSB0aHVtYm5haWxcIiAnICsgYXR0ICsgJz48ZGl2IGNsYXNzPVwiaW5uZXItaXRlbVwiIGlkPVwic3RvcmVfaWRfJyArIG51bSArICdcIiBkYXRhLXN0b3JlaWZ5LWlkPVwiJyArIGlkICsgJ1wiPic7XG4gICAgICAgICAgICBsZXQgbmFtZVRleHQgPSB0cmFuc1snbmFtZSddICE9PSB1bmRlZmluZWQgJiYgdHJhbnNbJ25hbWUnXSAhPT0gJycgPyB0cmFuc1snbmFtZSddIDogbmFtZTtcbiAgICAgICAgICAgIGlmICh0aHVtKSB7XG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cIml0ZW0tdGh1bWIgaGFzLXRodW1iXCI+PGltZyB0aXRsZT1cIlwiIHNyYz1cIicgKyB0aHVtICsgJ1wiIGFsdD1cIicgKyBuYW1lVGV4dCArICdcIj48L2Rpdj4nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cIml0ZW0tY29udGVudFwiPic7XG4gICAgICAgICAgICBpZihpZnlGaWVsZHNWaXNpYmlsaXR5WydsaXN0J11bMF0gPT0gMSl7XG4gICAgICAgICAgICAgICAgLy8gZWxlbWVudC5pbm5lckhUTUwgKz0gJzxkaXYgY2xhc3M9XCJjbGVhclwiPjwvZGl2Pic7XG4gICAgICAgICAgICAgICAgbGV0IGxpbmtBZGRyZXNzID0gJ2h0dHBzOi8vbWFwcy5nb29nbGUuY29tLz9kYWRkcj0nICsgYWRkcmVzcyArICcmc2FkZHI9JytzZWFyY2g7XG4gICAgICAgICAgICAgICAgbGlua0FkZHJlc3MgPSAnaHJlZj1cIicrbGlua0FkZHJlc3MrJ1wiICcrb3Blbl9uZXdfdGFiO1xuICAgICAgICAgICAgICAgIGlmKHR5cGVvZiBpZnlfbGlua19hZGRyZXNzICE9PSd1bmRlZmluZWQnICYmIGlmeV9saW5rX2FkZHJlc3MgPT09IDApe1xuICAgICAgICAgICAgICAgICAgICBsaW5rQWRkcmVzcyA9ICdocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApXCInO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgYWRkcmVzc1RleHQgPSB0cmFuc1snYWRkcmVzcyddICE9PSB1bmRlZmluZWQgJiYgdHJhbnNbJ2FkZHJlc3MnXSAhPT0gJycgPyB0cmFuc1snYWRkcmVzcyddIDogYWRkcmVzcztcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic3RvcmVpZnktc2wtaXRlbS1yb3cgYWRkcmVzc1wiPjxhICcrIGxpbmtBZGRyZXNzKyc+JyArIGFkZHJlc3NUZXh0ICsgJzwvYT48L2Rpdj4nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRpc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgLy9odG1sICs9ICc8bGFiZWw+JyArIHRyYW5zWyd3ZWInXSArICc6IDwvbGFiZWw+JztcbiAgICAgICAgICAgICAgICB2YXIgcmFkaXVzX3VuaXRfdGV4dCA9ICcgS20nO1xuICAgICAgICAgICAgICAgIGlmIChyYWRpdXNfdW5pdCAhPSAxKVxuICAgICAgICAgICAgICAgICAgICByYWRpdXNfdW5pdF90ZXh0ID0gJyBtaSc7XG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInN0b3JlaWZ5LXNsLWl0ZW0tcm93IGl0ZW0tcm9hZFwiPicrcm9hZF9pY29uKycnO1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gZGlzdGFuY2UudG9GaXhlZCgyKSArIHJhZGl1c191bml0X3RleHQgKyAnPC9kaXY+JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChlbWFpbCAhPSBudWxsICYmIHR5cGVvZiBlbWFpbCAhPSAndW5kZWZpbmVkJyAmJiBlbWFpbCAhPSAnJyAmJiBpZnlGaWVsZHNWaXNpYmlsaXR5WydsaXN0J11bMV0gPT0gMSkge1xuICAgICAgICAgICAgICAgIC8vaHRtbCArPSAnPGxhYmVsPicgKyB0cmFuc1snZW1haWwnXSArICc6IDwvbGFiZWw+JztcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic3RvcmVpZnktc2wtaXRlbS1yb3cgaXRlbS1lbnZlbG9wZVwiPicrZW1haWxfaWNvbisnJztcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8YSBocmVmPVwibWFpbHRvOicgKyBlbWFpbCArICdcIiBjbGFzcz1cInBob25lLWVtYWlsXCI+JyArIGVtYWlsICsgJzwvYT48L2Rpdj4nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBob25lICE9IG51bGwgJiYgdHlwZW9mIHBob25lICE9ICd1bmRlZmluZWQnICYmIHBob25lICE9ICcnICYmIGlmeUZpZWxkc1Zpc2liaWxpdHlbJ2xpc3QnXVsyXSA9PSAxKSB7XG4gICAgICAgICAgICAgICAgLy9odG1sICs9ICc8bGFiZWw+JyArIHRyYW5zWydwaG9uZSddICsgJzogPC9sYWJlbD4nO1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzdG9yZWlmeS1zbC1pdGVtLXJvdyBpdGVtLXBob25lXCI+JytwaG9uZV9pY29uKycnO1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxhIGhyZWY9XCJ0ZWw6JyArIHBob25lICsgJ1wiIGNsYXNzPVwicGhvbmUtbm9cIj4nICsgcGhvbmUgKyAnPC9hPjwvZGl2Pic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAod2ViICE9IG51bGwgJiYgdHlwZW9mIHdlYiAhPSAndW5kZWZpbmVkJyAmJiB3ZWIgIT0gJycgJiYgaWZ5RmllbGRzVmlzaWJpbGl0eVsnbGlzdCddWzNdID09IDEpIHtcbiAgICAgICAgICAgICAgICAvL2h0bWwgKz0gJzxsYWJlbD4nICsgdHJhbnNbJ3dlYiddICsgJzogPC9sYWJlbD4nO1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzdG9yZWlmeS1zbC1pdGVtLXJvdyBpdGVtLWxpbmtcIj4nK3dlYl9pY29uKycnO1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gd2ViICsgJzwvZGl2Pic7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0YWdzLmxlbmd0aCA+IDAgJiYgaWZ5RmllbGRzVmlzaWJpbGl0eVsnbGlzdCddWzRdID09IDEpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGFnX2FyciA9IHRhZ3M7XG4gICAgICAgICAgICAgICAgdmFyIHRhZ19odG1sID0gJyc7XG4gICAgICAgICAgICAgICAgbGV0IHRhZ3NUZXh0ID0gdHJhbnNbJ3RhZ3MnXSAhPT0gdW5kZWZpbmVkICYmIEFycmF5LmlzQXJyYXkodHJhbnNbJ3RhZ3MnXSkgJiYgdHJhbnNbJ3RhZ3MnXS5sZW5ndGggPiAwID8gdHJhbnNbJ3RhZ3MnXSA6IHRhZ19hcnI7XG5cbiAgICAgICAgICAgICAgICBqUXVlcnkuZWFjaCh0YWdfYXJyLCBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB0YWdUZXh0ID0gdGFnc1RleHRba2V5XSAhPT0gdW5kZWZpbmVkICYmIHRhZ3NUZXh0W2tleV0gIT09ICcnID8gdGFnc1RleHRba2V5XSA6IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB0YWdfaHRtbCArPSAnPHNwYW4gY2xhc3M9XCJ0YWctaXRlbSB0YWctaXRlbS0nK3N0cmluZ190b19zbHVnKHZhbHVlKSsnXCI+PGkgY2xhc3M9XCJmYSBmYS1jaGVja1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT4gJyArIHRhZ1RleHQgKyAnPC9zcGFuPic7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cInRhZy1pdGVtc1wiPicgKyB0YWdfaHRtbCArICc8L2Rpdj4nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGVtYWlsICE9IG51bGwgJiYgdHlwZW9mIGVtYWlsICE9ICd1bmRlZmluZWQnICYmIGVtYWlsICE9ICcnICYmIGlmeUZpZWxkc1Zpc2liaWxpdHlbJ2xpc3QnXVs2XSAhPSB1bmRlZmluZWQgJiYgaWZ5RmllbGRzVmlzaWJpbGl0eVsnbGlzdCddWzZdID09IDEgJiYgZGF0YUFwcHMuc2hvd19jb250YWN0X3VzID09IDEpIHtcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwic3RvcmVpZnktc2wtaXRlbS1yb3cgaXRlbS1saW5rIGlmeS1pdGVtLWJ0bi1jb250YWN0XCIgPjxzcGFuIGRhdGEtZW1haWw9XCInICsgZW1haWwgKyAnXCIgZGF0YS1zdG9yZT1cIicgKyBpZCArICdcIj4nICsgc3RvcmVsb2NhdG9yX2xhbmcuY29udGFjdF9zdG9yZSArICc8L3NwYW4+PC9kaXY+JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzb2NpYWwgIT0gbnVsbCAmJiB0eXBlb2Ygc29jaWFsICE9ICd1bmRlZmluZWQnICYmIHNvY2lhbCAhPSAnJyAmJiBpZnlGaWVsZHNWaXNpYmlsaXR5WydsaXN0J11bNV0gPT0gMSkge1xuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzdG9yZWlmeS1zdG9yZWxvY2F0b3Itc29jaWFsLW1ha2VyXCI+JyArIHNvY2lhbCArICc8L2Rpdj4nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoaWZ5X3Nob3dfYmxvY2tfY2FydCA9PT0gMSlcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImlmeS1zZWxlY3QtcHJvdmlkZXJcIiBkYXRhLWlkPVwiJytpZCsnXCI+ICcrc3RvcmVsb2NhdG9yX2xhbmcuaWZ5X3NlbGVjdF9wcm92aWRlcisnIDwvYnV0dG9uPic7XG4gICAgICAgICAgICAvL1wibGlua19kZXRhaWxcIlxuICAgICAgICAgICAgaWYgKHVybCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPGEgY2xhc3M9XCJsaW5rZGV0YWlsc3RvcmVcIiBocmVmPVwiJyArIHVybCArICdcIj4nICsgc3RvcmVsb2NhdG9yX2xhbmcubGlua19kZXRhaWwgKyAnPC9hPic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBodG1sICs9ICc8YSBjbGFzcz1cImdldGRpcmVjdGlvbnN0b3JlXCIgaHJlZj1cImh0dHBzOi8vbWFwcy5nb29nbGUuY29tLz9kYWRkcj0nICsgYWRkcmVzcyArICcmc2FkZHI9JytzZWFyY2grJ1wiICcrb3Blbl9uZXdfdGFiKyc+JyArIHN0b3JlbG9jYXRvcl9sYW5nLmRpcmVjdGlvbnMgKyAnPC9hPjwvZGl2PjwvZGl2Pic7XG4gICAgICAgICAgICBodG1sICs9ICc8L2Rpdj48L2Rpdj4nO1xuICAgICAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBsb2FkR2VvbG9jYXRpb24oKSB7XG5cbiAgICAgICAgICAgIGlmIChuYXZpZ2F0b3IuZ2VvbG9jYXRpb24pIHtcbiAgICAgICAgICAgICAgICBuYXZpZ2F0b3IuZ2VvbG9jYXRpb24uZ2V0Q3VycmVudFBvc2l0aW9uKGZ1bmN0aW9uKHBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBnZW9jb2RlciA9IG5ldyBnb29nbGUubWFwcy5HZW9jb2RlcigpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbGF0bG5nID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhwb3NpdGlvbi5jb29yZHMubGF0aXR1ZGUsIHBvc2l0aW9uLmNvb3Jkcy5sb25naXR1ZGUpO1xuICAgICAgICAgICAgICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdsYXRMbmcnOiBsYXRsbmdcbiAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24ocmVzdWx0cywgc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzID09IGdvb2dsZS5tYXBzLkdlb2NvZGVyU3RhdHVzLk9LKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdHNbMV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FkZHJlc3MnKS52YWx1ZSA9IHJlc3VsdHNbMV0uZm9ybWF0dGVkX2FkZHJlc3M7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9hbGVydCh0cmFuc1snbm9fcmVzdWx0J10pOyAvL1wibm9fcmVzdWx0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgalF1ZXJ5KCcjcmVzdWx0cy1lbXB0eScpLmh0bWwoJzxoNSBjbGFzcz1cImFsZXJ0IGFsZXJ0LWRhbmdlclwiPicgKyBzdG9yZWxvY2F0b3JfbGFuZy5ub19yZXN1bHQgKyAnPC9oNT4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vYWxlcnQodHJhbnNbJ2dlb2NvZGVyX2ZhaWxlZCddICsgc3RhdHVzKTsgLy9cImdlb2NvZGVyX2ZhaWxlZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgalF1ZXJ5KCcjcmVzdWx0cy1lbXB0eScpLmh0bWwoJzxoNSBjbGFzcz1cImFsZXJ0IGFsZXJ0LWRhbmdlclwiPicgKyBzdG9yZWxvY2F0b3JfbGFuZy5nZW9jb2Rlcl9mYWlsZWQgKyAnPC9oNT4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGF0aXR1ZGVcIikudmFsdWUgPSBwb3NpdGlvbi5jb29yZHMubGF0aXR1ZGU7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvbmdpdHVkZVwiKS52YWx1ZSA9IHBvc2l0aW9uLmNvb3Jkcy5sb25naXR1ZGU7XG5cbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcyksIGZ1bmN0aW9uKGVycm9yKSB7fS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIGxvYWRHZW9sb2NhdGlvbkluaXQoKSB7XG5cbiAgICAgICAgICAgIGlmIChuYXZpZ2F0b3IuZ2VvbG9jYXRpb24pIHtcbiAgICAgICAgICAgICAgICBuYXZpZ2F0b3IuZ2VvbG9jYXRpb24uZ2V0Q3VycmVudFBvc2l0aW9uKGZ1bmN0aW9uKHBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBnZW9jb2RlciA9IG5ldyBnb29nbGUubWFwcy5HZW9jb2RlcigpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbGF0bG5nID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhwb3NpdGlvbi5jb29yZHMubGF0aXR1ZGUsIHBvc2l0aW9uLmNvb3Jkcy5sb25naXR1ZGUpO1xuICAgICAgICAgICAgICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdsYXRMbmcnOiBsYXRsbmdcbiAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24ocmVzdWx0cywgc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzID09IGdvb2dsZS5tYXBzLkdlb2NvZGVyU3RhdHVzLk9LKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdHNbMV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FkZHJlc3MnKS52YWx1ZSA9IHJlc3VsdHNbMV0uZm9ybWF0dGVkX2FkZHJlc3M7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGpRdWVyeSgnI3N1Ym1pdC1zZWFyY2gnKS50cmlnZ2VyKCBcImNsaWNrXCIgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2FsZXJ0KHRyYW5zWydub19yZXN1bHQnXSk7IC8vXCJub19yZXN1bHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBqUXVlcnkoJyNyZXN1bHRzLWVtcHR5JykuaHRtbCgnPGg1IGNsYXNzPVwiYWxlcnQgYWxlcnQtZGFuZ2VyXCI+JyArIHN0b3JlbG9jYXRvcl9sYW5nLm5vX3Jlc3VsdCArICc8L2g1PicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9hbGVydCh0cmFuc1snZ2VvY29kZXJfZmFpbGVkJ10gKyBzdGF0dXMpOyAvL1wiZ2VvY29kZXJfZmFpbGVkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqUXVlcnkoJyNyZXN1bHRzLWVtcHR5JykuaHRtbCgnPGg1IGNsYXNzPVwiYWxlcnQgYWxlcnQtZGFuZ2VyXCI+JyArIHN0b3JlbG9jYXRvcl9sYW5nLmdlb2NvZGVyX2ZhaWxlZCArICc8L2g1PicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsYXRpdHVkZVwiKS52YWx1ZSA9IHBvc2l0aW9uLmNvb3Jkcy5sYXRpdHVkZTtcblxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9uZ2l0dWRlXCIpLnZhbHVlID0gcG9zaXRpb24uY29vcmRzLmxvbmdpdHVkZTtcblxuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgZnVuY3Rpb24oZXJyb3IpIHt9LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBsb2FkR2VvbG9jYXRpb25Db3VudHJ5KCkge1xuICAgICAgICAgICAgbmF2aWdhdG9yLmdlb2xvY2F0aW9uLmdldEN1cnJlbnRQb3NpdGlvbihmdW5jdGlvbihwb3NpdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciBnZW9jb2RlciA9IG5ldyBnb29nbGUubWFwcy5HZW9jb2RlcigpO1xuICAgICAgICAgICAgICAgIHZhciBsYXRsbmcgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKHBvc2l0aW9uLmNvb3Jkcy5sYXRpdHVkZSwgcG9zaXRpb24uY29vcmRzLmxvbmdpdHVkZSk7XG4gICAgICAgICAgICAgICAgZ2VvY29kZXIuZ2VvY29kZSh7XG4gICAgICAgICAgICAgICAgICAgICdsYXRMbmcnOiBsYXRsbmdcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihyZXN1bHRzLCBzdGF0dXMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXR1cyA9PSBnb29nbGUubWFwcy5HZW9jb2RlclN0YXR1cy5PSykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdHNbMF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbG9jID0gZ2V0Q291bnRyeShyZXN1bHRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hMb2NhdGlvbihsb2MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHNlYXJjaExvY2F0aW9uKG51bGwpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZ2V0Q291bnRyeShyZXN1bHRzKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlc3VsdHNbMF0uYWRkcmVzc19jb21wb25lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHNob3J0bmFtZSA9IHJlc3VsdHNbMF0uYWRkcmVzc19jb21wb25lbnRzW2ldLnNob3J0X25hbWU7XG4gICAgICAgICAgICAgICAgdmFyIGxvbmduYW1lID0gcmVzdWx0c1swXS5hZGRyZXNzX2NvbXBvbmVudHNbaV0ubG9uZ19uYW1lO1xuICAgICAgICAgICAgICAgIHZhciB0eXBlID0gcmVzdWx0c1swXS5hZGRyZXNzX2NvbXBvbmVudHNbaV0udHlwZXM7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGUuaW5kZXhPZihcImNvdW50cnlcIikgIT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc051bGxPcldoaXRlc3BhY2Uoc2hvcnRuYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNob3J0bmFtZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBsb25nbmFtZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuXG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBpc051bGxPcldoaXRlc3BhY2UodGV4dCkge1xuICAgICAgICAgICAgaWYgKHRleHQgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRleHQucmVwbGFjZSgvXFxzL2dpLCAnJykubGVuZ3RoIDwgMTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHNlYXJjaExvY2F0aW9uKGN1cnJlbnRDb3VudHJ5ID0gbnVsbCkge1xuXG4gICAgICAgICAgICBjbGVhclNlYXJjaE1hcmtlcigpO1xuICAgICAgICAgICAgaWYoaW5mb3dpbmRvdykgaW5mb3dpbmRvdy5jbG9zZSgpO1xuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkaW5nX21hc2tfbG9hZGVyXCIpLnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICAgICAgICAgIGpRdWVyeSgnLmNvbnRlbnQtcmVzdWx0cy1zbHQnKS5yZW1vdmVDbGFzcygnY29udGVudC1yZXN1bHRzLWZpcnN0Jyk7XG4gICAgICAgICAgICB2YXIgYWRkcmVzcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWRkcmVzc1wiKS52YWx1ZTtcbiAgICAgICAgICAgIHZhciByYWRpdXNfc2VhcmNoID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyYWRpdXNfc2VhcmNoXCIpLnZhbHVlO1xuXG4gICAgICAgICAgICB2YXIgY2hlY2tib3hlcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlOYW1lKCdzdG9yZXNfdGFnc19maWx0ZXJbXScpO1xuICAgICAgICAgICAgdmFyIHZhbHMgPSBcIlwiO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIG4gPSBjaGVja2JveGVzLmxlbmd0aDsgaSA8IG47IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChjaGVja2JveGVzW2ldLmNoZWNrZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFscyArPSBcIixcIiArIGNoZWNrYm94ZXNbaV0udmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKChhZGRyZXNzID09ICcnIHx8IGFkZHJlc3MgPT0gbnVsbCkgJiYgdmFscyA9PSBcIlwiKSB7XG4gICAgICAgICAgICAgICAgLy9hbGVydCh0cmFuc1sncGxlYXNlX2VudGVyJ10pO1xuICAgICAgICAgICAgICAgIGpRdWVyeSgnI2FkZHJlc3MnKS5mb2N1cygpO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZGluZ19tYXNrX2xvYWRlclwiKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgocmFkaXVzX3NlYXJjaCA9PSAnJyB8fCByYWRpdXNfc2VhcmNoID09IG51bGwpICYmIHZhbHMgPT0gXCJcIikge1xuICAgICAgICAgICAgICAgIC8vYWxlcnQoJ1BsZWFzZSBlbnRlciBhIHJhZGl1cy4nKTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvYWRpbmdfbWFza19sb2FkZXJcIikuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZm9jdXNfY291bnRyeSA9IHtcbiAgICAgICAgICAgICAgICBhZGRyZXNzOiBhZGRyZXNzXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRDb3VudHJ5ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBmb2N1c19jb3VudHJ5ID0ge1xuICAgICAgICAgICAgICAgICAgICBhZGRyZXNzOiBhZGRyZXNzLFxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRSZXN0cmljdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50cnk6IGN1cnJlbnRDb3VudHJ5LFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwcmlvcml0eV9zZWFyY2ggIT0gJ2dsb2JhbCcpIHtcbiAgICAgICAgICAgICAgICBmb2N1c19jb3VudHJ5ID0ge1xuICAgICAgICAgICAgICAgICAgICBhZGRyZXNzOiBhZGRyZXNzLFxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRSZXN0cmljdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50cnk6IHByaW9yaXR5X3NlYXJjaCxcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBnZW9jb2RlciA9IG5ldyBnb29nbGUubWFwcy5HZW9jb2RlcigpO1xuXG5cbiAgICAgICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoZm9jdXNfY291bnRyeSwgZnVuY3Rpb24ocmVzdWx0cywgc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXR1cyA9PSBnb29nbGUubWFwcy5HZW9jb2RlclN0YXR1cy5PSykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbGF0bG5nID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhyZXN1bHRzWzBdLmdlb21ldHJ5LmxvY2F0aW9uLmxhdCgpLCByZXN1bHRzWzBdLmdlb21ldHJ5LmxvY2F0aW9uLmxuZygpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1hcmtlcl9zZWFyY2gpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlcl9zZWFyY2guc2V0TWFwKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBtYXJrZXJfc2VhcmNoID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXA6IG1hcCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBsYXRsbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiB3aW5kb3cudGhlbWVBc3NldHMuZGVmYXVsdF9tYXJrZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NhbGVkU2l6ZTogbmV3IGdvb2dsZS5tYXBzLlNpemUoMzAsIDQzKVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciByYWRpdXNWYWx1ZSA9IHBhcnNlRmxvYXQocmFkaXVzX3NlYXJjaCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNOYU4ocmFkaXVzVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWV0ZXJUb1VuaXQgPSAocmFkaXVzX3VuaXQgPT0gMSkgPyAwLjAwMSA6IDAuMDAwNjIxMzc7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWV0ZXJUb1VuaXQgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJhZGl1c0luTWV0ZXJzID0gcmFkaXVzVmFsdWUgLyBtZXRlclRvVW5pdDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VhcmNoX3JhZGl1c19jaXJjbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoX3JhZGl1c19jaXJjbGUuc2V0TWFwKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hfcmFkaXVzX2NpcmNsZSA9IG5ldyBnb29nbGUubWFwcy5DaXJjbGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXA6IG1hcCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2VudGVyOiBsYXRsbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJhZGl1czogcmFkaXVzSW5NZXRlcnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0cm9rZUNvbG9yOiAnI2YyYmYwMCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0cm9rZU9wYWNpdHk6IDAuMzUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0cm9rZVdlaWdodDogMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsbENvbG9yOiAnI2YyYmYwMCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGxPcGFjaXR5OiAwLjA4LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGlja2FibGU6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZ29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIobWFya2VyX3NlYXJjaCwgJ2NsaWNrJywgZnVuY3Rpb24oZXZ0KSB7IC8vIHRoZSBjbGljayBldmVudCBmdW5jdGlvbiBpcyBjYWxsZWQgd2l0aCB0aGUgXCJldmVudFwiIGFzIGFuIGFyZ3VtZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAvL3Nob3dJbmZvV2luZG93KGV2dCwgdGhpcywgbWFwLCBpbmZvd2luZG93LCBhZGRyZXNzKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXJzLnB1c2gobWFya2VyKTtcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoTG9jYXRpb25zTmVhcihyZXN1bHRzWzBdLCBtYXAsIGJvdW5kcywgZ21hcmtlcnMsYWRkcmVzcylcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgc2VhcmNoTG9jYXRpb25zTmVhcihyZXN1bHRzWzBdLmdlb21ldHJ5LmxvY2F0aW9uKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudENvdW50cnkgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkaW5nX21hc2tfbG9hZGVyXCIpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgICAgICAgICBqUXVlcnkoJyNyZXN1bHRzLWVtcHR5JykuaHRtbCgnPGg1IGNsYXNzPVwiYWxlcnQgYWxlcnQtZGFuZ2VyXCI+PGk+JyArIGFkZHJlc3MgKyAnPC9pPicgKyBzdG9yZWxvY2F0b3JfbGFuZy5hZGRyZXNzX251bGwgKyAnPC9oNT4nKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaExvY2F0aW9uKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGZpbmRieVRhZ3MoKSB7XG5cbiAgICAgICAgICAgICAgICBjbGVhclNlYXJjaE1hcmtlcigpO1xuICAgICAgICAgICAgICAgIGlmKGluZm93aW5kb3cpIGluZm93aW5kb3cuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICBib3VuZHMgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nQm91bmRzKCk7XG4gICAgICAgICAgICAgICAgdmFyIHRhZ3NfY2hlY2sgPSBbXTtcbiAgICAgICAgICAgICAgICBqUXVlcnkuZWFjaChqUXVlcnkoJ2lucHV0LnN0b3JlaWZ5YXBwX3N0b3Jlc190YWdzX2ZpbHRlcjpjaGVja2VkJyksIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB0YWdzX2NoZWNrLnB1c2goalF1ZXJ5KHRoaXMpLnZhbCgpKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB2YXIgZmlsdGVyX2NvdW50cnkgPSAnYWxsJyxmaWx0ZXJfcmVnaW9uID0gJ2lmeV9hbGwnLGZpbHRlcl9jaXR5ID0gJ2lmeV9hbGwnO1xuICAgICAgICAgICAgICAgIGlmIChqUXVlcnkoJ2lucHV0LnN0b3JlaWZ5YXBwX3N0b3Jlc19jb3VudHJ5X2ZpbHRlcicpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJfY291bnRyeSA9IGpRdWVyeSgnaW5wdXQuc3RvcmVpZnlhcHBfc3RvcmVzX2NvdW50cnlfZmlsdGVyOmNoZWNrZWQnKS52YWwoKTsgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChqUXVlcnkoJ2lucHV0LnN0b3JlaWZ5YXBwX3N0b3Jlc19yZWdpb25fZmlsdGVyJykubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbHRlcl9yZWdpb24gPSBqUXVlcnkoJ2lucHV0LnN0b3JlaWZ5YXBwX3N0b3Jlc19yZWdpb25fZmlsdGVyOmNoZWNrZWQnKS52YWwoKTsgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChqUXVlcnkoJ2lucHV0LnN0b3JlaWZ5YXBwX3N0b3Jlc19jaXR5X2ZpbHRlcicpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJfY2l0eSA9IGpRdWVyeSgnaW5wdXQuc3RvcmVpZnlhcHBfc3RvcmVzX2NpdHlfZmlsdGVyOmNoZWNrZWQnKS52YWwoKTsgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmKGpRdWVyeSgnLnN0b3JlaWZ5YXBwX3N0b3Jlc19jb3VudHJ5c19maWx0ZXJfbGlzdCcpLmRhdGEoJ3RhZycpID09ICdzZWxlY3QnKXtcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyX2NvdW50cnkgPSBqUXVlcnkoJ3NlbGVjdC5zdG9yZWlmeWFwcF9zdG9yZXNfY291bnRyeV9maWx0ZXInKS52YWwoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYoalF1ZXJ5KCcuc3RvcmVpZnlhcHBfc3RvcmVzX3JlZ2lvbl9maWx0ZXJfbGlzdCcpLmRhdGEoJ3RhZycpID09ICdzZWxlY3QnKXtcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyX3JlZ2lvbiA9IGpRdWVyeSgnc2VsZWN0LnN0b3JlaWZ5YXBwX3N0b3Jlc19yZWdpb25fZmlsdGVyJykudmFsKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmKGpRdWVyeSgnLnN0b3JlaWZ5YXBwX3N0b3Jlc19jaXR5X2ZpbHRlcl9saXN0JykuZGF0YSgndGFnJykgPT0gJ3NlbGVjdCcpe1xuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJfY2l0eSA9IGpRdWVyeSgnc2VsZWN0LnN0b3JlaWZ5YXBwX3N0b3Jlc19jaXR5X2ZpbHRlcicpLnZhbCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZihmaWx0ZXJfcmVnaW9uID09ICd1bm5hbWVkX3JlZ2lvbicpIGZpbHRlcl9yZWdpb24gPSAnJztcbiAgICAgICAgICAgICAgICBpZihmaWx0ZXJfY2l0eSA9PSAndW5uYW1lZF9jaXR5JykgZmlsdGVyX2NpdHkgPSAnJztcblxuICAgICAgICAgICAgICAgIHZhciBjaGVja19jb3VudHJ5ID0gMDtcbiAgICAgICAgICAgICAgICB2YXIgbWFya2VyX2ZpcnN0O1xuICAgICAgICAgICAgICAgIHZhciBtYXJrZXJfY291bnQgPSAwO1xuICAgICAgICAgICAgICAgIHZhciBhcnJheV9wb2luID0gW107XG4gICAgICAgICAgICAgICAgdmFyIGh0bWxfbGlzdCA9ICcnO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ21hcmtlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coIG1hcmtlck5vZGVzW2ldWyd0YWdzJ10gKTtcbiAgICAgICAgICAgICAgICAgICAgbWFya2VyID0gZ21hcmtlcnNbaV07XG4gICAgICAgICAgICAgICAgICAgIGNoZWNrX2NvdW50cnkgPSAwO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICggKGZpbHRlcl9jb3VudHJ5ID09ICdhbGwnIHx8IGZpbHRlcl9jb3VudHJ5ID09IG1hcmtlci5jb3VudHJ5KSAmJiAoZmlsdGVyX3JlZ2lvbiA9PSAnaWZ5X2FsbCcgfHwgZmlsdGVyX3JlZ2lvbiA9PSBtYXJrZXIucmVnaW9uKSAmJiAoZmlsdGVyX2NpdHkgPT0gJ2lmeV9hbGwnIHx8IGZpbHRlcl9jaXR5ID09IG1hcmtlci5jaXR5KSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrX2NvdW50cnkgPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGVja1RhZyh0YWdzX2NoZWNrLCBtYXJrZXIudGFncykgJiYgY2hlY2tfY291bnRyeSA9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHVtID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgbWFya2VyLnRodW0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGh1bSA9IG1hcmtlci50aHVtO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGlkID0gbWFya2VyLmlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5hbWUgPSBtYXJrZXIubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB1cmwgPSBtYXJrZXIudXJsO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFkZHJlc3MgPSBtYXJrZXIuYWRkcmVzcztcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwaG9uZSA9IG1hcmtlci5waG9uZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlbWFpbCA9IG1hcmtlci5lbWFpbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB3ZWIgPSBtYXJrZXIud2ViO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRhZ3MgPSBtYXJrZXIudGFncztcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzb2NpYWwgPSBtYXJrZXIuc29jaWFsO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG51bSA9IG1hcmtlci5udW07XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdHJhbnMgPSBtYXJrZXIudHJhbnMgIT09IHVuZGVmaW5lZCA/IG1hcmtlci50cmFucyA6IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgYm91bmRzLmV4dGVuZChtYXJrZXIuZ2V0UG9zaXRpb24oKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXIuc2V0VmlzaWJsZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlcl9maXJzdCA9IG1hcmtlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlcl9jb3VudCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoaWZ5X2xheW91dCAhPSA4KVxuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbF9saXN0ICs9IGNyZWF0ZV9odG1sX2xpc3QobWFya2VyW2ldLCBbaV0sIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9odG1sX2xpc3QgKz0gbGlzdEl0ZW0oc29jaWFsLCB0aHVtLCBpZCwgbmFtZSwgdXJsLCBhZGRyZXNzLCBwaG9uZSwgZW1haWwsIHdlYiwgbnVsbCwgdGFncywgbnVtLCBudWxsLCB0cmFucyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXIuc2V0VmlzaWJsZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbWFwLmZpdEJvdW5kcyhib3VuZHMpO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZGluZ19tYXNrX2xvYWRlclwiKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgIGlmKGlmeV9sYXlvdXQgIT0gOCkgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJudW0tcnNcIikuaW5uZXJIVE1MID0gbWFya2VyX2NvdW50O1xuICAgICAgICAgICAgICAgIC8valF1ZXJ5KFwiI3Jlc3VsdHMtc2x0IGgzLnRpdGxlXCIpLnNob3coKTtcbiAgICAgICAgICAgICAgICBqUXVlcnkoXCIjbWFpbi1zbGlkZXItc3RvcmVsb2NhdG9yXCIpLnJlbW92ZUNsYXNzKCdzdG9yZWlmeS1maXJzdC1hbGVydCcpO1xuICAgICAgICAgICAgICAgIGlmIChtYXJrZXJfY291bnQgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKG1hcmtlcl9jb3VudCA9PSAxKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5zZXRDZW50ZXIobWFya2VyX2ZpcnN0LmdldFBvc2l0aW9uKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLnNldFpvb20oc2VhcmNoX3Jlc3VsdF96b29tKTtcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgem9vbSA9IG1hcC5nZXRab29tKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB6b29tID0gTWF0aC5taW4oem9vbSwgMTIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLnNldFpvb20oem9vbSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgalF1ZXJ5KFwiI3N0b3JlaWZ5LXRleHQtcmVzdWx0XCIpLnRleHQoalF1ZXJ5KFwiI3N0b3JlaWZ5LXRleHQtcmVzdWx0XCIpLmRhdGEoJ3Jlc3VsdHMnKSk7XG4gICAgICAgICAgICAgICAgICAgIGpRdWVyeSgnIycgKyByYW5kb21JRCkuaHRtbChodG1sX2xpc3QpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobWFya2VyX2NvdW50ID09IDApIHtcblxuICAgICAgICAgICAgICAgICAgICBqUXVlcnkoXCIjcmVzdWx0cy1zbHRcIikuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgYWRkcmVzcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWRkcmVzc1wiKS52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgalF1ZXJ5KFwiI3N0b3JlaWZ5LXRleHQtcmVzdWx0XCIpLnRleHQoalF1ZXJ5KFwiI3N0b3JlaWZ5LXRleHQtcmVzdWx0XCIpLmRhdGEoJ3Jlc3VsdCcpKTtcbiAgICAgICAgICAgICAgICAgICAgalF1ZXJ5KCcjcmVzdWx0cy1lbXB0eScpLmh0bWwoJzxoNSBjbGFzcz1cImFsZXJ0IGFsZXJ0LWRhbmdlclwiPicgKyBzdG9yZWxvY2F0b3JfbGFuZy5zdG9yZV9uZWFyICsgJzxpPlwiJyArIGFkZHJlc3MgKyAnXCI8L2k+PC9oNT4nKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGpRdWVyeSgnI3Jlc3VsdHMtZW1wdHknKS5odG1sKCc8aDU+PC9oNT4nKTtcbiAgICAgICAgICAgICAgICBqUXVlcnkoXCIjcmVzdWx0cy1zbHRcIikuc2hvdygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8tLS0tLS0tLS0vL2VuZCBjb2RlIGhlcmVcbiAgICAgICAgXG4gICAgICAgIC8vIHRhbyBSZWdpb24ga2hpIGNoaSBjbyAxIGNvdW50cnlcbiAgICAgICAgZnVuY3Rpb24gcmVuZGVyRGVmYXVsdFJlZ2lvbigpe1xuICAgICAgICAgICAgbGV0IGN1cnJlbnRDb3VudHJ5ID0gIGpRdWVyeSgnLnN0b3JlaWZ5YXBwX3N0b3Jlc19jb3VudHJ5X2ZpbHRlcicpLnZhbCgpO1xuICAgICAgICAgICAgaWYoalF1ZXJ5KCdzZWxlY3Quc3RvcmVpZnlhcHBfc3RvcmVzX2NvdW50cnlfZmlsdGVyJykubGVuZ3RoKVxuICAgICAgICAgICAgICAgIGN1cnJlbnRDb3VudHJ5ID0gIGpRdWVyeSgnc2VsZWN0LnN0b3JlaWZ5YXBwX3N0b3Jlc19jb3VudHJ5X2ZpbHRlcicpLnZhbCgpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGN1cnJlbnRDb3VudHJ5ID0galF1ZXJ5KCdpbnB1dC5zdG9yZWlmeWFwcF9zdG9yZXNfY291bnRyeV9maWx0ZXI6Y2hlY2tlZCcpLnZhbCgpO1xuICAgICAgICAgICAgaWYoY3VycmVudENvdW50cnkgPT0gJ2FsbCcpIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgbGV0IGFyclZhbHVlUmVnaW9uID0gW107XG4gICAgICAgICAgICBpZihjdXJyZW50Q291bnRyeSAhPT0gJ2FsbCcpe1xuICAgICAgICAgICAgICAgIGpRdWVyeSgnI3N0b3Jlcy1jaXR5LWZpbHRlcicpLmh0bWwoJzxzZWxlY3QgY2xhc3M9XCJzdG9yZWlmeWFwcF9zdG9yZXNfY2l0eV9maWx0ZXIgc3RvcmVpZnlhcHBfc3RvcmVzX2NpdHlfZmlsdGVyX2xpc3RcIiBkYXRhLXRhZyA9IFwic2VsZWN0XCI+PG9wdGlvbiB2YWx1ZT1cImlmeV9hbGxcIj5TZWxlY3QgQ2l0eTwvb3B0aW9uPjwvc2VsZWN0PicpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICBpZih0eXBlb2YgaWZ5QXJyX2NvdW50cnlfcmVnaW9uX2NpdHlbY3VycmVudENvdW50cnldICE9PSd1bmRlZmluZWQnKXtcbiAgICAgICAgICAgICAgICAgICAgYXJyVmFsdWVSZWdpb24gPSBPYmplY3Qua2V5cyhpZnlBcnJfY291bnRyeV9yZWdpb25fY2l0eVtjdXJyZW50Q291bnRyeV0pO1xuICAgICAgICAgICAgICAgICAgICBpZihhcnJWYWx1ZVJlZ2lvbi5sZW5ndGggPT0gMSl7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY3VycmVudFJlZ2lvbiA9ICBhcnJWYWx1ZVJlZ2lvblswXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBhcnJWYWx1ZUNpdHkgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKHR5cGVvZiBpZnlBcnJfY291bnRyeV9yZWdpb25fY2l0eVtjdXJyZW50Q291bnRyeV1bY3VycmVudFJlZ2lvbl0gIT09J3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyclZhbHVlQ2l0eSA9IGlmeUFycl9jb3VudHJ5X3JlZ2lvbl9jaXR5W2N1cnJlbnRDb3VudHJ5XVtjdXJyZW50UmVnaW9uXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckZpbHRlcihhcnJWYWx1ZUNpdHksJ2NpdHknLE51bWJlcihpZnlfbW9kZV9maWx0ZXJjb3VudHJ5KSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVuZGVyRmlsdGVyKGFyclZhbHVlUmVnaW9uLCdyZWdpb24nLE51bWJlcihpZnlfbW9kZV9maWx0ZXJjb3VudHJ5KSk7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBqUXVlcnkoJyNzdG9yZXMtcmVnaW9uLWZpbHRlcicpLmh0bWwoJycpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICBqUXVlcnkoJyNzdG9yZXMtY2l0eS1maWx0ZXInKS5odG1sKCcnKS5oaWRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gc2V0TWFwT25BbGwobWFwKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGdtYXJrZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgIGdtYXJrZXJzW2ldLnNldFZpc2libGUoZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgLy8gd2luZG93Lm9ubG9hZCA9IGluaXRNYXA7XG4gICAgICAgIGZ1bmN0aW9uIGNoZWNrTWFwTG9hZGVkKCkge1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhkYXRhQXBwcy5wZXJtYW5lbnRfZG9tYWluKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZ29vZ2xlID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChjaGVja01hcExvYWRlZCwgNTAwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gZG8gc29tZSB3b3JrIGhlcmVcbiAgICAgICAgICAgICAgICBpbml0TWFwKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBpZnlSZW5kZXJUYWdzKHRhZ3Mpe1xuICAgICAgICAgICAgaWYodGFncyA9PT0gdW5kZWZpbmVkIHx8IE9iamVjdC5rZXlzKHRhZ3MpLmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICBsZXQgaHRtbCA9IGA8ZGl2IGlkPVwic3RvcmVzLXRhZ3MtZmlsdGVyXCI+XG4gICAgICAgICAgICAgICAgPGxhYmVsPiR7c3RvcmVsb2NhdG9yX2xhbmcuZmlsdGVyX3RhZ3N9PC9sYWJlbD5cbiAgICAgICAgICAgICAgICA8dWwgY2xhc3M9XCJzdG9yZWlmeWFwcF9zdG9yZXNfdGFnc19maWx0ZXJfbGlzdFwiPmA7XG4gICAgICAgICAgICAgICAgT2JqZWN0LmtleXModGFncykuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICAgICAgICAgICAgaHRtbCArPSBgPGxpPjxsYWJlbCBjbGFzcz1cImxhYmVsX3N0b3JlaWZ5YXBwX3N0b3Jlc190YWdzX2ZpbHRlclwiIGZvcj1cInN0b3JlaWZ5YXBwX3N0b3Jlc190YWdzX2ZpbHRlcl8ke2tleX1cIj4gPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIG5hbWU9XCJzdG9yZXNfdGFnc19maWx0ZXJbXVwiIGNsYXNzPVwic3RvcmVpZnlhcHBfc3RvcmVzX3RhZ3NfZmlsdGVyXCIgaWQ9XCJzdG9yZWlmeWFwcF9zdG9yZXNfdGFnc19maWx0ZXJfJHtrZXl9XCIgdmFsdWU9XCIke2tleX1cIiAgLz4gPHNwYW4+JHt0YWdzW2tleV19PC9zcGFuPiA8L2xhYmVsPjwvbGk+YDtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaHRtbCArPSBgPC91bD48L2Rpdj5gO1xuICAgICAgICAgICAgcmV0dXJuIGh0bWxcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGlmeVJlbmRlckNvdW50cnlzKGNvdW50cnlBcnIsY291bnRyeU9iail7XG4gICAgICAgICAgICBpZihjb3VudHJ5QXJyID09PSB1bmRlZmluZWQgfHwgY291bnRyeUFyci5sZW5ndGggPT09IDApXG4gICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgbGV0IGh0bWwgPSBgPGRpdiBpZD1cInN0b3Jlcy1jb3VudHJ5LWZpbHRlclwiIGNsYXNzPVwic3RvcmVzLWZpbHRlci1ieVwiPlxuICAgICAgICAgICAgICAgIDxsYWJlbD4ke3N0b3JlbG9jYXRvcl9sYW5nLmZpbHRlcl9jb3VudHJ5fTwvbGFiZWw+YDtcbiAgICAgICAgICAgICAgICBpZihOdW1iZXIoaWZ5X21vZGVfZmlsdGVyY291bnRyeSkgPT09IDEpe1xuICAgICAgICAgICAgICAgICAgICBodG1sICs9IGA8dWwgY2xhc3M9XCJzdG9yZWlmeWFwcF9zdG9yZXNfY291bnRyeXNfZmlsdGVyX2xpc3RcIiBkYXRhLXRhZyA9IFwicmFkaW9cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxsaT48bGFiZWwgY2xhc3M9XCJsYWJlbF9zdG9yZWlmeWFwcF9zdG9yZXNfY291bnRyeV9maWx0ZXJcIiBmb3I9XCJzdG9yZWlmeWFwcF9zdG9yZXNfY291bnRyeV9maWx0ZXJfYWxsXCI+IDxpbnB1dCB0eXBlPVwicmFkaW9cIiBuYW1lPVwic3RvcmVzX2NvdW50cnlfZmlsdGVyXCIgY2xhc3M9XCJzdG9yZWlmeWFwcF9zdG9yZXNfY291bnRyeV9maWx0ZXJcIiBpZD1cInN0b3JlaWZ5YXBwX3N0b3Jlc19jb3VudHJ5X2ZpbHRlcl9hbGxcIiB2YWx1ZT1cImFsbFwiIGNoZWNrZWQ9XCJjaGVja2VkXCIgLz4gPHNwYW4+JHtzdG9yZWxvY2F0b3JfbGFuZy5hbGx9PC9zcGFuPiA8L2xhYmVsPjwvbGk+XG4gICAgICAgICAgICAgICAgICAgIGA7XG4gICAgICAgICAgICAgICAgICAgIGNvdW50cnlBcnIuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGxhYmVsID0gY291bnRyeU9ialtrZXldICE9PSB1bmRlZmluZWQgPyBjb3VudHJ5T2JqW2tleV0gOiBrZXk7XG4gICAgICAgICAgICAgICAgICAgICAgICBodG1sICs9IGA8bGk+PGxhYmVsIGNsYXNzPVwibGFiZWxfc3RvcmVpZnlhcHBfc3RvcmVzX2NvdW50cnlfZmlsdGVyXCIgZm9yPVwic3RvcmVpZnlhcHBfc3RvcmVzX2NvdW50cnlfZmlsdGVyXyR7a2V5fVwiPiA8aW5wdXQgdHlwZT1cInJhZGlvXCIgbmFtZT1cInN0b3Jlc19jb3VudHJ5X2ZpbHRlclwiIGNsYXNzPVwic3RvcmVpZnlhcHBfc3RvcmVzX2NvdW50cnlfZmlsdGVyXCIgaWQ9XCJzdG9yZWlmeWFwcF9zdG9yZXNfY291bnRyeV9maWx0ZXJfJHtrZXl9XCIgdmFsdWU9XCIke2tleX1cIiAgLz4gPHNwYW4+JHtsYWJlbH08L3NwYW4+IDwvbGFiZWw+PC9saT5gO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaHRtbCArPSAnPC91bD4nXG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gYDxzZWxlY3QgbmFtZT1cInN0b3Jlc19jb3VudHJ5X2ZpbHRlclwiIGNsYXNzPVwic3RvcmVpZnlhcHBfc3RvcmVzX2NvdW50cnlfZmlsdGVyIHN0b3JlaWZ5YXBwX3N0b3Jlc19jb3VudHJ5c19maWx0ZXJfbGlzdFwiIGRhdGEtdGFnID0gXCJzZWxlY3RcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJhbGxcIj4gPHNwYW4+JHtzdG9yZWxvY2F0b3JfbGFuZy5hbGx9PC9zcGFuPjwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICBgO1xuICAgICAgICAgICAgICAgICAgICBjb3VudHJ5QXJyLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBsYWJlbCA9IGNvdW50cnlPYmpba2V5XSAhPT0gdW5kZWZpbmVkID8gY291bnRyeU9ialtrZXldIDoga2V5O1xuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbCArPSBgPG9wdGlvbiB2YWx1ZT1cIiR7a2V5fVwiPiA8c3Bhbj4ke2xhYmVsfTwvc3Bhbj48L29wdGlvbj5gO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaHRtbCArPSAnPC9zZWxlY3Q+J1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaHRtbCArPSAnPC9kaXY+JztcbiAgICAgICAgICAgIGlmKE51bWJlcihpZnlfZmlsdGVyX3JlZ2lvbl9jaXR5KSA9PT0gMSlcbiAgICAgICAgICAgICAgICBodG1sICs9ICc8ZGl2IGlkPVwic3RvcmVzLXJlZ2lvbi1maWx0ZXJcIiBjbGFzcz1cInN0b3Jlcy1maWx0ZXItYnlcIj48L2Rpdj4gPGRpdiBpZD1cInN0b3Jlcy1jaXR5LWZpbHRlclwiIGNsYXNzPVwic3RvcmVzLWZpbHRlci1ieVwiPjwvZGl2Pic7XG4gICAgICAgICAgICByZXR1cm4gaHRtbFxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxvYWRUaW1lID0gMztcbiAgICAgICAgdmFyIGxvYWRUaW1lMiA9IDE7XG4gICAgICAgIGlmKGRhdGFBcHBzLnBlcm1hbmVudF9kb21haW4gPT0gJ2F1ZGl0dGVzdGluZy5teXNob3BpZnkuY29tJyB8fCBkYXRhQXBwcy5wZXJtYW5lbnRfZG9tYWluID09ICAnYWwtdGVzdC1teS5teXNob3BpZnkuY29tJyl7XG4gICAgICAgICAgICBsb2FkVGltZSA9IDMwMDA7XG4gICAgICAgICAgICBsb2FkVGltZTIgPSAxMDAwO1xuICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzbF9pZGV4ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0b3JlaWZ5YXBwcy1zdG9yZWxvY2F0b3ItaW5kZXgnKTtcbiAgICAgICAgICAgIGlmIChzbF9pZGV4KSB7XG4gICAgICAgICAgICAgICAgc2xfaWRleC5zdHlsZS5vcGFjaXR5ID0gJzEnO1xuICAgICAgICAgICAgICAgIHNsX2lkZXguc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVkoMCknO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL2pRdWVyeSgnI3NsLXRhYi1saXN0JykudHJpZ2dlcignY2xpY2snKTtcbiAgICAgICAgfSwgbG9hZFRpbWUyKTtcblxuICAgICAgICBqUXVlcnkoIGRvY3VtZW50ICkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgbWFwTG9hZGVkID0gZmFsc2U7XG4gICAgICAgICAgICBjb25zdCBtYXBFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYXBcIik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKG1hcEVsZW1lbnQpe1xuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGxvYWRHb29nbGVNYXBTY3JpcHQoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtYXBMb2FkZWQpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKTtcbiAgICAgICAgICAgICAgICAgICAgc2NyaXB0LnNyYyA9IHdpbmRvdy5hcGlfa2V5O1xuICAgICAgICAgICAgICAgICAgICBzY3JpcHQuZGVmZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZGF0YUFwcHMgIT09ICd1bmRlZmluZWQnICYmIGRhdGFBcHBzLnJlY2FwdGNoYV9lbmFibGVkICE9PSB1bmRlZmluZWQgJiYgZGF0YUFwcHMucmVjYXB0Y2hhX2VuYWJsZWQgIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZWNhcHRjaGFBbHJlYWR5TG9hZGVkID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcignc2NyaXB0W3NyYyo9XCJ3d3cuZ29vZ2xlLmNvbS9yZWNhcHRjaGEvYXBpLmpzXCJdJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXJlY2FwdGNoYUFscmVhZHlMb2FkZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZWNhcHRjaGFTY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY2FwdGNoYVNjcmlwdC5zcmMgPSBcImh0dHBzOi8vd3d3Lmdvb2dsZS5jb20vcmVjYXB0Y2hhL2FwaS5qcz9yZW5kZXI9XCIgKyBkYXRhQXBwcy5yZWNhcHRjaGFfZW5hYmxlZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNhcHRjaGFTY3JpcHQuYXN5bmMgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY2FwdGNoYVNjcmlwdC5kZWZlciA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChyZWNhcHRjaGFTY3JpcHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG1hcExvYWRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIGNvbnN0IGlzTW9iaWxlID0gd2luZG93LmlubmVyV2lkdGggPD0gOTkyO1xuICAgICAgICAgICAgICAgIC8vIGlmIChpc01vYmlsZSl7XG4gICAgICAgICAgICAgICAgLy8gICAgIGNvbnN0IG9uTW9iaWxlU2Nyb2xsID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vICAgICAgICAgY29uc29sZS5sb2coJ1Njcm9sbCBsw6HCusKnbiDDhOKAmMOhwrrCp3UgdHLDg8KqbiBtb2JpbGUhJyk7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAvLyBWw4PCrSBkw6HCu8KlOiBjaMOhwrvigLAgbG9hZCBHb29nbGUgTWFwIHNhdSBsw6HCusKnbiBzY3JvbGwgw4TigJjDocK6wqd1IHRpw4PCqm5cbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIGxvYWRHb29nbGVNYXBTY3JpcHQoKTtcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIGNvbnNvbGUubG9nKCBcIlN0b3JlaWZ5IFNMIGxvYWRlZFwiICk7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICBpZighbWFwICYmIHR5cGVvZiBkYXRhQXBwcy5kZXRhaWwgPT0gJ3VuZGVmaW5lZCcpIGNoZWNrTWFwTG9hZGVkKCk7XG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAvLyBYb8ODwqEgbGlzdGVuZXIgw4TigJjDocK7xpIgdHLDg8KhbmggY2jDocK6wqF5IGzDocK6wqFpXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgb25Nb2JpbGVTY3JvbGwpO1xuICAgICAgICAgICAgICAgIC8vICAgICB9O1xuICAgICAgICAgICAgICAgIC8vICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgb25Nb2JpbGVTY3JvbGwpO1xuICAgICAgICAgICAgICAgIC8vIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghd2luZG93Lm1hcExvYWRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRHb29nbGVNYXBTY3JpcHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubWFwTG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW1hcCAmJiB0eXBlb2YgZGF0YUFwcHMuZGV0YWlsID09ICd1bmRlZmluZWQnKSBjaGVja01hcExvYWRlZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LCBsb2FkVGltZSk7XG5cbiAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAgICAgalF1ZXJ5KGRvY3VtZW50KS5vbihcImNsaWNrXCIsIFwiI3N0b3JlaWZ5LXNsLWJ0bi10cmlnZ2VyLXBvcHVwXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9pZiAoIXdpbmRvdy5tYXBMb2FkZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRHb29nbGVNYXBTY3JpcHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vd2luZG93Lm1hcExvYWRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIlN0b3JlaWZ5IFNMIGxvYWRlZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbWFwICYmIHR5cGVvZiBkYXRhQXBwcy5kZXRhaWwgPT0gJ3VuZGVmaW5lZCcpIGNoZWNrTWFwTG9hZGVkKCk7XG4gICAgICAgICAgICAgICAgICAgIC8vfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy89PT09PT09PT09PT0gdGFnIG1hcD09PT09PT09PT09PT09PT09XG4gICAgICAgICAgICB2YXIgZGF0YVRhZyA9IGpRdWVyeShcIiNzdG9yZWlmeWFwcHMtc3RvcmVsb2NhdG9yLXNob3J0Y29kZS10YWdzXCIpLmF0dHIoXCJkYXRhLXRhZ1wiKTtcbiAgICAgICAgICAgIGlmKHR5cGVvZiBkYXRhVGFnICE9IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICAgICAgICAgIGpRdWVyeSgnLmNvbnRlbnQtcmVzdWx0cy1zbHQnKS5hZGRDbGFzcygnc2hvcnRjb2RlLXRhZ3MtbGlzdCcpO1xuICAgICAgICAgICAgICAgIGpRdWVyeShcIi5ib290c3RyYXAtc3RvcmVpZnlhcHBzXCIpLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgIFwib3BhY2l0eVwiOiAwLFxuICAgICAgICAgICAgICAgICAgICBcImRpc3BsYXlcIjogXCJub25lXCIsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgalF1ZXJ5KCcjc3RvcmVpZnlhcHBzLXN0b3JlbG9jYXRvci1zaG9ydGNvZGUtdGFncycpLmJlZm9yZSgnPGRpdiBjbGFzcz1cImlmeS1jdXN0b20tbG9hZGluZ1wiIHN0eWxlPVwidGV4dC1hbGlnbjpjZW50ZXI7ZGlzcGxheTpibG9jazttYXJnaW4tdG9wOjMwcHg7XCI+TG9hZGluZy4uLjwvZGl2PicpO1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGpRdWVyeSgnLnN0b3JlaWZ5YXBwX3N0b3Jlc190YWdzX2ZpbHRlclt2YWx1ZT1cIicrZGF0YVRhZysnXCJdJykudHJpZ2dlciggXCJjbGlja1wiICk7XG4gICAgICAgICAgICAgICAgICAgIGpRdWVyeSgnLmJvb3RzdHJhcC1zdG9yZWlmeWFwcHMnKS5jc3MoJ29wYWNpdHknLCcxJyk7XG4gICAgICAgICAgICAgICAgICAgIGpRdWVyeSgnLmJvb3RzdHJhcC1zdG9yZWlmeWFwcHMnKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgIGpRdWVyeSgnLmlmeS1jdXN0b20tbG9hZGluZycpLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICBqUXVlcnkoJy5zdG9yZWlmeWFwcF9zdG9yZXNfdGFnc19maWx0ZXInKS5wYXJlbnQoKS5wYXJlbnQoKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGpRdWVyeSgnI3RhZ3MnKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGpRdWVyeShcIiNyZXNldC1zZWFyY2hcIikuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICBqUXVlcnkoXCIudGFnLWl0ZW0tXCIrZGF0YVRhZykuaGlkZSgpO1xuICAgICAgICAgICAgICAgfSwgMjAwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBmdW5jdGlvbiBvcGVuTW9kYWwoKSB7XG4gICAgICAgICAgICBzY3JvbGxZID0gd2luZG93LnNjcm9sbFk7XG5cbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUucG9zaXRpb24gPSAnZml4ZWQnO1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS50b3AgPSBgLSR7c2Nyb2xsWX1weGA7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLndpZHRoID0gJzEwMCUnO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gY2xvc2VNb2RhbCgpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUucG9zaXRpb24gPSAnJztcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUudG9wID0gJyc7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLndpZHRoID0gJyc7XG5cbiAgICAgICAgICAgIHdpbmRvdy5zY3JvbGxUbygwLCBzY3JvbGxZKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBzY3JvbGxQb3NpdGlvblkgPSAwO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBjb25zdCBvcGVuQnV0dG9uID0gZS50YXJnZXQuY2xvc2VzdCgnLnN0b3JlLWRldGFpbHMtbW9kYWwtYnV0dG9uJyk7XG4gICAgICAgICAgICBjb25zdCBjbG9zZUJ1dHRvbiA9IGUudGFyZ2V0LmNsb3Nlc3QoJy5zdG9yZS1kZXRhaWxzLW1vZGFsLWNsb3NlJyk7XG5cbiAgICAgICAgICAgIGlmIChvcGVuQnV0dG9uKSB7XG4gICAgICAgICAgICAgICAgbGV0IHBhcmVudCA9ICQob3BlbkJ1dHRvbikuY2xvc2VzdCgnLml0ZW0nKTtcbiAgICAgICAgICAgICAgICBsZXQgbW9kYWwgPSAkKHBhcmVudCkuZmluZCgnLnN0b3JlLWRldGFpbHMtbW9kYWwnKVxuXG4gICAgICAgICAgICAgICAgaWYobW9kYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgJChtb2RhbCkuYWRkQ2xhc3MoJ2FjdGl2ZScpXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbFBvc2l0aW9uWSA9IHdpbmRvdy5zY3JvbGxZO1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLnRvcCA9IGAtJHtzY3JvbGxQb3NpdGlvbll9cHhgO1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ3N0b3JlLW1vZGFsLW9wZW4nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjbG9zZUJ1dHRvbikge1xuICAgICAgICAgICAgICAgICQoJy5zdG9yZS1kZXRhaWxzLW1vZGFsJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5wb3NpdGlvbiA9ICcnO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUudG9wID0gJyc7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCdzdG9yZS1tb2RhbC1vcGVuJyk7XG4gICAgICAgICAgICAgICAgd2luZG93LnNjcm9sbFRvKDAsIHNjcm9sbFBvc2l0aW9uWSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGpRdWVyeShkb2N1bWVudCkub24oXCJjbGlja1wiLCBcIi5pZnktc2VhcmNoLXN1Ym1pdC1idG5cIiwgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgbGV0IHZhbCA9IGpRdWVyeSgnI3N0b3JlaWZ5X3NlYXJjaF9jYXJ0JykudmFsKClcbiAgICAgICAgICAgIGlmKHZhbCA9PSAnJyl7XG4gICAgICAgICAgICAgICAgalF1ZXJ5KCcjc3RvcmVpZnlfc2VhcmNoX2NhcnQnKS5mb2N1cygpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghbWFwICYmIHR5cGVvZiBkYXRhQXBwcy5kZXRhaWwgPT0gJ3VuZGVmaW5lZCcpIGNoZWNrTWFwTG9hZGVkKCk7IFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBqUXVlcnkoXCIjc3RvcmVpZnktc2wtbGlnaHQtbW9kYWwtd3JhcHBlclwiKS5hZGRDbGFzcygnc2hvdycpO1xuICAgICAgICAgICAgaWYoalF1ZXJ5KFwiI3N0b3JlaWZ5LXNsLWxpZ2h0LW1vZGFsLXdyYXBwZXJcIikuZmluZCgnLnN0b3JlaWZ5LXNlYXItYm94JykubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICBoID0galF1ZXJ5KFwiI3N0b3JlaWZ5LXNsLWxpZ2h0LW1vZGFsLXdyYXBwZXJcIikuZmluZCgnLnN0b3JlaWZ5LXNlYXItYm94JykuaGVpZ2h0KCkrNTQwO1xuICAgICAgICAgICAgICAgIGpRdWVyeSgnI21hcCcpLmhlaWdodChoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGpRdWVyeSgnc2VsZWN0LmZvcm0tY29udHJvbC1zdG9yZWlmeScpLnZhbCgnbG9jYXRpb24nKS50cmlnZ2VyKCdjaGFuZ2UnKTtcbiAgICAgICAgICAgIGpRdWVyeSgnI2ZybS1zdG9yZWxvY2F0b3Itc2VhcmNoICNhZGRyZXNzJykudmFsKGpRdWVyeSgnI3N0b3JlaWZ5X3NlYXJjaF9jYXJ0JykudmFsKCkpO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7IGpRdWVyeSgnLnN0b3JlbG9jYXRvci1zdWJtaXQtc2VhcmNoJykudHJpZ2dlcignY2xpY2snKSB9LCA1MDApO1xuICAgXG4gICAgICAgIH0pO1xuICAgICAgICBqUXVlcnkoZG9jdW1lbnQpLm9uKFwiY2xpY2tcIiwgXCIuaWZ5LXNlbGVjdC1wcm92aWRlclwiLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBsZXQgY3VycmVudElkID0galF1ZXJ5KHRoaXMpLmF0dHIoJ2RhdGEtaWQnKTtcbiAgICAgICAgICAgIGxldCBmb3JtRWxlbWVudCA9IGRhdGFBcHBzLmZvcm1fY2FydF9lbGVtZW50XG4gICAgICAgICAgICBsZXQgY2FydEF0dHJpYnV0ZSA9IGRhdGFBcHBzLmZvcm1fY2FydF9hdHRyaWJ1dGVcbiAgICAgICAgICAgIGxldCBjYXJ0VXJsID0gZGF0YUFwcHMuY2FydF91cmxcbiAgICAgICAgICAgIGlmKHR5cGVvZiBmb3JtRWxlbWVudCA9PSAndW5kZWZpbmVkJyB8fCBmb3JtRWxlbWVudCA9PSAnJyB8fCBmb3JtRWxlbWVudCA9PSBudWxsKXtcbiAgICAgICAgICAgICAgICBpZih0eXBlb2YgY2FydFVybCA9PSAndW5kZWZpbmVkJyB8fCBjYXJ0VXJsID09ICcnIHx8IGNhcnRVcmwgPT0gbnVsbCl7XG4gICAgICAgICAgICAgICAgICAgIGNhcnRVcmwgPSAnL2NhcnQnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZvcm1FbGVtZW50ID0gJ2Zvcm1bYWN0aW9uPVwiJytjYXJ0VXJsKydcIl0nXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBqUXVlcnkoZm9ybUVsZW1lbnQpLmZpbmQoJyNzdG9yZWlmeS1pbmZvJykucmVtb3ZlKCk7XG4gICAgICAgICAgICBnbWFya2Vycy5mb3JFYWNoKChpdGVtLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmKE51bWJlcihjdXJyZW50SWQpID09IE51bWJlcihpdGVtLmlkKSl7XG4gICAgICAgICAgICAgICAgICAgIGxldCBodG1sID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpbmZvciA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgIGlmKGNhcnRBdHRyaWJ1dGUubmFtZSA9PSB0cnVlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxoNCBjbGFzcz1cImlmeS1zZWxlY3QtcHJvdmlkZXItaXRlbSBpZnktc2VsZWN0LXByb3ZpZGVyLXRpdGxlXCI+JytpdGVtLm5hbWUrJzwvaDQ+J1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5mb3IgPSAgYCR7aXRlbS5uYW1lfSBcXG5gXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYoY2FydEF0dHJpYnV0ZS5hZGRyZXNzID09IHRydWUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cImlmeS1zZWxlY3QtcHJvdmlkZXItaXRlbSBpZnktc2VsZWN0LXByb3ZpZGVyLWFkZHJlc3NcIj4nK2l0ZW0uYWRkcmVzcysnPC9kaXY+J1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5mb3IgPSAgYEFkZHJlc3M6ICR7aXRlbS5hZGRyZXNzfSBcXG5gXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0uZW1haWwgIT0gbnVsbCAmJiB0eXBlb2YgaXRlbS5lbWFpbCAhPSAndW5kZWZpbmVkJyAmJiBpdGVtLmVtYWlsICE9ICcnICYmIGNhcnRBdHRyaWJ1dGUuZW1haWwgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cImlmeS1zZWxlY3QtcHJvdmlkZXItaXRlbSBpZnktc2VsZWN0LXByb3ZpZGVyLWFkZHJlc3NcIj4nK2VtYWlsX2ljb24rJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICBodG1sICs9IGl0ZW0uZW1haWwgKyAnPC9kaXY+JztcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZm9yICs9ICBgRW1haWw6ICR7aXRlbS5lbWFpbH1cXG5gO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLnBob25lICE9IG51bGwgJiYgdHlwZW9mIGl0ZW0ucGhvbmUgIT0gJ3VuZGVmaW5lZCcgJiYgaXRlbS5waG9uZSAhPSAnJyAmJiBjYXJ0QXR0cmlidXRlLnBob25lID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJpZnktc2VsZWN0LXByb3ZpZGVyLWl0ZW0gaWZ5LXNlbGVjdC1wcm92aWRlci1waG9uZVwiPicrcGhvbmVfaWNvbisnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gaXRlbS5waG9uZSArICc8L2Rpdj4nO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5mb3IgKz0gIGBQaG9uZTogJHtpdGVtLnBob25lfVxcbmA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0ud2ViICE9IG51bGwgJiYgdHlwZW9mIGl0ZW0ud2ViICE9ICd1bmRlZmluZWQnICYmIGl0ZW0ud2ViICE9ICcnICYmIGNhcnRBdHRyaWJ1dGUud2ViID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJpZnktc2VsZWN0LXByb3ZpZGVyLWl0ZW0gaWZ5LXNlbGVjdC1wcm92aWRlci13ZWJcIj4nK3dlYl9pY29uKycnO1xuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbCArPSBpdGVtLndlYiArICc8L2Rpdj4nO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHVybCA9IGdldFVybHNGcm9tSHRtbChpdGVtLndlYilcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZm9yICs9ICBgV2ViOiAke3VybH1cXG5gO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLnRhZ3MubGVuZ3RoID4gMCAmJiBjYXJ0QXR0cmlidXRlLnRhZ3MgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRhZ19hcnIgPSBpdGVtLnRhZ3M7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGFnX2h0bWwgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGpRdWVyeS5lYWNoKHRhZ19hcnIsIGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWdfaHRtbCArPSAnPHNwYW4gY2xhc3M9XCJ0YWctaXRlbSB0YWctaXRlbS0nK3N0cmluZ190b19zbHVnKHZhbHVlKSsnXCI+PGkgY2xhc3M9XCJmYSBmYS1jaGVja1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT4gJyArIHZhbHVlICsgJzwvc3Bhbj4nO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwiaWZ5LXNlbGVjdC1wcm92aWRlci1pdGVtIGlmeS1zZWxlY3QtcHJvdmlkZXItdGFnc1wiPicgKyB0YWdfaHRtbCArICc8L2Rpdj4nO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5mb3IgKz0gIGBUYWdzOiAke3RhZ19hcnJ9XFxuYDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS5zY2hlZHVsZV90ZXh0ICE9IG51bGwgJiYgdHlwZW9mIGl0ZW0uc2NoZWR1bGVfdGV4dCAhPSAndW5kZWZpbmVkJyAmJiBpdGVtLnNjaGVkdWxlX3RleHQgIT0gJycgJiYgY2FydEF0dHJpYnV0ZS5zY2hlZHVsZSA9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkYXJyTGFuZ3NjaGVkdWxlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdtb24nIDogc3RvcmVsb2NhdG9yX2xhbmcubW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICd0dWUnIDogc3RvcmVsb2NhdG9yX2xhbmcudHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICd3ZWQnIDogc3RvcmVsb2NhdG9yX2xhbmcud2VkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICd0aHUnIDogc3RvcmVsb2NhdG9yX2xhbmcudGh1LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdmcmknIDogc3RvcmVsb2NhdG9yX2xhbmcuZnJpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzYXQnIDogc3RvcmVsb2NhdG9yX2xhbmcuc2F0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzdW4nIDogc3RvcmVsb2NhdG9yX2xhbmcuc3VuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzdG9yZV9vcGVyYXRpb24nIDogc3RvcmVsb2NhdG9yX2xhbmcuc3RvcmVfb3BlcmF0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhbScgOiBzdG9yZWxvY2F0b3JfbGFuZy5hbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAncG0nIDogc3RvcmVsb2NhdG9yX2xhbmcucG0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2Nsb3NlZCcgOiBzdG9yZWxvY2F0b3JfbGFuZy5jbG9zZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3RoZV9uZXh0X2RheScgOiBzdG9yZWxvY2F0b3JfbGFuZy50aGVfbmV4dF9kYXksXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGh0bWxTY2hlZHVsZSA9IGl0ZW0uc2NoZWR1bGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGV4dFNjaGVkdWxlID0gaXRlbS5zY2hlZHVsZV90ZXh0O1xuICAgICAgICAgICAgICAgICAgICAgICAgalF1ZXJ5LmVhY2goJGFyckxhbmdzY2hlZHVsZSwgZnVuY3Rpb24oIGtleSwgdmFsICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sU2NoZWR1bGUgPSBodG1sU2NoZWR1bGUucmVwbGFjZUFsbChcInt7IFwiK2tleStcIiB9fVwiLCB2YWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0U2NoZWR1bGUgPSB0ZXh0U2NoZWR1bGUucmVwbGFjZUFsbChcInt7IFwiK2tleStcIiB9fVwiLCB2YWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwiaWZ5LXNlbGVjdC1wcm92aWRlci1pdGVtIGlmeS1zZWxlY3QtcHJvdmlkZXItc2NoZWR1bGVcIj4nK2h0bWxTY2hlZHVsZSsnPC9kaXY+JztcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZm9yICs9ICBgU3RvcmUgT3BlcmF0aW9uIEhvdXJzOlxcbiAke3RleHRTY2hlZHVsZX1cXG5gO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGpRdWVyeSgnLmlmeS1zZWFyY2gtY2FydC1yZXN1bHQnKS5odG1sKGh0bWwpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgalF1ZXJ5KFwiI3N0b3JlaWZ5LXNsLWxpZ2h0LW1vZGFsLXdyYXBwZXJcIikucmVtb3ZlQ2xhc3MoJ3Nob3cnKTtcbiAgICAgICAgICAgICAgICAgICAgalF1ZXJ5KGZvcm1FbGVtZW50KS5hcHBlbmQoJzxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cImF0dHJpYnV0ZXNbTG9jYXRpb25dXCIgaWQ9XCJzdG9yZWlmeS1pbmZvXCIgdmFsdWU9XCJcIj4nKTtcbiAgICAgICAgICAgICAgICAgICAgalF1ZXJ5KGZvcm1FbGVtZW50KS5maW5kKCcjc3RvcmVpZnktaW5mbycpLnZhbChpbmZvcik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgICBmdW5jdGlvbiBnZXRVcmxzRnJvbUh0bWwoaHRtbFN0cmluZykge1xuICAgICAgICAgICAgY29uc3QgcmVnZXggPSAvPGFbXj5dK2hyZWY9W1wiJ10oW15cIiddKylbXCInXVtePl0qPi9naTtcbiAgICAgICAgICAgIGNvbnN0IHVybHMgPSBbXTtcbiAgICAgICAgICAgIGxldCBtYXRjaDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgd2hpbGUgKChtYXRjaCA9IHJlZ2V4LmV4ZWMoaHRtbFN0cmluZykpICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdXJscy5wdXNoKG1hdGNoWzFdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHVybHM7XG4gICAgICAgIH1cbiAgICAgICAgalF1ZXJ5KCcjcmFkaXVzX3NlYXJjaCcpLm9uKFwiY2hhbmdlIG1vdXNlbW92ZVwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGpRdWVyeSgnI3JhZGl1cy12YWx1ZSAubnVtLXJhbmdlJykuaHRtbChqUXVlcnkodGhpcykudmFsKCkpO1xuICAgICAgICB9KTtcblxuICAgICAgICBqUXVlcnkoJyNyYWRpdXNfc2VhcmNoJykub24oXCJjaGFuZ2UgbW91c2VlbmRcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChqUXVlcnkoJyNmcm0tc3RvcmVsb2NhdG9yLXNlYXJjaCAjYWRkcmVzcycpLnZhbCgpICE9ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaExvY2F0aW9uKG51bGwpO1xuICAgICAgICAgICAgfSBcbiAgICAgICAgfSk7XG5cblxuXG5cbiAgICAgICAgalF1ZXJ5KGRvY3VtZW50KS5vbihcImNsaWNrXCIsIFwiLnN0b3JlbG9jYXRvci1zdWJtaXQtc2VhcmNoXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgalF1ZXJ5KCcjcmVzdWx0cy1lbXB0eScpLmh0bWwoJzxoNT48L2g1PicpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKHNlYXJjaF9tb2RlID09IDEpXG4gICAgICAgICAgICAgICAgICAgIGxvYWRHZW9sb2NhdGlvbkNvdW50cnkoKTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaExvY2F0aW9uKG51bGwpO1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH0pO1xuICAgICAgICBqUXVlcnkoZG9jdW1lbnQpLm9uKCdjbGljaycsICcjcmVzZXQtc2VhcmNoJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgbGV0IHN0b3JlSXRlbXMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdpbm5lci1pdGVtJyk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0b3JlSXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBzdG9yZUl0ZW1zW2ldLmNsYXNzTGlzdC5yZW1vdmUoJ2lubmVyLWl0ZW0tYWN0aXZlJylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNsZWFyU2VhcmNoTWFya2VyKCk7XG4gICAgICAgICAgICBpZihpbmZvd2luZG93KSBpbmZvd2luZG93LmNsb3NlKCk7XG4gICAgICAgICAgICBqUXVlcnkoJyNyZXN1bHRzLWVtcHR5JykuaHRtbCgnPGg1PjwvaDU+Jyk7XG4gICAgICAgICAgICBqUXVlcnkoJyNhZGRyZXNzLCNwcm9kdWN0X3NlYXJjaCcpLnZhbCgnJyk7XG4gICAgICAgICAgICBqUXVlcnkoJyNyYWRpdXNfc2VhcmNoJykudmFsKHJhZGl1c19kZWZhdWx0KTtcbiAgICAgICAgICAgIGpRdWVyeSgnLm51bS1yYW5nZScpLmh0bWwocmFkaXVzX2RlZmF1bHQpO1xuICAgICAgICAgICAgalF1ZXJ5KFwiLnN0b3JlaWZ5YXBwX3N0b3Jlc190YWdzX2ZpbHRlclwiKS5wcm9wKFwiY2hlY2tlZFwiLCBmYWxzZSk7XG4gICAgICAgICAgICBpZihqUXVlcnkoXCJpbnB1dFtuYW1lPXN0b3Jlc19jb3VudHJ5X2ZpbHRlcl1cIikubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICBqUXVlcnkoXCJpbnB1dFtuYW1lPXN0b3Jlc19jb3VudHJ5X2ZpbHRlcl06Zmlyc3RcIikucHJvcChcImNoZWNrZWRcIiwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgZmlsdGVyX3JlZ2lvbl9jaXR5KGpRdWVyeShcImlucHV0W25hbWU9c3RvcmVzX2NvdW50cnlfZmlsdGVyXVwiKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihqUXVlcnkoXCJzZWxlY3RbbmFtZT1zdG9yZXNfY291bnRyeV9maWx0ZXJdXCIpLmxlbmd0aCl7XG4gICAgICAgICAgICAgICAgalF1ZXJ5KFwic2VsZWN0W25hbWU9c3RvcmVzX2NvdW50cnlfZmlsdGVyXVwiKS52YWwoalF1ZXJ5KFwic2VsZWN0W25hbWU9c3RvcmVzX2NvdW50cnlfZmlsdGVyXSBvcHRpb246Zmlyc3RcIikudmFsKCkpO1xuICAgICAgICAgICAgICAgIGZpbHRlcl9yZWdpb25fY2l0eShqUXVlcnkoXCJzZWxlY3RbbmFtZT1zdG9yZXNfY291bnRyeV9maWx0ZXJdXCIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGlmKGlmeV9maWx0ZXJfcmVnaW9uX2NpdHkgPT0gMSlcbiAgICAgICAgICAgIC8vICAgICBqUXVlcnkoXCIjc3RvcmVzLXJlZ2lvbi1maWx0ZXIsI3N0b3Jlcy1jaXR5LWZpbHRlclwiKS5odG1sKCcnKS5oaWRlKCk7XG4gICAgICAgICAgICB2YXIgY291bnRfbWFya2VyID0gMDtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ21hcmtlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBtYXJrZXIgPSBnbWFya2Vyc1tpXTtcbiAgICAgICAgICAgICAgICBpZigobGlzdF9tb2RlICE9IDEgJiYgbGlzdF9tb2RlICE9IDMpIHx8ICgobGlzdF9tb2RlID09IDMgfHwgbGlzdF9tb2RlID09IDEpICYmIGkgPCBsaW1pdF9zdG9yZSkpXG4gICAgICAgICAgICAgICAgICAgIGNvdW50X21hcmtlcisrO1xuICAgICAgICAgICAgICAgIGlmIChsaXN0X21vZGUgIT0gMSB8fCAobGlzdF9tb2RlID09IDEgJiYgaSA8IGxpbWl0X3N0b3JlKSkge1xuICAgICAgICAgICAgICAgICAgICBnbWFya2Vyc1tpXS5zZXRWaXNpYmxlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICBib3VuZHMuZXh0ZW5kKG1hcmtlci5nZXRQb3NpdGlvbigpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBnbWFya2Vyc1tpXS5zZXRWaXNpYmxlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBzdG9yZXMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdpbm5lci1pdGVtJyk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0b3Jlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHN0b3Jlc1tpXS5wYXJlbnROb2RlLmNsYXNzTGlzdC5yZW1vdmUoJ3N0b3JlLWl0ZW0taGlkZScpXG4gICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgaWYgKGNvdW50X21hcmtlciA+IDEpIHtcbiAgICAgICAgICAgICAgICBqUXVlcnkoXCIjc3RvcmVpZnktdGV4dC1yZXN1bHRcIikudGV4dChqUXVlcnkoXCIjc3RvcmVpZnktdGV4dC1yZXN1bHRcIikuZGF0YSgncmVzdWx0cycpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgalF1ZXJ5KFwiI3N0b3JlaWZ5LXRleHQtcmVzdWx0XCIpLnRleHQoalF1ZXJ5KFwiI3N0b3JlaWZ5LXRleHQtcmVzdWx0XCIpLmRhdGEoJ3Jlc3VsdCcpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKGlmeV9sYXlvdXQgIT0gOCkgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJudW0tcnNcIikuaW5uZXJIVE1MID0gY291bnRfbWFya2VyO1xuICAgICAgICAgICAgLy9qUXVlcnkoXCIjcmVzdWx0cy1zbHQgaDMudGl0bGVcIikuc2hvdygpO1xuICAgICAgICAgICAgalF1ZXJ5KFwiI21haW4tc2xpZGVyLXN0b3JlbG9jYXRvclwiKS5yZW1vdmVDbGFzcygnc3RvcmVpZnktZmlyc3QtYWxlcnQnKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKGNlbnRlcl9sYXQgPT0gMCAmJiBjZW50ZXJfbG5nID09IDApIHtcbiAgICAgICAgICAgICAgICBtYXAuZml0Qm91bmRzKGJvdW5kcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG1hcC5zZXRab29tKGluaXRpYWxfem9vbSk7XG4gICAgICAgICAgICAgICAgbWFwLnNldENlbnRlcihuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKGNlbnRlcl9sYXQsIGNlbnRlcl9sbmcpKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsaXN0X21vZGUgPT0gMiAmJiBsaW1pdF9zdG9yZSA9PSAwKSB7XG4gICAgICAgICAgICAgICAgalF1ZXJ5KFwiI3Jlc3VsdHMtc2x0IGgzLnRpdGxlXCIpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICBqUXVlcnkoXCIjbWFpbi1zbGlkZXItc3RvcmVsb2NhdG9yXCIpLmFkZENsYXNzKCdzdG9yZWlmeS1maXJzdC1hbGVydCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgalF1ZXJ5KFwiI3Jlc3VsdHMtc2x0XCIpLnNob3coKTtcbiAgICAgICAgICAgIFxuXG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvYWRpbmdfbWFza19sb2FkZXJcIikuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblxuICAgICAgICAgICAgJCgnLmRpc3RhbmNlLWVsZW1lbnQnKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICAvLyByZW1vdmUgbWFya2VyIGFuaW1hdGlvblxuICAgICAgICAgICAgXG4gICAgICAgICAgICBnbWFya2Vycy5mb3JFYWNoKGdtYXJrZXIgPT4ge1xuICAgICAgICAgICAgICAgIGdtYXJrZXIuc2V0QW5pbWF0aW9uKG51bGwpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuXG4gICAgICAgIH0pO1xuICAgICAgICAvLyBqUXVlcnkoZG9jdW1lbnQpLm9uKCdtb3VzZW92ZXInLCAnLmlubmVyLWl0ZW0nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gICAgIG9uTW91c2VvdmVyKGpRdWVyeSh0aGlzKS5wYXJlbnQoKS5hdHRyKFwiZGF0YW1hcmtlclwiKSk7XG4gICAgICAgIC8vIH0pO1xuICAgICAgICAvLyBqUXVlcnkoZG9jdW1lbnQpLm9uKCdtb3VzZW91dCcsICcuaW5uZXItaXRlbScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyAgICAgb25Nb3VzZW92ZXIoalF1ZXJ5KHRoaXMpLnBhcmVudCgpLmF0dHIoXCJkYXRhbWFya2VyXCIpKTtcbiAgICAgICAgLy8gfSk7XG4gICAgICAgIGpRdWVyeShkb2N1bWVudCkub24oJ2NsaWNrJywgJy5pbm5lci1pdGVtJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBqUXVlcnkoJyNtYWluLXNsaWRlci1zdG9yZWxvY2F0b3IgLmlubmVyLWl0ZW0nKS5yZW1vdmVDbGFzcygnaW5uZXItaXRlbS1hY3RpdmUnKTtcbiAgICAgICAgICAgIGpRdWVyeSh0aGlzKS5hZGRDbGFzcygnaW5uZXItaXRlbS1hY3RpdmUnKTtcbiAgICAgICAgICAgIG51bSA9IGpRdWVyeSh0aGlzKS5wYXJlbnQoKS5hdHRyKFwiZGF0YW1hcmtlclwiKTtcbiAgICAgICAgICAgIGdvb2dsZS5tYXBzLmV2ZW50LnRyaWdnZXIoZ21hcmtlcnNbbnVtXSwgJ2NsaWNrJyk7XG4gICAgICAgICAgICBcbiAgICAgICAgfSk7XG4gICAgICAgIGpRdWVyeSgnLnN0b3JlaWZ5LW1vZGFsLWVsb24gLnN0b3JlaWZ5LWNsb3NlJykub24oXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGpRdWVyeSh0aGlzKS5wYXJlbnQoKS5wYXJlbnQoKS5wYXJlbnQoKS5oaWRlKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBqUXVlcnkoJy5jaG9zZS1zZWFyY2gtc2x0Jykub24oXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoalF1ZXJ5KHRoaXMpLnZhbCgpID09ICdsb2NhdGlvbicpIHtcbiAgICAgICAgICAgICAgICBqUXVlcnkoJy5pbnB1dC1yYWRpdXMtc2x0JykucGFyZW50KCkuc2hvdygpO1xuICAgICAgICAgICAgICAgIGpRdWVyeSgnLmdyLXNlYXJjaC1zbHQnKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgLy9qUXVlcnkoJy5pbnB1dC1hdHRyaWJ1dGUtc2x0JykuaGlkZSgpO1xuICAgICAgICAgICAgICAgIGpRdWVyeSgnI3Byb2R1Y3Rfc2VhcmNoJykuaGlkZSgpO1xuICAgICAgICAgICAgICAgIGpRdWVyeSgnI3N0b3JlX3NlYXJjaCcpLmhpZGUoKTtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGpRdWVyeSh0aGlzKS52YWwoKSA9PSAncHJvZHVjdCcpIHtcbiAgICAgICAgICAgICAgICBqUXVlcnkoJy5pbnB1dC1yYWRpdXMtc2x0JykucGFyZW50KCkuaGlkZSgpO1xuICAgICAgICAgICAgICAgIC8valF1ZXJ5KCcuaW5wdXQtYXR0cmlidXRlLXNsdCcpLnNob3coKTtcbiAgICAgICAgICAgICAgICBqUXVlcnkoJyNzdG9yZV9zZWFyY2gnKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgalF1ZXJ5KCcuZ3Itc2VhcmNoLXNsdCcpLmhpZGUoKTs7XG4gICAgICAgICAgICAgICAgalF1ZXJ5KCcjcHJvZHVjdF9zZWFyY2gnKS5zaG93KCk7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChqUXVlcnkodGhpcykudmFsKCkgPT0gJ3N0b3JlJykge1xuICAgICAgICAgICAgICAgIGpRdWVyeSgnLmlucHV0LXJhZGl1cy1zbHQnKS5wYXJlbnQoKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgLy9qUXVlcnkoJy5pbnB1dC1hdHRyaWJ1dGUtc2x0Jykuc2hvdygpO1xuICAgICAgICAgICAgICAgIGpRdWVyeSgnLmdyLXNlYXJjaC1zbHQnKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgalF1ZXJ5KCcjcHJvZHVjdF9zZWFyY2gnKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgalF1ZXJ5KCcjc3RvcmVfc2VhcmNoJykuc2hvdygpO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBmdW5jdGlvbiByZW5kZXJGaWx0ZXIoYXJyVmFsdWUgPSBbXSxvcHRpb249J3JlZ2lvbicsbW9kZSA9IDEpIHtcbiAgICAgICAgICAgIGlmKG1vZGUgPT0gMil7XG4gICAgICAgICAgICAgICAgaWYoYXJyVmFsdWUubGVuZ3RoID4gMCl7XG4gICAgICAgICAgICAgICAgICAgIGxldCBodG1sID0gJzxsYWJlbD4nK3N0b3JlbG9jYXRvcl9sYW5nWydmaWx0ZXJfYnlfJytvcHRpb25dKyc8L2xhYmVsPjxzZWxlY3QgY2xhc3M9XCJzdG9yZWlmeWFwcF9zdG9yZXNfJytvcHRpb24rJ19maWx0ZXIgc3RvcmVpZnlhcHBfc3RvcmVzXycrb3B0aW9uKydfZmlsdGVyX2xpc3RcIiBkYXRhLXRhZz1cInNlbGVjdFwiPic7XG4gICAgICAgICAgICAgICAgICAgIGlmKGFyclZhbHVlLmxlbmd0aCA+IDEpIFxuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbCArPSAnPG9wdGlvbiB2YWx1ZT1cImlmeV9hbGxcIj4nK3N0b3JlbG9jYXRvcl9sYW5nWydzZWxlY3RfJytvcHRpb25dKyc8L29wdGlvbj4nO1xuICAgICAgICAgICAgICAgICAgICBqUXVlcnkuZWFjaChhcnJWYWx1ZSwgZnVuY3Rpb24oIGluZGV4LCB2YWx1ZSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxvcHRpb24gdmFsdWU9XCInK3ZhbHVlKydcIj4nK3ZhbHVlKyc8L29wdGlvbj4nO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaHRtbCArPSAnPC9zZWxlY3Q+JztcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGpRdWVyeSgnI3N0b3Jlcy0nK29wdGlvbisnLWZpbHRlcicpLmh0bWwoaHRtbCkuc2hvdygpO1xuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICBqUXVlcnkoJyNzdG9yZXMtJytvcHRpb24rJ2ZpbHRlcicpLmh0bWwoJzxzZWxlY3QgY2xhc3M9XCJzdG9yZWlmeWFwcF9zdG9yZXNfJytvcHRpb24rJ19maWx0ZXIgc3RvcmVpZnlhcHBfc3RvcmVzXycrb3B0aW9uKydfZmlsdGVyX2xpc3RcIiBkYXRhLXRhZyA9IFwic2VsZWN0XCI+PG9wdGlvbiB2YWx1ZT1cImlmeV9hbGxcIj4nK3N0b3JlbG9jYXRvcl9sYW5nWydzZWxlY3RfJytvcHRpb25dKyc8L29wdGlvbj48L3NlbGVjdD4nKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgaWYoYXJyVmFsdWUubGVuZ3RoID4gMCl7XG4gICAgICAgICAgICAgICAgICAgIGxldCBodG1sID0gJzxsYWJlbD4nK3N0b3JlbG9jYXRvcl9sYW5nWydmaWx0ZXJfYnlfJytvcHRpb25dKyc8L2xhYmVsPjx1bCBjbGFzcz1cInN0b3JlaWZ5YXBwX3N0b3Jlc18nK29wdGlvbisnX2ZpbHRlcl9saXN0XCIgZGF0YS10YWc9XCJyYWRpb1wiPic7XG4gICAgICAgICAgICAgICAgICAgIGlmKGFyclZhbHVlLmxlbmd0aCA+IDEpe1xuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbCArPSAnPGxpPjxsYWJlbCBjbGFzcz1cImxhYmVsX3N0b3JlaWZ5YXBwX3N0b3Jlc18nK29wdGlvbisnX2ZpbHRlclwiIGZvcj1cInN0b3JlaWZ5YXBwX3N0b3Jlc18nK29wdGlvbisnX2ZpbHRlcl9hbGxcIj4gPGlucHV0IHR5cGU9XCJyYWRpb1wiIG5hbWU9XCJzdG9yZXNfJytvcHRpb24rJ19maWx0ZXJcIiBjbGFzcz1cInN0b3JlaWZ5YXBwX3N0b3Jlc18nK29wdGlvbisnX2ZpbHRlclwiIGlkPVwic3RvcmVpZnlhcHBfc3RvcmVzXycrb3B0aW9uKydfZmlsdGVyX2FsbFwiIHZhbHVlPVwiaWZ5X2FsbFwiIGNoZWNrZWQ9XCJjaGVja2VkXCIgLz4gPHNwYW4+JytzdG9yZWxvY2F0b3JfbGFuZy5hbGwrJzwvc3Bhbj4gPC9sYWJlbD48L2xpPic7XG4gICAgICAgICAgICAgICAgICAgICAgICBqUXVlcnkuZWFjaChhcnJWYWx1ZSwgZnVuY3Rpb24oIGluZGV4LCB2YWx1ZSApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sICs9ICc8bGk+PGxhYmVsIGNsYXNzPVwibGFiZWxfc3RvcmVpZnlhcHBfc3RvcmVzXycrb3B0aW9uKydfZmlsdGVyXCIgZm9yPVwic3RvcmVpZnlhcHBfc3RvcmVzXycrb3B0aW9uKydfZmlsdGVyXycraW5kZXgrJ1wiPiA8aW5wdXQgdHlwZT1cInJhZGlvXCIgbmFtZT1cInN0b3Jlc18nK29wdGlvbisnX2ZpbHRlclwiIGNsYXNzPVwic3RvcmVpZnlhcHBfc3RvcmVzXycrb3B0aW9uKydfZmlsdGVyXCIgaWQ9XCJzdG9yZWlmeWFwcF9zdG9yZXNfJytvcHRpb24rJ19maWx0ZXJfJytpbmRleCsnXCIgdmFsdWU9XCInK3ZhbHVlKydcIi8+IDxzcGFuPicrdmFsdWUrJzwvc3Bhbj4gPC9sYWJlbD48L2xpPic7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICBodG1sICs9ICc8bGk+PGxhYmVsIGNsYXNzPVwibGFiZWxfc3RvcmVpZnlhcHBfc3RvcmVzXycrb3B0aW9uKydfZmlsdGVyXCIgZm9yPVwic3RvcmVpZnlhcHBfc3RvcmVzXycrb3B0aW9uKydfZmlsdGVyXzBcIj4gPGlucHV0IHR5cGU9XCJyYWRpb1wiIG5hbWU9XCJzdG9yZXNfJytvcHRpb24rJ19maWx0ZXJcIiBjbGFzcz1cInN0b3JlaWZ5YXBwX3N0b3Jlc18nK29wdGlvbisnX2ZpbHRlclwiIGlkPVwic3RvcmVpZnlhcHBfc3RvcmVzXycrb3B0aW9uKydfZmlsdGVyXzBcIiB2YWx1ZT1cIicrYXJyVmFsdWVbMF0rJ1wiIGNoZWNrZWQ9XCJjaGVja2VkXCIvPiA8c3Bhbj4nK2FyclZhbHVlWzBdKyc8L3NwYW4+IDwvbGFiZWw+PC9saT4nO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gJzwvdWw+JztcbiAgICAgICAgICAgICAgICAgICAgalF1ZXJ5KCcjc3RvcmVzLScrb3B0aW9uKyctZmlsdGVyJykuaHRtbChodG1sKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIGpRdWVyeSgnI3N0b3Jlcy0nK29wdGlvbisnZmlsdGVyJykuaHRtbCgnPHVsIGNsYXNzPVwic3RvcmVpZnlhcHBfc3RvcmVzXycrb3B0aW9uKydfZmlsdGVyIHN0b3JlaWZ5YXBwX3N0b3Jlc18nK29wdGlvbisnX2ZpbHRlcl9saXN0XCIgZGF0YS10YWcgPSBcInVsXCI+PGxpPjxsYWJlbCBjbGFzcz1cImxhYmVsX3N0b3JlaWZ5YXBwX3N0b3Jlc18nK29wdGlvbisnX2ZpbHRlclwiIGZvcj1cInN0b3JlaWZ5YXBwX3N0b3Jlc18nK29wdGlvbisnX2ZpbHRlcl9hbGxcIj4gPGlucHV0IHR5cGU9XCJyYWRpb1wiIG5hbWU9XCJzdG9yZXNfJytvcHRpb24rJ19maWx0ZXJcIiBjbGFzcz1cInN0b3JlaWZ5YXBwX3N0b3Jlc18nK29wdGlvbisnX2ZpbHRlclwiIGlkPVwic3RvcmVpZnlhcHBfc3RvcmVzXycrb3B0aW9uKydfZmlsdGVyX2FsbFwiIHZhbHVlPVwiaWZ5X2FsbFwiIGNoZWNrZWQ9XCJjaGVja2VkXCIgLz4gPHNwYW4+QWxsPC9zcGFuPiA8L2xhYmVsPjwvbGk+PC91bD4nKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIGZpbHRlcl9yZWdpb25fY2l0eSh0aGF0KXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYodGhhdC5oYXNDbGFzcygnc3RvcmVpZnlhcHBfc3RvcmVzX2NvdW50cnlfZmlsdGVyJykpe1xuICAgICAgICAgICAgICAgIGxldCBjdXJyZW50Q291bnRyeSA9ICB0aGF0LnZhbCgpO1xuICAgICAgICAgICAgICAgIGxldCBhcnJWYWx1ZVJlZ2lvbiA9IFtdO1xuICAgICAgICAgICAgICAgIGlmKGN1cnJlbnRDb3VudHJ5ICE9PSAnYWxsJyl7XG4gICAgICAgICAgICAgICAgICAgIGpRdWVyeSgnI3N0b3Jlcy1jaXR5LWZpbHRlcicpLmh0bWwoJzxzZWxlY3QgY2xhc3M9XCJzdG9yZWlmeWFwcF9zdG9yZXNfY2l0eV9maWx0ZXIgc3RvcmVpZnlhcHBfc3RvcmVzX2NpdHlfZmlsdGVyX2xpc3RcIiBkYXRhLXRhZyA9IFwic2VsZWN0XCI+PG9wdGlvbiB2YWx1ZT1cImlmeV9hbGxcIj4nK3N0b3JlbG9jYXRvcl9sYW5nWydzZWxlY3RfY2l0eSddKyc8L29wdGlvbj48L3NlbGVjdD4nKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmKHR5cGVvZiBpZnlBcnJfY291bnRyeV9yZWdpb25fY2l0eVtjdXJyZW50Q291bnRyeV0gIT09J3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgICAgICAgICAgICAgYXJyVmFsdWVSZWdpb24gPSBPYmplY3Qua2V5cyhpZnlBcnJfY291bnRyeV9yZWdpb25fY2l0eVtjdXJyZW50Q291bnRyeV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoYXJyVmFsdWVSZWdpb24ubGVuZ3RoID09IDEpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjdXJyZW50UmVnaW9uID0gIGFyclZhbHVlUmVnaW9uWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBhcnJWYWx1ZUNpdHkgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZih0eXBlb2YgaWZ5QXJyX2NvdW50cnlfcmVnaW9uX2NpdHlbY3VycmVudENvdW50cnldW2N1cnJlbnRSZWdpb25dICE9PSd1bmRlZmluZWQnKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJyVmFsdWVDaXR5ID0gaWZ5QXJyX2NvdW50cnlfcmVnaW9uX2NpdHlbY3VycmVudENvdW50cnldW2N1cnJlbnRSZWdpb25dO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJGaWx0ZXIoYXJyVmFsdWVDaXR5LCdjaXR5JyxOdW1iZXIoaWZ5X21vZGVfZmlsdGVyY291bnRyeSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJlbmRlckZpbHRlcihhcnJWYWx1ZVJlZ2lvbiwncmVnaW9uJyxOdW1iZXIoaWZ5X21vZGVfZmlsdGVyY291bnRyeSkpO1xuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICBqUXVlcnkoJyNzdG9yZXMtcmVnaW9uLWZpbHRlcicpLmh0bWwoJycpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgalF1ZXJ5KCcjc3RvcmVzLWNpdHktZmlsdGVyJykuaHRtbCgnJykuaGlkZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKHRoYXQuaGFzQ2xhc3MoJ3N0b3JlaWZ5YXBwX3N0b3Jlc19yZWdpb25fZmlsdGVyJykpe1xuICAgICAgICAgICAgICAgIGxldCBjdXJyZW50Q291bnRyeSA9ICdhbGwnO1xuICAgICAgICAgICAgICAgIGlmKE51bWJlcihpZnlfbW9kZV9maWx0ZXJjb3VudHJ5KSA9PSAyKVxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50Q291bnRyeSA9ICBqUXVlcnkoJ3NlbGVjdC5zdG9yZWlmeWFwcF9zdG9yZXNfY291bnRyeV9maWx0ZXInKS52YWwoKTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRDb3VudHJ5ID0galF1ZXJ5KCdpbnB1dC5zdG9yZWlmeWFwcF9zdG9yZXNfY291bnRyeV9maWx0ZXI6Y2hlY2tlZCcpLnZhbCgpO1xuICAgICAgICAgICAgICAgIGxldCBjdXJyZW50UmVnaW9uID0gIHRoYXQudmFsKCk7XG4gICAgICAgICAgICAgICAgbGV0IGFyclZhbHVlQ2l0eSA9IFtdO1xuICAgICAgICAgICAgICAgIGlmKGN1cnJlbnRSZWdpb24gIT09ICdpZnlfYWxsJyl7XG4gICAgICAgICAgICAgICAgICAgIGlmKHR5cGVvZiBpZnlBcnJfY291bnRyeV9yZWdpb25fY2l0eVtjdXJyZW50Q291bnRyeV1bY3VycmVudFJlZ2lvbl0gIT09J3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgICAgICAgICAgICAgYXJyVmFsdWVDaXR5ID0gaWZ5QXJyX2NvdW50cnlfcmVnaW9uX2NpdHlbY3VycmVudENvdW50cnldW2N1cnJlbnRSZWdpb25dO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJlbmRlckZpbHRlcihhcnJWYWx1ZUNpdHksJ2NpdHknLE51bWJlcihpZnlfbW9kZV9maWx0ZXJjb3VudHJ5KSk7XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgalF1ZXJ5KCcjc3RvcmVzLWNpdHktZmlsdGVyJykuaHRtbCgnJykuaGlkZSgpOyBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBqUXVlcnkoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnLnN0b3JlaWZ5YXBwX3N0b3Jlc19jb3VudHJ5X2ZpbHRlciwuc3RvcmVpZnlhcHBfc3RvcmVzX3JlZ2lvbl9maWx0ZXIsLnN0b3JlaWZ5YXBwX3N0b3Jlc19jaXR5X2ZpbHRlciwuc3RvcmVpZnlhcHBfc3RvcmVzX3RhZ3NfZmlsdGVyJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgalF1ZXJ5KCcjbG9hZGluZ19tYXNrX2xvYWRlcicpLnNob3coKTtcbiAgICAgICAgICAgIGpRdWVyeShcIiNzdG9yZWlmeS1saXN0c3RvcmUtcmVzdWx0XCIpLmh0bWwoJycpO1xuICAgICAgICAgICAgaWYoaWZ5X2ZpbHRlcl9yZWdpb25fY2l0eSA9PSAxKVxuICAgICAgICAgICAgICAgIGZpbHRlcl9yZWdpb25fY2l0eShqUXVlcnkodGhpcykpXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmIChqUXVlcnkoJy5jaG9zZS1zZWFyY2gtc2x0JykudmFsKCkgPT0gJ2xvY2F0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoalF1ZXJ5KCcjZnJtLXN0b3JlbG9jYXRvci1zZWFyY2ggI2FkZHJlc3MnKS52YWwoKSAhPSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlYXJjaF9tb2RlID09IDEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZEdlb2xvY2F0aW9uQ291bnRyeSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaExvY2F0aW9uKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBmaW5kYnlUYWdzKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGpRdWVyeSgnLmNob3NlLXNlYXJjaC1zbHQnKS52YWwoKSA9PSAncHJvZHVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGpRdWVyeSgnI2ZybS1zdG9yZWxvY2F0b3Itc2VhcmNoICNwcm9kdWN0X3NlYXJjaCcpLnZhbCgpICE9ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hTdG9yZXNCeVByb2R1Y3RzKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaW5kYnlUYWdzKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGpRdWVyeSgnLmNob3NlLXNlYXJjaC1zbHQnKS52YWwoKSA9PSAnc3RvcmUnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChqUXVlcnkoJyNmcm0tc3RvcmVsb2NhdG9yLXNlYXJjaCAjc3RvcmVfc2VhcmNoJykudmFsKCkgIT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaFN0b3Jlc0J5TmFtZSgpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmluZGJ5VGFncygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGpRdWVyeShkb2N1bWVudCkub24oJ2NsaWNrJywgJyNnZXRieWxvY2FsJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGxvYWRHZW9sb2NhdGlvbkluaXQoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGpRdWVyeShkb2N1bWVudCkub24oJ2NsaWNrJywgJy5tYXAtdGFiLW1vYmlsZS1ibnQtaXRlbScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKGpRdWVyeSh0aGlzKS5oYXNDbGFzcygnYWN0aXZlJykgJiYgalF1ZXJ5KHRoaXMpLmRhdGEoJ3ZhbCcpID09ICdtYXAtdGFiLWdnbWFwJyAmJiBqUXVlcnkodGhpcykuZGF0YSgnem9vbScpKSB7XG4gICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBtYXAuc2V0Wm9vbShqUXVlcnkodGhpcykuZGF0YSgnem9vbScpKTtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgbWFwLmZpdEJvdW5kcyhib3VuZHMpO1xuICAgICAgICAgICAgfSwgMTApO1xuXG4gICAgICAgIH0pO1xuICAgICAgICBqUXVlcnkoZG9jdW1lbnQpLm9uKFwic3VibWl0XCIsXCIjZnJtLXN0b3JlbG9jYXRvci1zaG9ydC1zZWFyY2hcIixmdW5jdGlvbihlKSB7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZGluZ19tYXNrX2xvYWRlclwiKS5zdHlsZS5kaXNwbGF5ID0gJyc7XG5cbiAgICAgICAgICB2YXIgYWRkcmVzcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWRkcmVzc1wiKS52YWx1ZTtcbiAgICAgICAgICB2YXIgcmFkaXVzX3NlYXJjaCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmFkaXVzX3NlYXJjaFwiKS52YWx1ZTtcblxuICAgICAgICAgIGlmICgoYWRkcmVzcyA9PSAnJyB8fCBhZGRyZXNzID09IG51bGwpICYmIHZhbHMgPT0gXCJcIikge1xuICAgICAgICAgICAgLy9hbGVydCh0cmFuc1sncGxlYXNlX2VudGVyJ10pO1xuICAgICAgICAgICAgalF1ZXJ5KCcjYWRkcmVzcycpLmZvY3VzKCk7XG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvYWRpbmdfbWFza19sb2FkZXJcIikuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKChyYWRpdXNfc2VhcmNoID09ICcnIHx8IHJhZGl1c19zZWFyY2ggPT0gbnVsbCkgJiYgdmFscyA9PSBcIlwiKSB7XG4gICAgICAgICAgICAvL2FsZXJ0KCdQbGVhc2UgZW50ZXIgYSByYWRpdXMuJyk7XG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvYWRpbmdfbWFza19sb2FkZXJcIikuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIGZvY3VzX2NvdW50cnkgPSB7YWRkcmVzczogYWRkcmVzc307XG4gICAgICAgICAgaWYocHJpb3JpdHlfc2VhcmNoICE9ICdnbG9iYWwnKXtcbiAgICAgICAgICAgIGZvY3VzX2NvdW50cnkgPSB7YWRkcmVzczogYWRkcmVzcyxjb21wb25lbnRSZXN0cmljdGlvbnM6e2NvdW50cnk6IHByaW9yaXR5X3NlYXJjaCx9fTtcbiAgICAgICAgICB9XG4gICAgICAgICAgXG4gICAgICAgICAgdmFyIGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XG4gICAgICAgICAgZ2VvY29kZXIuZ2VvY29kZShmb2N1c19jb3VudHJ5LCBmdW5jdGlvbiAocmVzdWx0cywgc3RhdHVzKSB7XG4gICAgICAgICAgICBqUXVlcnkoJyNyZXN1bHRzLWVtcHR5JykuaHRtbCgnJyk7XG4gICAgICAgICAgICBpZiAoc3RhdHVzID09IGdvb2dsZS5tYXBzLkdlb2NvZGVyU3RhdHVzLk9LKSB7XG4gICAgICAgICAgICAgIHNlYXJjaExvY2F0aW9uc05lYXJTaG9ydChyZXN1bHRzWzBdKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZGluZ19tYXNrX2xvYWRlclwiKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0b3JlaWZ5LXN0b3JlbG9jdG9yLWNvbnRhY3RGcm1cIikuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICAgIGlmKGlmeV9sYXlvdXQgIT0gOCkgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJudW0tcnNcIikuaW5uZXJIVE1MID0gMDtcbiAgICAgICAgICAgICAgalF1ZXJ5KFwiI3N0b3JlaWZ5LXRleHQtcmVzdWx0XCIpLnRleHQoalF1ZXJ5KFwiI3N0b3JlaWZ5LXRleHQtcmVzdWx0XCIpLmRhdGEoJ3Jlc3VsdCcpKTtcbiAgICAgICAgICAgICAgalF1ZXJ5KCcjcmVzdWx0cy1zbHQgLmxpc3QtY3VzdG8tc3RvcmVpZnknKS5odG1sKCcnKTtcbiAgICAgICAgICAgICAgalF1ZXJ5KCcjcmVzdWx0cy1lbXB0eScpLmh0bWwoJzxoNSBjbGFzcz1cImFsZXJ0IGFsZXJ0LWRhbmdlclwiPicrc3RvcmVsb2NhdG9yX2xhbmcuc3RvcmVfbmVhciArJzxpPlwiJysgYWRkcmVzcysnXCI8L2k+PC9oNT4nKTtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9KTtcbiAgICAgICAgICBcblxuICAgICAgICB9KTtcbiAgICAgICAgalF1ZXJ5KGRvY3VtZW50KS5vbihcImtleWRvd25cIixcIiNmcm0tc3RvcmVsb2NhdG9yLXNlYXJjaCBpbnB1dFwiLGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICBpZiAoZS53aGljaCA9PSAxMykge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgalF1ZXJ5KFwiLnN0b3JlbG9jYXRvci1zdWJtaXQtc2VhcmNoXCIpLnRyaWdnZXIoXCJjbGlja1wiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBqUXVlcnkoZG9jdW1lbnQpLm9uKCdjbGljaycsICcubGlua2RldGFpbHN0b3JlJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgbGV0IGhyZWYgPSBqUXVlcnkodGhpcykuYXR0cihcImhyZWZcIik7XG4gICAgICAgICAgICBjb25zdCBiYXNlVXJsID0gd2luZG93LmxvY2F0aW9uLm9yaWdpbjtcbiAgICAgICAgICAgIGhyZWYgPSBocmVmLnJlcGxhY2UoYmFzZVVybCwgJycpO1xuICAgICAgICAgICAgaHJlZiA9IGhyZWYucmVwbGFjZSgnLy8nK2RhdGFBcHBzLnNob3BpZnlfZG9tYWluLCAnJyk7XG4gICAgICAgICAgICBpZihyb290X3VybCAhPSAnLycpXG4gICAgICAgICAgICAgICAgICAgIGhyZWYgPSByb290X3VybCArIGhyZWY7XG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IGhyZWY7XG4gICAgICAgIH0pO1xuICAgICAgICAvL1xuICAgICAgICBmdW5jdGlvbiBtb3ZlTWFwVXAoZGlzdGFuY2UgPSAxMDApIHtcbiAgICAgICAgICAvLyBUaGUgcGFuQnkgbWV0aG9kIHRha2VzIHggYW5kIHkgb2Zmc2V0cyBpbiBwaXhlbHNcbiAgICAgICAgICAvLyB4OiAwIG1lYW5zIG5vIGhvcml6b250YWwgbW92ZW1lbnRcbiAgICAgICAgICAvLyB5OiAtZGlzdGFuY2UgbWVhbnMgbW92aW5nIHVwd2FyZHMgKG5lZ2F0aXZlIHZhbHVlcyBtb3ZlIHVwKVxuICAgICAgICAgIGlmKG1hcCl7XG4gICAgICAgICAgICBtYXAucGFuQnkoMCwgLWRpc3RhbmNlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBqUXVlcnkoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgalF1ZXJ5KGRvY3VtZW50KS5vbihcImNsaWNrXCIsXCIjc3RvcmVpZnktc2wtYnRuLXRyaWdnZXItcG9wdXBcIixmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGpRdWVyeShcIiNzdG9yZWlmeS1zbC1saWdodC1tb2RhbC13cmFwcGVyXCIpLmFkZENsYXNzKCdzaG93Jyk7XG4gICAgICAgICAgICAgICAgaWYoalF1ZXJ5KFwiI3N0b3JlaWZ5LXNsLWxpZ2h0LW1vZGFsLXdyYXBwZXJcIikuZmluZCgnLnN0b3JlaWZ5LXNlYXItYm94JykubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICAgICAgaCA9IGpRdWVyeShcIiNzdG9yZWlmeS1zbC1saWdodC1tb2RhbC13cmFwcGVyXCIpLmZpbmQoJy5zdG9yZWlmeS1zZWFyLWJveCcpLmhlaWdodCgpKzU0MDtcbiAgICAgICAgICAgICAgICAgICAgalF1ZXJ5KCcjbWFwJykuaGVpZ2h0KGgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBqUXVlcnkoXCIjcmVzZXQtc2VhcmNoXCIpLnRyaWdnZXIoXCJjbGlja1wiKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBqUXVlcnkoZG9jdW1lbnQpLm9uKFwiY2xpY2tcIixcIi5zdG9yZWlmeS1zbC1saWdodC1tb2RhbC1jbG9zZS1pY29uXCIsZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBqUXVlcnkoXCIjc3RvcmVpZnktc2wtbGlnaHQtbW9kYWwtd3JhcHBlclwiKS5yZW1vdmVDbGFzcygnc2hvdycpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBqUXVlcnkoZG9jdW1lbnQpLm9uKFwiY2xpY2tcIixcIiNidG4tZmlsdGVyXCIsZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgaWYoIWpRdWVyeSh0aGlzKS5oYXNDbGFzcygnb3BlbicpKXtcbiAgICAgICAgICAgICAgICBqUXVlcnkodGhpcykuYWRkQ2xhc3MoJ29wZW4nKTtcbiAgICAgICAgICAgICAgICBqUXVlcnkodGhpcykubmV4dCgpLmFkZENsYXNzKCdvcGVuJyk7XG4gICAgICAgICAgICAgICAgaCA9IGpRdWVyeSgnI2ZpbHRlci1ncm91cCcpLmhlaWdodCgpO1xuICAgICAgICAgICAgICAgIGgyID0galF1ZXJ5KCcjbWFpbi1zbGlkZXItc3RvcmVsb2NhdG9yJykuaGVpZ2h0KCk7XG4gICAgICAgICAgICAgICAgdyA9IGpRdWVyeSggd2luZG93ICkud2lkdGgoKTtcbiAgICAgICAgICAgICAgICBpZih3ID4gNzIwKXtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1hcEhlaWdodCA9IGpRdWVyeSgnLm1hcF9jb250YWluZXIgI21hcCcpLmhlaWdodCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaDIgLSBoID4gMjAwKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGpRdWVyeSgnI21haW4tc2xpZGVyLXN0b3JlbG9jYXRvcicpLmhlaWdodChoMi1oKTtcbiAgICAgICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICBqUXVlcnkoJy5zdG9yZWlmeWFwcHMtc3RvcmVsb2NhdG9yLWVxdWFsJykuaGVpZ2h0KG1hcEhlaWdodCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBqUXVlcnkoJy5zdG9yZWlmeWFwcHMtc3RvcmVsb2NhdG9yLWVxdWFsJykuYWRkQ2xhc3MoJ2VxdWFsLXNjcm9sbCcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBoID0galF1ZXJ5KCcjZmlsdGVyLWdyb3VwJykuaGVpZ2h0KCk7XG4gICAgICAgICAgICAgICAgaDIgPSBqUXVlcnkoJyNtYWluLXNsaWRlci1zdG9yZWxvY2F0b3InKS5oZWlnaHQoKTtcbiAgICAgICAgICAgICAgICBpZih3ID4gNzIwICYmIGgyIDwgNDUwKXtcbiAgICAgICAgICAgICAgICAgIGpRdWVyeSgnI21haW4tc2xpZGVyLXN0b3JlbG9jYXRvcicpLmhlaWdodChoMitoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgalF1ZXJ5KCcuc3RvcmVpZnlhcHBzLXN0b3JlbG9jYXRvci1lcXVhbCcpLmhlaWdodCgnJyk7XG4gICAgICAgICAgICAgICAgalF1ZXJ5KCcuc3RvcmVpZnlhcHBzLXN0b3JlbG9jYXRvci1lcXVhbCcpLnJlbW92ZUNsYXNzKCdlcXVhbC1zY3JvbGwnKTtcbiAgICAgICAgICAgICAgICBqUXVlcnkodGhpcykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcbiAgICAgICAgICAgICAgICBqUXVlcnkoJyNmaWx0ZXItZ3JvdXAnKS5yZW1vdmVDbGFzcygnb3BlbicpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGpRdWVyeShkb2N1bWVudCkub24oJ2NsaWNrJywgJy50YWJsZS1zdG9yZS1tYXJrZXIgLmlmeS1jb2wtc2NoZWR1bGUgLnRpdGxlLXN0b3JlLWluZm8nLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGxldCBwYXJlbnQgPSBqUXVlcnkodGhpcykucGFyZW50KCk7XG4gICAgICAgICAgICAgICAgbGV0IGRpc3RhbmNlID0gcGFyZW50LmZpbmQoJy5jb250ZW50LXN0b3JlLWluZm8nKS5oZWlnaHQoKTtcblxuICAgICAgICAgICAgICAgIGlmKHBhcmVudC5oYXNDbGFzcyggXCJhY3RpdmVcIiApKXtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50LnJlbW92ZUNsYXNzKCBcImFjdGl2ZVwiIClcbiAgICAgICAgICAgICAgICAgICAgbW92ZU1hcFVwKDAgLSBkaXN0YW5jZSk7XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudC5hZGRDbGFzcyggXCJhY3RpdmVcIiApXG4gICAgICAgICAgICAgICAgICAgIG1vdmVNYXBVcChkaXN0YW5jZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vL3TDocK6wqFvIGZvcm0gY29udGFjdFxuICAgICAgICBmdW5jdGlvbiBjcmVhdGVGb3JtQ29udGFjdCh0aGF0KSB7XG4gICAgICAgICAgICBpZiAoalF1ZXJ5KCcjc3RvcmVpZnktc3RvcmVsb2N0b3ItY29udGFjdEZybScpLmxlbmd0aCkgcmV0dXJuO1xuICAgICAgICAgICAgY29uc3QgdG9rZW4gPSBqUXVlcnkoJyNmcm0tc3RvcmVsb2NhdG9yLXNlYXJjaCBpbnB1dFtuYW1lPVwiX3Rva2VuXCJdJykudmFsKCk7IC8vIC5hdHRyKCdjb250ZW50Jyk7XG4gICAgICAgICAgICBjb25zdCBzaG9waWZ5X2RvbWFpbiA9IGRhdGFBcHBzLnBlcm1hbmVudF9kb21haW47XG4gICAgICAgICAgICBjb25zdCBzdG9yZV9uYW1lID0gdGhhdC5wYXJlbnQoKS5wYXJlbnQoKS5maW5kKCcuc3RvcmUtbmFtZSBzdHJvbmcnKS50ZXh0KCk7XG4gICAgICAgICAgICBjb25zdCBzdG9yZV9pZCA9IHRoYXQuYXR0cignZGF0YS1zdG9yZScpO1xuICAgICAgICAgICAgY29uc3QgZW1haWwgPSB0aGF0LmF0dHIoJ2RhdGEtZW1haWwnKTtcbiAgICAgICAgICAgIGxldCBmb3JtSHRtbCA9IGBcbiAgICAgICAgICAgICAgICA8ZGl2IGlkPVwic3RvcmVpZnktc3RvcmVsb2N0b3ItY29udGFjdEZybVwiIGNsYXNzPVwic3RvcmVpZnktbW9kYWxcIiBzdHlsZT1cImRpc3BsYXk6IG5vbmU7XCI+XG5cbiAgICAgICAgICAgICAgICAgICAgPCEtLSBNb2RhbCBjb250ZW50IC0tPlxuXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdG9yZWlmeS1tb2RhbC1jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8Zm9ybSBpZD1cInN0b3JlaWZ5LWNvbnRhY3RGb3JtXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInN0b3JlaWZ5LW1vZGFsLWhlYWRlclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInN0b3JlaWZ5LWNsb3NlXCI+w4PigJQ8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdHJvbmcgY2xhc3M9XCJzdG9yZWlmeS10aXRsZS1tb2RlbFwiPiR7c3RvcmVsb2NhdG9yX2xhbmcuY29udGFjdF91c308L3N0cm9uZz5cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdG9yZWlmeS1tb2RhbC1ib2R5XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJzdG9yZWlmeS1zdWNjZXNzXCIgc3R5bGU9XCJkaXNwbGF5OiBub25lO1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInN0b3JlaWZ5LWFsZXJ0XCIgc3R5bGU9XCJkaXNwbGF5OiBub25lO1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInN0b3JlaWZ5LXN0b3JlbG9jYXRvci1oaWRkZW5cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cIl90b2tlblwiIHZhbHVlPVwiJHt0b2tlbn1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgdmFsdWU9XCIke2VtYWlsfVwiIG5hbWU9XCJyZWNpcGllbnRcIiBpZD1cInJlY2lwaWVudFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwic2hvcGlmeV9kb21haW5cIiB2YWx1ZT1cIiR7c2hvcGlmeV9kb21haW59XCIgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwic3RvcmVfbmFtZVwiIHZhbHVlPVwiJHtzdG9yZV9uYW1lfVwiID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cInN0b3JlX2lkXCIgdmFsdWU9XCIke3N0b3JlX2lkfVwiID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZHNldFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbD4ke3N0b3JlbG9jYXRvcl9sYW5nLmZ1bGxfbmFtZX0qPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgbmFtZT1cIm5hbWVcIiBpZD1cImlmeXN0b3JlbG9jYXRvcl9uYW1lXCIgdGl0bGU9XCJOYW1lXCIgdmFsdWU9XCJcIiBjbGFzcz1cImZpZWxkX19pbnB1dCByZXF1aXJlZC1lbnRyeVwiIHR5cGU9XCJ0ZXh0XCIgcGxhY2Vob2xkZXI9XCJGdWxsIE5hbWUqXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmaWVsZHNldFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbD4ke3N0b3JlbG9jYXRvcl9sYW5nLmVtYWlsfSo8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCBuYW1lPVwic3RvcmVfZW1haWxcIiBpZD1cImlmeXN0b3JlbG9jYXRvcl9lbWFpbFwiIHRpdGxlPVwiRW1haWxcIiB2YWx1ZT1cIlwiIGNsYXNzPVwiZmllbGRfX2lucHV0IHJlcXVpcmVkLWVudHJ5XCIgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cIiR7c3RvcmVsb2NhdG9yX2xhbmcuZW1haWx9KlwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmllbGRzZXRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWw+JHtzdG9yZWxvY2F0b3JfbGFuZy50ZWxlcGhvbmV9PC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgbmFtZT1cInRlbGVwaG9uZVwiIGlkPVwidGVsZXBob25lXCIgdGl0bGU9XCJUZWxlcGhvbmVcIiB2YWx1ZT1cIlwiIGNsYXNzPVwiZmllbGRfX2lucHV0IHJlcXVpcmVkLWVudHJ5XCIgdHlwZT1cInRleHRcIiBwbGFjZWhvbGRlcj1cIiR7c3RvcmVsb2NhdG9yX2xhbmcudGVsZXBob25lfVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmllbGRzZXRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWw+JHtzdG9yZWxvY2F0b3JfbGFuZy5jb21tZW50fSo8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZXh0YXJlYSBuYW1lPVwiY29tbWVudFwiIGlkPVwiaWZ5c3RvcmVsb2NhdG9yX2NvbW1lbnRcIiB0aXRsZT1cIkNvbW1lbnRcIiBjbGFzcz1cInJlcXVpcmVkLWVudHJ5IGZpZWxkX19pbnB1dFwiIGNvbHM9XCI1XCIgcm93cz1cIjNcIiBwbGFjZWhvbGRlcj1cIiR7c3RvcmVsb2NhdG9yX2xhbmcuY29tbWVudH0qXCI+PC90ZXh0YXJlYT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3RvcmVpZnktbW9kYWwtZm9vdGVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwicmVxdWlyZWRcIj4qICR7c3RvcmVsb2NhdG9yX2xhbmcucmVxdWlyZWR9PC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGlkPVwiYm50Q29udGFjdHN1Ym1pdGJ5c3RvcmVcIiB0eXBlPVwic3VibWl0XCIgdGl0bGU9XCJTdWJtaXRcIiBjbGFzcz1cImJ1dHRvbiBidG4gYnRuIGJ0bi1wcmltYXJ5LXN0b3JlaWZ5XCI+JHtzdG9yZWxvY2F0b3JfbGFuZy5zdWJtaXR9PC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIGA7XG4gICAgICAgICAgICBqUXVlcnkoJ2JvZHknKS5hcHBlbmQoZm9ybUh0bWwpO1xuICAgICAgICAgICAgaWZ5RmllbGRzY29udGFjdEZybSA9IHtcbiAgICAgICAgICAgICAgICBuYW1lOiB7XG4gICAgICAgICAgICAgICAgICAgIGlucHV0OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaWZ5c3RvcmVsb2NhdG9yX25hbWUnKSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlcnJvci1uYW1lJyksXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHN0b3JlbG9jYXRvcl9sYW5nLm5hbWVfcmVxdWlyZWRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGVtYWlsOiB7XG4gICAgICAgICAgICAgICAgICAgIGlucHV0OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaWZ5c3RvcmVsb2NhdG9yX2VtYWlsJyksXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZXJyb3ItZW1haWwnKSxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogc3RvcmVsb2NhdG9yX2xhbmcuZW1haWxfcmVxdWlyZWQsXG4gICAgICAgICAgICAgICAgICAgIGludmFsaWQ6IHN0b3JlbG9jYXRvcl9sYW5nLmVtYWlsX2Zvcm1hdFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29tbWVudDoge1xuICAgICAgICAgICAgICAgICAgICBpbnB1dDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lmeXN0b3JlbG9jYXRvcl9jb21tZW50JyksXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZXJyb3ItY29tbWVudCcpLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBzdG9yZWxvY2F0b3JfbGFuZy5jb21tZW50X3JlcXVpcmVkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgaWZ5RmllbGRzY29udGFjdEZybSA9IHtcbiAgICAgICAgICAgIG5hbWU6IHtcbiAgICAgICAgICAgICAgICBpbnB1dDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2lmeXN0b3JlbG9jYXRvcl9uYW1lJyksXG4gICAgICAgICAgICAgICAgZXJyb3I6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlcnJvci1uYW1lJyksXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogc3RvcmVsb2NhdG9yX2xhbmcubmFtZV9yZXF1aXJlZFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVtYWlsOiB7XG4gICAgICAgICAgICAgICAgaW5wdXQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpZnlzdG9yZWxvY2F0b3JfZW1haWwnKSxcbiAgICAgICAgICAgICAgICBlcnJvcjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Vycm9yLWVtYWlsJyksXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogc3RvcmVsb2NhdG9yX2xhbmcuZW1haWxfcmVxdWlyZWQsXG4gICAgICAgICAgICAgICAgaW52YWxpZDogc3RvcmVsb2NhdG9yX2xhbmcuZW1haWxfZm9ybWF0XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29tbWVudDoge1xuICAgICAgICAgICAgICAgIGlucHV0OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaWZ5c3RvcmVsb2NhdG9yX2NvbW1lbnQnKSxcbiAgICAgICAgICAgICAgICBlcnJvcjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Vycm9yLWNvbW1lbnQnKSxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBzdG9yZWxvY2F0b3JfbGFuZy5jb21tZW50X3JlcXVpcmVkXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGVtYWlsUmVnZXggPSAvXlteXFxzQF0rQFteXFxzQF0rXFwuW15cXHNAXSskLztcbiAgICAgICAgLy8gc2hvdyBlcnJvciAoYXBwZW5kKVxuICAgICAgICBmdW5jdGlvbiBpZnlzaG93RXJyb3IoaW5wdXQsIG1lc3NhZ2UpIHtcbiAgICAgICAgICAgIGlmeXJlbW92ZUVycm9yKGlucHV0KTsgLy8gdHLDg8KhbmggZHVwbGljYXRlXG5cbiAgICAgICAgICAgIGNvbnN0IGVycm9yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc21hbGwnKTtcbiAgICAgICAgICAgIGVycm9yLmNsYXNzTmFtZSA9ICdlcnJvci1tZXNzYWdlJztcbiAgICAgICAgICAgIGVycm9yLnRleHRDb250ZW50ID0gbWVzc2FnZTtcblxuICAgICAgICAgICAgaW5wdXQuY2xhc3NMaXN0LmFkZCgnZXJyb3InKTtcbiAgICAgICAgICAgIGlucHV0LnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQoZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcmVtb3ZlIGVycm9yXG4gICAgICAgIGZ1bmN0aW9uIGlmeXJlbW92ZUVycm9yKGlucHV0KSB7XG4gICAgICAgICAgICBpbnB1dC5jbGFzc0xpc3QucmVtb3ZlKCdlcnJvcicpO1xuXG4gICAgICAgICAgICBjb25zdCBlcnJvciA9IGlucHV0LnBhcmVudE5vZGUucXVlcnlTZWxlY3RvcignLmVycm9yLW1lc3NhZ2UnKTtcbiAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGVycm9yLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gdmFsaWRhdGUgZmllbGRcbiAgICAgICAgZnVuY3Rpb24gaWZ5dmFsaWRhdGVGaWVsZChrZXkpIHtcbiAgICAgICAgICAgIGNvbnN0IGZpZWxkUGFyYW1zID0gaWZ5RmllbGRzY29udGFjdEZybVtrZXldO1xuICAgICAgICAgICAgY29uc3QgZmllbGQgPSBmaWVsZFBhcmFtcy5pbnB1dDtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gZmllbGQudmFsdWUudHJpbSgpO1xuXG4gICAgICAgICAgICBpZiAodmFsdWUgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgaWZ5c2hvd0Vycm9yKGZpZWxkLCBmaWVsZFBhcmFtcy5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdlbWFpbCcgJiYgIWVtYWlsUmVnZXgudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBpZnlzaG93RXJyb3IoZmllbGQsIGZpZWxkUGFyYW1zLmludmFsaWQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWZ5cmVtb3ZlRXJyb3IoZmllbGQpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBqUXVlcnkoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuaWZ5LWl0ZW0tYnRuLWNvbnRhY3Qgc3BhbicsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBjb25zdCBjb250YWN0TW9kYWwgPSBqUXVlcnkoJyNzdG9yZWlmeS1zdG9yZWxvY3Rvci1jb250YWN0RnJtJyk7XG4gICAgICAgICAgICBjb25zdCB0aGF0ID0galF1ZXJ5KHRoaXMpO1xuICAgICAgICAgICAgaWYgKGNvbnRhY3RNb2RhbC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjb250YWN0TW9kYWwuc2hvdygpO1xuICAgICAgICAgICAgICAgIGpRdWVyeSgnI3N0b3JlaWZ5LXN0b3JlbG9jdG9yLWNvbnRhY3RGcm0gaW5wdXRbbmFtZT1cIl90b2tlblwiXScpLnZhbChqUXVlcnkoJyNmcm0tc3RvcmVsb2NhdG9yLXNlYXJjaCBpbnB1dFtuYW1lPVwiX3Rva2VuXCJdJykudmFsKCkpOyAvLyAuYXR0cignY29udGVudCcpO1xuICAgICAgICAgICAgICAgIGpRdWVyeSgnI3N0b3JlaWZ5LXN0b3JlbG9jdG9yLWNvbnRhY3RGcm0gaW5wdXRbbmFtZT1cInNob3BpZnlfZG9tYWluXCJdJykudmFsKGRhdGFBcHBzLnBlcm1hbmVudF9kb21haW4pO1xuICAgICAgICAgICAgICAgIGpRdWVyeSgnI3N0b3JlaWZ5LXN0b3JlbG9jdG9yLWNvbnRhY3RGcm0gaW5wdXRbbmFtZT1cInN0b3JlX25hbWVcIl0nKS52YWwodGhhdC5wYXJlbnQoKS5wYXJlbnQoKS5maW5kKCcuc3RvcmUtbmFtZSBzdHJvbmcnKS50ZXh0KCkpO1xuICAgICAgICAgICAgICAgIGpRdWVyeSgnI3N0b3JlaWZ5LXN0b3JlbG9jdG9yLWNvbnRhY3RGcm0gaW5wdXRbbmFtZT1cInN0b3JlX2lkXCJdJykudmFsKHRoYXQuYXR0cignZGF0YS1zdG9yZScpKTtcbiAgICAgICAgICAgICAgICBqUXVlcnkoJyNzdG9yZWlmeS1zdG9yZWxvY3Rvci1jb250YWN0RnJtIGlucHV0W25hbWU9XCJyZWNpcGllbnRcIl0nKS52YWwodGhhdC5hdHRyKCdkYXRhLWVtYWlsJykpO1xuXG4gICAgICAgICAgICAgICAgalF1ZXJ5KCcjc3RvcmVpZnktc3RvcmVsb2N0b3ItY29udGFjdEZybSAuc3RvcmVpZnktc3VjY2VzcycpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICBqUXVlcnkoJyNzdG9yZWlmeS1zdG9yZWxvY3Rvci1jb250YWN0RnJtIC5zdG9yZWlmeS1hbGVydCcpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICBqUXVlcnkoJy5zdG9yZWlmeS1zdG9yZWxvY2F0b3ItaGlkZGVuJykuY3NzKFwidmlzaWJpbGl0eVwiLCBcInZpc2libGVcIik7XG4gICAgICAgICAgICAgICAgalF1ZXJ5KCcjc3RvcmVpZnktc3RvcmVsb2N0b3ItY29udGFjdEZybSAuc3RvcmVpZnktbW9kYWwtZm9vdGVyJykuc2hvdygpO1xuICAgICAgICAgICAgICAgIGpRdWVyeSgnI3N0b3JlaWZ5LXN0b3JlbG9jdG9yLWNvbnRhY3RGcm0gLmVycm9yLW1lc3NhZ2UnKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICBqUXVlcnkoJyNzdG9yZWlmeS1zdG9yZWxvY3Rvci1jb250YWN0RnJtIC5maWVsZF9faW5wdXQgJykucmVtb3ZlQ2xhc3MoJ2Vycm9yJykucHJvcCgncmVhZG9ubHknLCBmYWxzZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNyZWF0ZUZvcm1Db250YWN0KHRoYXQpO1xuICAgICAgICAgICAgICAgIGpRdWVyeSgnI3N0b3JlaWZ5LXN0b3JlbG9jdG9yLWNvbnRhY3RGcm0nKS5zaG93KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBmb3JtU3RvcmVpZnlDb250YWN0Rm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdG9yZWlmeS1jb250YWN0Rm9ybScpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBkYXRhQXBwcyAhPT0gJ3VuZGVmaW5lZCcgJiYgZGF0YUFwcHMucmVjYXB0Y2hhX2VuYWJsZWQgIT09IHVuZGVmaW5lZCAmJiBkYXRhQXBwcy5yZWNhcHRjaGFfZW5hYmxlZCAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdG9yZWlmeV9yZWNhcHRjaGFSZXNwb25zZScpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlY2FwdGNoYUlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICAgICAgICAgICAgICAgICAgcmVjYXB0Y2hhSW5wdXQudHlwZSA9ICdoaWRkZW4nO1xuICAgICAgICAgICAgICAgICAgICByZWNhcHRjaGFJbnB1dC5uYW1lID0gJ3JlY2FwdGNoYV9yZXNwb25zZSc7XG4gICAgICAgICAgICAgICAgICAgIHJlY2FwdGNoYUlucHV0LmlkID0gJ3N0b3JlaWZ5X3JlY2FwdGNoYVJlc3BvbnNlJztcbiAgICAgICAgICAgICAgICAgICAgZm9ybVN0b3JlaWZ5Q29udGFjdEZvcm0uYXBwZW5kQ2hpbGQocmVjYXB0Y2hhSW5wdXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGdyZWNhcHRjaGEgIT09ICd1bmRlZmluZWQnICYmIGdyZWNhcHRjaGEuZXhlY3V0ZSkge1xuICAgICAgICAgICAgICAgICAgICBncmVjYXB0Y2hhLmV4ZWN1dGUoZGF0YUFwcHMucmVjYXB0Y2hhX2VuYWJsZWQsIHsgYWN0aW9uOiAnY29udGFjdCcgfSkudGhlbihmdW5jdGlvbiAodG9rZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdG9yZWlmeV9yZWNhcHRjaGFSZXNwb25zZScpLnZhbHVlID0gdG9rZW47XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChmb3JtU3RvcmVpZnlDb250YWN0Rm9ybSkge1xuICAgICAgICAgICAgICAgIGZvcm1TdG9yZWlmeUNvbnRhY3RGb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGUudGFyZ2V0Lm1hdGNoZXMoJ2lucHV0LCB0ZXh0YXJlYScpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZnlyZW1vdmVFcnJvcihlLnRhcmdldCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGZvcm1TdG9yZWlmeUNvbnRhY3RGb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlLnRhcmdldC5tYXRjaGVzKCdpbnB1dCwgdGV4dGFyZWEnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWZ5cmVtb3ZlRXJyb3IoZS50YXJnZXQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cblxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgalF1ZXJ5KGRvY3VtZW50KS5vbignY2xpY2snLCAnI3N0b3JlaWZ5LWNvbnRhY3RGb3JtIC5zdG9yZWlmeS1jbG9zZScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBqUXVlcnkoJyNzdG9yZWlmeS1zdG9yZWxvY3Rvci1jb250YWN0RnJtJykuaGlkZSgpO1xuICAgICAgICB9KTtcbiAgICAgICAgalF1ZXJ5KGRvY3VtZW50KS5vbihcImNsaWNrXCIsIFwiI2JudENvbnRhY3RzdWJtaXRieXN0b3JlXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBqUXVlcnkoXCIjc3RvcmVpZnktY29udGFjdEZvcm0gLmZpZWxkX19pbnB1dCBcIikucHJvcCgncmVhZG9ubHknLCB0cnVlKTtcbiAgICAgICAgICAgIGpRdWVyeShcIiNzdG9yZWlmeS1jb250YWN0Rm9ybSAjYm50Q29udGFjdHN1Ym1pdGJ5c3RvcmVcIikucHJvcCgnZGlzYWJsZWQnLCB0cnVlKTtcbiAgICAgICAgICAgIGxldCBpc1ZhbGlkID0gdHJ1ZTtcblxuICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIGlmeUZpZWxkc2NvbnRhY3RGcm0pIHtcbiAgICAgICAgICAgICAgICBpZiAoIWlmeXZhbGlkYXRlRmllbGQoa2V5KSkge1xuICAgICAgICAgICAgICAgICAgICBpc1ZhbGlkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFpc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgalF1ZXJ5KFwiI3N0b3JlaWZ5LWNvbnRhY3RGb3JtIC5maWVsZF9faW5wdXQgXCIpLnByb3AoJ3JlYWRvbmx5JywgZmFsc2UpO1xuICAgICAgICAgICAgICAgIGpRdWVyeShcIiNzdG9yZWlmeS1jb250YWN0Rm9ybSAjYm50Q29udGFjdHN1Ym1pdGJ5c3RvcmVcIikucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgalF1ZXJ5LmFqYXhTZXR1cCh7XG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICAnWC1DU1JGLVRPS0VOJzogalF1ZXJ5KCdpbnB1dFtuYW1lPVwiX3Rva2VuXCJdJykudmFsKClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBkYXRhID0galF1ZXJ5KCcjc3RvcmVpZnktY29udGFjdEZvcm0nKS5zZXJpYWxpemUoKTtcbiAgICAgICAgICAgIGpRdWVyeS5hamF4KHtcbiAgICAgICAgICAgICAgICB1cmw6IHN0b3JlaWZ5X2FwcF9wcm94eV91cmwgKyAnL3NlbmQtYWpheCcsXG4gICAgICAgICAgICAgICAgdHlwZTogXCJHRVRcIixcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICAgICAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICAgICAgICB9KS5kb25lKGZ1bmN0aW9uIChyZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgLy9zdG9yZWlmeS1hbGVydFxuICAgICAgICAgICAgICAgIGpRdWVyeShcIiNzdG9yZWlmeS1jb250YWN0Rm9ybSAuZmllbGRfX2lucHV0IFwiKS5wcm9wKCdyZWFkb25seScsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICBqUXVlcnkoXCIjc3RvcmVpZnktY29udGFjdEZvcm0gI2JudENvbnRhY3RzdWJtaXRieXN0b3JlXCIpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHRzLmVycm9yID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgalF1ZXJ5KCcjc3RvcmVpZnktY29udGFjdEZvcm0gLnN0b3JlaWZ5LXN1Y2Nlc3MnKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcmVzdWx0cy5tZXNzID09ICdvYmplY3QnKVxuICAgICAgICAgICAgICAgICAgICAgICAgalF1ZXJ5KCcjc3RvcmVpZnktY29udGFjdEZvcm0gLnN0b3JlaWZ5LWFsZXJ0JykuaHRtbCgnKiBSZXF1aXJlZCBGaWVsZHMnKTtcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgalF1ZXJ5KCcjc3RvcmVpZnktY29udGFjdEZvcm0gLnN0b3JlaWZ5LWFsZXJ0JykuaHRtbChyZXN1bHRzLm1lc3MpO1xuICAgICAgICAgICAgICAgICAgICBqUXVlcnkoJyNzdG9yZWlmeS1jb250YWN0Rm9ybSAuc3RvcmVpZnktYWxlcnQnKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgalF1ZXJ5KCcjc3RvcmVpZnktY29udGFjdEZvcm0gLnN0b3JlaWZ5LWFsZXJ0JykuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICBqUXVlcnkoJyNzdG9yZWlmeS1jb250YWN0Rm9ybSAuc3RvcmVpZnktc3VjY2VzcycpLmh0bWwocmVzdWx0cy5tZXNzKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgIGpRdWVyeSgnLnN0b3JlaWZ5LXN0b3JlbG9jYXRvci1oaWRkZW4nKS5jc3MoXCJ2aXNpYmlsaXR5XCIsIFwiaGlkZGVuXCIpO1xuICAgICAgICAgICAgICAgICAgICBqUXVlcnkoJyNzdG9yZWlmeS1jb250YWN0Rm9ybSAuc3RvcmVpZnktYWxlcnQsI3N0b3JlaWZ5LWNvbnRhY3RGb3JtIC5zdG9yZWlmeS1tb2RhbC1mb290ZXInKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9KS5mYWlsKGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pOy8vZW5kIFxuXG5cbiAgICAgICAgaWYoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0b3JlaWZ5LWRldGFpbC1zdG9yZScpKVxuICAgICAgICB7ICAgXG4gICAgICAgICAgICAvL3RyYW5zIHRoZW8gbG9jYWxlXG4gICAgICAgICAgICBpZihpc0lmeVRyYW5zICYmIGRhdGFBcHBzLmxvY2FsZV9kZXRhaWwgIT09IHVuZGVmaW5lZCAmJiBkYXRhQXBwcy5sb2NhbGVfZGV0YWlsW2xvY2FsZUN1cnJlbnRdICE9PSB1bmRlZmluZWQpe1xuXG4gICAgICAgICAgICAgICAgY29uc3QgZGV0YWlsVHJhbnMgPSBkYXRhQXBwcy5sb2NhbGVfZGV0YWlsW2xvY2FsZUN1cnJlbnRdO1xuICAgICAgICAgICAgICAgIGpRdWVyeSgnLnN0b3JlaWZ5LWRldGFpbHMtY29udGVudCAuaGVhZGVyLXN0b3JlLW5hbWUnKS50ZXh0KGRldGFpbFRyYW5zLm5hbWUpO1xuICAgICAgICAgICAgICAgIGpRdWVyeSgnLnN0b3JlaWZ5LWRldGFpbHMtY29udGVudCAuZW50cnktaXRlbS1hZGRyZXNzLWxpbmsnKS50ZXh0KGRldGFpbFRyYW5zLmFkZHJlc3MpO1xuICAgICAgICAgICAgICAgIGpRdWVyeSgnLnN0b3JlaWZ5LWRldGFpbHMtY29udGVudCAuc3RvcmVpZnktc3RvcmUtdGFncy1saXN0JykuaHRtbChpZnlSZW5kZXJUYWdzRGV0YWlsKGRldGFpbFRyYW5zLnRhZ3MpKTtcbiAgICAgICAgICAgICAgICBqUXVlcnkoJy5zdG9yZWlmeS1kZXRhaWxzLWNvbnRlbnQgLnN0b3JlLWRldGFpbC1jb250ZW50JykuaHRtbChkZXRhaWxUcmFucy5kZXNjcmlwdGlvbik7XG4gICAgICAgICAgICAgICAgalF1ZXJ5KCcjaWZ5X3RyYW5zX2RldGFpbF9zdHlsZXMnKS5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZ1bmN0aW9uIGlmeVJlbmRlclRhZ3NEZXRhaWwodGFncyl7XG4gICAgICAgICAgICAgICAgaWYodGFncy5sZW5ndGggPT0gMClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgICAgIGxldCBodG1sVGFncyA9ICcnO1xuICAgICAgICAgICAgICAgIGpRdWVyeS5lYWNoKHRhZ3MsIGZ1bmN0aW9uKGksIHZhbCkge1xuICAgICAgICAgICAgICAgICAgICBodG1sVGFncyArPSAnPHNwYW4gY2xhc3M9XCJ0YWctaXRlbSB0YWctaXRlbS0nK3N0cmluZ190b19zbHVnKHZhbCkrJ1wiPjxpIGNsYXNzPVwiZmEgZmEtY2hlY2tcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+ICcgKyB2YWwgKyAnPC9zcGFuPic7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGh0bWxUYWdzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9lbmRcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNoZWNrTWFwTG9hZERldGFpbCgpe1xuICAgICAgICAgICAgICBpZiAodHlwZW9mIGdvb2dsZSA9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChjaGVja01hcExvYWREZXRhaWwpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGluaXRpYWxpemUoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgc3RvcmVpZnlfZGV0YWlsID0gZGF0YUFwcHMuc3RvcmVpZnlfZGV0YWlsO1xuICAgICAgICAgICAgdmFyIGRldGFpbF96b29tID0gZGF0YUFwcHMuZGV0YWlsX3pvb207XG4gICAgICAgICAgICB2YXIgbGF5b3V0ID0gZGF0YUFwcHMubGF5b3V0O1xuICAgICAgICAgICAgdmFyIGljb25fbWFya2VyID0gZGF0YUFwcHMuaWNvbl9tYXJrZXI7XG4gICAgICAgICAgICB2YXIgZGlyZWN0aW9uc0Rpc3BsYXk7XG4gICAgICAgICAgICB2YXIgZGlyZWN0aW9uc1NlcnZpY2U7XG4gICAgICAgICAgICB2YXIgbWFwX2RldGFpbDtcbiAgICAgICAgICAgIHZhciBzdHJlZXRfdmlldztcbiAgICAgICAgICAgIHZhciBwYW5vcmFtYTtcbiAgICAgICAgICAgIHZhciBtYXJrZXJzID0ge307XG4gICAgICAgICAgICB2YXIgaW5mb1dpbmRvd19kZXRhaWw7XG4gICAgICAgICAgICB2YXIgcmVkX2ljb24gPSAnaHR0cDovL21hcHMuZ29vZ2xlLmNvbS9tYXBmaWxlcy9tcy9pY29ucy9yZWQtZG90LnBuZyc7XG4gICAgICAgICAgICB2YXIgcHVycGxlX2ljb24gPSAnaHR0cDovL21hcHMuZ29vZ2xlLmNvbS9tYXBmaWxlcy9tcy9pY29ucy9wdXJwbGUtZG90LnBuZyc7XG4gICAgICAgICAgICBjaGVja01hcExvYWREZXRhaWwoKTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gaW5pdGlhbGl6ZSgpXG4gICAgICAgICAgICB7ICAgdmFyIGxhdCA9IHN0b3JlaWZ5X2RldGFpbC5sYXQ7XG4gICAgICAgICAgICAgICAgdmFyIGxuZyA9IHN0b3JlaWZ5X2RldGFpbC5sb25nO1xuICAgICAgICAgICAgICAgIHZhciBhZGRyZXNzID0gc3RvcmVpZnlfZGV0YWlsLmFkZHJlc3MsXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uc0Rpc3BsYXkgPSBuZXcgZ29vZ2xlLm1hcHMuRGlyZWN0aW9uc1JlbmRlcmVyKCk7XG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uc1NlcnZpY2UgPSBuZXcgZ29vZ2xlLm1hcHMuRGlyZWN0aW9uc1NlcnZpY2UoKTtcbiAgICAgICAgICAgICAgICB2YXIgc3RvcmVMYXRsbmcgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKGxhdCwgbG5nKTtcbiAgICAgICAgICAgICAgICB2YXIgVmlld0NvbnRyb2wgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHZhciBzdHlsZWRNYXBUeXBlID0gbmV3IGdvb2dsZS5tYXBzLlN0eWxlZE1hcFR5cGUoSlNPTi5wYXJzZShCNjQuZGVjb2RlKG1hcF9zdHlsZV9yZW5kZXIpKSk7XG4gICAgICAgICAgICAgICAgaWYgKGxheW91dCA9PSAyKSBWaWV3Q29udHJvbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIG1hcF9kZXRhaWwgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFwXCIpLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY2VudGVyOiBzdG9yZUxhdGxuZyxcbiAgICAgICAgICAgICAgICAgICAgem9vbTogZGV0YWlsX3pvb20sXG4gICAgICAgICAgICAgICAgICAgIG1hcFR5cGVJZDogJ3JvYWRtYXAnLFxuICAgICAgICAgICAgICAgICAgICBtYXBUeXBlQ29udHJvbDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIG1hcFR5cGVDb250cm9sT3B0aW9uczpcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IGdvb2dsZS5tYXBzLk1hcFR5cGVDb250cm9sU3R5bGUuRFJPUERPV05fTUVOVVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBzdHJlZXRWaWV3Q29udHJvbDogVmlld0NvbnRyb2xcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIG1hcF9kZXRhaWwubWFwVHlwZXMuc2V0KCdzdHlsZWRfbWFwJywgc3R5bGVkTWFwVHlwZSk7XG4gICAgICAgICAgICAgICAgbWFwX2RldGFpbC5zZXRNYXBUeXBlSWQoJ3N0eWxlZF9tYXAnKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb25zRGlzcGxheS5zZXRNYXAobWFwX2RldGFpbCk7XG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uc0Rpc3BsYXkuc2V0UGFuZWwoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RpcmVjdGlvbnMtcGFuZWwnKSk7XG4gICAgICAgICAgICAgICAgdmFyIGNvbnRyb2wgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RvcmUtaW5mby1wb3B1cCcpO1xuICAgICAgICAgICAgICAgIC8vY29udHJvbC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgICAgICAgICBtYXBfZGV0YWlsLmNvbnRyb2xzW2dvb2dsZS5tYXBzLkNvbnRyb2xQb3NpdGlvbi5UT1BfUklHSFRdLnB1c2goY29udHJvbCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoYWRkcmVzcy5sZW5ndGggIT0gMClcbiAgICAgICAgICAgICAgICB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGljb25fbWFya2VyICE9ICcnKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaWNvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IGljb25fbWFya2VyLCAvLyB1cmxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY2FsZWRTaXplOiBuZXcgZ29vZ2xlLm1hcHMuU2l6ZSgzMCwgMzApLCAvLyBzY2FsZWQgc2l6ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG9yaWdpbjogbmV3IGdvb2dsZS5tYXBzLlBvaW50KDAsMCksIC8vIG9yaWdpblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFuY2hvcjogbmV3IGdvb2dsZS5tYXBzLlBvaW50KDAsIDApIC8vIGFuY2hvclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHN0b3JlTGF0bG5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogbWFwX2RldGFpbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogYWRkcmVzcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uOiBpY29uXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHN0b3JlTGF0bG5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogbWFwX2RldGFpbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogYWRkcmVzc1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpbmZvV2luZG93X2RldGFpbCA9IG5ldyBnb29nbGUubWFwcy5JbmZvV2luZG93KCk7XG5cbiAgICAgICAgICAgICAgICBsb2NhdGlvbkRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RvcmVpZnlfbG9jYXRpb25cIik7XG4gICAgICAgICAgICAgICAgaWYoIWxvY2F0aW9uRGl2KSBsb2NhdGlvbkRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9jYXRpb25cIik7XG5cbiAgICAgICAgICAgICAgICB2YXIgc2VhcmNoQm94ID0gbmV3IGdvb2dsZS5tYXBzLnBsYWNlcy5TZWFyY2hCb3goZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0YXJ0JykpO1xuICAgICAgICAgICAgICAgIHZhciBwYW5vcmFtYU9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBzdG9yZUxhdGxuZyxcbiAgICAgICAgICAgICAgICAgICAgcG92OlxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBoZWFkaW5nOiAzNCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBpdGNoOiAxMFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBpZiAobGF5b3V0ID09IDEpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBzdHJlZXRfdmlldyA9IG5ldyBnb29nbGUubWFwcy5TdHJlZXRWaWV3UGFub3JhbWEoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0cmVldF92aWV3JyksIHBhbm9yYW1hT3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgICAgIG1hcF9kZXRhaWwuc2V0U3RyZWV0VmlldyhzdHJlZXRfdmlldyk7XG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdHJlZXRfdmlldycpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAvL2xheW91dCAyXG4gICAgICAgICAgICAgICAgICAgIHBhbm9yYW1hID0gbWFwX2RldGFpbC5nZXRTdHJlZXRWaWV3KCk7XG4gICAgICAgICAgICAgICAgICAgIHBhbm9yYW1hLnNldFBvc2l0aW9uKHN0b3JlTGF0bG5nKTtcbiAgICAgICAgICAgICAgICAgICAgcGFub3JhbWEuc2V0UG92KCAvKiogQHR5cGUge2dvb2dsZS5tYXBzLlN0cmVldFZpZXdQb3Z9ICovIChcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGluZzogMjY1LFxuICAgICAgICAgICAgICAgICAgICAgICAgcGl0Y2g6IDBcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvKnZhciBhZGRNYXJrZXIgPSBnb29nbGUubWFwcy5ldmVudC5hZGRMaXN0ZW5lcihtYXBfZGV0YWlsLCAnY2xpY2snLCBmdW5jdGlvbiAoZSlcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGNsb3NlQWxsSW5mb1dpbmRvdygpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbGF0ID0gZS5sYXRMbmcubGF0KCk7IC8vIGxhdCBvZiBjbGlja2VkIHBvaW50XG4gICAgICAgICAgICAgICAgICAgIHZhciBsbmcgPSBlLmxhdExuZy5sbmcoKTsgLy8gbG5nIG9mIGNsaWNrZWQgcG9pbnRcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hcmtlcklkID0gZ2V0TWFya2VyVW5pcXVlSWQobGF0LCBsbmcpOyAvLyBhbiB0aGF0IHdpbGwgYmUgdXNlZCB0byBjYWNoZSB0aGlzIG1hcmtlciBpbiBtYXJrZXJzIG9iamVjdC5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWFya2VyO1xuICAgICAgICAgICAgICAgICAgICB2YXIgaHRtbCA9ICcnO1xuXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGljb25fbWFya2VyICE9ICcnKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaWNvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmw6IHdpbmRvdy5pY29uX21hcmtlciwgLy8gdXJsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NhbGVkU2l6ZTogbmV3IGdvb2dsZS5tYXBzLlNpemUoNDAsIDQwKSwgLy8gc2NhbGVkIHNpemVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBvcmlnaW46IG5ldyBnb29nbGUubWFwcy5Qb2ludCgwLDApLCAvLyBvcmlnaW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhbmNob3I6IG5ldyBnb29nbGUubWFwcy5Qb2ludCgwLCAwKSAvLyBhbmNob3JcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcihcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogZ2V0TGF0TG5nKGxhdCwgbG5nKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXA6IG1hcF9kZXRhaWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiBnb29nbGUubWFwcy5BbmltYXRpb24uRFJPUCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ21hcmtlcl8nICsgbWFya2VySWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbjogaWNvblxuXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBnZXRMYXRMbmcobGF0LCBsbmcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogbWFwX2RldGFpbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IGdvb2dsZS5tYXBzLkFuaW1hdGlvbi5EUk9QLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnbWFya2VyXycgKyBtYXJrZXJJZCxcblxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZ2VvY29kZXIuZ2VvY29kZShcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2xvY2F0aW9uJzogZ2V0TGF0TG5nKGxhdCwgbG5nKVxuICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAocmVzdWx0cywgc3RhdHVzKVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhyZXN1bHRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXMgPT09ICdPSycpXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdHNbMF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgY29uc29sZS5sb2cocmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxkaXYgY2xhc3M9XCJzdG9yZS1tYXJrZXJcIiBzdHlsZT1cInBhZGRpbmc6IDVweCAxNXB4IDE1cHggMDtcIj4nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBodG1sICs9ICc8c3Ryb25nPicgKyByZXN1bHRzWzBdLmZvcm1hdHRlZF9hZGRyZXNzICsgJzwvc3Ryb25nPic7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gJzwvZGl2Pic7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFya2VyLmh0bWwgPSBodG1sO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXJzW21hcmtlcklkXSA9IG1hcmtlcjsgLy8gY2FjaGUgbWFya2VyIGluIG1hcmtlcnMgb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm9XaW5kb3dfZGV0YWlsID0gbmV3IGdvb2dsZS5tYXBzLkluZm9XaW5kb3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mb1dpbmRvd19kZXRhaWwuc2V0Q29udGVudChodG1sKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5mb1dpbmRvd19kZXRhaWwub3BlbihtYXBfZGV0YWlsLCBtYXJrZXIpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5hbGVydChcInt7IGFkZHNsYXNoZXMoX18oJ25vX3Jlc3VsdCcpKSB9fVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmFsZXJ0KFwie3sgYWRkc2xhc2hlcyhfXygnZ2VvY29kZXJfZmFpbGVkJykpIH19XCIgKyBzdGF0dXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYmluZE1hcmtlcmluZm8obWFya2VyKTtcbiAgICAgICAgICAgICAgICAgICAgYmluZE1hcmtlckV2ZW50cyhtYXJrZXIpOyAvLyBiaW5kIHJpZ2h0IGNsaWNrIGV2ZW50IHRvIG1hcmtlclxuICAgICAgICAgICAgICAgIH0pOyovXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgXG5cbiAgICAgICAgICAgIHZhciBnZXRNYXJrZXJVbmlxdWVJZCA9IGZ1bmN0aW9uIChsYXQsIGxuZylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGF0ICsgJ18nICsgbG5nO1xuICAgICAgICAgICAgfTtcblxuXG4gICAgICAgICAgICB2YXIgZ2V0TGF0TG5nID0gZnVuY3Rpb24gKGxhdCwgbG5nKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKGxhdCwgbG5nKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGNsb3NlQWxsSW5mb1dpbmRvdygpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpbmZvX3dpbmRvdyAhPSAndW5kZWZpbmVkJylcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGluZm9fd2luZG93LmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaW5mb1dpbmRvd19kZXRhaWwgIT0gJ3VuZGVmaW5lZCcpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBpbmZvV2luZG93X2RldGFpbC5jbG9zZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEJpbmRzICBjbGljayBldmVudCB0byBnaXZlbiBtYXJrZXIgYW5kIGludm9rZXMgYSBjYWxsYmFjayBmdW5jdGlvbiB0aGF0IHdpbGwgcmVtb3ZlIHRoZSBtYXJrZXIgZnJvbSBtYXAuXG4gICAgICAgICAgICAgKiBAcGFyYW0geyFnb29nbGUubWFwcy5NYXJrZXJ9IG1hcmtlciBBIGdvb2dsZS5tYXBzLk1hcmtlciBpbnN0YW5jZSB0aGF0IHRoZSBoYW5kbGVyIHdpbGwgYmluZGVkLlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICAvKnZhciBiaW5kTWFya2VyaW5mbyA9IGZ1bmN0aW9uIChtYXJrZXIpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZ29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIobWFya2VyLCBcImNsaWNrXCIsIGZ1bmN0aW9uIChwb2ludClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGNsb3NlQWxsSW5mb1dpbmRvdygpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWFya2VySWQgPSBnZXRNYXJrZXJVbmlxdWVJZChwb2ludC5sYXRMbmcubGF0KCksIHBvaW50LmxhdExuZy5sbmcoKSk7IC8vIGdldCBtYXJrZXIgaWQgYnkgdXNpbmcgY2xpY2tlZCBwb2ludCdzIGNvb3JkaW5hdGVcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hcmtlciA9IG1hcmtlcnNbbWFya2VySWRdOyAvLyBmaW5kIG1hcmtlclxuICAgICAgICAgICAgICAgICAgICBpbmZvV2luZG93X2RldGFpbCA9IG5ldyBnb29nbGUubWFwcy5JbmZvV2luZG93KCk7XG4gICAgICAgICAgICAgICAgICAgIGluZm9XaW5kb3dfZGV0YWlsLnNldENvbnRlbnQobWFya2VyLmh0bWwpO1xuICAgICAgICAgICAgICAgICAgICBpbmZvV2luZG93X2RldGFpbC5vcGVuKG1hcF9kZXRhaWwsIG1hcmtlcik7XG4gICAgICAgICAgICAgICAgICAgIC8vIHJlbW92ZU1hcmtlcihtYXJrZXIsIG1hcmtlcklkKTsgLy8gcmVtb3ZlIGl0XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9OyovXG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQmluZHMgcmlnaHQgY2xpY2sgZXZlbnQgdG8gZ2l2ZW4gbWFya2VyIGFuZCBpbnZva2VzIGEgY2FsbGJhY2sgZnVuY3Rpb24gdGhhdCB3aWxsIHJlbW92ZSB0aGUgbWFya2VyIGZyb20gbWFwLlxuICAgICAgICAgICAgICogQHBhcmFtIHshZ29vZ2xlLm1hcHMuTWFya2VyfSBtYXJrZXIgQSBnb29nbGUubWFwcy5NYXJrZXIgaW5zdGFuY2UgdGhhdCB0aGUgaGFuZGxlciB3aWxsIGJpbmRlZC5cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgLyp2YXIgYmluZE1hcmtlckV2ZW50cyA9IGZ1bmN0aW9uIChtYXJrZXIpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZ29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIobWFya2VyLCBcInJpZ2h0Y2xpY2tcIiwgZnVuY3Rpb24gKHBvaW50KVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1hcmtlcklkID0gZ2V0TWFya2VyVW5pcXVlSWQocG9pbnQubGF0TG5nLmxhdCgpLCBwb2ludC5sYXRMbmcubG5nKCkpOyAvLyBnZXQgbWFya2VyIGlkIGJ5IHVzaW5nIGNsaWNrZWQgcG9pbnQncyBjb29yZGluYXRlXG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXJrZXIgPSBtYXJrZXJzW21hcmtlcklkXTsgLy8gZmluZCBtYXJrZXJcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlTWFya2VyKG1hcmtlciwgbWFya2VySWQpOyAvLyByZW1vdmUgaXRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgcmVtb3ZlTWFya2VyID0gZnVuY3Rpb24gKG1hcmtlciwgbWFya2VySWQpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbWFya2VyLnNldE1hcChudWxsKTsgLy8gc2V0IG1hcmtlcnMgc2V0TWFwIHRvIG51bGwgdG8gcmVtb3ZlIGl0IGZyb20gbWFwXG4gICAgICAgICAgICAgICAgZGVsZXRlIG1hcmtlcnNbbWFya2VySWRdOyAvLyBkZWxldGUgbWFya2VyIGluc3RhbmNlIGZyb20gbWFya2VycyBvYmplY3RcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBqUXVlcnkoZG9jdW1lbnQpLm9uKCdjbGljaycsICcjYm50RGlyZWN0aW9uJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBzdGFydCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdGFydCcpLnZhbHVlO1xuICAgICAgICAgICAgICAgIHZhciBzZWxlY3RlZE1vZGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kZScpLnZhbHVlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdmFyIHJlcXVlc3QgPSB7XG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbjpzdGFydCxcbiAgICAgICAgICAgICAgICAgICAgZGVzdGluYXRpb246c3RvcmVpZnlfZGV0YWlsLmFkZHJlc3MsXG4gICAgICAgICAgICAgICAgICAgIHRyYXZlbE1vZGU6IGdvb2dsZS5tYXBzLlRyYXZlbE1vZGVbc2VsZWN0ZWRNb2RlXSxcbiAgICAgICAgICAgICAgICAgICAgdW5pdFN5c3RlbTogZ29vZ2xlLm1hcHMuVW5pdFN5c3RlbS5NRVRSSUMgICAgICAgIH07XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uc1NlcnZpY2Uucm91dGUocmVxdWVzdCwgZnVuY3Rpb24ocmVzcG9uc2UsIHN0YXR1cykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzID09IGdvb2dsZS5tYXBzLkRpcmVjdGlvbnNTdGF0dXMuT0spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbnNEaXNwbGF5LnNldERpcmVjdGlvbnMocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTsqL1xuICAgICAgICAgICAgalF1ZXJ5KGRvY3VtZW50KS5vbignY2xpY2snLCAnI3RvZ2dsZVN0cmVldFZpZXcnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRvZ2dsZSA9IHBhbm9yYW1hLmdldFZpc2libGUoKTtcbiAgICAgICAgICAgICAgICBpZiAodG9nZ2xlID09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICBwYW5vcmFtYS5zZXRWaXNpYmxlKHRydWUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBwYW5vcmFtYS5zZXRWaXNpYmxlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9IFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBjb25zdCBpZnlGaWVsZHNjb250YWN0RnJtID0ge1xuICAgICAgICAgICAgLy8gICAgIG5hbWU6IHtcbiAgICAgICAgICAgIC8vICAgICAgICAgaW5wdXQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpZnlzdG9yZWxvY2F0b3JfbmFtZScpLFxuICAgICAgICAgICAgLy8gICAgICAgICBlcnJvcjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Vycm9yLW5hbWUnKSxcbiAgICAgICAgICAgIC8vICAgICAgICAgbWVzc2FnZTogc3RvcmVsb2NhdG9yX2xhbmcubmFtZV9yZXF1aXJlZFxuICAgICAgICAgICAgLy8gICAgIH0sXG4gICAgICAgICAgICAvLyAgICAgZW1haWw6IHtcbiAgICAgICAgICAgIC8vICAgICAgICAgaW5wdXQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpZnlzdG9yZWxvY2F0b3JfZW1haWwnKSxcbiAgICAgICAgICAgIC8vICAgICAgICAgZXJyb3I6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlcnJvci1lbWFpbCcpLFxuICAgICAgICAgICAgLy8gICAgICAgICBtZXNzYWdlOiBzdG9yZWxvY2F0b3JfbGFuZy5lbWFpbF9yZXF1aXJlZCxcbiAgICAgICAgICAgIC8vICAgICAgICAgaW52YWxpZDogc3RvcmVsb2NhdG9yX2xhbmcuZW1haWxfZm9ybWF0XG4gICAgICAgICAgICAvLyAgICAgfSxcbiAgICAgICAgICAgIC8vICAgICBjb21tZW50OiB7XG4gICAgICAgICAgICAvLyAgICAgICAgIGlucHV0OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaWZ5c3RvcmVsb2NhdG9yX2NvbW1lbnQnKSxcbiAgICAgICAgICAgIC8vICAgICAgICAgZXJyb3I6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdlcnJvci1jb21tZW50JyksXG4gICAgICAgICAgICAvLyAgICAgICAgIG1lc3NhZ2U6IHN0b3JlbG9jYXRvcl9sYW5nLmNvbW1lbnRfcmVxdWlyZWRcbiAgICAgICAgICAgIC8vICAgICB9XG4gICAgICAgICAgICAvLyB9O1xuICAgICAgICAgICAgLy8gY29uc3QgZW1haWxSZWdleCA9IC9eW15cXHNAXStAW15cXHNAXStcXC5bXlxcc0BdKyQvO1xuICAgICAgICAgICAgLy8gLy8gc2hvdyBlcnJvciAoYXBwZW5kKVxuICAgICAgICAgICAgLy8gZnVuY3Rpb24gaWZ5c2hvd0Vycm9yKGlucHV0LCBtZXNzYWdlKSB7XG4gICAgICAgICAgICAvLyAgICAgaWZ5cmVtb3ZlRXJyb3IoaW5wdXQpOyAvLyB0csODwqFuaCBkdXBsaWNhdGVcblxuICAgICAgICAgICAgLy8gICAgIGNvbnN0IGVycm9yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc21hbGwnKTtcbiAgICAgICAgICAgIC8vICAgICBlcnJvci5jbGFzc05hbWUgPSAnZXJyb3ItbWVzc2FnZSc7XG4gICAgICAgICAgICAvLyAgICAgZXJyb3IudGV4dENvbnRlbnQgPSBtZXNzYWdlO1xuXG4gICAgICAgICAgICAvLyAgICAgaW5wdXQuY2xhc3NMaXN0LmFkZCgnZXJyb3InKTtcbiAgICAgICAgICAgIC8vICAgICBpbnB1dC5wYXJlbnROb2RlLmFwcGVuZENoaWxkKGVycm9yKTtcbiAgICAgICAgICAgIC8vIH1cblxuICAgICAgICAgICAgLy8gLy8gcmVtb3ZlIGVycm9yXG4gICAgICAgICAgICAvLyBmdW5jdGlvbiBpZnlyZW1vdmVFcnJvcihpbnB1dCkge1xuICAgICAgICAgICAgLy8gICAgIGlucHV0LmNsYXNzTGlzdC5yZW1vdmUoJ2Vycm9yJyk7XG5cbiAgICAgICAgICAgIC8vICAgICBjb25zdCBlcnJvciA9IGlucHV0LnBhcmVudE5vZGUucXVlcnlTZWxlY3RvcignLmVycm9yLW1lc3NhZ2UnKTtcbiAgICAgICAgICAgIC8vICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgIC8vICAgICAgICAgZXJyb3IucmVtb3ZlKCk7XG4gICAgICAgICAgICAvLyAgICAgfVxuICAgICAgICAgICAgLy8gfVxuXG4gICAgICAgICAgICAvLyAvLyB2YWxpZGF0ZSBmaWVsZFxuICAgICAgICAgICAgLy8gZnVuY3Rpb24gaWZ5dmFsaWRhdGVGaWVsZChrZXkpIHtcbiAgICAgICAgICAgIC8vICAgICBjb25zdCBmaWVsZFBhcmFtcyA9IGlmeUZpZWxkc2NvbnRhY3RGcm1ba2V5XTtcbiAgICAgICAgICAgIC8vICAgICBjb25zdCBmaWVsZCA9IGZpZWxkUGFyYW1zLmlucHV0O1xuICAgICAgICAgICAgLy8gICAgIGNvbnN0IHZhbHVlID0gZmllbGQudmFsdWUudHJpbSgpO1xuXG4gICAgICAgICAgICAvLyAgICAgaWYgKHZhbHVlID09PSAnJykge1xuICAgICAgICAgICAgLy8gICAgICAgICBpZnlzaG93RXJyb3IoZmllbGQsIGZpZWxkUGFyYW1zLm1lc3NhZ2UpO1xuICAgICAgICAgICAgLy8gICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAvLyAgICAgfVxuXG4gICAgICAgICAgICAvLyAgICAgaWYgKGtleSA9PT0gJ2VtYWlsJyAmJiAhZW1haWxSZWdleC50ZXN0KHZhbHVlKSkge1xuICAgICAgICAgICAgLy8gICAgICAgICBpZnlzaG93RXJyb3IoZmllbGQsIGZpZWxkUGFyYW1zLmludmFsaWQpO1xuICAgICAgICAgICAgLy8gICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAvLyAgICAgfVxuXG4gICAgICAgICAgICAvLyAgICAgaWZ5cmVtb3ZlRXJyb3IoZmllbGQpO1xuICAgICAgICAgICAgLy8gICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgY29uc3QgZm9ybVN0b3JlaWZ5Q29udGFjdEZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RvcmVpZnktY29udGFjdEZvcm0nKTtcbiAgICAgICAgICAgIGlmIChmb3JtU3RvcmVpZnlDb250YWN0Rm9ybSkge1xuICAgICAgICAgICAgICAgIGZvcm1TdG9yZWlmeUNvbnRhY3RGb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGUudGFyZ2V0Lm1hdGNoZXMoJ2lucHV0LCB0ZXh0YXJlYScpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZnlyZW1vdmVFcnJvcihlLnRhcmdldCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGZvcm1TdG9yZWlmeUNvbnRhY3RGb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlLnRhcmdldC5tYXRjaGVzKCdpbnB1dCwgdGV4dGFyZWEnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWZ5cmVtb3ZlRXJyb3IoZS50YXJnZXQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBqUXVlcnkoZG9jdW1lbnQpLm9uKFwiY2xpY2tcIixcIiNibnRDb250YWN0c3VibWl0XCIsZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGpRdWVyeShcIiNzdG9yZWlmeS1jb250YWN0Rm9ybSAuZmllbGRfX2lucHV0IFwiKS5wcm9wKCdyZWFkb25seScsIHRydWUpO1xuICAgICAgICAgICAgICAgIGpRdWVyeShcIiNzdG9yZWlmeS1jb250YWN0Rm9ybSAjYm50Q29udGFjdHN1Ym1pdFwiKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgICAgICAgICAgICAgIGxldCBpc1ZhbGlkID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiBpZnlGaWVsZHNjb250YWN0RnJtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaWZ5dmFsaWRhdGVGaWVsZChrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc1ZhbGlkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYoIWlzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgalF1ZXJ5KFwiI3N0b3JlaWZ5LWNvbnRhY3RGb3JtIC5maWVsZF9faW5wdXQgXCIpLnByb3AoJ3JlYWRvbmx5JywgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICBqUXVlcnkoXCIjc3RvcmVpZnktY29udGFjdEZvcm0gI2JudENvbnRhY3RzdWJtaXRcIikucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBqUXVlcnkuYWpheFNldHVwKHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1gtQ1NSRi1UT0tFTic6IGpRdWVyeSgnaW5wdXRbbmFtZT1cIl90b2tlblwiXScpLnZhbCgpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IGpRdWVyeSgnI3N0b3JlaWZ5LWNvbnRhY3RGb3JtJykuc2VyaWFsaXplKCk7XG4gICAgICAgICAgICAgICAgalF1ZXJ5LmFqYXgoe1xuICAgICAgICAgICAgICAgICAgICB1cmw6IHN0b3JlaWZ5X2FwcF9wcm94eV91cmwgKyAnL3NlbmQtYWpheCcsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiR0VUXCIsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgICAgICAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxuICAgICAgICAgICAgICAgIH0pLmRvbmUoZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICAgICAgICAgICAgLy9zdG9yZWlmeS1hbGVydFxuICAgICAgICAgICAgICAgICAgalF1ZXJ5KFwiI3N0b3JlaWZ5LWNvbnRhY3RGb3JtIC5maWVsZF9faW5wdXQgXCIpLnByb3AoJ3JlYWRvbmx5JywgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgalF1ZXJ5KFwiI3N0b3JlaWZ5LWNvbnRhY3RGb3JtICNibnRDb250YWN0c3VibWl0XCIpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgaWYocmVzdWx0cy5lcnJvciA9PSB0cnVlKXtcbiAgICAgICAgICAgICAgICAgICAgalF1ZXJ5KCcjc3RvcmVpZnktY29udGFjdEZvcm0gLnN0b3JlaWZ5LXN1Y2Nlc3MnKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmKHR5cGVvZiByZXN1bHRzLm1lc3MgPT0gJ29iamVjdCcpXG4gICAgICAgICAgICAgICAgICAgICAgalF1ZXJ5KCcjc3RvcmVpZnktY29udGFjdEZvcm0gLnN0b3JlaWZ5LWFsZXJ0JykuaHRtbCgnKiBSZXF1aXJlZCBGaWVsZHMnKTsgXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICBqUXVlcnkoJyNzdG9yZWlmeS1jb250YWN0Rm9ybSAuc3RvcmVpZnktYWxlcnQnKS5odG1sKHJlc3VsdHMubWVzcyk7XG4gICAgICAgICAgICAgICAgICAgIGpRdWVyeSgnI3N0b3JlaWZ5LWNvbnRhY3RGb3JtIC5zdG9yZWlmeS1hbGVydCcpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICBqUXVlcnkoJyNzdG9yZWlmeS1jb250YWN0Rm9ybSAuc3RvcmVpZnktYWxlcnQnKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGpRdWVyeSgnI3N0b3JlaWZ5LWNvbnRhY3RGb3JtIC5zdG9yZWlmeS1zdWNjZXNzJykuaHRtbChyZXN1bHRzLm1lc3MpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgalF1ZXJ5KCcuc3RvcmVpZnktc3RvcmVsb2NhdG9yLWhpZGRlbicpLmNzcyhcInZpc2liaWxpdHlcIixcImhpZGRlblwiKTtcbiAgICAgICAgICAgICAgICAgICAgalF1ZXJ5KCcjc3RvcmVpZnktY29udGFjdEZvcm0gLnN0b3JlaWZ5LWFsZXJ0LCNzdG9yZWlmeS1jb250YWN0Rm9ybSAuc3RvcmVpZnktbW9kYWwtZm9vdGVyJykuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0pLmZhaWwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBqUXVlcnkoZG9jdW1lbnQpLm9uKFwiY2xpY2tcIixcIi5zdG9yZWxvY2F0b3ItcGFnZWQgLnBhZ2UtaXRlbVwiLGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBqUXVlcnkoJy5zdG9yZWlmeS1saXN0LXByb2R1Y3QnKS5hZGRDbGFzcygnbG9hZC1hamF4Jyk7XG4gICAgICAgICAgICAgICAgdmFyIGlkID0galF1ZXJ5KCcuc3RvcmVsb2NhdG9yLXBhZ2VkJykuZGF0YSgnaWQnKTtcbiAgICAgICAgICAgICAgICB2YXIgY291bnQgPSBqUXVlcnkoJy5zdG9yZWxvY2F0b3ItcGFnZWQnKS5kYXRhKCdjb3VudCcpO1xuICAgICAgICAgICAgICAgIHZhciBwYWdlID0gMTtcbiAgICAgICAgICAgICAgICB2YXIgYnRuQ2xpY2sgPSBqUXVlcnkodGhpcykuZGF0YSgncGFnZScpO1xuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50ID0galF1ZXJ5KCcuc3RvcmVsb2NhdG9yLXBhZ2VkIC5wYWdlLWl0ZW0tYnRuLmFjdGl2ZScpLmRhdGEoJ3BhZ2UnKTtcbiAgICAgICAgICAgICAgICBpZihidG5DbGljayAhPSAnbmV4dCcgJiYgYnRuQ2xpY2sgIT0gJ3ByZScpe1xuICAgICAgICAgICAgICAgICAgIHBhZ2UgPSBidG5DbGljaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYoYnRuQ2xpY2sgPT0gJ25leHQnKXtcbiAgICAgICAgICAgICAgICAgICBwYWdlID0gY3VycmVudCArIDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmKGJ0bkNsaWNrID09ICdwcmV2Jyl7XG4gICAgICAgICAgICAgICAgICAgcGFnZSA9IGN1cnJlbnQgLSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBqUXVlcnkoJy5zdG9yZWxvY2F0b3ItcGFnZWQgLnBhZ2UtaXRlbScpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICAgICBqUXVlcnkoJy5zdG9yZWxvY2F0b3ItcGFnZWQgLnBhZ2UtaXRlbS0nK3BhZ2UpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICAgICBpZihwYWdlID4gMSAmJiBwYWdlIDwgY291bnQpe1xuICAgICAgICAgICAgICAgICAgalF1ZXJ5KCcuc3RvcmVsb2NhdG9yLXBhZ2VkIC5wYWdlLWNvbnRyb2wnKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmKHBhZ2UgPT0gMSl7XG4gICAgICAgICAgICAgICAgICBqUXVlcnkoJy5zdG9yZWxvY2F0b3ItcGFnZWQgLnBhZ2UtbmV4dCcpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYocGFnZSA9PSBjb3VudCl7XG4gICAgICAgICAgICAgICAgICBqUXVlcnkoJy5zdG9yZWxvY2F0b3ItcGFnZWQgLnBhZ2UtcHJlJykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBqUXVlcnkuYWpheCh7XG4gICAgICAgICAgICAgICAgICAgIHVybDogc3RvcmVpZnlfYXBwX3Byb3h5X3VybCArICcvbG9hZC1wYWdlJyxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJHRVRcIixcbiAgICAgICAgICAgICAgICAgICAgZGF0YToge2lkOmlkLHBhZ2U6cGFnZX0sXG4gICAgICAgICAgICAgICAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwiaHRtbFwiLFxuICAgICAgICAgICAgICAgIH0pLmRvbmUoZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICAgICAgICAgICAgLy9zdG9yZWlmeS1hbGVydFxuICAgICAgICAgICAgICAgICAgalF1ZXJ5KCBcImRpdi5jb250ZW50LXN0b3JlLXByb2R1Y3RzXCIgKS5zY3JvbGxUb3AoIDAgKTtcbiAgICAgICAgICAgICAgICAgIGpRdWVyeShbZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCBkb2N1bWVudC5ib2R5XSkuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbFRvcDogalF1ZXJ5KFwiZGl2LnN0b3JlaWZ5LWxpc3QtcHJvZHVjdFwiKS5vZmZzZXQoKS50b3BcbiAgICAgICAgICAgICAgICAgIH0sIDUwMCk7XG4gICAgICAgICAgICAgICAgICBqUXVlcnkoJy5zdG9yZWlmeS1saXN0LXByb2R1Y3QnKS5yZW1vdmVDbGFzcygnbG9hZC1hamF4Jyk7XG4gICAgICAgICAgICAgICAgICBpZihqUXVlcnkoJy5jb250ZW50LXN0b3JlLXByb2R1Y3RzIC5zdG9yZWlmeS1mbGV4JykubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICBqUXVlcnkoJy5jb250ZW50LXN0b3JlLXByb2R1Y3RzIC5zdG9yZWlmeS1mbGV4JykuaHRtbChyZXN1bHRzKVxuICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBqUXVlcnkoJy5zdG9yZWlmeS1wcm9kdWN0cy1ncmlkJykuaHRtbChyZXN1bHRzKVxuICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfSkuZmFpbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgalF1ZXJ5KCcuc3RvcmVpZnktbGlzdC1wcm9kdWN0JykucmVtb3ZlQ2xhc3MoJ2xvYWQtYWpheCcpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBqUXVlcnkoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuc3RvcmVpZnktc2wtZGV0YWlscyAuYmFjay1zdG9yZXMgYScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgbGV0IGhyZWYgPSBqUXVlcnkodGhpcykuYXR0cihcImhyZWZcIik7XG4gICAgICAgICAgICAgICAgaHJlZiA9IGhyZWYucmVwbGFjZSgnaHR0cHM6Ly8nK2RhdGFBcHBzLnNob3BpZnlfZG9tYWluLCAnJyk7XG4gICAgICAgICAgICAgICAgaHJlZiA9IGhyZWYucmVwbGFjZSgnaHR0cHM6Ly8nK2RhdGFBcHBzLnBlcm1hbmVudF9kb21haW4sICcnKTtcbiAgICAgICAgICAgICAgICBpZihyb290X3VybCAhPSAnLycpXG4gICAgICAgICAgICAgICAgICAgICAgICBocmVmID0gcm9vdF91cmwgKyBocmVmO1xuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gaHJlZjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IC8vZW5kIGRldGFpbFxuXG4gICAgfTsgLy9lbmQgc3RvcmVpZnlhcHBzSmF2YVNjcmlwdFxuXG4gICAgXG4gICAgXG4gICAgaWYgKHR5cGVvZiBqUXVlcnkgPT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIGpRdWVyeS5mbi5vbiA9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIGxvYWRTY3JpcHQoJy8vY29kZS5qcXVlcnkuY29tL2pxdWVyeS0zLjcuMS5taW4uanMnLCBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgc3RvcmVpZnlBUFBTID0galF1ZXJ5Lm5vQ29uZmxpY3QodHJ1ZSk7XG5cbiAgICAgICAgICAgIHN0b3JlaWZ5QVBQUyhkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc3RvcmVpZnlhcHBzSmF2YVNjcmlwdChzdG9yZWlmeUFQUFMpO1xuXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9KTtcblxuICAgIH0gZWxzZSB7XG5cbiAgICAgICAgc3RvcmVpZnlhcHBzSmF2YVNjcmlwdChqUXVlcnkpO1xuXG4gICAgfVxuXG59KSgpOyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztFQUNBLENBQUMsQ0FBQyxXQUFXOztFQUViLElBQUksZUFBZSxhQUFhLEdBQUc7RUFDbkMsUUFBUSxNQUFNLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTtFQUM3QyxRQUFRLE1BQU0sR0FBRyxHQUFHLE1B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QUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0dBQWdHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FB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
