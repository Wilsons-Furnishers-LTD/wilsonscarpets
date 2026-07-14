function resizeGridItem(item) {
  const grid = item.closest('.masonry-gallery');
  if (!grid) return;

  const rowHeight = parseInt(getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
  const rowGap = parseInt(getComputedStyle(grid).getPropertyValue('gap'));

  const img = item.querySelector('img');
  if (!img) return;

  const contentHeight = img.getBoundingClientRect().height;

  const rowSpan = Math.ceil((contentHeight + rowGap) / (rowHeight + rowGap));

  item.style.setProperty('--row-span', rowSpan);
}

function resizeAllGridItems() {
  document.querySelectorAll('.masonry-gallery .masonry-item').forEach(item => {
    resizeGridItem(item);
  });
}

function initMasonry() {
  const galleries = document.querySelectorAll('.masonry-gallery');

  galleries.forEach(gallery => {
    const items = gallery.querySelectorAll('.masonry-item');

    items.forEach(item => {
      const img = item.querySelector('img');

      if (img.complete) {
        resizeGridItem(item);
      } else {
        img.addEventListener('load', () => resizeGridItem(item));
      }
    });
  });
}

/* Run on load */
window.addEventListener('load', () => {
  initMasonry();
  resizeAllGridItems();
});

/* Run on resize */
window.addEventListener('resize', resizeAllGridItems);

/* Shopify editor support (important!) */
document.addEventListener('shopify:section:load', initMasonry);
document.addEventListener('shopify:block:select', initMasonry);