const fs = require('fs');

// Read source files
const streamsData = JSON.parse(fs.readFileSync('streams.json', 'utf-8'));
const questionsData = JSON.parse(fs.readFileSync('questions.json', 'utf-8'));

// 1. Extract constraints (criteria) from questions.json
const criteria = new Set();
questionsData.core_questions.forEach(q => criteria.add(q.criterion));
Object.values(questionsData.stream_specific_questions).forEach(questions => {
    questions.forEach(q => criteria.add(q.criterion));
});

const criteriaList = Array.from(criteria);
console.log("Extracted Criteria:", criteriaList);

// 2. Extract all unique courses from streams.json
const allCourses = new Set();
Object.values(streamsData).forEach(stream => {
    stream.combinations.forEach(combo => {
        combo.courses.forEach(c => allCourses.add(c));
        if (combo.new_courses) {
            combo.new_courses.forEach(c => allCourses.add(c));
        }
    });
});
const courses = Array.from(allCourses);
console.log(`Extracted ${courses.length} unique courses.`);

// 3. Heuristic scoring logic function
function calculateCourseScores(courseName) {
    const scores = {
        stability: 2,
        analytical: 2,
        income_priority: 2,
        years_willing: 2,
        financial_support: 2,
        competitive_confidence: 2,
        sector_preference: 2,
        math_comfort: 2,
        research_interest: 2,
        stress_tolerance: 2
    };

    const name = courseName.toLowerCase();

    // Engineering & Technology
    if (name.includes('b.tech') || name.includes('be ') || name.includes('engineering') || name.includes('computer')) {
        scores.stability = 3;
        scores.analytical = 4;
        scores.income_priority = 4;
        scores.years_willing = 2; // B.Tech is 4 years
        scores.financial_support = 3;
        scores.competitive_confidence = 4; // JEE and other entrance exams
        scores.sector_preference = 1; // private largely
        scores.math_comfort = 4;
        scores.stress_tolerance = 3;
    }
    // Medicine & Healthcare
    else if (name.includes('mbbs') || name.includes('bds') || name.includes('medicine') || name.includes('nursing') || name.includes('b.pharm')) {
        scores.stability = 4; // Very stable
        scores.analytical = 4;
        scores.income_priority = 4;
        scores.years_willing = 4; // 5.5+ years
        scores.financial_support = 4; // Expensive
        scores.competitive_confidence = 4; // NEET
        scores.sector_preference = 2; // Both private and government
        scores.math_comfort = 2;
        scores.research_interest = 3;
        scores.stress_tolerance = 4; // High stress
    }
    // Basic Sciences & Research
    else if (name.includes('b.sc') || name.includes('science') || name.includes('physics') || name.includes('chemistry') || name.includes('biology')) {
        scores.stability = 2;
        scores.analytical = 3;
        scores.income_priority = 2;
        scores.years_willing = 3; // BSc + MSc typically needed (3+2 years)
        scores.financial_support = 2;
        scores.competitive_confidence = 3;
        scores.sector_preference = 3; // Govt jobs, research
        scores.math_comfort = name.includes('math') || name.includes('physics') ? 4 : 2;
        scores.research_interest = 4;
        scores.stress_tolerance = 3;
    }
    // Humanities, Arts & Social Sciences
    else if (name.includes('ba ') || name.includes('bsw') || name.includes('humanities') || name.includes('history') || name.includes('political') || name.includes('sociology')) {
        scores.stability = 2;
        scores.analytical = 1; // Creative / reading heavy
        scores.income_priority = 1;
        scores.years_willing = 3; // BA + MA
        scores.financial_support = 1; // Lower cost
        scores.competitive_confidence = 2;
        scores.sector_preference = 4; // Civil services, academia, public policy
        scores.math_comfort = 1;
        scores.research_interest = 3;
        scores.stress_tolerance = 2;
    }
    // Commerce, Finance, Management
    else if (name.includes('b.com') || name.includes('bba') || name.includes('finance') || name.includes('accounting') || name.includes('economics')) {
        scores.stability = 3;
        scores.analytical = 3;
        scores.income_priority = 4;
        scores.years_willing = 2; // 3-4 years
        scores.financial_support = 2;
        scores.competitive_confidence = 3; // CA/CS/CMA competitive
        scores.sector_preference = 1; // Private and corporate
        scores.math_comfort = 3;
        scores.stress_tolerance = 3;
    }
    // Law
    else if (name.includes('llb') || name.includes('law')) {
        scores.stability = 3;
        scores.analytical = 3; // Logical
        scores.income_priority = 3;
        scores.years_willing = 3; // 5 years integrated
        scores.financial_support = 3;
        scores.competitive_confidence = 4; // CLAT
        scores.sector_preference = 2;
        scores.math_comfort = 1;
        scores.stress_tolerance = 4;
    }
    // Fine Arts, Media, Design
    else if (name.includes('design') || name.includes('fine arts') || name.includes('music') || name.includes('architecture') || name.includes('media') || name.includes('journalism')) {
        scores.stability = 1; // Highly dynamic
        scores.analytical = 1; // Creative
        scores.income_priority = 2;
        scores.years_willing = 2;
        scores.financial_support = 3;
        scores.competitive_confidence = 3; // NIFT, NID etc.
        scores.sector_preference = 1; // Private / freelance
        scores.math_comfort = 1;
        scores.stress_tolerance = 2;
    }

    return scores;
}

// 4. Create Matrix Logic
const courseMatrix = {};

courses.forEach(course => {
    courseMatrix[course] = calculateCourseScores(course);
});

// Write to course_matrix.json
fs.writeFileSync('course_matrix.json', JSON.stringify(courseMatrix, null, 2));
console.log('Successfully created course_matrix.json');
