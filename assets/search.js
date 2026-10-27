(function () {

    class Search {
        constructor() {
            // Adds mast-head-top-hidden to body while #mastHeadTop is out of the viewport
            const mastHeadTop = document.getElementById('mastHeadTop');

            if (mastHeadTop) {
                const observer = new IntersectionObserver(([entry]) => {
                    document.body.classList.toggle('header-sticky', !entry.isIntersecting);
                });
                observer.observe(mastHeadTop);
            }

            window.addEventListener("scroll", () => {
                const hoverBox = document.getElementById('klevu-pt-rs-hover');
                if(hoverBox && hoverBox.style.display === 'block') {
                    hoverBox.style.display = 'none';
                }
            });
        }
    }
    new Search();

})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoLmpzIiwic291cmNlcyI6WyIuLi9zcmMvc2NyaXB0cy9zZWFyY2guanMiXSwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgU2VhcmNoIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgLy8gQWRkcyBtYXN0LWhlYWQtdG9wLWhpZGRlbiB0byBib2R5IHdoaWxlICNtYXN0SGVhZFRvcCBpcyBvdXQgb2YgdGhlIHZpZXdwb3J0XG4gICAgICAgIGNvbnN0IG1hc3RIZWFkVG9wID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hc3RIZWFkVG9wJyk7XG5cbiAgICAgICAgaWYgKG1hc3RIZWFkVG9wKSB7XG4gICAgICAgICAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBJbnRlcnNlY3Rpb25PYnNlcnZlcigoW2VudHJ5XSkgPT4ge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZSgnaGVhZGVyLXN0aWNreScsICFlbnRyeS5pc0ludGVyc2VjdGluZyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG9ic2VydmVyLm9ic2VydmUobWFzdEhlYWRUb3ApO1xuICAgICAgICB9XG5cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIiwgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgaG92ZXJCb3ggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgna2xldnUtcHQtcnMtaG92ZXInKVxuICAgICAgICAgICAgaWYoaG92ZXJCb3ggJiYgaG92ZXJCb3guc3R5bGUuZGlzcGxheSA9PT0gJ2Jsb2NrJykge1xuICAgICAgICAgICAgICAgIGhvdmVyQm94LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxubmV3IFNlYXJjaCgpO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBQUEsTUFBTSxNQUFNLENBQUM7SUFDYixJQUFJLFdBQVcsR0FBRztJQUNsQjtJQUNBLFFBQVEsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUM7O0lBRWxFLFFBQVEsSUFBSSxXQUFXLEVBQUU7SUFDekIsWUFBWSxNQUFNLFFBQVEsR0FBRyxJQUFJLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSztJQUNuRSxnQkFBZ0IsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUM7SUFDdEYsWUFBWSxDQUFDLENBQUM7SUFDZCxZQUFZLFFBQVEsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDO0lBQ3pDLFFBQVE7O0lBRVIsUUFBUSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLE1BQU07SUFDaEQsWUFBWSxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLG1CQUFtQjtJQUN4RSxZQUFZLEdBQUcsUUFBUSxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxLQUFLLE9BQU8sRUFBRTtJQUMvRCxnQkFBZ0IsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUc7SUFDekMsWUFBWTtJQUNaLFFBQVEsQ0FBQyxDQUFDO0lBQ1YsSUFBSTtJQUNKO0lBQ0EsSUFBSSxNQUFNLEVBQUU7Ozs7OzsifQ==
