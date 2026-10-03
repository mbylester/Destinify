/* Destinify v10 add-on: Basic / Dark mode switch. Basic = Dawn Rose, Dark = Golden Hour (see theme.css).
   Uses the same "dtheme" setting as before, so the choice is remembered. */
(()=>{
const root=document.documentElement,btn=$("themeBtn"),meta=document.querySelector('meta[name="theme-color"]');
const cur=()=>root.dataset.theme=="dark"?"dark":"light";
const wrap=document.createElement("div");wrap.className="xmode";wrap.setAttribute("role","group");wrap.setAttribute("aria-label","Color mode");
wrap.innerHTML='<button type="button" data-xmode="light">☀<span> Basic</span></button><button type="button" data-xmode="dark">🌙<span> Dark</span></button>';
btn.parentNode.insertBefore(wrap,btn);
function sync(){const m=cur();wrap.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.xmode==m)));if(meta)meta.content=m=="dark"?"#1b1464":"#ffc2d4"}
wrap.addEventListener("click",e=>{const b=e.target.closest("[data-xmode]");if(!b)return;root.dataset.theme=b.dataset.xmode;try{localStorage.setItem("dtheme",b.dataset.xmode)}catch(x){}sync()});
new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:["data-theme"]});
sync();
})();
