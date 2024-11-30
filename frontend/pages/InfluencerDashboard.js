// frontend/pages/InfluencerDashboard.js

export default {
    template: `
        <div id="app">
            <header class="navbar">
                <div class="navber-left">
                    <h2>Influencer | Dashboard</h2>
                </div>
                <div class="navbar-links">
                    <router-link to="/influencer-dashboard">Dashboard</router-link>
                    <router-link to="/influencer-send-requests">Send Requests</router-link>
                    <router-link to="/influencer-manage-requests">Manage Requests</router-link>
                    <router-link to="/logout">Logout</router-link>
                </div>
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
                    <!-- Cards Section -->
                    <div class="card-container">
                        <div class="card" v-for="(card, key) in cards" :key="key">
                            <h3>{{ card.title }}</h3>
                            <p>{{ card.value }}</p>
                        </div>
                    </div>
                </div>

                <!-- Charts Section -->
                <div class="dashboard-charts">
                    <div class="chart-container">
                        <h3>Earnings by Campaign</h3>
                        <canvas id="earningsByCampaignChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <h3>Earnings by Industry</h3>
                        <canvas id="earningsByIndustryChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            messages: [],           
            cards: {
                requests_count: { title: "Total Requests", value: 0 },
                pending_requests_count: { title: "Pending Requests", value: 0 },
                negotiation_requests_count: { title: "Negotiation Requests", value: 0 },
                joined_campaigns_count: { title: "Joined Campaigns", value: 0 },
                earnings: { title: "Total Earnings", value: 0 },
            },
            earnings_by_campaign: [],
            earnings_by_industry: [],
        };
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

                // alert(userRole)

                if (userRole !== 'influencer') {
                    this.$router.push({
                        path: '/',
                        query: { message: 'You are not authorized to access this page.' }
                    });
                    return;
                }

                const response = await fetch(location.origin + '/influencer-dashboard', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    }
                })
                const text = await response.text();
                console.log(text);

                if (response.ok) {
                    const data = await response.json();
                    this.cards.requests_count.value = data.total_requests;
                    this.cards.pending_requests_count.value = data.pending_requests_count;
                    this.cards.negotiation_requests_count.value = data.negotiation_requests_count;
                    this.cards.joined_campaigns_count.value = data.joined_campaigns_count;
                    this.cards.earnings.value = data.earnings;
                    this.earnings_by_campaign = data.earnings_by_campaign;
                    this.earnings_by_industry = data.earnings_by_industry;
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data." + error);
            }
        },

        async renderEarningsByCampaignChart() {
            const labels= this.earnings_by_campaign.map((item) => item[1]) // Campaign names
            const data = this.earnings_by_campaign.map((item) => item[0]) // Earnings

            new Chart(document.getElementById('earningsByCampaignChart'), {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Earnings by Campaign',
                        data,
                        backgroundColor: 'rgba(255, 191, 0, 1)',
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {display: true },
                        tooltip: { enabled: true},
                    },
                    scales: {
                        x: { title: { display: true, text: "Campaigns" } },
                        y: { title: { display: true, text: "Earnings (₹)" } },
                      },
                },
            });
        },

        async renderEarningsByIndustryChart() {
            const labels = this.earnings_by_industry.map((itme) => item[0]); // Indistries
            const data = this.earnings_by_industry.map((item) => item.total_payment); // Earnings

            new Chart(document.getElementById('earningsByIndustryChart'), {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Earnings by Industry',
                        data,
                        backgroundColor: 'rgba(0, 171, 213, 1)',
                    }],
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: true },
                        tooltip: { enabled: true},
                    },
                    scales: {
                        x: { title: { display: true, text: "Industries" } },
                        y: { title: { display: true, text: "Earnings (₹)" } },
                    },
                },
            })
        },
        async closeMessageModal() {
            this.messages = []; // Clear messages to hide the modal
        },
    },
    mounted() {
        this.fetchDashboardData();
        this.renderEarningsByCampaignChart();
        this.renderEarningsByIndustryChart();
    },
};


// Tables for Data Display:

// There are two tables: one for sent_requests and another for received_requests. Each displays the request details like Request ID, Campaign ID, Sponsor ID, Requirements, Payment Amount, and Messages.
// Data Fetching:

// The fetchDashboardData method uses Axios to make an API request to /influencer-dashboard and populate sentRequests, receivedRequests, and totalRequests in the component’s data.
// Authorization Header:

// An authorization header is included with the JWT token to authenticate the request.
// Total Requests:

// This displays the total number of requests on the top of the dashboard.