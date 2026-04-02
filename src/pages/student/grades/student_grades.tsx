import React, { useEffect, useMemo, useState } from 'react';
import './student_grades.css';
import { apiUrl } from '../../../config';

type ProgressResponse = {
    attendance: Array<{ date_str: string; is_came: boolean; is_completed: boolean }>;
    test_results: Array<{ test_name: string; date: string; score: number; max_score: number; percentage: number }>;
    tasks: Array<{ task_name: string; deadline: string; status: string; grade: number | null }>;
};

type TableRow = {
    date: string;
    dialog: string;
    test: string;
    work1: string;
    work2: string;
    work3: string;
    work4: string;
    work5: string;
};

const StudentGrades: React.FC = () => {
    const [gradesData, setGradesData] = useState<TableRow[]>([]);
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
                const res = await fetch(apiUrl('/api/student/progress/'), { headers: authHeaders });
                const json = await res.json().catch(() => ({}));
                if (!res.ok) {
                    throw new Error((json as { message?: string }).message || 'Ошибка загрузки успеваемости');
                }
                const data = (json as { data?: ProgressResponse }).data;
                if (!data) {
                    setGradesData([]);
                    return;
                }

                const rows: TableRow[] = [];

                data.attendance.forEach((a) => {
                    rows.push({
                        date: a.date_str || '',
                        dialog: a.is_came ? '+' : '-',
                        test: '',
                        work1: a.is_completed ? 'сдано' : 'не сдано',
                        work2: '',
                        work3: '',
                        work4: '',
                        work5: '',
                    });
                });

                data.test_results.forEach((t) => {
                    rows.push({
                        date: t.date || '',
                        dialog: '',
                        test: `${t.score}/${t.max_score} (${t.percentage}%)`,
                        work1: t.test_name || '',
                        work2: '',
                        work3: '',
                        work4: '',
                        work5: '',
                    });
                });

                data.tasks.forEach((t) => {
                    rows.push({
                        date: t.deadline ? new Date(t.deadline).toLocaleDateString('ru-RU') : '',
                        dialog: '',
                        test: '',
                        work1: t.task_name || '',
                        work2: t.status || '',
                        work3: t.grade === null ? '' : String(t.grade),
                        work4: '',
                        work5: '',
                    });
                });

                rows.sort((a, b) => {
                    const da = Date.parse(a.date.split('.').reverse().join('-')) || Date.parse(a.date) || 0;
                    const db = Date.parse(b.date.split('.').reverse().join('-')) || Date.parse(b.date) || 0;
                    return db - da;
                });

                setGradesData(rows);
            } catch (e) {
                const msg = e instanceof Error ? e.message : 'Ошибка загрузки успеваемости';
                setError(msg);
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, [authHeaders]);

    return (
        <div className="student-grades-container">
            <div className="grades-card">
                <h1 className="grades-title">Успеваемость</h1>

                <div className="grades-table-wrapper">
                    <table className="grades-table">
                        <thead>
                        <tr>
                            <th className="sticky-col">Дата</th>
                            <th>Диалог</th>
                            <th>Тест</th>
                            <th></th>
                            <th></th>
                            <th></th>
                            <th></th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading && (
                            <tr>
                                <td className="sticky-col" colSpan={8}>Загрузка...</td>
                            </tr>
                        )}
                        {error && !loading && (
                            <tr>
                                <td className="sticky-col" colSpan={8}>{error}</td>
                            </tr>
                        )}
                        {!loading && !error && gradesData.length === 0 && (
                            <tr>
                                <td className="sticky-col" colSpan={8}>Данных пока нет.</td>
                            </tr>
                        )}
                        {gradesData.map((row, index) => (
                            <tr key={index}>
                                <td className="date-cell sticky-col">{row.date}</td>
                                <td>{row.dialog}</td>
                                <td>{row.test}</td>
                                <td>{row.work1}</td>
                                <td>{row.work2}</td>
                                <td>{row.work3}</td>
                                <td>{row.work4}</td>
                                <td>{row.work5}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentGrades;