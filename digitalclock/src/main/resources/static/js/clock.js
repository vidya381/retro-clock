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
    const stopwatchLaps = document.getElementById('stopwatchLaps');
    const stopwatchRingProgress = document.getElementById('stopwatchRingProgress');

    // Timer elements
    const timerDisplay = document.getElementById('timer');
    const timerInput = document.getElementById('timerInput');
    const startTimerBtn = document.getElementById('startTimer');
    const timerPercentage = document.getElementById('timerPercentage');
    const timerRingProgress = document.getElementById('timerRingProgress');

    // Alarm elements
    const alarmTimeInput = document.getElementById('alarmTime');
    const setAlarmBtn = document.getElementById('setAlarm');
    const cancelAlarmBtn = document.getElementById('cancelAlarm');
    const alarmDisplay = document.getElementById('alarmDisplay');
    const alarmCountdown = document.getElementById('alarmCountdown');
    const alarmIndicator = document.getElementById('alarmIndicator');
    const alarmClockDisplay = document.querySelector('.alarm-clock-display');

    // Dark mode elements
    const darkModeToggle = document.getElementById('darkModeToggle');

    // Initialize variables
    let alarmTime = null;
    let stopwatchInterval;
    let stopwatchTime = 0;
    let timerInterval;
    let timerTime = 0;
    let timerTotalTime = 0;

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
                    startStopwatchBtn.textContent = '⏸ STOP';
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
            startStopwatchBtn.textContent = '▶ START';
            saveStopwatchState();
        } else {
            stopwatchInterval = setInterval(function() {
                stopwatchTime++;
                updateStopwatchDisplay();
                saveStopwatchState();
            }, 1000);
            startStopwatchBtn.textContent = '⏸ STOP';
            saveStopwatchState();
        }
    }

    function resetStopwatch() {
        console.log('Reset Stopwatch button clicked');
        clearInterval(stopwatchInterval);
        stopwatchInterval = null;
        stopwatchTime = 0;
        updateStopwatchDisplay();
        startStopwatchBtn.textContent = '▶ START';
        localStorage.removeItem('digitalClockStopwatch');
        console.log('Stopwatch reset and cleared from storage');
    }

    function updateStopwatchDisplay() {
        const hours = Math.floor(stopwatchTime / 3600);
        const minutes = Math.floor((stopwatchTime % 3600) / 60);
        const seconds = stopwatchTime % 60;
        stopwatchDisplay.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

        // Update elapsed time display
        if (stopwatchTime === 0) {
            stopwatchLaps.textContent = '0 seconds';
        } else if (stopwatchTime === 1) {
            stopwatchLaps.textContent = '1 second';
        } else if (stopwatchTime < 60) {
            stopwatchLaps.textContent = `${stopwatchTime} seconds`;
        } else if (stopwatchTime < 3600) {
            const mins = Math.floor(stopwatchTime / 60);
            const secs = stopwatchTime % 60;
            stopwatchLaps.textContent = `${mins}m ${secs}s elapsed`;
        } else {
            const hrs = Math.floor(stopwatchTime / 3600);
            const mins = Math.floor((stopwatchTime % 3600) / 60);
            stopwatchLaps.textContent = `${hrs}h ${mins}m elapsed`;
        }

        // Update ring progress (shows current second 0-60)
        const circumference = 754;
        const secondProgress = (seconds / 60) * 100;
        const offset = circumference - (secondProgress / 100) * circumference;
        stopwatchRingProgress.style.strokeDashoffset = offset;
    }

    // Timer functionality
    function saveTimerState() {
        const timerData = {
            time: timerTime,
            totalTime: timerTotalTime,
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
                timerTotalTime = timerData.totalTime || timerData.time;
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
                            startTimerBtn.textContent = '▶ START';
                            alert('Timer finished!');
                            timerTotalTime = 0;
                            localStorage.removeItem('digitalClockTimer');
                        }
                    }, 1000);
                    startTimerBtn.textContent = '⏸ STOP';
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
            startTimerBtn.textContent = '▶ START';
            saveTimerState();
        } else {
            const minutes = parseInt(timerInput.value, 10);
            if (isNaN(minutes) || minutes <= 0) {
                alert('Please enter a valid number of minutes.');
                return;
            }
            timerTime = minutes * 60;
            timerTotalTime = timerTime;
            updateTimerDisplay();
            timerInterval = setInterval(function() {
                if (timerTime > 0) {
                    timerTime--;
                    updateTimerDisplay();
                    saveTimerState();
                } else {
                    clearInterval(timerInterval);
                    timerInterval = null;
                    startTimerBtn.textContent = '▶ START';
                    alert('Timer finished!');
                    timerTotalTime = 0;
                    localStorage.removeItem('digitalClockTimer');
                }
            }, 1000);
            startTimerBtn.textContent = '⏸ STOP';
            saveTimerState();
        }
    }

    function updateTimerDisplay() {
        const hours = Math.floor(timerTime / 3600);
        const minutes = Math.floor((timerTime % 3600) / 60);
        const seconds = timerTime % 60;
        timerDisplay.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

        // Update percentage and progress ring
        if (timerTotalTime > 0) {
            const percentage = Math.round((timerTime / timerTotalTime) * 100);
            timerPercentage.textContent = `${percentage}%`;

            // Update SVG ring (circumference = 2 * PI * radius = 2 * 3.14159 * 120 = 754)
            const circumference = 754;
            const offset = circumference - (percentage / 100) * circumference;
            timerRingProgress.style.strokeDashoffset = offset;
        } else {
            timerPercentage.textContent = '0%';
            timerRingProgress.style.strokeDashoffset = 754;
        }
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

            // Update display immediately
            const now = moment().tz(selectedTimezone);
            updateAlarmDisplay(now);
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
                const currentTime = moment();
                updateAlarmDisplay(currentTime);
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
        alarmDisplay.textContent = '--:--';
        alarmCountdown.textContent = 'No alarm set';
        alarmRingProgress.style.strokeDashoffset = 754;
        localStorage.removeItem('digitalClockAlarm');
        console.log('Alarm cleared');
    }

    function checkAlarm(now) {
        if (alarmTime) {
            updateAlarmDisplay(now);

            if (now.isSameOrAfter(alarmTime)) {
                playAlarmSound();
                // Small delay to let sound start before alert blocks
                setTimeout(() => {
                    alert('Alarm ringing!');
                    clearAlarm();
                }, 100);
            }
        }
    }

    function updateAlarmDisplay(now) {
        if (!alarmTime) {
            alarmDisplay.textContent = '--:--';
            alarmCountdown.textContent = 'No alarm set';
            alarmClockDisplay.classList.remove('alarm-active');
            const indicatorLabel = alarmIndicator.querySelector('.indicator-label');
            if (indicatorLabel) indicatorLabel.textContent = 'ALARM OFF';
            return;
        }

        // Display alarm time
        const selectedTimezone = timezoneSelect ? timezoneSelect.value : moment.tz.guess();
        alarmDisplay.textContent = alarmTime.tz(selectedTimezone).format('HH:mm');

        // Add active class
        alarmClockDisplay.classList.add('alarm-active');
        const indicatorLabel = alarmIndicator.querySelector('.indicator-label');
        if (indicatorLabel) indicatorLabel.textContent = 'ALARM ON';

        // Calculate time remaining
        const diffMs = alarmTime.diff(now);
        if (diffMs <= 0) {
            alarmCountdown.textContent = 'Ringing!';
            return;
        }

        const duration = moment.duration(diffMs);
        const hours = Math.floor(duration.asHours());
        const minutes = duration.minutes();
        const seconds = duration.seconds();

        // Format countdown text
        if (hours > 0) {
            alarmCountdown.textContent = `In ${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            alarmCountdown.textContent = `In ${minutes}m ${seconds}s`;
        } else {
            alarmCountdown.textContent = `In ${seconds}s`;
        }
    }

    // Play alarm sound using Web Audio API - longer duration
    function playAlarmSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Play multiple beeps
            for (let i = 0; i < 5; i++) {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = 800; // Frequency in Hz
                oscillator.type = 'sine';

                const startTime = audioContext.currentTime + (i * 0.5);
                const endTime = startTime + 0.3;

                gainNode.gain.setValueAtTime(0.3, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, endTime);

                oscillator.start(startTime);
                oscillator.stop(endTime);
            }
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

    // Timer preset buttons
    const presetButtons = document.querySelectorAll('.preset-btn');
    presetButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const minutes = parseInt(this.getAttribute('data-minutes'));
            timerInput.value = minutes;
            console.log(`Timer preset selected: ${minutes} minutes`);
        });
    });
    if (presetButtons.length > 0) {
        console.log('Timer preset buttons event listeners added');
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
    alarmDisplay.textContent = '--:--';
    alarmCountdown.textContent = 'No alarm set';

    // Load saved states from localStorage
    loadStopwatchFromStorage();
    loadTimerFromStorage();
    loadAlarmFromStorage();

    console.log('Clock, Stopwatch, Timer, and Alarm JavaScript fully loaded');
});