const form = document.getElementById("transaction-form");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const notesInput = document.getElementById("notes");

const transactionList = document.getElementById("transaction-list");

const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income-total");
const expenseEl = document.getElementById("expense-total");

let limit = 20000;

let categoryData = {};
let incomeTotal = 0;
let expenseTotal = 0;

let chart = null;


form.addEventListener("submit", function (e) {
    e.preventDefault();

    const amount = parseFloat(amountInput.value);
    const type = typeInput.value;
    const category = categoryInput.value.trim();
    const date = dateInput.value;
    const notes = notesInput.value;

    if (isNaN(amount) || amount <= 0 || category === "") {
        alert("Please enter valid details");
        return;
    }

    const li = document.createElement("li");

    if (type === "Income") {
        li.classList.add("plus");
        incomeTotal += amount;
        incomeEl.textContent = incomeTotal;
    } else {
        li.classList.add("minus");
        expenseTotal += amount;
        expenseEl.textContent = expenseTotal;

        if (!categoryData[category]) {
            categoryData[category] = 0;
        }
        categoryData[category] += amount;
    }

    li.innerHTML = `
        ${category} : ₹${amount} <br>
        Date: ${date || "N/A"} <br>
        Notes: ${notes || "N/A"}
    `;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = " X";
    deleteBtn.style.marginLeft = "10px";

    deleteBtn.addEventListener("click", function () {
        transactionList.removeChild(li);

        if (type === "Income") {
            incomeTotal -= amount;
            incomeEl.textContent = incomeTotal;
        } else {
            expenseTotal -= amount;
            expenseEl.textContent = expenseTotal;

            categoryData[category] -= amount;

            if (categoryData[category] <= 0) {
                delete categoryData[category];
            }
        }

        updateAll();
    });

    li.appendChild(deleteBtn);
    transactionList.appendChild(li);

    checkLimit();
    updateAll();

    form.reset();
});


function updateAll() {
    updateBalance();
    updateCategoryUI();
    updateCategoryCards();
    updateChart(); 
}

function updateBalance() {
    balanceEl.textContent = incomeTotal - expenseTotal;
}


function checkLimit() {
    if (expenseTotal > limit) {
        alert("⚠ Warning! You crossed your expense limit!");
    }
}


function updateCategoryUI() {
    let summary = "";

    for (let key in categoryData) {
        summary += key + ": ₹" + categoryData[key] + "<br>";
    }

    let el = document.getElementById("category-summary");
    if (el) {
        el.innerHTML = summary || "No data yet";
    }
}


function updateCategoryCards() {
    const container = document.getElementById("category-cards");
    if (!container) return;

    container.innerHTML = "";

    for (let key in categoryData) {
        const div = document.createElement("div");
        div.classList.add("card");

        div.innerHTML = `
            <h3>${key}</h3>
            <p>₹ ${categoryData[key]}</p>
        `;

        container.appendChild(div);
    }
}


function updateChart() {
    const canvas = document.getElementById("myChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const labels = Object.keys(categoryData);
    const data = Object.values(categoryData);

    if (labels.length === 0) return;

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: labels,
            datasets: [{
                data: data
            }]
        }
    });
}


function downloadData() {
    let data = "Income: " + incomeTotal + "\nExpense: " + expenseTotal + "\n\nCategory:\n";

    for (let key in categoryData) {
        data += key + ": ₹" + categoryData[key] + "\n";
    }

    let blob = new Blob([data], { type: "text/plain" });
    let link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = "expense_data.txt";
    link.click();
}
