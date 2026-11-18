import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api, setCsrf, type Catalog, type Image, type Work } from '../api';
export function Admin() {
  const [authenticated, setAuthenticated] = useState(false),
    [checking, setChecking] = useState(true),
    [status, setStatus] = useState(''),
    [works, setWorks] = useState<Work[]>([]),
    [catalog, setCatalog] = useState<Catalog>({ brands: [], models: [] }),
    [selectedWork, setSelectedWork] = useState<Work | null>(null),
    [busy, setBusy] = useState(false);
  async function refresh() {
    const [w, c] = await Promise.all([api<Work[]>('/admin/works'), api<Catalog>('/catalog')]);
    setWorks(w);
    setCatalog(c);
    return w;
  }
  useEffect(() => {
    document.title = 'Administración del taller';
    api('/admin/session')
      .then(async (s) => {
        setCsrf(s.csrf);
        await refresh();
        setAuthenticated(true);
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);
  async function action(fn: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setStatus('');
    try {
      await fn();
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await action(async () => {
      const s = await api('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email: f.get('email'), password: f.get('password') }),
      });
      setCsrf(s.csrf);
      await refresh();
      setAuthenticated(true);
    });
  }
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedWork) return;
    const f = new FormData(e.currentTarget);
    await action(async () => {
      await api('/admin/works/' + selectedWork.id, {
        method: 'PUT',
        body: JSON.stringify({
          title: f.get('title'),
          description: f.get('description'),
          type: f.get('type'),
          modelId: f.get('model') ? Number(f.get('model')) : null,
          published: f.get('published') === 'on',
          featured: f.get('featured') === 'on',
        }),
      });
      const list = await refresh();
      setSelectedWork(list.find((w) => w.id === selectedWork.id) || null);
      setStatus('Trabajo guardado.');
    });
  }
  async function photos(images: Image[]) {
    if (!selectedWork) return;
    await action(async () => {
      await api(`/admin/works/${selectedWork.id}/images`, {
        method: 'PUT',
        body: JSON.stringify({ images: images.map((i) => ({ ...i, cover: !!i.cover })) }),
      });
      const list = await refresh();
      setSelectedWork(list.find((w) => w.id === selectedWork.id) || null);
      setStatus('Fotografías actualizadas.');
    });
  }
  async function removePhoto(photo: Image) {
    if (!selectedWork || busy) return;
    const workId = selectedWork.id;
    if (!window.confirm('¿Eliminar esta foto de la galería del trabajo?')) return;
    await action(async () => {
      const { images } = await api<{ images: Image[] }>(
        `/admin/works/${workId}/images/${photo.id}`,
        { method: 'DELETE' },
      );
      setWorks((current) =>
        current.map((work) => (work.id === workId ? { ...work, images } : work)),
      );
      setSelectedWork((current) => {
        if (!current || current.id !== workId) return current;
        const remaining = current.images.filter((image) => image.id !== photo.id);
        const stillHasCover = remaining.some((image) => image.cover);
        return {
          ...current,
          images: stillHasCover
            ? remaining
            : remaining.map((image) => ({
                ...image,
                cover: images.find((saved) => saved.id === image.id)?.cover ?? 0,
              })),
        };
      });
      setStatus('Foto eliminada del trabajo.');
    });
  }
  return (
    <div className="admin">
      <header>
        <Link className="brand" to="/">
          Panel del taller <small>ADMINISTRACIÓN</small>
        </Link>
        {authenticated && (
          <button
            disabled={busy}
            onClick={() =>
              action(async () => {
                await api('/admin/logout', { method: 'POST' });
                setAuthenticated(false);
                setSelectedWork(null);
                setCsrf('');
              })
            }
          >
            Cerrar sesión
          </button>
        )}
        <Link to="/">Ver sitio ↗</Link>
      </header>
      <main className="admin-main">
        <p className="eyebrow">GESTIÓN DEL TALLER</p>
        <h1>{authenticated ? 'Tu portafolio, al día.' : 'Acceso al taller.'}</h1>
        <p role="status" className="notice">
          {status || 'Acceso reservado para administradores autorizados.'}
        </p>
        {checking ? (
          <p>Comprobando sesión…</p>
        ) : !authenticated ? (
          <form className="login-form" onSubmit={login}>
            <label>
              Correo
              <input name="email" type="email" autoComplete="username" required />
            </label>
            <label>
              Contraseña
              <input name="password" type="password" autoComplete="current-password" required />
            </label>
            <button className="button" disabled={busy}>
              {busy ? 'Ingresando…' : 'Iniciar sesión'}
            </button>
            <p className="muted">
              El primer administrador se crea desde la terminal siguiendo el README. No existe
              registro público.
            </p>
          </form>
        ) : (
          <>
            <div className="admin-toolbar">
              <h2>Trabajos</h2>
              <button
                className="button"
                disabled={busy}
                onClick={() =>
                  action(async () => {
                    const { id } = await api('/admin/works', { method: 'POST' });
                    const list = await refresh();
                    setSelectedWork(list.find((w) => w.id === id) || null);
                  })
                }
              >
                + Nuevo trabajo
              </button>
            </div>
            <div className="admin-layout">
              <aside className="admin-list">
                {works.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => {
                      setSelectedWork(w);
                      setStatus('');
                    }}
                    className={selectedWork?.id === w.id ? 'selected' : ''}
                  >
                    <strong>{w.title}</strong>
                    <small>
                      {w.published ? 'Publicado' : 'Borrador'} {w.demo ? '· Muestra' : ''}
                    </small>
                  </button>
                ))}
              </aside>
              {selectedWork ? (
                <section
                  key={selectedWork.id + '-' + selectedWork.published + '-' + selectedWork.title}
                >
                  <form onSubmit={save}>
                    <h2>Editar trabajo #{selectedWork.id}</h2>
                    <label>
                      Título
                      <input
                        name="title"
                        defaultValue={selectedWork.title}
                        maxLength={150}
                        required
                      />
                    </label>
                    <label>
                      Descripción
                      <textarea
                        name="description"
                        defaultValue={selectedWork.description}
                        maxLength={5000}
                        rows={5}
                      />
                    </label>
                    <label>
                      Tipo de trabajo
                      <input name="type" defaultValue={selectedWork.type} maxLength={100} />
                    </label>
                    <label>
                      Marca y modelo
                      <select name="model" defaultValue={selectedWork.model_id || ''}>
                        <option value="">Selecciona un modelo</option>
                        {catalog.models.map((m) => (
                          <option key={m.id} value={m.id}>
                            {catalog.brands.find((b) => b.id === m.brand_id)?.name} / {m.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="checkbox">
                      <input
                        name="featured"
                        type="checkbox"
                        defaultChecked={!!selectedWork.featured}
                      />
                      Destacado
                    </label>
                    <label className="checkbox">
                      <input
                        name="published"
                        type="checkbox"
                        defaultChecked={!!selectedWork.published}
                      />
                      Publicado (desmarca para retirar)
                    </label>
                    <button className="button" disabled={busy}>
                      Guardar trabajo
                    </button>
                    <p className="muted">
                      La publicación exige modelo, descripción, tipo y al menos una fotografía con
                      texto alternativo.
                    </p>
                  </form>
                  <h3>Fotografías ({selectedWork.images.length}/12)</h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const f = new FormData(e.currentTarget);
                      const form = e.currentTarget;
                      action(async () => {
                        await api(`/admin/works/${selectedWork.id}/images`, {
                          method: 'POST',
                          body: f,
                        });
                        const list = await refresh();
                        setSelectedWork(list.find((w) => w.id === selectedWork.id) || null);
                        form.reset();
                        setStatus('Imagen optimizada y añadida.');
                      });
                    }}
                  >
                    <label>
                      Imagen JPEG, PNG o WebP · máximo 10 MB
                      <input
                        name="image"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        required
                      />
                    </label>
                    <label>
                      Texto alternativo
                      <input name="alt" maxLength={300} required />
                    </label>
                    <button disabled={busy}>Subir fotografía</button>
                  </form>
                  <div className="photo-editor">
                    {selectedWork.images.map((im, i) => (
                      <div key={im.id}>
                        <img src={im.url} alt={im.alt} />
                        <label>
                          Texto alternativo
                          <input
                            value={im.alt}
                            maxLength={300}
                            onChange={(e) =>
                              setSelectedWork({
                                ...selectedWork,
                                images: selectedWork.images.map((x) =>
                                  x.id === im.id ? { ...x, alt: e.target.value } : x,
                                ),
                              })
                            }
                          />
                        </label>
                        <div className="actions">
                          <button
                            disabled={busy || i === 0}
                            onClick={() => {
                              const items = [...selectedWork.images];
                              [items[i - 1], items[i]] = [items[i], items[i - 1]];
                              setSelectedWork({ ...selectedWork, images: items });
                            }}
                          >
                            ↑ Subir
                          </button>
                          <button
                            disabled={busy || i === selectedWork.images.length - 1}
                            onClick={() => {
                              const items = [...selectedWork.images];
                              [items[i + 1], items[i]] = [items[i], items[i + 1]];
                              setSelectedWork({ ...selectedWork, images: items });
                            }}
                          >
                            ↓ Bajar
                          </button>
                          <label className="checkbox">
                            <input
                              type="radio"
                              name="cover"
                              checked={!!im.cover}
                              onChange={() =>
                                setSelectedWork({
                                  ...selectedWork,
                                  images: selectedWork.images.map((x) => ({
                                    ...x,
                                    cover: x.id === im.id,
                                  })),
                                })
                              }
                            />
                            Portada
                          </label>
                          <button
                            type="button"
                            disabled={busy}
                            aria-label={`Eliminar foto: ${im.alt || i + 1}`}
                            onClick={() => removePhoto(im)}
                          >
                            Eliminar foto
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedWork.images.length > 0 && (
                    <button disabled={busy} onClick={() => photos(selectedWork.images)}>
                      Guardar orden, portada y textos
                    </button>
                  )}
                </section>
              ) : (
                <p>Selecciona un trabajo para editarlo o crea uno nuevo.</p>
              )}
            </div>
            <section className="catalog-manager">
              <h2>Marcas y modelos</h2>
              <div className="form-grid">
                {(['brands', 'models'] as const).map((kind) => (
                  <div key={kind}>
                    <h3>{kind === 'brands' ? 'Marcas' : 'Modelos'}</h3>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.currentTarget,
                          f = new FormData(form);
                        action(async () => {
                          await api('/admin/' + kind, {
                            method: 'POST',
                            body: JSON.stringify({
                              name: f.get('name'),
                              brandId: Number(f.get('brandId')),
                            }),
                          });
                          await refresh();
                          form.reset();
                          setStatus('Catálogo actualizado.');
                        });
                      }}
                    >
                      {kind === 'models' && (
                        <label>
                          Marca
                          <select name="brandId" required>
                            {catalog.brands.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.name}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                      <label>
                        Nombre
                        <input name="name" required minLength={2} maxLength={80} />
                      </label>
                      <button disabled={busy}>
                        Añadir {kind === 'brands' ? 'marca' : 'modelo'}
                      </button>
                    </form>
                    {catalog[kind].map((item) => (
                      <form
                        className="catalog-row"
                        key={item.id}
                        onSubmit={(e) => {
                          e.preventDefault();
                          const f = new FormData(e.currentTarget);
                          action(async () => {
                            await api(`/admin/${kind}/${item.id}`, {
                              method: 'PUT',
                              body: JSON.stringify({ name: f.get('name') }),
                            });
                            await refresh();
                            setStatus('Nombre actualizado.');
                          });
                        }}
                      >
                        <label>
                          {kind === 'models'
                            ? catalog.brands.find((b) => b.id === (item as any).brand_id)?.name
                            : 'Marca'}
                          <input
                            name="name"
                            defaultValue={item.name}
                            aria-label={'Nombre de ' + item.name}
                            maxLength={80}
                            required
                          />
                        </label>
                        <button disabled={busy}>Renombrar</button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            action(async () => {
                              await api(`/admin/${kind}/${item.id}`, { method: 'DELETE' });
                              await refresh();
                              setStatus('Elemento eliminado.');
                            })
                          }
                        >
                          Eliminar
                        </button>
                      </form>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
