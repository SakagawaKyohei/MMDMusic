document.addEventListener('DOMContentLoaded', () => {
    const modeSelect = document.getElementById('modeSelect');
    const preDanceDiv = document.getElementById('pre-dance');
    const danceDiv = document.getElementById('dance');

    // Function to update the display based on selected mode
    function updateDisplay() {
        const selectedMode = modeSelect.value;
        if (selectedMode === 'pre-dance') {
            preDanceDiv.style.display = 'block';
            danceDiv.style.display = 'none';
        } else if (selectedMode === 'dance') {
            preDanceDiv.style.display = 'none';
            danceDiv.style.display = 'block';
        }
    }

    // Event listener for the mode selection change
    modeSelect.addEventListener('change', updateDisplay);

    // Initialize display based on the default selection
    updateDisplay();
});

