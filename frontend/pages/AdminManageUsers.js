export default {
    template: `
    <div id="app">
        <header>
            <h2>Admin Dashboard</h2>
            <router-link to="/admin-dashboard">Dashboard</router-link>
            <router-link to="/admin-users">Users</router-link>
            <router-link to="/admin-campaigns">Campaigns</router-link>
            <router-link to="/admin-reports">Reports</router-link>
            <router-link to="/logout">Logout</router-link>
        </header>

        <!-- Table for Influencers -->
        <h2>Influencers</h2>
        <table>
            <thead>
                <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="influencer in influencers" :key="influencer.id">
                    <td>{{ influencer.username }}</td>
                    <td>{{ influencer.email }}</td>
                    <td>{{ influencer.name }}</td>
                    <td>
                        <button @click="viewUser(influencer)">View</button>
                        <button @click="flagUser(influencer)">Flag</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Table for Sponsors -->
        <h2>Sponsors</h2>
        <table>
            <thead>
                <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="sponsor in sponsors" :key="sponsor.id">
                    <td>{{ sponsor.username }}</td>
                    <td>{{ sponsor.email }}</td>
                    <td>{{ sponsor.name }}</td>
                    <td>
                        <button @click="viewUser(sponsor)">View</button>
                        <button @click="flagUser(sponsor)">Flag</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Table for Flagged Users -->
        <h2>Flagged Users</h2>
        <table>
            <thead>
                <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="user in flaggedUsers" :key="user.id">
                    <td>{{ user.username }}</td>
                    <td>{{ user.email }}</td>
                    <td>
                        <button @click="unflagUser(user)">Unflag</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Modal Popup for Viewing User Details -->
        <div v-if="selectedUser">
            <h3>User Details</h3>
            <p><strong>Username:</strong> {{ selectedUser.username }}</p>
            <p><strong>Email:</strong> {{ selectedUser.email }}</p>
            <p><strong>Name:</strong> {{ selectedUser.name }}</p>
            <p><strong>Role:</strong> {{ selectedUser.role }}</p>
            <button @click="closeModal">Close</button>
        </div>
    </div>
    `,
    data() {
        return {
            influencers: [],
            sponsors: [],
            flaggedUsers: [],
            selectedUser: null
        };
    },
    methods: {
        async fetchUsers() {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    console.error("Token is missing in localStorage.");
                    return;
                }
                const response = await fetch('/admin-manage-users', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });
                const data = await response.json();
                this.influencers = data.influencers;
                this.sponsors = data.sponsors;
                this.flaggedUsers = [...data.flagged_influencers, ...data.flagged_sponsors];
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        },
        viewUser(user) {
            this.selectedUser = user;
        },
        closeModal() {
            this.selectedUser = null;
        },
        async flagUser(user) {
            await this.performAction(user.id, 'flag');
        },
        async unflagUser(user) {
            await this.performAction(user.id, 'unflag');
        },
        async performAction(userId, action) {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    console.error("Token is missing in localStorage.");
                    return;
                }
                await fetch('/admin-manage-users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ user_id: userId, action })
                });
                this.fetchUsers();
            } catch (error) {
                console.error(`Error performing action (${action}):`, error);
            }
        }
    },
    mounted() {
        this.fetchUsers();
    }
};