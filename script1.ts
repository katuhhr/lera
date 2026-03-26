interface FormElements extends HTMLFormElement {
    readonly elements: HTMLFormControlsCollection;
  }
  
  interface SignupFormElements extends HTMLFormControlsCollection {
    name?: HTMLInputElement;
    email?: HTMLInputElement;
    password?: HTMLInputElement;
    role?: RadioNodeList;
  }
  
  interface LoginFormElements extends HTMLFormControlsCollection {
    email?: HTMLInputElement;
    password?: HTMLInputElement;
  }
  
  // Типы для вкладок
  type TabId = 'signup' | 'login';
  
  // Основная функция для переходов между страницами
  function initPageTransitions(): void {
    const mainPage = document.getElementById('mainPage') as HTMLElement | null;
    const formPage = document.getElementById('formPage') as HTMLElement | null;
    const overlay = document.getElementById('overlay') as HTMLElement | null;
    const showSignup = document.getElementById('showSignup') as HTMLElement | null;
    const showLogin = document.getElementById('showLogin') as HTMLElement | null;
    const backBtn = document.getElementById('backToMain') as HTMLElement | null;
    const tabs = document.querySelectorAll('.tab') as NodeListOf<HTMLElement>;
  
    // Проверяем существование всех необходимых элементов
    if (!mainPage || !formPage || !overlay || !showSignup || !showLogin || !backBtn) {
      console.error('Не удалось найти необходимые элементы DOM');
      return;
    }
  
    // Регистрация
    showSignup.addEventListener('click', (e: MouseEvent) => {
      e.preventDefault();
  
      overlay.classList.add('active');
      mainPage.classList.add('hidden');
  
      setTimeout(() => {
        formPage.classList.add('active');
        activateTab('signup');
      }, 300);
    });
  
    // Вход
    showLogin.addEventListener('click', (e: MouseEvent) => {
      e.preventDefault();
  
      overlay.classList.add('active');
      mainPage.classList.add('hidden');
  
      setTimeout(() => {
        formPage.classList.add('active');
        activateTab('login');
      }, 300);
    });
  
    // Возврат на главную
    backBtn.addEventListener('click', () => {
      formPage.classList.remove('active');
      overlay.classList.remove('active');
  
      setTimeout(() => {
        mainPage.classList.remove('hidden');
      }, 300);
    });
  
    // Функция для активации вкладки
    function activateTab(tabId: TabId): void {
      tabs.forEach((tab: HTMLElement) => tab.classList.remove('active'));
  
      const targetTab = Array.from(tabs).find(
        (tab: HTMLElement) => tab.dataset.tab === tabId
      );
  
      if (targetTab) {
        targetTab.classList.add('active');
      }
  
      const panes = document.querySelectorAll('.tab-pane') as NodeListOf<HTMLElement>;
      panes.forEach((pane: HTMLElement) => {
        pane.classList.remove('active');
        if (pane.id === tabId) {
          pane.classList.add('active');
        }
      });
    }
  }
  
  // Функция для показа/скрытия поля группы
  function toggleGroupField(radio: HTMLInputElement): void {
    const groupField = document.getElementById('groupField') as HTMLElement | null;
    const groupInput = document.getElementById('groupInput') as HTMLInputElement | null;
  
    if (!groupField || !groupInput) {
      console.error('Поле группы не найдено');
      return;
    }
  
    if (radio.value === 'student' && radio.checked) {
      groupField.style.display = 'block';
      groupInput.required = true;
    } else {
      groupField.style.display = 'none';
      groupInput.required = false;
      groupInput.value = '';
    }
  }
  
  // Функция для переключения вкладок внутри формы
  function initFormTabs(): void {
    const tabs = document.querySelectorAll('.tab') as NodeListOf<HTMLElement>;
    const panes = document.querySelectorAll('.tab-pane') as NodeListOf<HTMLElement>;
  
    tabs.forEach((tab: HTMLElement) => {
      tab.addEventListener('click', (e: MouseEvent) => {
        e.preventDefault();
  
        const tabId = tab.dataset.tab as TabId | undefined;
        if (!tabId) return;
  
        tabs.forEach((t: HTMLElement) => t.classList.remove('active'));
        tab.classList.add('active');
  
        panes.forEach((pane: HTMLElement) => {
          pane.classList.remove('active');
          if (pane.id === tabId) {
            pane.classList.add('active');
          }
        });
      });
    });
  }
  
  // Функция валидации email
  function validateEmail(email: string): boolean {
    const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  // Функция для валидации форм
  function initFormValidation(): void {
    const signupForm = document.querySelector('#signup form') as HTMLFormElement | null;
  
    if (signupForm) {
      signupForm.addEventListener('submit', (e: SubmitEvent) => {
        e.preventDefault();
  
        const formData = new FormData(signupForm);
        
        const name = formData.get('name') as string | null;
        const email = formData.get('email') as string | null;
        const password = formData.get('password') as string | null;
        const role = formData.get('role') as string | null;
        const group = formData.get('group') as string | null;
  
        if (!name?.trim() || !email?.trim() || !password?.trim() || !role) {
          alert('Пожалуйста, заполните все обязательные поля');
          return;
        }
  
        if (role === 'student' && !group?.trim()) {
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
        const groupField = document.getElementById('groupField');
        if (groupField) {
          groupField.style.display = 'none';
        }
      });
    }
  
    // Форма входа
    const loginForm = document.querySelector('#login form') as HTMLFormElement | null;
  
    if (loginForm) {
      loginForm.addEventListener('submit', (e: SubmitEvent) => {
        e.preventDefault();
  
        const formData = new FormData(loginForm);
        
        const email = formData.get('email') as string | null;
        const password = formData.get('password') as string | null;
  
        if (!email?.trim() || !password?.trim()) {
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
  document.addEventListener('DOMContentLoaded', (): void => {
    const groupField = document.getElementById('groupField') as HTMLElement | null;
  
    if (groupField) {
      groupField.style.display = 'none';
    }
  
    // Инициализируем все функции
    initPageTransitions();
    initFormTabs();
    initFormValidation();
  
    // Делаем функцию глобально доступной (если нужно)
    (window as any).toggleGroupField = toggleGroupField;
  });