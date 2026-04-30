import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import api from '../services/api';
import './EquipmentDetailPage.css';

const STATUS_MAP = {
    active: { label: 'В эксплуатации', className: 'status-active' },
    repair: { label: 'В ремонте', className: 'status-repair' },
    written_off: { label: 'Списано', className: 'status-written-off' },
};

const EquipmentDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [equipment, setEquipment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [locations, setLocations] = useState([]);
    // Поля для редактирования
    const [name, setName] = useState('');
    const [barcode, setBarcode] = useState('');
    const [serialNumber, setSerialNumber] = useState('');
    const [status, setStatus] = useState('');
    const [purchaseDate, setPurchaseDate] = useState('');
    const [locationId, setLocationId] = useState('');
    const [writeOffDate, setWriteOffDate] = useState('');

    useEffect(() => {
        fetchEquipment();
        fetchLocations();
    }, [id]);

    const fetchEquipment = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/equipment/${id}/`);
            setEquipment(response.data);
            fillFormData(response.data);
            setError('');
        } catch (err) {
            setError('Ошибка загрузки данных оборудования');
        } finally {
            setLoading(false);
        }
    };

    const fetchLocations = async () => {
        try {
            const response = await api.get('/api/locations/');
            setLocations(response.data);
        } catch (err) {
            console.error('Ошибка загрузки локаций:', err);
        }
    };

    const fillFormData = (data) => {
        setName(data.name || '');
        setBarcode(data.barcode || '');
        setSerialNumber(data.serial_number || '');
        setStatus(data.status || '');
        setLocationId(data.location || '');
	setPurchaseDate(data.purchase_date || '');
        setWriteOffDate(data.write_off_date || '');
    };

    const handleSave = async () => {
        try {
            const payload = {
                name,
                barcode,
                serial_number: serialNumber,
                status,
                location: locationId || null,
                write_off_date: writeOffDate || null,
		        purchase_date: purchaseDate || null,
            };

            const response = await api.patch(`/api/equipment/${id}/`, payload);
            setEquipment(response.data);
            setIsEditing(false);
        } catch (err) {
            console.error('Ошибка сохранения:', err);
            alert('Ошибка при сохранении изменений');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Вы уверены, что хотите удалить это оборудование?')) return;
        
        try {
            await api.delete(`/api/equipment/${id}/`);
            navigate('/dashboard');
        } catch (err) {
            console.error('Ошибка удаления:', err);
            alert('Ошибка при удалении');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        navigate('/login');
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('ru-RU');
    };

    if (loading) {
        return (
            <div className="detail-container">
                <Navigation onLogout={handleLogout} />
                <div className="loading-indicator">⏳ Загрузка...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="detail-container">
                <Navigation onLogout={handleLogout} />
                <div className="detail-error">{error}</div>
                <button onClick={() => navigate('/dashboard')} className="back-button">
                    ← Назад к списку
                </button>
            </div>
        );
    }

    if (!equipment) return null;

    return (
        <div className="detail-container">
            <Navigation onLogout={handleLogout} />
            
            <div className="detail-content">
                <button onClick={() => navigate('/dashboard')} className="back-button">
                    ← Назад к списку
                </button>
                
                <div className="detail-card">
                    <div className="detail-header">
                        <h1>{equipment.inventory_number}</h1>
                        <div className="detail-actions">
                            {!isEditing ? (
                                <>
                                    <button onClick={() => setIsEditing(true)} className="edit-btn">
                                        Редактировать
                                    </button>
                                    <button onClick={handleDelete} className="delete-btn">
                                        Удалить
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={handleSave} className="save-btn">
                                        Сохранить
                                    </button>
                                    <button onClick={() => {
                                        setIsEditing(false);
                                        fillFormData(equipment);
                                    }} className="cancel-btn">
                                        Отмена
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    
                    <div className="detail-grid">
                        <div className="detail-section">
                            <h3>Основная информация</h3>
                            
                            <div className="detail-field">
                                <label>Инвентарный номер</label>
                                <div className="field-value fixed">{equipment.inventory_number}</div>
                            </div>
                            
                            <div className="detail-field">
                                <label>Наименование</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="edit-input"
                                    />
                                ) : (
                                    <div className="field-value">{equipment.name || '—'}</div>
                                )}
                            </div>
                            
                            <div className="detail-field">
                                <label>Штрих-код</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={barcode}
                                        onChange={(e) => setBarcode(e.target.value)}
                                        className="edit-input"
                                    />
                                ) : (
                                    <div className="field-value mono">{equipment.barcode || '—'}</div>
                                )}
                            </div>
                            
                            <div className="detail-field">
                                <label>Серийный номер</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={serialNumber}
                                        onChange={(e) => setSerialNumber(e.target.value)}
                                        className="edit-input"
                                    />
                                ) : (
                                    <div className="field-value mono">{equipment.serial_number || '—'}</div>
                                )}
                            </div>
                        </div>
                        
                        <div className="detail-section">
                            <h3>Статус и расположение</h3>
                            
                            <div className="detail-field">
                                <label>Статус</label>
                                {isEditing ? (
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="edit-input"
                                    >
                                        <option value="active">В эксплуатации</option>
                                        <option value="repair">В ремонте</option>
                                        <option value="written_off">Списано</option>
                                    </select>
                                ) : (
                                    <span className={`status-badge ${STATUS_MAP[equipment.status]?.className}`}>
                                        {STATUS_MAP[equipment.status]?.label || equipment.status}
                                    </span>
                                )}
                            </div>
                            
                            <div className="detail-field">
                                <label>Местоположение</label>
                                {isEditing ? (
                                    <select
                                        value={locationId}
                                        onChange={(e) => setLocationId(e.target.value)}
                                        className="edit-input"
                                    >
                                        <option value="">Не указано</option>
                                        {locations.map((loc) => (
                                            <option key={loc.id} value={loc.id}>
                                                {loc.name}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="field-value">{equipment.location_name || '—'}</div>
                                )}
                            </div>
                            <div className="detail-field">
                                <label>Ответственный</label>
                                <div className="field-value">
                                    {equipment.responsible_person_name || '—'}
                                </div>
                            </div>
                            
                            <div className="detail-field">
                                <label>Дата приобретения</label>
				{isEditing ? (
				        <input
				            type="date"
				            value={purchaseDate}
				            onChange={(e) => setPurchaseDate(e.target.value)}
				            className="edit-input"
				        />
				    ) : (
				        <div className="field-value">
				            {equipment.purchase_date 
				                ? formatDate(equipment.purchase_date)
				                : '—'}
				        </div>
				    )}
                            </div>
                            
                            <div className="detail-field">
                                <label>Срок списания</label>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        value={writeOffDate}
                                        onChange={(e) => setWriteOffDate(e.target.value)}
                                        className="edit-input"
                                    />
                                ) : (
                                    <div className="field-value">
                                        {equipment.write_off_date ? (
                                            <span className={
                                                new Date(equipment.write_off_date) < new Date() 
                                                    ? 'date-overdue' 
                                                    : 'date-normal'
                                            }>
                                                {formatDate(equipment.write_off_date)}
                                            </span>
                                        ) : '—'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="detail-section meta-section">
                        <h3>Метаданные</h3>
                        <div className="meta-grid">
                            <div className="detail-field">
                                <label>ID записи</label>
                                <div className="field-value mono">{equipment.id}</div>
                            </div>
                            <div className="detail-field">
                                <label>Создано</label>
                                <div className="field-value">
                                    {equipment.created_at 
                                        ? new Date(equipment.created_at).toLocaleString('ru-RU') 
                                        : '—'}
                                </div>
                            </div>
                            <div className="detail-field">
                                <label>Обновлено</label>
                                <div className="field-value">
                                    {equipment.updated_at 
                                        ? new Date(equipment.updated_at).toLocaleString('ru-RU') 
                                        : '—'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EquipmentDetailPage;
