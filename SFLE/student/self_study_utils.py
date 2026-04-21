#Единый список тем самоподготовки для студента и преподавателя (теория, материалы, задания)

from django.db.models import Prefetch

from users.models import Material, SelfStudyTheme, Task, Theme

from .serializers import MaterialNodeSerializer


def _task_row(task: Task) -> dict:
    return {
        'id': task.id,
        'text': task.text,
        'deadline': task.deadline_date.isoformat() if task.deadline_date else None,
    }


def build_self_study_items() -> list[dict]:
    common_themes = (
        Theme.objects.filter(major_id__isnull=True, course_id__isnull=True)
        .select_related('theory')
        .prefetch_related(
            Prefetch('materials', queryset=Material.objects.order_by('id')),
            Prefetch('tasks', queryset=Task.objects.order_by('deadline_date', 'id')),
        )
        .order_by('id')
    )

    themes_by_theory_id: dict[int, Theme] = {}
    for tn in common_themes:
        if tn.theory_id and tn.theory_id not in themes_by_theory_id:
            themes_by_theory_id[tn.theory_id] = tn

    items: list[dict] = []
    theory_ids_from_sst: set[int] = set()

    for sst in SelfStudyTheme.objects.select_related('theory').order_by('id'):
        th = sst.theory
        theory_ids_from_sst.add(th.id)
        theme_row = themes_by_theory_id.get(th.id)
        materials: list = []
        tasks: list = []
        if theme_row:
            materials = MaterialNodeSerializer(theme_row.materials.all(), many=True).data
            tasks = [_task_row(t) for t in theme_row.tasks.all()]
        items.append(
            {
                'id': sst.id,
                'kind': 'self_study',
                'title': th.name,
                'content': th.text or '',
                'materials': materials,
                'tasks': tasks,
            }
        )

    theory_ids_seen = set(theory_ids_from_sst)
    for theme in common_themes:
        if not theme.theory_id or theme.theory_id in theory_ids_seen:
            continue
        theory_ids_seen.add(theme.theory_id)
        th = theme.theory
        materials = MaterialNodeSerializer(theme.materials.all(), many=True).data
        tasks = [_task_row(t) for t in theme.tasks.all()]
        items.append(
            {
                'id': theme.id,
                'kind': 'common_theme',
                'title': theme.name,
                'content': (th.text or '') if th else '',
                'materials': materials,
                'tasks': tasks,
            }
        )

    return items
