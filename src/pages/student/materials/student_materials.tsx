<<<<<<< HEAD
import React, { useEffect, useState, useCallback } from 'react';
import { apiUrl } from '../../../config';
=======
import React, { useEffect, useMemo, useState } from 'react';
>>>>>>> 87dd4e194f5bcdb7cf0f440e13f6e51ad0596bf9
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

interface MaterialRow {
    id: number;
    title: string;
    type: string;
    url: string | null;
    description: string | null;
    created_at: string;
}

interface ThemeRow {
    id: number;
    name: string;
    materials: MaterialRow[];
}

interface MaterialsContext {
    major_name: string | null;
    course_number: number | null;
}

const StudentMaterials: React.FC = () => {
<<<<<<< HEAD
    const [themes, setThemes] = useState<ThemeRow[]>([]);
    const [context, setContext] = useState<MaterialsContext | null>(null);
    const [selected, setSelected] = useState<MaterialRow | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const token = localStorage.getItem('access_token');
    const makeHeaders = (): HeadersInit => ({
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });

    const load = useCallback(async () => {
        if (!token) {
            setLoading(false);
            setError('Войдите в аккаунт, чтобы видеть материалы.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(apiUrl('/api/student/learning-materials/'), { headers: makeHeaders() });
            const payload = await res.json().catch(() => ({}));
            if (!res.ok) {
                setError((payload as { detail?: string }).detail || 'Не удалось загрузить материалы');
                return;
            }
            const data = (payload as { data?: ThemeRow[]; context?: MaterialsContext | null }).data || [];
            const ctx = (payload as { context?: MaterialsContext | null }).context ?? null;
            setThemes(data);
            setContext(ctx);
            const firstMat = data.flatMap((t) => t.materials)[0] ?? null;
            setSelected(firstMat);
        } catch {
            setError('Нет связи с сервером.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        load();
    }, [load]);

    const headerLabel =
        context?.major_name != null && context?.course_number != null
            ? `${context.course_number} ${context.major_name}`
            : 'Учебные материалы';

    const flatMaterials = themes.flatMap((t) =>
        t.materials.map((m) => ({ theme: t.name, material: m })),
    );
=======
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
>>>>>>> 87dd4e194f5bcdb7cf0f440e13f6e51ad0596bf9

    return (
        <div className="materials-page-container">
            <aside className="materials-sidebar">
                <div className="sidebar-header">
                    <span>{headerLabel}</span>
                </div>
                <nav className="topics-list">
<<<<<<< HEAD
                    {loading && <div className="sidebar-status">Загрузка…</div>}
                    {error && <div className="sidebar-status sidebar-status-err">{error}</div>}
                    {!loading && !error && flatMaterials.length === 0 && (
                        <div className="sidebar-status">Для вашей группы пока нет материалов.</div>
                    )}
                    {themes.map((theme) => (
                        <div key={theme.id} className="sidebar-theme-block">
                            <div className="sidebar-theme-title">{theme.name}</div>
                            {theme.materials.map((m) => (
                                <button
                                    key={m.id}
                                    type="button"
                                    className={`topic-item ${selected?.id === m.id ? 'active' : ''}`}
                                    onClick={() => setSelected(m)}
                                >
                                    {m.title}
                                </button>
                            ))}
                        </div>
                    ))}
=======
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
>>>>>>> 87dd4e194f5bcdb7cf0f440e13f6e51ad0596bf9
                </nav>
            </aside>

            <main className="materials-content">
                <div className="content-inner-card">
<<<<<<< HEAD
                    {selected ? (
                        <>
                            <header className="content-topic-header">{selected.title}</header>
                            <div className="content-meta">
                                <span className="content-type-badge">{selected.type}</span>
                            </div>
                            <div className="content-body-sheet">
                                {selected.url && (
                                    <p className="material-link-row">
                                        <a
                                            href={selected.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="material-external-link"
                                        >
                                            {selected.url}
                                        </a>
                                    </p>
                                )}
                                {selected.description ? (
                                    <div className="lecturer-text material-description">{selected.description}</div>
                                ) : (
                                    !selected.url && <p className="lecturer-text muted">Нет текста.</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="content-body-sheet">
                            {!loading && <p className="lecturer-text muted">Выберите материал слева.</p>}
                        </div>
                    )}
=======
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
>>>>>>> 87dd4e194f5bcdb7cf0f440e13f6e51ad0596bf9
                </div>
            </main>
        </div>
    );
};

export default StudentMaterials;
