// frontend/pages/SponsorDashboard.js

export default {
    data() {
        return {
            totalCounts: {},
            campaignReach: {},
            campaignInfluencerCounts: {},
            pastCampaigns: [],
            presentCampaigns: [],
            futureCampaigns: [],
            sentRequests: [],
            receivedRequests: []
        };
    },
    created() {
        this.fetchSponsorDashboardData();
    },
    methods: {
        async fetchSponsorDashboardData() {
            try {
                const token = localStorage.getItem('accessToken'); // Assuming JWT is stored here
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
                    total_past_campaigns: data.total_past_campaigns,
                    total_present_campaigns: data.total_present_campaigns,
                    total_future_campaigns: data.future_campaigns.length,
                    total_sent_requests: data.total_sent_requests,
                    total_received_requests: data.total_received_requests
                };
                this.campaignReach = data.campaign_reach_dict;
                this.campaignInfluencerCounts = data.campaign_influencer_counts_dict;
                this.pastCampaigns = data.past_campaigns;
                this.presentCampaigns = data.present_campaigns;
                this.futureCampaigns = data.future_campaigns;
                this.sentRequests = data.sent_requests;
                this.receivedRequests = data.received_requests;

            } catch (error) {
                if (error.message.includes("422")) {
                    console.error("Error fetching dashboard data (422):", error); // Examine the error details
                    // Display a user-friendly error message to the user
                } else {
                    console.error("Error fetching dashboard data:", error);
                }
            }
        }
    },
    template: `
        <div class="sponsor-dashboard">
            <h1>Sponsor Dashboard</h1>

            <!-- Campaign Counts -->
            <section>
                <h2>Campaign Counts</h2>
                <p>Total Campaigns: {{ totalCounts.total_campaigns }}</p>
                <p>Past Campaigns: {{ totalCounts.total_past_campaigns }}</p>
                <p>Ongoing Campaigns: {{ totalCounts.total_present_campaigns }}</p>
                <p>Future Campaigns: {{ totalCounts.total_future_campaigns }}</p>
            </section>

            <!-- Request Counts -->
            <section>
                <h2>Request Counts</h2>
                <p>Sent Requests: {{ totalCounts.total_sent_requests }}</p>
                <p>Received Requests: {{ totalCounts.total_received_requests }}</p>
            </section>

            <!-- Campaign Reach -->
            <section>
                <h2>Campaign Reach</h2>
                <div v-if="campaignReach">
                    <ul>
                        <li v-for="(reach, campaignName) in campaignReach" :key="campaignName">
                            <strong>{{ campaignName }}:</strong> {{ reach }} reach
                        </li>
                    </ul>
                </div>
            </section>

            <!-- Influencer Counts by Campaign -->
            <section>
                <h2>Influencer Counts by Campaign</h2>
                <div v-if="campaignInfluencerCounts">
                    <ul>
                        <li v-for="(count, campaignName) in campaignInfluencerCounts" :key="campaignName">
                            <strong>{{ campaignName }}:</strong> {{ count }} influencers
                        </li>
                    </ul>
                </div>
            </section>

            <!-- Campaign Listings -->
            <section>
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
            </section>
        </div>
    `
};
