export default {
    template: `
        <div>
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
                <!-- <div class="navbar-right">
                    <div class="search-bar-container">
                        <input type="text" v-model="searchQuery" placeholder="Search by name or description" class="search-bar"/>
                        <button @click="fetchCampaigns" :disabled="loading">Search</button>
                    </div>
                    <button @click="openCreateCampaignModal">Create Campaign</button>
                </div> -->
            </header>
        <div class="table-container">
            <!-- Flash Messages -->
            <div v-if="messages.length" class="messages">
                <p v-for="(message, index) in messages" :key="index" :class="message.category">
                    {{ message.text }}
                </p>
            </div>

        <!-- Campaign Details -->
            <div v-if="requestDetails && Object.keys(requestDetails).length">
                <div v-for="(details, campaignId) in requestDetails" :key="campaignId">
                    <h2>Campaign: {{ details.campaign.name }}</h2>
                    <div v-if="details.request && details.request.length">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Influencer</th>
                                    <th>Status</th>
                                    <th>Message</th>
                                    <th>Requirements</th>
                                    <th>Payment Amount</th>
                                    <th>Negotiated Amount</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(request, index) in details.request" :key="index">
                                    <td>{{ request.ad_request.request_id }}</td>
                                    <td>{{ request.influencer_name }}</td>
                                    <td>{{ request.ad_request.status }}</td>
                                    <td>{{ request.ad_request.messages }}</td>
                                    <td>{{ request.ad_request.requirements }}</td>
                                    <td>{{ request.ad_request.payment_amount }}</td>
                                    <td>{{ request.ad_request.negotiation_amount || 'N/A' }}</td>
                                    <td>
                                    <form @submit.prevent="handleAction('negotiate', request.ad_request.request_id, $event)">
                                        <input
                                        type="number"
                                        name="negotiated_amount"
                                        placeholder="Negotiated Amount"
                                        required
                                        />
                                        <button type="submit" class="btn btn-negotiate">Negotiate</button>
                                    </form>
                                    <button @click="handleAction('accept', request.ad_request.request_id)" class="btn btn-accept">
                                        Accept
                                    </button>
                                    <button @click="handleAction('revoke', request.ad_request.request_id)" class="btn btn-revoke">
                                        Revoke
                                    </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p v-else>No requests made.</p>
                </div>
            </div>
        <p v-else>Create campaigns to make requests.</p>
    </div>
    </div>
    `,
    data() {
        return {
            messages: [],
            requestDetails: {},
        };
    },
    async mounted() {
        await this.fetchRequestDetails();
    },
    methods: {
        // Fetch campaign and request details
        async fetchRequestDetails() {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) throw new Error("Authentication token is missing.");
                const response = await fetch(location.origin + '/sponsor-requests', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                // const text = await response.text();
                // alert(text);
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to fetch data: ${errorText || response.statusText}`);
                }
                const data = await response.json();
                console.log('Fetched Request Details:', data); // Debugging
                this.requestDetails = data.request_details;
            } catch (error) {
                this.messages.push({category: "error", text: error.message});
            }
        },

        // Handle actions: Negotiate, Accept, Revoke
        async handleAction(action, requestId, event = null) {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) throw new Error("Authentication token is missing.");

                console.log(` action: ${action}\n requestId ${requestId}\n event ${event}`)

                const requestBody = { action, request_id: requestId };
                if (action === 'negotiate' && event) {
                    const formData = new FormData(event.target);
                    requestBody.negotiation_amount = formData.get("negotiated_amount");
                }

                const response = await fetch(location.origin + '/sponsor-requests', {
                    method: 'PUT',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify(requestBody),
                });
                
                if (!response.ok) throw new Error(await response.text());
                const data = await response.json();

                this.messages.push({ category: "success", text: data.message });
                await this.fetchRequestDetails(); // Refresh data after action
            } catch (error) {
                this.messages.push({ category: "error", text: error.message });
            }
        },
    },
};