import { useNavigate } from "react-router-dom";
import TeacherLayout from "../layouts/TeacherLayout";
import api from "../service/api";
import { useEffect, useState } from "react";

function TurmasTeacher() {
    const [listaTurma, setListaTurma] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const usuarioSalvo = localStorage.getItem("usuarioLogado");
        if (usuarioSalvo) {
            const userData = JSON.parse(usuarioSalvo);
            setUser(userData);
        } else {
            navigate("/");
        }
    }, [navigate]);

    useEffect(() => {
        const fetchTurmas = () => {
            api.get(`/TurmasProfessor/${user?.codigo}`).then((response) => {
                setListaTurma(response.data);
                setLoading(false);
            });
        }
        fetchTurmas();

        const interval = setInterval(fetchTurmas, 30000);
        return () => clearInterval(interval);
    });

    if (error) {
        return (
            <TeacherLayout>
                <h1>Erro: {error}</h1>
                <button onClick={() => window.location.reload()}>Tentar novamente</button>
            </TeacherLayout>
        );
    }

    return (
        <TeacherLayout>
            <h1>Turmas</h1>
        </TeacherLayout>
    );
}

export default TurmasTeacher;