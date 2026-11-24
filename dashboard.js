// Dashboard page
const logoutButton = document.getElementById("logoutButton");
const logoutMessage = document.getElementById("logoutMessage");

const expenseRecords = document.getElementById("expenseRecords");
const expenseRecordsMessage = document.getElementById("expenseRecordsMessage");

// Handle Logout
logoutButton.addEventListener("click", async function() {

    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        logoutMessage.textContent = error.message;
    } else {
        window.location.href = "index.html";
    }

});

const budgetDropdown = document.getElementById("budgetDropdown");
const budgetMenu = document.getElementById("budgetMenu");

budgetDropdown.addEventListener("click", function() {
    budgetMenu.classList.toggle("show");
});

// Load Expense Records
async function loadExpenses() {

    expenseRecords.innerHTML = `
        <tr>
            <td colspan="5">Loading expenses...</td>
        </tr>
    `;

    // Get current user
    const { data: userData, error: userError } =
        await supabaseClient.auth.getUser();

    if (userError || !userData.user) {
        expenseRecordsMessage.textContent = "Please log in first.";
        return;
    }

    // Get user's expenses from Supabase
    const { data: expenses, error } = await supabaseClient
        .from("Expenses")
        .select("description, amount, category, expense_date, status")
        .eq("user_id", userData.user.id)
        .order("expense_date", { ascending: false });

    if (error) {
        expenseRecordsMessage.textContent = error.message;
        return;
    }

    // Check whether records exist
    if (expenses.length === 0) {
        expenseRecords.innerHTML = `
            <tr>
                <td colspan="5">No expense records found.</td>
            </tr>
        `;
        return;
    }

    // Display expense records
    expenseRecords.innerHTML = "";

    expenses.forEach(function(expense) {

        const row = document.createElement("tr");

        const descriptionCell = document.createElement("td");
        const amountCell = document.createElement("td");
        const categoryCell = document.createElement("td");
        const dateCell = document.createElement("td");
        const statusCell = document.createElement("td");

        descriptionCell.textContent = expense.description;
        amountCell.textContent = "RM " + expense.amount;
        categoryCell.textContent = expense.category;
        dateCell.textContent = expense.expense_date;
        statusCell.textContent = expense.status || "Pending";

        row.appendChild(descriptionCell);
        row.appendChild(amountCell);
        row.appendChild(categoryCell);
        row.appendChild(dateCell);
        row.appendChild(statusCell);

        expenseRecords.appendChild(row);
    });

}

// Run function
loadExpenses();

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
