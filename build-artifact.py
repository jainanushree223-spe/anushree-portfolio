# Generates artifact.html (a single-file variant of index.html for hosting).
# Same markup, same CSS, same JS — only the document wrapper differs.
import re, pathlib
root = pathlib.Path('.')
html = (root/'index.html').read_text()
css  = (root/'css/style.css').read_text()
js   = (root/'js/main.js').read_text()

body = html.split('<body>',1)[1].split('<script src="https://cdnjs')[0]
fonts = re.search(r'<link href="https://fonts\.googleapis[^>]*>', html).group(0)

reset = """
/* the host page wrapper adds its own reset; neutralise it so the
   composition below is byte-for-byte the local prototype */
:root{padding:0 !important;color-scheme:light}
html,body{margin:0;padding:0;font-size:16px}
"""
out = f"""<title>Designer Who Builds</title>
{fonts}
<style>{reset}
{css}</style>
{body}
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script>{js}</script>
"""
(root/'artifact.html').write_text(out)
print('artifact.html', len(out)//1024, 'KB')
