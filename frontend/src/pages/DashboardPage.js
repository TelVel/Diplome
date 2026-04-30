import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import api from '../services/api';
import './DashboardPage.css';

const STATUS_MAP = {
    active: { label: 'В эксплуатации', className: 'status-active' },
    repair: { label: 'В ремонте', className: 'status-repair' },
    written_off: { label: 'Списано', className: 'status-written-off' },
};

const SORT_FIELDS = {
    inventory_number: 'Инв. номер',
    name: 'Наименование',
    status: 'Статус',
    location_name: 'Местоположение',
    responsible_person_name: 'Ответственный',
    purchase_date: 'Дата закупки',
    write_off_date: 'Срок списания',
};

const DashboardPage = () => {
    const navigate = useNavigate();
    const [equipment, setEquipment] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Фильтры и сортировка
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [sortField, setSortField] = useState('inventory_number');
    const [sortDirection, setSortDirection] = useState('asc');

    const fetchEquipment = useCallback(async () => {
        try {
            setLoading(true);
            const params = {};
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;
            if (locationFilter) params.location = locationFilter;
            if (sortField) {
                params.ordering = sortDirection === 'desc' ? `-${sortField}` : sortField;
            }

            const response = await api.get('/api/equipment/', { params });
            setEquipment(response.data);
            setError('');
        } catch (err) {
            setError('Ошибка загрузки данных');
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter, locationFilter, sortField, sortDirection]);

    const fetchLocations = async () => {
        try {
            const response = await api.get('/api/locations/');
            setLocations(response.data);
        } catch (err) {
            console.error('Ошибка загрузки локаций:', err);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    useEffect(() => {
        fetchEquipment();
    }, [fetchEquipment]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        navigate('/login');
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field) => {
        if (sortField !== field) return '↕️';
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('ru-RU');
    };

const handleRowClick = (id) => {
    navigate(`/equipment/${id}`);
};
    return (
        <div className="dashboard-container">
            <Navigation onLogout={handleLogout} />
            
            <div className="dashboard-content">
                <h1>Оборудование</h1>

                <div className="filters-panel">
                    <div className="filter-group">
                        <label>Поиск</label>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Инв. номер, название, штрих-код..."
                        />
                    </div>
                    
                    <div className="filter-group">
                        <label>Статус</label>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="">Все статусы</option>
                            <option value="active">В эксплуатации</option>
                            <option value="repair">В ремонте</option>
                            <option value="written_off">Списано</option>
                        </select>
                    </div>
                    
                    <div className="filter-group">
                        <label>Местоположение</label>
                        <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
                            <option value="">Все местоположения</option>
                            {locations.map((loc) => (
                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    <button onClick={fetchEquipment} className="refresh-button">
                        Обновить
                    </button>
                </div>

                {error && <div className="dashboard-error">{error}</div>}

                <div className="table-container">
                    {loading ? (
                        <div className="loading-indicator">⏳ Загрузка...</div>
                    ) : (
                        <table className="equipment-table">
                            <thead>
                                <tr>
                                    {Object.entries(SORT_FIELDS).map(([field, label]) => (
                                        <th key={field} onClick={() => handleSort(field)} className="sortable-header">
                                            {label} <span className="sort-icon">{getSortIcon(field)}</span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {equipment.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="no-data">
                                            Нет данных для отображения
                                        </td>
                                    </tr>
                                ) : (
                                    equipment.map((item) => (
                                        <tr key={item.id} className="table-row" onClick={() => handleRowClick(item.id)}>
                                            <td>{item.inventory_number}</td>
                                            <td>{item.name}</td>
                                            <td>
                                                <span className={`status-badge ${STATUS_MAP[item.status]?.className}`}>
                                                    {STATUS_MAP[item.status]?.label || item.status}
                                                </span>
                                            </td>
                                            <td>{item.location_name || '—'}</td>
					                        <td>{item.responsible_person_name || '—'}</td>
                                            <td>{formatDate(item.purchase_date)}</td>
                                            <td>{formatDate(item.write_off_date)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
