document.addEventListener('DOMContentLoaded', function() {
  var burger = document.getElementById('nav-burger-btn');
  var sidebar = document.querySelector('.doc-sidebar');
  if (burger && sidebar) {
    burger.addEventListener('click', function() {
      sidebar.classList.toggle('open');
      burger.setAttribute('aria-expanded', sidebar.classList.contains('open'));
    });
    sidebar.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        sidebar.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('click', function(e) {
      if (!sidebar.contains(e.target) && !burger.contains(e.target)) {
        sidebar.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }
});
