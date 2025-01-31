class PomodoroTimer {
    constructor() {
      this.settings = {
        focusTime: 25,
        breakTime: 5,
        longBreakTime: 15,
        soundEnabled: true
      };
  
      this.pomodoroCount = 0;
      this.mode = 'focus'; // focus, break, longBreak
      this.loadElements();
      this.loadSettings();
      this.addEventListeners();
      this.reset();
    }
  
    loadElements() {
      this.timerDisplay = document.querySelector('.timer');
      this.startButton = document.querySelector('.start');
      this.resetButton = document.querySelector('.reset');
      this.progressBar = document.querySelector('.progress');
      this.modeDisplay = document.querySelector('.mode');
      this.notificationSound = document.getElementById('notification-sound');
    
      // Settings elements
      this.focusInput = document.querySelector('.focus-time');
      this.breakInput = document.querySelector('.break-time');
      this.longBreakInput = document.querySelector('.long-break-time');
      this.soundToggle = document.querySelector('.sound-toggle');
    }
  
    loadSettings() {
      chrome.storage.local.get(this.settings, (result) => {
        this.settings = result;
        this.updateSettingsDisplay();
      });
    }
  
    updateSettingsDisplay() {
      this.focusInput.value = this.settings.focusTime;
      this.breakInput.value = this.settings.breakTime;
      this.longBreakInput.value = this.settings.longBreakTime;
      this.soundToggle.checked = this.settings.soundEnabled;
    }
  
    addEventListeners() {
      this.startButton.addEventListener('click', () => this.toggleTimer());
      this.resetButton.addEventListener('click', () => this.reset());
  
      // Settings listeners
      this.focusInput.addEventListener('change', () => this.updateSetting('focusTime'));
      this.breakInput.addEventListener('change', () => this.updateSetting('breakTime'));
      this.longBreakInput.addEventListener('change', () => this.updateSetting('longBreakTime'));
      this.soundToggle.addEventListener('change', () => this.updateSetting('soundEnabled'));
  
      // Listen for messages from background
      chrome.runtime.onMessage.addListener((message) => {
        if (message.action === 'start') {
          this.start();
        } else if (message.action === 'reset') {
          this.reset();
        }
      });
    }
  
    updateSetting(setting) {
      const elements = {
        focusTime: this.focusInput,
        breakTime: this.breakInput,
        longBreakTime: this.longBreakInput,
        soundEnabled: this.soundToggle
      };
  
      const value = setting === 'soundEnabled' ?
        elements[setting].checked :
        parseInt(elements[setting].value);
  
      this.settings[setting] = value;
      chrome.storage.local.set({ [setting]: value });
  
      if (this.mode === 'focus' && setting === 'focusTime' ||
          this.mode === 'break' && setting === 'breakTime' ||
          this.mode === 'longBreak' && setting === 'longBreakTime') {
        this.reset();
      }
    }
  
    toggleTimer() {
      if (this.isRunning) {
        this.pause();
      } else {
        this.start();
      }
    }
  
    start() {
      this.isRunning = true;
      this.startButton.textContent = 'Pause';
      this.startButton.classList.replace('start', 'pause');
  
      this.timerInterval = setInterval(() => {
        this.timeLeft--;
        this.updateDisplay();
  
        if (this.timeLeft <= 0) {
          this.complete();
        }
      }, 1000);
    }
  
    pause() {
      this.isRunning = false;
      this.startButton.textContent = 'Start';
      this.startButton.classList.replace('pause', 'start');
      clearInterval(this.timerInterval);
    }
  
    reset() {
      this.pause();
      this.setTimeForCurrentMode();
      this.updateDisplay();
    }
  
    setTimeForCurrentMode() {
      if (this.mode === 'focus') {
        this.timeLeft = this.settings.focusTime * 60;
        this.modeDisplay.textContent = 'Focus Time';
      } else if (this.mode === 'break') {
        this.timeLeft = this.settings.breakTime * 60;
        this.modeDisplay.textContent = 'Break Time';
      } else {
        this.timeLeft = this.settings.longBreakTime * 60;
        this.modeDisplay.textContent = 'Long Break';
      }
      this.initialTime = this.timeLeft;
    }
  
    complete() {
      this.pause();
      this.playNotification();
  
      if (this.mode === 'focus') {
        this.pomodoroCount++;
        if (this.pomodoroCount % 4 === 0) {
          this.mode = 'longBreak';
        } else {
          this.mode = 'break';
        }
      } else {
        this.mode = 'focus';
      }
  
      this.reset();
      this.showNotification();
    }
  
    updateDisplay() {
      const minutes = Math.floor(this.timeLeft / 60);
      const seconds = this.timeLeft % 60;
      this.timerDisplay.textContent =
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
      const progress = (this.timeLeft / this.initialTime) * 100;
      this.progressBar.style.width = `${progress}%`;
    }
  
    playNotification() {
      if (this.settings.soundEnabled) {
        this.notificationSound.play();
      }
    }
  
    showNotification() {
      const message = this.mode === 'focus' ?
        'Time to focus!' :
        'Time for a break!';
  
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: 'Pomodoro Timer',
        message: message
      });
    }
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    const timer = new PomodoroTimer();
  });
  