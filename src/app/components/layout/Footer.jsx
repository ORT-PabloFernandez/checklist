import Link from 'next/link';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footerContainer">
        <div className="footerSimpleContent">
          <div className="footerCopyright">
            <p> {currentYear} Gestión de Usuarios. Todos los derechos reservados.</p>
          </div>
          
          <div className="footerContact">
            <div className="footerSocial">
              <Link href="https://github.com" className="footerSocialLink">
                <FaGithub />
              </Link>
              <Link href="https://linkedin.com" className="footerSocialLink">
                <FaLinkedin />
              </Link>
              <Link href="mailto:contacto@ejemplo.com" className="footerSocialLink">
                <FaEnvelope />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
