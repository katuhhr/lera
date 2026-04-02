export interface IRequest {
    id: number;
    fullName: string;
    date: string;
    status: 'pending' | 'approved' | 'rejected';
}

export interface ITeacher {
    id: number;
    fullName: string;
    role: string;
}

export interface ITeacherProfile {
    id: number;
    fullName: string;
    role: string;
    login: string;
    password: string;
    groups: IGroup[];
}

export interface IGroup {
    id: number;
    name: string;
    courses: string[];
}

export interface Lesson {
    time: string;
    group: string;
    room: string;
}

export interface ScheduleDay {
    date: string;
    dayName: string;
    lessons: Lesson[];
}

export interface Topic {
    id: string;
    title: string;
    content: string;
}

export interface Group {
    id: string;
    name: string;
    students: string[];
    grades: Record<string, string>;
}