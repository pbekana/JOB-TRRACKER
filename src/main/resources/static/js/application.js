document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.querySelector(".btns");
  const viewBtn = document.querySelector(".btns1");
  const statusMessage = document.getElementById("Status");
  const appList = document.getElementById("appList");
  const saved = document.getElementById("saved");
  saved.style.visibility = "hidden";

  saveBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    // Select files correctly using container classes
    const resumeFile = document.querySelector(".Resume input").files[0];
    const coverFile = document.querySelector(".cover input").files[0];

    if (!resumeFile || !coverFile) {
      statusMessage.textContent = "⚠️ Please upload both resume and cover letter!";
      statusMessage.style.color = "red";
      return;
    }

    // Upload files first
    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("coverLetter", coverFile);

    let uploadRes;
    try {
      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      uploadRes = await res.json();
    } catch (err) {
      console.error("File upload error:", err);
      statusMessage.textContent = "❌ File upload failed!";
      statusMessage.style.color = "red";
      return;
    }

    // Collect all other form values
    const applicationData = {
      company: document.getElementById("company").value.trim(),
      jobTitle: document.getElementById("job").value.trim(),
      description: document.getElementById("description").value.trim(),
      resume: uploadRes.resumePath,
      coverLetter: uploadRes.coverLetterPath,
      appLink: document.querySelector(".application-link input").value.trim(),
      status: document.querySelector(".Status select").value,
      interviewDate: document.querySelector(".Interview input").value,
      notes: document.getElementById("notes").value.trim()
    };

    if (!applicationData.company || !applicationData.jobTitle) {
      statusMessage.textContent = "⚠️ Please enter at least Company Name and Job Title.";
      statusMessage.style.color = "red";
      return;
    }

    // Send JSON to backend
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(applicationData)
      });
      await res.json();

      statusMessage.textContent = "✅ Application saved!";
      statusMessage.style.color = "green";

      // Reset form fields
      document.querySelector("form")?.reset?.();
      document.getElementById("company").value = "";
      document.getElementById("job").value = "";
      document.getElementById("description").value = "";
      document.querySelector(".Resume input").value = "";
      document.querySelector(".cover input").value = "";
      document.querySelector(".application-link input").value = "";
      document.querySelector(".Status select").selectedIndex = 0;
      document.querySelector(".Interview input").value = "";
      document.getElementById("notes").value = "";

    } catch (err) {
      console.error("Error saving application:", err);
      statusMessage.textContent = "❌ Failed to save application!";
      statusMessage.style.color = "red";
    }
  });

  viewBtn.addEventListener("click", (e) => {
    e.preventDefault();
    fetch("/api/applications")
      .then(res => res.json())
      .then(applications => {
        saved.style.visibility = "visible";
        appList.innerHTML = ""; // clear previous table

        const table = document.createElement("table");
        const header = document.createElement("tr");
        ["Company", "Job Title", "Description", "Resume", "Cover Letter", "Application Link", "Status", "Interview Date", "Notes"].forEach(key => {
          const th = document.createElement("th");
          th.textContent = key;
          header.appendChild(th);
        });
        table.appendChild(header);

        applications.forEach(app => {
          const row = document.createElement("tr");
          const resumeLink = `<a href="${app.resume}" target="_blank">Resume</a>`;
          const coverLink = `<a href="${app.coverLetter}" target="_blank">Cover Letter</a>`;

          [
            app.company,
            app.jobTitle,
            app.description,
            resumeLink,
            coverLink,
            app.appLink,
            app.status,
            app.interviewDate,
            app.notes
          ].forEach(val => {
            const td = document.createElement("td");
            td.innerHTML = val; // allow links
            row.appendChild(td);
          });

          table.appendChild(row);
        });

        appList.appendChild(table);
      })
      .catch(err => {
        console.error("Error fetching applications:", err);
        statusMessage.textContent = "❌ Failed to load data.";
        statusMessage.style.color = "red";
      });
  });

  // Profile editing etc. remains unchanged
});
