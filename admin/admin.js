/* Tagalong 後台 — plain JS against backend/docs/ADMIN_API.md. ?demo=1 swaps fetch for local sample data (demo.js). */
(()=>{
const API='https://tagalong-api-staging.tmac19920626.workers.dev',APP='https://ademczw.github.io/tagalong/',TK='tg-auth',LIMIT=30;
const DEMO=new URLSearchParams(location.search).get('demo')==='1';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
class Raw{constructor(s){this.s=s;}}
const raw=s=>new Raw(s);
const esc=v=>String(v).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const val=v=>v instanceof Raw?v.s:Array.isArray(v)?v.map(val).join(''):v==null||v===false?'':esc(v);
const h=(s,...v)=>new Raw(s.reduce((a,p,i)=>a+val(v[i-1])+p));
const put=(el,x)=>{el.innerHTML=val(x);return el;};
const add=(el,x)=>el.insertAdjacentHTML('beforeend',val(x));
const enc=encodeURIComponent;
const token=()=>{if(DEMO)return 'demo';try{return localStorage.getItem(TK);}catch(e){return null;}};
const qs=o=>{const p=Object.entries(o).filter(([,v])=>v!==''&&v!=null);return p.length?'?'+p.map(([k,v])=>k+'='+enc(v)).join('&'):'';};

const L={
  ustatus:{active:'正常',suspended:'停權',deleted:'已刪除'},
  estatus:{open:'開放中',cancelled:'已取消',completed:'已結束'},
  mode:{group:'揪團',date:'約會'},
  cat:{outdoor:'戶外',board:'桌遊',sport:'運動',food:'美食',art:'藝文',book:'讀書',music:'音樂'},
  rstatus:{open:'待處理',reviewing:'處理中',resolved:'已處理',dismissed:'不成立'},
  reason:{harassment:'騷擾或令人不舒服',scam:'詐騙或推銷',inappropriate:'不當內容',danger:'危險行為',impersonation:'冒用身分',other:'其他'},
  ttype:{user:'用戶',event:'活動',comment:'留言',message:'訊息',photo:'照片',report:'檢舉'},
  safety:{asked:'已詢問，未回覆',snoozed:'延後回覆',escalated:'多次未回覆',contact_notified:'已通知緊急聯絡人',help:'求救',safe:'已報平安'},
  pstatus:{joined:'已加入',pending:'待同意',waitlisted:'候補',offered:'遞補待確認',rejected:'未通過',left:'已退出',removed:'被移除'},
  change:{cancel:'取消',postpone:'延期',proceed:'照常舉行',edit:'修改',auto_cancel:'未成團自動取消'},
  action:{suspend:'停權',restore:'恢復帳號',takedown:'下架活動',view_contact:'查看緊急聯絡人'},
  gender:{f:'女',m:'男',x:'其他'},
  risk:{low:'低',mid:'中',high:'高'}
};
const lb=(m,k)=>k==null||k===''?'—':L[m][k]||k;
const BAD=['suspended','deleted','cancelled','cancel','auto_cancel'];
const pill=(t,tone)=>h`<span class="pill ${tone||''}">${t}</span>`;
const st=(m,k)=>pill(lb(m,k),BAD.includes(k)?'bad':m==='safety'&&k!=='safe'||m==='rstatus'&&k==='open'?'warn':'');
const actLabel=a=>L.action[a]||(/^report/.test(a||'')?'檢舉處理'+(L.rstatus[a.split(/[_:]/)[1]]?'：'+L.rstatus[a.split(/[_:]/)[1]]:''):a||'—');

const TF=new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
const fmt=ms=>{if(!ms)return '—';const p={};TF.formatToParts(new Date(+ms)).forEach(x=>p[x.type]=x.value);return `${p.year}/${p.month}/${p.day} ${p.hour}:${p.minute}`;};
const dur=ms=>{const m=Math.max(1,Math.round(ms/6e4)),d=Math.floor(m/1440),hh=Math.floor(m%1440/60),mm=m%60;return d?`${d} 天 ${hh} 小時`:hh?`${hh} 小時 ${mm} 分`:`${mm} 分鐘`;};

const ulink=(u,id)=>{id=id||u&&u.id;return id?h`<a href="#users/${enc(id)}">${u&&u.display_name||id}</a>`:'—';};
const elink=(title,id)=>id?h`<a href="#events/${enc(id)}">${title||id}</a>`:title||'—';
const tlink=(type,id)=>type==='user'?ulink(null,id):type==='event'?elink(null,id):h`${lb('ttype',type)} ${id||''}`;
const err=e=>h`<p class="err" role="alert">${e&&e.message||'發生錯誤，請再試一次'}</p>`;
const lock=(els,on)=>els.forEach(b=>b&&(b.disabled=on));

class ApiError extends Error{constructor(status,code,message){super(message);this.status=status;this.code=code;}}
async function api(path,body){
  let r;
  try{r=await fetch(API+path,{method:body?'POST':'GET',headers:Object.assign({Authorization:'Bearer '+token()},body?{'Content-Type':'application/json'}:{}),body:body?JSON.stringify(body):undefined});}
  catch(e){throw new ApiError(0,'offline','連線失敗，請檢查網路後再試');}
  let d=null;try{d=await r.json();}catch(e){}
  if(r.ok)return d||{};
  const er=d&&d.error||{},e=new ApiError(r.status,er.code||'http_'+r.status,er.message||`伺服器錯誤（${r.status}）`);
  if(r.status===401)gate('signin');else if(r.status===403&&e.code==='not_admin')gate('noaccess');
  throw e;
}

function gate(kind,msg){
  const g=$('#gate');$('#app').hidden=true;g.hidden=false;document.title='Tagalong 後台';
  const box=(t,body,link)=>h`<div class="gbox"><p class="logo">TAGALONG<small>後台</small></p><h1>${t}</h1>${body}${link}</div>`;
  const app=h`<p><a class="btn pri" href="${APP}">前往 Tagalong App</a></p>`;
  if(kind==='signin')return put(g,box('請先在 App 登入',h`<p>後台沿用 App 的登入。請先到 Tagalong App 用 LINE 登入，再回到這一頁重新整理。</p>`,app));
  if(kind==='noaccess'){
    put(g,box('這個帳號沒有後台權限',h`<p class="nm" hidden></p><p>需要權限請聯絡管理者，或在 App 換一個帳號登入。</p>`,app));
    fetch(API+'/me',{headers:{Authorization:'Bearer '+token()}}).then(r=>r.ok?r.json():null).then(d=>{const u=d&&(d.user||d),n=$('.nm',g);if(u&&u.display_name&&n){put(n,h`目前登入：<b>${u.display_name}</b>`);n.hidden=false;}}).catch(()=>{});
    return;
  }
  put(g,box('無法載入後台',err({message:msg}),h`<p><button type="button" class="btn" onclick="location.reload()">重新整理</button></p>`));
}

const tbl=(cols,rows)=>h`<div class="tw"><table class="tbl"><thead><tr>${cols.map(c=>h`<th scope="col" class="${c[2]||''}">${c[0]}</th>`)}</tr></thead><tbody>${rows.map(r=>trow(cols,r))}</tbody></table></div>`;
const trow=(cols,r)=>h`<tr>${cols.map(c=>h`<td data-l="${c[0]}" class="${c[2]||''}"><div>${c[1](r)}</div></td>`)}</tr>`;
const mini=(cols,rows,empty)=>rows&&rows.length?tbl(cols,rows):h`<p class="msg">${empty}</p>`;

function pager(box,{path,params,cols,card,empty}){
  put(box,h`<div class="pb"></div><div class="msg" aria-live="polite"></div><button type="button" class="btn more" hidden>載入更多</button>`);
  const body=$('.pb',box),msg=$('.msg',box),more=$('.more',box);let seq=0,next=null;
  async function load(reset){
    const my=++seq;more.disabled=true;box.setAttribute('aria-busy','true');if(reset)put(msg,'載入中…');
    try{
      const d=await api(path+qs(Object.assign({},params(),{cursor:reset?'':next,limit:LIMIT})));
      if(my!==seq)return;
      const items=d.items||[];next=d.next_cursor||null;
      if(reset)put(body,items.length&&cols?tbl(cols,[]):'');
      add(cols?$('tbody',body)||body:body,items.map(r=>cols?trow(cols,r):card(r)));
      put(msg,reset&&!items.length?empty:'');more.hidden=!next;
    }catch(e){if(my===seq){if(reset){put(body,'');more.hidden=true;}put(msg,err(e));}}
    finally{if(my===seq){more.disabled=false;box.removeAttribute('aria-busy');}}
  }
  more.onclick=()=>load(false);load(true);return {load,body};
}

const mem={};
function filtered(v,title,path,fields,opt){
  const m=mem[path]||{};
  put(v,h`<h1>${title}</h1><form class="bar" role="search">${fields.map(([k,l,o])=>Array.isArray(o)
    ?h`<label for="f-${k}">${l}<select id="f-${k}" name="${k}">${o.map(([ov,ol])=>h`<option value="${ov}" ${ov===(m[k]||'')?raw('selected'):''}>${ol}</option>`)}</select></label>`
    :h`<label for="f-${k}" class="grow">${l}<input id="f-${k}" type="search" name="${k}" placeholder="${o}" value="${m[k]||''}" autocomplete="off"></label>`)}</form><div class="lst"></div>`);
  const f=$('form',v),params=()=>(mem[path]=Object.fromEntries(new FormData(f)));let t;
  const p=pager($('.lst',v),Object.assign({path,params},opt));
  f.addEventListener('input',e=>{if(e.target.type!=='search')return;clearTimeout(t);t=setTimeout(()=>p.load(true),300);});
  f.addEventListener('change',e=>{if(e.target.tagName==='SELECT')p.load(true);});
  f.addEventListener('submit',e=>{e.preventDefault();clearTimeout(t);p.load(true);});
  return p;
}

let uid=0;
function danger(box,{title,hint,verb,ask,path,tone,done}){
  const id='rs'+(++uid);tone=tone==null?'bad':tone;
  put(box,h`<section class="danger ${tone}" aria-labelledby="${id}h"><h2 id="${id}h">${title}</h2><p class="hint">${hint}</p>
    <label for="${id}">原因（必填，會寫進操作紀錄）</label><textarea id="${id}" rows="2" maxlength="500"></textarea>
    <div class="acts"><button type="button" class="btn ${tone}" data-step>${verb}…</button></div>
    <div class="confirm" hidden><p class="q"></p><div class="acts"><button type="button" class="btn ${tone}" data-go>確定${verb}</button><button type="button" class="btn" data-no>取消</button></div></div>
    <div class="err" role="alert"></div></section>`);
  const ta=$('textarea',box),step=$('[data-step]',box),cf=$('.confirm',box),go=$('[data-go]',box),no=$('[data-no]',box),er=$('.err',box);
  step.onclick=()=>{const r=ta.value.trim();if(!r){put(er,'請先填寫原因');ta.focus();return;}put(er,'');put($('.q',cf),h`${ask}<br>原因：「${r}」`);cf.hidden=false;step.hidden=true;ta.readOnly=true;go.focus();};
  no.onclick=()=>{cf.hidden=true;step.hidden=false;ta.readOnly=false;ta.focus();};
  go.onclick=async()=>{lock([go,no],true);go.textContent='處理中…';put(er,'');
    try{done(await api(path,{reason:ta.value.trim()}));}
    catch(e){put(er,e.message);lock([go,no],false);go.textContent='確定'+verb;}};
}

const badges=s=>{const set=(k,n)=>{const b=$(`[data-b="${k}"]`);if(!b)return;b.textContent=n;b.hidden=!(n>0);b.setAttribute('aria-label',n+' 件待處理');};
  if(s.reports)set('reports',s.reports.open);if(s.safety)set('safety',s.safety.alerts);};
const bump=(k,d)=>{const b=$(`[data-b="${k}"]`);if(b&&b.textContent!=='')badges({[k]:k==='reports'?{open:Math.max(0,+b.textContent+d)}:{alerts:Math.max(0,+b.textContent+d)}});};

const UCOLS=[
  ['用戶',u=>h`<a href="#users/${enc(u.id)}">${u.display_name||'（未命名）'}</a><span class="sub">${u.handle?'@'+u.handle+' · ':''}${u.id}</span>`],
  ['狀態',u=>st('ustatus',u.status)],
  ['實名',u=>u.verified?'已實名':'—'],
  ['性別／年齡',u=>[lb('gender',u.gender),u.age!=null?u.age+' 歲':''].filter(x=>x&&x!=='—').join(' ')||'—'],
  ['登入',u=>u.via_line?'LINE':'Email'],
  ['開團',u=>u.hosted??0,'n'],['參加',u=>u.joined??0,'n'],
  ['被檢舉',u=>u.reports_against>0?pill(u.reports_against,'warn'):'0','n'],
  ['加入時間',u=>fmt(u.created_at)]
];
const ECOLS=[
  ['活動',e=>h`<a href="#events/${enc(e.id)}">${e.title||e.id}</a><span class="sub">${e.id}</span>`],
  ['狀態',e=>st('estatus',e.status)],
  ['類型',e=>h`${lb('mode',e.mode)}・${lb('cat',e.category)}`],
  ['開始',e=>fmt(e.starts_at)],
  ['地點',e=>e.place_name||'—'],
  ['團主',e=>ulink(e.host)],
  ['人數',e=>`${e.seats_taken??0}/${e.capacity??'—'}`,'n'],
  ['檢舉',e=>e.reports>0?pill(e.reports,'warn'):'0','n']
];
const EMINI=[['活動',e=>elink(e.title,e.id||e.event_id)],['狀態',e=>st('estatus',e.status)],['開始',e=>fmt(e.starts_at)]];
const RMINI=[['時間',r=>fmt(r.created_at)],['原因',r=>lb('reason',r.reason)],['檢舉人',r=>ulink(r.reporter,r.reporter_id)],['狀態',r=>st('rstatus',r.status)],['說明',r=>h`<span class="pre">${r.detail||'—'}</span>`]];
const ACOLS=[
  ['時間',a=>fmt(a.created_at)],
  ['管理員',a=>a.admin_name||a.admin&&a.admin.display_name||a.admin_id||'—'],
  ['動作',a=>actLabel(a.action)],
  ['對象',a=>tlink(a.target_type,a.target_id)],
  ['原因',a=>h`<span class="pre">${a.reason||'—'}</span>`]
];

async function overview(v){
  put(v,h`<h1>總覽</h1><div class="ov"><p class="msg">載入中…</p></div>`);const box=$('.ov',v);
  let s;try{s=await api('/admin/stats');}catch(e){return put(box,err(e));}
  badges(s);
  const U=s.users||{},E=s.events||{},J=s.joins||{},R=s.reports||{},S=s.safety||{};
  const t=(n,l,href)=>href?h`<a class="tile ${n>0?'warn':''}" href="${href}"><b>${n??0}</b><span>${l}</span></a>`:h`<div class="tile"><b>${n??'—'}</b><span>${l}</span></div>`;
  const g=(title,tiles)=>h`<section><h2>${title}</h2><div class="tiles">${tiles}</div></section>`;
  put(box,[
    g('待處理',[t(R.open,'未處理檢舉','#reports'),t(S.alerts,'報平安警示','#safety')]),
    g('用戶',[t(U.total,'總數'),t(U.active,'正常'),t(U.suspended,'停權'),t(U.new_7d,'近 7 天新增')]),
    g('活動',[t(E.open,'開放中'),t(E.upcoming_7d,'7 天內開始'),t(E.completed,'已結束'),t(E.cancelled,'已取消'),t(E.date_mode,'約會模式')]),
    g('報名',[t(J.total,'總數'),t(J.last_7d,'近 7 天')])
  ]);
}

const users=v=>filtered(v,'用戶','/admin/users',[['q','搜尋','名稱、@handle 或 ID'],['status','狀態',[['','全部'],['active','正常'],['suspended','停權'],['deleted','已刪除']]]],{cols:UCOLS,empty:'沒有符合的用戶'});
const events=v=>filtered(v,'活動','/admin/events',[['q','搜尋','標題或 ID'],['status','狀態',[['','全部'],['open','開放中'],['completed','已結束'],['cancelled','已取消']]],['mode','模式',[['','全部'],['group','揪團'],['date','約會']]]],{cols:ECOLS,empty:'沒有符合的活動'});
const actions=v=>{put(v,h`<h1>操作紀錄</h1><div class="lst"></div>`);pager($('.lst',v),{path:'/admin/actions',params:()=>({}),cols:ACOLS,empty:'還沒有任何操作'});};

async function detail(v,back,path){
  put(v,h`<p class="back"><a href="${back[0]}">← ${back[1]}</a></p><div class="pg"><p class="msg">載入中…</p></div>`);
  const box=$('.pg',v);try{return [box,await api(path)];}catch(e){put(box,err(e));return [box,null];}
}
const okLine=ok=>ok?h`<p class="ok" role="status">${ok}</p>`:'';

async function user(v,id,ok){
  const [box,d]=await detail(v,['#users','用戶列表'],'/admin/users/'+enc(id));if(!d)return;
  const u=d.user||{},nm=u.display_name||u.id;document.title=nm+' · Tagalong 後台';
  const facts=[u.handle&&'@'+u.handle,u.id,u.verified?'已實名':'未實名',[L.gender[u.gender],u.age!=null&&u.age+' 歲'].filter(Boolean).join(' '),u.via_line!=null&&(u.via_line?'LINE 登入':'Email 登入'),u.created_at&&'加入 '+fmt(u.created_at)].filter(Boolean);
  put(box,h`${okLine(ok)}<h1>${u.display_name||'（未命名）'} ${st('ustatus',u.status)}</h1>
    <p class="facts">${facts.map(f=>h`<span>${f}</span>`)}</p><div class="act"></div>
    <h2>開的團（最近 20 場）</h2>${mini(EMINI,d.hosted,'沒有開過團')}
    <h2>參加的團（最近 20 場）</h2>${mini(EMINI,d.joined,'沒有參加紀錄')}
    <h2>被檢舉</h2>${mini(RMINI,d.reports_against,'沒有被檢舉')}
    <h2>管理紀錄</h2>${mini(ACOLS.filter(c=>c[0]!=='對象'),d.actions,'沒有管理紀錄')}`);
  const act=$('.act',box),path=`/admin/users/${enc(u.id||id)}/`;
  if(u.status==='active')danger(act,{title:'停權',hint:'停權後這個人會被登出所有裝置，也不能再登入。',verb:'停權',ask:`確定要停權「${nm}」嗎？`,path:path+'suspend',done:()=>user(v,id,`已停權「${nm}」`)});
  else if(u.status==='suspended')danger(act,{title:'恢復帳號',hint:'恢復後這個人可以重新登入。',verb:'恢復',tone:'',ask:`確定要恢復「${nm}」的帳號嗎？`,path:path+'restore',done:()=>user(v,id,`已恢復「${nm}」`)});
  else if(u.status==='deleted')put(act,h`<p class="msg">已刪除的帳號不能恢復。</p>`);
}

async function event(v,id,ok){
  const [box,d]=await detail(v,['#events','活動列表'],'/admin/events/'+enc(id));if(!d)return;
  const e=d.event||d,host=e.host||(e.host_id?{id:e.host_id,display_name:e.host_name}:null);document.title=(e.title||id)+' · Tagalong 後台';
  const kv=[['活動 ID',e.id],['團主',host?ulink(host):null],['類型',h`${lb('mode',e.mode)}・${lb('cat',e.category)}`],['開始',fmt(e.starts_at)],['結束',e.ends_at&&fmt(e.ends_at)],
    ['地點',e.place_name],['地址',e.address],['人數',e.capacity!=null&&`${e.seats_taken??'—'}/${e.capacity}${e.min_people?`（最少 ${e.min_people}）`:''}`],
    ['風險',e.risk&&lb('risk',e.risk)],['取消原因',e.cancel_reason],['說明',e.description&&h`<span class="pre">${e.description}</span>`],['建立',e.created_at&&fmt(e.created_at)]].filter(x=>x[1]);
  const PCOLS=[['名字',p=>ulink(p,p.user_id)],['狀態',p=>lb('pstatus',p.status)],['攜伴',p=>p.plus_count?'+'+p.plus_count:'—','n']];
  const CCOLS=[['時間',c=>fmt(c.created_at)],['類型',c=>st('change',c.kind)],['原因',c=>h`<span class="pre">${c.reason||'—'}</span>`],
    ['時間異動',c=>c.old_starts_at||c.new_starts_at?`${fmt(c.old_starts_at)} → ${fmt(c.new_starts_at)}`:'—'],['操作者',c=>c.actor?ulink(c.actor):c.actor_name||(c.actor_id?ulink(null,c.actor_id):'系統')]];
  put(box,h`${okLine(ok)}<h1>${e.title||id} ${st('estatus',e.status)}</h1>
    <dl class="kv">${kv.map(([k,x])=>h`<dt>${k}</dt><dd>${x}</dd>`)}</dl><div class="act"></div>
    <h2>參加者（${(d.participants||[]).length}）</h2>${mini(PCOLS,d.participants,'沒有參加者')}
    <h2>異動紀錄</h2>${mini(CCOLS,d.changes,'沒有異動')}
    <h2>檢舉</h2>${mini(RMINI,d.reports,'沒有檢舉')}`);
  const act=$('.act',box),t=e.title||id;
  if(e.status==='open')danger(act,{title:'下架活動',hint:'活動會改成已取消；已加入、待同意、候補和遞補中的人都會收到「已被下架」通知，聊天室也會出現系統訊息。無法復原。',verb:'下架',ask:`確定要下架「${t}」嗎？`,path:`/admin/events/${enc(e.id||id)}/takedown`,done:()=>event(v,id,`已下架「${t}」`)});
  else put(act,h`<p class="msg">只有開放中的活動可以下架。</p>`);
}

const target=t=>{const label=t.label||t.id||'—',ev=t.type==='event'?t.event_id||t.id:t.event_id;
  const main=t.type==='user'?ulink({display_name:label},t.user_id||t.id):ev?elink(label,ev):h`<span>${label}</span>`;
  return h`<span class="tt">${lb('ttype',t.type)}</span> ${main}${t.type!=='user'&&t.user_id?h` <span class="sub-i">·</span> <a href="#users/${enc(t.user_id)}">${t.type==='event'?'團主':'作者'}</a>`:''}`;};
const rcard=r=>h`<article class="card" data-id="${r.id}" data-s="${r.status}" data-t="${lb('reason',r.reason)}：${(r.target||{}).label||''}">
  <div class="rh">${pill(lb('reason',r.reason))} ${st('rstatus',r.status)} <span class="sub-i">${fmt(r.created_at)}</span></div>
  <dl class="kv"><dt>檢舉人</dt><dd>${ulink(r.reporter)}</dd><dt>對象</dt><dd>${target(r.target||{})}</dd>${r.detail?h`<dt>說明</dt><dd class="pre">${r.detail}</dd>`:''}</dl>
  <div class="ra"><label class="note">備註（選填）<input type="text" maxlength="500"></label><div class="acts">${[['reviewing','標記處理中'],['resolved','已處理'],['dismissed','不成立']].filter(([s])=>s!==r.status).map(([s,l])=>h`<button type="button" class="btn" data-rs="${s}">${l}</button>`)}</div></div>
  <div class="err" role="alert"></div></article>`;

function reports(v,status){
  status=L.rstatus[status]?status:'open';
  put(v,h`<h1>檢舉</h1><nav class="tabs" aria-label="檢舉狀態">${Object.keys(L.rstatus).map(k=>h`<a href="#reports/${k}" ${k===status?raw('aria-current="page"'):''}>${L.rstatus[k]}</a>`)}</nav><div class="lst"></div>`);
  const box=$('.lst',v);pager(box,{path:'/admin/reports',params:()=>({status}),card:rcard,empty:`沒有${L.rstatus[status]}的檢舉`});
  box.addEventListener('click',async ev=>{
    const b=ev.target.closest('[data-rs]');if(!b)return;
    const c=b.closest('.card'),bs=$$('button,input',c),s=b.dataset.rs,note=$('input',c).value.trim();
    lock(bs,true);put($('.err',c),'');
    try{await api('/admin/reports/'+enc(c.dataset.id),note?{status:s,note}:{status:s});
      if(c.dataset.s==='open')bump('reports',-1);
      c.classList.add('done');put(c,h`<p class="ok" role="status">已改為「${L.rstatus[s]}」<span class="sub">${c.dataset.t}</span></p>`);
    }catch(e){put($('.err',c),e.message);lock(bs,false);}
  });
}

const scard=a=>{const now=Date.now(),over=a.next_due_at&&a.next_due_at<now;
  return h`<article class="card" data-ev="${a.event_id}" data-u="${a.user&&a.user.id||''}">
  <div class="rh">${st('safety',a.status)} ${over?h`<span class="over">已逾時 ${dur(now-a.next_due_at)}</span>`:h`<span class="sub-i">下次確認 ${fmt(a.next_due_at)}</span>`}</div>
  <dl class="kv"><dt>活動</dt><dd>${elink(a.event_title,a.event_id)}</dd><dt>當事人</dt><dd>${ulink(a.user)}</dd><dt>團主</dt><dd>${ulink(a.host)}</dd>
  <dt>未回覆</dt><dd>${a.misses??0} 次</dd><dt>最後更新</dt><dd>${fmt(a.updated_at)}</dd></dl>
  <div class="ct">${ctBtn}</div></article>`;};
const ctBtn=h`<button type="button" class="btn" data-ct>查看緊急聯絡人</button>`;

function safety(v){
  put(v,h`<h1>報平安</h1><p class="lead">需要處理的報平安：求救、多次未回覆、已通知聯絡人，或過了回覆時間還沒回的。</p><div class="lst"></div>`);
  const box=$('.lst',v);pager(box,{path:'/admin/safety',params:()=>({}),card:scard,empty:'目前沒有需要處理的報平安'});
  box.addEventListener('click',async ev=>{
    const b=ev.target.closest('[data-ct],[data-ctgo],[data-ctno]');if(!b)return;
    const c=b.closest('.card'),ct=$('.ct',c);
    if('ct' in b.dataset){put(ct,h`<div class="confirm"><p>查看會被記錄：你的帳號、時間和這位用戶都會寫進敏感資料存取紀錄與操作紀錄。只在需要聯絡家屬或確認安全時查看。</p>
      <div class="acts"><button type="button" class="btn pri" data-ctgo>確定查看</button><button type="button" class="btn" data-ctno>取消</button></div><div class="err" role="alert"></div></div>`);$('[data-ctgo]',ct).focus();return;}
    if('ctno' in b.dataset){put(ct,ctBtn);$('[data-ct]',ct).focus();return;}
    const bs=$$('button',ct);lock(bs,true);b.textContent='讀取中…';
    try{const d=await api(`/admin/safety/${enc(c.dataset.ev)}/${enc(c.dataset.u)}/contact`),x=d&&('contact' in d?d.contact:d);
      put(ct,x&&(x.name||x.phone)?h`<dl class="kv contact"><dt>緊急聯絡人</dt><dd>${x.name||'—'}</dd><dt>電話</dt><dd>${x.phone?h`<a href="tel:${String(x.phone).replace(/[^\d+]/g,'')}">${x.phone}</a>`:'—'}</dd><dt>關係</dt><dd>${x.relation||'—'}</dd></dl><p class="sub">這次查看已記錄。</p>`
        :h`<p class="msg">這位用戶沒有留緊急聯絡人。</p>`);
    }catch(e){put($('.err',ct),e.message);lock(bs,false);b.textContent='確定查看';}
  });
}

const ROUTES={overview:[overview,'總覽'],users:[users,'用戶',user],events:[events,'活動',event],reports:[reports,'檢舉',reports],safety:[safety,'報平安'],actions:[actions,'操作紀錄']};
function route(focus){
  let [a,b]=location.hash.replace(/^#\/?/,'').split('/').map(x=>{try{return decodeURIComponent(x);}catch(e){return x;}});
  if(!ROUTES[a])a='overview';
  const [list,title,one]=ROUTES[a],v=$('#view');
  $$('nav a[data-r]').forEach(n=>n.dataset.r===a?n.setAttribute('aria-current','page'):n.removeAttribute('aria-current'));
  document.title=title+' · Tagalong 後台';v.innerHTML='';
  (b&&one?one:list)(v,b);
  if(focus)v.focus({preventScroll:false});
}

function loadScript(src){return new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=no;document.head.appendChild(s);});}
async function boot(){
  if(DEMO){
    try{await loadScript('demo.js');}catch(e){return gate('error','找不到範例資料 demo.js');}
    window.fetch=window.TG_ADMIN_DEMO;
    document.body.insertAdjacentHTML('afterbegin','<p class="demo" role="note">範例資料模式（?demo=1）：畫面上都是假資料，不會連到伺服器，操作也不會寫入。</p>');
  }
  if(!token())return gate('signin');
  try{const me=await api('/admin/me');const u=me.user||{};put($('.who'),h`登入：<b>${u.display_name||u.id||''}</b>`);}
  catch(e){if(e.status!==401&&e.code!=='not_admin')gate('error',e.message);return;}
  window.addEventListener('hashchange',()=>route(true));route(false);
  if(!/^#?(overview)?$/.test(location.hash))api('/admin/stats').then(badges,()=>{});
}
window.TG_ADMIN={esc,h,fmt,dur};
boot();
})();
