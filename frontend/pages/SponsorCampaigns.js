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
                <router-link to="/sponsor-reports">Reports</router-link>
                <router-link to="/logout">Logout</router-link>
            </nav>
            <div class="navbar-right">
                <div class="search-bar-container">
                    <input type="text" v-model="searchQuery" placeholder="Search by name or description" class="search-bar"/>
                    <button @click="fetchCampaigns" :disabled="loading">Search</button>
                </div>
                <button @click="openCreateCampaignModal">Create Campaign</button>
            </div>
        </header>

        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
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
                        <button @click="deleteCampaign(campaign.campaign.campaign_id)">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <div> <!-- Root Element -->
            <!-- Create Campaign Modal -->
            <div v-if="showCreateCampaignModal" class="modal">
                <div class="modal-content">
                    <h2>Create Campaign</h2>
                    <form @submit.prevent="createCampaign(campaignDetails)">
                        <input type="text" v-model="campaignDetails.name" placeholder="Enter Campaign Name" required />
                        <textarea v-model="campaignDetails.description" placeholder="Campaign Description" required></textarea>
                        <input type="date" v-model="campaignDetails.start_date" placeholder="Start Date" required />
                        <input type="date" v-model="campaignDetails.end_date" placeholder="End Date" required />
                        <input type="number" v-model="campaignDetails.budget" placeholder="Budget" required />
                        <select v-model="campaignDetails.visibility" placeholder="Select Visibility" required>
                            <option value="">Select Visibility</option>
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                        </select>
                        <input type="text" v-model="campaignDetails.goals" placeholder="Enter goals" required />
                        <button type="submit">Create</button>
                    </form>
                    <button @click="closeCreateCampaignModal">Close</button>
                </div>
            </div>
        
            <!-- View Modal -->
            <div v-else-if="showViewModal" class="modal">
                <div class="modal-content">
                    <h2>Details</h2>
                    <p><strong>Name:</strong> {{ selectedCampaign.name }}</p>
                    <p><strong>Description:</strong> {{ selectedCampaign.description }}</p>
                    <p><strong>Start Date:</strong> {{ selectedCampaign.start_date }}</p>
                    <p><strong>End Date:</strong> {{ selectedCampaign.end_date }}</p>
                    <p><strong>Budget:</strong> {{ selectedCampaign.budget }}</p>
                    <p><strong>Visibility:</strong> {{ selectedCampaign.visibility }}</p>
                    <p><strong>Goals:</strong> {{ selectedCampaign.goals }}</p>
                    <button @click="closeViewModal">Close</button>
                </div>
            </div>

            <!-- Edit Modal -->
            <div v-else-if="showEditModal" class="modal">
                <div class="modal-content">
                    <h2>Edit Campaign</h2>
                    <form @submit.prevent="editCampaign">
                    <input type="text" v-model="selectedCampaign.name" readonly />
                    <textarea v-model="selectedCampaign.description" placeholder="Edit campaign description..."></textarea>
                    <input type="date" v-model="selectedCampaign.startDate" />
                    <input type="date" v-model="selectedCampaign.endDate" />
                    <input type="number" v-model="selectedCampaign.budget" />
                    <select v-model="selectedCampaign.visibility">
                        <option value="">Select Visibility</option>
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                    </select>
                    <input type="text" v-model="selectedCampaign.goals" />
                    <button type="submit">Save Changes</button>
                    </form>
                    <button @click="closeEditModal">Close</button>
                </div>
            </div>

            <!-- Send Request Modal -->
            <div v-else-if="showSendRequestModal" class="modal">
                <div class="modal-content">
                    <h2>Send Request to Influencers</h2>
                    <form @submit.prevent="sendRequest(selectedCampaign.campaignId, requestForm.selectedInfluencers, requestForm.requirements, requestForm.paymentAmount, requestForm.messages)">
                        <textarea v-model="requestForm.messages" placeholder="Messages"></textarea>
                        <textarea v-model="requestForm.requirements" placeholder="Requirements"></textarea>
                        <input type="number" v-model="requestForm.paymentAmount" placeholder="Payment Amount" />
                        <div>
                            <h3>Influencers</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Select</th>
                                        <th>Name</th>
                                        <th>Platform</th>
                                        <th>Reach</th>
                                    </tr>
                                </thead>
                                </tbody>
                                    <tr v-for="influencer in influencers" :key="influencer.user_id">
                                        <td><input type="checkbox" :value="influencer.user_id" v-model="requestForm.selectedInfluencers" /></td>
                                        <td>{{ influencer.name }}</td>
                                        <td>{{ influencer.platform }}</td>
                                        <td>{{ influencer.reach }}</td>
                                    </tr>
                                </tbody>
                            </table>
                                        
                        </div>
                        <button type="submit">Send</button>
                    </form>
                    <button @click="closeSendRequestModal">Close</button>
                </div>
            </div>
        </div> <!-- End of Root Element -->
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
            selectedCampaign: {
                // can't send campaign id to front
                //set campaign id
                campaignId: '',
                description: '',
                startDate: '',
                endDate: '',
                budget: '',
                visibility: '',
                goals: '',
            },
            requestForm: {
                requirements: '',
                messages: '',
                paymentAmount: 0,
                selectedInfluencers: [],
            },
            campaignDetails: {
                name: '',
                description: '',
                startDate: '',
                endDate: '',
                budget: '',
                visibility: '',
                goals: '',
            },
            loading: false,
        };
    
    },
    methods: {
        async fetchCampaigns() {
            this.loading = true;
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) alert("Token is missing in localStorage.");
                const response = await fetch(location.origin + '/sponsor-campaigns', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                // alert('reponse text: ' + await response.text())
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                this.campaigns = data.campaigns;
            } catch (error) {
                    alert(`Error fetching campaigns: ${error}`);
            } finally {
                this.loading = false;
            }
        },

        async fetchFlaggedCampaigns() {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) alert("Token is missing in localStorage.");
                const response = await fetch(`${location.origin}/sponsor-campaigns?flagged=true`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                alert('reponse text: ' + await response.text())
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                alert('reponse text: ' + await response.text());
                const data = await response.json();
                this.flaggedCampaigns = data.flagged_campaigns;
            } catch (error) {
                alert(`Error fetching flagged campaigns: ${error}`);
            }
        },
        
        async createCampaign(campaignDetails) {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) alert("Token is missing in localStorage.");
                const response = await fetch(`${location.origin}/sponsor-campaigns`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ action: 'create', ...campaignDetails })
                });
                alert('reponse text: ' + await response.text());
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                alert("Campaign created successfully!");
                await this.fetchCampaigns(); // Refresh campaigns after creation
            } catch (error) {
                alert(`Error creating campaign ${error}`);
            }
        },
       
        async editCampaign(selectedCampaign) {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    alert("Token is missing in localStorage.");
                    return;
                }
                const response = await fetch(`${location.origin}/sponsor-campaigns`, {
                    method: 'PUT',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify({...selectedCampaign}),
                });
                const responseText = await response.text(); // For debugging purposes
                alert(`response text put: ${responseText}`)
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                alert("Campaign updated successfully!");
                await this.fetchCampaigns(); // Refresh after edit
            } catch (error) {
                alert(`Error occurred while editing campaign: ${error}`);
            }
        },
        
        async fetchInfluencers() {
            this.loading = true;
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) alert("Token is missing in localStorage.");
                const response = await fetch(location.origin + '/sponsor-campaigns', {
                    method: 'GET',
                    headers: {
                        "Content-Type": 'application/json',
                        "Authorization": `Bearer ${token}`,
                    },
                })
                // alert('fetch inf reponse text: ' + await response.text());
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                this.influencers = data.influencers;
            } catch (error) {
                alert(`Error while fetching influencers: ${error}`);
            } finally {
                this.loading = false;
            }
        },

        async sendRequest(campaignId, influencerIds, requirements, paymentAmount, messages) {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) alert("Token is missing in localStorage.");
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
                        payment_amount: paymentAmount,
                        requirements: requirements,
                        messages: messages
                    })
                });
                if (!campaignId || !influencerIds || !requirements || !paymentAmount || !messages) {
                    alert(`Invalid request parameters.`);
                    alert(`campaign id: ${campaignId}`);
                    alert(`influencersIds: ${influencerIds}`);
                    alert(`requirements: ${requirements}`);
                    alert(`paymentAmount: ${paymentAmount}`);
                    alert(`messages: ${messages}`);
                    return;
                }
                alert('reponse text: ' + await response.text());
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                await this.fetchCampaigns(); // Refresh campaigns after sending requests
            } catch (error) {
                alert(`Error senfin request: ${error}`);
            }
        },

        async deleteCampaign(campaignId) {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) alert("Token is missing in localStorage.");
                const requestBody = { campaign_id: campaignId };
                alert(`Request body: ${requestBody}`);  // Log the body to check

                const response = await fetch(`${location.origin}/sponsor-campaigns`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ campaign_id: campaignId })
                });
                alert('reponse text: ' + await response.text());
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                alert("Campaign deleted successfully!");
                await this.fetchCampaigns(); // Refresh campaigns after deletion
            } catch (error) {
                alert(`Error deleting campaign ${error}`);
            }
        },
        
        async openSendRequestModal(campaign) {
            console.log('Raw campaign object:', campaign);
            console.log('Campaign keys:', Object.keys(campaign));
            this.selectedCampaign = { 
                ...campaign,
                campaignId: campaign.campaign.campaign_id, // Adjust as needed
            };
            console.log('Selected campaign:', this.selectedCampaign);
            this.fetchInfluencers();
            this.requestForm.selectedInfluencers = [];
            this.showSendRequestModal = true;
        },

        async closeSendRequestModal() {
            this.showSendRequestModal = false;
            this.selectedCampaign = {};
        },

        async openCreateCampaignModal() {
            this.showCreateCampaignModal = true;  // Open modal
        },
    
        async closeCreateCampaignModal() {
            this.showCreateCampaignModal = false;  // Close modal
            this.campaignDetails = {};  // Reset campaign details
        },

        async openViewModal(campaign) {
            this.selectedCampaign = campaign.campaign;
            this.showViewModal = true;
        },

        async closeViewModal() {
            this.showViewModal = false;
            this.selectedCampaign = {};
        },

        async openEditModal(campaign) {
            this.selectedCampaign = { ...campaign.campaign };
            this.showEditModal = true;
        },

        async closeEditModal() {
            this.showEditModal = false;
            this.selectedCampaign = {};
        },
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