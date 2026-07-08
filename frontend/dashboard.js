 let currentPage = 1;
    function showToast(message, icon = "success") {
    Swal.fire({
        toast: true,
        position: "top-end",
        icon: icon,
        title: message,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
    });
}
const customersPerPage = 5;
let totalCustomersCount = 0;

// =======================
// 🔐 LOGIN PROTECTION
// =======================
if (!localStorage.getItem("token")) {

Swal.fire({
  icon: "warning",
  title: "Login Required",
  text: "Please Login First"
});

  window.location.href = "login.html";
}

const API = "http://localhost:5000/api/customers";

// =======================
// 🌙 DARK MODE
// =======================
function toggleTheme() {
  document.body.classList.toggle("dark");

  let isDark = document.body.classList.contains("dark");

  const btn = document.getElementById("themeBtn");

  if (isDark) {
    btn.innerText = "Light Mode";
    localStorage.setItem("theme", "dark");
  } else {
    btn.innerText = "Dark Mode";
    localStorage.setItem("theme", "light");
  }
}


function showLoader(){

document.getElementById("loader").style.display="flex";

}

function hideLoader(){

document.getElementById("loader").style.display="none";

}
// =======================
// 📝 ADD ACTIVITY
// =======================
function addActivity(message) {

  let activities =
    JSON.parse(localStorage.getItem("activities")) || [];

  activities.unshift(message);

  if (activities.length > 10) {
    activities.pop();
  }

  localStorage.setItem(
    "activities",
    JSON.stringify(activities)
  );

  loadActivities();
}
function loadActivities() {

  const activityList =
    document.getElementById("activityList");

  activityList.innerHTML = "";

  let activities =
    JSON.parse(localStorage.getItem("activities")) || [];

  if (activities.length === 0) {

    activityList.innerHTML =
      "<li>🚀 CRM Started</li>";

    return;
  }

  activities.forEach(activity => {

    activityList.innerHTML += `
      <li>${activity}</li>
    `;

  });

}

// =======================
// 🚪 LOGOUT
// =======================
function logout() {

  localStorage.removeItem("token");

  alert("Logged Out");

  window.location.href = "login.html";
}

// =======================
// ➕ ADD CUSTOMER
// =======================
async function addCustomer() {
  showLoader();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;

  const fileInput = document.getElementById("customerImage");
  const file = fileInput.files[0];

  const status = document.getElementById("status")?.value || "Lead";
  const followUpDate = document.getElementById("followUpDate").value;
  const notes = document.getElementById("notes")?.value || "";

  if (!name || !email || !phone) {
    Swal.fire("Error", "Please fill all required fields", "error");
    return;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    Swal.fire("Login required", "Token missing. Please login again.", "error");
    window.location.href = "login.html";
    return;
  }

  try {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("status", status);
    formData.append("notes", notes);
    formData.append("followUpDate", followUpDate);

    if (file) {
      formData.append("image", file);
    }

    const res = await fetch(API, {
      method: "POST",
      headers: {
    Authorization: "Bearer " + localStorage.getItem("token")
      },
      body: formData
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.log("Backend Error:", data);
      throw new Error(data.message || "Add customer failed");
    }

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Customer Added Successfully",
      timer: 2000,
      showConfirmButton: false
    });

    addActivity("➕ Customer Added");

    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("customerImage").value = "";
    document.getElementById("status").value = "Lead";
    document.getElementById("notes").value = "";

    loadCustomers();
    loadStats();
    showToast("Customer Added Successfully");
    loadFollowUps();

  } catch (err) {
    console.log("ADD CUSTOMER ERROR:", err);
    Swal.fire("Error", err.message, "error");
    hideLoader();
  }
}
// =======================
// 📄 LOAD CUSTOMERS
// =======================
async function loadCustomers() {
  try {
    const res = await fetch(API, {
  headers: {
  Authorization: localStorage.getItem("token")
  }
});

    if (!res.ok) {
      throw new Error("API not responding");
    }

    let data = await res.json();

    if (!Array.isArray(data)) data = [];



    // FILTER
    const filter = document.getElementById("filterStatus").value;
    if (filter !== "All") {
      data = data.filter(c => (c.status || "Lead") === filter);
    }

    // SORT
    const sort = document.getElementById("sortCustomers").value;
    if (sort === "az") {
      data.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "za") {
      data.sort((a, b) => b.name.localeCompare(a.name));
    }
if (!Array.isArray(data)) data = [];
    totalCustomersCount = data.length;

    // PAGINATION SAFE
const totalPages = Math.max(
  1,
  Math.ceil(totalCustomersCount / customersPerPage)
);

if (currentPage > totalPages) {
  currentPage = totalPages;
}

    document.getElementById("pageNumber").innerText = currentPage;

    const start = (currentPage - 1) * customersPerPage;
    const end = start + customersPerPage;

    const pageData = data.slice(start, end);

    // TABLE
   
    let rows = "";

    pageData.forEach((c, i) => {
      rows += `
        <tr>
          <td>${start + i + 1}</td>
          <td>
  <img
    src="${
      c.image
        ? `http://localhost:5000/uploads/${c.image}`
        : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
    }"
    width="40"
  >
</td>
          <td>${c.name}</td>
          <td>${c.email}</td>
          <td>${c.phone}</td>
         <td>
  <span class="status ${c.status}">
    ${c.status || "Lead"}
  </span>
</td>
          <td>${c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "N/A"}</td>
          <td>${c.followUpDate ? new Date(c.followUpDate).toLocaleDateString() : "N/A"}</td>
          <td>${c.notes || "No Notes"}</td>
          <td>
            <button onclick="viewCustomer('${c._id}')">View</button>
            <button onclick="editCustomer('${c._id}','${c.name}','${c.email}','${c.phone}','${c.status}')">Edit</button>
            <button onclick="deleteCustomer('${c._id}')">Delete</button>
          </td>
        </tr>
      `;
    });

    document.getElementById("customerBody").innerHTML = rows;

    document.getElementById("totalCustomers").innerText = data.length;

  } catch (err) {
    console.log("ERROR:", err);
  }
}


async function viewCustomer(id) {

    showLoader();

    try {

        const response = await fetch(`${API}/${id}`, {
            headers: {
                Authorization: "Bearer " + localStorage.getItem("token")
            }
        });

        const customer = await response.json();

        hideLoader();

        if (!response.ok) {
            throw new Error(customer.message);
        }

        document.getElementById("customerModal").style.display = "block";

        document.getElementById("modalData").innerHTML = `

<div class="profile-container">

<div class="profile-header">

<div class="profile-left">

<img
class="profile-avatar"
src="${
customer.image
?
'http://localhost:5000/uploads/'+customer.image
:
'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
}">

</div>

<div class="profile-right">

<h1>${customer.name}</h1>

<p class="customer-id">
Customer ID :
${customer._id}
</p>

<span class="status-badge">
${customer.status}
</span>

</div>

</div>

<div class="mini-cards">

<div class="mini-card">

<h3>Email</h3>

<p>${customer.email}</p>

</div>

<div class="mini-card">

<h3>Phone</h3>

<p>${customer.phone}</p>

</div>

<div class="mini-card">

<h3>Created</h3>

<p>

${new Date(customer.createdAt).toLocaleDateString()}

</p>

</div>

</div>

<div class="info-grid">

<div class="info-card">

<h2>Customer Details</h2>

<p><b>Name :</b> ${customer.name}</p>

<p><b>Email :</b> ${customer.email}</p>

<p><b>Phone :</b> ${customer.phone}</p>

<p><b>Status :</b> ${customer.status}</p>

<p><b>Follow Up :</b>

${customer.followUpDate
?
new Date(customer.followUpDate).toLocaleDateString()
:
"Not Scheduled"}

</p>

</div>

<div class="info-card">

<h2>Notes</h2>

<p>

${customer.notes || "No Notes Available"}

</p>

</div>

</div>

<div class="timeline-section">

<h2>Customer Timeline</h2>

<div class="timeline">

<div class="timeline-item">

<div class="timeline-dot green"></div>

<div>

<h4>Customer Created</h4>

<p>

${new Date(customer.createdAt).toLocaleString()}

</p>

</div>

</div>

<div class="timeline-item">

<div class="timeline-dot blue"></div>

<div>

<h4>Last Updated</h4>

<p>

${new Date(customer.updatedAt).toLocaleString()}

</p>

</div>

</div>

<div class="timeline-item">

<div class="timeline-dot orange"></div>

<div>

<h4>Follow Up</h4>

<p>

${customer.followUpDate
?
new Date(customer.followUpDate).toLocaleDateString()
:
"Not Scheduled"}

</p>

</div>

</div>

</div>

</div>

<div class="profile-buttons">

<button onclick="window.print()">
🖨 Print
</button>

<button onclick="closeModal()">
Close
</button>

</div>

</div>

`;

    }

    catch(err){

        hideLoader();

        Swal.fire(
            "Error",
            err.message,
            "error"
        );

    }

}
   
  

// =======================
// ❌ CLOSE MODAL
// =======================
function closeModal() {

  document.getElementById("customerModal").style.display = "none";
}

// =======================
// ❌ DELETE CUSTOMER
// =======================
async function deleteCustomer(id) {

  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This customer will be deleted!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, Delete",
    cancelButtonText: "Cancel"
  });

  if (result.isConfirmed) {
await fetch(`${API}/${id}`, {
  method: "DELETE",
  headers: {
    Authorization: localStorage.getItem("token")
  }
});
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Customer Deleted",
      showConfirmButton: false,
      timer: 2000
    });
    addActivity("🗑️ Customer Deleted");

    loadCustomers();
    loadStats();
    loadFollowUps();
   
  }
}

// =======================
// ✏️ OPEN EDIT MODAL
// =======================
function editCustomer(
  id,
  name,
  email,
  phone,
  status
) {

  document.getElementById("editModal").style.display = "block";

  document.getElementById("editId").value = id;

  document.getElementById("editName").value = name;

  document.getElementById("editEmail").value = email;

  document.getElementById("editPhone").value = phone;

  document.getElementById("editStatus").value = status;
}
// =======================
// ✅ UPDATE CUSTOMER
// =======================
async function updateCustomer() {

  const id = document.getElementById("editId").value;

  const name = document.getElementById("editName").value;

  const email = document.getElementById("editEmail").value;

  const phone = document.getElementById("editPhone").value;

  const status = document.getElementById("editStatus").value;

  try {

    await fetch(`${API}/${id}`, {

  method: "PUT",

  headers: {
    "Content-Type": "application/json",
    Authorization: localStorage.getItem("token")
  },

  body: JSON.stringify({
    name,
    email,
    phone,
    status
  })

});

   Swal.fire({
  toast: true,
  position: "top-end",
  icon: "success",
  title: "Customer Updated Successfully",
  showConfirmButton: false,
  timer: 2000
});
addActivity("✏️ Customer Updated");
    closeEditModal();

    loadCustomers();
    loadStats();
    loadFollowUps();

  }

  catch (err) {

    console.log(err);

  }
}

////-----saveSettings()-----------------//
async function saveSettings(event){

event.preventDefault();

const companyName =
document.getElementById("companyName").value;

const adminName =
document.getElementById("adminName").value;

const password =
document.getElementById("newPassword").value;

const body = {

companyName,

adminName

};

if(password){

body.password = password;

}

const response = await fetch(
"http://localhost:5000/api/users/profile",
{

method:"PUT",

headers:{

"Content-Type":"application/json",

Authorization:"Bearer "+localStorage.getItem("token")

},

body:JSON.stringify(body)

});
const data = await response.json();

await uploadProfileImage();

Swal.fire(
    "Saved",
    data.message,
    "success"
);

loadProfile();

}
// =======================
// ❌ CLOSE EDIT MODAL
// =======================
function closeEditModal() {

  document.getElementById("editModal").style.display = "none";
}

// =======================
// 🔍 SEARCH
// =======================
function searchCustomer() {

  let input = document
    .getElementById("searchInput")
    .value
    .toLowerCase();

  let rows = document.querySelectorAll("#customerBody tr");

  rows.forEach((row, index) => {

    if (index === 0) return;

    let name = row.cells[2]?.innerText.toLowerCase();

    row.style.display = name.includes(input)
      ? ""
      : "none";
  });
}

// =======================
// 📄 PDF DOWNLOAD
// =======================
async function downloadPDF() {

  const { jsPDF } = window.jspdf;

  const doc = new jsPDF();

  doc.setFontSize(18);

  doc.text("CRM Customer Report", 20, 20);

 const res = await fetch(API,{
    headers:{
        Authorization: localStorage.getItem("token")
    }
});

  const customers = await res.json();

  let y = 40;

  customers.forEach((c, index) => {

    doc.text(
      `${index + 1}. ${c.name} | ${c.email} | ${c.phone}`,
      20,
      y
    );

    y += 10;
  });

  doc.save("customers.pdf");
}
async function downloadExcel() {

 const res = await fetch(API,{
    headers:{
       Authorization: localStorage.getItem("token")
    }
});

  const customers = await res.json();

  const worksheet =
    XLSX.utils.json_to_sheet(customers);

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Customers"
  );

  XLSX.writeFile(
    workbook,
    "customers.xlsx"
  );

}

// =======================
// 📊 ANALYTICS CHART
// =======================
let myChart;

async function loadChart() {

  const response = await fetch(
"http://localhost:5000/api/customers/stats",
{
    headers:{
        Authorization: localStorage.getItem("token")
    }
});

  const stats = await response.json();

  const ctx =
    document.getElementById("myChart");
    if (!ctx) return;
    

  // DESTROY OLD CHART
  if (myChart) {
    myChart.destroy();
  }

  myChart = new Chart(ctx, {

    type: "doughnut",

    data: {

      labels: [
       "Lead",
       "Contacted",
       "Qualified",
       "Customer"
      ],

      datasets: [{

        data: [
          stats.lead,
          stats.contacted,
          stats.qualified,
          stats.customer
        ],

        backgroundColor: [
          "#22c55e",
          "#f59e0b",
          "#3b82f6",
          "#8b5cf6"
        ],

        borderWidth: 2

      }]
    },

    options: {

      responsive: true,

      maintainAspectRatio: false,

      plugins: {

        legend: {

          position: "bottom",

          labels: {
            color: "white",
            font: {
              size: 14
            }
          }
        }
      }
    }
  });
}
// =======================
// 🚀 AUTO LOAD
// =======================

function applyThemeOnLoad() {
  const theme = localStorage.getItem("theme");

  const btn = document.getElementById("themeBtn");

  if (theme === "dark") {
    document.body.classList.add("dark");
    if (btn) btn.innerText = "Light Mode";
  } else {
    document.body.classList.remove("dark");
    if (btn) btn.innerText = "Dark Mode";
  }
}
async function loadStats() {

  try {

   
     const response = await fetch(
"http://localhost:5000/api/customers/stats",
{
    headers:{
        Authorization: localStorage.getItem("token")
    }
});

    const stats =
      await response.json();

    animateValue(
  "totalCustomers",
  0,
  stats.total,
  1000
);

animateValue(
  "leadCustomers",
  0,
  stats.lead,
  1000
);

animateValue(
  "contactedCustomers",
  0,
  stats.contacted,
  1000
);

animateValue(
  "qualifiedCustomers",
  0,
  stats.qualified,
  1000
);

animateValue(
  "customerCustomers",
  0,
  stats.customer,
  1000
);

  }

  catch (err) {

    console.log(err);

  }
}
function nextPage() {
  const totalPages = Math.max(
    1,
    Math.ceil(totalCustomersCount / customersPerPage)
  );

  if (currentPage < totalPages) {
    currentPage++;
    loadCustomers();
  }
}
function previousPage() {
  if (currentPage > 1) {
    currentPage--;
    loadCustomers();
  }
}
function animateValue(id, start, end, duration) {

  let obj = document.getElementById(id);

  if (!obj) {
    console.log(id + " not found");
    return;
  }

  let range = end - start;

  let current = start;

  let increment = end > start ? 1 : -1;

  let stepTime = Math.abs(
    Math.floor(duration / Math.max(Math.abs(range), 1))
  );

  let timer = setInterval(() => {

    current += increment;

    obj.innerText = current;

    if (current == end) {
      clearInterval(timer);
    }

  }, stepTime);
}


// ================= SETTINGS PAGES =================
// ================= SETTINGS =================

function hideAllPages() {

  // Main sections
  document.getElementById("dashboardSection").style.display = "none";
  document.getElementById("customersPanel").style.display = "none";
  document.getElementById("analyticsSection").style.display = "none";

  // Settings pages
  document.getElementById("settingsSection").style.display = "none";
  document.getElementById("accountPage").style.display = "none";
  document.getElementById("languagePage").style.display = "none";
  document.getElementById("accessibilityPage").style.display = "none";
  document.getElementById("notificationPage").style.display = "none";
  document.getElementById("securityPage").style.display = "none";
}

// SETTINGS HOME
function showSettings() {
  hideAllPages();
  document.getElementById("settingsSection").style.display = "block";
}


// ACCOUNT SETTINGS
function showAccountSettings() {
  hideAllPages();
  document.getElementById("accountPage").style.display = "block";
}

// LANGUAGE
function showLanguagePage() {
  hideAllPages();
  document.getElementById("languagePage").style.display = "block";
}

// ACCESSIBILITY
function showAccessibilityPage() {
  hideAllPages();
  document.getElementById("accessibilityPage").style.display = "block";
}

// NOTIFICATION
function showNotificationPage() {
  hideAllPages();
  document.getElementById("notificationPage").style.display = "block";
}

// SECURITY
function showSecurityPage() {
  hideAllPages();
  document.getElementById("securityPage").style.display = "block";
}
function setActiveMenu(menu) {

  document
    .querySelectorAll(".sidebar li")
    .forEach(item => item.classList.remove("active"));

  menu.classList.add("active");

}

// ==========load follow-ups=============//
async function loadFollowUps() {

  const response = await fetch(API,{
    headers:{
       Authorization: localStorage.getItem("token")
    }
});


  const customers = await response.json();

  const today =
    new Date().toISOString().split("T")[0];

  let count = 0;

  const list =
    document.getElementById("followupList");

  list.innerHTML = "";

  customers.forEach(customer => {

    if (!customer.followUpDate) return;

   const followDate = new Date(customer.followUpDate)
  .toISOString()
  .split("T")[0];

    if (followDate === today) {

      count++;

      list.innerHTML += `
        <li>
          ${customer.name}
        </li>
      `;
    }
    

  });

  if (count === 0) {
    list.innerHTML =
      "<li>No Follow Ups Today</li>";
  }

  document.getElementById(
    "followUpsToday"
  ).innerText = count;
  document.getElementById(
  "notificationCount"
).innerText = count;
}
function showSection(sectionId) {

  const sections = [
    "dashboardSection",
    "customersPanel",
    "analyticsSection",
    "reportsSection",
    "calendarSection",
    "settingsSection",
    "accountPage",
    "languagePage",
    "accessibilityPage",
    "notificationPage",
    "securityPage"
  ];

  sections.forEach(id => {
    const section = document.getElementById(id);
    if (section) section.style.display = "none";
  });

  document.getElementById(sectionId).style.display = "block";

  if (sectionId === "customersPanel") {
    loadCustomers();
  }

  if (sectionId === "analyticsSection") {
    loadChart();
    loadGrowthChart();
  }

  
  if (sectionId === "reportsSection") {
    loadReports();
  }
  if(sectionId==="calendarSection"){

renderCalendar();

}

}
async function loadProfile() {

  try {

    const res = await fetch("http://localhost:5000/api/users/profile", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token")
      }
    });

    if (!res.ok) return;

    const user = await res.json();

    document.getElementById("sidebarCompanyName").innerText =
      user.companyName || "CRM SYSTEM";

    document.getElementById("mainWelcomeHeader").innerText =
      "Welcome, " + (user.adminName || "Admin") + " 👋";

    document.getElementById("companyName").value =
      user.companyName || "";

    document.getElementById("adminName").value =
      user.adminName || "";
if (user.profileImage) {

    document.getElementById("profilePreview").src =
        "http://localhost:5000/uploads/" +
        user.profileImage;

}
  } catch(err) {

    console.log(err);

  }

}
window.onload = () => {

    applyThemeOnLoad();

    showSection("dashboardSection");

    loadProfile();

    loadChart();

    loadGrowthChart();

    loadStats();

    loadCustomers();

    loadFollowUps();

    loadActivities();

}
// ================= MENU DROPDOWN =================

function toggleMenu() {
  document.getElementById("dropdownMenu").classList.toggle("show");
}

async function loadReports() {

  try {

    const response =
      await fetch("http://localhost:5000/api/customers/stats", {
        headers: {
          Authorization: localStorage.getItem("token")
        }
      });

    const stats = await response.json();

    document.getElementById("reportTotal").innerText =
      stats.total;

    document.getElementById("reportLead").innerText =
      stats.lead;

    document.getElementById("reportContacted").innerText =
      stats.contacted;

    document.getElementById("reportQualified").innerText =
      stats.qualified;

    document.getElementById("reportCustomer").innerText =
      stats.customer;

  }

  catch (err) {

    console.log(err);

  }

}
async function searchFollowUpsByDate() {

  const selectedDate = document.getElementById("calendarDate").value;

  if (!selectedDate) {
    Swal.fire("Please select a date");
    return;
  }

  try {

    const response = await fetch(API, {
      headers: {
        Authorization: localStorage.getItem("token")
      }
    });

    if (!response.ok) {
      throw new Error("Unable to load customers");
    }

    const customers = await response.json();

    const list = document.getElementById("calendarList");
    list.innerHTML = "";

    let found = false;

    customers.forEach(customer => {

      if (!customer.followUpDate) return;

      const followDate = new Date(customer.followUpDate)
        .toISOString()
        .split("T")[0];

      if (followDate === selectedDate) {

        found = true;

        list.innerHTML += `
          <li style="
            background:#ffffff;
            margin:10px 0;
            padding:15px;
            border-radius:10px;
            box-shadow:0 2px 8px rgba(0,0,0,.1);
            list-style:none;
          ">
            <h3>${customer.name}</h3>
            <p>📞 ${customer.phone}</p>
            <p>📧 ${customer.email}</p>
            <p>📌 Status: ${customer.status}</p>
            <p>🗓 Follow Up: ${followDate}</p>
          </li>
        `;
      }

    });

    if (!found) {
      list.innerHTML = `
        <li style="
          text-align:center;
          padding:20px;
          list-style:none;
        ">
          ❌ No follow-ups found for this date.
        </li>
      `;
    }

  } catch (err) {
    console.error(err);

    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Unable to fetch customers."
    });
  }

}
// ===============================
// PROFILE IMAGE PREVIEW
// ===============================
const profileInput = document.getElementById("profileImage");

if (profileInput) {

  profileInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {

      document.getElementById("profilePreview").src = e.target.result;

    };

    reader.readAsDataURL(file);

  });

}
async function uploadProfileImage() {

    const file =
        document.getElementById("profileImage").files[0];

    if (!file) return;

    const formData = new FormData();

    formData.append("image", file);

    const token =
        localStorage.getItem("token");

    const res = await fetch(
        "http://localhost:5000/api/users/profile/image",
        {
            method: "PUT",
            headers: {
                Authorization: "Bearer " + token
            },
            body: formData
        }
    );

    const data = await res.json();

    document.getElementById("profilePreview").src =
        "http://localhost:5000/uploads/" +
        data.image;

}
// =========================
// MONTHLY CALENDAR
// =========================

let currentDate = new Date();

async function renderCalendar() {

const monthYear =
document.getElementById("monthYear");

const grid =
document.getElementById("calendarGrid");

if(!monthYear || !grid) return;

grid.innerHTML="";

const year=currentDate.getFullYear();
const month=currentDate.getMonth();

monthYear.innerText=
currentDate.toLocaleString("default",{
month:"long",
year:"numeric"
});

const firstDay=
new Date(year,month,1).getDay();

const lastDate=
new Date(year,month+1,0).getDate();

const res=await fetch(API,{
headers:{
Authorization:localStorage.getItem("token")
}
});

const customers=await res.json();

const followDates=[];

customers.forEach(c=>{

if(c.followUpDate){

followDates.push(
new Date(c.followUpDate)
.toISOString()
.split("T")[0]
);

}

});

for(let i=0;i<firstDay;i++){

const empty=document.createElement("div");

empty.className="calendar-empty";

grid.appendChild(empty);

}

for(let day=1;day<=lastDate;day++){

const div=document.createElement("div");

div.className="calendar-day";

div.innerHTML=day;

const fullDate=
`${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

const today=
new Date().toISOString().split("T")[0];

if(fullDate===today){

div.classList.add("today");

}

if(followDates.includes(fullDate)){

div.classList.add("followup-date");

}

div.onclick=()=>{

document.getElementById("calendarDate").value=fullDate;

searchFollowUpsByDate();

};

grid.appendChild(div);

}

}

function previousMonth(){

currentDate.setMonth(currentDate.getMonth()-1);

renderCalendar();

}

function nextMonth(){

currentDate.setMonth(currentDate.getMonth()+1);

renderCalendar();

}
// ============================
// MONTHLY GROWTH CHART
// ============================

let growthChart;

async function loadGrowthChart(){

const response=await fetch(API,{
headers:{
Authorization:localStorage.getItem("token")
}
});

const customers=await response.json();

const months=[
"Jan","Feb","Mar","Apr","May","Jun",
"Jul","Aug","Sep","Oct","Nov","Dec"
];

const totals=new Array(12).fill(0);

customers.forEach(customer=>{

if(customer.createdAt){

const month=new Date(customer.createdAt).getMonth();

totals[month]++;

}

});

const ctx=document.getElementById("growthChart");

if(!ctx) return;

if(growthChart){

growthChart.destroy();

}

growthChart=new Chart(ctx,{

type:"line",

data:{

labels:months,

datasets:[{

label:"Customers",

data:totals,

borderColor:"#2563eb",

backgroundColor:"rgba(37,99,235,.15)",

fill:true,

tension:.4,

pointRadius:5,

pointBackgroundColor:"#2563eb"

}]

},

options:{

responsive:true,

plugins:{

legend:{
display:true
}

}

}

});

}
// =================================
// CSV IMPORT
// =================================

function importCSV(event){

const file=event.target.files[0];

if(!file) return;

Papa.parse(file,{

header:true,

skipEmptyLines:true,

complete:async function(results){

showLoader();

for(const customer of results.data){

try{

await fetch(API,{

method:"POST",

headers:{
Authorization:"Bearer "+localStorage.getItem("token")
},

body:(()=>{

const form=new FormData();

form.append("name",customer.name||"");

form.append("email",customer.email||"");

form.append("phone",customer.phone||"");

form.append("status",customer.status||"Lead");

form.append("notes",customer.notes||"");

form.append("followUpDate",customer.followUpDate||"");

return form;

})()

});

}catch(err){

console.log(err);

}

}

hideLoader();

showToast("CSV Imported Successfully");

loadCustomers();

loadStats();

loadChart();

loadGrowthChart();

}

});

}
// ==========================
// BACKUP DATABASE
// ==========================

async function backupDatabase() {

    showLoader();

    const response = await fetch(
        API + "/backup",
        {
            headers: {
                Authorization: localStorage.getItem("token")
            }
        }
    );

    const data = await response.json();

    const blob = new Blob(
        [JSON.stringify(data, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "crm-backup.json";

    a.click();

    URL.revokeObjectURL(url);

    hideLoader();

    showToast("Backup Downloaded");

}
// ==========================
// RESTORE DATABASE
// ==========================

async function restoreDatabase(event) {

    const file = event.target.files[0];

    if (!file) return;

    const text = await file.text();

    const customers = JSON.parse(text);

    showLoader();

    const response = await fetch(
        API + "/restore",
        {

            method: "POST",

            headers: {

                "Content-Type": "application/json",

                Authorization: localStorage.getItem("token")

            },

            body: JSON.stringify(customers)

        }
    );

    const data = await response.json();

    hideLoader();

    Swal.fire(
        "Success",
        data.message,
        "success"
    );

    loadCustomers();

    loadStats();

    loadChart();

    loadGrowthChart();

}