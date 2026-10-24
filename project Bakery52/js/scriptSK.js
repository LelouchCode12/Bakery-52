const fullName = "Sabyrzhan Kenzhigarin";
let age = 18;
let isStudent = true;
let favoriteColor = "Orange";

console.log(fullName, typeof fullName);
console.log(age, typeof age);
console.log(isStudent, typeof isStudent);
console.log(favoriteColor, typeof favoriteColor);

age = 20;
console.log(age);

let userName = prompt("Enter your name:");
alert("Hello, " + userName);

let group = "MT-2504";
let myInfo = userName + " from " + group;
console.log(myInfo);

let num1 = Number(prompt("Enter first number:"));
let num2 = Number(prompt("Enter second number:"));

console.log("Sum:", num1 + num2);
console.log("Difference:", num1 - num2);
console.log("Product:", num1 * num2);
console.log("Quotient:", num1 / num2);
console.log("Remainder:", num1 % num2);

let myFullName = "Eldar Mussin";
console.log(myFullName.length);
console.log(myFullName.toUpperCase());
console.log(myFullName.toLowerCase());
console.log(myFullName.slice(0, 3));

let str1 = "Dr.Doom";
let str2 = " is horrifying";
console.log(str1 + str2);

let counter = 10;
counter++;
console.log(counter);
counter--;
console.log(counter);
counter += 5;
console.log(counter);
counter -= 3;
console.log(counter);
counter *= 2;
console.log(counter);
counter /= 4;
console.log(counter);

let dogAge = 4;
let humanAge = (dogAge - 2) * 4 + 21;
console.log("Dog age: " + dogAge + ", human age: " + humanAge);

dogAge = 7;
humanAge = (dogAge - 2) * 4 + 21;
console.log("Dog age: " + dogAge + ", human age: " + humanAge);

function greetUser(name) {
    console.log("Hi " + name);
}

greetUser("Eldar");
greetUser("Aboba");

function calculateSum(a, b) {
    return a + b;
}

console.log(calculateSum(3, 7));
console.log(calculateSum(15, 25));

function calculateRectangleArea(width, height) {
    return width * height;
}

console.log(calculateRectangleArea(5, 10));
console.log(calculateRectangleArea(3, 4));