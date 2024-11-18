export default {
    template: `
    <div class="sponsor-container">
        <header class="navbar">
            <div class="navbar-left">
                <h1>Sponsor | Manage Campaigns</h1>
            </div>
            <nav class="navbar-links">
                <router-link to="/sponsor-dashboard">Dashboard</router-link>
                <router-link to="/sponsor-campaigns">Campaigns</router-link>
                <router-link to="/sponsor-requests">Requests</router-link>
                <router-link to="/logout">Logout</router-link>
            </nav>
            <div class="navbar-right">
                <div class="search-bar-container">
                    <input 
                        type="text" 
                        v-model="searchQuery" 
                        placeholder="Search by name or description" 
                        class="search-bar" 
                    />
                    <button @click="fetchCampaigns" class="search-button" :disabled="loading">Search</button>
                </div>
                <button @click="showCreateCampaignModal" class="create-campaign-button">Create Campaign</button>
            </div>
        </header>


        <table class="campaigns-tables">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Progress</th>
                    <th>Joined Influencers</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="campaign in campaigns" :key="campaign.campaign.id">
                    <td>{{ campaign.campaign.id }}</td>
                    <td>{{ campaign.campaign.name }}</td>
                    <td>{{ campaign.campaign.description }}</td>
                    <td>{{ campaign.progress }}</td>
                    <td> 
                        <div v-for="influencer in campaign.joined_influencers" :key="influencer">
                            {{ influencer}}
                        </div>
                    </td>
                    <td>
                        <button @click="openViewModal(campaign)">View</button>
                        <button @click="openEditModal(campaign)">Edit</button>
                        <button @click="openSendRequestModal(campaign)">Send Request</button>
                        <button @click="deleteCampaign(campaign.campaign.id)">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- View Modal -->
        <div v-if="showViewModal" class="modal">
            <div class="modal-content">
                <h2>Details</h2>
                <p><strong>Name:</strong> {{ selectedCampaign.name }}</p>
                <p><strong>Description:</strong> {{ selectedCampaign.description }}</p>
                <p><strong>Start Date:</strong> {{ selectedCampaign.start_date }}</p>
                <p><strong>End Date:</strong> {{ selectedCampaign.end_date }}</p>
                <p><strong>Budget:</strong> {{ selectedCampaign.budget }}</p>
                <button @click="closeModals">Close</button>
            </div>
        </div>

        <!-- Edit Modal -->
        <div v-if="showEditModal" class="modal">
        <div class="modal-content">
            <h2>Edit Campaign</h2>
            <form @submit.prevent="editCampaign">
            <input type="text" v-model="selectedCampaign.name" readonly />
            <textarea v-model="selectedCampaign.description"></textarea>
            <input type="date" v-model="selectedCampaign.start_date" />
            <input type="date" v-model="selectedCampaign.end_date" />
            <input type="number" v-model="selectedCampaign.budget" />
            <button type="submit">Save Changes</button>
            </form>
            <button @click="closeModals">Close</button>
        </div>
        </div>

        <!-- Send Request Modal -->
        <div v-if="showSendRequestModal" class="modal">
            <div class="modal-content">
                <h2>Send Request to Influencers</h2>
                <from @submit.prevent="sendRequest">
                    <textareav-model="requestForms.requirements" placeholder="Requirements"></textarea>
                    <input type="number" v-model="requestForm.paymentAmount" placeholder="Payment Amount"/>
                    <div>
                        <h3>Influencers</h3>
                        <div v-for="influencer in influencers" :key="influencer.id">
                            <input
                                type="checkbox"
                                :value="influencer.id"
                                v-model="requestForm.selectedInfluencers"
                            />
                            {{ influencer.name }}
                        </div>
                    </div>
                    <button type="submit">Send</button>
                </form>
                <button @click="closeModals">Close</button>
            </div>
        </div>
    </div>                
    `,
    data() {
        return {
            searchQuery: "",
            campaigns: [],
            influencers: [],
            showViewModal: false,
            showEditModal: false,
            showSendRequestModal: false,
            showCreateCampaignModal: false,
            selectedCampaign: {},
            requestForm: {
                requirements: "",
                paymentAmount: 0,
                selectedInfluencers: [],
            },
        };
    },
    methods: {
        getToken() {
            const token = localStorage.getItem('accessToken');
            if (!token) alert("Token is missing in localStorage.");
            return token;
        },
        async fetchCampaigns() {
            this.loading = true;
            try {
                this.getToken();
                const response = await fetch(location.origin + '/sponsor-campaigns', {
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
                this.campaigns = data.campaigns;
            } catch (error) {
                    alert("Error fetching campaigns:", error);
            } finally {
                this.loading = false;
            }
        },

        async fetchFlaggedCampaigns() {
            try {
                this.getToken();
        
                const response = await fetch(`${location.origin}/sponsor-campaigns?flagged=true`, {
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
                this.flaggedCampaigns = data.flagged_campaigns;
            } catch (error) {
                alert("Error fetching flagged campaigns: " + error.message);
            }
        },
        
        async createCampaign(campaignDetails) {
            try {
                this.getToken();
        
                const response = await fetch(`${location.origin}/sponsor-campaigns`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ action: 'create', ...campaignDetails })
                });
        
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
        
                alert("Campaign created successfully!");
                await this.fetchCampaigns(); // Refresh campaigns after creation
            } catch (error) {
                alert("Error creating campaign: " + error.message);
            }
        },
        

       
        async editCampaign() {
            try {
                this.getToken();
                const response = await fetch(location.origin + '/sponsor-campaigns', {
                    method: 'PUT',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify(this.sleectedCampaign),
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                alert("Campaign updated successfully!");
                this.closeModals();
                this.fetchCampaigns(); // Refresh after edit
                
            } catch (error) {
                alert("Error while editing campaign:", error);
            }
        },
        
        async fetchInfluencers() {
            try {
                this.getToken();
                const response = await fetch(location.origin + '/sponsor-campaigns', {
                    method: 'GET',
                    headers: {
                        "Content-Type": 'application/json',
                        "Authorization": `Bearer ${token}`,
                    },
                })
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                this.influencers = data.influencers;
            } catch (error) {
                alert("Error while fetching influencers:", error);
            }
        },
        async sendRequest(campaignId, influencerIds, requirements, messages) {
            try {
                this.getToken();
        
                const response = await fetch(`${location.origin}/sponsor-campaigns`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        action: 'send',
                        campaign_id: campaignId,
                        influencer_ids: influencerIds,
                        requirements,
                        messages
                    })
                });
        
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
        
                alert("Requests sent successfully!");
                await this.fetchCampaigns(); // Refresh campaigns after sending requests
            } catch (error) {
                alert("Error sending request: " + error.message);
            }
        },

        async deleteCampaign(campaignId) {
            try {
                this.getToken();
        
                const response = await fetch(`${location.origin}/sponsor-campaigns`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ campaign_id: campaignId })
                });
        
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
        
                alert("Campaign deleted successfully!");
                await this.fetchCampaigns(); // Refresh campaigns after deletion
            } catch (error) {
                alert("Error deleting campaign: " + error.message);
            }
        },

        async openSendRequestModal(campaign) {
            this.selectedCampaign = campaign.campaign;
            this.fetchInfluencers();
            this.showSendRequestModal = true;
        },
        async showCreateCampaignModal() {
            this.isCreateCampaignModalOpen = true; // Set this variable to control the modal visibility
        },
        async openViewModal(campaign) {
            this.selectedCampaign = campaign.campaign;
            this.showViewModal = true;
        },
        async openEditModal(campaign) {
            this.selectedCampaign = { ...campaign.campaign };
            this.showEditModal = true;
        },
        
        async closeModals() {
            this.showEditModal = false;
            this.showViewModal = false;
            this.showSendRequestModal = false;
            this.showCreateCampaignModal = false;
            this.selectedCampaign = {};
        }
    },
    mounted() {
        this.fetchCampaigns();
    },
};

// Purpose:

// A sponsor's interface for managing campaigns, providing functionality to create, view, edit, delete, and send requests to influencers.
// Features:

// Navbar: Navigation between sponsor-specific pages with logout functionality.
// Search Bar: Filter campaigns by name or description.
// Campaign Management Table: Display of campaign details with associated actions.
// Modals:
// View Campaign: Displays detailed information.
// Edit Campaign: Allows editing selected campaign details.
// Send Request: Allows the sponsor to send requests to influencers.
// Create Campaign (placeholder): Opens a modal for creating new campaigns.
// Key Data Structures:

// campaigns: Array holding campaign details fetched from the backend.
// influencers: List of influencers for request actions.
// selectedCampaign: Object representing the campaign currently being acted upon.
// requestForm: Data structure for sending requests to influencers.
// Backend Communication:

// Uses fetch for REST API calls to endpoints for CRUD operations.
// Requires an access token from localStorage for authenticated requests.
// Lifecycle:

// Fetches campaigns upon component mount to initialize the view.