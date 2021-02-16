const Modal = {
    open() {
        // Open the "Modal" and add the "active" class to the modal
        document.querySelector('.modal-overlay').classList.add('active')
    },
    close() {
        // Close the "Modal" and remove the "active" class from the modal
        document.querySelector('.modal-overlay').classList.remove('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transaction")) || []
    },
    set(transactions) {
        localStorage.setItem("dev.finances:transaction", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),
    add(transaction) {
        Transaction.all.push(transaction)
        App.reload()
    },
    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },
    incomes() {
        // Sum all incomes
        let income = 0

        Transaction.all.forEach(
            (transaction) => {
                if (transaction.amount > 0) {
                    income += transaction.amount
                }
            }
        )

        return income;
    },
    expenses() {
        // Sum all expenses
        let expense = 0

        Transaction.all.forEach(
            (transaction) => {
                if (transaction.amount < 0) {
                    expense += transaction.amount
                }
            }
        )

        return expense
    },
    total() {
        // incomes - expenses
        let total = Number(Transaction.incomes()) + Number(Transaction.expenses())

        return total
    }
}

const DOM = {
    transactionsContainer:document.querySelector('#transactions-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ?'income':'expense'

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td class="button-remove" title="Remover Transação">
            <img src="assets/minus.svg" alt="Remover Transação" onclick="Transaction.remove(${index})">
        </td>
        `
        return html
    },
    updateBalance() {
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total())
    },
    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ''
    }
}

const Utils = {
    formatAmount(amount) {
        amount = Number(amount) * 100

        return Math.round(amount)
    },
    formatDate(date) {
        const splittedDate = date.split("-")
        
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },
    formatCurrency(value) {
        const signal = Number(value) < 0 ? '-':''
        value = String(value).replace(/\D/g, '')
        value = Number(value) / 100
        value = value.toLocaleString('pt-BR', {
            style: "currency",
            currency: "BRL"
        })


        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields() {
        const { description, amount, date } = Form.getValues()
        
        if (description.trim() === "" || 
        amount.trim() === "" || 
        date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos!!")
        }
    },
    formatData() {
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)
        
        return {
            description,
            amount,
            date
        }
    },
    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },
    submit(event) {
        event.preventDefault()


        try {
            // Receive, validate and format the Data,
            // add the transaction, clear the fields,
            // close the modal, and reload the app.

            Form.validateFields()
            const transaction = Form.formatData()
            Transaction.add(transaction)
            Form.clearFields()
            Modal.close()
        } catch (error) {
            alert(error.message)
        }
        
    }
}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)
        DOM.updateBalance()
        Storage.set(Transaction.all)
    },
    reload(){
        DOM.clearTransactions()
        App.init()
    }
}


App.init()