import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import api from '../services/api';
import './WriteOffsPage.css';

const WriteOffsPage = () => {
    const navigate = useNavigate();
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');

    const fetchWriteOffs = async () => {
        try {
            setLoading(true);
            const params = { page_size: 10000 };
            
            if (filter === 'written_off') {
                params.status = 'written_off';
            }
            
            params.ordering = 'write_off_date';
            
            const response = await api.get('/api/equipment/', { params });
            
            // Фильтрация на клиенте
            let filteredData = response.data;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (filter === 'all') {
                // Всё кроме списанного
                filteredData = response.data.filter(item => item.status !== 'written_off');
            } else if (filter === 'expiring_soon') {
                // Только у кого срок списания меньше 90 дней, активные или в ремонте
                const ninetyDaysFromNow = new Date();
                ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
                
                filteredData = response.data.filter(item => {
                    if (item.status === 'written_off') return false;
                    if (!item.write_off_date) return false;
                    
                    const writeOffDate = new Date(item.write_off_date);
                    return writeOffDate <= ninetyDaysFromNow && writeOffDate >= today;
                });
            } else if (filter === 'overdue') {
                // Просроченные, но не списанные
                filteredData = response.data.filter(item => {
                    if (item.status === 'written_off') return false;
                    if (!item.write_off_date) return false;
                    
                    const writeOffDate = new Date(item.write_off_date);
                    return writeOffDate < today;
                });
            }
            
            setEquipment(filteredData);
            setError('');
        } catch (err) {
            setError('Ошибка загрузки данных');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWriteOffs();
    }, [filter]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        navigate('/login');
    };

    const getDaysUntilWriteOff = (dateString) => {
        if (!dateString) return null;
        const writeOff = new Date(dateString);
        const today = new Date();
        const diffTime = writeOff - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getExpiryStatus = (days, status) => {
        if (status === 'written_off') return { label: 'Списано', className: 'expiry-written-off' };
        if (days === null) return { label: 'Не указан', className: 'expiry-unknown' };
        if (days < 0) return { label: `Просрочено на ${Math.abs(days)} дн.`, className: 'expiry-overdue' };
        if (days <= 30) return { label: `${days} дн.`, className: 'expiry-critical' };
        if (days <= 90) return { label: `${days} дн.`, className: 'expiry-warning' };
        return { label: `${days} дн.`, className: 'expiry-ok' };
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('ru-RU');
    };

    const exportToCSV = () => {
        const headers = ['Инв. номер', 'Наименование', 'Статус', 'Срок списания', 'Осталось дней'];
        const rows = equipment.map(item => [
            item.inventory_number,
            item.name,
            item.status === 'written_off' ? 'Списано' : 'В эксплуатации',
            formatDate(item.write_off_date),
            getDaysUntilWriteOff(item.write_off_date) || '—'
        ]);
        
        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `списание_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    return (
        <div className="writeoffs-container">
            <Navigation onLogout={handleLogout} />
            
            <div className="writeoffs-content">
                <div className="writeoffs-header">
                    <h1>Мониторинг сроков списания</h1>
                    <button onClick={exportToCSV} className="export-button">
                        Экспорт в CSV
                    </button>
                </div>

                <div className="writeoffs-filters">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        Всё активное
                    </button>
                    <button
                        className={`filter-btn ${filter === 'expiring_soon' ? 'active' : ''}`}
                        onClick={() => setFilter('expiring_soon')}
                    >
                        Истекает до 90 дней
                    </button>
                    <button
                        className={`filter-btn ${filter === 'overdue' ? 'active' : ''}`}
                        onClick={() => setFilter('overdue')}
                    >
                        Просрочено
                    </button>
                    <button
                        className={`filter-btn ${filter === 'written_off' ? 'active' : ''}`}
                        onClick={() => setFilter('written_off')}
                    >
                        Списано
                    </button>
                </div>

                {error && <div className="writeoffs-error">{error}</div>}

                <div className="stats-summary">
                    <div className="stat-card overdue">
                        <div className="stat-value">
                            {equipment.filter(item => {
                                const days = getDaysUntilWriteOff(item.write_off_date);
                                return days !== null && days < 0 && item.status !== 'written_off';
                            }).length}
                        </div>
                        <div className="stat-label">Просрочено</div>
                    </div>
                    <div className="stat-card critical">
                        <div className="stat-value">
                            {equipment.filter(item => {
                                const days = getDaysUntilWriteOff(item.write_off_date);
                                return days !== null && days >= 0 && days <= 30 && item.status !== 'written_off';
                            }).length}
                        </div>
                        <div className="stat-label">До 30 дней</div>
                    </div>
                    <div className="stat-card warning">
                        <div className="stat-value">
                            {equipment.filter(item => {
                                const days = getDaysUntilWriteOff(item.write_off_date);
                                return days !== null && days > 30 && days <= 90 && item.status !== 'written_off';
                            }).length}
                        </div>
                        <div className="stat-label">30-90 дней</div>
                    </div>
                    <div className="stat-card ok">
                        <div className="stat-value">
                            {equipment.filter(item => {
                                const days = getDaysUntilWriteOff(item.write_off_date);
                                return days !== null && days > 90 && item.status !== 'written_off';
                            }).length}
                        </div>
                        <div className="stat-label">Более 90 дней</div>
                    </div>
                </div>

                <div className="table-container">
                    {loading ? (
                        <div className="loading-indicator">⏳ Загрузка...</div>
                    ) : (
                        <table className="writeoffs-table">
                            <thead>
                                <tr>
                                    <th>Инв. номер</th>
                                    <th>Наименование</th>
                                    <th>Статус</th>
                                    <th>Ответственный</th>
                                    <th>Срок списания</th>
				                    <th>Дата закупки</th>
                                    <th>Осталось</th>
                                </tr>
                            </thead>
                            <tbody>
                                {equipment.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="no-data">
                                            Оборудование не найдено
                                        </td>
                                    </tr>
                                ) : (
                                    equipment.map((item) => {
                                        const days = getDaysUntilWriteOff(item.write_off_date);
                                        const expiry = getExpiryStatus(days, item.status);
                                        
                                        return (
                                            <tr key={item.id} className="table-row">
                                                <td>{item.inventory_number}</td>
                                                <td>{item.name}</td>
                                                <td>
                                                    <span className={`expiry-badge ${item.status === 'written_off' ? 'expiry-written-off' : 'expiry-ok'}`}>
                                                        {item.status === 'written_off' ? 'Списано' : 
                                                        item.status === 'repair' ? 'В ремонте' : 'Активно'}
                                                    </span>
                                                </td>
                                                <td>{item.responsible_person_name || '—'}</td>
                                                <td>{formatDate(item.write_off_date)}</td>
						                        <td>{formatDate(item.purchase_date)}</td>
                                                <td>
                                                    <span className={`expiry-badge ${expiry.className}`}>
                                                        {expiry.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WriteOffsPage;
