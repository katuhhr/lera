from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    User, StudentGroup, Course, Major, Schedule, 
    Theory, File, Question, AnswerOption
)

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'role', 'group', 'is_staff', 'is_active')
    list_filter = ('role', 'is_active', 'is_staff', 'group')
    search_fields = ('email', 'username', 'phone', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Личная информация', {'fields': ('first_name', 'last_name', 'phone', 'avatar')}),
        ('Учебные данные', {'fields': ('role', 'group')}),
        ('Права доступа', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Даты', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'role', 'group', 'password'),
        }),
    )

class AnswerOptionInline(admin.TabularInline):
    model = AnswerOption
    extra = 3

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('text', 'text_type')
    list_filter = ('text_type',)
    inlines = [AnswerOptionInline]

# ПЕРЕИМЕНОВАНО: StudentGroup вместо Group
@admin.register(StudentGroup)
class StudentGroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'course', 'major', 'teacher')
    list_filter = ('course', 'major')

@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ('name', 'start_couple_time', 'cabinet')
    filter_horizontal = ('groups',)

@admin.register(Theory)
class TheoryAdmin(admin.ModelAdmin):
    list_display = ('name',)
    filter_horizontal = ('files',)

@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'storage_url')

admin.site.register(Course)
admin.site.register(Major)
