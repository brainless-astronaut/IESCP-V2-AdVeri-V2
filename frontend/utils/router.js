// frontend/utils/router.js

import HomePage from '../pages/HomePage.js';
import SponsorRegisterPage from '../pages/SponsorRegisterPage.js';
import InfluencerRegisterPage from '../pages/InfluencerRegisterPage.js';
import AdminDashboard from '../pages/AdminDashboard.js';
import SponsorDashboard from '../pages/SponsorDashboard.js';
import SponsorCampaigns from '../pages/SponsorCampaigns.js';
import SponsorRequests from '../pages/SponsorRequests.js';
import InfluencerDashboard from '../pages/InfluencerDashboard.js';
import InfluencerRequests from '../pages/InfluencerRequests.js'
// import { checkUserRole } from '../utils/checkUserRole';

// async function checkAdmin(to, from, next) {
//     const userRole = await checkUserRole();
//     if (userRole !== 'admin') {
//         alert("You don't have permission to access this page");
//         next({ name: 'login' });
//     } else {
//         next();
//     }
// }
  
// async function checkSponsor(to, from, next) {
//     const userRole = await checkUserRole();
//     if (userRole !== 'sponsor') {
//         alert("You don't have permission to access this page");
//         next({ name: 'login' });
//     } else {
//         next();
//     }
// }

// async function checkInfluencer(to, from, next) {
//     const userRole = await checkUserRole();
//     if (userRole!== 'influencer') {
//         alert("You don't have permission to access this page");
//         next({ name: 'login' });
//     } else {
//         next();
//     }
// }

// const routes = [
//   { path: '/', component: HomePage },
//   { path: '/register-sponsor', component: SponsorRegisterPage },
//   { path: '/register-influencer', component: InfluencerRegisterPage },
//   { path: '/admin-dashboard', component: AdminDashboard, beforeEnter: checkAdmin },
//   { path: '/sponsor-dashboard', component: SponsorDashboard, beforeEnter: checkSponsor },
//   { path: '/sponsor-campaigns', component: SponsorCampaigns, beforeEnter: checkSponsor },
// //   {path : '/sponsor-campaigns/:id', component : SponsorCampaigns, beforeEnter: checkSponsor },
//   {path : '/sponsor-requests', component : SponsorRequests, beforeEnter: checkSponsor },
// //   {path : '/sponsor-requests/:id', component : SponsorRequests, beforeEnter: checkSponsor },
//   {path : '/influencer-dashboard', component : InfluencerDashboard, beforeEnter: checkInfluencer },
//   {path : '/influencer-requests', component : InfluencerRequests, beforeEnter: checkInfluencer },
// //   {path : '/influencer-requests/:id', component : InfluencerRequests},
// ];


const routes = [
    { path: '/', component: HomePage },
    { path: '/register-sponsor', component: SponsorRegisterPage },
    { path: '/register-influencer', component: InfluencerRegisterPage },
    { path: '/admin-dashboard', component: AdminDashboard},
    { path: '/sponsor-dashboard', component: SponsorDashboard},
    { path: '/sponsor-campaigns', component: SponsorCampaigns},
  //   {path : '/sponsor-campaigns/:id', component : SponsorCampaigns, beforeEnter: checkSponsor },
    {path : '/sponsor-requests', component : SponsorRequests},
  //   {path : '/sponsor-requests/:id', component : SponsorRequests, beforeEnter: checkSponsor },
    {path : '/influencer-dashboard', component : InfluencerDashboard},
    {path : '/influencer-requests', component : InfluencerRequests},
  //   {path : '/influencer-requests/:id', component : InfluencerRequests},
  ];

// to check if user is authenticated 
// () - means function
const isAuthenitcated = () => {
    const token = localStorage.getItem('accessToken'); 
    return  token !== null;
};

const router = new VueRouter({
    routes,
});

router.beforeEach((to, from, next) => {
    // const publicPages = ['/home', '/register', '/register-sponsor', '/register-influencer', '/login']; // routes that don't require authentication
    const publicPages = ['/', '/register', '/register-sponsor', '/register-influencer', '/login']
    // const authRequired = !publicPages.includes(to.path);
    // const loggedIn = isAuthenitcated();

    next();  // allow navigation
})

export default router;