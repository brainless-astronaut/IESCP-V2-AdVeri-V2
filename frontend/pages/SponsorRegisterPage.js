// frontend/pages/SponsorRegisterPage.js

export default {
    data() {
        return {
            form: {
                username: '',
                email: '',
                password: '',
                entity_name: '',
                industry: '',
                budget: '',
                role: 'sponsor' // Hardcoded role as per requirement
            },
            message: ''
        };
    },
    methods: {
        async registerSponsor() {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    console.error("Token is missing in localStorage.");
                    return;
                }
                const response = await fetch(location.origin + '/register-sponsor', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(this.form)
                });

                const data = await response.json();

                if (response.ok) {
                    this.message = data.message;
                    this.$router.push('/');
                } else {
                    this.message = data.message || 'An error occurred.';
                }
            } catch (error) {
                this.message = 'An error occurred: ' + error;
            }
        },
        resetForm() {
            this.form = {
                username: '',
                email: '',
                password: '',
                entity_name: '',
                industry: '',
                budget: '',
                role: 'sponsor'
            };
        }
    },
    template: `
        <div>
            <h1>Sponsors Registration</h1>
            <div v-if="message">
                <p>{{ message }}</p>
            </div>
            <form @submit.prevent="registerSponsor">
                <label for="username">Username:</label>
                <input type="text" v-model="form.username" placeholder="Enter your username" required>

                <label for="email">Email:</label>
                <input type="text" v-model="form.email" placeholder="Enter your email ID" required>

                <label for="password">Password:</label>
                <input type="password" v-model="form.password" placeholder="Enter your password" required>

                <label for="entity_name">Company/Individual Name:</label>
                <input type="text" v-model="form.entity_name" placeholder="Enter the company or individual name" required>

                <label for="industry">Industry:</label>
                <select v-model="form.industry" required>
                    <option value="">Select Industry</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="fashion & beauty">Fashion & Beauty</option>
                    <option value="tech">Tech</option>
                    <option value="food/beverage">Food/Beverages</option>
                    <option value="travel/tourism">Travel/Tourism</option>
                    <option value="fitness">Fitness</option>
                    <option value="gaming">Gaming</option>
                    <option value="other">Other</option>
                </select>

                <label for="budget">Budget:</label>
                <input type="number" v-model="form.budget" placeholder="Enter your budget" required>

                <button type="submit">Register</button>
            </form>
        </div>
    `
};

