// ========================================
// SATURN RETURN CALCULATOR
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    const calculatorForm = document.getElementById('saturn-calculator');
    const resultsPanel = document.getElementById('results-panel');
    const emailForm = document.getElementById('email-form');
    
    if (calculatorForm) {
        calculatorForm.addEventListener('submit', handleCalculatorSubmit);
    }
    
    if (emailForm) {
        emailForm.addEventListener('submit', handleEmailSubmit);
    }
});

// Handle calculator form submission
function handleCalculatorSubmit(e) {
    e.preventDefault();
    
    const birthDateInput = document.getElementById('birth-date');
    const birthDate = new Date(birthDateInput.value);
    
    if (!birthDateInput.value) {
        showNotification('Please enter your birth date.', 'error');
        return;
    }
    
    // Calculate Saturn Return
    const saturnReturn = calculateSaturnReturn(birthDate);
    
    // Display results
    displayResults(saturnReturn);
    
    // Scroll to results
    const resultsPanel = document.getElementById('results-panel');
    if (resultsPanel) {
        resultsPanel.style.display = 'block';
        resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Calculate Saturn Return dates
function calculateSaturnReturn(birthDate) {
    // Saturn orbit is approximately 29.5 years
    const saturnOrbitYears = 29.5;
    const saturnOrbitMs = saturnOrbitYears * 365.25 * 24 * 60 * 60 * 1000;
    
    // Calculate potential return dates
    const firstReturnDate = new Date(birthDate.getTime() + saturnOrbitMs);
    const secondReturnDate = new Date(birthDate.getTime() + (saturnOrbitMs * 2));
    const thirdReturnDate = new Date(birthDate.getTime() + (saturnOrbitMs * 3));
    
    const now = new Date();
    
    // Determine which return is next
    let nextReturn, returnNumber, previousReturn;
    
    if (now < firstReturnDate) {
        nextReturn = firstReturnDate;
        returnNumber = 1;
        previousReturn = null;
    } else if (now < secondReturnDate) {
        nextReturn = secondReturnDate;
        returnNumber = 2;
        previousReturn = firstReturnDate;
    } else if (now < thirdReturnDate) {
        nextReturn = thirdReturnDate;
        returnNumber = 3;
        previousReturn = secondReturnDate;
    } else {
        // Past third return
        nextReturn = thirdReturnDate;
        returnNumber = 3;
        previousReturn = secondReturnDate;
    }
    
    // Calculate return window (12 months)
    const returnWindowStart = new Date(nextReturn);
    returnWindowStart.setMonth(returnWindowStart.getMonth() - 1);
    
    const returnWindowEnd = new Date(nextReturn);
    returnWindowEnd.setMonth(returnWindowEnd.getMonth() + 11);
    
    // Calculate peak period (3 months around exact return)
    const peakStart = new Date(nextReturn);
    peakStart.setMonth(peakStart.getMonth() - 1);
    
    const peakEnd = new Date(nextReturn);
    peakEnd.setMonth(peakEnd.getMonth() + 2);
    
    // Calculate age at return
    const ageAtReturn = calculateAge(birthDate, nextReturn);
    
    // Calculate countdown
    const timeUntil = nextReturn - now;
    const monthsUntil = Math.floor(timeUntil / (1000 * 60 * 60 * 24 * 30));
    const daysUntil = Math.floor((timeUntil % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
    
    // Determine zodiac sign of Saturn at return
    const saturnSign = getSaturnSign(nextReturn);
    
    return {
        birthDate,
        exactDate: nextReturn,
        returnNumber,
        windowStart: returnWindowStart,
        windowEnd: returnWindowEnd,
        peakStart,
        peakEnd,
        ageAtReturn,
        monthsUntil,
        daysUntil,
        saturnSign,
        hasPassed: now > returnWindowEnd
    };
}

// Get Saturn's zodiac sign (simplified calculation)
function getSaturnSign(date) {
    // Simplified: Saturn spends about 2.5 years in each sign
    // This is a rough approximation for display purposes
    const signs = [
        'Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini',
        'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius'
    ];
    
    // Saturn entered Pisces in March 2023
    // Rough calculation based on that
    const piscesStart = new Date('2023-03-07');
    const monthsSincePisces = (date - piscesStart) / (1000 * 60 * 60 * 24 * 30);
    const signIndex = Math.floor((monthsSincePisces / 30) + 2) % 12; // 2 = Pisces index
    
    return signs[signIndex];
}

// Display results on the page
function displayResults(saturnReturn) {
    // Update date display
    const returnDateEl = document.getElementById('return-date');
    if (returnDateEl) {
        returnDateEl.textContent = formatDate(saturnReturn.exactDate);
    }
    
    // Update age
    const returnAgeEl = document.getElementById('return-age');
    if (returnAgeEl) {
        const ageText = saturnReturn.returnNumber === 1 
            ? `${saturnReturn.ageAtReturn.years} years, ${saturnReturn.ageAtReturn.months} months`
            : `${saturnReturn.ageAtReturn.years} years`;
        returnAgeEl.textContent = ageText;
    }
    
    // Update peak period
    const peakPeriodEl = document.getElementById('peak-period');
    if (peakPeriodEl) {
        const peakText = `${formatDate(saturnReturn.peakStart)} - ${formatDate(saturnReturn.peakEnd)}`.replace(/, \d{4}/g, '');
        peakPeriodEl.textContent = peakText;
    }
    
    // Update countdown
    const monthsEl = document.getElementById('countdown-months');
    const daysEl = document.getElementById('countdown-days');
    
    if (monthsEl) monthsEl.textContent = Math.max(0, saturnReturn.monthsUntil);
    if (daysEl) daysEl.textContent = Math.max(0, saturnReturn.daysUntil);
    
    // Store result for email capture
    window.saturnReturnResult = saturnReturn;
}

// Handle email form submission
function handleEmailSubmit(e) {
    e.preventDefault();
    
    const emailInput = e.target.querySelector('input[type="email"]');
    const email = emailInput.value;
    
    if (!email) {
        showNotification('Please enter your email address.', 'error');
        return;
    }
    
    // Get the calculated result
    const result = window.saturnReturnResult;
    
    if (!result) {
        showNotification('Please calculate your Saturn Return first.', 'error');
        return;
    }
    
    // Prepare data for submission
    const formData = {
        email,
        birthDate: result.birthDate,
        saturnReturnDate: result.exactDate,
        returnNumber: result.returnNumber,
        ageAtReturn: result.ageAtReturn,
        saturnSign: result.saturnSign
    };
    
    // Simulate submission (replace with actual API call)
    console.log('Submitting:', formData);
    
    // Show success message
    showNotification('Your Saturn Return guide has been sent to your email!', 'success');
    
    // Clear form
    emailInput.value = '';
    
    // Optional: Redirect to thank you page
    // window.location.href = '/thank-you.html';
}

// Get personalized guidance based on return number
function getReturnGuidance(returnNumber) {
    const guidance = {
        1: {
            title: "Your First Saturn Return",
            themes: ["Career direction", "Commitment in relationships", "Claiming authority", "Leaving childhood behind"],
            advice: "This is your astrological coming-of-age. Saturn will test your foundations and demand you build structures that can last."
        },
        2: {
            title: "Your Second Saturn Return",
            themes: ["Legacy building", "Wisdom crystallization", "Becoming the elder", "Life purpose review"],
            advice: "You've built your structures. Now Saturn asks: What will you leave behind? It's time to shift from achieving to teaching."
        },
        3: {
            title: "Your Third Saturn Return",
            themes: ["Spiritual mastery", "Completion of cycles", "Transcendence", "Final wisdom"],
            advice: "A rare and powerful Return. Saturn comes to crown a lifetime of work with spiritual understanding."
        }
    };
    
    return guidance[returnNumber] || guidance[1];
}

// Get preparation checklist based on Saturn sign
function getPreparationChecklist(saturnSign) {
    const checklists = {
        'Capricorn': [
            'Review career structures and long-term goals',
            'Take responsibility for your ambitions',
            'Build systems that can last'
        ],
        'Aquarius': [
            'Examine your community and social networks',
            'Take responsibility for your unique vision',
            'Build structures that serve the collective'
        ],
        'Pisces': [
            'Confront illusions and spiritual bypassing',
            'Take responsibility for your sensitivity',
            'Build structures that honor your intuition'
        ],
        'Aries': [
            'Master assertiveness without aggression',
            'Take responsibility for your initiations',
            'Build structures that support independence'
        ],
        'Taurus': [
            'Review financial and material security',
            'Take responsibility for your resources',
            'Build structures that provide stability'
        ],
        'Gemini': [
            'Master communication and learning',
            'Take responsibility for your words',
            'Build structures for knowledge sharing'
        ],
        'Cancer': [
            'Examine family patterns and emotional foundations',
            'Take responsibility for your nurturing',
            'Build structures that provide safety'
        ],
        'Leo': [
            'Master creative self-expression',
            'Take responsibility for your leadership',
            'Build structures that showcase your gifts'
        ],
        'Virgo': [
            'Review health and daily routines',
            'Take responsibility for your service',
            'Build structures that support wellbeing'
        ],
        'Libra': [
            'Examine relationship patterns',
            'Take responsibility for your partnerships',
            'Build structures that support balance'
        ],
        'Scorpio': [
            'Confront fears and shadow material',
            'Take responsibility for your power',
            'Build structures that support transformation'
        ],
        'Sagittarius': [
            'Review beliefs and life philosophy',
            'Take responsibility for your truth',
            'Build structures that support expansion'
        ]
    };
    
    return checklists[saturnSign] || checklists['Capricorn'];
}
