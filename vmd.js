// Lightweight VMD bone animation reader for VRM humanoids. Camera/morph tracks ignored.
import * as THREE from 'three';
const decoder=new TextDecoder('shift_jis');
const mapping={
'センター':'hips','下半身':'hips','上半身':'spine','上半身2':'chest','首':'neck','頭':'head',
'左肩':'leftShoulder','左腕':'leftUpperArm','左ひじ':'leftLowerArm','左手首':'leftHand',
'右肩':'rightShoulder','右腕':'rightUpperArm','右ひじ':'rightLowerArm','右手首':'rightHand',
'左足':'leftUpperLeg','左ひざ':'leftLowerLeg','左足首':'leftFoot','左つま先':'leftToes',
'右足':'rightUpperLeg','右ひざ':'rightLowerLeg','右足首':'rightFoot','右つま先':'rightToes'
};
export function parseVMD(buffer){
 const view=new DataView(buffer),bytes=new Uint8Array(buffer);let p=0;
 const str=n=>{let s=decoder.decode(bytes.subarray(p,p+n));p+=n;return s.replace(/\0.*$/s,'')};
 const signature=str(30);if(!signature.startsWith('Vocaloid Motion Data'))throw Error('VMDファイルではありません');
 str(20);const count=view.getUint32(p,true);p+=4;
 if(count>2000000||p+count*111>buffer.byteLength)throw Error('VMDのデータが不正です');
 const tracks=new Map();
 for(let i=0;i<count;i++){
  const name=str(15),frame=view.getUint32(p,true);p+=4;
  const pos=[view.getFloat32(p,true),view.getFloat32(p+4,true),view.getFloat32(p+8,true)];p+=12;
  const rot=new THREE.Quaternion(view.getFloat32(p,true),view.getFloat32(p+4,true),-view.getFloat32(p+8,true),-view.getFloat32(p+12,true)).normalize();p+=16;
  const interp=bytes.slice(p,p+64);p+=64;
  const bone=mapping[name];if(!bone)continue;
  if(!tracks.has(bone))tracks.set(bone,[]);
  tracks.get(bone).push({frame,rot,pos,interp});
 }
 let maxFrame=0;for(const keys of tracks.values()){keys.sort((a,b)=>a.frame-b.frame);maxFrame=Math.max(maxFrame,keys.at(-1).frame)}
 return {tracks,duration:Math.max(maxFrame/30,1/30),frames:count};
}
export function createVMDPlayer(vrm,vmd){
 const bones=new Map(),initial=new Map();
 for(const name of vmd.tracks.keys()){const b=vrm.humanoid?.getNormalizedBoneNode(name);if(b){bones.set(name,b);initial.set(name,b.quaternion.clone())}}
 const q=new THREE.Quaternion();
 return function update(seconds){
  const f=((seconds%vmd.duration)+vmd.duration)%vmd.duration*30;
  for(const [name,bone] of bones){
   const keys=vmd.tracks.get(name);if(!keys.length)continue;
   let lo=0,hi=keys.length-1;while(lo<hi){const mid=(lo+hi+1)>>1;if(keys[mid].frame<=f)lo=mid;else hi=mid-1}
   const a=keys[lo],b=keys[(lo+1)%keys.length];
   const t=b.frame>a.frame?THREE.MathUtils.clamp((f-a.frame)/(b.frame-a.frame),0,1):0;
   q.copy(a.rot).slerp(b.rot,t);
   bone.quaternion.copy(initial.get(name)).multiply(q);
  }
 }
}
