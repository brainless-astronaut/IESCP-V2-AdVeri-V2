export default {
    template: `
        <div>
            <h1>Click the button to generate report</h1>
            <button @click="trigger_report">Generate report</button>
        </div>    
    `,
    methods: {
        async trigger_report() {
            const token = localStorage.getItem('accessToken')
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