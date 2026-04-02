import React from 'react';
import './student_debts.css';

const StudentDebts: React.FC = () => {
    return (
        <div className="student-debts-view">
            <div className="debts-stack">

                <div className="debt-section-card">
                    <div className="debt-badge">Текущее задание</div>
                    <div className="debt-blue-box">
                        <p className="debt-text">Презентация</p>
                        <p className="debt-text">Диалог</p>
                    </div>
                </div>

                <div className="debt-section-card">
                    <div className="debt-badge">Долги</div>
                    <div className="debt-blue-box">
                        <div className="debt-item-row">
                            <span className="red-dot"></span>
                            <p className="debt-text">Диалог. Тема № 1</p>
                        </div>
                        <div className="debt-item-row">
                            <span className="red-dot"></span>
                            <p className="debt-text">Презентация. Тема № 1</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StudentDebts;