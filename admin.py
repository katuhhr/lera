from django.contrib import admin
from .models import (
    User, Teacher, Student, Course, Major, MajorToCourse,
    Group, Schedule, ScheduleToGroup, Theme, Theory,
    TheoryToFile, File, Question, QuestionToFile,
    AnswerOption, Test, StudentAnswer, Task, Attendance,
    Request, Level
)

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['fio', 'email', 'role', 'is_active']
    search_fields = ['fio', 'email']

@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ['user', 'id']

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['user', 'group', 'id']

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['id', 'name']

@admin.register(Major)
class MajorAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'id']

@admin.register(MajorToCourse)
class MajorToCourseAdmin(admin.ModelAdmin):
    list_display = ['major', 'course', 'id']

@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ['id', 'teacher', 'teacher_course_id']

@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ['name', 'cabinet', 'start_couple_time', 'end_couple_time']

@admin.register(ScheduleToGroup)
class ScheduleToGroupAdmin(admin.ModelAdmin):
    list_display = ['schedule', 'group', 'id']

@admin.register(Theme)
class ThemeAdmin(admin.ModelAdmin):
    list_display = ['name', 'major_course', 'id']

@admin.register(Theory)
class TheoryAdmin(admin.ModelAdmin):
    list_display = ['id']

@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'id']

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['text', 'type', 'id']

@admin.register(AnswerOption)
class AnswerOptionAdmin(admin.ModelAdmin):
    list_display = ['text', 'is_correct', 'question', 'id']

@admin.register(Test)
class TestAdmin(admin.ModelAdmin):
    list_display = ['number', 'theme', 'question', 'id']

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['text', 'theme', 'deadline_date', 'id']

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['student', 'schedule', 'date', 'is_present']

@admin.register(Request)
class RequestAdmin(admin.ModelAdmin):
    list_display = ['user', 'status', 'created_at', 'id']

@admin.register(Level)
class LevelAdmin(admin.ModelAdmin):
    list_display = ['name', 'id']