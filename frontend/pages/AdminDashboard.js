// frontend/pages/AdminDashboard.js

export default {
    template: `
    <div>
        <header class="navbar">
            <div class="navbar-left">
                <h1>Admin | Dashboard</h1>
            </div>
            <nav class="navbar-links">
                <router-link to="/admin-dashboard">Dashboard</router-link>
                <router-link to="/admin-users">Users</router-link>
                <router-link to="/admin-campaigns">Campaigns</router-link>
                <router-link to="/admin-approve-sponsor">Sponsor Applications</router-link>
                <router-link to="/logout">Logout</router-link>
            </nav>
        </header> 

        <div class="container">
            <div v-if="messages.length" class="modal">
                <div class="modal-content">
                    <p v-for="(message, index) in messages" :key="index" :class="message.category">
                        {{ message.text }}
                    </p>
                    <button class="close-button" @click="closeMessageModal" style="align-items: center">Close</button>
                </div>
            </div>

            <div class="left">
                <h2>Counts</h2>
                <div class="card-container">
                    <div class="card">
                        <h3>Sponsors</h3>
                        <p>{{ counts.sponsors_count }}</p>
                    </div>
                    <div class="card">
                        <h3>Influencers</h3>
                        <p>{{ counts.influencers_count }}</p>
                    </div>
                    <div class="card">
                        <h3>Campaigns</h3>
                        <p>{{ counts.campaigns_count }}</p>
                    </div>
                    <div class="card">
                        <h3>Pending Sponsors</h3>
                        <p>{{ counts.sponsors_to_approve_count }}</p>
                    </div>
                    <div class="card">
                        <h3>Flagged Sponsors</h3>
                        <p>{{ counts.flagged_sponsors_count }}</p>
                    </div>
                    <div class="card">
                        <h3>Flagged Influencers</h3>
                        <p>{{ counts.flagged_influencers_count }}</p>
                    </div>
                    <div class="card">
                        <h3>Flagged Campaigns</h3>
                        <p>{{ counts.flagged_campaigns_count }}</p>
                    </div>
                </div>
            </div>
            <div class="right">
                <canvas id="sponsorsChart">spns ind</canvas>
                <canvas id="campaignsChart">cmpps ind</canvas>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            messages: [],
            counts: {},
            sponsorsDistribution: {},
            campaignsDistribution: {},
            token: localStorage.getItem('accessToken')
        };
    },
    created() {
        this.fetchDashboardData();
    },

    methods: {
        async fetchDashboardData() {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    this.$router.push({
                        path: '/login',
                        query: { message: 'Token has expired. Please login again.' }
                    });
                    return;
                }

                const decodedToken = jwt_decode(token);
                const userRole = decodedToken.sub.role;
                
                if (userRole !== 'admin') {
                    this.$router.push({
                        path: '/',
                        query: { message: 'You are not authorized to access this page.' }
                    });
                    return;
                }

                const response = await fetch(location.origin + '/admin-dashboard', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch dashboard data");
                }

                const data = await response.json();
                this.counts = {
                    sponsors_count: data.sponsors_count,
                    influencers_count: data.influencers_count,
                    campaigns_count: data.campaigns_count,
                    sponsors_to_approve_count: data.sponsors_to_approve_count,
                    flagged_sponsors_count: data.flagged_sponsors_count,
                    flagged_influencers_count: data.flagged_influencers_count,
                    flagged_campaigns_count: data.flagged_campaigns_count,
                };
                this.sponsorsDistribution = data.sponsors_distribution;
                this.campaignsDistribution = data.campaigns_distribution;

                this.renderCharts();
            } catch (error) {
                console.error("Error fetching dashboard data:", error);

                this.messages.push({
                    text: `Error fetching dashboard data: ${error.message}`,
                    category: 'success',
                });
            }
        },
        renderCharts() {
            const sponsorsCtx = document.getElementById('sponsorsChart').getContext('2d');
            new Chart(sponsorsCtx, {
                type: 'bar',
                data: {
                    labels: Object.keys(this.sponsorsDistribution),
                    datasets: [{
                        label: 'Sponsors by Industry',
                        data: Object.values(this.sponsorsDistribution),
                        backgroundColor: 'rgba(0, 171, 213, 1)',
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });

            const campaignsCtx = document.getElementById('campaignsChart').getContext('2d');
            new Chart(campaignsCtx, {
                type: 'bar',
                data: {
                    labels: Object.keys(this.campaignsDistribution),
                    datasets: [{
                        label: 'Campaigns by Industry',
                        data: Object.values(this.campaignsDistribution),
                        backgroundColor: 'rgba(0, 171, 213, 1)',
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        },
        async closeMessageModal() {
            this.messages = []; // Clear messages to hide the modal
        },
    }
};