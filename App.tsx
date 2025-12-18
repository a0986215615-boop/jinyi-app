import React, { useState, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { SymptomChecker } from './components/SymptomChecker';
import { BookingWizard } from './components/BookingWizard';
import { LoginPage, RegisterPage } from './components/Auth';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Calendar, Stethoscope, User, LogIn, Repeat, XCircle, CheckCircle, AlertCircle, Info, Bell, BellOff, PawPrint, Search, ArrowDownUp, Filter, SlidersHorizontal } from 'lucide-react';

// Helper to format date strings (YYYY-MM-DD) to readable format
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

// Landing Page Component
const HomePage = () => {
  const { settings } = useAuth();
  
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-12">
      <div className="text-center max-w-2xl px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-slate-800 tracking-tight mb-6">
          {settings.welcomeTitle}<br />
          <span className="text-primary">{settings.welcomeSubtitle}</span>
        </h1>
        <p className="text-lg text-slate-600 mb-8">
          {settings.description}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/check" 
            className="px-8 py-4 bg-white border-2 border-primary text-primary font-semibold rounded-xl shadow-sm hover:bg-accent transition-colors flex items-center justify-center gap-2"
          >
            <Stethoscope className="w-5 h-5" />
            AI 症狀導診
          </Link>
          <Link 
            to="/book" 
            className="px-8 py-4 bg-primary text-white font-semibold rounded-xl shadow-lg hover:bg-secondary transition-colors flex items-center justify-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            立即掛號
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 max-w-6xl w-full">
        <FeatureCard 
          icon={<Calendar className="w-8 h-8 text-primary" />}
          title="快速預約"
          description="三步驟完成掛號，即時查詢醫師門診時間表。"
          to="/book"
        />
        <FeatureCard 
          icon={<Stethoscope className="w-8 h-8 text-primary" />}
          title="智慧分流"
          description="不知道該掛哪一科？讓 Gemini AI 協助您判斷。"
          to="/check"
        />
        <FeatureCard 
          icon={<PawPrint className="w-8 h-8 text-primary" />}
          title="會員管理"
          description="註冊會員即可隨時查看毛孩的看診歷史紀錄。"
          to="/my-appointments"
        />
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, to }: { icon: React.ReactNode, title: string, description: string, to: string }) => (
  <Link to={to} className="block bg-white p-6 rounded-2xl shadow-md border border-slate-100 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer relative z-10">
    <div className="mb-4 bg-accent w-16 h-16 rounded-full flex items-center justify-center">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-600">{description}</p>
  </Link>
);

const MyAppointmentsPage = () => {
  const { user, userAppointments, cancelAppointment, updateAppointment } = useAuth();
  const navigate = useNavigate();
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  // Filter & Sort State
  const [filterDate, setFilterDate] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
          <div className="bg-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">請先登入</h2>
          <p className="text-slate-600 mb-8">登入後即可查看您的預約歷史紀錄。</p>
          <Link 
            to="/login" 
            className="w-full py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-secondary transition-colors"
          >
            <LogIn className="w-5 h-5" />
            前往登入
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status?: string) => {
    if (status === 'cancelled') {
        return <span className="flex items-center gap-1 text-xs font-bold bg-red-100 text-red-600 px-2 py-1 rounded-full"><XCircle className="w-3 h-3" /> 已取消</span>;
    }
    if (status === 'completed') {
        return <span className="flex items-center gap-1 text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-full"><CheckCircle className="w-3 h-3" /> 已完成</span>;
    }
    return <span className="flex items-center gap-1 text-xs font-bold bg-green-100 text-green-600 px-2 py-1 rounded-full"><CheckCircle className="w-3 h-3" /> 預約成功</span>;
  };

  const handleConfirmCancel = (appointmentId: string) => {
    cancelAppointment(appointmentId);
    setConfirmingId(null);
    
    setNotification({
        type: 'success',
        message: '預約已成功取消！該時段名額已釋出。'
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    setTimeout(() => setNotification(null), 5000);
  };

  const handleToggleReminder = async (appointmentId: string, currentStatus?: boolean) => {
    if (currentStatus) {
      updateAppointment(appointmentId, { reminderSet: false });
      setNotification({ type: 'success', message: '已取消此預約的提醒通知。' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    if (!('Notification' in window)) {
      alert("您的瀏覽器不支援通知功能");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        updateAppointment(appointmentId, { reminderSet: true });
        
        new Notification("提醒通知已設定", {
          body: "我們將會在看診前一天或當天發送提醒通知給您。",
          icon: "https://cdn-icons-png.flaticon.com/512/3076/3076120.png"
        });

        setNotification({ type: 'success', message: '提醒設定成功！請留意瀏覽器通知。' });
      } else {
        setNotification({ type: 'error', message: '無法設定提醒，請允許瀏覽器通知權限。' });
      }
    } catch (error) {
      console.error(error);
      setNotification({ type: 'error', message: '設定提醒時發生錯誤。' });
    }
    setTimeout(() => setNotification(null), 5000);
  };

  // Filter & Sort Logic
  const filteredAppointments = useMemo(() => {
    return userAppointments
      .filter(apt => {
        // Date Filter
        if (filterDate && apt.date !== filterDate) return false;
        
        // Doctor Filter (fuzzy search)
        if (filterDoctor && !apt.doctorName.includes(filterDoctor)) return false;
        
        // Status Filter
        if (filterStatus !== 'all') {
           if (filterStatus === 'booked') {
               // Treat undefined as booked for backward compatibility
               if (apt.status && apt.status !== 'booked') return false;
           } else {
               if (apt.status !== filterStatus) return false;
           }
        }
        return true;
      })
      .sort((a, b) => {
        // Combine date and time for comparison
        const timeA = a.time.includes(':') ? a.time : '00:00';
        const timeB = b.time.includes(':') ? b.time : '00:00';
        const dtA = new Date(`${a.date}T${timeA}`).getTime();
        const dtB = new Date(`${b.date}T${timeB}`).getTime();
        
        return sortOrder === 'asc' ? dtA - dtB : dtB - dtA;
      });
  }, [userAppointments, filterDate, filterDoctor, filterStatus, sortOrder]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-primary" />
          {user.name} 的預約紀錄
        </h2>
      </div>

      {notification && (
        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 shadow-sm transition-all duration-300 animate-fade-in ${
            notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />}
            <div>
                <p className="font-bold">{notification.type === 'success' ? '操作成功' : '操作失敗'}</p>
                <p className="text-sm opacity-90">{notification.message}</p>
            </div>
        </div>
      )}
      
      {/* Controls Section */}
      {userAppointments.length > 0 && (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 mb-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                <span className="font-bold text-sm text-slate-700">篩選與排序</span>
            </div>
            <div className="flex flex-col lg:flex-row gap-4 flex-wrap items-end">
                <div className="flex-1 min-w-[200px]">
                     <label className="text-xs font-bold text-slate-500 mb-1 block">搜尋醫師</label>
                     <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="輸入醫師姓名"
                            value={filterDoctor}
                            onChange={(e) => setFilterDoctor(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                     </div>
                </div>
                <div className="w-full lg:w-72 flex-shrink-0">
                     <label className="text-xs font-bold text-slate-500 mb-1 block">預約日期</label>
                     <input 
                        type="date" 
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                     />
                </div>
                <div className="w-full lg:w-40 flex-shrink-0">
                     <label className="text-xs font-bold text-slate-500 mb-1 block">狀態</label>
                     <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                     >
                        <option value="all">全部</option>
                        <option value="booked">預約成功</option>
                        <option value="completed">已完成</option>
                        <option value="cancelled">已取消</option>
                     </select>
                </div>
                <div className="w-full lg:w-44 flex-shrink-0">
                     <label className="text-xs font-bold text-slate-500 mb-1 block">排序方式</label>
                     <button 
                        onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium flex items-center justify-between bg-white hover:bg-slate-50 transition-colors text-slate-700"
                     >
                        <span>{sortOrder === 'desc' ? '日期：由新到舊' : '日期：由舊到新'}</span>
                        <ArrowDownUp className="w-3 h-3 opacity-50" />
                     </button>
                </div>
            </div>
            {(filterDate || filterDoctor || filterStatus !== 'all') && (
                <div className="mt-3 pt-2 flex justify-end">
                     <button 
                        onClick={() => {
                            setFilterDate('');
                            setFilterDoctor('');
                            setFilterStatus('all');
                            setSortOrder('desc');
                        }}
                        className="text-xs text-slate-500 hover:text-red-500 font-medium flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-red-50"
                     >
                        <XCircle className="w-3 h-3" /> 清除所有篩選
                     </button>
                </div>
            )}
        </div>
      )}

      {userAppointments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
          <p className="text-slate-500 mb-4">目前沒有預約紀錄</p>
          <Link to="/book" className="text-primary font-semibold hover:underline">去掛號</Link>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 animate-fade-in">
          <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
             <Filter className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 mb-2">找不到符合條件的預約</p>
          <button 
            onClick={() => {
                setFilterDate('');
                setFilterDoctor('');
                setFilterStatus('all');
            }}
            className="text-primary font-semibold hover:underline text-sm"
          >
            清除篩選條件
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((apt) => (
            <div key={apt.id} className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${apt.status === 'cancelled' ? 'opacity-60 bg-slate-50' : 'hover:border-primary'}`}>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-accent text-primary text-xs font-bold rounded">
                    {apt.departmentName}
                  </span>
                  {getStatusBadge(apt.status)}
                  <span className="text-slate-400 text-sm">#{apt.id.slice(-6)}</span>
                </div>
                <h3 className={`text-lg font-bold text-slate-800 ${apt.status === 'cancelled' ? 'line-through decoration-slate-400 text-slate-500' : ''}`}>
                  {apt.doctorName} 醫師
                </h3>
                <p className="text-slate-600 flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4" /> {formatDate(apt.date)} 
                  <span className="mx-1">|</span> 
                  {apt.time}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-right">
                  <div className="text-sm text-slate-500">飼主/寵物</div>
                  <div className="font-medium text-slate-800">{apt.patientName}</div>
                </div>
                <div className="flex items-center gap-3 mt-2">
                    {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                         <>
                            <button
                                onClick={() => handleToggleReminder(apt.id, apt.reminderSet)}
                                className={`text-sm flex items-center font-medium px-3 py-2 rounded transition-colors border ${
                                    apt.reminderSet 
                                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100' 
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-primary hover:text-primary'
                                }`}
                                title={apt.reminderSet ? "取消提醒" : "設定提醒"}
                            >
                                {apt.reminderSet ? <Bell className="w-4 h-4 mr-1 fill-yellow-500 text-yellow-600" /> : <Bell className="w-4 h-4 mr-1" />}
                                {apt.reminderSet ? "已開啟" : "提醒我"}
                            </button>

                            {confirmingId === apt.id ? (
                                <div className="flex items-center gap-2 animate-fade-in bg-red-50 px-2 py-1 rounded-lg border border-red-100">
                                    <span className="text-xs text-red-600 font-bold">確定取消?</span>
                                    <button 
                                        onClick={() => handleConfirmCancel(apt.id)}
                                        className="text-sm flex items-center bg-red-600 text-white hover:bg-red-700 font-bold px-3 py-1.5 rounded transition-colors shadow-sm"
                                    >
                                        是
                                    </button>
                                    <button 
                                        onClick={() => setConfirmingId(null)}
                                        className="text-sm flex items-center bg-white text-slate-600 hover:bg-slate-100 font-bold px-3 py-1.5 rounded transition-colors border border-slate-200"
                                    >
                                        否
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => setConfirmingId(apt.id)}
                                    className="text-sm flex items-center text-red-500 hover:text-red-700 font-medium hover:bg-red-50 px-3 py-2 rounded transition-colors border border-transparent hover:border-red-100"
                                >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    取消
                                </button>
                            )}
                         </>
                    )}
                   
                    <button 
                        onClick={() => navigate('/book', { 
                            state: { 
                                preselectedDeptId: apt.departmentId,
                                preselectedDoctorId: apt.doctorId
                            } 
                        })}
                        className="text-sm flex items-center text-primary hover:text-secondary font-medium hover:bg-accent px-3 py-2 rounded transition-colors border border-transparent hover:border-teal-100"
                    >
                        <Repeat className="w-4 h-4 mr-1" />
                        再掛號
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/check" element={<SymptomChecker />} />
            <Route path="/book" element={<AppBookingWrapper />} />
            <Route path="/my-appointments" element={<MyAppointmentsPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AuthProvider>
  );
}

// Wrapper to pass the addAppointment function from context to BookingWizard
const AppBookingWrapper = () => {
    const { addAppointment } = useAuth();
    return <BookingWizard onBook={addAppointment} />;
}