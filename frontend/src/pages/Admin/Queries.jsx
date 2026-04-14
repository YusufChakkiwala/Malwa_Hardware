import { useEffect, useState } from 'react';
import AdminNav from '../../components/AdminNav';
import { fetchQueries, updateQueryStatus } from '../../services/chatService';

const statuses = ['new', 'open', 'closed'];

function AdminQueries() {
  const [queries, setQueries] = useState([]);

  const load = async () => {
    const data = await fetchQueries();
    setQueries(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const changeStatus = async (id, status) => {
    await updateQueryStatus(id, status);
    await load();
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[250px_1fr]">
      <AdminNav />

      <div className="space-y-4">
        <h1 className="font-heading text-3xl text-slate-900">Customer Queries</h1>

        {queries.map((query) => (
          <article key={query.id} className="surface-panel p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-slate-900">{query.name}</p>
                <p className="text-sm text-slate-500">
                  {query.phone}
                  {query.shopName ? ` | ${query.shopName}` : ''}
                </p>
              </div>
              <select value={query.status} onChange={(event) => changeStatus(query.id, event.target.value)}>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <p className="mt-3 text-sm text-slate-700">{query.message}</p>
            {query.imageUrl && (
              <img src={query.imageUrl} alt="query upload" className="mt-3 h-40 rounded object-cover" />
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

export default AdminQueries;
