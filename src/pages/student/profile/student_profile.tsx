import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import './student_profile.css';
import { apiUrl } from '../../../config';

type StudentProfileData = {
    id: number;
    firstname: string;
    lastname: string;
    full_name: string;
    email: string;
    role: string;
    group_name: string | null;
};

const StudentProfile: React.FC = () => {
    const navigate = useNavigate();
    const [studentData, setStudentData] = useState<StudentProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const authHeaders = useMemo(() => {
        const token = localStorage.getItem('access_token');
        return {
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    }, []);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(apiUrl('/api/student/profile/'), { headers: authHeaders });
                const json = await res.json().catch(() => ({}));
                if (!res.ok) {
                    throw new Error((json as { message?: string }).message || 'Ошибка загрузки профиля');
                }
                const data = (json as { data?: StudentProfileData }).data;
                if (!data) {
                    throw new Error('Профиль не найден');
                }
                setStudentData(data);
            } catch (e) {
                const msg = e instanceof Error ? e.message : 'Ошибка загрузки профиля';
                setError(msg);
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, [authHeaders]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/');
    };

    const profileName = studentData?.full_name || [studentData?.firstname, studentData?.lastname].filter(Boolean).join(' ') || '—';
    const profileGroup = studentData?.group_name || 'Группа не указана';
    const profileRole = studentData?.role === 'student' ? 'Студент' : (studentData?.role || '—');

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
                            <h2 className="display-name">{loading ? 'Загрузка...' : profileName}</h2>
                        </div>

                        <div className="info-block">
                            <span className="label">Группа</span>
                            <p className="display-group">{loading ? 'Загрузка...' : profileGroup}</p>
                        </div>

                        <div className="info-block">
                            <span className="label">Роль</span>
                            <p className="display-role">{loading ? 'Загрузка...' : profileRole}</p>
                        </div>
                        {!loading && error && (
                            <div className="info-block">
                                <p className="display-role">{error}</p>
                            </div>
                        )}
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