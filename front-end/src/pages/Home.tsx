import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import type { Room } from '../types';
import { useAuth } from '../context/AuthContext';
import { Users, MapPin, Plus, X, Calendar as CalendarIcon, Clock, CheckCircle, AlertCircle, DoorOpen, Search, Filter } from 'lucide-react';

const Home: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [capacityFilter, setCapacityFilter] = useState('');
  const [floorFilter, setFloorFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
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

  useEffect(() => {
    // Filter rooms based on search and filter criteria
    const filtered = rooms.filter(room => {
      const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCapacity = capacityFilter ? room.capacity >= parseInt(capacityFilter) : true;
      const matchesFloor = floorFilter ? room.floorNumber === parseInt(floorFilter) : true;
      return matchesSearch && matchesCapacity && matchesFloor;
    });
    setFilteredRooms(filtered);
  }, [rooms, searchTerm, capacityFilter, floorFilter]);

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

  if (loading) return <div className="text-center py-20 text-muted font-black">Loading rooms...</div>;

  const uniqueFloors = Array.from(new Set(rooms.map(r => r.floorNumber))).sort();

  return (
    <div>
      <div className="mb-12">
        <h1 className="heading-1 flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-accent-blue/20 to-accent-cyan/20 rounded-2xl">
            <DoorOpen className="text-accent-blue" size={40} />
          </div>
          Available Rooms
        </h1>
        <p className="text-muted font-semibold text-sm flex items-center gap-2">
          <span className="h-1.5 w-1.5 bg-accent-cyan rounded-full"></span>
          Find and book meeting spaces
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-10 space-y-4">
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-accent-blue" size={18} />
            <input
              type="text"
              placeholder="Search rooms by name..."
              className="form-control w-full pl-10 border-accent-blue/30 focus:border-accent-blue"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-accent-cyan px-4 py-2 flex items-center gap-2"
          >
            <Filter size={18} />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="card p-6 grid grid-cols-1 md:grid-cols-2 gap-6 rounded-2xl bg-gradient-to-br from-surface to-surface-hover border-2 border-border/50">
            <div className="form-group">
              <label className="form-label">Minimum Capacity</label>
              <select
                className="form-control rounded-lg"
                value={capacityFilter}
                onChange={(e) => setCapacityFilter(e.target.value)}
              >
                <option value="">Any capacity</option>
                <option value="5">5+ people</option>
                <option value="10">10+ people</option>
                <option value="15">15+ people</option>
                <option value="20">20+ people</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Floor</label>
              <select
                className="form-control rounded-lg"
                value={floorFilter}
                onChange={(e) => setFloorFilter(e.target.value)}
              >
                <option value="">Any floor</option>
                {uniqueFloors.map(floor => (
                  <option key={floor} value={floor}>Floor {floor}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {(searchTerm || capacityFilter || floorFilter) && (
          <div className="text-sm text-accent-purple font-bold uppercase tracking-widest gap-2 flex items-center">
            <span className="h-2 w-2 bg-accent-purple rounded-full animate-pulse"></span>
            Found {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Rooms Grid */}
      {filteredRooms.length === 0 ? (
        <div className="card text-center py-16 border-2 border-dashed border-accent-orange/30">
          <DoorOpen size={64} className="mx-auto text-accent-orange/30 mb-4" />
          <h3 className="heading-3 text-muted mb-2">No rooms found</h3>
          <p className="text-muted text-sm">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room, index) => {
            const cardVariants = ['card-cyan', 'card-blue', 'card-cyan'];
            const cardClass = cardVariants[index % cardVariants.length];
            return (
            <div key={room.id} className={`card flex flex-col p-6 ${cardClass}`}>
              <div className="flex justify-between items-start mb-6">
                <h3 className="heading-3">{room.name}</h3>
                <div className="badge badge-pending">
                  Floor {room.floorNumber}
                </div>
              </div>
              
              <div className="space-y-4 mb-8 text-muted text-sm flex-1">
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-primary" />
                  <span>Capacity: <strong className="text-foreground">{room.capacity} people</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-primary" />
                  <span>Location: <strong className="text-foreground">Floor {room.floorNumber}</strong></span>
                </div>
              </div>

              <button 
                onClick={() => handleOpenBooking(room)}
                className="btn btn-primary w-full py-3 font-semibold"
              >
                <Plus size={18} />
                BOOK NOW
              </button>
            </div>
            );
          })}
        </div>
      )}

      {showBookingModal && (
        <div className="modal-overlay p-4">
          <div className="modal-content overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center bg-surface">
              <h3 className="heading-3">Book: {selectedRoom?.name}</h3>
              <button onClick={() => setShowBookingModal(false)} className="text-muted hover:text-foreground transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleBookingSubmit} className="p-6 space-y-6">
              {formError && (
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded text-sm flex gap-3 items-center">
                  <AlertCircle size={18} /> {formError}
                </div>
              )}
              {formSuccess && (
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 p-4 rounded text-sm flex gap-3 items-center">
                  <CheckCircle size={18} /> {formSuccess}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Date</label>
                <input 
                  type="date" 
                  className="form-control" 
                  required 
                  min={new Date().toISOString().split('T')[0]}
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <label className="form-label">Agenda (Optional)</label>
                <textarea 
                  className="form-control" 
                  rows={3} 
                  placeholder="Describe the purpose of your meeting..."
                  value={agenda}
                  onChange={e => setAgenda(e.target.value)}
                ></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowBookingModal(false)} className="btn btn-outline flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-1">
                  {isSubmitting ? 'Processing...' : 'Book Room'}
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
