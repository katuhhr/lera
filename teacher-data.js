function renderGroups(groups) {
    const groupsList = document.getElementById("groups_list");
    if (!groupsList) return;

    groupsList.innerHTML = "";
    if (!Array.isArray(groups) || groups.length === 0) {
        const li = document.createElement("li");
        li.textContent = "Нет групп";
        groupsList.appendChild(li);
        return;
    }

    groups.forEach((group, index) => {
        const li = document.createElement("li");
        li.textContent = group?.name || `Группа ${index + 1}`;
        if (group?.active) li.classList.add("active");
        groupsList.appendChild(li);
    });
}

function renderMaterials(data) {
    const groupTitle = document.getElementById("group-title");
    const topics = document.getElementById("topics");

    if (groupTitle) {
        groupTitle.textContent = data?.groupTitle || "Выберите группу";
    }

    if (!topics) return;
    topics.innerHTML = "";

    const list = Array.isArray(data?.topics) ? data.topics : [];
    if (!list.length) {
        const empty = document.createElement("div");
        empty.className = "topic";
        empty.textContent = "Нет тем";
        topics.appendChild(empty);
        return;
    }

    list.forEach((item) => {
        const topic = document.createElement("div");
        topic.className = "topic";
        topic.textContent = item?.title || "";
        topics.appendChild(topic);
    });
}

function renderSchedule(days) {
    const container = document.getElementById("scheduleCards");
    if (!container) return;

    container.innerHTML = "";
    const list = Array.isArray(days) ? days : [];

    if (!list.length) {
        const card = document.createElement("div");
        card.className = "day-card";
        card.textContent = "Нет расписания";
        container.appendChild(card);
        return;
    }

    list.forEach((day) => {
        const card = document.createElement("div");
        card.className = `day-card${day?.active ? " active-day" : ""}`;

        const dayTitle = document.createElement("div");
        dayTitle.className = "day";
        dayTitle.textContent = day?.label || "";
        card.appendChild(dayTitle);

        const lessons = Array.isArray(day?.lessons) ? day.lessons : [];
        lessons.forEach((lesson) => {
            const p = document.createElement("p");
            p.textContent = lesson;
            card.appendChild(p);
        });

        container.appendChild(card);
    });
}

function renderGrades(data) {
    const title = document.getElementById("grades-title");
    const body = document.getElementById("grades-body");
    if (!body) return;

    if (title) title.textContent = data?.title || "Выберите группу";

    body.innerHTML = "";
    const rows = Array.isArray(data?.rows) ? data.rows : [];
    if (!rows.length) {
        const tr = document.createElement("tr");
        tr.innerHTML = "<td colspan='3'>Нет оценок</td>";
        body.appendChild(tr);
        return;
    }

    rows.forEach((row) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${row?.student || ""}</td>
            <td>${row?.subject || ""}</td>
            <td>${row?.grade || ""}</td>
        `;
        body.appendChild(tr);
    });
}

function renderSelfstudy(data) {
    const title = document.getElementById("selfstudy-title");
    const listNode = document.getElementById("selfstudy-list");
    if (!listNode) return;

    if (title) title.textContent = data?.title || "Самоподготовка";
    listNode.innerHTML = "";

    const list = Array.isArray(data?.items) ? data.items : [];
    if (!list.length) {
        const item = document.createElement("div");
        item.className = "topic";
        item.textContent = "Нет данных";
        listNode.appendChild(item);
        return;
    }

    list.forEach((entry) => {
        const item = document.createElement("div");
        item.className = "topic";
        item.textContent = entry?.title || "";
        listNode.appendChild(item);
    });
}

async function loadTeacherData() {
    const page = document.body.dataset.page;
    // Все данные страницы (кроме верхнего меню) приходят из БД.
    // Замените URL на ваш backend endpoint.
    const response = await fetch(`/api/teacher/${page}`);
    if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status}`);
    }
    return response.json();
}

async function initTeacherPage() {
    const page = document.body.dataset.page;
    if (!page) return;

    try {
        const data = await loadTeacherData();

        // Сайдбар (если есть на конкретной странице) также приходит из БД.
        renderGroups(data?.groups);

        if (page === "materials") {
            renderMaterials(data?.materials);
        }
        if (page === "schedule") {
            renderSchedule(data?.schedule);
        }
        if (page === "grades") {
            renderGrades(data?.grades);
        }
        if (page === "selfstudy") {
            renderSelfstudy(data?.selfstudy);
        }
    } catch (error) {
        console.error(error);

        renderGroups([]);
        if (page === "materials") renderMaterials({});
        if (page === "schedule") renderSchedule([]);
        if (page === "grades") renderGrades({});
        if (page === "selfstudy") renderSelfstudy({});
    }
}

document.addEventListener("DOMContentLoaded", initTeacherPage);
