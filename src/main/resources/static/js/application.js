document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.querySelector(".btns");
  const viewBtn = document.querySelector(".btns1");
  const statusMessage = document.getElementById("Status");
  const appList = document.getElementById("appList");
  const saved = document.getElementById("saved");
  saved.style.visibility = "hidden";

  saveBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    const setStatus = (text, color) => {
      if (statusMessage) {
        statusMessage.textContent = text;
        statusMessage.style.color = color;
      }
    };

    // Select files using container classes — matches .Resume and .cover wrappers in Applications.html
    const resumeInput = document.querySelector(".Resume input[type='file']");
    const coverInput = document.querySelector(".cover input[type='file']");
    const resumeFile = resumeInput && resumeInput.files.length > 0 ? resumeInput.files[0] : null;
    const coverFile  = coverInput  && coverInput.files.length  > 0 ? coverInput.files[0]  : null;

    // Upload files only if at least one is selected and non-empty; otherwise use empty paths
    let uploadRes;
    if (resumeFile || coverFile) {
      const formData = new FormData();
      // Only append non-empty files — matches UploadController @RequestParam names exactly
      if (resumeFile && resumeFile.size > 0) formData.append("resume", resumeFile);
      if (coverFile  && coverFile.size  > 0) formData.append("coverLetter", coverFile);

      try {
        const res = await fetch("/api/uploads", { method: "POST", body: formData });
        if (!res.ok) {
          let detail = "";
          try { detail = await res.text(); } catch (_) {}
          throw new Error(detail || ("HTTP " + res.status));
        }
        uploadRes = await res.json();
        // Validate that the response has the expected fields from UploadController.UploadResponse
        if (typeof uploadRes.resumePath === "undefined" || typeof uploadRes.coverLetterPath === "undefined") {
          throw new Error("Unexpected upload response format");
        }
      } catch (err) {
        console.error("File upload error:", err);
        setStatus("\u274C File upload failed: " + err.message, "red");
        return;
      }
    } else {
      // No file selected — skip upload step, use empty paths
      uploadRes = { resumePath: "", coverLetterPath: "" };
    }

    // Collect all other form values
    // Field names match AppUser entity fields used with @RequestBody
    const applicationData = {
      company:       document.getElementById("company").value.trim(),
      jobTitle:      document.getElementById("job").value.trim(),
      description:   document.getElementById("description").value.trim(),
      resume:        uploadRes.resumePath,
      coverLetter:   uploadRes.coverLetterPath,
      appLink:       document.querySelector(".application-link input").value.trim(),
      status:        document.querySelector(".Status select").value,
      interviewDate: document.querySelector(".Interview input").value,
      notes:         document.getElementById("notes").value.trim()
    };

    if (!applicationData.company || !applicationData.jobTitle) {
      setStatus("\u26A0\uFE0F Please enter at least Company Name and Job Title.", "red");
      return;
    }

    // Send JSON to backend — AppUserController.saveApplication(@RequestBody AppUser)
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(applicationData)
      });
      if (!res.ok) {
        let detail = "";
        try { detail = await res.text(); } catch (_) {}
        throw new Error(detail || ("HTTP " + res.status));
      }
      await res.json();

      setStatus("\u2705 Application saved!", "green");
      if (typeof window.showToast === "function") {
        window.showToast("Application saved: " + applicationData.jobTitle + " at " + applicationData.company, "success");
      }

      // Reset form fields
      document.getElementById("company").value = "";
      document.getElementById("job").value = "";
      document.getElementById("description").value = "";
      if (resumeInput) resumeInput.value = "";
      if (coverInput)  coverInput.value  = "";
      document.querySelector(".application-link input").value = "";
      document.querySelector(".Status select").selectedIndex = 0;
      document.querySelector(".Interview input").value = "";
      document.getElementById("notes").value = "";

    } catch (err) {
      console.error("Error saving application:", err);
      setStatus("\u274C Failed to save application: " + err.message, "red");
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
          const resumeLink  = app.resume      ? '<a href="' + app.resume      + '" target="_blank">Resume</a>'       : "";
          const coverLink   = app.coverLetter ? '<a href="' + app.coverLetter + '" target="_blank">Cover Letter</a>' : "";

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
            td.innerHTML = val || ""; // allow links
            row.appendChild(td);
          });

          table.appendChild(row);
        });

        appList.appendChild(table);
      })
      .catch(err => {
        console.error("Error fetching applications:", err);
        if (statusMessage) {
          statusMessage.textContent = "\u274C Failed to load data.";
          statusMessage.style.color = "red";
        }
      });
  });

  // Profile dropdown toggle
  const profContainer = document.querySelector(".prof-container");
  const containerProfile = document.getElementById("container-profile");
  if (profContainer && containerProfile) {
    profContainer.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      containerProfile.hidden = !containerProfile.hidden;
    });
    document.addEventListener("click", (e) => {
      if (!containerProfile.contains(e.target) && e.target !== profContainer) {
        containerProfile.hidden = true;
      }
    });
  }
});
