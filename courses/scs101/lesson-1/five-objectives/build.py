"""Render the approved flashcards with a course-local five-card arrangement."""
import importlib.util
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
spec = importlib.util.spec_from_file_location('rise', ROOT / 'make-rise.py')
rise = importlib.util.module_from_spec(spec)
spec.loader.exec_module(rise)
approved_render = rise.render


def render(data, base=ROOT):
    page = approved_render(data, base)
    # Placement only: approved card sizing, typography and behaviour are untouched.
    layout = '''<style>
@media(min-width:761px){
.practice-grid{grid-template-columns:repeat(6,minmax(0,1fr))}
.practice-grid li{grid-column:span 2}
.practice-grid li:nth-child(4){grid-column:2 / span 2}
.practice-grid li:nth-child(5){grid-column:4 / span 2}
}
</style>'''
    return page.replace('</head>', layout + '</head>')


rise.render = render
source = Path(__file__).parent
print(rise.paste(source))
print(rise.create_preview(source))
