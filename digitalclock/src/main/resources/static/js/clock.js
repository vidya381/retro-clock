document.addEventListener('DOMContentLoaded', function() {
    // Clock elements
    const clockElement = document.getElementById('clock');
    const dateElement = document.getElementById('date');
    const dayElement = document.getElementById('day');
    const timezoneElement = document.getElementById('timezone');
    const timezoneSelect = document.getElementById('timezoneSelect');

    // Stopwatch elements
    const stopwatchDisplay = document.getElementById('stopwatch');
    const startStopwatchBtn = document.getElementById('startStopwatch');
    const resetStopwatchBtn = document.getElementById('resetStopwatch');
    const lapStopwatchBtn = document.getElementById('lapStopwatch');
    const lapTimesDisplay = document.getElementById('lapTimes');

    // Timer elements
    const timerDisplay = document.getElementById('timer');
    const timerInput = document.getElementById('timerInput');
    const startTimerBtn = document.getElementById('startTimer');
    const preset5MinBtn = document.getElementById('preset5Min');
    const preset10MinBtn = document.getElementById('preset10Min');

    // Alarm elements
    const setAlarmBtn = document.getElementById('setAlarm');
    const alarmMessage = document.getElementById('alarmMessage');

    // Clock functionality
    function updateClock() {
        const selectedTimezone = timezoneSelect.value;
        const now = new Date(new Date().toLocaleString("en-US", {timeZone: selectedTimezone}));
        
        clockElement.textContent = now.toLocaleTimeString();
        dateElement.textContent = now.toLocaleDateString();
        dayElement.textContent = now.toLocaleDateString(undefined, { weekday: 'long' });
        timezoneElement.textContent = selectedTimezone;

        checkAlarm(now);
    }

    timezoneSelect.addEventListener('change', updateClock);

    // Update the clock every second
    setInterval(updateClock, 1000);

    // Initial update
    updateClock();

    // Stopwatch functionality
    let stopwatchInterval;
    let stopwatchTime = 0;
    let lapTimes = [];

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
        lapTimes = [];
        updateStopwatchDisplay();
        updateLapTimesDisplay();
        startStopwatchBtn.textContent = 'Start Stopwatch';
    });

    lapStopwatchBtn.addEventListener('click', function() {
        if (stopwatchInterval) {
            lapTimes.push(stopwatchTime);
            updateLapTimesDisplay();
        }
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

    function updateLapTimesDisplay() {
        lapTimesDisplay.innerHTML = lapTimes.map((time, index) => {
            const hours = Math.floor(time / 3600);
            const minutes = Math.floor((time % 3600) / 60);
            const seconds = time % 60;
            return `<div>Lap ${index + 1}: ${pad(hours)}:${pad(minutes)}:${pad(seconds)}</div>`;
        }).join('');
    }

    // Timer functionality
    let timerInterval;
    let timerTime = 0;

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

    preset5MinBtn.addEventListener('click', function() {
        setTimerPreset(5);
    });

    preset10MinBtn.addEventListener('click', function() {
        setTimerPreset(10);
    });

    function setTimerPreset(minutes) {
        timerTime = minutes * 60;
        updateTimerDisplay();
        if (!timerInterval) {
            timerInterval = setInterval(updateTimer, 1000);
            startTimerBtn.textContent = 'Stop Timer';
        }
    }

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

    // Alarm functionality
    let alarmTime = null;

    setAlarmBtn.addEventListener('click', function() {
        const alarmInput = document.getElementById('alarmTime').value;
        if (alarmInput) {
            const [hours, minutes] = alarmInput.split(':');
            alarmTime = new Date();
            alarmTime.setHours(hours, minutes, 0, 0);
            alarmMessage.textContent = `Alarm set for ${alarmInput}`;
        }
    });

    function checkAlarm(now) {
        if (alarmTime && now >= alarmTime) {
            alert('Alarm ringing!');
            alarmTime = null;
            alarmMessage.textContent = '';
        }
    }

    // Utility function
    function pad(num) {
        return num.toString().padStart(2, '0');
    }
});