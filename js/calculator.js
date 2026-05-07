class CalculatorModel {
    constructor() {
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = null;
        this.operation = null;
        this.waitingForNewValue = false;
        this.currentBase = 10;
    }

    deleteLastDigit() {
        if (this.waitingForNewValue || this.currentOperand === 'Помилка') {
            this.currentOperand = '0';
            return;
        }

        this.currentOperand = this.currentOperand.toString().slice(0, -1);

        if (this.currentOperand === '' || this.currentOperand === '-') {
            this.currentOperand = '0';
        }
    }

    getInputValue() {
        if (this.currentBase === 10) {
            return parseFloat(this.currentOperand.replace(',', '.'));
        } else {
            return parseInt(this.currentOperand, this.currentBase);
        }
    }

    formatValue(value) {
        if (isNaN(value) || !isFinite(value)) return 'Помилка';
        
        if (this.currentBase === 10) {
            let strValue = String(value);
            
            if (strValue.replace(/[^0-9]/g, '').length > 12) {
                strValue = value.toExponential(6); 
            }
            
            return strValue.replace('.', ','); 
        } else {
            return Math.trunc(value).toString(this.currentBase).toUpperCase(); 
        }
    }


    changeBase(newBase) {
        if (this.currentBase === newBase || this.currentOperand === 'Помилка') return;
        
        const decValue = this.getInputValue(); 
        
        this.currentBase = newBase;
        this.currentOperand = this.formatValue(decValue); 
        this.waitingForNewValue = true;
    }

    inputDigit(digit) {
        if (this.currentBase === 2 && !/^[01]$/.test(digit)) return;
        if (this.currentBase === 8 && !/^[0-7]$/.test(digit)) return;
        if (this.currentBase === 10 && !/^[0-9]$/.test(digit)) return;
        if (this.currentBase === 16 && !/^[0-9A-F]$/.test(digit)) return;

        if (this.waitingForNewValue) {
            this.currentOperand = digit;
            this.waitingForNewValue = false;
            
            if (this.operation === null) {
                this.previousOperand = null;
            }
        } else {
            this.currentOperand = this.currentOperand === '0' ? digit : this.currentOperand + digit;
        }
    }

    inputDecimal() {
        if (this.currentBase !== 10) return;

        if (this.waitingForNewValue) {
            this.currentOperand = '0,';
            this.waitingForNewValue = false;
            
            if (this.operation === null) {
                this.previousOperand = null;
            }
            return;
        }
        
        if (!this.currentOperand.includes(',')) {
            this.currentOperand += ',';
        }
    }

    handleOperator(nextOperator) {
        const inputValue = this.getInputValue();

        if (this.operation && this.waitingForNewValue) {
            this.operation = nextOperator;
            return;
        }

        if (this.previousOperand == null && !isNaN(inputValue)) {
            this.previousOperand = inputValue;
        } else if (this.operation) {
            const result = this.calculate(this.previousOperand, inputValue, this.operation);
            this.currentOperand = this.formatValue(result);
            this.previousOperand = result;
        }

        this.waitingForNewValue = true;
        this.operation = nextOperator;
    }

    calculate(firstOperand, secondOperand, operator) {
        if (operator === '+') return firstOperand + secondOperand;
        if (operator === '−' || operator === '-') return firstOperand - secondOperand;
        if (operator === '×' || operator === '*') return firstOperand * secondOperand;
        if (operator === '÷' || operator === '/') {
            return secondOperand === 0 ? NaN : firstOperand / secondOperand; 
        }
        return secondOperand;
    }

    inverse() {
        const val = this.getInputValue() * -1;
        this.currentOperand = this.formatValue(val);
    }

    percentage() {
        if (this.currentBase !== 10) return;
        const val = this.getInputValue() / 100;
        this.currentOperand = this.formatValue(val);
    }
}

class CalculatorView {
    constructor() {
        this.mainDisplay = document.getElementById('main-display'); 
        this.historyDisplay = document.getElementById('history-display'); 
    }

    updateDisplay(currentOperand, previousOperand, operation, currentBase) {
        this.mainDisplay.innerText = currentOperand;
        
        if (operation != null && previousOperand != null) {
            
            let formattedPrev = previousOperand;
            
            if (currentBase && currentBase !== 10) {
                formattedPrev = Math.trunc(previousOperand).toString(currentBase).toUpperCase();
            } else {
                formattedPrev = String(previousOperand).replace('.', ',');
            }
            
            this.historyDisplay.innerText = `${formattedPrev} ${operation}`;
        } else {
            this.historyDisplay.innerText = '';
        }
    }
}

class CalculatorController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('click', () => this.handleAction(button.innerText.trim()));
        });

        document.addEventListener('keydown', (event) => {
            let key = event.key;

            const keyMapping = {
                'Enter': '=',
                'Escape': 'AC',
                'Delete': 'AC',
                'Backspace': '⌫',
                '.': ',',
                '*': '×',
                '/': '÷',
                '-': '−'
            };

            if (keyMapping[key]) {
                key = keyMapping[key];
            } else if (/^[a-f]$/.test(key)) {
                key = key.toUpperCase(); 
            }

            const isDigitOrLetter = /^[0-9A-F]$/.test(key);
            const isOperator = ['+', '−', '×', '÷', '=', ',', 'AC', '⌫'].includes(key);

            if (isDigitOrLetter || isOperator) {
                event.preventDefault();
                this.handleAction(key);
            }
        });

        const toggle = document.getElementById('prog-mode-toggle');
        const progButtons = document.getElementById('prog-buttons');
        
        if (toggle && progButtons) {
            toggle.addEventListener('change', (e) => {
                if (e.target.checked) {
                    progButtons.classList.remove('hidden');
                } else {
                    progButtons.classList.add('hidden');
                    this.updateUIForBase(10);
                    this.model.changeBase(10);
                    
                    this.view.updateDisplay(
                        this.model.currentOperand, 
                        this.model.previousOperand, 
                        this.model.operation, 
                        this.model.currentBase
                    );
                }
            });
        }
    }

    updateUIForBase(base) {
        const hexButtons = document.getElementById('hex-buttons');
        if (hexButtons) {
            if (base === 16) {
                hexButtons.classList.remove('hidden');
            } else {
                hexButtons.classList.add('hidden');
            }
        }
    }

    handleAction(value) {
        if (value === 'HEX') {
            this.model.changeBase(16);
            this.updateUIForBase(16);
        } else if (value === 'DEC') {
            this.model.changeBase(10);
            this.updateUIForBase(10);
        } else if (value === 'OCT') {
            this.model.changeBase(8);
            this.updateUIForBase(8);
        } else if (value === 'BIN') {
            this.model.changeBase(2);
            this.updateUIForBase(2);
            
        } else if (/^[0-9A-F]$/.test(value)) { 
            this.model.inputDigit(value);
        } else if (value === ',') {
            this.model.inputDecimal();
        } else if (value === 'AC') {
            this.model.clear();
            this.updateUIForBase(10);
            const toggle = document.getElementById('prog-mode-toggle');
            const progButtons = document.getElementById('prog-buttons');
            if (toggle) toggle.checked = false;
            if (progButtons) progButtons.classList.add('hidden');
        } else if (value === '⌫') {
            this.model.deleteLastDigit();
        } else if (value === '±') {
            this.model.inverse();
        } else if (value === '%') {
            this.model.percentage();
        } else if (value === '=') {
            this.model.handleOperator(value);
            this.model.operation = null; 
        } else {
            this.model.handleOperator(value);
        }
        
        this.view.updateDisplay(
            this.model.currentOperand, 
            this.model.previousOperand, 
            this.model.operation, 
            this.model.currentBase
        );
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CalculatorController(new CalculatorModel(), new CalculatorView());
});
