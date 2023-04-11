chrome.commands.onCommand.addListener((command) => {
  if (command === "open_calculator") {
    chrome.windows.create({
      url: "popup.html",
      type: "popup",
      width: 550,
      height: 300,
    });
  }
});
