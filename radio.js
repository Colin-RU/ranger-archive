'use strict';
const radioPlaylist=[
 {title:'Charleston',artist:'Golden Gate Orchestra',year:1925,file:'media/charleston-1925.mp3',source:'https://commons.wikimedia.org/wiki/File:Charleston_(1925)_-_Edison_51542-R.ogg',credit:'James P. Johnson · Edison 51542-R · общественное достояние'},
 {title:"Yes Sir, That's My Baby",artist:'Gene Austin & Billy “Uke” Carpenter',year:1925,file:'media/yes-sir-1925.mp3',source:'https://commons.wikimedia.org/wiki/File:Yes_sir,_that%27s_my_baby-Victor_19656-Gene_Austin_and_Billy_%22Uke%22_Carpenter.mp3',credit:'Walter Donaldson, Gus Kahn · Victor 19656 · общественное достояние'},
 {title:"Ain’t We Got Fun",artist:'Billy Jones',year:1921,file:'media/aint-we-got-fun-1921.mp3',source:'https://commons.wikimedia.org/wiki/File:Ain%27t_we_got_fun_-_Billy_Jones.ogg',credit:'Richard A. Whiting, Raymond B. Egan, Gus Kahn · реставрация Adam Cuerden · общественное достояние'}
];
(()=>{
 const audio=$('#radioAudio'),panel=$('#radioPanel');
 let saved={};try{saved=JSON.parse(sessionStorage.getItem('ranger-radio')||'{}');}catch{}
 let index=Number.isInteger(saved.index)&&saved.index>=0&&saved.index<radioPlaylist.length?saved.index:0;
 let revision=0,wantsPlaying=false,lastSaved=0,seeking=false;
 audio.loop=false;audio.volume=typeof saved.volume==='number'?Math.min(1,Math.max(0,saved.volume)):.35;
 panel.innerHTML=`<div class="radio-cover" aria-hidden="true">♫</div><div class="radio-info"><small id="radioCounter">АРХИВНОЕ РАДИО</small><strong id="radioTitle" aria-live="polite"></strong><span id="radioArtist"></span></div><button id="radioClose" class="radio-close" aria-label="Выключить музыку">×</button><label class="radio-track-select"><span class="sr-only">Выбрать запись</span><select id="radioTrack" aria-label="Выбрать запись">${radioPlaylist.map((t,i)=>`<option value="${i}">${t.title} · ${t.year}</option>`).join('')}</select></label><div class="radio-controls"><button id="radioPrev" aria-label="Предыдущая запись">⏮</button><button id="radioPlayPause" aria-label="Включить музыку">▶</button><button id="radioNext" aria-label="Следующая запись">⏭</button><label class="radio-volume">Громкость<input id="radioVolume" type="range" min="0" max="1" step="0.05" value="${audio.volume}" aria-label="Громкость музыки"></label><span class="radio-period">ДОВОЕННЫЙ ДЖАЗ</span></div><div class="radio-progress"><span id="radioElapsed">0:00</span><input id="radioSeek" type="range" min="0" max="1000" step="1" value="0" aria-label="Позиция воспроизведения"><span id="radioDuration">0:00</span></div>`;
 const format=t=>Number.isFinite(t)?Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0'):'0:00';
 function save(){try{sessionStorage.setItem('ranger-radio',JSON.stringify({index,volume:audio.volume,time:audio.currentTime}));}catch{}}
 function render(){const playing=wantsPlaying&&!audio.paused;$('#radioToggle').setAttribute('aria-pressed',playing);$('#radioLabel').textContent=playing?'Музыка включена':'Музыка эпохи';$('#radioPlayPause').textContent=playing?'Ⅱ':'▶';$('#radioPlayPause').setAttribute('aria-label',playing?'Приостановить музыку':'Продолжить музыку');$('#radioElapsed').textContent=format(audio.currentTime);$('#radioDuration').textContent=format(audio.duration);if(!seeking)$('#radioSeek').value=Number.isFinite(audio.duration)&&audio.duration>0?Math.round(audio.currentTime/audio.duration*1000):0;}
 function describe(){const t=radioPlaylist[index];$('#radioTitle').textContent=t.title;$('#radioArtist').textContent=t.artist+' · '+t.year;$('#radioCounter').textContent=`АРХИВНОЕ РАДИО · ${String(index+1).padStart(2,'0')} / 03`;$('#radioTrack').value=String(index);audio.dataset.track=String(index);}
 async function play(){wantsPlaying=true;panel.hidden=false;const attempt=revision;try{await audio.play();if(attempt===revision)render();}catch(e){if(attempt!==revision||e.name==='AbortError')return;wantsPlaying=false;render();toast('Запись не загрузилась. Попробуйте другую запись или нажмите воспроизведение ещё раз.');}}
 function pause(){wantsPlaying=false;revision++;audio.pause();save();render();}
 function selectTrack(n,start=true,time=0){revision++;const current=revision;audio.pause();index=(n+radioPlaylist.length)%radioPlaylist.length;wantsPlaying=false;audio.src=radioPlaylist[index].file;describe();if(time>0)audio.addEventListener('loadedmetadata',()=>{if(current===revision)audio.currentTime=Math.min(time,Math.max(0,audio.duration-1));},{once:true});audio.load();render();if(start)play();save();}
 function toggle(){if(wantsPlaying)pause();else play();}
 $('#radioToggle').addEventListener('click',toggle);
 $('#radioPlayPause').addEventListener('click',toggle);
 $('#radioClose').addEventListener('click',()=>{pause();panel.hidden=true;});
 $('#radioPrev').addEventListener('click',()=>selectTrack(index-1));
 $('#radioNext').addEventListener('click',()=>selectTrack(index+1));
 $('#radioTrack').addEventListener('change',e=>selectTrack(Number(e.target.value)));
 $('#radioVolume').addEventListener('input',e=>{audio.volume=Number(e.target.value);save();});
 $('#radioSeek').addEventListener('input',e=>{seeking=true;if(Number.isFinite(audio.duration))audio.currentTime=Math.min(Number(e.target.value)/1000*audio.duration,Math.max(0,audio.duration-.25));});
 $('#radioSeek').addEventListener('change',()=>{seeking=false;save();render();});
 audio.addEventListener('ended',()=>selectTrack(index+1));
 for(const event of ['play','pause','loadedmetadata','durationchange'])audio.addEventListener(event,render);
 audio.addEventListener('timeupdate',()=>{render();if(Date.now()-lastSaved>5000){lastSaved=Date.now();save();}});
 window.addEventListener('pagehide',save);
 selectTrack(index,false,Number.isFinite(saved.time)?saved.time:0);
})();
