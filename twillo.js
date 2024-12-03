document.getElementById('twilio-setup-form').addEventListener('submit', function(event) {
  event.preventDefault();

  const accountSid = document.getElementById('accountSid').value;
  const authToken = document.getElementById('authToken').value;
  const phoneNumber = document.getElementById('phoneNumber').value;

  // Save the settings (e.g., send them to your server or save in local storage)
  // Example using local storage:
  localStorage.setItem('twilioAccountSid', accountSid);
  localStorage.setItem('twilioAuthToken', authToken);
  localStorage.setItem('twilioPhoneNumber', phoneNumber);

  alert('Twilio settings saved successfully!');
});
