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
    const hourDrumPicker = document.getElementById('hourDrumPicker');
    const minuteDrumPicker = document.getElementById('minuteDrumPicker');
    const periodDrumPicker = document.getElementById('periodDrumPicker');
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
    let alarmAudioContext = null;
    let alarmOscillators = [];
    let stopwatchInterval;
    let stopwatchTime = 0;
    let timerInterval;
    let timerTime = 0;
    let timerTotalTime = 0;

    // Drum Picker Implementation
    class DrumPicker {
        constructor(element, values, defaultIndex = 0) {
            this.element = element;
            this.values = values;
            this.currentIndex = defaultIndex;
            this.itemsContainer = element.querySelector('.drum-picker-items');
            this.itemHeight = 18;
            this.sensitivityMultiplier = 1.8; // Higher = less sensitive

            this.init();
            this.attachEvents();
        }

        init() {
            // Create drum items
            this.values.forEach((value, index) => {
                const item = document.createElement('div');
                item.className = 'drum-picker-item';
                item.textContent = value;
                item.dataset.index = index;
                this.itemsContainer.appendChild(item);
            });

            this.updateSelection(this.currentIndex, false);
        }

        attachEvents() {
            let startY = 0;
            let startScrollTop = 0;
            let isDragging = false;
            let lastWheelTime = 0;

            this.element.addEventListener('mousedown', (e) => {
                isDragging = true;
                startY = e.clientY;
                startScrollTop = this.currentIndex;
                this.element.style.cursor = 'grabbing';
            });

            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                const deltaY = startY - e.clientY;
                const itemsMoved = Math.round(deltaY / (this.itemHeight * this.sensitivityMultiplier));
                const newIndex = Math.max(0, Math.min(this.values.length - 1, startScrollTop + itemsMoved));
                this.updateSelection(newIndex, false);
            });

            document.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    this.element.style.cursor = 'pointer';
                    // Snap to nearest on release
                    this.updateSelection(this.currentIndex, true);
                }
            });

            // Touch events for mobile
            this.element.addEventListener('touchstart', (e) => {
                startY = e.touches[0].clientY;
                startScrollTop = this.currentIndex;
            });

            this.element.addEventListener('touchmove', (e) => {
                const deltaY = startY - e.touches[0].clientY;
                const itemsMoved = Math.round(deltaY / (this.itemHeight * this.sensitivityMultiplier));
                const newIndex = Math.max(0, Math.min(this.values.length - 1, startScrollTop + itemsMoved));
                this.updateSelection(newIndex, false);
            });

            this.element.addEventListener('touchend', () => {
                // Snap to nearest on release
                this.updateSelection(this.currentIndex, true);
            });

            // Wheel event for desktop with debounce
            this.element.addEventListener('wheel', (e) => {
                e.preventDefault();
                const now = Date.now();
                if (now - lastWheelTime < 150) return; // Debounce wheel events
                lastWheelTime = now;

                const delta = e.deltaY > 0 ? 1 : -1;
                const newIndex = Math.max(0, Math.min(this.values.length - 1, this.currentIndex + delta));
                this.updateSelection(newIndex, true);
            });
        }

        updateSelection(index, animate = true) {
            this.currentIndex = index;
            const offset = -index * this.itemHeight;

            if (animate) {
                this.itemsContainer.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            } else {
                this.itemsContainer.style.transition = 'transform 0.15s ease-out';
            }

            this.itemsContainer.style.transform = `translateY(${offset}px)`;

            // Update selected class
            const items = this.itemsContainer.querySelectorAll('.drum-picker-item');
            items.forEach((item, i) => {
                item.classList.toggle('selected', i === index);
            });
        }

        getValue() {
            return this.values[this.currentIndex];
        }

        setValue(value) {
            const index = this.values.indexOf(value);
            if (index !== -1) {
                this.updateSelection(index, true);
            }
        }
    }

    // Initialize drum pickers
    let hourPicker, minutePicker, periodPicker;

    if (hourDrumPicker) {
        const hours = Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0'));
        hourPicker = new DrumPicker(hourDrumPicker, hours, 6); // Default to 07
    }

    if (minuteDrumPicker) {
        const minutes = Array.from({length: 60}, (_, i) => i.toString().padStart(2, '0'));
        minutePicker = new DrumPicker(minuteDrumPicker, minutes, 0); // Default to 00
    }

    if (periodDrumPicker) {
        periodPicker = new DrumPicker(periodDrumPicker, ['AM', 'PM'], 0); // Default to AM
    }

    // Initialize timezone dropdown
    // Timezone persistence
    function saveTimezone(timezone) {
        localStorage.setItem('digitalClockTimezone', timezone);
        console.log('Timezone saved to localStorage:', timezone);
    }

    function loadTimezoneFromStorage() {
        try {
            const savedTimezone = localStorage.getItem('digitalClockTimezone');
            if (savedTimezone && timezoneSelect) {
                // Set the value and trigger Select2 to update
                $(timezoneSelect).val(savedTimezone).trigger('change.select2');
                console.log('Timezone loaded from localStorage:', savedTimezone);
                return savedTimezone;
            }
        } catch (e) {
            console.log('Error loading timezone from localStorage:', e);
        }

        // If no saved timezone, use browser's detected timezone
        const detectedTimezone = moment.tz.guess();
        if (timezoneSelect) {
            $(timezoneSelect).val(detectedTimezone).trigger('change.select2');
        }
        return detectedTimezone;
    }

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

        // Save timezone when changed
        timezoneSelect.addEventListener('change', function() {
            saveTimezone(timezoneSelect.value);
            updateClock();
        });

        // Load saved timezone after Select2 is initialized
        loadTimezoneFromStorage();
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
        const hour = hourPicker.getValue();
        const minute = minutePicker.getValue();
        const period = periodPicker.getValue();

        const selectedTimezone = timezoneSelect ? timezoneSelect.value : moment.tz.guess();

        // Convert 12-hour to 24-hour format
        let hours24 = parseInt(hour);
        if (period === 'PM' && hours24 !== 12) {
            hours24 += 12;
        } else if (period === 'AM' && hours24 === 12) {
            hours24 = 0;
        }

        alarmTime = moment().tz(selectedTimezone).set({hours: hours24, minutes: parseInt(minute), seconds: 0});

        // If alarm time is in the past, set it for tomorrow
        const now = moment().tz(selectedTimezone);
        if (alarmTime.isSameOrBefore(now)) {
            alarmTime.add(1, 'day');
        }

        // Save to localStorage
        const alarmData = {
            hour: hour,
            minute: minute,
            period: period,
            timezone: selectedTimezone,
            momentTime: alarmTime.toISOString()
        };
        localStorage.setItem('digitalClockAlarm', JSON.stringify(alarmData));

        // Update display immediately
        updateAlarmDisplay(now);
        console.log('Alarm saved to localStorage:', alarmData);
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
                hourPicker.setValue(alarmData.hour);
                minutePicker.setValue(alarmData.minute);
                periodPicker.setValue(alarmData.period);
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
        stopAlarmSound();
        hourPicker.setValue('07');
        minutePicker.setValue('00');
        periodPicker.setValue('AM');
        alarmDisplay.textContent = '--:--';
        alarmCountdown.textContent = 'No alarm set';
        alarmClockDisplay.classList.remove('alarm-active');
        const indicatorLabel = alarmIndicator.querySelector('.indicator-label');
        if (indicatorLabel) indicatorLabel.textContent = 'ALARM OFF';
        localStorage.removeItem('digitalClockAlarm');
        console.log('Alarm cleared');
    }

    function checkAlarm(now) {
        if (alarmTime) {
            updateAlarmDisplay(now);

            if (now.isSameOrAfter(alarmTime)) {
                playAlarmSound();
                alarmCountdown.textContent = '🔔 ALARM RINGING! 🔔';
                alarmCountdown.style.fontSize = '1.1rem';
                alarmCountdown.style.fontWeight = '900';
                alarmCountdown.style.animation = 'neonPulse 0.5s ease-in-out infinite';

                // Show alert after 2 seconds (so sound plays first)
                setTimeout(() => {
                    if (confirm('Alarm is ringing! Stop alarm?')) {
                        clearAlarm();
                    }
                }, 2000);
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

        // Display alarm time in 12-hour format
        const selectedTimezone = timezoneSelect ? timezoneSelect.value : moment.tz.guess();
        alarmDisplay.textContent = alarmTime.tz(selectedTimezone).format('hh:mm A');

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

    // Play continuous alarm sound using Web Audio API
    function playAlarmSound() {
        try {
            // Stop any existing alarm sound
            stopAlarmSound();

            // Create audio context
            alarmAudioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Pleasant melodic alarm using musical notes (C-E-G chord progression)
            // C5 (523Hz), E5 (659Hz), G5 (784Hz) - Major chord
            const melody = [
                { freq: 523, start: 0, duration: 0.5 },     // C5
                { freq: 659, start: 0.5, duration: 0.5 },   // E5
                { freq: 784, start: 1.0, duration: 0.5 },   // G5
                { freq: 659, start: 1.5, duration: 0.5 },   // E5
                { freq: 523, start: 2.0, duration: 0.5 },   // C5
                { freq: 659, start: 2.5, duration: 0.5 },   // E5
                { freq: 784, start: 3.0, duration: 0.5 },   // G5
                { freq: 659, start: 3.5, duration: 0.5 }    // E5
            ];

            const now = alarmAudioContext.currentTime;

            // Play the melody pattern 3 times (12 seconds total)
            for (let repeat = 0; repeat < 3; repeat++) {
                const repeatOffset = repeat * 4; // Each cycle is 4 seconds

                melody.forEach(note => {
                    const oscillator = alarmAudioContext.createOscillator();
                    const gainNode = alarmAudioContext.createGain();

                    oscillator.connect(gainNode);
                    gainNode.connect(alarmAudioContext.destination);

                    oscillator.frequency.value = note.freq;
                    oscillator.type = 'sine'; // Smooth sine wave for pleasant sound

                    // Gentle fade in and fade out
                    const noteStart = now + repeatOffset + note.start;
                    const noteEnd = noteStart + note.duration;

                    gainNode.gain.setValueAtTime(0, noteStart);
                    gainNode.gain.linearRampToValueAtTime(0.3, noteStart + 0.05); // Quick fade in
                    gainNode.gain.linearRampToValueAtTime(0.3, noteEnd - 0.1);    // Hold
                    gainNode.gain.linearRampToValueAtTime(0, noteEnd);            // Fade out

                    oscillator.start(noteStart);
                    oscillator.stop(noteEnd);

                    alarmOscillators.push(oscillator);
                });
            }

            console.log('Alarm sound playing - pleasant melody');
        } catch (e) {
            console.log('Error playing alarm sound:', e);
        }
    }

    // Stop alarm sound
    function stopAlarmSound() {
        try {
            if (alarmOscillators.length > 0) {
                alarmOscillators.forEach(osc => {
                    try {
                        osc.stop();
                    } catch (e) {
                        // Oscillator may already be stopped
                    }
                });
                alarmOscillators = [];
            }
            if (alarmAudioContext) {
                alarmAudioContext.close();
                alarmAudioContext = null;
            }
        } catch (e) {
            console.log('Error stopping alarm sound:', e);
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