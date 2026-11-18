import { PageMeta } from '../components/PageMeta';

export function PrivacyPage() {
  return (
    <>
      <PageMeta title="Privacidad" />
      <article className="section legal">
        <p className="eyebrow">DOCUMENTO PROVISIONAL</p>
        <h1>Privacidad</h1>
        <p className="notice">
          Pendiente de validación por el responsable de la empresa. Este texto no constituye una
          política definitiva.
        </p>
        <h2>Finalidad del formulario</h2>
        <p>
          El nombre, teléfono, correo opcional y mensaje se utilizan para responder la consulta. No
          se solicitan datos para publicidad ni suscripciones.
        </p>
        <h2>Procesamiento y conservación</h2>
        <p>
          En modo de prueba los datos no se envían por correo ni se conservan como solicitudes. El
          servidor mantiene identificadores técnicos de envío durante un máximo de 24 horas. En
          producción, el proveedor de correo y el buzón receptor procesarán la consulta.
        </p>
        <h2>Información pendiente</h2>
        <p>
          Antes de publicar deben definirse responsable y canal de atención, ubicación, base
          aplicable, proveedores, acceso al buzón, plazos de conservación y procedimiento para
          atender derechos sobre los datos.
        </p>
        <h2>Sesiones y enlaces</h2>
        <p>
          El panel utiliza una cookie necesaria de sesión administrativa. No se ha incorporado
          analítica. WhatsApp se abre como un servicio externo y el visitante decide si envía el
          mensaje.
        </p>
      </article>
    </>
  );
}
