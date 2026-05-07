document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.querySelector('form[action="#"]');
    
    if (window.location.pathname.includes('register.html') && registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            
            const user = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                gender: document.getElementById('gender').value,
                dob: document.getElementById('dob').value,
                password: document.getElementById('password').value,
                regDate: new Date().toLocaleDateString('uk-UA')
            };
            
            localStorage.setItem('currentUser', JSON.stringify(user));
            alert('Реєстрація успішна! Тепер ви можете увійти.');
            window.location.href = 'login.html';
        });
    }

    if (window.location.pathname.includes('login.html') && registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('email').value;
            const passwordInput = document.getElementById('password').value;
            
            const savedUser = JSON.parse(localStorage.getItem('currentUser'));
            
            if (savedUser && savedUser.email === emailInput && savedUser.password === passwordInput) {
                localStorage.setItem('isLoggedIn', 'true');
                window.location.href = 'profile.html';
            } else {
                alert('Невірний Email або пароль!');
            }
        });
    }
});