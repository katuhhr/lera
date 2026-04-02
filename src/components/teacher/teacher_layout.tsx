import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { CircleUser } from 'lucide-react';
import './teacher_layout.css';

const TeacherLayout: React.FC = () => {
    return (
        <div className="teacher-container">
            <header className="topbar">
                <div className="logo-section">
                    <img src="/logo.png" alt="logo" className="main-logo" />
                </div>

                <nav className="tabs">
                    <NavLink to="/teacher/materials" className={({ isActive }) => isActive ? "tab active" : "tab"}>
                        Учебные материалы
                    </NavLink>
                    <NavLink to="/teacher/schedule" className={({ isActive }) => isActive ? "tab active" : "tab"}>
                        Расписание
                    </NavLink>
                    <NavLink to="/teacher/grades" className={({ isActive }) => isActive ? "tab active" : "tab"}>
                        Ведомость
                    </NavLink>
                    <NavLink to="/teacher/selfstudy" className={({ isActive }) => isActive ? "tab active" : "tab"}>
                        Самоподготовка
                    </NavLink>
                </nav>

                <Link to="/teacher/profile" className="profile-section">
                    <CircleUser size={36} strokeWidth={1} color="#1E3A8A" />
                </Link>
            </header>

            <main className="layout-body">
                <Outlet />
            </main>
        </div>
    );
};

export default TeacherLayout;