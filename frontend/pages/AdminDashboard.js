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
            sponsorDistribution: {},
            campaignDistribution: {},
            token: 'jwt_token' // replace this one
        };
    },

    created() {
        this.fetchDashboardData();
    },
    methods: {
        async fetchDashboardData() {
            try {
                const response = await axios.get('/admin-dashboard', {
                    headers: {
                        Authorization: `Bearer ${this.token}`
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
                this.sponsorDistribution = data.sponsors_distribution;
                this.campaignDistribution = data.campaigns_distribution;

                this.renderCharts();
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            };
        },
        renderCharts() {
            // SPonsor Distribution Chart
            const sponsorCtx = document.getElementById('sponsorChart').getContext('2d');
        new Chart(sponsorCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(this.sponsorsDistribution),
                datasets: [{
                    label: 'Sponsors by Industry',
                    data: Object.values(this.sponsorDistribution),
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