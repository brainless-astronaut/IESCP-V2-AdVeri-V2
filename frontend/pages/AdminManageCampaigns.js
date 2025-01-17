export default {
    template: `
    <div>
        <header class="navbar">
            <div class="navbar-left">
                <h1>Admin | Manage Campaigns</h1>
            </div>
            <nav class="navbar-links">
                <router-link to="/admin-dashboard">Dashboard</router-link>
                <router-link to="/admin-users">Users</router-link>
                <router-link to="/admin-campaigns">Campaigns</router-link>
                <router-link to="/admin-approve-sponsor">Sponsor Applications</router-link>
                <router-link to="/logout">Logout</router-link>
            </nav>
        </header>
        <div class="table-container">
            <div v-if="messages.length" class="modal">
                <div class="modal-content">
                    <p v-for="(message, index) in messages" :key="index" :class="message.category">
                        {{ message.text }} 
                    </p>
                    <button class="close-button" @click="closeMessageModal" style="align-items: center">Close</button>
                </div>
            </div>

            <!-- Table for Unflagged/Active Campaigns -->
            <section>
                <h2>Campaigns</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Campaign ID</th>
                            <th>Campaign Name</th>
                            <th>Description</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="campaign in campaigns" :key="campaign.campaign_id">
                            <td>{{ campaign.campaign_id }}</td>
                            <td>{{ campaign.name }}</td>
                            <td>{{ campaign.description }}</td>
                            <td>{{ campaign.start_date }}</td>
                            <td>{{ campaign.end_date }}</td>
                            <td> 
                                <button class="button" @click="flagCampaign(campaign)">Flag</button>
                                <details>
                                    <summary class="button">View</summary>
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
                            <th>Campaign Name</th>
                            <th>Description</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="campaign in flaggedCampaigns" :key="campaign.campaign_id">
                            <td>{{ campaign.campaign_id }}</td>
                            <td>{{ campaign.name }}</td>
                            <td>{{ campaign.description }}</td>
                            <td>{{ campaign.start_date }}</td>
                            <td>{{ campaign.end_date }}</td>
                            <td> 
                                <button class="button" @click="unflagCampaign(campaign)">Unflag</button>
                                <details>
                                    <summary class="button">View</summary>
                                    <p><strong>Campaign Name:</strong> {{ campaign.name }}</p>
                                    <p><strong>Budget:</strong> {{ campaign.budget }}</p>
                                    <p><strong>Visibility:</strong> {{ campaign.visibility }}</p>
                                    <p><strong>Goals:</strong> {{ campaign.goals }}</p>
                                </details>                        
                            </td>
                        </tr>
                    </tbody>
                </table>
            </section>
        </div>
    </div>
    `,
    data() {
        return {
            campaigns: [],
            flaggedCampaigns: [],
            messages: [],
        };
    },
    methods: {
        async fetchCampaigns() {
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
                const response = await fetch('/admin-campaigns', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });
                // alert('response text get: ' + await response.text())
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
                await this.performAction(campaignId, 'unflag');
            } catch (error) {
                console.error("Error unflagging campaign:", error);
            }
        },
        async performAction(campaignId, action) {
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

                // alert('passed token check');

                const response = await fetch('/admin-campaigns', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ campaign_id: campaignId, action })
                });

                const responseText = await response.text();
                // console.log("Response from action:", responseText);
                
                if (!response.ok) {
                    // const responseText = await response.text(); // Define responseText
                    // console.log(responseText);
                    throw new Error(`Error (${response.status}): ${responseText}`);
                }
                
                this.fetchCampaigns();
                
            } catch (error) {
                console.error(`Error performing action (${action}):`, error);

                this.messages.push({
                    text: `Error ${action === 'flag' ? 'flagging' : 'unflagging'} campaign: ${error}`,
                    category: 'error',
                });
            }
        },
        async closeMessageModal() {
            this.messages = []; // Clear messages to hide the modal
        },
    },
    mounted() {
        this.fetchCampaigns();
    }
};

