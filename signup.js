const form = document.getElementById('signupForm');
const username_input = document.getElementById('username-input');
const email_input = document.getElementById('email-input');
const password_input = document.getElementById('password-input');
const repeat_password_input = document.getElementById('repeat-password-input');
const error_message = document.getElementById('error-message');

form.addEventListener('submit', async (e) => {


    let errors = [];

    if(username_input){
        //If we have a first name input then we are in the signup
        errors = getSignupFormErrors(username_input.value, email_input.value, password_input.value, repeat_password_input.value);
    }
    else{
        // If we don't have a first name input then we are in the Login
        errors = getLoginFormErrors(email_input.value, password_input.value);
    }

    if(errors.length > 0){
        // If there are any errors
        e.preventDefault();
        error_message.innerText = errors.join('.');
    }
});

function getSignupFormErrors(username, email, password, repeatPassword){
    let errors = [];

    if(username === '' || username == null){
        errors.push('username is required');
        username_input.parentElement.classList.add('incorrect');
    }
    if(email === '' || email == null){
        errors.push('email is required');
        email_input.parentElement.classList.add('incorrect');
    }
    if(password === '' || password == null){
        errors.push('password is required');
        password_input.parentElement.classList.add('incorrect');
    }
    return errors;
}
