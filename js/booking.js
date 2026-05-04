// ========================================
// BOOKING SYSTEM
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    initServiceSelection();
    initCalendar();
    initTimeSlots();
    initBookingForm();
});

// Service Selection
function initServiceSelection() {
    const serviceOptions = document.querySelectorAll('input[name="service"]');
    
    serviceOptions.forEach(option => {
        option.addEventListener('change', function() {
            updateBookingSummary();
            updateAvailableDates();
        });
    });
    
    // Check for pre-selected service in URL
    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get('service');
    const packageParam = urlParams.get('package');
    
    if (serviceParam) {
        const serviceInput = document.querySelector(`input[value="${serviceParam}"]`);
        if (serviceInput) {
            serviceInput.checked = true;
            updateBookingSummary();
        }
    }
    
    if (packageParam) {
        const packageInput = document.querySelector(`input[value="package-${packageParam}"]`);
        if (packageInput) {
            packageInput.checked = true;
            updateBookingSummary();
        }
    }
}

// Calendar functionality
function initCalendar() {
    const calendar = document.querySelector('.calendar-grid');
    if (!calendar) return;
    
    // Generate calendar for current month
    generateCalendar(new Date());
    
    // Navigation
    const prevBtn = document.querySelector('.calendar-nav.prev');
    const nextBtn = document.querySelector('.calendar-nav.next');
    
    let currentMonth = new Date();
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            currentMonth.setMonth(currentMonth.getMonth() - 1);
            generateCalendar(currentMonth);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            currentMonth.setMonth(currentMonth.getMonth() + 1);
            generateCalendar(currentMonth);
        });
    }
}

// Generate calendar days
function generateCalendar(date) {
    const calendar = document.querySelector('.calendar-grid');
    const monthDisplay = document.querySelector('.calendar-month');
    
    if (!calendar) return;
    
    // Update month display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    if (monthDisplay) {
        monthDisplay.textContent = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    }
    
    // Get first day of month and number of days
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    
    // Clear existing days (keep weekday headers)
    const weekdays = calendar.querySelectorAll('.weekday');
    calendar.innerHTML = '';
    weekdays.forEach(day => calendar.appendChild(day));
    
    // Add empty cells for days before start of month
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'day empty';
        calendar.appendChild(empty);
    }
    
    // Add days
    const today = new Date();
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = document.createElement('div');
        const currentDate = new Date(date.getFullYear(), date.getMonth(), day);
        
        let classes = ['day'];
        
        // Check if date is in the past
        if (currentDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
            classes.push('past');
        }
        // Check if date is today
        else if (currentDate.toDateString() === today.toDateString()) {
            classes.push('today');
        }
        // Check if date is available (simplified logic)
        else if (isDateAvailable(currentDate)) {
            classes.push('available');
        }
        else {
            classes.push('booked');
        }
        
        dayEl.className = classes.join(' ');
        dayEl.textContent = day;
        dayEl.dataset.date = currentDate.toISOString().split('T')[0];
        
        // Add click handler for available dates
        if (classes.includes('available')) {
            dayEl.addEventListener('click', function() {
                // Remove previous selection
                calendar.querySelectorAll('.day.selected').forEach(d => d.classList.remove('selected'));
                
                // Add selection
                this.classList.add('selected');
                
                // Update time slots
                updateTimeSlots(currentDate);
                
                // Update summary
                updateBookingSummary();
            });
        }
        
        calendar.appendChild(dayEl);
    }
}

// Check if date is available (simplified)
function isDateAvailable(date) {
    // Mock availability logic
    // In real implementation, this would check against your booking database
    const dayOfWeek = date.getDay();
    
    // Available Tuesday, Thursday, Saturday
    const availableDays = [2, 4, 6];
    
    // Not available if not in available days
    if (!availableDays.includes(dayOfWeek)) return false;
    
    // Mock: Some dates are randomly booked
    const dateString = date.toISOString().split('T')[0];
    const hash = dateString.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    
    return hash % 3 !== 0; // Roughly 2/3 of dates available
}

// Update available dates based on selected service
function updateAvailableDates() {
    // Re-generate calendar to reflect any service-specific availability
    const currentMonth = document.querySelector('.calendar-month');
    if (currentMonth) {
        const [monthName, year] = currentMonth.textContent.split(' ');
        const monthIndex = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'].indexOf(monthName);
        generateCalendar(new Date(parseInt(year), monthIndex, 1));
    }
}

// Time Slots
function initTimeSlots() {
    const slotsContainer = document.querySelector('.slots-grid');
    if (!slotsContainer) return;
    
    slotsContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('time-slot')) {
            // Remove previous selection
            slotsContainer.querySelectorAll('.time-slot.selected').forEach(s => s.classList.remove('selected'));
            
            // Add selection
            e.target.classList.add('selected');
            
            // Update summary
            updateBookingSummary();
        }
    });
}

// Update time slots based on selected date
function updateTimeSlots(date) {
    const slotsContainer = document.querySelector('.slots-grid');
    const selectedDateEl = document.getElementById('selected-date');
    const timeSlotsSection = document.getElementById('time-slots');
    
    if (!slotsContainer) return;
    
    // Update displayed date
    if (selectedDateEl) {
        selectedDateEl.textContent = formatDate(date);
    }
    
    // Show time slots section
    if (timeSlotsSection) {
        timeSlotsSection.style.display = 'block';
    }
    
    // Generate time slots
    const times = ['10:00 AM', '11:30 AM', '2:00 PM', '3:30 PM', '5:00 PM'];
    
    // Randomly mark some as booked
    slotsContainer.innerHTML = '';
    times.forEach(time => {
        const slot = document.createElement('button');
        slot.className = 'time-slot';
        slot.textContent = time;
        
        // Mock: randomly disable some slots
        if (Math.random() > 0.7) {
            slot.classList.add('booked');
            slot.disabled = true;
        }
        
        slotsContainer.appendChild(slot);
    });
}

// Update booking summary
function updateBookingSummary() {
    const summaryService = document.getElementById('summary-service');
    const summaryDatetime = document.getElementById('summary-datetime');
    const summaryTotal = document.getElementById('summary-total');
    
    // Get selected service
    const selectedService = document.querySelector('input[name="service"]:checked');
    
    if (selectedService && summaryService) {
        const serviceLabels = {
            'saturn': 'Saturn Return Preparation',
            'natal': 'Natal Chart Reading',
            'mercury': 'Mercury Retrograde Survival',
            'transit': '6-Month Transit Forecast',
            'electional': 'Electional Timing Consultation',
            'horary': 'Horary Question',
            'package-foundation': 'Foundation Package',
            'package-saturn': 'Saturn Return Complete'
        };
        
        summaryService.textContent = serviceLabels[selectedService.value] || 'Consultation';
    }
    
    // Get selected date and time
    const selectedDate = document.querySelector('.day.selected');
    const selectedTime = document.querySelector('.time-slot.selected');
    
    if (selectedDate && selectedTime && summaryDatetime) {
        const date = new Date(selectedDate.dataset.date);
        summaryDatetime.textContent = `${formatDate(date)} at ${selectedTime.textContent}`;
    }
    
    // Get price
    if (selectedService && summaryTotal) {
        const prices = {
            'saturn': '$200',
            'natal': '$150',
            'mercury': '$75',
            'transit': '$175',
            'electional': '$300',
            'horary': '$85',
            'package-foundation': '$275',
            'package-saturn': '$400'
        };
        
        summaryTotal.textContent = prices[selectedService.value] || '$150';
    }
}

// Booking Form
function initBookingForm() {
    const form = document.getElementById('booking-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate selections
        const selectedDate = document.querySelector('.day.selected');
        const selectedTime = document.querySelector('.time-slot.selected');
        
        if (!selectedDate) {
            showNotification('Please select a date.', 'error');
            return;
        }
        
        if (!selectedTime) {
            showNotification('Please select a time.', 'error');
            return;
        }
        
        // Collect form data
        const formData = {
            service: document.querySelector('input[name="service"]:checked')?.value,
            firstName: document.getElementById('first-name')?.value,
            lastName: document.getElementById('last-name')?.value,
            email: document.getElementById('email')?.value,
            birthInfo: document.getElementById('birth-info')?.value,
            notes: document.getElementById('notes')?.value,
            date: selectedDate.dataset.date,
            time: selectedTime.textContent
        };
        
        // Simulate booking submission
        console.log('Booking submitted:', formData);
        
        // Show success message
        showNotification('Booking confirmed! Check your email for details.', 'success');
        
        // In production, this would:
        // 1. Send data to your backend
        // 2. Process payment
        // 3. Send confirmation email
        // 4. Redirect to thank you page
        
        // Optional: Redirect after short delay
        setTimeout(() => {
            // window.location.href = '/thank-you.html';
        }, 2000);
    });
}
