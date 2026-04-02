import React, { FC, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ITeacherProfile } from '../../types/types';
import './teacher_profile_page_for_admin.css';

const TeacherProfilePage: FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSpecialty, setSelectedSpecialty] = useState('ИСПк');
    const [groupNumber, setGroupNumber] = useState('');

    const [profile, setProfile] = useState<ITeacherProfile>({
        id: Number(id),
        fullName: 'Петров. С. Р',
        role: 'Преподаватель',
        login: '',
        password: '',
        groups: [
            { id: 1, name: 'ИСПк', courses: ['104', '304'] },
            { id: 2, name: 'Фк', courses: ['202', '204', '403'] },
            { id: 3, name: 'Рк', courses: ['104'] },
            { id: 4, name: 'Зк', courses: ['102'] },
        ]
    });

    const [tempProfile, setTempProfile] = useState(profile);

    useEffect(() => {
        const savedData = JSON.parse(localStorage.getItem(`profile_${id}`) || 'null');
        if (savedData) {
            setProfile(savedData);
            setTempProfile(savedData);
        }
    }, [id]);

    const handleSave = () => {
        setProfile(tempProfile);
        localStorage.setItem(`profile_${id}`, JSON.stringify(tempProfile));
        setIsEditing(false);
    };

    const deleteCourse = (groupId: number, cIdx: number) => {
        if (!isEditing) return;
        setTempProfile({
            ...tempProfile,
            groups: tempProfile.groups.map(g =>
                g.id === groupId ? { ...g, courses: g.courses.filter((_, i) => i !== cIdx) } : g
            )
        });
    };

    const submitNewGroup = () => {
        if (!groupNumber.trim()) return;
        const updatedGroups = tempProfile.groups.map(g => {
            if (g.name === selectedSpecialty) {
                return { ...g, courses: [...g.courses, groupNumber] };
            }
            return g;
        });
        setTempProfile({ ...tempProfile, groups: updatedGroups });
        setGroupNumber('');
        setIsModalOpen(false);
    };

    const displayedGroups = isEditing ? tempProfile.groups : profile.groups;

    return (
        <div className="admin-page-bg">
            <div className="teacher-profile-card">
                <button className="back-link" onClick={() => navigate('/admin')}>← Назад</button>

                <div className="card-content">
                    <div className="left-side">
                        <div className="avatar-circle"></div>
                        <div className="name-info">
                            <div className="teacher-name">{profile.fullName}</div>
                            <div className="teacher-role">{profile.role}</div>
                        </div>

                        <div className="inputs-block">
                            <div className="input-row">
                                <span>Логин:</span>
                                <input
                                    type="text"
                                    value={isEditing ? tempProfile.login : profile.login}
                                    readOnly={!isEditing}
                                    onChange={e => setTempProfile({...tempProfile, login: e.target.value})}
                                />
                            </div>
                            <div className="input-row">
                                <span>Пароль:</span>
                                <input
                                    type="text"
                                    value={isEditing ? tempProfile.password : profile.password}
                                    readOnly={!isEditing}
                                    onChange={e => setTempProfile({...tempProfile, password: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="right-side">
                        <div className="table-container">
                            <div className="table-title">Группы закрепленные за преподавателем</div>
                            <table className="groups-table">
                                <thead>
                                <tr>
                                    {displayedGroups.map(g => <th key={g.id}>{g.name}</th>)}
                                </tr>
                                </thead>
                                <tbody>
                                {[0, 1, 2, 3].map(rowIndex => (
                                    <tr key={rowIndex}>
                                        {displayedGroups.map(g => (
                                            <td key={g.id}>
                                                {g.courses[rowIndex] && (
                                                    <div className="cell-content">
                                                        {g.courses[rowIndex]}
                                                        {isEditing && <span className="del-btn" onClick={() => deleteCourse(g.id, rowIndex)}>×</span>}
                                                    </div>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="bottom-buttons">
                    <button className="action-btn" onClick={() => navigate('/admin')}>Удалить</button>
                    <button className="action-btn" onClick={() => {
                        setIsEditing(!isEditing);
                        if (isEditing) setTempProfile(profile);
                    }}>
                        {isEditing ? 'Отмена' : 'Редактировать'}
                    </button>
                    <div className="spacer"></div>
                    <button className="action-btn" onClick={() => setIsModalOpen(true)}>Назначить группу</button>
                    <button className="action-btn" onClick={handleSave}>Сохранить</button>
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h3>Добавить группу</h3>
                        <select value={selectedSpecialty} onChange={(e) => setSelectedSpecialty(e.target.value)}>
                            <option value="ИСПк">ИСПк</option>
                            <option value="Фк">Фк</option>
                            <option value="Рк">Рк</option>
                            <option value="Зк">Зк</option>
                        </select>
                        <input
                            placeholder="Номер"
                            value={groupNumber}
                            onChange={(e) => setGroupNumber(e.target.value)}
                        />
                        <div className="modal-btns">
                            <button onClick={() => setIsModalOpen(false)}>Отмена</button>
                            <button onClick={submitNewGroup}>ОК</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherProfilePage;