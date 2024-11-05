// // frontend/app.js

import router from "./utils/router.js"

const app = new Vue({
    el : '#app',
    // template : `
    //     <div> 
    //         <router-view> </router-view>
    //     </div>
    // `,
    // components : {
    //     Navbar,
    // },
    router,
    template: '<router-view></router-view>',
    // store,
})