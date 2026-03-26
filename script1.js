// Основная функция для переходов между страницами
function initPageTransitions() {
    var mainPage = document.getElementById('mainPage');
    var formPage = document.getElementById('formPage');
    var overlay = document.getElementById('overlay');
    var showSignup = document.getElementById('showSignup');
    var showLogin = document.getElementById('showLogin');
    var backBtn = document.getElementById('backToMain');
    var tabs = document.querySelectorAll('.tab');
    // Проверяем существование всех необходимых элементов
    if (!mainPage || !formPage || !overlay || !showSignup || !showLogin || !backBtn) {
        console.error('Не удалось найти необходимые элементы DOM');
        return;
    }
    // Регистрация
    showSignup.addEventListener('click', function (e) {
        e.preventDefault();
        overlay.classList.add('active');
        mainPage.classList.add('hidden');
        setTimeout(function () {
            formPage.classList.add('active');
            activateTab('signup');
        }, 300);
    });
    // Вход
    showLogin.addEventListener('click', function (e) {
        e.preventDefault();
        overlay.classList.add('active');
        mainPage.classList.add('hidden');
        setTimeout(function () {
            formPage.classList.add('active');
            activateTab('login');
        }, 300);
    });
    // Возврат на главную
    backBtn.addEventListener('click', function () {
        formPage.classList.remove('active');
        overlay.classList.remove('active');
        setTimeout(function () {
            mainPage.classList.remove('hidden');
        }, 300);
    });
    // Функция для активации вкладки
    function activateTab(tabId) {
        tabs.forEach(function (tab) { return tab.classList.remove('active'); });
        var targetTab = Array.from(tabs).find(function (tab) { return tab.dataset.tab === tabId; });
        if (targetTab) {
            targetTab.classList.add('active');
        }
        var panes = document.querySelectorAll('.tab-pane');
        panes.forEach(function (pane) {
            pane.classList.remove('active');
            if (pane.id === tabId) {
                pane.classList.add('active');
            }
        });
    }
}
// Функция для показа/скрытия поля группы
function toggleGroupField(radio) {
    var groupField = document.getElementById('groupField');
    var groupInput = document.getElementById('groupInput');
    if (!groupField || !groupInput) {
        console.error('Поле группы не найдено');
        return;
    }
    if (radio.value === 'student' && radio.checked) {
        groupField.style.display = 'block';
        groupInput.required = true;
    }
    else {
        groupField.style.display = 'none';
        groupInput.required = false;
        groupInput.value = '';
    }
}
// Функция для переключения вкладок внутри формы
function initFormTabs() {
    var tabs = document.querySelectorAll('.tab');
    var panes = document.querySelectorAll('.tab-pane');
    tabs.forEach(function (tab) {
        tab.addEventListener('click', function (e) {
            e.preventDefault();
            var tabId = tab.dataset.tab;
            if (!tabId)
                return;
            tabs.forEach(function (t) { return t.classList.remove('active'); });
            tab.classList.add('active');
            panes.forEach(function (pane) {
                pane.classList.remove('active');
                if (pane.id === tabId) {
                    pane.classList.add('active');
                }
            });
        });
    });
}
// Функция валидации email
function validateEmail(email) {
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
// Функция для валидации форм
function initFormValidation() {
    var signupForm = document.querySelector('#signup form');
    if (signupForm) {
        signupForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var formData = new FormData(signupForm);
            var name = formData.get('name');
            var email = formData.get('email');
            var password = formData.get('password');
            var role = formData.get('role');
            var group = formData.get('group');
            if (!(name === null || name === void 0 ? void 0 : name.trim()) || !(email === null || email === void 0 ? void 0 : email.trim()) || !(password === null || password === void 0 ? void 0 : password.trim()) || !role) {
                alert('Пожалуйста, заполните все обязательные поля');
                return;
            }
            if (role === 'student' && !(group === null || group === void 0 ? void 0 : group.trim())) {
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
            signupForm.reset();
            // Скрываем поле группы после сброса формы
            var groupField = document.getElementById('groupField');
            if (groupField) {
                groupField.style.display = 'none';
            }
        });
    }
    // Форма входа
    var loginForm = document.querySelector('#login form');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var formData = new FormData(loginForm);
            var email = formData.get('email');
            var password = formData.get('password');
            if (!(email === null || email === void 0 ? void 0 : email.trim()) || !(password === null || password === void 0 ? void 0 : password.trim())) {
                alert('Пожалуйста, заполните все поля');
                return;
            }
            if (!validateEmail(email)) {
                alert('Пожалуйста, введите корректный email адрес');
                return;
            }
            alert('Вход выполнен!');
            loginForm.reset();
        });
    }
}
// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
    var groupField = document.getElementById('groupField');
    if (groupField) {
        groupField.style.display = 'none';
    }
    // Инициализируем все функции
    initPageTransitions();
    initFormTabs();
    initFormValidation();
    // Делаем функцию глобально доступной (если нужно)
    window.toggleGroupField = toggleGroupField;
});
