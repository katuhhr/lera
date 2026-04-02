import React, { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IRequest, ITeacher } from "../../types/types";
import './admin_page.css';

const AdminPage: FC = () => {
    const navigate = useNavigate();

    const [requests, setRequests] = useState<IRequest[]>([
        { id: 1, fullName: 'Петров. С. Р', date: '06.03.2026', status: 'pending' },
        { id: 2, fullName: 'Иванов. В. А', date: '06.03.2026', status: 'pending' },
        { id: 3, fullName: 'Сидоров. К. М', date: '06.03.2026', status: 'pending' },
    ]);

    const [teachers, setTeachers] = useState<ITeacher[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('app_teachers');
        if (saved) setTeachers(JSON.parse(saved));
    }, []);

    const handleApprove = (req: IRequest) => {
        const newTeacher: ITeacher = { id: req.id, fullName: req.fullName, role: 'Преподаватель' };
        const updatedTeachers = [...teachers, newTeacher];
        setTeachers(updatedTeachers);
        setRequests(requests.filter(r => r.id !== req.id));
        localStorage.setItem('app_teachers', JSON.stringify(updatedTeachers));
    };

    const handleReject = (id: number) => {
        setRequests(requests.filter(r => r.id !== id));
    };

    return (
        <div className="admin-page-container">
            {/* Боковая панель без вертикальной линии */}
            <aside className="admin-sidebar">
                <div className="avatar-placeholder"></div>
                <div className="admin-profile-meta">
                    <p className="meta-name">Иванов. И. И</p>
                    <p className="meta-role">Администратор</p>
                </div>
            </aside>

            {/* Основной контент с закругленными карточками */}
            <main className="admin-content-area">
                <section className="white-card requests-card">
                    <div className="card-header">
                        <h3 className="card-title">Таблица заявок</h3>
                    </div>
                    <table className="admin-table-styled">
                        <thead>
                        <tr>
                            <th>№ заявки</th>
                            <th>ФИО</th>
                            <th>Дата заявки</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {requests.map(req => (
                            <tr key={req.id}>
                                <td>Заявка №{req.id}</td>
                                <td>{req.fullName}</td>
                                <td>{req.date}</td>
                                <td className="btns-cell">
                                    <button className="outline-btn" onClick={() => handleApprove(req)}>Принять</button>
                                    <button className="outline-btn" onClick={() => handleReject(req.id)}>Отклонить</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </section>

                {teachers.length > 0 && (
                    <section className="white-card teachers-card">
                        <h3 className="card-title">Преподаватели</h3>
                        <div className="teachers-name-grid">
                            {teachers.map((t, idx) => (
                                <div
                                    key={`${t.id}-${idx}`}
                                    className="teacher-grid-item"
                                    onClick={() => navigate(`/admin/teacher/${t.id}`)}
                                >
                                    {t.fullName}
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default AdminPage;