// frontend/pages/InfluencerRegisterPage.js

export default {
    data() {
        return {
            form: {
                username: '',
                email: '',
                password: '',
                name: '',
                category: '',
                niche: '',
                role: 'influencer' // Hardcoded role as per requirement
            },
            message: '',
            token: localStorage.getItem('accessToken')
        };
    },
    methods: {
        async registerSponsor() {
            try {
                const response = await fetch(location.origin + '/register-influencer', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`
                    },
                    body: JSON.stringify(this.form)
                });

                const data = await response.json();
                this.message = data.message;
                
                if (response.ok) {
                    this.$router.push('/');
                }
            } catch (error) {
                this.message = 'An error occurred: ' + error;
                console.error("Error:", error);
            }
        },
        resetForm() {
            this.form = {
                username: '',
                email: '',
                password: '',
                name: '',
                category: '',
                niche: '',
                role: 'influencer'
            };
        }
    },
    template: `
        <div class="register-container">
            <h1>Influencers Registration</h1>
            <div v-if="message" class="message">
                <p>{{ message }}</p>
            </div>
            <form @submit.prevent="registerSponsor">
                <label for="username">Username:</label>
                <input type="text" v-model="form.username" placeholder="Enter your username" required>

                <label for="email">Email:</label>
                <input type="text" v-model="form.email" placeholder="Enter your email ID" required>

                <label for="password">Password:</label>
                <input type="password" v-model="form.password" placeholder="Enter your password" required>

                <label for="name">Company/Individual Name:</label>
                <input type="text" v-model="form.name" placeholder="Enter the company or individual name" required>

                <label for="category">Category:</label>
                <select v-model="form.category" required>
                    <option value="">Select Category</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="fashion & beauty">Fashion & Beauty</option>
                    <option value="tech">Tech</option>
                    <option value="food/beverage">Food/Beverages</option>
                    <option value="travel/tourism">Travel/Tourism</option>
                    <option value="fitness">Fitness</option>
                    <option value="gaming">Gaming</option>
                    <option value="other">Other</option>
                </select>

                <label for="niche">Niche:</label>
                <input type="text" v-model="form.niche" placeholder="Enter your niche" required>

                <button type="submit">Register</button>
            </form>
        </div>
    `
};

