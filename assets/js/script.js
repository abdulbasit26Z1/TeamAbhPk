// site-wide small helpers (nav toggle, smooth scroll, basic DOM readiness)
document.addEventListener('DOMContentLoaded', function(){
  // Mobile nav toggle: look for .mobile-nav-toggle and navmenu
  const toggles = document.querySelectorAll('.mobile-nav-toggle');
  toggles.forEach(t=> t.addEventListener('click', ()=>{
    const nav = document.getElementById('navmenu') || document.querySelector('nav');
    if(nav) nav.classList.toggle('open');
  }));

  // Smooth scroll for local anchor links
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', function(e){
      const href = this.getAttribute('href');
      if(href.length>1){
        const el = document.querySelector(href);
        if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth'}); }
      }
    });
  });
});
