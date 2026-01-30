// JavaScript Function to Calculate Age and Display the Result
function calculateAge() {
    const dob = document.getElementById('dob').value;
    const currentDate = document.getElementById('currentDate').value;

    if (dob === "" || currentDate === "") {
        alert("Please select both dates.");
        return;
    }

    // Parsing the input dates
    const birthDate = new Date(dob);
    const targetDate = new Date(currentDate);

    let years = targetDate.getFullYear() - birthDate.getFullYear();
    let months = targetDate.getMonth() - birthDate.getMonth();
    let days = targetDate.getDate() - birthDate.getDate();

    // Adjust days and months if negative
    if (days < 0) {
        months -= 1;
        days += new Date(targetDate.getFullYear(), targetDate.getMonth(), 0).getDate();
    }
    if (months < 0) {
        years -= 1;
        months += 12;
    }

    // Building the result string
    const result = `${years} years, ${months} months, and ${days} days`;

    // Displaying the result in the ageResultText div
    document.getElementById('ageResultText').innerHTML = "<strong>Calculated Age: </strong>" + result;
}
