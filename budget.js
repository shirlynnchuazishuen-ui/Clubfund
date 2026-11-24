// Budget Management page
const budgetForm = document.getElementById("budgetForm");
const budgetMessage = document.getElementById("budgetMessage");
const budgetRecords = document.getElementById("budgetRecords");

const createBudgetSection = document.getElementById("createBudgetSection");

const pageTitle = document.getElementById("pageTitle");
const pageDescription =document.getElementById("pageDescription");

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
        budgetMessage.textContent = "Unable to load user profile.";
        return null;
    }
    const incomeNavLink = document.getElementById("incomeNavLink");
    const dashboardNavLink = document.getElementById("dashboardNavLink");

    if (profile.role === "treasurer") {
        incomeNavLink.style.display = "";
        dashboardNavLink.href = "treasurer.html";
    } else {
        dashboardNavLink.href = "dashboard.html";
    }
    // Only Treasurer can create budgets
    if (profile.role !== "treasurer") {
          createBudgetSection.style.display = "none";
          pageTitle.textContent = "View Budgets";
          pageDescription.textContent ="View available club budgets.";
    }

    return {
        user: userData.user,
        role: profile.role
    };
}


// Load existing budgets
async function loadBudgets() {

    const { data: budgets, error } = await supabaseClient
        .from("Budgets")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        budgetRecords.innerHTML = `
            <tr>
                <td colspan="4">Unable to load budgets.</td>
            </tr>
        `;
        return;
    }

    if (budgets.length === 0) {
        budgetRecords.innerHTML = `
            <tr>
                <td colspan="4">No budgets found.</td>
            </tr>
        `;
        return;
    }

    budgetRecords.innerHTML = "";

    budgets.forEach(function(budget) {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${budget.budget_name}</td>
            <td>RM ${budget.total_amount}</td>
            <td>${budget.start_date || "-"}</td>
            <td>${budget.end_date || "-"}</td>
        `;

        budgetRecords.appendChild(row);

    });

}


// Create new budget
budgetForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const account = await checkUserRole();

    if (!account || account.role !== "treasurer") {
        return;
    }

    const budgetName = document.getElementById("budgetName").value;
    const totalAmount = document.getElementById("totalAmount").value;
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    const { error } = await supabaseClient
        .from("Budgets")
        .insert({
            budget_name: budgetName,
            total_amount: Number(totalAmount),
            start_date: startDate || null,
            end_date: endDate || null,
            created_by: account.user.id
        });

    if (error) {
        budgetMessage.textContent = error.message;
    } else {
        budgetMessage.textContent = "Budget created successfully!";
        budgetForm.reset();
        loadBudgets();
    }

});


// Run functions
async function initializeBudgetPage() {

    const account = await checkUserRole();

    if (account) {
        await loadBudgets();
    }

}

initializeBudgetPage();

// Logout
document.getElementById("logoutButton")
    .addEventListener("click", async function() {

        const { error } = await supabaseClient.auth.signOut();

        if (error) {
            document.getElementById("logoutMessage").textContent =
                error.message;
        } else {
            window.location.href = "index.html";
        }

    });