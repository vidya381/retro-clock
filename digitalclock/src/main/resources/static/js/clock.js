document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');

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

    // Timer elements
    const timerDisplay = document.getElementById('timer');
    const timerInput = document.getElementById('timerInput');
    const startTimerBtn = document.getElementById('startTimer');

    // Alarm elements
    const alarmTimeInput = document.getElementById('alarmTime');
    const setAlarmBtn = document.getElementById('setAlarm');
    const alarmMessage = document.getElementById('alarmMessage');
    const alarmSound = document.getElementById('alarmSound');

    // Initialize variables
    let alarmTime = null;
    let stopwatchInterval;
    let stopwatchTime = 0;
    let timerInterval;
    let timerTime = 0;

    // Initialize timezone dropdown
    if (timezoneSelect) {
        moment.tz.names().forEach(tz => {
            const option = new Option(tz, tz);
            timezoneSelect.add(option);
        });

        $(timezoneSelect).select2({
            placeholder: "Select a timezone",
            templateResult: formatTimezone,
            templateSelection: formatTimezone
        });

        timezoneSelect.addEventListener('change', updateClock);
    }

    // Clock functionality
    function updateClock() {
        const selectedTimezone = timezoneSelect ? timezoneSelect.value : moment.tz.guess();
        const now = moment().tz(selectedTimezone);
        
        if (clockElement) clockElement.textContent = now.format('HH:mm:ss');
        if (dateElement) dateElement.textContent = now.format('MMMM D, YYYY');
        if (dayElement) dayElement.textContent = now.format('dddd');
        if (timezoneElement) timezoneElement.textContent = selectedTimezone;

        checkAlarm(now);
    }

    // Update the clock every second
    setInterval(updateClock, 1000);

    // Initial update
    updateClock();

    // Stopwatch functionality
    function startStopwatch() {
        console.log('Start Stopwatch button clicked');
        if (stopwatchInterval) {
            clearInterval(stopwatchInterval);
            stopwatchInterval = null;
            startStopwatchBtn.textContent = 'Start Stopwatch';
        } else {
            stopwatchInterval = setInterval(function() {
                stopwatchTime++;
                updateStopwatchDisplay();
            }, 1000);
            startStopwatchBtn.textContent = 'Stop Stopwatch';
        }
    }

    function resetStopwatch() {
        console.log('Reset Stopwatch button clicked');
        clearInterval(stopwatchInterval);
        stopwatchInterval = null;
        stopwatchTime = 0;
        updateStopwatchDisplay();
        startStopwatchBtn.textContent = 'Start Stopwatch';
    }

    function updateStopwatchDisplay() {
        const hours = Math.floor(stopwatchTime / 3600);
        const minutes = Math.floor((stopwatchTime % 3600) / 60);
        const seconds = stopwatchTime % 60;
        stopwatchDisplay.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }

    // Timer functionality
    function startTimer() {
        console.log('Start Timer button clicked');
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
            startTimerBtn.textContent = 'Start Timer';
        } else {
            const minutes = parseInt(timerInput.value, 10);
            if (isNaN(minutes) || minutes <= 0) {
                alert('Please enter a valid number of minutes.');
                return;
            }
            timerTime = minutes * 60;
            updateTimerDisplay();
            timerInterval = setInterval(function() {
                if (timerTime > 0) {
                    timerTime--;
                    updateTimerDisplay();
                } else {
                    clearInterval(timerInterval);
                    timerInterval = null;
                    startTimerBtn.textContent = 'Start Timer';
                    alert('Timer finished!');
                }
            }, 1000);
            startTimerBtn.textContent = 'Stop Timer';
        }
    }

    function updateTimerDisplay() {
        const hours = Math.floor(timerTime / 3600);
        const minutes = Math.floor((timerTime % 3600) / 60);
        const seconds = timerTime % 60;
        timerDisplay.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }

    // Alarm functionality
    function setAlarm() {
        const alarmInput = alarmTimeInput.value;
        if (alarmInput) {
            const [hours, minutes] = alarmInput.split(':');
            alarmTime = moment().set({hours, minutes, seconds: 0});
            alarmMessage.textContent = `Alarm set for ${alarmInput}`;
        }
    }

    function checkAlarm(now) {
        if (alarmTime && now.isSameOrAfter(alarmTime)) {
            if (alarmSound) {
                alarmSound.play().catch(e => console.log('Error playing alarm sound:', e));
            }
            alert('Alarm ringing!');
            alarmTime = null;
            alarmMessage.textContent = '';
        }
    }

    // Utility functions
    function pad(num) {
        return num.toString().padStart(2, '0');
    }

    function formatTimezone(state) {
        if (!state.id) return state.text;
        const timezone = state.id;
        const currentTime = moment().tz(timezone).format('HH:mm:ss');
        return $('<span>').text(`${state.text} - ${currentTime}`);
    }

    // Event listeners
    if (startStopwatchBtn) {
        startStopwatchBtn.addEventListener('click', startStopwatch);
        console.log('Stopwatch event listener added');
    }

    if (resetStopwatchBtn) {
        resetStopwatchBtn.addEventListener('click', resetStopwatch);
        console.log('Reset Stopwatch event listener added');
    }

    if (startTimerBtn) {
        startTimerBtn.addEventListener('click', startTimer);
        console.log('Timer event listener added');
    }

    if (setAlarmBtn) {
        setAlarmBtn.addEventListener('click', setAlarm);
        console.log('Alarm event listener added');
    }

    // Initialize displays
    updateStopwatchDisplay();
    updateTimerDisplay();

    console.log('Clock, Stopwatch, Timer, and Alarm JavaScript fully loaded');
});