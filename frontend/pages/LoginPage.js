// LoginPage.js
// import jwt_decode from 'jwt-decode';

export default {
    data() {
        return {
            username: '',
            password: '',
            message: ''
        };
    },
    methods: {
        async login() {
            try {
                const response = await axios.post('/login', {
                    username: this.username,
                    password: this.password
                });

                if (response.status === 200) {
                    this.message = 'Login successful!';
                    // localStorage.setItem('token', response.data.access_token); 
                    // // this.$router.push('/admin-dashboard'); 
                    // // const userRole = response.data.access_token.identity.role;

                    // // Decode the token to get user role
                    // const decodedToken = jwt_decode(response.data.access_token);
                    // const userRole = decodedToken.role;

                    // //  redirect based on role
                    // if (userRole === 'admin') {
                    //     this.$router.push('/admin-dashboard');
                    // } else if (userRole === 'sponsor') {
                    //     this.$router.push('/sponsor-dashboard');
                    // } else if (userRole === 'influencer') {
                    //     this.$router.push('/influencer-dashboard');
                    // } else {
                    //     this.message = 'Invalid user role!';
                    //     return; // Redirect to home page if invalid role is detected.
                    // }
                }
                else {
                    this.message = 'Invalid credentials!';
                }

            } catch (error) {
                this.message = error.response?.data?.message || 'An error occurred while trying to login.' + error;
            }
        }
    },
    template: `
        <div class="login-container">
            <h2>Login</h2>
            <div v-if="message" class="message">
                <p>{{ message }}</p>
            </div>
            <form @submit.prevent="login">
                <input type="text" v-model="username" placeholder="Enter username" required>
                <input type="password" v-model="password" placeholder="Enter password" required>
                <button type="submit">Login</button>
            </form>
            <a href="/register">Don't have an account? Register here</a>
        </div>
    `
};