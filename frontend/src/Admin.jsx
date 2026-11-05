
import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  BedDouble,
  ClipboardList,
  RefreshCw,
  Save,
  Trash2,
  Plus,
  CheckCircle2,
  LogOut,
  Users,
  MessageCircle,
  Pencil,
  UserMinus,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from './services/api';
import './admin.css';

const today = () => new Date().toISOString().slice(0, 10);

const emptyRoomDraft = {
  roomNumber: '',
  totalBeds: 2,
};

const emptyResidentDraft = {
  name: '',
  phoneNumber: '',
  joiningDate: today(),
  roomId: '',
  bedNumber: 1,
};

function whatsappLink(phone) {
  let number = String(phone || '').replace(/\D/g, '');

  if (number.length === 10) {
    number = `91${number}`;
  }

  return `https://wa.me/${number}`;
}

export default function Admin() {
  const navigate = useNavigate();

  const [tab, setTab] = useState('rooms');

  const [rooms, setRooms] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [pgRooms, setPgRooms] = useState([]);
  const [residents, setResidents] = useState([]);

  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const [draft, setDraft] = useState({
    sharing: 2,
    rent: 12000,
    imageUrl: '/images/two-sharing.png',
    description: '',
    active: true,
  });

  const [pgRoomDraft, setPgRoomDraft] = useState(emptyRoomDraft);
  const [editingPgRoom, setEditingPgRoom] = useState(null);

  const [residentDraft, setResidentDraft] = useState(emptyResidentDraft);
  const [editingResident, setEditingResident] = useState(null);

  const [residentSearch, setResidentSearch] = useState('');
  const [residentStatus, setResidentStatus] = useState('ACTIVE');

  const [searchApplied, setSearchApplied] = useState('');
  const [statusApplied, setStatusApplied] = useState('ACTIVE');

  const [selectedRoom, setSelectedRoom] = useState(null);

  const signOut = useCallback(() => {
    sessionStorage.removeItem('sai_admin_token');
    navigate('/admin/login', { replace: true });
  }, [navigate]);

  const handleApiError = useCallback((err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      signOut();
      return 'Your admin session has expired or is not authorized. Please sign in again.';
    }

    return (
      err.response?.data?.message ||
      err.response?.data?.error ||
      'Could not complete the request. Check the backend connection and try again.'
    );
  }, [signOut]);

  const load = useCallback(async () => {
    setError('');
    setLoading(true);

    try {
      const [
        roomResponse,
        enquiryResponse,
        pgRoomResponse,
        residentResponse,
      ] = await Promise.all([
        api.get('/admin/rooms'),
        api.get('/admin/enquiries'),
        api.get('/admin/pg-rooms'),
        api.get('/admin/residents', {
          params: {
            search: searchApplied,
            status: statusApplied,
          },
        }),
      ]);

      setRooms(roomResponse.data);
      setEnquiries(enquiryResponse.data);
      setPgRooms(pgRoomResponse.data);
      setResidents(residentResponse.data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [handleApiError, searchApplied, statusApplied]);

  useEffect(() => {
    if (!sessionStorage.getItem('sai_admin_token')) {
      navigate('/admin/login', { replace: true });
      return;
    }

    load();
  }, [load, navigate]);

  async function saveRoom(event) {
    event.preventDefault();
    setError('');
    setStatus('');

    try {
      await api.post('/admin/rooms', {
        ...draft,
        sharing: Number(draft.sharing),
        rent: Number(draft.rent),
      });

      setStatus('Room pricing option added successfully.');

      setDraft({
        sharing: 2,
        rent: 12000,
        imageUrl: '/images/two-sharing.png',
        description: '',
        active: true,
      });

      await load();
    } catch (err) {
      setError(handleApiError(err));
    }
  }

  async function deleteRoom(id) {
    if (!window.confirm('Delete this room pricing option?')) return;

    setError('');
    setStatus('');

    try {
      await api.delete(`/admin/rooms/${id}`);
      setStatus('Room pricing option deleted.');
      await load();
    } catch (err) {
      setError(handleApiError(err));
    }
  }

  async function toggleContacted(item) {
    setError('');
    setStatus('');

    try {
      await api.patch(`/admin/enquiries/${item.id}/contacted`, {
        contacted: !item.contacted,
      });

      setStatus('Enquiry status updated.');
      await load();
    } catch (err) {
      setError(handleApiError(err));
    }
  }

  // PHYSICAL PG ROOMS

  function editPgRoom(room) {
    setEditingPgRoom(room);
    setPgRoomDraft({
      roomNumber: room.roomNumber,
      totalBeds: room.totalBeds,
    });
    setError('');
    setStatus('');
  }

  function cancelPgRoomEdit() {
    setEditingPgRoom(null);
    setPgRoomDraft(emptyRoomDraft);
  }

  async function savePgRoom(event) {
    event.preventDefault();
    setError('');
    setStatus('');

    const payload = {
      roomNumber: pgRoomDraft.roomNumber.trim(),
      totalBeds: Number(pgRoomDraft.totalBeds),
    };

    try {
      if (editingPgRoom) {
        await api.put(`/admin/pg-rooms/${editingPgRoom.id}`, payload);
        setStatus('Physical room updated successfully.');
      } else {
        await api.post('/admin/pg-rooms', payload);
        setStatus('Physical room added successfully.');
      }

      cancelPgRoomEdit();
      await load();
    } catch (err) {
      setError(handleApiError(err));
    }
  }

  async function deactivatePgRoom(room) {
    if (room.occupiedBeds > 0) {
      setError('This room still has active residents. Vacate them before deactivating the room.');
      return;
    }

    if (!window.confirm(`Deactivate room ${room.roomNumber}?`)) return;

    setError('');
    setStatus('');

    try {
      await api.patch(`/admin/pg-rooms/${room.id}/deactivate`);
      setStatus(`Room ${room.roomNumber} deactivated.`);
      await load();
    } catch (err) {
      setError(handleApiError(err));
    }
  }

  // RESIDENT MANAGEMENT

  async function searchResidents(event) {
    event.preventDefault();
    setSearchApplied(residentSearch.trim());
    setStatus('');
    setError('');
  }

  function editResident(resident) {
    setEditingResident(resident);
    setResidentDraft({
      name: resident.name,
      phoneNumber: resident.phoneNumber,
      joiningDate: resident.joiningDate,
      roomId: resident.roomId,
      bedNumber: resident.bedNumber,
    });
    setError('');
    setStatus('');
  }

  function cancelResidentEdit() {
    setEditingResident(null);
    setResidentDraft(emptyResidentDraft);
  }

  async function saveResident(event) {
    event.preventDefault();
    setError('');
    setStatus('');

    const payload = {
      name: residentDraft.name.trim(),
      phoneNumber: residentDraft.phoneNumber.trim(),
      joiningDate: residentDraft.joiningDate,
    };

    try {
      if (editingResident) {
        await api.put(
          `/admin/residents/${editingResident.id}`,
          payload
        );
        setStatus('Resident details updated successfully.');
      } else {
        await api.post('/admin/residents', {
          ...payload,
          roomId: Number(residentDraft.roomId),
          bedNumber: Number(residentDraft.bedNumber),
        });
        setStatus('Resident added and bed assigned successfully.');
      }

      cancelResidentEdit();
      await load();
    } catch (err) {
      setError(handleApiError(err));
    }
  }

  async function vacateResident(resident) {
    if (!window.confirm(
      `Mark ${resident.name} as vacated from room ${resident.roomNumber}, bed ${resident.bedNumber}?`
    )) return;

    setError('');
    setStatus('');

    try {
      await api.patch(`/admin/residents/${resident.id}/vacate`, {
        vacatingDate: today(),
      });

      setStatus(`${resident.name} has been marked as vacated.`);
      await load();
    } catch (err) {
      setError(handleApiError(err));
    }
  }

  const activeResidents = residents.filter(
    (resident) => resident.status === 'ACTIVE'
  );

  const totalOccupiedBeds = pgRooms.reduce(
    (sum, room) => sum + Number(room.occupiedBeds || 0),
    0
  );

  const totalVacantBeds = pgRooms.reduce(
    (sum, room) => sum + Number(room.vacantBeds || 0),
    0
  );

  const roomSearchMatches = pgRooms.filter((room) =>
    room.roomNumber.toLowerCase().includes(residentSearch.trim().toLowerCase())
  );

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <a href="/" className="admin-brand">
          <img src="/images/approved-logo.png" alt="Sai Iconic Liv" />
          <span>
            <b>Sai Iconic Liv</b>
            <small>ADMIN DASHBOARD</small>
          </span>
        </a>

        <div className="admin-header-actions">
          <a className="admin-back" href="/">
            <ArrowLeft size={16} />
            View website
          </a>

          <button className="admin-logout" onClick={signOut} type="button">
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </header>

      <section className="admin-content">
        <div className="admin-title-row">
          <div>
            <span className="eyebrow">PROPERTY MANAGEMENT</span>
            <h1>Dashboard</h1>
            <p>Manage room pricing, physical rooms, residents and enquiries.</p>
          </div>

          <button className="admin-refresh" onClick={load} disabled={loading}>
            <RefreshCw size={16} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="admin-alert error" role="alert">
            {error}
          </div>
        )}

        {status && (
          <div className="admin-alert success" role="status">
            {status}
          </div>
        )}

        <div className="admin-stats">
          <div>
            <BedDouble />
            <span>Room options</span>
            <strong>{rooms.length}</strong>
          </div>

          <div>
            <ClipboardList />
            <span>Total enquiries</span>
            <strong>{enquiries.length}</strong>
          </div>

          <div>
            <CheckCircle2 />
            <span>Contacted</span>
            <strong>{enquiries.filter((item) => item.contacted).length}</strong>
          </div>

          <div>
            <Users />
            <span>Active residents</span>
            <strong>{activeResidents.length}</strong>
          </div>

          <div>
            <BedDouble />
            <span>Occupied beds</span>
            <strong>{totalOccupiedBeds}</strong>
          </div>

          <div>
            <CheckCircle2 />
            <span>Vacant beds</span>
            <strong>{totalVacantBeds}</strong>
          </div>
        </div>

        {/* DASHBOARD TABS */}

        <div className="admin-tabs">
          <button
            className={tab === 'rooms' ? 'active' : ''}
            onClick={() => setTab('rooms')}
          >
            Room Pricing
          </button>

          <button
            className={tab === 'enquiries' ? 'active' : ''}
            onClick={() => setTab('enquiries')}
          >
            Enquiries
          </button>

          <button
            className={tab === 'pgRooms' ? 'active' : ''}
            onClick={() => setTab('pgRooms')}
          >
            Physical PG Rooms
          </button>

          <button
            className={tab === 'residents' ? 'active' : ''}
            onClick={() => setTab('residents')}
          >
            Resident Management
          </button>
        </div>

        {/* ROOM PRICING */}

        {tab === 'rooms' && (
          <div className="admin-panel">
            <h2>Current room pricing options</h2>

            <div className="admin-room-list">
              {rooms.map((room) => (
                <article className="admin-room" key={room.id}>
                  <img
                    src={room.imageUrl}
                    alt={`${room.sharing}-sharing room`}
                    onError={(event) => {
                      event.currentTarget.style.visibility = 'hidden';
                    }}
                  />

                  <div>
                    <b>{room.sharing}-sharing room</b>
                    <span>
                      ₹{Number(room.rent).toLocaleString('en-IN')} / person / month
                    </span>
                    <small>
                      {room.active ? 'Active' : 'Hidden'} · {room.description}
                    </small>
                  </div>

                  <button
                    className="delete-btn"
                    onClick={() => deleteRoom(room.id)}
                    aria-label="Delete room"
                  >
                    <Trash2 size={17} />
                  </button>
                </article>
              ))}
            </div>

            <form className="admin-add-form" onSubmit={saveRoom}>
              <h3><Plus size={18} /> Add room pricing option</h3>

              <div className="admin-fields">
                <label>
                  Sharing
                  <select
                    value={draft.sharing}
                    onChange={(event) =>
                      setDraft({ ...draft, sharing: event.target.value })
                    }
                  >
                    <option value="2">2 sharing</option>
                    <option value="3">3 sharing</option>
                    <option value="4">4 sharing</option>
                  </select>
                </label>

                <label>
                  Monthly rent (₹)
                  <input
                    type="number"
                    min="0"
                    value={draft.rent}
                    onChange={(event) =>
                      setDraft({ ...draft, rent: event.target.value })
                    }
                    required
                  />
                </label>

                <label>
                  Image path
                  <input
                    value={draft.imageUrl}
                    onChange={(event) =>
                      setDraft({ ...draft, imageUrl: event.target.value })
                    }
                    required
                  />
                </label>

                <label>
                  Description
                  <input
                    value={draft.description}
                    onChange={(event) =>
                      setDraft({ ...draft, description: event.target.value })
                    }
                    placeholder="Short room description"
                  />
                </label>
              </div>

              <button className="admin-save" type="submit">
                <Save size={16} /> Save room
              </button>
            </form>
          </div>
        )}

        {/* ENQUIRIES */}

        {tab === 'enquiries' && (
          <div className="admin-panel">
            <h2>Customer enquiries</h2>

            {enquiries.length === 0 ? (
              <p className="admin-empty">No enquiries yet.</p>
            ) : (
              <div className="admin-enquiry-list">
                {enquiries.map((item) => (
                  <article className="admin-enquiry" key={item.id}>
                    <div className="enquiry-top">
                      <b>{item.name}</b>
                      <span className={item.contacted ? 'pill done' : 'pill'}>
                        {item.contacted ? 'Contacted' : 'New enquiry'}
                      </span>
                    </div>

                    <p>{item.phone} · {item.sharing}-sharing</p>

                    {item.message && (
                      <p className="enquiry-message">{item.message}</p>
                    )}

                    <small>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : ''}
                    </small>

                    <button
                      className="admin-save small"
                      onClick={() => toggleContacted(item)}
                    >
                      {item.contacted ? 'Mark as new' : 'Mark contacted'}
                    </button>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PHYSICAL PG ROOMS */}

        {tab === 'pgRooms' && (
          <div className="admin-panel">
            <h2>Physical PG room management</h2>
            <p className="admin-section-description">
              Manage actual room numbers and bed capacity. These room numbers
              are only available in the admin dashboard.
            </p>

            <form className="admin-add-form" onSubmit={savePgRoom}>
              <h3>
                {editingPgRoom ? <Pencil size={18} /> : <Plus size={18} />}
                {editingPgRoom ? 'Edit physical room' : 'Add physical room'}
              </h3>

              <div className="admin-fields">
                <label>
                  Room number
                  <input
                    value={pgRoomDraft.roomNumber}
                    onChange={(event) =>
                      setPgRoomDraft({
                        ...pgRoomDraft,
                        roomNumber: event.target.value,
                      })
                    }
                    placeholder="Example: 101"
                    required
                  />
                </label>

                <label>
                  Total beds
                  <select
                    value={pgRoomDraft.totalBeds}
                    onChange={(event) =>
                      setPgRoomDraft({
                        ...pgRoomDraft,
                        totalBeds: event.target.value,
                      })
                    }
                  >
                    {[1, 2, 3, 4, 5].map((count) => (
                      <option key={count} value={count}>
                        {count} {count === 1 ? 'bed' : 'beds'}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="admin-form-actions">
                <button className="admin-save" type="submit">
                  <Save size={16} />
                  {editingPgRoom ? 'Update room' : 'Add room'}
                </button>

                {editingPgRoom && (
                  <button
                    className="admin-cancel"
                    type="button"
                    onClick={cancelPgRoomEdit}
                  >
                    <X size={16} /> Cancel
                  </button>
                )}
              </div>
            </form>

            <h3 className="admin-subheading">Room occupancy</h3>

            {pgRooms.length === 0 ? (
              <p className="admin-empty">
                No physical rooms added yet. Add your first room above.
              </p>
            ) : (
              <div className="admin-data-list">
                {pgRooms.map((room) => (
                  <article className="admin-data-card" key={room.id}>
                    <div className="admin-data-card-heading">
                      <div>
                        <b>Room {room.roomNumber}</b>
                        <small>{room.totalBeds} total beds</small>
                      </div>

                      <span className={room.active ? 'pill done' : 'pill'}>
                        {room.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="admin-occupancy">
                      <div>
                        <span>Occupied</span>
                        <strong>{room.occupiedBeds}</strong>
                      </div>

                      <div>
                        <span>Vacant</span>
                        <strong>{room.vacantBeds}</strong>
                      </div>

                      <div>
                        <span>Capacity</span>
                        <strong>{room.totalBeds}</strong>
                      </div>
                    </div>

                    <div className="admin-form-actions">
                      <button
                        className="admin-action-btn"
                        type="button"
                        onClick={() => setSelectedRoom(
                          selectedRoom?.id === room.id ? null : room
                        )}
                      >
                        <Users size={15} />
                        {selectedRoom?.id === room.id
                          ? 'Hide details'
                          : 'Room details'}
                      </button>

                      {room.active && (
                        <>
                          <button
                            className="admin-action-btn"
                            type="button"
                            onClick={() => editPgRoom(room)}
                          >
                            <Pencil size={15} /> Edit
                          </button>

                          <button
                            className="admin-action-btn danger"
                            type="button"
                            onClick={() => deactivatePgRoom(room)}
                          >
                            <X size={15} /> Deactivate
                          </button>
                        </>
                      )}
                    </div>

                    {selectedRoom?.id === room.id && (
                      <div className="admin-room-detail">
                        <b>Room {room.roomNumber} summary</b>
                        <p>
                          {room.occupiedBeds} occupied out of {room.totalBeds} beds.
                          {' '}{room.vacantBeds} beds available.
                        </p>
                        <p>
                          To see resident names and contact details, use the
                          Resident Management tab and search this room number.
                        </p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RESIDENT MANAGEMENT */}

        {tab === 'residents' && (
          <div className="admin-panel">
            <h2>Resident management</h2>
            <p className="admin-section-description">
              Add residents, assign beds, update details, and record vacating.
              Vacated resident records remain in the system.
            </p>

            <form className="admin-add-form" onSubmit={saveResident}>
              <h3>
                {editingResident ? <Pencil size={18} /> : <Plus size={18} />}
                {editingResident ? 'Edit resident details' : 'Add new resident'}
              </h3>

              <div className="admin-fields">
                <label>
                  Resident name
                  <input
                    value={residentDraft.name}
                    onChange={(event) =>
                      setResidentDraft({
                        ...residentDraft,
                        name: event.target.value,
                      })
                    }
                    placeholder="Full name"
                    required
                  />
                </label>

                <label>
                  Phone number
                  <input
                    type="tel"
                    value={residentDraft.phoneNumber}
                    onChange={(event) =>
                      setResidentDraft({
                        ...residentDraft,
                        phoneNumber: event.target.value,
                      })
                    }
                    placeholder="10-digit mobile number"
                    pattern="[0-9]{10,15}"
                    title="Enter 10 to 15 digits without spaces"
                    required
                  />
                </label>

                <label>
                  Joining date
                  <input
                    type="date"
                    value={residentDraft.joiningDate}
                    onChange={(event) =>
                      setResidentDraft({
                        ...residentDraft,
                        joiningDate: event.target.value,
                      })
                    }
                    required
                  />
                </label>

                {!editingResident && (
                  <>
                    <label>
                      Physical room
                      <select
                        value={residentDraft.roomId}
                        onChange={(event) =>
                          setResidentDraft({
                            ...residentDraft,
                            roomId: event.target.value,
                            bedNumber: 1,
                          })
                        }
                        required
                      >
                        <option value="">Select room</option>
                        {pgRooms
                          .filter((room) => room.active && room.vacantBeds > 0)
                          .map((room) => (
                            <option key={room.id} value={room.id}>
                              Room {room.roomNumber} ({room.vacantBeds} vacant)
                            </option>
                          ))}
                      </select>
                    </label>

                    <label>
                      Bed number
                      <select
                        value={residentDraft.bedNumber}
                        onChange={(event) =>
                          setResidentDraft({
                            ...residentDraft,
                            bedNumber: event.target.value,
                          })
                        }
                        required
                        disabled={!residentDraft.roomId}
                      >
                        {(() => {
                          const room = pgRooms.find(
                            (item) => item.id === Number(residentDraft.roomId)
                          );

                          if (!room) {
                            return <option value="">Select a room first</option>;
                          }

                          const occupied = new Set(
                            residents
                              .filter(
                                (item) =>
                                  item.status === 'ACTIVE' &&
                                  item.roomId === room.id
                              )
                              .map((item) => item.bedNumber)
                          );

                          const availableBeds = Array.from(
                            { length: room.totalBeds },
                            (_, index) => index + 1
                          ).filter((bed) => !occupied.has(bed));

                          return availableBeds.map((bed) => (
                            <option key={bed} value={bed}>
                              Bed {bed}
                            </option>
                          ));
                        })()}
                      </select>
                    </label>
                  </>
                )}
              </div>

              <div className="admin-form-actions">
                <button className="admin-save" type="submit">
                  <Save size={16} />
                  {editingResident ? 'Update resident' : 'Add resident'}
                </button>

                {editingResident && (
                  <button
                    className="admin-cancel"
                    type="button"
                    onClick={cancelResidentEdit}
                  >
                    <X size={16} /> Cancel
                  </button>
                )}
              </div>
            </form>

            <form className="admin-search-form" onSubmit={searchResidents}>
              <h3>Search residents and rooms</h3>

              <div className="admin-search-fields">
                <input
                  value={residentSearch}
                  onChange={(event) => setResidentSearch(event.target.value)}
                  placeholder="Search by name, phone or room number"
                />

                <select
                  value={residentStatus}
                  onChange={(event) => setResidentStatus(event.target.value)}
                >
                  <option value="">All residents</option>
                  <option value="ACTIVE">Active</option>
                  <option value="VACATED">Vacated</option>
                </select>

                <button className="admin-save" type="submit">
                  Search
                </button>
              </div>
            </form>

            {residentSearch.trim() && roomSearchMatches.length > 0 && (
              <div className="admin-room-search-results">
                <h3>Matching physical rooms</h3>

                {roomSearchMatches.map((room) => (
                  <div className="admin-room-search-item" key={room.id}>
                    <div>
                      <b>Room {room.roomNumber}</b>
                      <small>
                        {room.occupiedBeds} occupied · {room.vacantBeds} vacant
                        · {room.totalBeds} total beds
                      </small>
                    </div>
                    <button
                      type="button"
                      className="admin-action-btn"
                      onClick={() => {
                        setSearchApplied(room.roomNumber);
                        setStatusApplied('');
                      }}
                    >
                      View residents
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="admin-resident-heading">
              <h3>Resident records</h3>
              <span>{residents.length} records</span>
            </div>

            {residents.length === 0 ? (
              <p className="admin-empty">
                No residents found. Add a resident or change your search.
              </p>
            ) : (
              <div className="admin-data-list">
                {residents.map((resident) => (
                  <article className="admin-data-card" key={resident.id}>
                    <div className="admin-data-card-heading">
                      <div>
                        <b>{resident.name}</b>
                        <small>
                          Room {resident.roomNumber} · Bed {resident.bedNumber}
                        </small>
                      </div>

                      <span
                        className={
                          resident.status === 'ACTIVE' ? 'pill done' : 'pill'
                        }
                      >
                        {resident.status}
                      </span>
                    </div>

                    <div className="admin-resident-info">
                      <p>
                        <b>Phone:</b> {resident.phoneNumber}
                      </p>
                      <p>
                        <b>Joining date:</b> {resident.joiningDate}
                      </p>

                      {resident.vacatingDate && (
                        <p>
                          <b>Vacating date:</b> {resident.vacatingDate}
                        </p>
                      )}
                    </div>

                    <div className="admin-form-actions">
                      <a
                        className="admin-action-btn whatsapp"
                        href={whatsappLink(resident.phoneNumber)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle size={15} />
                        WhatsApp
                      </a>

                      {resident.status === 'ACTIVE' && (
                        <>
                          <button
                            className="admin-action-btn"
                            type="button"
                            onClick={() => editResident(resident)}
                          >
                            <Pencil size={15} /> Edit
                          </button>

                          <button
                            className="admin-action-btn danger"
                            type="button"
                            onClick={() => vacateResident(resident)}
                          >
                            <UserMinus size={15} /> Vacate
                          </button>
                        </>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        <p className="admin-warning">
          Admin operations require a valid backend-authenticated session.
        </p>
      </section>
    </main>
  );
}
