class Filters {
    constructor() {
        this.filtersForm = document.getElementById('CollectionFiltersForm'),
        this.setFilters = [],
        this.filtersObject = {},
        this.gridElId = 'product-grid',
        this.filterWrapper = document.getElementById('filters-wrapper'),
        this.filterMainSection = 'filters-wrapper-main-section',
        this.ajaxTargetEl = document.getElementById(this.gridElId),
        this.ajaxFilterEl = document.getElementById(this.filterMainSection),
        this.filterButtonTitle = document.getElementById('filter-button-title');
        this.checkboxes = this.filtersForm.querySelectorAll('input[type="checkbox"]'),
        this.mobileFilterBtns = document.querySelectorAll('.filter-by'),
        this.mobileCloseBtns = document.querySelectorAll('.filters-wrapper__close'),
        this.filterApply = document.getElementById('filter-apply'),
        this.filterClear = document.getElementById('filter-clear');
        self = this;

        
        document.addEventListener('change', function(e){
            const target = e.target.closest(".wc-checkbox-container input"); 
            if(target){
                self.getCheckedFilters();
            }
        });

        document.addEventListener('click', function(e){
            const target = e.target.closest(".filters-wrapper__selected__list-item"); 
            if(target){
                self.uncheckFilter(target);
            }
        });

        document.addEventListener('click', function(e){
            const target = e.target.closest("#product-grid .filter-by"); 
            if(target){
                self.toggleMobileFilter('open');
            }
        });

        document.addEventListener('click', function(e){
            const target = e.target.closest(".filters-wrapper__section--header"); 
            if(target){
                self.toggleSection(target);
            }
        });

        document.addEventListener('change', function(e){
            if (event.target.matches('#product-grid #sorter')) {
                
                self.getCheckedFilters();
            }
        });

        this.mobileCloseBtns.forEach(mobileCloseBtn => {
            mobileCloseBtn.addEventListener('click', function() {
                self.toggleMobileFilter();
            });
        });

        this.filterApply.addEventListener('click', function(e){
            self.toggleMobileFilter();
        });

        this.filterClear.addEventListener('click', function(e){
            self.clearFilters();
        });
    }

    toggleMobileFilter(state = 'close') {
        if(state == 'open') {
            this.filterWrapper.classList.add('filters-open');
        } else {
            this.filterWrapper.classList.remove('filters-open');
        }
    }

    uncheckFilter(button) {
        document.querySelector('input[name="'+ button.dataset.name +'"][value="'+ button.dataset.value +'"]').checked = false;
        button.remove();
        this.getCheckedFilters();
    }

    clearFilters() {
        const url = new URL(window.location.href);
        url.search = '';

        history.replaceState({}, '', url);

        this.filtersForm.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        this.getCheckedFilters();
    }

    getCheckedFilters() {
        
        this.filtersObject = {};
        const checkedCheckboxes = this.filtersForm.querySelectorAll('input[type="checkbox"]:checked');
        const filterButtonArea = document.getElementById('filter-button-area');

        filterButtonArea.innerHTML = '';

        this.filtersObject.filters = [];
        let checkCount = 0;
        for (const checkbox of checkedCheckboxes) {
            let checkboxName = checkbox.name;
            let checkboxValue = checkbox.value;
            checkbox.title;
            if (!this.filtersObject.filters[checkboxName]) {
                this.filtersObject.filters[checkboxName] = [];
            }
            
            this.filtersObject.filters[checkboxName].push(checkboxValue);
            filterButtonArea.innerHTML += this.createFilterButton(checkbox);
            checkCount++;
        }
        
        const newUrl = this.buildURL();
        this.fetchGridItems(newUrl);
        this.toggleSelectedFilterSection(checkCount);

    }

    toggleSelectedFilterSection(count) {
        if(count > 0) {
            this.filterButtonTitle.classList.add('show-wrapper');
        } else {
            this.filterButtonTitle.classList.remove('show-wrapper');
        }
    }
    createFilterButton(checkbox) {
        let value = checkbox.value;
        
        if(checkbox.dataset.buttonValue) {
            value = checkbox.dataset.buttonValue;
        } 
        return `<div class="filters-wrapper__selected__list-item" data-name="${checkbox.name}" data-value="${checkbox.value}">
                <div class="filters-wrapper__selected__list-item-key">${checkbox.title}:</div>
                <div class="filters-wrapper__selected__list-item-value">${value}</div>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <path d="M18 6L6 18M6 6l12 12"></path>
                </svg>
            </div>
            `;
    }

    buildURL() {

        new URLSearchParams(window.location.search);
        const sortBy = document.getElementById('sorter').value;
        
        const url = window.location.origin + window.location.pathname;
        let queryString = '';
        for (const [index, [filterName, values]] of Object.entries(this.filtersObject.filters).entries()) {
            
            this.filtersObject.filters[filterName].forEach((value, i) => {
                queryString += filterName + '=' + value;
                if(this.filtersObject.filters[filterName].length !== i + 1) {
                    queryString += '&';
                }
            });
            if(Object.keys(this.filtersObject.filters).length !== Number(index) + 1) {
                queryString += '&';
            }
        }
        if(sortBy) {
            queryString += '&sort_by=' + sortBy;
        }
        
        let newUrl = url + '?' + queryString;

        history.pushState({}, '', newUrl);



        return newUrl;
    }

    fetchGridItems(url) {
        // Abort in-progress fetch
        if (this.abortController instanceof AbortController) {
            this.abortController.abort();
        }

        // Create an abort signal
        const controller = new AbortController();
        this.abortController = controller;

        // Fetch
        this.currentFetch = window
            .fetch(url, { signal: controller.signal })
            .then((response) => response.text())
            .then(this.updateFromFetch.bind(this))
            .finally(() => {
                delete this.abortController;
            });
    }


    updateFromFetch(remoteSource) {
        // Parse the remote markup
        const parser = new window.DOMParser();
        const remoteDocument = parser.parseFromString(
            remoteSource,
            'text/html'
        );
        // Replace content
        const remoteajaxTargetEl = remoteDocument.querySelector(
            `#${this.gridElId}`
        );

        const remoteajaxFilterEl = remoteDocument.querySelector(
            `#${this.filterMainSection}`
        );


        if (remoteajaxTargetEl instanceof window.HTMLElement) {
            this.ajaxTargetEl.innerHTML = remoteajaxTargetEl.innerHTML;
        }
        

        if (remoteajaxFilterEl instanceof window.HTMLElement) {
            this.ajaxFilterEl.innerHTML = remoteajaxFilterEl.innerHTML;
        }

        const sortByOptions = document.querySelectorAll('#sorter option');
        const getParam = (name) => new URLSearchParams(window.location.search).get(name);
        const sortBy = getParam('sort_by');

        sortByOptions.forEach(option => {
            if(option.value == sortBy) {
                option.selected = true;
            }
        });
    }

    toggleSection(header) {
        let el = document.getElementById(header.dataset.container);
        let duration = 300;
        if (getComputedStyle(el).display === "none") {
            this.slideDown(el, duration);
            header.classList.remove('active');
        } else {
            this.slideUp(el, duration);
            header.classList.add('active');
        }
    }

    slideUp(el, duration = 300) {
        el.style.height = `${el.offsetHeight}px`;
        el.offsetHeight; // force reflow

        el.style.transition = `height ${duration}ms ease`;
        el.style.overflow = "hidden";
        el.style.height = "0";

        setTimeout(() => {
            el.style.display = "none";
            el.style.removeProperty("height");
            el.style.removeProperty("overflow");
            el.style.removeProperty("transition");
        }, duration);
    }

    slideDown(el, duration = 300) {
        el.style.removeProperty("display");
        if (getComputedStyle(el).display === "none") {
            el.style.display = "block";
        }

        const height = el.scrollHeight;

        el.style.height = "0";
        el.style.overflow = "hidden";
        el.offsetHeight; // force reflow

        el.style.transition = `height ${duration}ms ease`;
        el.style.height = `${height}px`;

        setTimeout(() => {
            el.style.removeProperty("height");
            el.style.removeProperty("overflow");
            el.style.removeProperty("transition");
        }, duration);
    }

}

new Filters();
