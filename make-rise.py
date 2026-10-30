#!/usr/bin/env python3
"""Groundwork component exports. Standard-library adaptation of the original paste workflow.

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
        component = data['component']
        if component not in ('flashcards', 'definition', 'comparison', 'expandable-list', 'reference-table', 'key-takeaway', 'knowledge-check'):
            raise ValueError('Unknown component')
        data = dict(data['data'], _component=component)
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
    if data.get('_component') == 'definition':
        return render_definition(data)
    if data.get('_component') == 'comparison':
        return render_comparison(data)
    if data.get('_component') == 'expandable-list':
        return render_expandable_list(data)
    if data.get('_component') == 'reference-table':
        return render_reference_table(data)
    if data.get('_component') == 'key-takeaway':
        return render_key_takeaway(data)
    if data.get('_component') == 'knowledge-check':
        return render_knowledge_check(data)
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


def render_definition(data):
    for key in ('term', 'text'):
        if not isinstance(data.get(key), str) or not data[key].strip():
            raise ValueError('Definition ' + key + ' must be nonempty text')
    emphasis = data.get('emphasis', '')
    if not isinstance(emphasis, str) or (emphasis and data['text'].count(emphasis) != 1):
        raise ValueError('Definition emphasis must match one phrase in text')
    esc = lambda value: html.escape(value, quote=True)
    text = esc(data['text'])
    if emphasis:
        text = text.replace(esc(emphasis), '<strong>' + esc(emphasis) + '</strong>')
    foundation = (ROOT / 'experiments/groundwork-foundation.css').read_text(encoding='utf-8')
    css = (COMPONENT / 'definition.css').read_text(encoding='utf-8')
    notices = '\n'.join((FONTS / name).read_text(encoding='utf-8') for name in ['OFL-Archivo.txt', 'OFL-Atkinson-Hyperlegible-Next.txt']).replace('--', '—')
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{esc(data['term'])} — Definition</title><style>{font_css()}\n{foundation}\n{css}</style></head><body>
<main><section class="definition" aria-labelledby="definition-term"><span class="definition-label">Definition</span><dl><dt id="definition-term">{esc(data['term'])}</dt><dd>{text}</dd></dl></section></main>
<!-- Embedded font licences:\n{notices}\n--></body></html>'''


def render_comparison(data):
    columns = data.get('columns')
    if not isinstance(columns, list) or len(columns) != 2:
        raise ValueError('Comparison requires exactly two columns')
    esc = lambda value: html.escape(value, quote=True)
    items = []
    for index, column in enumerate(columns):
        if not isinstance(column, dict):
            raise ValueError('Comparison columns must be objects')
        middle = 'label' if 'label' in column else 'document'
        for key in ('heading', middle, 'explanation'):
            if not isinstance(column.get(key), str) or not column[key].strip():
                raise ValueError('Comparison ' + key + ' must be nonempty text')
        heading = f'<h2 id="column-{index}">{esc(column["heading"])}</h2>'
        if middle == 'label':
            content = f'<p class="comparison-label">{esc(column["label"])}</p>{heading}'
        else:
            content = f'{heading}<p class="comparison-document">{esc(column["document"])}</p>'
        items.append(f'''<section class="comparison-column" aria-labelledby="column-{index}">{content}<p class="comparison-explanation">{esc(column['explanation'])}</p></section>''')
    foundation = (ROOT / 'experiments/groundwork-foundation.css').read_text(encoding='utf-8')
    css = (COMPONENT / 'comparison.css').read_text(encoding='utf-8')
    notices = '\n'.join((FONTS / name).read_text(encoding='utf-8') for name in ['OFL-Archivo.txt', 'OFL-Atkinson-Hyperlegible-Next.txt']).replace('--', '—')
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Codes and standards comparison</title><style>{font_css()}\n{foundation}\n{css}</style></head><body>
<main><div class="comparison">{''.join(items)}</div></main>
<!-- Embedded font licences:\n{notices}\n--></body></html>'''


def render_expandable_list(data):
    rows = data.get('rows')
    if not isinstance(rows, list) or not rows:
        raise ValueError('Expandable list requires rows')
    esc = lambda value: html.escape(value, quote=True)
    items = []
    for row in rows:
        if not isinstance(row, dict):
            raise ValueError('Each expandable row must be an object')
        for key in ('heading', 'summary', 'explanation', 'exampleCode', 'exampleTitle', 'exampleText'):
            if not isinstance(row.get(key), str) or not row[key].strip():
                raise ValueError('Expandable row ' + key + ' must be nonempty text')
        items.append(f'''<details><summary><span class="row-intro"><span class="row-heading">{esc(row['heading'])}</span><span class="row-summary">{esc(row['summary'])}</span></span><span class="chevron" aria-hidden="true"></span></summary><div class="row-body"><p>{esc(row['explanation'])}</p><div class="row-example"><p class="example-label">Example standard</p><p>{esc(row['exampleCode'])}, <em>{esc(row['exampleTitle'])}</em>, {esc(row['exampleText'])}</p></div></div></details>''')
    foundation = (ROOT / 'experiments/groundwork-foundation.css').read_text(encoding='utf-8')
    css = (COMPONENT / 'expandable-list.css').read_text(encoding='utf-8')
    notices = '\n'.join((FONTS / name).read_text(encoding='utf-8') for name in ['OFL-Archivo.txt', 'OFL-Atkinson-Hyperlegible-Next.txt']).replace('--', '—')
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Groundwork expandable list</title><style>{font_css()}\n{foundation}\n{css}</style></head><body>
<main><div class="expandable-list">{''.join(items)}</div></main>
<!-- Independent native details elements support multiple open rows and keyboard operation without JavaScript. -->
<!-- Embedded font licences:\n{notices}\n--></body></html>'''


def render_reference_table(data):
    rows = data.get('rows')
    if not isinstance(rows, list) or not rows:
        raise ValueError('Reference table requires rows')
    esc = lambda value: html.escape(value, quote=True)
    items = []
    for index, row in enumerate(rows):
        if not isinstance(row, dict):
            raise ValueError('Table rows must be objects')
        for key in ('discipline', 'designation', 'publication', 'coverage'):
            if not isinstance(row.get(key), str) or not row[key].strip():
                raise ValueError('Table ' + key + ' must be nonempty text')
        items.append(f'''<tr role="row"><th role="rowheader" scope="row" id="discipline-{index}" headers="discipline"><span class="mobile-label" aria-hidden="true">Discipline</span>{esc(row['discipline'])}</th><td role="cell" headers="technical-code discipline-{index}"><span class="mobile-label" aria-hidden="true">Technical code</span><span class="code-designation">{esc(row['designation'])}</span><span class="code-publication"><span class="visually-hidden"> — </span><em>{esc(row['publication'])}</em></span></td><td role="cell" headers="coverage discipline-{index}"><span class="mobile-label" aria-hidden="true">What it covers</span>{esc(row['coverage'])}</td></tr>''')
    foundation = (ROOT / 'experiments/groundwork-foundation.css').read_text(encoding='utf-8')
    css = (COMPONENT / 'reference-table.css').read_text(encoding='utf-8')
    notices = '\n'.join((FONTS / name).read_text(encoding='utf-8') for name in ['OFL-Archivo.txt', 'OFL-Atkinson-Hyperlegible-Next.txt']).replace('--', '—')
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Examples of standards-developed technical codes in Alberta</title><style>{font_css()}\n{foundation}\n{css}</style></head><body>
<main><div class="table-surface"><table role="table" aria-label="Examples of standards-developed technical codes in Alberta"><colgroup><col class="discipline-col"><col class="technical-col"><col class="coverage-col"></colgroup><thead role="rowgroup"><tr role="row"><th role="columnheader" scope="col" id="discipline">Discipline</th><th role="columnheader" scope="col" id="technical-code">Technical code</th><th role="columnheader" scope="col" id="coverage">What it covers</th></tr></thead><tbody role="rowgroup">{''.join(items)}</tbody></table></div></main>
<!-- Embedded font licences:\n{notices}\n--></body></html>'''


def render_key_takeaway(data):
    if not isinstance(data.get('text'), str) or not data['text'].strip():
        raise ValueError('Key takeaway requires nonempty text')
    foundation = (ROOT / 'experiments/groundwork-foundation.css').read_text(encoding='utf-8')
    css = (COMPONENT / 'key-takeaway.css').read_text(encoding='utf-8')
    notices = '\n'.join((FONTS / name).read_text(encoding='utf-8') for name in ['OFL-Archivo.txt', 'OFL-Atkinson-Hyperlegible-Next.txt']).replace('--', '—')
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Key takeaway</title><style>{font_css()}\n{foundation}\n{css}</style></head><body>
<main><aside class="takeaway" aria-labelledby="takeaway-label"><span class="takeaway-label" id="takeaway-label">Key takeaway</span><p>{html.escape(data['text'], quote=True)}</p></aside></main>
<!-- Embedded font licences:\n{notices}\n--></body></html>'''


def render_knowledge_check(data):
    questions = data.get('questions')
    if not isinstance(questions, list) or len(questions) != 2:
        raise ValueError('This sequential knowledge check requires two questions')
    slots = {}
    for index, question in enumerate(questions, 1):
        if not isinstance(question, dict) or not isinstance(question.get('question'), str) or not question['question'].strip():
            raise ValueError('Question text is required')
        answers = question.get('answers')
        if not isinstance(answers, list) or len(answers) != 3:
            raise ValueError('Provide three answers in order')
        slots['Q' + str(index)] = html.escape(question['question'], quote=True)
        for position, answer in enumerate(answers, 1):
            if not isinstance(answer, dict) or not isinstance(answer.get('correct'), bool):
                raise ValueError('Each answer requires a boolean correct value')
            for key in ('text', 'feedback'):
                if not isinstance(answer.get(key), str) or not answer[key].strip():
                    raise ValueError('Each answer requires text and feedback')
            number = str((index - 1) * 3 + position)
            slots['A' + number] = html.escape(answer['text'], quote=True)
            slots['F' + number] = html.escape(answer['feedback'], quote=True)
            slots['C' + number] = str(answer['correct']).lower()
        if sum(answer['correct'] for answer in answers) != 1:
            raise ValueError('Each question needs exactly one correct answer')
    template = (COMPONENT / 'knowledge-check.html').read_text(encoding='utf-8')
    body = re.sub(r'\{\{([A-Z][0-9]+)\}\}', lambda match: slots[match[1]], template)
    css = (COMPONENT / 'knowledge-check.css').read_text(encoding='utf-8')
    js = (COMPONENT / 'knowledge-check.js').read_text(encoding='utf-8')
    mono = base64.b64encode((FONTS / 'ibm-plex-mono-latin-500-normal.woff2').read_bytes()).decode()
    mono_css = f"@font-face{{font-family:'IBM Plex Mono';font-style:normal;font-weight:500;font-display:swap;src:url(data:font/woff2;base64,{mono}) format('woff2')}}"
    notices = '\n'.join((FONTS / name).read_text(encoding='utf-8') for name in ['OFL-Archivo.txt', 'OFL-Atkinson-Hyperlegible-Next.txt', 'OFL-IBM-Plex-Mono.txt']).replace('--', '—')
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Knowledge check</title><style>{font_css()}\n{mono_css}\n{css}</style></head><body>{body}<script>{js}</script><!-- Embedded font licences:\n{notices}\n--></body></html>'''


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
    if data.get('_component') == 'definition':
        preview = target.read_text(encoding='utf-8')
        target.write_text(preview.replace('Flashcards pilot', 'Definition').replace('Flashcards', 'Definition'), encoding='utf-8')
    elif data.get('_component') == 'comparison':
        preview = target.read_text(encoding='utf-8')
        target.write_text(preview.replace('Flashcards pilot', 'Comparison').replace('Flashcards', 'Comparison'), encoding='utf-8')
    elif data.get('_component') == 'expandable-list':
        preview = target.read_text(encoding='utf-8')
        target.write_text(preview.replace('Flashcards pilot', 'Expandable list').replace('Flashcards', 'Expandable list'), encoding='utf-8')
    elif data.get('_component') == 'reference-table':
        preview = target.read_text(encoding='utf-8')
        target.write_text(preview.replace('Flashcards pilot', 'Reference table').replace('Flashcards', 'Reference table'), encoding='utf-8')
    elif data.get('_component') == 'key-takeaway':
        preview = target.read_text(encoding='utf-8')
        target.write_text(preview.replace('Flashcards pilot', 'Key takeaway').replace('Flashcards', 'Key takeaway'), encoding='utf-8')
    elif data.get('_component') == 'knowledge-check':
        preview = target.read_text(encoding='utf-8')
        target.write_text(preview.replace('Flashcards pilot', 'Knowledge check').replace('Flashcards', 'Knowledge check'), encoding='utf-8')
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
            print(f'PASS: {len(selected)} component content sources render with local assets')


if __name__ == '__main__':
    try:
        main()
    except (OSError, ValueError, KeyError, TypeError, ET.ParseError, subprocess.CalledProcessError) as error:
        sys.exit(f'ERROR: {error}')
