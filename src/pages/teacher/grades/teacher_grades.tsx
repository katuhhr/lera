import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Check, Edit2 } from 'lucide-react';
import './teacher_grades.css';

const TeacherGrades: React.FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [expandedSpec, setExpandedSpec] = useState<string | null>('rk');
    const [selectedCourse, setSelectedCourse] = useState('2');
    const [selectedGroup, setSelectedGroup] = useState('Рк-204');

    const [columns, setColumns] = useState(['Урок №1', 'Диалог', 'Урок №2', '', '']);
    const [students] = useState([
        'Иванов В.А',
        'Петров С.П',
        'Сидоров К.М',
        'Алексеев Д.С',
        'Борисов А.В'
    ]);
    const [grades, setGrades] = useState<Record<string, string>>({
        '0-0': '+',
        '0-1': '—'
    });

    const addColumn = () => {
        setColumns([...columns, '']);
    };

    const updateColumnName = (index: number, value: string) => {
        const newCols = [...columns];
        newCols[index] = value;
        setColumns(newCols);
    };

    return (
        <div className="grades-page-layout">
            <aside className="grades-nav-sidebar">
                <div className="nav-spec-container">
                    <div className="nav-spec-static">ИСПк</div>
                    <div className="nav-spec-static">ФКк</div>

                    <div
                        className={`nav-spec-item ${expandedSpec === 'rk' ? 'is-active' : ''}`}
                        onClick={() => setExpandedSpec(expandedSpec === 'rk' ? null : 'rk')}
                    >
                        <span>Рк</span>
                        {expandedSpec === 'rk' ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </div>

                    {expandedSpec === 'rk' && (
                        <div className="nav-course-sub">
                            {['2 курс', '3 курс', '4 курс'].map(course => (
                                <div key={course}>
                                    <div
                                        className={`nav-course-item ${selectedCourse === course[0] ? 'is-active' : ''}`}
                                        onClick={() => setSelectedCourse(course[0])}
                                    >
                                        {course}
                                    </div>
                                    {selectedCourse === course[0] && course[0] === '2' && (
                                        <div className="nav-groups-sub">
                                            {['Рк-202', 'Рк-203', 'Рк-204'].map(group => (
                                                <div
                                                    key={group}
                                                    className={`nav-group-link ${selectedGroup === group ? 'selected' : ''}`}
                                                    onClick={() => setSelectedGroup(group)}
                                                >
                                                    {group}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="nav-spec-static">ПНКк</div>
                </div>
            </aside>

            <main className="grades-content-view">
                <div className="grades-white-sheet">
                    <div className="grades-view-header">
                        <h2 className="grades-view-title">{selectedGroup}</h2>
                        <div className="grades-header-btns">
                            {isEditing && (
                                <button className="grades-action-btn add" onClick={addColumn}>
                                    <Plus size={18} /> Добавить колонку
                                </button>
                            )}
                            <button
                                className={`grades-action-btn ${isEditing ? 'save-blue' : 'edit'}`}
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                {isEditing ? <><Check size={18} /> Сохранить</> : <><Edit2 size={18} /> Редактировать</>}
                            </button>
                        </div>
                    </div>

                    <div className="table-container-styled">
                        <table className="custom-vedomost-table">
                            <thead>
                            <tr>
                                <th className="th-fio">ФИО</th>
                                {columns.map((col, i) => (
                                    <th key={i}>
                                        <input
                                            className="header-edit-input"
                                            value={col}
                                            disabled={!isEditing}
                                            onChange={(e) => updateColumnName(i, e.target.value)}
                                            placeholder="..."
                                        />
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {students.map((student, sIdx) => (
                                <tr key={sIdx}>
                                    <td className="td-student-name">
                                        {student}
                                    </td>
                                    {columns.map((_, cIdx) => (
                                        <td key={cIdx}>
                                            <input
                                                className="cell-grade-input"
                                                value={grades[`${sIdx}-${cIdx}`] || ''}
                                                disabled={!isEditing}
                                                onChange={(e) => setGrades({...grades, [`${sIdx}-${cIdx}`]: e.target.value})}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TeacherGrades;