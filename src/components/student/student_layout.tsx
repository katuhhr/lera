import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { CircleUser } from 'lucide-react';
import './student_layout.css';

const StudentLayout: React.FC = () => {
    return (
        <div className="student-container">
            <header className="student-topbar">
                <div className="student-logo-section">
                    <img src="/logo.png" alt="logo" className="student-main-logo" />
                </div>

                <nav className="student-tabs">
                    <NavLink to="/student/materials" className={({ isActive }) => isActive ? "student-tab active" : "student-tab"}>
                        Учебные материалы
                    </NavLink>
                    <NavLink to="/student/debts" className={({ isActive }) => isActive ? "student-tab active" : "student-tab"}>
                        Долги
                    </NavLink>
                    <NavLink to="/student/selfstudy" className={({ isActive }) => isActive ? "student-tab active" : "student-tab"}>
                        Самоподготовка
                    </NavLink>
                    <NavLink to="/student/grades" className={({ isActive }) => isActive ? "student-tab active" : "student-tab"}>
                        Успеваемость
                    </NavLink>
                </nav>

                <div className="student-profile-wrapper">
                    <Link to="/student/profile" className="student-profile-link">
                        <CircleUser size={38} strokeWidth={1} color="#1E3A8A" />
                    </Link>
                </div>
            </header>

            <main className="student-layout-body">
                <Outlet />
            </main>
        </div>
    );
};

export default StudentLayout;