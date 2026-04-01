import json
from datetime import datetime

from django.db import models
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import (
    AssignmentStatus,
    Group,
    PracticeLevel,
    PracticeTask,
    Student,
    StudentPracticeProfile,
    StudentTestResult,
    Teacher,
    TeacherAssignment,
    TeacherAssignmentSubmission,
    TeacherMaterial,
    User,
)


def _parse_json(request):
    try:
        return json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        return None


def _response(data=None, status=200):
    return JsonResponse(data or {}, status=status)


def _error(message, status=400, fields=None):
    payload = {"error": message}
    if fields:
        payload["fields"] = fields
    return JsonResponse(payload, status=status)


def _actor_from_request(request):
    actor_email = request.headers.get("X-User-Email")
    if not actor_email and getattr(request.user, "is_authenticated", False):
        actor_email = getattr(request.user, "email", None)
    if not actor_email:
        return None
    return User.objects.filter(email=actor_email, is_active=True).first()


def _teacher_profile_or_403(actor):
    if not actor or actor.role != "teacher":
        return None, _error("Teacher access required", status=403)
    teacher = Teacher.objects.filter(user=actor).first()
    if not teacher:
        teacher = Teacher.objects.create(user=actor)
    return teacher, None


def _student_profile_or_403(actor):
    if not actor or actor.role != "student":
        return None, _error("Student access required", status=403)
    student = Student.objects.select_related("group").filter(user=actor).first()
    if not student:
        return None, _error("Student profile not found", status=404)
    return student, None


def _teacher_group_ids(teacher):
    return list(Group.objects.filter(teacher=teacher).values_list("id", flat=True))


def _apply_assignment_status_rules(submission):
    now = timezone.now()
    if submission.status in {AssignmentStatus.DONE, AssignmentStatus.SUBMITTED}:
        return submission
    if submission.assignment.deadline < now:
        submission.status = AssignmentStatus.OVERDUE
        submission.save(update_fields=["status"])
    return submission


@require_http_methods(["GET", "POST"])
@csrf_exempt
def users_api(request):
    actor = _actor_from_request(request)
    teacher, err = _teacher_profile_or_403(actor)
    if err:
        return err

    if request.method == "GET":
        role = request.GET.get("role")
        group_id = request.GET.get("group")
        qs = Student.objects.select_related("user", "group", "group__teacher")
        qs = qs.filter(group__teacher=teacher)
        if group_id:
            qs = qs.filter(group_id=group_id)
        if role:
            qs = qs.filter(user__role=role)

        data = []
        for student in qs:
            profile, _ = StudentPracticeProfile.objects.get_or_create(student=student)
            debts = TeacherAssignmentSubmission.objects.filter(
                student=student, status=AssignmentStatus.OVERDUE
            ).count()
            data.append(
                {
                    "id": student.user_id,
                    "fio": student.user.fio,
                    "email": student.user.email,
                    "group": student.group_id,
                    "practice_level": profile.level,
                    "debts_count": debts,
                }
            )
        return _response({"items": data})

    payload = _parse_json(request)
    if payload is None:
        return _error("Invalid JSON")

    required_fields = ["email", "fio", "group_id", "role"]
    missing = [field for field in required_fields if not payload.get(field)]
    if missing:
        return _error("Validation failed", fields={k: "Required" for k in missing})
    if User.objects.filter(email=payload["email"]).exists():
        return _error("Email must be unique", fields={"email": "Already exists"})

    group = Group.objects.filter(id=payload["group_id"], teacher=teacher).first()
    if not group:
        return _error("Group not found or forbidden", status=403)

    user = User.objects.create(
        email=payload["email"],
        fio=payload["fio"].strip(),
        password=payload.get("password", "temp_password"),
        role=payload["role"],
    )

    if payload["role"] == "student":
        student = Student.objects.create(user=user, group=group)
        StudentPracticeProfile.objects.create(student=student, level=PracticeLevel.BEGINNER)

    return _response(
        {
            "id": user.id,
            "email": user.email,
            "fio": user.fio,
            "role": user.role,
            "group_id": group.id,
        },
        status=201,
    )


@require_http_methods(["GET", "POST"])
@csrf_exempt
def materials_api(request):
    actor = _actor_from_request(request)
    if not actor:
        return _error("Authentication required", status=403)

    if request.method == "GET":
        group_id = request.GET.get("group")
        topic = request.GET.get("topic")
        qs = TeacherMaterial.objects.select_related("group", "teacher__user")

        if actor.role == "teacher":
            teacher, err = _teacher_profile_or_403(actor)
            if err:
                return err
            qs = qs.filter(group__teacher=teacher)
        elif actor.role == "student":
            student, err = _student_profile_or_403(actor)
            if err:
                return err
            qs = qs.filter(group=student.group)
        else:
            return _error("Role is not allowed", status=403)

        if group_id:
            qs = qs.filter(group_id=group_id)
        if topic:
            qs = qs.filter(topic=topic)

        return _response(
            {
                "items": [
                    {
                        "id": m.id,
                        "group_id": m.group_id,
                        "group_name": f"Group #{m.group_id}",
                        "topic": m.topic,
                        "title": m.title,
                        "content": m.content,
                        "updated_at": m.updated_at.isoformat(),
                    }
                    for m in qs
                ]
            }
        )

    teacher, err = _teacher_profile_or_403(actor)
    if err:
        return err
    payload = _parse_json(request)
    if payload is None:
        return _error("Invalid JSON")
    title = (payload.get("title") or "").strip()
    content = (payload.get("content") or "").strip()
    if not title or not content:
        return _error("Validation failed", fields={"title": "Required", "content": "Required"})
    group = Group.objects.filter(id=payload.get("group_id"), teacher=teacher).first()
    if not group:
        return _error("Group not found or forbidden", status=403)
    material = TeacherMaterial.objects.create(
        teacher=teacher,
        group=group,
        topic=(payload.get("topic") or "general").strip(),
        title=title,
        content=content,
    )
    return _response({"id": material.id, "title": material.title}, status=201)


@require_http_methods(["PUT", "DELETE"])
@csrf_exempt
def material_detail_api(request, material_id):
    actor = _actor_from_request(request)
    teacher, err = _teacher_profile_or_403(actor)
    if err:
        return err
    material = TeacherMaterial.objects.filter(id=material_id, group__teacher=teacher).first()
    if not material:
        return _error("Material not found", status=404)

    if request.method == "DELETE":
        material.delete()
        return _response(status=204)

    payload = _parse_json(request)
    if payload is None:
        return _error("Invalid JSON")
    title = (payload.get("title") or "").strip()
    content = (payload.get("content") or "").strip()
    if not title or not content:
        return _error("Validation failed", fields={"title": "Required", "content": "Required"})

    material.title = title
    material.content = content
    if payload.get("topic"):
        material.topic = payload["topic"]
    material.save()
    return _response(
        {
            "id": material.id,
            "title": material.title,
            "content": material.content,
            "topic": material.topic,
        }
    )


@require_http_methods(["GET"])
def assignments_api(request):
    actor = _actor_from_request(request)
    student, err = _student_profile_or_403(actor)
    if err:
        return err

    status_filter = request.GET.get("status")
    assignments = TeacherAssignment.objects.filter(group=student.group).order_by("deadline")
    items = []

    for assignment in assignments:
        submission, _ = TeacherAssignmentSubmission.objects.get_or_create(
            assignment=assignment,
            student=student,
            defaults={"status": AssignmentStatus.NEW},
        )
        submission = _apply_assignment_status_rules(submission)
        if status_filter and submission.status != status_filter:
            continue
        items.append(
            {
                "id": assignment.id,
                "title": assignment.title,
                "deadline": assignment.deadline.isoformat(),
                "status": submission.status,
                "max_score": assignment.max_score,
                "score": submission.score,
                "requires_manual_review": assignment.requires_manual_review,
            }
        )
    return _response({"items": items})


@require_http_methods(["POST"])
@csrf_exempt
def assignment_submit_api(request, assignment_id):
    actor = _actor_from_request(request)
    student, err = _student_profile_or_403(actor)
    if err:
        return err

    assignment = TeacherAssignment.objects.filter(id=assignment_id, group=student.group).first()
    if not assignment:
        return _error("Assignment not found", status=404)

    payload = _parse_json(request)
    if payload is None:
        return _error("Invalid JSON")
    answer_text = (payload.get("answer_text") or "").strip()
    file_url = (payload.get("file_url") or "").strip()
    if not answer_text and not file_url:
        return _error("Validation failed", fields={"answer_text": "Text or file_url is required"})
    if timezone.now() > assignment.deadline:
        return _error("Deadline is over", status=422)

    submission, _ = TeacherAssignmentSubmission.objects.get_or_create(
        assignment=assignment,
        student=student,
        defaults={"status": AssignmentStatus.IN_PROGRESS, "started_at": timezone.now()},
    )
    submission.answer_text = answer_text
    submission.file_url = file_url
    submission.submitted_at = timezone.now()

    if assignment.requires_manual_review:
        submission.status = AssignmentStatus.SUBMITTED
        submission.save()
        return _response(
            {"assignment_id": assignment.id, "status": submission.status},
            status=202,
        )

    # Primitive auto-check: non-empty answer gets full score.
    submission.status = AssignmentStatus.DONE
    submission.score = assignment.max_score
    submission.checked_at = timezone.now()
    submission.save()
    return _response(
        {"assignment_id": assignment.id, "status": submission.status, "score": submission.score}
    )


@require_http_methods(["GET"])
def practice_tasks_api(request):
    actor = _actor_from_request(request)
    student, err = _student_profile_or_403(actor)
    if err:
        return err
    profile, _ = StudentPracticeProfile.objects.get_or_create(student=student)
    if profile.status == "locked":
        return _response({"items": [], "status": "locked"})

    tasks = PracticeTask.objects.filter(level=profile.level, is_active=True)
    return _response(
        {
            "level": profile.level,
            "items": [
                {
                    "id": task.id,
                    "type": task.task_type,
                    "question": task.question,
                    "options": task.options,
                    "score": task.score,
                }
                for task in tasks
            ],
        }
    )


@require_http_methods(["PATCH"])
@csrf_exempt
def student_practice_level_api(request, student_id):
    actor = _actor_from_request(request)
    teacher, err = _teacher_profile_or_403(actor)
    if err:
        return err
    student = Student.objects.select_related("group").filter(id=student_id).first()
    if not student:
        return _error("Student not found", status=404)
    if not student.group or student.group.teacher_id != teacher.id:
        return _error("Forbidden for this student", status=403)

    payload = _parse_json(request)
    if payload is None:
        return _error("Invalid JSON")
    level = payload.get("level")
    if level not in {PracticeLevel.BEGINNER, PracticeLevel.INTERMEDIATE, PracticeLevel.ADVANCED}:
        return _error("Validation failed", fields={"level": "Use beginner/intermediate/advanced"})

    profile, _ = StudentPracticeProfile.objects.get_or_create(student=student)
    profile.level = level
    if payload.get("lock_practice") is True:
        profile.status = "locked"
    elif payload.get("lock_practice") is False:
        profile.status = "available"
    profile.save()

    return _response({"student_id": student.id, "level": profile.level, "status": profile.status})


@require_http_methods(["GET"])
def grades_api(request):
    actor = _actor_from_request(request)
    if not actor:
        return _error("Authentication required", status=403)

    if actor.role == "teacher":
        teacher, err = _teacher_profile_or_403(actor)
        if err:
            return err
        students = Student.objects.select_related("user", "group").filter(group__teacher=teacher)
    elif actor.role == "student":
        student, err = _student_profile_or_403(actor)
        if err:
            return err
        students = Student.objects.select_related("user", "group").filter(id=student.id)
    else:
        return _error("Forbidden", status=403)

    result = []
    for student in students:
        submissions = TeacherAssignmentSubmission.objects.filter(student=student)
        assignment_scores = [s.score or 0 for s in submissions if s.status == AssignmentStatus.DONE]
        test_scores = list(
            StudentTestResult.objects.filter(student=student).values_list("score", flat=True)
        )
        max_assignment_scores = list(
            submissions.filter(assignment__isnull=False).values_list("assignment__max_score", flat=True)
        )
        total_max = (sum(max_assignment_scores) if max_assignment_scores else 0) + (
            100 * len(test_scores)
        )
        total_scored = sum(assignment_scores) + sum(test_scores)
        completion_percent = round((total_scored / total_max) * 100, 2) if total_max else 0
        admitted = completion_percent >= 60 and not submissions.filter(
            status=AssignmentStatus.OVERDUE
        ).exists()

        result.append(
            {
                "student_id": student.id,
                "fio": student.user.fio,
                "assignments_scores": assignment_scores,
                "tests_scores": test_scores,
                "completion_percent": completion_percent,
                "admitted_to_attestation": admitted,
            }
        )
    return _response({"items": result})


@require_http_methods(["PUT"])
@csrf_exempt
def grade_assignment_api(request, assignment_id, student_id):
    actor = _actor_from_request(request)
    teacher, err = _teacher_profile_or_403(actor)
    if err:
        return err

    submission = TeacherAssignmentSubmission.objects.select_related(
        "assignment", "student__group"
    ).filter(assignment_id=assignment_id, student_id=student_id).first()
    if not submission:
        return _error("Submission not found", status=404)
    if not submission.student.group or submission.student.group.teacher_id != teacher.id:
        return _error("Forbidden", status=403)
    if not submission.assignment.requires_manual_review:
        return _error("Auto-checked assignment cannot be graded manually", status=422)

    payload = _parse_json(request)
    if payload is None:
        return _error("Invalid JSON")
    score = payload.get("score")
    if score is None or not isinstance(score, int):
        return _error("Validation failed", fields={"score": "Integer is required"})
    if score < 0 or score > submission.assignment.max_score:
        return _error(
            "Validation failed",
            fields={"score": f"Must be in range 0..{submission.assignment.max_score}"},
        )

    submission.score = score
    submission.comment = (payload.get("comment") or "").strip()
    submission.status = AssignmentStatus.DONE
    submission.checked_at = timezone.now()
    submission.save()
    return _response(
        {
            "assignment_id": submission.assignment_id,
            "student_id": submission.student_id,
            "status": submission.status,
            "score": submission.score,
            "comment": submission.comment,
        }
    )


@require_http_methods(["GET"])
def student_page_api(request, page):
    # Compatibility endpoint for ready frontend in teacher-data.js.
    actor = _actor_from_request(request)

    if page == "materials":
        if actor and actor.role == "teacher":
            teacher, err = _teacher_profile_or_403(actor)
            if err:
                return err
            materials = TeacherMaterial.objects.filter(group__teacher=teacher).order_by("-updated_at")
        else:
            materials = TeacherMaterial.objects.order_by("-updated_at")
        first = materials.first()
        return _response(
            {
                "topics": list(materials.values_list("topic", flat=True).distinct()),
                "selectedTopic": first.topic if first else "Тема",
                "topicDescription": first.content if first else "",
            }
        )

    if page == "selfstudy":
        if actor and actor.role == "teacher":
            teacher, err = _teacher_profile_or_403(actor)
            if err:
                return err
            tasks = TeacherAssignment.objects.filter(group__teacher=teacher).order_by("deadline")
        else:
            tasks = TeacherAssignment.objects.order_by("deadline")
        return _response(
            {
                "tasks": [
                    f"{task.title} (дедлайн: {task.deadline.strftime('%Y-%m-%d %H:%M')})"
                    for task in tasks[:20]
                ]
            }
        )

    if page == "performance":
        grades_data = grades_api(request)
        if grades_data.status_code != 200:
            # For compatibility mode return empty state instead of raising UI error.
            return _response({"studentName": "Группа", "columns": ["Студент", "Процент", "Допуск"], "rows": []})
        payload = json.loads(grades_data.content.decode("utf-8"))
        rows = []
        for item in payload.get("items", []):
            rows.append(
                {
                    "Студент": item.get("fio", ""),
                    "Процент": f"{item.get('completion_percent', 0)}%",
                    "Допуск": "Да" if item.get("admitted_to_attestation") else "Нет",
                }
            )
        return _response(
            {
                "studentName": "Успеваемость",
                "columns": ["Студент", "Процент", "Допуск"],
                "rows": rows,
            }
        )

    if page == "debts":
        if actor and actor.role == "teacher":
            teacher, err = _teacher_profile_or_403(actor)
            if err:
                return err
            overdue = TeacherAssignmentSubmission.objects.filter(
                assignment__group__teacher=teacher, status=AssignmentStatus.OVERDUE
            )
        else:
            overdue = TeacherAssignmentSubmission.objects.filter(status=AssignmentStatus.OVERDUE)
        debts = [
            f"{item.student.user.fio}: {item.assignment.title}"
            for item in overdue.select_related("student__user", "assignment")[:20]
        ]
        return _response(
            {
                "topicTitle": "Задолженности",
                "topicMenuItems": ["Просроченные задания"],
                "currentTasks": [],
                "debts": debts,
            }
        )

    return _error("Unsupported page", status=404)
