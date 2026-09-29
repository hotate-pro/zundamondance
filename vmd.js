// VMD -> VRM normalized-humanoid retargeter.
// Uses raw VMD quaternions (x,y,z,w), continuous loop interpolation, and no spring-bone simulation.
import * as THREE from 'three';
const decoder=new TextDecoder('shift_jis');
const mapping={
'センター':null,'下半身':'hips','上半身':'spine','上半身2':'chest','首':'neck','頭':'head',
'左肩':'leftShoulder','左腕':'leftUpperArm','左ひじ':'leftLowerArm','左手首':'leftHand',
'右肩':'rightShoulder','右腕':'rightUpperArm','右ひじ':'rightLowerArm','右手首':'rightHand',
'左足':'leftUpperLeg','左ひざ':'leftLowerLeg','左足首':'leftFoot','左つま先':'leftToes',
'右足':'rightUpperLeg','右ひざ':'rightLowerLeg','右足首':'rightFoot','右つま先':'rightToes'
};
export function parseVMD(buffer){
 const view=new DataView(buffer),bytes=new Uint8Array(buffer);let p=0;
 const str=n=>{const s=decoder.decode(bytes.subarray(p,p+n));p+=n;return s.replace(/\0.*$/s,'')};
 const signature=str(30);if(!signature.startsWith('Vocaloid Motion Data'))throw Error('VMDファイルではありません');
 str(20);const count=view.getUint32(p,true);p+=4;
 if(count>2000000||p+count*111>buffer.byteLength)throw Error('VMDのデータが不正です');
 const tracks=new Map();let maxFrame=0;
 for(let i=0;i<count;i++){
  const name=str(15),frame=view.getUint32(p,true);p+=4;
  const pos=[view.getFloat32(p,true),view.getFloat32(p+4,true),view.getFloat32(p+8,true)];p+=12;
  const rot=new THREE.Quaternion(view.getFloat32(p,true),view.getFloat32(p+4,true),view.getFloat32(p+8,true),view.getFloat32(p+12,true)).normalize();p+=16;
  const interp=bytes.slice(p,p+64);p+=64;
  maxFrame=Math.max(maxFrame,frame);
  const bone=mapping[name];if(!bone)continue;
  if(!tracks.has(bone))tracks.set(bone,[]);
  tracks.get(bone).push({frame,rot,pos,interp});
 }
 for(const keys of tracks.values())keys.sort((a,b)=>a.frame-b.frame);
 return {tracks,duration:(maxFrame+1)/30,loopFrames:maxFrame+1,frames:count};
}
export function createVMDPlayer(vrm,vmd){
 const bones=new Map(),initial=new Map(),temp=new THREE.Quaternion();
 for(const name of vmd.tracks.keys()){
  const b=vrm.humanoid?.getNormalizedBoneNode(name);
  if(b){bones.set(name,b);initial.set(name,b.quaternion.clone())}
 }
 return function update(seconds){
  const f=((seconds*30)%vmd.loopFrames+vmd.loopFrames)%vmd.loopFrames;
  for(const [name,bone] of bones){
   const keys=vmd.tracks.get(name);if(!keys.length)continue;
   if(keys.length===1){temp.copy(keys[0].rot);}
   else {
    let hi=keys.length;
    while(hi>0&&keys[hi-1].frame>f)hi--;
    const ai=hi===0?keys.length-1:hi-1;
    const bi=(ai+1)%keys.length;
    const a=keys[ai],b=keys[bi];
    let bf=b.frame;
    if(bi===0)bf+=vmd.loopFrames;
    let ff=f;if(ff<a.frame)ff+=vmd.loopFrames;
    const t=bf>a.frame?THREE.MathUtils.clamp((ff-a.frame)/(bf-a.frame),0,1):0;
    temp.copy(a.rot).slerp(b.rot,t);
   }
   bone.quaternion.copy(initial.get(name)).multiply(temp);
  }
 };
}
