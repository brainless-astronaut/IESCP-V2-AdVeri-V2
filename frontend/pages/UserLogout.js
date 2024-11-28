export default {
    template: `
        <div class="logout-container">
            <p class="message">{{ message }}</p>
            <p v-if="!redirecting" class="info-text">
            If you are not redirected, click
            <a :href="homeUrl" class="redirect-link">here</a> to return to the homepage.
            </p>
        </div>
    `,
    data() {
        return {
            message: "",
            homeUrl: location.origin,
            redirecting: false,
        };
    },
    methods: {
        async logout() {
            try {
            const response = await fetch('/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`, // Include JWT token
                },
                // credentials: 'include', // Include cookies if needed
            });
    
            if (response.ok) {
                const data = await response.json();
                this.message = data.message;
                this.redirectAfterDelay();
            } 
            // else {
            //     this.message = "An error occurred while logging out.";
            // }
            } catch (error) {
                this.message = "An error occurred while logging out.";
                console.error("Logout Error:", error);
            }
        },
        redirectAfterDelay() {
                this.redirecting = true;
                setTimeout(() => {
                window.location.href = this.homeUrl;
            }, 5000); // 5 seconds
        },
    },
    mounted() {
      this.logout();
    },
  };


