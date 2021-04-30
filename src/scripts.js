const remote = require('electron').remote

const Electron = {
    window: remote.getCurrentWindow(),

    close () {
        this.window.close()
    },

    maximize() {
        if (this.window.isMaximized()) {
            this.window.unmaximize()
        } else  {
            this.window.maximize()
        }
    },

    minimize () {
        this.window.minimize()
    }
}

const Modal = {
    open() {
        document
        .querySelector(".modal-overlay")
        .classList
        .add('active')
    },
    
    close() {
        document
        .querySelector(".modal-overlay")
        .classList
        .remove('active')
    }
}

const Storage = {
    get () {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set (transaction) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transaction))
    }
}

const Transaction = {
    all: Storage.get(),
    
    add(transaction){
        this.all.push(transaction)

        App.reload()
    },
    
    remove(index) {
        this.all.splice(index, 1)

        App.reload()
    },

    income() {
        let income = 0

        this.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount
            }
        })

        return income
    },
    expense () {
        let expense = 0

        this.all.forEach(transaction => {
            if (transaction.amount <  0) {
                expense += transaction.amount
            }
        })

        return expense
    },
    total () {
        return this.income() + this.expense()
    }
}

const DOM = {
    transactionsContainer: document.querySelector("#data-table tbody"),

    innerHTMLTransaction(transaction, index) {
        const classCSS = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const HTML = `
        <tr>
            <td class="description">${transaction.description}</td>
            <td class=${classCSS}>${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            </td>
        </tr>
        `

        return HTML
    },

    updateBalance() {
        document.getElementById("incomeDisplay").innerHTML = Utils.formatCurrency(Transaction.income())
        document.getElementById("expenseDisplay").innerHTML = Utils.formatCurrency(Transaction.expense())
        document.getElementById("totalDisplay").innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransaction() {
        this.transactionsContainer.innerHTML = ''
    },

    addTransaction(transaction, index){
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)

        DOM.transactionsContainer.appendChild(tr)
    },
}

const Utils = {
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "- " : ""

        value = String(value).replace(/\D/g, '')

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: 'currency',
            currency: 'BRL'
        })

        return (signal + value)
    },

    formatAmount(value) {
        return Math.round(value * 100)
    },

    formatDate(date) {
        const slittedDate = date.split('-')
        return `${slittedDate[2]}/${slittedDate[1]}/${slittedDate[0]}`
    }
}

const Form = {

    description: document.getElementById('description'),
    amount: document.getElementById('amount'),
    date: document.getElementById('date'),

    getValue() {
        return {
            description: this.description.value,
            amount: this.amount.value,
            date: this.date.value
        }
    },
    
    validateFields() {
        const {description, amount, date} = this.getValue()

        if (description.trim() === '' || amount.trim() === '' || date.trim() === '') {
            throw new Error('Por favor insira todos os campos!')
        }
    },

    formatValues(){
        let {description, amount, date} = this.getValue()
        
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return {description, amount, date}
    },

    clearFields(){
        this.description.value = ''
        this.amount.value = ''
        this.date.value = ''
    },

    submit(event) {
        event.preventDefault()

        try {
            this.validateFields()
            const transaction = this.formatValues()
            Transaction.add(transaction)

            this.clearFields()

            Modal.close()
            
        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init () {
        Transaction.all.forEach(DOM.addTransaction)

        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload () {
        DOM.clearTransaction()
        this.init()
    }
}

App.init()