const tracks=[{name:'Night Drive',file:'track-01',art:'cover-small.webp'},{name:'Slow Motion',file:'track-02',art:'track-slow.webp'},{name:'Blue Hour',file:'track-03',art:'track-blue.webp'},{name:'Last Light',file:'track-04',art:'track-last.webp'}];
const audio=document.querySelector('#audio-player');
const currentTrack=document.getElementById('current-track');
const playerArt=document.getElementById('player-art');
const toggle=document.getElementById('toggle-play');
const seek=document.getElementById('seek');
const volume=document.getElementById('volume');
const rows=[...document.querySelectorAll('#track-rows tr')];
let activeTrack=0,shuffle=false,repeat=false,favorite=false;
function icon(name){return `<svg><use href="#i-${name}"/></svg>`}
function update(){const playing=!audio.paused;toggle.innerHTML=icon(playing?'pause':'play');toggle.setAttribute('aria-label',playing?'Пауза':'Відтворити');rows.forEach((row,i)=>{row.classList.toggle('playing',i===activeTrack);row.classList.toggle('is-playing',i===activeTrack&&playing);const btn=row.querySelector('.row-play');btn.innerHTML=icon(i===activeTrack&&playing?'pause':'play');btn.setAttribute('aria-label',(i===activeTrack&&playing?'Пауза ':'Відтворити ')+tracks[i].name)})}
function playTrack(index){activeTrack=(index+tracks.length)%tracks.length;const track=tracks[activeTrack];currentTrack.textContent=track.name;playerArt.src='assets/'+track.art;audio.innerHTML=`<source src="assets/${track.file}.mp3" type="audio/mpeg"><source src="assets/${track.file}.wav" type="audio/wav">`;audio.load();audio.play().catch(()=>{});update()}
function togglePlayback(){if(audio.paused)audio.play().catch(()=>{});else audio.pause()}
function nextTrack(){if(shuffle){let n=Math.floor(Math.random()*(tracks.length-1));playTrack(n>=activeTrack?n+1:n)}else playTrack(activeTrack+1)}
document.querySelectorAll('.row-play').forEach(b=>b.addEventListener('click',()=>{const index=Number(b.dataset.track);if(index===activeTrack)togglePlayback();else playTrack(index)}));
document.getElementById('play-album').addEventListener('click',()=>playTrack(0));
document.getElementById('previous').addEventListener('click',()=>{if(audio.currentTime>3)audio.currentTime=0;else playTrack(activeTrack-1)});
document.getElementById('next').addEventListener('click',nextTrack);
toggle.addEventListener('click',togglePlayback);
audio.addEventListener('play',update);audio.addEventListener('pause',update);
audio.addEventListener('ended',()=>{if(repeat)playTrack(activeTrack);else if(activeTrack<tracks.length-1||shuffle)nextTrack();else update()});
function format(t){if(!Number.isFinite(t))return '0:00';return Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0')}
audio.addEventListener('loadedmetadata',()=>{seek.max=audio.duration||12;document.getElementById('total').textContent=format(audio.duration||12)});
audio.addEventListener('timeupdate',()=>{seek.value=audio.currentTime;document.getElementById('elapsed').textContent=format(audio.currentTime);seek.style.setProperty('--fill',((audio.currentTime/(audio.duration||12))*100)+'%')});
seek.addEventListener('input',()=>{audio.currentTime=Number(seek.value)});
volume.addEventListener('input',()=>{audio.volume=Number(volume.value);audio.muted=false;volume.style.setProperty('--fill',volume.value*100+'%')});
document.getElementById('mute').addEventListener('click',()=>{audio.muted=!audio.muted;document.getElementById('mute').classList.toggle('selected',audio.muted)});
document.getElementById('shuffle').addEventListener('click',e=>{shuffle=!shuffle;e.currentTarget.classList.toggle('selected',shuffle);e.currentTarget.setAttribute('aria-pressed',String(shuffle))});
document.getElementById('repeat').addEventListener('click',e=>{repeat=!repeat;e.currentTarget.classList.toggle('selected',repeat);e.currentTarget.setAttribute('aria-pressed',String(repeat))});
function toggleFavorite(){favorite=!favorite;for(const id of ['favorite-album','player-favorite']){const b=document.getElementById(id);b.classList.toggle('selected',favorite);b.setAttribute('aria-pressed',String(favorite))}renderFavorites()}
document.getElementById('favorite-album').addEventListener('click',toggleFavorite);
document.getElementById('player-favorite').addEventListener('click',toggleFavorite);
document.getElementById('queue').addEventListener('click',()=>{location.hash='home';requestAnimationFrame(()=>document.getElementById('tracklist').scrollIntoView({behavior:'smooth'}))});

function filterTracks(){if(location.hash!=='#home')location.hash='home';const q=document.getElementById('search').value.toLowerCase().trim();let count=0;rows.forEach(r=>{const show=r.dataset.name.includes(q)||'audio studies'.includes(q);r.hidden=!show;if(show)count++});document.getElementById('no-results').hidden=count!==0}
document.getElementById('search').addEventListener('input',filterTracks);
const pages=[...document.querySelectorAll('.route-section')];
const navigation=[...document.querySelectorAll('.sidebar [data-page]')];
function navigate(){
const route=location.hash.slice(1);
const page=pages.some(section=>section.id===route)?route:'home';
pages.forEach(section=>{section.hidden=section.id!==page});
navigation.forEach(link=>{const active=link.dataset.page===page;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current')});
window.scrollTo(0,0);
}
window.addEventListener('hashchange',navigate);
navigate();
const sessionStart=Date.now();
const sessionTime=document.getElementById('session-time');
function updateSession(){const seconds=Math.floor((Date.now()-sessionStart)/1000);sessionTime.textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0')}
window.setInterval(updateSession,1000);
updateSession();
audio.volume=.7;update();

const shareModal=document.querySelector('#share-modal');
const shareOpen=document.querySelector('#more-album');
const shareClose=document.querySelector('#close-share');
const shareLink=document.querySelector('#share-link');
const shareStatus=document.querySelector('#share-status');
function closeShare(){shareModal.hidden=true;document.body.classList.remove('modal-open');shareOpen.focus()}
shareOpen.addEventListener('click',()=>{shareLink.value=window.location.href.split('#')[0]+'#home';shareStatus.textContent='';shareModal.hidden=false;document.body.classList.add('modal-open');shareClose.focus()});
shareClose.addEventListener('click',closeShare);
shareModal.addEventListener('click',event=>{if(event.target===shareModal)closeShare()});
document.querySelector('#copy-share').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(shareLink.value);shareStatus.textContent='Посилання скопійовано'}catch{shareLink.select();shareStatus.textContent='Виділіть посилання та скопіюйте його'}});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!shareModal.hidden){closeShare();return}if(event.code!=='Space'||event.repeat||!shareModal.hidden)return;const focused=document.activeElement;if(focused&&focused.matches('input, textarea, select, button, a, [contenteditable="true"]'))return;event.preventDefault();togglePlayback()});
const reviewForm=document.querySelector('#review-form');
const reviewName=document.querySelector('#review-name');
const reviewText=document.querySelector('#review-text');
const reviewMessage=document.querySelector('#review-message');
const reviewList=document.querySelector('#review-list');
const reviewCount=document.querySelector('#review-count');
let reviews=0;
reviewForm.addEventListener('submit',event=>{event.preventDefault();const name=reviewName.value.trim();const message=reviewText.value.trim();reviewName.classList.toggle('field-error',name.length<2);reviewText.classList.toggle('field-error',message.length<5);if(name.length<2||message.length<5){reviewMessage.textContent='Вкажіть ім’я (від 2 символів) та відгук (від 5 символів).';reviewMessage.classList.add('error');return}reviewMessage.classList.remove('error');const empty=reviewList.querySelector('.review-empty');if(empty)empty.remove();const item=document.createElement('article');item.classList.add('review-item');const avatar=document.createElement('span');avatar.classList.add('review-avatar');avatar.textContent=name.slice(0,1).toUpperCase();const content=document.createElement('div');const heading=document.createElement('strong');heading.textContent=name;const body=document.createElement('p');body.textContent=message;content.append(heading,body);item.append(avatar,content);reviewList.prepend(item);reviews++;reviewCount.textContent=String(reviews);reviewMessage.textContent='Відгук опубліковано';reviewForm.reset()});
[reviewName,reviewText].forEach(field=>field.addEventListener('input',()=>{field.classList.remove('field-error');reviewMessage.textContent='';reviewMessage.classList.remove('error')}));

const themeButton=document.querySelector('#theme-toggle');
const themeLabel=document.querySelector('#theme-label');
const themeMeta=document.querySelector('meta[name="theme-color"]');
function setTheme(dark){document.body.classList.toggle('dark-theme',dark);themeButton.setAttribute('aria-pressed',String(dark));themeButton.setAttribute('aria-label',dark?'Увімкнути світлу тему':'Увімкнути темну тему');themeLabel.textContent=dark?'Світла тема':'Темна тема';themeMeta.setAttribute('content',dark?'#101113':'#ffffff');try{localStorage.setItem('soundroom-theme',dark?'dark':'light')}catch{}}
let savedTheme='light';try{savedTheme=localStorage.getItem('soundroom-theme')||'light'}catch{}
setTheme(savedTheme==='dark');
themeButton.addEventListener('click',()=>setTheme(!document.body.classList.contains('dark-theme')));

function renderFavorites(){const container=document.querySelector('#favorites-content');container.replaceChildren();if(!favorite){const empty=document.createElement('div');empty.className='library-empty';empty.innerHTML='<svg><use href="#i-heart"/></svg><strong>Улюблених альбомів поки немає</strong><p>Натисніть сердечко біля After Hours, щоб додати альбом сюди.</p><a class="library-inline-link" href="#home">Перейти на головну</a>';container.append(empty);return}const card=document.createElement('button');card.type='button';card.className='library-card';card.dataset.action='album';card.innerHTML='<img src="assets/cover-small.webp" alt="Обкладинка After Hours"><strong>After Hours</strong><span>Audio Studies · Улюблене</span>';container.append(card)}
renderFavorites();
document.querySelector('.main').addEventListener('click',event=>{const card=event.target.closest('[data-action]');if(!card)return;const action=card.dataset.action;if(action==='album'||action==='artist')location.hash='about';if(action==='playlist'){location.hash='home';playTrack(0)}});
const accountModal=document.createElement('div');accountModal.className='modal-backdrop';accountModal.id='account-modal';accountModal.hidden=true;accountModal.innerHTML='<section class="share-dialog" role="dialog" aria-modal="true" aria-labelledby="account-title"><div class="share-top"><div><p class="feedback-kicker">SOUNDROOM</p><h2 id="account-title">Обліковий запис</h2></div><button class="modal-close" id="close-account" type="button" aria-label="Закрити">×</button></div><p style="font-size:14px;line-height:1.7;margin:0;color:inherit">Це демонстраційний сайт для практичної роботи. Вхід і реєстрація без сервера недоступні.</p></section>';document.body.append(accountModal);
let accountOpener=null;
function closeAccount(){accountModal.hidden=true;document.body.classList.remove('modal-open');if(accountOpener)accountOpener.focus()}
for(const selector of ['.login','.register'])document.querySelector(selector).addEventListener('click',event=>{accountOpener=event.currentTarget;accountModal.querySelector('#account-title').textContent=event.currentTarget.matches('.login')?'Увійти':'Зареєструватися';accountModal.hidden=false;document.body.classList.add('modal-open');accountModal.querySelector('#close-account').focus()});
accountModal.querySelector('#close-account').addEventListener('click',closeAccount);
accountModal.addEventListener('click',event=>{if(event.target===accountModal)closeAccount()});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!accountModal.hidden)closeAccount()});
