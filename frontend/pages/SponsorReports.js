export default {
    template: `
        <div id="app">
            <div class="navbar">    
                <div class="navbar-left">
                    <h1>Sponsor | Reports </h1>
                </div>
                <div class="navbar-links">
                    <router-link to="/sponsor-dashboard">Dashboard</router-link>
                    <router-link to="/sponsor-campaigns">Campaigns</router-link>
                    <router-link to="/sponsor-requests">Requests</router-link>
                    <router-link to="/sponsor-reports">Reports</router-link>
                    <router-link to="/logout">Logout</router-link>
                </div>
            </div>
            <h1>Click the button to generate report</h1>
            <button @click="trigger_report">Generate report</button>
            <div v-if="messages.length" class="modal">
                <div class="modal-content">
                    <p v-for="(message, index) in messages" :key="index" :class="message.category">
                        {{ message.text }}
                    </p>
                    <button class="close-button" @click="closeMessageModal" style="align-items: center">Close</button>
                </div>
            </div>
            <div v-if="reportData.length">
                <h3>Generated Report:</h3>
                <table>
                    <thead>
                        <tr>
                            <th v-for="(value, key) in reportData[0]" :key="key">{{ key }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(row, index) in reportData" :key="index">
                            <td v-for="(value, key) in row" :key="key">{{ value }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>    
    `,
    data() {
        return {
            messages: [],
            reportData: [] // Holds the CSV data
        };
    },    
    methods: {
        async trigger_report() {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    this.$router.push({
                        path: '/login',
                        query: { message: 'Token has expired. Please login again.' }
                    });
                    return;
                }
        
                const response = await fetch(location.origin + '/sponsor-reports', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
        
                if (!response.ok) {
                    console.error("Failed to initiate report generation.");
                    this.messages.push({
                        text: 'Failed to start the report generation task. Try again later.',
                        category: 'error'
                    });
                    return;
                }
        
                const { task_id } = await response.json();
                this.messages.push({
                    text: 'Report generation initiated. Task ID: ' + task_id,
                    category: 'info'
                });
        
                const intervalId = setInterval(async () => {
                    try {
                        const checkResponse = await fetch(`${location.origin}/sponsor-reports?task_id=${task_id}`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
        
                        const contentType = checkResponse.headers.get('Content-Type');
        
                        if (checkResponse.status === 202) {
                            // Task is still in progress
                            console.log('Report generation is in progress...');
                            return;
                        }
        
                        clearInterval(intervalId);
        
                        if (checkResponse.ok) {
                            if (contentType.includes('application/json')) {
                                // Handle JSON response (task status, success message)
                                const data = await checkResponse.json();
                                this.messages.push({
                                    text: data.message || 'Report generation complete.',
                                    category: 'info'
                                });
                            } else if (contentType.includes('text/csv')) {
                                // Handle CSV response
                                const csvData = await checkResponse.text();
                                console.log('CSV Data:', csvData);

                                // Parse CSV and store in reportData
                                this.parseCSV(csvData);
                                
                                // Inform the user that the report is ready for viewing (instead of downloading)
                                this.messages.push({
                                    text: 'Report generation completed. The report is ready for viewing.',
                                    category: 'success'
                                });
                        
                            } else {
                                console.error('Unexpected Content-Type:', contentType);
                                this.messages.push({
                                    text: `Unexpected content type: ${contentType}`,
                                    category: 'error'
                                });
                            }
                        } else {
                            const errorMessage = await checkResponse.text();
                            console.error('Error from server:', errorMessage);
                            this.messages.push({
                                text: `Error: ${errorMessage}`,
                                category: 'error'
                            });
                        }
                    } catch (error) {
                        console.error('Error while checking report status:', error);
                        this.messages.push({
                            text: 'An error occurred while checking the report status.',
                            category: 'error'
                        });
                        clearInterval(intervalId);
                    }
                }, 2000);
            } catch (error) {
                console.error('Error occurred while triggering report:', error);
                this.messages.push({
                    text: 'An error occurred while triggering the report generation.',
                    category: 'error'
                });
            }
        },        
        async closeMessageModal() {
            this.messages = []; // Clear messages to hide the modal
        },
        parseCSV(csvText) {
            const lines = csvText.split("\n");
            const headers = lines[0].split(",");
            const result = lines.slice(1).map(line => {
                const values = line.split(",");
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index];
                });
                return row;
            });
            this.reportData = result;
        }
    },
}