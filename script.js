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



function loadData() {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        alert("Login first");
        window.location.href = "login.html";
        return;
    }

    fetch(`http://localhost:5000/data/${userId}`)
        .then(res => res.json())
        .then(data => {

            transactionList.innerHTML = "";
            categoryData = {};
            incomeTotal = 0;
            expenseTotal = 0;

            if (data.length === 0) {
                transactionList.innerHTML = "<p>No transactions yet</p>";
            }

            data.forEach(item => {
                addToUI(item);
            });

            updateAll();
        })
        .catch(err => {
            console.log(err);
            alert("Error loading data");
        });
}

loadData();



form.addEventListener("submit", function (e) {
    e.preventDefault();

    const userId = localStorage.getItem("userId");

    const amount = parseFloat(amountInput.value);
    const type = typeInput.value;
    const category = categoryInput.value.trim();
    const date = dateInput.value;
    const notes = notesInput.value;

    if (isNaN(amount) || amount <= 0 || category === "") {
        alert("Please enter valid details");
        return;
    }

    const newData = { userId, amount, type, category, date, notes };

    fetch("http://localhost:5000/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newData)
    })
    .then(res => res.json())
    .then(() => {
        loadData();
    })
    .catch(err => console.log(err));

    form.reset();
});



function addToUI(data) {
    const { id, amount, type, category, date, notes } = data;

    const li = document.createElement("li");

    if (type === "Income") {
        li.classList.add("plus");
        incomeTotal += Number(amount);
    } else {
        li.classList.add("minus");
        expenseTotal += Number(amount);

        if (!categoryData[category]) {
            categoryData[category] = 0;
        }
        categoryData[category] += Number(amount);
    }

    li.innerHTML = `
        <strong>${category}</strong> : ₹${amount} <br>
        <small>Date: ${date || "N/A"}</small><br>
        <small>Notes: ${notes || "N/A"}</small>
    `;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "X";
    deleteBtn.style.marginLeft = "10px";

    deleteBtn.addEventListener("click", function () {
        fetch(`http://localhost:5000/delete/${id}`, {
            method: "DELETE"
        })
        .then(res => res.json())
        .then(() => {
            loadData();
        })
        .catch(err => console.log(err));
    });

    li.appendChild(deleteBtn);
    transactionList.appendChild(li);
}


function updateAll() {
    updateBalance();
    updateCategoryUI();
    updateCategoryCards();
    updateChart();
    checkLimit();
}



function updateBalance() {
    balanceEl.textContent = incomeTotal - expenseTotal;
    incomeEl.textContent = incomeTotal;
    expenseEl.textContent = expenseTotal;
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

    if (labels.length === 0) {
        if (chart) chart.destroy();
        return;
    }

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
