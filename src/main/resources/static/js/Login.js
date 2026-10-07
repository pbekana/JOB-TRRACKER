document.addEventListener("DOMContentLoaded", () => {
  const signupSection = document.querySelector(".SIGNIN button");
  const loginSection = document.querySelector(".LOGIN button");

  const signupBtnHeader = document.querySelector(".signup button");
  const loginBtnHeader = document.querySelector(".login button");

  const demo = document.getElementById("demo");

  const cloud_container = document.querySelector(".cloud-container");
  const Export = document.querySelector(".Export");
  const Export_pdf = document.querySelector(".Export-pdf");
  const data_container = document.querySelector(".data-container");
  const security_container = document.querySelector(".security-container");
  const password = document.querySelector(".password");
  const Delete = document.querySelector(".Delete");

  [cloud_container, Export, Export_pdf, data_container, security_container, password, Delete].forEach(el => {
    if (el) el.classList.add("hidden");
  });

  let currentUserEmail = null;

  // ---------------- Signup Form ----------------
  function createSignupForm() {
    if (document.getElementById("signupForm")) return;

    const form = document.createElement("form");
    form.id = "signupForm";

    const emailLabel = document.createElement("label");
    emailLabel.setAttribute("for", "fid");
    emailLabel.textContent = "Email: ";

    const emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.id = "fid";
    emailInput.name = "email";
    emailInput.placeholder = "Enter your email";

    const br = document.createElement("br");

    const passLabel = document.createElement("label");
    passLabel.setAttribute("for", "sid");
    passLabel.textContent = "Password: ";

    const passInput = document.createElement("input");
    passInput.type = "password";
    passInput.id = "sid";
    passInput.name = "password";
    passInput.placeholder = "Enter your password";

    const signupBtn = document.createElement("button");
    signupBtn.type = "submit";
    signupBtn.textContent = "Signup";

    form.append(emailLabel, emailInput, br.cloneNode(),
                passLabel, passInput, br.cloneNode(),
                signupBtn);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      const pass = passInput.value;

      if (!email) {
        window.showToast("Please enter an email.", "warning");
        return;
      }
      if (pass.length <= 6) {
        window.showToast("Password must be more than 6 characters.", "warning");
        return;
      }

      fetch("/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password: pass })
      })
      .then(res => {
        if (!res.ok) throw new Error("Signup failed");
        return res.text();
      })
      .then(msg => {
        window.showToast("Signup successful", "success");
        form.reset();
        currentUserEmail = email;
        [cloud_container, Export, Export_pdf, data_container, security_container, password, Delete].forEach(el => {
          if (el) el.classList.remove("hidden");
        });
      })
      .catch(err => window.showToast("Error: " + err.message, "error"));
    });

    demo.appendChild(form);
  }

  // ---------------- Header buttons ----------------
  signupBtnHeader.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelector(".SIGNIN").classList.add("hidden");
    document.querySelector(".LOGIN").classList.add("hidden");
    createSignupForm();
  });

  loginBtnHeader.addEventListener("click", handleLogin);

  // ---------------- Signin / Login buttons ----------------
  signupSection.addEventListener("click", () => createSignupForm());
  loginSection.addEventListener("click", handleLogin);

  function handleLogin(e) {
    e.preventDefault();

    const emailInput = document.getElementById("fid");
    const passInput = document.getElementById("sid");

    if (!emailInput || !passInput) {
      window.showToast("Please signup first!", "warning");
      createSignupForm();
      return;
    }

    const email = emailInput.value.trim();
    const pass = passInput.value;

    fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password: pass })
    })
    .then(res => res.ok ? res.text() : Promise.reject("Invalid credentials"))
    .then(data => {
      window.showToast("Login successful", "success");
      currentUserEmail = email;
      [cloud_container, Export, Export_pdf, data_container, security_container, password, Delete].forEach(el => {
        if (el) el.classList.remove("hidden");
      });
    })
    .catch(err => window.showToast("" + err, "error"));
  }

  // ---------------- Cloud toggle ----------------
  const cloudToggle = document.querySelector(".cloud-container input[type='checkbox']");
  if (cloudToggle) {
    cloudToggle.addEventListener("change", () => {
      window.showToast(
        cloudToggle.checked ? "Cloud Sync Enabled (demo only)" : "Cloud Sync Disabled",
        "info"
      );
    });
  }

  // ---------------- Export CSV ----------------
  const exportCsvBtn = document.querySelector(".export-btnContainer button");
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      if (!currentUserEmail) {
        window.showToast("No user logged in.", "warning");
        return;
      }

      const res = await fetch(`/user/${encodeURIComponent(currentUserEmail)}`);
      const data = await res.json();

      const csvContent = "data:text/csv;charset=utf-8," +
        [["Email", data.email], ["Password", data.password]].map(row => row.join(",")).join("\n");

      const link = document.createElement("a");
      link.href = encodeURI(csvContent);
      link.download = "data.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  // ---------------- Export PDF ----------------
  const exportPdfBtn = document.querySelector(".export-btnPdf button");
  if (exportPdfBtn) {
    exportPdfBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      if (!currentUserEmail) {
        window.showToast("No user logged in.", "warning");
        return;
      }

      const res = await fetch(`/user/${encodeURIComponent(currentUserEmail)}`);
      const data = await res.json();

      const pdfWindow = window.open("", "_blank");
      pdfWindow.document.write(`
        <h1>Exported Data</h1>
        <p><b>Email:</b> ${data.email}</p>
        <p><b>Password:</b> ${data.password}</p>
      `);
      pdfWindow.print();
    });
  }

  // ---------------- Change password ----------------
  const changePassBtn = document.querySelector(".password-btnContainer button");
  if (changePassBtn) {
    changePassBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (!currentUserEmail) {
        window.showToast("No user logged in.", "warning");
        return;
      }

      window.showPromptModal(
        [{ label: 'New Password', type: 'password', placeholder: 'Enter new password', required: true }],
        async function(vals) {
          const newPass = vals[0];
          if (!newPass) return;

          const res = await fetch(`/user/${encodeURIComponent(currentUserEmail)}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ password: newPass })
          });

          if (res.ok) {
            window.showToast("Password updated!", "success");
          } else {
            window.showToast("Failed to update password.", "error");
          }
        },
        null
      );
    });
  }

  // ---------------- Delete account ----------------
  const deleteBtn = document.querySelector(".delete-btnContainer button");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (!currentUserEmail) {
        window.showToast("No user logged in.", "warning");
        return;
      }

      window.showConfirm(
        "Are you sure you want to delete your account? This cannot be undone.",
        async function() {
          const res = await fetch(`/user/${encodeURIComponent(currentUserEmail)}`, {
            method: "DELETE"
          });

          if (res.ok) {
            window.showToast("Account deleted!", "success");
            currentUserEmail = null;
            location.reload();
          } else {
            window.showToast("Failed to delete account.", "error");
          }
        },
        null
      );
    });
  }

 // ---------------- Google Login ----------------
window.onload = function () {
  google.accounts.id.initialize({
    client_id: "115767896617-623hovblkd96rrekjar1cuu8snc1mklo.apps.googleusercontent.com", // Replace with your real client ID
    callback: handleGoogleLogin,
  });


  google.accounts.id.initialize({
    client_id: "115767896617-623hovblkd96rrekjar1cuu8snc1mklo.apps.googleusercontent.com", // Replace with your real client ID
    callback: handleGoogleLogin
  });

  google.accounts.id.renderButton(
    document.getElementById("google-signin-btn"),
    {
      theme: "outline",
      size: "large",
      width: 250
    }
  );

  function handleGoogleLogin(response) {
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      console.log(payload);
  }
  }

});
