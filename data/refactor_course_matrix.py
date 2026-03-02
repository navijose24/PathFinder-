import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent
MATRIX_PATH = ROOT / "course_matrix.json"


PREFERENCE_TRAITS = [
    "stability",
    "analytical",
    "income_priority",
    "sector_preference",
    "math_comfort",
    "research_interest",
    "stress_tolerance",
    "creativity",
    "entrepreneurship_interest",
    "public_speaking",
    "digital_skill",
    "policy_interest",
    "professional_exam_commitment",
]

CONSTRAINT_TRAITS = [
    "years_willing",
    "financial_support",
    "competitive_confidence",
]

ALL_TRAITS_ORDER = [
    "stability",
    "analytical",
    "income_priority",
    "years_willing",
    "financial_support",
    "competitive_confidence",
    "sector_preference",
    "math_comfort",
    "research_interest",
    "stress_tolerance",
    "creativity",
    "entrepreneurship_interest",
    "public_speaking",
    "digital_skill",
    "policy_interest",
    "professional_exam_commitment",
]


def clamp(v: int, lo: int = 1, hi: int = 4) -> int:
    return max(lo, min(hi, int(round(v))))


def keyword_in(name_l: str, keywords) -> bool:
    return any(kw in name_l for kw in keywords)


def assign_new_traits(course_name: str, traits: dict) -> None:
    name_l = course_name.lower()

    creativity = 2
    entrepreneurship = 2
    public_speaking = 2
    digital = 2
    policy = 1
    exam_commitment = 2

    if keyword_in(
        name_l,
        [
            "design",
            "fine arts",
            "animation",
            "film",
            "media",
            "journalism",
            "mass communication",
            "visual communication",
            "fashion",
            "textile",
            "architecture",
            "interior",
            "performing arts",
            "music",
        ],
    ):
        creativity = 4
    elif keyword_in(name_l, ["english", "literature", "linguistics", "languages"]):
        creativity = 3
    elif keyword_in(name_l, ["engineering", "technology", "science", "mathematics"]):
        creativity = 2
    else:
        if keyword_in(name_l, ["history", "sociology", "psychology", "philosophy"]):
            creativity = 3

    if keyword_in(
        name_l,
        [
            "bba",
            "mba",
            "business",
            "management",
            "commerce",
            "marketing",
            "finance",
            "entrepreneurship",
            "startup",
        ],
    ):
        entrepreneurship = 3
        if "entrepreneur" in name_l:
            entrepreneurship = 4
    elif keyword_in(name_l, ["economics", "econometrics"]):
        entrepreneurship = 2

    if keyword_in(
        name_l,
        [
            "journalism",
            "mass communication",
            "media",
            "public relations",
            "pr ",
            "law",
            "llb",
            "ll.m",
            "llm",
            "education",
            "b.ed",
            "bed ",
            "teacher",
            "teaching",
            "hotel management",
            "hospitality",
            "event management",
        ],
    ):
        public_speaking = 3
        if keyword_in(name_l, ["journalism", "mass communication", "public relations", "law", "llb"]):
            public_speaking = 4
    elif keyword_in(name_l, ["nursing", "social work", "counselling", "psychology"]):
        public_speaking = 2

    if keyword_in(
        name_l,
        [
            "computer",
            "information technology",
            "it ",
            "bca",
            "software",
            "data",
            "ai",
            "machine learning",
            "ml ",
            "cs ",
            "cyber",
            "web",
            "app development",
            "application development",
            "game",
            "gaming",
            "multimedia",
            "animation",
            "graphics",
            "ui/ux",
            "ux",
            "cloud",
        ],
    ):
        digital = 4
    elif keyword_in(name_l, ["engineering", "technology"]):
        digital = max(digital, 3)
    elif keyword_in(name_l, ["ba", "b.a", "bachelor of arts", "b.com", "b. com"]):
        digital = min(digital, 2)

    if keyword_in(
        name_l,
        [
            "political science",
            "public policy",
            "governance",
            "civics",
            "administration",
            "public administration",
            "international relations",
            "ir ",
            "government",
        ],
    ):
        policy = 4
    elif keyword_in(name_l, ["economics", "sociology", "law", "llb"]):
        policy = 3
    elif keyword_in(name_l, ["commerce", "management", "business"]):
        policy = 2

    if keyword_in(
        name_l,
        [
            "ca foundation",
            "chartered accountant",
            "cma",
            "cost management accounting",
            "cs ",
            "company secretary",
            "acca",
            "actuarial",
            "mbbs",
            "bds",
            "b.pharm",
            "b pharm",
            "pharm d",
            "nursing",
            "gate",
            "upsc",
            "civil services",
            "judicial services",
        ],
    ):
        exam_commitment = 4
    elif keyword_in(name_l, ["engineering", "law", "architecture", "b.tech", "btech", "llb"]):
        exam_commitment = max(exam_commitment, 3)
    elif keyword_in(name_l, ["diploma", "certificate"]):
        exam_commitment = min(exam_commitment, 2)

    traits["creativity"] = clamp(creativity)
    traits["entrepreneurship_interest"] = clamp(entrepreneurship)
    traits["public_speaking"] = clamp(public_speaking)
    traits["digital_skill"] = clamp(digital)
    traits["policy_interest"] = clamp(policy)
    traits["professional_exam_commitment"] = clamp(exam_commitment)


def adjust_constraints(course_name: str, traits: dict) -> None:
    name_l = course_name.lower()

    years = int(traits.get("years_willing", 2))
    finance = int(traits.get("financial_support", 2))
    comp_conf = int(traits.get("competitive_confidence", 2))

    is_diploma = keyword_in(name_l, ["diploma", "certificate"])

    very_long_keywords = [
        "mbbs",
        "bds",
        "ca foundation",
        "chartered accountant",
        "actuarial",
    ]
    long_keywords = [
        "b.pharm",
        "b pharm",
        "pharm d",
        "nursing",
        "integrated mba",
        "quantitative finance",
        "financial engineering",
        "cma",
        "cost management accounting",
        "cs ",
        "company secretary",
        "architecture",
        "b.arch",
        "ba llb",
        "bba llb",
    ]

    if is_diploma:
        years = min(years, 2)
    elif keyword_in(name_l, very_long_keywords):
        years = max(years, 4)
    elif keyword_in(name_l, long_keywords):
        years = max(years, 3)
    else:
        if keyword_in(
            name_l,
            ["ba ", "b.a", "bachelor of arts", "b.com", "b. com", "bcom "],
        ) and not keyword_in(
            name_l,
            [
                "honours",
                "hons",
                "journalism",
                "mass communication",
                "law",
                "llb",
                "economics",
                "statistics",
                "psychology",
            ],
        ):
            years = min(years, 2)

    expensive_keywords = [
        "mbbs",
        "bds",
        "b.pharm",
        "b pharm",
        "pharm d",
        "nursing",
        "engineering",
        "b.tech",
        "btech",
        "architecture",
        "b.arch",
        "aviation",
        "pilot",
        "international",
        "global",
        "foreign",
        "overseas",
        "integrated mba",
        "mba",
        "hotel management",
    ]

    if is_diploma:
        finance = min(finance, 2)
    elif keyword_in(name_l, expensive_keywords):
        finance = max(finance, 3)
    else:
        if keyword_in(
            name_l,
            ["ba ", "b.a", "bachelor of arts", "b.com", "b. com", "bsc", "b.sc"],
        ):
            finance = min(finance, 3)

    high_comp_keywords = very_long_keywords + long_keywords + [
        "engineering",
        "b.tech",
        "btech",
        "architecture",
        "b.arch",
        "law",
        "llb",
        "mbbs",
        "bds",
    ]

    if is_diploma:
        comp_conf = min(comp_conf, 2)
    elif keyword_in(name_l, high_comp_keywords):
        comp_conf = max(comp_conf, 3)
        if keyword_in(name_l, very_long_keywords + ["ca", "cma", "cs "]):
            comp_conf = max(comp_conf, 4)
    else:
        if keyword_in(
            name_l,
            ["ba ", "b.a", "bachelor of arts", "b.com", "b. com", "bsc", "b.sc"],
        ):
            comp_conf = min(comp_conf, 3)

    traits["years_willing"] = clamp(years)
    traits["financial_support"] = clamp(finance)
    traits["competitive_confidence"] = clamp(comp_conf)


def ensure_all_traits(course_name: str, traits: dict) -> None:
    for key in [
        "stability",
        "analytical",
        "income_priority",
        "years_willing",
        "financial_support",
        "competitive_confidence",
        "sector_preference",
        "math_comfort",
        "research_interest",
        "stress_tolerance",
    ]:
        traits.setdefault(key, 2)

    adjust_constraints(course_name, traits)
    assign_new_traits(course_name, traits)

    for key in ALL_TRAITS_ORDER:
        traits[key] = clamp(traits.get(key, 2))


def make_vectors_unique(matrix: dict) -> None:
    vector_to_courses = {}
    order = list(ALL_TRAITS_ORDER)

    for name, traits in matrix.items():
        vec = tuple(traits[k] for k in order)
        vector_to_courses.setdefault(vec, []).append(name)

    for vec, courses in list(vector_to_courses.items()):
        if len(courses) <= 1:
            continue

        for course_name in courses[1:]:
            traits = matrix[course_name]

            adjusted = False
            for key in PREFERENCE_TRAITS:
                old_val = traits.get(key, 2)
                for delta in (1, -1):
                    new_val = old_val + delta
                    if not (1 <= new_val <= 4):
                        continue
                    traits[key] = new_val
                    new_vec = tuple(traits[k] for k in order)
                    if new_vec not in vector_to_courses:
                        vector_to_courses.setdefault(new_vec, []).append(course_name)
                        adjusted = True
                        break
                    traits[key] = old_val
                if adjusted:
                    break

            if not adjusted:
                key = "stability"
                old_val = traits.get(key, 2)
                new_val = 4 if old_val < 4 else 3
                traits[key] = new_val
                new_vec = tuple(traits[k] for k in order)
                vector_to_courses.setdefault(new_vec, []).append(course_name)


def main() -> None:
    data = json.loads(MATRIX_PATH.read_text(encoding="utf-8"))

    for course_name, traits in data.items():
        ensure_all_traits(course_name, traits)

    make_vectors_unique(data)

    MATRIX_PATH.write_text(
        json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8"
    )


if __name__ == "__main__":
    main()

