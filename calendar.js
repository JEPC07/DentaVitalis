let currentDate = new Date();
let currentView = 'month';
let weekViewInitialized = false;
let events = [];

function generateCalendar(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const monthYearElement = document.getElementById('monthYear');
    const calendarBody = document.getElementById('calendar-body');

    monthYearElement.textContent = `${firstDay.toLocaleString('default', { month: 'long' })} ${year}`;

    let date = 1;
    let calendarHTML = '';

    for (let i = 0; i < 6; i++) {
        let row = '<tr>';
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < startingDay) {
                row += '<td></td>';
            } else if (date > daysInMonth) {
                break;
            } else {
                const isToday = date === currentDate.getDate() && month === currentDate.getMonth() && year === currentDate.getFullYear();
                const cellDate = new Date(year, month, date);
                const cellEvents = events.filter(event => new Date(event.date).toDateString() === cellDate.toDateString());
                
                let eventHtml = '';
                if (cellEvents.length > 0) {
                    eventHtml = '<div class="event-indicator"></div>';
                }
                
                row += `<td class="${isToday ? 'today' : ''}">${date}${eventHtml}</td>`;
                date++;
            }
        }
        row += '</tr>';
        calendarHTML += row;
        if (date > daysInMonth) {
            break;
        }
    }

    calendarBody.innerHTML = calendarHTML;
}

function generateWeekView(date) {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const monthYearElement = document.getElementById('monthYear');
    const calendarBody = document.getElementById('calendar-body');

    // Actualizar el texto del encabezado para mostrar el rango de la semana
    monthYearElement.textContent = `${startOfWeek.getDate()} - ${endOfWeek.getDate()} ${startOfWeek.toLocaleString('default', { month: 'long' })} ${startOfWeek.getFullYear()}`;

    // Actualizar los encabezados de los días con los números
    const headerRow = document.querySelector('#calendar thead tr');
    if (!weekViewInitialized) {
        const newHeaderCell = document.createElement('th');
        headerRow.insertBefore(newHeaderCell, headerRow.firstChild);
        weekViewInitialized = true;
    }

    // Limpiar completamente y actualizar los encabezados de los días con los números
    const headerCells = headerRow.querySelectorAll('th:not(:first-child)');
    headerCells.forEach((cell, index) => {
        const dayDate = new Date(startOfWeek);
        dayDate.setDate(startOfWeek.getDate() + index);
        const dayName = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][dayDate.getDay()];
        cell.innerHTML = `${dayName}<br><span class="day-number">${dayDate.getDate()}</span>`;
        
        // Agregar la clase 'today-column' si es el día actual
        if (dayDate.toDateString() === new Date().toDateString()) {
            cell.classList.add('today-column');
        } else {
            cell.classList.remove('today-column');
        }
    });

    let weekHTML = '';

    // Cambiamos el bucle para terminar en 21 en lugar de 22
    for (let hour = 8; hour <= 21; hour++) {
        let hourLabel = hour < 10 ? `0${hour}:00` : `${hour}:00`;
        weekHTML += `<tr><td class="hour-column">${hourLabel}</td>`;
        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(startOfWeek);
            dayDate.setDate(startOfWeek.getDate() + i);
            const isTodayColumn = dayDate.toDateString() === new Date().toDateString();
            
            const cellEvents = events.filter(event => {
                const eventDate = new Date(event.date);
                const eventHour = parseInt(event.time.split(':')[0]);
                return eventDate.toDateString() === dayDate.toDateString() && eventHour === hour;
            });
            
            let eventHtml = '';
            if (cellEvents.length > 0) {
                eventHtml = cellEvents.map(event => `<div class="week-event">${event.title}</div>`).join('');
            }
            
            weekHTML += `<td class="${isTodayColumn ? 'today-column' : ''}">${eventHtml}</td>`;
        }
        weekHTML += '</tr>';
    }

    // Añade la clase week-view al calendario
    document.getElementById('calendar').classList.add('week-view');

    calendarBody.innerHTML = weekHTML;
}

function changeMonth(delta) {
    if (currentView === 'month') {
        currentDate.setMonth(currentDate.getMonth() + delta);
        generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
    } else if (currentView === 'week') {
        currentDate.setDate(currentDate.getDate() + (delta * 7));
        generateWeekView(currentDate);
    }
}

// Actualizar los event listeners para los botones de navegación
document.getElementById('prevMonth').addEventListener('click', () => changeMonth(-1));
document.getElementById('nextMonth').addEventListener('click', () => changeMonth(1));

// Actualizar los textos de los botones de navegación según la vista
function updateNavigationButtons() {
    const prevButton = document.getElementById('prevMonth');
    const nextButton = document.getElementById('nextMonth');
    
    prevButton.innerHTML = '&lt;';
    nextButton.innerHTML = '&gt;';
}

// Modificar los event listeners para los botones de vista
document.getElementById('monthView').addEventListener('click', function() {
    currentView = 'month';
    // Restaurar la vista original del encabezado
    const headerRow = document.querySelector('#calendar thead tr');
    if (weekViewInitialized) {
        headerRow.removeChild(headerRow.firstChild);
        weekViewInitialized = false;
    }
    // Eliminar los números de los días y restaurar los nombres originales
    const headerCells = headerRow.querySelectorAll('th');
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    headerCells.forEach((cell, index) => {
        cell.textContent = dayNames[index];
    });
    updateNavigationButtons();
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
    updateViewButtons();

    // Remueve la clase week-view del calendario
    document.getElementById('calendar').classList.remove('week-view');
});

document.getElementById('weekView').addEventListener('click', function() {
    currentView = 'week';
    updateNavigationButtons();
    generateWeekView(currentDate);
    updateViewButtons();
});

function updateViewButtons() {
    document.getElementById('monthView').classList.toggle('active', currentView === 'month');
    document.getElementById('weekView').classList.toggle('active', currentView === 'week');
    document.getElementById('dayView').classList.toggle('active', currentView === 'day');
}

function addEvent() {
    const modal = document.getElementById('eventModal');
    const span = document.getElementsByClassName("close")[0];
    const form = document.getElementById('eventForm');

    modal.style.display = "block";

    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    form.onsubmit = function(e) {
        e.preventDefault();
        const patientName = document.getElementById('patientName').value;
        const date = document.getElementById('eventDate').value;
        const time = document.getElementById('eventTime').value;
        const eventType = document.getElementById('eventType').value;
        const notes = document.getElementById('eventNotes').value;

        const newEvent = {
            title: `${eventType} - ${patientName}`,
            date: date,
            time: time,
            notes: notes
        };

        events.push(newEvent);
        updateCalendar();
        updateTodayEvents();
        modal.style.display = "none";
        form.reset();
    }
}

function updateCalendar() {
    if (currentView === 'month') {
        generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
    } else if (currentView === 'week') {
        generateWeekView(currentDate);
    }
}

function updateTodayEvents() {
    const todayEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === new Date().toDateString();
    });

    const eventList = document.querySelector('.event-list');
    eventList.innerHTML = '';

    if (todayEvents.length === 0) {
        eventList.innerHTML = '<p class="no-events">No hay eventos programados para hoy.</p>';
    } else {
        todayEvents.forEach(event => {
            const eventItem = document.createElement('div');
            eventItem.classList.add('event-item');
            eventItem.innerHTML = `
                <div class="event-time">${event.time}</div>
                <div class="event-title">${event.title}</div>
            `;
            eventList.appendChild(eventItem);
        });
    }
}

// Inicializar el calendario
generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
updateNavigationButtons();
updateTodayEvents();

// Agregar este event listener al final del archivo
document.getElementById('add-event').addEventListener('click', addEvent);
