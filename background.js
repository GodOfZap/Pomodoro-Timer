chrome.commands.onCommand.addListener((command) => {
    if (command === "start-pomodoro") {
      chrome.browserAction.setPopup({ popup: "popup.html" });
    } else if (command === "reset-pomodoro") {
      chrome.runtime.reload();
    }
  });
  