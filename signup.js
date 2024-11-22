const form = document.getElementById('signupForm')
const username_input = document.getElementById('username-input')
const email_input = document.getElementById('email-input')
const password_input = document.getElementById('password-input')
const repeat_password_input = document.getElementById('repeat-password-input')

form.addEventListener('submit', async (e) => {


    let errors = []

    if(username){
        //If we have a first name input then we are in the signup
        errors = getSignupFormErrors(username_input.value, email_input.value, password_input.value, repeat_password_input.value)
    }
    else{
        // If we don't have a first name input then we are in the Login
        errors = getLoginFormErrors(email_input.value, password_input.value)
    }

    if(errors.length > 0){
        // If there are any errors
        e.preventDefault()
})
        
function getSignupFormErrors(username, email, password, repeatPassword){
    let errors = []

    if(username ==='' || username == null){
        errors.push('username is required')
        username_input.parentElement.classList.add('incorrect')
    }
    if(email ==='' || email == null){
        errors.push('email is required')
        email_input.parentElement.classList.add('incorrect')
    }
    if(password ==='' || password == null){
        errors.push('password is required')
        password_input.parentElement.classList.add('incorrect')
    }
    return errors;
}


    //try {
//    //    const response = await fetch('https://us-east1-plasma-block-441317-m4.cloudfunctions.net/budgetingappfunction/signup', {
//    //        method: 'POST',
//            headers: { 'Content-Type': 'application/json' },
//            body: JSON.stringify({ username, email, password }),
//            credentials: 'include',//
//        });
//
//        if (!response.ok) {
//            const errorData = await response.json();
//            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
//        }

//        const data = await response.json();
//        alert('Signup successful! Please log in.');
//        window.location.href = '/login.html';
//    } catch (error) {
//        console.error('Error signing up:', error.message);
//        alert(error.message || 'An error occurred during signup. Please try again.');
//    }
// });
