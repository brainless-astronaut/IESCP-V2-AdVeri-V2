// frontend/pages/InfluencerManageRequests.js

export default {
    template: `
        <div>
            <header class="navbar">
                <h2>Influencer | manage Requests</h2>
                <router-link to="/influencer-dashboard">Dashboard</router-link>
                <router-link to="/influencer-send-requests">Send Requests</router-link>
                <router-link to="/influencer-manage-requests">Manage Requests</router-link>
                <router-link to="/logout">Logout</router-link>
            </header>
            <div class="table-container">
                <div class="search-container">
                    <h2>Search Requests</h2>
                    <!-- Search Bar -->
                    <form @submit.prevent="fetchAdRequests">
                        <input 
                            type="text" 
                            v-model="searchQuery" 
                            placeholder="Search by campaign name or status" 
                        />
                        <button type="submit" class="button">Search</button>
                    </form>
                </div>

                <div v-if="messages.length" class="modal">
                    <div class="modal-content">
                        <p v-for="(message, index) in messages" :key="index" :class="message.category">
                            {{ message.text }}
                        </p>
                        <button class="close-button" @click="closeMessageModal" style="align-items: center">Close</button>
                    </div>
                </div>

            
                <!-- Ad Requests Table -->
                <table v-if="adRequests.length">
                    <thead>
                        <tr>
                            <th>Campaign</th>
                            <th>Message</th>
                            <th>Requirements</th>
                            <th>Payment</th>
                            <th>Negotiated Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="adRequest in adRequests" :key="adRequest.request_id">
                            <td>{{ adRequest.campaign.name }}</td>
                            <td>{{ adRequest.messages }}</td>
                            <td>{{ adRequest.requirements }}</td>
                            <td>{{ adRequest.payment_amount }}</td>
                            <td>
                                <form @submit.prevent="handleAction(adRequest.request_id, 'negotiate')">
                                <input 
                                    type="number" 
                                    v-model.number="adRequest.negotiationAmount" 
                                    placeholder="Enter amount" 
                                />
                                <button class="button">Negotiate</button>
                                </form>
                            </td>
                            <td>{{ adRequest.status }}</td>
                            <td>
                                <form @submit.prevent="handleAction(adRequest.request_id, 'accept')">
                                <button class="button">Accept</button>
                                </form>
                                <form @submit.prevent="handleAction(adRequest.request_id, 'reject')">
                                <button class="button">Reject</button>
                                </form>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <p v-else>No ad requests found.</p>
            </div>
        </div>
    `,
    data() {
        return {
            searchQuery: "",
            adRequests: [],
            messages: [],
        };
    },

    methods: {
        async fetchAdRequests() {
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

                // alert(userRole)

                if (userRole !== 'influencer') {
                    this.$router.push({
                        path: '/',
                        query: { message: 'You are not authorized to access this page.' }
                    });
                    return;
                }

                const url = new URL(`${location.origin}/influencer-manage-requests`);
                if (this.searchQuery) {
                    url.searchParams.append('search_query', this.searchQuery);
                }

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                // const text = await response.text();
                // console.log(text);

                if (!response.ok) {
                    const errorData = await response.json();
                    // throw new Error(errorData.message || 'Failed to fetch ad requests.');
                    this.messages.push({
                        text: `{error.message}`,
                        category: 'success',
                    });
                }

                const data = await response.json();
                this.adRequests = data.ad_requests || [];
            } catch (error) { 
                this.messages.push({
                    text: error.message,
                    category: 'error',
                });
            }
        },

        async handleAction(requestId, actionType) { 
            try {
                const token = localStorage.getItem('accessToken');
                const requestBody = { request_id: requestId, action: actionType };

                // If action is negotiate, include negotiation amount
                if (actionType === 'negotiate') {
                    const request = this.adRequests.find((req) => req.request_id === requestId);
                    requestBody.negotiation_amount = request.negotiationAmount || 0;
                }

                const response = await fetch(`${location.origin}/influencer-manage-requests`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to update request.');
                }

                const data = await response.json();
                this.messages = [{ category: 'success', text: data.message }];
                this.fetchAdRequests(); // Refresh the list
            } catch (error) {
                this.messages = [{ category: 'error', text: error.message }];
            }
        },
        async closeMessageModal() {
            this.messages = []; // Clear messages to hide the modal
        },
    },
    mounted() {
        this.fetchAdRequests();
    },
};