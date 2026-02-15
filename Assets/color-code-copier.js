
    // Function to copy color code to clipboard
    function copyColorCode(colorCode) {
        // Create a temporary input element to copy the color code
        const input = document.createElement('input');
        input.value = colorCode;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);

        // Optionally, show an alert or visual feedback
        alert('Copied color code: ' + colorCode);
    }

    // Add click event listener to each color box to copy color code
    const colorBoxes = document.querySelectorAll('.color-box');
    colorBoxes.forEach(box => {
        box.addEventListener('click', function() {
            const colorCode = box.getAttribute('data-color');
            copyColorCode(colorCode);
        });
    });
