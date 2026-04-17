import React, { useState, createContext, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, SafeAreaView, StatusBar, Modal, Dimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Svg, { Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';

// ═══════════════ I18N ═══════════════
const MN_V=["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];
const MN_E=["January","February","March","April","May","June","July","August","September","October","November","December"];
const DN_V=["CN","T2","T3","T4","T5","T6","T7"];const DN_E=["Su","Mo","Tu","We","Th","Fr","Sa"];
const TV={appName:"BVP Solver",appSub:"Numerical Methods",welcomeMsg:"Chào mừng đến với BVP_Solver",welcomeSub:"Xin vui lòng chọn mô hình mà bạn đang cần",chooseModel:"Chọn Mô Hình",nModels:"mô hình ứng dụng phương pháp số BVP",methods:"Phương pháp",models:"Mô hình",avail:"Khả dụng",modelList:"Danh Sách Mô Hình",home:"Danh mục Mô hình",settings:"Cài đặt",inputTitle:"Nhập thông số",resultTitle:"Kết quả phân tích",language:"Ngôn ngữ",theme:"Giao diện",light:"Sáng",dark:"Tối",m1:"Mô Hình Chứng Khoán",m1d:"Phân tích & Dự đoán giá cổ phiếu theo sóng BVP",m2:"Mô Hình Cấp Phôi Tự Động",m2d:"Dao động pít-tông lò-xo cho máy dập kim loại",m3:"Mô Hình Nhiệt Lõi Trái Đất",m3d:"Phân phối nhiệt độ lõi Trái Đất",m4:"Mô Hình Tối Ưu Đầu Tư",m4d:"Tối ưu hóa đầu tư (Euler-Lagrange)",histData:"1. DỮ LIỆU LỊCH SỬ",predict:"2. DỰ ĐOÁN TƯƠNG LAI",numParams:"THÔNG SỐ GIẢI TÍCH SỐ",startDate:"Ngày bắt đầu",endDate:"Ngày kết thúc",openPrice:"Giá mở cửa",closePrice:"Giá đóng cửa",predictDate:"Ngày dự đoán",gridN:"Số điểm lưới N",gridHint:"(20-50)",solve:"Thực thi BVP Solver",back:"Quay lại",mass:"Khối lượng m (kg)",spring:"Độ cứng k (N/m)",amp:"Biên độ A (m)",r1:"r₁ (km)",t1:"T₁ (K)",r2:"r₂ (km)",t2:"T₂ (K)",k0:"K₀ (tỷ đồng)",kT:"K_T (tỷ đồng)",tEnd:"T (năm)",mechParams:"1. THÔNG SỐ CƠ HỌC",heatParams:"1. THÔNG SỐ ĐỊA VẬT LÝ",econParams:"1. THÔNG SỐ KINH TẾ",chartTitle:"Biểu Đồ Sóng BVP",chartSub:"So sánh nghiệm xấp xỉ và chính xác",errTable:"Bảng Sai Số",method:"Phương pháp",maxErr:"Sai số EL∞",advice:"Khuyến Nghị",exact:"Nghiệm chính xác",predPrice:"Giá dự đoán ngày",optRate:"Tốc độ đầu tư tối ưu",omega:"ω",adv1:"Giá cổ phiếu dao động theo chu kỳ. Thận trọng khi giá đỉnh, mua vào khi giá đáy. ω càng lớn → biến động càng nhanh.",adv2:"Pít-tông dao động ổn định T=2π/ω≈2s. Điều chỉnh m,k để đồng bộ. Kiểm soát biên độ.",adv3:"Nhiệt lõi giảm theo 1/r. Gradient cao gần lõi → đối lưu mạnh.",adv4:"Phân bổ vốn đều đặn. Tốc độ tối ưu = (K_T-K_0)/T.",mN:MN_V,dN:DN_V};
const TE={appName:"BVP Solver",appSub:"Numerical Methods",welcomeMsg:"Welcome to BVP_Solver",welcomeSub:"Please select the model you need",chooseModel:"Choose Model",nModels:"models using BVP methods",methods:"Methods",models:"Models",avail:"Available",modelList:"Model List",home:"Model Catalog",settings:"Settings",inputTitle:"Input Parameters",resultTitle:"Results",language:"Language",theme:"Theme",light:"Light",dark:"Dark",m1:"Stock Price",m1d:"Stock price analysis via BVP",m2:"Auto Feeder",m2d:"Piston-spring for stamping",m3:"Earth Core Heat",m3d:"Core temperature distribution",m4:"Investment Opt.",m4d:"Optimal investment (Euler-Lagrange)",histData:"1. HISTORICAL DATA",predict:"2. PREDICTION",numParams:"NUMERICAL PARAMS",startDate:"Start date",endDate:"End date",openPrice:"Open price",closePrice:"Close price",predictDate:"Predict date",gridN:"Grid N",gridHint:"(20-50)",solve:"Run BVP Solver",back:"Back",mass:"Mass m (kg)",spring:"Spring k (N/m)",amp:"Amp A (m)",r1:"r₁ (km)",t1:"T₁ (K)",r2:"r₂ (km)",t2:"T₂ (K)",k0:"K₀ (billion)",kT:"K_T (billion)",tEnd:"T (years)",mechParams:"1. MECHANICAL",heatParams:"1. GEOPHYSICAL",econParams:"1. ECONOMIC",chartTitle:"BVP Chart",chartSub:"Approximate vs exact",errTable:"Error Table",method:"Method",maxErr:"Max Error",advice:"Advice",exact:"Exact",predPrice:"Predicted on",optRate:"Optimal rate",omega:"ω",adv1:"Prices oscillate cyclically. Buy at troughs, caution at peaks.",adv2:"Piston T=2π/ω≈2s. Adjust m,k. Control amplitude.",adv3:"Temp decreases as 1/r. High gradient = strong convection.",adv4:"Allocate capital evenly. Rate=(K_T-K_0)/T.",mN:MN_E,dN:DN_E};

// ═══════════════ CONTEXT ═══════════════
const Ctx=createContext();
function Prov({children}){const[lang,setLang]=useState('vi');const[isDark,setIsDark]=useState(false);const T=lang==='vi'?TV:TE;return(<Ctx.Provider value={{lang,setLang,isDark,setIsDark,T}}>{children}</Ctx.Provider>);}
function useApp(){return useContext(Ctx);}

// ═══════════════ CALENDAR ═══════════════
function CalPick({label,value,onChange}){
  const{isDark,T}=useApp();const[open,setOpen]=useState(false);const[vY,sY]=useState(value.y);const[vM,sM]=useState(value.m);
  const bg=isDark?'#1e2230':'#fff',tx=isDark?'#e8ecf4':'#1a2030',ts=isDark?'#6a7a8a':'#8a9aaa',bdr=isDark?'#333':'#e0e0e0',ac='#2563eb',iBg=isDark?'#252b3b':'#f7f8fb';
  const dim=new Date(vY,vM,0).getDate(),fdow=new Date(vY,vM-1,1).getDay();
  const cells=[];for(let i=0;i<fdow;i++)cells.push(null);for(let d=1;d<=dim;d++)cells.push(d);
  const fmt=v=>`${String(v.d).padStart(2,'0')}/${String(v.m).padStart(2,'0')}/${v.y}`;
  const prevM=()=>{if(vM===1){sM(12);sY(vY-1);}else sM(vM-1);};
  const nextM=()=>{if(vM===12){sM(1);sY(vY+1);}else sM(vM+1);};
  const pick=d=>{onChange({y:vY,m:vM,d});setOpen(false);};
  const isSel=d=>d===value.d&&vM===value.m&&vY===value.y;
  return(<View style={{marginBottom:14}}><Text style={{fontSize:13,color:ts,fontWeight:'500',marginBottom:6}}>{label}</Text>
    <TouchableOpacity style={{flexDirection:'row',alignItems:'center',padding:14,borderRadius:12,borderWidth:1.5,borderColor:bdr,backgroundColor:iBg}} onPress={()=>{sY(value.y);sM(value.m);setOpen(true);}}>
      <Text style={{fontSize:16,marginRight:10}}>📅</Text><Text style={{fontSize:15,fontWeight:'500',color:tx}}>{fmt(value)}</Text><Text style={{marginLeft:'auto',color:ts}}>▼</Text>
    </TouchableOpacity>
    <Modal visible={open} transparent animationType="fade"><TouchableOpacity style={{flex:1,backgroundColor:'rgba(0,0,0,0.4)',justifyContent:'center',alignItems:'center'}} activeOpacity={1} onPress={()=>setOpen(false)}>
      <View style={{width:320,borderRadius:16,padding:16,backgroundColor:bg,borderWidth:1,borderColor:bdr}} onStartShouldSetResponder={()=>true}>
        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
          <TouchableOpacity onPress={prevM} style={{width:36,height:36,borderRadius:10,borderWidth:1,borderColor:bdr,alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:18,color:tx}}>‹</Text></TouchableOpacity>
          <Text style={{fontSize:15,fontWeight:'700',color:tx}}>{T.mN[vM-1]} {vY}</Text>
          <TouchableOpacity onPress={nextM} style={{width:36,height:36,borderRadius:10,borderWidth:1,borderColor:bdr,alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:18,color:tx}}>›</Text></TouchableOpacity>
        </View>
        <View style={{flexDirection:'row',marginBottom:6}}>{T.dN.map(d=><Text key={d} style={{flex:1,textAlign:'center',fontSize:11,fontWeight:'700',color:ts}}>{d}</Text>)}</View>
        <View style={{flexDirection:'row',flexWrap:'wrap'}}>{cells.map((d,i)=>(<TouchableOpacity key={i} disabled={!d} onPress={()=>d&&pick(d)} style={{width:'14.28%',aspectRatio:1,alignItems:'center',justifyContent:'center',borderRadius:10,...(d&&isSel(d)?{backgroundColor:ac}:{})}}>
          <Text style={{fontSize:14,fontWeight:d&&isSel(d)?'700':'500',color:d?(isSel(d)?'#fff':tx):'transparent'}}>{d||''}</Text>
        </TouchableOpacity>))}</View>
        <View style={{flexDirection:'row',justifyContent:'center',gap:8,marginTop:12,paddingTop:10,borderTopWidth:1,borderTopColor:bdr}}>
          <TouchableOpacity onPress={()=>sY(vY-1)} style={{paddingHorizontal:14,paddingVertical:4,borderRadius:8,borderWidth:1,borderColor:bdr}}><Text style={{color:ts,fontSize:12}}>{vY-1}</Text></TouchableOpacity>
          <View style={{paddingHorizontal:14,paddingVertical:4,borderRadius:8,backgroundColor:ac+'20'}}><Text style={{color:ac,fontSize:12,fontWeight:'700'}}>{vY}</Text></View>
          <TouchableOpacity onPress={()=>sY(vY+1)} style={{paddingHorizontal:14,paddingVertical:4,borderRadius:8,borderWidth:1,borderColor:bdr}}><Text style={{color:ts,fontSize:12}}>{vY+1}</Text></TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity></Modal></View>);
}

// ═══════════════ CHART ═══════════════
function SChart({datasets,xLabel,isDark}){
  const W=Dimensions.get('window').width-64,H=220;const p={l:58,r:12,t:12,b:26},cW=W-p.l-p.r,cH=H-p.t-p.b;
  let aX=[],aY=[];datasets.forEach(d=>{aX.push(...d.x);aY.push(...d.y)});
  const xMn=Math.min(...aX),xMx=Math.max(...aX),yMn=Math.min(...aY),yMx=Math.max(...aY);
  const xR=xMx-xMn||1,yP=(yMx-yMn)*0.08||1,yLo=yMn-yP,yHi=yMx+yP,yR=yHi-yLo;
  const tX=v=>p.l+((v-xMn)/xR)*cW,tY=v=>p.t+cH-((v-yLo)/yR)*cH;
  const gc=isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.07)',tc=isDark?'#8899aa':'#7a8a9a';
  const cols=['#94a3b8','#2563eb','#10b981','#f59e0b'];
  return(<View><Svg width={W} height={H}>
    {[0,1,2,3,4].map(i=>{const y=p.t+(i/4)*cH,val=yHi-(i/4)*yR;return(<React.Fragment key={i}><Line x1={p.l} y1={y} x2={W-p.r} y2={y} stroke={gc} strokeWidth={1}/><SvgText x={p.l-5} y={y+4} fill={tc} fontSize={9} textAnchor="end">{Math.abs(val)>100?Math.round(val):val.toFixed(3)}</SvgText></React.Fragment>);})}
    {[0,1,2,3,4].map(i=>{const x=p.l+(i/4)*cW,val=xMn+(i/4)*xR;return(<SvgText key={i} x={x} y={H-6} fill={tc} fontSize={9} textAnchor="middle">{Math.abs(val)>100?Math.round(val):val.toFixed(1)}</SvgText>);})}
    {datasets.map((d,di)=>{const pts=d.x.map((xv,i)=>`${tX(xv)},${tY(d.y[i])}`).join(' ');return(<React.Fragment key={di}><Polyline points={pts} fill="none" stroke={d.color||cols[di]} strokeWidth={d.thick||2} strokeDasharray={d.dash?'6,4':undefined}/>{d.dots&&d.x.map((xv,i)=>(<Circle key={i} cx={tX(xv)} cy={tY(d.y[i])} r={2.5} fill={d.color||cols[di]}/>))}</React.Fragment>);})}
  </Svg>
  <View style={{flexDirection:'row',justifyContent:'center',gap:12,marginTop:6,flexWrap:'wrap'}}>{datasets.map((d,i)=>(<View key={i} style={{flexDirection:'row',alignItems:'center',gap:4}}><View style={{width:14,height:3,borderRadius:2,backgroundColor:d.color||cols[i]}}/><Text style={{fontSize:11,color:tc}}>{d.label}</Text></View>))}</View></View>);
}

// ═══════════════ THEME HOOK ═══════════════
function useTheme(){const{isDark}=useApp();return{bg:isDark?'#121827':'#f0f2f7',cBg:isDark?'#1e2230':'#fff',bdr:isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.06)',tx:isDark?'#e8ecf4':'#1a2030',ts:isDark?'#8899aa':'#6b7a8d',ac:'#2563eb',acL:isDark?'rgba(37,99,235,0.15)':'#e8f0fe',hBg:isDark?'#1a2540':'#1e2d4a',iBg:isDark?'#252b3b':'#f7f8fb'};}

// ═══════════════ SCREENS ═══════════════
const mdDefs=[{id:1,icon:'📈',eq:"x''+ω²x=0"},{id:2,icon:'⚙️',eq:"mx''+kx=0"},{id:3,icon:'🌍',eq:"ru''+2u'=0"},{id:4,icon:'💼',eq:"x''=0"}];
const bCols=['#10b981','#f59e0b','#ef4444','#8b5cf6'];

function HomeScreen({navigation}){
  const{isDark,T}=useApp();const th=useTheme();const names=[T.m1,T.m2,T.m3,T.m4],descs=[T.m1d,T.m2d,T.m3d,T.m4d];
  return(<SafeAreaView style={{flex:1,backgroundColor:th.bg}}><StatusBar barStyle={isDark?'light-content':'dark-content'}/>
    <View style={{flexDirection:'row',alignItems:'center',padding:14,paddingHorizontal:16,borderBottomWidth:1,borderBottomColor:th.bdr}}>
      <Text style={{fontSize:16,fontWeight:'700',color:th.tx}}>{T.home}</Text><View style={{flex:1}}/>
      <TouchableOpacity onPress={()=>navigation.navigate('Settings')} style={{padding:8,borderRadius:10,borderWidth:1,borderColor:th.bdr,backgroundColor:th.cBg}}><Text>⚙️</Text></TouchableOpacity></View>
    <ScrollView contentContainerStyle={{padding:16}}>
      <View style={{alignItems:'center',marginBottom:20}}><Text style={{fontSize:22,fontWeight:'800',color:th.ac,marginBottom:6,textAlign:'center'}}>{T.welcomeMsg}</Text><Text style={{fontSize:14,color:th.ts,textAlign:'center',lineHeight:22}}>{T.welcomeSub}</Text></View>
      <View style={{flexDirection:'row',alignItems:'center',gap:14,marginBottom:20}}><View style={{width:52,height:52,borderRadius:14,backgroundColor:th.hBg,alignItems:'center',justifyContent:'center'}}><Text style={{color:'#fff',fontWeight:'700',fontStyle:'italic',fontSize:18}}>fx</Text></View><View><Text style={{fontSize:20,fontWeight:'700',color:th.tx}}>{T.appName}</Text><Text style={{fontSize:13,color:th.ts}}>{T.appSub}</Text></View></View>
      <View style={{backgroundColor:th.hBg,borderRadius:16,padding:22,marginBottom:22}}>
        <Text style={{color:'#fff',fontSize:18,fontWeight:'700',marginBottom:4}}>{T.chooseModel}</Text><Text style={{color:'rgba(255,255,255,0.7)',fontSize:13,marginBottom:18}}>4 {T.nModels}</Text>
        <View style={{flexDirection:'row',borderRadius:12,overflow:'hidden',backgroundColor:'rgba(255,255,255,0.08)'}}>
          {[['3',T.methods],['4',T.models],['4',T.avail]].map(([n,l],i)=>(<View key={i} style={{flex:1,alignItems:'center',padding:14,borderRightWidth:i<2?1:0,borderRightColor:'rgba(255,255,255,0.1)'}}><Text style={{color:'#fff',fontSize:24,fontWeight:'800'}}>{n}</Text><Text style={{color:'rgba(255,255,255,0.7)',fontSize:12}}>{l}</Text></View>))}</View></View>
      <Text style={{fontSize:18,fontWeight:'700',color:th.tx,marginBottom:14}}>{T.modelList}</Text>
      {mdDefs.map((m,idx)=>(<TouchableOpacity key={m.id} onPress={()=>navigation.navigate('Input',{modelId:m.id})} activeOpacity={0.7} style={{backgroundColor:th.cBg,borderRadius:16,padding:16,marginBottom:12,borderWidth:1,borderColor:th.bdr,flexDirection:'row',alignItems:'center',gap:14}}>
        <View style={{width:50,height:50,borderRadius:14,backgroundColor:th.acL,alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:24}}>{m.icon}</Text></View>
        <View style={{flex:1}}>
          <View style={{flexDirection:'row',alignItems:'center',flexWrap:'wrap'}}><Text style={{fontWeight:'700',fontSize:15,color:th.tx}}>{names[idx]}</Text><View style={{paddingHorizontal:10,paddingVertical:3,borderRadius:20,backgroundColor:bCols[idx]+'18',marginLeft:8}}><Text style={{fontSize:11,fontWeight:'700',color:bCols[idx]}}>✓</Text></View></View>
          <Text style={{fontSize:13,color:th.ts,marginVertical:4}}>{descs[idx]}</Text>
          <Text style={{fontSize:11,color:th.ac,backgroundColor:th.acL,paddingHorizontal:8,paddingVertical:2,borderRadius:6,alignSelf:'flex-start'}}>{m.eq}</Text>
          <View style={{flexDirection:'row',gap:6,marginTop:6}}>{['FDM','SM','FEM'].map(tag=>(<View key={tag} style={{paddingHorizontal:12,paddingVertical:4,borderRadius:8,backgroundColor:isDark?'rgba(255,255,255,0.06)':'#f0f2f5'}}><Text style={{fontSize:12,fontWeight:'600',color:th.ts}}>{tag}</Text></View>))}</View></View>
        <Text style={{fontSize:20,color:th.ts}}>›</Text>
      </TouchableOpacity>))}
    </ScrollView></SafeAreaView>);
}

function SettingsScreen({navigation}){const{lang,setLang,isDark,setIsDark,T}=useApp();const th=useTheme();
  return(<SafeAreaView style={{flex:1,backgroundColor:th.bg}}>
    <View style={{flexDirection:'row',alignItems:'center',padding:14,paddingHorizontal:16,borderBottomWidth:1,borderBottomColor:th.bdr}}><TouchableOpacity onPress={()=>navigation.goBack()} style={{padding:8,borderRadius:10,borderWidth:1,borderColor:th.bdr,backgroundColor:th.cBg}}><Text style={{color:th.tx}}>‹ {T.home}</Text></TouchableOpacity><Text style={{flex:1,textAlign:'right',fontWeight:'600',fontSize:15,color:th.tx}}>{T.settings}</Text></View>
    <View style={{padding:16}}>
      <View style={{backgroundColor:th.cBg,borderRadius:16,padding:20,marginBottom:14,borderWidth:1,borderColor:th.bdr}}><Text style={{fontWeight:'700',color:th.tx,marginBottom:14}}>{T.language}</Text><View style={{flexDirection:'row',gap:10}}>{[['vi','🇻🇳 Tiếng Việt'],['en','🇬🇧 English']].map(([c,n])=>(<TouchableOpacity key={c} onPress={()=>setLang(c)} style={{flex:1,padding:12,borderRadius:12,borderWidth:2,borderColor:lang===c?th.ac:th.bdr,backgroundColor:lang===c?th.acL:'transparent',alignItems:'center'}}><Text style={{color:th.tx,fontWeight:'600',fontSize:14}}>{n}</Text></TouchableOpacity>))}</View></View>
      <View style={{backgroundColor:th.cBg,borderRadius:16,padding:20,borderWidth:1,borderColor:th.bdr}}><Text style={{fontWeight:'700',color:th.tx,marginBottom:14}}>{T.theme}</Text><View style={{flexDirection:'row',gap:10}}>{[[false,'☀️ '+T.light],[true,'🌙 '+T.dark]].map(([v,n])=>(<TouchableOpacity key={String(v)} onPress={()=>setIsDark(v)} style={{flex:1,padding:12,borderRadius:12,borderWidth:2,borderColor:isDark===v?th.ac:th.bdr,backgroundColor:isDark===v?th.acL:'transparent',alignItems:'center'}}><Text style={{color:th.tx,fontWeight:'600',fontSize:14}}>{n}</Text></TouchableOpacity>))}</View></View></View></SafeAreaView>);
}

function InputScreen({route,navigation}){const{modelId}=route.params;const{isDark,T}=useApp();const th=useTheme();
  const[d1s,sd1s]=useState({y:2008,m:10,d:2});const[d1e,sd1e]=useState({y:2008,m:10,d:14});const[d1p,sd1p]=useState({y:2008,m:10,d:15});
  const[v1o,s1o]=useState('10482');const[v1c,s1c]=useState('9310');const[vN,sN]=useState('30');
  const[v2m,s2m]=useState('147.8');const[v2k,s2k]=useState('1460');const[v2a,s2a]=useState('0.045');
  const[v3a,s3a]=useState('1220');const[v3b,s3b]=useState('5700');const[v3c,s3c]=useState('3480');const[v3d,s3d]=useState('4000');
  const[v4a,s4a]=useState('12.032915');const[v4b,s4b]=useState('13.643233');const[v4t,s4t]=useState('1');
  const [loading, setLoading] = useState(false);
  const md=mdDefs.find(m=>m.id===modelId);const names=[T.m1,T.m2,T.m3,T.m4];
  const fmt=v=>`${String(v.d).padStart(2,'0')}/${String(v.m).padStart(2,'0')}/${v.y}`;
  const F=({label,icon,value,onChangeText})=>(<View style={{marginBottom:14}}><Text style={{fontSize:13,color:th.ts,fontWeight:'500',marginBottom:6}}>{label}</Text><View style={{flexDirection:'row',alignItems:'center',borderRadius:12,borderWidth:1.5,borderColor:th.bdr,backgroundColor:th.iBg,paddingHorizontal:14}}><Text style={{fontSize:16,marginRight:10,opacity:0.4}}>{icon}</Text><TextInput value={value} onChangeText={onChangeText} keyboardType="numeric" style={{flex:1,paddingVertical:14,fontSize:15,color:th.tx}} placeholderTextColor={th.ts}/></View></View>);
  const toDayNumber = (d) => {
  return d.d;
};
const toTimestamp = (d) => {
  return new Date(d.y, d.m - 1, d.d).getTime();
};
  

  const doSolve = async () => {
    setLoading(true);
  try {
    const d1pTimestamp = toTimestamp(d1p);
    const payload = {
  modelId,
  input: {
    ...(modelId === 1 && { 
      v1o: Number(v1o),
      v1c: Number(v1c),
      dD: [2,3,6,7,8,9,10,13,14],
      dC: [10.482,10.325,9.955,9.447,9.258,8.579,8.451,9.387,9.310],
      d1p: toDayNumber(d1p),
      predictTimestamp: d1pTimestamp
    }),

    ...(modelId === 2 && { 
      v2m: Number(v2m),
      v2k: Number(v2k),
      v2a: Number(v2a)
    }),

    ...(modelId === 3 && { 
      v3a: Number(v3a),
      v3b: Number(v3b),
      v3c: Number(v3c),
      v3d: Number(v3d)
    }),

    ...(modelId === 4 && { 
      v4a: Number(v4a),
      v4b: Number(v4b),
      v4t: Number(v4t)
    }),

    vN: Number(vN)
  }
};
    console.log("📤 INPUT:", {
  modelId,
  input: {
    v1o, v1c, d1s, d1e, d1p, vN
  }
});
    const response = await fetch('http://192.168.1.145:3000/solve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("Server error");

    const res = await response.json();

    navigation.navigate('Result', { results: res });

  } catch (err) {
  alert("Không kết nối được server");
  } finally {
  setLoading(false);
}
};
  return(<SafeAreaView style={{flex:1,backgroundColor:th.bg}}>
    <View style={{flexDirection:'row',alignItems:'center',padding:14,paddingHorizontal:16,borderBottomWidth:1,borderBottomColor:th.bdr}}><TouchableOpacity onPress={()=>navigation.goBack()} style={{padding:8,borderRadius:10,borderWidth:1,borderColor:th.bdr,backgroundColor:th.cBg}}><Text style={{color:th.tx}}>‹ {T.home}</Text></TouchableOpacity><Text style={{flex:1,textAlign:'right',fontWeight:'600',fontSize:15,color:th.tx}}>{T.inputTitle}</Text></View>
    <ScrollView contentContainerStyle={{padding:16}}>
      <View style={{backgroundColor:th.acL,borderRadius:16,padding:16,flexDirection:'row',alignItems:'center',gap:14,marginBottom:8,borderWidth:1,borderColor:th.ac+'30'}}><View style={{width:48,height:48,borderRadius:12,backgroundColor:'#fff',alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:22}}>{md.icon}</Text></View><View><Text style={{fontWeight:'700',fontSize:16,color:th.tx}}>{names[modelId-1]}</Text><Text style={{fontSize:13,color:th.ac,fontWeight:'600'}}>FDM • SM • FEM</Text></View></View>
      {modelId===1&&(<><Text style={{fontSize:13,fontWeight:'700',color:th.ac,letterSpacing:0.8,marginBottom:16,marginTop:22}}>{T.histData}</Text>
        <CalPick label={T.startDate} value={d1s} onChange={sd1s}/><CalPick label={T.endDate} value={d1e} onChange={sd1e}/>
        <View style={{flexDirection:'row',gap:12}}><View style={{flex:1}}><F label={T.openPrice} icon="💰" value={v1o} onChangeText={s1o}/></View><View style={{flex:1}}><F label={T.closePrice} icon="💰" value={v1c} onChangeText={s1c}/></View></View>
        <Text style={{fontSize:13,fontWeight:'700',color:th.ac,letterSpacing:0.8,marginBottom:16,marginTop:22}}>{T.predict}</Text>
        <CalPick label={T.predictDate} value={d1p} onChange={sd1p}/></>)}
      {modelId===2&&(<><Text style={{fontSize:13,fontWeight:'700',color:th.ac,letterSpacing:0.8,marginBottom:16,marginTop:22}}>{T.mechParams}</Text><F label={T.mass} icon="⚖" value={v2m} onChangeText={s2m}/><F label={T.spring} icon="🔩" value={v2k} onChangeText={s2k}/><F label={T.amp} icon="↕" value={v2a} onChangeText={s2a}/></>)}
      {modelId===3&&(<><Text style={{fontSize:13,fontWeight:'700',color:th.ac,letterSpacing:0.8,marginBottom:16,marginTop:22}}>{T.heatParams}</Text><View style={{flexDirection:'row',gap:12}}><View style={{flex:1}}><F label={T.r1} icon="◉" value={v3a} onChangeText={s3a}/></View><View style={{flex:1}}><F label={T.t1} icon="🌡" value={v3b} onChangeText={s3b}/></View></View><View style={{flexDirection:'row',gap:12}}><View style={{flex:1}}><F label={T.r2} icon="◎" value={v3c} onChangeText={s3c}/></View><View style={{flex:1}}><F label={T.t2} icon="🌡" value={v3d} onChangeText={s3d}/></View></View></>)}
      {modelId===4&&(<><Text style={{fontSize:13,fontWeight:'700',color:th.ac,letterSpacing:0.8,marginBottom:16,marginTop:22}}>{T.econParams}</Text><F label={T.k0} icon="📊" value={v4a} onChangeText={s4a}/><F label={T.kT} icon="🎯" value={v4b} onChangeText={s4b}/><F label={T.tEnd} icon="⏱" value={v4t} onChangeText={s4t}/></>)}
      <Text style={{fontSize:13,fontWeight:'700',color:th.ac,letterSpacing:0.8,marginBottom:16,marginTop:22}}>{T.numParams}</Text>
      <F label={`${T.gridN} ${T.gridHint}`} icon="⚡" value={vN} onChangeText={sN}/>
      <TouchableOpacity onPress={doSolve} activeOpacity={0.8} style={{backgroundColor:th.hBg,borderRadius:14,padding:16,alignItems:'center',flexDirection:'row',justifyContent:'center',gap:10,marginTop:10}}><Text style={{color:'#fff',fontSize:16,fontWeight:'600'}}>📊 {T.solve}</Text></TouchableOpacity>
      <View style={{height:40}}/></ScrollView></SafeAreaView>);
}

function ResultScreen({route,navigation}){const{results:res}=route.params;const{isDark,T}=useApp();const th=useTheme();
  console.log("📱 RES:", res);
  const{fdm,sm,fem,tEx,yEx,eF,eS,eE}=res;const xLb=res.mdl===3?'r (km)':'t';
  const ds=[{x:tEx,y:yEx,color:'#94a3b8',thick:2.5,dash:true,label:T.exact},{x:fdm.t,y:fdm.y,color:'#2563eb',dots:true,thick:2,label:'FDM'},{x:sm.t,y:sm.y,color:'#10b981',thick:2,label:'SM'},{x:fem.t,y:fem.y,color:'#f59e0b',thick:2,label:'FEM'}];
  const adv=res.mdl===1?T.adv1:res.mdl===2?T.adv2:res.mdl===3?T.adv3:T.adv4;
  return(<SafeAreaView style={{flex:1,backgroundColor:th.bg}}>
    <View style={{flexDirection:'row',alignItems:'center',padding:14,paddingHorizontal:16,borderBottomWidth:1,borderBottomColor:th.bdr}}><TouchableOpacity onPress={()=>navigation.goBack()} style={{padding:8,borderRadius:10,borderWidth:1,borderColor:th.bdr,backgroundColor:th.cBg}}><Text style={{color:th.tx}}>‹ {T.inputTitle}</Text></TouchableOpacity><Text style={{flex:1,textAlign:'right',fontWeight:'600',fontSize:15,color:th.tx}}>{T.resultTitle}</Text></View>
    <ScrollView contentContainerStyle={{padding:16}}>
      <View style={{backgroundColor:th.cBg,borderRadius:16,padding:20,marginBottom:14,borderWidth:1,borderColor:th.bdr}}><Text style={{fontWeight:'700',fontSize:16,color:th.tx,marginBottom:2}}>{T.chartTitle}</Text><Text style={{fontSize:12,color:th.ts,marginBottom:10}}>{T.chartSub}</Text><SChart datasets={ds} xLabel={xLb} isDark={isDark}/></View>
      {res.mdl===1&&(<View style={{backgroundColor:th.cBg,borderRadius:16,padding:20,marginBottom:14,borderWidth:1,borderColor:th.bdr,borderLeftWidth:4,borderLeftColor:'#10b981',alignItems:'center'}}><Text style={{fontSize:13,color:th.ts}}>{T.predPrice} {res.predStr}</Text><Text style={{fontSize:28,fontWeight:'800',color:th.ac,marginTop:6}}>{res.predicted.toFixed(3)}</Text><Text style={{fontSize:12,color:th.ts,marginTop:4}}>{T.omega}: {res.w.toFixed(4)}</Text></View>)}
      {res.mdl===4&&(<View style={{backgroundColor:th.cBg,borderRadius:16,padding:20,marginBottom:14,borderWidth:1,borderColor:th.bdr,alignItems:'center'}}><Text style={{fontSize:14,color:th.ts,marginBottom:4}}>{T.optRate}</Text><Text style={{fontSize:24,fontWeight:'800',color:th.ac}}>{((res.KT-res.K0)/res.Te).toFixed(6)}</Text><Text style={{fontSize:13,color:th.ts}}>tỷ đồng/năm</Text></View>)}
      <View style={{backgroundColor:th.cBg,borderRadius:16,padding:20,marginBottom:14,borderWidth:1,borderColor:th.bdr}}><Text style={{fontWeight:'700',fontSize:16,color:th.tx,marginBottom:14}}>{T.errTable}</Text>
        {[{n:'FDM',e:eF,c:'#2563eb'},{n:'SM',e:eS,c:'#10b981'},{n:'FEM',e:eE,c:'#f59e0b'}].map(m=>(<View key={m.n} style={{flexDirection:'row',justifyContent:'space-between',paddingVertical:12,borderBottomWidth:1,borderBottomColor:th.bdr}}><View style={{flexDirection:'row',alignItems:'center',gap:8}}><View style={{width:10,height:10,borderRadius:5,backgroundColor:m.c}}/><Text style={{color:th.tx,fontSize:14}}>{m.n}</Text></View><Text style={{fontWeight:'600',color:th.tx,fontSize:13}}>{m.e.toExponential(4)}</Text></View>))}</View>
      <View style={{backgroundColor:th.cBg,borderRadius:16,padding:20,marginBottom:14,borderWidth:1,borderColor:th.bdr,borderLeftWidth:4,borderLeftColor:th.ac}}><Text style={{fontWeight:'700',fontSize:16,color:th.tx,marginBottom:8}}>💡 {T.advice}</Text><Text style={{fontSize:14,color:th.ts,lineHeight:22}}>{adv}</Text></View>
      <View style={{height:40}}/></ScrollView></SafeAreaView>);
}

// ═══════════════ APP ═══════════════
const Stack=createNativeStackNavigator();
export default function App(){return(<Prov><NavigationContainer><Stack.Navigator screenOptions={{headerShown:false}}><Stack.Screen name="Home" component={HomeScreen}/><Stack.Screen name="Settings" component={SettingsScreen}/><Stack.Screen name="Input" component={InputScreen}/><Stack.Screen name="Result" component={ResultScreen}/></Stack.Navigator></NavigationContainer></Prov>);}