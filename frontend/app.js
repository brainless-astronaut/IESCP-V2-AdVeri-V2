// // frontend/app.js

import router from "./utils/router.js"

const app = new Vue({
    el : '#app',
    router,
    template: '<router-view></router-view>',
})

export default app