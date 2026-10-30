"""Integration checks for the paste workflow, using only the standard library."""
import html
import importlib.util
import json
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('make_rise', ROOT / 'make-rise.py')
build = importlib.util.module_from_spec(spec)
spec.loader.exec_module(build)


class ExportWorkflow(unittest.TestCase):
    def test_generated_previews_contain_the_exact_export(self):
        for source in build.sources():
            data, base, name = build.resolve(source)
            page = build.render(data, base)
            preview = (build.PREVIEWS / (name + '.html')).read_text(encoding='utf-8')
            embedded = html.unescape(re.search(r'srcdoc="([\s\S]*?)"></iframe>', preview)[1])
            exported = (build.EXPORTS / (name + '--paste.html')).read_text(encoding='utf-8')
            self.assertEqual(embedded, exported)
            # Course-local builders may add placement rules (Five Objectives).
            # Their exact exports are covered by the dedicated browser checks.
            if not (base / 'build.py').exists():
                self.assertEqual(page, exported)
            self.assertEqual(page.count('data:font/woff2;base64,'), 3)
            self.assertNotRegex(page, r'(?:src|href)="(?!data:|#)')
            self.assertNotRegex(page, r'<script\s+src=|<link\s')
            self.assertNotIn('window.parent.postMessage', page)
            self.assertNotIn('Show mixed states', page)

    def test_content_revision_changes_render_without_component_edits(self):
        data, base, _ = build.resolve('courses/demo/review-concepts')
        original = build.render(data, base)
        data['cards'][0]['back']['text'] = 'Revised explanation: document the source and decision.'
        revised = build.render(data, base)
        self.assertNotEqual(original, revised)
        self.assertIn('Revised explanation: document the source and decision.', revised)
        self.assertEqual(re.findall(r'<script>([\s\S]*?)</script>', original),
                         re.findall(r'<script>([\s\S]*?)</script>', revised))

    def test_text_is_escaped_and_optional_fields_stay_optional(self):
        data, base, _ = build.resolve('library/presets/flashcards--recall.json')
        data.pop('title')
        data.pop('instruction')
        data['cards'][0] = {'front': {'heading': '<script>alert("x")</script> & café'},
                            'back': {'text': 'An explanation without a mandatory label.'}}
        page = build.render(data, base)
        self.assertNotIn('<script>alert', page)
        self.assertIn('&lt;script&gt;', page)
        self.assertNotIn('<p class="progress"', page)
        self.assertNotIn('Recall the meaning', page)

    def test_only_requested_artwork_is_embedded(self):
        recall, base, _ = build.resolve('library/presets/flashcards--recall.json')
        self.assertNotIn('data:image/', build.render(recall, base))
        explore, base, _ = build.resolve('library/presets/flashcards--explore.json')
        self.assertEqual(build.render(explore, base).count('data:image/svg+xml;base64,'), 3)
        explore['cards'][0]['front']['icon'] = 'does-not-exist'
        with self.assertRaises(FileNotFoundError):
            build.render(explore, base)
        with self.assertRaises(ValueError):
            build.local_path('../outside.svg')


if __name__ == '__main__':
    unittest.main()
