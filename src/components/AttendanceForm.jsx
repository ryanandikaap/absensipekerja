import React, { useState } from 'react';

const AttendanceForm = ({ onSubmit }) => {
  const [attendanceType, setAttendanceType] = useState('masuk');
  const [keterangan, setKeterangan] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const now = new Date();
    const currentTime = now.toTimeString().substring(0, 5);
    const currentDate = now.toISOString().split('T')[0];
    
    let status = 'Hadir';
    if (attendanceType === 'masuk') {
      const isLate = currentTime > '08:00';
      status = isLate ? 'Terlambat' : 'Hadir';
    } else if (attendanceType === 'cuti') {
      status = 'Cuti';
    }
    
    const attendanceData = {
      type: attendanceType,
      tanggal: currentDate,
      waktu: currentTime,
      status: status,
      keterangan: keterangan
    };
    
    onSubmit(attendanceData);
    setKeterangan(''); // Reset keterangan setelah submit
  };
  
  return (
    <form onSubmit={handleSubmit} className="attendance-form">
      <div className="form-group">
        <label className="form-label">Tipe Absensi</label>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              value="masuk"
              checked={attendanceType === 'masuk'}
              onChange={(e) => setAttendanceType(e.target.value)}
            />
            Masuk
          </label>
          <label className="radio-label">
            <input
              type="radio"
              value="pulang"
              checked={attendanceType === 'pulang'}
              onChange={(e) => setAttendanceType(e.target.value)}
            />
            Pulang
          </label>
          <label className="radio-label">
            <input
              type="radio"
              value="cuti"
              checked={attendanceType === 'cuti'}
              onChange={(e) => setAttendanceType(e.target.value)}
            />
            Cuti
          </label>
        </div>
      </div>
      
      <div className="form-group">
        <label className="form-label">Keterangan {attendanceType === 'cuti' && '(wajib diisi)'}</label>
        <textarea 
          className="textarea-control"
          value={keterangan}
          onChange={(e) => setKeterangan(e.target.value)}
          placeholder={
            attendanceType === 'cuti' 
              ? "Masukkan alasan cuti..." 
              : "Masukkan keterangan jika diperlukan..."
          }
          rows="3"
          required={attendanceType === 'cuti'}
        />
      </div>
      
      <button type="submit" className="btn btn-primary">
        {attendanceType === 'masuk' ? '🕐 Catat Kehadiran' : 
         attendanceType === 'pulang' ? '🚪 Catat Kepulangan' : '📝 Ajukan Cuti'}
      </button>
    </form>
  );
};

export default AttendanceForm;