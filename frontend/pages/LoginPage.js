export default {
    template : `
    <div>
        <input placeholder="username"  v-model="username"/>  
        <input placeholder="password"  v-model="password"/>  
        <button class='btn btn-primary' @click="login"> Login </button>
    </div>
    `,
    data(){
        return {
            username : null,
            password : null,
        } 
    },
    methods : {
        async login(){
            const res = await fetch(location.origin+'/login', 
                {
                    method : 'POST', 
                    headers: {'Content-Type' : 'application/json'}, 
                    body : JSON.stringify({'username': this.username,'password': this.password})
                })
            if (res.ok){
                console.log('Login successful!')
                const data = await res.json()
              
                localStorage.setItem('user', JSON.stringify(data))
                
                this.$store.commit('setUser')
                this.$router.push('/feed')
            }
        }
    }
}