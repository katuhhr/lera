function initPageTransitions() {
    const mainPage = document.getElementById('mainPage');
    const formPage = document.getElementById('formPage');
    const overlay = document.getElementById('overlay');
    const showSignup = document.getElementById('showSignup');
    const showLogin = document.getElementById('showLogin');
    const backBtn = document.getElementById('backToMain');
    const tabs = document.querySelectorAll('.tab');
    
    // форма регистрации
    showSignup.addEventListener('click', function(e) {
        e.preventDefault();
      
        overlay.classList.add('active');
        
        mainPage.classList.add('hidden');

        setTimeout(() => {
            formPage.classList.add('active');
   
            activateTab('signup');
        }, 300);
    });
    
    showLogin.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Активируем затемнение
        overlay.classList.add('active');
        
        // Затемняем главную страницу
        mainPage.classList.add('hidden');
        
        // Показываем форму с задержкой
        setTimeout(() => {
            formPage.classList.add('active');
            
            // Активируем вкладку входа
            activateTab('login');
        }, 300);
    });
    
    // Вернуться на главную
    backBtn.addEventListener('click', function() {
        // Скрываем форму
        formPage.classList.remove('active');
        
        // Убираем затемнение
        overlay.classList.remove('active');
        
        // Возвращаем главную страницу
        setTimeout(() => {
            mainPage.classList.remove('hidden');
        }, 300);
    });
    
    // Функция для активации нужной вкладки
    function activateTab(tabId) {
        // Убираем активный класс у всех вкладок
        tabs.forEach(tab => tab.classList.remove('active'));
        
        // Добавляем активный класс нужной вкладке
        const targetTab = Array.from(tabs).find(tab => tab.dataset.tab === tabId);
        if (targetTab) {
            targetTab.classList.add('active');
        }
        
        // Переключаем содержимое
        const panes = document.querySelectorAll('.tab-pane');
        panes.forEach(pane => {
            pane.classList.remove('active');
            if (pane.id === tabId) {
                pane.classList.add('active');
            }
        });
    }
}

// Функция для показа/скрытия поля группы
function toggleGroupField(radio) {
    const groupField = document.getElementById('groupField');
    const groupInput = document.getElementById('groupInput');
    
    if (groupField && groupInput) {
        if (radio.value === 'student' && radio.checked) {
            groupField.style.display = 'block';
            groupInput.required = true;
        } else {
            groupField.style.display = 'none';
            groupInput.required = false;
            groupInput.value = '';
        }
    }
}

// Функция для переключения вкладок внутри формы
function initFormTabs() {
    const tabs = document.querySelectorAll('.tab');
    const panes = document.querySelectorAll('.tab-pane');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            const tabId = this.dataset.tab;
            
            // Убираем активный класс у всех вкладок
            tabs.forEach(t => t.classList.remove('active'));
            
            // Добавляем активный класс текущей вкладке
            this.classList.add('active');
            
            // Переключаем содержимое
            panes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === tabId) {
                    pane.classList.add('active');
                }
            });
        });
    });
}

// Функция для валидации форм
function initFormValidation() {
    // Форма регистрации
    const signupForm = document.querySelector('#signup form');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = this.querySelector('input[placeholder="Ваше ФИО"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const password = this.querySelector('input[type="password"]').value;
            const role = this.querySelector('input[name="role"]:checked');
            const group = document.getElementById('groupInput')?.value;
            
            if (!name || !email || !password || !role) {
                alert('Пожалуйста, заполните все обязательные поля');
                return;
            }
            
            if (role?.value === 'student' && !group) {
                alert('Пожалуйста, введите номер группы');
                return;
            }
            
            if (!validateEmail(email)) {
                alert('Пожалуйста, введите корректный email адрес');
                return;
            }
            
            if (password.length < 6) {
                alert('Пароль должен содержать минимум 6 символов');
                return;
            }
            
            alert('Регистрация успешна!');
            this.reset();
        });
    }
    
    // Форма входа
    const loginForm = document.querySelector('#login form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[type="email"]').value;
            const password = this.querySelector('input[type="password"]').value;
            
            if (!email || !password) {
                alert('Пожалуйста, заполните все поля');
                return;
            }
            
            if (!validateEmail(email)) {
                alert('Пожалуйста, введите корректный email адрес');
                return;
            }
            
            alert('Вход выполнен!');
        });
    }
}

// Функция для проверки email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Скрываем поле группы
    const groupField = document.getElementById('groupField');
    if (groupField) {
        groupField.style.display = 'none';
    }
    
    // Инициализируем функции
    initPageTransitions();
    initFormTabs();
    initFormValidation();
    
    // Делаем функцию доступной глобально
    window.toggleGroupField = toggleGroupField;
});