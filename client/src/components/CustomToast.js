import { toast } from "react-toastify";
import { useState, useCallback } from "react";
import Style from "./CustomToast.module.css"

export const showSuccessToast = (titulo, mensagem, dadosAdicionais = null) => {
    toast.success(
        <div className="text-white">
            <div className="d-flex align-items-center mb-3">
                <div>
                    <h5 className="mb-0 fw-bold">{titulo}</h5>
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
            autoClose: 5000,
            closeOnClick: false,
            draggable: true,
            pauseOnHover: true,
            // className: 'bg-success border-0 text-white',
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
                    <h5 className="mb-0 fw-bold">{titulo}</h5>
                    <p className="mb-0">{mensagem}</p>
                </div>
            </div>
        </div>,
        {
            position: "top-right",
            autoClose: 1000,
            closeOnClick: false,
            draggable: true,
            pauseOnHover: true,
            // className: 'bg-danger border-0 text-white',
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
                    <h5 className="mb-0 fw-bold">{titulo}</h5>
                    <p className="mb-0">{mensagem}</p>
                </div>
            </div>
        </div>,
        {
            position: "top-right",
            autoClose: 1,
            closeOnClick: false,
            draggable: false,
            pauseOnHover: false,
            className: 'bg-info border-0 text-white d-none',
            bodyClassName: 'p-0',
            progressClassName: 'bg-white',
            style: {
                borderRadius: '10px',
                border: 'none'
            }
        }
    );
};

export const useConfirmToast = () => {
    const [isConfirming, setIsConfirming] = useState(false);

    const showConfirmToast = useCallback((message, onConfirm, onCancel = null, titulo = "Confirmação") => {
        const toastId = toast(
            <div className="text-dark">
                <div className="mb-3">
                    <h5 className="mb-2 fw-bold" style={{color:'var(--azul-escuro)'}}>{titulo}</h5>
                    <p className="mb-0">{message}</p>
                </div>
                <div className="d-flex gap-2 justify-content-end">
                    <button 
                        className={`btn btn-sm ${Style.btnCancelar}`}
                        onClick={() => {
                            if (onCancel) onCancel();
                            toast.dismiss(toastId);
                        }}
                    >
                        Cancelar
                    </button>
                    <button 
                        className={`btn ${Style.btnSubmit}`}
                        onClick={async () => {
                            setIsConfirming(true);
                            try {
                                await onConfirm();
                            } finally {
                                setIsConfirming(false);
                            }
                            toast.dismiss(toastId);
                        }}
                        autoFocus
                    >
                        Confirmar
                    </button>
                </div>
            </div>,
            {
                position: "top-center",
                autoClose: true,
                closeOnClick: false,
                draggable: false,
                closeButton: false,
                className: 'bg-white border-0 shadow-lg',
                bodyClassName: 'p-3',
                style: {
                    borderRadius: '10px',
                    border: '1px solid #dee2e6',
                    minWidth: '400px',
                    maxWidth: '500px',
                    zIndex: 9999
                }
            }
        );

        return toastId;
    }, []);

    return {
        showConfirmToast,
        isConfirming
    };
};