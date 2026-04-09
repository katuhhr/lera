import React, { useCallback, useEffect, useState } from 'react';
import './student_grades.css';
import { authFetch } from '../../../api/authFetch';

type GradebookPayload = {
    group_name?: string;
    student_name?: string;
    column_titles: string[];
    values: string[];
};

type ProgressResponse = {
    student_display_name?: string;
    gradebook?: GradebookPayload | null;
};

const StudentGrades: React.FC = () => {
    const [studentDisplayName, setStudentDisplayName] = useState('');
    const [gradebook, setGradebook] = useState<GradebookPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (!localStorage.getItem('access_token') && !localStorage.getItem('refresh_token')) {
                setError('Войдите в аккаунт.');
                setStudentDisplayName('');
                setGradebook(null);
                return;
            }
            const res = await authFetch('/api/student/progress/');
            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error((json as { message?: string }).message || 'Ошибка загрузки успеваемости');
            }
            const data = (json as { data?: ProgressResponse }).data;
            if (!data) {
                setStudentDisplayName('');
                setGradebook(null);
                return;
            }

            const name =
                (typeof data.student_display_name === 'string' && data.student_display_name.trim()) ||
                (data.gradebook && typeof data.gradebook.student_name === 'string'
                    ? data.gradebook.student_name.trim()
                    : '');
            setStudentDisplayName(name);
            setGradebook(data.gradebook ?? null);
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Ошибка загрузки успеваемости';
            setError(msg);
            setStudentDisplayName('');
            setGradebook(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const hasGradebookCols = gradebook && gradebook.column_titles.length > 0;

    return (
        <div className="student-grades-container">
            <div className="grades-card">
                <h1 className="grades-title">Успеваемость</h1>

                <section className="grades-section" aria-label="Ведомость преподавателя">
                    <h2 className="grades-subtitle">Оценки из ведомости</h2>
                    {!loading && !error && studentDisplayName && (
                        <p className="grades-group-label">{studentDisplayName}</p>
                    )}
                    {loading && <p className="grades-muted">Загрузка…</p>}
                    {!loading && error && <p className="grades-error">{error}</p>}
                    {!loading && !error && !hasGradebookCols && (
                        <p className="grades-muted">
                            {gradebook === null
                                ? 'У вас не указана группа.'
                                : 'Преподаватель ещё не заполнил ведомость для вашей группы или колонки пусты.'}
                        </p>
                    )}
                    {!loading && !error && hasGradebookCols && gradebook && (
                        <>
                            <div className="grades-table-wrapper gradebook-table-wrap">
                                <table className="grades-table gradebook-table">
                                    <thead>
                                        <tr>
                                            {gradebook.column_titles.map((title, i) => (
                                                <th key={i}>{title.trim() ? title : '—'}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            {gradebook.values.map((v, i) => (
                                                <td key={i}>{v.trim() ? v : '—'}</td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </section>
            </div>
        </div>
    );
};

export default StudentGrades;
