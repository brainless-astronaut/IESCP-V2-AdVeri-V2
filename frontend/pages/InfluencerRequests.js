// frontend/pages/InfluencerRequests.js

export default {
    template: `
        <div>
            <h1>Available Campaigns</h1>
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
                            <button @click="viewCampaign(campaign)">View</button>
                            <button @click="openRequestForm(campaign)">Make Request</button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- View Campaign Popup -->
            <div v-if="selectedCampaign" class="popup">
                <h2>Campaign Details</h2>
                <p><strong>ID:</strong> {{ selectedCampaign.id }}</p>
                <p><strong>Name:</strong> {{ selectedCampaign.name }}</p>
                <p><strong>Description:</strong> {{ selectedCampaign.description }}</p>
                <button @click="closePopup">Close</button>
            </div>

            <!-- Make Request Popup -->
            <div v-if="showRequestForm" class="popup">
                <h2>Make Request for {{ selectedCampaign.name }}</h2>
                <form @submit.prevent="submitRequest">
                    <label>
                        Requirements:
                        <input v-model="requestForm.requirements" required />
                    </label>
                    <label>
                        Payment Amount:
                        <input v-model="requestForm.payment_amount" type="number" required />
                    </label>
                    <label>
                        Messages:
                        <textarea v-model="requestForm.messages"></textarea>
                    </label>
                    <button type="submit">Submit Request</button>
                    <button @click="closePopup">Cancel</button>
                </form>
            </div>
        </div>
    `,
    data() {
        return {
            campaigns: [],
            selectedCampaign: null,
            showRequestForm: false,
            requestForm: {
                requirements: '',
                payment_amount: '',
                messages: ''
            },
            token: localStorage.getItem('accessToken')
        };
    },
    created() {
        this.fetchCampaigns();
    },
    methods: {
        async fetchCampaigns() {
            try {
                const response = await fetch(location.origin + '/influencer-requests', {
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    this.campaigns = data.public_campaigns;
                } else {
                    console.error("Failed to fetch campaigns:", response.statusText);
                }
            } catch (error) {
                console.error("Error fetching campaigns:", error);
            }
        },
        viewCampaign(campaign) {
            this.selectedCampaign = campaign;
        },
        openRequestForm(campaign) {
            this.selectedCampaign = campaign;
            this.showRequestForm = true;
        },
        closePopup() {
            this.selectedCampaign = null;
            this.showRequestForm = false;
        },
        async submitRequest() {
            try {
                const response = await fetch(location.origin + `/influencer-requests/${this.selectedCampaign.id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`
                    },
                    body: JSON.stringify(this.requestForm)
                });

                if (response.ok) {
                    const data = await response.json();
                    alert(data.message || 'Request submitted successfully');
                    this.closePopup();
                } else {
                    console.error("Failed to submit request:", response.statusText);
                }
            } catch (error) {
                console.error("Error submitting request:", error);
            }
        }
    }
};



// Campaign Table:

// Displays campaign.id, campaign.name, and campaign.description.
// Each row has "View" and "Make Request" buttons for each campaign.
// View Campaign Popup:

// Shows detailed information about the selected campaign.
// Closes when the "Close" button is clicked.
// Make Request Popup Form:

// Opens a form to create a new request for the selected campaign.
// Fields include requirements, payment_amount, and messages.
// When submitted, it calls the submitRequest method, which posts the form data to the backend.
// Methods:

// fetchCampaigns: Retrieves public campaigns from the /influencer-requests endpoint.
// viewCampaign: Opens the "View" popup for the selected campaign.
// openRequestForm: Opens the "Make Request" popup.
// closePopup: Closes any open popup.
// submitRequest: Submits the request data to the backend and closes the form upon success.