from django.db.models import Prefetch
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
<<<<<<< HEAD
from users.models import User, Theme, Theory, Material, Test, Question, AnswerOption, Task, Attendance, TestResult
from users.major_labels import major_display_label
=======
from django.db import connection
from datetime import datetime
from users.models import User, Theme, Test, Question, AnswerOption, SelfStudyTheme, Task, Attendance, TestResult
>>>>>>> 87dd4e194f5bcdb7cf0f440e13f6e51ad0596bf9
from .serializers import (
    StudentProfileSerializer, ThemeListSerializer, ThemeDetailSerializer,
    TestSerializer, AttendanceSerializer, DashboardSerializer,
    TheoryLearningTreeSerializer, ThemeCatalogSerializer,
    ThemeCommonSelfStudySerializer,
)


def _get_current_student(request):
    """Use authenticated student if possible, fallback for compatibility."""
    user = getattr(request, 'user', None)
    if getattr(user, 'is_authenticated', False) and getattr(user, 'role', None) == 'student':
        return user
    return User.objects.filter(role='student', is_active=True).first()


def _theme_ids_for_student(student):
    """Filter themes by student's major+course."""
    if not student or not student.group_id:
        return []

    group = student.group
    if not getattr(group, 'major_id', None) or not getattr(group, 'course_id', None):
        return []

    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT t.id
            FROM theme t
            WHERE t.major_id = %s AND t.course_id = %s
            ORDER BY t.id
            """,
            [group.major_id, group.course_id],
        )
        rows = cursor.fetchall()
    return [row[0] for row in rows]


#профиль студента
@api_view(['GET'])
def get_profile(request):
    student = _get_current_student(request)
    
    if not student:
        return Response({
            'status': 'error',
            'message': 'Студент не найден. Создайте студента через админку.'
        }, status=404)
    
    serializer = StudentProfileSerializer(student)
    return Response({
        'status': 'success',
        'data': serializer.data
    })


#гл страница
@api_view(['GET'])
def get_dashboard(request):
    student = _get_current_student(request)
    
    if not student:
        return Response({
            'status': 'error',
            'message': 'Студент не найден'
        }, status=404)
    
    now = timezone.now()
    today = now.date()
    current_tasks = []
    debts = []

    # Все заданные задания из всех тем.
    tasks = Task.objects.select_related('theme').order_by('deadline_date', 'id')
    completed_task_ids = set(
        Attendance.objects.filter(student=student, is_completed=True, task__isnull=False)
        .values_list('task_id', flat=True)
    )

    for task in tasks:
        if task.id in completed_task_ids:
            continue

        deadline = task.deadline_date
        if isinstance(deadline, datetime):
            deadline_date = deadline.date()
        else:
            deadline_date = deadline
        item = {
            'task_id': task.id,
            'title': task.text[:120],
            'deadline': deadline,
            'theme': task.theme.name if task.theme else '',
        }

        if deadline_date and deadline_date < today:
            debts.append({
                'type': 'task',
                'date': deadline_date,
                'title': task.text[:120],
                'theme': task.theme.name if task.theme else '',
                'deadline': deadline,
                'task_id': task.id,
            })
        else:
            # Если дедлайн не задан или еще не наступил — это текущее задание.
            current_tasks.append(item)
    
    return Response({
        'status': 'success',
        'data': {
            'current_tasks': current_tasks,
            'debts': debts
        }
    })


#список тем/уроков
@api_view(['GET'])
def get_themes(request):
    """Получить темы уроков для курса/специальности текущего студента."""
    student = _get_current_student(request)
    if not student:
        return Response({'status': 'error', 'message': 'Студент не найден'}, status=404)
    if not student.group_id:
        return Response({'status': 'error', 'message': 'У студента не указана группа'}, status=400)

    theme_ids = _theme_ids_for_student(student)
    themes = Theme.objects.filter(id__in=theme_ids).order_by('id')
    serializer = ThemeListSerializer(themes, many=True)
    
    return Response({
        'status': 'success',
        'data': serializer.data
    })


#содержимое темы
@api_view(['GET'])
def get_theme_detail(request, theme_id):
    """Получить детали темы: теория, ссылки на задания и тест"""
    student = _get_current_student(request)
    if not student:
        return Response({'status': 'error', 'message': 'Студент не найден'}, status=404)
    allowed_theme_ids = set(_theme_ids_for_student(student))
    if theme_id not in allowed_theme_ids:
        return Response(
            {
                'status': 'error',
                'message': 'Тема недоступна для вашей специальности/курса',
            },
            status=403,
        )

    theme = get_object_or_404(Theme, id=theme_id)
    serializer = ThemeDetailSerializer(theme)
    
    #ссылки(навигация)
    data = serializer.data
    data['api_links'] = {
        'theory': f'/api/student/themes/{theme_id}/',
        'tasks': f'/api/student/themes/{theme_id}/tasks/',
        'test': f'/api/student/themes/{theme_id}/test/'
    }
    
    return Response({
        'status': 'success',
        'data': data
    })


#получить тест
@api_view(['GET'])
def get_test(request, theme_id):
    student = User.objects.filter(role='student').first()
    theme = get_object_or_404(Theme, id=theme_id)
    test = Test.objects.filter(theme=theme).first()
    
    if not test:
        return Response({
            'status': 'error',
            'message': 'Тест не найден'
        }, status=404)
    
    serializer = TestSerializer(test)
    
    #проверка проходил ли студент этот тест
    has_passed = False
    if student:
        has_passed = TestResult.objects.filter(student=student, test=test).exists()
    
    return Response({
        'status': 'success',
        'data': serializer.data,
        'has_passed': has_passed
    })


#тест
@api_view(['POST'])
def submit_test(request, theme_id):
    student = User.objects.filter(role='student').first()
    
    if not student:
        return Response({
            'status': 'error',
            'message': 'Студент не найден'
        }, status=404)
    
    theme = get_object_or_404(Theme, id=theme_id)
    test = Test.objects.filter(theme=theme).first()
    
    if not test:
        return Response({
            'status': 'error',
            'message': 'Тест не найден'
        }, status=404)
    
    #проверяем не проходил ли уже
    if TestResult.objects.filter(student=student, test=test).exists():
        return Response({
            'status': 'error',
            'message': 'Вы уже прошли этот тест. Повторное прохождение невозможно.'
        }, status=400)
    
    #получаем ответы из запроса
    answers = request.data.get('answers', {})
    
    #получаем вопросы (временно берем первые 10)
    questions = Question.objects.all()[:10]
    
    #подсчет баллов
    total_score = 0
    max_score = len(questions) * 10  #10 баллов за вопрос(поменять потом!!!!!!!!!!!)
    
    for q in questions:
        user_answer = answers.get(str(q.id), {})
        selected_option_id = user_answer.get('option_id')
        
        if selected_option_id:
            is_correct = AnswerOption.objects.filter(
                id=selected_option_id,
                question=q,
                is_correct=True
            ).exists()
            
            if is_correct:
                total_score += 10
    
    #сохр рез-т
    result = TestResult.objects.create(
        student=student,
        test=test,
        score=total_score,
        max_score=max_score
    )
    
    return Response({
        'status': 'success',
        'message': 'Тест успешно сдан!',
        'data': {
            'score': total_score,
            'max_score': max_score,
            'percentage': round((total_score / max_score * 100), 1) if max_score > 0 else 0
        }
    })


#успечаемость
@api_view(['GET'])
def get_progress(request):
    student = _get_current_student(request)
    
    if not student:
        return Response({
            'status': 'error',
            'message': 'Студент не найден'
        }, status=404)
    
    #посещаемость
    attendances = Attendance.objects.filter(student=student).order_by('-date')
    attendance_data = AttendanceSerializer(attendances, many=True).data
    
    #рез-ты тестов
    test_results = TestResult.objects.filter(student=student).select_related('test__theme')
    test_data = []
    for tr in test_results:
        test_data.append({
            'test_name': f"Тест {tr.test.number}: {tr.test.theme.name}" if tr.test.theme else f"Тест {tr.test.number}",
            'date': tr.completed_at.date(),
            'score': tr.score,
            'max_score': tr.max_score,
            'percentage': round((tr.score / tr.max_score * 100), 1) if tr.max_score > 0 else 0
        })
    
    #статус сдачи заданий
    tasks_data = []
    tasks = Task.objects.filter(
        attendances__student=student
    ).distinct()[:20]
    
    for task in tasks:
        attendance = Attendance.objects.filter(student=student, task=task).first()
        tasks_data.append({
            'task_name': task.text[:100],
            'deadline': task.deadline_date,
            'status': 'сдано' if attendance and attendance.is_completed else 'не сдано',
            'grade': None
        })
    
    return Response({
        'status': 'success',
        'data': {
            'attendance': attendance_data,
            'test_results': test_data,
            'tasks': tasks_data
        }
    })

@api_view(['GET'])
<<<<<<< HEAD
@permission_classes([IsAuthenticated])
def get_learning_materials(request):
    """Темы с материалами: для студента — по группе (специальность + курс); иначе все с привязкой."""
    user = request.user
    qs = Theme.objects.filter(major_id__isnull=False, course_id__isnull=False)
    ctx = None
    if getattr(user, 'group', None) and user.group_id:
        g = user.group
        qs = qs.filter(major_id=g.major_id, course_id=g.course_id)
        ctx = {
            'major_name': major_display_label(g.major_id) if g.major_id else None,
            'course_number': g.course.number if g.course_id else None,
        }
    themes = qs.prefetch_related(
        Prefetch('materials', queryset=Material.objects.order_by('id')),
    ).order_by('id')
    return Response({
        'status': 'success',
        'context': ctx,
        'data': ThemeCatalogSerializer(themes, many=True).data,
    })


#самоподготовка (общие темы из `theme` без major/course)
@api_view(['GET'])
def get_self_study(request):
    qs = (
        Theme.objects.filter(major__isnull=True, course__isnull=True)
        .select_related('theory')
        .order_by('id')
    )
    return Response({
        'status': 'success',
        'data': ThemeCommonSelfStudySerializer(qs, many=True).data,
=======
def get_self_study(request):
    # Общие темы: только те, которые НЕ привязаны к major/course.
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT t.id, t.name, COALESCE(th.text, '')
            FROM theme t
            LEFT JOIN theory th ON th.id = t.theory_id
            WHERE t.major_id IS NULL AND t.course_id IS NULL
            ORDER BY t.id
            """
        )
        rows = cursor.fetchall()
    data = [{'id': row[0], 'title': row[1], 'content': row[2]} for row in rows]

    return Response({
        'status': 'success',
        'data': data
>>>>>>> 87dd4e194f5bcdb7cf0f440e13f6e51ad0596bf9
    })