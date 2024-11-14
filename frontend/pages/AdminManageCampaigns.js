export default {
    template: `
    <div>
        <header>
            <h2>Manage Campaigns</h2>
            <router-link to="/admin-dashboard">Dashboard</router-link>
            <router-link to="/admin-users">Users</router-link>
            <router-link to="/admin-campaigns">Campaigns</router-link>
            <router-link to="/admin-reports">Reports</router-link>
            <router-link to="/logout">Logout</router-link>
        </header>

        <!-- Table for Active Campaigns -->
        <h2>Campaigns</h2>
        <table>
        <thead>
            <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="campaign in campaigns" :key="campaign.id">
            <td>{{ campaign.id }}</td>
            <td>{{ campaign.name }}</td>
            <td>{{ campaign.description }}</td>
            <td>
                <button @click="viewCampaign(campaign)">View</button>
                <button @click="flagCampaign(campaign)">Flag</button>
            </td>
            </tr>
        </tbody>
        </table>

        <!-- Table for Flagged Campaigns -->
        <h2>Flagged Campaigns</h2>
        <table>
        <thead>
            <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="flaggedCampaign in flaggedCampaigns" :key="flaggedCampaign.id">
            <td>{{ flaggedCampaign.id }}</td>
            <td>{{ flaggedCampaign.name }}</td>
            <td>{{ flaggedCampaign.description }}</td>
            <td>
                <button @click="unflagCampaign(flaggedCampaign)">Unflag</button>
            </td>
            </tr>
        </tbody>
        </table>

        <!-- Modal Popup for Viewing Campaign Details -->
        <div v-if="selectedCampaign">
        <h3>Campaign Details</h3>
        <p><strong>ID:</strong> {{ selectedCampaign.id }}</p>
        <p><strong>Name:</strong> {{ selectedCampaign.name }}</p>
        <p><strong>Description:</strong> {{ selectedCampaign.description }}</p>
        <button @click="closeModal">Close</button>
        </div>
    </div>
    `,
    data() {
        return {
            campaigns: [],
            flaggedCampaigns: [],
            selectedCampaign: null
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
                        'Authorization': `Bearer ${this.token}`
                    },
                });
                const data = await response.json();
                this.campaigns = data.campaigns;
                this.flaggedCampaigns = data.flagged_campaigns;
            } catch (error) {
                console.error("Error fetching campaigns:", error);
            }
        },
        viewCampaign(campaign) {
            this.selectedCampaign = campaign;
        },
        closeModal() {
            this.selectedCampaign = null;
        },
        async flagCampaign(campaign) {
            await this.performAction(campaign.id, 'flag');
        },
        async unflagCampaign(campaign) {
            await this.performAction(campaign.id, 'unflag');
        },
        async performAction(campaignId, action) {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    console.error("Token is missing in localStorage.");
                    return;
                }
                await fetch('/admin-campaigns', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ campaign_id: campaignId, action })
                });
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

