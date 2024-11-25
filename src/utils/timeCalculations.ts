import { isWithinInterval } from 'date-fns';

interface TimeSlot {
  start: Date;
  end: Date;
}

export function calculateRealHours(activities: any[]): number {
  if (!activities?.length) return 0;

  try {
    // Sort activities by date and start time
    const sortedActivities = [...activities].sort((a, b) => {
      const dateA = a.date.toDate();
      const dateB = b.date.toDate();
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }
      return a.startTime.localeCompare(b.startTime);
    });

    const timeSlots: TimeSlot[] = [];

    sortedActivities.forEach(activity => {
      if (!activity.date || !activity.startTime || !activity.endTime) return;

      try {
        const activityDate = activity.date.toDate();
        const [startHour, startMinute] = activity.startTime.split(':').map(Number);
        const [endHour, endMinute] = activity.endTime.split(':').map(Number);

        const startTime = new Date(activityDate);
        startTime.setHours(startHour, startMinute, 0);
        
        const endTime = new Date(activityDate);
        endTime.setHours(endHour, endMinute, 0);

        // Check for overlaps and merge time slots
        let overlapped = false;
        for (let i = 0; i < timeSlots.length; i++) {
          const slot = timeSlots[i];
          if (
            isWithinInterval(startTime, { start: slot.start, end: slot.end }) ||
            isWithinInterval(endTime, { start: slot.start, end: slot.end }) ||
            (startTime <= slot.start && endTime >= slot.end)
          ) {
            // Merge overlapping slots
            slot.start = new Date(Math.min(startTime.getTime(), slot.start.getTime()));
            slot.end = new Date(Math.max(endTime.getTime(), slot.end.getTime()));
            overlapped = true;
            break;
          }
        }

        if (!overlapped) {
          timeSlots.push({ start: startTime, end: endTime });
        }
      } catch (error) {
        console.error('Error processing activity time:', error);
      }
    });

    // Calculate total real hours
    return timeSlots.reduce((total, slot) => {
      const hours = (slot.end.getTime() - slot.start.getTime()) / (1000 * 60 * 60);
      return total + hours;
    }, 0);
  } catch (error) {
    console.error('Error calculating real hours:', error);
    return 0;
  }
}