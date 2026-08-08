// src/components/global/CustomToast.jsx
import { toast } from "react-toastify";
import { useState, useCallback } from "react";
import Style from "./CustomToast.module.css";

export const showSuccessToast = (titulo, mensagem, dadosAdicionais = null) => {
    toast.success(
        <div className="text-white">
            <div className="d-flex align-items-center mb-3">
                <div>
                    <h5 className={`mb-0 fw-bold ${Style.titulo}`}>{titulo}</h5>
                    <p className="mb-1">{mensagem}</p>
                    {dadosAdicionais && (
                        <div className="mt-2 small opacity-75">
                            {Object.entries(dadosAdicionais).map(([key, value]) => (
                                <p key={key} className="mb-1 small">
                                    <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : value}
                                </p>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        {
            position: "top-right",
            autoClose: 4000,
            closeOnClick: false,
            draggable: true,
            pauseOnHover: true,
            bodyClassName: 'p-0',
            progressClassName: 'bg-white',
            style: {
                borderRadius: '10px',
                border: 'none',
                color: 'var(--azul-escuro)',
                backgroundColor: 'var(--sucess)'
            }
        }
    );
};

export const showErrorToast = (titulo, mensagem) => {
    toast.error(
        <div className="text-white">
            <div className="d-flex align-items-center mb-1">
                <div>
                    <h5 className={`mb-0 fw-bold ${Style.titulo}`}>{titulo}</h5>
                    <p className="mb-0">{mensagem}</p>
                </div>
            </div>
        </div>,
        {
            position: "top-right",
            autoClose: 4000,
            closeOnClick: false,
            draggable: true,
            pauseOnHover: true,
            bodyClassName: 'p-0',
            progressClassName: 'bg-white',
            style: {
                borderRadius: '10px',
                border: 'none',
                color: 'var(--azul-escuro)',
                backgroundColor: 'var(--danger)'
            }
        }
    );
};

export const showInfoToast = (titulo, mensagem) => {
    toast.info(
        <div className="text-white">
            <div className="d-flex align-items-center mb-3">
                <div>
                    <h5 className={`mb-0 fw-bold ${Style.titulo}`}>{titulo}</h5>
                    <p className="mb-0">{mensagem}</p>
                </div>
            </div>
        </div>,
        {
            position: "top-right",
            autoClose: 4000,
            closeOnClick: false,
            draggable: true,
            pauseOnHover: true,
            bodyClassName: 'p-0',
            progressClassName: 'bg-white',
            style: {
                borderRadius: '10px',
                border: 'none',
                color: 'var(--azul-escuro)',
                backgroundColor: 'var(--info)'
            }
        }
    );
};

// Função de confirmação com toast
export const showConfirmToast = (message, onConfirm, onCancel = null, titulo = "Confirmação") => {
    // Cria um ID único para o toast
    const toastId = toast(
        <div>
            <div className="d-flex align-items-center mb-3">
                <div style={{ width: '100%' }}>
                    <h5 className={`mb-2 fw-bold ${Style.titulo}`} style={{ color: 'var(--azul-escuro)' }}>
                        {titulo}
                    </h5>
                    <p className="mb-3" style={{ color: '#555' }}>{message}</p>
                    <div className="d-flex gap-2 mt-2">
                        <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => {
                                toast.dismiss(toastId);
                                if (onCancel) onCancel();
                            }}
                            style={{
                                padding: '8px 20px',
                                borderRadius: '6px',
                                fontWeight: '500'
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            className="btn btn-sm btn-success"
                            onClick={() => {
                                toast.dismiss(toastId);
                                onConfirm();
                            }}
                            style={{
                                padding: '8px 20px',
                                borderRadius: '6px',
                                fontWeight: '500',
                                backgroundColor: 'var(--sucess)',
                                borderColor: 'var(--sucess)'
                            }}
                        >
                            Confirmar
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        {
            position: "top-center",
            autoClose: false,
            closeOnClick: false,
            draggable: false,
            pauseOnHover: true,
            closeButton: false,
            bodyClassName: 'p-0',
            progressClassName: 'd-none',
            style: {
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#ffffff',
                minWidth: '420px',
                maxWidth: '500px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                padding: '20px'
            }
        }
    );
    
    return toastId;
};

// Hook para gerenciar estado de confirmação
export const useConfirmToast = () => {
    const [isConfirming, setIsConfirming] = useState(false);

    const showConfirmToastHook = useCallback((message, onConfirm, onCancel = null, titulo = "Confirmação") => {
        setIsConfirming(true);
        const toastId = showConfirmToast(
            message,
            () => {
                setIsConfirming(false);
                onConfirm();
            },
            () => {
                setIsConfirming(false);
                if (onCancel) onCancel();
            },
            titulo
        );
        return toastId;
    }, []);

    return { showConfirmToast: showConfirmToastHook, isConfirming };
};