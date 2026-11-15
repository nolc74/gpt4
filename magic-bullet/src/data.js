export const GAME_CONFIG = Object.freeze({title:"마력탄: 유물의 계승자",relicCount:3001,gearCount:1000,staffCount:100,relicKeyDropChance:.01,gearDropChance:.08,playerSpeed:235,projectileSpeed:560,spawnLimit:24});
export const RARITIES=[
 {name:"일반",color:"#b8c4d3",weight:45,mult:1},
 {name:"고급",color:"#62d6a5",weight:25,mult:1.5},
 {name:"희귀",color:"#55a9ff",weight:15,mult:2.4},
 {name:"영웅",color:"#b68cff",weight:8,mult:4},
 {name:"전설",color:"#ffc45e",weight:4,mult:7},
 {name:"신화",color:"#ff7b9d",weight:2,mult:12},
 {name:"공허",color:"#a18cff",weight:.7,mult:20},
 {name:"천뢰",color:"#fff078",weight:.3,mult:35}
];
const relicNames=["별빛의 심장","심연의 파편","용왕의 비늘","시간의 모래","불멸의 씨앗","폭풍의 눈","고대 정령석","태양의 잔재","달의 눈물","공허의 핵","천둥 군주의 인장","마력의 근원","서리 여왕의 왕관","검은 태양","영원의 수정","잊힌 신의 서판","용사의 맹세","차원의 나침반","생명의 고리","마력 폭주기관"];
const relicSuffix=["Ⅰ","Ⅱ","Ⅲ","Ⅳ","Ⅴ","改","眞","극","원형","초월"];
const abilityNames=["마력 증폭","영혼 포식","차원 균열","별의 가호","무한 순환","정밀 조준","폭발 공명","생명 흡수","시간 가속","유물 공명","천뢰 강림","공허 침식","마력 재생","파괴 본능","계승자의 축복"];
const gearNames=["수습 마법사의 로브","바람결 장화","수정 장갑","마력 수호대","별무리 망토","고대의 허리띠","용비늘 투구","심연의 갑옷","천공의 부츠","영원의 장갑"];
const staffNames=["견습자의 지팡이","푸른 수정 지팡이","고대 수목의 지팡이","별빛을 담은 지팡이","심연의 마도봉","용왕의 홀","천뢰의 지팡이","공허의 지배자","창세의 마도봉","무한의 계승자"];
const pickRarity=(seed)=>{let n=(seed*9301+49297)%233280/233280*100;for(const r of RARITIES){n-=r.weight;if(n<=0)return r;}return RARITIES[0];};
export function getRelic(id){
 const n=Math.max(1,Math.min(3001,id)),seed=n*17,rarity=pickRarity(seed),base=Math.floor(n/300)+1;
 const abilities=Array.from({length:5},(_,i)=>({level:(i+1)*10,name:abilityNames[(n+i*3)%abilityNames.length],description:["마력탄 공격력 +"+(2+i*2)+"%","몬스터 처치 골드 +"+(3+i*2)+"%","최대 체력 +"+(10+i*10),"공격 속도 +"+(1+i)+"%","유물 효과 +"+(2+i*2)+"%"][i]}));
 const levels=Array.from({length:50},(_,i)=>({level:i+1,attack:Math.floor((base+i*base*.18)*rarity.mult),hp:Math.floor((base*4+i*base*.8)*rarity.mult),mp:Math.floor((base*2+i*base*.4)*rarity.mult)}));
 return {id:n,name:relicNames[(n-1)%relicNames.length]+" "+relicSuffix[Math.floor((n-1)/relicNames.length)%relicSuffix.length]+" #"+String(n).padStart(4,"0"),rarity:rarity.name,color:rarity.color,levels,abilities};
}
export function getGear(id){
 const n=Math.max(1,Math.min(1000,id)),slot=["무기","투구","갑옷","장갑","신발","장신구"][(n-1)%6],rarity=pickRarity(n*31),tier=Math.floor((n-1)/100)+1;
 return {id:n,name:gearNames[(n-1)%gearNames.length]+" "+String(n).padStart(4,"0"),slot,rarity:rarity.name,color:rarity.color,attack:Math.ceil(tier*rarity.mult),hp:Math.ceil(tier*8*rarity.mult),defense:Math.ceil(tier*.7*rarity.mult),level:1};
}
export function getStaff(id){
 const n=Math.max(1,Math.min(100,id)),rarity=pickRarity(n*71),tier=Math.ceil(n/10);
 return {id:n,name:staffNames[(n-1)%staffNames.length]+" #"+String(n).padStart(3,"0"),rarity:rarity.name,color:rarity.color,attack:tier*3*rarity.mult,attackSpeed:Math.min(.8,tier*.025),level:1,cost:Math.floor(100+tier*tier*75)};
}
export const MONSTERS=[
 {id:"hare",name:"초원의 뿔토끼",hp:48,attack:4,defense:0,speed:42,exp:12,gold:6,radius:18,color:"#c9a8df"},
 {id:"slime",name:"마력 이슬 슬라임",hp:72,attack:5,defense:1,speed:29,exp:16,gold:8,radius:21,color:"#75cfc1"},
 {id:"wolf",name:"회랑의 그림자늑대",hp:95,attack:8,defense:2,speed:55,exp:22,gold:12,radius:20,color:"#9eafc6"},
 {id:"golem",name:"고대 회랑 골렘",hp:180,attack:13,defense:5,speed:20,exp:38,gold:22,radius:27,color:"#c19b78"},
 {id:"boss",name:"탑의 수호자",hp:850,attack:22,defense:8,speed:25,exp:180,gold:150,radius:39,color:"#f0b85d"}
];
export const expRequired=level=>Math.ceil(90*Math.pow(level,1.42));
