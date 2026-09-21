import { useState } from 'react';
import './PerfilPage.css';
import { useAuth } from '../../context/AuthContext';

function PerfilPage() {
  const [mostrarFoto, setMostrarFoto] = useState(true);
  const { user } = useAuth();

  return (
    <div className="perfil-container">
      <div className="perfil-card">
        <div className="perfil-header">
          <div className="perfil-header-brand">
            <span className="perfil-badge-sena">SENA</span>
            <span className="perfil-ficha">Ficha #3407169</span>
          </div>
          <span className="perfil-estado">● Activo</span>
        </div>

        <div className="perfil-body">
          {mostrarFoto && (
            <div className="perfil-foto-container">
              <img
                src="https://i.pinimg.com/736x/f4/46/4b/f4464bb0abed9ef4f19c8e9fdb3a5eb3.jpg"
                alt="Foto Perfil Aprendiz"
                className="perfil-foto"
              />
            </div>
          )}

          <div>
            <h5 className="perfil-nombre">{user?.nombre ?? 'Usuario'}</h5>
            <p className="perfil-programa">{user?.rol ?? 'Sin rol'} • Nivel Tecnólogo</p>
            <p className="perfil-centro">Análisis y Desarrollo de Software</p>
          </div>

          <div className="perfil-datos">
            <div className="perfil-dato-fila">
              <span className="perfil-dato-label">Documento:</span>
              <span className="perfil-dato-valor">CC 1025324483</span>
            </div>
            <div className="perfil-dato-fila">
              <span className="perfil-dato-label">Correo:</span>
              <span className="perfil-dato-valor">{user?.correo ?? 'sin-correo@sena.edu.co'}</span>
            </div>
          </div>

          <button
            onClick={() => setMostrarFoto(!mostrarFoto)}
            className="perfil-btn-toggle"
          >
            <span>{mostrarFoto ? '👁️' : '📷'}</span>
            <span>{mostrarFoto ? 'Ocultar Foto de Perfil' : 'Mostrar Foto de Perfil'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PerfilPage;
