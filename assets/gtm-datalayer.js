// window.addEventListener("message", (event) => {

//   if (event.data.type === "shopify_page_viewed") {
    
//         let payload = event.data.payload;
    
//         window.dataLayer.push({
//             event: "page_view",

//             page_location: payload.context.document.location.href,
//             page_title: payload.context.document.title,
//             page_path: payload.context.document.location.pathname,
//             page_test: 'page test'
//         });
        
//   }

// });