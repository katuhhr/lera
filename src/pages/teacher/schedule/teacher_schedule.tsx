import React, { FC, useState } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { X } from 'lucide-react';
import './teacher_schedule.css';

interface ILesson {
    time: string;
    group: string;
    room: string;
}

const TeacherSchedule: FC = () => {
    const [isEditing, setIsEditing] = useState(false);
    const today = new Date();
    const monday = startOfWeek(today, { weekStartsOn: 1 });

    const [days, setDays] = useState(() =>
        [...Array(6)].map((_, i) => ({
            date: addDays(monday, i),
            lessons: [
                { time: '10:00', group: 'ИСПк-304', room: 'к-303' },
                { time: '11:45', group: 'ИСПк-302', room: 'к-302' }
            ]
        }))
    );

    const handleInputChange = (dayIdx: number, lessonIdx: number, field: keyof ILesson, value: string) => {
        const newDays = [...days];
        newDays[dayIdx].lessons[lessonIdx][field] = value;
        setDays(newDays);
    };

    const addLesson = (dayIdx: number) => {
        const newDays = [...days];
        newDays[dayIdx].lessons.push({ time: '', group: '', room: '' });
        setDays(newDays);
    };

    const removeLesson = (dayIdx: number, lessonIdx: number) => {
        const newDays = [...days];
        newDays[dayIdx].lessons.splice(lessonIdx, 1);
        setDays(newDays);
    };

    return (
        <div className="schedule-page">
            <div className="schedule-header">
                <h2 className="schedule-title">Мое расписание</h2>
                <button className="edit-pill-btn" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? 'Сохранить' : 'Редактировать'}
                </button>
            </div>

            <div className="schedule-grid-layout">
                {days.map((day, idx) => {
                    const isToday = isSameDay(day.date, today);
                    return (
                        <div key={idx} className={`schedule-day-card ${isToday ? 'is-today' : ''}`}>
                            <div className="day-card-header">
                                <div className="day-date-badge">
                                    {format(day.date, 'EEEEEE', { locale: ru }).toUpperCase()} {format(day.date, 'dd.MM')}
                                </div>
                            </div>
                            <div className="day-lessons-list">
                                {day.lessons.map((lesson, lIdx) => (
                                    <div key={lIdx} className="lesson-entry-wrapper">
                                        <div className="lesson-entry">
                                            <input
                                                placeholder="00:00"
                                                disabled={!isEditing}
                                                className="lesson-input time-field"
                                                value={lesson.time}
                                                onChange={(e) => handleInputChange(idx, lIdx, 'time', e.target.value)}
                                            />
                                            <input
                                                placeholder="Группа / Каб."
                                                disabled={!isEditing}
                                                className="lesson-input info-field"
                                                value={lesson.group || lesson.room ? `${lesson.group} ${lesson.room}` : ''}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    const lastSpace = val.lastIndexOf(' ');
                                                    if (lastSpace !== -1) {
                                                        handleInputChange(idx, lIdx, 'group', val.substring(0, lastSpace));
                                                        handleInputChange(idx, lIdx, 'room', val.substring(lastSpace + 1));
                                                    } else {
                                                        handleInputChange(idx, lIdx, 'group', val);
                                                        handleInputChange(idx, lIdx, 'room', '');
                                                    }
                                                }}
                                            />
                                        </div>
                                        {isEditing && (
                                            <button
                                                className="remove-lesson-btn"
                                                onClick={() => removeLesson(idx, lIdx)}
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {isEditing && (
                                    <button className="inner-add-btn" onClick={() => addLesson(idx)}>+</button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TeacherSchedule;