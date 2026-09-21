#!/usr/bin/env bash
set -euo pipefail

demo_url="${APPLYGUARD_URL:-https://applyguard-by-qasim.hammad-qasim16.chatgpt.site}"

browser-use <<PY
from pathlib import Path

target = "${demo_url}/demo-application"
matching = next((tab for tab in list_tabs(include_chrome=False) if tab.get("url") == target), None)
if matching:
    switch_tab(matching["targetId"])
    goto_url(target)
else:
    new_tab(target)
wait_for_load()
activate_tab(current_tab())
start_recording("applyguard-safe-fill", title="ApplyGuard — verified browser fill")

def field(name):
    nodes = cdp("Accessibility.getFullAXTree")["nodes"]
    for node in nodes:
        role = node.get("role", {}).get("value")
        label = node.get("name", {}).get("value")
        if role in ("textbox", "combobox") and label == name:
            return node
    raise RuntimeError(f"Field not found: {name}")

def fill(name, element_id, value):
    for _ in range(2):
        node = field(name)
        cdp("DOM.focus", backendNodeId=node["backendDOMNodeId"])
        press_key("a", modifiers=4)
        press_key("Backspace")
        type_text(value)
        actual = js(f"document.querySelector('#{element_id}').value")
        if actual == value:
            return
    raise RuntimeError(f"Could not fill {name}: got {actual!r}")

fill("Full name", "full-name", "Alex Morgan")
fill("Email", "email", "alex.morgan@example.com")
fill("Phone", "phone", "+1 202 555 0148")
fill("Location", "location", "Washington, DC")
fill("Years of experience", "experience", "9+ years")
fill("Employers in the last 10 years", "employers", "3")
fill("Notice period", "notice", "One month")

# Deliberately untouched: gender, candidate statement, privacy consent, submit.
summary = js("""JSON.stringify({
  fullName: document.querySelector('#full-name').value,
  email: document.querySelector('#email').value,
  phone: document.querySelector('#phone').value,
  location: document.querySelector('#location').value,
  experience: document.querySelector('#experience').value,
  employers: document.querySelector('#employers').value,
  notice: document.querySelector('#notice').value,
  gender: document.querySelector('#gender').value,
  statement: document.querySelector('#statement').value,
  privacyConsent: document.querySelector('#privacy-consent').checked,
  submitted: false
})""")
print(summary)
print(stop_recording())
PY
