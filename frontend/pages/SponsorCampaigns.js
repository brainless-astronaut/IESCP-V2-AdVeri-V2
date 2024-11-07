export default {
    data() {
        return {
            campaign: [],
            showCreatePopup: false,
            showViewPopup: false,
            showEditPopup: false,
            currentCampaign: {},
            token: localStorage.getItem('accessToken'),
        }
    },
    create() {
        this.fetchCampaigns();
    },
    methods: {
        async fetchCampaigns() {
            try {
                const response = await axios.get('/sponsor-campaigns', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                });

                this.campaigns = reqpose.data.your_campaigns;
            } catch (error) {
                console.error("Error fetching campaigns:", error);
            }
        },

        openCreatePopup() {
            this.showCreatePopup = true;
        },

        openViewPopup() {
            this.currentCamapign = campaign;
            this.showViewPopup = true;
        },

        openEditPopup() {
            this.currentCamapign = campaign;
            this.showEditPopup = true;
        },

        closePopup() {
            this.showCreatePopup = false;
            this.showEditPopup = false;
            this.showViewPopup = false;
        },

        getCampaignById(id) {
            return this.campaigns.find(c => c.id === id);
        },

        async createCampaign(campaignData) {
            try {
                const response = await axios.post('/sponsor-campaigns', campaignData, {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    },
                });

                alert(response.data.message);
                this.fetchCampaigns();
                this.closePopup();
            } catch (error) {
                console.error("Error creating campaign:", error);
            }
        },

        async editCampaign(campaignData) {
            try {
                const response = await axios.put(`/sponsor-campaigns/${this.currentCampaign.id}`, campaignData, {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    },
                });

                alert(response.data.message);
                this.fetchCampaigns();
                this.closePopup();
            } catch (error) {
                console.error("Error editing campaign:", error);
            }
        },
        async deleteCampaign(campaignId) {
            try {
                const response = await axios.delete(`/sponsor-campaigns/${campaignId}`, {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                    },
                });

                alert(response.data.message);
                this.fetchCampaigns();
            } catch (error) {
                console.error("Error deleting campaign:", error);
            }
        }
    },
    template: `
        <div>
            <button @click="openCreatePopup" class="btn btn-primary">Create</button>

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
            <div v-if="showCreatePopup" class="popup">
                <div class="popup-content">
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
            <div v-if="showViewPopup" class="popup">
                <div class="popup-content">
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
            <div v-if="showEditPopup" class="popup">
                <div class="popup-content">
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