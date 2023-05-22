"use strict";(self["webpackChunkschat"]=self["webpackChunkschat"]||[]).push([[354],{8354:(e,l,t)=>{t.r(l),t.d(l,{default:()=>L});t(71);var a=t(3673),i=t(2942);const n={key:1,class:"text-green"},o=(0,a._)("br",null,null,-1),s=(0,a.Uk)("Login to server"),c=(0,a.Uk)("New account"),r=(0,a.Uk)("Register & download keys"),d=(0,a.Uk)("Back"),y=(0,a._)("br",null,null,-1),h={href:"#",style:{display:"none"},ref:"pgpLinkFile"};function u(e,l,t,u,k,m){const p=(0,a.up)("q-input"),g=(0,a.up)("q-card-section"),w=(0,a.up)("q-btn"),f=(0,a.up)("q-card-actions"),K=(0,a.up)("q-card"),b=(0,a.up)("q-page");return(0,a.wg)(),(0,a.j4)(b,{class:"flex flex-center"},{default:(0,a.w5)((()=>[(0,a.Wm)(K,{dark:"",bordered:""},{default:(0,a.w5)((()=>[e.loginMode?((0,a.wg)(),(0,a.j4)(g,{key:0},{default:(0,a.w5)((()=>[0===e.filename.length?((0,a.wg)(),(0,a.iD)("div",{key:0,class:"pgp-input",onClick:l[0]||(l[0]=(...e)=>m.selectFile&&m.selectFile(...e))},"Click here to select key file.")):((0,a.wg)(),(0,a.iD)("div",n,[o,(0,a.Wm)(p,{filled:"",dark:"",readonly:"",modelValue:e.nickname,"onUpdate:modelValue":l[1]||(l[1]=l=>e.nickname=l),label:"Nickname",class:"full-width"},null,8,["modelValue"]),(0,a.Wm)(p,{filled:"",dark:"",readonly:"",modelValue:e.loginKey,"onUpdate:modelValue":l[2]||(l[2]=l=>e.loginKey=l),label:"Login key",class:"full-width"},null,8,["modelValue"]),(0,a.Wm)(p,{filled:"",dark:"",readonly:"",modelValue:e.publicKey,"onUpdate:modelValue":l[3]||(l[3]=l=>e.publicKey=l),label:"Public key",class:"full-width"},null,8,["modelValue"]),(0,a.Wm)(p,{filled:"",dark:"",readonly:"",modelValue:e.privateKey,"onUpdate:modelValue":l[4]||(l[4]=l=>e.privateKey=l),label:"Private key",class:"full-width"},null,8,["modelValue"]),e.filename.length>0?((0,a.wg)(),(0,a.iD)("div",{key:0,class:"pgp-input-small",onClick:l[5]||(l[5]=(...e)=>m.selectFile&&m.selectFile(...e))},"File: "+(0,i.zw)(e.filename),1)):(0,a.kq)("",!0)]))])),_:1})):((0,a.wg)(),(0,a.j4)(g,{key:1,class:"login-dialog"},{default:(0,a.w5)((()=>[(0,a.Wm)(p,{label:"Nickname",class:"full-width",dark:"",filled:"",name:"nickname",color:"yellow",modelValue:e.nickname_newacc,"onUpdate:modelValue":l[6]||(l[6]=l=>e.nickname_newacc=l),maxlength:"15",rules:[e=>e.match(/^[a-zA-Z0-9]{5,15}$/)||"Only A-Z, a-z, 0-9 chars allowed, min len - 5"]},null,8,["modelValue","rules"]),(0,a.Wm)(p,{filled:"",dark:"",readonly:"",modelValue:e.new_loginKey,"onUpdate:modelValue":l[7]||(l[7]=l=>e.new_loginKey=l),label:"Login key",class:"full-width"},null,8,["modelValue"]),(0,a.Wm)(p,{filled:"",dark:"",readonly:"",modelValue:e.new_publicKey,"onUpdate:modelValue":l[8]||(l[8]=l=>e.new_publicKey=l),label:"Public key",class:"full-width"},null,8,["modelValue"]),(0,a.Wm)(p,{filled:"",dark:"",readonly:"",modelValue:e.new_privateKey,"onUpdate:modelValue":l[9]||(l[9]=l=>e.new_privateKey=l),label:"Private key",class:"full-width"},null,8,["modelValue"])])),_:1})),(0,a.Wm)(f,{align:"center"},{default:(0,a.w5)((()=>[e.loginKey.length>0&&e.loginMode?((0,a.wg)(),(0,a.j4)(w,{key:0,flat:"",style:{"min-width":"150px"},onClick:m.tryAuth,"text-color":"yellow"},{default:(0,a.w5)((()=>[s])),_:1},8,["onClick"])):(0,a.kq)("",!0),e.nickname_newacc.length<5?((0,a.wg)(),(0,a.j4)(w,{key:1,flat:"",style:{"min-width":"150px"},onClick:m.generateNewAccount,"text-color":"yellow"},{default:(0,a.w5)((()=>[c])),_:1},8,["onClick"])):(0,a.kq)("",!0),e.nickname_newacc.length>=5?((0,a.wg)(),(0,a.j4)(w,{key:2,flat:"",style:{"min-width":"150px"},onClick:m.downloadAndLogin,"text-color":"yellow"},{default:(0,a.w5)((()=>[r])),_:1},8,["onClick"])):(0,a.kq)("",!0),e.loginMode?(0,a.kq)("",!0):((0,a.wg)(),(0,a.j4)(w,{key:3,flat:"",style:{"min-width":"150px"},onClick:l[10]||(l[10]=l=>{e.loginMode=!0,e.nickname_newacc=""}),"text-color":"yellow"},{default:(0,a.w5)((()=>[d])),_:1})),y])),_:1})])),_:1}),(0,a._)("input",{type:"file",style:{display:"none"},ref:"pgpfile",onChange:l[11]||(l[11]=(...e)=>m.readKeyFile&&m.readKeyFile(...e))},null,544),(0,a._)("a",h,null,512)])),_:1})}t(7965),t(6016);var k=t(4783),m=t(52),p=t.n(m),g=t(4854),w=t(8825);const f={name:"Login",data:()=>({loginMode:!0,nickname:"",nickname_newacc:"",useLocalStorage:1,filename:"",publicKey:"",privateKey:"",new_publicKey:"",new_privateKey:"",loginKey:"",new_loginKey:"",keyData:{}}),mounted(){if(this.$store.commit("global/windowText","Login"),localStorage.getItem("key")){const e=JSON.parse(localStorage.getItem("key"));console.log("keydata=",e),this.extractKeyData(e)}},setup(){const e=(0,w.Z)();return{showNotify(l){e.notify({message:l,color:"red"})}}},methods:{makeId(e){let l="";const t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",a=t.length;for(let i=0;i<e;i++)l+=t.charAt(Math.floor(Math.random()*a));return l},generateNewAccount(){this.loginMode=!1,this.nickname_newacc="";const e=(0,k.Yp)();this.new_loginKey=this.makeId(64),this.new_publicKey=e.publicKey,this.new_privateKey=e.secretKey},downloadAndLogin(){p().post("/reg",{nickname:this.nickname_newacc,key:this.new_loginKey}).then((e=>{if(1===e.data.result){const e=(0,k.Yp)(),l=(e.publicKey,e.secretKey,{publicKey:this.new_publicKey,privateKey:this.new_privateKey,nickname:this.nickname_newacc,loginKey:this.new_loginKey}),t=btoa(JSON.stringify(l)),a=new Blob([t],{type:"octet/stream"});this.$refs.pgpLinkFile.href=window.URL.createObjectURL(a),this.$refs.pgpLinkFile.download="schat_"+this.nickname_newacc+".key",this.$refs.pgpLinkFile.click(),this.keyData=l,this.nickname=this.keyData.nickname,this.publicKey=this.keyData.publicKey,this.privateKey=this.keyData.privateKey,this.loginKey=this.keyData.loginKey,this.tryAuth()}else this.showNotify(e.data.data)}))},toBase64(e){return btoa(String.fromCharCode.apply(null,e))},fromBase64(e){return atob(e).split("").map((function(e){return e.charCodeAt(0)}))},selectFile(){this.$refs.pgpfile.click()},readKeyFile(){const e=this.$refs.pgpfile.files[0],l=new FileReader;l.onload=()=>{const t=l.result;try{const l=JSON.parse(atob(t));this.filename=e.name,this.extractKeyData(l)}catch{this.showNotify("Invalid key file."),this.filename="",this.$refs.pgpfile.files[0]=null}},l.readAsText(e)},tryAuth(){const e=g.Z.getInstance();this.useLocalStorage&&localStorage.setItem("key",JSON.stringify(this.keyData)),e.connect().then((()=>{e.callMethodAsync("authorize",{nickname:this.nickname,loginKey:this.loginKey,publicKey:this.publicKey}).then((l=>{this.$store.commit("global/setNickname",this.nickname),this.$store.commit("global/setKeyData",this.keyData),this.$store.commit("global/setLoggedIn",!0),this.$store.commit("global/setRole",l.data.role),void 0===this.$route.params.invite?this.$router.push({path:"/new"}):e.callMethodAsync("joinByLink",{link:this.$route.params.invite}).then((e=>{this.$router.push({path:"/room/"+e.data.uuid})})).catch((e=>{this.showNotify(e.data),this.$router.push({path:"/new"})}))})).catch((e=>{var l;localStorage.removeItem("key"),console.log(e),this.showNotify(null!==(l=e.data)&&void 0!==l?l:e)}))}))},extractKeyData(e){if(console.log(e),!(e.hasOwnProperty("nickname")&&e.hasOwnProperty("publicKey")&&e.hasOwnProperty("privateKey")&&e.hasOwnProperty("loginKey")))return this.showNotify("Invalid keyfile."),!1;this.keyData=e,this.nickname=this.keyData.nickname,this.publicKey=this.keyData.publicKey,this.privateKey=this.keyData.privateKey,this.loginKey=this.keyData.loginKey}}};var K=t(4379),b=t(151),_=t(5589),v=t(4842),V=t(9367),D=t(8240),C=t(7518),x=t.n(C);f.render=u;const L=f;x()(f,"components",{QPage:K.Z,QCard:b.Z,QCardSection:_.Z,QInput:v.Z,QCardActions:V.Z,QBtn:D.Z})}}]);