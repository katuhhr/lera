import React from 'react';
import { User, LogOut } from 'lucide-react';
import './student_profile.css';

const StudentProfile: React.FC = () => {
    const studentData = {
        name: 'Иванов Иван Иванович',
        group: 'ИСП-401',
        role: 'Студент'
    };

    const handleLogout = () => {
        console.log("Выход из системы...");
    };

    return (
        <div className="student-profile-view">
            <div className="profile-white-card compact">
                <div className="profile-main-info">
                    <div className="avatar-placeholder">
                        <User size={60} color="#1E3A8A" />
                    </div>

                    <div className="info-rows">
                        <div className="info-block">
                            <span className="label">ФИО</span>
                            <h2 className="display-name">{studentData.name}</h2>
                        </div>

                        <div className="info-block">
                            <span className="label">Группа</span>
                            <p className="display-group">{studentData.group}</p>
                        </div>

                        <div className="info-block">
                            <span className="label">Роль</span>
                            <p className="display-role">{studentData.role}</p>
                        </div>
                    </div>

                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={18} />
                        Выйти
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;