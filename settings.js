document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('saveButton').addEventListener('click', function() {
      // Handle saving settings here
      console.log('Settings saved!');
    });
  });

browser.runtime.onInstalled.addListener(function() {
  console.log('Addon installed');
});
