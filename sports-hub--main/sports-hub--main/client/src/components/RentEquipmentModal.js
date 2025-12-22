import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import './RentEquipmentModal.css';

const RentEquipmentModal = ({ isOpen, onClose, equipment, onRent }) => {
    const [formData, setFormData] = useState({
        rentalType: 'hourly',
        quantity: 1,
        startTime: '',
        endTime: '',
        startDate: '',
        endDate: ''
    });
    const [error, setError] = useState('');

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                rentalType: 'hourly',
                quantity: 1,
                startTime: '',
                endTime: '',
                startDate: '',
                endDate: ''
            });
            setError('');
        }
    }, [isOpen]);

    if (!isOpen || !equipment) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // basic client-side validation
        if (formData.rentalType === 'hourly') {
            if (!formData.startTime || !formData.endTime) {
                setError("Start time and end time are required");
                return;
            }
        } else {
            if (!formData.startDate || !formData.endDate) {
                setError("Start date and end date are required");
                return;
            }
        }

        onRent(equipment._id, formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Rent {equipment.name}</h2>
                    <button className="close-button" onClick={onClose}><FiX /></button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Rental Type</label>
                        <select
                            name="rentalType"
                            className="form-control"
                            value={formData.rentalType}
                            onChange={handleChange}
                        >
                            <option value="hourly">Hourly (${equipment.pricePerHour}/hr)</option>
                            <option value="daily">Daily (${equipment.pricePerDay || equipment.pricePerHour * 8}/day)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Quantity</label>
                        <input
                            type="number"
                            name="quantity"
                            min="1"
                            max={equipment.availableQuantity}
                            className="form-control"
                            value={formData.quantity}
                            onChange={handleChange}
                        />
                    </div>

                    {formData.rentalType === 'hourly' ? (
                        <>
                            <div className="form-group">
                                <label className="form-label">Date</label>
                                {/* For hourly, we assume it's for a specific date, maybe today or user selects?
                    The backend doesn't explicitly ask for 'date' for hourly, but uses startTime/endTime logic.
                    Actually, for 'hourly', usually it implies same-day. 
                    Let's just ask for startTime and endTime strings as per backend expectation (HH:MM).
                    Ideally, we should link this to the booking date if linked to a booking. 
                    But standalone rental might need a date. The backend logic:
                    hours = endHour - startHour.
                    It does not seem to care about the date for *cost* calculation, but it should for the record.
                    However, the current backend implementation for 'hourly' ONLY looks at time components.
                */}
                                <input
                                    type="date"
                                    className="form-control mb-2"
                                    name="startDate" // reusing startDate for the date of the hourly rental
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Start Time</label>
                                <input
                                    type="time"
                                    name="startTime"
                                    className="form-control"
                                    value={formData.startTime}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">End Time</label>
                                <input
                                    type="time"
                                    name="endTime"
                                    className="form-control"
                                    value={formData.endTime}
                                    onChange={handleChange}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="form-group">
                                <label className="form-label">Start Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    className="form-control"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">End Date</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    className="form-control"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                />
                            </div>
                        </>
                    )}

                    <button type="submit" className="btn btn-primary btn-block">
                        Confirm Rental
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RentEquipmentModal;
