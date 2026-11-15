import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { downloadCsv, datedFilename } from '@/lib/csv';
import { useToast } from '@/hooks/use-toast';
import { Search, CheckCircle2, Download, Loader2, Gavel, Mic, Undo2 } from 'lucide-react';
import { confirmAction } from '@/components/admin/ConfirmDialog';

/**
 * Turon Debate check-in: approved debaters and active judges, one tap to mark
 * arrived. Goes through set_check_in() (migration 062). A check-in counts as
 * attended when the debate is saved to history (certificates).
 */
interface Person {
  kind: 'debater' | 'judge';
  id: string;                // debate_registrations.id or admin_users.id
  full_name: string;
  email: string;
  detail: string;            // team or institution
  team_id: string | null;
  checked_in_at: string | null;
}
interface Team { id: string; label: string; name: string | null }

const time = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const DebateCheckIn = () => {
  const { toast } = useToast();
  const [people, setPeople] = useState<Person[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState('');
  const [hideArrived, setHideArrived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const fetchAll = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const [regs, judges, tms] = await Promise.all([
        supabase.from('debate_registrations')
          .select('id, full_name, email, institution, team_id, checked_in_at')
          .eq('status', 'approved').order('full_name'),
        supabase.from('admin_users')
          .select('id, full_name, email, checked_in_at')
          .eq('role', 'judge').eq('is_active', true).order('full_name'),
        supabase.from('debate_teams').select('id, label, name').order('label'),
      ]);
      const err = regs.error || judges.error || tms.error;
      if (err) throw err;
      const teamList = (tms.data || []) as Team[];
      const teamName = (id: string | null) => {
        const t = teamList.find(x => x.id === id);
        return t ? `Team ${t.label}${t.name ? ` · ${t.name}` : ''}` : null;
      };
      setTeams(teamList);
      setPeople([
        ...(regs.data || []).map((r: any): Person => ({
          kind: 'debater', id: r.id, full_name: r.full_name, email: r.email,
          detail: teamName(r.team_id) || r.institution || '', team_id: r.team_id, checked_in_at: r.checked_in_at,
        })),
        ...(judges.data || []).map((j: any): Person => ({
          kind: 'judge', id: j.id, full_name: j.full_name || j.email, email: j.email,
          detail: 'Judge', team_id: null, checked_in_at: j.checked_in_at,
        })),
      ].sort((a, b) => a.full_name.localeCompare(b.full_name)));
    } catch (e: any) {
      if (!quiet) toast({ title: 'Could not load the list', description: e.message, variant: 'destructive' });
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  // Several people may check in at once: refresh quietly every 20 s.
  useEffect(() => {
    const id = setInterval(() => { if (document.visibilityState === 'visible') fetchAll(true); }, 20_000);
    return () => clearInterval(id);
  }, [fetchAll]);

  const setCheckIn = async (p: Person, checked: boolean) => {
    if (!checked && !(await confirmAction(`Undo check-in for ${p.full_name}?`, { title: 'Undo check-in', confirmLabel: 'Undo', danger: true }))) return;
    setBusy(p.id);
    const { data, error } = await supabase.rpc('set_check_in', { p_kind: p.kind === 'debater' ? 'debater' : 'chair', p_id: p.id, p_checked: checked });
    setBusy(null);
    if (error) { toast({ title: 'Something went wrong', description: error.message, variant: 'destructive' }); return; }
    setPeople(prev => prev.map(x => x.id === p.id ? { ...x, checked_in_at: (data as string | null) ?? null } : x));
    if (checked) { toast({ title: 'Checked in', description: p.full_name }); setSearch(''); }
    else toast({ title: 'Arrival undone', description: p.kind === 'debater' ? `${p.full_name} is off Teams and rounds and won't count as attended.` : `${p.full_name} won't count as attended.` });
  };

  const debaters = people.filter(p => p.kind === 'debater');
  const judges = people.filter(p => p.kind === 'judge');
  const arrived = (list: Person[]) => list.filter(p => p.checked_in_at).length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return people.filter(p => (!hideArrived || !p.checked_in_at)
      && (!q || [p.full_name, p.email, p.detail].some(s => (s || '').toLowerCase().includes(q))));
  }, [people, search, hideArrived]);

  const exportCSV = () => downloadCsv(datedFilename('turon_debate_checkin'), [
    ['Type', 'Name', 'Email', 'Team / institution', 'Status', 'Checked in at'],
    ...people.map(p => [p.kind === 'judge' ? 'Judge' : 'Debater', p.full_name, p.email, p.detail,
      p.checked_in_at ? 'Arrived' : 'No-show', p.checked_in_at ? new Date(p.checked_in_at).toLocaleString() : '']),
  ]);

  const total = people.length, done = arrived(people);

  return (
    <AdminLayout title="Check-in">
      <div className="space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="text-gray-600 text-sm">Search a name and tap Check in. Checked-in people count as attended for certificates.</p>
          <div className="flex items-center gap-2">
            <button onClick={() => fetchAll()} className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Refresh</button>
            <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-lg text-sm">
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>
        </div>

        <div className="rounded-lg border bg-white px-4 py-3">
          <div className="flex flex-wrap items-baseline justify-between gap-3 text-sm">
            <span><span className="text-xl font-semibold tabular-nums text-gray-900">{done}</span> <span className="text-gray-500">of {total} arrived</span></span>
            <span className="text-gray-500">Debaters {arrived(debaters)}/{debaters.length} · Judges {arrived(judges)}/{judges.length}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100" role="img" aria-label={`${done} of ${total} arrived`}>
            <div className="h-full bg-green-500 transition-all" style={{ width: total ? `${(done / total) * 100}%` : '0%' }} />
          </div>
          {teams.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {teams.map(t => {
                const members = debaters.filter(p => p.team_id === t.id);
                const full = members.length > 0 && arrived(members) === members.length;
                return (
                  <span key={t.id} className={`px-2 py-1 rounded-full font-medium ${full ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    Team {t.label}: <strong>{arrived(members)}/{members.length}</strong>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input aria-label="Search people to check in" autoFocus value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, team or school…"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-panel-500" />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={hideArrived} onChange={e => setHideArrived(e.target.checked)} /> Hide arrived
          </label>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-500"><Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" /> Loading…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.length === 0 && (
              <div className="md:col-span-3 bg-white border rounded-lg p-10 text-center text-gray-500">
                {search ? 'No matches. Only accepted debaters and active judges are on this list.' : 'No one to show.'}
              </div>
            )}
            {filtered.map(p => {
              const isIn = !!p.checked_in_at;
              return (
                <div key={`${p.kind}-${p.id}`} className={`border rounded-lg p-3 flex items-center gap-3 ${isIn ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                  <div className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center ${p.kind === 'judge' ? 'bg-purple-100 text-purple-500' : 'bg-gray-100 text-gray-400'}`}>
                    {p.kind === 'judge' ? <Gavel className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{p.full_name}</p>
                    <p className="text-xs text-gray-500 truncate">{p.detail || '—'}</p>
                  </div>
                  {isIn ? (
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-xs text-green-700">
                        <CheckCircle2 className="h-4 w-4 text-green-600" /> {time(p.checked_in_at!)}
                      </span>
                      <button onClick={() => setCheckIn(p, false)} disabled={busy === p.id}
                        className="flex items-center gap-1 px-2 py-1 border border-gray-300 bg-white rounded-md text-xs text-gray-700 hover:border-red-300 hover:text-red-600 disabled:opacity-50">
                        {busy === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Undo2 className="h-3.5 w-3.5" />} Undo
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setCheckIn(p, true)} disabled={busy === p.id}
                      className="px-3 py-1.5 bg-panel-600 text-white rounded-lg text-sm font-semibold hover:bg-panel-700 disabled:opacity-50">
                      {busy === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Check in'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default DebateCheckIn;
