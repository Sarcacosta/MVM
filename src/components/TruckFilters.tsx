import { type Catalog } from '../api';

export function TruckFilters({
  catalog,
  brand,
  model,
  onBrand,
  onModel,
}: {
  catalog: Catalog;
  brand: string;
  model: string;
  onBrand: (v: string) => void;
  onModel: (v: string) => void;
}) {
  return (
    <>
      <label>
        Marca
        <select value={brand} onChange={(e) => onBrand(e.target.value)}>
          <option value="">Todas las marcas</option>
          {catalog.brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Modelo
        <select value={model} disabled={!brand} onChange={(e) => onModel(e.target.value)}>
          <option value="">{brand ? 'Todos los modelos' : 'Elige una marca primero'}</option>
          {catalog.models
            .filter((m) => String(m.brand_id) === brand)
            .map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
        </select>
      </label>
    </>
  );
}
