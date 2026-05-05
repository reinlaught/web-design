document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        window.location.href = 'login.html'; 
        return;
    }

    const savedUserData = localStorage.getItem('currentUser');
    
    if (savedUserData) {
        const user = JSON.parse(savedUserData);

        document.getElementById('profile-name').innerText = user.name;
        document.getElementById('profile-email').innerText = user.email;
        document.getElementById('profile-dob').innerText = user.dob;
        document.getElementById('profile-regdate').innerText = user.regDate || 'Невідомо';

        if (user.gender === 'male') {
            document.getElementById('profile-gender').innerText = 'Чоловіча';
        } else if (user.gender === 'female') {
            document.getElementById('profile-gender').innerText = 'Жіноча';
        } else {
            document.getElementById('profile-gender').innerText = 'Не вказано';
        }
        
        if (user.name) {
            const words = user.name.trim().split(' ');
            let initials = '';
            
            if (words.length >= 2) {
                initials = words[0][0] + words[1][0];
            } else {
                initials = words[0][0];
            }
            
            document.getElementById('profile-avatar').innerText = initials.toUpperCase();
        }
    } else {
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'login.html';
    }

    const editBtn = document.getElementById('edit-btn');
    let isEditing = false; 

    if (editBtn) {
        editBtn.addEventListener('click', () => {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));

            if (!isEditing) {
                const nameCell = document.getElementById('profile-name');
                const genderCell = document.getElementById('profile-gender');
                const dobCell = document.getElementById('profile-dob');

                nameCell.innerHTML = `<input type="text" id="edit-name" value="${currentUser.name}" class="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">`;
                
                genderCell.innerHTML = `
                    <select id="edit-gender" class="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="male" ${currentUser.gender === 'male' ? 'selected' : ''}>Чоловіча</option>
                        <option value="female" ${currentUser.gender === 'female' ? 'selected' : ''}>Жіноча</option>
                    </select>
                `;

                dobCell.innerHTML = `<input type="date" id="edit-dob" value="${currentUser.dob}" class="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">`;

                editBtn.innerText = 'Зберегти зміни';
                editBtn.classList.replace('bg-blue-600', 'bg-green-600');
                editBtn.classList.replace('hover:bg-blue-700', 'hover:bg-green-700');
                
                isEditing = true;
            } else {
                const newName = document.getElementById('edit-name').value;
                const newGender = document.getElementById('edit-gender').value;
                const newDob = document.getElementById('edit-dob').value;

                currentUser.name = newName;
                currentUser.gender = newGender;
                currentUser.dob = newDob;

                localStorage.setItem('currentUser', JSON.stringify(currentUser));

                document.getElementById('profile-name').innerText = currentUser.name;
                document.getElementById('profile-gender').innerText = currentUser.gender === 'male' ? 'Чоловіча' : 'Жіноча';
                document.getElementById('profile-dob').innerText = currentUser.dob;

                if (currentUser.name) {
                    const words = currentUser.name.trim().split(' ');
                    let initials = words.length >= 2 ? words[0][0] + words[1][0] : words[0][0];
                    document.getElementById('profile-avatar').innerText = initials.toUpperCase();
                }

                editBtn.innerText = 'Редагувати профіль';
                editBtn.classList.replace('bg-green-600', 'bg-blue-600');
                editBtn.classList.replace('hover:bg-green-700', 'hover:bg-blue-700');
                
                isEditing = false;
            }
        });
    }
});