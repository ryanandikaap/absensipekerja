import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import './AttendanceForm.css'; // Kita akan pindahkan styles ke file terpisah

const AttendanceForm = ({ onSubmit }) => {
  const [attendanceType, setAttendanceType] = useState('masuk');
  const [keterangan, setKeterangan] = useState('');
  const [photo, setPhoto] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  // Video constraints untuk kamera
  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user",
    screenshotQuality: 0.8
  };

  // Fungsi untuk mengambil foto dari kamera
  const capturePhoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setPhoto(imageSrc);
      setIsCameraActive(false);
    }
  };

  // Fungsi untuk memulai kamera
  const startCamera = () => {
    setIsCameraActive(true);
    setError(null);
    setPhoto(null);
  };

  // Fungsi untuk mengambil ulang foto
  const retakePhoto = () => {
    setPhoto(null);
    setIsCameraActive(true);
  };

  // Fungsi untuk mengonversi base64 ke blob
  const dataURLtoBlob = (dataURL) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validasi: foto wajib untuk absen masuk dan pulang
      if ((attendanceType === 'masuk' || attendanceType === 'pulang') && !photo) {
        throw new Error('Harap ambil foto terlebih dahulu untuk absen ' + attendanceType);
      }

      // Validasi: keterangan wajib untuk cuti
      if (attendanceType === 'cuti' && !keterangan.trim()) {
        throw new Error('Harap isi keterangan cuti');
      }

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

      // Siapkan data untuk dikirim
      const attendanceData = {
        type: attendanceType,
        tanggal: currentDate,
        waktu: currentTime,
        status: status,
        keterangan: keterangan,
        timestamp: now.toISOString()
      };

      // Jika ada foto, konversi ke blob dan tambahkan ke data
      if (photo) {
        const blob = dataURLtoBlob(photo);
        attendanceData.photo = {
          blob: blob,
          url: photo,
          filename: `absensi_${attendanceType}_${Date.now()}.jpg`
        };
      }

      // Simulasi upload (ganti dengan API call sebenarnya)
      await simulateUpload(attendanceData);
      
      onSubmit(attendanceData);
      
      // Reset form
      setKeterangan('');
      setPhoto(null);
      setIsCameraActive(false);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Simulasi upload (untuk demo)
  const simulateUpload = (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Data absensi yang dikirim:', data);
        resolve(true);
      }, 1500);
    });
  };

  // Cleanup kamera saat komponen unmount
  useEffect(() => {
    return () => {
      if (webcamRef.current?.stream) {
        webcamRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="attendance-form">
      <div className="form-group">
        <label className="form-label">Tipe Absensi</label>
        <div className="radio-group">
          <label className={`radio-label ${attendanceType === 'masuk' ? 'selected' : ''}`}>
            <input
              type="radio"
              value="masuk"
              checked={attendanceType === 'masuk'}
              onChange={(e) => {
                setAttendanceType(e.target.value);
                setPhoto(null);
                setIsCameraActive(false);
              }}
            />
            <span className="radio-icon">🕐</span>
            Masuk
          </label>
          <label className={`radio-label ${attendanceType === 'pulang' ? 'selected' : ''}`}>
            <input
              type="radio"
              value="pulang"
              checked={attendanceType === 'pulang'}
              onChange={(e) => {
                setAttendanceType(e.target.value);
                setPhoto(null);
                setIsCameraActive(false);
              }}
            />
            <span className="radio-icon">🚪</span>
            Pulang
          </label>
          <label className={`radio-label ${attendanceType === 'cuti' ? 'selected' : ''}`}>
            <input
              type="radio"
              value="cuti"
              checked={attendanceType === 'cuti'}
              onChange={(e) => {
                setAttendanceType(e.target.value);
                setPhoto(null);
                setIsCameraActive(false);
              }}
            />
            <span className="radio-icon">📝</span>
            Cuti
          </label>
        </div>
      </div>

      {/* Bagian Kamera - hanya untuk masuk dan pulang */}
      {(attendanceType === 'masuk' || attendanceType === 'pulang') && (
        <div className="form-group camera-section">
          <label className="form-label">
            Ambil Foto {attendanceType === 'masuk' ? 'Kehadiran' : 'Kepulangan'}
          </label>
          
          {error && <div className="error-message">{error}</div>}
          
          {!isCameraActive && !photo && (
            <div className="camera-prompt">
              <div className="camera-icon">📸</div>
              <p>Foto wajib diambil sebagai bukti kehadiran</p>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={startCamera}
              >
                Buka Kamera
              </button>
            </div>
          )}

          {isCameraActive && (
            <div className="camera-container">
              <div className="camera-frame">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  className="webcam"
                  mirrored={true}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>
              <div className="camera-controls">
                <button 
                  type="button" 
                  className="btn btn-capture"
                  onClick={capturePhoto}
                >
                  📸 Ambil Foto
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setIsCameraActive(false)}
                >
                  ✖ Tutup Kamera
                </button>
              </div>
            </div>
          )}

          {photo && !isCameraActive && (
            <div className="photo-preview">
              <div className="photo-container">
                <img src={photo} alt="Foto absensi" className="captured-photo" />
                <div className="photo-overlay">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={retakePhoto}
                  >
                    🔄 Ambil Ulang
                  </button>
                </div>
              </div>
              <p className="photo-caption">Foto siap diupload ✓</p>
            </div>
          )}
        </div>
      )}

      <div className="form-group">
        <label className="form-label">
          Keterangan {attendanceType === 'cuti' && '(wajib diisi)'}
        </label>
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

      {/* Info Status */}
      <div className="status-info">
        <div className="status-item">
          <span className="status-label">Tanggal:</span>
          <span className="status-value">{new Date().toLocaleDateString('id-ID')}</span>
        </div>
        <div className="status-item">
          <span className="status-label">Waktu:</span>
          <span className="status-value">{new Date().toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}</span>
        </div>
        {photo && (
          <div className="status-item">
            <span className="status-label">Status Foto:</span>
            <span className="status-value success">✓ Tersedia</span>
          </div>
        )}
      </div>

      <button 
        type="submit" 
        className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
        disabled={isLoading || ((attendanceType === 'masuk' || attendanceType === 'pulang') && !photo)}
      >
        {isLoading ? (
          <span className="loading-text">Mengupload...</span>
        ) : attendanceType === 'masuk' ? (
          '📸 Simpan Kehadiran'
        ) : attendanceType === 'pulang' ? (
          '📸 Simpan Kepulangan'
        ) : (
          '📝 Ajukan Cuti'
        )}
      </button>

      {((attendanceType === 'masuk' || attendanceType === 'pulang') && !photo) && (
        <p className="form-hint">
          ⚠ Harap ambil foto terlebih dahulu sebelum submit
        </p>
      )}
    </form>
  );
};

export default AttendanceForm;