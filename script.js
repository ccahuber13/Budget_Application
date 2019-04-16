// =========================================
// Module Patterns
// =========================================

// OVERALL STRUCTURE -
//    . budgetController - All calculation functions are written here.
//    . UIController - Controls UI Updates and clicks
//    . controller - Bridging module between budget and UI modules.
//       - Add init function
//    . Run init outside of modules
//    . Setup data structure to store our saved and remove data.
//       - Use an object. Storing value and unique ID so we can diferentiate types of expenses and income.
//       - Use a function constructor as we will be creating multiple objects.
//       - Object for expenses and object for income.


// 1. User enters inputs
//      - Setup fields in HTML
// 2. User clicks butn or hits return key
//      - Setup event listeners
// 3. List item is created based on income or expense
// 4. Add item to data structure and UI
//      - Put list items in an array for sorting
// 4. Clear data fields

// =========================================
// BUDGETCONTROLLER MODULE
// =========================================

// Returns an object with all available functions within.
var budgetController = (function() {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome){
    if(totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function (){
    return this.percentage;
  }

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type){
    var sum = 0;
    data.allItems[type].forEach(function(el){
        sum += el.value;
    });
    data.totals[type] = sum;
  };

  // When structurting data, it's best to keep it all together
  // instead of separate var or arrays
  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    // -1 means non existant - not to 0 because it does not exist yet
    percentage: -1
  };

  return {
    // Public method to add an item: Type, Description, Value to our data structure
    addItem: function(type, des, val) {
      // Declare variables. Will be set based on if statement.
      var newItem, ID;

      // [1 2 3 4], next ID = 5
      // ID = last ID + 1
      // Check if Inc or Exp item was created, count length - 1 to get its array location.
      // Then access whatever id is assigned and add 1. The result is new ID.
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // If type passed in is = to this, create expense or income
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }
      // Access allItems object in data object based on type of created item passed in. Push newly created item.
      data.allItems[type].push(newItem);
      // Return the new element.
      return newItem;
    },

    deleteItem: function(type, id){
      var ids, index;

      var ids = data.allItems[type].map(function(current){
        return current.id;
      })
      // return index number of element that is passed
      index = ids.indexOf(id);
      // If an index exists in array run statement
      if(index !== -1) {
        // Delete starting at this index, delete this many items.
        data.allItems[type].splice(index, 1)
      }
    },

    calculateBudget: function(){
        // Calculate total income and expenses
        calculateTotal('exp');
        calculateTotal('inc');
        // Calculate the budget: income - expenses
        data.budget = data.totals.inc - data.totals.exp;
        // Calculate the percentage of income that we spend only if total is not 0. If 0 set to -1 to mean non existant. CANNOT DEVIDE BY 0.
        if(data.totals.inc > 0 ){
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
        } else {
            data.percentage = -1;
        }
    },

    calculatePercentages: function(){
        data.allItems.exp.forEach(function(current){
          current.calcPercentage(data.totals.inc);
        });
    },

    getPercentages: function(){
      var allPercentages = data.allItems.exp.map(function(current){
        return current.getPercentage(current);
      });
      return allPercentages;
    },

    // Use functions to get and return data. Use objects to return multiple data sets
    getBudget: function(){
        return {
            budget: data.budget,
            totalInc: data.totals.inc,
            totalExp: data.totals.exp,
            percentage: data.percentage
        };
    },

    // Use a public function for testing data
    testing: function() {
      console.log(data);
    }
  };
})();

// =========================================
// UI MODULE
// =========================================

var UIController = (function() {
  // Better to create an object with our DOMstrings in case the CSS is changed at some point.
  var DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expenseLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expPercLabel: ".item__percentage",
    dateLabel: ".budget__title--month"
  };

  var formatNumber = function(num, type) {
    var numSplit, int, dec, type;
    // + or - before the number
    // 2 decimal points
    // commat seperating thousands

    // absolute removes sign of number
    num = Math.abs(num);
    // Method of number prototype. Place two decimals on number. Converts number to a string prim.
    num = num.toFixed(2);
    // Divided num into 2 parts separated by .  Store in arr
    numSplit = num.split('.');
    int = numSplit[0];
    if (int.length > 3) {
      // 2,345.00 - subtr start at index position and get this length. Add comma in between. Get the last characters.
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }
    dec = numSplit[1];
    return (type === 'exp' ? sign = '-' : '+') + ' ' + int + '.' +  dec;
  };


  var nodeListForEach = function (list, callback) {
    // Loop over entire length of list
    for (var i = 0; i < list.length; i++) {
      // On each iteration run callback function and pass in list item i at index i
      callback(list[i], i);
    }
  };

  // Get the value of these fields with this class in the DOM. Return to make public.
  return {


    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },


    addListItem: function(obj, type) {
      var html, newHtml, element;
      // Create HTML string with placeholder text
      if (type === "inc") {
        element = DOMstrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else {
        element = DOMstrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div >';
      }
      // Replace placeholder text with actual data from object
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));
      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },


    deleteListItem: function(selectorID){
      // Put ID of element in a var
      var el = document.getElementById(selectorID);
      // in JS you cannot directly delete an HTML element. You delete the child of a parent. 
      // Go up parent of current element, remove child, select element again     
      el.parentNode.removeChild(el);
    },


    displayBudget: function(obj){
      var type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
        if(obj.percentage > 0 ){
            document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
        } else {
            document.querySelector(DOMstrings.percentageLabel).textContent = '---';
        };
    },


    displayPercentages: function(percentages){
      // Create a node list of all percentage labels in DOM
      var fields = document.querySelectorAll(DOMstrings.expPercLabel);
      // Create our own forEach loop for Nodelist. pass list in and callback function.

      nodeListForEach(fields, function (el, index) {
        if (percentages[index] > 0) {
          el.textContent = percentages[index] + '%';
        } else {
          el.textContent = '---';
        };
      });
    },


    displayMonth: function(){
      var now, year, month, months;
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      // returns date of today
      now = new Date();
      year = now.getFullYear();
      month = now.getMonth();
      document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

    },


    // To expose Domstrings object to public to be used in other modules.
    getDOMstrings: function () {
      return DOMstrings;
    },

    changedType: function(){
      // Returns a node list
      var fields = document.querySelectorAll(
        DOMstrings.inputType + ',' + 
        DOMstrings.inputDescription + ',' +
        DOMstrings.inputValue
      );

        nodeListForEach(fields, function(cur){
          console.log(fields);
          cur.classList.toggle('red-focus');
        });

        document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        console.log('changed type firing');
    },

    clearFields: function(){
        var fields, fieldsArr;
        // Select multiple items by separating with a , similar to css
        // querySelectorAll returns a list, not an array with it's methods. Convert list to an array.
        // Use slice to pass in a list and return an array. Slice returns an array from an array.
        fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
        // Call allows an object to use the method of another object with itself as the argument. Meaning the method is run on this object.
        // Use slice method but call fields list and it will return an array form the list.
        var fieldsArr = Array.prototype.slice.call(fields);
        // forEach - run on array and use callback function. Access to the current element, the indexes, and the original array.
        fieldsArr.forEach(function(current, index, array){
            current.value = "";
            current.description = "";
        });
        // Focus back to the description field to enter another item. 
        fieldsArr[0].focus();
    }
  };
})();

// =========================================
// CONTROLLER MODULE
// =========================================

// Controller module allows budget and UI modules to work together
// Pass in budget and UI objects. Set parameters with similar names to passed in modules to access and use the functions of said module.
var controller = (function(budgetCtrl, UICtrl) {
  // For organization and security - best to place event listeners all together in a function, then call that function in init function.
  // These are bits of code that should be initilized right away when app starts.
  var setupEventListeners = function() {
    // Setting event listeners for UI
    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
    // Return key listener and use event object
    document.addEventListener("keypress", function(e) {
      // If return key is pressed do this. keyCode vs. which = new and old browser compatibility.
      if (e.keyCode === 13 || e.which === 13) {
        ctrlAddItem();
        console.log("return pressed!");
      }
    });
    // Add change event to + - button. Change color.
    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    // Event Delegation - Instead of event listeners on specific or multiple nodes
    // Add 1 event l istener to the parent and have it analyze the bubbled events to match the child element it should execute.
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
  };

  // Get the DOM strings from UI module
  var DOM = UICtrl.getDOMstrings();

  var updateBudget = function(){
    // 1. Calculate the budget
    budgetCtrl.calculateBudget();
    // 2. return the budget
    var budget = budgetCtrl.getBudget();
    // 3. Display the budget
    UICtrl.displayBudget(budget);
    
  };

  var updatePercentages = function() {

    // 1. Calculate percentages
    budgetCtrl.calculatePercentages();
    // 2. Read percentages from the budget controller
    var percentages = budgetCtrl.getPercentages();
    // 3. Update the UI with new percentages
    UICtrl.displayPercentages(percentages);
    console.log('Updating Percentages firing');
  };

  // Adding item data function
  var ctrlAddItem = function() {
    var input, newItem;
    // 1. Get the input data
    input = UICtrl.getInput();
    // Only run function if item description is not empty AND the inputvalue is NOT not a number (NaN) AND inputvalue is greater than 0
    if (input.description !== "" && !isNaN(input.value) && input.value > 0){
        // 2. Add item to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        // 3. Add item to the UI
        UICtrl.addListItem(newItem, input.type);
        // 4. Clear fields
        UICtrl.clearFields();
        // 5. Calculate and update budget
        updateBudget();
        // 6. Calculate and update percentages
        updatePercentages();
    } else {
        alert('Please enter a description and number value greater than 0');
    }
    console.log("ctrlAddItem is firing!");
  };

  // Get the event object to figure out which target element was clicked. EVENT DELEGATION. 
  var ctrlDeleteItem = function(e){
    var itemID, splitID, type, ID;
    // check what target was cliked from the event object. Use parent node to move up one node level.
    // get the id property of the html node clicked.
    itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      // inc-1 returns an array with ['inc', '1'] or ['exp', '3']
      splitID = itemID.split('-');
      // get the type of the split id element
      type = splitID[0];
      // get the ID of the split id element
      ID = parseInt(splitID[1]);

      // 1. Delete the item form the data structure
      budgetController.deleteItem(type, ID);
      // 2. Delete the item from the UI
      UIController.deleteListItem(itemID);
      // 3. Update and show new Budget
      updateBudget();
      // 4. Calculate and update percentages
      updatePercentages();
    }

    console.log(e.target.parentNode.parentNode.parentNode.parentNode.id);
  };

  // Organize functions that should be initilizaed right away.
  return {
    init: function() {
      UICtrl.displayMonth();
      console.log("Application has started.");
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: 0
    });
      setupEventListeners();

    }
  };
})(budgetController, UIController);

// Run initiation outside of modules to init code within init function.
controller.init();
