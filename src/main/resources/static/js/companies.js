window.addEventListener("DOMContentLoaded", () => {

  const columns = document.querySelectorAll(".tabactive, .tabactive1, .tabactive3, .tabactive4, .tabactive5, .tabactive6");

  // --- File chooser helper ---
  function selectFile() {
    return new Promise(resolve => {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.click();
      fileInput.onchange = () => resolve(fileInput.files[0] || null);
    });
  }

  // --- Create Job Card HTML ---
  function createJobCardHTML(id, title, date, notes, imgUrl) {
    return `
      <article class="job-card" data-id="${id ?? ''}" draggable="true">
        <div class="card-header">
          <img src="${imgUrl || '/images/default-company.png'}" alt="Company Logo">
          <button class="delete-btn" title="Delete Job">✖</button>
        </div>
        <h3>${title}</h3>
        <p class="date">Added on ${date}</p>
        <p>Notes: ${notes || 'No notes yet'}</p>
      </article>
    `;
  }

  // --- Enable Delete ---
  function enableDelete(card) {
    const delBtn = card.querySelector(".delete-btn");
    if (!delBtn) return;
    delBtn.addEventListener("click", async () => {
      window.showConfirm("Delete this job? This cannot be undone.", async function() {
        const jobId = card.getAttribute("data-id");
        if (jobId) {
          try {
            await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
          } catch (err) {
            console.error("Failed to delete job from backend:", err);
          }
        }
        card.remove();
      }, null);
    });
  }

  function reattachEvents(column) {
    const cards = column.querySelectorAll(".job-card");
    cards.forEach(card => {
      enableDelete(card);
      enableDragging(card);
    });
  }

  // --- Drag and Drop ---
  let draggedCard = null;

  function enableDragging(card) {
    card.setAttribute("draggable", "true");
    card.addEventListener("dragstart", (e) => {
      draggedCard = card;
      e.dataTransfer.setData("text/plain", card.dataset.id || "");
      card.classList.add("dragging");
    });
    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      draggedCard = null;
    });
  }

  columns.forEach(column => {
    column.addEventListener("dragover", (e) => {
      e.preventDefault();
      column.classList.add("drag-over");
    });
    column.addEventListener("dragleave", (e) => {
      if (!column.contains(e.relatedTarget)) {
        column.classList.remove("drag-over");
      }
    });
    column.addEventListener("drop", async (e) => {
      e.preventDefault();
      column.classList.remove("drag-over");
      if (!draggedCard) return;

      const addBtn = column.querySelector(".add-job-btn");
      if (addBtn) {
        column.insertBefore(draggedCard, addBtn);
      } else {
        column.appendChild(draggedCard);
      }

      const newStatus = column.dataset.status || "APPLIED";
      const jobId = draggedCard.dataset.id;
      if (jobId) {
        try {
          await fetch(`/api/jobs/${jobId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
          });
        } catch (err) {
          console.error("Failed to update job status:", err);
        }
      }
    });
  });

  // --- Add Job logic ---
  columns.forEach(column => {
    const addJobBtn = column.querySelector(".add-job-btn");
    if (!addJobBtn) return;

    addJobBtn.addEventListener("click", async () => {
      window.showPromptModal(
        [
          { label: 'Job Title', placeholder: 'e.g. Software Engineer', required: true },
          { label: 'Notes',     placeholder: 'Optional notes',          required: false }
        ],
        async function(vals) {
          const title = vals[0];
          if (!title) return;
          const notes = vals[1] || "";
          const date = new Date().toLocaleDateString();
          let imageUrl = "/images/default-company.png";

          const file = await selectFile();
          if (file) {
            const formData = new FormData();
            formData.append("file", file);
            try {
              const uploadRes = await fetch("/api/images/upload", { method: "POST", body: formData });
              const result = await uploadRes.json();
              imageUrl = result.path || imageUrl;
            } catch (err) {
              console.warn("Image upload failed, using default.", err);
            }
          }

          try {
            const res = await fetch("/api/jobs", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ title, notes, date, imageUrl })
            });
            const newJob = await res.json();
            const newCardHTML = createJobCardHTML(newJob.id, newJob.title, newJob.date, newJob.notes, newJob.imageUrl);
            addJobBtn.insertAdjacentHTML("beforebegin", newCardHTML);
            reattachEvents(column);
          } catch (err) {
            console.error("Failed to save job:", err);
            window.showToast("Could not save job. Please try again.", "error");
          }
        },
        null
      );
    });
  });

  // --- Load jobs from backend ---
  async function loadJobsFromBackend() {
    try {
      const res = await fetch("/api/jobs");
      if (!res.ok) throw new Error("Failed to fetch jobs");
      const jobs = await res.json();

      columns.forEach(column => {
        const addBtn = column.querySelector(".add-job-btn");
        const subTab = column.querySelector("div[class^='sub-tab']");

        // Remove only existing job cards
        column.querySelectorAll(".job-card").forEach(card => card.remove());

        // Re-append Add button and sub-tab
        if (subTab && !column.contains(subTab)) column.prepend(subTab);
        if (addBtn && !column.contains(addBtn)) column.appendChild(addBtn);
      });

      // Insert jobs into correct columns
      jobs.forEach(job => {
        let column;
        switch (job.status) {
          case "APPLIED": column = document.querySelector(".tabactive"); break;
          case "PHONE_SCREEN": column = document.querySelector(".tabactive1"); break;
          case "INTERVIEWING": column = document.querySelector(".tabactive3"); break;
          case "OFFER": column = document.querySelector(".tabactive4"); break;
          case "REJECTED": column = document.querySelector(".tabactive5"); break;
          case "HIRED": column = document.querySelector(".tabactive6"); break;
          default: column = document.querySelector(".tabactive"); break;
        }

        if (!column) return;
        const addBtn = column.querySelector(".add-job-btn");
        const cardHTML = createJobCardHTML(job.id, job.title, job.date, job.notes, job.imageUrl);
        if (addBtn) {
          addBtn.insertAdjacentHTML("beforebegin", cardHTML);
        } else {
          column.insertAdjacentHTML("beforeend", cardHTML);
        }
        reattachEvents(column);
      });

    } catch (err) {
      console.error("Failed to load jobs:", err);
    }
  }

  // --- Initialize ---
  loadJobsFromBackend();

  // --- Profile dropdown toggle ---
  const profLink = document.querySelector(".prof");
  const pprofile = document.querySelector(".pprofile");
  if (profLink && pprofile) {
    profLink.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      pprofile.hidden = !pprofile.hidden;
    });
    document.addEventListener("click", (e) => {
      if (!pprofile.contains(e.target) && e.target !== profLink) {
        pprofile.hidden = true;
      }
    });
  }

});
