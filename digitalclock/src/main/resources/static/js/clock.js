document.addEventListener('DOMContentLoaded', function() {
    function updateClock() {
        const now = new Date();
        const clock = document.getElementById('clock');
        const date = document.getElementById('date');
        const day = document.getElementById('day');
        const timezone = document.getElementById('timezone');

        clock.textContent = now.toLocaleTimeString();
        date.textContent = now.toLocaleDateString();
        day.textContent = now.toLocaleDateString(undefined, { weekday: 'long' });
        timezone.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    setInterval(updateClock, 1000);
    updateClock();

    // Stopwatch functionality
    let stopwatchInterval;
    let stopwatchTime = 0;
    const stopwatchDisplay = document.getElementById('stopwatch');
    const startStopwatchBtn = document.getElementById('startStopwatch');
    const resetStopwatchBtn = document.getElementById('resetStopwatch');

    startStopwatchBtn.addEventListener('click', function() {
        if (stopwatchInterval) {
            clearInterval(stopwatchInterval);
            stopwatchInterval = null;
            this.textContent = 'Start Stopwatch';
        } else {
            stopwatchInterval = setInterval(updateStopwatch, 1000);
            this.textContent = 'Stop Stopwatch';
        }
    });

    resetStopwatchBtn.addEventListener('click', function() {
        clearInterval(stopwatchInterval);
        stopwatchInterval = null;
        stopwatchTime = 0;
        updateStopwatchDisplay();
        startStopwatchBtn.textContent = 'Start Stopwatch';
    });

    function updateStopwatch() {
        stopwatchTime++;
        updateStopwatchDisplay();
    }

    function updateStopwatchDisplay() {
        const hours = Math.floor(stopwatchTime / 3600);
        const minutes = Math.floor((stopwatchTime % 3600) / 60);
        const seconds = stopwatchTime % 60;
        stopwatchDisplay.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }

    // Timer functionality
    let timerInterval;
    let timerTime = 0;
    const timerDisplay = document.getElementById('timer');
    const timerInput = document.getElementById('timerInput');
    const startTimerBtn = document.getElementById('startTimer');

    startTimerBtn.addEventListener('click', function() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
            this.textContent = 'Start Timer';
        } else {
            const minutes = parseInt(timerInput.value, 10);
            if (isNaN(minutes) || minutes <= 0) {
                alert('Please enter a valid number of minutes.');
                return;
            }
            timerTime = minutes * 60;
            updateTimerDisplay();
            timerInterval = setInterval(updateTimer, 1000);
            this.textContent = 'Stop Timer';
        }
    });

    function updateTimer() {
        if (timerTime > 0) {
            timerTime--;
            updateTimerDisplay();
        } else {
            clearInterval(timerInterval);
            timerInterval = null;
            startTimerBtn.textContent = 'Start Timer';
            alert('Timer finished!');
        }
    }

    function updateTimerDisplay() {
        const hours = Math.floor(timerTime / 3600);
        const minutes = Math.floor((timerTime % 3600) / 60);
        const seconds = timerTime % 60;
        timerDisplay.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }

    function pad(num) {
        return num.toString().padStart(2, '0');
    }
});