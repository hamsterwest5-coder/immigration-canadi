'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Shield } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ email: '', password: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Veuillez remplir tous les champs')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      })

      if (authError) throw authError
      if (!data.user) throw new Error('Connexion impossible')

      // Vérifier le rôle pour redirection
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profile?.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/client')
      }
      router.refresh()
    } catch (err: any) {
      console.error(err)
      if (err.message?.includes('Invalid login') || err.message?.includes('invalid')) {
        setError('Adresse électronique ou mot de passe incorrect')
      } else {
        setError(err.message || 'Erreur de connexion. Veuillez réessayer.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] bg-slate-50 py-10 px-4 flex items-center">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0a2540]">Connexion</h1>
          <p className="mt-2 text-slate-600">Accédez à votre espace personnel</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 text-sm text-amber-900">
            <Shield className="w-5 h-5 shrink-0 mt-0.5" />
            <p>Plateforme privée d’accompagnement – non officielle.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Adresse électronique"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />

            <div className="relative">
              <Input
                label="Mot de passe"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-[#c8102e] hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" loading={loading}>
              Se connecter
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Pas encore de compte ?{' '}
            <Link href="/auth/register" className="font-medium text-[#c8102e] hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
