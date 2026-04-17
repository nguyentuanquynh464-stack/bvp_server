const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

function linspace(a,b,n){const r=[];for(let i=0;i<n;i++)r.push(a+(i*(b-a))/(n-1));return r;}
function solveGen(A,bv,n){const M=A.map((r,i)=>[...r,bv[i]]);for(let c=0;c<n;c++){let mx=c;for(let r=c+1;r<n;r++)if(Math.abs(M[r][c])>Math.abs(M[mx][c]))mx=r;[M[c],M[mx]]=[M[mx],M[c]];if(Math.abs(M[c][c])<1e-15)continue;for(let r=c+1;r<n;r++){const f=M[r][c]/M[c][c];for(let j=c;j<=n;j++)M[r][j]-=f*M[c][j];}}const x=new Float64Array(n);for(let i=n-1;i>=0;i--){let s=M[i][n];for(let j=i+1;j<n;j++)s-=M[i][j]*x[j];x[i]=s/M[i][i];}return Array.from(x);}
function gFDM(a,b,al,bt,N,pF,qF,rF){const h=(b-a)/(N-1),t=linspace(a,b,N),n=N-2;const A=Array.from({length:n},()=>new Float64Array(n)),bv=new Float64Array(n);for(let i=1;i<N-1;i++){const ro=i-1,ti=t[i];if(ro>0)A[ro][ro-1]=-1-(h/2)*rF(ti);A[ro][ro]=2+h*h*qF(ti);if(ro<n-1)A[ro][ro+1]=-(1-(h/2)*rF(ti));let rhs=-h*h*pF(ti);if(i===1)rhs+=(1+(h/2)*rF(ti))*al;if(i===N-2)rhs+=(1-(h/2)*rF(ti))*bt;bv[ro]=rhs;}return{t,y:[al,...solveGen(A.map(r=>Array.from(r)),Array.from(bv),n),bt]};}
function gSM(a,b,al,bt,N,fS,s1,s2){const h=(b-a)/(N-1),t=linspace(a,b,N);function rk4(s){let w=[al,s];const ys=[al];for(let k=0;k<N-1;k++){const tk=t[k],K1=fS(tk,w),K2=fS(tk+h/2,[w[0]+h/2*K1[0],w[1]+h/2*K1[1]]),K3=fS(tk+h/2,[w[0]+h/2*K2[0],w[1]+h/2*K2[1]]),K4=fS(tk+h,[w[0]+h*K3[0],w[1]+h*K3[1]]);w=[w[0]+h/6*(K1[0]+2*K2[0]+2*K3[0]+K4[0]),w[1]+h/6*(K1[1]+2*K2[1]+2*K3[1]+K4[1])];ys.push(w[0]);}return ys;}const p1=rk4(s1)[N-1],p2=rk4(s2)[N-1];const s=Math.abs(p2-p1)<1e-15?s1:s1+((s2-s1)*(bt-p1))/(p2-p1);return{t,y:rk4(s)};}
function gFEM(a,b,al,bt,N,pF,qF,gF){const t=linspace(a,b,N),nq=100;const A=Array.from({length:N},()=>new Float64Array(N)),bv=new Float64Array(N);function trp(fn,xl,xr){const xs=linspace(xl,xr,nq+1);let s=0;for(let i=0;i<nq;i++)s+=(fn(xs[i])+fn(xs[i+1]))*((xr-xl)/nq/2);return s;}for(let i=0;i<N-1;i++){const xl=t[i],xr=t[i+1],he=xr-xl,p0=x=>(xr-x)/he,p1=x=>(x-xl)/he,d0=-1/he,d1=1/he;const kd=[[1/he,-1/he],[-1/he,1/he]];const ip0=trp(x=>pF(x)*p0(x),xl,xr),ip1=trp(x=>pF(x)*p1(x),xl,xr);const kp=[[-d0*ip0,-d1*ip0],[-d0*ip1,-d1*ip1]];const q00=trp(x=>qF(x)*p0(x)*p0(x),xl,xr),q01=trp(x=>qF(x)*p0(x)*p1(x),xl,xr),q10=trp(x=>qF(x)*p1(x)*p0(x),xl,xr),q11=trp(x=>qF(x)*p1(x)*p1(x),xl,xr);const kq=[[-q00,-q01],[-q10,-q11]];const g0=trp(x=>gF(x)*p0(x),xl,xr),g1=trp(x=>gF(x)*p1(x),xl,xr);for(let r=0;r<2;r++)for(let c=0;c<2;c++)A[i+r][i+c]+=kd[r][c]+kp[r][c]+kq[r][c];bv[i]+=-g0;bv[i+1]+=-g1;}for(let j=0;j<N;j++)A[0][j]=0;A[0][0]=1;bv[0]=al;for(let j=0;j<N;j++)A[N-1][j]=0;A[N-1][N-1]=1;bv[N-1]=bt;return{t,y:solveGen(A.map(r=>Array.from(r)),Array.from(bv),N)};}
function calcErr(ys,t,yE){return Math.max(...ys.map((v,i)=>Math.abs(v-yE(t[i]))));}
function solveM1(days,closes,predDay,N){const P=closes,len=P.length,mean=P.reduce((s,v)=>s+v,0)/len,ct=P.map(v=>v-mean);let maxP=0,bI=1;for(let fi=1;fi<=Math.floor(len/2);fi++){let re=0,im=0;for(let n=0;n<len;n++){re+=ct[n]*Math.cos(2*Math.PI*fi*n/len);im-=ct[n]*Math.sin(2*Math.PI*fi*n/len);}const pw=re*re+im*im;if(pw>maxP){maxP=pw;bI=fi;}}const w=2*Math.PI*Math.abs(bI/len);const a=days[0],bv=days[days.length-1],al=closes[0],bt=closes[closes.length-1];const det=Math.cos(w*a)*Math.sin(w*bv)-Math.cos(w*bv)*Math.sin(w*a);let Ac,Bc;if(Math.abs(det)<1e-12){Ac=al;Bc=0;}else{Ac=(al*Math.sin(w*bv)-bt*Math.sin(w*a))/det;Bc=(-al*Math.cos(w*bv)+bt*Math.cos(w*a))/det;}const yE=t=>Ac*Math.cos(w*t)+Bc*Math.sin(w*t);const fdm=gFDM(a,bv,al,bt,N,()=>0,()=>-w*w,()=>0);const sm=gSM(a,bv,al,bt,N,(t,y)=>[y[1],-w*w*y[0]],-al*5,al*5);const fem=gFEM(a,bv,al,bt,N,()=>0,()=>w*w,()=>0);const tEx=linspace(a,bv,300),yEx=tEx.map(yE);return{fdm,sm,fem,tEx,yEx,eF:calcErr(fdm.y,fdm.t,yE),eS:calcErr(sm.y,sm.t,yE),eE:calcErr(fem.y,fem.t,yE),predicted:yE(predDay),w};}
function solveM2(mV,kV,Aa,N){const a=0,bv=1,al=0,bt=0,w=Math.PI,yE=t=>Aa*Math.sin(w*t);const h=(bv-a)/(N-1),t=linspace(a,bv,N),n=N-2;const Am=Array.from({length:n},()=>new Float64Array(n)),bvv=new Float64Array(n);for(let i=1;i<N-1;i++){const r=i-1,bi=2+h*h*(-w*w);if(r>0)Am[r][r-1]=-1;Am[r][r]=bi;if(r<n-1)Am[r][r+1]=-1;let rhs=0;if(i===1)rhs+=al;if(i===N-2)rhs+=bt;bvv[r]=rhs;}const iM=Math.max(0,Math.min(n-1,Math.round(0.5/h)-1));for(let j=0;j<n;j++)Am[iM][j]=0;Am[iM][iM]=1;bvv[iM]=yE(t[iM+1]);const fdm={t,y:[al,...solveGen(Am.map(r=>Array.from(r)),Array.from(bvv),n),bt]};const s=Aa*w;let wk=[al,s];const sY=[al];for(let k=0;k<N-1;k++){const tk=t[k],f=(tt,y)=>[y[1],-w*w*y[0]],K1=f(tk,wk),K2=f(tk+h/2,[wk[0]+h/2*K1[0],wk[1]+h/2*K1[1]]),K3=f(tk+h/2,[wk[0]+h/2*K2[0],wk[1]+h/2*K2[1]]),K4=f(tk+h,[wk[0]+h*K3[0],wk[1]+h*K3[1]]);wk=[wk[0]+h/6*(K1[0]+2*K2[0]+2*K3[0]+K4[0]),wk[1]+h/6*(K1[1]+2*K2[1]+2*K3[1]+K4[1])];sY.push(wk[0]);}const sm={t,y:sY};const Af=Array.from({length:N},()=>new Float64Array(N)),bf=new Float64Array(N);function trp(fn,xl,xr){const xs=linspace(xl,xr,101);let sv=0;for(let i=0;i<100;i++)sv+=(fn(xs[i])+fn(xs[i+1]))*((xr-xl)/100/2);return sv;}for(let i=0;i<N-1;i++){const xl=t[i],xr=t[i+1],he=xr-xl,p0=x=>(xr-x)/he,p1=x=>(x-xl)/he;const kd=[[1/he,-1/he],[-1/he,1/he]],q00=trp(x=>w*w*p0(x)*p0(x),xl,xr),q01=trp(x=>w*w*p0(x)*p1(x),xl,xr),q10=trp(x=>w*w*p1(x)*p0(x),xl,xr),q11=trp(x=>w*w*p1(x)*p1(x),xl,xr);for(let r=0;r<2;r++)for(let c=0;c<2;c++)Af[i+r][i+c]+=kd[r][c]-[[q00,q01],[q10,q11]][r][c];}for(let j=0;j<N;j++)Af[0][j]=0;Af[0][0]=1;bf[0]=al;for(let j=0;j<N;j++)Af[N-1][j]=0;Af[N-1][N-1]=1;bf[N-1]=bt;const iMf=Math.round(0.5/h);for(let j=0;j<N;j++)Af[iMf][j]=0;Af[iMf][iMf]=1;bf[iMf]=Aa;const fem={t,y:solveGen(Af.map(r=>Array.from(r)),Array.from(bf),N)};const tEx=linspace(a,bv,200),yEx=tEx.map(yE);return{fdm,sm,fem,tEx,yEx,eF:calcErr(fdm.y,fdm.t,yE),eS:calcErr(sm.y,sm.t,yE),eE:calcErr(fem.y,fem.t,yE),yExact:yE,w,A_amp:Aa};}
function solveM3(r1,T1,r2,T2,N){const C1=(T1-T2)/(1/r1-1/r2),C2=T1-C1/r1,yE=r=>C1/r+C2;const fdm=gFDM(r1,r2,T1,T2,N,()=>0,()=>0,r=>2/r);const sm=gSM(r1,r2,T1,T2,N,(r,y)=>[y[1],-(2/r)*y[1]],-1,1);const fem=gFEM(r1,r2,T1,T2,N,r=>2/r,()=>0,()=>0);const tEx=linspace(r1,r2,200),yEx=tEx.map(yE);return{fdm,sm,fem,tEx,yEx,eF:calcErr(fdm.y,fdm.t,yE),eS:calcErr(sm.y,sm.t,yE),eE:calcErr(fem.y,fem.t,yE),yExact:yE};}
function solveM4(K0,KT,Te,N){const yE=t=>(KT-K0)*(t/Te)+K0;const fdm=gFDM(0,Te,K0,KT,N,()=>0,()=>0,()=>0);const sm=gSM(0,Te,K0,KT,N,(t,y)=>[y[1],0],0,2);const fem=gFEM(0,Te,K0,KT,N,()=>0,()=>0,()=>0);const tEx=linspace(0,Te,200),yEx=tEx.map(yE);return{fdm,sm,fem,tEx,yEx,eF:calcErr(fdm.y,fdm.t,yE),eS:calcErr(sm.y,sm.t,yE),eE:calcErr(fem.y,fem.t,yE),yExact:yE,K0,KT,Te};}
app.get('/', (req, res) => {
  res.send('Server is running 🚀');
});
app.post('/solve', (req, res) => {
  try {
    const { modelId, input } = req.body;

    let result;

    // 🔥 CHỌN MODEL

    if (modelId === 1) {
  const { v1o, dD, dC,predictTimestamp, d1p, vN } = input;

// scale giống app cũ
const sc = v1o / dC[0];
const closes = dC.map(v => v * sc);

const days = dD;

// chuẩn hóa ngày dự đoán
const predDay = d1p;

result = solveM1(days, closes, predDay, vN);

// format ngày
function numToDate(n) {
  const date = new Date(n);
  return date.toLocaleDateString("vi-VN");
}

result.predStr = numToDate(predictTimestamp);
}

    else if (modelId === 2) {
      const { v2m, v2k, v2a, vN } = input;
      result = solveM2(v2m, v2k, v2a, vN);
    }

    else if (modelId === 3) {
      const { v3a, v3b, v3c, v3d, vN } = input;
      result = solveM3(v3a, v3b, v3c, v3d, vN);
    }

    else if (modelId === 4) {
      const { v4a, v4b, v4t, vN } = input;
      result = solveM4(v4a, v4b, v4t, vN);
    }

    else {
      return res.status(400).json({ error: "Invalid modelId" });
    }
    res.json({
    mdl: modelId,
    ...result
    });

  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});
app.listen(3000, () => {
  console.log(`🚀 Server chạy tại http://localhost:3000`);
});