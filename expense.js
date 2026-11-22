// Expense Submission page
const expenseForm = document.getElementById("expenseForm");
const expenseMessage = document.getElementById("expenseMessage");
const expenseAmountInput = document.getElementById("expenseAmount");
const expenseDescriptionInput = document.getElementById("expenseDescription");
const expenseCategoryInput = document.getElementById("expenseCategory");
const expenseDateInput = document.getElementById("expenseDate");
const receiptInput = document.getElementById("receipt");

// Handle Expense Submission
expenseForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const amount = expenseAmountInput.value;
    const description = expenseDescriptionInput.value;
    const category = expenseCategoryInput.value;
    const date = expenseDateInput.value;
    const receiptFile = receiptInput.files[0];

    // Check empty fields
    if (amount === "" || description === "" ||category === "" ||date === "" ||!receiptFile)
    {
        expenseMessage.textContent = "Please fill in all fields and upload a receipt.";
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
        expenseMessage.textContent = "Expense submitted successfully!";
        expenseForm.reset();
    }
});
