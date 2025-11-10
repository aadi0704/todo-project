document.addEventListener("DOMContentLoaded", function() {
    // ✅ Elements
    const studySubjectInput = document.getElementById("studySubject");
    const studyHoursInput = document.getElementById("studyHours");
    const studyDateTimeInput = document.getElementById("studyDateTime");
    const addStudyPlanButton = document.getElementById("addStudyPlanButton");
    const studyPlansContainer = document.getElementById("studyPlansContainer");
    const filterSelect = document.getElementById("statusFilter");
    const alertSound = document.getElementById("alertSound");
    const streakCountEl = document.getElementById("streakCount");
    const completedSessionsEl = document.getElementById("completedSessions");
    const totalHoursEl = document.getElementById("totalHours");
    const dailyPerformanceTableBody = document.getElementById("dailyPerformanceTableBody");
    const viewMoreButton = document.getElementById("viewMoreButton");

    localStorage.setItem("lastpage", "studyplan");

    // ✅ Unlock sound on first user interaction (moved after alertSound definition)
    document.body.addEventListener("click", () => {
        alertSound.play().then(() => alertSound.pause()).catch(() => {});
    }, { once: true });

    // ✅ App data
    let showingAll = false;
    let studyPlansList = JSON.parse(localStorage.getItem("studyPlansList") || "[]");
    let streakData = JSON.parse(localStorage.getItem("streakData") || '{"currentStreak":0,"lastDate":""}');
    let performanceData = JSON.parse(localStorage.getItem("performanceData") || "{}");

    // 🔧 Track scheduled timeouts for notifications/miss checks
    const notificationTimeouts = {};
    const missCheckTimeouts = {};

    // ✅ Local storage helper
    function updateLocalStorage() {
        localStorage.setItem("studyPlansList", JSON.stringify(studyPlansList));
        localStorage.setItem("streakData", JSON.stringify(streakData));
        localStorage.setItem("performanceData", JSON.stringify(performanceData));
    }

    // ✅ Sound player
    function playAlertSound() {
        alertSound.play().catch(err => console.log(err));
    }

    // 🔧 Cancel scheduled alerts for a plan
    function clearPlanTimeouts(id) {
        if (notificationTimeouts[id]) {
            clearTimeout(notificationTimeouts[id]);
            delete notificationTimeouts[id];
        }
        if (missCheckTimeouts[id]) {
            clearTimeout(missCheckTimeouts[id]);
            delete missCheckTimeouts[id];
        }
    }

    // ✅ Schedule start notifications (tracked)
    function scheduleStartNotification(plan) {
        const startMessages = [
            `Time to focus! You’ve got this! "${plan.subject}" awaits!`,
            `Let’s crush this study session: "${plan.subject}"!`,
            `Every session counts. Start strong with "${plan.subject}"!`,
            `Your future self will thank you — let’s begin "${plan.subject}"!`
        ];

        const startTime = new Date(plan.dateTime).getTime();
        const delay = startTime - Date.now();
        if (delay > 0) {
            const timeoutId = setTimeout(() => {
                const index = studyPlansList.findIndex(p => p.id === plan.id);
                if (index !== -1 && studyPlansList[index].status === "pending") {
                    playAlertSound();
                    const msg = startMessages[Math.floor(Math.random() * startMessages.length)];
                    alert(msg);
                }
                delete notificationTimeouts[plan.id];
            }, delay);
            notificationTimeouts[plan.id] = timeoutId;
        }
    }

    // ✅ Schedule missed checks (tracked)
    function scheduleMissCheck(plan) {
        const missedMessages = [
            `Oops! You missed "${plan.subject}" — but tomorrow is another chance!`,
            `Don’t worry, you can get back on track after missing "${plan.subject}"!`,
            `Setbacks happen. Keep moving forward — "${plan.subject}" awaits!`
        ];

        const startTime = new Date(plan.dateTime).getTime();
        const delay = startTime - Date.now();
        if (delay > 0) {
            const timeoutId = setTimeout(() => {
                const checkId = setTimeout(() => {
                    const index = studyPlansList.findIndex(p => p.id === plan.id);
                    if (index !== -1 && studyPlansList[index].status === "pending") {
                        markMissed(plan.id);
                        playAlertSound();
                        const msg = missedMessages[Math.floor(Math.random() * missedMessages.length)];
                        alert(msg);
                    }
                    delete missCheckTimeouts[plan.id];
                }, 10 * 60 * 1000);
                missCheckTimeouts[plan.id] = checkId;
            }, delay);
            missCheckTimeouts[plan.id] = timeoutId;
        }
    }

    // ✅ Reinitialize all notifications
    studyPlansList.forEach(plan => {
        scheduleStartNotification(plan);
        scheduleMissCheck(plan);
    });

    // ✅ Dashboard updater
    function updateDashboard(previousStreak = null) {
        const currentStreak = streakData.currentStreak;
        streakCountEl.textContent = currentStreak;

        // 🔧 Replace classList.replace() with safer logic
        streakCountEl.classList.remove("text-danger", "text-secondary");
        streakCountEl.classList.add(currentStreak === 0 ? "text-secondary" : "text-danger");

        if (previousStreak !== null && currentStreak > previousStreak) {
            streakCountEl.classList.add("glow");
            setTimeout(() => streakCountEl.classList.remove("glow"), 1000);
        }

        let completed = 0, hours = 0;
        for (let date in performanceData) {
            completed += performanceData[date].done || 0;
            hours += performanceData[date].hours || 0;
        }
        completedSessionsEl.textContent = completed;
        totalHoursEl.textContent = hours.toFixed(1);
    }

    // ✅ Daily performance table
    function renderDailyPerformance() {
        dailyPerformanceTableBody.innerHTML = "";
        const entries = Object.entries(performanceData)
            .map(([date, data]) => ({ date, done: data.done || 0, missed: data.missed || 0, hours: data.hours || 0 }))
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        const limited = showingAll ? entries : entries.slice(0, 3);

        limited.forEach(entry => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${entry.date}</td>
                <td class="text-success fw-bold">${entry.done}</td>
                <td class="text-danger fw-bold">${entry.missed}</td>
                <td class="text-primary fw-bold">${entry.hours.toFixed(1)}</td>
            `;
            dailyPerformanceTableBody.appendChild(row);
        });

        if (entries.length <= 3) {
            viewMoreButton.style.display = "none";
        } else {
            viewMoreButton.style.display = "inline-block";
            viewMoreButton.textContent = showingAll ? "View Less" : "View More";
        }
    }

    viewMoreButton.addEventListener("click", () => {
        showingAll = !showingAll;
        renderDailyPerformance();
    });

    // ✅ Mark done
    function markDone(id) {
        clearPlanTimeouts(id); // 🔧 clear notifications
        const index = studyPlansList.findIndex(p => p.id === id);
        if (index === -1) return;

        studyPlansList[index].status = "done";
        const today = new Date().toDateString();
        const yesterday = new Date(); 
        yesterday.setDate(yesterday.getDate() - 1);
        streakData.currentStreak = (streakData.lastDate === yesterday.toDateString()) 
            ? streakData.currentStreak + 1 : 1;
        streakData.lastDate = today;

        if (!performanceData[today]) performanceData[today] = { done: 0, missed: 0, hours: 0 };
        performanceData[today].done += 1;
        performanceData[today].hours += Number(studyPlansList[index].hours) || 0; // 🔧 NaN guard

        updateLocalStorage();
        renderStudyPlans(filterSelect.value);
        updateDashboard(streakData.currentStreak - 1);
        renderDailyPerformance();
        showMotivationMessage("study", "done");
    }

    // ✅ Mark missed
    function markMissed(id) {
        clearPlanTimeouts(id); // 🔧 clear notifications
        const index = studyPlansList.findIndex(p => p.id === id);
        if (index === -1) return;

        studyPlansList[index].status = "missed";

        const sessionDate = new Date(studyPlansList[index].dateTime).toDateString();
        const today = new Date().toDateString();
        if (!performanceData[sessionDate]) performanceData[sessionDate] = { done: 0, missed: 0, hours: 0 };
        performanceData[sessionDate].missed += 1;
        performanceData[sessionDate].hours += Number(studyPlansList[index].hours) || 0;
        if (today === sessionDate) streakData.currentStreak = 0;

        updateLocalStorage();
        renderStudyPlans(filterSelect.value);
        updateDashboard();
        renderDailyPerformance();
        showMotivationMessage("study", "missed");
    }

    // ✅ Delete session
    function deleteSession(id) {
        clearPlanTimeouts(id); // 🔧 cancel scheduled alerts
        const index = studyPlansList.findIndex(p => p.id === id);
        if (index === -1) return;

        studyPlansList.splice(index, 1);
        updateLocalStorage();
        renderStudyPlans(filterSelect.value);
        updateDashboard();
        renderDailyPerformance();
    }

    // ✅ Create and render plans
    function createAndAppendStudyPlan(plan, index) {
        const container = document.createElement("div");
        container.classList.add("study-plan-item", "mb-3", "p-3", "border", "rounded", "d-flex", "justify-content-between", "align-items-center", "stagger");

        const leftDiv = document.createElement("div");
        const start = new Date(plan.dateTime);
        const end = new Date(start.getTime() + plan.hours * 60 * 60 * 1000);
        leftDiv.innerHTML = `
            <h5>${plan.subject}</h5>
            <p>Planned Hours: ${plan.hours}</p>
            <small class="text-muted">${start.toLocaleString()} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
        `;
        leftDiv.classList.add("content-containers");
        const rightDiv = document.createElement("div");
        rightDiv.classList.add("d-flex", "gap-2","icon-containers");

        container.appendChild(leftDiv);
        container.appendChild(rightDiv);
        studyPlansContainer.appendChild(container);

        setTimeout(() => container.classList.add("show"), index * 100);

        function updateIcons() {
            rightDiv.innerHTML = "";
            const now = new Date();
            if (plan.status === "done") {
                rightDiv.innerHTML = `<i class="fa-solid fa-circle-check text-success fs-4" title="Done"></i>`;
            } else if (plan.status === "missed") {
                rightDiv.innerHTML = `<i class="fa-solid fa-circle-xmark text-danger fs-4" title="Missed"></i>`;
            } else if (now >= start) {
                const doneBtn = document.createElement("i");
                doneBtn.className = "fa-regular fa-circle-check text-success fs-4";
                doneBtn.style.cursor = "pointer";
                doneBtn.title = "Mark Done";
                doneBtn.addEventListener("click", () => markDone(plan.id));

                const missedBtn = document.createElement("i");
                missedBtn.className = "fa-regular fa-circle-xmark text-danger fs-4";
                missedBtn.style.cursor = "pointer";
                missedBtn.title = "Mark Missed";
                missedBtn.addEventListener("click", () => markMissed(plan.id));

                rightDiv.appendChild(doneBtn);
                rightDiv.appendChild(missedBtn);
            } else {
                const pending = document.createElement("i");
                pending.className = "fa fa-hourglass-half waiting-icon fs-4";
                pending.title = "Pending";

                const delBtn = document.createElement("i");
                delBtn.className = "far fa-trash-alt delete-icon ps-3 fs-4";
                delBtn.style.cursor = "pointer";
                delBtn.title = "Delete";
                delBtn.addEventListener("click", () => {
                    container.classList.add("remove");
                    setTimeout(() => deleteSession(plan.id), 400);
                });

                rightDiv.appendChild(pending);
                rightDiv.appendChild(delBtn);
            }
        }

        updateIcons();
        const interval = setInterval(() => {
            if (plan.status === "done" || plan.status === "missed") clearInterval(interval);
            updateIcons();
        }, 1000);
    }

    // Render all study plans
    function renderStudyPlans(filter = "all") {
        studyPlansContainer.innerHTML = "";
        let filteredPlans = studyPlansList;

        if (filter !== "all") filteredPlans = studyPlansList.filter(p => p.status === filter);

        if (filter === "all") {
            filteredPlans = filteredPlans.slice().sort((a, b) => {
                const order = { pending: 0, done: 1, missed: 2 };
                return order[a.status] - order[b.status];
            });
        }

        if (filteredPlans.length === 0) {
            const wrapper = document.createElement("div");
            wrapper.classList.add("d-flex", "flex-column", "align-items-center", "justify-content-center", "py-4");

            

            const msg = document.createElement("p");
            msg.classList.add("details");
            msg.textContent =
                filter === "all"
                    ? "No study plans yet. Add some plans!"
                    : filter === "pending"
                    ? "No pending study sessions!"
                    : filter === "done"
                    ? "No completed study sessions!"
                    : "No missed study sessions!";
            wrapper.appendChild(msg);
            studyPlansContainer.appendChild(wrapper);
            return;
        }

        filteredPlans.forEach((plan, index) => createAndAppendStudyPlan(plan, index));
    }

    // Add new plan
    filterSelect.addEventListener("change", () => renderStudyPlans(filterSelect.value));
    addStudyPlanButton.addEventListener("click", () => {
        const subject = studySubjectInput.value.trim();
        const hours = parseFloat(studyHoursInput.value);
        const dateTime = studyDateTimeInput.value;

        if (!subject || isNaN(hours) || hours <= 0 || !dateTime) {
            alert("Enter valid details.");
            return;
        }

        const newPlan = { id: Date.now(), subject, hours, dateTime, status: "pending" };
        studyPlansList.push(newPlan);
        updateLocalStorage();
        renderStudyPlans(filterSelect.value);

        studySubjectInput.value = "";
        studyHoursInput.value = "";
        studyDateTimeInput.value = "";

        scheduleStartNotification(newPlan);
        scheduleMissCheck(newPlan);
    });

    // Initial renders
    renderStudyPlans("pending");
    updateDashboard();
    renderDailyPerformance();

    // Footer clock
    function updateFooterTime() {
        const now = new Date();
        document.getElementById("footerTime").textContent = ` | ${now.toLocaleTimeString()}`;
    }
    setInterval(updateFooterTime, 1000);
    updateFooterTime();
    function showMotivationMessage(type = "study", status = "done") {
    const studyDoneTips = [
        "Awesome! Completing your session brings you closer to your goals!",
        "Great job! Each session builds your streak and skills!",
        "Keep up the momentum! Every study session counts!",
        "Success is built one session at a time — well done!",
        "You’re unstoppable! Another study session completed!"
    ];

    const studyMissedTips = [
        "Don’t worry! Tomorrow is a new chance to crush it!",
        "Setbacks happen, but you’re still on track — keep going!",
        "Missed one session? Focus on the next one and stay consistent!",
        "Remember: consistency beats perfection. Restart strong!",
        "A small setback doesn’t define you. Keep moving forward!"
    ];

    let tipsArray = status === "done" ? studyDoneTips : studyMissedTips;
    const message = tipsArray[Math.floor(Math.random() * tipsArray.length)];

    const popup = document.createElement("div");
    popup.className = "motivation-popup";
    popup.textContent = message;
    document.body.appendChild(popup);

    setTimeout(() => {
        popup.classList.add("hide");
        setTimeout(() => popup.remove(), 500);
    }, 3000);
}

    const clearAllBtn = document.getElementById("clearAllData");

    clearAllBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (!confirm("Are you sure you want to delete all study plans?")) return;

        // Clear study plans and related data
        localStorage.removeItem("studyPlansList");
        localStorage.removeItem("performanceData");
        localStorage.removeItem("streakData");

        // Reset in-memory arrays/objects
        studyPlansList = [];
        performanceData = {};
        streakData = { currentStreak: 0, lastDate: "" };

        // Clear UI
        renderStudyPlans(filterSelect.value);
        updateDashboard();
        renderDailyPerformance();

        // Optional: show a brief notification
        const popup = document.createElement("div");
        popup.className = "todo-popup danger";
        popup.textContent = "🗑️ All study plans cleared!";
        document.body.appendChild(popup);
        setTimeout(() => {
            popup.classList.add("hide");
            setTimeout(() => popup.remove(), 500);
        }, 3000);
    });


});
