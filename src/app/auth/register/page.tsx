'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Shield } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import PasswordStrength from '@/components/ui/PasswordStrength'
import { createClient } from '@/lib/supabase/client'

const countries = [
  { value: 'CM', label: 'Cameroun' },
  { value: 'CI', label: 'Côte d\'Ivoire' },
  { value: 'SN', label: 'Sénégal' },
  { value: 'FR', label: 'France' },
  { value: 'BE', label: 'Belgique' },
  { value: 'CH', label: 'Suisse' },
  { value: 'MA', label: 'Maroc' },
  { value: 'DZ', label: 'Algérie' },
  { value: 'TN', label: 'Tunisie' },
  { value: 'CD', label: 'RDC' },
  { value: 'CG', label: 'Congo' },
  { value: 'GA', label: 'Gabon' },
  { value: 'OTHER', label: 'Autre' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    last_name: '',
    first_name: '',
    date_of_birth: '',
    place_of_birth: '',
    email: '',
    phone: '',
    country_of_residence: '',
    address: '',
    password: '',
    confirm_password: '',
    accept_terms: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setError(null)
  }

  const validate = () => {
    if (!form.last_name.trim()) return 'Le nom est obligatoire'
    if (!form.first_name.trim()) return 'Le prénom est obligatoire'
    if (!form.date_of_birth) return 'La date de naissance est obligatoire'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return 'Adresse électronique invalide'
    if (!form.phone.trim()) return 'Le numéro de téléphone est obligatoire'
    if (!form.country_of_residence) return 'Le pays de résidence est obligatoire'
    if (!form.address.trim()) return 'L\'adresse de résidence est obligatoire'
    if (form.password.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères'
    if (form.password !== form.confirm_password) return 'Les mots de passe ne correspondent pas'
    if (!form.accept_terms) return 'Vous devez accepter les conditions d\'utilisation'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // 1. Créer le compte Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        options: {
          data: {
            first_name: form.first_name.trim(),
            last_name: form.last_name.trim(),
          },
        },
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Erreur lors de la création du compte')

      // 2. Créer le profil
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: authData.user.id,
        email: form.email.trim().toLowerCase(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone.trim(),
        date_of_birth: form.date_of_birth,
        place_of_birth: form.place_of_birth.trim() || null,
        country_of_residence: form.country_of_residence,
        address: form.address.trim(),
        role: 'client',
      })

      if (profileError) {
        console.error('Profile error:', profileError)
        // On continue quand même car le compte Auth est créé
      }

      setSuccess(true)
      // Redirection vers le choix du programme après un court délai
      setTimeout(() => {
        router.push('/client/choix-programme')
      }, 1500)
    } catch (err: any) {
      console.error(err)
      if (err.message?.includes('already registered') || err.message?.includes('already been registered')) {
        setError('Cette adresse électronique est déjà utilisée. Connectez-vous ou utilisez une autre adresse.')
      } else {
        setError(err.message || 'Une erreur est survenue. Veuillez réessayer.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#0a2540] mb-2">Compte créé avec succès</h1>
          <p className="text-slate-600">Redirection vers le choix de votre programme…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0a2540]">Créer mon compte</h1>
          <p className="mt-2 text-slate-600">
            Inscrivez-vous pour démarrer votre dossier d’accompagnement
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 text-sm text-amber-900">
            <Shield className="w-5 h-5 shrink-0 mt-0.5" />
            <p>
              Plateforme privée d’accompagnement. Ce n’est pas un site officiel du
              gouvernement du Canada.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Nom"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                required
                autoComplete="family-name"
              />
              <Input
                label="Prénom"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                required
                autoComplete="given-name"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Date de naissance"
                name="date_of_birth"
                type="date"
                value={form.date_of_birth}
                onChange={handleChange}
                required
              />
              <Input
                label="Lieu de naissance"
                name="place_of_birth"
                value={form.place_of_birth}
                onChange={handleChange}
                placeholder="Ville, pays"
              />
            </div>

            <Input
              label="Adresse électronique"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />

            <Input
              label="Numéro de téléphone (avec indicatif)"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="+237 6XX XXX XXX"
              required
              autoComplete="tel"
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Pays de résidence <span className="text-[#c8102e]">*</span>
              </label>
              <select
                name="country_of_residence"
                value={form.country_of_residence}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#c8102e]/30 focus:border-[#c8102e]"
              >
                <option value="" disabled>
                  Sélectionnez votre pays
                </option>
                {countries.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Adresse de résidence"
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              placeholder="Rue, ville, code postal"
            />

            <div className="relative">
              <Input
                label="Mot de passe"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                hint="Minimum 8 caractères, idéalement avec majuscules, chiffres et symboles"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              <PasswordStrength password={form.password} />
            </div>

            <div className="relative">
              <Input
                label="Confirmation du mot de passe"
                name="confirm_password"
                type={showConfirm ? 'text' : 'password'}
                value={form.confirm_password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="accept_terms"
                checked={form.accept_terms}
                onChange={handleChange}
                className="mt-1 w-4 h-4 rounded border-slate-300 text-[#c8102e] focus:ring-[#c8102e]"
              />
              <span className="text-sm text-slate-600">
                J’accepte les{' '}
                <Link href="/conditions-utilisation" className="text-[#c8102e] hover:underline">
                  conditions d’utilisation
                </Link>{' '}
                et la{' '}
                <Link href="/politique-confidentialite" className="text-[#c8102e] hover:underline">
                  politique de confidentialité
                </Link>
                .
              </span>
            </label>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" loading={loading}>
              Créer mon compte
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Déjà inscrit ?{' '}
            <Link href="/auth/login" className="font-medium text-[#c8102e] hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
