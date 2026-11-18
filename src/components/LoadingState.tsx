export function LoadingState({ error }: { error?: string }) {
  return (
    <div className="state" role="status">
      {error || 'Cargando referencias…'}
      {error && <button onClick={() => location.reload()}>Volver a intentar</button>}
    </div>
  );
}
