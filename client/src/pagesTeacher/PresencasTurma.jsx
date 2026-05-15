import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    MdArrowBack, MdSave, MdCheckBox, MdCheckBoxOutlineBlank, 
    MdCalendarToday, MdQrCodeScanner, MdPersonSearch, 
    MdCheckCircle, MdCancel, MdRefresh, MdCameraAlt,
    MdWarning, MdInfo
} from "react-icons/md";
import { FaCalendarCheck, FaUserCheck, FaQrcode } from "react-icons/fa";
import TeacherLayout from "../layouts/TeacherLayout";
import api from "../service/api";
import { showErrorToast, showSuccessToast, showInfoToast } from "../components/global/CustomToast";

// Cores do sistema
const colors = {
    primary: '#003366',
    primaryLight: '#0047AB',
    primaryDark: '#002244',
    gold: '#B8860B',
    grayLight: '#F5F5F5',
    white: '#FFFFFF',
    danger: '#e0474c',
    success: '#6B8E4C'
};

function PresencasTurma() {
    const { idperiodo, iddisciplina } = useParams();
    const navigate = useNavigate();
    
    const [estudantes, setEstudantes] = useState([]);
    const [presencas, setPresencas] = useState({});
    const [presencasOriginais, setPresencasOriginais] = useState({});
    const [dataAula, setDataAula] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [modoQRCode, setModoQRCode] = useState(false);
    const [codigoDigitado, setCodigoDigitado] = useState("");
    const [scanning, setScanning] = useState(false);
    const [ultimoRegistro, setUltimoRegistro] = useState(null);
    const [filtro, setFiltro] = useState("todos"); // todos, presentes, ausentes
    const [termoPesquisa, setTermoPesquisa] = useState("");
    const inputRef = useRef(null);

    useEffect(() => {
        carregarEstudantes();
        carregarPresencasPorData(dataAula);
    }, [idperiodo, iddisciplina, dataAula]);

    const carregarEstudantes = async () => {
        try {
            const response = await api.get(`/estudantesTurma/${idperiodo}/${iddisciplina}`);
            if (response.data.success) {
                setEstudantes(response.data.data);
                // Inicializar presenças como vazio
                const presencasObj = {};
                response.data.data.forEach(est => {
                    presencasObj[est.id_estudante] = false;
                });
                setPresencas(presencasObj);
                setPresencasOriginais({ ...presencasObj });
            }
        } catch (error) {
            console.error("Erro ao carregar estudantes:", error);
            showErrorToast("Erro", "Não foi possível carregar os estudantes");
        } finally {
            setLoading(false);
        }
    };

    const carregarPresencasPorData = async (data) => {
        try {
            const response = await api.get(`/presencasTurma/${idperiodo}/${iddisciplina}`);
            if (response.data.success) {
                const presencasData = response.data.data.filter(p => 
                    p.data_aula.split('T')[0] === data
                );
                const novasPresencas = { ...presencas };
                estudantes.forEach(est => {
                    const presenca = presencasData.find(p => p.id_estudante === est.id_estudante);
                    if (presenca) {
                        novasPresencas[est.id_estudante] = presenca.presente === 1;
                    } else {
                        novasPresencas[est.id_estudante] = false;
                    }
                });
                setPresencas(novasPresencas);
                setPresencasOriginais({ ...novasPresencas });
            }
        } catch (error) {
            console.error("Erro ao carregar presenças:", error);
        }
    };

    const handleDataChange = (e) => {
        const novaData = e.target.value;
        setDataAula(novaData);
        carregarPresencasPorData(novaData);
    };

    const togglePresenca = async (idEstudante) => {
        const estudante = estudantes.find(e => e.id_estudante === idEstudante);
        const novaPresenca = !presencas[idEstudante];
        
        // Verificar se já existe marcação para esta data
        try {
            const response = await api.post('/verificarPresencaHoje', {
                id_estudante: idEstudante,
                idperiodo: parseInt(idperiodo),
                iddisciplina: parseInt(iddisciplina),
                data_aula: dataAula
            });
            
            if (response.data.success && response.data.ja_marcado) {
                const statusTexto = response.data.presente ? "presente" : "falta";
                showErrorToast("Marcação já existente", 
                    `Este estudante já possui marcação para ${dataAula} como ${statusTexto}. Não é possível alterar.`);
                // Recarregar presenças para garantir consistência
                carregarPresencasPorData(dataAula);
                return;
            }
        } catch (error) {
            console.error("Erro ao verificar presença:", error);
        }
        
        // Se não existe marcação, permitir alterar localmente
        setPresencas(prev => ({
            ...prev,
            [idEstudante]: novaPresenca
        }));
        
        // Feedback visual
        if (novaPresenca) {
            showSuccessToast("Presença", `${estudante?.nome_estudante} marcado como presente`, 1500);
        }
    };

    const marcarTodos = async () => {
        const todosPresentes = Object.keys(presencas).every(id => presencas[id] === true);
        
        if (!todosPresentes) {
            // Verificar se algum estudante já tem marcação
            let temMarcacao = false;
            for (const id of Object.keys(presencas)) {
                try {
                    const response = await api.post('/verificarPresencaHoje', {
                        id_estudante: parseInt(id),
                        idperiodo: parseInt(idperiodo),
                        iddisciplina: parseInt(iddisciplina),
                        data_aula: dataAula
                    });
                    if (response.data.success && response.data.ja_marcado) {
                        temMarcacao = true;
                        break;
                    }
                } catch (error) {}
            }
            
            if (temMarcacao) {
                showErrorToast("Ação bloqueada", 
                    "Alguns estudantes já possuem marcação para esta data. Recarregue a página para ver os registros atuais.");
                carregarPresencasPorData(dataAula);
                return;
            }
        }
        
        const novasPresencas = {};
        Object.keys(presencas).forEach(id => {
            novasPresencas[id] = !todosPresentes;
        });
        setPresencas(novasPresencas);
    };

    const salvarPresencas = async () => {
        setSalvando(true);
        
        const presencasParaSalvar = [];
        for (const id in presencas) {
            if (presencas[id] !== presencasOriginais[id]) {
                presencasParaSalvar.push({
                    id_estudante: parseInt(id),
                    idperiodo: parseInt(idperiodo),
                    iddisciplina: parseInt(iddisciplina),
                    data_aula: dataAula,
                    presente: presencas[id] ? 1 : 0
                });
            }
        }

        if (presencasParaSalvar.length === 0) {
            showInfoToast("Info", "Nenhuma alteração para salvar");
            setSalvando(false);
            return;
        }

        try {
            // Salvar uma por uma para verificar duplicatas
            let salvos = 0;
            let erros = 0;
            
            for (const presenca of presencasParaSalvar) {
                try {
                    const response = await api.post('/presencaManual', presenca);
                    if (response.data.success) {
                        salvos++;
                        if (response.data.estudante) {
                            setUltimoRegistro({
                                nome: response.data.estudante.nome,
                                hora: new Date().toLocaleTimeString()
                            });
                            setTimeout(() => setUltimoRegistro(null), 3000);
                        }
                    }
                } catch (err) {
                    if (err.response?.status === 409) {
                        erros++;
                    } else {
                        console.error("Erro ao salvar:", err);
                    }
                }
            }
            
            if (salvos > 0) {
                showSuccessToast("Sucesso", `${salvos} presença(s) registrada(s) com sucesso`);
            }
            if (erros > 0) {
                showErrorToast("Atenção", `${erros} estudante(s) já possuíam marcação para esta data`);
            }
            
            // Recarregar dados
            await carregarPresencasPorData(dataAula);
            await carregarEstudantes();
            
        } catch (error) {
            console.error("Erro ao salvar presenças:", error);
            showErrorToast("Erro", "Não foi possível salvar as presenças");
        } finally {
            setSalvando(false);
        }
    };

    // Marcar presença via QR Code (código do estudante)
    const marcarPorQRCode = async () => {
        if (!codigoDigitado.trim()) {
            showErrorToast("Erro", "Digite ou escaneie o código do estudante");
            return;
        }
        
        setScanning(true);
        try {
            const response = await api.post('/presencaQRCode', {
                codigo_estudante: codigoDigitado.trim(),
                idperiodo: parseInt(idperiodo),
                iddisciplina: parseInt(iddisciplina),
                data_aula: dataAula
            });
            
            if (response.data.success) {
                showSuccessToast("Sucesso", response.data.message);
                setUltimoRegistro({
                    nome: response.data.estudante.nome,
                    hora: new Date().toLocaleTimeString(),
                    foto: response.data.estudante.foto
                });
                setTimeout(() => setUltimoRegistro(null), 3000);
                setCodigoDigitado("");
                // Recarregar presenças
                await carregarPresencasPorData(dataAula);
                await carregarEstudantes();
                // Focar no input novamente
                if (inputRef.current) inputRef.current.focus();
            }
        } catch (error) {
            if (error.response?.status === 409) {
                showErrorToast("Registro duplicado", error.response.data.error);
            } else if (error.response?.status === 404) {
                showErrorToast("Estudante não encontrado", error.response.data.error);
            } else {
                showErrorToast("Erro", error.response?.data?.error || "Erro ao registrar presença");
            }
        } finally {
            setScanning(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            marcarPorQRCode();
        }
    };

    const totalPresentes = Object.values(presencas).filter(p => p === true).length;
    const totalAusentes = estudantes.length - totalPresentes;
    const percentualPresentes = estudantes.length > 0 ? (totalPresentes / estudantes.length * 100).toFixed(1) : 0;

    // Filtrar estudantes
    const estudantesFiltrados = estudantes.filter(estudante => {
        // Filtro de status
        if (filtro === "presentes" && !presencas[estudante.id_estudante]) return false;
        if (filtro === "ausentes" && presencas[estudante.id_estudante]) return false;
        // Filtro de pesquisa
        if (termoPesquisa) {
            const termo = termoPesquisa.toLowerCase();
            return estudante.nome_estudante.toLowerCase().includes(termo) ||
                   estudante.numero_estudante.includes(termo);
        }
        return true;
    });

    if (loading) {
        return (
            <TeacherLayout>
                <div className="container-fluid py-4 text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Carregando...</span>
                    </div>
                </div>
            </TeacherLayout>
        );
    }

    return (
        <TeacherLayout>
            <div className="container-fluid px-4 py-4">
                <style>{`
                    :root {
                        --azul-metropolitano: #003366;
                        --azul-claro: #0047AB;
                        --azul-escuro: #002244;
                        --dourado: #B8860B;
                        --cinza-claro: #F5F5F5;
                        --branco: #FFFFFF;
                        --danger: #e0474c;
                        --success: #6B8E4C;
                    }
                    
                    .card-hover:hover {
                        transform: translateY(-2px);
                        transition: all 0.3s ease;
                        box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                    }
                    
                    .qr-scanner-active {
                        animation: pulse 1.5s infinite;
                    }
                    
                    @keyframes pulse {
                        0% { box-shadow: 0 0 0 0 rgba(0, 51, 102, 0.4); }
                        70% { box-shadow: 0 0 0 10px rgba(0, 51, 102, 0); }
                        100% { box-shadow: 0 0 0 0 rgba(0, 51, 102, 0); }
                    }
                    
                    .foto-estudante {
                        width: 48px;
                        height: 48px;
                        border-radius: 50%;
                        object-fit: cover;
                        border: 2px solid var(--dourado);
                    }
                    
                    .toast-notification {
                        position: fixed;
                        bottom: 20px;
                        right: 20px;
                        z-index: 9999;
                        animation: slideIn 0.3s ease;
                    }
                    
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                `}</style>

                {/* Header */}
                <div className="row mb-4">
                    <div className="col-12">
                        <button 
                            className="btn btn-outline-secondary mb-3"
                            onClick={() => navigate(-1)}
                            style={{ borderColor: 'var(--azul-metropolitano)', color: 'var(--azul-metropolitano)' }}
                        >
                            <MdArrowBack className="me-2" />
                            Voltar
                        </button>
                        
                        <div className="d-flex justify-content-between align-items-center flex-wrap">
                            <div>
                                <h2 className="h4 mb-0" style={{ color: 'var(--azul-escuro)' }}>
                                    <FaCalendarCheck className="me-2" style={{ color: 'var(--dourado)' }} />
                                    Registro de Presenças
                                </h2>
                                <p className="text-muted mt-2 mb-0">
                                    {estudantes.length} estudante(s) matriculado(s)
                                </p>
                            </div>
                            <button 
                                className="btn btn-outline-primary mt-2 mt-sm-0"
                                onClick={() => setModoQRCode(!modoQRCode)}
                                style={{ borderColor: 'var(--azul-metropolitano)', color: 'var(--azul-metropolitano)' }}
                            >
                                {modoQRCode ? <MdPersonSearch className="me-2" /> : <MdQrCodeScanner className="me-2" />}
                                {modoQRCode ? "Modo Manual" : "Modo QR Code"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modo QR Code Scanner */}
                {modoQRCode && (
                    <div className="row mb-4">
                        <div className="col-md-8 mx-auto">
                            <div className="card border-0 shadow-sm" style={{ backgroundColor: 'var(--cinza-claro)' }}>
                                <div className="card-body p-4">
                                    <div className="text-center mb-3">
                                        <FaQrcode size={48} style={{ color: 'var(--azul-metropolitano)' }} />
                                        <h5 className="mt-2" style={{ color: 'var(--azul-escuro)' }}>Leitura Rápida por QR Code</h5>
                                        <p className="text-muted small">Digite ou escaneie o número de matrícula do estudante</p>
                                    </div>
                                    
                                    <div className="input-group input-group-lg">
                                        <span className="input-group-text" style={{ backgroundColor: 'var(--azul-metropolitano)', color: 'white' }}>
                                            <MdQrCodeScanner />
                                        </span>
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            className="form-control"
                                            placeholder="Código do estudante (ex: 2026385796)"
                                            value={codigoDigitado}
                                            onChange={(e) => setCodigoDigitado(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            disabled={scanning}
                                            autoFocus
                                            style={{ fontSize: '1.1rem' }}
                                        />
                                        <button
                                            className="btn"
                                            onClick={marcarPorQRCode}
                                            disabled={scanning || !codigoDigitado.trim()}
                                            style={{ backgroundColor: 'var(--azul-metropolitano)', color: 'white' }}
                                        >
                                            {scanning ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" />
                                                    Registrando...
                                                </>
                                            ) : (
                                                <>
                                                    <FaUserCheck className="me-2" />
                                                    Registrar
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    
                                    <div className="text-muted small mt-3 text-center">
                                        <MdInfo className="me-1" />
                                        O código é o número de matrícula do estudante (ex: 2026385796)
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Cards de Estatísticas */}
                <div className="row mb-4 g-3">
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm h-100 card-hover">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="text-muted mb-1">Total de Alunos</p>
                                        <h3 className="mb-0 fw-bold" style={{ color: 'var(--azul-metropolitano)' }}>
                                            {estudantes.length}
                                        </h3>
                                    </div>
                                    <div className="rounded-3 p-3" style={{ backgroundColor: 'rgba(0, 51, 102, 0.1)' }}>
                                        <FaCalendarCheck size={24} style={{ color: 'var(--azul-metropolitano)' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm h-100 card-hover">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="text-muted mb-1">Presentes</p>
                                        <h3 className="mb-0 fw-bold" style={{ color: 'var(--success)' }}>
                                            {totalPresentes}
                                        </h3>
                                    </div>
                                    <div className="rounded-3 p-3" style={{ backgroundColor: 'rgba(107, 142, 76, 0.1)' }}>
                                        <MdCheckCircle size={24} style={{ color: 'var(--success)' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm h-100 card-hover">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="text-muted mb-1">Ausentes</p>
                                        <h3 className="mb-0 fw-bold" style={{ color: 'var(--danger)' }}>
                                            {totalAusentes}
                                        </h3>
                                    </div>
                                    <div className="rounded-3 p-3" style={{ backgroundColor: 'rgba(224, 71, 76, 0.1)' }}>
                                        <MdCancel size={24} style={{ color: 'var(--danger)' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm h-100 card-hover">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <p className="text-muted mb-1">Percentual</p>
                                        <h3 className="mb-0 fw-bold" style={{ color: 'var(--dourado)' }}>
                                            {percentualPresentes}%
                                        </h3>
                                    </div>
                                    <div className="rounded-3 p-3" style={{ backgroundColor: 'rgba(184, 134, 11, 0.1)' }}>
                                        <FaUserCheck size={24} style={{ color: 'var(--dourado)' }} />
                                    </div>
                                </div>
                                <div className="progress mt-3" style={{ height: '6px' }}>
                                    <div 
                                        className="progress-bar"
                                        style={{ 
                                            width: `${percentualPresentes}%`,
                                            backgroundColor: 'var(--success)'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controles de Data e Filtros */}
                <div className="row mb-4">
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <label className="form-label fw-bold" style={{ color: 'var(--azul-escuro)' }}>
                                    <MdCalendarToday className="me-1" />
                                    Data da Aula
                                </label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={dataAula}
                                    onChange={handleDataChange}
                                    disabled={salvando}
                                    style={{ borderColor: 'var(--azul-claro)' }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <label className="form-label fw-bold" style={{ color: 'var(--azul-escuro)' }}>
                                    <MdPersonSearch className="me-1" />
                                    Pesquisar
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Nome ou número..."
                                    value={termoPesquisa}
                                    onChange={(e) => setTermoPesquisa(e.target.value)}
                                    style={{ borderColor: 'var(--azul-claro)' }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <label className="form-label fw-bold" style={{ color: 'var(--azul-escuro)' }}>
                                    Filtro
                                </label>
                                <select 
                                    className="form-select" 
                                    value={filtro} 
                                    onChange={(e) => setFiltro(e.target.value)}
                                    style={{ borderColor: 'var(--azul-claro)' }}
                                >
                                    <option value="todos">Todos os alunos</option>
                                    <option value="presentes">Apenas presentes</option>
                                    <option value="ausentes">Apenas ausentes</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ações Rápidas */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="d-flex gap-2 justify-content-end">
                            <button
                                className="btn btn-outline-warning"
                                onClick={marcarTodos}
                                disabled={salvando}
                            >
                                {Object.values(presencas).every(p => p === true) ? "Desmarcar Todos" : "Marcar Todos Presentes"}
                            </button>
                            <button
                                className="btn"
                                onClick={salvarPresencas}
                                disabled={salvando}
                                style={{ backgroundColor: 'var(--azul-metropolitano)', color: 'white' }}
                            >
                                {salvando ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <MdSave className="me-2" />
                                        Salvar Presenças
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Lista de Estudantes */}
                <div className="row">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header" style={{ backgroundColor: 'var(--cinza-claro)', borderBottom: `2px solid var(--dourado)` }}>
                                <h6 className="mb-0" style={{ color: 'var(--azul-escuro)' }}>
                                    Lista de Estudantes
                                </h6>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead style={{ backgroundColor: 'var(--azul-escuro)', color: 'white' }}>
                                            <tr>
                                                <th style={{ width: '60px' }}>#</th>
                                                <th style={{ width: '70px' }}>Foto</th>
                                                <th>Nº Estudante</th>
                                                <th>Nome do Estudante</th>
                                                <th>Contacto</th>
                                                <th style={{ width: '120px' }} className="text-center">Presença</th>
                                                <th style={{ width: '100px' }}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {estudantesFiltrados.map((estudante, index) => {
                                                const jaMarcado = presencas[estudante.id_estudante];
                                                return (
                                                    <tr key={estudante.id_estudante}>
                                                        <td>{index + 1}</td>
                                                        <td>
                                                            <img
                                                                src={estudante.foto_estudante ? 
                                                                    `http://localhost:8080/api/img/estudantes/${estudante.foto_estudante}` : 
                                                                    '/default-avatar.png'}
                                                                className="foto-estudante"
                                                                alt={estudante.nome_estudante}
                                                                onError={(e) => { e.target.src = '/default-avatar.png'; }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <span className="fw-bold" style={{ color: 'var(--azul-metropolitano)' }}>
                                                                {estudante.numero_estudante}
                                                            </span>
                                                        </td>
                                                        <td>{estudante.nome_estudante}</td>
                                                        <td>{estudante.contacto_estudante}</td>
                                                        <td className="text-center">
                                                            <button
                                                                className="btn btn-sm"
                                                                onClick={() => togglePresenca(estudante.id_estudante)}
                                                                disabled={salvando}
                                                                style={{
                                                                    backgroundColor: jaMarcado ? 'var(--success)' : 'transparent',
                                                                    border: `1px solid ${jaMarcado ? 'var(--success)' : '#ddd'}`,
                                                                    color: jaMarcado ? 'white' : '#666'
                                                                }}
                                                            >
                                                                {jaMarcado ? (
                                                                    <MdCheckBox size={20} />
                                                                ) : (
                                                                    <MdCheckBoxOutlineBlank size={20} />
                                                                )}
                                                                <span className="ms-1">
                                                                    {jaMarcado ? "Presente" : "Marcar"}
                                                                </span>
                                                            </button>
                                                        </td>
                                                        <td>
                                                            {jaMarcado ? (
                                                                <span className="badge" style={{ backgroundColor: 'var(--success)' }}>
                                                                    <FaUserCheck className="me-1" /> Presente
                                                                </span>
                                                            ) : (
                                                                <span className="badge" style={{ backgroundColor: 'var(--danger)' }}>
                                                                    <MdCancel className="me-1" /> Ausente
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                {estudantesFiltrados.length === 0 && (
                                    <div className="text-center py-5">
                                        <MdWarning size={48} className="text-muted mb-3" />
                                        <p className="text-muted">Nenhum estudante encontrado</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notificação do último registro */}
                {ultimoRegistro && (
                    <div className="toast-notification">
                        <div className="card shadow-lg border-0" style={{ backgroundColor: 'var(--success)', color: 'white' }}>
                            <div className="card-body py-2 px-3">
                                <div className="d-flex align-items-center">
                                    <MdCheckCircle size={20} className="me-2" />
                                    <span>✓ {ultimoRegistro.nome} - {ultimoRegistro.hora}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </TeacherLayout>
    );
}

export default PresencasTurma;