document.addEventListener('DOMContentLoaded', () => {
  if (requireAuth()) {
    buildNav();
    const user = getUser();
    document.getElementById('welcomeText').textContent = `Welcome, ${user.display_name || user.name}!`;
    logActivity('Homepage visited', 'User visited the Global Travel Matrix');
  }
});

function showComingSoon(region) {
  showToast(`Coming Soon! We're expanding to ${region}.`, 'info');
}
