// InfluencerDashboard.js

export default {
    template: `
        <div>
            <h1>Influencer Dashboard</h1>
            <p>Total Requests: {{ totalRequests }}</p>

            <div>
                <h2>Sent Requests</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Request ID</th>
                            <th>Campaign ID</th>
                            <th>Sponsor ID</th>
                            <th>Requirements</th>
                            <th>Payment Amount</th>
                            <th>Messages</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="request in sentRequests" :key="request.id">
                            <td>{{ request.id }}</td>
                            <td>{{ request.campaign_id }}</td>
                            <td>{{ request.sponsor_id }}</td>
                            <td>{{ request.requirements }}</td>
                            <td>{{ request.payment_amount }}</td>
                            <td>{{ request.messages }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div>
                <h2>Received Requests</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Request ID</th>
                            <th>Campaign ID</th>
                            <th>Sponsor ID</th>
                            <th>Requirements</th>
                            <th>Payment Amount</th>
                            <th>Messages</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="request in receivedRequests" :key="request.id">
                            <td>{{ request.id }}</td>
                            <td>{{ request.campaign_id }}</td>
                            <td>{{ request.sponsor_id }}</td>
                            <td>{{ request.requirements }}</td>
                            <td>{{ request.payment_amount }}</td>
                            <td>{{ request.messages }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `,
    data() {
        return {
            sentRequests: [],
            receivedRequests: [],
            totalRequests: 0,
            token: localStorage.getItem('accessToken'),
        };
    },
    created() {
        this.fetchDashboardData();
    },
    methods: {
        async fetchDashboardData() {
            try {
                const response = await axios.get('/influencer-dashboard', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const data = response.data;
                this.sentRequests = data.sent_requests;
                this.receivedRequests = data.received_requests;
                this.totalRequests = data.Total_Requests;
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
        }
    }
};

// Tables for Data Display:

// There are two tables: one for sent_requests and another for received_requests. Each displays the request details like Request ID, Campaign ID, Sponsor ID, Requirements, Payment Amount, and Messages.
// Data Fetching:

// The fetchDashboardData method uses Axios to make an API request to /influencer-dashboard and populate sentRequests, receivedRequests, and totalRequests in the component’s data.
// Authorization Header:

// An authorization header is included with the JWT token to authenticate the request.
// Total Requests:

// This displays the total number of requests on the top of the dashboard.