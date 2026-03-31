/**
 * ============================================================================
 * Admission Application Form — Multi-step parent-facing form
 * ============================================================================
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdmissionApplicationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    studentName: '',
    studentDob: '',
    studentGender: '',
    gradeApplying: '',
    previousSchool: '',
    previousGradePct: '',
    address: '',
    phone: '',
    familyIncome: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const nextStep = () => {
    // Basic validation per step
    if (step === 1) {
      if (!formData.studentName || !formData.studentDob || !formData.studentGender || !formData.gradeApplying) {
        setError('Please fill in all required fields');
        return;
      }
    }
    if (step === 2) {
      if (!formData.address || !formData.phone) {
        setError('Please fill in address and phone number');
        return;
      }
    }
    setError('');
    setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'ADMISSION', ...formData }),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/parent/dashboard');
      } else {
        setError(data.error || 'Failed to submit application');
        // Show field errors if any
        if (data.details) {
          const fieldErrors = Object.entries(data.details)
            .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(', ')}`)
            .join('; ');
          setError(fieldErrors);
        }
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, label: 'Student Info' },
    { number: 2, label: 'Contact Details' },
    { number: 3, label: 'Review & Submit' },
  ];

  return (
    <div>
      <div className="page-title-section">
        <h1 className="page-title">🏫 Admission Application</h1>
        <p className="page-subtitle">Fill in the details below to apply for school admission</p>
      </div>

      {/* Step Indicator */}
      <div className="steps-indicator">
        {steps.map((s, i) => (
          <div key={s.number} className="flex items-center">
            <div className={`step ${step === s.number ? 'active' : step > s.number ? 'completed' : ''}`}>
              <div className="step-number">
                {step > s.number ? '✓' : s.number}
              </div>
              <span className="step-label">{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className="step-connector"></div>}
          </div>
        ))}
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          {/* Step 1: Student Information */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h3 style={{ marginBottom: 'var(--space-4)' }}>Student Information</h3>

              <div className="form-group">
                <label className="form-label" htmlFor="studentName">Student Full Name *</label>
                <input id="studentName" name="studentName" type="text" className="form-input"
                  placeholder="Enter student's full name" value={formData.studentName} onChange={handleChange} required />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="studentDob">Date of Birth *</label>
                  <input id="studentDob" name="studentDob" type="date" className="form-input"
                    value={formData.studentDob} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="studentGender">Gender *</label>
                  <select id="studentGender" name="studentGender" className="form-select"
                    value={formData.studentGender} onChange={handleChange} required>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="gradeApplying">Grade Applying For *</label>
                <select id="gradeApplying" name="gradeApplying" className="form-select"
                  value={formData.gradeApplying} onChange={handleChange} required>
                  <option value="">Select Grade</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>Grade {i + 1}</option>
                  ))}
                </select>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="previousSchool">Previous School</label>
                  <input id="previousSchool" name="previousSchool" type="text" className="form-input"
                    placeholder="School name (if any)" value={formData.previousSchool} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="previousGradePct">Previous Grade %</label>
                  <input id="previousGradePct" name="previousGradePct" type="number" className="form-input"
                    placeholder="e.g., 85" min="0" max="100" step="0.1"
                    value={formData.previousGradePct} onChange={handleChange} />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button type="button" className="btn btn-accent" onClick={nextStep}>
                  Next: Contact Details →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Contact Details */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h3 style={{ marginBottom: 'var(--space-4)' }}>Contact & Address</h3>

              <div className="form-group">
                <label className="form-label" htmlFor="address">Full Address *</label>
                <textarea id="address" name="address" className="form-textarea"
                  placeholder="Enter complete address with pin code"
                  value={formData.address} onChange={handleChange} required />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="phone">Phone Number *</label>
                  <input id="phone" name="phone" type="tel" className="form-input"
                    placeholder="10-digit mobile number" value={formData.phone}
                    onChange={handleChange} required minLength={10} maxLength={15} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="familyIncome">Annual Family Income (₹)</label>
                  <input id="familyIncome" name="familyIncome" type="number" className="form-input"
                    placeholder="e.g., 300000" min="0" value={formData.familyIncome} onChange={handleChange} />
                  <span className="form-hint">Used for priority scoring and eligibility</span>
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <button type="button" className="btn btn-ghost" onClick={prevStep}>
                  ← Back
                </button>
                <button type="button" className="btn btn-accent" onClick={nextStep}>
                  Next: Review →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h3 style={{ marginBottom: 'var(--space-4)' }}>Review Your Application</h3>
              <p className="text-sm text-secondary mb-4">
                Please review the details below before submitting.
              </p>

              <div style={{ background: 'var(--bg-glass)', borderRadius: 'var(--border-radius-md)', padding: 'var(--space-4)' }}>
                <div className="grid-2" style={{ gap: 'var(--space-3)' }}>
                  <div>
                    <div className="text-xs text-muted">Student Name</div>
                    <div className="text-sm font-semibold">{formData.studentName}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted">Date of Birth</div>
                    <div className="text-sm font-semibold">{formData.studentDob}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted">Gender</div>
                    <div className="text-sm font-semibold">{formData.studentGender}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted">Grade Applying</div>
                    <div className="text-sm font-semibold">Grade {formData.gradeApplying}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted">Previous School</div>
                    <div className="text-sm font-semibold">{formData.previousSchool || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted">Previous Grade %</div>
                    <div className="text-sm font-semibold">{formData.previousGradePct ? `${formData.previousGradePct}%` : 'N/A'}</div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div className="text-xs text-muted">Address</div>
                    <div className="text-sm font-semibold">{formData.address}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted">Phone</div>
                    <div className="text-sm font-semibold">{formData.phone}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted">Annual Family Income</div>
                    <div className="text-sm font-semibold">{formData.familyIncome ? `₹${Number(formData.familyIncome).toLocaleString('en-IN')}` : 'Not provided'}</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button type="button" className="btn btn-ghost" onClick={prevStep}>
                  ← Edit Details
                </button>
                <button type="submit" className="btn btn-accent btn-lg" disabled={loading}>
                  {loading ? '⏳ Submitting...' : '✅ Submit Application'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
