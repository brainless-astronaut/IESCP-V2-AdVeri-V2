// SponsorRegisterPage.js
export default {
    data() {
        return {
            form: {
                username: '',
                email: '',
                password: '',
                entity_name: '',
                industry: '',
                industry_other: '',
                budget: '',
                role: 'sponsor' // Hardcoded role as per requirement
            },
            message: ''
        };
    },
    methods: {
        async registerSponsor() {
            try {
                const response = await axios.post('/register-sponsor', this.form);
                this.message = response.data.message;
                if (response.status === 200) {
                    this.resetForm();
                }
            } catch (error) {
                this.message = error.response?.data.message || 'An error occurred.';
            }
        },
        resetForm() {
            this.form = {
                username: '',
                email: '',
                password: '',
                entity_name: '',
                industry: '',
                industry_other: '',
                budget: '',
                role: 'sponsor'
            };
        }
    },
    template: `
        <div class="register-container">
            <h1>Sponsors Registration</h1>
            <div v-if="message" class="message">
                <p>{{ message }}</p>
            </div>
            <form @submit.prevent="registerSponsor">
                <label for="username">Username:</label>
                <input type="text" v-model="form.username" placeholder="Enter your username" required>

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
                <input v-if="form.industry === 'other'" type="text" v-model="form.industry_other" placeholder="Specify your industry">

                <label for="budget">Budget:</label>
                <input type="number" v-model="form.budget" placeholder="Enter your budget" required>

                <button type="submit">Register</button>
            </form>
        </div>
    `
};
