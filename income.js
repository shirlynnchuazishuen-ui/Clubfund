// Income Management page
const incomeForm = document.getElementById("incomeForm");
const incomeMessage = document.getElementById("incomeMessage");
const incomeRecords = document.getElementById("incomeRecords");


// Check current user and role
async function checkUserRole() {

    const { data: userData, error: userError } =
        await supabaseClient.auth.getUser();

    if (userError || !userData.user) {
        window.location.href = "index.html";
        return null;
    }

    const { data: profile, error } = await supabaseClient
        .from("profiles")
        .select("role")
        .eq("user_id", userData.user.id)
        .single();

    if (error || !profile) {
        incomeMessage.textContent = "Unable to load user profile.";
        return null;
    }

    if (profile.role !== "treasurer") {
        window.location.href = "dashboard.html";
        return null;
    }

    return userData.user;
}


// Load income records
async function loadIncome() {

    const { data: incomes, error } = await supabaseClient
        .from("Income")
        .select("*")
        .order("income_date", { ascending: false });

    if (error) {
        incomeRecords.innerHTML = `
            <tr>
                <td colspan="4">Unable to load income records.</td>
            </tr>
        `;
        return;
    }

    if (incomes.length === 0) {
        incomeRecords.innerHTML = `
            <tr>
                <td colspan="4">No income records found.</td>
            </tr>
        `;
        return;
    }

    incomeRecords.innerHTML = "";

    incomes.forEach(function(income) {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${income.source}</td>
            <td>${income.description || "-"}</td>
            <td>RM ${Number(income.amount).toFixed(2)}</td>
            <td>${income.income_date}</td>
        `;

        incomeRecords.appendChild(row);

    });

}


// Record new income
incomeForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const user = await checkUserRole();

    if (!user) {
        return;
    }

    const source = document.getElementById("incomeSource").value;
    const description = document.getElementById("incomeDescription").value;
    const amount = document.getElementById("incomeAmount").value;
    const incomeDate = document.getElementById("incomeDate").value;

    const { error } = await supabaseClient
        .from("Income")
        .insert({
            source: source,
            description: description,
            amount: Number(amount),
            income_date: incomeDate,
            recorded_by: user.id
        });

    if (error) {
        incomeMessage.textContent = error.message;
    } else {
        incomeMessage.textContent = "Income recorded successfully!";

        incomeForm.reset();

        await loadIncome();
    }

});


// Logout
const logoutButton = document.getElementById("logoutButton");
const logoutMessage = document.getElementById("logoutMessage");

logoutButton.addEventListener("click", async function() {

    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        logoutMessage.textContent = error.message;
    } else {
        window.location.href = "index.html";
    }

});


// Initialize page
async function initializeIncomePage() {

    const user = await checkUserRole();

    if (user) {
        await loadIncome();
    }

}

initializeIncomePage();
