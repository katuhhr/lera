<<<<<<< HEAD
import React, { useState, useEffect, useCallback } from 'react';
=======
import React, { useEffect, useMemo, useState } from 'react';
>>>>>>> 87dd4e194f5bcdb7cf0f440e13f6e51ad0596bf9
import { ArrowLeft, Folder } from 'lucide-react';
import { apiUrl } from '../../../config';
import './student_self_study.css';
import { apiUrl } from '../../../config';

type SelfStudyTopic = {
    id: number;
    title: string;
    content: string;
};

interface SelfStudyRow {
    id: number;
    title: string;
    content: string;
}

const StudentSelfStudy: React.FC = () => {
<<<<<<< HEAD
    const [topics, setTopics] = useState<SelfStudyRow[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<SelfStudyRow | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(apiUrl('/api/student/self-study/'), {
                headers: { Accept: 'application/json' },
            });
            const payload = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError((payload as { detail?: string }).detail || 'Не удалось загрузить темы');
                setTopics([]);
                return;
            }
            setTopics((payload as { data?: SelfStudyRow[] }).data || []);
        } catch {
            setError('Нет связи с сервером.');
            setTopics([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);
=======
    const [topics, setTopics] = useState<SelfStudyTopic[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<SelfStudyTopic | null>(null);
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
                const res = await fetch(apiUrl('/api/student/self-study/'), {
                    headers: authHeaders,
                });
                const json = await res.json().catch(() => ({}));
                if (!res.ok) {
                    throw new Error((json as { message?: string }).message || 'Ошибка загрузки самоподготовки');
                }
                const payload = json as { data?: SelfStudyTopic[] };
                setTopics(Array.isArray(payload.data) ? payload.data : []);
            } catch (e) {
                const msg = e instanceof Error ? e.message : 'Ошибка загрузки самоподготовки';
                setError(msg);
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, [authHeaders]);
>>>>>>> 87dd4e194f5bcdb7cf0f440e13f6e51ad0596bf9

    if (selectedTopic) {
        return (
            <div className="student-self-study-view">
                <main className="topic-full-sheet">
                    <header className="topic-sheet-header">
                        <button
                            type="button"
                            className="back-arrow-btn"
                            onClick={() => setSelectedTopic(null)}
                            aria-label="Назад к списку"
                        >
                            <ArrowLeft size={22} color="#111827" />
                        </button>
<<<<<<< HEAD
                        <div className="topic-title-badge">{selectedTopic.title}</div>
=======
                        <div className="topic-title-badge">
                            {selectedTopic.title}
                        </div>
>>>>>>> 87dd4e194f5bcdb7cf0f440e13f6e51ad0596bf9
                    </header>

                    <div className="topic-sheet-content">
<<<<<<< HEAD
                        {selectedTopic.content ? (
                            <div className="material-text-content">{selectedTopic.content}</div>
                        ) : (
                            <p className="study-self-empty">Текст темы в базе не задан.</p>
                        )}
=======
                        {selectedTopic.content && (
                            <div className="material-text-content">
                                {selectedTopic.content}
                            </div>
                        )}
                        {/* Если topicContent пустой, здесь просто белый фон листа */}
                        {!selectedTopic.content && (
                            <div className="material-text-content">Для этой темы пока нет описания.</div>
                        )}
>>>>>>> 87dd4e194f5bcdb7cf0f440e13f6e51ad0596bf9
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="student-self-study-view">
            <div className="study-main-card">
                <h1 className="study-page-title">Самоподготовка</h1>
                <p className="study-page-subtitle">Общие темы из учебного каталога</p>

                {loading && <p className="study-self-status">Загрузка…</p>}
                {error && <p className="study-self-error">{error}</p>}
                {!loading && !error && topics.length === 0 && (
                    <p className="study-self-status">Общих тем пока нет.</p>
                )}

                <div className="study-topics-grid">
<<<<<<< HEAD
                    {topics.map((topic) => (
                        <div
                            key={topic.id}
                            role="button"
                            tabIndex={0}
=======
                    {loading && <div className="study-topic-pill">Загрузка...</div>}
                    {error && <div className="study-topic-pill">{error}</div>}
                    {!loading && !error && topics.length === 0 && (
                        <div className="study-topic-pill">Темы пока не добавлены.</div>
                    )}
                    {!loading && !error && topics.map((topic) => (
                        <div
                            key={topic.id}
>>>>>>> 87dd4e194f5bcdb7cf0f440e13f6e51ad0596bf9
                            className="study-topic-pill"
                            onClick={() => setSelectedTopic(topic)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setSelectedTopic(topic);
                                }
                            }}
                        >
                            <Folder size={20} color="#1E3A8A" strokeWidth={1.5} />
                            <span className="topic-pill-text">{topic.title}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StudentSelfStudy;
