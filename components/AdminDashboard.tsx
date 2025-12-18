import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Phone, User, Search, Clock, ClipboardList, Filter, BarChart3, Users, Activity, Edit, Trash2, X, Save, Stethoscope, Plus, Settings, AlertTriangle, Mail, Shield, FileText, CheckCircle, XCircle, ListFilter, Edit3, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Appointment, Doctor, SiteSettings, User as UserType, MedicalRecord } from '../types';
import { TIME_SLOTS } from '../constants';

// Helper to format date strings
const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const weekdays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
    return `${year}/${month}/${day} (${weekdays[date.getDay()]})`;
  } catch (e) {
    return dateStr;
  }
};

export const AdminDashboard = () => {
  const { appointments, doctors, updateAppointment, cancelAppointment, deleteAppointment, updateDoctor, isAdmin, settings, updateSettings, users, deleteUser, updateUser, user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'appointments' | 'doctors' | 'users' | 'settings'>('dashboard');

  if (!isAdmin) {
    return <div className="p-8 text-center text-red-500">您沒有權限存取此頁面。</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList className="text-primary h-8 w-8" />
            診所管理後台
          </h1>
          <p className="text-slate-500 mt-1">管理掛號、查看統計與設定醫師資訊</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
            <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
                <BarChart3 size={16} /> 總覽
            </button>
            <button 
                onClick={() => setActiveTab('appointments')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'appointments' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
                <Calendar size={16} /> 預約管理
            </button>
            <button 
                onClick={() => setActiveTab('doctors')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'doctors' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
                <Stethoscope size={16} /> 醫師排班
            </button>
            <button 
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'users' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
                <Users size={16} /> 會員管理
            </button>
            <button 
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'settings' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
                <Settings size={16} /> 系統設定
            </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="animate-fade-in">
        {activeTab === 'dashboard' && <DashboardTab appointments={appointments} users={users} doctors={doctors} />}
        {activeTab === 'appointments' && <AppointmentsTab appointments={appointments} onUpdate={updateAppointment} onCancel={cancelAppointment} onDelete={deleteAppointment} />}
        {activeTab === 'doctors' && <DoctorsTab doctors={doctors} onUpdate={updateDoctor} />}
        {activeTab === 'users' && <UsersTab users={users} currentUser={currentUser} onDelete={deleteUser} onUpdate={updateUser} />}
        {activeTab === 'settings' && <SettingsTab settings={settings} onUpdate={updateSettings} />}
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, icon, colorClass }: { title: string, value: string | number, icon: React.ReactNode, colorClass: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
    </div>
    <div className={`p-4 rounded-full ${colorClass}`}>
      {icon}
    </div>
  </div>
);

const DashboardTab = ({ appointments, users, doctors }: { appointments: Appointment[], users: UserType[], doctors: Doctor[] }) => {
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.date === today && a.status !== 'cancelled').length;
    const totalAppointments = appointments.length;
    const totalUsers = users.length;
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard 
                    title="今日預約" 
                    value={todayAppointments} 
                    icon={<Calendar className="text-primary w-6 h-6" />} 
                    colorClass="bg-teal-50" 
                />
                <StatsCard 
                    title="總會員數" 
                    value={totalUsers} 
                    icon={<Users className="text-blue-600 w-6 h-6" />} 
                    colorClass="bg-blue-50" 
                />
                <StatsCard 
                    title="總預約數" 
                    value={totalAppointments} 
                    icon={<Activity className="text-purple-600 w-6 h-6" />} 
                    colorClass="bg-purple-50" 
                />
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4">最近預約</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                            <tr>
                                <th className="px-4 py-3">預約編號</th>
                                <th className="px-4 py-3">日期/時間</th>
                                <th className="px-4 py-3">醫師</th>
                                <th className="px-4 py-3">飼主/寵物</th>
                                <th className="px-4 py-3">狀態</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.slice(0, 5).map(apt => (
                                <tr key={apt.id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="px-4 py-3 text-slate-500">#{apt.id.slice(-6)}</td>
                                    <td className="px-4 py-3">{formatDate(apt.date)} {apt.time}</td>
                                    <td className="px-4 py-3">{apt.doctorName}</td>
                                    <td className="px-4 py-3 font-medium">{apt.patientName}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                            apt.status === 'cancelled' ? 'bg-red-100 text-red-600' : 
                                            apt.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                                            'bg-green-100 text-green-600'
                                        }`}>
                                            {apt.status === 'cancelled' ? '已取消' : apt.status === 'completed' ? '已完成' : '預約中'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {appointments.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">尚無預約資料</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const AppointmentsTab = ({ appointments, onUpdate, onCancel, onDelete }: { 
  appointments: Appointment[], 
  onUpdate: (id: string, updates: Partial<Appointment>) => void,
  onCancel: (id: string) => void,
  onDelete: (id: string) => void
}) => {
  const [filterDate, setFilterDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Confirmation states
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const matchDate = filterDate ? apt.date === filterDate : true;
      const matchSearch = searchTerm ? (
        apt.patientName.includes(searchTerm) || 
        apt.patientPhone.includes(searchTerm) ||
        apt.doctorName.includes(searchTerm) ||
        apt.id.includes(searchTerm)
      ) : true;
      const matchStatus = statusFilter !== 'all' ? apt.status === statusFilter : true;
      
      return matchDate && matchSearch && matchStatus;
    }).sort((a, b) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime());
  }, [appointments, filterDate, searchTerm, statusFilter]);

  const handleCancel = (id: string) => {
    onCancel(id);
    setCancelConfirmId(null);
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    setDeleteConfirmId(null);
  };

  return (
     <div className="space-y-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
                <label className="text-xs font-bold text-slate-500 mb-1 block">搜尋</label>
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="姓名、電話或單號"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
            </div>
            <div className="w-full md:w-72 flex-shrink-0">
                <label className="text-xs font-bold text-slate-500 mb-1 block">日期</label>
                <input 
                    type="date" 
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
            </div>
            <div className="w-full md:w-32">
                <label className="text-xs font-bold text-slate-500 mb-1 block">狀態</label>
                <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                >
                    <option value="all">全部</option>
                    <option value="booked">預約中</option>
                    <option value="completed">已完成</option>
                    <option value="cancelled">已取消</option>
                </select>
            </div>
            {(filterDate || searchTerm || statusFilter !== 'all') && (
                <button 
                    onClick={() => {
                        setFilterDate('');
                        setSearchTerm('');
                        setStatusFilter('all');
                    }}
                    className="mb-1 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 rounded transition-colors"
                >
                    清除篩選
                </button>
            )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-4 py-3">時間</th>
                            <th className="px-4 py-3">飼主資訊</th>
                            <th className="px-4 py-3">症狀備註</th>
                            <th className="px-4 py-3">狀態</th>
                            <th className="px-4 py-3 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAppointments.map(apt => (
                            <tr key={apt.id} className={`border-b border-slate-100 hover:bg-slate-50 ${apt.status === 'cancelled' ? 'opacity-60 bg-slate-50' : ''}`}>
                                <td className="px-4 py-3">
                                    <div className="font-bold text-slate-800">{formatDate(apt.date)}</div>
                                    <div className="text-slate-500">{apt.time}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-medium text-slate-800">{apt.patientName}</div>
                                    <div className="text-xs text-slate-500">{apt.patientPhone}</div>
                                </td>
                                <td className="px-4 py-3 max-w-[200px] truncate text-slate-600" title={apt.symptoms}>
                                    {apt.symptoms || '-'}
                                </td>
                                <td className="px-4 py-3">
                                    {apt.status === 'cancelled' ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600">
                                            <XCircle size={12} /> 已取消
                                        </span>
                                    ) : apt.status === 'completed' ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                                            <CheckCircle size={12} /> 已完成
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-600">
                                            <CheckCircle size={12} /> 預約中
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        {apt.status === 'booked' && (
                                            <button
                                                onClick={() => onUpdate(apt.id, { status: 'completed' })}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="標記為已完成"
                                            >
                                                <Check size={18} />
                                            </button>
                                        )}
                                        
                                        {cancelConfirmId === apt.id ? (
                                            <div className="flex items-center gap-1 bg-red-50 px-1 py-0.5 rounded border border-red-200">
                                                <span className="text-[10px] text-red-500 font-bold px-1">取消?</span>
                                                <button onClick={() => handleCancel(apt.id)} className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600">是</button>
                                                <button onClick={() => setCancelConfirmId(null)} className="px-2 py-1 bg-white text-slate-500 text-xs rounded border border-slate-200 hover:bg-slate-50">否</button>
                                            </div>
                                        ) : (
                                            apt.status === 'booked' && (
                                                <button
                                                    onClick={() => { setCancelConfirmId(apt.id); setDeleteConfirmId(null); }}
                                                    className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                                                    title="取消預約"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            )
                                        )}

                                        {deleteConfirmId === apt.id ? (
                                            <div className="flex items-center gap-1 bg-slate-100 px-1 py-0.5 rounded border border-slate-200">
                                                <span className="text-[10px] text-slate-600 font-bold px-1">刪除?</span>
                                                <button onClick={() => handleDelete(apt.id)} className="px-2 py-1 bg-slate-800 text-white text-xs rounded hover:bg-slate-700">是</button>
                                                <button onClick={() => setDeleteConfirmId(null)} className="px-2 py-1 bg-white text-slate-500 text-xs rounded border border-slate-200 hover:bg-slate-50">否</button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => { setDeleteConfirmId(apt.id); setCancelConfirmId(null); }}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="刪除紀錄"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredAppointments.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                    沒有符合條件的預約紀錄
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
     </div>
  );
};

const DoctorsTab = ({ doctors, onUpdate }: { doctors: Doctor[], onUpdate: (id: string, updates: Partial<Doctor>) => void }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Doctor>>({});

    const startEdit = (doc: Doctor) => {
        setEditingId(doc.id);
        setEditForm(doc);
    };

    const handleSave = () => {
        if (editingId && editForm) {
            onUpdate(editingId, editForm);
            setEditingId(null);
        }
    };

    return (
        <div className="grid grid-cols-1 gap-6">
            {doctors.map(doc => (
                <div key={doc.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-full md:w-48 flex-shrink-0">
                        <img src={doc.image} alt={doc.name} className="w-full h-48 object-cover rounded-lg shadow-sm mb-2" />
                        {editingId === doc.id && (
                            <input 
                                type="text"
                                value={editForm.image || ''}
                                onChange={e => setEditForm({...editForm, image: e.target.value})}
                                className="w-full text-xs p-2 border rounded"
                                placeholder="圖片 URL"
                            />
                        )}
                    </div>
                    <div className="flex-1 w-full">
                        <div className="flex justify-between items-start mb-4">
                            {editingId === doc.id ? (
                                <div className="space-y-3 w-full">
                                    <input 
                                        className="text-2xl font-bold text-slate-800 border-b border-slate-300 w-full outline-none pb-1" 
                                        value={editForm.name || ''}
                                        onChange={e => setEditForm({...editForm, name: e.target.value})}
                                    />
                                    <textarea 
                                        className="w-full p-2 border border-slate-200 rounded text-sm text-slate-600"
                                        rows={3}
                                        value={editForm.specialty || ''}
                                        onChange={e => setEditForm({...editForm, specialty: e.target.value})}
                                    />
                                </div>
                            ) : (
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800">{doc.name} 醫師</h3>
                                    <p className="text-primary font-medium mb-2">一般門診</p>
                                    <p className="text-slate-600">{doc.specialty}</p>
                                </div>
                            )}
                            
                            <div className="flex gap-2 ml-4">
                                {editingId === doc.id ? (
                                    <>
                                        <button onClick={handleSave} className="p-2 bg-primary text-white rounded-lg hover:bg-secondary">
                                            <Save size={18} />
                                        </button>
                                        <button onClick={() => setEditingId(null)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200">
                                            <X size={18} />
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={() => startEdit(doc)} className="p-2 text-slate-400 hover:text-primary hover:bg-accent rounded-lg">
                                        <Edit3 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                <Clock size={16} /> 門診時段
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {TIME_SLOTS.map(time => (
                                    <span key={time} className="px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-xs border border-slate-100">
                                        {time}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const UsersTab = ({ users, currentUser, onDelete, onUpdate }: { 
    users: UserType[], 
    currentUser: UserType | null,
    onDelete: (id: string) => void,
    onUpdate: (id: string, updates: Partial<UserType>) => void
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
    
    // Medical Record State
    const [newRecord, setNewRecord] = useState({ diagnosis: '', treatment: '', notes: '' });

    const filteredUsers = users.filter(u => 
        u.name.includes(searchTerm) || 
        u.email.includes(searchTerm) || 
        u.phone.includes(searchTerm)
    );

    const handleDelete = (id: string) => {
        onDelete(id);
        setDeleteConfirmId(null);
    };

    const handleAddRecord = (userId: string) => {
        if (!newRecord.diagnosis) return;
        
        const targetUser = users.find(u => u.id === userId);
        if (!targetUser) return;

        const record: MedicalRecord = {
            id: Math.random().toString(36).substr(2, 9),
            date: new Date().toISOString().split('T')[0],
            ...newRecord
        };

        const updatedHistory = [record, ...(targetUser.medicalHistory || [])];
        onUpdate(userId, { medicalHistory: updatedHistory });
        setNewRecord({ diagnosis: '', treatment: '', notes: '' });
    };

    return (
        <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="搜尋會員姓名、電話或 Email"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-4 py-3">姓名</th>
                            <th className="px-4 py-3">聯絡資訊</th>
                            <th className="px-4 py-3">身份</th>
                            <th className="px-4 py-3 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <React.Fragment key={user.id}>
                                <tr className={`border-b border-slate-100 hover:bg-slate-50 ${expandedUserId === user.id ? 'bg-slate-50' : ''}`}>
                                    <td className="px-4 py-3 font-medium text-slate-800">{user.name}</td>
                                    <td className="px-4 py-3">
                                        <div className="text-slate-600">{user.email}</div>
                                        <div className="text-xs text-slate-400">{user.phone}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {user.role === 'admin' ? '管理員' : '一般會員'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                                                className={`p-2 rounded-lg transition-colors ${expandedUserId === user.id ? 'bg-primary text-white' : 'text-slate-400 hover:text-primary hover:bg-slate-100'}`}
                                                title="病歷紀錄"
                                            >
                                                <ClipboardList size={18} />
                                            </button>
                                            
                                            {user.id !== currentUser?.id && (
                                                deleteConfirmId === user.id ? (
                                                    <div className="flex items-center gap-1 bg-red-50 px-1 py-0.5 rounded border border-red-200">
                                                        <button onClick={() => handleDelete(user.id)} className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600">是</button>
                                                        <button onClick={() => setDeleteConfirmId(null)} className="px-2 py-1 bg-white text-slate-500 text-xs rounded border border-slate-200 hover:bg-slate-50">否</button>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => setDeleteConfirmId(user.id)}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="刪除會員"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                {expandedUserId === user.id && (
                                    <tr className="bg-slate-50">
                                        <td colSpan={4} className="px-4 py-4 border-b border-slate-100">
                                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                                                <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                                    <FileText size={16} /> 寵物病歷紀錄
                                                </h4>
                                                
                                                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                                                    {user.medicalHistory && user.medicalHistory.length > 0 ? (
                                                        user.medicalHistory.map(record => (
                                                            <div key={record.id} className="p-3 rounded-lg border border-slate-100 hover:border-primary/30 transition-colors bg-slate-50">
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <span className="font-bold text-primary">{formatDate(record.date)}</span>
                                                                    <span className="text-xs text-slate-400">#{record.id}</span>
                                                                </div>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                                                    <div><span className="text-slate-500">診斷：</span>{record.diagnosis}</div>
                                                                    <div><span className="text-slate-500">處置：</span>{record.treatment}</div>
                                                                </div>
                                                                {record.notes && (
                                                                    <div className="mt-2 text-xs text-slate-500 bg-white p-2 rounded border border-slate-100">
                                                                        備註：{record.notes}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-center py-4 text-slate-400 text-sm">尚無病歷紀錄</p>
                                                    )}
                                                </div>

                                                <div className="border-t border-slate-100 pt-4">
                                                    <h5 className="text-sm font-bold text-slate-700 mb-3">新增紀錄</h5>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                                        <input 
                                                            placeholder="診斷結果" 
                                                            className="px-3 py-2 border rounded-lg text-sm"
                                                            value={newRecord.diagnosis}
                                                            onChange={e => setNewRecord({...newRecord, diagnosis: e.target.value})}
                                                        />
                                                        <input 
                                                            placeholder="處置/用藥" 
                                                            className="px-3 py-2 border rounded-lg text-sm"
                                                            value={newRecord.treatment}
                                                            onChange={e => setNewRecord({...newRecord, treatment: e.target.value})}
                                                        />
                                                    </div>
                                                    <textarea 
                                                        placeholder="備註 (選填)" 
                                                        className="w-full px-3 py-2 border rounded-lg text-sm mb-3"
                                                        rows={2}
                                                        value={newRecord.notes}
                                                        onChange={e => setNewRecord({...newRecord, notes: e.target.value})}
                                                    />
                                                    <div className="flex justify-end">
                                                        <button 
                                                            onClick={() => handleAddRecord(user.id)}
                                                            disabled={!newRecord.diagnosis}
                                                            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-secondary disabled:opacity-50"
                                                        >
                                                            <Plus size={16} className="inline mr-1" /> 新增紀錄
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const SettingsTab = ({ settings, onUpdate }: { settings: SiteSettings, onUpdate: (s: Partial<SiteSettings>) => void }) => {
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-1">系統設定</h3>
          <p className="text-slate-500 text-sm">修改網站標題與歡迎訊息</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">診所名稱 (App Name)</label>
            <input 
              name="appName"
              value={form.appName}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">首頁主標題</label>
            <input 
              name="welcomeTitle"
              value={form.welcomeTitle}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">首頁副標題 (Highlight)</label>
            <input 
              name="welcomeSubtitle"
              value={form.welcomeSubtitle}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">網站描述</label>
            <textarea 
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary outline-none resize-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
           {saved ? (
             <span className="text-green-600 flex items-center gap-2 text-sm font-bold">
               <CheckCircle size={16} /> 設定已儲存
             </span>
           ) : <span></span>}
           
           <button 
             type="submit"
             className="px-6 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition-colors flex items-center gap-2"
           >
             <Save size={18} /> 儲存變更
           </button>
        </div>
      </form>
    </div>
  );
};