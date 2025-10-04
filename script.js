// Year
document.getElementById('y').textContent = new Date().getFullYear();

// Theme toggle
const root = document.documentElement;
const themeBtn = document.getElementById('themeBtn');

function applyTheme(mode){
  if (mode === 'auto') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', mode);
  themeBtn.textContent = mode[0].toUpperCase() + mode.slice(1);
  localStorage.setItem('theme-pref', mode);
}
applyTheme(localStorage.getItem('theme-pref') || 'auto');

themeBtn.addEventListener('click', ()=>{
  const cur = localStorage.getItem('theme-pref') || 'auto';
  const next = cur==='auto' ? 'dark' : (cur==='dark' ? 'light' : 'auto');
  applyTheme(next);
});

// Language toggle
const langBtn = document.getElementById('langBtn');
const en = document.getElementById('lang-en');
const fa = document.getElementById('lang-fa');

function applyLang(lang){
  if(lang==='fa'){
    fa.style.display='block'; en.style.display='none';
    document.documentElement.lang='fa'; document.documentElement.dir='rtl';
    langBtn.textContent='EN';
  }else{
    fa.style.display='none'; en.style.display='block';
    document.documentElement.lang='en'; document.documentElement.dir='ltr';
    langBtn.textContent='FA';
  }
  localStorage.setItem('lang-pref', lang);
}
applyLang(localStorage.getItem('lang-pref') || 'en');

langBtn.addEventListener('click', ()=>{
  const cur = localStorage.getItem('lang-pref') || 'en';
  applyLang(cur==='en'?'fa':'en');
});
