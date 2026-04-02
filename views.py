from django.shortcuts import render
from django.db import connection, DatabaseError


def teacher_schedule(request):
    """Страница расписания преподавателя"""
    schedules = []
    db_error = None

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, group_name, day_of_week, lesson_date, lesson_time, room
                FROM schedule
                ORDER BY lesson_date, lesson_time
                """
            )
            rows = cursor.fetchall()
            schedules = [
                {
                    "id": row[0],
                    "group_name": row[1],
                    "day_of_week": row[2],
                    "lesson_date": row[3],
                    "lesson_time": row[4],
                    "room": row[5],
                }
                for row in rows
            ]
    except DatabaseError as exc:
        db_error = str(exc)

    return render(
        request,
        "teacher-schedule.html",
        {"schedules": schedules, "db_error": db_error},
    )


def teacher_materials(request):
    """Страница учебных материалов"""
    return render(request, 'teacher-materials.html')


def teacher_grades(request):
    """Страница ведомости"""
    return render(request, 'teacher-grades.html')


def teacher_selfstudy(request):
    """Страница самоподготовки"""
    return render(request, 'teacher-selfstudy.html')