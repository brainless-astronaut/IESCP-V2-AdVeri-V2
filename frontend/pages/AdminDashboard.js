// frontend/pages/AdminDashboard.js

export default {
    template: `
        <div id="app">
            <h1>Admin Dashboard</h1>
            <div>
                <h2>Counts</h2>
                <p>Sponsors: {{ counts.sponsors_count }}</p>
                <p>Influencers: {{ counts.influencers_count }}</p>
                <p>Campaigns: {{ counts.campaigns_count }}</p>
                <p>Pending Sponsors: {{ counts.sponsors_to_approve_count }}</p>
                <p>Flagged Sponsors: {{ counts.flagged_sponsors_count }}</p>
                <p>Flagged Influencers: {{ counts.flagged_influencers_count }}</p>
                <p>Flagged Campaigns: {{ counts.flagged_campaigns_count }}</p>
            </div>
            <canvas id="sponsorsChart">spns ind</canvas>
            <canvas id="campaignsChart">cmpps ind</canvas>
        </div>
    `,
    data() {
        return {
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
                    console.error("Token is missing in localStorage.");
                    return;
                }
                console.log('Token:', localStorage.getItem('accessToken'));
                const response = await axios.get('/admin-dashboard', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = response.data;
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
            };
        },
        renderCharts() {
            // SPonsor Distribution Chart
            const sponsorCtx = document.getElementById('sponsorsChart').getContext('2d');
        new Chart(sponsorCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(this.sponsorsDistribution),
                datasets: [{
                    label: 'Sponsors by Industry',
                    data: Object.values(this.sponsorsDistribution),
                    backgroundColor: 'rgba(225, 225, 255, 0.6)',
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    },
                    x: {
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
                        backgroundColor: 'rgba(0, 105, 62, 0.6)',
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
        }
    }
}

// export default {
//     template: `
//         <div id="app">
//             <h1>Admin Dashboard</h1>

//             <div>
//                 <h2>Counts</h2>
//                 <p>Sponsors: {{ counts.sponsors_count }}</p>
//                 <p>Influencers: {{ counts.influencers_count }}</p>
//                 <p>Campaigns: {{ counts.campaigns_count }}</p>
//                 <p>Pending Sponsors: {{ counts.sponsors_to_approve_count }}</p>
//                 <p>Flagged Sponsors: {{ counts.flagged_sponsors_count }}</p>
//                 <p>Flagged Influencers: {{ counts.flagged_influencers_count }}</p>
//                 <p>Flagged Campaigns: {{ counts.flagged_campaigns_count }}</p>
//             </div>

//             <canvas id="sponsorsChart"></canvas>
//             <canvas id="campaignsChart"></canvas>

//             <!-- User Table -->
//             <div>
//                 <h2>Users</h2>
//                 <table>
//                     <thead>
//                         <tr>
//                             <th>Name</th>
//                             <th>Type</th>
//                             <th>Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         <tr v-for="user in users" :key="user.id">
//                             <td>{{ user.name }}</td>
//                             <td>{{ user.type }}</td>
//                             <td>
//                                 <button @click="flagUser(user.id)">Flag</button>
//                                 <button @click="unflagUser(user.id)">Unflag</button>
//                                 <button @click="deleteUser(user.id)">Delete</button>
//                             </td>
//                         </tr>
//                     </tbody>
//                 </table>
//             </div>

//             <!-- Campaign Table -->
//             <div>
//                 <h2>Campaigns</h2>
//                 <table>
//                     <thead>
//                         <tr>
//                             <th>Campaign Name</th>
//                             <th>Status</th>
//                             <th>Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         <tr v-for="campaign in campaigns" :key="campaign.id">
//                             <td>{{ campaign.name }}</td>
//                             <td>{{ campaign.status }}</td>
//                             <td>
//                                 <button @click="flagCampaign(campaign.id)">Flag</button>
//                                 <button @click="unflagCampaign(campaign.id)">Unflag</button>
//                                 <button @click="deleteCampaign(campaign.id)">Delete</button>
//                             </td>
//                         </tr>
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     `,
//     data() {
//         return {
//             counts: {},
//             sponsorsDistribution: {},
//             campaignsDistribution: {},
//             users: [], // To hold user data
//             campaigns: [], // To hold campaign data
//             token: localStorage.getItem('jwt_token') // Assuming JWT token is stored here
//         };
//     },
//     created() {
//         this.fetchDashboardData();
//         this.fetchUsers();
//         this.fetchCampaigns();
//     },
//     methods: {
//         async fetchDashboardData() {
//             try {
//                 const response = await axios.get('/admin-dashboard', {
//                     headers: {
//                         Authorization: `Bearer ${this.token}`
//                     }
//                 });
//                 const data = response.data;
//                 this.counts = { /* set counts here based on response data */ };
//                 this.sponsorsDistribution = data.sponsors_distribution;
//                 this.campaignsDistribution = data.campaigns_distribution;
//                 this.renderCharts();
//             } catch (error) {
//                 console.error("Error fetching dashboard data:", error);
//             }
//         },
//         async fetchUsers() {
//             try {
//                 const response = await axios.get('/admin-users', {
//                     headers: { Authorization: `Bearer ${this.token}` }
//                 });
//                 this.users = response.data.users;
//             } catch (error) {
//                 console.error("Error fetching users:", error);
//             }
//         },
//         async fetchCampaigns() {
//             try {
//                 const response = await axios.get('/admin-campaigns', {
//                     headers: { Authorization: `Bearer ${this.token}` }
//                 });
//                 this.campaigns = response.data.campaigns;
//             } catch (error) {
//                 console.error("Error fetching campaigns:", error);
//             }
//         },
//         async flagUser(userId) {
//             try {
//                 await axios.post(`/admin-users/${userId}/flag`, {}, {
//                     headers: { Authorization: `Bearer ${this.token}` }
//                 });
//                 this.fetchUsers();
//             } catch (error) {
//                 console.error("Error flagging user:", error);
//             }
//         },
//         async unflagUser(userId) {
//             try {
//                 await axios.post(`/admin-users/${userId}/unflag`, {}, {
//                     headers: { Authorization: `Bearer ${this.token}` }
//                 });
//                 this.fetchUsers();
//             } catch (error) {
//                 console.error("Error unflagging user:", error);
//             }
//         },
//         async deleteUser(userId) {
//             try {
//                 await axios.delete(`/admin-users/${userId}`, {
//                     headers: { Authorization: `Bearer ${this.token}` }
//                 });
//                 this.fetchUsers();
//             } catch (error) {
//                 console.error("Error deleting user:", error);
//             }
//         },
//         async flagCampaign(campaignId) {
//             try {
//                 await axios.post(`/admin-campaigns/${campaignId}/flag`, {}, {
//                     headers: { Authorization: `Bearer ${this.token}` }
//                 });
//                 this.fetchCampaigns();
//             } catch (error) {
//                 console.error("Error flagging campaign:", error);
//             }
//         },
//         async unflagCampaign(campaignId) {
//             try {
//                 await axios.post(`/admin-campaigns/${campaignId}/unflag`, {}, {
//                     headers: { Authorization: `Bearer ${this.token}` }
//                 });
//                 this.fetchCampaigns();
//             } catch (error) {
//                 console.error("Error unflagging campaign:", error);
//             }
//         },
//         async deleteCampaign(campaignId) {
//             try {
//                 await axios.delete(`/admin-campaigns/${campaignId}`, {
//                     headers: { Authorization: `Bearer ${this.token}` }
//                 });
//                 this.fetchCampaigns();
//             } catch (error) {
//                 console.error("Error deleting campaign:", error);
//             }
//         },
//         renderCharts() {
//             // Render charts code here, as before
//         }
//     }
// };






