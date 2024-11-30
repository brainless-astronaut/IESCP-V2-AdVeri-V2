export default {
    template: `
    <div id="app">
        <header class="navbar">
            <div class="navbar-left">
                <h1>Admin | Manage Users</h1>
            </div>
            <nav class="navbar-links">
                <router-link to="/admin-dashboard">Dashboard</router-link>
                <router-link to="/admin-users">Users</router-link>
                <router-link to="/admin-campaigns">Campaigns</router-link>
                <router-link to="/admin-approve-sponsor">Sponsor Applications</router-link>
                <router-link to="/logout">Logout</router-link>
            </nav>
        </header>
        <div class="table-container">
            <div v-if="messages.length" class="modal">
                <div class="modal-content">
                    <p v-for="(message, index) in messages" :key="index" :class="message.category">
                        {{ message.text }}
                    </p>
                    <button class="close-button" @click="closeMessageModal" style="align-items: center">Close</button>
                </div>
            </div>

            <!-- Table for Influencers -->
            <section>
                <h2>Influencers</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="influencer in influencers" :key="influencer.user_id">
                            <td>{{ influencer.username }}</td>
                            <td>{{ influencer.email }}</td>
                            <td>{{ influencer.name }}</td>
                            <td>{{ influencer.category }}</td>
                            <td>
                                <button type="submit" @click="flagUser(influencer)">Flag</button>
                                <details>
                                    <summary class="button">View</summary>
                                    <p><strong>Name:</strong> {{ influencer.name }}</p>
                                    <p><strong>Category:</strong> {{ influencer.category }}</p>
                                    <p><strong>Niche:</strong> {{ influencer.niche }}</p>
                                    <p><strong>Reach:</strong> {{ influencer.reach }}</p>
                                    <p><strong>Platform:</strong> {{ influencer.platform }}</p>
                                    <p><strong>Earnings:</strong> {{ influencer.earnings }}</p>
                                </details>                        
                            </td>
                        </tr>
                    </tbody>
                </table>
            </section>

            <!-- Table for Sponsors -->
            <section>
                <h2>Sponsors</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Entity Name</th>
                                <th>Industry</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="sponsor in sponsors" :key="sponsor.user_id">
                                <td>{{ sponsor.username }}</td>
                                <td>{{ sponsor.email }}</td>
                                <td>{{ sponsor.entity_name}}</td>
                                <td>{{ sponsor.name }}</td>
                                <td>
                                    <button type="submit" @click="flagUser(sponsor)">Flag</button>
                                    <details>
                                        <summary class="button">View</summary>
                                        <p><strong>Username:</strong> {{ sponsor.username }}</p>
                                        <p><strong>Company Name:</strong> {{ sponsor.entity_name}}</p>
                                        <p><strong>Industry:</strong> {{ sponsor.industry }}</p>
                                        <p><strong>Budget:</strong> {{ sponsor.budget }}</p>
                                    </details>
                                </td>
                            </tr>
                        </tbody>
                    </table>
            </section>

            <!-- Table for Flagged Users -->
            <h2>Flagged Users</h2>
            <section>
                    <table>
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="user in flaggedUsers" :key="user.user_id">
                                <td>{{ user.username }}</td>
                                <td>{{ user.email }}</td>
                                <td>
                                    <button @click="unflagUser(user)">Unflag</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
            </section>
        </div>
    </div>
    `,
    data() {
        return {
            influencers: [],
            sponsors: [],
            flaggedUsers: [],
            messages: [],
        };
    },
    methods: {
        async fetchUsers() {
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
                const response = await fetch('/admin-users', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });
                // alert('reponse text: ' + await response.text())
                const data = await response.json();
                this.influencers = data.influencers;
                this.sponsors = data.sponsors;
                this.flaggedUsers = data.flagged_users
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        },
        async flagUser(user) {
            try {
                // alert("Flagging user:", user.user_id); // Debugging: Log the user object
                const userId = user.user_id;
                if (!userId) {
                    console.error("User ID is missing:", user);
                    return;
                }
                await this.performAction(userId, 'flag');
            } catch (error) {
                console.error("Error flagging user:", error);
            }
        },
        async unflagUser(user) {
            try {
                // alert("Unflagging user:", user); // Debugging: Log the user object
                const userId = user.user_id;
                if (!userId) {
                    console.error("User ID is missing:", user);
                    return;
                }
                await this.performAction(userId, 'unflag');
            } catch (error) {
                console.error("Error unflagging user:", error);
            }
        },
        async performAction(userId, action) {
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

                const response = await fetch(`/admin-users`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ user_id: userId, action })
                });
                
                // const responseText = await response.text();
                // alert("Response text:", responseText);

                
                if (!response.ok) {
                    throw new Error(`Error (${response.status}): ${responseText}`);
                }
                
                this.fetchUsers();
            } catch (error) {
                // alert(`Error (${action})`, error)
                console.error(`Error performing action (${action}):`, error);
            }
        },
        async closeMessageModal() {
            this.messages = []; // Clear messages to hide the modal
        },
    },
    mounted() {
        this.fetchUsers();
    }
};