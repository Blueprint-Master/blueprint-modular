"""Check wiki lists on an installed standalone using deterministic local HTTP responses."""
import os, secrets, socket, subprocess, sys, time
from pathlib import Path
from urllib.request import build_opener, ProxyHandler
from playwright.sync_api import sync_playwright, expect
from urllib.parse import urlsplit, parse_qs
import json

def measure(browser,origin,expectation,width):
    rows=[]
    statuses=['empty','populated','503','nonlist','network']
    for audience in ['guest','member']:
        assert expectation in ('baseline','candidate')
        for scenario in statuses:
            ctx=browser.new_context(viewport={'width':width,'height':800},locale='fr-FR',timezone_id='Europe/Paris',service_workers='block')
            observed=[]
            recovered=False
            def handler(route):
                req=route.request
                if not req.url.startswith(origin+'/') or req.method!='GET': return route.abort()
                u=urlsplit(req.url)
                if u.path=='/api/auth/session':
                    return route.fulfill(json={} if audience=='guest' else {'user':{'id':'qa-user','name':'QA','email':'fixture@example.invalid','role':'USER'},'expires':'2099-01-01T00:00:00Z'})
                if u.path=='/api/wiki/tags':return route.fulfill(json=[])
                if u.path=='/api/wiki':
                    observed.append('published' if 'status' in parse_qs(u.query) else 'session')
                    current='populated' if recovered else scenario
                    if current=='network':return route.abort('failed')
                    if current=='503':return route.fulfill(status=503,json={'error':'Unavailable'})
                    if current=='nonlist':return route.fulfill(json={'unavailable':True})
                    return route.fulfill(json=[] if current=='empty' else [{'id':'qa-article','slug':'preuve-lecture','title':'Article témoin','parentId':None,'isPublished':True,'updatedAt':'2026-11-19T12:00:00Z','createdAt':'2026-11-19T12:00:00Z','tags':[],'pinned':False,'canEdit':False}])
                if u.path.startswith('/api/') and u.path!='/api/auth/providers':return route.fulfill(json={})
                return route.continue_()
            ctx.route('**/*',handler)
            page=ctx.new_page()
            page.goto(origin+'/modules/wiki',wait_until='networkidle')
            expect(page.locator('.wiki-loading')).to_have_count(0)
            assert ('published' if audience=='guest' else 'session') in observed,(audience,scenario,observed)
            body=page.locator('.wiki-page').inner_text()
            empty=page.locator('.wiki-empty').count()>0
            local=page.locator('.wiki-page').get_by_text('FAQ',exact=True).count()>0
            remote='Article témoin' in body
            alert=page.locator('.wiki-page [role=alert]').count()>0
            if scenario=='populated':assert remote
            if scenario=='empty':assert not remote and not alert and (local if audience=='guest' else empty)
            if scenario in ('503','nonlist','network'):
                assert alert==(expectation=='candidate'),(audience,scenario,body)
                if expectation=='candidate':assert local if audience=='guest' else not empty
            rows.append(dict(width=width,audience=audience,case=scenario,serverArticleVisible=remote,localFAQVisible=local,emptyWikiVisible=empty,readFailureAnnounced=alert))
            if expectation=='candidate' and scenario in ('503','network','nonlist'):
                recovered=True
                page.get_by_role('button',name='Réessayer',exact=True).click()
                expect(page.locator('.wiki-page').get_by_text('Article témoin',exact=True).first).to_be_visible()
                expect(page.locator('.wiki-page [role=alert]')).to_have_count(0)
                rows[-1]['retryRecovered']=True
            ctx.close()
    print(json.dumps(rows,ensure_ascii=False,indent=2))

def verify_guest_without_database(browser, origin, width):
    context = browser.new_context(
        locale="fr-FR", viewport={"width": width, "height": 800}, service_workers="block"
    )
    try:
        def local_reads(route):
            if route.request.url.startswith(origin + "/") and route.request.method == "GET":
                return route.continue_()
            return route.abort()

        def wiki_response(response):
            return urlsplit(response.url).path == "/api/wiki"

        context.route("**/*", local_reads)
        page = context.new_page()
        statuses = []
        page.on("response", lambda response: statuses.append(response.status) if wiki_response(response) else None)
        page.goto(origin + "/modules/wiki", wait_until="networkidle")
        alert = page.locator(".wiki-page [role=alert]")
        expect(alert).to_contain_text("Les articles du serveur sont indisponibles")
        expect(page.locator(".wiki-page").get_by_text("FAQ", exact=True).first).to_be_visible()
        before = len(statuses)
        with page.expect_response(wiki_response):
            page.get_by_role("button", name="Réessayer", exact=True).click()
        expect(alert).to_be_visible()
        assert before >= 1 and len(statuses) > before and all(500 <= status < 600 for status in statuses), statuses
        print(json.dumps({"width": width, "actualWikiHTTP": statuses, "guestFAQVisible": True, "alertVisible": True}))
    finally:
        context.close()


app=Path(sys.argv[1]).resolve()
with socket.socket() as reserve:
    reserve.bind(('127.0.0.1',0))
    port=reserve.getsockname()[1]
origin=f'http://127.0.0.1:{port}'
env={k:os.environ[k] for k in ('PATH','HOME','TMPDIR') if k in os.environ}
env.update(NEXTAUTH_URL=origin,NEXTAUTH_SECRET=secrets.token_urlsafe(40),HOSTNAME='127.0.0.1',PORT=str(port),NODE_ENV='production',NEXT_TELEMETRY_DISABLED='1')
with open(os.devnull,'w') as log:
    proc=subprocess.Popen(['node','.next/standalone/server.js'],cwd=app,env=env,stdout=log,stderr=log)
    try:
        opener=build_opener(ProxyHandler({}))
        for _ in range(80):
            try:
                with opener.open(origin+'/api/health',timeout=1) as response: health=json.load(response);break
            except OSError:time.sleep(.1)
        else:raise RuntimeError('No health response')
        assert health['sourceCommit']==(app/'BUILD-REVISION').read_text().strip()
        required=os.environ.get('MODULAR_EXPECTED_SHA')
        if required: assert required==health['sourceCommit']
        print('Installed SHA',health['sourceCommit'],flush=True)
        with sync_playwright() as pw:
            browser=pw.chromium.launch(executable_path=os.environ['MODULAR_TEST_CHROMIUM'])
            try:
                for width in (1280,390):
                    measure(browser,origin,sys.argv[2],width)
                    if sys.argv[2] == "candidate":
                        verify_guest_without_database(browser, origin, width)
            finally:browser.close()
    finally:proc.terminate();proc.wait(timeout=10)
