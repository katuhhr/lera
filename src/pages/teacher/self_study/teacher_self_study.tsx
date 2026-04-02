import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Trash2, Edit2, Check, ArrowLeft } from 'lucide-react';
import './teacher_self_study.css';

interface Topic {
    id: number;
    title: string;
    content: string;
    isEditingTitle?: boolean;
}

const TeacherSelfStudy: React.FC = () => {
    const [topics, setTopics] = useState<Topic[]>([
        { id: 1, title: 'Задание для самопроверки №1', content: 'Вопросы по теме...' },
        { id: 2, title: 'Дополнительные материалы по React', content: '' }
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
            t.id === id ? { ...t, title: newTitle || 'Новое задание', isEditingTitle: false } : t
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
            <div className="self-study-layout">
                <main className="self-study-view">
                    <div className="self-study-card">
                        <div className="self-study-header">
                            <h2 className="self-study-title">{selectedTopic.title}</h2>
                            <div className="self-study-header-btns">
                                {isEditingContent ? (
                                    <button className="self-study-btn save" onClick={saveContent}>
                                        <Check size={18} /> Сохранить
                                    </button>
                                ) : (
                                    <button className="self-study-btn edit" onClick={() => setIsEditingContent(true)}>
                                        <Edit2 size={18} /> Редактировать
                                    </button>
                                )}
                                <button className="self-study-btn back" onClick={() => setSelectedTopic(null)}>
                                    <ArrowLeft size={18} /> Вернуться
                                </button>
                            </div>
                        </div>
                        <div className="self-study-editor-wrap">
                            <textarea
                                className="self-study-textarea"
                                disabled={!isEditingContent}
                                value={tempContent}
                                onChange={(e) => setTempContent(e.target.value)}
                                placeholder="Введите содержание задания или вопросы для самоподготовки..."
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
                    <div className="self-study-header">
                        <h2 className="self-study-title">Самоподготовка</h2>
                        <button className="self-study-add-btn" onClick={addTopic}>
                            <Plus size={18} /> Добавить тему
                        </button>
                    </div>

                    <div className="self-study-list">
                        {topics.map((topic) => (
                            <div key={topic.id} className="self-study-item-wrap">
                                {topic.isEditingTitle ? (
                                    <input
                                        ref={inputRef}
                                        className="self-study-inline-input"
                                        placeholder="Назовите тему самоподготовки..."
                                        onBlur={(e) => handleTitleSave(topic.id, e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleTitleSave(topic.id, (e.target as HTMLInputElement).value)}
                                    />
                                ) : (
                                    <div className="self-study-pill" onClick={() => openTopic(topic)}>
                                        <span>{topic.title}</span>
                                        <button className="self-study-delete" onClick={(e) => deleteTopic(e, topic.id)}>
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

export default TeacherSelfStudy;