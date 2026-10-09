'use strict';
let pageController,displayedPath=location.pathname;
const sectionFiles=new Set(['index.html','history.html','ranks.html','collection.html','atlas.html']);
function internalPage(url){const base=new URL('.',location.href);const filename=url.pathname.slice(base.pathname.length)||'index.html';return url.origin===location.origin&&url.pathname.startsWith(base.pathname)&&sectionFiles.has(filename);}
function placePage(url,restore){const anchor=url.hash?document.getElementById(decodeURIComponent(url.hash.slice(1))):null;if(anchor)anchor.scrollIntoView();else window.scrollTo({top:restore??0,behavior:'instant'});}
async function navigatePage(target,{pop=false}={}){
 const url=target instanceof URL?target:new URL(target,location.href);
 if(!internalPage(url)){location.href=url.href;return;}
 if(pageController)pageController.abort();pageController=new AbortController();const controller=pageController;
 const main=$('main');main.setAttribute('aria-busy','true');
 if(!pop)history.replaceState({...history.state,rangerScroll:scrollY},'',location.href);
 try{
  const response=await fetch(url.href,{signal:controller.signal});if(!response.ok)throw Error('page');
  const html=new DOMParser().parseFromString(await response.text(),'text/html'),next=html.querySelector('main');if(!next||!html.body.dataset.page)throw Error('page');
  if(controller.signal.aborted)return;
  $$('dialog[open]').forEach(closeDialog);$('#heroVideo')?.pause();
  $('main').replaceWith(document.importNode(next,true));document.body.className=html.body.className;document.body.dataset.page=html.body.dataset.page;document.title=html.title;displayedPath=url.pathname;
  if(!pop)history.pushState({rangerScroll:0},'',url.href);
  $$('.header nav a').forEach(a=>{if(new URL(a.href).pathname.endsWith('/'+html.body.dataset.page+'.html'))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  $('.header nav').classList.remove('open');$('#menuToggle').setAttribute('aria-expanded','false');$('#menuToggle').setAttribute('aria-label','Открыть меню');
  initializePage();const newMain=$('main');newMain.setAttribute('tabindex','-1');newMain.focus({preventScroll:true});placePage(url,pop?history.state?.rangerScroll:0);
 }catch(error){if(error.name!=='AbortError'){main.removeAttribute('aria-busy');location.href=url.href;}}
}
document.addEventListener('click',e=>{
 if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
 const link=e.target.closest('a[href]');if(!link||link.hasAttribute('download')||(link.target&&link.target!=='_self'))return;
 const url=new URL(link.href);if(!internalPage(url))return;
 if(url.pathname===location.pathname&&url.search===location.search){if(url.hash)return;e.preventDefault();window.scrollTo({top:0,behavior:'smooth'});return;}
 e.preventDefault();navigatePage(url);
});
history.scrollRestoration='manual';
window.addEventListener('popstate',()=>{const url=new URL(location.href);if(url.pathname===displayedPath)placePage(url,history.state?.rangerScroll);else navigatePage(url,{pop:true});});
