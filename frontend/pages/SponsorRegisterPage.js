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
                const response = await fetch('/register-sponsor', {
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
        <div class="register-container">
            <h1>Sponsors Registration</h1>
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
            <style>
                :root {
                    --rich-black: #010b13ff;
                    --rusty-red: #da2c43ff;
                    --antiflash-white: #f2f3f4ff;
                    --ut-orange: #ff8200ff;
                    --dartmouth-green: #00693eff;
                }
                body {
                    font-family: 'Work Sans', sans-serif;
                    color: var(--rich-black);
                    background-color: var(--rusty-red);
                    margin: 0;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                }
                .register-container {
                    background-color: var(--antiflash-white);
                    color: var(--rich-black);
                    padding: 20px;
                    border-radius: 10px;
                    width: 400px;
                    height: 520px;
                    flex-direction: column;
                }
                .register-container h1 {
                    margin-bottom: 20px;
                }
                .register-container label {
                    display: block;
                    margin-top: 10px;
                    text-align: justify;
                }
                .register-container input,
                .register-container select {
                    width: 380px;
                    padding: 10px;
                    margin-top: 5px;
                    margin-bottom: 10px;
                    border: 1px solid var(--rich-black);
                    border-radius: 5px;
                }
                .register-container button {
                    background-color: var(--dartmouth-green);
                    color: var(--antiflash-white);
                    font-family: 'Work Sans', sans-serif;
                    padding: 10px 20px;
                    border: none;
                    border-radius: 5px;
                    align-self: center;
                    cursor: pointer;
                    transition: background-color 0.3s;
                }
                .register-container button:hover {
                    background-color: var(--ut-orange);
                }
            </style>
        </div>
    `
};

