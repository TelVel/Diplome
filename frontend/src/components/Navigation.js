import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = ({ onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { path: '/dashboard', label: 'Оборудование' },
        { path: '/write-offs', label: 'Сроки списания' },
        { path: '/reports', label: 'Отчёты' },
    ];

    return (
        <nav className="navigation">
            <div className="nav-tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.path}
                        className={`nav-tab ${location.pathname === tab.path ? 'active' : ''}`}
                        onClick={() => navigate(tab.path)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="nav-actions">
                <span className="username-display">
                    {localStorage.getItem('username')}
                </span>
                <button onClick={onLogout} className="logout-button">
                    Выйти
                </button>
            </div>
        </nav>
    );
};

export default Navigation;
