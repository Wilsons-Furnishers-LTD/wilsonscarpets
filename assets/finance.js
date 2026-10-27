(function () {

    class Template {
        constructor() {
            
            const accordionTitles = document.querySelectorAll(".wc-accordion-item__title");
            accordionTitles.forEach((accordion) => {
                accordion.addEventListener('click', this.toggleAccordion.bind(this));
            });

            this.setupSlider();
        }
        toggleAccordion(title) {
            let accordionTitle = title.target;
            
            accordionTitle.classList.toggle("is-open");

            let content = accordionTitle.nextElementSibling;

            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
            content.style.maxHeight = content.scrollHeight + "px";
            }
        }

        setupSlider() {
             let payPalCarousel = $('.wc-paypal__carousel');
            payPalCarousel.owlCarousel({
                loop:true,
                
                nav:true,
                dots: false,
                autoplay:true,
                autoplayTimeout:5000,
                stagePadding: 150,
                navText: [
                    '<svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 8L11 15L18 22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
                    '<svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M12 8L19 15L12 22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/> </svg>',
                ],
                responsive:{
                    0:{
                        items:1,
                        stagePadding: 50
                    },
                    600: {
                        items:1,
                        stagePadding: 150
                    },
                    1024:{
                        items:3,
                        autoplay:false,
                        stagePadding: 0,
                        margin: 40,
                        mouseDrag: false,
                        touchDrag: false
                    },
                    1150:{
                        items:3,
                        autoplay:false,
                        stagePadding: 0,
                        margin: 50,
                        mouseDrag: false,
                        touchDrag: false
                    }
                }
            });
        }
    }

    new Template();

})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluYW5jZS5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL3NjcmlwdHMvZmluYW5jZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBUZW1wbGF0ZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBhY2NvcmRpb25UaXRsZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLndjLWFjY29yZGlvbi1pdGVtX190aXRsZVwiKTtcbiAgICAgICAgYWNjb3JkaW9uVGl0bGVzLmZvckVhY2goKGFjY29yZGlvbikgPT4ge1xuICAgICAgICAgICAgYWNjb3JkaW9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy50b2dnbGVBY2NvcmRpb24uYmluZCh0aGlzKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuc2V0dXBTbGlkZXIoKTtcbiAgICB9XG4gICAgdG9nZ2xlQWNjb3JkaW9uKHRpdGxlKSB7XG4gICAgICAgIGxldCBhY2NvcmRpb25UaXRsZSA9IHRpdGxlLnRhcmdldFxuICAgICAgICBcbiAgICAgICAgYWNjb3JkaW9uVGl0bGUuY2xhc3NMaXN0LnRvZ2dsZShcImlzLW9wZW5cIik7XG5cbiAgICAgICAgbGV0IGNvbnRlbnQgPSBhY2NvcmRpb25UaXRsZS5uZXh0RWxlbWVudFNpYmxpbmc7XG5cbiAgICAgICAgaWYgKGNvbnRlbnQuc3R5bGUubWF4SGVpZ2h0KSB7XG4gICAgICAgICAgICBjb250ZW50LnN0eWxlLm1heEhlaWdodCA9IG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnRlbnQuc3R5bGUubWF4SGVpZ2h0ID0gY29udGVudC5zY3JvbGxIZWlnaHQgKyBcInB4XCI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXR1cFNsaWRlcigpIHtcbiAgICAgICAgIGxldCBwYXlQYWxDYXJvdXNlbCA9ICQoJy53Yy1wYXlwYWxfX2Nhcm91c2VsJylcbiAgICAgICAgcGF5UGFsQ2Fyb3VzZWwub3dsQ2Fyb3VzZWwoe1xuICAgICAgICAgICAgbG9vcDp0cnVlLFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBuYXY6dHJ1ZSxcbiAgICAgICAgICAgIGRvdHM6IGZhbHNlLFxuICAgICAgICAgICAgYXV0b3BsYXk6dHJ1ZSxcbiAgICAgICAgICAgIGF1dG9wbGF5VGltZW91dDo1MDAwLFxuICAgICAgICAgICAgc3RhZ2VQYWRkaW5nOiAxNTAsXG4gICAgICAgICAgICBuYXZUZXh0OiBbXG4gICAgICAgICAgICAgICAgJzxzdmcgd2lkdGg9XCIzMFwiIGhlaWdodD1cIjMwXCIgdmlld0JveD1cIjAgMCAzMCAzMFwiIGZpbGw9XCJub25lXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPjxwYXRoIGQ9XCJNMTggOEwxMSAxNUwxOCAyMlwiIHN0cm9rZS13aWR0aD1cIjJcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIi8+PC9zdmc+JyxcbiAgICAgICAgICAgICAgICAnPHN2ZyB3aWR0aD1cIjMwXCIgaGVpZ2h0PVwiMzBcIiB2aWV3Qm94PVwiMCAwIDMwIDMwXCIgZmlsbD1cIm5vbmVcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI+IDxwYXRoIGQ9XCJNMTIgOEwxOSAxNUwxMiAyMlwiIHN0cm9rZS13aWR0aD1cIjJcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIi8+IDwvc3ZnPicsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgcmVzcG9uc2l2ZTp7XG4gICAgICAgICAgICAgICAgMDp7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOjEsXG4gICAgICAgICAgICAgICAgICAgIHN0YWdlUGFkZGluZzogNTBcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIDYwMDoge1xuICAgICAgICAgICAgICAgICAgICBpdGVtczoxLFxuICAgICAgICAgICAgICAgICAgICBzdGFnZVBhZGRpbmc6IDE1MFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgMTAyNDp7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zOjMsXG4gICAgICAgICAgICAgICAgICAgIGF1dG9wbGF5OmZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBzdGFnZVBhZGRpbmc6IDAsXG4gICAgICAgICAgICAgICAgICAgIG1hcmdpbjogNDAsXG4gICAgICAgICAgICAgICAgICAgIG1vdXNlRHJhZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHRvdWNoRHJhZzogZmFsc2VcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIDExNTA6e1xuICAgICAgICAgICAgICAgICAgICBpdGVtczozLFxuICAgICAgICAgICAgICAgICAgICBhdXRvcGxheTpmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgc3RhZ2VQYWRkaW5nOiAwLFxuICAgICAgICAgICAgICAgICAgICBtYXJnaW46IDUwLFxuICAgICAgICAgICAgICAgICAgICBtb3VzZURyYWc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICB0b3VjaERyYWc6IGZhbHNlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cbn1cblxubmV3IFRlbXBsYXRlKCk7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFBQSxNQUFNLFFBQVEsQ0FBQztJQUNmLElBQUksV0FBVyxHQUFHO0lBQ2xCO0lBQ0EsUUFBUSxNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsMkJBQTJCLENBQUM7SUFDdEYsUUFBUSxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxLQUFLO0lBQy9DLFlBQVksU0FBUyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoRixRQUFRLENBQUMsQ0FBQzs7SUFFVixRQUFRLElBQUksQ0FBQyxXQUFXLEVBQUU7SUFDMUIsSUFBSTtJQUNKLElBQUksZUFBZSxDQUFDLEtBQUssRUFBRTtJQUMzQixRQUFRLElBQUksY0FBYyxHQUFHLEtBQUssQ0FBQztJQUNuQztJQUNBLFFBQVEsY0FBYyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDOztJQUVsRCxRQUFRLElBQUksT0FBTyxHQUFHLGNBQWMsQ0FBQyxrQkFBa0I7O0lBRXZELFFBQVEsSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRTtJQUNyQyxZQUFZLE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLElBQUk7SUFDMUMsUUFBUSxDQUFDLE1BQU07SUFDZixRQUFRLE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxZQUFZLEdBQUcsSUFBSTtJQUM3RCxRQUFRO0lBQ1IsSUFBSTs7SUFFSixJQUFJLFdBQVcsR0FBRztJQUNsQixTQUFTLElBQUksY0FBYyxHQUFHLENBQUMsQ0FBQyxzQkFBc0I7SUFDdEQsUUFBUSxjQUFjLENBQUMsV0FBVyxDQUFDO0lBQ25DLFlBQVksSUFBSSxDQUFDLElBQUk7SUFDckI7SUFDQSxZQUFZLEdBQUcsQ0FBQyxJQUFJO0lBQ3BCLFlBQVksSUFBSSxFQUFFLEtBQUs7SUFDdkIsWUFBWSxRQUFRLENBQUMsSUFBSTtJQUN6QixZQUFZLGVBQWUsQ0FBQyxJQUFJO0lBQ2hDLFlBQVksWUFBWSxFQUFFLEdBQUc7SUFDN0IsWUFBWSxPQUFPLEVBQUU7SUFDckIsZ0JBQWdCLG9NQUFvTTtJQUNwTixnQkFBZ0Isc01BQXNNO0lBQ3ROLGFBQWE7SUFDYixZQUFZLFVBQVUsQ0FBQztJQUN2QixnQkFBZ0IsQ0FBQyxDQUFDO0lBQ2xCLG9CQUFvQixLQUFLLENBQUMsQ0FBQztJQUMzQixvQkFBb0IsWUFBWSxFQUFFO0lBQ2xDLGlCQUFpQjtJQUNqQixnQkFBZ0IsR0FBRyxFQUFFO0lBQ3JCLG9CQUFvQixLQUFLLENBQUMsQ0FBQztJQUMzQixvQkFBb0IsWUFBWSxFQUFFO0lBQ2xDLGlCQUFpQjtJQUNqQixnQkFBZ0IsSUFBSSxDQUFDO0lBQ3JCLG9CQUFvQixLQUFLLENBQUMsQ0FBQztJQUMzQixvQkFBb0IsUUFBUSxDQUFDLEtBQUs7SUFDbEMsb0JBQW9CLFlBQVksRUFBRSxDQUFDO0lBQ25DLG9CQUFvQixNQUFNLEVBQUUsRUFBRTtJQUM5QixvQkFBb0IsU0FBUyxFQUFFLEtBQUs7SUFDcEMsb0JBQW9CLFNBQVMsRUFBRTtJQUMvQixpQkFBaUI7SUFDakIsZ0JBQWdCLElBQUksQ0FBQztJQUNyQixvQkFBb0IsS0FBSyxDQUFDLENBQUM7SUFDM0Isb0JBQW9CLFFBQVEsQ0FBQyxLQUFLO0lBQ2xDLG9CQUFvQixZQUFZLEVBQUUsQ0FBQztJQUNuQyxvQkFBb0IsTUFBTSxFQUFFLEVBQUU7SUFDOUIsb0JBQW9CLFNBQVMsRUFBRSxLQUFLO0lBQ3BDLG9CQUFvQixTQUFTLEVBQUU7SUFDL0I7SUFDQTtJQUNBLFNBQVM7SUFDVCxJQUFJO0lBQ0o7O0lBRUEsSUFBSSxRQUFRLEVBQUU7Ozs7OzsifQ==
