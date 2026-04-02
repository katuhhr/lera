import React, { useEffect, useMemo, useState } from 'react';
import './student_materials.css';
import { apiUrl } from '../../../config';

type ThemeListItem = {
    id: number;
    name: string;
};

type ThemeDetail = {
    id: number;
    name: string;
    theory?: {
        id: number;
        title: string;
        content: string;
    } | null;
    links?: Array<{
        id: number;
        title: string;
        url: string;
        type: string;
    }>;
    tasks?: Array<{
        id: number;
        text: string;
        deadline: string;
    }>;
};

const StudentMaterials: React.FC = () => {
    const [topics, setTopics] = useState<ThemeListItem[]>([]);
    const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
    const [topicDetail, setTopicDetail] = useState<ThemeDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [section, setSection] = useState<'theory' | 'links' | 'tasks'>('theory');

    const authHeaders = useMemo(() => {
        const token = localStorage.getItem('access_token');
        return {
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
    }, []);

    const loadThemeDetail = async (themeId: number) => {
        setDetailLoading(true);
        try {
            const res = await fetch(apiUrl(`/api/student/themes/${themeId}/`), {
                headers: authHeaders,
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error((data as { message?: string }).message || 'Не удалось загрузить тему');
            }
            const payload = data as { data?: ThemeDetail };
            setTopicDetail(payload.data || null);
        } finally {
            setDetailLoading(false);
        }
    };

    useEffect(() => {
        const loadThemes = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(apiUrl('/api/student/themes/'), {
                    headers: authHeaders,
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    throw new Error((data as { message?: string }).message || 'Не удалось загрузить темы');
                }
                const payload = data as { data?: ThemeListItem[] };
                const items = Array.isArray(payload.data) ? payload.data : [];
                setTopics(items);
                if (items.length > 0) {
                    setSelectedTopicId(items[0].id);
                    await loadThemeDetail(items[0].id);
                } else {
                    setTopicDetail(null);
                }
            } catch (e) {
                const msg = e instanceof Error ? e.message : 'Ошибка загрузки материалов';
                setError(msg);
            } finally {
                setLoading(false);
            }
        };

        void loadThemes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const selectTopic = async (themeId: number) => {
        setSelectedTopicId(themeId);
        setSection('theory');
        setError(null);
        try {
            await loadThemeDetail(themeId);
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Ошибка загрузки темы';
            setError(msg);
        }
    };

    const selectedTopicName = topicDetail?.name || 'Тема';
    const topicContent = topicDetail?.theory?.content || '';
    const links = topicDetail?.links || [];
    const tasks = topicDetail?.tasks || [];

    return (
        <div className="materials-page-container">
            {/* Левый сайдбар с темами */}
            <aside className="materials-sidebar">
                <div className="sidebar-header">
                    <span>Тема</span>
                    <span className="arrow-icon">▼</span>
                </div>
                <nav className="topics-list">
                    {loading && <div className="topic-item">Загрузка...</div>}
                    {!loading && topics.length === 0 && <div className="topic-item">Темы не найдены</div>}
                    {!loading &&
                        topics.map((topic) => (
                            <button
                                key={topic.id}
                                className={`topic-item ${selectedTopicId === topic.id ? 'active' : ''}`}
                                onClick={() => {
                                    void selectTopic(topic.id);
                                }}
                            >
                                {topic.name}
                            </button>
                        ))}
                </nav>
            </aside>

            <main className="materials-content">
                <div className="content-inner-card">
                    <header className="content-topic-header">
                        {selectedTopicName}
                    </header>

                    <div className="mini-nav">
                        <button
                            className={`mini-link ${section === 'theory' ? 'active' : ''}`}
                            onClick={() => setSection('theory')}
                            type="button"
                        >
                            Теория
                        </button>
                        <button
                            className={`mini-link ${section === 'links' ? 'active' : ''}`}
                            onClick={() => setSection('links')}
                            type="button"
                        >
                            Ссылки
                        </button>
                        <button
                            className={`mini-link ${section === 'tasks' ? 'active' : ''}`}
                            onClick={() => setSection('tasks')}
                            type="button"
                        >
                            Задания
                        </button>
                    </div>

                    <div className="content-body-sheet">
                        {detailLoading && <p className="lecturer-text">Загрузка темы...</p>}
                        {error && <p className="lecturer-text">{error}</p>}
                        {!detailLoading && !error && section === 'theory' && (
                            topicContent ? (
                                <p className="lecturer-text">{topicContent}</p>
                            ) : (
                                <p className="lecturer-text">Для этой темы пока нет теории.</p>
                            )
                        )}
                        {!detailLoading && !error && section === 'links' && (
                            links.length ? (
                                <ul className="materials-list">
                                    {links.map((link) => (
                                        <li key={link.id}>
                                            <a href={link.url} target="_blank" rel="noreferrer">
                                                {link.title}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="lecturer-text">Для этой темы пока нет ссылок.</p>
                            )
                        )}
                        {!detailLoading && !error && section === 'tasks' && (
                            tasks.length ? (
                                <ul className="materials-list">
                                    {tasks.map((task) => (
                                        <li key={task.id}>
                                            <div>{task.text}</div>
                                            {task.deadline && (
                                                <small>
                                                    Дедлайн: {new Date(task.deadline).toLocaleString('ru-RU')}
                                                </small>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="lecturer-text">Для этой темы пока нет заданий.</p>
                            )
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StudentMaterials;