import React, { useEffect, useMemo, useState } from 'react';
import './student_debts.css';
import { apiUrl } from '../../../config';

type DashboardTask = {
    task_id: number;
    title: string;
    theme: string;
    deadline?: string;
    date?: string;
};

const StudentDebts: React.FC = () => {
    const [currentTasks, setCurrentTasks] = useState<DashboardTask[]>([]);
    const [debtTasks, setDebtTasks] = useState<DashboardTask[]>([]);
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
                const res = await fetch(apiUrl('/api/student/dashboard/'), {
                    headers: authHeaders,
                });
                const json = await res.json().catch(() => ({}));
                if (!res.ok) {
                    throw new Error((json as { message?: string }).message || 'Ошибка загрузки долгов');
                }
                const data = (json as { data?: { current_tasks?: DashboardTask[]; debts?: DashboardTask[] } }).data;
                setCurrentTasks(Array.isArray(data?.current_tasks) ? data!.current_tasks! : []);
                const onlyTaskDebts = Array.isArray(data?.debts)
                    ? data!.debts!.filter((item) => (item as { type?: string }).type === 'task' || !('type' in item))
                    : [];
                setDebtTasks(onlyTaskDebts);
            } catch (e) {
                const msg = e instanceof Error ? e.message : 'Ошибка загрузки долгов';
                setError(msg);
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, [authHeaders]);

    const fmtDeadline = (value?: string) => {
        if (!value) return '';
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return value;
        return d.toLocaleString('ru-RU');
    };

    return (
        <div className="student-debts-view">
            <div className="debts-stack">

                <div className="debt-section-card">
                    <div className="debt-badge">Текущее задание</div>
                    <div className="debt-blue-box">
                        {loading && <p className="debt-text">Загрузка...</p>}
                        {error && <p className="debt-text">{error}</p>}
                        {!loading && !error && currentTasks.length === 0 && (
                            <p className="debt-text">Текущих заданий нет.</p>
                        )}
                        {!loading &&
                            !error &&
                            currentTasks.map((task) => (
                                <div className="debt-item-row" key={`current-${task.task_id}`}>
                                    <p className="debt-text">
                                        {task.title}
                                        {task.theme ? ` (${task.theme})` : ''}
                                        {task.deadline ? ` — до ${fmtDeadline(task.deadline)}` : ''}
                                    </p>
                                </div>
                            ))}
                    </div>
                </div>

                <div className="debt-section-card">
                    <div className="debt-badge">Долги</div>
                    <div className="debt-blue-box">
                        {loading && <p className="debt-text">Загрузка...</p>}
                        {error && <p className="debt-text">{error}</p>}
                        {!loading && !error && debtTasks.length === 0 && (
                            <p className="debt-text">Просроченных заданий нет.</p>
                        )}
                        {!loading &&
                            !error &&
                            debtTasks.map((task) => (
                                <div className="debt-item-row" key={`debt-${task.task_id}`}>
                                    <span className="red-dot"></span>
                                    <p className="debt-text">
                                        {task.title}
                                        {task.theme ? ` (${task.theme})` : ''}
                                        {task.deadline ? ` — дедлайн ${fmtDeadline(task.deadline)}` : ''}
                                    </p>
                                </div>
                            ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StudentDebts;