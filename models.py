from django.db import models


class User(models.Model):
    fio = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    role = models.CharField(max_length=20)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'user'
        managed = False
    
    def __str__(self):
        return self.fio


class Teacher(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='teacher_profile')
    
    class Meta:
        db_table = 'teacher'
        managed = False
    
    def __str__(self):
        return self.user.fio


class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    group = models.ForeignKey('Group', on_delete=models.SET_NULL, null=True, related_name='students')
    
    class Meta:
        db_table = 'student'
        managed = False


class Course(models.Model):
    name = models.CharField(max_length=100)
    
    class Meta:
        db_table = 'course'
        managed = False
    
    def __str__(self):
        return self.name


class Major(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, blank=True)
    
    class Meta:
        db_table = 'major'
        managed = False
    
    def __str__(self):
        return f"{self.code} {self.name}".strip()


class MajorToCourse(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='major_courses')
    major = models.ForeignKey(Major, on_delete=models.CASCADE, related_name='major_courses')
    
    class Meta:
        db_table = 'major_to_course'
        managed = False
    
    def __str__(self):
        return f"{self.major} - {self.course}"


class Group(models.Model):
    teacher_course_id = models.IntegerField(null=True)
    teacher = models.ForeignKey('Teacher', on_delete=models.CASCADE, related_name='groups', null=True)
    
    class Meta:
        db_table = 'group'
        managed = False
    
    def __str__(self):
        return f"Group #{self.id}"


class Schedule(models.Model):
    cabinet = models.CharField(max_length=20)
    start_couple_time = models.TimeField()
    end_couple_time = models.TimeField()
    name = models.CharField(max_length=200)
    
    class Meta:
        db_table = 'schedule'
        managed = False
    
    def __str__(self):
        return f"{self.name} ({self.cabinet})"


class ScheduleToGroup(models.Model):
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE, related_name='schedule_groups')
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='schedule_groups')
    
    class Meta:
        db_table = 'schedule_to_group'
        managed = False
    
    def __str__(self):
        return f"{self.schedule} - {self.group}"


class Theme(models.Model):
    major_course = models.ForeignKey(MajorToCourse, on_delete=models.CASCADE, related_name='themes')
    name = models.CharField(max_length=200)
    
    class Meta:
        db_table = 'theme'
        managed = False


class Theory(models.Model):
    text = models.TextField()
    
    class Meta:
        db_table = 'theory'
        managed = False


class TheoryToFile(models.Model):
    theory = models.ForeignKey(Theory, on_delete=models.CASCADE)
    file = models.ForeignKey('File', on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'theory_to_file'
        managed = False


class File(models.Model):
    storage_url = models.CharField(max_length=255)
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=50)
    
    class Meta:
        db_table = 'file'
        managed = False
    
    def __str__(self):
        return self.name


class Question(models.Model):
    text = models.TextField()
    type = models.CharField(max_length=50)
    
    class Meta:
        db_table = 'question'
        managed = False


class QuestionToFile(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    file = models.ForeignKey(File, on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'question_to_file'
        managed = False


class AnswerOption(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    text = models.TextField()
    is_correct = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'answer_option'
        managed = False


class Test(models.Model):
    theme = models.ForeignKey(Theme, on_delete=models.CASCADE, related_name='tests')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    number = models.IntegerField(default=1)
    text = models.TextField(blank=True)
    
    class Meta:
        db_table = 'test'
        managed = False


class StudentAnswer(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='answers')
    answer_option = models.ForeignKey(AnswerOption, on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'student_answer'
        managed = False


class Task(models.Model):
    theme = models.ForeignKey(Theme, on_delete=models.CASCADE, related_name='tasks')
    text = models.TextField()
    deadline_date = models.DateField(null=True, blank=True)
    
    class Meta:
        db_table = 'task'
        managed = False


class Attendance(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    schedule = models.ForeignKey(Schedule, on_delete=models.CASCADE)
    date = models.DateField()
    is_present = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'attendance'
        managed = False


class Request(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='new')
    
    class Meta:
        db_table = 'request'
        managed = False


class Level(models.Model):
    name = models.CharField(max_length=100)
    
    class Meta:
        db_table = 'level'
        managed = False
    
    def __str__(self):
        return self.name


class PracticeLevel(models.TextChoices):
    BEGINNER = "beginner", "Beginner"
    INTERMEDIATE = "intermediate", "Intermediate"
    ADVANCED = "advanced", "Advanced"


class AssignmentStatus(models.TextChoices):
    NEW = "new", "New"
    IN_PROGRESS = "in_progress", "In progress"
    SUBMITTED = "submitted", "Submitted"
    DONE = "done", "Done"
    OVERDUE = "overdue", "Overdue"


class PracticeTaskStatus(models.TextChoices):
    AVAILABLE = "available", "Available"
    IN_PROGRESS = "in_progress", "In progress"
    COMPLETED = "completed", "Completed"
    LOCKED = "locked", "Locked"


class TeacherMaterial(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name="materials")
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name="materials")
    topic = models.CharField(max_length=120)
    title = models.CharField(max_length=255)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "teacher_material"
        ordering = ["-updated_at"]


class TeacherSchedule(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name="teacher_schedules")
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name="teacher_schedules")
    title = models.CharField(max_length=200)
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField()
    cabinet = models.CharField(max_length=50, blank=True, default="")

    class Meta:
        db_table = "teacher_schedule"
        ordering = ["starts_at"]


class TeacherAssignment(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name="teacher_assignments")
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name="teacher_assignments")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    deadline = models.DateTimeField()
    max_score = models.PositiveIntegerField(default=100)
    requires_manual_review = models.BooleanField(default=True)
    allow_retake = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "teacher_assignment"
        ordering = ["deadline"]


class TeacherAssignmentSubmission(models.Model):
    assignment = models.ForeignKey(TeacherAssignment, on_delete=models.CASCADE, related_name="submissions")
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="assignment_submissions")
    answer_text = models.TextField(blank=True, default="")
    file_url = models.URLField(blank=True, default="")
    status = models.CharField(max_length=20, choices=AssignmentStatus.choices, default=AssignmentStatus.NEW)
    score = models.PositiveIntegerField(null=True, blank=True)
    comment = models.TextField(blank=True, default="")
    started_at = models.DateTimeField(null=True, blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    checked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "teacher_assignment_submission"
        unique_together = ("assignment", "student")


class StudentPracticeProfile(models.Model):
    student = models.OneToOneField(Student, on_delete=models.CASCADE, related_name="practice_profile")
    level = models.CharField(max_length=20, choices=PracticeLevel.choices, default=PracticeLevel.BEGINNER)
    status = models.CharField(max_length=20, choices=PracticeTaskStatus.choices, default=PracticeTaskStatus.AVAILABLE)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "student_practice_profile"


class PracticeTask(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name="practice_tasks")
    level = models.CharField(max_length=20, choices=PracticeLevel.choices, default=PracticeLevel.BEGINNER)
    task_type = models.CharField(max_length=50)
    question = models.TextField()
    options = models.JSONField(default=list, blank=True)
    score = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "practice_task"


class StudentPracticeTaskProgress(models.Model):
    task = models.ForeignKey(PracticeTask, on_delete=models.CASCADE, related_name="student_progress")
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="practice_task_progress")
    status = models.CharField(max_length=20, choices=PracticeTaskStatus.choices, default=PracticeTaskStatus.AVAILABLE)
    gained_score = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "student_practice_task_progress"
        unique_together = ("task", "student")


class TeacherTest(models.Model):
    class TestStatus(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"
        CLOSED = "closed", "Closed"

    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name="teacher_tests")
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name="teacher_tests")
    title = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=TestStatus.choices, default=TestStatus.DRAFT)
    max_score = models.PositiveIntegerField(default=100)
    starts_at = models.DateTimeField(null=True, blank=True)
    ends_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "teacher_test"


class StudentTestResult(models.Model):
    class ResultStatus(models.TextChoices):
        PASSED = "passed", "Passed"
        FAILED = "failed", "Failed"

    test = models.ForeignKey(TeacherTest, on_delete=models.CASCADE, related_name="results")
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="test_results")
    status = models.CharField(max_length=20, choices=ResultStatus.choices, default=ResultStatus.PASSED)
    score = models.PositiveIntegerField(default=0)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "student_test_result"
        unique_together = ("test", "student")