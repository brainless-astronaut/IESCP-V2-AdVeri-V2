export default {
    template: `
    <div id="app">
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
        
        <div v-if="messages.length" class="modal">
            <div class="modal-content">
                <p v-for="(message, index) in messages" :key="index" :class="message.category">
                    {{ message.text }}
                </p>
                <button class="close-button" @click="closeMessageModal" style="align-items: center">Close</button>
            </div>
        </div>

        <div class="table-container">
            <table class="campaigns-tables" v-if="campaigns && Object.keys(campaigns).length">
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
                    <tr v-for="campaign in campaigns" :key="campaign.campaign.campaign_id">
                        <td>{{ campaign.campaign.campaign_id }}</td>
                        <td>{{ campaign.campaign.name }}</td>
                        <td>{{ campaign.campaign.description }}</td>
                        <td>{{ campaign.progress }}</td>
                        <td>
                            <div v-if="campaign.joined_influencers && Object.keys(campaign.joined_influencers).length">
                                <div v-for="influencer in campaign.joined_influencers" :key="influencer">
                                    {{ influencer}}
                                </div>
                            </div>
                            <div v-else>No influencers joined.</div>
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
            <div v-else class="no-data-message">
                <div v-if="messages.length" class="modal">
                    <div class="modal-content">
                        <p v-for="(message, index) in messages" :key="index" :class="message.category">
                            No campaigns found. Please create a campaign.
                        </p>
                        <button class="close-button" @click="closeMessageModal" style="align-items: center">Close</button>
                    </div>
                </div>
            </div>

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
    </div>                
    `,
    data() {
        return {
            messages: [],
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
                if (!token) {
                    this.$router.push({
                        path: '/login',
                        query: { message: 'Token has expired. Please login again.' }
                    });
                    return;
                }

                const decodedToken = jwt_decode(token);
                const userRole = decodedToken.sub.role;

                // console.log(userRole)

                if (userRole !== 'sponsor') {
                    this.$router.push({
                        path: '/',
                        query: { message: 'You are not authorized to access this page.' }
                    });
                    return;
                }
                const response = await fetch(location.origin + '/sponsor-campaigns', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                // console.log('reponse text: ' + await response.text())
                if (!response.ok) {
                    // throw new Error(`HTTP error! status: ${response.status}`);
                    // console.log('reponse text: ' + await response.text())
                    this.messages.push({
                        text: 'No campaigns found. Please create a campaign.',
                        category: 'error'
                    });

                }
                const data = await response.json();
                this.campaigns = data.campaigns;
            } catch (error) {
                    console.log(`Error fetching campaigns: ${error}`);
            } finally {
                this.loading = false;
            }
        },

        async fetchFlaggedCampaigns() {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) console.log("Token is missing in localStorage.");
                const response = await fetch(`${location.origin}/sponsor-campaigns?flagged=true`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log('reponse text: ' + await response.text())
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                console.log('reponse text: ' + await response.text());
                const data = await response.json();
                this.flaggedCampaigns = data.flagged_campaigns;
            } catch (error) {
                console.log(`Error fetching flagged campaigns: ${error}`);
            }
        },
        
        async createCampaign(campaignDetails) {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) console.log("Token is missing in localStorage.");
                const response = await fetch(`${location.origin}/sponsor-campaigns`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ action: 'create', ...campaignDetails })
                });
                console.log('reponse text: ' + await response.text());
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                console.log("Campaign created successfully!");
                await this.fetchCampaigns(); // Refresh campaigns after creation
            } catch (error) {
                console.log(`Error creating campaign ${error}`);
            } finally {
                this.closeCreateCampaignModal()
            }
        },
       
        async editCampaign(selectedCampaign) {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    console.log("Token is missing in localStorage.");
                    return;
                }

                // Dynamically add campaign_id while sending the request
                const payload = {
                    ...this.selectedCampaign, // Include the rest of the selectedCampaign fields
                    campaign_id: this.selectedCampaign.campaign_id, // Add campaign_id dynamically
                };

                const response = await fetch(`${location.origin}/sponsor-campaigns`, {
                    method: 'PUT',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                });
                const responseText = await response.text(); // For debugging purposes
                console.log(`response text put: ${responseText}`)
                console.log(`selected campaign: ${selectedCampaign}`)
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                console.log("Campaign updated successfully!");
                await this.fetchCampaigns(); // Refresh after edit
            } catch (error) {
                console.log(`Error occurred while editing campaign: ${error}`);
            } finally {
                this.closeEditModal()
            }
        },
        
        async fetchInfluencers() {
            this.loading = true;
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) console.log("Token is missing in localStorage.");
                const response = await fetch(location.origin + '/sponsor-campaigns', {
                    method: 'GET',
                    headers: {
                        "Content-Type": 'application/json',
                        "Authorization": `Bearer ${token}`,
                    },
                })
                // console.log('fetch inf reponse text: ' + await response.text());
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                this.influencers = data.influencers;
            } catch (error) {
                console.log(`Error while fetching influencers: ${error}`);
            } finally {
                this.loading = false;
            }
        },

        async sendRequest(campaignId, influencerIds, requirements, paymentAmount, messages) {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) console.log("Token is missing in localStorage.");
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
                    console.log(`Invalid request parameters.`);
                    console.log(`campaign id: ${campaignId}`);
                    console.log(`influencersIds: ${influencerIds}`);
                    console.log(`requirements: ${requirements}`);
                    console.log(`paymentAmount: ${paymentAmount}`);
                    console.log(`messages: ${messages}`);
                    return;
                }
                console.log('reponse text: ' + await response.text());
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                await this.fetchCampaigns(); // Refresh campaigns after sending requests
            } catch (error) {
                console.log(`Error senfin request: ${error}`);
            } finally {
                this.closeSendRequestModal()
            }
        },

        async deleteCampaign(campaignId) {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) console.log("Token is missing in localStorage.");
                const requestBody = { campaign_id: campaignId };
                console.log(`Request body: ${requestBody}`);  // Log the body to check

                const response = await fetch(`${location.origin}/sponsor-campaigns`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ campaign_id: campaignId })
                });
                console.log('reponse text: ' + await response.text());
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                console.log("Campaign deleted successfully!");
                await this.fetchCampaigns(); // Refresh campaigns after deletion
            } catch (error) {
                console.log(`Error deleting campaign ${error}`);
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
            this.selectedCampaign = { 
                campaign_id: campaign.campaign.campaign_id,  // Ensure campaign_id is included
                name: campaign.campaign.name,
                description: campaign.campaign.description,
                startDate: new Date(campaign.campaign.start_date).toISOString().split('T')[0], // Converts to yyyy-MM-dd
        endDate: new Date(campaign.campaign.end_date).toISOString().split('T')[0], // Converts to yyyy-MM-dd
                budget: campaign.campaign.budget,
                visibility: campaign.campaign.visibility,
                goals: campaign.campaign.goals,
            };
            this.showEditModal = true;
        },

        async closeEditModal() {
            this.showEditModal = false;
            this.selectedCampaign = {};
        },
        async closeMessageModal() {
            this.messages = []; // Clear messages to hide the modal
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