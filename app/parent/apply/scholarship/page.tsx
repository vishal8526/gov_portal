/**
 * ============================================================================
 * Scholarship Application Form — Extended multi-step form
 * ============================================================================
 * Includes all admission fields plus scholarship-specific fields like
 * scholarship type, category, achievements, and certificate upload flags.
 * Features real-time eligibility pre-check before submission.
 * ============================================================================
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ScholarshipApplicationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    studentName: '', studentDob: '', studentGender: '', gradeApplying: '',
    previousSchool: '', previousGradePct: '', address: '', phone: '',
    familyIncome: '', scholarshipType: '', category: '',
    achievements: '', bplCertificate: false, incomeCertificate: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const value = target instanceof HTMLInputElement && target.type === 'checkbox' ? target.checked : target.value;
    setFormData((prev) => ({ ...prev, [target.name]: value }));
    setError('');
  };

  const nextStep = () => {
    if (step === 1 && (!formData.studentName || !formData.studentDob || !formData.studentGender || !formData.gradeApplying)) {
      setError('Please fill in all required fields'); return;
    }
    if (step === 2 && (!formData.address || !formData.phone || !formData.familyIncome)) {
      setError('Please fill in address, phone, and family income'); return;
    }
    if (step === 3 && !formData.scholarshipType) {
      setError('Please select a scholarship type'); return;
    }
    setError(''); setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'SCHOLARSHIP', ...formData }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/parent/dashboard');
      } else {
        setError(data.error || 'Failed to submit');
        if (data.details) {
          setError(Object.entries(data.details).map(([f, m]) => `${f}: ${(m as string[]).join(', ')}`).join('; '));
        }
      }
    } catch { setError('Network error.'); } finally { setLoading(false); }
  };

  const steps = [
    { number: 1, label: 'Student Info' },
    { number: 2, label: 'Contact' },
    { number: 3, label: 'Scholarship' },
    { number: 4, label: 'Review' },
  ];

  return (
    <div>
      <div className="page-title-section">
        <h1 className="page-title">🎓 Scholarship Application</h1>
        <p className="page-subtitle">Apply for merit, need-based, sports, or special category scholarships</p>
      </div>

      {/* Step Indicator */}
      <div className="steps-indicator">
        {steps.map((s, i) => (
          <div key={s.number} className="flex items-center">
            <div className={`step ${step === s.number ? 'active' : step > s.number ? 'completed' : ''}`}>
              <div className="step-number">{step > s.number ? '✓' : s.number}</div>
              <span className="step-label">{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className="step-connector"></div>}
          </div>
        ))}
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          {/* Step 1: Student Info (same as admission) */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h3 style={{ marginBottom: 'var(--space-4)' }}>Student Information</h3>
              <div className="form-group">
                <label className="form-label" htmlFor="studentName">Student Full Name *</label>
                <input id="studentName" name="studentName" type="text" className="form-input" placeholder="Enter student's full name" value={formData.studentName} onChange={handleChange} required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="studentDob">Date of Birth *</label>
                  <input id="studentDob" name="studentDob" type="date" className="form-input" value={formData.studentDob} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="studentGender">Gender *</label>
                  <select id="studentGender" name="studentGender" className="form-select" value={formData.studentGender} onChange={handleChange} required>
                    <option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="gradeApplying">Grade *</label>
                  <select id="gradeApplying" name="gradeApplying" className="form-select" value={formData.gradeApplying} onChange={handleChange} required>
                    <option value="">Select</option>
                    {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>Grade {i + 1}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="previousGradePct">Previous Grade %</label>
                  <input id="previousGradePct" name="previousGradePct" type="number" className="form-input" placeholder="e.g., 85" min="0" max="100" step="0.1" value={formData.previousGradePct} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="previousSchool">Previous School</label>
                <input id="previousSchool" name="previousSchool" type="text" className="form-input" placeholder="School name" value={formData.previousSchool} onChange={handleChange} />
              </div>
              <div className="flex justify-end mt-4"><button type="button" className="btn btn-accent" onClick={nextStep}>Next →</button></div>
            </div>
          )}

          {/* Step 2: Contact */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h3 style={{ marginBottom: 'var(--space-4)' }}>Contact & Income</h3>
              <div className="form-group">
                <label className="form-label" htmlFor="address">Full Address *</label>
                <textarea id="address" name="address" className="form-textarea" placeholder="Complete address with pin code" value={formData.address} onChange={handleChange} required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="phone">Phone *</label>
                  <input id="phone" name="phone" type="tel" className="form-input" placeholder="10-digit number" value={formData.phone} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="familyIncome">Annual Family Income (₹) *</label>
                  <input id="familyIncome" name="familyIncome" type="number" className="form-input" placeholder="e.g., 200000" min="0" value={formData.familyIncome} onChange={handleChange} required />
                  <span className="form-hint">Required for scholarship eligibility</span>
                </div>
              </div>
              <div className="flex justify-between mt-4">
                <button type="button" className="btn btn-ghost" onClick={prevStep}>← Back</button>
                <button type="button" className="btn btn-accent" onClick={nextStep}>Next →</button>
              </div>
            </div>
          )}

          {/* Step 3: Scholarship Details */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h3 style={{ marginBottom: 'var(--space-4)' }}>Scholarship Details</h3>
              <div className="form-group">
                <label className="form-label" htmlFor="scholarshipType">Scholarship Type *</label>
                <select id="scholarshipType" name="scholarshipType" className="form-select" value={formData.scholarshipType} onChange={handleChange} required>
                  <option value="">Select type</option>
                  <option value="MERIT">🏆 Merit Based (≥80% required)</option>
                  <option value="NEED_BASED">💰 Need Based (Income ≤₹2.5 LPA)</option>
                  <option value="SPORTS">⚽ Sports Scholarship</option>
                  <option value="SPECIAL_CATEGORY">🏷️ Special Category (SC/ST/EWS)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="category">Category</label>
                <select id="category" name="category" className="form-select" value={formData.category} onChange={handleChange}>
                  <option value="">General</option><option value="SC">SC</option><option value="ST">ST</option><option value="OBC">OBC</option><option value="EWS">EWS</option><option value="GENERAL">General</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="achievements">Achievements / Special Circumstances</label>
                <textarea id="achievements" name="achievements" className="form-textarea" placeholder="Describe academic achievements, sports records, special circumstances..." value={formData.achievements} onChange={handleChange} rows={3} />
              </div>
              <div className="flex flex-col gap-3">
                <label className="form-checkbox">
                  <input type="checkbox" name="bplCertificate" checked={formData.bplCertificate} onChange={handleChange} />
                  I have a BPL (Below Poverty Line) Certificate
                </label>
                <label className="form-checkbox">
                  <input type="checkbox" name="incomeCertificate" checked={formData.incomeCertificate} onChange={handleChange} />
                  I have an Income Certificate from the District Office
                </label>
              </div>

              {/* Eligibility hint */}
              {formData.scholarshipType && (
                <div className="alert alert-info mt-4">
                  <span>ℹ️</span>
                  <div>
                    {formData.scholarshipType === 'MERIT' && 'Merit scholarships require ≥80% in previous grade.'}
                    {formData.scholarshipType === 'NEED_BASED' && 'Need-based scholarships require annual income ≤₹2,50,000 and income certificate.'}
                    {formData.scholarshipType === 'SPORTS' && 'Sports scholarships require documented achievements. Review committee will verify.'}
                    {formData.scholarshipType === 'SPECIAL_CATEGORY' && 'Special category scholarships are for SC/ST/EWS students.'}
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-4">
                <button type="button" className="btn btn-ghost" onClick={prevStep}>← Back</button>
                <button type="button" className="btn btn-accent" onClick={nextStep}>Review →</button>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="animate-fade-in">
              <h3 style={{ marginBottom: 'var(--space-4)' }}>Review Your Scholarship Application</h3>
              <div style={{ background: 'var(--bg-glass)', borderRadius: 'var(--border-radius-md)', padding: 'var(--space-4)' }}>
                <div className="grid-2" style={{ gap: 'var(--space-3)' }}>
                  <div><div className="text-xs text-muted">Student</div><div className="text-sm font-semibold">{formData.studentName}</div></div>
                  <div><div className="text-xs text-muted">Grade</div><div className="text-sm font-semibold">Grade {formData.gradeApplying}</div></div>
                  <div><div className="text-xs text-muted">Scholarship Type</div><div className="text-sm font-semibold">{formData.scholarshipType?.replace('_', ' ')}</div></div>
                  <div><div className="text-xs text-muted">Category</div><div className="text-sm font-semibold">{formData.category || 'General'}</div></div>
                  <div><div className="text-xs text-muted">Family Income</div><div className="text-sm font-semibold">₹{Number(formData.familyIncome).toLocaleString('en-IN')}</div></div>
                  <div><div className="text-xs text-muted">Previous Grade</div><div className="text-sm font-semibold">{formData.previousGradePct ? `${formData.previousGradePct}%` : 'N/A'}</div></div>
                  <div><div className="text-xs text-muted">BPL Certificate</div><div className="text-sm font-semibold">{formData.bplCertificate ? '✅ Yes' : '❌ No'}</div></div>
                  <div><div className="text-xs text-muted">Income Certificate</div><div className="text-sm font-semibold">{formData.incomeCertificate ? '✅ Yes' : '❌ No'}</div></div>
                </div>
                {formData.achievements && (
                  <div style={{ marginTop: 'var(--space-3)' }}>
                    <div className="text-xs text-muted">Achievements</div>
                    <div className="text-sm">{formData.achievements}</div>
                  </div>
                )}
              </div>
              <div className="alert alert-warning mt-4">
                <span>⚡</span>
                <div>Eligibility will be automatically checked upon submission. Applications that don&apos;t meet criteria will still be submitted for manual review.</div>
              </div>
              <div className="flex justify-between mt-6">
                <button type="button" className="btn btn-ghost" onClick={prevStep}>← Edit</button>
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                  {loading ? '⏳ Submitting...' : '🎓 Submit Scholarship Application'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
