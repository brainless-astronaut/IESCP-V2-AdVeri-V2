// frontend/pages/SponsorDashboard.js

export default {
    data() {
        return {
            totalCounts: {},
            campaignReach: {},
            messages: [],
        };
    },
    created() {
        this.fetchSponsorDashboardData();
    },
    methods: {
        async fetchSponsorDashboardData() {
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

                if (userRole !== 'sponsor') {
                    this.$router.push({
                        path: '/',
                        query: { message: 'You are not authorized to access this page.' }
                    });
                    return;
                }
                const response = await fetch(location.origin + '/sponsor-dashboard', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                // const text = await response.text();
                // console.log(text);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                // Extracting data from the response
                this.totalCounts = {
                    total_campaigns_count: data.total_campaigns_count, // Correct key alignment
                    past_campaigns_count: data.past_campaigns_count,
                    present_campaigns_count: data.present_campaigns_count,
                    future_campaigns_count: data.future_campaigns_count,
                    sent_requests_count: data.sent_requests_count,
                    received_requests_count: data.received_requests_count
                };
                this.campaignReach = data.campaign_reach_dict;
                this.$nextTick(() => {
                    this.renderCharts();
                });
            } catch (error) {
                alert(`Error fetching dashboard data:, ${error}`);
            }
        },
        renderCharts() {
            try {
                const canvas = document.getElementById('campaignReachChart');
                if (!canvas) {
                    console.error('Canvas element not found.');
                    return;
                }
        
                const countsCtx = canvas.getContext('2d');
                if (this.chart) {
                    this.chart.destroy();
                }
        
                this.chart = new Chart(countsCtx, {
                    type: 'bar',
                    data: {
                        labels: Object.keys(this.campaignReach),
                        datasets: [{
                            label: 'Reach by Campaign',
                            data: Object.values(this.campaignReach),
                            backgroundColor: 'rgba(255, 191, 0, 1)',
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
            } catch (error) {
                console.error("Error rendering chart:", error);
            }
        }
        ,
        async closeMessageModal() {
            this.message = [];
        }
    },
    template: `
        <div id="app">
            <div class="navbar">    
                <div class="navbar-left">
                    <h1>Sponsor | Dashboard</h1>
                </div>
                <div class="navbar-links">
                    <router-link to="/sponsor-dashboard">Dashboard</router-link>
                    <router-link to="/sponsor-campaigns">Campaigns</router-link>
                    <router-link to="/sponsor-requests">Requests</router-link>
                    <router-link to="/sponsor-reports">Reports</router-link>
                    <router-link to="/logout">Logout</router-link>
                </div>
            </div>
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
                            <h3>Total Campaigns</h3>
                            <p>{{ totalCounts.total_campaigns_count }}</p>
                        </div>
                        <div class="card">
                            <h3>Past Campaigns</h3>
                            <p>{{ totalCounts.past_campaigns_count }}</p>
                        </div>
                        <div class="card">
                            <h3>Present Campaigns</h3>
                            <p>{{ totalCounts.present_campaigns_count }}</p>
                        </div>
                        <div class="card">
                            <h3>Future Campaigns</h3>
                            <p>{{ totalCounts.future_campaigns_count }}</p>
                        </div>
                        <div class="card">
                            <h3>Sent Requests</h3>
                            <p>{{ totalCounts.sent_requests_count }}</p>
                        </div>
                        <div class="card">
                            <h3>Received Requests</h3>
                            <p>{{ totalCounts.received_requests_count }}</p>
                        </div>
                    </div>
                </div>
                <!-- Campaign Counts 
                <section>
                    <h2>Campaign Counts</h2>
                    <p>Total Campaigns: {{ totalCounts.total_campaigns }}</p>
                    <p>Past Campaigns: {{ totalCounts.past_campaigns_count }}</p>
                    <p>Ongoing Campaigns: {{ totalCounts.present_campaigns_count }}</p>
                    <p>Future Campaigns: {{ totalCounts.future_campaigns_count }}</p>
                </section>

                <!-- Request Counts 
                <section>
                    <h2>Request Counts</h2>
                    <p>Sent Requests: {{ totalCounts.sent_requests_count }}</p>
                    <p>Received Requests: {{ totalCounts.received_requests_count }}</p>
                </section> -->

                <!-- Campaign Reach 
                <section>
                    <h2>Campaign Reach</h2>
                    <div v-if="campaignReach">
                        <ul>
                            <li v-for="(reach, campaignName) in campaignReach" :key="campaignName">
                                <strong>{{ campaignName }}:</strong> {{ reach }} reach
                            </li>
                        </ul>
                    </div>
                </section> -->

                <!-- Reach by Campaign 
                <section>
                    <h2>Teach by Campaign</h2>
                    <div v-if="campaignReach">
                        <ul>
                            <li v-for="(count, campaignName) in campaignReach" :key="campaignName">
                                <strong>{{ campaignName }}:</strong> {{ count }} influencers
                            </li>
                        </ul>
                    </div>
                </section> -->

                <!-- Campaign Listings -->
                <!-- <section>
                    <h2>Campaign Listings</h2>
                    <h3>Past Campaigns</h3>
                    <ul v-if="pastCampaigns.length">
                        <li v-for="campaign in pastCampaigns" :key="campaign.id">{{ campaign.name }} (Ended)</li>
                    </ul>
                    
                    <h3>Ongoing Campaigns</h3>
                    <ul v-if="presentCampaigns.length">
                        <li v-for="campaign in presentCampaigns" :key="campaign.id">{{ campaign.name }} (Ongoing)</li>
                    </ul>

                    <h3>Future Campaigns</h3>
                    <ul v-if="futureCampaigns.length">
                        <li v-for="campaign in futureCampaigns" :key="campaign.id">{{ campaign.name }} (Starting Soon)</li>
                    </ul>
                </section> -->

                <div v-if="Object.keys(campaignReach).length > 0" class="right">
                    <canvas id="campaignReachChart"></canvas>
                </div>


            </div>
        </div>
    `
};
