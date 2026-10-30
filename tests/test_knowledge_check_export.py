"""Validate single-choice content and safe embedding of authored text."""
import importlib.util
import json
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('rise', ROOT / 'make-rise.py')
build = importlib.util.module_from_spec(spec)
spec.loader.exec_module(build)


class KnowledgeCheckExport(unittest.TestCase):
    def content(self):
        return build.resolve('courses/scs101/lesson-1/knowledge-check')[0]

    def test_exact_content_and_safe_script_embedding(self):
        data = self.content()
        data['questions'][0]['question'] = '</script><script>alert("x")</script> & café'
        page = build.render(data)
        embedded = re.search(r'data-questions>(.*?)</script>', page, re.S)[1]
        self.assertNotIn('<script>alert', page)
        self.assertEqual(json.loads(embedded), data['questions'])

    def test_exactly_one_correct_answer_and_explicit_feedback(self):
        for mutation in ('none', 'multiple', 'feedback'):
            with self.subTest(mutation=mutation):
                data = self.content()
                answers = data['questions'][0]['answers']
                if mutation == 'none':
                    for answer in answers:
                        answer['correct'] = False
                elif mutation == 'multiple':
                    answers[0]['correct'] = True
                else:
                    answers[0]['feedback'] = ''
                with self.assertRaises(ValueError):
                    build.render(data)


if __name__ == '__main__':
    unittest.main()
