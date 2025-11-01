from playwright.sync_api import sync_playwright
import json

BASE = "http://127.0.0.1:8000"
PATHS = ["/index.html", "/marketplace/listings.html"]

report = {}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    for path in PATHS:
        url = BASE + path
        page_report = {"console": [], "page_errors": [], "failed_requests": [], "bad_responses": []}
        context = browser.new_context()
        page = context.new_page()

        def on_console(msg):
            loc = None
            try:
                loc = msg.location()
            except Exception:
                loc = None
            page_report['console'].append({'type': msg.type, 'text': msg.text, 'location': loc})
        page.on('console', on_console)

        def on_page_error(exc):
            # pageerror gives an Error with stack — capture full repr
            try:
                page_report['page_errors'].append({'message': str(exc), 'stack': getattr(exc, 'stack', None)})
            except Exception:
                page_report['page_errors'].append({'message': str(exc)})
        page.on('pageerror', on_page_error)

        def on_request_failed(req):
            page_report['failed_requests'].append({'url': req.url, 'method': req.method, 'resource_type': req.resource_type})
        page.on('requestfailed', on_request_failed)

        def on_response(resp):
            try:
                status = resp.status
            except Exception:
                status = None
            if status and status >= 400:
                page_report['bad_responses'].append({'url': resp.url, 'status': status, 'request': resp.request.url})
        page.on('response', on_response)

        try:
            page.goto(url, wait_until='networkidle', timeout=20000)
        except Exception as e:
            page_report['page_errors'].append('goto-error: ' + str(e))
        # Give a moment for lazy resources
        page.wait_for_timeout(500)
        report[path] = page_report
        context.close()
    browser.close()

print(json.dumps(report, indent=2))
