// ==========================================
// 🔑 CRM AUTHENTICATION LOGIC (script.js)
// ==========================================
const API_BASE = "http://localhost:5000";
// LOGIN FUNCTION
async function login(event) {
    if (event) event.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    if (!email || !password) {
        alert("Please fill all fields");
        return;
    }
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok && data.token) {
            localStorage.setItem("token", data.token);
            alert("Login Successful!");
            window.location.href = "dashboard.html";
        } else {
            alert(data.message || "Invalid credentials");
        }
    } catch (error) {
        console.error("Login Error:", error);
        alert("Server error connecting to backend. Please ensure the backend server is running on port 5000.");
    }
}
// SIGNUP FUNCTION
async function signup(event) {
    if (event) event.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    if (!name || !email || !password) {
        alert("Please fill all fields");
        return;
    }
    // Basic password pattern check: at least 1 uppercase letter, 1 number, and 1 special char
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    if (!hasUppercase || !hasNumber || !hasSpecial) {
        alert("Password must contain at least 1 Uppercase, 1 Number, and 1 Special Character.");
        return;
    }
    try {
        const response = await fetch(`${API_BASE}/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });
        const data = await response.json();
        if (response.ok) {
            alert("Account created successfully! Please login.");
            window.location.href = "index.html";
        } else {
            alert(data.message || "Signup failed");
        }
    } catch (error) {
        console.error("Signup Error:", error);
        alert("Server error connecting to backend. Please ensure the backend server is running on port 5000.");
    }
}