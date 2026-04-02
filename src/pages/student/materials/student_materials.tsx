import React, { useState } from 'react';
import './student_materials.css';

const StudentMaterials: React.FC = () => {
    const topics = [
        "Тема №1",
        "Тема №2",
        "Тема №3"
    ];

    const [selectedTopic, setSelectedTopic] = useState(topics[0]);

    const topicContent = "";

    return (
        <div className="materials-page-container">
            {/* Левый сайдбар с темами */}
            <aside className="materials-sidebar">
                <div className="sidebar-header">
                    <span>Тема</span>
                    <span className="arrow-icon">▼</span>
                </div>
                <nav className="topics-list">
                    {topics.map((topic) => (
                        <button
                            key={topic}
                            className={`topic-item ${selectedTopic === topic ? 'active' : ''}`}
                            onClick={() => setSelectedTopic(topic)}
                        >
                            {topic}
                        </button>
                    ))}
                </nav>
            </aside>

            <main className="materials-content">
                <div className="content-inner-card">
                    <header className="content-topic-header">
                        {selectedTopic}
                    </header>

                    <div className="content-body-sheet">
                        {topicContent && (
                            <p className="lecturer-text">
                                {topicContent}
                            </p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StudentMaterials;