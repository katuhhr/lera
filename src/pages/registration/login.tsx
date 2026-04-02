import React, { useState } from 'react';
import './login.css';

const Login: React.FC = () => {
    const [view, setView] = useState<'main' | 'signup' | 'login'>('main');
    const [role, setRole] = useState<'student' | 'teacher'>('student');

    return (
        <div
            className="auth-full-page"
            style={{ backgroundImage: "url('/college.png')" }}
        >
            <div className="auth-card">
                <div className="auth-header">
                    <img className="auth-logo" src="/logo.png" alt="Logo" />
                    <div className="auth-nav-btns">
                        <button
                            className={`nav-btn reg-btn ${view === 'signup' ? 'active-nav' : ''}`}
                            onClick={() => setView('signup')}
                        >
                            Регистрация
                        </button>
                        <button
                            className={`nav-btn login-nav-btn ${view === 'login' ? 'active-nav' : ''}`}
                            onClick={() => setView('login')}
                        >
                            Войти
                        </button>
                    </div>
                </div>

                <div className="auth-body">
                    {view === 'main' ? (
                        <div className="main-welcome">
                            <h1 className="auth-title">OWLISH</h1>
                            <p className="auth-desc">
                                Специализированная платформа для английского языка.
                                Платформа создана для того, чтобы сделать изучение и
                                преподавание английского языка в колледже структурированным
                                и комфортным для всех.
                            </p>
                        </div>
                    ) : (
                        <div className="auth-form-container">
                            <button className="form-back" onClick={() => setView('main')}>← Назад</button>
                            <h2 className="form-title">{view === 'signup' ? 'Создать аккаунт' : 'Войти в аккаунт'}</h2>

                            <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
                                {view === 'signup' && (
                                    <div className="field-wrap">
                                        <input type="text" placeholder="Ваше ФИО" required />
                                    </div>
                                )}
                                <div className="field-wrap">
                                    <input type="email" placeholder="example@mail.com" required />
                                </div>
                                <div className="field-wrap">
                                    <input type="password" placeholder="Введите пароль" required />
                                </div>

                                {view === 'signup' && (
                                    <div className="role-selection-area">
                                        <div className="radio-group">
                                            <label className="radio-label">
                                                <input type="radio" name="role" checked={role === 'student'} onChange={() => setRole('student')} /> Студент
                                            </label>
                                            <label className="radio-label">
                                                <input type="radio" name="role" checked={role === 'teacher'} onChange={() => setRole('teacher')} /> Преподаватель
                                            </label>
                                        </div>
                                        {role === 'student' && (
                                            <input type="text" placeholder="Номер группы" className="group-input" required />
                                        )}
                                    </div>
                                )}

                                {view === 'login' && <p className="forgot-text"><a href="#">Забыли пароль?</a></p>}

                                <button type="submit" className="auth-submit-btn">
                                    {view === 'signup' ? 'Зарегистрироваться' : 'Войти'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;