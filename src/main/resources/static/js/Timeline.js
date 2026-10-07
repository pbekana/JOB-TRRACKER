document.addEventListener("DOMContentLoaded", () => {

    const history = [
      {
        company: "Google",
        title: "Software Engineer",
        event: "Application Submitted",
        date: "2024-06-15",
        icon: "../images/Depth 7, Frame 0.png"
      },
      {
        company: "Amazon",
        title: "Frontend Developer",
        event: "Interview Scheduled",
        date: "2024-06-20",
        icon: "../images/Depth 7, Frame 1.png"
      },
      {
        company: "Microsoft",
        title: "Backend Developer",
        event: "Interview Completed",
        date: "2024-06-25",
        icon: "../images/Depth 8, Frame 0.png"
      },
      {
        company: "Netflix",
        title: "Fullstack Developer",
        event: "Offer Received",
        date: "2024-07-01",
        icon: "../images/Depth 7, Frame 1 (1).png"
      },
      {
        company: "Google",
        title: "Software Engineer",
        event: "Offer Accepted",
        date: "2024-07-05",
        icon: "../images/Depth 7, Frame 1 (2).png"
      }
    ];

    const container = document.querySelector(".fourth-container");
    const searchInput = document.querySelector(".inputs");
    const searchIcon = document.querySelector(".sub img");

    // Render timeline items
    function renderTimeline(items) {
      container.innerHTML = "";
      if (items.length === 0) {
        container.innerHTML = `<p class="no-results">No matching results found</p>`;
        return;
      }
      items.forEach((item) => {
        const div = document.createElement("div");
        div.classList.add("timeline-item");
        div.innerHTML = `
          <div class="item-left">
            <img src="${item.icon}" alt="icon" class="event-icon">
          </div>
          <div class="item-right">
            <p class="event">${item.event}</p>
            <p class="company">${item.company} - ${item.title}</p>
            <p class="date">${new Date(item.date).toDateString()}</p>
          </div>
        `;
        container.appendChild(div);
      });
    }

    renderTimeline(history);

    function filterTimeline(query) {
      query = query.toLowerCase();
      const filtered = history.filter((item) => {
        return (
          item.company.toLowerCase().includes(query) ||
          item.title.toLowerCase().includes(query) ||
          new Date(item.date).toDateString().toLowerCase().includes(query)
        );
      });
      renderTimeline(filtered);
    }

    searchIcon.addEventListener("click", () => {
      const query = searchInput.value.trim();
      filterTimeline(query);
    });

    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        filterTimeline(searchInput.value.trim());
      }
    });
const username=document.getElementById("username");
        const userJob=document.getElementById("userJob");
        const submit_btn=document.getElementById("submit-btn");
        const profile_container=document.querySelector(".img-prof");
        const prof=document.querySelector(".prof");

    profile_container.addEventListener("click",(e)=>{
  e.preventDefault();
  e.stopPropagation();
  prof.hidden = !prof.hidden;
  });

  document.addEventListener("click", (e) => {
    if (!prof.contains(e.target) && e.target !== profile_container) {
      prof.hidden = true;
    }
  });

const section=document.getElementById("section");
const nav_item=document.getElementById("setting");
if (section && nav_item) {
  section.hidden=true;
  nav_item.addEventListener("click",(e)=>{
    e.preventDefault();
    section.hidden=false;
  });
}

const rightButton_container=document.querySelector(".rightButton-container");
if (rightButton_container) {
  rightButton_container.addEventListener("click",(e)=>{
    window.location.href = "/Applications";
  });
}

const leftButton_container=document.querySelector(".leftButton-container");
if (leftButton_container) {
  leftButton_container.addEventListener("click",(e)=>{
    window.location.href = "/Login";
  });
}
  window.editProfile = function () {
      const name = prompt("Enter name");
      const bio = prompt("Enter new bio");
      const imgUrl = prompt("Enter image URL");

      if (name) {
        username.textContent = name;
      }
      if (bio) {
        userBio.textContent = bio;
      }
      if (imgUrl) {
        img.src = imgUrl;
      }
    };
});
