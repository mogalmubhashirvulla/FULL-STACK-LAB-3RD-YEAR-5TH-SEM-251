let marks = [85, 72, 90, 65, 78];
console.log("Student Marks:", marks);
let total = 0;
for (let i = 0; i < marks.length; i++) {
    total = total + marks[i];
}
console.log("Total Marks:", total);
let average = total / marks.length;
console.log("Average Marks:", average);
if (average >= 40) {
    console.log("Result: PASS");
} else {
    console.log("Result: FAIL");
}