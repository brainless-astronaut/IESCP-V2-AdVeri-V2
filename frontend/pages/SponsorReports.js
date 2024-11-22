export default {
    template: `
        <div>
            <nav class="navbar-links">
                <router-link to="/sponsor-dashboard">Dashboard</router-link>
                <router-link to="/sponsor-campaigns">Campaigns</router-link>
                <router-link to="/sponsor-requests">Requests</router-link>
                <router-link to="/sponsor-reports">Reports</router-link>
                <router-link to="/logout">Logout</router-link>
            </nav>
            <h1>Click the button to generate report</h1>
            <button @click="trigger_report">Generate report</button>
        </div>    
    `,
    methods: {
        async trigger_report() {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                console.error("Token is missing in localStorage.");
                return;
            }
            const res = await fetch(location.origin + '/admin-reports', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            const task_id = (await res.json()).task_id // from the response
            const interval = setInterval(async() => {
                const res = await fetch(`${location.origin}/admin-reports/${task_id}`, {
                    method: POST,
                    headers : {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }) // to use the task_id
                if (res.ok) {
                    console.log('Report Generated!')
                    window.open(`${location.origin}/admin-reports/${task_id}`)
                    clearInterval(interval)
                }
            }, 100)  // fixed interval pulling every 100 milliseconds          
        },
    },
}