import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import type { Booking } from '../types';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, XCircle, Info, Hash, MapPin, Building2, Bookmark } from 'lucide-react';
import ClickSpark from '../components/ClickSpark';

const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/my');
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      await api.delete(`/bookings/${id}`);
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="badge badge-pending">PENDING</span>;
      case 'APPROVED': return <span className="badge badge-approved">APPROVED</span>;
      case 'REJECTED': return <span className="badge badge-rejected">REJECTED</span>;
      case 'CANCELLED': return <span className="badge badge-cancelled">CANCELLED</span>;
      default: return <span className="badge badge-pending">{status}</span>;
    }
  };

  if (loading) return <div className="text-center py-20 text-muted">Loading your bookings...</div>;

  return (
    <ClickSpark sparkColor='#6366f1' sparkSize={12} sparkRadius={20} sparkCount={8} duration={500}>
      <div className="mb-12">
        <h1 className="heading-1 flex items-center gap-4">
          <Bookmark className="text-primary" size={48} />
          My Bookings
        </h1>
        <p className="text-muted font-bold uppercase tracking-widest text-sm">Track and manage your room reservations</p>
      </div>

      {bookings.length === 0 ? (
        <div className="card text-center py-24 border-dashed border-4 border-primary/10">
          <Calendar className="mx-auto text-muted/20 mb-8" size={80} />
          <h3 className="heading-3 text-2xl text-muted">No reservations found</h3>
          <p className="text-muted font-bold mt-4 uppercase">You haven't made any bookings yet.</p>
          <button onClick={() => window.location.href = '/'} className="btn btn-primary mt-10 px-10 py-4">
            BROWSE ROOMS
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {bookings.map((booking) => (
            <div key={booking.id} className="card relative flex flex-col p-8 group">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/15 p-4 rounded text-primary shadow-[0_0_20px_rgba(239,68,68,0.2)] group-hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all">
                    <Building2 size={32} />
                  </div>
                  <div>
                    <h3 className="heading-3 text-xl">{booking.roomName}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-muted font-black uppercase tracking-widest mt-1">
                      <Hash size={12} />
                      ID: {booking.id}
                    </div>
                  </div>
                </div>
                {getStatusBadge(booking.status)}
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-border">
                <div className="flex items-center gap-3 text-muted">
                  <Calendar size={20} className="text-primary" />
                  <span className="font-black text-foreground">{booking.date}</span>
                </div>
                <div className="flex items-center gap-3 text-muted">
                  <Clock size={20} className="text-primary" />
                  <span className="font-black text-foreground">{booking.startTime} - {booking.endTime}</span>
                </div>
              </div>

              {booking.agenda && (
                <div className="bg-black/40 border-l-4 border-primary p-5 mb-8 italic text-muted text-sm leading-relaxed">
                  "{booking.agenda}"
                </div>
              )}

              {booking.status === 'PENDING' && (
                <button 
                  onClick={() => handleCancelBooking(booking.id)}
                  className="btn btn-danger w-full mt-auto py-4 font-black"
                >
                  <XCircle size={20} />
                  CANCEL RESERVATION
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </ClickSpark>
  );
};

export default MyBookings;
