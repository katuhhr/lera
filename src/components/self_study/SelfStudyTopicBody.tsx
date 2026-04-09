import React from 'react';
import '../../pages/student/materials/student_materials.css';
import './SelfStudyTopicBody.css';

export interface SelfStudyMaterialRow {
    id: number;
    title: string;
    type: string;
    url: string | null;
    description: string | null;
    created_at?: string | null;
}

export interface SelfStudyTaskRow {
    id: number;
    text: string;
    deadline: string | null;
}

function formatDeadline(iso: string | null | undefined): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return Number.isNaN(d.getTime())
        ? iso
        : d.toLocaleString('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
          });
}

interface Props {
    topicTitle: string;
    content: string;
    materials: SelfStudyMaterialRow[];
    tasks: SelfStudyTaskRow[];
}

/** Теория, задания и материалы (ссылки) для карточки самоподготовки. */
const SelfStudyTopicBody: React.FC<Props> = ({ topicTitle, content, materials, tasks }) => {
    return (
        <div className="self-study-topic-sections">
            <section className="materials-detail-section" aria-labelledby="self-study-theory">
                <h2 id="self-study-theory" className="materials-detail-heading">
                    Теория
                </h2>
                {content?.trim() ? (
                    <div className="lecturer-text materials-theory-body">{content}</div>
                ) : (
                    <p className="lecturer-text muted materials-empty-msg">
                        Для темы «{topicTitle}» пока нет текста теории.
                    </p>
                )}
            </section>

            <section className="materials-detail-section" aria-labelledby="self-study-tasks">
                <h2 id="self-study-tasks" className="materials-detail-heading">
                    Задания
                </h2>
                {tasks.length === 0 ? (
                    <p className="lecturer-text muted materials-empty-msg">Заданий нет.</p>
                ) : (
                    <ul className="materials-task-list">
                        {tasks.map((task) => (
                            <li key={task.id} className="materials-task-item">
                                <p className="materials-task-text">{task.text}</p>
                                <p className="materials-task-deadline">
                                    Срок: {formatDeadline(task.deadline)}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="materials-detail-section" aria-labelledby="self-study-materials">
                <h2 id="self-study-materials" className="materials-detail-heading">
                    Материалы и ссылки
                </h2>
                {materials.length === 0 ? (
                    <p className="lecturer-text muted materials-empty-msg">Дополнительных материалов нет.</p>
                ) : (
                    <ul className="materials-article-list">
                        {materials.map((m) => (
                            <li key={m.id} className="material-article-card">
                                <div className="material-article-head">
                                    <h3 className="material-article-title">{m.title}</h3>
                                    <span className="content-type-badge">{m.type}</span>
                                </div>
                                <div className="material-article-body">
                                    {m.url && (
                                        <p className="material-link-row">
                                            <a
                                                href={m.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="material-external-link"
                                            >
                                                {m.url}
                                            </a>
                                        </p>
                                    )}
                                    {m.description ? (
                                        <div className="lecturer-text material-description">{m.description}</div>
                                    ) : (
                                        !m.url && <p className="lecturer-text muted">Без описания.</p>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
};

export default SelfStudyTopicBody;
