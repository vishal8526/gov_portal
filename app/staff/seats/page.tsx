'use client';

import { useState, useEffect } from 'react';

interface Allocation { id: string; grade: number; totalSeats: number; allocatedSeats: number; availableSeats: number; utilizationPct: number; assignments: Array<{ id: string; status: string; application: { studentName: string }; assignedBy: { name: string } }>; }

export default function SeatManagementPage() {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [academicYear, setAcademicYear] = useState('');
  const [editGrade, setEditGrade] = useState<number | null>(null);
  const [editSeats, setEditSeats] = useState('');

  useEffect(() => {
    fetch('/api/seats').then(r => r.json()).then(data => { setAllocations(data.allocations || []); setAcademicYear(data.academicYear || ''); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleUpdate = async (grade: number) => {
    if (!editSeats) return;
    await fetch('/api/seats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ grade, totalSeats: parseInt(editSeats), academicYear }) });
    setEditGrade(null);
    const res = await fetch('/api/seats'); const data = await res.json(); setAllocations(data.allocations || []);
  };

  if (loading) return <div className="skeleton skeleton-card" style={{ height: 400 }}></div>;
  const totalSeats = allocations.reduce((s, a) => s + a.totalSeats, 0);
  const totalAlloc = allocations.reduce((s, a) => s + a.allocatedSeats, 0);

  return (
    <div>
      <div className="page-title-section"><h1 className="page-title">💺 Seat Management</h1><p className="page-subtitle">Year: {academicYear} • {totalSeats} total • {totalAlloc} filled • {totalSeats - totalAlloc} available</p></div>
      <div className="grid-3 mb-6">
        <div className="stat-card stat-card-primary"><div className="stat-value">{totalSeats}</div><div className="stat-label">Total</div></div>
        <div className="stat-card stat-card-success"><div className="stat-value">{totalAlloc}</div><div className="stat-label">Filled</div></div>
        <div className="stat-card stat-card-info"><div className="stat-value">{totalSeats - totalAlloc}</div><div className="stat-label">Available</div></div>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table"><thead><tr><th>Grade</th><th>Total</th><th>Allocated</th><th>Available</th><th>Utilization</th><th>Actions</th></tr></thead>
        <tbody>{allocations.map(a => (<tr key={a.id}><td className="font-semibold">Grade {a.grade}</td>
          <td>{editGrade === a.grade ? <div className="flex gap-2 items-center"><input type="number" className="form-input" style={{width:80,padding:'4px 8px'}} value={editSeats} onChange={e=>setEditSeats(e.target.value)}/><button className="btn btn-accent btn-sm" onClick={()=>handleUpdate(a.grade)}>Save</button><button className="btn btn-ghost btn-sm" onClick={()=>setEditGrade(null)}>×</button></div> : a.totalSeats}</td>
          <td className="font-semibold">{a.allocatedSeats}</td>
          <td><span style={{color:a.availableSeats>0?'var(--color-accent-400)':'var(--color-error)'}} className="font-semibold">{a.availableSeats}</span></td>
          <td><div className="flex items-center gap-2"><div className="progress-bar" style={{width:80}}><div className="progress-fill" style={{width:`${a.utilizationPct}%`}}></div></div><span className="text-xs font-semibold">{a.utilizationPct}%</span></div></td>
          <td><button className="btn btn-ghost btn-sm" onClick={()=>{setEditGrade(a.grade);setEditSeats(a.totalSeats.toString())}}>✏️</button></td>
        </tr>))}</tbody></table>
      </div>
    </div>
  );
}
