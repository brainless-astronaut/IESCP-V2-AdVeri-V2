import HomePage from '../pages/HomePage.js';
import RegisterPage from '../pages/RegisterPage.js';
import SponsorRegisterPage from '../pages/SponsorRegisterPage.js';
import InfluencerRegisterPage from '../pages/InfluencerRegisterPage.js';
import LoginPage from '../pages/LoginPage.js';
import AdminDashboard from '../pages/AdminDashboard.js';
import SponsorDashboard from '../pages/SponsorDashboard.js';
import SponsorCampaigns from '../pages/SponsorCampaigns.js';
import SponsorRequests from '../pages/SponsorRequests.js';
import InfluencerDashboard from '../pages/InfluencerDashboard.js';
import InfluencerRequests from '../pages/InfluencerRequests.js'


async function checkAdmin(to, from, next) {
    const userRole = await checkUserRole();
    if (userRole !== 'admin') {
        alert("You don't have permission to access this page");
        next({ name: 'login' });
    } else {
        next();
    }
}
  
async function checkSponsor(to, from, next) {
    const userRole = await checkUserRole();
    if (userRole !== 'sponsor') {
        alert("You don't have permission to access this page");
        next({ name: 'login' });
    } else {
        next();
    }
}

async function checkInfluencer(to, from, next) {
    const userRole = await checkUserRole();
    if (userRole!== 'influencer') {
        alert("You don't have permission to access this page");
        next({ name: 'login' });
    } else {
        next();
    }
}

const routes = [
  {path : '/', component: HomePage},
  {path : '/register', component : RegisterPage},
  {path : '/register-sponsor', component : SponsorRegisterPage},
  {path : '/register-influencer', component : InfluencerRegisterPage},
  {path : '/login', component : LoginPage},
  {path : '/admin-dashboard', component : AdminDashboard},
  {path : '/sponsor-dashboard', component : SponsorDashboard},
  {path : '/sponsor-campaigns', component : SponsorCampaigns},
  {path : '/sponsor-campaigns/:id', component : SponsorCampaigns},
  {path : '/sponsor-requests', component : SponsorRequests},
  {path : '/sponsor-requests/:id', component : SponsorRequests},
  {path : '/influencer-dashboard', component : InfluencerDashboard},
  {path : '/influencer-requests', component : InfluencerRequest},
  {path : '/influencer-requests/:id', component : InfluencerRequest},
];

// to check if user is authenticated 
// () - means function
const isAuthenitcated = () => {
    const token = localStorage.getItem('jwt'); 
    return  token !== null;
};

const router = new VueRouter({
    routes,
});

router.beforeEach((to, from, next) => {
    // const publicPages = ['/home', '/register', '/register-sponsor', '/register-influencer', '/login']; // routes that don't require authentication
    const publicPages = ['/', '/register', '/register-sponsor', '/register-influencer', '/login']
    const authRequired = !publicPages.includes(to.path);
    const loggedIn = isAuthenitcated();

    // if (authRequired && !loggedIn) {
    //     return next('/login') // redirect to login page if not logged in
    // }

    next();  // allow navigation
})

export default router;