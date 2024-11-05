export default {
    template: `
    <div class="container">
        <div class="left">
            <h1>AdVeri</h1>
            <p>Where Ads Meet Authenticity</p>
        </div>
        <div class="right">
            <p class="welcome-text">Welcome!</p>
            <div class="button-container">
                <router-link to="/login" class="button">Login</router-link>
                <router-link to="/register" class="button">Register</router-link>
            </div>
        </div>
        <footer>
            Thank you for using AdVeri! <br>
            If you have any issues, please contact us at support@adveri.com <br>
            &copy; 2024 AdVeri. All rights reserved.
        </footer>
    </div>
    `,
    methods: {
        async home() {
            try {
                // const response = await fetch(`${location.origin}/home`); // replace with actual backend endpoint
                const response = await fetch(`${location.origin}/`);
                const data = await response.json();
                console.log('Response from backend:', data);
            } catch (error) {
                console.error('Error connecting to backend:', error);
            }
        },
    },
    mounted() {
        // Call home method when component mounts to test backend connection
        this.home();
    },
};



// // HomePage.js
// const HomePage = {
//     template: `
//     <div class="container">
//         <div class="left">
//             <h1>AdVeri</h1>
//             <p>Where Ads Meet Authenticity</p>
//         </div>
//         <div class="right">
//             <p class="welcome-text">Welcome!</p>
//             <div class="button-container">
//                 <router-link to="/login" class="button">Login</router-link>
//                 <router-link to="/register" class="button">Register</router-link>
//             </div>
//         </div>
//         <footer>
//             Thank you for using AdVeri! <br>
//             If you have any issues, please contact us at support@adveri.com <br>
//             &copy; 2024 AdVeri. All rights reserved.
//         </footer>
//     </div>
//     `,
//     style: `
//     @import url('https://fonts.googleapis.com/css2?family=Eagle+Lake&family=Work+Sans:wght@400;700&display=swap');
    
//     :root {
//         --rich-black: #010B13ff;
//         --rusty-red: #dd2d4aff;
//         --antiflash-white: #F2F3F4ff;
//     }

//     body {
//         margin: 0;
//         padding: 0px; 
//         min-height: 100vh;
//         display: flex; 
//         flex-direction: column;
//         font-family: 'Work Sans', sans-serif;
//         background: radial-gradient(ellipse at top, var(--antiflash-white), var(--rusty-red), var(--rich-black));
//         color: var(--antiflash-white);
//     }
    
//     .container {
//         flex: 1;
//         display: flex;
//         justify-content: space-between;
//         width: 100%;
//         max-width: 1200px;
//         margin: auto;
//     }

//     .left {
//         flex: 1;
//         display: flex;
//         flex-direction: column;
//         justify-content: center;
//     }

//     .left h1 {
//         font-family: 'Eagle Lake', cursive;
//         font-style: italic;
//         font-size: 4rem;
//         margin: 0;
//     }

//     .left p {
//         font-family: 'Eagle Lake', cursive;
//         font-size: 2rem;
//         margin: 10px 0 0;
//     }

//     .right {
//         flex: 1;
//         display: flex;
//         flex-direction: column;
//         align-items: center;
//         justify-content: center;
//     }

//     .right .welcome-text {
//         font-size: 1.5rem;
//         margin: 10px 0;
//         color: var(--antiflash-white);
//         font-weight: bold;
//         text-align: center;
//     }

//     .right .button-container {
//         display: flex;
//         gap: 20px;
//     }

//     .button {
//         display: inline-block;
//         margin: 10px;
//         padding: 10px 20px;
//         text-decoration: none;
//         color: var(--antiflash-white);
//         border: 2px solid var(--antiflash-white);
//         border-radius: 25px;
//         width: 125px;
//         text-align: center;
//         font: 'Work Sans';
//         font-size: 1rem;
//         transition: background-color 0.3s, color 0.3s;
//     }

//     .button:hover {
//         background-color: var(--antiflash-white);
//         color: var(--rich-black);
//     }

//     footer {
//         color: var(--antiflash-white);
//         padding: 0;
//         text-align: center;
//         margin: 0;
//         font-family: 'Eagle Lake', cursive;
//         font-size: 1rem;
//     }
//     `,
// };

