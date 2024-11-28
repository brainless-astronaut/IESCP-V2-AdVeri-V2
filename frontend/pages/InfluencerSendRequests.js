// frontend/pages/InfleuncerSendRequests.js

export default {
    template: `
        <div>
            <header class="navbar">
                <div class="navbar-left">
                    <h2>Influencer | Send Requests</h2>
                </div>
                <nav class="navbar-links">
                    <router-link to="/influencer-dashboard">Dashboard</router-link>
                    <router-link to="/influencer-send-requests">Send Requests</router-link>
                    <router-link to="/influencer-manage-requests">Manage Requests</router-link>
                    <router-link to="/logout">Logout</router-link>
                </nav>
            </header>

            <!-- Campaign Search -->
            <div class="search-container">
                <h2>Search Campaigns</h2>
                <form @submit.prevent="fetchCampaigns">
                    <input
                    type="text"
                    v-model="searchQuery"
                    placeholder="Search by name or description"
                    />
                    <button type="submit" class="button">Search</button>
                </form>
            </div>

            <div class="table-container">
                

                <!-- Display messages -->
                <div v-if="messages.length" class="messages">
                    <p v-for="(messages, index) in messages" :key="index" :class="messages.category">
                    {{ messages.text }}
                    </p>
                </div>

                <!-- Campaign Details -->
                <div v-if="campaignDetails.length">
                    <table>
                    <thead>
                        <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Progress</th>
                        <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(detail, index) in campaignDetails" :key="index">
                        <td>{{ detail.campaign.name }}</td>
                        <td>{{ detail.campaign.description }}</td>
                        <td>{{ detail.progress }}</td>
                        <td>
                            <!-- View Modal Trigger -->
                            <button @click="openModal(detail.campaign.campaign_id)" class="button">
                            View
                            </button>

                            <!-- Request Form -->
                            <form @submit.prevent="sendRequest(detail.campaign.campaign_id)">
                            <input
                                type="number"
                                v-model="requestForm.paymentAmount"
                                placeholder="Request a payment amount"
                                required
                            />
                            <input
                                type="text"
                                v-model="requestForm.messages"
                                placeholder="Send messages request to the sponsor"
                                required
                            />
                            <input
                                type="text"
                                v-model="requestForm.requirements"
                                placeholder="Enter your qualifications to join"
                                required
                            />
                            <button type="submit" class="button">
                                Request to Join
                            </button>
                            </form>
                        </td>
                        </tr>
                    </tbody>
                    </table>
                </div>
                <p v-else>No campaigns found.</p>

                <!-- View Modal -->
                <div v-if="showModal" class="modal">
                    <div class="modal-content">
                    <h2 class="modal-title">View Campaign</h2>
                    <p><strong>Name:</strong> {{ modalData.name }}</p>
                    <p><strong>Description:</strong> {{ modalData.description }}</p>
                    <p><strong>Start Date:</strong> {{ modalData.start_date }}</p>
                    <p><strong>End Date:</strong> {{ modalData.end_date }}</p>
                    <p><strong>Budget:</strong> {{ modalData.budget }}</p>
                    <p><strong>Visibility:</strong> {{ modalData.visibility }}</p>
                    <p><strong>Goals:</strong> {{ modalData.goals }}</p>
                    <button @click="closeModal" class="button">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            messages: [],
            searchQuery: '',
            campaignDetails: [],
            modalData: {},
            showModal: false,
            requestForm: {
                paymentAmount: '',
                messages: '',
                requirements: ''
            },
            showModal: false,
            modalData: {},
        };
    },

    methods: {
        async fetchCampaigns() {
            try {
                const token = localStorage.getItem('accessToken');
                const url = new URL(location.origin + '/influencer-send-requests');
                url.searchParams.append('search_query', this.searchQuery);

                const response = await fetch(url.toString(), {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    }
                });

                // const text = await response.text();
                // console.log(text)

                const data = await response.json();
                if (response.ok) {
                this.campaignDetails = data.public_campaigns || [];
                } else {
                    this.messages = [{ category: "error", text: data.messages }];
                }
            } catch (error) {
                this.messages = [{ category: "error", text: `Error fetching campaigns: ${error.messages}` }];
            }
        },

        async sendRequest(campaignId) {
            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch(location.origin + '/influencer-send-requests', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        campaign_id: campaignId,
                        payment_amount: this.requestForm.paymentAmount,
                        messages: this.requestForm.messages,
                        requirements: this.requestForm.requirements,
                    })
                });
                const data = await response.json();
                if (response.ok) {
                    this.messages = [{ category: "success", text: data.message }];
                    this.fetchCampaigns(); // Refresh campaigns
                } else {
                    this.messages = [{ category: "error", text: data.message }];
                }
            } catch (error) {
                this.messages = [{ category: "error", text: `Error sending request: ${error.message}` }];
            }
        },

        openModal(campaignId) {
            const campaign = this.campaignDetails.find(
                (detail) => detail.campaign.campaign_id === campaignId
            ).campaign;
            this.modalData = { ...campaign};
            this.showModal = true;
        },

        closeModal() {
            this.showModal = false;
            this.modalData = {};
        },
    },
    mounted() {
        this.fetchCampaigns();
    },
};
