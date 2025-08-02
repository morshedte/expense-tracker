const CATEGORIES = ["food", "transport", "entertainment", "utilities", "other"];
const CONFIG = { currency: "$" };
let expenses = [];
let nextId = 1;
var lastAction = null;

const validateInput = (input, type) => {
  if (type === "amount") {
    if (isNaN(input) || Number(input) <= 0) {
      console.error("Error: Amount must be a positive number");
      return false;
    }
    return true;
  }
  if (type === "category") {
    if (!CATEGORIES.includes(input.toLowerCase().trim())) {
      console.error(`Error: Category must be one of: ${CATEGORIES.join(", ")}`);
      return false;
    }
    return true;
  }
  if (type === "id") {
    if (!expenses.some(e => e.id === Number(input))) {
      console.error("Error: Expense ID not found");
      return false;
    }
    return true;
  }
  return true;
};

function formatCurrency(amount) {
  return `${CONFIG.currency}${Number(amount).toFixed(2)}`;
}

const getDateString = (date = new Date()) => {
  return date.toISOString().slice(0, 10);
};

function showMenu() {
  console.log("\n=== EXPENSE TRACKER ===");
  console.log("1. Add Expense");
  console.log("2. View All Expenses");
  console.log("3. View by Category");
  console.log("4. Calculate Total");
  console.log("5. Remove Expense");
  console.log("6. Generate Report");
  console.log("7. Exit");
}

const addExpense = (amount, category, description = "") => {
  if (!validateInput(amount, "amount") || !validateInput(category, "category")) return;
  const expense = {
    id: nextId++,
    amount: Number(amount),
    category: category.trim().toLowerCase(),
    description: description.trim(),
    date: getDateString(),
  };
  expenses.push(expense);
  lastAction = `Added expense ID ${expense.id}`;
  console.log(`Expense added successfully! ID: ${expense.id}`);
};

function removeExpense(id) {
  if (!validateInput(id, "id")) return;
  expenses = expenses.filter(e => e.id !== Number(id));
  lastAction = `Removed expense ID ${id}`;
  console.log(`Expense ID ${id} removed.`);
}

const editExpense = (id, ...updates) => {
  if (!validateInput(id, "id")) return;
  const expense = expenses.find(e => e.id === Number(id));
  if (!expense) return;
  updates.forEach(update => {
    if (update.amount !== undefined && validateInput(update.amount, "amount")) expense.amount = Number(update.amount);
    if (update.category !== undefined && validateInput(update.category, "category")) expense.category = update.category.trim().toLowerCase();
    if (update.description !== undefined) expense.description = update.description.trim();
  });
  lastAction = `Edited expense ID ${id}`;
  console.log(`Expense ID ${id} updated.`);
};

function calculateTotal(category = null) {
  let filtered = category ? expenses.filter(e => e.category === category.trim().toLowerCase()) : expenses;
  let total = filtered.reduce((sum, e) => sum + e.amount, 0);
  console.log(`Total${category ? ` for ${category}` : ""}: ${formatCurrency(total)}`);
  return total;
}

const filterExpenses = (criteria) => {
  return expenses.filter(e => {
    let match = true;
    if (criteria.category) match = match && e.category === criteria.category.trim().toLowerCase();
    if (criteria.min) match = match && e.amount >= Number(criteria.min);
    if (criteria.max) match = match && e.amount <= Number(criteria.max);
    if (criteria.date) match = match && e.date === criteria.date;
    return match;
  });
};

function generateReport() {
  if (expenses.length === 0) {
    console.warn("No expenses to report.");
    return;
  }
  const month = new Date().toLocaleString("default", { month: "long" });
  const year = new Date().getFullYear();
  console.log(`\nEXPENSE REPORT - ${month} ${year}\n================================`);
  CATEGORIES.forEach(cat => {
    const catExpenses = expenses.filter(e => e.category === cat);
    if (catExpenses.length > 0) {
      const total = catExpenses.reduce((sum, e) => sum + e.amount, 0);
      console.log(`${cat.toUpperCase()}: ${formatCurrency(total)} (${catExpenses.length} expenses)`);
    }
  });
  console.log("================================");
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const avg = total / expenses.length;
  console.log(`TOTAL: ${formatCurrency(total)} (${expenses.length} expenses)`);
  console.log(`AVERAGE: ${formatCurrency(avg)} per expense`);
}

function viewAllExpenses() {
  if (expenses.length === 0) {
    console.warn("No expenses recorded.");
    return;
  }
  console.log("All Expenses:");
  expenses.forEach(e => {
    console.log(`ID: ${e.id} | ${formatCurrency(e.amount)} | ${e.category.toUpperCase()} | ${e.description} | ${e.date}`);
  });
  calculateTotal();
}

function viewByCategory(category) {
  if (!validateInput(category, "category")) return;
  const filtered = expenses.filter(e => e.category === category.trim().toLowerCase());
  if (filtered.length === 0) {
    console.warn(`No expenses found for category: ${category}`);
    return;
  }
  console.log(`\n${category.toUpperCase()} Expenses:`);
  filtered.forEach(e => {
    console.log(`ID: ${e.id} | ${formatCurrency(e.amount)} | ${e.description} | ${e.date}`);
  });
  const total = filtered.reduce((sum, e) => sum + e.amount, 0);
  console.log(`Category Total: ${formatCurrency(total)}`);
}

function startExpenseTrackerBrowser() {
  let running = true;
  while (running) {
    showMenu();
    let choice = prompt("Choose option (1-7):");
    if (!choice) break;
    switch (choice.trim()) {
      case "1":
        let amount = prompt("Enter amount:");
        let category = prompt(`Enter category (${CATEGORIES.join(", ")})`);
        let desc = prompt("Enter description (optional):");
        addExpense(amount, category, desc);
        break;
      case "2":
        viewAllExpenses();
        break;
      case "3":
        let cat = prompt(`Enter category (${CATEGORIES.join(", ")})`);
        viewByCategory(cat);
        break;
      case "4":
        let cat2 = prompt("Enter category for total (leave blank for all):");
        calculateTotal(cat2);
        break;
      case "5":
        let id = prompt("Enter expense ID to remove:");
        removeExpense(id);
        break;
      case "6":
        generateReport();
        break;
      case "7":
        running = false;
        console.log("Exiting Expense Tracker. Goodbye!");
        break;
      default:
        console.warn("Invalid option. Please choose 1-7.");
    }
  }
}

function startExpenseTrackerNode() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  function ask(question) {
    return new Promise(resolve => rl.question(question, answer => resolve(answer)));
  }

  async function mainMenu() {
    let running = true;
    while (running) {
      showMenu();
      let choice = await ask("Choose option (1-7): ");
      if (!choice) break;
      switch (choice.trim()) {
        case "1":
          let amount = await ask("Enter amount: ");
          let category = await ask(`Enter category (${CATEGORIES.join(", ")}) : `);
          let desc = await ask("Enter description (optional): ");
          addExpense(amount, category, desc);
          break;
        case "2":
          viewAllExpenses();
          break;
        case "3":
          let cat = await ask(`Enter category (${CATEGORIES.join(", ")}) : `);
          viewByCategory(cat);
          break;
        case "4":
          let cat2 = await ask("Enter category for total (leave blank for all): ");
          calculateTotal(cat2);
          break;
        case "5":
          let id = await ask("Enter expense ID to remove: ");
          removeExpense(id);
          break;
        case "6":
          generateReport();
          break;
        case "7":
          running = false;
          console.log("Exiting Expense Tracker. Goodbye!");
          break;
        default:
          console.warn("Invalid option. Please choose 1-7.");
      }
    }
    rl.close();
  }
  mainMenu();
}

if (typeof window !== 'undefined' && typeof window.prompt === 'function') {
  window.startExpenseTracker = startExpenseTrackerBrowser;
} else if (typeof require === 'function' && typeof process !== 'undefined') {
  if (require.main === module) {
    startExpenseTrackerNode();
  }
}

