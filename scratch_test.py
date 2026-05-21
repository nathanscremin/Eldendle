import urllib.request

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        print(f"Redirected to: {newurl}")
        return None

opener = urllib.request.build_opener(NoRedirect)
req = urllib.request.Request('http://127.0.0.1:8000/api/boss/image/Godrick%20the%20Grafted')
try:
    res = opener.open(req)
    print(res.status)
except Exception as e:
    print(f"Exception: {e}")
