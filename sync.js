/* Atlas GOTRM v1.0 — optional cloud sync; guest mode always works offline. */
(()=>{'use strict';
const KEYS=['dm_rpg_v04','dm_history','dm_errors','ency_favorites_v1','atlas_profile_guest_v1'];
const cfg=window.ATLAS_SUPABASE||{};
const configured=/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(cfg.url)&&typeof cfg.anonKey==='string'&&cfg.anonKey.length>30;
let client=null,user=null,revision=null,remote=null,busy=false;
const $=id=>document.getElementById(id);
const snap=()=>Object.fromEntries(KEYS.map(k=>[k,localStorage.getItem(k)]).filter(([,v])=>v!==null));
const fingerprint=x=>JSON.stringify(x);
let baseline=fingerprint(snap());
function status(s){const el=$('cloudStatus');if(el)el.textContent=s;}
function render(){const account=$('cloudAccount');if(!account)return;account.hidden=!!user; $('cloudSigned').hidden=!user; $('cloudEmail').textContent=user?.email||''; $('cloudActions').hidden=!user;}
function apply(data){if(!data||typeof data!=='object'||Array.isArray(data))throw Error('Sauvegarde distante invalide');for(const k of KEYS){if(Object.prototype.hasOwnProperty.call(data,k)){if(typeof data[k]!=='string')throw Error('Donnée invalide : '+k);JSON.parse(data[k]);}}
for(const k of KEYS){if(Object.prototype.hasOwnProperty.call(data,k))localStorage.setItem(k,data[k]);else localStorage.removeItem(k)}baseline=fingerprint(snap());location.reload();}
async function fetchRemote(){const {data,error}=await client.from('player_progress').select('payload,updated_at').eq('user_id',user.id).maybeSingle();if(error)throw error;remote=data;revision=data?.updated_at??null;return data;}
async function upload(){
const payload=snap();
if(revision===null){
 const {data,error}=await client.from('player_progress').insert({user_id:user.id,payload}).select('updated_at').single();
 if(error)throw error;revision=data.updated_at;
}else{
 const {data,error}=await client.from('player_progress').update({payload,updated_at:new Date().toISOString()}).eq('user_id',user.id).eq('updated_at',revision).select('updated_at').maybeSingle();
 if(error)throw error;
 if(!data)throw Error('Conflit de synchronisation : la sauvegarde cloud a changé. Compare les sauvegardes avant de recommencer.');
 revision=data.updated_at;
}
remote={payload,updated_at:revision};baseline=fingerprint(payload);status('Progression enregistrée dans le cloud.');
}
async function reconcile(){const existing=await fetchRemote();const local=snap();if(!existing){status('Aucune sauvegarde distante. Tu peux envoyer ta progression invitée.');return;}
if(fingerprint(existing.payload)===fingerprint(local)){baseline=fingerprint(local);status('Progression locale et cloud identiques.');return;}
status('Deux progressions différentes détectées. Choisis celle à conserver : aucune fusion automatique.');}
async function run(fn){if(busy)return;busy=true;try{await fn()}catch(e){status('Erreur : '+(e.message||e));}finally{busy=false}}
function mount(){const p=$('profilePanel');if(!p)return;const wrap=document.createElement('section');wrap.className='cloud-panel';wrap.innerHTML=`<h3>☁ Compte et synchronisation</h3><p id="cloudStatus" role="status"></p><form id="cloudAccount"><label>Email <input id="cloudMail" type="email" required autocomplete="email"></label><label>Mot de passe <input id="cloudPassword" type="password" required minlength="8" autocomplete="current-password"></label><div class="cloud-buttons"><button type="submit" data-auth="login">Se connecter</button><button type="button" id="cloudSignup">Créer un compte</button></div></form><p id="cloudSigned" hidden>Connecté : <strong id="cloudEmail"></strong></p><div id="cloudActions" class="cloud-buttons" hidden><button type="button" id="cloudUpload">Envoyer ma progression locale</button><button type="button" id="cloudDownload">Récupérer ma progression cloud</button><button type="button" id="cloudRefresh">Comparer les sauvegardes</button><button type="button" id="cloudLogout">Se déconnecter</button></div>`;
p.insertAdjacentElement('afterend',wrap);render();
if(!configured){status('Mode invité actif. Configure Supabase pour activer les comptes.');wrap.querySelectorAll('input,button').forEach(x=>x.disabled=true);return;}
status('Connexion au service de comptes…');
(async()=>{try{const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');client=createClient(cfg.url,cfg.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});const {data:{session},error:sessionError}=await client.auth.getSession();if(sessionError)throw sessionError;user=session?.user||null;render();if(user)await reconcile();else status('Mode invité actif : crée un compte ou connecte-toi pour synchroniser ta progression.');client.auth.onAuthStateChange((_event,session)=>{user=session?.user||null;render();if(user){setTimeout(()=>run(reconcile),0)}else status('Mode invité actif.');});}catch(e){status('Impossible de charger la connexion : '+e.message)}})();
$('cloudAccount').onsubmit=e=>{e.preventDefault();run(async()=>{const {error}=await client.auth.signInWithPassword({email:$('cloudMail').value.trim(),password:$('cloudPassword').value});if(error)throw error;$('cloudPassword').value='';status('Connecté. Vérifie les sauvegardes avant toute synchronisation.');});};
$('cloudSignup').onclick=()=>run(async()=>{const email=$('cloudMail').value.trim(),password=$('cloudPassword').value;if(!email||password.length<8){status('Renseigne un email et un mot de passe de 8 caractères minimum.');return}const {data,error}=await client.auth.signUp({email,password});if(error)throw error;$('cloudPassword').value='';status(data.session?'Compte créé. Choisis comment transférer ta progression.':'Vérifie ton email pour confirmer ton compte, puis connecte-toi.');});
$('cloudUpload').onclick=()=>run(async()=>{await fetchRemote();if(remote&&!confirm('Une sauvegarde cloud existe. Remplacer sa progression par celle de cet appareil ? Cette action est irréversible.'))return;if(!remote&&!confirm('Envoyer la progression de cet appareil dans ton nouveau compte ?'))return;await upload();});
$('cloudDownload').onclick=()=>run(async()=>{await fetchRemote();if(!remote){status('Aucune sauvegarde cloud à récupérer.');return}if(!confirm('Remplacer la progression locale par la sauvegarde cloud ? Exporte d’abord ta progression invitée pour la conserver.'))return;apply(remote.payload);});
$('cloudRefresh').onclick=()=>run(reconcile);
$('cloudLogout').onclick=()=>run(async()=>{const {error}=await client.auth.signOut();if(error)throw error;user=null;remote=null;revision=null;render();status('Déconnecté. Progression locale conservée.');});
}
// The game redraws profilePanel, but the cloud panel is a sibling, so it remains mounted.
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
