from __future__ import annotations

import re
import unicodedata
from datetime import time as dt_time
from datetime import timedelta

from django.db.models import Q
from django.utils import timezone

from users.models import Group, Schedule


def _norm_group_key(s: str) -> str:
    t = (s or '').strip()
    t = unicodedata.normalize('NFC', t)
    t = t.lower()
    t = re.sub(r'[\s\-–—]+', '', t)
    return t.replace('ё', 'е')


def _schedule_qs_narrowed_by_suffix(base, group_name: str):
    m = re.search(r'(\d{2,4})$', (group_name or '').strip())
    if not m:
        return base
    return base.filter(group_name__icontains=m.group(1))


def _schedule_group_names_equivalent_to_group(group: Group) -> list[str] | None:
    gn = (group.name or '').strip()
    if not gn:
        return []

    if Schedule.objects.filter(group_name__iexact=gn).exists():
        return None

    target = _norm_group_key(gn)
    if not target:
        return []

    today = timezone.localdate()
    for days in (1095, None):
        qs = Schedule.objects.all()
        qs = _schedule_qs_narrowed_by_suffix(qs, gn)
        if days is not None:
            qs = qs.filter(lesson_date__gte=today - timedelta(days=days))
        hits: list[str] = []
        seen: set[str] = set()
        for raw in qs.values_list('group_name', flat=True).distinct():
            if raw is None:
                continue
            rs = str(raw).strip()
            if not rs or _norm_group_key(rs) != target:
                continue
            if rs not in seen:
                seen.add(rs)
                hits.append(rs)
        if hits:
            return hits

    return []


def _schedule_lesson_queryset(group: Group):
    gn = (group.name or '').strip()
    names = _schedule_group_names_equivalent_to_group(group)
    if names is None:
        return Schedule.objects.filter(group_name__iexact=gn)
    if not names:
        return Schedule.objects.none()
    q = Q(group_name=names[0])
    for n in names[1:]:
        q |= Q(group_name=n)
    return Schedule.objects.filter(q)


def gradebook_column_headers_from_schedule(
    group: Group | None,
    n_columns: int,
    fallback_titles: list[str] | None = None,
) -> list[str]:

    if n_columns <= 0:
        return []
    fb = fallback_titles or []
    fb = [str(x) if x is not None else '' for x in fb]
    while len(fb) < n_columns:
        fb.append('')
    fb = fb[:n_columns]

    if not group:
        return list(fb)

    gn = (group.name or '').strip()
    if not gn:
        return list(fb)

    base = _schedule_lesson_queryset(group).order_by('lesson_date', 'lesson_time', 'id')
    qs = base.values_list('lesson_date', 'lesson_time')

    slots: list[tuple] = []
    seen: set[tuple] = set()
    for lesson_date, lesson_time in qs:
        if lesson_date is None:
            continue
        lt = lesson_time if lesson_time is not None else dt_time.min
        key = (lesson_date, lt)
        if key in seen:
            continue
        seen.add(key)
        slots.append((lesson_date, lt))
        if len(slots) >= n_columns:
            break

    out: list[str] = []
    for i in range(n_columns):
        if i >= len(slots):
            out.append(fb[i])
            continue
        ld, _lt = slots[i]
        out.append(ld.strftime('%d.%m.%Y'))
    return out
