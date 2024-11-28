const form = document.getElementById("form");
const username_input = document.getElementById("username-input");
const email_input = document.getElementById("email-input");
const password_input = document.getElementById("password-input");
const repeat_password_input = document.getElementById("repeat-password-input");
const error_message = document.getElementById("error-message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  let errors = [];

  if (username_input) {
    //If we have a first name input then we are in the signup
    errors = getSignupFormErrors(
      username_input.value,
      email_input.value,
      password_input.value,
      repeat_password_input.value
    );
  } else {
    // If we don't have a first name input then we are in the Login
    errors = getLoginFormErrors(email_input.value, password_input.value);
  }

  if (errors.length > 0) {
    // If there are any errors
    error_message.innerText = errors.join(".");
  }

  const url = "https://us-east1-plasma-block-441317-m4.cloudfunctions.net/budgetingappfunction";
  if (username_input) {
    fetch(
      `${url}/signup/signup`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username_input.value,
          email: email_input.value,
          password: password_input.value,
        }),
      }
    )
      .then((response) => {
        if (response.ok) {
          alert("Registered Successfully!");
        } else {
          alert(`HTTP ERROR: ${response.status}`);
        }
      })
      .catch((err) => {
        console.log("signup error", err);
      });
  } else {
    fetch(
      `${url}/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email_input.value,
          password: password_input.value,
        }),
      }
    )
      .then((response) => {
        if (response.ok) {
          alert("Login Successfully!");
          window.location.href = "dashboard.html"
        } else {
          alert(`HTTP ERROR: ${response.status}`);
        }
      })
      .catch((err) => {
        console.log("Login error", err);
      });
  }
});

function getSignupFormErrors(username, email, password, repeatPassword) {
  let errors = [];

  if (username === "" || username == null) {
    errors.push("username is required");
    username_input.parentElement.classList.add("incorrect");
  }
  if (email === "" || email == null) {
    errors.push("email is required");
    email_input.parentElement.classList.add("incorrect");
  }
  if (password === "" || password == null) {
    errors.push("password is required");
    password_input.parentElement.classList.add("incorrect");
  }
  if (password.length < 8) {
    errors.push("Password must have at least 8 characters");
    password_input.parentElement.classList.add("incorrect");
  }
  if (password !== repeatPassword) {
    errors.push("Password does not match repeated password");
  }
  return errors;
}

function getLoginFormErrors(email, password) {
  let errors = [];
  if (email === "" || email == null) {
    errors.push("email is required");
    email_input.parentElement.classList.add("incorrect");
  }
  if (password === "" || password == null) {
    errors.push("password is required");
    password_input.parentElement.classList.add("incorrect");
  }
  return errors;
}

const allInputs = [
  username_input,
  email_input,
  password_input,
  repeat_password_input,
].filter((input) => input != null);

allInputs.forEach((input) => {
  input.addEventListener("input", () => {
    if (input.parentElement.classList.contains("incorrect")) {
      input.parentElement.classList.remove("incorrect");
      error_message.innerText = "";
    }
  });
});
