import {HABITATS, STORY_CHAPTERS} from "./world-data.js";
const css=document.createElement("link");css.rel="stylesheet";css.href="./styles-world.css";document.head.appendChild(css);
const nav=document.querySelector(".tabs"),side=document.querySelector(".side-panel");
if(nav&&side){
 nav.insertAdjacentHTML("beforeend",'<button class="tab" data-tab="habitats">서식지</button><button class="tab" data-tab="story">스토리</button>');
 side.insertAdjacentHTML("beforeend",'<section class="tab-content hidden world-tab" id="tab-habitats"><div class="section-title"><span>WORLD EXPLORATION</span><b>서식지 · 50개 지역</b></div><p class="info-note">서식지는 메인 스토리를 진행하고 지역 재료와 보스를 공략하는 탐험 공간이야. 무한의 탑과 별도로 운영되며, 모든 지역에 처음부터 입장할 수 있어.</p><div id="habitat-detail" class="world-detail"><b>지역을 선택해 봐.</b></div><div id="habitat-list" class="world-list"></div></section><section class="tab-content hidden world-tab" id="tab-story"><div class="section-title"><span>MAIN CHRONICLE</span><b>메인 스토리 · 12장</b></div><p class="info-note">대단절 이후 흩어진 마력의 근원과 유물의 비밀을 추적하는 계승자의 이야기.</p><div id="story-list" class="world-list"></div></section>');
 const list=document.getElementById("habitat-list");
 list.innerHTML=HABITATS.map(h=>'<button class="world-entry" data-habitat="'+h.id+'"><span><b>'+String(h.id).padStart(2,"0")+'. '+h.name+'</b><small>권장 Lv. '+h.recommendedLevel+' · 몬스터 10종 · '+h.monsters[9].name+'</small></span><i>탐험 정보</i></button>').join("");
 const story=document.getElementById("story-list");
 story.innerHTML=STORY_CHAPTERS.map(c=>'<article class="story-entry"><span>CHAPTER '+String(c.id).padStart(2,"0")+'</span><b>'+c.title+'</b><p>'+c.summary+'</p><small>주요 목표: '+c.goal+' · 보스: '+c.boss+'</small></article>').join("");
 list.addEventListener("click",e=>{const b=e.target.closest("[data-habitat]");if(!b)return;const h=HABITATS.find(x=>x.id===Number(b.dataset.habitat));document.getElementById("habitat-detail").innerHTML='<b>'+h.name+'</b><p>'+h.purpose+'</p><small>권장 레벨 '+h.recommendedLevel+' · 연결 스토리 '+h.chapter+'장 · 지역 보스 '+h.monsters[9].name+'</small><div class="monster-preview">'+h.monsters.map(m=>'<span>'+m.name+' <small>Lv.'+m.level+'</small></span>').join("")+'</div>';});
}
