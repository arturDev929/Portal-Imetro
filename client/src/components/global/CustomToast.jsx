import { toast } from "react-toastify";
import { useState, useCallback } from "react";
import Style from "./CustomToast.module.css"

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
            autoClose: 1000,
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
        setIsConfirming(true);
        toast(
            <div className="text-white">
                <div className="d-flex align-items-center mb-3">
                    <div>
                        <h5 className={`mb-0 fw-bold ${Style.titulo}`}>{titulo}</h5>
                        <p className="mb-1">{message}</p>
                        <div className="d-flex gap-2 mt-3">
                            <button
                                className="btn btn-sm btn-outline-light"
                                onClick={() => {
                                    setIsConfirming(false);
                                    toast.dismiss();
                                    if (onCancel) onCancel();
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn btn-sm btn-light"
                                onClick={() => {
                                    setIsConfirming(false);
                                    toast.dismiss();
                                    onConfirm();
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
                bodyClassName: 'p-0',
                progressClassName: 'bg-white',
                style: {
                    borderRadius: '10px',
                    border: 'none',
                    color: 'var(--azul-escuro)',
                    backgroundColor: 'var(--warning)',
                    minWidth: '400px'
                }
            }
        );
    }, []);

    return { showConfirmToast, isConfirming };
};