// frontend/pages/SponsorCampaigns.js

export default {
    data() {
        return {
            campaigns: [],
            showCreatePopup: false,
            showViewPopup: false,
            showEditPopup: false,
            currentCampaign: {},
            token: localStorage.getItem('accessToken'),
        }
    },
    created() {
        this.fetchCampaigns();
        const campaignId = this.$route.params.id;
        if (campaignId) {
            this.loadCampaignById(campaignId);  // Fetch specific campaign
        } else {
            this.loadAllCampaigns();  // Fetch all campaigns
        }
    },
    methods: {
        async fetchCampaigns() {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    console.error("Token is missing in localStorage.");
                    return;
                }
                const response = await fetch(location.origin + '/sponsor-campaigns', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    this.campaigns = data.your_campaigns;
                } else {
                    console.error("Failed to fetch campaigns:", response.status, response.statusText);
                }
            } catch (error) {
                console.error("Error fetching campaigns:", error);
            }
        },

        openCreatePopup() {
            this.showCreatePopup = true;
        },

        openViewPopup(campaign) {
            this.currentCampaign = campaign;
            this.showViewPopup = true;
        },

        openEditPopup(campaign) {
            this.currentCampaign = campaign;
            this.showEditPopup = true;
        },

        closePopup() {
            this.showCreatePopup = false;
            this.showEditPopup = false;
            this.showViewPopup = false;
        },

        async createCampaign(campaignData) {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    console.error("Token is missing in localStorage.");
                    return;
                }
                userId = jwt_decode('accessToken').sub.id
                const response = await fetch(location.origin + '/sponsor-campaigns-post/${userID}', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(campaignData)
                });

                if (response.ok) {
                    const data = await response.json();
                    alert(data.message);
                    this.fetchCampaigns();
                    this.closePopup();
                } else {
                    console.error("Failed to create campaign:", response.status, response.statusText);
                }
            } catch (error) {
                console.error("Error creating campaign:", error);
            }
        },

        async editCampaign(campaignData) {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    console.error("Token is missing in localStorage.");
                    return;
                }
                const response = await fetch(location.origin + `/sponsor-campaigns/${this.currentCampaign.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(campaignData)
                });

                if (response.ok) {
                    const data = await response.json();
                    alert(data.message);
                    this.fetchCampaigns();
                    this.closePopup();
                } else {
                    console.error("Failed to edit campaign:", response.status, response.statusText);
                }
            } catch (error) {
                console.error("Error editing campaign:", error);
            }
        },

        async deleteCampaign(campaignId) {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    console.error("Token is missing in localStorage.");
                    return;
                }
                const response = await fetch(location.origin + `/sponsor-campaigns-delete/${campaignId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    alert(data.message);
                    this.fetchCampaigns();
                } else {
                    console.error("Failed to delete campaign:", response.status, response.statusText);
                }
            } catch (error) {
                console.error("Error deleting campaign:", error);
            }
        }
    },
    template: `
        <div>
            <header>
                <h2>Sponsor Campaigns</h2>
                <router-link to="/sponsor-dashboard">Dashboard</router-link>
                <router-link to="/sponsor-campaigns">Campaigns</router-link>
                <router-link to="/sponsor-requests">Requests</router-link>
                <router-link to="/logout">Logout</router-link>
            </header>
            <button @click="openCreatePopup">Create</button>

            <!-- Campaign Table -->
            <table>
                <thead>
                    <tr>
                        <th>Campaign ID</th>
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
                            <button @click="openViewPopup(campaign)">View</button>
                            <button @click="openEditPopup(campaign)">Edit</button>
                            <button @click="deleteCampaign(campaign.id)">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Create Campaign Popup -->
            <div v-if="showCreatePopup">
                <div>
                    <h2>Create Campaign</h2>
                    <form @submit.prevent="createCampaign(currentCampaign)">
                        <input v-model="currentCampaign.name" placeholder="Campaign Name" required>
                        <textarea v-model="currentCampaign.description" placeholder="Campaign Description" required></textarea>
                        <input v-model="currentCampaign.start_date" type="date" required>
                        <input v-model="currentCampaign.end_date" type="date" required>
                        <input v-model="currentCampaign.budget" type="number" placeholder="Budget" required>
                        <select v-model="currentCampaign.visibility">
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                        </select>
                        <textarea v-model="currentCampaign.goals" placeholder="Campaign Goals"></textarea>
                        <button type="submit">Create</button>
                        <button @click="closePopup">Cancel</button>
                    </form>
                </div>
            </div>

            <!-- View Campaign Popup -->
            <div v-if="showViewPopup">
                <div>
                    <h2>View Campaign</h2>
                    <p><strong>ID:</strong> {{ currentCampaign.id }}</p>
                    <p><strong>Name:</strong> {{ currentCampaign.name }}</p>
                    <p><strong>Description:</strong> {{ currentCampaign.description }}</p>
                    <p><strong>Start Date:</strong> {{ currentCampaign.start_date }}</p>
                    <p><strong>End Date:</strong> {{ currentCampaign.end_date }}</p>
                    <p><strong>Budget:</strong> {{ currentCampaign.budget }}</p>
                    <p><strong>Visibility:</strong> {{ currentCampaign.visibility }}</p>
                    <p><strong>Goals:</strong> {{ currentCampaign.goals }}</p>
                    <button @click="closePopup">Close</button>
                </div>
            </div>

            <!-- Edit Campaign Popup -->
            <div v-if="showEditPopup">
                <div>
                    <h2>Edit Campaign</h2>
                    <form @submit.prevent="editCampaign(currentCampaign)">
                        <input v-model="currentCampaign.name" placeholder="Campaign Name" required>
                        <textarea v-model="currentCampaign.description" placeholder="Campaign Description" required></textarea>
                        <input v-model="currentCampaign.start_date" type="date" required>
                        <input v-model="currentCampaign.end_date" type="date" required>
                        <input v-model="currentCampaign.budget" type="number" placeholder="Budget" required>
                        <select v-model="currentCampaign.visibility">
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                        </select>
                        <textarea v-model="currentCampaign.goals" placeholder="Campaign Goals"></textarea>
                        <button type="submit">Save Changes</button>
                        <button @click="closePopup">Cancel</button>
                    </form>
                </div>
            </div>
        </div>
    `
};


// Data Handling:

// campaigns: Stores all the campaigns fetched from the backend.
// showCreatePopup, showViewPopup, showEditPopup: Booleans that control whether the respective popups are visible or not.
// currentCampaign: Stores the currently selected campaign’s data, used for viewing/editing.
// Methods:

// fetchCampaigns(): Fetches the campaign data from the backend.
// openCreatePopup(), openViewPopup(), openEditPopup(): Open the respective popups.
// closePopup(): Closes any open popups.
// createCampaign(), editCampaign(), deleteCampaign(): Handle the respective CRUD operations with the backend.
// Popups:

// The Create, View, and Edit Campaign popups are shown when the user clicks the respective buttons. Each popup contains a form to submit the campaign data.
// Button Actions:

// Create: Opens the "Create Campaign" popup.
// View: Opens the "View Campaign" popup, displaying the selected campaign's details.
// Edit: Opens the "Edit Campaign" popup, allowing modifications to the selected campaign.
// Delete: Deletes the campaign after a confirmation.