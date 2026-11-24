
// Treasurer Dashboard
const message = document.getElementById("message");
const expenseRecords = document.getElementById("expenseRecords");
const logoutButton = document.getElementById("logoutButton");


// Check whether the current user is a Treasurer
async function checkTreasurer() {

    const { data: userData, error: userError } =
        await supabaseClient.auth.getUser();

    if (userError || !userData.user) {
        window.location.href = "index.html";
        return false;
    }

    const { data: profile, error: profileError } =
        await supabaseClient
            .from("profiles")
            .select("role")
            .eq("user_id", userData.user.id)
            .single();

    if (profileError || !profile) {
        message.textContent = "Unable to load user profile.";
        return false;
    }

    if (profile.role !== "treasurer") {
        message.textContent = "Access denied. Treasurer only.";
        expenseRecords.innerHTML = "";
        return false;
    }

    return true;
}


// Load Financial Overview
async function loadFinancialOverview() {

    const { data: incomes, error: incomeError } =
        await supabaseClient
            .from("Income")
            .select("amount");

    if (incomeError) {
        message.textContent = incomeError.message;
        return;
    }

    const { data: expenses, error: expenseError } =
        await supabaseClient
            .from("Expenses")
            .select("amount, status");

    if (expenseError) {
        message.textContent = expenseError.message;
        return;
    }

    // Calculate total income
    const totalIncome = incomes.reduce(function(total, income) {
        return total + Number(income.amount);
    }, 0);

    // Calculate approved expenses only
    const approvedExpenses = expenses
        .filter(expense => expense.status === "Approved")
        .reduce(function(total, expense) {
            return total + Number(expense.amount);
        }, 0);

    // Calculate club balance
    const clubBalance = totalIncome - approvedExpenses;

    // Display financial overview
    document.getElementById("clubBalance").textContent =
        "RM " + clubBalance.toFixed(2);

    document.getElementById("totalIncome").textContent =
        "RM " + totalIncome.toFixed(2);

    document.getElementById("totalExpenses").textContent =
        "RM " + approvedExpenses.toFixed(2);

}


// Load all expense claims
async function loadExpenses() {

    expenseRecords.innerHTML = `
        <tr>
            <td colspan="8">Loading expenses...</td>
        </tr>
    `;

    const { data: expenses, error } = await supabaseClient
        .from("Expenses")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        message.textContent = error.message;
        return;
    }

    if (expenses.length === 0) {
        expenseRecords.innerHTML = `
            <tr>
                <td colspan="8">No expense claims found.</td>
            </tr>
        `;
        return;
    }

    // Get member profiles
    const userIds = [...new Set(
        expenses.map(expense => expense.user_id)
    )];

    const { data: profiles, error: profileError } =
        await supabaseClient
            .from("profiles")
            .select("user_id, full_name")
            .in("user_id", userIds);

    if (profileError) {
        message.textContent = profileError.message;
        return;
    }

    // Match member names with expenses
    const profileMap = {};

    profiles.forEach(function(profile) {
        profileMap[profile.user_id] = profile.full_name;
    });

    expenseRecords.innerHTML = "";

    // Display each expense
    expenses.forEach(function(expense) {

        const row = document.createElement("tr");

        const memberCell = document.createElement("td");
        const descriptionCell = document.createElement("td");
        const amountCell = document.createElement("td");
        const categoryCell = document.createElement("td");
        const dateCell = document.createElement("td");
        const receiptCell = document.createElement("td");
        const statusCell = document.createElement("td");
        const actionCell = document.createElement("td");

        memberCell.textContent =
            profileMap[expense.user_id] || "Unknown";

        descriptionCell.textContent = expense.description;
        amountCell.textContent =
            "RM " + Number(expense.amount).toFixed(2);
        categoryCell.textContent = expense.category;
        dateCell.textContent = expense.expense_date;
        statusCell.textContent = expense.status || "Pending";

        // View receipt
        const receiptLink = document.createElement("a");
        receiptLink.textContent = "View Receipt";
        receiptLink.href = "#";

        receiptLink.addEventListener("click", async function(event) {

            event.preventDefault();

            const { data, error } = await supabaseClient
                .storage
                .from("Receipts")
                .createSignedUrl(expense.receipt_path, 60);

            if (error) {
                message.textContent = error.message;
                return;
            }

            window.open(data.signedUrl, "_blank");

        });

        receiptCell.appendChild(receiptLink);

        // Approve button
        const approveButton = document.createElement("button");
        approveButton.textContent = "Approve";

        approveButton.addEventListener("click", function() {
            updateStatus(expense.expense_id, "Approved");
        });

        // Reject button
        const rejectButton = document.createElement("button");
        rejectButton.textContent = "Reject";

        rejectButton.addEventListener("click", function() {
            updateStatus(expense.expense_id, "Rejected");
        });

        // Disable buttons if expense is already processed
        approveButton.disabled = expense.status !== "Pending";
        rejectButton.disabled = expense.status !== "Pending";

        approveButton.style.marginRight = "10px";

        actionCell.appendChild(approveButton);
        actionCell.appendChild(rejectButton);

        row.appendChild(memberCell);
        row.appendChild(descriptionCell);
        row.appendChild(amountCell);
        row.appendChild(categoryCell);
        row.appendChild(dateCell);
        row.appendChild(receiptCell);
        row.appendChild(statusCell);
        row.appendChild(actionCell);

        expenseRecords.appendChild(row);

    });

}


// Update expense status
async function updateStatus(expenseId, newStatus) {

    message.textContent = "Updating expense status...";

    const { error } = await supabaseClient
        .from("Expenses")
        .update({ status: newStatus })
        .eq("expense_id", expenseId);

    if (error) {
        message.textContent = error.message;
        return;
    }

    message.textContent =
        "Expense status updated to " + newStatus + ".";

    await loadExpenses();
    await loadFinancialOverview();

}


// Logout
logoutButton.addEventListener("click", async function() {

    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        message.textContent = error.message;
    } else {
        window.location.href = "index.html";
    }

});


// Initialize Treasurer Dashboard
async function initializeTreasurerPage() {

    const isTreasurer = await checkTreasurer();

    if (isTreasurer) {
        await loadExpenses();
        await loadFinancialOverview();
    }

}

initializeTreasurerPage();
