import { useEffect, useRef, useState } from "react";
import UploadUI from "./components/inputUi";
import styleUI from "./components/inputUi.module.css";
import styles from "./inscriptionStyle.module.css";
import { Clock, User, Hash, CreditCard, Send } from "lucide-react";

export default function EstudentIsncription() {
  const [countdown, setCountdown] = useState(7 * 24 * 60 * 60); // 7 days in seconds
  const [paymentProof, setPaymentProof] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  function handleFileChange(e) {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    // Validação de tamanho (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert("O ficheiro não pode exceder 10MB");
      return;
    }

    setFile(selectedFile);
    setPaymentProof(e.target.files[0]);

    if (selectedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }

  function removeFile() {
    setFile(null);
    setPreview(null);
    setPaymentProof(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleSubmit() {
    if (!file) {
      alert("Por favor, anexe o comprovativo de pagamento");
      return;
    }
    
    setIsSubmitting(true);
    
    // Simular envio
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    }, 1500);
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const mins = Math.floor((seconds % (60 * 60)) / 60);
    const secs = seconds % 60;
    return { days, hours, mins, secs };
  };

  const { days, hours, mins, secs } = formatTime(countdown);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <User size={32} />
          </div>
          <h2>Inscrição do Estudante</h2>
          <p>Preencha os dados abaixo para completar sua inscrição</p>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <User size={18} />
            <div>
              <span className={styles.infoLabel}>Nome Completo</span>
              <strong>João Silva</strong>
            </div>
          </div>
          <div className={styles.infoItem}>
            <Hash size={18} />
            <div>
              <span className={styles.infoLabel}>Número de Inscrição</span>
              <strong>#12345</strong>
            </div>
          </div>
          <div className={styles.infoItem}>
            <CreditCard size={18} />
            <div>
              <span className={styles.infoLabel}>Referência de Pagamento</span>
              <strong>REF-67890</strong>
            </div>
          </div>
        </div>

        <div className={styles.countdownBox}>
          <div className={styles.countdownHeader}>
            <Clock size={20} />
            <span>Tempo restante para pagamento</span>
          </div>
          <div className={styles.countdownTimer}>
            <div className={styles.timeUnit}>
              <span className={styles.timeValue}>{String(days).padStart(2, '0')}</span>
              <span className={styles.timeLabel}>Dias</span>
            </div>
            <span className={styles.timeSeparator}>:</span>
            <div className={styles.timeUnit}>
              <span className={styles.timeValue}>{String(hours).padStart(2, '0')}</span>
              <span className={styles.timeLabel}>Horas</span>
            </div>
            <span className={styles.timeSeparator}>:</span>
            <div className={styles.timeUnit}>
              <span className={styles.timeValue}>{String(mins).padStart(2, '0')}</span>
              <span className={styles.timeLabel}>Minutos</span>
            </div>
            <span className={styles.timeSeparator}>:</span>
            <div className={styles.timeUnit}>
              <span className={styles.timeValue}>{String(secs).padStart(2, '0')}</span>
              <span className={styles.timeLabel}>Segundos</span>
            </div>
          </div>
        </div>

        <div className={styles.uploadSection}>
          <div className={styles.sectionTitle}>
            <span>Comprovativo de Pagamento</span>
            <small>Formatos aceites: PNG, JPG, PDF (máx. 10MB)</small>
          </div>

          <UploadUI
            handleFileChange={handleFileChange}
            removeFile={removeFile}
            file={file}
            preview={preview}
            inputRef={inputRef}
          >
            <input
              ref={inputRef}
              type="file"
              className={styleUI.uploadInput}
              onChange={handleFileChange}
              accept="image/*,application/pdf"
            />
          </UploadUI>

          <button
            className={`${styles.submitButton} ${isSubmitting ? styles.submitting : ""} ${submitSuccess ? styles.success : ""}`}
            onClick={handleSubmit}
            disabled={isSubmitting || !file}
          >
            {isSubmitting ? (
              <>
                <div className={styles.spinner}></div>
                A enviar...
              </>
            ) : submitSuccess ? (
              <>
                ✓ Enviado com sucesso!
              </>
            ) : (
              <>
                <Send size={18} />
                Enviar Comprovativo
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}