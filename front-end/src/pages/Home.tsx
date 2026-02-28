import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import type { Room } from '../types';
import { useAuth } from '../context/AuthContext';
import { Users, MapPin, Plus, X, Calendar as CalendarIcon, Clock, CheckCircle, AlertCircle, DoorOpen } from 'lucide-react';

const Home: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  // Booking Form State
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [agenda, setAgenda] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await api.get('/rooms');
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBooking = (room: Room) => {
    if (!user) {
      alert('Please login to book a room');
      return;
    }
    setSelectedRoom(room);
    setShowBookingModal(true);
    setFormError('');
    setFormSuccess('');
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;

    setIsSubmitting(true);
    setFormError('');
    setFormSuccess('');

    try {
      await api.post('/bookings', {
        roomId: selectedRoom.id,
        date,
        startTime: `${startTime}:00`,
        endTime: `${endTime}:00`,
        agenda
      });
      setFormSuccess('Booking request sent successfully!');
      setTimeout(() => {
        setShowBookingModal(false);
        setFormSuccess('');
        setAgenda('');
      }, 2000);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-muted font-black">SYNCHRONIZING DATA...</div>;

  return (
    <div>
      <div className="mb-12">
        <h1 className="heading-1 flex items-center gap-4">
          <DoorOpen className="text-primary" size={48} />
          Available Rooms
        </h1>
        <p className="text-muted font-black uppercase tracking-widest text-sm">Select a resource to initialize reservation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rooms.map((room) => (
          <div key={room.id} className="card flex flex-col p-8 border-2 border-border hover:border-primary transition-colors">
            <div className="flex justify-between items-start mb-8">
              <h3 className="heading-3 text-2xl tracking-tighter">{room.name}</h3>
              <div className="badge badge-pending">
                Floor {room.floorNumber}
              </div>
            </div>
            
            <div className="space-y-5 mb-10 text-muted">
              <div className="flex items-center gap-4 border-b border-border/50 pb-3">
                <Users size={20} className="text-primary" />
                <span className="font-black text-xs uppercase tracking-widest">CAPACITY: <span className="text-white ml-2">{room.capacity} PERSONNEL</span></span>
              </div>
              <div className="flex items-center gap-4">
                <MapPin size={20} className="text-primary" />
                <span className="font-black text-xs uppercase tracking-widest">LOCATION: <span className="text-white ml-2">FLOOR {room.floorNumber}</span></span>
              </div>
            </div>

            <button 
              onClick={() => handleOpenBooking(room)}
              className="btn btn-primary mt-auto w-full py-4 font-black"
            >
              <Plus size={20} />
              BOOK ROOM
            </button>
          </div>
        ))}
      </div>

      {showBookingModal && (
        <div className="modal-overlay p-4">
          <div className="modal-content overflow-hidden border-2 border-border shadow-2xl">
            <div className="px-8 py-6 border-b-2 border-border flex justify-between items-center bg-surface">
              <h3 className="heading-3 text-xl tracking-widest">INITIALIZE BOOKING: {selectedRoom?.name}</h3>
              <button onClick={() => setShowBookingModal(false)} className="text-muted hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleBookingSubmit} className="p-10 space-y-8">
              {formError && (
                <div className="bg-red-900/30 border-2 border-red-500 text-red-400 p-4 rounded text-xs font-black flex gap-3 items-center">
                  <AlertCircle size={20} /> {formError}
                </div>
              )}
              {formSuccess && (
                <div className="bg-emerald-900/30 border-2 border-emerald-500 text-emerald-400 p-4 rounded text-xs font-black flex gap-3 items-center">
                  <CheckCircle size={20} /> {formSuccess}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Operations Date</label>
                <input 
                  type="date" 
                  className="form-control" 
                  required 
                  min={new Date().toISOString().split('T')[0]}
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input 
                    type="time" 
                    className="form-control" 
                    required 
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input 
                    type="time" 
                    className="form-control" 
                    required 
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Mission Agenda</label>
                <textarea 
                  className="form-control" 
                  rows={3} 
                  placeholder="SPECIFY PURPOSE..."
                  value={agenda}
                  onChange={e => setAgenda(e.target.value)}
                ></textarea>
              </div>

              <div className="flex gap-6 pt-4">
                <button type="button" onClick={() => setShowBookingModal(false)} className="btn btn-outline flex-1 border-border font-black">
                  ABORT
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-1 font-black">
                  {isSubmitting ? 'PROCESSING...' : 'CONFIRM AUTHORIZATION'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
