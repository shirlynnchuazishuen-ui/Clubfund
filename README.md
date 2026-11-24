ClubFund

*Club Budget and Expense Tracker*

1. Project Overview

ClubFund is a web-based application designed to help university clubs manage their finances more efficiently. It allows club members to submit expense claims and track their reimbursement status while treasurers can manage club budgets, record income and monitor expenses.
The system aims to improve financial transparency, simplify expense management, and provide a centralized platform for tracking club finances.

2. Features

Authentication and User Roles
- User registration and login.
- Role-based access for Club Members and Treasurers.
- Different dashboard access based on user roles.

Club Member
- Submit new expense claims.
- Upload receipts as supporting documents.
- Select the relevant budget for each expense.
- View personal expense records.
- Track expense claim status.

Treasurer
- View submitted expense claims from members.
- Review uploaded receipts.
- Approve or reject expense claims.
- Create and manage club budgets.
- View available budgets.
- Record incoming funds, such as sponsorships, allocations, and donations.
- Monitor total income, approved expenses, and club balance.

3. Technologies Used
HTML  Structure of the web pages
CSS   Styling and responsive layout
JavaScript Frontend functionality and interactions
Supabase Backend services, authentication, and database 
GitHub  Version control and project repository 
Visual Studio Code  Development environment 

4. System Requirements
- A modern web browser.
- Visual Studio Code.
- Internet connection.
- A Supabase project.

5. Installation and Setup
Step 1: Clone the Repository
Clone the repository to your local machine:

git clone YOUR_REPOSITORY_URL

Navigate to the project folder:
cd ClubFund

Step 2: Configure Supabase
1. Create or access a Supabase project.
2. Configure the required database tables and Row Level Security (RLS) policies.
3. Create the private `Receipts` storage bucket and configure its access policies.
4. Update `supabaseClient.js` with your Supabase Project URL and Publishable Key.

**Note:** Do not expose your Supabase Secret Key or service_role key in frontend code.

Step 3: Run the Application
1. Open the project folder in Visual Studio Code.
2. Install the Live Server extension if it is not already installed.
3. Right-click `index.html`.
4. Select **Open with Live Server**.

The application will open in your default web browser.

6. Project Structure
ClubFund/
│
├── index.html
├── register.html
├── dashboard.html
├── expense.html
├── budget.html
├── income.html
├── treasurer.html
│
├── style.css
│
├── script.js
├── register.js
├── dashboard.js
├── expense.js
├── budget.js
├── income.js
├── treasurer.js
│
├── supabaseClient.js
│
└── README.md
```

7. User Roles
Club Member->Submit expense claims, upload receipts, and view personal expense records

Treasurer->Manage budgets, record income, and review and manage expense claims


8. Financial Calculations
ClubFund tracks club finances using the following calculations:

**Club Balance**
Total Income − Total Approved Expenses

**Budget Balance**
Allocated Budget − Total Approved Expenses Linked to That Budget

Pending and rejected expense claims are not included in approved expense totals.

9. Project Status
ClubFund is developed as part of a university project. Features and improvements may be added as development continues.