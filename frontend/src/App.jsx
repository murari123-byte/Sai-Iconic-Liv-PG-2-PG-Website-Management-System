
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  ArrowRight, ArrowUpRight, BedDouble, Bike, Dumbbell, Fan,
  LockKeyhole, MapPin, Menu, Refrigerator, ShieldCheck,
  Sparkles, Utensils, Wifi, Wind, Zap, Droplets, X,
  MessageCircle, DoorOpen
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const WA_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER || '918500230472').replace(/\D/g, '');

const waLink = (text = 'Hi, I would like to enquire about Sai Iconic Liv PG-2.') =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

const LOCATION_URL = 'https://maps.app.goo.gl/3iyT2qtwiLLF4Nd27?g_st=aw';

const rooms = [
  {
    id: 1,
    sharing: 2,
    label: '2 Sharing',
    rent: 12000,
    beds: 2,
    image: '/images/two-sharing.png',
    description: 'A two-person room with individual beds and a wardrobe.'
  },
  {
    id: 2,
    sharing: 3,
    label: '3 Sharing',
    rent: 9000,
    beds: 3,
    image: '/images/three-sharing.png',
    description: 'A shared room arranged for three residents.'
  },
  {
    id: 3,
    sharing: 4,
    label: '4 Sharing',
    rent: 7800,
    beds: 4,
    image: '/images/four-sharing.png',
    description: 'A four-person room with individual beds and ceiling fans.'
  }
];

const amenities = [
  { icon: Fan, title: '2 fans in every room', detail: 'Two fans in each room' },
  { icon: Zap, title: '24-hour power supply', detail: 'Generator backup available' },
  { icon: Dumbbell, title: 'Workout space', detail: 'Gym facility' },
  { icon: ShieldCheck, title: 'CCTV surveillance', detail: 'Premises under CCTV surveillance' },
  { icon: Bike, title: 'Bike parking', detail: 'Parking available for bikes' },
  { icon: BedDouble, title: '8-inch mattresses', detail: 'Comfortable sleeping setup' },
  { icon: Sparkles, title: 'Regular cleaning', detail: 'Room and bathroom cleaning' },
  { icon: Utensils, title: 'Hygienic, varied food', detail: 'A variety of tasty meals' },
  { icon: Wind, title: 'Spacious, ventilated rooms', detail: 'Rooms designed for airflow' },
  { icon: Refrigerator, title: 'Fridge on every floor', detail: 'Shared refrigerator on each floor' },
  { icon: Wifi, title: '3 Wi-Fi access points per floor', detail: 'For seamless connectivity' },
  { icon: Droplets, title: '24-hour hot water', detail: 'Hot water available all day' },
  { icon: DoorOpen, title: 'Balcony on every floor', detail: 'Balcony access on every floor' },
  { icon: LockKeyhole, title: 'Individual lockers', detail: 'Personal storage for residents' }
];

const gallery = [
  { src: '/images/building-day.png', label: 'Building exterior', span: 'large' },
  { src: '/images/dining-hall.png', label: 'Dining hall' },
  { src: '/images/entrance.png', label: 'Entrance' },
  { src: '/images/three-sharing.png', label: '3-sharing room' },
  { src: '/images/bathroom.png', label: 'Bathroom' },
  { src: '/images/balcony.png', label: 'Floor balcony' },
  { src: '/images/corridor.png', label: 'Corridor' },
  { src: '/images/signboard.png', label: 'PG signboard' }
];

const virtualTours = [
  {
    title: '360° View 01',
    url: 'https://maps.app.goo.gl/1xcopaHEJW7Z3p26A'
  },
  {
    title: '360° View 02',
    url: 'https://maps.app.goo.gl/isEwrqTNQTqDHxjw6'
  },
  {
    title: '360° View 03',
    url: 'https://maps.app.goo.gl/ykmQdcaJRhec3jzB6'
  },
  {
    title: '360° View 04',
    url: 'https://maps.app.goo.gl/PyXKS3Knu9efQmy99'
  },
  {
    title: '360° View 05',
    url: 'https://maps.app.goo.gl/baFZgNBbwat65YV39'
  }
];

function Header() {
  const [open, setOpen] = useState(false);

  const links = [
    ['Rooms', '#rooms'],
    ['Amenities', '#amenities'],
    ['Gallery', '#gallery'],
    ['360° Tour', '#virtual-tour'],
    ['Location', '#location']
  ];

  return (
    <header className="header">
      <a className="brand" href="#home" aria-label="Sai Iconic Liv home">
        <img
          src="/images/approved-logo.png"
          alt="Sai Iconic Liv Men's & Co-Living PG-2 logo"
        />
        <span className="brand-copy">
          <b>Sai Iconic Liv</b>
          <small>MEN'S & CO-LIVING PG-2</small>
        </span>
      </a>

      <button
        className="mobile-menu"
        onClick={() => setOpen(!open)}
        aria-label="Toggle navigation"
      >
        {open ? <X /> : <Menu />}
      </button>

      <nav className={open ? 'nav nav-open' : 'nav'}>
        {links.map(([label, href]) => (
          <a key={label} href={href} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}

        <a className="nav-admin" href="/admin/login">
          Admin Login
        </a>

        <a
          className="nav-cta"
          href={waLink()}
          target="_blank"
          rel="noreferrer"
        >
          <MessageCircle size={16} /> Enquire now
        </a>
      </nav>
    </header>
  );
}

function RoomModal({ room, onClose }) {
  useEffect(() => {
    if (!room) return;

    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [room, onClose]);

  if (!room) return null;

  const message = `Hi, I am interested in the ${room.label} room at Sai Iconic Liv PG-2. Rent: ₹${room.rent.toLocaleString('en-IN')} per person per month. Please share availability.`;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <section
        className="room-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close room details"
        >
          <X />
        </button>

        <img
          className="modal-image"
          src={room.image}
          alt={`${room.label} room at Sai Iconic Liv PG-2`}
        />

        <div className="modal-content">
          <span className="eyebrow">ROOM DETAILS</span>
          <h2 id="modal-title">{room.label} Room</h2>
          <p>{room.description}</p>

          <div className="modal-price">
            <strong>₹{room.rent.toLocaleString('en-IN')}</strong>
            <span>per person / month</span>
          </div>

          <div className="deposit-row">
            <LockKeyhole size={18} />
            <span>Joining advance deposit: <b>₹3,000</b></span>
          </div>

          <p className="fineprint">
            Room availability and any additional terms can be confirmed
            directly with the property.
          </p>

          <a
            className="button button-primary full-width"
            href={waLink(message)}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={18} /> Enquire about this room
          </a>
        </div>
      </section>
    </div>
  );
}

function App() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    sharing: '2 Sharing',
    message: ''
  });
  const [submitState, setSubmitState] = useState('');
  const [apiRooms, setApiRooms] = useState(null);

  useEffect(() => {
    axios.get(`${API}/rooms`)
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length) {
          setApiRooms(
            response.data.map((apiRoom) => ({
              ...apiRoom,
              label: `${apiRoom.sharing} Sharing`,
              image:
                apiRoom.imageUrl ||
                rooms.find((r) => r.sharing === apiRoom.sharing)?.image ||
                '/images/two-sharing.png'
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const displayRooms = apiRooms || rooms;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitState('');

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      sharing: Number(form.sharing.split(' ')[0]),
      message: form.message.trim()
    };

    if (!payload.name || !payload.phone) {
      setSubmitState('Please enter your name and phone number.');
      return;
    }

    try {
      await axios.post(`${API}/enquiries`, payload);
      setSubmitState('Thanks! Your enquiry has been submitted.');
    } catch {
      const text = `Hi, my name is ${payload.name}. I am interested in ${form.sharing} at Sai Iconic Liv PG-2. My phone number is ${payload.phone}. ${payload.message}`;

      window.open(waLink(text), '_blank', 'noopener,noreferrer');
      setSubmitState(
        'Your enquiry is ready to send on WhatsApp. Please press Send in WhatsApp.'
      );
    }
  }

  return (
    <div className="site-shell">
      <Header />

      <main>
        {/* HERO SECTION */}
        <section className="hero" id="home">
          <div className="hero-photo">
            <img
              src="/images/building-day.png"
              alt="Sai Iconic Liv PG-2 building exterior"
            />
          </div>

          <div className="hero-overlay" />

          <div className="hero-content">
            <span className="hero-kicker">
              <span /> MEN'S & CO-LIVING PG · HYDERABAD
            </span>

            <h1>
              Your Second Home
              <br />
              <em>in Hyderabad.</em>
            </h1>

            <p>
              Thoughtfully arranged shared living, practical facilities,
              and a welcoming place to settle in.
            </p>

            <div className="hero-actions">
              <a className="button button-gold" href="#rooms">
                Explore rooms <ArrowRight size={17} />
              </a>

              <a
                className="button button-glass"
                href={waLink()}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={17} /> WhatsApp us
              </a>
            </div>

            <div className="hero-note">
              <MapPin size={15} /> Sai Iconic Liv Men's & Co-Living PG-2
            </div>
          </div>

          <div className="hero-stamp">
            <span>ROOMS FROM</span>
            <strong>₹7,800</strong>
            <small>per person / month</small>
          </div>
        </section>

        {/* INTRO SECTION */}
        <section className="intro section-wrap">
          <div>
            <span className="eyebrow">WELCOME TO SAI ICONIC LIV</span>
            <h2>
              Room to live.
              <br />
              <em>Space to belong.</em>
            </h2>
          </div>

          <p>
            Choose the sharing option that suits your budget and routine.
            Explore the room photos, check the monthly rent, and contact us
            to confirm availability.
          </p>
        </section>

        {/* ROOMS SECTION */}
        <section className="section-wrap rooms-section" id="rooms">
          <div className="section-heading">
            <div>
              <span className="eyebrow">FIND YOUR SPACE</span>
              <h2>
                Choose your <em>space.</em>
              </h2>
            </div>

            <p>
              Select any room card to view its photo, monthly rent and
              joining advance.
            </p>
          </div>

          <div className="room-grid">
            {displayRooms.map((room) => (
              <button
                className="room-card"
                key={room.id ?? room.sharing}
                onClick={() => setSelectedRoom(room)}
                aria-label={`View ${room.label} room details`}
              >
                <div className="room-photo">
                  <img src={room.image} alt={`${room.label} room`} />
                  <span className="room-chip">{room.label}</span>
                  <span className="room-arrow">
                    <ArrowUpRight size={20} />
                  </span>
                </div>

                <div className="room-info">
                  <div>
                    <h3>{room.label}</h3>
                    <p>{room.sharing} people per room</p>
                  </div>

                  <div className="room-price">
                    <strong>
                      ₹{Number(room.rent).toLocaleString('en-IN')}
                    </strong>
                    <small>/ person / month</small>
                  </div>
                </div>

                <div className="room-card-footer">
                  <span>
                    <BedDouble size={16} /> Individual bed
                  </span>
                  <span>
                    View details <ArrowRight size={15} />
                  </span>
                </div>
              </button>
            ))}
          </div>

          <p className="section-footnote">
            ₹3,000 advance deposit payable at joining. Please contact us
            to confirm availability and other terms.
          </p>
        </section>

        {/* DEPOSIT SECTION */}
        <section className="deposit-banner">
          <div className="deposit-icon">
            <LockKeyhole size={24} />
          </div>

          <div>
            <span className="eyebrow">SIMPLE JOINING INFORMATION</span>
            <h2>
              Advance deposit <em>₹3,000</em>
            </h2>
            <p>
              Payable at the time of joining. Ask us about availability
              and joining details.
            </p>
          </div>

          <a
            className="button button-dark"
            href={waLink(
              'Hi, I would like to ask about the ₹3,000 joining advance and room availability.'
            )}
            target="_blank"
            rel="noreferrer"
          >
            Ask a question <ArrowUpRight size={17} />
          </a>
        </section>

        {/* AMENITIES SECTION */}
        <section
          className="section-wrap amenities-section"
          id="amenities"
        >
          <div className="section-heading">
            <div>
              <span className="eyebrow">EVERYDAY COMFORTS</span>
              <h2>
                Facilities that make
                <br />
                <em>life easier.</em>
              </h2>
            </div>

            <p>
              Facilities shared by residents at Sai Iconic Liv PG-2.
            </p>
          </div>

          <div className="amenity-grid">
            {amenities.map(({ icon: Icon, title, detail }) => (
              <div className="amenity" key={title}>
                <span className="amenity-icon">
                  <Icon size={21} strokeWidth={1.8} />
                </span>

                <div>
                  <h3>{title}</h3>
                  <p>{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PHOTO GALLERY */}
        <section className="gallery-section" id="gallery">
          <div className="section-wrap">
            <div className="section-heading">
              <div>
                <span className="eyebrow">A LOOK AROUND</span>
                <h2>
                  See the <em>space.</em>
                </h2>
              </div>

              <p>
                Photos shared by Sai Iconic Liv PG-2. Room photos shown
                here are the uploaded property images.
              </p>
            </div>

            <div className="gallery-grid">
              {gallery.map((item) => (
                <figure
                  className={
                    item.span === 'large'
                      ? 'gallery-item gallery-large'
                      : 'gallery-item'
                  }
                  key={item.src}
                >
                  <img
                    src={item.src}
                    alt={item.label}
                    loading="lazy"
                  />
                  <figcaption>{item.label}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* 360 DEGREE VIRTUAL TOUR SECTION */}
        <section
          className="virtual-tour-section section-wrap"
          id="virtual-tour"
        >
          <div className="section-heading">
            <div>
              <span className="eyebrow">EXPLORE BEFORE YOU VISIT</span>
              <h2>
                Take a <em>360° tour.</em>
              </h2>
            </div>

            <p>
              Explore Sai Iconic Liv PG-2 through these virtual tour
              locations before planning your visit.
            </p>
          </div>

          <div className="virtual-tour-grid">
            {virtualTours.map((tour, index) => (
              <a
                className="virtual-tour-card"
                href={tour.url}
                key={tour.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="virtual-tour-number">
                  0{index + 1}
                </span>

                <div>
                  <h3>{tour.title}</h3>
                  <p>Explore this view of the property</p>
                </div>

                <span className="virtual-tour-arrow">
                  <ArrowUpRight size={21} />
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* UPDATED LOCATION SECTION */}
        <section
          className="location-section section-wrap"
          id="location"
        >
          <div className="location-card">
            <div className="location-copy">
              <span className="eyebrow">FIND YOUR WAY</span>

              <h2>
                Make yourself
                <br />
                <em>at home.</em>
              </h2>

              <p>
                <MapPin size={18} />
                Find Sai Iconic Liv Men's & Co-Living PG-2 on Google Maps.
              </p>

              <a
                className="button button-primary"
                href={LOCATION_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Get directions <ArrowUpRight size={17} />
              </a>
            </div>

            <img
              src="/images/signboard.png"
              alt="Sai Iconic Liv Men's & Co-Living PG-2 signboard"
              loading="lazy"
            />
          </div>
        </section>

        {/* ENQUIRY SECTION */}
        <section className="enquiry-section section-wrap" id="enquiry">
          <div className="enquiry-copy">
            <span className="eyebrow">HAVE A QUESTION?</span>

            <h2>
              Let's find your
              <br />
              <em>right room.</em>
            </h2>

            <p>
              Tell us which sharing option you prefer. We'll help you
              check availability and joining details.
            </p>

            <div className="contact-line">
              <MessageCircle size={19} />
              <span>
                WhatsApp enquiries
                <br />
                <b>+91 85002 30472</b>
              </span>
            </div>
          </div>

          <form className="enquiry-form" onSubmit={handleSubmit}>
            <label>
              Your name
              <input
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                placeholder="Enter your name"
                required
              />
            </label>

            <label>
              Phone number
              <input
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
                placeholder="Enter your phone number"
                type="tel"
                required
              />
            </label>

            <label>
              Preferred room
              <select
                value={form.sharing}
                onChange={(e) =>
                  setForm({ ...form, sharing: e.target.value })
                }
              >
                {rooms.map((room) => (
                  <option key={room.id} value={room.label}>
                    {room.label} — ₹
                    {room.rent.toLocaleString('en-IN')}/month
                  </option>
                ))}
              </select>
            </label>

            <label>
              Message (optional)
              <textarea
                value={form.message}
                onChange={(e) =>
                  setForm({ ...form, message: e.target.value })
                }
                placeholder="Any questions or preferred joining date?"
                rows="3"
              />
            </label>

            <button
              className="button button-primary full-width"
              type="submit"
            >
              Send enquiry <ArrowRight size={17} />
            </button>

            {submitState && (
              <p className="form-status" role="status">
                {submitState}
              </p>
            )}

            <small>
              By submitting, you agree to be contacted about your enquiry.
            </small>
          </form>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-main">
          <a className="brand footer-brand" href="#home">
            <img src="/images/approved-logo.png" alt="" />
            <span className="brand-copy">
              <b>Sai Iconic Liv</b>
              <small>MEN'S & CO-LIVING PG-2</small>
            </span>
          </a>

          <p>Your second home in Hyderabad.</p>

          <a
            className="footer-wa"
            href={waLink()}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={17} /> Contact on WhatsApp
          </a>

          <a href="/admin/login" className="footer-admin">
            Admin Login
          </a>
        </div>

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Sai Iconic Liv PG-2
          </span>

          <a
            href={LOCATION_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            View location on Google Maps
          </a>

          <a href="#home">Back to top ↑</a>
        </div>
      </footer>

      <RoomModal
        room={selectedRoom}
        onClose={() => setSelectedRoom(null)}
      />

      <a
        className="floating-wa"
        href={waLink()}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={23} />
      </a>
    </div>
  );
}

export default App;
