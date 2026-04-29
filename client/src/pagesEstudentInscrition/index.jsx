import { useEffect, useRef, useState } from "react";
import UploadUI from "./components/inputUi";
import styleUI from "./components/inputUi.module.css";
// import style from "./style.module.css";

export default function EstudentIsncription() {
  const [countdown, setCountdown] = useState(7 * 24 * 60 * 60); // 7 days in seconds
    const [paymentProof, setPaymentProof] = useState(null);
    
     const inputRef = useRef(null);

     const [file, setFile] = useState(null);
     const [preview, setPreview] = useState(null);

     function handleFileChange(e) {
       const selectedFile = e.target.files?.[0];

       if (!selectedFile) return;

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

       if (inputRef.current) {
         inputRef.current.value = "";
       }
     }

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const formatTime = (seconds) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const mins = Math.floor((seconds % (60 * 60)) / 60);
    const secs = seconds % 60;
    return `${days}d ${hours}h ${mins}m ${secs}s`;
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          textAlign: "center",
          padding: "2rem",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      >
        <h2>Inscrição do Estudante</h2>
        <p>
          <strong>Nome:</strong> João Silva
        </p>
        <p>
          <strong>Número da Inscrição:</strong> #12345
        </p>
        <p>
          <strong>Referência de Pagamento:</strong> REF-67890
        </p>
        <div
          style={{
            margin: "2rem 0",
            padding: "1rem",
            backgroundColor: "#f0f0f0",
            borderRadius: "4px",
          }}
        >
          <p
            style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#d32f2f" }}
          >
            {formatTime(countdown)}
          </p>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
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
            />
          </UploadUI>
          <button
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Enviar Comprovativo
          </button>
        </div>
      </div>
    </div>
  );
}
