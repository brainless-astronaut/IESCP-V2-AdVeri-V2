// // frontend/app.js

import router from "./utils/router.js"
import axios from 'https://cdn.jsdelivr.net/npm/axios@1.4.0/dist/axios.min.js';


const app = new Vue({
    el : '#app',
    
    router,
    template: '<router-view></router-view>',
    axios

})

export default app