let stack = [];
let decimalPlaces = 0; // Default decimal places
let historyStack = []; // History for undo functionality

function saveState() {
    // Save a snapshot of the current stack
    historyStack.push([...stack]);
}

function undo() {
    if (historyStack.length === 0) {
        alert("Nothing to undo!");
        return;
    }
    stack = historyStack.pop(); // Restore the previous state
    updateStackDisplay();
}

function updateStackDisplay() {
    const stackDisplay = document.getElementById('stack');
    stackDisplay.innerHTML = ''; // Clear current stack display

    // Add stack items in correct order (last item at bottom)
    stack.forEach((item) => {
        const div = document.createElement('div');
        div.textContent = formatNumberWithCommas(item.toFixed(decimalPlaces));
        stackDisplay.appendChild(div);
    });

    // Ensure scroll to bottom
    stackDisplay.scrollTop = stackDisplay.scrollHeight;
}

function input(value) {
    const display = document.getElementById('display');
    let currentValue = display.textContent.replace(/,/g, ''); // Remove commas for manipulation

    if (value === '.' && currentValue.includes('.')) {
        return; // Prevent multiple decimal points
    }

    if (currentValue === "0" && value !== ".") {
        currentValue = ""; // Reset display if 0 is displayed and a digit is entered
    }

    currentValue += value; // Append the new value (digit or decimal point)
    display.textContent = formatNumberWithCommas(currentValue); // Format with commas
}

function clearDisplay() {
    stack = [];
    historyStack = []; // Clear history
    document.getElementById('display').textContent = "0";
    updateStackDisplay();
}

function pushToStack() {
    const display = document.getElementById('display');
    const value = parseFloat(display.textContent.replace(/,/g, '')); // Remove commas for calculation
    if (!isNaN(value)) {
        saveState(); // Save current state
        stack.push(value); // Store the full precision number
        display.textContent = "0"; // Reset display
        updateStackDisplay();
    }
}

function operate(operator) {
    if (stack.length < 2) {
        alert("Not enough numbers on the stack");
        return;
    }
    saveState(); // Save current state before modifying the stack
    const b = stack.pop();
    const a = stack.pop();
    let result;
    switch (operator) {
        case '+':
            result = a + b;
            break;
        case '-':
            result = a - b;
            break;
        case '*':
            result = a * b;
            break;
        case '/':
            result = a / b;
            break;
        default:
            alert("Invalid operator");
            stack.push(a, b); // Push them back in case of an error
            return;
    }
    stack.push(result);
    updateStackDisplay();
}

function invert() {
    if (stack.length < 1) {
        alert("Stack is empty. Cannot perform 1/X.");
        return;
    }
    saveState(); // Save current state
    const value = stack.pop();
    if (value === 0) {
        alert("Cannot divide by zero.");
        stack.push(value); // Push back the value
        return;
    }
    const result = 1 / value;
    stack.push(result);
    updateStackDisplay();
}

function swap() {
    if (stack.length < 2) {
        alert("Not enough numbers on the stack to swap.");
        return;
    }
    saveState(); // Save current state
    const top = stack.pop();      // Pop the top value
    const second = stack.pop();  // Pop the second-to-top value
    stack.push(top);             // Push the first value back second
    stack.push(second);          // Push the second value back on top
    updateStackDisplay();        // Update the stack display
}

function duplicate() {
    if (stack.length < 1) {
        alert("The stack is empty. Nothing to duplicate.");
        return;
    }
    saveState(); // Save current state
    const lastValue = stack[stack.length - 1]; // Get the last value
    stack.push(lastValue); // Duplicate it
    updateStackDisplay(); // Update the stack display
}

function percentage() {
    const display = document.getElementById('display');
    const xValue = parseFloat(display.textContent.replace(/,/g, '')); // Get the current number
    if (isNaN(xValue)) {
        alert("Invalid input for percentage calculation.");
        return;
    }

    if (stack.length < 1) {
        alert("The stack is empty. Cannot calculate percentage.");
        return;
    }

    saveState(); // Save current state
    const lastValue = stack.pop(); // Get and remove the last value from the stack
    const result = (lastValue * xValue) / 100; // Calculate X% of the last value
    stack.push(result); // Push the result back onto the stack
    display.textContent = "0"; // Clear the current input
    updateStackDisplay(); // Update the stack display
}

function pop() {
    if (stack.length === 0) {
        alert("The stack is empty. Nothing to pop.");
        return;
    }
    saveState(); // Save current state
    stack.pop(); // Remove the last number from the stack
    updateStackDisplay(); // Update the stack display
}

function formatNumberWithCommas(number) {
    const parts = number.split('.'); // Split into integer and decimal parts
    parts[0] = parseInt(parts[0], 10).toLocaleString('en-US'); // Format integer part with commas
    return parts.join('.'); // Rejoin with the decimal part (if any)
}

function increaseDecimalPlaces() {
    decimalPlaces = Math.min(decimalPlaces + 1, 10); // Limit to 10 decimal places
    updateStackDisplay();
}

function decreaseDecimalPlaces() {
    decimalPlaces = Math.max(decimalPlaces - 0, 0); // Limit to 0 decimal places
    updateStackDisplay();
}

async function handlePaste(event) {
    event.preventDefault();

    try {
        const text = await navigator.clipboard.readText();
        const number = parseFloat(text.replace(/,/g, '')); // Remove commas
        if (!isNaN(number)) {
            document.getElementById('display').textContent = formatNumberWithCommas(number.toString());
        }
    } catch (err) {
        console.error('Failed to read clipboard:', err);
    }
}

function handleKeyPress(event) {
    const key = event.key.toLowerCase(); // Convert to lowercase for consistent matching

    // Check for undo (Ctrl+Z or Cmd+Z)
    if ((event.metaKey || event.ctrlKey) && key === 'z') {
        event.preventDefault(); // Prevent browser undo
        undo();
        return;
    }

    if (!isNaN(key)) {
        // If the key is a number
        input(key);
    } else if (key === '+') {
        operate('+');
    } else if (key === '-') {
        operate('-');
    } else if (key === '*') {
        operate('*');
    } else if (key === '/') {
        operate('/');
    } else if (key === 'enter') {
        // "Enter" to push the current display value to the stack
        event.preventDefault(); // Prevent default form submission behavior
        pushToStack();
    } else if (key === 'backspace') {
        // "Backspace" to clear the last entered value
        pop();
    } else if (key === 'c') {
        // "C" for Clear
        clearDisplay();
    } else if (key === 's') {
        // "S" for SWAP
        swap();
    } else if (key === 'i') {
        // "I" for 1/X
        invert();
    } else if (key === 'p') {
        // "P" for POP
        pop();
    } else if (key === '.') {
        // Allow decimal point entry
        input('.');
    } else if (key === 'd') {
        // "D" for DUP
        duplicate();
    } else if (key === '%') {
        // "%" for percentage
        percentage();
    } else if (key === 'arrowleft') {
        // Left arrow key for increasing decimal places
        increaseDecimalPlaces();
    } else if (key === 'arrowright') {
        // Right arrow key for decreasing decimal places
        decreaseDecimalPlaces();
    }
}

document.addEventListener('keydown', handleKeyPress);
document.addEventListener('paste', handlePaste);
