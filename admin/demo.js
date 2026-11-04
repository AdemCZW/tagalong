/* SAMPLE DATA ONLY — loaded by admin.js when the URL has ?demo=1. Fake people and events shaped like ADMIN_API.md; nothing is sent anywhere. */
(()=>{
const now=Date.now(),H=36e5,D=24*H;
const NAMES=['小安','林以恩','陳柏宇','王小雨','張以恩','李承翰','黃詩涵','吳冠廷','周子晴','徐浩然','許雅婷','鄭宇軒','謝佳穎','郭家豪','洪若瑜','曾子豪','蔡宜蓁','劉品安','楊書豪','何芷晴','高偉倫','羅心怡','葉俊傑','邱佩珊','潘冠宇','杜雨萱','蘇柏翰','盧亭妤','蔣宇恆','方語彤','石皓宇','簡欣妤','馮少華','袁巧芸','鍾子揚','彭紫涵','游家瑋','詹思妤','賴品睿','魏詩婷','范柏廷','宋可欣'];
const users=NAMES.map((n,i)=>({id:'usr_demo'+String(i+1).padStart(2,'0'),display_name:n,handle:i%3?'demo'+(i+1):null,status:i===7||i===19?'suspended':i===30?'deleted':'active',verified:i%4!==1?1:0,gender:['f','m','f','x'][i%4],age:22+(i*7)%19,created_at:now-(i*2.3+.4)*D,via_line:i%5!==3,hosted:(i*3)%5,joined:(i*7)%11,reports_against:i===7?3:i===12?1:i===19?2:0}));
users[0].display_name='小安（管理員）';
const U=i=>({id:users[i].id,display_name:users[i].display_name});
const T=[['陽明山擎天崗夜走','outdoor',2],['週五桌遊：卡坦島','board',1],['河濱慢跑 5K','sport',3],['永康街早午餐','food',4],['水彩速寫入門','art',5],['讀書會：小王子','book',6],['大安森林爵士夜','music',7],['烏來溪邊野餐','outdoor',8],['羽球雙打揪咖','sport',9],['咖啡廳一對一聊天','food',12],['松菸展覽散步','art',13],['夜市吃到飽','food',19]];
const events=T.map(([title,category,h],i)=>({id:'evt_demo'+(i+1),title,mode:i===9||i===11?'date':'group',category,status:i===3?'completed':i===8?'cancelled':'open',starts_at:now+(i-3)*D+2*H,ends_at:now+(i-3)*D+5*H,place_name:['擎天崗遊客中心','桌遊咖啡 Meeple','大佳河濱公園','永康街口','華山 1914','光點台北','大安森林公園露天音樂台','烏來老街','台大體育館','東區咖啡廳','松山文創園區','饒河街夜市'][i],address:'台北市範例路 '+(i+1)+' 號',host:U(h),capacity:[8,6,20,6,10,12,30,10,4,2,8,2][i],reports:i===11?2:i===0?1:0,min_people:2,risk:i===0||i===7?'high':'low',description:'這是範例活動說明。\n集合後一起出發。',created_at:now-(10-i)*D,cancel_reason:i===8?'場地臨時維修':null}));
events.forEach((e,i)=>e.seats_taken=Math.min(e.capacity,2+(i*5)%7));
const reports=[
  {id:'rpt_d1',status:'open',reason:'harassment',detail:'聊天室一直私訊要電話，拒絕後還繼續傳。',created_at:now-2*H,reporter:U(3),target:{type:'user',id:users[7].id,label:users[7].display_name,user_id:users[7].id}},
  {id:'rpt_d2',status:'open',reason:'scam',detail:'活動說明裡要大家先匯款到私人帳戶。',created_at:now-5*H,reporter:U(5),target:{type:'event',id:'evt_demo12',label:'夜市吃到飽',event_id:'evt_demo12',user_id:users[19].id}},
  {id:'rpt_d3',status:'open',reason:'inappropriate',detail:'',created_at:now-9*H,reporter:U(10),target:{type:'comment',id:'cmt_d1',label:'這種活動只有笨蛋才會去，大家不要被騙了，主辦人根本不會出現……',event_id:'evt_demo3',user_id:users[12].id}},
  {id:'rpt_d4',status:'open',reason:'danger',detail:'夜間登山沒有說要帶頭燈，路線也沒有公布。',created_at:now-26*H,reporter:U(14),target:{type:'event',id:'evt_demo1',label:'陽明山擎天崗夜走',event_id:'evt_demo1',user_id:users[2].id}},
  {id:'rpt_d5',status:'reviewing',reason:'impersonation',detail:'用了我朋友的照片當大頭貼。',created_at:now-2*D,reporter:U(16),target:{type:'user',id:users[19].id,label:users[19].display_name,user_id:users[19].id}},
  {id:'rpt_d6',status:'resolved',reason:'harassment',detail:'',created_at:now-4*D,reporter:U(21),target:{type:'message',id:'msg_d1',label:'你住哪裡？我可以去接你',event_id:'evt_demo10',user_id:users[7].id}},
  {id:'rpt_d7',status:'dismissed',reason:'other',detail:'覺得活動太早開始。',created_at:now-6*D,reporter:U(23),target:{type:'event',id:'evt_demo3',label:'河濱慢跑 5K',event_id:'evt_demo3',user_id:users[3].id}}
];
const safety=[
  {event_id:'evt_demo1',event_title:'陽明山擎天崗夜走',user:U(11),host:U(2),status:'help',misses:0,next_due_at:now-40*6e4,updated_at:now-38*6e4},
  {event_id:'evt_demo1',event_title:'陽明山擎天崗夜走',user:U(15),host:U(2),status:'escalated',misses:2,next_due_at:now-75*6e4,updated_at:now-15*6e4},
  {event_id:'evt_demo8',event_title:'烏來溪邊野餐',user:U(24),host:U(8),status:'asked',misses:1,next_due_at:now-20*6e4,updated_at:now-50*6e4},
  {event_id:'evt_demo8',event_title:'烏來溪邊野餐',user:U(27),host:U(8),status:'contact_notified',misses:3,next_due_at:now+30*6e4,updated_at:now-5*6e4}
];
const contacts={[users[11].id]:{name:'林媽媽',phone:'0912-345-678',relation:'母親'},[users[15].id]:{name:'陳大哥',phone:'0922-000-111',relation:'哥哥'},[users[27].id]:{name:'周小姐',phone:'0933-222-333',relation:'室友'}};
let seq=0;
const actions=[
  {id:'act_d1',admin_id:users[0].id,admin_name:users[0].display_name,action:'suspend',target_type:'user',target_id:users[7].id,reason:'多次騷擾其他參加者，已有三筆檢舉。',created_at:now-3*D},
  {id:'act_d2',admin_id:users[0].id,admin_name:users[0].display_name,action:'takedown',target_type:'event',target_id:'evt_demo9',reason:'場地臨時維修',created_at:now-2*D},
  {id:'act_d3',admin_id:users[0].id,admin_name:users[0].display_name,action:'report_resolved',target_type:'report',target_id:'rpt_d6',reason:null,created_at:now-30*H},
  {id:'act_d4',admin_id:users[0].id,admin_name:users[0].display_name,action:'view_contact',target_type:'user',target_id:users[27].id,reason:null,created_at:now-6*H},
  {id:'act_d5',admin_id:users[0].id,admin_name:users[0].display_name,action:'suspend',target_type:'user',target_id:users[19].id,reason:'冒用他人照片',created_at:now-20*H}
];
actions.sort((m,n)=>n.created_at-m.created_at);
const log=(action,target_type,target_id,reason)=>actions.unshift({id:'act_n'+(++seq),admin_id:users[0].id,admin_name:users[0].display_name,action,target_type,target_id,reason:reason||null,created_at:Date.now()});
const res=(status,d)=>new Response(JSON.stringify(d),{status,headers:{'Content-Type':'application/json'}});
const fail=(status,code,message)=>res(status,{error:{code,message}});
const page=(arr,q)=>{const c=+q.get('cursor')||0,l=Math.min(+q.get('limit')||30,100);return res(200,{items:arr.slice(c,c+l),next_cursor:c+l<arr.length?String(c+l):null});};
const has=(s,q)=>!q||String(s||'').toLowerCase().includes(q.toLowerCase());
window.TG_ADMIN_DEMO=async(url,opt={})=>{
  await new Promise(r=>setTimeout(r,80));
  const u=new URL(url),p=u.pathname.split('/').filter(Boolean).slice(1).map(decodeURIComponent),q=u.searchParams,b=opt.body?JSON.parse(opt.body):{};
  const [a,id,sub,x]=p;
  if(a==='me')return res(200,{user:U(0),admin:true});
  if(a==='stats')return res(200,{users:{total:users.length,active:users.filter(u=>u.status==='active').length,suspended:users.filter(u=>u.status==='suspended').length,new_7d:4},events:{open:events.filter(e=>e.status==='open').length,upcoming_7d:7,completed:41,cancelled:6,date_mode:2},joins:{total:318,last_7d:27},reports:{open:reports.filter(r=>r.status==='open').length},safety:{alerts:safety.length}});
  if(a==='users'&&!id)return page(users.filter(u=>(!q.get('status')||u.status===q.get('status'))&&(has(u.display_name,q.get('q'))||has(u.handle,q.get('q'))||has(u.id,q.get('q')))).sort((m,n)=>n.created_at-m.created_at),q);
  if(a==='users'){const u=users.find(u=>u.id===id);if(!u)return fail(404,'not_found','找不到這個用戶');
    if(sub==='suspend'){if(u.id===users[0].id)return fail(409,'cannot_suspend_admin','不能停權管理員');u.status='suspended';log('suspend','user',u.id,b.reason);return res(200,{ok:true});}
    if(sub==='restore'){if(u.status==='deleted')return fail(409,'deleted','已刪除的帳號不能恢復');u.status='active';log('restore','user',u.id,b.reason);return res(200,{ok:true});}
    return res(200,{user:u,hosted:events.filter(e=>e.host.id===u.id),joined:events.filter((e,i)=>(i+users.indexOf(u))%4===0),reports_against:reports.filter(r=>r.target.user_id===u.id&&r.target.type==='user').map(r=>({id:r.id,reason:r.reason,detail:r.detail,status:r.status,created_at:r.created_at,reporter:r.reporter})),actions:actions.filter(x=>x.target_id===u.id)});}
  if(a==='events'&&!id)return page(events.filter(e=>(!q.get('status')||e.status===q.get('status'))&&(!q.get('mode')||e.mode===q.get('mode'))&&(has(e.title,q.get('q'))||has(e.id,q.get('q')))),q);
  if(a==='events'){const e=events.find(e=>e.id===id);if(!e)return fail(404,'not_found','找不到這個活動');
    if(sub==='takedown'){if(e.status!=='open')return fail(409,'not_open','只有開放中的活動可以下架');e.status='cancelled';e.cancel_reason=b.reason;(e.changes=e.changes||[]).unshift({id:'chg_n',kind:'cancel',reason:b.reason,actor_id:users[0].id,actor_name:users[0].display_name,created_at:Date.now()});log('takedown','event',e.id,b.reason);return res(200,{ok:true});}
    const ps=users.slice(1,1+e.seats_taken).map((u,i)=>({user_id:u.id,display_name:u.display_name,status:i===0?'joined':['joined','joined','pending','waitlisted','left'][i%5],plus_count:i%4===1?1:0}));
    return res(200,Object.assign({},e,{participants:ps,changes:e.changes||(e.status==='cancelled'?[{id:'chg_d1',kind:'cancel',reason:e.cancel_reason,actor_id:e.host.id,created_at:now-D}]:[{id:'chg_d2',kind:'postpone',reason:'團主行程調整',old_starts_at:e.starts_at-D,new_starts_at:e.starts_at,actor_id:e.host.id,created_at:now-3*D}]),reports:reports.filter(r=>r.target.event_id===e.id).map(r=>({id:r.id,reason:r.reason,detail:r.detail,status:r.status,created_at:r.created_at,reporter:r.reporter}))}));}
  if(a==='reports'&&!id)return page(reports.filter(r=>r.status===(q.get('status')||'open')),q);
  if(a==='reports'){const r=reports.find(r=>r.id===id);if(!r)return fail(404,'not_found','找不到這筆檢舉');r.status=b.status;log('report_'+b.status,'report',r.id,b.note);return res(200,{ok:true});}
  if(a==='safety'&&!id)return page(safety,q);
  if(a==='safety'&&x==='contact'){log('view_contact','user',sub);return res(200,{contact:contacts[sub]||null});}
  if(a==='actions')return page(actions,q);
  return fail(404,'not_found','範例資料沒有這個路徑');
};
})();
