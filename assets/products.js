(function () {

    class Products {
        constructor() {
            const variantData = document.getElementById(
                'ProductVariants'
            );
            
            if (!variantData) return;

            this.selects = document.querySelectorAll('.single-option-selector'),
            this.variants = JSON.parse(variantData.textContent),
            this.moneyFormat = variantData.getAttribute('data-money-format'),
            this.productTitle = variantData.getAttribute('data-product-title'),
            this.productType = variantData.getAttribute('data-product-type'),
            this.hideDefaultTitle = false,
            this.soldOut = variantData.getAttribute('data-sold-out'),
            this.unavailable = variantData.getAttribute('data-unavailable');

            if(variantData.getAttribute('data-hide-default-title') == 'true') {
                this.hideDefaultTitle = true;
            }
            document.addEventListener('DOMContentLoaded', this.updateVariantSelection.bind(this));

            document.addEventListener('colour:changed', (event) => {
                this.updateVariant();
            });
            
            document.addEventListener('measurement:changed', (event) => {
                this.updateVariant();
            });
        }

        updateVariantSelection() {        

            this.selects.forEach(select => {
                select.addEventListener('change', this.updateVariant.bind(this));
            });
                  
            this.updateVariant();
        }

        updateVariant() {
            const selectedOptions = Array.from(this.selects).map(select => select.value);
            const variant = this.variants.find(variant =>
                variant.options.every(
                    (option, index) => option === selectedOptions[index]
                )
            );
            
            this.checkVariant(variant);

            if (!variant) return;

            // Update hidden variant ID
            const variantInput = document.querySelector(
            'form[action="/cart/add"] select[name="id"]'
            );

            if (variantInput) {
                variantInput.value = variant.id;
            }
            
            // Carpets are priced by width x length, so recalculate from the new variant rather than showing its unit price
            if (this.productType == 'Carpets' || this.productType == 'Vinyl' || this.productType == 'Artificial Grass') {
                updatePrice();
                return;
            }

            // Update price
            let productPrice = document.querySelector('#product-price .product-price');
            if (productPrice) {
                productPrice.textContent = Shopify.formatMoney(variant.price, this.moneyFormat);
                $('.update-on-change').html(Shopify.formatMoney(variant.price, this.moneyFormat));
            }
            
        }

        checkVariant(variant) {
            if (variant) {
                if (variant.available) { // Enabling add to cart button.
                    // If item is backordered yet can still be ordered, we'll show special message.
                    if (variant.inventory_management && variant.inventory_quantity <= 0) {
                        if(this.hideDefaultTitle) {
                            document.querySelector('#selected-variant').textContent = `${this.productTitle}`;
                        } else {
                            document.querySelector('#selected-variant').textContent = `${this.productTitle} - ${variant.title}`;
                        }

                        
                        document.querySelector('#backorder').classList.remove("hidden");
                    } else {
                        document.querySelector('#backorder').classList.add("hidden");
                    }
                } else { // Variant is sold out.
                    document.querySelector('#backorder').classList.add("hidden");

                    let cartButton = document.querySelector('#AddToCart');
                    if(this.productType == 'Carpets' || this.productType == 'Vinyl' || this.productType == 'Artificial Grass') {
                        cartButton = document.querySelector('#carpetAddToCart');
                    }
                    if(cartButton) {
                        cartButton.value = this.soldOut;
                        cartButton.classList.add('disabled');
                        cartButton.disabled = true;
                    }
                }
                updatePrice();
                
                if(this.productType == 'Carpets' || this.productType == 'Vinyl' || this.productType == 'Artificial Grass') {
                    updateSampleAvailability();    
                }

                if(jQuery('#first_load').val() != 'false' || !jQuery('.option-colour #select-option-colour').length) {
                    var selectedOption = jQuery('#product-select').find('option:selected'),
                        stock_level = selectedOption.data('stocklevel'),
                        deliveryestimate = selectedOption.data('deliveryestimate');
                        selectedOption.data('quantity');
                        var is_in_stock = selectedOption.data('instock'),
                        variantid = selectedOption.attr('value');
                    
                        
                    if(is_in_stock > 0 ) {
                        if(stock_level == 'Yes') {
                            jQuery('#stockLevel').removeClass().addClass('limitedStock').html('<i class="icon-instock"></i> Order Now');
                            jQuery('#properties_stockLevel').val('Order Now');
                        }
                        else {
                            jQuery('#stockLevel').removeClass().addClass('inStock').html('<i class="icon-instock"></i> In stock');
                            jQuery('#properties_stockLevel').val('In stock');
                        }
                        jQuery('#carpetAddToCart').removeClass('disabled').removeAttr('disabled').html('Add to Basket');
                        jQuery('#AddToCart').removeClass('disabled').removeAttr('disabled').html('Add to Basket');
                        jQuery('#fake-add-card-btn').removeClass('disabled').removeAttr('disabled').html('Add to Basket');
                    }
                    else {
                        jQuery('#stockLevel').removeClass().addClass('outOfStock').html('<i class="icon-outofstock"></i> Out of stock');
                        jQuery('#properties_stockLevel').val('Out of stock');
                        jQuery('#carpetAddToCart').addClass('disabled').attr('disabled', true).html('Out of Stock');
                        jQuery('#AddToCart').addClass('disabled').attr('disabled', true).html('Out of Stock');
                        jQuery('#fake-add-card-btn').addClass('disabled').attr('disabled', true).html('Out of Stock');
                    }

                    if (deliveryestimate) {
                    //  jQuery('#deliveryEstimate').html('<span class="location__icon icon icon"><img src="{{ 'icon-location.svg' | asset_url }}" alt="location"></span> ' + deliveryestimate);
                        jQuery('#properties_deliveryEstimate').val(deliveryestimate);
                    }

                    jQuery('#properties_variantID').val(variantid);
                }
                jQuery('#first_load').val(true);
            } else {
                // variant doesn't exist.
                jQuery('#backorder').addClass('hidden');
                jQuery('#AddToCart').val(this.unavailable).addClass('disabled').prop('disabled', true);
            }
        }

    }
    new Products();

})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZHVjdHMuanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9zY3JpcHRzL3Byb2R1Y3RzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFByb2R1Y3RzIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgY29uc3QgdmFyaWFudERhdGEgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcbiAgICAgICAgICAgICdQcm9kdWN0VmFyaWFudHMnXG4gICAgICAgICk7XG4gICAgICAgIFxuICAgICAgICBpZiAoIXZhcmlhbnREYXRhKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5zZWxlY3RzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnNpbmdsZS1vcHRpb24tc2VsZWN0b3InKSxcbiAgICAgICAgdGhpcy52YXJpYW50cyA9IEpTT04ucGFyc2UodmFyaWFudERhdGEudGV4dENvbnRlbnQpLFxuICAgICAgICB0aGlzLm1vbmV5Rm9ybWF0ID0gdmFyaWFudERhdGEuZ2V0QXR0cmlidXRlKCdkYXRhLW1vbmV5LWZvcm1hdCcpLFxuICAgICAgICB0aGlzLnByb2R1Y3RUaXRsZSA9IHZhcmlhbnREYXRhLmdldEF0dHJpYnV0ZSgnZGF0YS1wcm9kdWN0LXRpdGxlJyksXG4gICAgICAgIHRoaXMucHJvZHVjdFR5cGUgPSB2YXJpYW50RGF0YS5nZXRBdHRyaWJ1dGUoJ2RhdGEtcHJvZHVjdC10eXBlJyksXG4gICAgICAgIHRoaXMuaGlkZURlZmF1bHRUaXRsZSA9IGZhbHNlLFxuICAgICAgICB0aGlzLnNvbGRPdXQgPSB2YXJpYW50RGF0YS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc29sZC1vdXQnKSxcbiAgICAgICAgdGhpcy51bmF2YWlsYWJsZSA9IHZhcmlhbnREYXRhLmdldEF0dHJpYnV0ZSgnZGF0YS11bmF2YWlsYWJsZScpO1xuXG4gICAgICAgIGlmKHZhcmlhbnREYXRhLmdldEF0dHJpYnV0ZSgnZGF0YS1oaWRlLWRlZmF1bHQtdGl0bGUnKSA9PSAndHJ1ZScpIHtcbiAgICAgICAgICAgIHRoaXMuaGlkZURlZmF1bHRUaXRsZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIHRoaXMudXBkYXRlVmFyaWFudFNlbGVjdGlvbi5iaW5kKHRoaXMpKTtcblxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjb2xvdXI6Y2hhbmdlZCcsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVWYXJpYW50KCk7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbWVhc3VyZW1lbnQ6Y2hhbmdlZCcsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVWYXJpYW50KCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHVwZGF0ZVZhcmlhbnRTZWxlY3Rpb24oKSB7ICAgICAgICBcblxuICAgICAgICB0aGlzLnNlbGVjdHMuZm9yRWFjaChzZWxlY3QgPT4ge1xuICAgICAgICAgICAgc2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHRoaXMudXBkYXRlVmFyaWFudC5iaW5kKHRoaXMpKTtcbiAgICAgICAgfSk7XG4gICAgICAgICAgICAgIFxuICAgICAgICB0aGlzLnVwZGF0ZVZhcmlhbnQoKTtcbiAgICB9XG5cbiAgICB1cGRhdGVWYXJpYW50KCkge1xuICAgICAgICBjb25zdCBzZWxlY3RlZE9wdGlvbnMgPSBBcnJheS5mcm9tKHRoaXMuc2VsZWN0cykubWFwKHNlbGVjdCA9PiBzZWxlY3QudmFsdWUpO1xuICAgICAgICBjb25zdCB2YXJpYW50ID0gdGhpcy52YXJpYW50cy5maW5kKHZhcmlhbnQgPT5cbiAgICAgICAgICAgIHZhcmlhbnQub3B0aW9ucy5ldmVyeShcbiAgICAgICAgICAgICAgICAob3B0aW9uLCBpbmRleCkgPT4gb3B0aW9uID09PSBzZWxlY3RlZE9wdGlvbnNbaW5kZXhdXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmNoZWNrVmFyaWFudCh2YXJpYW50KTtcblxuICAgICAgICBpZiAoIXZhcmlhbnQpIHJldHVybjtcblxuICAgICAgICAvLyBVcGRhdGUgaGlkZGVuIHZhcmlhbnQgSURcbiAgICAgICAgY29uc3QgdmFyaWFudElucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICAgJ2Zvcm1bYWN0aW9uPVwiL2NhcnQvYWRkXCJdIHNlbGVjdFtuYW1lPVwiaWRcIl0nXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKHZhcmlhbnRJbnB1dCkge1xuICAgICAgICAgICAgdmFyaWFudElucHV0LnZhbHVlID0gdmFyaWFudC5pZDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gQ2FycGV0cyBhcmUgcHJpY2VkIGJ5IHdpZHRoIHggbGVuZ3RoLCBzbyByZWNhbGN1bGF0ZSBmcm9tIHRoZSBuZXcgdmFyaWFudCByYXRoZXIgdGhhbiBzaG93aW5nIGl0cyB1bml0IHByaWNlXG4gICAgICAgIGlmICh0aGlzLnByb2R1Y3RUeXBlID09ICdDYXJwZXRzJyB8fCB0aGlzLnByb2R1Y3RUeXBlID09ICdWaW55bCcgfHwgdGhpcy5wcm9kdWN0VHlwZSA9PSAnQXJ0aWZpY2lhbCBHcmFzcycpIHtcbiAgICAgICAgICAgIHVwZGF0ZVByaWNlKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBVcGRhdGUgcHJpY2VcbiAgICAgICAgbGV0IHByb2R1Y3RQcmljZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNwcm9kdWN0LXByaWNlIC5wcm9kdWN0LXByaWNlJylcbiAgICAgICAgaWYgKHByb2R1Y3RQcmljZSkge1xuICAgICAgICAgICAgcHJvZHVjdFByaWNlLnRleHRDb250ZW50ID0gU2hvcGlmeS5mb3JtYXRNb25leSh2YXJpYW50LnByaWNlLCB0aGlzLm1vbmV5Rm9ybWF0KTtcbiAgICAgICAgICAgICQoJy51cGRhdGUtb24tY2hhbmdlJykuaHRtbChTaG9waWZ5LmZvcm1hdE1vbmV5KHZhcmlhbnQucHJpY2UsIHRoaXMubW9uZXlGb3JtYXQpKVxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH1cblxuICAgIGNoZWNrVmFyaWFudCh2YXJpYW50KSB7XG4gICAgICAgIGlmICh2YXJpYW50KSB7XG4gICAgICAgICAgICBpZiAodmFyaWFudC5hdmFpbGFibGUpIHsgLy8gRW5hYmxpbmcgYWRkIHRvIGNhcnQgYnV0dG9uLlxuICAgICAgICAgICAgICAgIC8vIElmIGl0ZW0gaXMgYmFja29yZGVyZWQgeWV0IGNhbiBzdGlsbCBiZSBvcmRlcmVkLCB3ZSdsbCBzaG93IHNwZWNpYWwgbWVzc2FnZS5cbiAgICAgICAgICAgICAgICBpZiAodmFyaWFudC5pbnZlbnRvcnlfbWFuYWdlbWVudCAmJiB2YXJpYW50LmludmVudG9yeV9xdWFudGl0eSA8PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuaGlkZURlZmF1bHRUaXRsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NlbGVjdGVkLXZhcmlhbnQnKS50ZXh0Q29udGVudCA9IGAke3RoaXMucHJvZHVjdFRpdGxlfWA7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2VsZWN0ZWQtdmFyaWFudCcpLnRleHRDb250ZW50ID0gYCR7dGhpcy5wcm9kdWN0VGl0bGV9IC0gJHt2YXJpYW50LnRpdGxlfWA7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2JhY2tvcmRlcicpLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2JhY2tvcmRlcicpLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHsgLy8gVmFyaWFudCBpcyBzb2xkIG91dC5cbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjYmFja29yZGVyJykuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcblxuICAgICAgICAgICAgICAgIGxldCBjYXJ0QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI0FkZFRvQ2FydCcpO1xuICAgICAgICAgICAgICAgIGlmKHRoaXMucHJvZHVjdFR5cGUgPT0gJ0NhcnBldHMnIHx8IHRoaXMucHJvZHVjdFR5cGUgPT0gJ1ZpbnlsJyB8fCB0aGlzLnByb2R1Y3RUeXBlID09ICdBcnRpZmljaWFsIEdyYXNzJykge1xuICAgICAgICAgICAgICAgICAgICBjYXJ0QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NhcnBldEFkZFRvQ2FydCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZihjYXJ0QnV0dG9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhcnRCdXR0b24udmFsdWUgPSB0aGlzLnNvbGRPdXQ7XG4gICAgICAgICAgICAgICAgICAgIGNhcnRCdXR0b24uY2xhc3NMaXN0LmFkZCgnZGlzYWJsZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgY2FydEJ1dHRvbi5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdXBkYXRlUHJpY2UoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYodGhpcy5wcm9kdWN0VHlwZSA9PSAnQ2FycGV0cycgfHwgdGhpcy5wcm9kdWN0VHlwZSA9PSAnVmlueWwnIHx8IHRoaXMucHJvZHVjdFR5cGUgPT0gJ0FydGlmaWNpYWwgR3Jhc3MnKSB7XG4gICAgICAgICAgICAgICAgdXBkYXRlU2FtcGxlQXZhaWxhYmlsaXR5KCk7ICAgIFxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZihqUXVlcnkoJyNmaXJzdF9sb2FkJykudmFsKCkgIT0gJ2ZhbHNlJyB8fCAhalF1ZXJ5KCcub3B0aW9uLWNvbG91ciAjc2VsZWN0LW9wdGlvbi1jb2xvdXInKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB2YXIgc2VsZWN0ZWRPcHRpb24gPSBqUXVlcnkoJyNwcm9kdWN0LXNlbGVjdCcpLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLFxuICAgICAgICAgICAgICAgICAgICBzdG9ja19sZXZlbCA9IHNlbGVjdGVkT3B0aW9uLmRhdGEoJ3N0b2NrbGV2ZWwnKSxcbiAgICAgICAgICAgICAgICAgICAgZGVsaXZlcnllc3RpbWF0ZSA9IHNlbGVjdGVkT3B0aW9uLmRhdGEoJ2RlbGl2ZXJ5ZXN0aW1hdGUnKSxcbiAgICAgICAgICAgICAgICAgICAgdmFyaWFudF9xdHkgPSBzZWxlY3RlZE9wdGlvbi5kYXRhKCdxdWFudGl0eScpLFxuICAgICAgICAgICAgICAgICAgICBpc19pbl9zdG9jayA9IHNlbGVjdGVkT3B0aW9uLmRhdGEoJ2luc3RvY2snKSxcbiAgICAgICAgICAgICAgICAgICAgdmFyaWFudGlkID0gc2VsZWN0ZWRPcHRpb24uYXR0cigndmFsdWUnKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYoaXNfaW5fc3RvY2sgPiAwICkge1xuICAgICAgICAgICAgICAgICAgICBpZihzdG9ja19sZXZlbCA9PSAnWWVzJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgalF1ZXJ5KCcjc3RvY2tMZXZlbCcpLnJlbW92ZUNsYXNzKCkuYWRkQ2xhc3MoJ2xpbWl0ZWRTdG9jaycpLmh0bWwoJzxpIGNsYXNzPVwiaWNvbi1pbnN0b2NrXCI+PC9pPiBPcmRlciBOb3cnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGpRdWVyeSgnI3Byb3BlcnRpZXNfc3RvY2tMZXZlbCcpLnZhbCgnT3JkZXIgTm93Jyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBqUXVlcnkoJyNzdG9ja0xldmVsJykucmVtb3ZlQ2xhc3MoKS5hZGRDbGFzcygnaW5TdG9jaycpLmh0bWwoJzxpIGNsYXNzPVwiaWNvbi1pbnN0b2NrXCI+PC9pPiBJbiBzdG9jaycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgalF1ZXJ5KCcjcHJvcGVydGllc19zdG9ja0xldmVsJykudmFsKCdJbiBzdG9jaycpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGpRdWVyeSgnI2NhcnBldEFkZFRvQ2FydCcpLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpLnJlbW92ZUF0dHIoJ2Rpc2FibGVkJykuaHRtbCgnQWRkIHRvIEJhc2tldCcpO1xuICAgICAgICAgICAgICAgICAgICBqUXVlcnkoJyNBZGRUb0NhcnQnKS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKS5yZW1vdmVBdHRyKCdkaXNhYmxlZCcpLmh0bWwoJ0FkZCB0byBCYXNrZXQnKTtcbiAgICAgICAgICAgICAgICAgICAgalF1ZXJ5KCcjZmFrZS1hZGQtY2FyZC1idG4nKS5yZW1vdmVDbGFzcygnZGlzYWJsZWQnKS5yZW1vdmVBdHRyKCdkaXNhYmxlZCcpLmh0bWwoJ0FkZCB0byBCYXNrZXQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGpRdWVyeSgnI3N0b2NrTGV2ZWwnKS5yZW1vdmVDbGFzcygpLmFkZENsYXNzKCdvdXRPZlN0b2NrJykuaHRtbCgnPGkgY2xhc3M9XCJpY29uLW91dG9mc3RvY2tcIj48L2k+IE91dCBvZiBzdG9jaycpO1xuICAgICAgICAgICAgICAgICAgICBqUXVlcnkoJyNwcm9wZXJ0aWVzX3N0b2NrTGV2ZWwnKS52YWwoJ091dCBvZiBzdG9jaycpO1xuICAgICAgICAgICAgICAgICAgICBqUXVlcnkoJyNjYXJwZXRBZGRUb0NhcnQnKS5hZGRDbGFzcygnZGlzYWJsZWQnKS5hdHRyKCdkaXNhYmxlZCcsIHRydWUpLmh0bWwoJ091dCBvZiBTdG9jaycpO1xuICAgICAgICAgICAgICAgICAgICBqUXVlcnkoJyNBZGRUb0NhcnQnKS5hZGRDbGFzcygnZGlzYWJsZWQnKS5hdHRyKCdkaXNhYmxlZCcsIHRydWUpLmh0bWwoJ091dCBvZiBTdG9jaycpO1xuICAgICAgICAgICAgICAgICAgICBqUXVlcnkoJyNmYWtlLWFkZC1jYXJkLWJ0bicpLmFkZENsYXNzKCdkaXNhYmxlZCcpLmF0dHIoJ2Rpc2FibGVkJywgdHJ1ZSkuaHRtbCgnT3V0IG9mIFN0b2NrJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGRlbGl2ZXJ5ZXN0aW1hdGUpIHtcbiAgICAgICAgICAgICAgICAvLyAgalF1ZXJ5KCcjZGVsaXZlcnlFc3RpbWF0ZScpLmh0bWwoJzxzcGFuIGNsYXNzPVwibG9jYXRpb25fX2ljb24gaWNvbiBpY29uXCI+PGltZyBzcmM9XCJ7eyAnaWNvbi1sb2NhdGlvbi5zdmcnIHwgYXNzZXRfdXJsIH19XCIgYWx0PVwibG9jYXRpb25cIj48L3NwYW4+ICcgKyBkZWxpdmVyeWVzdGltYXRlKTtcbiAgICAgICAgICAgICAgICAgICAgalF1ZXJ5KCcjcHJvcGVydGllc19kZWxpdmVyeUVzdGltYXRlJykudmFsKGRlbGl2ZXJ5ZXN0aW1hdGUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGpRdWVyeSgnI3Byb3BlcnRpZXNfdmFyaWFudElEJykudmFsKHZhcmlhbnRpZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBqUXVlcnkoJyNmaXJzdF9sb2FkJykudmFsKHRydWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gdmFyaWFudCBkb2Vzbid0IGV4aXN0LlxuICAgICAgICAgICAgalF1ZXJ5KCcjYmFja29yZGVyJykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgICAgICAgalF1ZXJ5KCcjQWRkVG9DYXJ0JykudmFsKHRoaXMudW5hdmFpbGFibGUpLmFkZENsYXNzKCdkaXNhYmxlZCcpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbn1cbm5ldyBQcm9kdWN0cygpO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBQUEsTUFBTSxRQUFRLENBQUM7SUFDZixJQUFJLFdBQVcsR0FBRztJQUNsQixRQUFRLE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxjQUFjO0lBQ25ELFlBQVk7SUFDWixTQUFTO0lBQ1Q7SUFDQSxRQUFRLElBQUksQ0FBQyxXQUFXLEVBQUU7O0lBRTFCLFFBQVEsSUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsZ0JBQWdCLENBQUMseUJBQXlCLENBQUM7SUFDM0UsUUFBUSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQztJQUMzRCxRQUFRLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQztJQUN4RSxRQUFRLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDLFlBQVksQ0FBQyxvQkFBb0IsQ0FBQztJQUMxRSxRQUFRLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQztJQUN4RSxRQUFRLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxLQUFLO0lBQ3JDLFFBQVEsSUFBSSxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQztJQUNoRSxRQUFRLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDLFlBQVksQ0FB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
