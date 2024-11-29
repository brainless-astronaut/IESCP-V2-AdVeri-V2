// frontend/pages/SponsorDashboard.js

export default {
    data() {
        return {
            totalCounts: {},
            // campaignReach: {},
            campaignInfluencerCounts: {},
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

                // alert(userRole)

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

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                // Extracting data from the response
                this.totalCounts = {
                    total_campaigns: data.total_campaigns,
                    past_campaigns_count: data.past_campaigns_count,
                    present_campaigns_count: data.present_campaigns_count,
                    future_campaigns_count: data.future_campaigns,
                    sent_requests_count: data.sent_requests_count,
                    received_requests_count: data.received_requests_count
                };
                // this.campaignReach = data.campaign_reach_dict;
                this.campaignInfluencerCounts = data.campaign_influencer_counts_dict;

            } catch (error) {
                alert("Error fetching dashboard data:", error);
            }
        },
        renderCharts() {
            const countsCtx = document.getElementById('influencersCountChart').getContext('2d');
            new CharacterData(countsCtx, {
                type: 'bar',
                data: {
                    labels: Object.keys(this.campaignInfluencerCounts),
                    datasets: [{
                        label: 'Influencers by Campaign',
                        data: Object.values(this.campaignInfluencerCounts),
                        backgroungColor: 'rgba(255, 191, 0, 1)',
                    }]
                },
                option: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
            // const reachCtx = document.getElementById('campaignReachChart').getContext('2d');
            // new CharacterData(reachCtx, {
            //     type: 'bar',
            //     data: {
            //         labels: Object.keys(this.campaignReach),
            //         datasets: [{
            //             label: 'Reach by Campaign',
            //             data: Object.values(this.campaignReach),
            //             backgroungColor: 'rgba(255, 191, 0, 1)',
            //         }]
            //     },
            //     option: {
            //         scales: {
            //             y: {
            //                 beginAtZero: true
            //             }
            //         }
            //     }
            // })
        },
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

                <!-- Influencer Counts by Campaign 
                <section>
                    <h2>Influencer Counts by Campaign</h2>
                    <div v-if="campaignInfluencerCounts">
                        <ul>
                            <li v-for="(count, campaignName) in campaignInfluencerCounts" :key="campaignName">
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
                <div class="right">
                    <canvas id="influencersCountChart">Influencer Counts per Campaign Chart</canvas>
                    <!-- <canvas id="campaignReachChart">Reach by Campaign Chart</canvas> -->
                </div>
            </div>
        </div>
    `
};
