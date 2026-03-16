const inputField = document.getElementById('inputFields');
const addBtn = document.getElementById('add-new');
const deleteBtn = document.getElementById('delete-last');
const finishBtn = document.getElementById('finish-button');
const careerSelector = document.getElementById('occu');
const grossincome = document.getElementById('gross-income');
const form = document.querySelector('form');

let current_chart = null;
let remainingDiv = null;

// stops pressing income button refreshing page
if (form) form.addEventListener('submit', e => e.preventDefault());

const occupationSalaryMap = new Map();

// Get career data from EECU website
async function populateCareers() {
    try {
        const response = await fetch('https://eecu-data-server.vercel.app/data');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        data.forEach(job => {
            occupationSalaryMap.set(job.Occupation, job.Salary);
            const option = new Option(job.Occupation, job.Occupation);
            careerSelector.add(option);
        });

    } catch (err) {
        console.error('Error loading careers:', err);
    }
}

// Calculate taxes
function calculateMonthlyIncome(annualIncome) {
    const standardDeduction = 16100;
    let taxableIncome = Math.max(annualIncome - standardDeduction, 0);

    let Taxes = 0;
    if (taxableIncome <= 12400) {
        Taxes = taxableIncome * 0.10;
    } else if (taxableIncome <= 50400) {
        Taxes = 1240 + (taxableIncome - 12400) * 0.12;
    } else {
        Taxes = 1240 + (50400 - 12400) * 0.12 + (taxableIncome - 50400) * 0.22;
    }

    const medicare = annualIncome * 0.0145;
    const socialSecurity = annualIncome * 0.062;
    const stateTax = annualIncome * 0.04;

    const totalTaxes = Taxes + medicare + socialSecurity + stateTax;
    const incomeAfterTax = (annualIncome - totalTaxes) / 12;

    return incomeAfterTax;
}

careerSelector.addEventListener('change', () => {
    const selected = careerSelector.value;
    const annualSalary = occupationSalaryMap.get(selected) || 0;


    grossincome.value = parseFloat(annualSalary).toFixed(2);


    const incomeInput = document.querySelector('#inputFields .income .expense-input');
    if (incomeInput) {
        incomeInput.value = calculateMonthlyIncome(annualSalary).toFixed(2);
    }


    update();
    checkFields();
});

populateCareers();

// Adds new category
if (addBtn) {
    addBtn.addEventListener('click', () => {
        const newInput = document.createElement('li');
        newInput.innerHTML = `
            <input type='date' class='date-input'>
            <input type='text' class='description-input'>
            <button class='expense-status' type='button'>Expense</button>
            <input type='number' class='expense-input'>
        `;
        newInput.classList.add('input-group', 'custom');
        inputField.appendChild(newInput);
        checkFields();
    });
}

// Deletes last category
if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
        const items = document.querySelectorAll('#inputFields li');
        if (items.length > 0) {
            const lastItem = items[items.length - 1];
            if (lastItem.classList.contains('custom')) lastItem.remove();
        }
        update();
        checkFields();
    });
}

// Toggle Income/Expense buttons
if (inputField) {
    inputField.addEventListener('click', (event) => {
        if (event.target.classList.contains('expense-status')) {
            event.target.textContent = event.target.textContent === 'Income' ? 'Expense' : 'Income';
        }
    });
}

// Update chart
function update() {
    const items = [...document.querySelectorAll('#inputFields li')];
    const labels = items.map(li => {
        const title = li.querySelector('.expense-title');
        const custom = li.querySelector('.description-input');
        if (title) return title.textContent;
        if (custom) return custom.value || "Custom";
    });

    const values = items.map(li => {
        const input = li.querySelector('.expense-input');
        const button = li.querySelector('.expense-status');
        const value = Number(input.value) || 0;
        return button && button.textContent === 'Income' ? -value : value;
    });

    current_chart?.destroy();

    current_chart = new Chart(document.getElementById('myChart'), {
        type: 'doughnut',
        data: { labels, datasets: [{ label: 'Monthly (USD)', data: values }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// hides buttons and calculates remaining money
finishBtn.addEventListener('click', () => {
    finishBtn.style.display = 'none';
    addBtn.style.display = 'none';
    deleteBtn.style.display = 'none';

    if (!remainingDiv) {
        remainingDiv = document.createElement('div');
        remainingDiv.id = 'remaining-balance';
        remainingDiv.style.fontSize = '1.5em';
        remainingDiv.style.fontWeight = 'bold';
        remainingDiv.style.margin = '20px 0';
        remainingDiv.style.textAlign = 'center';

        const chartContainer = document.getElementById('chart');
        chartContainer.parentNode.insertBefore(remainingDiv, chartContainer);
    }


    const incomeInput = document.querySelector('#inputFields .income .expense-input');
    const monthlyIncome = Number(incomeInput.value) || 0;

    const expenseItems = document.querySelectorAll('#inputFields li');
    let totalExpenses = 0;
    expenseItems.forEach(li => {
        const input = li.querySelector('.expense-input');
        const button = li.querySelector('.expense-status');
        const val = Number(input.value) || 0;
        if (button && button.textContent === 'Expense') totalExpenses += val;
    });

    const remaining = monthlyIncome - totalExpenses;
    remainingDiv.textContent = `Remaining Money: $${remaining.toFixed(2)}`;
    remainingDiv.style.color = remaining >= 0 ? 'green' : 'red';
});


function checkFields() {
    if (!finishBtn) return;
    const rows = document.querySelectorAll('#inputFields li');
    let allFilled = true;

    rows.forEach(row => {
        const date = row.querySelector('.date-input');
        const amount = row.querySelector('.expense-input');
        const description = row.querySelector('.description-input');
        if (!date.value || !amount.value || (description && !description.value)) allFilled = false;
    });

    finishBtn.classList.toggle('hidden', !allFilled);
}

document.body.addEventListener('input', () => {
    update();
    checkFields();
});

update();
checkFields();