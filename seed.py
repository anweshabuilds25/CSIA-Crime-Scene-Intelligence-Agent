import json, requests
B = "http://localhost:8000/api/v1"
s = json.load(open("backend/sample_case.json")); ev = s.pop("evidence_items")
for k in ("id", "created_at", "updated_at", "closed_at"): s.pop(k)
cid = requests.post(f"{B}/cases", json=s).json()["id"]
for e in ev:
    for k in ("id", "case_id", "created_at", "updated_at", "chain_of_custody"): e.pop(k)
    requests.post(f"{B}/cases/{cid}/evidence", json=e)
print("seeded", cid)