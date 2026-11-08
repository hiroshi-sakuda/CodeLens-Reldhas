import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server/index.mjs';

test('local opt-in creates a session without sending secrets to the browser', async t => {
  const env = { AI_PROVIDER: 'gemini', GEMINI_API_KEY: 'secret-api-key', REVIEW_PASSWORD: 'secret-password-long', LOCAL_AUTO_LOGIN: 'true' };
  const app = createApp({ env }); await new Promise(r=>app.listen(0,'127.0.0.1',r));
  t.after(()=>new Promise(r=>{app.close(r);app.closeAllConnections();}));
  const base = `http://127.0.0.1:${app.address().port}`;
  const status = await (await fetch(base+'/api/status')).json(); assert.equal(status.localAutoLogin,true); assert.doesNotMatch(JSON.stringify(status),/secret-/);
  const login = await fetch(base+'/api/session',{method:'POST',headers:{Origin:'http://127.0.0.1:5173','Content-Type':'application/json'},body:'{}'});
  assert.equal(login.status,200); assert.match(login.headers.get('set-cookie'),/HttpOnly; SameSite=Strict/); assert.doesNotMatch(await login.text(),/secret-/);
  const forged = await fetch(base+'/api/session',{method:'POST',headers:{Origin:'http://127.0.0.1:5173','Content-Type':'application/json','X-Forwarded-For':'203.0.113.1'},body:'{}'});
  assert.equal(forged.status,401);
});

test('production, remote origin and missing opt-in retain password authentication', async t => {
  for(const overrides of [{LOCAL_AUTO_LOGIN:'false'},{APP_ORIGIN:'https://codelens.example'},{NODE_ENV:'production',APP_ORIGIN:'https://codelens.example'}]){
    const env={AI_PROVIDER:'gemini',GEMINI_API_KEY:'secret-api-key',REVIEW_PASSWORD:'secret-password-long',LOCAL_AUTO_LOGIN:'true',...overrides};
    const app=createApp({env});await new Promise(r=>app.listen(0,'127.0.0.1',r));
    try{
      const base=`http://127.0.0.1:${app.address().port}`;
      assert.equal((await (await fetch(base+'/api/status')).json()).localAutoLogin,false);
      const response=await fetch(base+'/api/session',{method:'POST',headers:{Origin:env.APP_ORIGIN||'http://127.0.0.1:5173','Content-Type':'application/json'},body:'{}'});
      assert.equal(response.status,401);
    }finally{await new Promise(r=>{app.close(r);app.closeAllConnections();});}
  }
});
