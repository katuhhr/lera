import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Folder } from 'lucide-react';
import { authFetch } from '../../../api/authFetch';
import SelfStudyTopicBody, {
    type SelfStudyMaterialRow,
    type SelfStudyTaskRow,
} from '../../../components/self_study/SelfStudyTopicBody';
import './teacher_self_study.css';

interface SelfStudyRow {
    id: number;
    title: string;
    content: string;
    kind?: 'self_study' | 'common_theme';
    materials?: SelfStudyMaterialRow[];
    tasks?: SelfStudyTaskRow[];
}

const TeacherSelfStudy: React.FC = () => {
    const [topics, setTopics] = useState<SelfStudyRow[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<SelfStudyRow | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadList = useCallback(async () => {
        const token =
            localStorage.getItem('access_token') || localStorage.getItem('refresh_token');
        if (!token) {
            setLoading(false);
            setError('Войдите как преподаватель.');
            setTopics([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await authFetch('/api/admin/teacher/self-study/');
            const payload = await res.json().catch(() => ({}));
            if (!res.ok) {
                const d = (payload as { detail?: unknown }).detail;
                const msg =
                    typeof d === 'string'
                        ? d
                        : res.status === 401
                          ? 'Сессия истекла. Войдите снова.'
                          : 'Не удалось загрузить темы самоподготовки';
                setError(msg);
                setTopics([]);
                return;
            }
            const raw = (payload as { data?: SelfStudyRow[] }).data || [];
            setTopics(
                raw.map((t) => ({
                    ...t,
                    materials: Array.isArray(t.materials) ? t.materials : [],
                    tasks: Array.isArray(t.tasks) ? t.tasks : [],
                })),
            );
        } catch {
            setError('Нет связи с сервером.');
            setTopics([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadList();
    }, [loadList]);

    if (selectedTopic) {
        return (
            <div className="self-study-layout">
                <main className="self-study-view">
                    <div className="self-study-card">
                        <div className="self-study-header">
                            <h2 className="self-study-title">{selectedTopic.title}</h2>
                            <div className="self-study-header-btns">
                                <button
                                    type="button"
                                    className="self-study-btn back"
                                    onClick={() => setSelectedTopic(null)}
                                >
                                    <ArrowLeft size={18} /> Вернуться
                                </button>
                            </div>
                        </div>
                        <div className="self-study-editor-wrap self-study-readonly-body self-study-detail-body">
                            <SelfStudyTopicBody
                                topicTitle={selectedTopic.title}
                                content={selectedTopic.content}
                                materials={selectedTopic.materials ?? []}
                                tasks={selectedTopic.tasks ?? []}
                            />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="self-study-layout">
            <main className="self-study-view">
                <div className="self-study-card">
                    <div className="self-study-header self-study-header-list">
                        <div className="self-study-header-left">
                            <h2 className="self-study-title">Самоподготовка</h2>
                        </div>
                    </div>

                    {loading && <p className="self-study-status">Загрузка…</p>}
                    {error && <p className="self-study-error">{error}</p>}

                    {!loading && !error && topics.length === 0 && (
                        <p className="self-study-status">В базе пока нет тем самоподготовки.</p>
                    )}

                    <div className="self-study-list">
                        {topics.map((topic) => (
                            <div key={`${topic.kind ?? 'row'}-${topic.id}`} className="self-study-item-wrap">
                                <button
                                    type="button"
                                    className="self-study-pill self-study-pill-readonly"
                                    onClick={() => setSelectedTopic(topic)}
                                >
                                    <Folder size={18} color="#1E3A8A" strokeWidth={1.5} />
                                    <span>{topic.title}</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TeacherSelfStudy;
