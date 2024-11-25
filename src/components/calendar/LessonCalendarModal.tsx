import { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { it } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import AddLessonModal from './AddLessonModal';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';

interface LessonCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

Modal.setAppElement('#root');

const modalStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 1000
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '90%',
    width: '1200px',
    maxHeight: '90vh',
    padding: 0,
    border: 'none',
    borderRadius: '0.5rem',
    background: '#fff'
  }
};

export default function LessonCalendarModal({ isOpen, onClose }: LessonCalendarModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      
      // Extend query range to include the full weeks at start and end of month
      const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
      const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
      
      const q = query(
        collection(db, 'lessons'),
        where('date', '>=', calendarStart),
        where('date', '<=', calendarEnd)
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedLessons = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setLessons(fetchedLessons);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast.error('Errore nel recupero delle lezioni');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLessons();
    }
  }, [currentDate, isOpen]);

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // Get calendar days including full weeks
  const calendarStart = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
  
  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const getLessonsForDay = (date: Date) => {
    return lessons.filter(lesson => {
      const lessonDate = lesson.date.toDate();
      return format(lessonDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={modalStyles}
      contentLabel="Calendario Lezioni"
    >
      <div className="flex flex-col h-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Calendario Lezioni
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <span className="text-lg font-medium">
                  {format(currentDate, 'MMMM yyyy', { locale: it })}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAddLesson(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi Lezione
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
            {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((day) => (
              <div
                key={day}
                className="bg-gray-50 py-2 text-center text-sm font-medium text-gray-500"
              >
                {day}
              </div>
            ))}
            {days.map((day, dayIdx) => (
              <div
                key={day.toISOString()}
                className={`min-h-[120px] bg-white p-2 ${
                  !isSameMonth(day, currentDate)
                    ? 'bg-gray-50 text-gray-400'
                    : 'text-gray-900'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 text-sm ${
                      isToday(day)
                        ? 'bg-blue-600 text-white rounded-full'
                        : ''
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                </div>
                <div className="mt-2 space-y-1">
                  {getLessonsForDay(day).map((lesson) => (
                    <div
                      key={lesson.id}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                    >
                      {lesson.startTime} - {lesson.school} {lesson.class}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AddLessonModal
        isOpen={showAddLesson}
        onClose={() => {
          setShowAddLesson(false);
          fetchLessons();
        }}
        onLessonAdded={() => {
          fetchLessons();
          setShowAddLesson(false);
        }}
      />
    </Modal>
  );
}