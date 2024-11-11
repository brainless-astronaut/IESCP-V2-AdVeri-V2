// frontend/pages/InfluencerDashboard.js

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
                const response = await fetch(location.origin + '/admin-dashboard', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!token) {
                    console.error("Token is missing in localStorage.");
                    return;
                }
                console.log('Token:', token);
             

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
            }
        },
        renderCharts() {
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
};


// Tables for Data Display:

// There are two tables: one for sent_requests and another for received_requests. Each displays the request details like Request ID, Campaign ID, Sponsor ID, Requirements, Payment Amount, and Messages.
// Data Fetching:

// The fetchDashboardData method uses Axios to make an API request to /influencer-dashboard and populate sentRequests, receivedRequests, and totalRequests in the component’s data.
// Authorization Header:

// An authorization header is included with the JWT token to authenticate the request.
// Total Requests:

// This displays the total number of requests on the top of the dashboard.