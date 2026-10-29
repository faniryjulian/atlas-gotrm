const PREF=`01|Bourg-en-Bresse;02|Laon;03|Moulins;04|Digne-les-Bains;05|Gap;06|Nice;07|Privas;08|Charleville-Mézières;09|Foix;10|Troyes;11|Carcassonne;12|Rodez;13|Marseille;14|Caen;15|Aurillac;16|Angoulême;17|La Rochelle;18|Bourges;19|Tulle;2A|Ajaccio;2B|Bastia;21|Dijon;22|Saint-Brieuc;23|Guéret;24|Périgueux;25|Besançon;26|Valence;27|Évreux;28|Chartres;29|Quimper;30|Nîmes;31|Toulouse;32|Auch;33|Bordeaux;34|Montpellier;35|Rennes;36|Châteauroux;37|Tours;38|Grenoble;39|Lons-le-Saunier;40|Mont-de-Marsan;41|Blois;42|Saint-Étienne;43|Le Puy-en-Velay;44|Nantes;45|Orléans;46|Cahors;47|Agen;48|Mende;49|Angers;50|Saint-Lô;51|Châlons-en-Champagne;52|Chaumont;53|Laval;54|Nancy;55|Bar-le-Duc;56|Vannes;57|Metz;58|Nevers;59|Lille;60|Beauvais;61|Alençon;62|Arras;63|Clermont-Ferrand;64|Pau;65|Tarbes;66|Perpignan;67|Strasbourg;68|Colmar;69|Lyon;70|Vesoul;71|Mâcon;72|Le Mans;73|Chambéry;74|Annecy;75|Paris;76|Rouen;77|Melun;78|Versailles;79|Niort;80|Amiens;81|Albi;82|Montauban;83|Toulon;84|Avignon;85|La Roche-sur-Yon;86|Poitiers;87|Limoges;88|Épinal;89|Auxerre;90|Belfort;91|Évry-Courcouronnes;92|Nanterre;93|Bobigny;94|Créteil;95|Cergy`.split(';').map(s=>s.split('|'));
const prefByCode=Object.fromEntries(PREF);
// Correspondance officielle des 13 régions métropolitaines et de leurs départements.
const REGIONS=[
 ['Bretagne','22 29 35 56'],
 ['Normandie','14 27 50 61 76'],
 ['Pays de la Loire','44 49 53 72 85'],
 ['Centre-Val de Loire','18 28 36 37 41 45'],
 ['Hauts-de-France','02 59 60 62 80'],
 ['Île-de-France','75 77 78 91 92 93 94 95'],
 ['Grand Est','08 10 51 52 54 55 57 67 68 88'],
 ['Bourgogne-Franche-Comté','21 25 39 58 70 71 89 90'],
 ['Nouvelle-Aquitaine','16 17 19 23 24 33 40 47 64 79 86 87'],
 ['Auvergne-Rhône-Alpes','01 03 07 15 26 38 42 43 63 69 73 74'],
 ['Occitanie','09 11 12 30 31 32 34 46 48 65 66 81 82'],
 ["Provence-Alpes-Côte d’Azur",'04 05 06 13 83 84'],
 ['Corse','2A 2B']
].map(([name,codes])=>({name,codes:codes.split(' ')}));
const regionByCode=Object.fromEntries(REGIONS.flatMap(r=>r.codes.map(c=>[c,r.name])));
const campaignProgress=()=>{const r=readRpg();return REGIONS.map((region,i)=>{const mastered=region.codes.filter(c=>masteryLabel(r.mastery[c])==='Maîtrisé').length;return {...region,mastered,conquered:mastered===region.codes.length,unlocked:i===0||REGIONS[i-1].codes.every(c=>masteryLabel(r.mastery[c])==='Maîtrisé')}})};
// V0.8.0 phase 2: one authoritative user-facing mode, legacy selectors are adapters.
const GAME_MODES=Object.freeze({
 exploration:{conquest:'all',exercise:'free',description:'Explore les 96 départements à ton rythme, sans conquête régionale.'},
 national:{conquest:'all',exercise:'progressive',description:'Un quiz sur la France entière avec un score de session.'},
 regional:{conquest:'free',exercise:'progressive',description:'Choisis une région et teste tes connaissances dans une session dédiée.'},
 campaign:{conquest:'campaign',exercise:'progressive',description:'Progresse de région en région selon les déblocages RPG.'}
});
function syncGameMode(){
 const selected=$('gameMode').value,config=GAME_MODES[selected];
 if(!config)return;
 $('conquestMode').value=config.conquest;
 $('mode').value=config.exercise;
 $('exercise').disabled=config.exercise==='free';
 const exerciseWrap=$('exercise').closest('label');
 exerciseWrap.hidden=selected==='exploration';
 $('freeExerciseInfo').hidden=selected!=='exploration';
 $('gameModeDescription').textContent=config.description;
 $('count').disabled=selected==='regional'||selected==='campaign';
 $('revision').disabled=selected==='regional'||selected==='campaign';
 if($('revision').disabled)$('revision').checked=false;
 renderConquest();
}
let activeRegion=null,activeConquestMode='all',activeGameMode='national';
const MODE_LABELS={exploration:'Exploration libre',national:'Quiz France entière',regional:'Défi régional',campaign:'Campagne RPG'};
function renderActiveMode(){const el=$('activeModeBadge');if(el)el.textContent=(MODE_LABELS[activeGameMode]||'Mode inconnu')+(activeRegion?' · '+activeRegion:'');}

function updateRegionalCount(){
 const regional=['regional','campaign'].includes($('gameMode').value);
 $('countWrap').hidden=regional;
 const info=$('regionCountInfo');info.hidden=!regional;
 if(regional){
  const region=REGIONS.find(r=>r.name===$('regionChoice').value);
  info.textContent=region?`Territoire complet : ${region.name} · ${region.codes.length} départements à évaluer.`:'Choisis une région pour connaître le nombre de départements.';
 }
}
function renderConquest(){
 const mode=$('conquestMode').value;
 const wrap=$('regionChoiceWrap');wrap.hidden=mode==='all';
 const sel=$('regionChoice');const previous=sel.value;sel.replaceChildren();
 const progress=campaignProgress();
 for(const r of progress){
  if(mode==='campaign'&&!r.unlocked)continue;
  const opt=document.createElement('option');opt.value=r.name;opt.textContent=r.name+' ('+r.codes.length+' départements)';sel.append(opt);
 }
 if([...sel.options].some(o=>o.value===previous))sel.value=previous;
 updateRegionalCount();
 $('campaignHint').textContent=mode==='campaign'?'Campagne : conquiers tous les départements d’une région pour débloquer la suivante.':mode==='all'?'France entière : les 96 départements restent disponibles.':'Conquête libre : clique sur une carte pour choisir ta région.';
 const panel=$('campaignPanel');
 panel.hidden=!['regional','campaign'].includes($('gameMode').value);
 panel.replaceChildren();
 const heading=document.createElement('div');heading.className='conquest-heading';
 const headingText=document.createElement('div');
 const h=document.createElement('h3');h.textContent='⚔ Les treize conquêtes';headingText.append(h);
 const desc=document.createElement('p');desc.textContent=mode==='all'?'Explore les territoires. Active la conquête libre ou la campagne pour sélectionner une région.':'Sélectionne ton territoire directement sur une carte.';headingText.append(desc);heading.append(headingText);
 const counter=document.createElement('span');counter.className='conquest-counter';counter.textContent=progress.filter(r=>r.conquered).length+' / 13 conquises';heading.append(counter);panel.append(heading);
 const grid=document.createElement('div');grid.className='region-grid';
 for(const r of progress){
  const unavailable=mode==='campaign'&&!r.unlocked;
  const selected=mode!=='all'&&sel.value===r.name;
  const status=r.conquered?'Conquise':unavailable?'Verrouillée':r.mastered?'En progression':'À conquérir';
  const card=document.createElement('button');card.type='button';
  card.className='region-card'+(r.conquered?' conquered':'')+(unavailable?' locked':'')+(selected?' selected':'');
  card.disabled=unavailable;card.setAttribute('aria-pressed',String(selected));
  card.setAttribute('aria-label',r.name+', '+r.mastered+' sur '+r.codes.length+' départements maîtrisés, '+status);
  const top=document.createElement('div');top.className='region-card-top';
  const title=document.createElement('strong');title.textContent=r.name;top.append(title);
  const emblem=document.createElement('span');emblem.className='region-emblem';emblem.setAttribute('aria-hidden','true');emblem.textContent=r.conquered?'✦':unavailable?'🔒':'⚔';top.append(emblem);card.append(top);
  const info=document.createElement('p');info.textContent=r.mastered+' / '+r.codes.length+' départements maîtrisés';card.append(info);
  const track=document.createElement('div');track.className='region-track';track.setAttribute('role','progressbar');track.setAttribute('aria-label','Maîtrise de '+r.name);track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax',String(r.codes.length));track.setAttribute('aria-valuenow',String(r.mastered));
  const fill=document.createElement('div');fill.style.width=(100*r.mastered/r.codes.length)+'%';track.append(fill);card.append(track);
  const foot=document.createElement('div');foot.className='region-card-foot';
  const badge=document.createElement('span');badge.className='region-status';badge.textContent=status;foot.append(badge);
  const arrow=document.createElement('span');arrow.className='region-arrow';arrow.setAttribute('aria-hidden','true');arrow.textContent=selected?'✓':'›';foot.append(arrow);card.append(foot);
  if(!unavailable)card.addEventListener('click',()=>{
   const choice=$('regionChoice');
   // Rebuild options before selecting when leaving the France-wide mode.
   renderConquest();choice.value=r.name;renderConquest();
   $('setupMsg').textContent='Territoire sélectionné : '+r.name+'. Clique sur COMMENCER pour lancer ton entraînement.';
  });
  grid.append(card);
 }
 panel.append(grid);
}
const $=id=>document.getElementById(id);
$('regionChoice').addEventListener('change',renderConquest);
$('gameMode').addEventListener('change',syncGameMode);

let departments=[],session=[],index=0,answers=[],selected=null,locked=false,variant='',scale=1,tx=0,ty=0,drag=null,freeMode=false,freeDone=new Set(),filterRegion='all',searchCode=null,sessionSaved=false,sessionLimit=50;
const norm=s=>String(s||'').trim().toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’'\s-]+/g,'');
// Comparaison des codes : 4 et 04 sont équivalents, mais 2A/2B restent distincts.
const normalizeDepartmentCode=value=>{const code=String(value??'').trim().toUpperCase();return /^\d{1,2}$/.test(code)?code.padStart(2,'0'):code;};
const sameDepartmentCode=(entered,expected)=>normalizeDepartmentCode(entered)===normalizeDepartmentCode(expected);
const shuffle=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const k=Math.floor(Math.random()*(i+1));[b[i],b[k]]=[b[k],b[i]]}return b};
const geoURL='https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements.geojson';
async function loadMap(){try{const r=await fetch(geoURL);if(!r.ok)throw Error('HTTP '+r.status);const data=await r.json();departments=data.features.filter(f=>prefByCode[f.properties.code]).map(f=>({...f,code:f.properties.code,name:f.properties.nom,pref:prefByCode[f.properties.code]}));if(departments.length!==96)throw Error('96 départements attendus, '+departments.length+' reçus');drawMap();drawEncyclopediaMap();populateRegions();renderRpg();renderConquest();$('mapStatus').textContent='Carte chargée : 96 départements.';}catch(e){$('mapStatus').textContent='Carte indisponible : connexion Internet requise pour charger les contours. '+e.message;}}
function project(c){return [(c[0]+5.8)/16*800,(51.5-c[1])/11.2*800]}
function geometryPath(g){const polys=g.type==='Polygon'?[g.coordinates]:g.coordinates;return polys.map(poly=>poly.map(ring=>ring.map((p,i)=>(i?'L':'M')+project(p).map(x=>x.toFixed(2)).join(',')).join(' ')+' Z').join(' ')).join(' ')}
function populateRegions(){const sel=$('regionFilter');const names=[...new Set(departments.map(d=>regionByCode[d.code]||'').filter(Boolean))].sort();for(const n of names){const o=document.createElement('option');o.value=n;o.textContent=n;sel.append(o)}if(!names.length){sel.hidden=true}}
function drawMap(){const g=$('mapLayer');g.innerHTML='';for(const d of departments){const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',geometryPath(d.geometry));p.dataset.code=d.code;p.setAttribute('tabindex','0');p.setAttribute('role','button');p.setAttribute('aria-label','Département sélectionnable');p.addEventListener('click',e=>{if(e.detail===0)choose(d.code)});p.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(d.code)}});p.addEventListener('dblclick',e=>{e.preventDefault();zoom(1.7)});g.appendChild(p)}applyTransform()}
function applyTransform(){$('mapLayer').setAttribute('transform',`translate(${tx} ${ty}) scale(${scale})`)}
function zoom(f){scale=Math.max(1,Math.min(9,scale*f));applyTransform()}
$('zoomIn').onclick=()=>zoom(1.35);$('zoomOut').onclick=()=>zoom(1/1.35);$('resetZoom').onclick=()=>{scale=1;tx=ty=0;applyTransform()};
// V0.6.5 — déplacement à un doigt et zoom par pincement à deux doigts.
const svg=$('map');
const activePointers=new Map();
const tapOrigins=new Map();
let gestureWasMultiTouch=false;
let pinch=null;
const svgPoint=(x,y)=>{
  const p=svg.createSVGPoint();p.x=x;p.y=y;
  const matrix=svg.getScreenCTM();
  if(!matrix)return {x:0,y:0};
  const result=p.matrixTransform(matrix.inverse());
  return {x:result.x,y:result.y};
};
function pointerPair(){
  const [a,b]=[...activePointers.values()];
  return {x:(a.x+b.x)/2,y:(a.y+b.y)/2,distance:Math.hypot(a.x-b.x,a.y-b.y)};
}
function beginPinch(){
  const pair=pointerPair(),center=svgPoint(pair.x,pair.y);
  pinch={distance:Math.max(pair.distance,1),scale,worldX:(center.x-tx)/scale,worldY:(center.y-ty)/scale};
  drag=null;svg.classList.remove('dragging');
}
svg.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY<0?1.18:1/1.18)},{passive:false});
svg.addEventListener('pointerdown',e=>{
  if(e.pointerType==='mouse'&&e.button!==0)return;
  activePointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  tapOrigins.set(e.pointerId,{x:e.clientX,y:e.clientY,moved:false});
  if(activePointers.size>1)gestureWasMultiTouch=true;
  try{svg.setPointerCapture(e.pointerId)}catch{}
  if(activePointers.size===2){beginPinch()}
  else if(activePointers.size===1){drag={x:e.clientX,y:e.clientY,tx,ty};svg.classList.add('dragging')}
});
svg.addEventListener('pointermove',e=>{
  if(!activePointers.has(e.pointerId))return;
  activePointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  const origin=tapOrigins.get(e.pointerId);
  if(origin&&Math.hypot(e.clientX-origin.x,e.clientY-origin.y)>8)origin.moved=true;
  if(activePointers.size>=2){
    if(activePointers.size!==2)return;
    if(!pinch)beginPinch();
    const pair=pointerPair(),center=svgPoint(pair.x,pair.y);
    scale=Math.max(1,Math.min(9,pinch.scale*pair.distance/pinch.distance));
    tx=center.x-pinch.worldX*scale;
    ty=center.y-pinch.worldY*scale;
    applyTransform();
  }else if(drag){
    const before=svgPoint(drag.x,drag.y),after=svgPoint(e.clientX,e.clientY);
    tx=drag.tx+after.x-before.x;
    ty=drag.ty+after.y-before.y;
    applyTransform();
  }
});
function endPointer(e){
  if(!activePointers.has(e.pointerId))return;
  activePointers.delete(e.pointerId);
  pinch=null;
  if(activePointers.size===1){
    const p=[...activePointers.values()][0];
    drag={x:p.x,y:p.y,tx,ty};svg.classList.add('dragging');
  }else{drag=null;svg.classList.remove('dragging')}
}
// La capture du pointeur redirige parfois le clic vers le SVG plutôt que vers le path.
// Identifier le département sous un véritable appui bref, sans sélectionner après un glissement.
svg.addEventListener('pointerup',e=>{
  const origin=tapOrigins.get(e.pointerId);
  if(origin&&!origin.moved&&!gestureWasMultiTouch&&activePointers.size===1){
    const hit=[...svg.querySelectorAll('path[data-code]')].find(path=>{
      if(typeof path.isPointInFill!=='function')return false;
      const local=svg.createSVGPoint();local.x=e.clientX;local.y=e.clientY;
      const matrix=path.getScreenCTM();
      return matrix&&path.isPointInFill(local.matrixTransform(matrix.inverse()));
    });
    if(hit){
      // Une seule source de sélection pour les interactions au pointeur.
      choose(hit.dataset.code);
    }
  }
  tapOrigins.delete(e.pointerId);
  if(activePointers.size===1)gestureWasMultiTouch=false;
});
svg.addEventListener('pointercancel',e=>{tapOrigins.delete(e.pointerId);gestureWasMultiTouch=false});
svg.addEventListener('pointerup',endPointer);
svg.addEventListener('pointercancel',endPointer);
svg.addEventListener('lostpointercapture',endPointer);

function choose(code){
  if(activeRegion&&regionByCode[code]!==activeRegion)return;
  if(freeMode&&freeDone.has(code))return;
  if(locked){
    // En exploration libre, un clic sur un autre département passe directement à l'exercice suivant.
    // Le résultat précédent a déjà été sauvegardé dans answers par submitFree().
    if(!freeMode)return;
    if(freeDone.size>=sessionLimit){finish();return;}
    selected=null;
    renderFree();
  }
  selected=code;
  $('selected').textContent='Département sélectionné sur la carte';
  if(freeMode){$('clue').textContent='Département sélectionné : complète les trois informations.';}
  paint();
}
function paint(){document.querySelectorAll('#map path').forEach(p=>{p.classList.remove('active','correct','incorrect','highlight','exam-clue');if(p.dataset.code===selected)p.classList.add('active');if($('game').hidden)return;if(!freeMode&&variant==='map'&&session[index]?.code===p.dataset.code)p.classList.add('exam-clue');if(freeMode&&freeDone.has(p.dataset.code))p.classList.add('correct');if(searchCode===p.dataset.code)p.classList.add('highlight');if(filterRegion!=='all'&&regionByCode[p.dataset.code]!==filterRegion)p.classList.add('dimmed');if($('correction').value==='immediate')for(const a of answers){if(a.target.code===p.dataset.code && !(variant==='map' && !locked))p.classList.add(a.right?'correct':'incorrect')}})}
function setVisible(section){for(const id of ['setup','game','results','analytics','encyclopedia'])$(id).hidden=id!==section;$('startDock').hidden=section!=='setup';closeSiteMenu()}
function start(){syncGameMode();activeGameMode=$('gameMode').value;if(!departments.length){$('setupMsg').textContent='Attends le chargement de la carte ou vérifie ta connexion.';return}let pool=departments;activeConquestMode=$('conquestMode').value;activeRegion=activeConquestMode==='all'?null:$('regionChoice').value;if(activeRegion)pool=pool.filter(d=>regionByCode[d.code]===activeRegion);if($('revision').checked){const codes=JSON.parse(localStorage.getItem('dm_errors')||'[]');pool=pool.filter(d=>codes.includes(d.code));if(!pool.length){$('setupMsg').textContent='Aucune erreur enregistrée pour ce territoire.';return}}freeMode=$('mode').value==='free';const regionalSession=['regional','campaign'].includes(activeGameMode);if(regionalSession&&$('revision').checked){$('setupMsg').textContent='Désactive « Réviser uniquement mes erreurs précédentes » pour jouer le défi complet de cette région.';return}const requestedCount=regionalSession?pool.length:Number($('count').value);session=freeMode?pool:shuffle(pool).slice(0,requestedCount);sessionLimit=Math.min(requestedCount,session.length);answers=[];index=0;selected=null;locked=false;sessionSaved=false;freeDone=new Set();searchCode=null;$('mapSearch').value='';$('mapTools').hidden=!freeMode;$('freeProgress').hidden=!freeMode;setVisible('game');renderActiveMode();filterRegion=activeRegion||'all';$('regionFilter').value=activeRegion||'all';$('regionFilter').disabled=true;$('workspace').classList.toggle('immersive',$('layout').value==='immersive');if(freeMode)renderFree();else renderQuestion()}
function renderFree(){locked=false;variant='free';$('counter').textContent=`Carte libre · ${freeDone.size} / ${sessionLimit}`;$('prompt').textContent=(activeRegion?'Conquête de '+activeRegion+' · ':'')+'Choisis librement les départements à évaluer, puis complète les trois informations.';$('clue').textContent='Sélectionne un département sur la carte.';for(const id of ['code','name','pref']){$(id).value='';$(id).disabled=false}$('selected').textContent='Aucun département sélectionné';$('freeProgress').textContent=`${sessionLimit-freeDone.size} réponses restantes`;$('feedback').textContent='';$('feedback').className='';$('submit').hidden=false;$('next').hidden=true;paint()}
function renderQuestion(){if(index>=session.length)return finish();locked=false;selected=null;for(const id of ['code','name','pref']){$(id).value='';$(id).disabled=false}const ex=$('exercise').value;variant=ex==='identify'?'map':ex==='locate'?shuffle(['code','name','pref'])[0]:shuffle(['map','code','name','pref'])[0];const d=session[index];$('counter').textContent=`Question ${index+1} / ${session.length}`;$('prompt').textContent=(activeRegion?'Conquête de '+activeRegion+' · ':'')+'Complète les informations non fournies et localise le département si nécessaire.';$('clue').textContent=variant==='map'?'Indice : département surligné sur la carte':`Indice : ${variant==='code'?'numéro '+d.code:variant==='name'?'département '+d.name:'préfecture '+d.pref}`;if(variant!=='map'){const id={code:'code',name:'name',pref:'pref'}[variant];$(id).value=d[variant];$(id).disabled=true}else selected=null;$('selected').textContent=variant==='map'?'Localisation déjà fournie':'Clique sur le département correspondant';$('feedback').textContent='';$('feedback').className='';$('submit').hidden=false;$('next').hidden=true;paint()}
function submit(){if(locked)return;if(freeMode)return submitFree();const d=session[index];const checks={code:variant==='code'||sameDepartmentCode($('code').value,d.code),name:variant==='name'||norm($('name').value)===norm(d.name),pref:variant==='pref'||norm($('pref').value)===norm(d.pref),map:variant==='map'||selected===d.code};const graded=Object.entries(checks).filter(([k])=>k!==variant);const points=graded.filter(([,ok])=>ok).length;const a={target:d,checks,points,max:graded.length,right:points===graded.length,variant};answers.push(a);locked=true;$('submit').hidden=true;$('next').hidden=false;$('next').textContent=index===session.length-1?'Voir les résultats →':'Question suivante →';const feedback=$('feedback');if($('correction').value==='immediate'){feedback.className=a.right?'good':'bad';const names={code:'Numéro',name:'Département',pref:'Préfecture',map:'Localisation'};const detail=graded.map(([key,ok])=>`${ok?'✓':'✗'} ${names[key]} : ${ok?'correct':key==='map'?'département non sélectionné ou incorrect':'incorrect'}`).join(' · ');feedback.replaceChildren();const headline=document.createElement('b');headline.textContent=`${points}/${a.max} compétences validées`;const explanation=document.createElement('div');explanation.textContent=detail;const solution=document.createElement('div');solution.textContent=`Réponse attendue : ${d.code} — ${d.name} — ${d.pref}`;feedback.append(headline,explanation,solution);}else feedback.textContent='Réponse enregistrée. Correction à la fin de la session.';paint()}
function submitFree(){if(!selected){$('feedback').textContent='Sélectionne d’abord un département sur la carte.';return}const d=session.find(x=>x.code===selected);if(!d){$('feedback').textContent='Ce département n’est pas disponible dans cette révision ciblée. Choisis un département à réviser.';return}const checks={code:sameDepartmentCode($('code').value,d.code),name:norm($('name').value)===norm(d.name),pref:norm($('pref').value)===norm(d.pref),map:true};const points=Object.values(checks).filter(Boolean).length-1;const a={target:d,checks,points,max:3,right:points===3,variant:"free"};answers.push(a);freeDone.add(d.code);locked=true;$('submit').hidden=true;$('next').hidden=false;$('next').textContent=freeDone.size>=sessionLimit?'Voir les résultats →':'Choisir un autre département →';$('feedback').className=$('correction').value==='immediate'?(a.right?'good':'bad'):'';$('feedback').textContent=$('correction').value==='immediate'?`${points}/3 · ${d.code} — ${d.name} — ${d.pref}`:'Réponse enregistrée. Correction à la fin.';paint()}
// RPG progression is separate from pedagogical mastery. Only completed sessions grant XP.
const RPG_KEY='dm_rpg_v04';
const RANKS=['Novice','Éclaireur','Cartographe','Maître des territoires','Grand Cartographe'];
function defaultRpg(){return {xp:0,mastery:{},achievements:[],completed:0}}
function readRpg(){try{const v=JSON.parse(localStorage.getItem(RPG_KEY)||'null');return v&&typeof v==='object'?{...defaultRpg(),...v,mastery:v.mastery||{},achievements:v.achievements||[]}:defaultRpg()}catch{return defaultRpg()}}
function rpgLevel(xp){return Math.floor(Math.sqrt(Math.max(0,xp)/100))+1}
function rpgThreshold(level){return 100*(level-1)**2}
function rankFor(level){return RANKS[Math.min(RANKS.length-1,Math.floor((level-1)/3))]}
function masteryLabel(m){if(!m||!m.attempts)return 'Inexploré';const fields=['code','name','pref','map'];const covered=fields.filter(k=>(m.fields?.[k]?.attempts||0)>0);if(covered.length<4)return 'À découvrir';if(fields.every(k=>m.fields[k].correct>=3&&m.fields[k].correct/m.fields[k].attempts>=.8))return 'Maîtrisé';return 'En apprentissage'}
function recordRpg(gradedAnswers){const r=readRpg();const oldLevel=rpgLevel(r.xp);let earned=0;for(const a of gradedAnswers){const code=a.target.code;const m=r.mastery[code]||{attempts:0,fields:{}};m.attempts++;for(const [k,ok] of Object.entries(a.checks)){if(a.variant===k||a.variant==='free'&&k==='map')continue;const f=m.fields[k]||{attempts:0,correct:0};f.attempts++;if(ok)f.correct++;m.fields[k]=f}r.mastery[code]=m;earned+=a.points*10+(a.right?10:0)}r.xp+=earned;r.completed++;const mastered=Object.values(r.mastery).filter(m=>masteryLabel(m)==='Maîtrisé').length;const achievements=[['first','Première épreuve',r.completed>=1],['ten','Dix épreuves',r.completed>=10],['explorer','Explorateur des 20',Object.keys(r.mastery).length>=20],['master1','Premier territoire maîtrisé',mastered>=1],['master10','Dix territoires maîtrisés',mastered>=10]];const unlocked=[];for(const [id,name,condition] of achievements){if(condition&&!r.achievements.includes(id)){r.achievements.push(id);unlocked.push(name)}}localStorage.setItem(RPG_KEY,JSON.stringify(r));return {earned,level:rpgLevel(r.xp),levelUp:rpgLevel(r.xp)>oldLevel,unlocked}}
function renderRpg(){const r=readRpg(),level=rpgLevel(r.xp),floor=rpgThreshold(level),ceil=rpgThreshold(level+1),pct=Math.min(100,Math.round((r.xp-floor)/(ceil-floor)*100));const mastered=Object.values(r.mastery).filter(m=>masteryLabel(m)==='Maîtrisé').length;const panel=$('rpgPanel');panel.replaceChildren();const title=document.createElement('h2');title.textContent='⚔ '+rankFor(level)+' · Niveau '+level;panel.append(title);const sub=document.createElement('p');sub.textContent=`${r.xp} XP au total · ${r.xp-floor} / ${ceil-floor} XP vers le niveau suivant`;panel.append(sub);const bar=document.createElement('div');bar.className='xp-track';const fill=document.createElement('div');fill.className='xp-fill';fill.style.width=pct+'%';bar.append(fill);panel.append(bar);const stats=document.createElement('p');stats.textContent=`✦ ${mastered}/96 départements maîtrisés · ${Object.keys(r.mastery).length}/96 explorés · ${r.achievements.length} succès`;panel.append(stats);const list=$('masteryPanel');list.replaceChildren();const heading=document.createElement('h3');heading.textContent='Grimoire des territoires';list.append(heading);const note=document.createElement('p');note.textContent='Maîtrise : au moins 3 bonnes réponses et 80 % de réussite dans chacune des 4 compétences (numéro, nom, préfecture, localisation).';list.append(note);const entries=Object.entries(r.mastery).sort((a,b)=>a[0].localeCompare(b[0],'fr'));if(!entries.length){const empty=document.createElement('p');empty.textContent='Termine une session pour commencer ton grimoire.';list.append(empty)}else{const grid=document.createElement('div');grid.className='mastery-grid';for(const [code,m] of entries){const d=document.createElement('div');d.className='mastery-item';const dept=departments.find(x=>x.code===code);d.textContent=`${code} · ${dept?.name||'Département'} — ${masteryLabel(m)}`;grid.append(d)}list.append(grid)}}
function finish(){if(sessionSaved)return;sessionSaved=true;setVisible('results');const points=answers.reduce((s,a)=>s+a.points,0),max=answers.reduce((s,a)=>s+a.max,0);$('score').textContent=`${points} / ${max} points (${max?Math.round(points/max*100):0} %) · ${answers.length} départements évalués.`;const wrong=answers.filter(a=>!a.right);$('mistakes').textContent=wrong.length?'À réviser : '+wrong.map(a=>`${a.target.code} ${a.target.name} (${a.target.pref})`).join(' · '):'Aucune erreur sur les réponses validées.';const previous=new Set(JSON.parse(localStorage.getItem('dm_errors')||'[]'));for(const a of answers){if(a.right)previous.delete(a.target.code);else previous.add(a.target.code)}localStorage.setItem('dm_errors',JSON.stringify([...previous]));const history=JSON.parse(localStorage.getItem('dm_history')||'[]');history.push({date:new Date().toISOString(),points,max,count:answers.length});localStorage.setItem('dm_history',JSON.stringify(history));const gain=recordRpg(answers);$('reward').textContent=`⚔ +${gain.earned} XP · Niveau ${gain.level}${gain.levelUp?' · NIVEAU SUPÉRIEUR !':''}${gain.unlocked.length?' · Succès : '+gain.unlocked.join(', '):''}`;$('details').replaceChildren();if($('correction').value==='end'){for(const a of answers){const el=document.createElement('p');el.textContent=`${a.right?'✓':'✗'} ${a.target.code} — ${a.target.name} — ${a.target.pref} : ${a.points}/${a.max}`;$('details').append(el)}}renderDashboard()}
// Gestion unique de la validation : clavier et clic suivent exactement la même logique.
const answerForm = $('answerForm');
answerForm.addEventListener('submit', event => {
  event.preventDefault();
  if ($('game').hidden || locked) return;
  submit();
});
// Capture avant les autres gestionnaires, y compris si le focus a changé.
document.addEventListener('keydown', event => {
  if (event.key !== 'Enter' || event.repeat || event.isComposing || $('game').hidden) return;
  const target = event.target;
  if (target && (target.closest('#mapPanel') || target.closest('.toolbar'))) return;
  if (target && target.tagName === 'BUTTON' && !['submit','next'].includes(target.id)) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (locked) {
    if (!$('next').hidden) $('next').click();
  } else {
    answerForm.requestSubmit();
  }
}, true);

// V0.6 — Tableau de bord pédagogique. Lecture seule des données V0.5.4.
function analyticsNode(tag, cls, text){const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=String(text);return el}
function analyticsBar(label, correct, attempts, suffix=''){
 const row=analyticsNode('div','an-bar-row');const head=analyticsNode('div','an-bar-head');
 head.append(analyticsNode('span','',label),analyticsNode('strong','',attempts?`${Math.round(100*correct/attempts)} % · ${correct}/${attempts}${suffix}`:'Non évalué'));
 const track=analyticsNode('div','an-track');const fill=analyticsNode('div','an-fill');fill.style.width=(attempts?Math.round(100*correct/attempts):0)+'%';track.append(fill);row.append(head,track);return row;
}
function safeStoredArray(key){try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch{return []}}
function renderAnalytics(){
 const root=$('analyticsContent');root.replaceChildren();const r=readRpg(), history=safeStoredArray('dm_history'),errors=safeStoredArray('dm_errors');
 const entries=Object.entries(r.mastery),mastered=entries.filter(([,m])=>masteryLabel(m)==='Maîtrisé').length;
 const total=history.reduce((n,h)=>n+(Number(h.points)||0),0),maximum=history.reduce((n,h)=>n+(Number(h.max)||0),0);
 const summary=analyticsNode('div','an-kpis');
 for(const [value,label] of [[history.length,'Sessions terminées'],[maximum?Math.round(100*total/maximum)+' %':'—','Réussite cumulée'],[entries.length+' / 96','Départements explorés'],[mastered+' / 96','Départements maîtrisés'],[errors.length,'À réviser'],[r.xp+' XP','Expérience gagnée']]){
  const card=analyticsNode('div','an-kpi');card.append(analyticsNode('strong','',value),analyticsNode('span','',label));summary.append(card)
 }root.append(summary);
 const duo=analyticsNode('div','an-two');
 const skills=analyticsNode('section','an-box');skills.append(analyticsNode('h2','','Les quatre compétences'));
 const labels={code:'Numéros',name:'Noms des départements',pref:'Préfectures',map:'Localisation sur la carte'};
 const totals=Object.fromEntries(Object.keys(labels).map(k=>[k,{correct:0,attempts:0}]));
 for(const [,m] of entries)for(const k of Object.keys(labels)){const f=m.fields?.[k];totals[k].correct+=Number(f?.correct)||0;totals[k].attempts+=Number(f?.attempts)||0}
 for(const [k,label] of Object.entries(labels))skills.append(analyticsBar(label,totals[k].correct,totals[k].attempts));
 skills.append(analyticsNode('p','an-note','Un indice fourni n’est pas compté comme une réponse évaluée.'));
 const trend=analyticsNode('section','an-box');trend.append(analyticsNode('h2','','Évolution des sessions'));
 if(!history.length)trend.append(analyticsNode('p','an-note','Termine une session pour afficher ton évolution.'));
 else{
  const recent=history.slice(-12),chart=analyticsNode('div','an-chart');
  recent.forEach((h,i)=>{const max=Number(h.max)||0,points=Number(h.points)||0,pct=max?Math.max(0,Math.min(100,Math.round(100*points/max))):0;const col=analyticsNode('div','an-chart-col');const bar=analyticsNode('div','an-chart-bar');bar.style.height=Math.max(3,pct)+'%';bar.title=`Session ${history.length-recent.length+i+1} : ${pct} %`;col.append(analyticsNode('small','',pct+' %'),bar,analyticsNode('span','',String(history.length-recent.length+i+1)));chart.append(col)});trend.append(chart);
  trend.append(analyticsNode('p','an-note','Les 12 dernières sessions · score global par session.'));
 }
 duo.append(skills,trend);root.append(duo);
 const regions=analyticsNode('section','an-box');regions.append(analyticsNode('h2','','Maîtrise des 13 régions'));
 const regionGrid=analyticsNode('div','an-regions');for(const reg of REGIONS){const n=reg.codes.filter(code=>masteryLabel(r.mastery[code])==='Maîtrisé').length;const item=analyticsNode('div','an-region');item.append(analyticsNode('strong','',reg.name),analyticsNode('span','',`${n} / ${reg.codes.length} maîtrisés`));const track=analyticsNode('div','an-track'),fill=analyticsNode('div','an-fill');fill.style.width=(100*n/reg.codes.length)+'%';track.append(fill);item.append(track);regionGrid.append(item)}regions.append(regionGrid);root.append(regions);
 const weak=analyticsNode('section','an-box');weak.append(analyticsNode('h2','','Priorités de révision'));
 const priorities=entries.map(([code,m])=>{const attempts=Object.values(m.fields||{}).reduce((n,f)=>n+(Number(f.attempts)||0),0);const correct=Object.values(m.fields||{}).reduce((n,f)=>n+(Number(f.correct)||0),0);return {code,attempts,correct,rate:attempts?correct/attempts:1,level:masteryLabel(m)}}).filter(x=>x.level!=='Maîtrisé').sort((a,b)=>a.rate-b.rate||b.attempts-a.attempts).slice(0,12);
 if(!priorities.length)weak.append(analyticsNode('p','an-note','Aucune faiblesse mesurée pour le moment. Continue tes entraînements pour enrichir le diagnostic.'));
 else{const list=analyticsNode('div','an-priorities');for(const x of priorities){const d=departments.find(dep=>dep.code===x.code),item=analyticsNode('div','an-priority');item.append(analyticsNode('strong','',`${x.code} · ${d?.name||'Département'}`),analyticsNode('span','',`${Math.round(x.rate*100)} % · ${x.level}`));list.append(item)}weak.append(list)}
 if(errors.length)weak.append(analyticsNode('p','an-note',`${errors.length} département(s) figurent dans ta liste d’erreurs précédentes. Active « Réviser uniquement mes erreurs précédentes » depuis l’accueil pour les travailler.`));
 root.append(weak);
 root.append(analyticsNode('p','an-footnote','Données enregistrées uniquement dans ce navigateur. Les scores historiques mesurent les sessions ; les compétences proviennent du grimoire RPG. Aucune donnée existante n’est modifiée.'));
}
// Navigation accessible au clavier et au toucher, indépendante du contenu pédagogique.
const menuToggle=$('menuToggle'),siteMenu=$('siteMenu');
function closeSiteMenu(){siteMenu.hidden=true;menuToggle.setAttribute('aria-expanded','false');menuToggle.setAttribute('aria-label','Ouvrir le menu de navigation')}
menuToggle.addEventListener('click',event=>{event.stopPropagation();const opening=siteMenu.hidden;siteMenu.hidden=!opening;menuToggle.setAttribute('aria-expanded',String(opening));menuToggle.setAttribute('aria-label',opening?'Fermer le menu de navigation':'Ouvrir le menu de navigation')});
siteMenu.addEventListener('click',event=>event.stopPropagation());
document.addEventListener('click',event=>{if(!event.target.closest('.nav-wrap'))closeSiteMenu()});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!siteMenu.hidden){closeSiteMenu();menuToggle.focus()}});
$('openEncyclopedia').addEventListener('click',()=>{renderEncyclopedia();setVisible('encyclopedia');window.scrollTo(0,0)});
$('backEncyclopedia').addEventListener('click',()=>{setVisible('setup');renderDashboard();window.scrollTo(0,0)});
$('openAnalytics').addEventListener('click',()=>{renderAnalytics();setVisible('analytics');window.scrollTo(0,0)});
$('backAnalytics').addEventListener('click',()=>{setVisible('setup');renderDashboard();window.scrollTo(0,0)});

$('start').onclick=start;$('next').onclick=()=>{if(freeMode){if(freeDone.size>=sessionLimit)finish();else{selected=null;renderFree()}}else{index++;renderQuestion()}};$('finish').onclick=finish;$('home').onclick=()=>{setVisible('setup');$('regionFilter').disabled=false;renderDashboard()};$('again').onclick=()=>{setVisible('setup');$('regionFilter').disabled=false;renderDashboard()};$('switchLayout').onclick=()=>$('workspace').classList.toggle('immersive');$('resetMap').onclick=()=>{scale=1;tx=ty=0;applyTransform()};$('mapSearch').addEventListener('input',e=>{if(!freeMode)return;const q=norm(e.target.value);searchCode=q?departments.find(d=>norm(d.name).includes(q)||norm(d.code)===q)?.code:null;paint()});$('regionFilter').addEventListener('change',e=>{filterRegion=e.target.value;paint()});$('mode').addEventListener('change',e=>{$('exercise').disabled=e.target.value==='free'});function renderDashboard(){const history=JSON.parse(localStorage.getItem('dm_history')||'[]');const errors=JSON.parse(localStorage.getItem('dm_errors')||'[]');const total=history.reduce((a,s)=>a+s.points,0),max=history.reduce((a,s)=>a+s.max,0);$('dashboard').textContent=`⚔ ${history.length} session(s) · ${max?Math.round(100*total/max):0}% de réussite cumulée · ${errors.length} département(s) à réviser`;renderRpg();renderConquest();}syncGameMode();renderDashboard();loadMap();

// V0.7.0 — Encyclopédie : indépendante des quiz, XP et historiques.
const ENCY_FAV_KEY='atlas_gotrm_ency_favorites_v1';
let encySelected=null;
function encyFavorites(){try{const v=JSON.parse(localStorage.getItem(ENCY_FAV_KEY)||'[]');return new Set(Array.isArray(v)?v:[])}catch{return new Set()}}
function encySaveFavorites(favs){try{localStorage.setItem(ENCY_FAV_KEY,JSON.stringify([...favs]))}catch{}}
function encyEntries(){return PREF.map(([code,pref])=>({code,pref,name:departments.find(d=>d.code===code)?.name||'',region:regionByCode[code],history:HISTOIRE_DEPARTEMENTS[code]||''})).filter(d=>d.name)}
function renderEncyclopedia(){
 const select=$('encyRegion');if(select.options.length===1){for(const r of REGIONS){const o=document.createElement('option');o.value=r.name;o.textContent=r.name;select.append(o)}}
 if(!encySelected)encySelected='33';renderEncyclopediaList();renderEncyclopediaDetail();updateEncyclopediaMap();
}
function renderEncyclopediaList(){
 const q=norm($('encySearch').value.trim()),region=$('encyRegion').value,favs=encyFavorites();
 const items=encyEntries().filter(d=>(region==='all'||d.region===region)&&(!$('encyFavoritesOnly').checked||favs.has(d.code))&&(!q||[d.code,d.name,d.pref,d.region].some(s=>norm(s).includes(q))));
 $('encyCount').textContent=items.length+' département(s) affiché(s) sur 96';const grid=$('encyGrid');grid.replaceChildren();
 if(!items.length){const empty=document.createElement('p');empty.textContent='Aucun département ne correspond à ces filtres.';grid.append(empty);return}
 for(const d of items){const b=document.createElement('button');b.type='button';b.className='ency-card'+(encySelected===d.code?' selected':'');b.setAttribute('aria-pressed',String(encySelected===d.code));
 const code=document.createElement('strong');code.className='ency-code';code.textContent=d.code;
 const info=document.createElement('span');const name=document.createElement('strong');name.textContent=d.name;const pref=document.createElement('small');pref.textContent='Préfecture : '+d.pref;info.append(name,pref);b.append(code,info);
 if(favs.has(d.code)){const star=document.createElement('span');star.textContent='★';star.setAttribute('aria-label','Favori');b.append(star)}
 b.addEventListener('click',()=>{encySelected=d.code;renderEncyclopediaList();renderEncyclopediaDetail();updateEncyclopediaMap();if(window.matchMedia('(max-width: 850px)').matches)$('encyDetail').scrollIntoView({behavior:'smooth',block:'start'})});grid.append(b)}
}
function renderEncyclopediaDetail(){const root=$('encyDetail'),entries=encyEntries(),d=entries.find(x=>x.code===encySelected);root.replaceChildren();if(!d){root.textContent='Sélectionne un département.';return}
 const eyebrow=document.createElement('div');eyebrow.className='eyebrow';eyebrow.textContent='✦ Fiche territoriale ✦';
 const heading=document.createElement('div');heading.className='ency-detail-title';const num=document.createElement('span');num.className='ency-number';num.textContent=d.code;const title=document.createElement('div');const h=document.createElement('h2');h.textContent=d.name;const region=document.createElement('p');region.textContent=d.region;title.append(h,region);heading.append(num,title);
 const pref=document.createElement('p');pref.className='ency-pref';pref.textContent='⌖ Préfecture : '+d.pref;
 const h3=document.createElement('h3');h3.textContent='📜 Repère historique';const history=document.createElement('p');history.className='ency-history';history.textContent=d.history;
 const note=document.createElement('p');note.className='ency-note';note.textContent='Fiche d’introduction : les repères historiques sont volontairement succincts.';
 const actions=document.createElement('div');actions.className='ency-actions';const fav=document.createElement('button');fav.type='button';const favorites=encyFavorites();fav.textContent=favorites.has(d.code)?'★ Retirer des favoris':'☆ Ajouter aux favoris';fav.setAttribute('aria-pressed',String(favorites.has(d.code)));fav.addEventListener('click',()=>{const f=encyFavorites();f.has(d.code)?f.delete(d.code):f.add(d.code);encySaveFavorites(f);renderEncyclopediaList();renderEncyclopediaDetail()});
 const previous=document.createElement('button');previous.type='button';previous.textContent='← Précédent';const next=document.createElement('button');next.type='button';next.textContent='Suivant →';const index=entries.findIndex(x=>x.code===d.code);previous.disabled=index===0;next.disabled=index===entries.length-1;previous.addEventListener('click',()=>encyGo(entries[index-1].code));next.addEventListener('click',()=>encyGo(entries[index+1].code));actions.append(fav,previous,next);
 root.append(eyebrow,heading,pref,h3,history,note,actions);updateEncyclopediaMap();
}
function encyGo(code){encySelected=code;$('encySearch').value='';$('encyRegion').value='all';$('encyFavoritesOnly').checked=false;renderEncyclopediaList();renderEncyclopediaDetail();updateEncyclopediaMap()}
$('encySearch').addEventListener('input',()=>{renderEncyclopediaList();updateEncyclopediaMap()});
$('encyRegion').addEventListener('change',()=>{renderEncyclopediaList();updateEncyclopediaMap()});
$('encyFavoritesOnly').addEventListener('change',()=>{renderEncyclopediaList();updateEncyclopediaMap()});

// V0.7.1 — Carte encyclopédique indépendante de la carte des quiz.
let encyMapScale=1,encyMapX=0,encyMapY=0;
const encyMapSvg=$('encyMap'),encyMapLayer=$('encyMapLayer');
function encyMapTransform(){encyMapLayer.setAttribute('transform',`translate(${encyMapX} ${encyMapY}) scale(${encyMapScale})`)}
function encyMapZoom(factor,px=400,py=400){const s=Math.max(1,Math.min(9,encyMapScale*factor));const ratio=s/encyMapScale;encyMapX=px-(px-encyMapX)*ratio;encyMapY=py-(py-encyMapY)*ratio;encyMapScale=s;encyMapTransform()}
function encyMapPoint(e){const p=encyMapSvg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const matrix=encyMapSvg.getScreenCTM();return matrix?p.matrixTransform(matrix.inverse()):{x:400,y:400}}
function drawEncyclopediaMap(){encyMapLayer.replaceChildren();for(const d of departments){const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',geometryPath(d.geometry));path.dataset.code=d.code;path.setAttribute('tabindex','0');path.setAttribute('role','button');path.setAttribute('aria-label',`${d.name}, département ${d.code}, préfecture ${d.pref}`);path.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();encySelectFromMap(d.code)}});path.addEventListener('pointerenter',()=>{$('encyMapTip').textContent=`${d.code} · ${d.name} — ${d.pref}`});path.addEventListener('pointerleave',()=>{$('encyMapTip').textContent='Clique sur un département pour ouvrir sa fiche.'});encyMapLayer.append(path)}updateEncyclopediaMap()}
function encySelectFromMap(code){
 // La sélection sur la carte doit aussi rendre la fiche immédiatement visible.
 encySelected=code;
 renderEncyclopediaList();
 renderEncyclopediaDetail();
 updateEncyclopediaMap();
 const target=$('encyDetail');
 if(!target)return;
 requestAnimationFrame(()=>{
   // Le panneau est sticky sur ordinateur : viser le début de sa section.
   const isWide=window.matchMedia('(min-width: 1051px)').matches;
   const element=isWide?document.querySelector('.ency-layout'):target;
   const y=element.getBoundingClientRect().top+window.scrollY-90;
   window.scrollTo({top:Math.max(0,y),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
   target.setAttribute('tabindex','-1');
   try{target.focus({preventScroll:true})}catch(_){}
 });
}
function updateEncyclopediaMap(){if(!encyMapLayer)return;const q=norm($('encySearch').value),region=$('encyRegion').value,favs=encyFavorites(),onlyFav=$('encyFavoritesOnly').checked;for(const path of encyMapLayer.querySelectorAll('path')){const d=departments.find(x=>x.code===path.dataset.code);if(!d)continue;const matched=(region==='all'||regionByCode[d.code]===region)&&(!onlyFav||favs.has(d.code))&&(!q||[d.code,d.name,d.pref,regionByCode[d.code]].some(v=>norm(v).includes(q)));path.classList.toggle('ency-map-muted',!matched);path.classList.toggle('ency-map-selected',d.code===encySelected);path.setAttribute('aria-pressed',String(d.code===encySelected))}}
$('encyZoomIn').addEventListener('click',()=>encyMapZoom(1.4));$('encyZoomOut').addEventListener('click',()=>encyMapZoom(1/1.4));$('encyZoomReset').addEventListener('click',()=>{encyMapScale=1;encyMapX=encyMapY=0;encyMapTransform()});
encyMapSvg.addEventListener('wheel',e=>{e.preventDefault();const p=encyMapPoint(e);encyMapZoom(e.deltaY<0?1.2:1/1.2,p.x,p.y)},{passive:false});
const encyPointers=new Map();let encyGesture=null,encyDragged=false,encyDownScreen=null,encyGestureHadMultiTouch=false;
function encyDistance(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function encyStartGesture(){const pts=[...encyPointers.values()];encyGesture={points:pts,scale:encyMapScale,x:encyMapX,y:encyMapY,center:pts.length>1?{x:(pts[0].x+pts[1].x)/2,y:(pts[0].y+pts[1].y)/2}:pts[0],distance:pts.length>1?encyDistance(pts[0],pts[1]):0};}
encyMapSvg.addEventListener('pointerdown',e=>{
 if(e.pointerType==='mouse'&&e.button!==0)return;
 if(!encyPointers.size){
   encyDragged=false;
   encyGestureHadMultiTouch=false;
   encyDownScreen={x:e.clientX,y:e.clientY};
 }else{encyDragged=true;encyGestureHadMultiTouch=true;}
 encyPointers.set(e.pointerId,encyMapPoint(e));
 // Pas de capture de pointeur : elle pouvait empêcher le clic natif sur les tracés SVG.
 if(e.pointerType!=='mouse' && e.pointerType!=='touch')encyMapSvg.setPointerCapture(e.pointerId);
 encyStartGesture();
});
encyMapSvg.addEventListener('pointermove',e=>{
 if(!encyPointers.has(e.pointerId))return;
 const p=encyMapPoint(e);encyPointers.set(e.pointerId,p);
 if(!encyGesture)return;
 if(encyDownScreen&&Math.hypot(e.clientX-encyDownScreen.x,e.clientY-encyDownScreen.y)>9)encyDragged=true;
 const pts=[...encyPointers.values()];
 const c=pts.length>1?{x:(pts[0].x+pts[1].x)/2,y:(pts[0].y+pts[1].y)/2}:pts[0];
 if(pts.length>1)encyDragged=true;
 if(!encyDragged&&pts.length===1)return; // évite un déplacement parasite lors d'un clic
 if(pts.length>1&&encyGesture.distance){
   encyMapScale=Math.max(1,Math.min(9,encyGesture.scale*encyDistance(pts[0],pts[1])/encyGesture.distance));
   const ratio=encyMapScale/encyGesture.scale;
   encyMapX=c.x-(encyGesture.center.x-encyGesture.x)*ratio;
   encyMapY=c.y-(encyGesture.center.y-encyGesture.y)*ratio;
 }else{
   encyMapX=encyGesture.x+c.x-encyGesture.center.x;
   encyMapY=encyGesture.y+c.y-encyGesture.center.y;
 }
 encyMapTransform();
});
function encyEndPointer(e){
 const tracked=encyPointers.has(e.pointerId);
 const moved=encyDownScreen&&Math.hypot(e.clientX-encyDownScreen.x,e.clientY-encyDownScreen.y)>9;
 if(moved)encyDragged=true;
 // Correctif validé dans Brave : interroger le véritable élément sous le pointeur
 // lors du relâchement, plutôt que e.target (souvent le SVG parent).
 const isTap=tracked&&e.type==='pointerup'&&encyPointers.size===1&&!encyDragged&&!encyGestureHadMultiTouch;
 const hit=isTap?document.elementFromPoint(e.clientX,e.clientY):null;
 const path=hit?.closest?.('#encyMap path[data-code]');
 const code=path?.dataset.code;
 encyPointers.delete(e.pointerId);
 if(encyPointers.size)encyStartGesture();else{
   encyGesture=null;encyDownScreen=null;encyDragged=false;encyGestureHadMultiTouch=false;
 }
 // La sélection est gérée séparément par le listener pointerup en capture.
}
// V0.7.8 : code identique au test réussi dans la console Brave.
document.querySelector('#encyMap').addEventListener('pointerup', e => {
  const element = document.elementFromPoint(e.clientX, e.clientY);
  const departement = element?.closest('path[data-code]');
  if (departement) {
    console.log('Sélection :', departement.dataset.code);
    encySelectFromMap(departement.dataset.code);
  }
}, true);
encyMapSvg.addEventListener('pointerup',encyEndPointer);
encyMapSvg.addEventListener('pointercancel',encyEndPointer);


// V0.7.11 — bouton flottant de retour en haut. Aucun changement aux cartes et quiz.
(() => {
  const button = document.getElementById('backToTop');
  if (!button) return;
  const updateVisibility = () => {
    button.classList.toggle('is-visible', window.scrollY > 360);
  };
  window.addEventListener('scroll', updateVisibility, { passive: true });
  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
  updateVisibility();
})();
