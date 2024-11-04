// RegisterPage.js
const RegisterPage = {
    template: `
    <div class="login-container">
        <h1>Register as</h1>
        <h1>----------------------</h1>
        <div class="button-container">
            <router-link to="/register/sponsors" class="btn">Sponsor</router-link>
            <router-link to="/register/influencers" class="btn">Influencer</router-link>
        </div>
        <router-link to="/" class="back-link">Go back to welcome page</router-link>
        <br>
        <router-link to="/login" class="login-link">Already a member? Let's login!</router-link>
    </div>
    `,
    style: `
    :root {
        --rich-black: #010b13ff;
        --rusty-red: #da2c43ff;
        --antiflash-white: #f2f3f4ff;
    }

    body, html {
        height: 100%;
        margin: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: var(--rusty-red);
        font-family: Arial, sans-serif;
        color: var(--antiflash-white);
        text-align: center;
    }

    .login-container {
        padding: 30px;
        border-radius: 10px;
    }

    h1 {
        font-size: 2.5em;
        margin-bottom: 20px;
        color: var(--antiflash-white);
    }

    .button-container {
        margin-bottom: 20px;
    }

    .btn {
        display: inline-block;
        padding: 10px 20px;
        margin: 10px;
        border: 2px solid var(--antiflash-white);
        color: var(--antiflash-white);
        text-decoration: none;
        font-size: 1.2em;
        border-radius: 25px;
        transition: background-color 0.3s;
    }

    .btn:hover {
        background-color: var(--antiflash-white);
        color: var(--rusty-red);
    }

    .back-link, .login-link {
        color: var(--antiflash-white);
        text-decoration: none;
        font-size: 1em;
    }

    .back-link:hover, .login-link:hover {
        text-decoration: none;
    }
    `,
};

