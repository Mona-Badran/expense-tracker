document.addEventListener('DOMContentLoaded', () => {
    const transactionForm = document.getElementById('transaction-form');
    const transactionList = document.getElementById('transaction-list');
    const totalBudget = document.getElementById('total-budget');
    const filters = {
        minAmount: document.getElementById('min-amount'),
        maxAmount: document.getElementById('max-amount'),
        type: document.getElementById('filter-type'),
        date: document.getElementById('filter-date'),
        notes: document.getElementById('filter-notes')
    };
    const applyFiltersButton = document.getElementById('apply-filters');

    // Retrieve transactions from local storage or initialize an empty array
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    // Save transactions to local storage
    function saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    function renderTransactions() {
        transactionList.innerHTML = '';
        const filteredTransactions = transactions.filter(transaction => {
            const minAmount = filters.minAmount.value ? parseFloat(filters.minAmount.value) : -Infinity;
            const maxAmount = filters.maxAmount.value ? parseFloat(filters.maxAmount.value) : Infinity;
            const type = filters.type.value;
            const date = filters.date.value;
            const notes = filters.notes.value.toLowerCase();
            return transaction.amount >= minAmount &&
                transaction.amount <= maxAmount &&
                (type === 'all' || transaction.type === type) &&
                (!date || transaction.date === date) &&
                transaction.description.toLowerCase().includes(notes);
        });
        filteredTransactions.forEach(transaction => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${transaction.description} - $${transaction.amount} (${transaction.type}) on ${transaction.date}
                <button class="edit-btn" data-id="${transaction.id}">Edit</button>
                <button class="delete-btn" data-id="${transaction.id}">Delete</button>
            `;
            transactionList.appendChild(li);
        });

        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const id = parseInt(event.target.getAttribute('data-id'));
                editTransaction(id);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const id = parseInt(event.target.getAttribute('data-id'));
                deleteTransaction(id);
            });
        });

        const total = transactions.reduce((acc, transaction) => {
            return transaction.type === 'income' ? acc + transaction.amount : acc - transaction.amount;
        }, 0);
        totalBudget.textContent = `Total Budget: $${total}`;
    }

    function addTransaction(event) {
        // Prevent the form from submitting, this is a single page application, we don't want to reload the page or submit the form or redirect the user to another page
        event.preventDefault();
        const description = document.getElementById('description').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const type = document.getElementById('type').value;
        const date = document.getElementById('date').value;

        // Transaction object
        const transaction = {
            id: Date.now(), // Unique identifier for the transaction (using the current timestamp)
            description,
            amount,
            type,
            date
        };

        // Add the transaction to the transactions array, save the transactions to local storage, render the transactions, and reset the form
        transactions.push(transaction);
        saveTransactions();
        renderTransactions();
        transactionForm.reset();
    }

    function editTransaction(id) {
        const transaction = transactions.find(transaction => transaction.id === id); // Find the transaction by ID
        if (transaction) {
            // Populate the form with the transaction data to update
            document.getElementById('description').value = transaction.description;
            document.getElementById('amount').value = transaction.amount;
            document.getElementById('type').value = transaction.type;
            document.getElementById('date').value = transaction.date;

            // Delete the old transaction from the transactions array
            // this is so that we can add the updated transaction as a new transaction to simplify the process
            deleteTransaction(id);
        }
    }

    function deleteTransaction(id) {
        transactions = transactions.filter(transaction => transaction.id !== id);
        saveTransactions();
        renderTransactions();
    }

    transactionForm.addEventListener('submit', addTransaction); // Add a new transaction when the user submits the form
    applyFiltersButton.addEventListener('click', renderTransactions); // Apply filters when the user clicks the "Apply Filters" button

    renderTransactions();
});