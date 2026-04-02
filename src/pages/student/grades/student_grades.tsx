import React from 'react';
import './student_grades.css';

const StudentGrades: React.FC = () => {
    // Пример данных, которые в будущем придут из базы данных
    const gradesData = [
        { date: "25.03.2025", dialog: "+", test: "10", work1: "", work2: "", work3: "", work4: "", work5: "" },
        // Можно добавить больше строк для проверки скролла
    ];

    return (
        <div className="student-grades-container">
            <div className="grades-card">
                <h1 className="grades-title">Успеваемость</h1>

                <div className="grades-table-wrapper">
                    <table className="grades-table">
                        <thead>
                        <tr>
                            <th className="sticky-col">Дата</th>
                            <th>Диалог</th>
                            <th>Тест</th>
                            <th></th>
                            <th></th>
                            <th></th>
                            <th></th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {gradesData.map((row, index) => (
                            <tr key={index}>
                                <td className="date-cell sticky-col">{row.date}</td>
                                <td>{row.dialog}</td>
                                <td>{row.test}</td>
                                <td>{row.work1}</td>
                                <td>{row.work2}</td>
                                <td>{row.work3}</td>
                                <td>{row.work4}</td>
                                <td>{row.work5}</td>
                            </tr>
                        ))}
                        {/* Пустые строки для соответствия макету */}
                        {[...Array(5)].map((_, i) => (
                            <tr key={`empty-${i}`}>
                                <td className="sticky-col"></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentGrades;