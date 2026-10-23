'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  FileText,
  MessageSquare,
  Bell,
  LogOut,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import {
  Application,
  Notification,
  STATUS_LABELS,
  STATUS_COLORS,
  PROGRAM_LABELS,
} from '@/types/database'
import { formatDate } from '@/lib/utils'

export default function ClientDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(prof)

      const { data: apps } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setApplications(apps || [])

      const { data: notifs } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
      setNotifications(notifs || [])

      setLoading(false)
    }
    load()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-slate-500">Chargement de votre espace…</div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0a2540]">
              Bonjour{profile?.first_name ? `, ${profile.first_name}` : ''}
            </h1>
            <p className="text-slate-600 mt-1">
              Bienvenue dans votre espace d’accompagnement
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              Déconnexion
            </Button>
            <Link href="/client/choix-programme">
              <Button size="sm">
                <Plus className="w-4 h-4" />
                Nouvelle demande
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Applications */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-semibold text-[#0a2540] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#c8102e]" />
                  Mes dossiers
                </h2>
              </div>
              {applications.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-slate-500 mb-4">
                    Vous n’avez pas encore de dossier.
                  </p>
                  <Link href="/client/choix-programme">
                    <Button>
                      <Plus className="w-4 h-4" />
                      Commencer une demande
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="px-6 py-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-[#0a2540]">
                              {app.application_number}
                            </span>
                            <span
                              className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                                STATUS_COLORS[app.status]
                              }`}
                            >
                              {STATUS_LABELS[app.status]}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mt-1">
                            {PROGRAM_LABELS[app.program]} ·{' '}
                            {app.number_of_persons} personne
                            {app.number_of_persons > 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Soumis le {formatDate(app.submitted_at || app.created_at)}
                          </p>
                        </div>
                        <Link href={`/client/dossier/${app.id}`}>
                          <Button variant="outline" size="sm">
                            Voir le détail
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Quick actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/client/messages"
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-[#c8102e]/40 hover:shadow-sm transition-all flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#0a2540]">Messagerie</h3>
                  <p className="text-sm text-slate-500">Poser une question</p>
                </div>
              </Link>
              <Link
                href="/client/choix-programme"
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-[#c8102e]/40 hover:shadow-sm transition-all flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#0a2540]">Nouvelle demande</h3>
                  <p className="text-sm text-slate-500">Démarrer un nouveau dossier</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account info */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h2 className="font-semibold text-[#0a2540] mb-3">Mon compte</h2>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-slate-500">Nom</dt>
                  <dd className="font-medium">
                    {profile?.first_name} {profile?.last_name}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Email</dt>
                  <dd className="font-medium break-all">{profile?.email}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Téléphone</dt>
                  <dd className="font-medium">{profile?.phone || '—'}</dd>
                </div>
              </dl>
            </section>

            {/* Notifications */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#c8102e]" />
                <h2 className="font-semibold text-[#0a2540] text-sm">Notifications</h2>
              </div>
              {notifications.length === 0 ? (
                <p className="p-5 text-sm text-slate-500">Aucune notification</p>
              ) : (
                <ul className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <li key={n.id} className="px-5 py-3 text-sm">
                      <p className="font-medium text-slate-800">{n.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">
                        {n.body}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatDate(n.created_at)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
