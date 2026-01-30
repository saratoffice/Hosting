/* Load Header */
fetch('header.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('site-header').innerHTML = html;

    /* Load Navigation */
    fetch('nav.html')
      .then(res => res.text())
      .then(nav => {
        document.getElementById('main-nav').innerHTML = nav;
      });
  });

/* Load Footer */
fetch('footer.html')
  .then(res => res.text())
  .then(footer => {
    document.getElementById('site-footer').innerHTML = footer;
  });
</script>
<script>
/* ===== MOBILE MENU LOGIC ===== */
document.addEventListener("click", function (e) {

  /* Toggle main menu */
  if (e.target.classList.contains("menu-toggle")) {
    const menu = document.querySelector(".menu");
    if (menu) {
      menu.classList.toggle("open");
    }
  }

  /* Toggle dropdowns on mobile */
  const dropdownLink = e.target.closest(".dropdown > a");
  if (dropdownLink && window.innerWidth <= 900) {
    e.preventDefault();
    dropdownLink.parentElement.classList.toggle("open");
  }

});
