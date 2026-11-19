/**
 * Asynchronous, multi-select tag filters for the carpet collection pages.
 *
 * The filter panel (snippets/filter-by-tags.liquid) still renders plain tag links,
 * so the page works without JavaScript. This script takes over those links:
 *  - Several tags can be selected at once. Tags in the same group (e.g. two colours)
 *    are OR'd together, different groups (e.g. colour + style) are AND'd.
 *  - Results, sorting and pagination update in place without a page reload.
 *
 * Product cards come from sections/collection-filter-data.liquid via the Section
 * Rendering API. Groups with a single selected tag are passed to Shopify in the URL
 * path (/collections/x/tag-a+tag-b) so the server narrows the results and the card
 * colour logic in product-grid-item still applies. Groups with several selected tags
 * are filtered here.
 */

const DATA_SECTION = 'collection-filter-data';
const DESKTOP = window.matchMedia('(min-width: 64em)');
const NEXT_LABEL = 'Next <i class="icon-chevron-right"></i>';
const PREV_LABEL = '<i class="icon-chevron-left"></i> Prev';

class TagFilters {
    constructor(root) {
        this.root = root;
        this.collectionUrl = root.dataset.collectionUrl.replace(/\/$/, '');
        this.defaultSort = root.dataset.defaultSort || '';
        this.pageSize = parseInt(root.dataset.pageSize, 10) || 24;
        this.panel = root.querySelector('.collection-filters');
        this.grid = root.querySelector('.product-grid');
        this.sorter = root.querySelector('.sort-by');
        this.mainColumn = this.grid ? this.grid.closest('.col-main') || this.grid.parentElement : root;
        this.sectionId = (root.closest('.shopify-section') || { id: '' }).id.replace('shopify-section-', '');

        this.cache = new Map();
        this.requestId = 0;
        this.panelRefreshed = !this.loadedOnTagPath();
        this.banners = this.captureBanners();

        const params = new URLSearchParams(window.location.search);
        this.selected = this.readSelection(params, true);
        this.sort = params.get('sort_by') || (this.sorter && this.sorter.value) || this.defaultSort;
        this.page = parseInt(params.get('page'), 10) || 1;

        this.bind();
        this.decorateDropdowns();
        this.updateCounts();

        // A shared/bookmarked filter URL: apply it straight away.
        if (params.has('filter')) {
            this.update({ push: false });
        }
    }

    /* ---------- State ---------- */

    loadedOnTagPath() {
        const path = decodeURIComponent(window.location.pathname).replace(/\/$/, '');
        return path !== decodeURIComponent(this.collectionUrl);
    }

    groupOf(handle) {
        const li = this.panel && this.panel.querySelector(`.advanced-filter[data-handle="${CSS.escape(handle)}"]`);
        if (li) return li.dataset.group.toLowerCase();
        // Tag not in the panel (yet): fall back to its prefix, e.g. "filter-colour_grey" -> "filter-colour".
        const groups = this.panel
            ? [...new Set([...this.panel.querySelectorAll('.advanced-filter[data-group]')].map((el) => el.dataset.group.toLowerCase()))]
            : [];
        const match = groups.find((g) => handle.startsWith(`${g}_`) || handle.startsWith(`${g.replace(/_/g, '-')}-`));
        return match || handle.split('_')[0];
    }

    readSelection(params, includeServerTags = false) {
        const selected = new Map();
        const add = (handle) => {
            if (!handle) return;
            const group = this.groupOf(handle);
            if (!selected.has(group)) selected.set(group, new Set());
            selected.get(group).add(handle);
        };

        if (params.has('filter')) {
            params.getAll('filter').forEach((value) => value.split(',').forEach((h) => add(h.trim())));
        } else if (includeServerTags && this.panel) {
            // Tags already applied by a /collections/x/tag URL.
            this.panel.querySelectorAll('.advanced-filter.active-filter[data-handle]').forEach((li) => add(li.dataset.handle));
        }
        return selected;
    }

    selectedHandles() {
        return [...this.selected.values()].flatMap((set) => [...set]);
    }

    toggle(handle, group) {
        group = group.toLowerCase();
        if (!this.selected.has(group)) this.selected.set(group, new Set());
        const set = this.selected.get(group);
        if (set.has(handle)) {
            set.delete(handle);
            if (!set.size) this.selected.delete(group);
        } else {
            set.add(handle);
        }
    }

    /* ---------- Events ---------- */

    bind() {
        this.root.addEventListener('click', (e) => {
            const toggle = e.target.closest('.collection-filters .filter-column > h3');
            if (toggle && DESKTOP.matches) {
                e.preventDefault();
                this.toggleDropdown(toggle.parentElement);
                return;
            }

            const filterLink = e.target.closest('.collection-filters .advanced-filter a');
            if (filterLink) {
                e.preventDefault();
                const li = filterLink.closest('.advanced-filter');
                this.toggle(li.dataset.handle, li.dataset.group);
                this.page = 1;
                this.update();
                return;
            }

            const clear = e.target.closest('[data-filter-clear]');
            if (clear) {
                e.preventDefault();
                this.selected.clear();
                this.page = 1;
                this.update();
                return;
            }

            const pageLink = e.target.closest('.collection-pagination a[data-page]');
            if (pageLink) {
                e.preventDefault();
                this.page = parseInt(pageLink.dataset.page, 10) || 1;
                this.update().then(() => this.scrollToResults());
            }
        });

        if (this.sorter) {
            this.sorter.addEventListener('change', () => {
                this.sort = this.sorter.value;
                this.page = 1;
                this.update();
            });
        }

        // Dropdowns: close on outside click, Escape, or switching to the mobile layout.
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.collection-filters .filter-column')) this.closeDropdowns();
        });
        document.addEventListener('keydown', (e) => {
            const heading = e.target.closest && e.target.closest('.collection-filters .filter-column > h3');
            if (heading && DESKTOP.matches && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                this.toggleDropdown(heading.parentElement);
            } else if (e.key === 'Escape' && this.panel && this.panel.querySelector('.filter-column.is-open')) {
                const open = this.panel.querySelector('.filter-column.is-open > h3');
                this.closeDropdowns();
                if (open) open.focus();
            }
        });
        DESKTOP.addEventListener('change', () => this.closeDropdowns());

        window.addEventListener('popstate', () => {
            const params = new URLSearchParams(window.location.search);
            if (!params.has('filter') && this.loadedOnTagPath()) {
                // Back to the server-rendered tag URL we started on.
                window.location.reload();
                return;
            }
            this.selected = this.readSelection(params);
            this.sort = params.get('sort_by') || this.defaultSort;
            this.page = parseInt(params.get('page'), 10) || 1;
            this.update({ push: false });
        });
    }

    /* ---------- Data ---------- */

    async fetchCollection(path) {
        const key = `${path}|${this.sort}`;
        if (this.cache.has(key)) return this.cache.get(key);

        const load = async () => {
            const fetchPage = async (page) => {
                const params = new URLSearchParams({ section_id: DATA_SECTION, page: String(page) });
                if (this.sort) params.set('sort_by', this.sort);
                const response = await fetch(`${path}?${params}`, { credentials: 'same-origin' });
                // Shopify returns 404 for a tag combination with no products.
                if (response.status === 404) return { pages: 1, products: [] };
                if (!response.ok) throw new Error(`Filter request failed (${response.status})`);
                const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
                const wrapper = doc.querySelector('[data-filter-data]');
                if (!wrapper) return { pages: 1, products: [] };
                const products = [...wrapper.querySelectorAll('[data-filter-product]')]
                    .map((el) => ({
                        tags: new Set((el.dataset.tags || '').split('|').filter(Boolean)),
                        html: el.innerHTML.trim(),
                    }))
                    .filter((p) => p.html); // product-grid-item outputs nothing for hidden products
                return { pages: parseInt(wrapper.dataset.pages, 10) || 1, products };
            };

            const first = await fetchPage(1);
            const rest = await Promise.all(
                Array.from({ length: Math.max(first.pages - 1, 0) }, (_, i) => fetchPage(i + 2))
            );
            return first.products.concat(...rest.map((r) => r.products));
        };

        const promise = load();
        this.cache.set(key, promise);
        promise.catch(() => this.cache.delete(key));
        return promise;
    }

    async getResults() {
        const pathTags = [];
        const orGroups = [];
        this.selected.forEach((set) => {
            if (set.size === 1) pathTags.push(...set);
            else if (set.size > 1) orGroups.push(set);
        });

        const path = this.collectionUrl + (pathTags.length ? `/${pathTags.sort().join('+')}` : '');
        const products = await this.fetchCollection(path);
        return products.filter((p) => orGroups.every((set) => [...set].some((tag) => p.tags.has(tag))));
    }

    /* ---------- Rendering ---------- */

    async update({ push = true } = {}) {
        const id = ++this.requestId;
        this.setLoading(true);

        try {
            const [results] = await Promise.all([this.getResults(), this.refreshPanel()]);
            if (id !== this.requestId) return; // a newer request superseded this one

            const pages = Math.max(Math.ceil(results.length / this.pageSize), 1);
            this.page = Math.min(Math.max(this.page, 1), pages);

            this.renderPanelState();
            this.renderGrid(results.slice((this.page - 1) * this.pageSize, this.page * this.pageSize));
            this.renderPagination(pages);
            if (this.sorter && this.sort) this.sorter.value = this.sort;

            const url = this.buildUrl(this.page);
            if (push && url !== window.location.pathname + window.location.search) {
                window.history.pushState({ tagFilters: true }, '', url);
            }

            document.dispatchEvent(
                new CustomEvent('tagfilters:updated', { detail: { count: results.length, filters: this.selectedHandles() } })
            );
        } catch (error) {
            console.error(error);
        } finally {
            if (id === this.requestId) this.setLoading(false);
        }
    }

    // When the page was opened on a /collections/x/tag URL, Shopify only lists the tags of
    // the already-filtered products. Swap in the full list from the plain collection once.
    async refreshPanel() {
        if (this.panelRefreshed || !this.sectionId || !this.panel) return;
        this.panelRefreshed = true;
        try {
            const response = await fetch(`${this.collectionUrl}?section_id=${encodeURIComponent(this.sectionId)}`);
            if (!response.ok) return;
            const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
            const fresh = doc.querySelector('.collection-filters .container');
            const current = this.panel.querySelector('.container');
            if (fresh && current) {
                current.innerHTML = fresh.innerHTML;
                if (typeof window.reorderTagFilters === 'function') window.reorderTagFilters(this.panel);
                this.decorateDropdowns();
            }
        } catch (error) {
            console.error(error);
        }
    }

    /* ---------- Desktop dropdown bar ---------- */

    decorateDropdowns() {
        if (!this.panel) return;
        this.panel.querySelectorAll('.filter-column').forEach((column) => {
            const heading = column.querySelector(':scope > h3');
            if (!heading || heading.dataset.dropdown) return;
            heading.dataset.dropdown = 'true';
            heading.setAttribute('role', 'button');
            heading.setAttribute('tabindex', '0');
            heading.setAttribute('aria-expanded', 'false');
            heading.insertAdjacentHTML('beforeend', ' <span class="filter-column__count" hidden></span>');
        });
    }

    toggleDropdown(column, open = !column.classList.contains('is-open')) {
        this.closeDropdowns(column);
        column.classList.toggle('is-open', open);
        const heading = column.querySelector(':scope > h3');
        if (heading) heading.setAttribute('aria-expanded', String(open));
    }

    closeDropdowns(except = null) {
        if (!this.panel) return;
        this.panel.querySelectorAll('.filter-column.is-open').forEach((column) => {
            if (column !== except) this.toggleDropdown(column, false);
        });
    }

    updateCounts() {
        if (!this.panel) return;
        this.panel.querySelectorAll('.filter-column').forEach((column) => {
            const count = column.querySelectorAll('.advanced-filter.active-filter').length;
            column.classList.toggle('has-active', count > 0);
            const badge = column.querySelector('.filter-column__count');
            if (badge) {
                badge.textContent = count;
                badge.hidden = count === 0;
            }
        });
    }

    renderPanelState() {
        if (!this.panel) return;
        const active = new Set(this.selectedHandles());
        this.panel.querySelectorAll('.advanced-filter[data-handle]').forEach((li) => {
            const isActive = active.has(li.dataset.handle);
            li.classList.toggle('active-filter', isActive);
            const link = li.querySelector('a');
            if (link) link.setAttribute('aria-pressed', String(isActive));
        });
        const clear = this.panel.querySelector('[data-filter-clear]');
        if (clear) clear.hidden = active.size === 0;
        this.updateCounts();
    }

    // Banner tiles are mixed into the grid at fixed positions on every page.
    captureBanners() {
        if (!this.grid) return [];
        const banners = [];
        let productCount = 0;
        [...this.grid.children].forEach((child) => {
            if (child.querySelector('.product-caption')) {
                productCount++;
            } else if (child.matches('.item')) {
                banners.push({ position: productCount + 1, html: child.outerHTML });
            }
        });
        return banners;
    }

    renderGrid(products) {
        if (!this.grid) return;
        if (!products.length) {
            this.grid.innerHTML = '<p id="noProducts">There are no products in this view.</p>';
            return;
        }
        let html = '';
        products.forEach((product, index) => {
            this.banners.filter((b) => b.position === index + 1).forEach((b) => (html += b.html));
            html += product.html;
        });
        this.grid.innerHTML = html;
    }

    renderPagination(pages) {
        const html = pages > 1 ? this.paginationHtml(pages) : '';
        let containers = [...this.root.querySelectorAll('.collection-pagination')];

        if (!containers.length && html) {
            // The server rendered a single page, so there are no pagination wrappers yet.
            containers = [...this.root.querySelectorAll('.toolbar-product > .row')].map((row) => {
                const wrap = document.createElement('div');
                wrap.className = 'wrap-pagi';
                wrap.innerHTML = '<div class="collection-pagination"></div>';
                row.appendChild(wrap);
                return wrap.firstElementChild;
            });
        }

        containers.forEach((el) => {
            el.innerHTML = html;
            const wrap = el.closest('.wrap-pagi');
            if (wrap) wrap.hidden = !html;
        });
    }

    paginationHtml(pages) {
        const link = (page, label) => `<a href="${this.buildUrl(page)}" data-page="${page}">${label}</a>`;
        const parts = [];
        const current = this.page;

        if (current > 1) parts.push(`<span class="prev">${link(current - 1, PREV_LABEL)}</span>`);

        let lastShown = 0;
        for (let p = 1; p <= pages; p++) {
            const show = p === 1 || p === pages || Math.abs(p - current) <= 2;
            if (!show) continue;
            if (p - lastShown > 1) parts.push('<span class="deco">&hellip;</span>');
            parts.push(p === current ? `<span class="page current">${p}</span>` : `<span class="page">${link(p, p)}</span>`);
            lastShown = p;
        }

        if (current < pages) parts.push(`<span class="next">${link(current + 1, NEXT_LABEL)}</span>`);
        return parts.join(' ');
    }

    buildUrl(page) {
        const params = new URLSearchParams();
        const handles = this.selectedHandles();
        if (handles.length) params.set('filter', handles.join(','));
        if (this.sort && this.sort !== this.defaultSort) params.set('sort_by', this.sort);
        if (page > 1) params.set('page', String(page));
        const query = params.toString().replace(/%2C/gi, ',');
        return this.collectionUrl + (query ? `?${query}` : '');
    }

    setLoading(isLoading) {
        this.root.classList.toggle('tag-filters--loading', isLoading);
        this.root.setAttribute('aria-busy', String(isLoading));
    }

    scrollToResults() {
        const top = this.mainColumn.getBoundingClientRect().top + window.scrollY - 120;
        if (top < window.scrollY) window.scrollTo({ top, behavior: 'smooth' });
    }
}

const init = () => {
    document.querySelectorAll('[data-tag-filters]').forEach((root) => {
        if (!root.tagFilters) root.tagFilters = new TagFilters(root);
    });
};

window.TagFilters = TagFilters;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
