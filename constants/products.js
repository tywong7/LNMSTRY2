
const atDelta=0.002,longDelta=0.002,addr='sdfas';
import Geocoder from 'react-native-geocoder-reborn';


state = {
  addressComponenst: 'Hong-Kong'
};


function genData (tit,type,lat,lon,latDel,longDel,date){
  
  if (type==0){
    tit=tit+'lux'
  }else tit=tit+'dB'



  return  {
    title: tit,
    latitude: lat,
    longitude:lon,
    latitudeDelta: latDel,
    longitudeDelta: longDel,
    price: date,
    location: '123'
  };
  
}
function test(){
  
  var outArr=[];
  outArr.push(genData(100,0,22.368043,114.134825,atDelta,longDelta,'10:15 10/10/2019'));
  outArr.push(genData(100,0,22.368043,114.134825,atDelta,longDelta,'10:15 10/10/2019'));
  outArr.push( genData(100,0,22.368043,114.134825,atDelta,longDelta,'10:15 10/10/2019'));
  outArr.push( genData(30,1,22.415806,114.207114,atDelta,longDelta,'10:15 10/10/2019'));
  outArr.push( genData(30,1,22.415806,114.207114,atDelta,longDelta,'10:15 10/10/2019'));
  outArr.push(genData(30,1,22.415806,114.207114,atDelta,longDelta,'10:15 10/10/2019'));

  return outArr;
}
export default test();
 
