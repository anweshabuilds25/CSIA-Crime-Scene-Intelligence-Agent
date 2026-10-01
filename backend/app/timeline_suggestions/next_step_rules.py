from app.shared.exceptions import InsufficientDataError

OBJECT_SUGGESTION_RULES = {
    "knife": "A knife was detected in the evidence. Suggest documenting it as physical evidence and checking for nearby CCTV coverage.",
    "backpack": "A bag was detected in the frame. Suggest checking if it was recovered or left at the scene.",
}

EVIDENCE_GAP_RULES = [
    {
        "trigger_objects": {"knife"},
        "missing_evidence_type": "cctv_frame",
        "suggestion": "A potential weapon was detected but no CCTV footage has been uploaded for this case yet. Suggest checking nearby CCTV.",
    },
    {
        "trigger_objects": {"knife", "backpack"},
        "missing_evidence_type": "witness_statement",
        "suggestion": "Physical evidence was detected but no witness statement exists yet. Suggest following up for a statement.",
    },
]

# (keywords that must appear in statement text, suggestion)
STATEMENT_KEYWORD_RULES = [
    (("backpack", "black bag", "bag"),
     "Witness describes the person carrying a bag. Suggest asking the witness for the bag's size, colour and brand, and checking nearby CCTV for the bag."),
    (("unknown man", "another man", "someone else", "two men", "two people"),
     "Witness saw the person with an unidentified individual. Suggest interrogating the witness for a detailed description of the second person and arranging a sketch or photo identification."),
    (("did not see where", "didn't see where", "don't know where", "not sure where"),
     "Witness lost sight of the subjects. Suggest canvassing nearby shops and checking CCTV along the likely exit routes."),
    (("parking", "entrance", "bus stand", "station"),
     "Location with possible cameras was mentioned. Suggest collecting CCTV footage from the parking area and entrance around the stated time."),
    (("wallet", "dropped", "dropping"),
     "An item was reported dropped or found. Suggest securing it as physical evidence, recording its custody, and checking it for fingerprints and ID."),
]


def _text_of(evidence) -> str:
    if isinstance(evidence, dict):
        meta = evidence.get("extra_metadata", {}) or {}
        desc = evidence.get("description") or ""
    else:
        meta = evidence.extra_metadata or {}
        desc = evidence.description or ""
    full = meta.get("full_text") or meta.get("statement_full_text") or ""
    return f"{desc} {full}".lower()


def _type_of(evidence):
    if isinstance(evidence, dict):
        return evidence.get("evidence_type")
    t = evidence.evidence_type
    return t.value if hasattr(t, "value") else t


def generate_suggestions(evidence_list: list, existing_evidence_types: list[str] | None = None) -> list[str]:
    if not evidence_list:
        raise InsufficientDataError("No evidence available to generate suggestions.")

    detected_classes: set[str] = set()
    derived_types: set[str] = set()
    statement_text = ""
    has_statement = False

    for evidence in evidence_list:
        if isinstance(evidence, dict):
            metadata = evidence.get("extra_metadata", {}) or {}
        else:
            metadata = evidence.extra_metadata or {}

        detections = metadata.get("yolo_detections", []) or []
        detected_classes.update(d for d in detections if isinstance(d, str))

        etype = _type_of(evidence)
        if etype:
            derived_types.add(etype)
        if etype == "witness_statement":
            has_statement = True
            statement_text += " " + _text_of(evidence)

    existing = set(existing_evidence_types) if existing_evidence_types else derived_types

    suggestions: list[str] = []

    if has_statement:
        suggestions.append(
            "A witness statement is on record. Suggest interrogating the witness again to confirm the timeline, "
            "the suspect's description and the exact location, and to resolve any gaps in the account."
        )
        for keywords, text in STATEMENT_KEYWORD_RULES:
            if any(k in statement_text for k in keywords):
                suggestions.append(text)

    for class_name in detected_classes:
        if class_name in OBJECT_SUGGESTION_RULES:
            suggestions.append(OBJECT_SUGGESTION_RULES[class_name])

    for rule in EVIDENCE_GAP_RULES:
        if (rule["trigger_objects"] & detected_classes) and rule["missing_evidence_type"] not in existing:
            suggestions.append(rule["suggestion"])

    if has_statement and "cctv_frame" not in existing:
        suggestions.append("No CCTV evidence is attached yet. Suggest requesting footage from nearby cameras.")

    if not suggestions:
        suggestions.append("No specific next steps triggered by this evidence. Manual review recommended.")

    # de-duplicate, keep order
    seen, unique = set(), []
    for s in suggestions:
        if s not in seen:
            seen.add(s)
            unique.append(s)
    return unique