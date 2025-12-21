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
    const cancelAlarmBtn = document.getElementById('cancelAlarm');
    const alarmMessage = document.getElementById('alarmMessage');

    // Dark mode elements
    const darkModeToggle = document.getElementById('darkModeToggle');

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
    function saveStopwatchState() {
        const stopwatchData = {
            time: stopwatchTime,
            isRunning: stopwatchInterval !== null,
            timestamp: Date.now()
        };
        localStorage.setItem('digitalClockStopwatch', JSON.stringify(stopwatchData));
    }

    function loadStopwatchFromStorage() {
        try {
            const storedStopwatch = localStorage.getItem('digitalClockStopwatch');
            if (storedStopwatch) {
                const stopwatchData = JSON.parse(storedStopwatch);
                stopwatchTime = stopwatchData.time;

                // If it was running, calculate elapsed time since last save
                if (stopwatchData.isRunning) {
                    const elapsedSeconds = Math.floor((Date.now() - stopwatchData.timestamp) / 1000);
                    stopwatchTime += elapsedSeconds;

                    // Restart the stopwatch
                    stopwatchInterval = setInterval(function() {
                        stopwatchTime++;
                        updateStopwatchDisplay();
                        saveStopwatchState();
                    }, 1000);
                    startStopwatchBtn.textContent = 'Stop Stopwatch';
                }

                updateStopwatchDisplay();
                console.log('Stopwatch loaded from localStorage:', stopwatchData);
            }
        } catch (error) {
            console.error('Error loading stopwatch from localStorage:', error);
            localStorage.removeItem('digitalClockStopwatch');
        }
    }

    function startStopwatch() {
        console.log('Start Stopwatch button clicked');
        if (stopwatchInterval) {
            clearInterval(stopwatchInterval);
            stopwatchInterval = null;
            startStopwatchBtn.textContent = 'Start Stopwatch';
            saveStopwatchState();
        } else {
            stopwatchInterval = setInterval(function() {
                stopwatchTime++;
                updateStopwatchDisplay();
                saveStopwatchState();
            }, 1000);
            startStopwatchBtn.textContent = 'Stop Stopwatch';
            saveStopwatchState();
        }
    }

    function resetStopwatch() {
        console.log('Reset Stopwatch button clicked');
        clearInterval(stopwatchInterval);
        stopwatchInterval = null;
        stopwatchTime = 0;
        updateStopwatchDisplay();
        startStopwatchBtn.textContent = 'Start Stopwatch';
        localStorage.removeItem('digitalClockStopwatch');
        console.log('Stopwatch reset and cleared from storage');
    }

    function updateStopwatchDisplay() {
        const hours = Math.floor(stopwatchTime / 3600);
        const minutes = Math.floor((stopwatchTime % 3600) / 60);
        const seconds = stopwatchTime % 60;
        stopwatchDisplay.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }

    // Timer functionality
    function saveTimerState() {
        const timerData = {
            time: timerTime,
            isRunning: timerInterval !== null,
            timestamp: Date.now(),
            inputValue: timerInput.value
        };
        localStorage.setItem('digitalClockTimer', JSON.stringify(timerData));
    }

    function loadTimerFromStorage() {
        try {
            const storedTimer = localStorage.getItem('digitalClockTimer');
            if (storedTimer) {
                const timerData = JSON.parse(storedTimer);
                timerTime = timerData.time;
                timerInput.value = timerData.inputValue || '';

                // If it was running, calculate elapsed time since last save
                if (timerData.isRunning) {
                    const elapsedSeconds = Math.floor((Date.now() - timerData.timestamp) / 1000);
                    timerTime -= elapsedSeconds;

                    // Check if timer finished while page was closed
                    if (timerTime <= 0) {
                        timerTime = 0;
                        updateTimerDisplay();
                        alert('Timer finished!');
                        localStorage.removeItem('digitalClockTimer');
                        console.log('Timer completed while page was closed');
                        return;
                    }

                    // Restart the timer
                    timerInterval = setInterval(function() {
                        if (timerTime > 0) {
                            timerTime--;
                            updateTimerDisplay();
                            saveTimerState();
                        } else {
                            clearInterval(timerInterval);
                            timerInterval = null;
                            startTimerBtn.textContent = 'Start Timer';
                            alert('Timer finished!');
                            localStorage.removeItem('digitalClockTimer');
                        }
                    }, 1000);
                    startTimerBtn.textContent = 'Stop Timer';
                }

                updateTimerDisplay();
                console.log('Timer loaded from localStorage:', timerData);
            }
        } catch (error) {
            console.error('Error loading timer from localStorage:', error);
            localStorage.removeItem('digitalClockTimer');
        }
    }

    function startTimer() {
        console.log('Start Timer button clicked');
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
            startTimerBtn.textContent = 'Start Timer';
            saveTimerState();
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
                    saveTimerState();
                } else {
                    clearInterval(timerInterval);
                    timerInterval = null;
                    startTimerBtn.textContent = 'Start Timer';
                    alert('Timer finished!');
                    localStorage.removeItem('digitalClockTimer');
                }
            }, 1000);
            startTimerBtn.textContent = 'Stop Timer';
            saveTimerState();
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
            const selectedTimezone = timezoneSelect ? timezoneSelect.value : moment.tz.guess();
            const [hours, minutes] = alarmInput.split(':');
            alarmTime = moment().tz(selectedTimezone).set({hours, minutes, seconds: 0});

            // Save to localStorage
            const alarmData = {
                time: alarmInput,
                timezone: selectedTimezone,
                momentTime: alarmTime.toISOString()
            };
            localStorage.setItem('digitalClockAlarm', JSON.stringify(alarmData));

            alarmMessage.textContent = `Alarm set for ${alarmInput} (${selectedTimezone})`;
            console.log('Alarm saved to localStorage:', alarmData);
        }
    }

    function loadAlarmFromStorage() {
        try {
            const storedAlarm = localStorage.getItem('digitalClockAlarm');
            if (storedAlarm) {
                const alarmData = JSON.parse(storedAlarm);
                alarmTime = moment(alarmData.momentTime);

                // Check if alarm is in the past
                const now = moment();
                if (alarmTime.isBefore(now)) {
                    console.log('Stored alarm is in the past, clearing...');
                    clearAlarm();
                    return;
                }

                // Restore alarm UI
                alarmTimeInput.value = alarmData.time;
                alarmMessage.textContent = `Alarm set for ${alarmData.time} (${alarmData.timezone})`;
                console.log('Alarm loaded from localStorage:', alarmData);
            }
        } catch (error) {
            console.error('Error loading alarm from localStorage:', error);
            localStorage.removeItem('digitalClockAlarm');
        }
    }

    function clearAlarm() {
        alarmTime = null;
        alarmTimeInput.value = '';
        alarmMessage.textContent = '';
        localStorage.removeItem('digitalClockAlarm');
        console.log('Alarm cleared');
    }

    function checkAlarm(now) {
        if (alarmTime && now.isSameOrAfter(alarmTime)) {
            playAlarmSound();
            alert('Alarm ringing!');
            clearAlarm();
        }
    }

    // Play alarm sound using Web Audio API
    function playAlarmSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800; // Frequency in Hz
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 1);
        } catch (e) {
            console.log('Error playing alarm sound:', e);
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

    // Dark mode functionality
    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
        console.log('Dark mode:', isDarkMode ? 'enabled' : 'disabled');
    }

    function loadDarkModePreference() {
        const darkModePreference = localStorage.getItem('darkMode');
        if (darkModePreference === 'enabled') {
            document.body.classList.add('dark-mode');
            console.log('Dark mode loaded from localStorage: enabled');
        } else {
            console.log('Dark mode loaded from localStorage: disabled');
        }
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

    if (cancelAlarmBtn) {
        cancelAlarmBtn.addEventListener('click', clearAlarm);
        console.log('Cancel Alarm event listener added');
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
        console.log('Dark mode toggle event listener added');
    }

    // Load dark mode preference first
    loadDarkModePreference();

    // Initialize displays
    updateStopwatchDisplay();
    updateTimerDisplay();

    // Load saved states from localStorage
    loadStopwatchFromStorage();
    loadTimerFromStorage();
    loadAlarmFromStorage();

    console.log('Clock, Stopwatch, Timer, and Alarm JavaScript fully loaded');
});