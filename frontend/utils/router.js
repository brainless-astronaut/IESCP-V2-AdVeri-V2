// frontend/utils/router.js

import HomePage from '../pages/HomePage.js';
import SponsorRegisterPage from '../pages/SponsorRegisterPage.js';
import InfluencerRegisterPage from '../pages/InfluencerRegisterPage.js';
import AdminDashboard from '../pages/AdminDashboard.js';
import AdminManageCampaigns from '../pages/AdminManageCampaigns.js';
import AdminManageUsers from '../pages/AdminManageUsers.js'
import AdminApproveSponsor from '../pages/AdminApproveSponsor.js'
import SponsorReports from '../pages/SponsorReports.js'
import SponsorDashboard from '../pages/SponsorDashboard.js';
import SponsorCampaigns from '../pages/SponsorCampaigns.js';
import SponsorRequests from '../pages/SponsorRequests.js';
import InfluencerDashboard from '../pages/InfluencerDashboard.js';
import InfluencerSendRequests from '../pages/InfluencerSendRequests.js'
import InfluencerManageRequests from '../pages/InfluencerManageRequests.js';
import UserLogout from '../pages/UserLogout.js';

const routes = [
    { path: '/', component: HomePage },
    { path: '/register-sponsor', component: SponsorRegisterPage },
    { path: '/register-influencer', component: InfluencerRegisterPage },
    { path: '/admin-dashboard', component: AdminDashboard },
    { path: '/admin-users', component: AdminManageUsers },
    { path: '/admin-campaigns', component: AdminManageCampaigns },
    { path: '/admin-approve-sponsor', component: AdminApproveSponsor },
    { path: '/sponsor-reports', component: SponsorReports },
    { path: '/sponsor-dashboard', component: SponsorDashboard },
    { path: '/sponsor-campaigns', component: SponsorCampaigns },
    { path : '/sponsor-requests', component : SponsorRequests },
    { path : '/influencer-dashboard', component : InfluencerDashboard },
    { path : '/influencer-send-requests', component : InfluencerSendRequests },
    { path : '/influencer-manage-requests', component : InfluencerManageRequests },
    { path : '/logout', component : UserLogout },
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