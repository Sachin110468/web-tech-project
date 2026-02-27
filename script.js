const form = document.getElementById("transaction-form");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");

const transactionList = document.getElementById("transaction-list");

const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income-total");
const expenseEl = document.getElementById("expense-total");

let incomeTotal = 0;
let expenseTotal = 0;

form.addEventListener("submit", function (e) {
    e.preventDefault();

    const amount = parseFloat(amountInput.value);
    const type = typeInput.value;
    const category = categoryInput.value.trim();

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
    }

    li.innerHTML = `${category} : ₹${amount}`;

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
        }

        updateBalance();
    });

    li.appendChild(deleteBtn);
    transactionList.appendChild(li);

    updateBalance();
    form.reset();
});

function updateBalance() {
    const balance = incomeTotal - expenseTotal;
    balanceEl.textContent = balance;
}
