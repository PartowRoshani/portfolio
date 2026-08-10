
const root=document.documentElement;
const themeBtn=document.getElementById('themeBtn');
const saved=localStorage.getItem('portfolio-theme');
if(saved){root.dataset.theme=saved}
function updateThemeButton(){if(themeBtn)themeBtn.textContent=root.dataset.theme==='light'?'☀':'☾'}
updateThemeButton();
themeBtn?.addEventListener('click',()=>{root.dataset.theme=root.dataset.theme==='light'?'dark':'light';localStorage.setItem('portfolio-theme',root.dataset.theme);updateThemeButton()});
document.getElementById('year')?.replaceChildren(document.createTextNode(new Date().getFullYear()));
const observer=new IntersectionObserver((entries)=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
