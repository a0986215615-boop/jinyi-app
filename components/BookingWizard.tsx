import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Appointment } from '../types';
import { TIME_SLOTS } from '../constants';
import { Check, Calendar, Clock, User, Stethoscope, LogIn, ArrowRight, AlertCircle, FileText, PawPrint, Phone as PhoneIcon, AlertTriangle, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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

interface BookingWizardProps {
  onBook: (appointment: Appointment) => void;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({ onBook }) => {
  const navigate = useNavigate();
  const { user, doctors, appointments, updateAppointment } = useAuth();
  
  // Always use the first doctor from the context (dynamic data)
  const singleDoctor = doctors[0];
  
  // Steps: 1. Time, 2. Info, 3. Success
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [patientInfo, setPatientInfo] = useState({ name: '', phone: '', symptoms: '' });
  
  // Track the ID of the newly created appointment for post-booking actions (like notifications)
  const [lastAppointmentId, setLastAppointmentId] = useState<string | null>(null);
  const [isReminderSet, setIsReminderSet] = useState(false);
  
  // Validation state
  const [phoneError, setPhoneError] = useState('');

  // Auto-fill user info
  useEffect(() => {
    if (user) {
      setPatientInfo(prev => ({
        ...prev,
        name: user.name,
        phone: user.phone
      }));
    }
  }, [user]);

  if (!singleDoctor) {
    return <div>Loading doctors...</div>;
  }

  // Max appointments per day
  const MAX_DAILY_APPOINTMENTS = 10;

  // Helper to get YYYY-MM-DD in local time to prevent timezone issues
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get today's date string for comparison
  const today = new Date();
  const todayStr = getLocalDateString(today);

  // Generate next 14 days starting from today
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); // current date
    d.setDate(d.getDate() + i); // add i days
    return getLocalDateString(d);
  });

  // Filter time slots: If selected date is today, remove past times
  const getAvailableTimeSlots = (dateStr: string) => {
    let slots = TIME_SLOTS;

    if (dateStr === todayStr) {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        slots = slots.filter(slot => {
            const [slotHour, slotMinute] = slot.split(':').map(Number);
            return slotHour > currentHour || (slotHour === currentHour && slotMinute > currentMinute);
        });
    }
    return slots;
  };

  // Check if a specific day is full (>= 10 appointments)
  const isDayFull = (dateStr: string) => {
    const count = appointments.filter(a => a.date === dateStr && a.status !== 'cancelled').length;
    return count >= MAX_DAILY_APPOINTMENTS;
  };

  // Check if a specific time slot is taken
  const isSlotTaken = (dateStr: string, timeStr: string) => {
      return appointments.some(a => 
        a.date === dateStr && 
        a.time === timeStr && 
        a.status !== 'cancelled'
      );
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and enforce max length of 10
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPatientInfo({ ...patientInfo, phone: val });
    
    // Only validate if user is typing manually (not readOnly user data)
    if (!user) {
        if (val.length === 0) {
            setPhoneError('');
        } else if (!val.startsWith('09')) {
            setPhoneError('手機號碼必須以 09 開頭');
        } else if (val.length < 10) {
            setPhoneError('請輸入完整 10 碼手機號碼');
        } else {
            setPhoneError('');
        }
    }
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;
    
    // Final validation check for guests
    if (!user) {
        if (!/^09\d{8}$/.test(patientInfo.phone)) {
            setPhoneError('請輸入有效的 10 碼手機號碼');
            return;
        }
    }

    const newId = Math.random().toString(36).substr(2, 9);
    const appointment: Appointment = {
      id: newId,
      userId: user?.id,
      departmentId: singleDoctor.departmentId,
      departmentName: '一般門診', // Simplified for single doctor
      doctorId: singleDoctor.id,
      doctorName: singleDoctor.name,
      date: selectedDate,
      time: selectedTime,
      patientName: patientInfo.name,
      patientPhone: patientInfo.phone,
      symptoms: patientInfo.symptoms,
      reminderSet: false,
    };

    setLastAppointmentId(newId);
    setIsReminderSet(false); // Reset for new booking
    onBook(appointment);
    setStep(3); // Success step
  };

  const ProgressBar = () => (
    <div className="flex justify-center mb-8">
        <div className="flex items-center gap-2 text-sm font-medium">
            <span className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>1</span>
            <span className={step >= 1 ? 'text-slate-800' : 'text-slate-400'}>選擇時間</span>
            <div className="w-8 h-0.5 bg-slate-200 mx-2" />
            <span className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
            <span className={step >= 2 ? 'text-slate-800' : 'text-slate-400'}>填寫資料</span>
            <div className="w-8 h-0.5 bg-slate-200 mx-2" />
            <span className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>3</span>
            <span className={step >= 3 ? 'text-slate-800' : 'text-slate-400'}>完成</span>
        </div>
    </div>
  );

  // Doctor Info Card (Always visible in step 1)
  const DoctorProfile = () => (
    <div className="flex items-center gap-4 p-4 bg-accent/30 border border-primary/20 rounded-xl mb-6">
        <img src={singleDoctor.image} alt={singleDoctor.name} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
        <div>
            <h3 className="text-lg font-bold text-slate-800">{singleDoctor.name} 醫師</h3>
            <p className="text-sm text-slate-600">{singleDoctor.specialty}</p>
        </div>
    </div>
  );

  // Step 1: Select Time (Combined logic)
  const StepTime = () => {
    const activeTimeSlots = getAvailableTimeSlots(selectedDate);
    const dayIsFull = isDayFull(selectedDate);

    return (
      <div className="space-y-6 animate-fade-in">
        <DoctorProfile />
        
        <div>
          <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              選擇看診日期
          </h3>
          {/* Increased pt from pt-5 to pt-8 to prevent badge truncation */}
          <div className="flex gap-3 overflow-x-auto pb-4 pt-8 scrollbar-hide px-1">
            {availableDates.map((date) => {
              const isToday = date === todayStr;
              const isFull = isDayFull(date);
              
              // Parse date string explicitly to prevent timezone shifts in display
              const [y, m, d] = date.split('-').map(Number);
              const dateObj = new Date(y, m - 1, d);

              return (
                <button
                  key={date}
                  disabled={isFull}
                  onClick={() => { setSelectedDate(date); setSelectedTime(''); }}
                  className={`flex-shrink-0 px-4 py-3 rounded-xl border transition-all flex flex-col items-center min-w-[85px] relative ${
                    isFull 
                    ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed' 
                    : selectedDate === date 
                      ? 'bg-primary text-white border-primary shadow-md transform scale-105 z-10' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-primary hover:bg-slate-50'
                  }`}
                >
                  {isToday && !isFull && (
                    <span className={`absolute -top-2.5 left-1/2 transform -translate-x-1/2 text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm whitespace-nowrap ${
                      selectedDate === date ? 'bg-white text-primary' : 'bg-red-500 text-white'
                    }`}>
                      今日
                    </span>
                  )}
                  {isFull && (
                    <span className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm whitespace-nowrap bg-slate-500 text-white">
                      額滿
                    </span>
                  )}
                  <div className="text-xs opacity-70 mb-1 font-medium">
                    {dateObj.toLocaleDateString('zh-TW', { weekday: 'short' })}
                  </div>
                  <div className="font-bold text-xl">
                    {dateObj.getDate()}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {selectedDate && (
          <div className="animate-fade-in">
            <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              選擇時段
            </h3>
            {dayIsFull ? (
                 <div className="flex items-center gap-2 text-orange-500 bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <AlertCircle className="w-5 h-5" />
                    <span>本日預約已達上限（10人），請選擇其他日期。</span>
                 </div>
            ) : (
                activeTimeSlots.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                    {activeTimeSlots.map((time) => {
                        const taken = isSlotTaken(selectedDate, time);
                        return (
                            <button
                                key={time}
                                disabled={taken}
                                onClick={() => setSelectedTime(time)}
                                className={`px-2 py-3 rounded-lg text-sm font-medium text-center transition-all border flex flex-col items-center justify-center gap-1 ${
                                taken
                                    ? 'bg-slate-100 text-slate-400 border-slate-100 cursor-not-allowed'
                                    : selectedTime === time
                                    ? 'bg-secondary text-white border-secondary ring-2 ring-offset-1 ring-secondary'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-primary hover:text-primary'
                                }`}
                            >
                                <span>{time}</span>
                                {taken && <span className="text-[10px] leading-none">已預約</span>}
                            </button>
                        );
                    })}
                </div>
                ) : (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400">
                    今日時段已結束，請選擇其他日期。
                </div>
                )
            )}
          </div>
        )}

        <div className="flex justify-end pt-4 mt-8 border-t border-slate-100">
          <button 
            disabled={!selectedDate || !selectedTime}
            onClick={() => setStep(2)}
            className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
              selectedDate && selectedTime 
                ? 'bg-primary text-white hover:bg-secondary shadow-lg hover:shadow-xl transform hover:-translate-y-0.5' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            下一步
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  // Step 2: Patient Info
  const StepForm = () => (
    <div className="max-w-md mx-auto animate-fade-in">
      <div className="bg-slate-50 p-4 rounded-xl mb-6 text-sm text-slate-700 border border-slate-200">
        <div className="flex items-center gap-3 mb-2 pb-2 border-b border-slate-200">
            <Stethoscope className="w-4 h-4 text-primary" />
            <span className="font-bold">{singleDoctor.name} 醫師</span>
        </div>
        <div className="flex justify-between items-center">
            <span className="text-slate-500">預約時間</span>
            <span className="font-bold text-slate-800">{formatDate(selectedDate)} {selectedTime}</span>
        </div>
      </div>

      {!user && (
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6 flex items-center justify-between">
          <div className="text-sm text-blue-700">
            建議先登入會員，方便管理毛孩紀錄。
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="text-sm bg-white text-blue-600 px-3 py-1.5 rounded-lg border border-blue-200 font-semibold hover:bg-blue-50"
          >
            登入
          </button>
        </div>
      )}

      <form onSubmit={handleFinalSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">飼主姓名</label>
          <div className="relative">
            <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
                required
                type="text"
                value={patientInfo.name}
                onChange={e => setPatientInfo({...patientInfo, name: e.target.value})}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none ${user ? 'bg-slate-100' : 'bg-white'}`}
                placeholder="請輸入飼主姓名"
                readOnly={!!user}
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">聯絡電話 (僅限數字, 10碼)</label>
          <div className="relative">
            <PhoneIcon className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
                required
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={patientInfo.phone}
                onChange={handlePhoneChange}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-colors ${
                    user 
                        ? 'bg-slate-100 border-slate-200' 
                        : phoneError 
                            ? 'bg-white border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-500' 
                            : 'bg-white border-slate-200 focus:ring-2 focus:ring-primary'
                }`}
                placeholder="09xxxxxxxx"
                readOnly={!!user}
            />
            {phoneError && <AlertTriangle className="absolute right-3 top-3 w-5 h-5 text-red-500" />}
          </div>
          {phoneError && <p className="text-red-500 text-xs mt-1 ml-1">{phoneError}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">寵物狀況/症狀描述 (選填)</label>
          <textarea
            value={patientInfo.symptoms}
            onChange={e => setPatientInfo({...patientInfo, symptoms: e.target.value})}
            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary outline-none bg-white resize-none"
            placeholder="請簡述毛孩的不舒服症狀，例如：食慾不振、拉肚子..."
            rows={3}
          />
        </div>

        <div className="flex justify-between pt-6 gap-4">
          <button type="button" onClick={() => setStep(1)} className="px-6 py-3 rounded-xl text-slate-500 hover:bg-slate-100 font-medium transition-colors">上一步</button>
          <button 
            type="submit"
            disabled={!!phoneError}
            className="flex-1 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            確認預約
          </button>
        </div>
      </form>
    </div>
  );

  // Step 3: Success
  const StepSuccess = () => {
    const handleEnableNotification = async () => {
      if (!('Notification' in window)) {
        alert("您的瀏覽器不支援通知功能");
        return;
      }

      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          if (lastAppointmentId) {
            updateAppointment(lastAppointmentId, { reminderSet: true });
            setIsReminderSet(true);
            
            new Notification("預約提醒已設定", {
              body: `我們將會在看診前一天或當天發送提醒通知給您。`,
              icon: "https://cdn-icons-png.flaticon.com/512/3076/3076120.png"
            });
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    return (
      <div className="text-center py-8 animate-fade-in">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Check className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">預約成功！</h2>
        <p className="text-slate-600 mb-8">請準時帶毛孩前往診所報到。</p>
        
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm max-w-sm mx-auto mb-8 text-left space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
          <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary mt-0.5" />
              <div>
                  <p className="text-xs text-slate-400">日期</p>
                  <p className="font-medium text-lg">{formatDate(selectedDate)}</p>
              </div>
          </div>
          <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary mt-0.5" />
              <div>
                  <p className="text-xs text-slate-400">時間</p>
                  <p className="font-medium text-lg">{selectedTime}</p>
              </div>
          </div>
          <div className="flex items-start gap-3">
              <Stethoscope className="w-5 h-5 text-primary mt-0.5" />
              <div>
                  <p className="text-xs text-slate-400">醫師</p>
                  <p className="font-medium">{singleDoctor.name} 醫師</p>
              </div>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-start gap-3">
              <User className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                  <p className="text-xs text-slate-400">飼主姓名</p>
                  <p className="font-medium">{patientInfo.name}</p>
              </div>
          </div>
        </div>

        {/* Notification Toggle Button */}
        <div className="max-w-sm mx-auto mb-8">
             <button
                onClick={handleEnableNotification}
                disabled={isReminderSet}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all ${
                    isReminderSet 
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-700 cursor-default' 
                    : 'bg-white border-slate-200 text-slate-600 hover:border-primary hover:text-primary shadow-sm hover:shadow-md'
                }`}
             >
                <Bell className={`w-5 h-5 ${isReminderSet ? 'fill-yellow-500 text-yellow-600' : ''}`} />
                {isReminderSet ? '已開啟到診提醒' : '開啟到診提醒通知'}
             </button>
             {isReminderSet && <p className="text-xs text-yellow-600 mt-2">系統將於看診前發送瀏覽器通知。</p>}
        </div>

        <div className="flex justify-center gap-4">
          <button onClick={() => navigate('/')} className="text-slate-500 hover:text-slate-800 font-medium px-4 py-2">回首頁</button>
          {user ? (
              <button 
                  onClick={() => navigate('/my-appointments')}
                  className="px-6 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-secondary shadow-lg hover:shadow-xl transition-all"
              >
                查看預約紀錄
              </button>
          ) : (
            <button 
                onClick={() => navigate('/login')}
                className="px-6 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-secondary shadow-lg hover:shadow-xl transition-all"
            >
              登入查看
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <ProgressBar />
      {step === 1 && <StepTime />}
      {step === 2 && <StepForm />}
      {step === 3 && <StepSuccess />}
    </div>
  );
};