import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import type { Room, Booking } from '../types';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash, X, Building2, Calendar, LayoutDashboard, Users, ShieldAlert } from 'lucide-react';
import ClickSpark from '../components/ClickSpark';

const AdminDashboard: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'rooms' | 'bookings'>('bookings');
  const [loading, setLoading] = useState(true);
  
  // Room Form Modal
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomFormData, setRoomFormData] = useState({ name: '', capacity: 0, floorNumber: 0 });

  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsRes, bookingsRes] = await Promise.all([
        api.get('/rooms'),
        api.get('/bookings')
      ]);
      setRooms(roomsRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await api.post(`/bookings/${id}/approve`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error approving booking');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await api.post(`/bookings/${id}/reject`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error rejecting booking');
    }
  };

  const handleDeleteRoom = async (id: number) => {
    if (!window.confirm('Delete this room and reject all its pending bookings?')) return;
    try {
      await api.delete(`/rooms/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };

  const handleRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await api.put(`/rooms/${editingRoom.id}`, roomFormData);
      } else {
        await api.post('/rooms', roomFormData);
      }
      setShowRoomModal(false);
      fetchData();
    } catch (error) {
      console.error('Error saving room:', error);
    }
  };

  const openRoomModal = (room?: Room) => {
    if (room) {
      setEditingRoom(room);
      setRoomFormData({ name: room.name, capacity: room.capacity, floorNumber: room.floorNumber });
    } else {
      setEditingRoom(null);
      setRoomFormData({ name: '', capacity: 10, floorNumber: 1 });
    }
    setShowRoomModal(true);
  };

  if (loading) return <div className="text-center py-20 text-muted font-black tracking-widest">INITIALIZING DATA...</div>;

  return (
    <ClickSpark sparkColor='#6366f1' sparkSize={12} sparkRadius={20} sparkCount={8} duration={500}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 pb-8 border-b-2 border-border">
        <div>
          <h1 className="heading-1 flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-accent-purple/20 to-accent-pink/20 rounded-lg">
              <ShieldAlert className="text-accent-purple" size={48} strokeWidth={3} />
            </div>
            ADMIN PANEL
          </h1>
          <p className="text-muted font-black uppercase tracking-widest text-sm flex items-center gap-2 mt-2">
            <span className="h-2 w-2 bg-accent-pink rounded-full animate-pulse"></span>
            Operations Control & Resource Provisioning
          </p>
        </div>
        <div className="flex gap-3 p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 border-2 border-border rounded-2xl shadow-lg">
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`flex-1 px-8 py-4 rounded-lg text-sm font-black transition-all transform ${activeTab === 'bookings' ? 'gradient-blue-cyan text-white shadow-xl scale-105' : 'text-muted hover:text-accent-blue bg-white/40'}`}
          >
            <span className="flex items-center justify-center gap-2">
              <Calendar size={20} />
              APPROVE REQUESTS
            </span>
          </button>
          <button 
            onClick={() => setActiveTab('rooms')}
            className={`flex-1 px-8 py-4 rounded-lg text-sm font-black transition-all transform ${activeTab === 'rooms' ? 'gradient-purple-pink text-white shadow-xl scale-105' : 'text-muted hover:text-accent-purple bg-white/40'}`}
          >
            <span className="flex items-center justify-center gap-2">
              <Building2 size={20} />
              MANAGE ROOMS
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'bookings' ? (
        <div className="card p-0 overflow-hidden border-2 border-border shadow-2xl">
          <div className="px-8 py-6 border-b-2 border-border bg-surface flex justify-between items-center">
            <h3 className="heading-3 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
              LIVE TRAFFIC STREAM
            </h3>
            <span className="badge badge-pending font-black px-4 py-2 border-2 border-primary/20">{bookings.filter(b => b.status === 'PENDING').length} PENDING AUTHORIZATION</span>
          </div>
          <div className="table-container border-none rounded-none">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-8">RESOURCE</th>
                  <th className="px-8">OPERATOR</th>
                  <th className="px-8">SCHEDULE</th>
                  <th className="px-8">STATUS</th>
                  <th className="px-8 text-right">AUTHORIZATION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-24 text-muted font-bold uppercase tracking-[0.2em] opacity-30">No Booking Records Found</td>
                  </tr>
                ) : (
                  bookings.map(booking => (
                    <tr key={booking.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 font-black text-white">{booking.roomName}</td>
                      <td className="px-8 text-muted font-black text-[10px] tracking-widest uppercase">{booking.username}</td>
                      <td className="px-8">
                        <div className="text-white font-black text-xs">{booking.date}</div>
                        <div className="text-[10px] text-muted font-black mt-1 uppercase opacity-60">{booking.startTime} - {booking.endTime}</div>
                      </td>
                      <td className="px-8">
                        {booking.status === 'PENDING' ? <span className="badge badge-pending">PENDING</span> : 
                         booking.status === 'APPROVED' ? <span className="badge badge-approved">APPROVED</span> :
                         booking.status === 'REJECTED' ? <span className="badge badge-rejected">REJECTED</span> :
                         <span className="badge badge-cancelled">{booking.status}</span>}
                      </td>
                      <td className="px-8 text-right">
                        {booking.status === 'PENDING' ? (
                          <div className="flex justify-end gap-3">
                            <button onClick={() => handleApprove(booking.id)} className="btn btn-primary py-2 px-5 bg-emerald-600 hover:bg-emerald-700 font-black text-[10px]">
                              APPROVE
                            </button>
                            <button onClick={() => handleReject(booking.id)} className="btn btn-danger py-2 px-5 font-black text-[10px]">
                              REJECT
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-black text-muted tracking-widest uppercase opacity-20">Locked</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-12 animate-in fade-in duration-500">
          {/* DEDICATED CREATE SECTION */}
          <section className="bg-gradient-to-br from-accent-purple/15 to-accent-cyan/15 p-12 rounded-2xl border-2 border-dashed border-accent-purple/40 flex flex-col items-center text-center gap-8 shadow-lg shadow-accent-purple/10 hover:shadow-accent-purple/20 transition-all">
            <div className="bg-accent-purple/20 p-6 rounded-full text-accent-purple">
              <Plus size={44} strokeWidth={3} />
            </div>
            <div>
              <h2 className="heading-3 text-3xl text-white mb-3 tracking-widest uppercase">Create New Room</h2>
              <p className="text-muted text-sm uppercase font-bold tracking-widest">Add a new meeting space to the system</p>
            </div>
            <button onClick={() => openRoomModal()} className="btn btn-primary px-16 py-5 font-black shadow-xl hover:shadow-2xl transition-all text-base rounded-xl">
              + CREATE ROOM
            </button>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room, index) => {
              const cardVariants = ['card-purple', 'card-pink', 'card-purple'];
              const cardClass = cardVariants[index % cardVariants.length];
              return (
              <div key={room.id} className={`card group p-8 border-2 border-border hover:border-primary/40 transition-colors ${cardClass} rounded-2xl`}>
                <div className="flex justify-between items-start mb-8">
                  <div className="bg-primary/10 p-4 rounded text-primary border border-border">
                    <Building2 size={32} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openRoomModal(room)} className="p-2.5 text-muted hover:text-white transition-colors bg-black/40 rounded border border-border">
                      <Edit size={20} />
                    </button>
                    <button onClick={() => handleDeleteRoom(room.id)} className="p-2.5 text-muted hover:text-red-500 transition-colors bg-black/40 rounded border border-border">
                      <Trash size={20} />
                    </button>
                  </div>
                </div>
                <h3 className="heading-3 text-2xl mb-6">{room.name}</h3>
                <div className="space-y-4 font-black">
                  <div className="flex items-center gap-3 text-muted">
                    <Users size={20} className="text-primary" /> 
                    <span className="text-[11px] uppercase tracking-widest">CAPACITY: <span className="text-white ml-2">{room.capacity}</span></span>
                  </div>
                  <div className="flex items-center gap-3 text-muted">
                    <LayoutDashboard size={20} className="text-primary" /> 
                    <span className="text-[11px] uppercase tracking-widest">LOCATION: <span className="text-white ml-2">FLOOR {room.floorNumber}</span></span>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}

      {showRoomModal && (
        <div className="modal-overlay p-4">
          <div className="modal-content overflow-hidden border-2 border-border shadow-2xl">
            <div className="px-10 py-8 border-b-2 border-border flex justify-between items-center bg-surface">
              <h3 className="heading-3 tracking-widest">{editingRoom ? 'RECONFIGURE ASSET' : 'PROVISION NEW ASSET'}</h3>
              <button onClick={() => setShowRoomModal(false)} className="text-muted hover:text-white transition-colors"><X size={28} /></button>
            </div>
            <form onSubmit={handleRoomSubmit} className="p-10 space-y-8">
              <div className="form-group">
                <label className="form-label">Asset Designation</label>
                <input 
                  className="form-control" 
                  placeholder="NAME OR ID..."
                  value={roomFormData.name} 
                  onChange={e => setRoomFormData({...roomFormData, name: e.target.value})}
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="form-group">
                  <label className="form-label">Capacity (Personnel)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={roomFormData.capacity} 
                    onChange={e => setRoomFormData({...roomFormData, capacity: parseInt(e.target.value)})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Floor (Level)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={roomFormData.floorNumber} 
                    onChange={e => setRoomFormData({...roomFormData, floorNumber: parseInt(e.target.value)})}
                    required 
                  />
                </div>
              </div>
              <div className="flex gap-6 pt-6">
                <button type="button" onClick={() => setShowRoomModal(false)} className="btn btn-outline flex-1 border-border font-black">ABORT</button>
                <button type="submit" className="btn btn-primary flex-1 font-black">{editingRoom ? 'UPDATE ASSET' : 'INITIALIZE ASSET'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ClickSpark>
  );
};

export default AdminDashboard;
