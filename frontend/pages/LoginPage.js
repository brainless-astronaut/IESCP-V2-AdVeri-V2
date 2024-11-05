// export default {
//     template : `
//     <div>
//         <h1> Login </h1>
//         <input placeholder="username"  v-model="username"/>  
//         <input placeholder="password"  v-model="password"/>  
//         <button class='btn btn-primary' @click="login"> Login </button>
//     </div>
//     `,
//     data(){
//         return {
//             username : null,
//             password : null,
//         } 
//     },
//     methods : {
//         async login(){
//             const res = await axios.post(location.origin+'/login', 
//                 {
//                     method : 'POST', 
//                     headers: {'Content-Type' : 'application/json'}, 
//                     body : JSON.stringify({'username': this.username,'password': this.password})
//                 })
//             if (res.ok){
//                 console.log('Login successful!')
//                 const data = await res.json()
              
//                 localStorage.setItem('user', JSON.stringify(data))
                
//                 this.$store.commit('setUser')
//                 this.$router.push('/feed')
//             }
//         }
//     }
// }


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