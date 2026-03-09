const inputField = document.getElementById('inputFields');
const addButton = document.getElementById('add-new');
const expenseStatusButtons = document.getElementsByClassName('expense-status')[0].parentElement;

addButton.addEventListener('click', () => {
    const newInput = document.createElement('li');
    newInput.innerHTML = `<input type="datetime" class="date-input">
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

