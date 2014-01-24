function urlencode(e){var t=[];for(var n in e)t.push(encodeURIComponent(n)+"="+encodeURIComponent(e[n]));return t.join("&")}function ajax(e){function t(t,n){n||(n=null),t.error?"function"==typeof e.error&&e.error(t.error,t,n):"function"==typeof e.success&&e.success(t.result,t,n),"function"==typeof e.complete&&e.complete(t,n)}if(e.method=e.method||"GET",e.url){var n=e.url;e.query&&(n="object"==typeof e.query?n+"?"+urlencode(e.query):n+"?"+e.query),e.type=e.type||"json";var r=new XMLHttpRequest;if(r.open(e.method,n,!0),r.onreadystatechange=function(){if(4==r.readyState){var e={status:500,error:"The server is currently unavailable.",result:null};try{e=JSON.parse(r.responseText)}catch(n){}t(e,r)}},"json"===e.type&&"setRequestHeader"in r&&r.setRequestHeader("Accept","application/json"),e.body){var o=e.body;"object"==typeof o&&("overrideMimeType"in r&&r.overrideMimeType("application/x-www-form-urlencoded"),"setRequestHeader"in r&&r.setRequestHeader("Content-Type","application/x-www-form-urlencoded"),o=urlencode(o)),r.send(o)}else r.send()}}function workerMessage(e){var t=e.data;switch(t.type){case"rate":this.rateHistory.unshift(t.rate),this.rateHistory.length>5&&this.rateHistory.pop(),rate.innerHTML="<strong>"+Math.floor(workers.totalHashRate())+"</strong><span>Hashes / Second</span>";break;case"submit":delete t.type,ajax({method:"post",url:"/api/submit",body:t})}}function updateBalance(){ajax({url:"/api/balance",success:function(e){e=Math.floor(1e3*e)/1e3,document.getElementById("balance-amount").innerHTML=e}})}function notify(e,t){var n=document.createElement("div"),r="notice"+Math.random().toString().substr(2);n.id=r,n.className="notice"+(t?" "+t:""),n.innerHTML=e,document.getElementById("header").appendChild(n),setTimeout(function(){n.parentNode.removeChild(n)},5e3)}function withdraw(){return ajax({url:"/api/withdraw",success:function(e){notify(e,"success")},error:function(e){notify(e,"error")}}),!1}var workers=[],rate=document.getElementById("rate");workers.totalHashRate=function(){var e,t,n,r,o,s=0;for(n=this.length,e=0;n>e;e+=1)if(r=this[e].rateHistory.length,r>0){for(o=0,t=0;r>t;t+=1)o+=this[e].rateHistory[t];s+=o/r}return s},workers.addWorker=function(){var e=new Worker("/public/worker.js");e.rateHistory=[],e.addEventListener("message",workerMessage,!1),workers.push(e),workers.getwork(),document.getElementById("intensity-label").innerHTML=workers.length,1==workers.length&&(rate.innerHTML="<strong>-</strong><span>Warming Up</span>")},workers.removeWorker=function(){workers.pop().terminate(),document.getElementById("intensity-label").innerHTML=workers.length,0==workers.length&&(rate.innerHTML="<strong>-</strong><span>Not Mining</span>")},workers.sendwork=function(e){for(var t=Math.floor(4294967295/this.length),n=0,r=0;r<this.length;r+=1)this[r].postMessage({type:"work",data:e,nonce:[n,n+=t]})},workers.pollwork=function(){ajax({url:"/api/work",query:{poll:"true"},success:function(e){return e?(this.sendwork(e),setTimeout(this.pollwork.bind(this),1e4),void 0):setTimeout(this.pollwork.bind(this),250)}.bind(this),error:function(){setTimeout(this.pollwork.bind(this),15e3)}.bind(this)})},workers.getwork=function(){ajax({url:"/api/work",success:function(e){e&&this.sendwork(e),this.pollwork()}.bind(this),error:function(){setTimeout(this.getwork.bind(this),5e3)}.bind(this)})};var doButtons=!1;if("undefined"==typeof Worker)notify("Mining is not supported in this browser. Please update to the latest version."),ga("send","event","nosupport","noworker",{nonInteraction:1});else if("undefined"==typeof Uint8Array)notify("Mining is not supported in this browser. Please update to the latest version."),ga("send","event","nosupport","notypedarrays",{nonInteraction:1});else if(/(iphone|ipad|android|ios)/i.test(window.navigator.userAgent)){var btn=document.getElementById("start-btn");btn.style.display="block",btn.onclick=function(){confirm("Mining on mobile may have unexpected side effects, including battery usage and heat production. Please use carefully!")&&(btn.style.display="none",workers.addWorker(),document.getElementById("intensity").style.display="block")},doButtons=!0}else workers.addWorker(),document.getElementById("intensity").style.display="block",doButtons=!0;doButtons&&(document.getElementById("up-btn").onclick=function(){workers.length<10?workers.addWorker():notify("Ten is the maxiumum intensity.")},document.getElementById("down-btn").onclick=function(){workers.length>0&&workers.removeWorker()}),updateBalance(),setInterval(updateBalance,6e4),document.getElementById("email-form").addEventListener("submit",function(e){"preventDefault"in e&&e.preventDefault();var t=document.getElementById("email").value;return ajax({method:"post",url:"/api/email",body:{email:t},success:function(){notify("Your email has been saved.","success"),updateBalance()},error:function(e){notify(e,"error")}}),!1},!1),setInterval(function(){var e=Math.floor(workers.totalHashRate());e>1&&ga("send","event","hashrate","js",workers.length,e)},12e4);