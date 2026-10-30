#!/usr/bin/env python3
"""Groundwork Flashcards pilot. Standard-library adaptation of the original paste workflow.

python make-rise.py check
python make-rise.py preview [preset.json | course/block-folder]
python make-rise.py paste library/presets/flashcards--explore.json [--copy]
python make-rise.py paste courses/demo/review-concepts
"""
from __future__ import annotations

import argparse
import base64
import html
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent
PRESETS = ROOT / 'library/presets'
PREVIEWS = ROOT / 'library/previews'
EXPORTS = ROOT / 'exports'
COMPONENT = ROOT / 'components'
FONTS = ROOT / 'experiments/fonts'


def local_path(value, base=ROOT):
    path = (base / value).resolve()
    if not path.is_relative_to(ROOT):
        raise ValueError('Content and artwork paths must stay inside Groundwork')
    return path


def resolve(source):
    path = local_path(source)
    if path.is_dir():
        path /= 'block.json'
    data = json.loads(path.read_text(encoding='utf-8-sig'))
    if 'component' in data:
        if data['component'] != 'flashcards':
            raise ValueError('This pilot supports flashcards only')
        data = data['data']
    elif not path.is_relative_to(PRESETS) or not path.stem.startswith('flashcards--'):
        raise ValueError('Use a flashcards preset or a {component, data} block.json')
    if not isinstance(data, dict):
        raise ValueError('Flashcard data must be an object')
    relative = path.relative_to(ROOT)
    name = '--'.join(relative.parts[1:-1]) if path.name == 'block.json' else path.stem
    return data, path.parent, name


def validate(data):
    if data.get('use', 'explore') not in ('explore', 'recall'):
        raise ValueError('use must be explore or recall')
    if 'tracking' in data and not isinstance(data['tracking'], bool):
        raise ValueError('tracking must be true or false')
    for key in ('title', 'instruction', 'revealLabel', 'returnLabel'):
        if key in data and not isinstance(data[key], str):
            raise ValueError(key + ' must be text')
    cards = data.get('cards')
    if not isinstance(cards, list) or not 2 <= len(cards) <= 8:
        raise ValueError('Provide 2–8 cards')
    for card in cards:
        if not isinstance(card, dict):
            raise ValueError('Each card must be an object')
        for side in ('front', 'back'):
            face = card.get(side)
            if not isinstance(face, dict):
                raise ValueError('Each card needs front and back objects')
            required = 'heading' if side == 'front' else 'text'
            if not isinstance(face.get(required), str) or not face[required].strip():
                raise ValueError(f'{side}.{required} is required')
            for key in ('heading', 'text', 'label', 'icon', 'artwork'):
                if key in face and not isinstance(face[key], str):
                    raise ValueError(f'{side}.{key} must be text')
        if card['front'].get('icon') and card['front'].get('artwork'):
            raise ValueError('Choose either front.icon or front.artwork')


def artwork_uri(front, base):
    if front.get('icon'):
        name = front['icon']
        if not re.fullmatch(r'[a-z0-9-]+', name):
            raise ValueError('Icon names use lowercase letters, numbers and hyphens')
        path = local_path(f'assets/icons/{name}.svg')
    elif front.get('artwork'):
        path = local_path(front['artwork'], base)
    else:
        return None
    suffix = path.suffix.lower()
    mime = {'.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg', '.webp': 'image/webp'}.get(suffix)
    if not mime:
        raise ValueError('Artwork must be SVG, PNG, JPEG or WebP')
    raw = path.read_bytes()
    if suffix == '.svg':
        # Static artwork only; disallow scripts, external references and embedded HTML.
        tree = ET.fromstring(raw)
        allowed = {'svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline',
                   'polygon', 'title', 'desc'}
        for element in tree.iter():
            if element.tag.split('}')[-1] not in allowed:
                raise ValueError(f'Unsupported SVG element in {path.name}')
            for key, value in element.attrib.items():
                if key.split('}')[-1].lower().startswith('on') or key.split('}')[-1] in ('href', 'src', 'style') or 'url(' in value.lower():
                    raise ValueError(f'Active or referenced SVG content in {path.name}')
    return f'data:{mime};base64,' + base64.b64encode(raw).decode()


def font_css():
    styles = []
    for family, file, weight in [
        ('Archivo', 'archivo-latin-700-normal.woff2', 700),
        ('Atkinson Hyperlegible Next', 'atkinson-hyperlegible-next-latin-400-normal.woff2', 400),
        ('Atkinson Hyperlegible Next', 'atkinson-hyperlegible-next-latin-700-normal.woff2', 700),
    ]:
        encoded = base64.b64encode((FONTS / file).read_bytes()).decode()
        styles.append(f"@font-face{{font-family:'{family}';font-style:normal;font-weight:{weight};font-display:swap;src:url(data:font/woff2;base64,{encoded}) format('woff2')}}")
    return '\n'.join(styles)


def render(data, base=ROOT):
    """One rendering path for previews and paste-ready output. No external requests."""
    validate(data)
    esc = lambda value: html.escape(str(value), quote=True)
    use = data.get('use', 'explore')
    reveal = data.get('revealLabel') or ('Explore concept ↗' if use == 'explore' else 'Reveal answer ↗')
    back_label = data.get('returnLabel') or ('Return to concept ↶' if use == 'explore' else 'Return to prompt ↶')
    title = data.get('title', '')
    instruction = data.get('instruction', '')
    tracking = data.get('tracking', False)
    items = []
    for card in data['cards']:
        front, back = card['front'], card['back']
        image = artwork_uri(front, base)
        face = lambda value, cls: f'<span class="{cls}">{esc(value)}</span>' if value else ''
        front_html = (f'<span class="practice-art" aria-hidden="true"><img src="{image}" alt=""></span>' if image else '')
        front_html += face(front.get('label'), 'practice-label') + face(front['heading'], 'practice-term') + face(front.get('text'), 'practice-question')
        back_html = face(back.get('label'), 'practice-label') + face(back['text'], 'practice-answer')
        name = ' '.join(filter(None, [front.get('label'), front['heading'], front.get('text'), reveal]))
        items.append(f'<li><button type="button" class="practice-card" data-card aria-pressed="false" aria-label="{esc(name)}"><span class="practice-face front">{front_html}</span><span class="practice-face back" hidden>{back_html}</span><span class="practice-footer"><span class="practice-action">{esc(reveal)}</span><span class="practice-visited"></span></span></button></li>')
    heading = f'<h2>{esc(title)}</h2>' if title else ''
    help_text = f'<p class="instruction">{esc(instruction)}</p>' if instruction else ''
    progress = f'<p class="progress" data-progress role="status">0 of {len(items)} viewed</p>' if tracking else ''
    foundation = (ROOT / 'experiments/groundwork-foundation.css').read_text(encoding='utf-8')
    css = (COMPONENT / 'flashcards.css').read_text(encoding='utf-8')
    js = (COMPONENT / 'flashcards.js').read_text(encoding='utf-8')
    notices = '\n'.join((FONTS / name).read_text(encoding='utf-8') for name in ['OFL-Archivo.txt', 'OFL-Atkinson-Hyperlegible-Next.txt']).replace('--', '—')
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{esc(title or 'Groundwork Flashcards')}</title><style>{font_css()}\n{foundation}\n{css}</style></head><body>
<main data-flashcards data-tracking="{str(tracking).lower()}" data-reveal="{esc(reveal)}" data-return="{esc(back_label)}" aria-label="{esc(title or 'Flashcards')}">{heading}{help_text}{progress}<ul class="practice-grid{' three' if len(items) == 3 else ''}">{''.join(items)}</ul></main>
<script>{js}</script><!-- Embedded font licences:\n{notices}\n--></body></html>'''


def paste(source, copy=False):
    data, base, name = resolve(source)
    page = render(data, base)
    EXPORTS.mkdir(exist_ok=True)
    target = EXPORTS / (name + '--paste.html')
    target.write_text(page, encoding='utf-8')
    if copy:
        if os.name != 'nt':
            raise ValueError(f'Clipboard copying requires Windows; HTML saved to {target}')
        # Literal path is escaped as PowerShell data; HTML never becomes shell code.
        literal = str(target).replace("'", "''")
        command = f"Get-Content -Raw -Encoding UTF8 -LiteralPath '{literal}' | Set-Clipboard"
        encoded = base64.b64encode(command.encode('utf-16le')).decode()
        subprocess.run(['powershell.exe', '-NoProfile', '-EncodedCommand', encoded], check=True)
    return target


def create_preview(source):
    data, base, name = resolve(source)
    page = render(data, base)
    PREVIEWS.mkdir(parents=True, exist_ok=True)
    target = PREVIEWS / (name + '.html')
    # Exact paste HTML inside srcdoc; only the outer lesson context differs.
    target.write_text('''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Groundwork Flashcards preview</title><style>*{box-sizing:border-box}body{margin:0;color:#1d2030;font:16px/1.5 system-ui}header,section{padding:24px max(20px,calc((100vw - 1040px)/2))}header{background:#f8fafc}h1{font-size:22px;margin:0 0 8px}p{margin:8px 0}button{font:inherit;padding:8px 14px;cursor:pointer}button:focus-visible{outline:3px solid #3656bd;outline-offset:3px}section{background:white}.ice section{background:#e7edf4}iframe{border:0;width:100%;display:block;height:650px}</style></head><body><header><h1>Groundwork · Flashcards pilot</h1><p>Edit the source JSON, then regenerate. The iframe below contains the exact paste-ready document.</p><button id="background" aria-pressed="false">Use ice-blue background</button></header><section><iframe title="Flashcards" srcdoc="''' + html.escape(page, quote=True) + '''"></iframe></section><script>const frame=document.querySelector('iframe');frame.addEventListener('load',()=>{const doc=frame.contentDocument;const resize=()=>frame.style.height=Math.ceil(doc.body.getBoundingClientRect().height+16)+'px';new ResizeObserver(resize).observe(doc.body);doc.fonts.ready.then(resize);resize()});document.querySelector('button').addEventListener('click',e=>{const ice=document.body.classList.toggle('ice');e.target.setAttribute('aria-pressed',String(ice));e.target.textContent=ice?'Use white background':'Use ice-blue background'});</script></body></html>''', encoding='utf-8')
    return target


def sources():
    return sorted(PRESETS.glob('flashcards--*.json')) + sorted((ROOT / 'courses').rglob('block.json'))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['render', 'paste', 'preview', 'check'])
    parser.add_argument('source', nargs='?')
    parser.add_argument('--copy', action='store_true', help='Copy paste-ready HTML text to the Windows clipboard')
    args = parser.parse_args()
    if args.copy and args.action != 'paste':
        parser.error('--copy is supported with paste only')
    if args.action in ('paste', 'render'):
        if not args.source:
            parser.error(args.action + ' requires a source')
        if args.action == 'render':
            data, base, _ = resolve(args.source)
            sys.stdout.buffer.write(render(data, base).encode('utf-8'))
        else:
            target = paste(args.source, args.copy)
            print(f'Created {target} ({target.stat().st_size:,} bytes)' + ('; copied HTML to clipboard' if args.copy else ''))
    else:
        selected = [args.source] if args.source else sources()
        if not selected:
            raise ValueError('No content sources found')
        for source in selected:
            if args.action == 'preview':
                print(create_preview(source))
            else:
                data, base, _ = resolve(source)
                render(data, base)
        if args.action == 'check':
            print(f'PASS: {len(selected)} Flashcard content sources render with local assets')


if __name__ == '__main__':
    try:
        main()
    except (OSError, ValueError, KeyError, TypeError, ET.ParseError, subprocess.CalledProcessError) as error:
        sys.exit(f'ERROR: {error}')
