// Refactored Modern Standard Implementation (template-ready for Next.js extraction)
// Modules (inlined for single-file prototype): parallax, scrollLock, dialogs, toasts, lengthHints, progressDemo
(function(){
	const CFG = {
		PARALLAX:{ FACTOR_DEF:0.25, GAMMA_DEF:2, IDENTITY_DEF:50, EXTRA_OFFSET_DEF:32, MIN_GAMMA:1, MIN_IDENTITY:5, MAX_FACTOR:0.95 },
		TOAST:{ TIMEOUT:5000 },
		LENGTH:{ SOFT_DEF:120, HARD_DEF:160 }
	};

	/* Utility */
	const qs = (sel,root=document)=>root.querySelector(sel);
	const qsa = (sel,root=document)=>Array.from(root.querySelectorAll(sel));
	const setVar = (n,v)=>document.documentElement.style.setProperty(n,v);
	function measureFly(el){ if(!el) return 0; const m=el.querySelector('.fly__measured'); return (m||el).offsetHeight||0; }

	/* Dynamic spacing */
	const topFly = qs('.fly--top');
	const bottomFly = qs('.fly--bottom');
	function syncSpaces(){ if(topFly) setVar('--space-header', measureFly(topFly)+'px'); if(bottomFly) setVar('--space-footer', measureFly(bottomFly)+'px'); }
	window.addEventListener('resize', syncSpaces); syncSpaces();

	/* Parallax (freeze/resume) */
	const parallax = (function(){
		if(!topFly) return { freeze:()=>{}, resume:()=>{} };
		const factor = Math.min(Math.max(parseFloat(topFly.getAttribute('data-parallax-factor'))||CFG.PARALLAX.FACTOR_DEF,0), CFG.PARALLAX.MAX_FACTOR);
		const gamma = Math.max(parseFloat(topFly.getAttribute('data-parallax-gamma'))||CFG.PARALLAX.GAMMA_DEF, CFG.PARALLAX.MIN_GAMMA);
		const identDist = Math.max(parseFloat(topFly.getAttribute('data-parallax-identity-distance'))||CFG.PARALLAX.IDENTITY_DEF, CFG.PARALLAX.MIN_IDENTITY);
		const extraOffset = (()=>{ const v = parseFloat(topFly.getAttribute('data-parallax-extra-offset')); return Number.isFinite(v)? v : CFG.PARALLAX.EXTRA_OFFSET_DEF; })();
		let ticking=false; let active=true;
		function apply(){ if(!active) return; if(ticking) return; ticking=true; requestAnimationFrame(()=>{ const y=window.scrollY||0; const h=measureFly(topFly); const t = -Math.min(y*factor, h+extraOffset); const nonlinear = -Math.pow(-t/identDist, gamma)*identDist; topFly.style.transform = `translateY(${nonlinear}px)`; ticking=false; }); }
		window.addEventListener('scroll', apply, { passive:true }); apply();
		return { freeze:()=>{ active=false; }, resume:()=>{ if(!active){ active=true; apply(); } }, _apply:apply };
	})();
	window.parallax = parallax;

	/* Scroll Lock (root-centric) */
	const scrollLock = (function(){
		let depth=0;
		function measureScrollbar(){ return window.innerWidth - document.documentElement.clientWidth; }
		function lock(){ depth++; if(depth>1) return; const sw=measureScrollbar(); if(sw>0) setVar('--scrollbar-comp', sw+'px'); document.documentElement.classList.add('is-scroll-locked'); parallax.freeze(); }
		function unlock(){ if(depth===0) return; depth--; if(depth>0) return; document.documentElement.classList.remove('is-scroll-locked'); document.documentElement.style.removeProperty('--scrollbar-comp'); parallax.resume(); }
		return { lock, unlock, isLocked:()=>depth>0 };
	})();
	window.scrollLock = scrollLock;

		/* Dialog Manager (simplified) */
		const dialogManager = (function(){
			let lastFocus=null; let openCount=0; const openSet=new Set();
			function open(id, trigger){ const dlg= typeof id==='string'? qs(`#${id}`): id; if(!dlg || dlg.open) return; if(openCount===0){ lastFocus=document.activeElement; scrollLock.lock(); }
				dlg.addEventListener('close', onClose, { once:true }); dlg.showModal(); openSet.add(dlg); openCount++; focusFirst(dlg); dispatch('dialog:open',{ dialog:dlg }); }
			function onClose(e){ const dlg=e.target; if(openSet.has(dlg)){ openSet.delete(dlg); openCount=Math.max(0, openCount-1); if(openCount===0){ scrollLock.unlock(); if(lastFocus?.focus) setTimeout(()=>lastFocus.focus(),0); } dispatch('dialog:close',{ dialog:dlg }); } }
			function close(dlg){ const target = dlg || Array.from(openSet).pop(); if(target && target.open) target.close(); }
			function focusFirst(dlg){ const root = dlg.querySelector('[data-panel-root]')||dlg; const f = root.querySelector('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'); if(f) f.focus(); }
			function dispatch(name,detail){ document.dispatchEvent(new CustomEvent(name,{detail})); }
			document.addEventListener('click', e=>{ const openBtn=e.target.closest('[data-dialog-open]'); if(openBtn){ e.preventDefault(); open(openBtn.getAttribute('data-dialog-open'), openBtn); return; } const closeBtn=e.target.closest('[data-dialog-close]'); if(closeBtn){ e.preventDefault(); close(); return; } });
			window.addEventListener('keydown', e=>{ if(e.key==='Escape'){ close(); } });
			// Outside click (native dialog backdrop click -> no direct event; rely on pointerdown inside panel) optional skip
			return { open, close };
		})();
	window.dialogs = dialogManager;

	/* Toasts */
	const toastStack = qs('.fly-messages');
	function toast(opts){ if(!toastStack) return; const { title, message, variant='info', timeout=CFG.TOAST.TIMEOUT, meta } = opts||{}; const el=document.createElement('div'); el.className=`toast toast--${variant}`; el.setAttribute('role','status'); el.setAttribute('aria-live', variant==='error'? 'assertive':'polite'); el.innerHTML=`<div class="toast__content">${title?`<div class="toast__title">${title}</div>`:''}${message?`<div class="toast__body">${message}</div>`:''}${meta?`<div class="toast__meta">${meta}</div>`:''}</div><button type="button" class="toast__close" aria-label="Dismiss">✕</button>`; const closeBtn=el.querySelector('.toast__close'); let timer; function remove(manual){ if(el.classList.contains('is-leaving')) return; el.classList.add('is-leaving'); el.addEventListener('animationend', ()=>el.remove(), { once:true }); if(manual && timer) clearTimeout(timer); }
		closeBtn?.addEventListener('click',()=>remove(true)); toastStack.appendChild(el); if(timeout>0) timer=setTimeout(remove, timeout); return { dismiss:()=>remove(true), el }; }
	window.flyNotify = toast;

	// Demo toast
	setTimeout(()=> toast({ title:'Welcome', message:'Modern Standard refactor ready.', variant:'info'}), 200);

	/* Length Hints */
	qsa('.length-field').forEach(field=>{ const input=field.querySelector('input'); const bubble=field.querySelector('.length-hint'); if(!input||!bubble) return; const soft=parseInt(field.getAttribute('data-soft-limit')||'',10)||CFG.LENGTH.SOFT_DEF; const hard=parseInt(field.getAttribute('data-hard-limit')||'',10)||CFG.LENGTH.HARD_DEF; const countEl=bubble.querySelector('[data-part="count"]'); const softEl=bubble.querySelector('[data-part="soft"]'); const hardEl=bubble.querySelector('[data-part="hard"]'); if(softEl) softEl.textContent=soft; if(hardEl) hardEl.textContent=hard; let showing=false; function update(){ const len=input.value.length; if(countEl) countEl.textContent=len; const overSoft=len>soft; const overHard=len>hard; if(overSoft && !showing){ bubble.hidden=false; showing=true; } else if(!overSoft && showing){ bubble.hidden=true; bubble.classList.remove('is-soft','is-hard'); showing=false; } if(showing){ bubble.classList.toggle('is-hard', overHard); bubble.classList.toggle('is-soft', overSoft && !overHard); bubble.setAttribute('aria-live', overHard? 'assertive':'polite'); } input.classList.toggle('is-over-hard', overHard); } input.addEventListener('input', update); update(); });

	/* Progress Demo */
	(function(){ const form=qs('.gen-form'); const footer=qs('.app-footer'); const filterBar=footer? qs('.ui-bar--filter', footer):null; const progressBar=footer? qs('.ui-bar--progress', footer):null; if(!form||!filterBar||!progressBar) return; const tube=progressBar.querySelector('.ui-bar__main'); const fill=progressBar.querySelector('.ui-progress__fill'); const label=progressBar.querySelector('.ui-progress__label'); const percent=progressBar.querySelector('.progress-percent'); if(!tube||!fill||!label||!percent) return; function setProgress(p, text){ const c=Math.max(0,Math.min(1,p)); fill.style.setProperty('--progress', c); tube.setAttribute('aria-valuenow', String(Math.round(c*100))); percent.textContent=Math.round(c*100)+'%'; if(text) label.textContent=text; }
		function animateTo(targetPct,duration,labelDone){ const startPct=parseFloat(tube.getAttribute('aria-valuenow')||'0'); const target=Math.max(0,Math.min(100,targetPct)); const delta=target-startPct; const start=performance.now(); function step(now){ const t=Math.min(1,(now-start)/duration); const pct=startPct+delta*t; setProgress(pct/100); if(t<1) requestAnimationFrame(step); else if(labelDone) label.textContent=labelDone; } requestAnimationFrame(step); }
		function run(){ filterBar.hidden=true; progressBar.hidden=false; tube.classList.remove('is-done','is-error'); label.textContent='Generating…'; animateTo(100,2200,'Done'); setTimeout(()=>{ tube.classList.add('is-done'); setTimeout(()=>{ tube.classList.remove('is-done'); filterBar.hidden=false; progressBar.hidden=true; },800); },2300); }
		form.addEventListener('submit', e=>{ e.preventDefault(); run(); });
		const demoBtn=qs('#debug-half-progress'); if(demoBtn){ demoBtn.addEventListener('click', ()=>{ filterBar.hidden=true; progressBar.hidden=false; tube.classList.remove('is-done','is-error'); label.textContent='Template demo…'; animateTo(50,700); }); }
	})();

	/* Nav accent (if nav dialog markup present) */
	function navAccent(){ const nav=qs('.main-nav'); const accent=qs('.main-nav__accent'); if(!nav||!accent) return; const current=nav.querySelector('.main-nav__link.is-current, .main-nav__action.is-current'); if(!current){ accent.style.opacity='0'; return; } const item=current.closest('.main-nav__item'); if(!item){ accent.style.opacity='0'; return; } const listRect=nav.querySelector('.main-nav__list').getBoundingClientRect(); const itemRect=item.getBoundingClientRect(); const offset=itemRect.top - listRect.top; accent.style.height=itemRect.height+'px'; accent.style.transform=`translateY(${offset}px)`; accent.style.opacity='1'; }
		document.addEventListener('dialog:open', e=>{ if(e.detail.dialog?.id==='nav-dialog') setTimeout(navAccent,40); });
	window.addEventListener('resize', ()=>navAccent());
	document.addEventListener('click', e=>{ const link=e.target.closest('[data-nav-item]'); if(!link) return; const nav=link.closest('.main-nav'); nav.querySelectorAll('.is-current').forEach(el=>el.classList.remove('is-current')); link.classList.add('is-current'); navAccent(); });

	/* Art mode toggle */
	const modeBtn=qs('[data-mode-toggle]'); function syncModeBtn(){ if(!modeBtn) return; modeBtn.setAttribute('aria-pressed', document.body.classList.contains('art-mode')?'true':'false'); }
	modeBtn?.addEventListener('click', ()=>{ document.body.classList.toggle('art-mode'); syncModeBtn(); }); syncModeBtn();

	/* Random Toast Trigger */
	document.addEventListener('click', e=>{ const btn=e.target.closest('[data-random-toast]'); if(!btn) return; const variants=['info','success','warn','error']; const variant=variants[Math.floor(Math.random()*variants.length)]; const samples={ info:['Heads up','Just FYI','Notice','Update'], success:['Saved','Uploaded','Completed','All good'], warn:['Careful','Check this','Heads up','Potential issue'], error:['Failure','Error occurred','Oops','Cannot proceed'] }; function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; } toast({ title: pick(samples[variant]), message: variant==='success'? 'Operation finished successfully.' : variant==='info'? 'General informational notification.' : variant==='warn'? 'Something may need your attention.' : 'A problem prevented completion.', variant }); });

	/* Expose for debugging */
	window.UI = { parallax, scrollLock, dialogs:dialogManager, toast, version:'modern-standard-refactor' };
})();