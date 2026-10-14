var STARTER = {
  "index.html": '<!DOCTYPE html>\n<html>\n<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Hello!</h1>\n  <button id="btn">Tap me</button>\n  <p id="out"></p>\n  <script src="script.js"><\/script>\n</body>\n</html>',
  "style.css": 'body {\n  font-family: sans-serif;\n  text-align: center;\n  padding: 30px;\n  background: #eef3ff;\n}\nbutton {\n  padding: 10px 20px;\n  font-size: 18px;\n}',
  "script.js": 'var n = 0;\ndocument.getElementById("btn").onclick = function () {\n  n++;\n  document.getElementById("out").textContent = "Taps: " + n;\n};'
};
var KEY = "live-editor-files-v1";
var files, current = "index.html", timer;
try { files = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
if (!files || !files["index.html"]) files = JSON.parse(JSON.stringify(STARTER));

var code = document.getElementById("code"),
    frame = document.getElementById("frame"),
    tabs = document.getElementById("tabs");

function save() { try { localStorage.setItem(KEY, JSON.stringify(files)); } catch (e) {} }

function build() {
  var html = files["index.html"] || "";
  var css = files["style.css"] || "", js = files["script.js"] || "";
  html = html.replace(/<link[^>]+href=["']style\.css["'][^>]*>/i, function () { return "<style>" + css + "</style>"; });
  html = html.replace(/<script[^>]+src=["']script\.js["'][^>]*>\s*<\/script>/i, function () {
    return "<script>" + js.replace(/<\/script/gi, "<\\/script") + "<\/script>";
  });
  return html;
}
function run() { frame.srcdoc = build(); }

function renderTabs() {
  tabs.innerHTML = "";
  Object.keys(files).forEach(function (name) {
    var b = document.createElement("button");
    b.textContent = name;
    if (name === current) b.className = "on";
    b.onclick = function () { current = name; code.value = files[name]; renderTabs(); };
    tabs.appendChild(b);
  });
}

function insert(t) {
  code.setRangeText(t, code.selectionStart, code.selectionEnd, "end");
  code.focus();
  code.dispatchEvent(new Event("input"));
}

code.addEventListener("input", function () {
  files[current] = code.value; save();
  clearTimeout(timer); timer = setTimeout(run, 400);
});
code.addEventListener("keydown", function (e) {
  if (e.key === "Tab") { e.preventDefault(); insert("  "); }
});

["Tab", "<", ">", "/", "=", '"', "'", ";", "(", ")", "{", "}", "[", "]", ":", "#", ".", "!"].forEach(function (k) {
  var b = document.createElement("button");
  b.textContent = k === "Tab" ? "⇥" : k;
  b.addEventListener("mousedown", function (ev) { ev.preventDefault(); });
  b.onclick = function () { insert(k === "Tab" ? "  " : k); };
  document.getElementById("keys").appendChild(b);
});

document.querySelectorAll("[data-v]").forEach(function (b) {
  b.onclick = function () {
    document.querySelectorAll("[data-v]").forEach(function (x) { x.classList.remove("on"); });
    b.classList.add("on");
    var v = b.dataset.v;
    document.getElementById("editorWrap").classList.toggle("hide", v === "view");
    document.getElementById("previewWrap").classList.toggle("hide", v === "code");
  };
});

document.getElementById("reset").onclick = function () {
  if (confirm("Reset all files to the starter project?")) {
    files = JSON.parse(JSON.stringify(STARTER)); save();
    code.value = files[current]; run();
  }
};

code.value = files[current];
renderTabs();
run();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js"); });
}
