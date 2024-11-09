// frontend/pages/HomePage.js

export default {
    template: `
    <div class="container">
        <div class="left">
            <h1>AdVeri</h1>
            <p>Where Ads Meet Authenticity</p>
        </div>
        <div class="right">
            <p class="welcome-text">Welcome!</p>
            <div class="button-container">
                <h2>Login</h2>
                <div v-if="message" class="message">
                    <p>{{ message }}</p>
                </div>
                <form @submit.prevent="login">
                    <input type="text" v-model="username" placeholder="Enter username" required>
                    <input type="password" v-model="password" placeholder="Enter password" required>
                    <button type="submit" class="btn-primary">Login</button>
                </form>
                <a href="/register">Don't have an account? Register here as </a>
                    <h1>----------------------</h1>
                    <div class="button-container">
                        <router-link to="/register-sponsor" class="btn-primary">Sponsor</router-link> |
                        <router-link to="/register-influencer" class="btn-secondary">Influencer</router-link>
                    </div>
                <router-link to="/register" class="button">Register</router-link>
            </div>
        </div>
        <footer>
            Thank you for using AdVeri! <br>
            If you have any issues, please contact us at support@adveri.com <br>
            &copy; 2024 AdVeri. All rights reserved.
        </footer>
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
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: this.username,
                        password: this.password
                    })
                });
                const data = await response.json();
                if (response.ok) {
                    this.message = 'Login successful!';
                    localStorage.setItem('accessToken', data.access_token);
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
