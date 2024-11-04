import HomePage from '../pages/HomePage.js';
import RegisterPage from '../pages/RegisterPage.js';
import SponsorRegisterPage from '../pages/SponsorRegisterPage.js';
import InfluencerRegisterPage from '../pages/InfluencerRegisterPage.js';
import LoginPage from '../pages/LoginPage.js';


const routes = [
  {path : '/home', component : HomePage},
  {path : '/register', component : RegisterPage},
  {path : '/register-sponsor', component : SponsorRegisterPage},
  {path : '/register-influencer', component : InfluencerRegisterPage},
  {path : '/login', component : LoginPage},
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
    const publicPages = ['/home', '/register', '/register-sponsor', '/register-influencer', '/login']; // routes that don't require authentication
    const authRequired = !publicPages.includes(to.path);
    const loggedIn = isAuthenitcated();

    // if (authRequired && !loggedIn) {
    //     return next('/login') // redirect to login page if not logged in
    // }

    next();  // allow navigation
})

export default router;