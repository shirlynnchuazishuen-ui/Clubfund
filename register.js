
const fullNameInput = document.getElementById("fullName");
const registerEmailInput = document.getElementById("registerEmail");
const registerPasswordInput = document.getElementById("registerPassword");

const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("registerMessage");

registerForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const fullName = fullNameInput.value;
    const email = registerEmailInput.value;
    const password = registerPasswordInput.value;

    if (fullName === "" || email === "" || password === "") {
        registerMessage.textContent = "Please fill in all fields.";
    } else {
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName
                },
                emailRedirectTo: "https://clubfund-five.vercel.app/index.html"
            }
        });

        if (error) {
            registerMessage.textContent = error.message;
        } else {
            registerMessage.textContent = "Registration successful! Please check your email if confirmation is required.";
        }
    }
});
