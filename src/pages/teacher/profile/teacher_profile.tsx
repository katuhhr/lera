import React, { useState } from 'react';
import { User, Edit2, Check, LogOut } from 'lucide-react';
import './teacher_profile.css';

interface Request {
    id: string;
    studentName: string;
    date: string;
}

const TeacherProfile: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [teacherData, setTeacherData] = useState({
        name: 'Гниенко А. А.',
        role: 'Преподаватель'
    });

    const [requests, setRequests] = useState<Request[]>([
        { id: '1', studentName: 'Иванов В. А.', date: '06.03.2026' },
    ]);

    const handleAction = (id: string) => {
        setRequests(requests.filter(r => r.id !== id));
    };

    const handleLogout = () => {
        console.log("Выход из системы...");
        // Здесь будет логика очистки токена и редирект
    };

    return (
        <div className="teacher-profile-view">
            <div className="profile-white-card">
                {/* Левая сторона: Инфо и действия */}
                <div className="profile-left-side">
                    <div className="avatar-placeholder">
                        <User size={60} color="#1E3A8A" />
                    </div>

                    <div className="teacher-meta">
                        {isEditing ? (
                            <input
                                className="name-edit-field"
                                value={teacherData.name}
                                onChange={(e) => setTeacherData({...teacherData, name: e.target.value})}
                                autoFocus
                            />
                        ) : (
                            <h2 className="display-name">{teacherData.name}</h2>
                        )}
                        <p className="display-role">{teacherData.role}</p>
                    </div>

                    <div className="profile-actions-group">
                        <button
                            className={`profile-toggle-btn ${isEditing ? 'mode-save' : 'mode-edit'}`}
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            {isEditing ? <><Check size={18}/> Сохранить</> : <><Edit2 size={14}/> Изменить</>}
                        </button>

                        <button className="teacher-logout-btn" onClick={handleLogout}>
                            <LogOut size={16} /> Выйти
                        </button>
                    </div>
                </div>

                {/* Правая сторона: Заявки */}
                <div className="profile-right-side">
                    <h3 className="requests-table-title">Таблица заявок</h3>
                    <div className="requests-scroll-area">
                        <table className="requests-ui-table">
                            <thead>
                            <tr>
                                <th>№ заявки</th>
                                <th>ФИО</th>
                                <th>Дата заявки</th>
                                <th className="th-center">Действие</th>
                            </tr>
                            </thead>
                            <tbody>
                            {requests.length > 0 ? (
                                requests.map((req, index) => (
                                    <tr key={req.id}>
                                        <td className="cell-muted">Заявка №{index + 1}</td>
                                        <td className="cell-fio">{req.studentName}</td>
                                        <td className="cell-muted">{req.date}</td>
                                        <td>
                                            <div className="request-actions-wrap">
                                                <button className="req-btn-outline" onClick={() => handleAction(req.id)}>Принять</button>
                                                <button className="req-btn-outline grey" onClick={() => handleAction(req.id)}>Отклонить</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="empty-requests">Новых заявок нет</td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherProfile;