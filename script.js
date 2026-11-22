//Login page
const projectName = "ClubFund";

console.log("Welcome to ClubFund!");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginMessage = document.getElementById("loginMessage");


//Handle Login
const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const email = emailInput.value;
    const password = passwordInput.value;

    if (email === "" || password === "") {
        loginMessage.textContent = "Please fill in all fields.";
} 
    else {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
    });

    if (error){
        loginMessage.textContent = error.message;
    }else{
        window.location.href ="dashboard.html"
    }
    }
});

//Welcome user
function welcomeUser(userName) {
        console.log("Welcome " + userName +"!");
}
//Check budget
    
function checkBudget(budget, expense){
    if(expense <= budget){
        console.log("Budget is sufficient.");
    }
    else{
        console.log("Budget exceeded.");
    }
}

//Test Supabase client
console.log(supabaseClient);