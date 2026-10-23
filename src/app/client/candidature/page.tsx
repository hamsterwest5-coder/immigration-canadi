'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, Save, Send, CheckCircle2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { createClient } from '@/lib/supabase/client'
import { ImmigrationProgram, PROGRAM_LABELS } from '@/types/database'

const STEPS = [
  { id: 'A', title: 'Informations personnelles' },
  { id: 'B', title: 'Projet d’immigration' },
  { id: 'C', title: 'Profil du candidat' },
  { id: 'D', title: 'Description du projet' },
  { id: 'E', title: 'Récapitulatif' },
]

type FamilyMemberForm = {
  first_name: string
  last_name: string
  age: string
  relationship: string
  role_in_project: string
}

function CandidatureForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const programParam = (searchParams.get('program') || 'permanente') as ImmigrationProgram

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [applicationNumber, setApplicationNumber] = useState<string | null>(null)

  const [form, setForm] = useState({
    // A
    first_name: '',
    last_name: '',
    date_of_birth: '',
    place_of_birth: '',
    nationality: '',
    country_of_residence: '',
    email: '',
    phone: '',
    marital_status: '',
    // B
    is_family: false,
    number_of_persons: 1,
    family_members: [] as FamilyMemberForm[],
    // C
    education_level: '',
    field_of_study: '',
    professional_experience: '',
    current_profession: '',
    languages: [] as string[],
    french_level: '',
    english_level: '',
    budget_indicative: '',
    desired_departure_date: '',
    preferred_city_province: '',
    // D
    project_description: '',
  })

  // Prefill from session/profile if available
  useEffect(() => {
    const stored = sessionStorage.getItem('selected_program')
    if (stored) {
      // already handled by param
    }
  }, [])

  const update = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const updateFamilyMember = (index: number, field: string, value: string) => {
    setForm((prev) => {
      const members = [...prev.family_members]
      members[index] = { ...members[index], [field]: value }
      return { ...prev, family_members: members }
    })
  }

  const handleNumberOfPersons = (n: number) => {
    const members: FamilyMemberForm[] = []
    // index 0 = principal already filled from personal info
    for (let i = 1; i < n; i++) {
      members.push({
        first_name: '',
        last_name: '',
        age: '',
        relationship: i === 1 ? 'conjoint' : 'enfant',
        role_in_project: '',
      })
    }
    setForm((prev) => ({
      ...prev,
      number_of_persons: n,
      is_family: n > 1,
      family_members: members,
    }))
  }

  const validateStep = (): string | null => {
    if (step === 0) {
      if (!form.first_name.trim()) return 'Prénom obligatoire'
      if (!form.last_name.trim()) return 'Nom obligatoire'
      if (!form.date_of_birth) return 'Date de naissance obligatoire'
      if (!form.nationality.trim()) return 'Nationalité obligatoire'
      if (!form.email.trim()) return 'Email obligatoire'
      if (!form.phone.trim()) return 'Téléphone obligatoire'
    }
    if (step === 1) {
      if (form.number_of_persons < 1 || form.number_of_persons > 13)
        return 'Nombre de personnes invalide (1 à 13)'
      if (form.is_family) {
        for (let i = 0; i < form.family_members.length; i++) {
          const m = form.family_members[i]
          if (!m.first_name.trim() || !m.last_name.trim())
            return `Nom et prénom obligatoires pour le membre ${i + 2}`
        }
      }
    }
    if (step === 3) {
      if (!form.project_description.trim() || form.project_description.length < 50)
        return 'Veuillez décrire votre projet (minimum 50 caractères)'
      if (form.project_description.length > 3000)
        return 'Description trop longue (maximum 3000 caractères)'
    }
    return null
  }

  const next = () => {
    const err = validateStep()
    if (err) {
      setError(err)
      return
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const prev = () => {
    setStep((s) => Math.max(s - 1, 0))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const saveDraft = async () => {
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Vous devez être connecté')
        return
      }

      // Upsert draft
      const payload = {
        user_id: user.id,
        program: programParam,
        status: 'brouillon' as const,
        is_family: form.is_family,
        number_of_persons: form.number_of_persons,
        education_level: form.education_level || null,
        field_of_study: form.field_of_study || null,
        professional_experience: form.professional_experience || null,
        current_profession: form.current_profession || null,
        languages: form.languages.length ? form.languages : null,
        french_level: form.french_level || null,
        english_level: form.english_level || null,
        budget_indicative: form.budget_indicative || null,
        desired_departure_date: form.desired_departure_date || null,
        preferred_city_province: form.preferred_city_province || null,
        project_description: form.project_description || null,
      }

      // Simple insert for draft (in production: check existing draft)
      const { data, error: dbError } = await supabase
        .from('applications')
        .insert({
          ...payload,
          application_number: `DRAFT-${Date.now()}`,
        })
        .select('id')
        .single()

      if (dbError) throw dbError

      // Family members
      if (form.family_members.length && data) {
        await supabase.from('family_members').insert(
          form.family_members.map((m) => ({
            application_id: data.id,
            first_name: m.first_name,
            last_name: m.last_name,
            age: m.age ? parseInt(m.age) : null,
            relationship: m.relationship,
            role_in_project: m.role_in_project || null,
          }))
        )
      }

      alert('Brouillon enregistré avec succès')
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const submit = async () => {
    const err = validateStep()
    if (err) {
      setError(err)
      return
    }
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Vous devez être connecté')

      // Générer un numéro temporaire (en prod, utiliser la fonction SQL)
      const year = new Date().getFullYear()
      const random = Math.floor(Math.random() * 900000) + 100000
      const appNumber = `CA-${year}-${random}`

      const { data: app, error: appError } = await supabase
        .from('applications')
        .insert({
          application_number: appNumber,
          user_id: user.id,
          program: programParam,
          status: 'soumise',
          is_family: form.is_family,
          number_of_persons: form.number_of_persons,
          education_level: form.education_level || null,
          field_of_study: form.field_of_study || null,
          professional_experience: form.professional_experience || null,
          current_profession: form.current_profession || null,
          languages: form.languages.length ? form.languages : null,
          french_level: form.french_level || null,
          english_level: form.english_level || null,
          budget_indicative: form.budget_indicative || null,
          desired_departure_date: form.desired_departure_date || null,
          preferred_city_province: form.preferred_city_province || null,
          project_description: form.project_description || null,
          submitted_at: new Date().toISOString(),
        })
        .select('id, application_number')
        .single()

      if (appError) throw appError

      if (form.family_members.length) {
        await supabase.from('family_members').insert(
          form.family_members.map((m) => ({
            application_id: app.id,
            first_name: m.first_name,
            last_name: m.last_name,
            age: m.age ? parseInt(m.age) : null,
            relationship: m.relationship,
            role_in_project: m.role_in_project || null,
          }))
        )
      }

      // Historique de statut
      await supabase.from('status_history').insert({
        application_id: app.id,
        old_status: null,
        new_status: 'soumise',
        changed_by: user.id,
        reason: 'Soumission initiale de la candidature',
      })

      // Notification
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Demande soumise',
        body: `Votre dossier ${app.application_number} a bien été enregistré. Il sera examiné par notre équipe.`,
        link: '/client',
      })

      setApplicationNumber(app.application_number)
      setSubmitted(true)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Erreur lors de la soumission')
    } finally {
      setLoading(false)
    }
  }

  if (submitted && applicationNumber) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-bold text-emerald-700 mb-3">
            Merci, votre demande a bien été soumise.
          </h1>
          <p className="text-slate-600 leading-relaxed mb-4">
            Votre dossier a été enregistré avec succès. Il sera examiné par notre
            équipe. Vous pourrez suivre son évolution depuis votre espace client
            et recevoir nos réponses directement sur la plateforme.
          </p>
          <p className="text-sm text-slate-500 mb-2">
            Veuillez conserver votre numéro de dossier et consulter régulièrement
            votre espace personnel.
          </p>
          <div className="bg-slate-50 rounded-lg py-3 px-4 mb-6">
            <p className="text-xs text-slate-500">Numéro de dossier</p>
            <p className="text-xl font-bold text-[#0a2540] tracking-wide">
              {applicationNumber}
            </p>
          </div>
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
            <strong>Important :</strong> la réception d’une demande ne signifie
            pas qu’elle a été approuvée. La décision sera communiquée après
            examen de votre dossier.
          </p>
          <Button onClick={() => router.push('/client')} size="lg">
            Accéder à mon espace client
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-[#0a2540]">
              Dossier – {PROGRAM_LABELS[programParam] || programParam}
            </h1>
            <span className="text-sm text-slate-500">
              Étape {step + 1} / {STEPS.length}
            </span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#c8102e] transition-all duration-300"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            {STEPS.map((s, i) => (
              <span
                key={s.id}
                className={i === step ? 'text-[#c8102e] font-medium' : ''}
              >
                {s.id}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-[#0a2540] mb-6">
            {STEPS[step].title}
          </h2>

          {/* STEP A */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Nom"
                  value={form.last_name}
                  onChange={(e) => update('last_name', e.target.value)}
                  required
                />
                <Input
                  label="Prénom"
                  value={form.first_name}
                  onChange={(e) => update('first_name', e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Date de naissance"
                  type="date"
                  value={form.date_of_birth}
                  onChange={(e) => update('date_of_birth', e.target.value)}
                  required
                />
                <Input
                  label="Lieu de naissance"
                  value={form.place_of_birth}
                  onChange={(e) => update('place_of_birth', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Nationalité"
                  value={form.nationality}
                  onChange={(e) => update('nationality', e.target.value)}
                  required
                />
                <Input
                  label="Pays de résidence"
                  value={form.country_of_residence}
                  onChange={(e) => update('country_of_residence', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Adresse électronique"
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  required
                />
                <Input
                  label="Téléphone"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  required
                />
              </div>
              <Select
                label="Situation familiale"
                value={form.marital_status}
                onChange={(e) => update('marital_status', e.target.value)}
                options={[
                  { value: 'celibataire', label: 'Célibataire' },
                  { value: 'marie', label: 'Marié(e)' },
                  { value: 'conjoint_fait', label: 'Conjoint de fait' },
                  { value: 'divorce', label: 'Divorcé(e)' },
                  { value: 'veuf', label: 'Veuf/Veuve' },
                ]}
                placeholder="Sélectionnez"
              />
            </div>
          )}

          {/* STEP B */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Type de demande
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleNumberOfPersons(1)}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                      form.number_of_persons === 1
                        ? 'border-[#c8102e] bg-red-50 text-[#c8102e]'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    Individuelle (1 personne)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNumberOfPersons(Math.max(2, form.number_of_persons))}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                      form.number_of_persons > 1
                        ? 'border-[#c8102e] bg-red-50 text-[#c8102e]'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    Familiale (2 à 13)
                  </button>
                </div>
              </div>

              {form.number_of_persons > 1 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nombre de personnes concernées
                    </label>
                    <select
                      value={form.number_of_persons}
                      onChange={(e) => handleNumberOfPersons(parseInt(e.target.value))}
                      className="w-full sm:w-40 px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 2).map((n) => (
                        <option key={n} value={n}>
                          {n} personnes
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                      Informations des membres de la famille (hors demandeur principal) :
                    </p>
                    {form.family_members.map((m, idx) => (
                      <div
                        key={idx}
                        className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50"
                      >
                        <p className="text-sm font-medium text-slate-700">
                          Membre {idx + 2}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Input
                            label="Nom"
                            value={m.last_name}
                            onChange={(e) =>
                              updateFamilyMember(idx, 'last_name', e.target.value)
                            }
                            required
                          />
                          <Input
                            label="Prénom"
                            value={m.first_name}
                            onChange={(e) =>
                              updateFamilyMember(idx, 'first_name', e.target.value)
                            }
                            required
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <Input
                            label="Âge"
                            type="number"
                            min="0"
                            max="120"
                            value={m.age}
                            onChange={(e) =>
                              updateFamilyMember(idx, 'age', e.target.value)
                            }
                          />
                          <Select
                            label="Lien familial"
                            value={m.relationship}
                            onChange={(e) =>
                              updateFamilyMember(idx, 'relationship', e.target.value)
                            }
                            options={[
                              { value: 'conjoint', label: 'Conjoint(e)' },
                              { value: 'enfant', label: 'Enfant' },
                              { value: 'autre', label: 'Autre' },
                            ]}
                          />
                          <Input
                            label="Rôle dans le projet"
                            value={m.role_in_project}
                            onChange={(e) =>
                              updateFamilyMember(idx, 'role_in_project', e.target.value)
                            }
                            placeholder="Ex: accompagnant"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP C */}
          {step === 2 && (
            <div className="space-y-5">
              <Select
                label="Niveau d’études"
                value={form.education_level}
                onChange={(e) => update('education_level', e.target.value)}
                options={[
                  { value: 'secondaire', label: 'Secondaire' },
                  { value: 'bac', label: 'Baccalauréat / équivalent' },
                  { value: 'licence', label: 'Licence / Bachelor' },
                  { value: 'master', label: 'Master' },
                  { value: 'doctorat', label: 'Doctorat' },
                  { value: 'autre', label: 'Autre' },
                ]}
                placeholder="Sélectionnez"
              />
              <Input
                label="Domaine de formation"
                value={form.field_of_study}
                onChange={(e) => update('field_of_study', e.target.value)}
              />
              <Textarea
                label="Expérience professionnelle"
                value={form.professional_experience}
                onChange={(e) => update('professional_experience', e.target.value)}
                placeholder="Résumez vos expériences pertinentes…"
                rows={3}
              />
              <Input
                label="Profession actuelle"
                value={form.current_profession}
                onChange={(e) => update('current_profession', e.target.value)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Select
                  label="Niveau de français"
                  value={form.french_level}
                  onChange={(e) => update('french_level', e.target.value)}
                  options={[
                    { value: 'debutant', label: 'Débutant' },
                    { value: 'intermediaire', label: 'Intermédiaire' },
                    { value: 'avance', label: 'Avancé' },
                    { value: 'natif', label: 'Natif / bilingue' },
                    { value: 'aucun', label: 'Aucun' },
                  ]}
                  placeholder="Sélectionnez"
                />
                <Select
                  label="Niveau d’anglais"
                  value={form.english_level}
                  onChange={(e) => update('english_level', e.target.value)}
                  options={[
                    { value: 'debutant', label: 'Débutant' },
                    { value: 'intermediaire', label: 'Intermédiaire' },
                    { value: 'avance', label: 'Avancé' },
                    { value: 'natif', label: 'Natif / bilingue' },
                    { value: 'aucun', label: 'Aucun' },
                  ]}
                  placeholder="Sélectionnez"
                />
              </div>
              <Input
                label="Budget indicatif prévu pour le projet"
                value={form.budget_indicative}
                onChange={(e) => update('budget_indicative', e.target.value)}
                placeholder="Ex: 15 000 – 25 000 CAD"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Date souhaitée de départ"
                  type="date"
                  value={form.desired_departure_date}
                  onChange={(e) => update('desired_departure_date', e.target.value)}
                />
                <Input
                  label="Ville ou province envisagée"
                  value={form.preferred_city_province}
                  onChange={(e) => update('preferred_city_province', e.target.value)}
                  placeholder="Ex: Toronto, Québec, Vancouver…"
                />
              </div>
            </div>
          )}

          {/* STEP D */}
          {step === 3 && (
            <div className="space-y-4">
              <Textarea
                label="Décrivez votre projet d’immigration et vos attentes"
                value={form.project_description}
                onChange={(e) => update('project_description', e.target.value)}
                rows={10}
                required
                hint={`${form.project_description.length} / 3000 caractères – Expliquez pourquoi le Canada, votre situation actuelle, les personnes que vous souhaitez accompagner, et l’aide que vous recherchez.`}
                className="min-h-[220px]"
              />
            </div>
          )}

          {/* STEP E - Récap */}
          {step === 4 && (
            <div className="space-y-6 text-sm">
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <h3 className="font-semibold text-[#0a2540]">Programme</h3>
                <p>{PROGRAM_LABELS[programParam]}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <h3 className="font-semibold text-[#0a2540]">Demandeur principal</h3>
                <p>
                  {form.first_name} {form.last_name} – né(e) le {form.date_of_birth || '—'}
                </p>
                <p>
                  {form.email} · {form.phone}
                </p>
                <p>Nationalité : {form.nationality || '—'}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <h3 className="font-semibold text-[#0a2540]">Composition</h3>
                <p>
                  {form.number_of_persons} personne
                  {form.number_of_persons > 1 ? 's' : ''} (
                  {form.is_family ? 'familiale' : 'individuelle'})
                </p>
                {form.family_members.length > 0 && (
                  <ul className="list-disc list-inside text-slate-600">
                    {form.family_members.map((m, i) => (
                      <li key={i}>
                        {m.first_name} {m.last_name} ({m.relationship}
                        {m.age ? `, ${m.age} ans` : ''})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <h3 className="font-semibold text-[#0a2540]">Profil</h3>
                <p>Études : {form.education_level || '—'} – {form.field_of_study || '—'}</p>
                <p>Profession : {form.current_profession || '—'}</p>
                <p>
                  Français : {form.french_level || '—'} · Anglais :{' '}
                  {form.english_level || '—'}
                </p>
                <p>Budget : {form.budget_indicative || '—'}</p>
                <p>Destination souhaitée : {form.preferred_city_province || '—'}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="font-semibold text-[#0a2540] mb-2">Description du projet</h3>
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {form.project_description || '—'}
                </p>
              </div>
              <p className="text-xs text-slate-500">
                En soumettant, vous confirmez l’exactitude des informations fournies.
                La réception de la demande ne constitue pas une approbation.
              </p>
            </div>
          )}

          {error && (
            <div className="mt-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-100">
            <div className="flex gap-2 w-full sm:w-auto">
              {step > 0 && (
                <Button variant="outline" onClick={prev} className="flex-1 sm:flex-none">
                  <ArrowLeft className="w-4 h-4" />
                  Précédent
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={saveDraft}
                loading={saving}
                className="flex-1 sm:flex-none"
              >
                <Save className="w-4 h-4" />
                Enregistrer brouillon
              </Button>
            </div>

            {step < STEPS.length - 1 ? (
              <Button onClick={next} className="w-full sm:w-auto">
                Suivant
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={submit} loading={loading} className="w-full sm:w-auto">
                <Send className="w-4 h-4" />
                Soumettre ma candidature
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CandidaturePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Chargement…</div>}>
      <CandidatureForm />
    </Suspense>
  )
}
