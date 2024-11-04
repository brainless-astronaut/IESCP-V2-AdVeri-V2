// // frontend/app.js
// // import { createApp } from 'vue';
// // import { createRouter, createWebHistory } from 'vue-router';


// const { createApp } = 'vue';
// const { createRouter, createWebHistory } = 'vue-router';

// import HomePage from './pages/HomePage.js';
// import LoginPage from './pages/LoginPage.js';
// import RegisterPage from './pages/RegisterPage.js';
// import SponsorRegisterPage from './pages/SponsorRegisterPage.js';
// import InfluencerRegisterPage from './pages/InfluencerRegisterPage.js';

// const routes = [
//     { path: '/home', component: HomePage },
//     { path: '/login', component: LoginPage },
//     { path: '/register', component: RegisterPage },
//     { path: '/register-sponsor', component: SponsorRegisterPage},
//     { path: '/register-sponsor', component: InfluencerRegisterPage},
// ];

// const router = createRouter({
//     history: createWebHistory(),
//     routes,
// });

// const app = createApp({});
// app.use(router);
// app.mount('#app');


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