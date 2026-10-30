/* Multi-question knowledge check behaviour. No words live here: edit index.html instead. */
(function () {
  "use strict";
  var root = document.querySelector("[data-kc]");
  if (!root) return;
  var questions = Array.prototype.slice.call(root.querySelectorAll("[data-question]"));
  var done = root.querySelector("[data-done]");
  var count = root.querySelector("[data-count]");
  var titles = { correct: root.getAttribute("data-title-correct"), wrong: root.getAttribute("data-title-wrong") };
  var current = 0;
  var finished = false;
  var resets = [];
  var retry = root.querySelector("[data-retry]");

  function complete() {
    try { window.parent.postMessage({ type: "complete" }, "*"); } catch (e) {}
  }

  function setup(q, index) {
    var form = q.querySelector("[data-form]");
    var opts = Array.prototype.slice.call(q.querySelectorAll("[data-option]"));
    var error = q.querySelector("[data-error]");
    var check = q.querySelector("[data-check]");
    var next = q.querySelector("[data-next]");
    var fb = q.querySelector("[data-feedback]");
    var fbTitle = q.querySelector("[data-feedback-title]");
    var fbText = q.querySelector("[data-feedback-text]");
    var fbGlyphOk = q.querySelector("[data-glyph-correct]");
    var fbGlyphNo = q.querySelector("[data-glyph-wrong]");
    var answered = false;

    form.addEventListener("change", function () { error.hidden = true; });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (answered) return;
      var chosen = opts.filter(function (o) { return o.querySelector("input").checked; })[0];
      if (!chosen) { error.hidden = false; return; }

      var right = chosen.getAttribute("data-correct") === "true";
      var tone = right ? "correct" : "wrong";
      chosen.setAttribute("data-result", tone);
      var input = chosen.querySelector("input");
      input.checked = false;
      input.disabled = true;

      fb.setAttribute("data-tone", tone);
      fbTitle.textContent = titles[tone];
      fbGlyphOk.hidden = !right;
      fbGlyphNo.hidden = right;
      fbText.textContent = chosen.querySelector("[data-feedback-for]").textContent;
      fb.hidden = false;
      fb.focus();

      if (right) {
        answered = true;
        opts.forEach(function (o) { o.querySelector("input").disabled = true; });
        check.hidden = true;
        next.hidden = false;
      }
    });

    resets.push(function () {
      answered = false;
      opts.forEach(function (o) {
        var i = o.querySelector("input");
        o.removeAttribute("data-result");
        i.checked = false;
        i.disabled = false;
      });
      error.hidden = true;
      fb.hidden = true;
      fb.removeAttribute("data-tone");
      check.hidden = false;
      next.hidden = true;
    });

    next.addEventListener("click", function () {
      if (index < questions.length - 1) {
        show(index + 1);
      } else {
        finish();
      }
    });
  }

  function show(index) {
    current = index;
    questions.forEach(function (q, i) { q.hidden = i !== index; });
    count.textContent = "Question " + (index + 1) + " of " + questions.length;
    questions[index].querySelector("h2").focus();
  }

  function finish() {
    questions.forEach(function (q) { q.hidden = true; });
    done.hidden = false;
    count.textContent = "Complete";
    done.querySelector("[data-done-title]").focus();
    if (!finished) { finished = true; complete(); }
  }

  function restart() {
    resets.forEach(function (r) { r(); });
    done.hidden = true;
    show(0);
  }

  if (retry) retry.addEventListener("click", restart);

  questions.forEach(setup);
})();
