// frontend/pages/HomePage.js

export default {
    template: `
    <div class="login-container">
        <div class="left">
            <h1>AdVeri</h1>
            <p>Where Ads Meet Authenticity</p>
        </div>
        <div class="right">
            <div class="button-container">
                <h2>Login</h2>
                <div v-if="message" class="message">
                    <p>{{ message }}</p>
                </div>
                <form @submit.prevent="login">
                    <input type="text" v-model="username" placeholder="Enter username" required>
                    <input type="password" v-model="password" placeholder="Enter password" required>
                    <button type="submit" class="button">Login</button>
                </form>
                <p>Don't have an account? Register here as</p>
                <p>---------------------------------------</p>
                <div class="button-container">
                    <router-link to="/register-sponsor" class="button">Sponsor</router-link> |
                    <router-link to="/register-influencer" class="button">Influencer</router-link>
                </div>
            </div>
        </div>
    </div>
    `,
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
                const response = await fetch(location.origin, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: this.username,
                        password: this.password
                    })
                });
                const data = await response.json();
                if (response.ok) {
                    this.message = 'Login successful!';
                    localStorage.setItem('accessToken', data.access_token);

                    // console.log('Access Token:', data.access_token);

                    const decodedToken = jwt_decode(data.access_token);
                    console.log('token: ' + decodedToken)
                    const userRole = decodedToken.sub.role;

                    if (userRole === 'admin') {
                        this.$router.push('/admin-dashboard');
                    } else if (userRole === 'sponsor') {
                        this.$router.push('/sponsor-dashboard');
                    } else if (userRole === 'influencer') {
                        this.$router.push('/influencer-dashboard');
                    }
                } else {
                    this.message = data.message;
                }
            } catch (error) {
                console.error('Error connecting to backend:', error);
                this.message = 'An error occurred. Please try again.';
            }
        }
    },
};
