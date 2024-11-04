// // Import Vue and your components
// const { createApp } = Vue; // Adjust this line if you are not using Vue via CDN

// import InfluencerRegisterPage from '.pages/InfluencerRegisterPage.js'; // Adjust path as necessary
// import SponsorRegisterPage from '.pages/SponsorRegisterPage.js'; // Adjust path as necessary

// const app = createApp({
//   data() {
//     return {
//       currentPage: 'InfluencerRegisterPage', // Default page to show
//     };
//   },
//   components: {
//     InfluencerRegisterPage,
//     SponsorRegisterPage,
//   },
//   template: `
//     <div>
//       <button @click="currentPage = 'InfluencerRegisterPage'">Register Influencer</button>
//       <button @click="currentPage = 'SponsorRegisterPage'">Register Sponsor</button>

//       <component :is="currentPage"></component>
//     </div>
//   `
// });

// // Mount the Vue instance to the DOM
// app.mount('#app');


import Navbar from "./components/Navbar.js"
import router from "./utils/router.js"
import store from "./utils/store.js"

const app = new Vue({
    el : '#app',
    template : `
        <div> 
            <Navbar />
            <router-view> </router-view>
        </div>
    `,
    components : {
        Navbar,
    },
    router,
    store,
})