// frontend/pages/SponsorRequests.js

export default {
    data() {
        return {
            requests: [], // For storing requests data
            showCreatePopup: false, // Controls visibility of the Create Request popup
            showEditPopup: false, // Controls visibility of the Edit Request popup
            currentRequest: {}, // Stores request data for view/edit actions
            token: localStorage.getItem('accessToken'), // Assuming token is stored here
        };
    },
    created() {
        this.fetchRequests();
    },
    methods: {
        // Fetch requests for the current sponsor's campaigns
        async fetchRequests() {
            try {
                const response = await fetch('/sponsor-requests', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    this.requests = data.requests;
                } else {
                    console.error("Error fetching requests:", await response.text());
                }
            } catch (error) {
                console.error("Error fetching requests:", error);
            }
        },

        // Open the Create Request Popup
        openCreatePopup() {
            this.showCreatePopup = true;
            this.currentRequest = {}; // Reset the form data
        },

        // Open the Edit Request Popup
        openEditPopup(request) {
            this.currentRequest = { ...request }; // Clone request data
            this.showEditPopup = true;
        },

        // Close the current popup
        closePopup() {
            this.showCreatePopup = false;
            this.showEditPopup = false;
        },

        // Create a new request
        async createRequest(requestData) {
            try {
                const response = await fetch('/sponsor-requests', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`,
                    },
                    body: JSON.stringify(requestData)
                });

                if (response.ok) {
                    const data = await response.json();
                    alert(data.message);
                    this.fetchRequests();
                    this.closePopup();
                } else {
                    console.error("Error creating request:", await response.text());
                }
            } catch (error) {
                console.error("Error creating request:", error);
            }
        },

        // Edit the request
        async editRequest(requestData) {
            try {
                const response = await fetch(`/sponsor-requests/${this.currentRequest.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`,
                    },
                    body: JSON.stringify(requestData)
                });

                if (response.ok) {
                    const data = await response.json();
                    alert(data.message);
                    this.fetchRequests();
                    this.closePopup();
                } else {
                    console.error("Error editing request:", await response.text());
                }
            } catch (error) {
                console.error("Error editing request:", error);
            }
        },

        // Delete the request
        async deleteRequest(requestId) {
            try {
                const response = await fetch(`/sponsor-requests/${requestId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    alert(data.message);
                    this.fetchRequests();
                } else {
                    console.error("Error deleting request:", await response.text());
                }
            } catch (error) {
                console.error("Error deleting request:", error);
            }
        }
    },
    template: `
        <div>
            <button @click="openCreatePopup" class="btn btn-primary">Create Request</button>

            <!-- Requests Table -->
            <table>
                <thead>
                    <tr>
                        <th>Request ID</th>
                        <th>Campaign ID</th>
                        <th>Influencer ID</th>
                        <th>Requirements</th>
                        <th>Payment Amount</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="request in requests" :key="request.id">
                        <td>{{ request.id }}</td>
                        <td>{{ request.campaign_id }}</td>
                        <td>{{ request.influencer_id }}</td>
                        <td>{{ request.requirements }}</td>
                        <td>{{ request.payment_amount }}</td>
                        <td>{{ request.status }}</td>
                        <td>
                            <button @click="openEditPopup(request)">Edit</button>
                            <button @click="deleteRequest(request.id)">Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Create Request Popup -->
            <div v-if="showCreatePopup" class="popup">
                <div class="popup-content">
                    <h2>Create Request</h2>
                    <form @submit.prevent="createRequest(currentRequest)">
                        <input v-model="currentRequest.campaign_id" placeholder="Campaign ID" required>
                        <input v-model="currentRequest.influencer_id" placeholder="Influencer ID" required>
                        <textarea v-model="currentRequest.requirements" placeholder="Requirements" required></textarea>
                        <input v-model="currentRequest.payment_amount" type="number" placeholder="Payment Amount" required>
                        <textarea v-model="currentRequest.messages" placeholder="Messages"></textarea>
                        <button type="submit">Create</button>
                        <button @click="closePopup">Cancel</button>
                    </form>
                </div>
            </div>

            <!-- Edit Request Popup -->
            <div v-if="showEditPopup" class="popup">
                <div class="popup-content">
                    <h2>Edit Request</h2>
                    <form @submit.prevent="editRequest(currentRequest)">
                        <input v-model="currentRequest.campaign_id" placeholder="Campaign ID" required>
                        <input v-model="currentRequest.influencer_id" placeholder="Influencer ID" required>
                        <textarea v-model="currentRequest.requirements" placeholder="Requirements" required></textarea>
                        <input v-model="currentRequest.payment_amount" type="number" placeholder="Payment Amount" required>
                        <textarea v-model="currentRequest.messages" placeholder="Messages"></textarea>
                        <button type="submit">Save Changes</button>
                        <button @click="closePopup">Cancel</button>
                    </form>
                </div>
            </div>
        </div>
    `
};


// Data Handling:

// requests: Stores all the requests fetched from the backend.
// showCreatePopup, showEditPopup: Boolean values to control the visibility of the respective popups.
// currentRequest: Stores the currently selected request’s data, used for editing.
// Methods:

// fetchRequests(): Fetches requests related to the sponsor’s campaigns from the backend.
// openCreatePopup(), openEditPopup(): Opens the respective popups for creating or editing requests.
// closePopup(): Closes any open popups.
// createRequest(), editRequest(), deleteRequest(): Handles the respective CRUD operations with the backend.
// Popups:

// Create Request: This popup allows the sponsor to submit a new request, including campaign ID, influencer ID, requirements, payment amount, and messages.
// Edit Request: This popup lets the sponsor edit an existing request's details.
// The actions can include 'Update', 'Negotiate', 'Accept', or 'Reject' depending on the status of the request.
// Button Actions:

// Create: Opens the "Create Request" popup.
// Edit: Opens the "Edit Request" popup to allow modifications to the selected request.
// Delete: Deletes the request after confirmation.