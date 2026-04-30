import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import api from '../services/api';
import './ReportsPage.css';

const ReportsPage = () => {
    const navigate = useNavigate();
    const [equipment, setEquipment] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [reportType, setReportType] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            const response = await api.get('/api/locations/');
            setLocations(response.data);
        } catch (err) {
            console.error('Ошибка загрузки локаций:', err);
        }
    };

    const generateReport = async () => {
        try {
            setLoading(true);
            const params = {};
            
            // Определяем тип отчёта и дополнительные фильтры
            if (reportType === 'written_off') {
                params.status = 'written_off';
                params.ordering = 'write_off_date';
            } else if (reportType === 'active') {
                params.status = 'active';
                params.ordering = 'inventory_number';
            } else if (reportType === 'repair') {
                params.status = 'repair';
                params.ordering = 'name';
            }
            
            if (locationFilter) {
                params.location = locationFilter;
            }
            if (statusFilter && !params.status) {
                params.status = statusFilter;
            }
            
            // Получаем ВСЕ данные без пагинации (или с большим лимитом)
            const response = await api.get('/api/equipment/', { 
                params: { ...params, page_size: 10000 } 
            });
            setEquipment(response.data);
        } catch (err) {
            console.error('Ошибка генерации отчёта:', err);
            setEquipment([]);
        } finally {
            setLoading(false);
        }
    };

    const printReport = () => {
        const printWindow = window.open('', '_blank');
        
        const reportTitle = reportType === 'written_off' ? 'Акт списания оборудования' :
                           reportType === 'active' ? 'Инвентаризационная опись (активное оборудование)' :
                           reportType === 'repair' ? 'Оборудование в ремонте' :
                           'Общий отчёт по оборудованию';
        
        const date = new Date().toLocaleDateString('ru-RU');
        
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>${reportTitle}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #333; font-size: 18px; margin-bottom: 10px; }
                    .header-info { margin-bottom: 20px; color: #666; font-size: 12px; }
                    table { width: 100%; border-collapse: collapse; font-size: 12px; }
                    th { background-color: #f5f5f5; padding: 8px; text-align: left; border: 1px solid #ddd; }
                    td { padding: 6px 8px; border: 1px solid #ddd; }
                    .footer { margin-top: 30px; font-size: 12px; color: #666; }
                    @media print {
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <h1>${reportTitle}</h1>
                <div class="header-info">
                    <p>Дата формирования: ${date}</p>
                    <p>Количество позиций: ${equipment.length}</p>
                    ${locationFilter ? `<p>Местоположение: ${locations.find(l => l.id === parseInt(locationFilter))?.name || locationFilter}</p>` : ''}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>№</th>
                            <th>Инв. номер</th>
                            <th>Наименование</th>
                            <th>Серийный номер</th>
                            <th>Статус</th>
                            <th>Местоположение</th>
                            <th>Ответственный</th>
			                <th>Дата закупки</th>
                            <th>Срок списания</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        equipment.forEach((item, index) => {
            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.inventory_number || '—'}</td>
                    <td>${item.name || '—'}</td>
                    <td>${item.serial_number || '—'}</td>
                    <td>${item.status === 'active' ? 'В эксплуатации' : 
                          item.status === 'repair' ? 'В ремонте' : 
                          item.status === 'written_off' ? 'Списано' : item.status}</td>
                    <td>${item.location_name || '—'}</td>
                    <td>{item.responsible_person_name || '—'}</td>
		            <td>${item.purchase_date ? new Date(item.purchase_date).toLocaleDateString('ru-RU') : '—'}</td>
                    <td>${item.write_off_date ? new Date(item.write_off_date).toLocaleDateString('ru-RU') : '—'}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
                <div class="footer">
                    <p>Отчёт сформирован автоматически системой инвентаризации НГТУ</p>
                    <button class="no-print" onclick="window.print()">Печать</button>
                </div>
            </body>
            </html>
        `;
        
        printWindow.document.write(html);
        printWindow.document.close();
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        navigate('/login');
    };

    return (
        <div className="reports-container">
            <Navigation onLogout={handleLogout} />
            
            <div className="reports-content">
                <h1> Формирование отчётов</h1>
                
                <div className="report-builder">
                    <div className="builder-section">
                        <h3>Тип отчёта</h3>
                        <div className="report-types">
                            <button
                                className={`report-type-btn ${reportType === 'active' ? 'active' : ''}`}
                                onClick={() => setReportType('active')}
                            >
                                Инвентаризационная опись
                            </button>
                            <button
                                className={`report-type-btn ${reportType === 'written_off' ? 'active' : ''}`}
                                onClick={() => setReportType('written_off')}
                            >
                                Акт списания
                            </button>
                            <button
                                className={`report-type-btn ${reportType === 'repair' ? 'active' : ''}`}
                                onClick={() => setReportType('repair')}
                            >
                                В ремонте
                            </button>
                        </div>
                    </div>
                    
                    <div className="builder-section">
                        <h3>Фильтры (опционально)</h3>
                        <div className="report-filters">
                            <div className="report-filter">
                                <label>Местоположение</label>
                                <select 
                                    value={locationFilter} 
                                    onChange={(e) => setLocationFilter(e.target.value)}
                                >
                                    <option value="">Все</option>
                                    {locations.map(loc => (
                                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div className="builder-actions">
                        <button onClick={generateReport} className="generate-btn" disabled={!reportType}>
                            Сформировать отчёт
                        </button>
                        {equipment.length > 0 && (
                            <button onClick={printReport} className="print-btn">
                                Печать / PDF
                            </button>
                        )}
                    </div>
                </div>
                
                {loading && <div className="loading-indicator"> Формирование отчёта...</div>}
                
                {equipment.length > 0 && !loading && (
                    <div className="report-preview">
                        <h2>
                            Предпросмотр ({equipment.length} позиций)
                        </h2>
                        <div className="table-container">
                            <table className="report-table">
                                <thead>
                                    <tr>
                                        <th>№</th>
                                        <th>Инв. номер</th>
                                        <th>Наименование</th>
                                        <th>Статус</th>
                                        <th>Местоположение</th>
                                        <th>Ответственный</th>
					                    <th>Дата закупки</th>
                                        <th>Срок списания</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {equipment.map((item, index) => (
                                        <tr key={item.id}>
                                            <td>{index + 1}</td>
                                            <td>{item.inventory_number || '—'}</td>
                                            <td>{item.name || '—'}</td>
                                            <td>
                                                <span className={`status-badge status-${item.status}`}>
                                                    {item.status === 'active' ? 'В эксплуатации' : 
                                                     item.status === 'repair' ? 'В ремонте' : 
                                                     item.status === 'written_off' ? 'Списано' : item.status}
                                                </span>
                                            </td>
                                            <td>{item.location_name || '—'}</td>
                                            <td>{item.responsible_person_name || '—'}</td>
					                        <td>{item.purchase_date ? new Date(item.purchase_date).toLocaleDateString('ru-RU') : '—'}</td>
                                            <td>
                                                {item.write_off_date 
                                                    ? new Date(item.write_off_date).toLocaleDateString('ru-RU')
                                                    : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportsPage;
