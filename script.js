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
    },
    getSearches() {
        return JSON.parse(localStorage.getItem("dev.finances:searches")) || []
    },
    setSearches(search) {
        localStorage.setItem("dev.finances:searches", JSON.stringify(search))
    },
    getTheme() {
        return localStorage.getItem("dev.finances:theme") || ""
    },
    setTheme(theme) {
        localStorage.setItem("dev.finances:theme", theme)
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
    },
    pieChartsFromLocalStorage(arrayWithObjects=Storage.get(), option="total") {
        let auxiliarArray;
        let arrayToExportAll = ([
            ['Descrição', 'Valor'],
        ])
    
    
        for (let objectOfArray of arrayWithObjects) {
            const objectDescription = objectOfArray.description
            const objectAmount = objectOfArray.amount
                
            auxiliarArray = [String(objectDescription), Number(objectAmount)/100]
                
            arrayToExportAll.push(auxiliarArray.slice())        
            auxiliarArray.splice(0, 2)
        }
    
        function arrayToExportAllTransactions () {
            return arrayToExportAll
        }
    
        function arrayToExportIncomes () {
            let arraySlice = arrayToExportAll.slice(0)
            let arrayIncomes = []

            arrayIncomes.push(arraySlice[0])
            
            for (let arrayTransaction of arraySlice) {
                if (Number(arrayTransaction[1]) > 0) {
                    arrayIncomes.push(arrayTransaction)
                }
            }
    
            return arrayIncomes
        }
    
        function arrayToExportExpenses () {
            let arraySlice = arrayToExportAll.slice(0)
            let arrayExpenses = []
            
            arrayExpenses.push(arraySlice[0])

            for (let arrayTransaction of arraySlice) {
                if (Number(arrayTransaction[1]) < 0) {
                    let auxiliarArrayTwo = []

                    auxiliarArrayTwo.push(arrayTransaction[0])
                    auxiliarArrayTwo.push((arrayTransaction[1] * (-1)))

                    arrayExpenses.push(auxiliarArrayTwo)
                }
            }
    
            return arrayExpenses
        }
    
    
        if (String(option).trim().toLowerCase() === "incomes") {
            return arrayToExportIncomes()
        } else if (String(option).trim().toLowerCase() === "expenses") {
            return arrayToExportExpenses()
        } else {
            return arrayToExportAllTransactions()
        }
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
        <td class="transaction description">${transaction.description}</td>
        <td class="transaction ${CSSclass}">${amount}</td>
        <td class="transaction date">${transaction.date}</td>
        <td class="transaction remove-button" title="Remover Transação">
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
    },
    addSwitchThemeEventListener() {
        const switchColor = document.getElementById('switch-theme-button')

        switchColor.addEventListener('click', checkMode)


        function checkMode() {
            if (switchColor.checked) {                
                Storage.setTheme('dark-theme')
            } else {
                Storage.setTheme('light-theme')
            }

            DOM.checkTheme()
        }
    },
    checkTheme() {
        const switchColor = document.getElementById('switch-theme-button')

        if (Storage.getTheme() === 'dark-theme') {
            setDarkTheme()
        } else {
            setLightTheme()
        }


        function setDarkTheme() {
            Storage.setTheme('dark-theme')
            switchColor.checked = true
            document.body.classList.add('dark-theme')
        }


        function setLightTheme() {
            Storage.setTheme('light-theme')
            switchColor.checked = false
            document.body.classList.remove('dark-theme')
        }
    },
    addPieChartsAndCheckStatusPoint() {
        const pieChartsButton = document.querySelector('input#piechart-button')
        const sectionPieCharts = document.querySelector('section#piecharts')
        const pieChartsStatusPoint = document.querySelector('div.piecharts-status-point')
        
        checkPieChartsStatusPoint()
        pieChartsButton.addEventListener('click', checkChartMode)

        function checkPieChartsStatusPoint () {
            if (pieChartsButton.checked) {
                pieChartsStatusPoint.innerHTML = '<p>ON</p>'
                pieChartsStatusPoint.classList.remove('disabled')
                pieChartsStatusPoint.classList.add('piecharts-on')
            } else {
                pieChartsStatusPoint.innerHTML = '<p>OFF</p>'
                pieChartsStatusPoint.classList.add('disabled')
                pieChartsStatusPoint.classList.remove('piecharts-on')
            }
        }

        function checkChartMode() {

            if (pieChartsButton.checked) {
                addAllPieCharts()
            } else {
                removeAllPieCharts()
            }

            function addAllPieCharts() {
                sectionPieCharts.classList.remove('disabled')
                sectionPieCharts.classList.add('piecharts-on')
            }

            function removeAllPieCharts() {
                sectionPieCharts.classList.remove('piecharts-on')
                sectionPieCharts.classList.add('disabled')
            }
        }
    },
    searchTransaction() {
        const inputSearchTransaction = String(document.getElementById('searchInput').value).trim().toUpperCase()
        const AllTransactionsJSON = Object.assign(Storage.get())
        let transactionsArray = []
        let searchesArray = Storage.getSearches()

        searchAndGetTheTransactionsFound()
        showTheTransactionsFound()

        function searchAndGetTheTransactionsFound() {
            for (const transaction of AllTransactionsJSON) {
                const transactionDescriptionWords = String(transaction.description).trim().toUpperCase().split(' ')
                const inputSearchTransactionWords = inputSearchTransaction.split(' ')
                
                for (const word of inputSearchTransactionWords) {
                    
                    if (transactionDescriptionWords.find(wordSearched => wordSearched === word)) {
                        transactionsArray.push(transaction)

                        if (transactionsArray.length === 1) {
                            
                            if (!(searchesArray.find(search => search === inputSearchTransaction))) {
                                searchesArray.push(String(inputSearchTransaction))
                            }
                        }
                    }
                }
            }

            Storage.setSearches(searchesArray)
        }


        function showTheTransactionsFound() {
            if (transactionsArray.length === 0) {
                window.alert('Desculpe, mas não encontrei o que você procura. Por favor, verifique se há algum erro de ortografia em sua pesquisa e tente novamente...')
                DOM.clearTransactions()
                Transaction.all.forEach(DOM.addTransaction)
            } else {
                const AllTransactionsHTML = document.querySelectorAll('#transactions-table tbody tr')
                
                for (const transactionHTML of AllTransactionsHTML) {
                    const dataIndexAttribute = transactionHTML.getAttribute("data-index")

                    const isCorrect = checkIfTransactionIsCorrect(dataIndexAttribute)

                    if (isCorrect === false) {
                        transactionHTML.classList.add('disabledForSearch')
                    } else {
                        transactionHTML.classList.remove('disabledForSearch')
                    }
                }
                

                function checkIfTransactionIsCorrect(dataIndexAttribute) {
                    let counter = 0

                    for (transactionOfARRAY of transactionsArray) {
    
                        if (transactionOfARRAY === AllTransactionsJSON[dataIndexAttribute]) {
                            counter ++;
                        }
                    }

                    if (counter >= 1) {
                        return true;
                    } else {
                        return false;
                    }
                }
            }
        }
    },
    enterTheSearchWords(searchesArray=Storage.getSearches()) {
        const dataListSearchTag = document.querySelector('datalist#transactionsOptions')

        dataListSearchTag.innerHTML = ''
        Storage.setSearches(searchesArray)

        for (const searchWord of searchesArray) {
            const optionTag = document.createElement('option')

            optionTag.setAttribute('value', searchWord)
            dataListSearchTag.appendChild(optionTag)
        }
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
        DOM.enterTheSearchWords()
        DOM.checkTheme()
        DOM.addSwitchThemeEventListener()
        DOM.addPieChartsAndCheckStatusPoint()
    },
    reload(){
        DOM.clearTransactions()
        App.init()
    }
}


App.init()