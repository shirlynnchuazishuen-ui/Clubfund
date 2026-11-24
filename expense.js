// Expense Submission page
async function checkUserRole() {
    const { data: userData, error: userError } =
        await supabaseClient.auth.getUser();

    if (userError || !userData.user) {
        window.location.href = "index.html";
        return;
    }

    const { data: profile, error } = await supabaseClient
        .from("profiles")
        .select("role")
        .eq("user_id", userData.user.id)
        .single();

    if (error || !profile) {
        console.error("Unable to load user role:", error);
        return;
    }

    const incomeNavLink = document.getElementById("incomeNavLink");
    const dashboardNavLink = document.getElementById("dashboardNavLink");

    console.log("Current user role:", profile.role);

    if (profile.role === "treasurer"){
        incomeNavLink.style.display = "";
        dashboardNavLink.href = "treasurer.html";
    } else {
        incomeNavLink.style.display = "none";
        dashboardNavLink.href = "dashboard.html";
    }
}

const expenseForm = document.getElementById("expenseForm");
const expenseMessage = document.getElementById("expenseMessage");
const expenseAmountInput = document.getElementById("expenseAmount");
const expenseDescriptionInput = document.getElementById("expenseDescription");
const expenseCategoryInput = document.getElementById("expenseCategory");
const expenseBudgetInput = document.getElementById("expenseBudget");
const expenseDateInput = document.getElementById("expenseDate");
const receiptInput = document.getElementById("receipt");

// Check user role and update sidebar
async function checkUserRole() {
    const { data: userData, error: userError } =
        await supabaseClient.auth.getUser();

    if (userError || !userData.user) {
        window.location.href = "index.html";
        return;
    }

    const { data: profile, error } = await supabaseClient
        .from("profiles")
        .select("role")
        .eq("user_id", userData.user.id)
        .single();

    if (error || !profile) {
        console.error("Unable to load user role:", error);
        return;
    }

    const incomeNavLink = document.getElementById("incomeNavLink");
    const dashboardNavLink = document.getElementById("dashboardNavLink");

    if (profile.role === "treasurer") {
        incomeNavLink.style.display = "";
        dashboardNavLink.href = "treasurer.html";
    } else {
        incomeNavLink.style.display = "none";
        dashboardNavLink.href = "dashboard.html";
    }
}

// Load available budgets from Supabase
async function loadBudgets() {
    expenseBudgetInput.innerHTML =
        '<option value="">Loading budgets...</option>';

    const { data: budgets, error } = await supabaseClient
        .from("Budgets")
        .select("budget_id, budget_name")
        .order("budget_name", { ascending: true });

    if (error) {
        expenseBudgetInput.innerHTML =
            '<option value="">Unable to load budgets</option>';

        expenseMessage.textContent = error.message;
        return;
    }

    expenseBudgetInput.innerHTML =
        '<option value="">Select budget</option>';

    if (budgets.length === 0) {
        expenseBudgetInput.innerHTML =
            '<option value="">No budgets available</option>';

        expenseMessage.textContent =
            "No budgets available. Please contact the Treasurer.";

        return;
    }

    budgets.forEach(function(budget) {
        const option = document.createElement("option");

        option.value = budget.budget_id;
        option.textContent = budget.budget_name;

        expenseBudgetInput.appendChild(option);
    });
}

// Handle Expense Submission
expenseForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const amount = expenseAmountInput.value;
    const description = expenseDescriptionInput.value;
    const category = expenseCategoryInput.value;
    const budgetId = expenseBudgetInput.value;
    const date = expenseDateInput.value;
    const receiptFile = receiptInput.files[0];

    // Check empty fields
    if (
        amount === "" ||
        description === "" ||
        category === "" ||
        budgetId === "" ||
        date === "" ||
        !receiptFile
    ) {
        expenseMessage.textContent =
            "Please fill in all fields and upload a receipt.";
        return;
    }

    // Check current user
    const { data: userData, error: userError } =
        await supabaseClient.auth.getUser();

    if (userError || !userData.user) {
        expenseMessage.textContent = "Please log in first.";
        return;
    }

    const user = userData.user;

    // Upload receipt
    const fileName = Date.now() + "-" + receiptFile.name;
    const filePath = user.id + "/" + fileName;

    const { error: uploadError } = await supabaseClient
        .storage
        .from("Receipts")
        .upload(filePath, receiptFile);

    if (uploadError) {
        expenseMessage.textContent = uploadError.message;
        return;
    }

    // Save expense information
    const { error: insertError } = await supabaseClient
        .from("Expenses")
        .insert({
            user_id: user.id,
            amount: Number(amount),
            description: description,
            category: category,
            budget_id: Number(budgetId),
            expense_date: date,
            status: "Pending",
            receipt_path: filePath
        });

    if (insertError) {
        // Remove uploaded receipt if saving expense fails
        await supabaseClient.storage
            .from("Receipts")
            .remove([filePath]);

        expenseMessage.textContent = insertError.message;
    } else {
        expenseMessage.textContent =
            "Expense submitted successfully!";

        expenseForm.reset();
    }
});

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

// Initialize page
checkUserRole();
loadBudgets();