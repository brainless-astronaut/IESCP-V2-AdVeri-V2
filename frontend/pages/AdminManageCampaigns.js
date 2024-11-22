export default {
    template: `
    <div class="container">
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

        <!-- Table for Unflagged/Active Campaigns -->
        <section>
            <h2>Campaigns</h2>
            <table>
                <thead>
                    <tr>
                        <th>Campaign ID</th>
                        <th>Sponsor</th>
                        <th>Campaign Name</th>
                        <th>Description</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="campaign in campaigns" :key="campaign.id">
                        <td>{{ campaign.id }}</td>
                        <td>{{ campaign.sponsor_name }}</td>
                        <td>{{ campaign.name }}</td>
                        <td>{{ campaign.description }}</td>
                        <td>{{ campaign.start_date }}</td>
                        <td>{{ campaign.end_date }}</td>
                        <td> 
                            <button @click="flagCampaign(campaign)">Flag</button>
                            <details>
                                <summary class="btn btn-view">View</summary>
                                <p><strong>Campaign Name:</strong> {{ campaign.name }}</p>
                                <p><strong>Campaign Name:</strong> {{ campaign.budget }}</p>
                                <p><strong>Campaign Name:</strong> {{ campaign.visibility }}</p>
                                <p><strong>Campaign Name:</strong> {{ campaign.goals }}</p>
                            </details>                        
                        </td>
                    </tr>
                </tbody>
            </table>
        </section>


        <!-- Table for flagged Campaigns -->
        <section>
            <h2>Flagged Campaigns</h2>
            <table>
                <thead>
                    <tr>
                        <th>Campaign ID</th>
                        <th>Sponsor</th>
                        <th>Campaign Name</th>
                        <th>Description</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="campaign in flaggedCampaigns" :key="campaign.id">
                        <td>{{ campaign.id }}</td>
                        <td>{{ campaign.sponsor_name }}</td>
                        <td>{{ campaign.name }}</td>
                        <td>{{ campaign.description }}</td>
                        <td>{{ campaign.start_date }}</td>
                        <td>{{ campaign.end_date }}</td>
                        <td> 
                            <button @click="unflagCampaign(campaign)">Unflag</button>
                            <details>
                                <summary class="btn btn-view">View</summary>
                                <p><strong>Campaign Name:</strong> {{ campaign.name }}</p>
                                <p><strong>Campaign Name:</strong> {{ campaign.budget }}</p>
                                <p><strong>Campaign Name:</strong> {{ campaign.visibility }}</p>
                                <p><strong>Campaign Name:</strong> {{ campaign.goals }}</p>
                            </details>                        
                        </td>
                    </tr>
                </tbody>
            </table>
        </section>
    </div>
    `,
    data() {
        return {
            campaigns: [],
            flaggedCampaigns: [],
        };
    },
    methods: {
        async fetchCampaigns() {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    console.error("Token is missing in localStorage.");
                    return;
                }
                const response = await fetch('/admin-campaigns', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });
                alert('response text get: ' + await response.text())
                const data = await response.json();
                this.campaigns = data.campaigns;
                this.flaggedCampaigns = data.flagged_campaigns;
            } catch (error) {
                console.error("Error fetching campaigns:", error);
            }
        },
        async flagCampaign(campaign) {
            try {
                const campaignId = campaign.campaign_id;
                if (!campaignId) {
                    console.error("Campaign ID is missing:", campaign);
                    return;
                }
                await this.performAction(campaignId, 'flag')
            } catch (error) {
                console.error("Error flagging campaign:", error);
            }
        },
        async unflagCampaign(campaign) {
            try { 
                const campaignId = campaign.campaign_id;
                if (!campaignId) {
                    console.error("Campaign ID is missing:", campaign);
                    return;
                }
                await this.performAction(campaign.id, 'unflag');
            } catch (error) {
                console.error("Error unflagging campaign:", error);
            }
        },
        async performAction(campaignId, action) {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    console.error("Token is missing in localStorage.");
                    return;
                }
                const response = await fetch('/admin-campaigns', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ campaign_id: campaignId, action })
                });
                const responseText = await response.text();
                alert('response text post: ' + responseText)
                if (!response.ok) {
                    throw new Error(`Error (${response.status}): ${responseText}`);
                }
                this.fetchCampaigns();
            } catch (error) {
                console.error(`Error performing action (${action}):`, error);
            }
        }
    },
    mounted() {
        this.fetchCampaigns();
    }
};

