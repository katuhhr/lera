from django.urls import path
from . import views
from . import api_views

app_name = 'main'

urlpatterns = [
    path('teacher-schedule/', views.teacher_schedule, name='teacher_schedule'),
    path('teacher-materials/', views.teacher_materials, name='teacher_materials'),
    path('teacher-grades/', views.teacher_grades, name='teacher_grades'),
    path('teacher-selfstudy/', views.teacher_selfstudy, name='teacher_selfstudy'),
    path('api/users', api_views.users_api, name='api_users'),
    path('api/materials', api_views.materials_api, name='api_materials'),
    path('api/materials/<int:material_id>', api_views.material_detail_api, name='api_material_detail'),
    path('api/assignments', api_views.assignments_api, name='api_assignments'),
    path('api/assignments/<int:assignment_id>/submit', api_views.assignment_submit_api, name='api_assignment_submit'),
    path('api/practice/tasks', api_views.practice_tasks_api, name='api_practice_tasks'),
    path('api/students/<int:student_id>/practice-level', api_views.student_practice_level_api, name='api_student_practice_level'),
    path('api/grades', api_views.grades_api, name='api_grades'),
    path('api/grades/assignment/<int:assignment_id>/student/<int:student_id>', api_views.grade_assignment_api, name='api_grade_assignment'),
    path('api/student/<str:page>', api_views.student_page_api, name='api_student_page'),
]