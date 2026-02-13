// DOM Elements
const lengthSlider = document.getElementById("lengthSlider");
const lengthValue = document.getElementById("lengthValue");
const checkboxes = document.querySelectorAll(
  ".password-options input[type='checkbox']"
);
const generateBtn = document.querySelector(".generate-btn");
const passwordOutput = document.querySelector(".password-text");
const strengthMeter = document.getElementById("strengthMeter");
const strengthText = document.querySelector(".strength-text");
const tooltip = document.querySelector(".tooltip");
const copyBtn = document.querySelector(".copy-btn");

// Character sets
const charSets = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

// Update length display
lengthSlider.addEventListener("input", () => {
  lengthValue.textContent = lengthSlider.value;
});

// Generate password function
const generatePassword = () => {
  const length = parseInt(lengthSlider.value);

  // Get selected character sets
  const selectedSets = [...checkboxes]
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => charSets[checkbox.id.replace("Check", "")]);

  // Check if at least one set is selected
  if (!selectedSets.length) {
    alert("Please select at least one character type.");
    return;
  }

  // Ensure at least one character from each selected set
  let password = selectedSets
    .map((set) => set[Math.floor(Math.random() * set.length)])
    .join("");

  const allChars = selectedSets.join("");

  // Fill the remaining characters randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle using Fisher-Yates algorithm for better randomness
  password = password.split('');
  for (let i = password.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [password[i], password[j]] = [password[j], password[i]];
  }
  password = password.join('');

  // Update display
  passwordOutput.textContent = password;
  
  // Calculate and update strength meter
  calculateStrength(password);
};

// Calculate password strength
const calculateStrength = (password) => {
  let strength = 0;
  const length = password.length;

  // Length-based scoring (max 4 points)
  if (length >= 8) strength += 1;
  if (length >= 12) strength += 1;
  if (length >= 16) strength += 1;
  if (length >= 20) strength += 1;

  // Check character types
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  
  // Variety scoring (max 4 points)
  const varietyCount = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;
  strength += varietyCount;

  // Special rules for very short passwords
  if (length < 6) strength = Math.min(strength, 2);
  if (length < 8 && varietyCount < 3) strength = Math.min(strength, 3);

  // Calculate percentage (max 8 points)
  const strengthPercentage = Math.min((strength / 8) * 100, 100);

  // Determine strength label and color
  let color, strengthLabel;
  if (strengthPercentage <= 20) {
    strengthLabel = "Very Weak";
    color = "#ff4757";
  } else if (strengthPercentage <= 40) {
    strengthLabel = "Weak";
    color = "#ffa502";
  } else if (strengthPercentage <= 70) {
    strengthLabel = "Moderate";
    color = "#26de81";
  } else {
    strengthLabel = "Strong";
    color = "#0bbe65";
  }

  // Update UI
  strengthMeter.style.width = `${strengthPercentage}%`;
  strengthMeter.style.backgroundColor = color;
  strengthText.textContent = `Strength: ${strengthLabel}`;
};

// Copy password to clipboard
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(passwordOutput.textContent).then(() => {
    tooltip.classList.add("visible");
    setTimeout(() => {
      tooltip.classList.remove("visible");
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy: ', err);
    alert('Failed to copy password to clipboard');
  });
});

// Generate new password on button click
generateBtn.addEventListener("click", generatePassword);

// Generate initial password when page loads
document.addEventListener('DOMContentLoaded', () => {
  generatePassword();
});

// Optional: Regenerate password when checkboxes change
checkboxes.forEach(checkbox => {
  checkbox.addEventListener('change', () => {
    // Only regenerate if at least one checkbox is checked
    if ([...checkboxes].some(cb => cb.checked)) {
      generatePassword();
    }
  });
});

// Optional: Regenerate password when slider changes
lengthSlider.addEventListener('change', generatePassword);
