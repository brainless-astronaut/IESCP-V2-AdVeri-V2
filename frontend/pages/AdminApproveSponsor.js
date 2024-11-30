export default {
    template: `
    <div id="app">
        <header class="navbar">
            <div class="navbar-left">
                <h1>Admin | Approve Sponsors</h1>
            </div>
            <nav class="navbar-links">
                <router-link to="/admin-dashboard">Dashboard</router-link>
                <router-link to="/admin-users">Users</router-link>
                <router-link to="/admin-campaigns">Campaigns</router-link>
                <router-link to="/admin-approve-sponsor">Sponsor Applications</router-link>
                <router-link to="/logout">Logout</router-link>
            </nav>
            </nav>
        </header>

        <div v-if="messages.length" class="modal">
            <div class="modal-content">
                <!-- <p v-for="(message, index) in messages" :key="index" :class="message.category">
                    {{ message }}
                </p> -->
                {{ messages}} 
                <button class="close-button" @click="closeMessageModal" style="align-items: center">Close</button>
            </div> 
        </div>


        <div class="table-container">
            <h2>Sponsor Applications</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Industry</th>
                        <th>Budget</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="sponsor in sponsorsToApprove" :key="sponsor.user_id">
                        <td>{{ sponsor.name }}</td>
                        <td>{{ sponsor.industry }}</td>
                        <td>{{ sponsor.budget }}</td>
                        <td>
                            <button @click="approveSponsor(sponsor.user_id)">Approve</button>
                            <button @click="denySponsor(sponsor.user_id)">Deny</button>
                            <details>
                                <summary class="button">View</summary>
                                <p><strong>Name:</strong> {{ sponsor.name }}</p>
                                <p><strong>Industry:</strong> {{ sponsor.industry }}</p>
                                <p><strong>Budget:</strong> {{ sponsor.budget }}</p>
                            </details>
            
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    `,
    data() {
        return {
            sponsorsToApprove: [],
            messages: [],
        };
    },
    methods: {
        async fetchSponsors() {
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
                
                if (userRole !== 'admin') {
                    this.$router.push({
                        path: '/',
                        query: { message: 'You are not authorized to access this page.' }
                    });
                    return;
                }

                const response = await fetch('/admin-approve-sponsor', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                // const text = await response.text();
                // console.log(text);

                const data = await response.json();
                // this.sponsorsToApprove = data.sponsors_to_approve_list;
                this.sponsorsToApprove = data.sponsors_to_approve;

            } catch (error) {
                console.error('Error fetching sponsors:', error);
                this.messages = 'An unexpected error occurred while fetching sponsors.';
            }
        },
        async approveSponsor(user_id) {
            await this.handleAction(user_id, 'approve');
        },
        async denySponsor(user_id) {
            await this.handleAction(user_id, 'deny');
        },
        async handleAction(user_id, action) {
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
                
                if (userRole !== 'admin') {
                    this.$router.push({
                        path: '/',
                        query: { message: 'You are not authorized to access this page.' }
                    });
                    return;
                }
                const response = await fetch('/admin-approve-sponsor', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ user_id, action }),
                });
                if (response.ok) {
                    this.sponsorsToApprove = this.sponsorsToApprove.filter(s => s.user_id !== user_id);
                    // alert(`Sponsor ${action === 'approve' ? 'approved' : 'denied'} successfully!`);
                    console.log(`Sponsor ${action === 'approve' ? 'approved' : 'denied'} successfully!`);
                    this.messages = `Sponsor ${action === 'approve' ? 'approved' : 'denied'} successfully!`;
                } else {
                    const errorData = await response.json();
                    this.messages = errorData.message || `Failed to ${action} sponsor.`;
                }
            } catch (error) {
                console.error(`Error during ${action} action:`, error);
                this.messages = `An unexpected error occurred while trying to ${action} the sponsor.`;
            }
        },
        async closeMessageModal() {
            this.messages = []; // Clear messages to hide the modal
        },
    },
    mounted() {
        this.fetchSponsors();
    },
};
