document.addEventListener('DOMContentLoaded', () => {
  if (isAuthenticated()) {
    window.location.href = 'home.html';
  }
});

function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
  
  if (tab === 'login') {
    document.querySelectorAll('.auth-tab')[0].classList.add('active');
    document.getElementById('loginForm').classList.add('active');
  } else {
    document.querySelectorAll('.auth-tab')[1].classList.add('active');
    document.getElementById('signupForm').classList.add('active');
  }
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const err = document.getElementById('loginError');
  err.style.display = 'none';
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  try {
    const res = await apiCall('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    setAuth(res.data.user, res.data.token);
    window.location.href = 'home.html';
  } catch (error) {
    err.textContent = error.message;
    err.style.display = 'block';
  }
});

document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const err = document.getElementById('signupError');
  err.style.display = 'none';
  
  const name = document.getElementById('signupName').value;
  const displayName = document.getElementById('signupDisplayName').value || name;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const confirm = document.getElementById('signupConfirmPassword').value;
  
  if (password !== confirm) {
    err.textContent = "Passwords do not match.";
    err.style.display = 'block';
    return;
  }
  
  if (password.length < 6) {
    err.textContent = "Password must be at least 6 characters.";
    err.style.display = 'block';
    return;
  }
  
  try {
    await apiCall('/auth/signup', { 
      method: 'POST', 
      body: JSON.stringify({ name, display_name: displayName, email, password }) 
    });
    // Auto-login after successful signup
    const loginRes = await apiCall('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    setAuth(loginRes.data.user, loginRes.data.token);
    window.location.href = 'home.html';
  } catch (error) {
    err.textContent = error.message;
    err.style.display = 'block';
  }
});
