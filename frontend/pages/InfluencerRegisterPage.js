// SponsorRegisterPage.js
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
            message: ''
        };
    },
    methods: {
        async registerSponsor() {
            try {
                const response = await axios.post('/register-influencer', this.form, {
                    headers: { 'Content-Type': 'application/json' }
                });
                this.message = response.data.message;
                if (response.status === 200) {
                    this.resetForm();
                }
            } catch (error) {
                this.message = error.response?.data.message || 'An error occurred.' + error;
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
