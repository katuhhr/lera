import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Folder } from 'lucide-react';
import './student_self_study.css';
import { apiUrl } from '../../../config';

type SelfStudyTopic = {
    id: number;
    title: string;
    content: string;
};

const StudentSelfStudy: React.FC = () => {
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

    // Экран просмотра конкретной темы (Второй макет — чистый лист)
    if (selectedTopic) {
        return (
            <div className="student-self-study-view">
                <main className="topic-full-sheet">
                    <header className="topic-sheet-header">
                        <button className="back-arrow-btn" onClick={() => setSelectedTopic(null)}>
                            <ArrowLeft size={22} color="#111827" />
                        </button>
                        <div className="topic-title-badge">
                            {selectedTopic.title}
                        </div>
                    </header>

                    {/* Контентная область — теперь это просто чистый текст */}
                    <div className="topic-sheet-content">
                        {selectedTopic.content && (
                            <div className="material-text-content">
                                {selectedTopic.content}
                            </div>
                        )}
                        {/* Если topicContent пустой, здесь просто белый фон листа */}
                        {!selectedTopic.content && (
                            <div className="material-text-content">Для этой темы пока нет описания.</div>
                        )}
                    </div>
                </main>
            </div>
        );
    }

    // Главный экран списка тем
    return (
        <div className="student-self-study-view">
            <div className="study-main-card">
                <h1 className="study-page-title">Самоподготовка</h1>

                <div className="study-topics-grid">
                    {loading && <div className="study-topic-pill">Загрузка...</div>}
                    {error && <div className="study-topic-pill">{error}</div>}
                    {!loading && !error && topics.length === 0 && (
                        <div className="study-topic-pill">Темы пока не добавлены.</div>
                    )}
                    {!loading && !error && topics.map((topic) => (
                        <div
                            key={topic.id}
                            className="study-topic-pill"
                            onClick={() => setSelectedTopic(topic)}
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