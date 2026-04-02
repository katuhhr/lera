import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, Plus, X, Trash2, Edit2, Check, ArrowLeft } from 'lucide-react';
import './teacher_materials.css';

interface Topic {
    id: number;
    title: string;
    content: string;
    isEditingTitle?: boolean;
}

const TeacherMaterials: React.FC = () => {
    const [expandedSpec, setExpandedSpec] = useState<string | null>('isp');
    const [selectedCourse, setSelectedCourse] = useState('3');
    const [topics, setTopics] = useState<Topic[]>([
        { id: 1, title: 'Тема №1 Неправильные глаголы', content: 'Текст про глаголы...' },
        { id: 2, title: 'Тема №2 Прошедшее время', content: '' }
    ]);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [isEditingContent, setIsEditingContent] = useState(false);
    const [tempContent, setTempContent] = useState('');

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [topics]);

    const addTopic = () => {
        const newTopic: Topic = {
            id: Date.now(),
            title: '',
            content: '',
            isEditingTitle: true
        };
        setTopics([...topics, newTopic]);
    };

    const deleteTopic = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setTopics(topics.filter(t => t.id !== id));
    };

    const handleTitleSave = (id: number, newTitle: string) => {
        setTopics(topics.map(t =>
            t.id === id ? { ...t, title: newTitle || 'Новая тема', isEditingTitle: false } : t
        ));
    };

    const openTopic = (topic: Topic) => {
        setSelectedTopic(topic);
        setTempContent(topic.content);
        setIsEditingContent(false);
    };

    const saveContent = () => {
        if (selectedTopic) {
            const updatedTopics = topics.map(t =>
                t.id === selectedTopic.id ? { ...t, content: tempContent } : t
            );
            setTopics(updatedTopics);
            setSelectedTopic({ ...selectedTopic, content: tempContent });
            setIsEditingContent(false);
        }
    };

    if (selectedTopic) {
        return (
            <div className="materials-page-layout">
                <main className="materials-content-view">
                    <div className="materials-white-sheet">
                        <div className="materials-view-header">
                            <h2 className="materials-view-title">{selectedTopic.title}</h2>
                            <div className="materials-header-btns">
                                {isEditingContent ? (
                                    <button className="materials-action-btn save" onClick={saveContent}>
                                        <Check size={18} /> Сохранить
                                    </button>
                                ) : (
                                    <button className="materials-action-btn edit" onClick={() => setIsEditingContent(true)}>
                                        <Edit2 size={18} /> Редактировать
                                    </button>
                                )}
                                <button className="materials-action-btn back" onClick={() => setSelectedTopic(null)}>
                                    <ArrowLeft size={18} /> Вернуться
                                </button>
                            </div>
                        </div>
                        <div className="topic-content-area">
                            <textarea
                                className="topic-editor"
                                disabled={!isEditingContent}
                                value={tempContent}
                                onChange={(e) => setTempContent(e.target.value)}
                                placeholder="Начните вводить текст материала..."
                            />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="materials-page-layout">
            <aside className="materials-nav-sidebar">
                <div className="nav-spec-container">
                    <div
                        className={`nav-spec-item ${expandedSpec === 'isp' ? 'is-active' : ''}`}
                        onClick={() => setExpandedSpec(expandedSpec === 'isp' ? null : 'isp')}
                    >
                        <span>ИСПк</span>
                        {expandedSpec === 'isp' ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </div>

                    {expandedSpec === 'isp' && (
                        <div className="nav-course-sub">
                            {['2 курс', '3 курс', '4 курс'].map(course => (
                                <div
                                    key={course}
                                    className={`nav-course-item ${selectedCourse === course[0] ? 'is-active' : ''}`}
                                    onClick={() => setSelectedCourse(course[0])}
                                >
                                    {course}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="nav-spec-static">ФКк</div>
                <div className="nav-spec-static">Рк</div>
                <div className="nav-spec-static">ПНКк</div>
            </aside>

            <main className="materials-content-view">
                <div className="materials-white-sheet">
                    <div className="materials-view-header">
                        <h2 className="materials-view-title">{selectedCourse} Курс ИСПк</h2>
                        <button className="materials-add-btn" onClick={addTopic}>
                            <Plus size={18} /> Добавить тему
                        </button>
                    </div>

                    <div className="materials-topics-stack">
                        {topics.map((topic) => (
                            <div key={topic.id} className="topic-pill-container">
                                {topic.isEditingTitle ? (
                                    <input
                                        ref={inputRef}
                                        className="topic-inline-input"
                                        placeholder="Назовите тему..."
                                        onBlur={(e) => handleTitleSave(topic.id, e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleTitleSave(topic.id, (e.target as HTMLInputElement).value)}
                                    />
                                ) : (
                                    <div className="topic-card-pill" onClick={() => openTopic(topic)}>
                                        <span>{topic.title}</span>
                                        <button className="topic-delete-btn" onClick={(e) => deleteTopic(e, topic.id)}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TeacherMaterials;