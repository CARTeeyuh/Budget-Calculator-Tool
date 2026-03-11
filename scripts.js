const inputField = document.getElementById('inputFields');
const addButton = document.getElementById('add-new');
const expenseStatusButtons = document.getElementsByClassName('expense-status')[0].parentElement;
const finishBtn = document.getElementById('finish-button')
const deleteBtn = document.getElementsByClassName('deleter')

addButton.addEventListener('click', () => {
    const newInput = document.createElement('li');
    newInput.innerHTML = `<input type="date" class="date-input">
              <input type="text" class="description-input">
              <button class="expense-status" type="button" data-button-id="7">Expense</button>
              <input type="number" class="expense-input">`;
    newInput.classList.add('input-group');
    newInput.classList.add('custom');
    inputField.appendChild(newInput);
});

inputField.addEventListener('click', (event) => {
    if (event.target.classList.contains('expense-status')) {
        const button = event.target;
        if (button.textContent === 'Income') {
            button.textContent = 'Expense';
        } else {
            button.textContent = 'Income';
        }
    }
});

// Chart
const [...lists] = document.querySelectorAll('li');
const all_inputs = lists.map(li =>
    li.querySelectorAll('input')
);

/**
 * @param {NodeListOf<HTMLInputElement>} inputs
 */

function sum(inputs) {
    const arr = Array.from(inputs);
    if (arr.length === 0) return 0;

    const li = arr[0].closest("li");
        if (li && (li.dataset.type === 'income' || li.classList.contains("income"))) {
            return 0;
        }

    return arr.reduce((total, input) => {
            const raw = String(input.value || '').trim();
            const cleaned = raw.replace(/[^0-9.\-]/g, '');
            const n = cleaned === '' ? 0 : Number(cleaned);
        return total + (Number.isFinite(n) ? n : 0);
    }, 0)
}

// Donut chart
const canvas = document.querySelector('canvas');
let current_chart = null;

function update() {
    current_chart?.destroy();
    current_chart = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: document
                .querySelectorAll('li')
                .values()
                .map(li => li.firstElementChild.textContent),
            datasets: [
                {
                    label: 'Monthly (USD)',
                    data: all_inputs.map(inputs => sum(inputs))
                }
            ]
        }
    });
}

// Whenever you input something, update donut chart
document.body.addEventListener('input', () => {
    update();
});

update();
