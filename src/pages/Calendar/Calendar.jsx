import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import Swal from 'sweetalert2';
import { calendarService } from '../../services/calendarService';
import { useAuth } from '../../contexts/AuthContext';

const Calendar = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Role checking functions
  const isAdmin = () => user?.role?.slug === 'admin';
  const isHR = () => user?.role?.slug === 'hr';
  const isEmployee = () => user?.role?.slug === 'employee';

  // Check if user can view all events
  const canViewAllEvents = () => isAdmin() || isHR();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      
      if (canViewAllEvents()) {
        response = await calendarService.getEvents();
      } else {
        response = await calendarService.getMyEvents();
      }

      setEvents(response.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load calendar events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    const eventType = event.extendedProps?.type;
    
    // Event details prepare
    let title = event.title;
    let htmlContent = `
      <div class="text-left" style="margin: 15px 0;">
        <p style="margin-bottom: 8px;"><strong>Start:</strong> ${formatDate(event.startStr)}</p>
    `;
    
    if (event.end) {
      htmlContent += `<p style="margin-bottom: 8px;"><strong>End:</strong> ${formatDate(event.endStr)}</p>`;
    }
    
    if (eventType) {
      htmlContent += `<p style="margin-bottom: 8px;"><strong>Type:</strong> ${eventType}</p>`;
    }

    // Admin/HR der extra information
    if (canViewAllEvents() && event.extendedProps?.employee_name) {
      htmlContent += `<p style="margin-bottom: 8px;"><strong>Employee:</strong> ${event.extendedProps.employee_name}</p>`;
    }

    // Leave status show korbe
    if (event.extendedProps?.status) {
      const statusColor = getStatusColor(event.extendedProps.status);
      htmlContent += `<p style="margin-bottom: 8px;"><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${event.extendedProps.status.toUpperCase()}</span></p>`;
    }

    // Reason show korbe (if available)
    if (event.extendedProps?.reason) {
      htmlContent += `<p style="margin-bottom: 8px;"><strong>Reason:</strong> ${event.extendedProps.reason}</p>`;
    }

    htmlContent += `</div>`;

    // SweetAlert show without confirm button
    Swal.fire({
      title: title,
      html: htmlContent,
      icon: 'info',
      showConfirmButton: false,
      showCloseButton: true,
      width: '500px',
      customClass: {
        popup: 'rounded-lg',
        title: 'text-xl font-bold text-gray-900 mb-0',
        closeButton: 'text-gray-400 hover:text-gray-600 text-2xl'
      }
    });
  };

  // Date format helper
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Status color helper function
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'rejected': return '#EF4444';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-600 text-center">
          <p>{error}</p>
          <button 
            onClick={fetchEvents}
            className="mt-2 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded">
          {canViewAllEvents() ? '📅 Viewing All Events' : '👤 Viewing My Events'}
        </div>
      </div> */}

      {/* Calendar */}
      <div className="bg-white p-6 rounded-lg shadow">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek,dayGridDay,listMonth',
          }}
          initialView="dayGridMonth"
          editable={false}
          selectable={false}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={events}
          eventClick={handleEventClick}
          height="auto"
          eventDisplay="block"
          eventColor="#3788d8"
          views={{
            listMonth: { buttonText: 'list' },
          }}
          // Time remove korar jonno correct options
          displayEventTime={false}
          allDayText=""
          slotLabelFormat={{
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }}
        />
      </div>

      {/* Legend - Role-based */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Legend</h3>
        <div className="flex flex-wrap gap-4">
          {/* Common for all users */}
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Approved</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Pending</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
            <span className="text-sm text-gray-600">Rejected / Absent</span>
          </div>
          
          {/* Only for employees */}
          {!canViewAllEvents() && (
            <>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Your Birthday</span>
              </div>
            </>
          )}
          
          {/* Only for Admin/HR */}
          {canViewAllEvents() && (
            <>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Other Employees</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Birthdays</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-500 rounded mr-2"></div>
                <span className="text-sm text-gray-600">Holidays</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;