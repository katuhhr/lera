import React, { useState } from 'react';
import { ArrowLeft, Folder } from 'lucide-react';
import './student_self_study.css';

const StudentSelfStudy: React.FC = () => {
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

    // Пример списка тем для главного экрана
    const topics = [
        "Тема №1 Неправильные глаголы",
        "Тема №2 Времена Present",
        "Тема №3 Модальные глаголы"
    ];

    // Пример контента. Если строка пустая — лист будет чистым.
    const topicContent = "";
    // const topicContent = "Здесь будет текст лекции, который закинет преподаватель...";

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
                            {selectedTopic}
                        </div>
                    </header>

                    {/* Контентная область — теперь это просто чистый текст */}
                    <div className="topic-sheet-content">
                        {topicContent && (
                            <div className="material-text-content">
                                {topicContent}
                            </div>
                        )}
                        {/* Если topicContent пустой, здесь просто белый фон листа */}
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
                    {topics.map((topic, index) => (
                        <div
                            key={index}
                            className="study-topic-pill"
                            onClick={() => setSelectedTopic(topic)}
                        >
                            <Folder size={20} color="#1E3A8A" strokeWidth={1.5} />
                            <span className="topic-pill-text">{topic}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StudentSelfStudy;