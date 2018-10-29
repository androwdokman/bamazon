var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon_db"
});

connection.connect((err) => {
    if (err) { throw err; } else {
        console.log("Connected as ID: " + connection.threadId);
        startprompt();
    }
});

function startprompt() {
    inquirer.prompt([{
        type: "agree",
        name: "agree",
        message: "welcome to my bamazon video games store! Would you like to view my invetory?",
        default: true
    }]).then(function(user) {
        if (user.agree === true) {
            inventory();
        } else {
            console.log('Thank you for shopping from Us ! Come back soon!');
        }
    });
}

function selectionPrompt() {

    inquirer.prompt([{

                type: "input",
                name: "inputId",
                message: "Please enter the ID number of the game you would like to purchase.",
            },
            {
                type: "input",
                name: "inputNumber",
                message: "How many units of this game would you like to purchase?",
            }

        ])
        .then(function(userPurchase) {
            connection.query("SELECT * FROM products WHERE item_id=?", userPurchase.inputId, function(err, res) {
                for (var i = 0; i < res.length; i++) {
                    if (userPurchase.inputNumber > res[i].stock_quantity) {
                        console.log("--------------------------");
                        console.log("Out of Stock");
                        console.log("--------------------------");
                        startprompt();

                    } else {

                        console.log("-----------------------------------");
                        console.log("Awesome! item available.");
                        console.log("------------------------------------");
                        console.log("You've selected:");
                        console.log("----------------");
                        console.log("Item: " + res[i].product_name);
                        console.log("Department: " + res[i].department_name);
                        console.log("Price: " + res[i].price);
                        console.log("Quantity: " + userPurchase.inputNumber);
                        console.log("----------------");
                        console.log("Total: " + res[i].price * userPurchase.inputNumber);
                        console.log("-----------------------------------");
                        var newStock = (res[i].stock_quantity - userPurchase.inputNumber);
                        var purchaseId = (userPurchase.inputId);
                        confirmPrompt(newStock, purchaseId);
                    }
                }
            });
        });
}

function confirmPrompt(newStock, purchaseId) {

    inquirer.prompt([{

        type: "purchase game",
        name: "confirmPurchase",
        message: "Are you sure you would like to purchase this game and quantity?",
        default: true

    }]).then(function(userConfirm) {
        if (userConfirm.confirmPurchase === true) {


            connection.query("UPDATE products SET ? WHERE ?", [{
                stock_quantity: newStock
            }, {
                item_id: purchaseId
            }], function(err, res) {});

            console.log("---------------------------------");
            console.log("Transaction completed. Thank you.");
            console.log("---------------------------------");
            startPrompt();
        } else {
            console.log("-----------------------------------");
            console.log("Transaction declined. Try again later");
            console.log("------------------------------------");
            startPrompt();
        }
    });
}