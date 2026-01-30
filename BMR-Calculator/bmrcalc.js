  // Populate age options dynamically
  const ageSelect = document.getElementById("age");
  for (let i = 10; i <= 100; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    if (i === 28) option.selected = true; // default
    ageSelect.appendChild(option);
  }

  const elements = {
    calories: document.querySelector('.calories'),
    calculateBtn: document.querySelector('.calculate-btn'),
    age: document.getElementById('age'),
    height: document.getElementById('height'),
    weight: document.getElementById('weight'),
    errorMessage: document.querySelector('.error-message'),
  };

  const calculateBMR = (weight, height, age, isMale) => {
    return isMale
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
  };

  const updateValidation = (input, min, max) => {
    const val = parseFloat(input.value);
    const isValid = !isNaN(val) && val >= min && val <= max;
    input.classList.toggle('invalid', !isValid);
    return isValid;
  };

  elements.calculateBtn.addEventListener('click', () => {
    const ageVal = parseInt(elements.age.value);
    const heightValid = updateValidation(elements.height, 50, 300);
    const weightValid = updateValidation(elements.weight, 20, 500);
    const isMale = document.querySelector('input[name="gender"]:checked').value === 'male';

    if (isNaN(ageVal) || !heightValid || !weightValid) {
      elements.errorMessage.classList.add('active');
      return;
    }

    elements.errorMessage.classList.remove('active');
    const BMR = calculateBMR(
      Number(elements.weight.value),
      Number(elements.height.value),
      ageVal,
      isMale
    );
    elements.calories.textContent = BMR.toLocaleString('en-US');
  });
