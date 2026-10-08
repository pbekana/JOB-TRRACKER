// ================= Backend Dashboard Fetch =================
async function getDashboardData() {
    try {
        const response = await fetch("/api/dashboard");
        if (!response.ok) throw new Error("Failed to fetch dashboard data");
        return await response.json();
    } catch (err) {
        console.error("Error fetching dashboard data:", err);
        return {
            totalApplications: 0,
            stages: { applied: 0, interviewing: 0, offer: 0, rejected: 0 },
            weeklyActivity: { Mon:0, Tue:0, Wed:0, Thu:0, Fri:0, Sat:0, Sun:0 }
        };
    }
}

// ================= Update Dashboard =================
async function updateDashboard() {
    const dashboardData = await getDashboardData();

    // Update total and stages
    document.querySelector(".tnum").textContent = dashboardData.totalApplications;
    document.querySelector(".applied p:last-child").textContent = dashboardData.stages.applied;
    document.querySelector(".interviewing p:last-child").textContent = dashboardData.stages.interviewing;
    document.querySelector(".offer p:last-child").textContent = dashboardData.stages.offer;
    document.querySelector(".rejected p:last-child").textContent = dashboardData.stages.rejected;

    // Update weekly activity bars
    Object.keys(dashboardData.weeklyActivity || {}).forEach(day => {
        const box = document.querySelector(`.${day.toLowerCase()}-box`);
        if(box) box.style.height = (dashboardData.weeklyActivity[day] || 0) * 15 + "px";
    });

    // Update weekly summary text
    let totalThisWeek = Object.values(dashboardData.weeklyActivity || {}).reduce((a,b) => a + b, 0);
    let summaryText = document.querySelector(".weekly-summary-text");
    if(!summaryText) {
        summaryText = document.createElement("p");
        summaryText.classList.add("weekly-summary-text");
        summaryText.style.textAlign = "center";
        summaryText.style.marginTop = "10px";
        document.querySelector(".summary-container").appendChild(summaryText);
    }
    summaryText.textContent = `📊 Total applications this week: ${totalThisWeek}`;
}

// ================= Quick Actions =================
function setupQuickActions() {
    const profile = document.getElementById("prof-a");
    const username = document.getElementById("username");
    const userBio = document.getElementById("userBio");
    const profBtn = document.getElementById("prof-btn");
    const  container_profile= document.getElementById("container-profile");

        // Display the logged-in user's email as the profile name
        const loggedInEmail = localStorage.getItem("loggedInEmail");
        if (loggedInEmail && username) {
            username.textContent = loggedInEmail;
        }

        profile.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            container_profile.hidden = !container_profile.hidden;
        });

        document.addEventListener("click", (e) => {
            if (!container_profile.contains(e.target) && e.target !== profile) {
                container_profile.hidden = true;
            }
        });

    profBtn.addEventListener("click", () => {
        window.showPromptModal(
            [
                { label: 'Name',      placeholder: 'John Doe' },
                { label: 'Bio',       placeholder: 'e.g. Web Developer' },
                { label: 'Image URL', placeholder: 'https://...' }
            ],
            function(vals) {
                if (vals[0]) username.textContent = vals[0];
                if (vals[1]) userBio.textContent = vals[1];
                if (vals[2]) document.getElementById("img").src = vals[2];
            }
        );
    });

    // Notifications button
    const notifBtn = document.querySelector(".btn-container button");
    if(notifBtn) {
        notifBtn.addEventListener("click", () => {
            if(Notification.permission === "granted") showNotification();
            else if(Notification.permission !== "denied") {
                Notification.requestPermission().then(p => {
                    if(p === "granted") showNotification();
                });
            }
        });
    }

    function showNotification() {
        const notification = new Notification("New Message", { body: "You have a notification from your app!" });
        notification.onclick = () => { window.focus(); window.showToast('Notification clicked', 'info'); };
    }
}

// ================= DOMContentLoaded =================
document.addEventListener("DOMContentLoaded", () => {
    const addBtn = document.querySelector(".fbutton button");
    const viewBtn = document.querySelector(".lbutton button");

    // Add Application button
    addBtn.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "/Applications";
    });

    // View All Applications button
    viewBtn.addEventListener("click", () => {
        window.location.href = "/Applications";
    });

    setupQuickActions();
    updateDashboard(); // Initial dashboard load
});
